import { createDb } from '@acolhemais/db'
import type { Database } from '@acolhemais/db'
import { createMiddleware } from 'hono/factory'
import type { AppEnv } from './env'

/**
 * Expõe o banco em `c.var.db()`. No Workers, conexões não podem ser reaproveitadas entre
 * requisições: o cliente é criado no primeiro uso, sobre o pool do Hyperdrive, e fechado
 * ao fim da requisição. Rotas que não usam o banco não abrem conexão nenhuma.
 *
 * Também expõe `c.var.waitUntil()` para tarefas que continuam depois da resposta (ex.: as do
 * Better Auth): a conexão só é fechada quando todas elas terminam.
 */
export const database = createMiddleware<AppEnv>(async (c, next) => {
  let db: Database | undefined
  const pending: Promise<unknown>[] = []

  c.set('db', () => (db ??= createDb(c.var.config.HYPERDRIVE.connectionString)))
  c.set('waitUntil', (promise) => {
    pending.push(promise)
  })

  try {
    await next()
  } finally {
    const done = Promise.allSettled(pending).then(() => db?.$client.end())
    try {
      c.executionCtx.waitUntil(done)
    } catch {
      // Fora do Workers (ex.: app.request nos testes) não há executionCtx.
      await done
    }
  }
})
