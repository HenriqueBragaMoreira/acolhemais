import { schema } from '@acolhemais/db'
import type { Database } from '@acolhemais/db'
import type { AuditEntry } from '@acolhemais/domain'
import type { BetterAuthPlugin } from 'better-auth'
import { createAuthMiddleware, getSessionFromCtx, isAPIError } from 'better-auth/api'
import { and, eq } from 'drizzle-orm'
import { auditOrigin, recordAudit } from '../audit/record'

type Body = Record<string, unknown>

/** Quem fez a ação: a sessão de quem chamou, ou ninguém numa chamada interna do servidor. */
type Actor = { userId: string; activeOrganizationId: string | null; twoFactorEnabled: boolean }

type RouteInput = { db: Database; body: Body; actor: Actor | null }

type AuditedRoute = {
  /** Lê o estado de antes da ação (ex.: o papel atual), quando o registro precisa dele. */
  snapshot?: (input: RouteInput) => Promise<unknown>
  /** Monta os registros a partir da resposta de sucesso. */
  entries: (input: RouteInput & { returned: unknown; snapshot: unknown }) => AuditEntry[]
}

type UserRow = { id: string; role?: string | null; banReason?: string | null; banExpires?: unknown }
type MemberRow = { id: string; organizationId: string; userId: string; role: string }
type InvitationRow = { id: string; organizationId: string; role: string }
type RoleRow = { id: string; organizationId: string; role: string }

function text(value: unknown): string | null {
  return typeof value === 'string' && value.length > 0 ? value : null
}

/** O Better Auth guarda vários papéis separados por vírgula. */
function roles(value: string | null | undefined): string[] {
  return (value ?? '')
    .split(',')
    .map((role) => role.trim())
    .filter(Boolean)
}

function isoDate(value: unknown): string | null {
  if (value === null || value === undefined) return null
  const date = new Date(value as string)
  return Number.isNaN(date.getTime()) ? null : date.toISOString()
}

function fields(value: unknown): string[] {
  return value && typeof value === 'object' ? Object.keys(value).toSorted() : []
}

async function currentUserRole(db: Database, userId: string | null) {
  if (!userId) return null
  const [row] = await db
    .select({ role: schema.user.role })
    .from(schema.user)
    .where(eq(schema.user.id, userId))
  return row?.role ?? null
}

async function currentMember(db: Database, memberId: string | null) {
  if (!memberId) return null
  const [row] = await db.select().from(schema.member).where(eq(schema.member.id, memberId))
  return row ?? null
}

/** Papel criado pela ONG, pelo id ou pelo nome (na organização do corpo ou na ativa). */
async function currentOrganizationRole(db: Database, body: Body, actor: Actor | null) {
  const { organizationRole } = schema
  const roleId = text(body.roleId)
  const organizationId = text(body.organizationId) ?? actor?.activeOrganizationId ?? null
  const roleName = text(body.roleName)
  const where = roleId
    ? eq(organizationRole.id, roleId)
    : organizationId && roleName
      ? and(
          eq(organizationRole.organizationId, organizationId),
          eq(organizationRole.role, roleName),
        )
      : undefined
  if (!where) return null
  const [row] = await db.select().from(organizationRole).where(where)
  return row ?? null
}

/** Rota do usuário em sessão: sem sessão (ex.: 2FA no meio do login), não há o que registrar. */
function ownAccount(build: (actor: Actor, body: Body) => AuditEntry): AuditedRoute {
  return { entries: ({ actor, body }) => (actor ? [build(actor, body)] : []) }
}

/**
 * Ações do Better Auth que vão para a auditoria, por rota. Os registros são gravados depois
 * que a ação deu certo: os plugins não abrem uma transação que inclua o nosso registro.
 *
 * Funções só do servidor, sem rota (ex.: `auth.api.addMember`), não passam por aqui: o nosso
 * código que as chama registra a auditoria, na mesma transação da regra de negócio.
 */
