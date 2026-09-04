import { Hono } from 'hono'
import type { Context } from 'hono'
import { cors } from 'hono/cors'
import { secureHeaders } from 'hono/secure-headers'
import { authentication } from './auth/middleware'
import { database } from './db'
import { config } from './env'
import type { AppEnv } from './env'
import { health } from './routes/health'

const app = new Hono<AppEnv>()
  .use(secureHeaders())
  .use(config)
  .use(database)
  .use(authentication)
  .use(
    cors({
      // A origem permitida vem da configuração, que só existe durante a requisição.
      origin: (origin, c: Context<AppEnv>) => (origin === c.var.config.WEB_ORIGIN ? origin : null),
      credentials: true,
    }),
  )
  // Rotas do Better Auth (login, sessão, 2FA...): ele mesmo valida método, origem e corpo.
  .on(['GET', 'POST'], '/api/auth/*', (c) => c.var.auth().handler(c.req.raw))
  .route('/health', health)

/** Tipo da API consumido pelo cliente tipado (`hc`) no frontend. */
export type AppType = typeof app

export default app
