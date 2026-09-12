import { schema } from '@acolhemais/db'
import type { Database } from '@acolhemais/db'
import { and, eq, isNotNull } from 'drizzle-orm'
import type { Config } from '../config'
import { deliver, emailProvider } from '../email/provider'
import {
  firstAccessEmail,
  invitationEmail,
  resetPasswordEmail,
  verificationEmail,
} from '../email/templates'

type EmailUser = { id: string; email: string; name: string; emailVerified: boolean }

async function hasPassword(db: Database, userId: string) {
  const [credential] = await db
    .select({ id: schema.account.id })
    .from(schema.account)
    .where(
      and(
        eq(schema.account.userId, userId),
        eq(schema.account.providerId, 'credential'),
        isNotNull(schema.account.password),
      ),
    )
  return credential !== undefined
}

/**
 * E-mails do Better Auth (FR-080). Os links são montados aqui, com o endereço da API e da web
 * da configuração, e não com o `callbackURL` que o cliente mandou.
 */
export function authEmails(config: Config, db: Database) {
  const provider = emailProvider(config)
  const api = `${config.BETTER_AUTH_URL}/api/auth`

  return {
    /** Depois de confirmar, a pessoa vai para `/entrar`: o link não abre sessão (FR-003). */
    async verification({ user, token }: { user: EmailUser; token: string }) {
      const callbackURL = encodeURIComponent(`${config.WEB_ORIGIN}/entrar?verificado=1`)
      const url = `${api}/verify-email?token=${token}&callbackURL=${callbackURL}`
      await deliver(provider, { to: user.email, ...verificationEmail({ name: user.name, url }) })
    },

    /**
     * O link abre a tela da web, que manda o token com a nova senha (FR-004). Conta criada pela
     * equipe que ainda não criou a senha (sem senha e com o e-mail não confirmado) recebe o texto
     * de primeiro acesso (BR-015), também quando pede outro link pelo "esqueci a senha".
     */
    async resetPassword({ user, token }: { user: EmailUser; token: string }) {
      const url = `${config.WEB_ORIGIN}/redefinir-senha?token=${encodeURIComponent(token)}`
      const firstAccess = !user.emailVerified && !(await hasPassword(db, user.id))
      const message = (firstAccess ? firstAccessEmail : resetPasswordEmail)({
        name: user.name,
        url,
      })
      await deliver(provider, { to: user.email, ...message })
    },

    /**
     * Convite para a equipe (BR-056). A tela `/convites/{id}` da web, que aceita ou recusa,
     * entra com FR-023 (Fase 1): decidido mandar o link desde já.
     */
    async invitation({
      id,
      email,
      organization,
      inviter,
    }: {
      id: string
      email: string
      organization: { name: string }
      inviter: { user: { name: string } }
    }) {
      const url = `${config.WEB_ORIGIN}/convites/${encodeURIComponent(id)}`
      const message = invitationEmail({
        organizationName: organization.name,
        inviterName: inviter.user.name,
        url,
      })
      await deliver(provider, { to: email, ...message })
    },
  }
}
