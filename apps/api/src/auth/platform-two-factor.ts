import { platformRequiresTwoFactor } from '@acolhemais/domain'
import type { BetterAuthPlugin } from 'better-auth'
import { APIError, createAuthMiddleware, getSessionFromCtx } from 'better-auth/api'
import { authMessages } from './messages'

function isAdminRoute(ctx: { path?: string }) {
  return ctx.path?.startsWith('/admin/') ?? false
}

/**
 * Exige 2FA ativo da equipe da plataforma nas rotas do plugin `admin`. As rotas próprias da
 * plataforma aplicam a mesma regra em `requirePlatformPermission` (platform/middleware.ts).
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