const AUDITED_ROUTES: Record<string, AuditedRoute> = {
  // Equipe da plataforma (plugin admin).
  '/admin/create-user': {
    entries: ({ actor, returned }) => {
      const { user } = returned as { user: UserRow }
      return [
        {
          action: 'user.created',
          actorUserId: actor?.userId ?? null,
          targetId: user.id,
          metadata: { roles: roles(user.role) },
        },
      ]
    },
  },
  '/admin/update-user': {
    entries: ({ actor, body, returned }) => [
      {
        action: 'user.updated',
        actorUserId: actor?.userId ?? null,
        targetId: (returned as UserRow).id,
        metadata: { fields: fields(body.data) },
      },
    ],
  },
  '/admin/set-role': {
    snapshot: ({ db, body }) => currentUserRole(db, text(body.userId)),
    entries: ({ actor, returned, snapshot }) => {
      const { user } = returned as { user: UserRow }
      return [
        {
          action: 'user.role_changed',
          actorUserId: actor?.userId ?? null,
          targetId: user.id,
          metadata: { from: roles(snapshot as string | null), to: roles(user.role) },
        },
      ]
    },
  },
  '/admin/ban-user': {
    entries: ({ actor, returned }) => {
      const { user } = returned as { user: UserRow }
      return [
        {
          action: 'user.banned',
          actorUserId: actor?.userId ?? null,
          targetId: user.id,
          metadata: { reason: user.banReason ?? null, expiresAt: isoDate(user.banExpires) },
        },
      ]
    },
  },
  '/admin/unban-user': {
    entries: ({ actor, returned }) => [
      {
        action: 'user.unbanned',
        actorUserId: actor?.userId ?? null,
        targetId: (returned as { user: UserRow }).user.id,
        metadata: {},
      },
    ],
  },
  '/admin/remove-user': {
    entries: ({ actor, body }) => [
      {
        action: 'user.removed',
        actorUserId: actor?.userId ?? null,
        targetId: String(body.userId),
        metadata: {},
      },
    ],
  },
  '/admin/revoke-user-sessions': {
    entries: ({ actor, body }) => [
      {
        action: 'user.sessions_revoked',
        actorUserId: actor?.userId ?? null,
        targetId: String(body.userId),
        metadata: { scope: 'all' },
      },
    ],
  },
  '/admin/revoke-user-session': {
    // O corpo traz o token da sessão; o registro guarda só de quem ela era.
    snapshot: async ({ db, body }) => {
      const token = text(body.sessionToken)
      if (!token) return null
      const [row] = await db
        .select({ userId: schema.session.userId })
        .from(schema.session)
        .where(eq(schema.session.token, token))
      return row?.userId ?? null
    },
    entries: ({ actor, snapshot }) =>
      typeof snapshot === 'string'
        ? [
            {
              action: 'user.sessions_revoked',
              actorUserId: actor?.userId ?? null,
              targetId: snapshot,
              metadata: { scope: 'one' },
            },
          ]
        : [],
  },

  // Organizações (plugin organization).
  '/organization/update': {
    entries: ({ actor, body, returned }) => {
      const organization = returned as { id: string } | null
      if (!organization) return []
      return [
        {
          action: 'organization.updated',
          actorUserId: actor?.userId ?? null,
          organizationId: organization.id,
          targetId: organization.id,
          metadata: { fields: fields(body.data) },
        },
      ]
    },
  },
  '/organization/remove-member': {
    entries: ({ actor, returned }) => {
      const { member } = returned as { member: MemberRow }
      return [
        {
          action: 'member.removed',
          actorUserId: actor?.userId ?? null,
          organizationId: member.organizationId,
          targetId: member.id,
          metadata: { userId: member.userId, role: member.role },
        },
      ]
    },
  },
  '/organization/leave': {
    entries: ({ actor, returned }) => {
      const member = returned as MemberRow
      return [
        {
          action: 'member.left',
          actorUserId: actor?.userId ?? null,
          organizationId: member.organizationId,
          targetId: member.id,
          metadata: { userId: member.userId, role: member.role },
        },
      ]
    },
  },
  '/organization/update-member-role': {
    snapshot: async ({ db, body }) => (await currentMember(db, text(body.memberId)))?.role ?? null,
    entries: ({ actor, returned, snapshot }) => {
      const member = returned as MemberRow
      return [
        {
          action: 'member.role_changed',
          actorUserId: actor?.userId ?? null,
          organizationId: member.organizationId,
          targetId: member.id,
          metadata: { userId: member.userId, from: String(snapshot ?? ''), to: member.role },
        },
      ]
    },
  },
  '/organization/invite-member': {
    entries: ({ actor, returned }) => {
      const invitation = returned as InvitationRow
      return [
        {
          action: 'invitation.created',
          actorUserId: actor?.userId ?? null,
          organizationId: invitation.organizationId,
          targetId: invitation.id,
          metadata: { role: invitation.role },
        },
      ]
    },
  },
  '/organization/cancel-invitation': {
    entries: ({ actor, returned }) => {
      const invitation = returned as InvitationRow
      return [
        {
          action: 'invitation.canceled',
          actorUserId: actor?.userId ?? null,
          organizationId: invitation.organizationId,
          targetId: invitation.id,
          metadata: {},
        },
      ]
    },
  },
  '/organization/accept-invitation': {
    entries: ({ actor, returned }) => {
      const { invitation, member } = returned as {
        invitation: InvitationRow
        member: MemberRow | null
      }
      const accepted: AuditEntry = {
        action: 'invitation.accepted',
        actorUserId: actor?.userId ?? null,
        organizationId: invitation.organizationId,
        targetId: invitation.id,
        metadata: { role: invitation.role, memberId: member?.id ?? null },
      }
      if (!member) return [accepted]
      return [
        accepted,
        {
          action: 'member.added',
          actorUserId: actor?.userId ?? null,
          organizationId: member.organizationId,
          targetId: member.id,
          metadata: { userId: member.userId, role: member.role },
        },
      ]
    },
  },
  '/organization/reject-invitation': {
    entries: ({ actor, returned }) => {
      const { invitation } = returned as { invitation: InvitationRow }
      return [
        {
          action: 'invitation.rejected',
          actorUserId: actor?.userId ?? null,
          organizationId: invitation.organizationId,
          targetId: invitation.id,
          metadata: {},
        },
      ]
    },
  },
  '/organization/create-role': {
    entries: ({ actor, body, returned }) => {
      const { roleData } = returned as { roleData: RoleRow }
      return [
        {
          action: 'organization_role.created',
          actorUserId: actor?.userId ?? null,
          organizationId: roleData.organizationId,
          targetId: roleData.id,
          metadata: {
            role: roleData.role,
            permission: (body.permission ?? {}) as Record<string, string[]>,
          },
        },
      ]
    },
  },
  '/organization/update-role': {
    snapshot: ({ db, body, actor }) => currentOrganizationRole(db, body, actor),
    entries: ({ actor, body, snapshot }) => {
      const role = snapshot as RoleRow | null
      if (!role) return []
      const data = (body.data ?? {}) as { roleName?: string; permission?: Record<string, string[]> }
      return [
        {
          action: 'organization_role.updated',
          actorUserId: actor?.userId ?? null,
          organizationId: role.organizationId,
          targetId: role.id,
          metadata: {
            role: role.role,
            renamedTo: text(data.roleName),
            permission: data.permission ?? null,
          },
        },
      ]
    },
  },
  '/organization/delete-role': {
    snapshot: ({ db, body, actor }) => currentOrganizationRole(db, body, actor),
    entries: ({ actor, snapshot }) => {
      const role = snapshot as RoleRow | null
      if (!role) return []
      return [
        {
          action: 'organization_role.deleted',
          actorUserId: actor?.userId ?? null,
          organizationId: role.organizationId,
          targetId: role.id,
          metadata: { role: role.role },
        },
      ]
    },
  },

  // Segurança da própria conta.
  '/two-factor/verify-totp': {
    // O código confirma a ativação do 2FA quando quem está em sessão ainda não o tinha ativo.
    // No login (2FA já ativo, ainda sem sessão), a rota não muda nada e não é registrada.
    entries: ({ actor }) =>
      actor && !actor.twoFactorEnabled
        ? [
            {
              action: 'account.two_factor_enabled',
              actorUserId: actor.userId,
              targetId: actor.userId,
              metadata: {},
            },
          ]
        : [],
  },
  '/two-factor/disable': ownAccount((actor) => ({
    action: 'account.two_factor_disabled',
    actorUserId: actor.userId,
    targetId: actor.userId,
    metadata: {},
  })),
  '/two-factor/generate-backup-codes': ownAccount((actor) => ({
    action: 'account.backup_codes_regenerated',
    actorUserId: actor.userId,
    targetId: actor.userId,
    metadata: {},
  })),
  '/change-password': ownAccount((actor, body) => ({
    action: 'account.password_changed',
    actorUserId: actor.userId,
    targetId: actor.userId,
    metadata: { revokedOtherSessions: body.revokeOtherSessions === true },
  })),
  '/unlink-account': ownAccount((actor, body) => ({
    action: 'account.provider_unlinked',
    actorUserId: actor.userId,
    targetId: actor.userId,
    metadata: { provider: String(body.providerId) },
  })),
}

