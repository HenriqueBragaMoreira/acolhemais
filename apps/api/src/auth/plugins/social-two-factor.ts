import type { BetterAuthPlugin } from 'better-auth'
import { APIError, createAuthMiddleware } from 'better-auth/api'

/** Página do frontend que pede o código de 2FA para concluir o login. */
export const TWO_FACTOR_PAGE = '/entrar/2fa'

function isOAuthCallback(ctx: { path?: string }) {
  return ctx.path?.startsWith('/callback/') ?? false
}

/**
 * Leva o desafio de 2FA ao login pelo Google. O plugin `twoFactor` só desafia o login por
 * senha: sem isto, quem tem 2FA entraria pelo Google sem o código.
 *
 * Reaproveita o próprio hook do plugin (que troca a sessão recém-criada por um cookie de 2FA
 * pendente, respeitando dispositivos confiáveis) e, em vez da resposta JSON do login por
 * senha, redireciona para a página de 2FA do frontend. Exige o plugin `twoFactor`.
 */
export function socialTwoFactor({ webOrigin }: { webOrigin: string }) {
  return {
    id: 'acolhemais-social-two-factor',
    hooks: {
      after: [
        {
          matcher: isOAuthCallback,
          handler: createAuthMiddleware(async (ctx) => {
            const user = ctx.context.newSession?.user as { twoFactorEnabled?: boolean } | undefined
            if (!user?.twoFactorEnabled) return

            const challenge = ctx.context.options.plugins?.find(
              (plugin) => plugin.id === 'two-factor',
            )?.hooks?.after?.[0]?.handler
            if (!challenge) throw new Error('socialTwoFactor exige o plugin twoFactor configurado')

            const challenged = (await challenge(ctx)) as { headers?: Headers } | undefined
            // Dispositivo confiável: o plugin mantém a sessão e o login segue normalmente.
            if (ctx.context.newSession) return

            // O redirect leva os cookies do desafio: o de 2FA pendente e o que apaga a sessão.
            const headers = new Headers({
              location: new URL(TWO_FACTOR_PAGE, webOrigin).toString(),
            })
            for (const cookie of challenged?.headers?.getSetCookie() ?? []) {
              headers.append('set-cookie', cookie)
            }
            throw new APIError('FOUND', undefined, headers)
          }),
        },
      ],
    },
  } satisfies BetterAuthPlugin
}
