import type { AppType } from '@acolhemais/api'
import { hc } from 'hono/client'

/** Cliente tipado da API: rotas, parâmetros e respostas vêm direto dos tipos do Hono. */
export const api = hc<AppType>(process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001', {
  init: { credentials: 'include' },
})
