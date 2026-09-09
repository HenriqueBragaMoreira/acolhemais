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

/**
 * Cria uma conta pela API, como o cadastro faria, e, se pedido, ativa o 2FA confirmando o
 * primeiro código (como no app autenticador). A interface de cadastro ainda não existe.
 */
export async function createAccount({ twoFactor = false } = {}): Promise<Account> {
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
    if (!twoFactor) return account

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
