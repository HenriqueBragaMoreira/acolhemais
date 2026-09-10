import { schema } from '@acolhemais/db'
import type { Database } from '@acolhemais/db'
import { splitRoles } from '@acolhemais/domain'
import { eq } from 'drizzle-orm'
import { audited, auditEntry, fieldNames, isoDate, nonEmptyString } from './define'
import type { AuditedRoute } from './define'

type UserRow = { id: string; role?: string | null; banReason?: string | null; banExpires?: unknown }

async function currentUserRole(db: Database, userId: string | null) {
  if (!userId) return null
  const [row] = await db
    .select({ role: schema.user.role })
    .from(schema.user)
    .where(eq(schema.user.id, userId))
  return row?.role ?? null
}

async function sessionOwner(db: Database, token: string | null) {
  if (!token) return null
  const [row] = await db
    .select({ userId: schema.session.userId })
    .from(schema.session)
    .where(eq(schema.session.token, token))
  return row?.userId ?? null
}

/** Equipe da plataforma (plugin `admin`). */
export const ADMIN_ROUTES: Record<string, AuditedRoute> = {
  '/admin/create-user': audited<{ user: UserRow }>()({
    entries: ({ actor, returned: { user } }) => [
      auditEntry('user.created', actor, {
        targetId: user.id,
        metadata: { roles: splitRoles(user.role) },
      }),
    ],
  }),
  '/admin/update-user': audited<UserRow>()({
    entries: ({ actor, body, returned: user }) => [
      auditEntry('user.updated', actor, {
        targetId: user.id,
        metadata: { fields: fieldNames(body.data) },
      }),
    ],
  }),
  '/admin/set-role': audited<{ user: UserRow }>()({
    snapshot: ({ db, body }) => currentUserRole(db, nonEmptyString(body.userId)),
    entries: ({ actor, returned: { user }, snapshot: previousRole }) => [
      auditEntry('user.role_changed', actor, {
        targetId: user.id,
        metadata: { from: splitRoles(previousRole), to: splitRoles(user.role) },
      }),
    ],
  }),
  '/admin/ban-user': audited<{ user: UserRow }>()({
    entries: ({ actor, returned: { user } }) => [
      auditEntry('user.banned', actor, {
        targetId: user.id,
        metadata: { reason: user.banReason ?? null, expiresAt: isoDate(user.banExpires) },
      }),
    ],
  }),
  '/admin/unban-user': audited<{ user: UserRow }>()({
    entries: ({ actor, returned: { user } }) => [
      auditEntry('user.unbanned', actor, { targetId: user.id, metadata: {} }),
    ],
  }),
  '/admin/remove-user': audited()({
    entries: ({ actor, body }) => {
      const userId = nonEmptyString(body.userId)
      return userId ? [auditEntry('user.removed', actor, { targetId: userId, metadata: {} })] : []
    },
  }),
  '/admin/revoke-user-sessions': audited()({
    entries: ({ actor, body }) => {
      const userId = nonEmptyString(body.userId)
      if (!userId) return []
      return [
        auditEntry('user.sessions_revoked', actor, {
          targetId: userId,
          metadata: { scope: 'all' },
        }),
      ]
    },
  }),
  '/admin/revoke-user-session': audited()({
    // O corpo traz o token da sessão; o registro guarda só de quem ela era.
    snapshot: ({ db, body }) => sessionOwner(db, nonEmptyString(body.sessionToken)),
    entries: ({ actor, snapshot: ownerId }) => {
      if (!ownerId) return []
      return [
        auditEntry('user.sessions_revoked', actor, {
          targetId: ownerId,
          metadata: { scope: 'one' },
        }),
      ]
    },
  }),
}
