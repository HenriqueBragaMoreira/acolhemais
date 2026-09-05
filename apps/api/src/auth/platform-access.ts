import { PLATFORM_ROLES, PLATFORM_STATEMENTS, platformRequiresTwoFactor } from '@acolhemais/domain'
import type { BetterAuthPlugin } from 'better-auth'
import { APIError, createAuthMiddleware, getSessionFromCtx } from 'better-auth/api'
import { createAccessControl } from 'better-auth/plugins/access'
import { authMessages } from './messages'

/** Controle de acesso da equipe da plataforma, a partir do catálogo em `@acolhemais/domain`. */
export const platformAc = createAccessControl(PLATFORM_STATEMENTS)

export const platformRoles = {
  // Papel de todo usuário comum: nenhuma permissão da plataforma.
  user: platformAc.newRole({}),
  superadmin: platformAc.newRole(PLATFORM_ROLES.superadmin),
  moderator: platformAc.newRole(PLATFORM_ROLES.moderator),
  support: platformAc.newRole(PLATFORM_ROLES.support),
}

function isAdminRoute(ctx: { path?: string }) {
  return ctx.path?.startsWith('/admin/') ?? false
}

/**
 * Exige 2FA ativo da equipe da plataforma nas rotas do plugin `admin`. As rotas próprias da
 * plataforma (Fase 1 em diante) aplicam a mesma regra no middleware delas.
 */
export function platformTwoFactor() {
  return {
    id: 'acolhemais-platform-two-factor',
    hooks: {
      before: [
        {
          matcher: isAdminRoute,
          handler: createAuthMiddleware(async (ctx) => {
            const session = await getSessionFromCtx(ctx)
            const user = session?.user as { role?: string; twoFactorEnabled?: boolean } | undefined
            if (user && platformRequiresTwoFactor(user.role) && !user.twoFactorEnabled) {
              throw new APIError('FORBIDDEN', {
                code: 'TWO_FACTOR_REQUIRED',
                message: authMessages.TWO_FACTOR_REQUIRED,
              })
            }
          }),
        },
      ],
    },
  } satisfies BetterAuthPlugin
}
