import type { BetterAuthPlugin } from 'better-auth'
import { APIError, createAuthMiddleware } from 'better-auth/api'
import type { SessionUser } from '../session'
import { TWO_FACTOR_PAGE } from '../web-pages'

function isOAuthCallback(ctx: { path?: string }) {
  return ctx.path?.startsWith('/callback/') ?? false
}

type HookContext = Parameters<Parameters<typeof createAuthMiddleware>[0]>[0]

/**
 * O hook que o plugin `twoFactor` roda depois do login por senha. É código interno do plugin,
 * achado pelo `matcher` (e não pela posição na lista, que muda sem aviso numa atualização):
 * revisar a cada upgrade do better-auth. O teste do login pelo Google com 2FA cobre isto.
 */
function passwordSignInChallenge(ctx: HookContext) {
  const twoFactor = ctx.context.options.plugins?.find((plugin) => plugin.id === 'two-factor')
  return twoFactor?.hooks?.after?.find((hook) =>
    hook.matcher({ path: '/sign-in/email', context: ctx.context }),
  )?.handler
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
            const user = ctx.context.newSession?.user as SessionUser | undefined
            if (!user?.twoFactorEnabled) return

            const challenge = passwordSignInChallenge(ctx)
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
