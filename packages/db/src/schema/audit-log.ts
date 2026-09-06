import { index, inet, jsonb, snakeCase, text, timestamp, uuid } from 'drizzle-orm/pg-core'
import { id } from '../columns'

/**
 * Auditoria só de acréscimo: um trigger recusa UPDATE, DELETE e TRUNCATE (ver a migration
 * `audit_log_append_only`). As ações e o formato de `metadata` vêm do catálogo em
 * `@acolhemais/domain` (AUDIT_ACTIONS).
 *
 * Sem chave estrangeira para usuário nem organização: excluir uma conta (LGPD) não pode
 * alterar a auditoria, que guarda só os ids.
 */
export const auditLog = snakeCase.table(
  'audit_log',
  {
    // UUIDv7: a ordem dos ids é a ordem dos registros (paginação por cursor).
    id: id(),
    occurredAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
    /** Quem fez; `null` quando foi o próprio sistema. */
    actorUserId: uuid(),
    organizationId: uuid(),
    action: text().notNull(),
    targetType: text().notNull(),
    // Texto, e não uuid: há alvos com chave textual (ex.: o nome de um parâmetro).
    targetId: text().notNull(),
    metadata: jsonb().notNull().default({}),
    ip: inet(),
    /** Ray ID da Cloudflare, que liga o registro aos logs da requisição. */
    requestId: text(),
  },
  (table) => [
    index().on(table.organizationId, table.id.desc()),
    index().on(table.actorUserId, table.id.desc()),
    index().on(table.targetType, table.targetId, table.id.desc()),
  ],
)
