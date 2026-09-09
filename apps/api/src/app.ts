import { Hono } from 'hono'
import type { Context } from 'hono'
import { cors } from 'hono/cors'
import { secureHeaders } from 'hono/secure-headers'
import { authentication } from './auth/authentication'
import { authProviderRoutes } from './auth/providers.routes'
import { config } from './config'
import type { AppEnv } from './config'
import { database } from './db'
import { handleError, handleNotFound } from './http/errors'
import { auditLogRoutes } from './platform/audit-log.routes'
import { platformSettingsRoutes } from './platform/settings.routes'

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
      // Quanto falta para o login bloqueado liberar (a tela mostra o tempo de espera).
      exposeHeaders: ['Retry-After'],
    }),
  )
  // Rotas do Better Auth (login, sessão, 2FA...): ele mesmo valida método, origem e corpo.
  .on(['GET', 'POST'], '/api/auth/*', (c) => c.var.auth().handler(c.req.raw))
  .get('/health', (c) => c.json({ status: 'ok' as const }))
  .route('/auth/providers', authProviderRoutes)
  // Rotas próprias da equipe da plataforma (permissão do catálogo + 2FA). Com o CORS restrito
  // ao frontend e cookies SameSite=Lax, outro site não as chama com a sessão de alguém.
  .route('/platform/settings', platformSettingsRoutes)
  .route('/platform/audit-log', auditLogRoutes)
  .onError(handleError)
  .notFound(handleNotFound)

/** Tipo da API consumido pelo cliente tipado (`hc`) no frontend. */
export type AppType = typeof app

export default app
