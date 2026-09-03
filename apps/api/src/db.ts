import { createDb } from '@acolhemais/db'
import type { Database } from '@acolhemais/db'
import { createMiddleware } from 'hono/factory'
import type { AppEnv } from './env'

/**
 * Expõe o banco em `c.var.db()`. No Workers, conexões não podem ser reaproveitadas entre
 * requisições: o cliente é criado no primeiro uso, sobre o pool do Hyperdrive, e fechado
 * ao fim da requisição. Rotas que não usam o banco não abrem conexão nenhuma.
 */
export const database = createMiddleware<AppEnv>(async (c, next) => {
  let db: Database | undefined
  c.set('db', () => (db ??= createDb(c.var.config.HYPERDRIVE.connectionString)))
  try {
    await next()
  } finally {
    if (db) {
      const closing = db.$client.end()
      try {
        c.executionCtx.waitUntil(closing)
      } catch {
        // Fora do Workers (ex.: app.request nos testes) não há executionCtx.
        await closing
      }
    }
  }
})
