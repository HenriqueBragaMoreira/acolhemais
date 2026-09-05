import { expect } from 'vitest'
import { cookiesFrom, password, post } from './auth'
import { totpCode } from './totp'

export type Enabled = {
  totpURI: string
  backupCodes: string[]
  /** Cookie de sessão depois da ativação: o Better Auth renova a sessão ao confirmar o 2FA. */
  cookie: string
}

/** Ativa o 2FA como o usuário faria: pede o QR code e confirma com o primeiro código. */
export async function enableTwoFactor(
  cookie: string,
  body: object = { password },
): Promise<Enabled> {
  const enable = await post('/two-factor/enable', body, { cookie })
  expect(enable.status).toBe(200)
  const enabled = await enable.json<Omit<Enabled, 'cookie'>>()

  const confirm = await post(
    '/two-factor/verify-totp',
    { code: await totpCode(enabled.totpURI) },
    { cookie },
  )
  expect(confirm.status).toBe(200)
  const renewed = cookiesFrom(confirm)
  return { ...enabled, cookie: renewed.includes('session_token=') ? renewed : cookie }
}
