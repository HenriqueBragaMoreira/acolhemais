import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { secureHeaders } from 'hono/secure-headers'
import { env } from './env'
import { health } from './routes/health'

const app = new Hono()
  .use(secureHeaders())
  .use(cors({ origin: env.WEB_ORIGIN, credentials: true }))
  .route('/health', health)

/** Tipo da API consumido pelo cliente tipado (`hc`) no frontend. */
export type AppType = typeof app

export default app