function isAudited(ctx: { path?: string }) {
  return ctx.path !== undefined && Object.hasOwn(AUDITED_ROUTES, ctx.path)
}

type Pending = { actor: Actor | null; snapshot: unknown }

/**
 * Plugin do Better Auth que registra na auditoria as ações sobre permissões e a segurança das
 * contas (`AUDITED_ROUTES`) e o vínculo de logins externos (ex.: Google).
 *
 * Antes da ação, guarda quem a pediu e o estado anterior; depois, se deu certo, grava. Como a
 * instância do Better Auth é criada por requisição, esse estado guardado é da requisição. A
 * gravação acontece depois que a mudança já foi salva: se ela falhar, a mudança fica sem
 * registro e o erro vai para o log da API (não adianta falhar a resposta).
 */
export function auditTrail({ db }: { db: Database }) {
  const pending = new Map<string, Pending[]>()

  async function record(path: string, build: () => AuditEntry[], headers: Headers | undefined) {
    try {
      await recordAudit(db, build(), auditOrigin(headers))
    } catch (error) {
      console.error(`Falha ao gravar a auditoria de ${path}:`, error)
    }
  }

  return {
    id: 'acolhemais-audit-trail',
    init: () => ({
      options: {
        databaseHooks: {
          account: {
            create: {
              after: async (account, ctx) => {
                if (account.providerId === 'credential') return
                await record(
                  'vínculo de conta',
                  () => [
                    {
                      action: 'account.provider_linked',
                      actorUserId: account.userId,
                      targetId: account.userId,
                      metadata: { provider: account.providerId },
                    },
                  ],
                  ctx?.headers,
                )
              },
            },
          },
        },
      },
    }),
    hooks: {
      before: [
        {
          matcher: isAudited,
          handler: createAuthMiddleware(async (ctx) => {
            const route = AUDITED_ROUTES[ctx.path] as AuditedRoute
            const session = await getSessionFromCtx(ctx)
            const actor: Actor | null = session
              ? {
                  userId: session.user.id,
                  activeOrganizationId:
                    (session.session as { activeOrganizationId?: string | null })
                      .activeOrganizationId ?? null,
                  twoFactorEnabled:
                    (session.user as { twoFactorEnabled?: boolean | null }).twoFactorEnabled ===
                    true,
                }
              : null
            const body = (ctx.body ?? {}) as Body
            const snapshot = await route.snapshot?.({ db, body, actor })
            pending.set(ctx.path, [...(pending.get(ctx.path) ?? []), { actor, snapshot }])
          }),
        },
      ],
      after: [
        {
          matcher: isAudited,
          handler: createAuthMiddleware(async (ctx) => {
            const stack = pending.get(ctx.path)
            const state = stack?.pop()
            const returned = ctx.context.returned
            if (!state || isAPIError(returned) || returned instanceof Response) return

            const route = AUDITED_ROUTES[ctx.path] as AuditedRoute
            const body = (ctx.body ?? {}) as Body
            await record(
              ctx.path,
              () => route.entries({ db, body, returned, ...state }),
              ctx.headers,
            )
          }),
        },
      ],
    },
  } satisfies BetterAuthPlugin
}
