import { createDb, schema } from '@acolhemais/db'
import { eq } from 'drizzle-orm'
import { afterAll, afterEach, describe, expect, inject, it, vi } from 'vitest'
import { cookiesFrom, get, post, signUp, uniqueEmail, WEB_ORIGIN } from '../test/auth'
import { googleEnv, signInWithGoogle } from '../test/google'

describe('Better Auth: login com Google', () => {
  const db = createDb(inject('databaseUrl'))

  afterEach(() => {
    vi.restoreAllMocks()
  })

  afterAll(async () => {
    await db.$client.end()
  })

  it('fica desligado sem as credenciais do Google', async () => {
    const res = await post('/sign-in/social', { provider: 'google' })
    expect(res.status).toBe(404)
  })

  it('manda para o Google pedindo a escolha da conta', async () => {
    const res = await post('/sign-in/social', { provider: 'google' }, {}, googleEnv)
    const url = new URL((await res.json<{ url: string }>()).url)
    expect(url.origin).toBe('https://accounts.google.com')
    expect(url.searchParams.get('client_id')).toBe(googleEnv.GOOGLE_CLIENT_ID)
    expect(url.searchParams.get('prompt')).toBe('select_account')
  })

  it('cria a conta com e-mail verificado e abre a sessão', async () => {
    const email = uniqueEmail()
    const callback = await signInWithGoogle({ email })
    expect(callback.status).toBe(302)
    expect(callback.headers.get('location')).toBe(`${WEB_ORIGIN}/painel`)

    const session = await get('/get-session', { cookie: cookiesFrom(callback) }, googleEnv)
    expect(await session.json()).toMatchObject({ user: { email, emailVerified: true } })
  })

  it('guarda os tokens do Google cifrados', async () => {
    const email = uniqueEmail()
    await signInWithGoogle({ email })

    const [account] = await db
      .select({ accessToken: schema.account.accessToken })
      .from(schema.account)
      .innerJoin(schema.user, eq(schema.user.id, schema.account.userId))
      .where(eq(schema.user.email, email))
    expect(account?.accessToken).toBeTruthy()
    expect(account?.accessToken).not.toBe('access-token')
  })

  it('não vincula o Google a uma conta com senha e e-mail não verificado', async () => {
    // Alguém cadastra o e-mail de outra pessoa com uma senha; a dona entra depois pelo Google.
    const { email } = await signUp()
    const callback = await signInWithGoogle({ email })

    expect(callback.headers.get('location')).toContain('error=account_not_linked')
    expect(cookiesFrom(callback)).not.toContain('session_token=')
  })
})
