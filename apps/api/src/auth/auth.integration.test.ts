import { describe, expect, inject, it } from 'vitest'
import app from '../app'

const WEB_ORIGIN = 'http://localhost:3000'
const env = { WEB_ORIGIN, HYPERDRIVE: { connectionString: inject('databaseUrl') } }
const password = 'senha-de-teste-bem-longa'
const uuidv7 = /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/

function uniqueEmail() {
  return `${crypto.randomUUID()}@acolhemais.test`
}

function post(path: string, body: unknown, headers: Record<string, string> = {}) {
  return app.request(
    `/api/auth${path}`,
    {
      method: 'POST',
      headers: { 'content-type': 'application/json', origin: WEB_ORIGIN, ...headers },
      body: JSON.stringify(body),
    },
    env,
  )
}

/** Cookies da resposta no formato do header `Cookie` de uma próxima requisição. */
function cookiesFrom(res: Response) {
  return res.headers
    .getSetCookie()
    .map((cookie) => cookie.split(';')[0])
    .join('; ')
}

async function signUp(email = uniqueEmail()) {
  const res = await post('/sign-up/email', { name: 'Ana Souza', email, password })
  expect(res.status).toBe(200)
  return { email, res }
}

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

    const res = await app.request(
      '/api/auth/get-session',
      { headers: { cookie: cookiesFrom(signIn), origin: WEB_ORIGIN } },
      env,
    )
    const session = await res.json<{ user: { email: string } }>()
    expect(session.user.email).toBe(email)
  })

  it('recusa senha errada', async () => {
    const { email } = await signUp()
    const res = await post('/sign-in/email', { email, password: 'outra-senha-qualquer' })
    expect(res.status).toBe(401)
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
