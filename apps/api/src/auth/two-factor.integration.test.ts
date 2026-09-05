import { afterEach, describe, expect, it, vi } from 'vitest'
import { cookiesFrom, get, password, post, signUp } from '../test/auth'
import { totpCode } from '../test/totp'

type Enabled = { totpURI: string; backupCodes: string[] }

/** Ativa o 2FA como o usuário faria: pede o QR code e confirma com o primeiro código. */
async function enableTwoFactor(cookie: string, body: object = { password }): Promise<Enabled> {
  const enable = await post('/two-factor/enable', body, { cookie })
  expect(enable.status).toBe(200)
  const enabled = await enable.json<Enabled>()

  const confirm = await post(
    '/two-factor/verify-totp',
    { code: await totpCode(enabled.totpURI) },
    { cookie },
  )
  expect(confirm.status).toBe(200)
  return enabled
}

function sessionCookie(res: Response) {
  return cookiesFrom(res)
    .split('; ')
    .find((cookie) => cookie.startsWith('acolhemais.session_token=') && !cookie.endsWith('='))
}

describe('Better Auth: 2FA', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('pede o código no login por senha e só abre a sessão com ele', async () => {
    const { email, res } = await signUp()
    const { totpURI } = await enableTwoFactor(cookiesFrom(res))

    const signIn = await post('/sign-in/email', { email, password })
    expect(await signIn.json()).toMatchObject({ twoFactorRedirect: true })
    expect(sessionCookie(signIn)).toBeUndefined()

    const wrongCode = await post(
      '/two-factor/verify-totp',
      { code: '000000' },
      { cookie: cookiesFrom(signIn) },
    )
    expect(wrongCode.status).toBe(401)
    expect(await wrongCode.json()).toMatchObject({
      code: 'INVALID_CODE',
      message: 'Código inválido.',
    })

    const verified = await post(
      '/two-factor/verify-totp',
      { code: await totpCode(totpURI, 1) },
      { cookie: cookiesFrom(signIn) },
    )
    expect(verified.status).toBe(200)
    const session = await get('/get-session', { cookie: cookiesFrom(verified) })
    expect(await session.json()).toMatchObject({ user: { email, twoFactorEnabled: true } })
  })

  it('aceita um código de recuperação no lugar do app autenticador', async () => {
    const { email, res } = await signUp()
    const { backupCodes } = await enableTwoFactor(cookiesFrom(res))

    const signIn = await post('/sign-in/email', { email, password })
    const verified = await post(
      '/two-factor/verify-backup-code',
      { code: backupCodes[0] },
      { cookie: cookiesFrom(signIn) },
    )
    expect(verified.status).toBe(200)
    expect(sessionCookie(verified)).toBeDefined()
  })
})
