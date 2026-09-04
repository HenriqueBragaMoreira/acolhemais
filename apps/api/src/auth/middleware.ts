import { createMiddleware } from 'hono/factory'
import type { AppEnv } from '../env'
import { createAuth } from '.'
import type { Auth } from '.'

/** Expõe o Better Auth em `c.var.auth()`, criado no primeiro uso com o banco da requisição. */
export const authentication = createMiddleware<AppEnv>(async (c, next) => {
  let auth: Auth | undefined
  c.set(
    'auth',
    () =>
      (auth ??= createAuth({ config: c.var.config, db: c.var.db(), waitUntil: c.var.waitUntil })),
  )
  await next()
})
