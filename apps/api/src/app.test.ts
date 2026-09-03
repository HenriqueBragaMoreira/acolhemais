import { describe, expect, it } from 'vitest'
import app from './app'

const env = { WEB_ORIGIN: 'http://localhost:3000' }

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
    const res = await app.request('/health', {}, { WEB_ORIGIN: 'não é uma url' })
    expect(res.status).toBe(500)
  })
})
