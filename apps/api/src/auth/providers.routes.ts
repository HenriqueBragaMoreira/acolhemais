import { Hono } from 'hono'
import type { AppEnv } from '../config'

/**
 * Formas de login ligadas nesta instalação. O Google é opcional (sem as credenciais, fica
 * desligado), e a tela de login só mostra o botão quando ele funciona.
 */
export const authProviderRoutes = new Hono<AppEnv>().get('/', (c) => {
  return c.json({ google: c.var.config.google !== null })
})
