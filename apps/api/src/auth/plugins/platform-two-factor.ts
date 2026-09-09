import type { BetterAuthPlugin } from 'better-auth'
import { APIError, createAuthMiddleware } from 'better-auth/api'
import { authMessages } from '../messages'
import { lacksPlatformTwoFactor, pluginSession } from '../session'

function isAdminRoute(ctx: { path?: string }) {
  return ctx.path?.startsWith('/admin/') ?? false
}

/**
 * Exige 2FA ativo da equipe da plataforma nas rotas do plugin `admin`. As rotas próprias da
 * plataforma aplicam a mesma regra em `requirePlatformPermission` (platform/require-permission.ts).
 */
export function platformTwoFactor() {
  return {
    id: 'acolhemais-platform-two-factor',
    hooks: {
      before: [
        {
          matcher: isAdminRoute,
          handler: createAuthMiddleware(async (ctx) => {
            const user = (await pluginSession(ctx))?.user
            if (user && lacksPlatformTwoFactor(user)) {
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
