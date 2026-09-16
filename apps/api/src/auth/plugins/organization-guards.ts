import { schema } from '@acolhemais/db'
import type { Database } from '@acolhemais/db'
import {
  DomainError,
  SYSTEM_ROLES,
  assertCanAssign,
  effectivePermissions,
  fromStatements,
  requestedRoles,
  requiresTwoFactor,
  splitRoles,
} from '@acolhemais/domain'
import type { Permission, SystemRoleKey, TeamAction } from '@acolhemais/domain'
import type { BetterAuthPlugin } from 'better-auth'
import { APIError, createAuthMiddleware } from 'better-auth/api'
import { and, eq, inArray } from 'drizzle-orm'
import { authMessages } from '../messages'
import { pluginSession } from '../session'

type Ctx = Parameters<typeof pluginSession>[0]
type Fields = Record<string, unknown>
type Code = 'TWO_FACTOR_REQUIRED' | 'TEAM_MANAGE_REQUIRED' | 'CANNOT_ASSIGN_UNOWNED_PERMISSION'

function refuse(code: Code): never {
  throw new APIError('FORBIDDEN', { code, message: authMessages[code] })
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

/** Ids vão para colunas `uuid`: outro texto daria erro no banco. O plugin recusa o que sobrar. */
function uuid(value: unknown): string | null {
  return typeof value === 'string' && UUID.test(value) ? value : null
}

function fieldsOf(ctx: Ctx): Fields {
  return { ...(ctx.query as Fields | undefined), ...(ctx.body as Fields | undefined) }
}

/** Rotas que não agem sobre uma organização da qual a pessoa já seja membro. */
const NOT_ORGANIZATION_SCOPED = new Set([
  '/organization/create',
  '/organization/check-slug',
  '/organization/list',
  '/organization/list-user-invitations',
  '/organization/get-invitation',
  '/organization/accept-invitation',
  '/organization/reject-invitation',
])

/** Ações das rotas do plugin que mexem com as permissões de alguém (BR-054). */
const TEAM_ROUTES: Record<string, TeamAction> = {
  '/organization/invite-member': 'invite',
  '/organization/update-member-role': 'change_role',
  '/organization/remove-member': 'remove',
}

/** Permissões dos papéis, padrão ou criados pela organização. */
async function rolePermissions(
  db: Database,
  organizationId: string,
  roles: readonly string[],
): Promise<Permission[]> {
  const custom = roles.filter((role) => !Object.hasOwn(SYSTEM_ROLES, role))
  const rows =
    custom.length === 0
      ? []
      : await db
          .select({ permission: schema.organizationRole.permission })
          .from(schema.organizationRole)
          .where(
            and(
              eq(schema.organizationRole.organizationId, organizationId),
              inArray(schema.organizationRole.role, custom),
            ),
          )
  return [
    ...roles.flatMap((role) => SYSTEM_ROLES[role as SystemRoleKey] ?? []),
    ...rows.flatMap((row) => fromStatements(JSON.parse(row.permission))),
  ]
}

type MemberRow = { userId: string; role: string }

async function permissionsOf(db: Database, organizationId: string, member: MemberRow) {
  // shortcut: concessões individuais (BR-053) ainda não existem; entram aqui com FR-024.
  return effectivePermissions({
    rolePermissions: await rolePermissions(db, organizationId, splitRoles(member.role)),
    grants: [],
  })
}

const memberColumns = { userId: schema.member.userId, role: schema.member.role }

/** Permissões de um usuário na organização, ou `null` se ele não é membro dela. */
async function memberPermissions(db: Database, organizationId: string, userId: string) {
  const [member] = await db
    .select(memberColumns)
    .from(schema.member)
    .where(and(eq(schema.member.organizationId, organizationId), eq(schema.member.userId, userId)))
  return member ? permissionsOf(db, organizationId, member) : null
}

/** Membro da organização pelo id ou, na remoção, pelo e-mail (como o plugin aceita). */
async function findMember(db: Database, organizationId: string, idOrEmail: unknown) {
  const inOrganization = eq(schema.member.organizationId, organizationId)
  if (typeof idOrEmail === 'string' && idOrEmail.includes('@')) {
    const [member] = await db
      .select(memberColumns)
      .from(schema.member)
      .innerJoin(schema.user, eq(schema.user.id, schema.member.userId))
      .where(and(inOrganization, eq(schema.user.email, idOrEmail.toLowerCase())))
    return member ?? null
  }
  const id = uuid(idOrEmail)
  if (!id) return null
  const [member] = await db
    .select(memberColumns)
    .from(schema.member)
    .where(and(inOrganization, eq(schema.member.id, id)))
  return member ?? null
}

/**
 * Organizações sobre as quais a rota age, lidas como o plugin lê: id, slug ou o convite no
 * pedido; sem nenhum, a organização ativa. Com id e slug juntos, valem os dois, para ninguém
 * escapar da checagem mandando um e usando o outro.
 */
async function targetOrganizations(db: Database, ctx: Ctx, activeOrganizationId?: string | null) {
  const fields = fieldsOf(ctx)
  const ids: string[] = []
  const id = uuid(fields.organizationId)
  if (id) ids.push(id)
  if (typeof fields.organizationSlug === 'string') {
    const [row] = await db
      .select({ id: schema.organization.id })
      .from(schema.organization)
      .where(eq(schema.organization.slug, fields.organizationSlug))
    if (row) ids.push(row.id)
  }
  const invitationId = uuid(fields.invitationId)
  if (invitationId) {
    const [row] = await db
      .select({ organizationId: schema.invitation.organizationId })
      .from(schema.invitation)
      .where(eq(schema.invitation.id, invitationId))
    if (row) ids.push(row.organizationId)
  }
  // `organizationId: null` (sair da organização ativa) não age sobre nenhuma.
  const explicit = ids.length > 0 || fields.organizationId === null
  return explicit || !activeOrganizationId ? ids : [activeOrganizationId]
}

/** Permissões envolvidas na ação, ou `null` quando não há o que conferir (o plugin decide). */
async function involvedPermissions(
  db: Database,
  action: TeamAction,
  organizationId: string,
  body: Fields,
  actorId: string,
): Promise<Permission[] | null> {
  if (action === 'invite') return rolePermissions(db, organizationId, requestedRoles(body.role))
  if (action === 'change_role') {
    const member = await findMember(db, organizationId, uuid(body.memberId))
    if (!member) return null
    return rolePermissions(db, organizationId, [
      ...splitRoles(member.role),
      ...requestedRoles(body.role),
    ])
  }
  const member = await findMember(db, organizationId, body.memberIdOrEmail)
  // Remover a si mesmo é sair da equipe, não mexer com o que outra pessoa pode.
  if (!member || member.userId === actorId) return null
  return [...(await permissionsOf(db, organizationId, member))]
}

/**
 * Travas da plataforma nas rotas do plugin `organization`, que ele não oferece:
 * - BR-057: membro com permissão sensível sem 2FA não usa nada da organização;
 * - BR-054: convidar, trocar o papel e remover exigem a permissão da ação e ter todas as
 *   permissões envolvidas.
 */
export function organizationGuards({ db }: { db: Database }) {
  return {
    id: 'acolhemais-organization-guards',
    hooks: {
      before: [
        {
          matcher: (ctx) =>
            ctx.path?.startsWith('/organization/') === true &&
            !NOT_ORGANIZATION_SCOPED.has(ctx.path),
          handler: createAuthMiddleware(async (ctx) => {
            const session = await pluginSession(ctx)
            if (!session || session.user.twoFactorEnabled) return
            const organizations = await targetOrganizations(
              db,
              ctx,
              session.session.activeOrganizationId,
            )
            for (const organizationId of organizations) {
              const permissions = await memberPermissions(db, organizationId, session.user.id)
              if (permissions && requiresTwoFactor(permissions)) refuse('TWO_FACTOR_REQUIRED')
            }
          }),
        },
        {
          matcher: (ctx) => ctx.path !== undefined && Object.hasOwn(TEAM_ROUTES, ctx.path),
          handler: createAuthMiddleware(async (ctx) => {
            const action = TEAM_ROUTES[ctx.path ?? '']
            const session = await pluginSession(ctx)
            if (!action || !session) return
            const body = (ctx.body ?? {}) as Fields
            // Como o plugin: sem `organizationId` no corpo, vale a organização ativa.
            const organizationId = body.organizationId
              ? uuid(body.organizationId)
              : session.session.activeOrganizationId
            if (!organizationId) return

            // Só confere quem é membro: para os demais, o plugin já recusa.
            const actor = await memberPermissions(db, organizationId, session.user.id)
            if (!actor) return
            const involved = await involvedPermissions(
              db,
              action,
              organizationId,
              body,
              session.user.id,
            )
            if (!involved) return
            try {
              assertCanAssign(actor, action, involved)
            } catch (error) {
              if (error instanceof DomainError) refuse(error.code as Code)
              throw error
            }
          }),
        },
      ],
    },
  } satisfies BetterAuthPlugin
}
