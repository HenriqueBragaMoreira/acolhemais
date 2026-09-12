import { request, type APIRequestContext } from '@playwright/test'
import { API_URL, WEB_URL } from '../playwright.config'
import { totpCode } from './totp'

export const PASSWORD = 'senha-de-teste-bem-longa'

export type Account = {
  name: string
  email: string
  password: string
  /** Presente quando a conta tem 2FA: a URI do QR code e os códigos de recuperação. */
  twoFactor?: { totpURI: string; backupCodes: string[] }
}

/** IP aleatório, para o rate limit (por IP) das contas criadas não somar entre testes. */
function randomIp() {
  return `10.${[0, 0, 0].map(() => Math.floor(Math.random() * 256)).join('.')}`
}

async function apiContext(): Promise<APIRequestContext> {
  return request.newContext({
    baseURL: `${API_URL}/api/auth/`,
    extraHTTPHeaders: { origin: WEB_URL, 'cf-connecting-ip': randomIp() },
  })
}

/** Mailpit do docker compose, que recebe os e-mails da API local. */
const MAILPIT_URL = 'http://localhost:8025'

/** Link do e-mail mais recente enviado a `email` (o único link do texto puro). */
export async function lastEmailLink(email: string): Promise<string> {
  const query = encodeURIComponent(`to:"${email}"`)
  for (let attempt = 0; attempt < 20; attempt++) {
    const search = await fetch(`${MAILPIT_URL}/api/v1/search?query=${query}`)
    const { messages } = (await search.json()) as { messages: { ID: string }[] }
    if (messages[0]) {
      const message = await fetch(`${MAILPIT_URL}/api/v1/message/${messages[0].ID}`)
      const { Text } = (await message.json()) as { Text: string }
      const link = Text.match(/https?:\/\/\S+/)?.[0]
      if (!link) throw new Error(`e-mail para ${email} sem link`)
      return link
    }
    await new Promise((resolve) => setTimeout(resolve, 200))
  }
  throw new Error(`nenhum e-mail para ${email}`)
}

/**
 * Cria uma conta pela API, como o cadastro faria: cadastra e confirma o e-mail pelo link que
 * chega no Mailpit (BR-007), a não ser que `verified` seja `false`. Se pedido, entra e ativa o
 * 2FA confirmando o primeiro código (como no app autenticador). A interface de cadastro ainda
 * não existe.
 */
export async function createAccount({ twoFactor = false, verified = true } = {}): Promise<Account> {
  const api = await apiContext()
  const account: Account = {
    name: 'Coordenação Patinhas',
    email: `e2e-${crypto.randomUUID()}@acolhemais.test`,
    password: PASSWORD,
  }
  try {
    const signUp = await api.post('sign-up/email', {
      data: { name: account.name, email: account.email, password: account.password },
    })
    if (!signUp.ok()) throw new Error(`cadastro falhou: ${signUp.status()} ${await signUp.text()}`)
    if (!verified) return account
    const verify = await api.get(await lastEmailLink(account.email), { maxRedirects: 0 })
    if (verify.status() !== 302) throw new Error(`verificar o e-mail falhou: ${verify.status()}`)
    if (!twoFactor) return account

    const signIn = await api.post('sign-in/email', {
      data: { email: account.email, password: account.password },
    })
    if (!signIn.ok()) throw new Error(`login falhou: ${signIn.status()}`)

    const enable = await api.post('two-factor/enable', { data: { password: PASSWORD } })
    if (!enable.ok()) throw new Error(`ativar 2FA falhou: ${enable.status()}`)
    const enabled = (await enable.json()) as { totpURI: string; backupCodes: string[] }
    const confirm = await api.post('two-factor/verify-totp', {
      data: { code: await totpCode(enabled.totpURI) },
    })
    if (!confirm.ok()) throw new Error(`confirmar 2FA falhou: ${confirm.status()}`)
    return { ...account, twoFactor: enabled }
  } finally {
    await api.dispose()
  }
}
