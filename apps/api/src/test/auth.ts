import { expect, inject } from 'vitest'
import app from '../app'
import { lastEmailTo, linkIn } from './mailpit'

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

/** Cadastro sem confirmar o e-mail: a conta existe, mas o login por senha é recusado (BR-007). */
export async function signUpUnverified(email = uniqueEmail()) {
  const res = await post('/sign-up/email', { name: 'Ana Souza', email, password })
  expect(res.status).toBe(200)
  return { email, res }
}

/** Abre o link de um e-mail na API (ex.: verificação), sem seguir o redirecionamento. */
export function openApiLink(link: URL) {
  return get(link.pathname.replace(/^\/api\/auth/, '') + link.search)
}

/**
 * Cadastro completo, como a pessoa faria: cadastra, confirma pelo link do e-mail e entra.
 * `res` é a resposta do login, com o cookie de sessão e o usuário.
 */
export async function signUp(email = uniqueEmail()) {
  await signUpUnverified(email)
  const verified = await openApiLink(linkIn(await lastEmailTo(email)))
  expect(verified.status).toBe(302)
  const res = await post('/sign-in/email', { email, password })
  expect(res.status).toBe(200)
  return { email, res }
}
