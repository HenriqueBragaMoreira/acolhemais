import type { Config } from '../config'

/** Um e-mail pronto para envio. O texto puro acompanha o HTML para quem não lê HTML. */
export type Email = { to: string; subject: string; html: string; text: string }

/** Quem entrega os e-mails: Resend em produção, Mailpit no ambiente local (FR-080). */
export interface EmailProvider {
  send(email: Email): Promise<void>
}

const SENDER_NAME = 'Acolhe+'

async function ensureOk(service: string, res: Response) {
  if (!res.ok) throw new Error(`${service} respondeu ${res.status}: ${await res.text()}`)
}

export function resendProvider(apiKey: string, from: string): EmailProvider {
  return {
    async send({ to, subject, html, text }) {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { authorization: `Bearer ${apiKey}`, 'content-type': 'application/json' },
        body: JSON.stringify({ from: `${SENDER_NAME} <${from}>`, to: [to], subject, html, text }),
      })
      await ensureOk('Resend', res)
    },
  }
}

/** Mailpit captura tudo, sem entregar a ninguém: a caixa fica em http://localhost:8025. */
export function mailpitProvider(url: string, from: string): EmailProvider {
  return {
    async send({ to, subject, html, text }) {
      const res = await fetch(new URL('/api/v1/send', url), {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          From: { Name: SENDER_NAME, Email: from },
          To: [{ Email: to }],
          Subject: subject,
          HTML: html,
          Text: text,
        }),
      })
      await ensureOk('Mailpit', res)
    },
  }
}

/** Resend quando há chave; sem ela, a configuração só aceita o ambiente local (Mailpit). */
export function emailProvider(config: Config): EmailProvider {
  return config.RESEND_API_KEY
    ? resendProvider(config.RESEND_API_KEY, config.EMAIL_FROM)
    : mailpitProvider(config.MAILPIT_URL, config.EMAIL_FROM)
}

/**
 * Envia sem derrubar quem chamou. Na Fase 0 não há fila (FR-080): a falha vai para o log, sem o
 * destinatário, e a pessoa repete o pedido (entrar de novo, "esqueci a senha", reconvidar).
 */
export async function deliver(provider: EmailProvider, email: Email): Promise<void> {
  try {
    await provider.send(email)
  } catch (error) {
    console.error(`Falha ao enviar o e-mail "${email.subject}":`, error)
  }
}
