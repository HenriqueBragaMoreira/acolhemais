import { schema } from '@acolhemais/db'
import type { Database } from '@acolhemais/db'
import { auditTargetType } from '@acolhemais/domain'
import type { AuditEntry } from '@acolhemais/domain'

/** O banco ou uma transação dele: dentro da transação, o registro grava junto da mudança. */
export type AuditWriter = Pick<Database, 'insert'>

/** De onde veio a requisição que gerou o registro. */
export type AuditOrigin = { ip: string | null; requestId: string | null }

const IPV4 = /^(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}$/

/** Só aceita um IP de verdade: a coluna é `inet`, e um header inválido não pode barrar o registro. */
function validIp(value: string | null | undefined): string | null {
  if (!value) return null
  if (IPV4.test(value)) return value
  return value.includes(':') && URL.canParse(`http://[${value}]`) ? value : null
}

/** IP do cliente e Ray ID da Cloudflare, a partir dos headers da requisição. */
export function auditOrigin(headers: Headers | null | undefined): AuditOrigin {
  return {
    ip: validIp(headers?.get('cf-connecting-ip')),
    requestId: headers?.get('cf-ray') ?? null,
  }
}

/** Grava registros na auditoria. O tipo do alvo vem do catálogo de ações do domínio. */
export async function recordAudit(
  db: AuditWriter,
  entries: AuditEntry | readonly AuditEntry[],
  origin: AuditOrigin,
): Promise<void> {
  const list = Array.isArray(entries) ? entries : [entries as AuditEntry]
  if (list.length === 0) return
  await db.insert(schema.auditLog).values(
    list.map((entry) => ({
      action: entry.action,
      actorUserId: entry.actorUserId,
      organizationId: entry.organizationId ?? null,
      targetType: auditTargetType(entry.action),
      targetId: entry.targetId,
      metadata: entry.metadata,
      ip: origin.ip,
      requestId: origin.requestId,
    })),
  )
}
