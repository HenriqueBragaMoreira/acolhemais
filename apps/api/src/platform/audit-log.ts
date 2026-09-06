import { schema } from '@acolhemais/db'
import { AUDIT_ACTION_KEYS, AUDIT_ACTIONS } from '@acolhemais/domain'
import { and, desc, eq, lt } from 'drizzle-orm'
import type { SQL } from 'drizzle-orm'
import { Hono } from 'hono'
import { z } from 'zod'
import { apiError } from './errors'
import { requirePlatformPermission } from './middleware'
import type { PlatformEnv } from './middleware'

const { auditLog } = schema

const TARGET_TYPES = [...new Set(Object.values(AUDIT_ACTIONS).map(({ target }) => target))] as [
  string,
  ...string[],
]

const querySchema = z.object({
  action: z.enum(AUDIT_ACTION_KEYS).optional(),
  actorUserId: z.uuid().optional(),
  organizationId: z.uuid().optional(),
  targetType: z.enum(TARGET_TYPES).optional(),
  targetId: z.string().min(1).max(200).optional(),
  /** Cursor: id do último registro da página anterior (os ids UUIDv7 seguem a ordem). */
  before: z.uuid().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(50),
})

/**
 * Consulta da auditoria pela equipe com `audit_log.view`, do registro mais novo ao mais
 * antigo, com filtros e paginação por cursor (`nextCursor` vira o `before` da próxima página).
 */
export const auditLogRoutes = new Hono<PlatformEnv>().get(
  '/',
  requirePlatformPermission({ audit_log: ['view'] }),
  async (c) => {
    const query = querySchema.safeParse(c.req.query())
    if (!query.success) return apiError(c, 400, 'INVALID_REQUEST')
    const { action, actorUserId, organizationId, targetType, targetId, before, limit } = query.data

    const filters: SQL[] = []
    if (action) filters.push(eq(auditLog.action, action))
    if (actorUserId) filters.push(eq(auditLog.actorUserId, actorUserId))
    if (organizationId) filters.push(eq(auditLog.organizationId, organizationId))
    if (targetType) filters.push(eq(auditLog.targetType, targetType))
    if (targetId) filters.push(eq(auditLog.targetId, targetId))
    if (before) filters.push(lt(auditLog.id, before))

    const rows = await c.var
      .db()
      .select()
      .from(auditLog)
      .where(and(...filters))
      .orderBy(desc(auditLog.id))
      .limit(limit + 1)
    const entries = rows.slice(0, limit)
    const nextCursor = rows.length > limit ? (entries.at(-1)?.id ?? null) : null
    return c.json({ entries, nextCursor })
  },
)
