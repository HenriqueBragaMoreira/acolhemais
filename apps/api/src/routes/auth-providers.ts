import { Hono } from 'hono'
import type { AppEnv } from '../env'

/**
 * Formas de login ligadas nesta instalação. O Google é opcional (sem as credenciais, fica
 * desligado), e a tela de login só mostra o botão quando ele funciona.
 */
export const authProviders = new Hono<AppEnv>().get('/', (c) => {
  const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET } = c.var.config
  return c.json({ google: Boolean(GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET) })
})
