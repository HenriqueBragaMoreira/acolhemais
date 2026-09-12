import { describe, expect, it } from 'vitest'
import app from './app'

const env = {
  WEB_ORIGIN: 'http://localhost:3000',
  HYPERDRIVE: { connectionString: 'postgres://acolhemais:acolhemais@localhost:5432/acolhemais' },
}

describe('API', () => {
  it('responde ao health check', async () => {
    const res = await app.request('/health', {}, env)
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ status: 'ok' })
  })

  it('libera CORS apenas para a origem do frontend', async () => {
    const allowed = await app.request(
      '/health',
      { headers: { Origin: 'http://localhost:3000' } },
      env,
    )
    expect(allowed.headers.get('access-control-allow-origin')).toBe('http://localhost:3000')
    expect(allowed.headers.get('access-control-expose-headers')).toBe('Retry-After')

    const other = await app.request(
      '/health',
      { headers: { Origin: 'https://malicioso.example' } },
      env,
    )
    expect(other.headers.get('access-control-allow-origin')).toBeNull()
  })

  it('envia cabeçalhos de segurança', async () => {
    const res = await app.request('/health', {}, env)
    expect(res.headers.get('x-content-type-options')).toBe('nosniff')
  })

  it('responde 500 quando a configuração é inválida', async () => {
    const res = await app.request('/health', {}, { ...env, WEB_ORIGIN: 'não é uma url' })
    expect(res.status).toBe(500)
    expect(await res.json()).toMatchObject({ code: 'INTERNAL_ERROR' })
  })

  it('responde rota inexistente no formato de erro da API', async () => {
    const res = await app.request('/nao-existe', {}, env)
    expect(res.status).toBe(404)
    expect(await res.json()).toMatchObject({ code: 'NOT_FOUND' })
  })

  it('exige BETTER_AUTH_SECRET e o envio de e-mail (FR-080) fora do ambiente local', async () => {
    const email = { RESEND_API_KEY: 're_chave', EMAIL_FROM: 'nao-responda@acolhemais.example' }
    const remote = { ...env, BETTER_AUTH_URL: 'https://api.acolhemais.example' }
    expect((await app.request('/health', {}, remote)).status).toBe(500)
    expect((await app.request('/health', {}, { ...remote, ...email })).status).toBe(500)

    const withSecret = { ...remote, BETTER_AUTH_SECRET: 'x'.repeat(32) }
    expect((await app.request('/health', {}, withSecret)).status).toBe(500)
    expect((await app.request('/health', {}, { ...withSecret, ...email })).status).toBe(200)
  })

  it('informa se o login com Google está ligado', async () => {
    const off = await app.request('/auth/providers', {}, env)
    expect(await off.json()).toEqual({ google: false })

    const google = { GOOGLE_CLIENT_ID: 'id', GOOGLE_CLIENT_SECRET: 'segredo' }
    const on = await app.request('/auth/providers', {}, { ...env, ...google })
    expect(await on.json()).toEqual({ google: true })
  })

  it('só aceita desligar o rate limit em localhost', async () => {
    const local = await app.request('/health', {}, { ...env, AUTH_RATE_LIMIT: 'off' })
    expect(local.status).toBe(200)

    const remote = {
      ...env,
      AUTH_RATE_LIMIT: 'off',
      BETTER_AUTH_URL: 'https://api.acolhemais.example',
      BETTER_AUTH_SECRET: 'x'.repeat(32),
      RESEND_API_KEY: 're_chave',
      EMAIL_FROM: 'nao-responda@acolhemais.example',
    }
    expect((await app.request('/health', {}, remote)).status).toBe(500)
  })

  it('exige as duas credenciais do Google juntas', async () => {
    const res = await app.request('/health', {}, { ...env, GOOGLE_CLIENT_ID: 'id' })
    expect(res.status).toBe(500)
  })
})
