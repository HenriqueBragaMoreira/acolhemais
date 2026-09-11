import { schema } from '@acolhemais/db'
import type { Database } from '@acolhemais/db'
import {
  DomainError,
  OWNER_ROLE,
  SUPERADMIN_ROLE,
  TEAM_ROLES,
  assertOwnerRemains,
  platformCan,
  requestedRoles,
  splitRoles,
  touchesSuperadmin,
} from '@acolhemais/domain'
import type { PlatformGrants } from '@acolhemais/domain'
import type { BetterAuthPlugin } from 'better-auth'
import { APIError, createAuthMiddleware } from 'better-auth/api'
import { and, eq, inArray, ne } from 'drizzle-orm'
import { authMessages } from '../messages'
import { pluginSession } from '../session'

type Code =
  | 'USER_FIELD_NOT_EDITABLE'
  | 'CREATE_USER_FIELD_NOT_ALLOWED'
  | 'ROLE_NOT_ASSIGNABLE'
  | 'SUPERADMIN_CLI_ONLY'
  | 'OWNER_REQUIRED'

function refuse(status: 'BAD_REQUEST' | 'FORBIDDEN', code: Code): never {
  throw new APIError(status, { code, message: authMessages[code] })
}

type Body = Record<string, unknown>

/** Na conta de outra pessoa, a equipe só corrige nome e foto (BR-008). */
const EDITABLE_USER_FIELDS = new Set(['name', 'image'])

/** Ao criar uma conta, a equipe informa só isto (BR-015): a senha é a pessoa que cria. */
const CREATE_USER_FIELDS = new Set(['email', 'name', 'role'])

async function userRole(db: Database, userId: unknown) {
  if (typeof userId !== 'string') return null
  const [row] = await db
    .select({ role: schema.user.role })
    .from(schema.user)
    .where(eq(schema.user.id, userId))
  return row?.role ?? null
}

/** Recusa se o usuário é o único Responsável de alguma organização (BR-055). */
async function assertNotSoleOwner(db: Database, userId: string) {
  // shortcut: toda organização conta como ativa; com o status (Fase 1, BR-041), ignorar as encerradas.
  const memberships = await db
    .select({ organizationId: schema.member.organizationId, role: schema.member.role })
    .from(schema.member)
    .where(eq(schema.member.userId, userId))
  const owned = memberships
    .filter((m) => splitRoles(m.role).includes(OWNER_ROLE))
    .map((m) => m.organizationId)
  if (owned.length === 0) return

  const others = await db
    .select({ organizationId: schema.member.organizationId, role: schema.member.role })
    .from(schema.member)
    .where(and(inArray(schema.member.organizationId, owned), ne(schema.member.userId, userId)))
  for (const organizationId of owned) {
    assertOwnerRemains(
      others.filter((m) => m.organizationId === organizationId).flatMap((m) => splitRoles(m.role)),
    )
  }
}

/** Só aplica a trava a quem a rota deixaria agir: a recusa não revela nada a quem não pode. */
async function actorCan(ctx: Parameters<typeof pluginSession>[0], permissions: PlatformGrants) {
  const user = (await pluginSession(ctx))?.user
  return user !== undefined && platformCan(user.role, permissions)
}

/**
 * Travas da equipe da plataforma nas rotas do plugin `admin` (BR-008, BR-013, BR-014, BR-015).
 * O plugin não tem opções para isso; cada hook recusa antes de a rota rodar.
 */
export function platformGuards({ db }: { db: Database }) {
  return {
    id: 'acolhemais-platform-guards',
    hooks: {
      before: [
        {
          matcher: (ctx) => ctx.path === '/admin/update-user',
          handler: createAuthMiddleware(async (ctx) => {
            const data: unknown = (ctx.body as Body | undefined)?.data
            const fields = data && typeof data === 'object' ? Object.keys(data) : []
            if (fields.some((field) => !EDITABLE_USER_FIELDS.has(field))) {
              refuse('BAD_REQUEST', 'USER_FIELD_NOT_EDITABLE')
            }
          }),
        },
        {
          matcher: (ctx) => ctx.path === '/admin/create-user',
          handler: createAuthMiddleware(async (ctx) => {
            // Chamada do próprio servidor, sem requisição (ex.: `auth create-admin` na linha de
            // comando): fica de fora, como nas checagens de permissão do plugin.
            if (!ctx.request && !ctx.headers) return
            const body = (ctx.body ?? {}) as Body
            if (Object.keys(body).some((field) => !CREATE_USER_FIELDS.has(field))) {
              refuse('BAD_REQUEST', 'CREATE_USER_FIELD_NOT_ALLOWED')
            }
            if (body.role === undefined) return
            const roles = requestedRoles(body.role)
            if (roles.includes(SUPERADMIN_ROLE)) refuse('FORBIDDEN', 'SUPERADMIN_CLI_ONLY')
            if (roles.length === 0 || roles.some((role) => !TEAM_ROLES.includes(role))) {
              refuse('BAD_REQUEST', 'ROLE_NOT_ASSIGNABLE')
            }
          }),
        },
        {
          matcher: (ctx) => ctx.path === '/admin/set-role',
          handler: createAuthMiddleware(async (ctx) => {
            if (!(await actorCan(ctx, { user: ['set-role'] }))) return
            const body = (ctx.body ?? {}) as Body
            if (touchesSuperadmin(await userRole(db, body.userId), requestedRoles(body.role))) {
              refuse('FORBIDDEN', 'SUPERADMIN_CLI_ONLY')
            }
          }),
        },
        {
          matcher: (ctx) => ctx.path === '/admin/ban-user',
          handler: createAuthMiddleware(async (ctx) => {
            if (!(await actorCan(ctx, { user: ['ban'] }))) return
            const userId = (ctx.body as Body | undefined)?.userId
            if (typeof userId !== 'string') return
            // Para afastar um superadmin, o papel sai antes, pela linha de comando (BR-013).
            if (splitRoles(await userRole(db, userId)).includes(SUPERADMIN_ROLE)) {
              refuse('FORBIDDEN', 'SUPERADMIN_CLI_ONLY')
            }
            try {
              await assertNotSoleOwner(db, userId)
            } catch (error) {
              if (error instanceof DomainError) refuse('BAD_REQUEST', 'OWNER_REQUIRED')
              throw error
            }
          }),
        },
      ],
    },
  } satisfies BetterAuthPlugin
}
