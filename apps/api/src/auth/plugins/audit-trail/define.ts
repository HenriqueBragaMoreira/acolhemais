import type { Database } from '@acolhemais/db'
import type { AuditAction, AuditEntry, AuditMetadata } from '@acolhemais/domain'

export type Body = Record<string, unknown>

/** Quem fez a ação: a sessão de quem chamou, ou ninguém numa chamada interna do servidor. */
export type Actor = {
  userId: string
  activeOrganizationId: string | null
  twoFactorEnabled: boolean
}

export type RouteInput = { db: Database; body: Body; actor: Actor | null }

/** Uma rota do Better Auth que vai para a auditoria. */
export type AuditedRoute<Returned = unknown, Snapshot = unknown> = {
  /** Lê o estado de antes da ação (ex.: o papel atual), quando o registro precisa dele. */
  snapshot?: (input: RouteInput) => Promise<Snapshot>
  /** Monta os registros a partir da resposta de sucesso. */
  entries: (input: RouteInput & { returned: Returned; snapshot: Snapshot }) => AuditEntry[]
}

/**
 * Declara uma rota auditada com o formato da resposta de sucesso do Better Auth (`Returned`),
 * dito uma vez para a rota inteira. É a única conversão de tipo do catálogo: a resposta vem do
 * plugin, que já validou a ação.
 */
export function audited<Returned = unknown>() {
  return <Snapshot = undefined>(route: AuditedRoute<Returned, Snapshot>) =>
    route as unknown as AuditedRoute
}

type EntryFields<A extends AuditAction> = {
  targetId: string
  organizationId?: string | null
  metadata: AuditMetadata[A]
}

/** Um registro da auditoria feito por `actor` (ou pelo próprio sistema, sem sessão). */
export function auditEntry<A extends AuditAction>(
  action: A,
  actor: Pick<Actor, 'userId'> | null,
  fields: EntryFields<A>,
): AuditEntry {
  // A assinatura já casa `action` e `metadata`; o TypeScript só não relaciona os dois no genérico.
  return { action, actorUserId: actor?.userId ?? null, ...fields } as AuditEntry
}

/** Alvo que pertence a uma organização (membro, convite, papel). */
export function organizationTarget(row: { id: string; organizationId: string }) {
  return { organizationId: row.organizationId, targetId: row.id }
}

export function nonEmptyString(value: unknown): string | null {
  return typeof value === 'string' && value.length > 0 ? value : null
}

export function isoDate(value: unknown): string | null {
  if (value === null || value === undefined) return null
  const date = new Date(value as string)
  return Number.isNaN(date.getTime()) ? null : date.toISOString()
}

/** Nomes dos campos alterados, sem os valores (que podem ser dados pessoais). */
export function fieldNames(value: unknown): string[] {
  return value && typeof value === 'object' ? Object.keys(value).toSorted() : []
}
