import { getSessionFromCtx } from 'better-auth/api'
import type { Auth } from '.'

/** Sessão do Better Auth com os campos dos plugins configurados (papel, 2FA, organização ativa). */
export type AuthSession = Auth['$Infer']['Session']

export type SessionUser = AuthSession['user']

/**
 * Sessão de quem chamou a rota, lida dentro de um plugin. O contexto dos plugins só conhece os
 * campos do núcleo do Better Auth; aqui a sessão vem com os campos dos plugins.
 */
export function pluginSession(ctx: Parameters<typeof getSessionFromCtx>[0]) {
  return getSessionFromCtx<SessionUser, AuthSession['session']>(ctx)
}
