import type { Config } from '../config'
import { deliver, emailProvider } from '../email/provider'
import { verificationEmail } from '../email/templates'

type EmailUser = { email: string; name: string }

/**
 * E-mails do Better Auth (FR-080). Os links são montados aqui, com o endereço da API e da web
 * da configuração, e não com o `callbackURL` que o cliente mandou.
 */
export function authEmails(config: Config) {
  const provider = emailProvider(config)
  const api = `${config.BETTER_AUTH_URL}/api/auth`

  return {
    /** Depois de confirmar, a pessoa vai para `/entrar`: o link não abre sessão (FR-003). */
    async verification({ user, token }: { user: EmailUser; token: string }) {
      const callbackURL = encodeURIComponent(`${config.WEB_ORIGIN}/entrar?verificado=1`)
      const url = `${api}/verify-email?token=${token}&callbackURL=${callbackURL}`
      await deliver(provider, { to: user.email, ...verificationEmail({ name: user.name, url }) })
    },
  }
}
