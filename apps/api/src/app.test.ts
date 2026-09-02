import { describe, expect, it } from 'vitest'
import app from './app'

describe('API', () => {
  it('responde ao health check', async () => {
    const res = await app.request('/health')
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ status: 'ok' })
  })

  it('libera CORS apenas para a origem do frontend', async () => {
    const allowed = await app.request('/health', { headers: { Origin: 'http://localhost:3000' } })
    expect(allowed.headers.get('access-control-allow-origin')).toBe('http://localhost:3000')

    const other = await app.request('/health', { headers: { Origin: 'https://malicioso.example' } })
    expect(other.headers.get('access-control-allow-origin')).toBeNull()
  })

  it('envia cabeçalhos de segurança', async () => {
    const res = await app.request('/health')
    expect(res.headers.get('x-content-type-options')).toBe('nosniff')
  })
})
