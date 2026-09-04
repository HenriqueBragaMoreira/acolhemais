import { expect, inject } from 'vitest'
import app from '../app'

// Helpers dos testes de integração de autenticação: requisições à API com as bindings de teste.

export const WEB_ORIGIN = 'http://localhost:3000'
export const env = { WEB_ORIGIN, HYPERDRIVE: { connectionString: inject('databaseUrl') } }
export const password = 'senha-de-teste-bem-longa'

type Bindings = Record<string, unknown>

export function uniqueEmail() {
  return `${crypto.randomUUID()}@acolhemais.test`
}

/** IP aleatório, para o rate limit (por IP) de um teste não afetar os outros. */
export function randomIp() {
  const [a = 0, b = 0, c = 0] = crypto.getRandomValues(new Uint8Array(3))
  return `10.${a}.${b}.${c}`
}

function headersWith(headers: Record<string, string>) {
  return { 'cf-connecting-ip': randomIp(), origin: WEB_ORIGIN, ...headers }
}

export function get(path: string, headers: Record<string, string> = {}, bindings: Bindings = env) {
  return app.request(`/api/auth${path}`, { headers: headersWith(headers) }, bindings)
}

export function post(
  path: string,
  body: unknown,
  headers: Record<string, string> = {},
  bindings: Bindings = env,
) {
  return app.request(
    `/api/auth${path}`,
    {
      method: 'POST',
      headers: headersWith({ 'content-type': 'application/json', ...headers }),
      body: JSON.stringify(body),
    },
    bindings,
  )
}

/** Cookies da resposta no formato do header `Cookie` de uma próxima requisição. */
export function cookiesFrom(res: Response) {
  return res.headers
    .getSetCookie()
    .map((cookie) => cookie.split(';')[0])
    .join('; ')
}

export async function signUp(email = uniqueEmail()) {
  const res = await post('/sign-up/email', { name: 'Ana Souza', email, password })
  expect(res.status).toBe(200)
  return { email, res }
}
