import type { BetterAuthPlugin } from 'better-auth'
import { createAuthMiddleware, isAPIError } from 'better-auth/api'

type FirstAccessDeps = {
  /** Pede a redefinição de senha da conta, como o "esqueci a senha" (FR-004). */
  requestPasswordReset: (email: string) => Promise<unknown>
}

/**
 * Conta criada pela equipe nasce sem senha (BR-015): logo depois da criação, a pessoa recebe o
 * link de primeiro acesso, que é o mesmo da redefinição de senha. Chamadas do servidor sem
 * requisição (o `auth create-admin`, que já define a senha) ficam de fora.
 */
export function firstAccess({ requestPasswordReset }: FirstAccessDeps) {
  return {
    id: 'acolhemais-first-access',
    hooks: {
      after: [
        {
          matcher: (ctx) => ctx.path === '/admin/create-user',
          handler: createAuthMiddleware(async (ctx) => {
            if (!ctx.request && !ctx.headers) return
            const returned = ctx.context.returned as { user?: { email?: unknown } } | undefined
            if (isAPIError(returned) || typeof returned?.user?.email !== 'string') return
            await requestPasswordReset(returned.user.email)
          }),
        },
      ],
    },
  } satisfies BetterAuthPlugin
}
