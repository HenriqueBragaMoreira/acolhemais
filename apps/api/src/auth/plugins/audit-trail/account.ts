import type { AuditAction, AuditMetadata } from '@acolhemais/domain'
import { audited, auditEntry } from './define'
import type { AuditedRoute, Body } from './define'

/** Rota do usuário em sessão: sem sessão (ex.: 2FA no meio do login), não há o que registrar. */
function ownAccount<A extends AuditAction>(
  action: A,
  metadata: (body: Body) => AuditMetadata[A],
): AuditedRoute {
  return audited()({
    entries: ({ actor, body }) =>
      actor
        ? [auditEntry(action, actor, { targetId: actor.userId, metadata: metadata(body) })]
        : [],
  })
}

/** Segurança da própria conta. */
export const ACCOUNT_ROUTES: Record<string, AuditedRoute> = {
  '/two-factor/verify-totp': audited()({
    // O código confirma a ativação do 2FA quando quem está em sessão ainda não o tinha ativo.
    // No login (2FA já ativo, ainda sem sessão), a rota não muda nada e não é registrada.
    entries: ({ actor }) =>
      actor && !actor.twoFactorEnabled
        ? [
            auditEntry('account.two_factor_enabled', actor, {
              targetId: actor.userId,
              metadata: {},
            }),
          ]
        : [],
  }),
  '/two-factor/disable': ownAccount('account.two_factor_disabled', () => ({})),
  '/two-factor/generate-backup-codes': ownAccount('account.backup_codes_regenerated', () => ({})),
  '/change-password': ownAccount('account.password_changed', (body) => ({
    revokedOtherSessions: body.revokeOtherSessions === true,
  })),
  '/unlink-account': ownAccount('account.provider_unlinked', (body) => ({
    provider: String(body.providerId),
  })),
}
