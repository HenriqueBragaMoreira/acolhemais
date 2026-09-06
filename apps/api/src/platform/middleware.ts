import { platformCan, platformRolesOf } from '@acolhemais/domain'
import type { PlatformGrants } from '@acolhemais/domain'
import { createMiddleware } from 'hono/factory'
import type { AppEnv } from '../env'
import { apiError } from './errors'

/** Quem da equipe da plataforma fez a requisição. */
export type PlatformUser = { id: string; role: string }

export type PlatformEnv = AppEnv & { Variables: { platformUser: PlatformUser } }

/**
 * Rotas próprias da equipe da plataforma: exige sessão, papel da plataforma com as permissões
 * pedidas (mesmo catálogo do plugin `admin`) e 2FA ativo, como `platformTwoFactor` faz nas
 * rotas `/admin/*` do Better Auth. A sessão é lida a cada requisição, então trocar o papel ou
 * banir alguém vale na hora.
 */
export function requirePlatformPermission(permissions: PlatformGrants) {
  return createMiddleware<PlatformEnv>(async (c, next) => {
    const session = await c.var.auth().api.getSession({ headers: c.req.raw.headers })
    if (!session) return apiError(c, 401, 'UNAUTHORIZED')

    const user = session.user as { id: string; role?: string | null; twoFactorEnabled?: boolean }
    if (platformRolesOf(user.role).length === 0) return apiError(c, 403, 'FORBIDDEN')
    if (!user.twoFactorEnabled) return apiError(c, 403, 'TWO_FACTOR_REQUIRED')
    if (!platformCan(user.role, permissions)) return apiError(c, 403, 'FORBIDDEN')

    c.set('platformUser', { id: user.id, role: user.role ?? '' })
    await next()
  })
}
