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
  })

  it('exige BETTER_AUTH_SECRET fora do ambiente local', async () => {
    const remote = { ...env, BETTER_AUTH_URL: 'https://api.acolhemais.example' }
    expect((await app.request('/health', {}, remote)).status).toBe(500)

    const withSecret = { ...remote, BETTER_AUTH_SECRET: 'x'.repeat(32) }
    expect((await app.request('/health', {}, withSecret)).status).toBe(200)
  })

  it('informa se o login com Google está ligado', async () => {
    const off = await app.request('/auth/providers', {}, env)
    expect(await off.json()).toEqual({ google: false })

    const google = { GOOGLE_CLIENT_ID: 'id', GOOGLE_CLIENT_SECRET: 'segredo' }
    const on = await app.request('/auth/providers', {}, { ...env, ...google })
    expect(await on.json()).toEqual({ google: true })
  })

  it('exige as duas credenciais do Google juntas', async () => {
    const res = await app.request('/health', {}, { ...env, GOOGLE_CLIENT_ID: 'id' })
    expect(res.status).toBe(500)
  })
})
