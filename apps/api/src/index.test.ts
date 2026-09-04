import { exports } from 'cloudflare:workers'
import { describe, expect, it } from 'vitest'

describe('Worker', () => {
  // A primeira requisição carrega o Worker inteiro (com o Better Auth): leva alguns segundos.
  it(
    'atende pelo ponto de entrada usando as bindings do wrangler',
    { timeout: 20_000 },
    async () => {
      const res = await exports.default.fetch('http://api.test/health', {
        headers: { Origin: 'https://web.test' },
      })
      expect(res.status).toBe(200)
      expect(res.headers.get('access-control-allow-origin')).toBe('https://web.test')
    },
  )
})
