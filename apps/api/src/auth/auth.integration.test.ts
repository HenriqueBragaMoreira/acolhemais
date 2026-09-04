import { afterEach, describe, expect, it, vi } from 'vitest'
import { cookiesFrom, env, get, password, post, randomIp, signUp, uniqueEmail } from '../test/auth'

const uuidv7 = /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/

describe('Better Auth: e-mail e senha', () => {
  it('cadastra o usuário com ID UUIDv7 e cookie de sessão protegido', async () => {
    const { res } = await signUp()
    const body = await res.json<{ user: { id: string } }>()
    expect(body.user.id).toMatch(uuidv7)

    const session = res.headers.getSetCookie().find((c) => c.includes('session_token='))
    expect(session).toMatch(/^acolhemais\.session_token=/)
    expect(session).toMatch(/HttpOnly/i)
    expect(session).toMatch(/SameSite=Lax/i)
  })

  it('recusa senha com menos de 12 caracteres', async () => {
    const res = await post('/sign-up/email', {
      name: 'Ana Souza',
      email: uniqueEmail(),
      password: 'curta-11ch!',
    })
    expect(res.status).toBe(400)
  })

  it('entra com e-mail e senha e lê a sessão pelo cookie', async () => {
    const { email } = await signUp()
    const signIn = await post('/sign-in/email', { email, password })
    expect(signIn.status).toBe(200)

    const res = await get('/get-session', { cookie: cookiesFrom(signIn) })
    const session = await res.json<{ user: { email: string } }>()
    expect(session.user.email).toBe(email)
  })

  it('recusa senha errada com mensagem em português', async () => {
    const { email } = await signUp()
    const res = await post('/sign-in/email', { email, password: 'outra-senha-qualquer' })
    expect(res.status).toBe(401)
    expect(await res.json()).toMatchObject({
      code: 'INVALID_EMAIL_OR_PASSWORD',
      message: 'E-mail ou senha inválidos',
    })
  })

  it('recusa requisições de origem não confiável', async () => {
    const res = await post(
      '/sign-up/email',
      { name: 'Ana Souza', email: uniqueEmail(), password },
      { origin: 'https://malicioso.example' },
    )
    expect(res.status).toBe(403)
  })
})

async function sha1(text: string) {
  const digest = await crypto.subtle.digest('SHA-1', new TextEncoder().encode(text))
  return [...new Uint8Array(digest)]
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('')
    .toUpperCase()
}

/**
 * Simula o serviço do Have I Been Pwned: ele recebe só os 5 primeiros caracteres do hash SHA-1
 * da senha e responde os sufixos das senhas vazadas com esse prefixo.
 */
async function mockBreachedPassword(leaked: string) {
  const hash = await sha1(leaked)
  const requested: string[] = []
  const realFetch = globalThis.fetch
  vi.spyOn(globalThis, 'fetch').mockImplementation(async (input, init) => {
    const url = new Request(input).url
    if (!url.startsWith('https://api.pwnedpasswords.com/range/')) return realFetch(input, init)
    requested.push(url)
    return new Response([`${hash.slice(5)}:1234`, `${'0'.repeat(34)}A:1`].join('\r\n'))
  })
  return { prefix: hash.slice(0, 5), requested }
}

describe('Better Auth: senhas vazadas', () => {
  // Fora de localhost a checagem fica ligada.
  const published = {
    ...env,
    BETTER_AUTH_URL: 'https://api.acolhemais.example',
    BETTER_AUTH_SECRET: 'segredo-de-teste-com-mais-de-32-caracteres',
  }

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('recusa no cadastro uma senha que já vazou, enviando só o prefixo do hash', async () => {
    const leaked = 'senha-que-ja-vazou-123'
    const { prefix, requested } = await mockBreachedPassword(leaked)

    const res = await post(
      '/sign-up/email',
      { name: 'Ana Souza', email: uniqueEmail(), password: leaked },
      {},
      published,
    )
    expect(res.status).toBe(400)
    expect(await res.json()).toMatchObject({
      code: 'PASSWORD_COMPROMISED',
      message: expect.stringContaining('vazamentos'),
    })
    expect(requested).toEqual([`https://api.pwnedpasswords.com/range/${prefix}`])
  })

  it('aceita senha que não aparece nos vazamentos', async () => {
    await mockBreachedPassword('outra-senha-vazada-456')
    const res = await post(
      '/sign-up/email',
      { name: 'Ana Souza', email: uniqueEmail(), password },
      {},
      published,
    )
    expect(res.status).toBe(200)
  })
})

describe('Better Auth: força bruta', () => {
  const wrong = 'senha-errada-qualquer'

  it('limita as tentativas de login vindas do mesmo IP', async () => {
    const { email } = await signUp()
    const ip = { 'cf-connecting-ip': randomIp() }
    for (let attempt = 0; attempt < 3; attempt++) {
      expect((await post('/sign-in/email', { email, password: wrong }, ip)).status).toBe(401)
    }
    const blocked = await post('/sign-in/email', { email, password: wrong }, ip)
    expect(blocked.status).toBe(429)
    expect(blocked.headers.get('x-retry-after')).toBeTruthy()
  })

  it('bloqueia o e-mail após 5 senhas erradas, mesmo com a senha certa e de outro IP', async () => {
    const { email } = await signUp()
    for (let attempt = 0; attempt < 5; attempt++) {
      expect((await post('/sign-in/email', { email, password: wrong })).status).toBe(401)
    }
    const res = await post('/sign-in/email', { email, password })
    expect(res.status).toBe(429)
    expect(await res.json()).toMatchObject({ code: 'LOGIN_TEMPORARILY_LOCKED' })
    expect(Number(res.headers.get('retry-after'))).toBeGreaterThan(0)
    expect(Number(res.headers.get('retry-after'))).toBeLessThanOrEqual(60)
  })

  it('zera a contagem quando a senha confere', async () => {
    const { email } = await signUp()
    for (let attempt = 0; attempt < 4; attempt++) {
      await post('/sign-in/email', { email, password: wrong })
    }
    expect((await post('/sign-in/email', { email, password })).status).toBe(200)
    for (let attempt = 0; attempt < 4; attempt++) {
      await post('/sign-in/email', { email, password: wrong })
    }
    expect((await post('/sign-in/email', { email, password })).status).toBe(200)
  })

  it('bloqueia também e-mails sem conta, sem revelar quais existem', async () => {
    const email = uniqueEmail()
    for (let attempt = 0; attempt < 5; attempt++) {
      expect((await post('/sign-in/email', { email, password: wrong })).status).toBe(401)
    }
    const res = await post('/sign-in/email', { email, password: wrong })
    expect(res.status).toBe(429)
    expect(await res.json()).toMatchObject({ code: 'LOGIN_TEMPORARILY_LOCKED' })
  })
})
