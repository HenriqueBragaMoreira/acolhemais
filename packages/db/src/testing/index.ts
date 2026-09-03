import { randomUUID } from 'node:crypto'
import { afterAll, beforeAll } from 'vitest'
import { createDb } from '../client'
import type { Database } from '../client'
import { templateDatabase, testDatabasePrefix, urlFor, withAdmin } from './databases'

/**
 * Dá ao arquivo de teste um banco próprio, clonado do template já migrado e apagado
 * no fim. Os testes do mesmo arquivo compartilham o banco: cada um cria os dados de que
 * precisa, em vez de contar com um banco vazio.
 */
export function useTestDatabase(): () => Database {
  const name = `${testDatabasePrefix}${randomUUID().replaceAll('-', '')}`
  let db: Database | undefined

  beforeAll(async () => {
    await withAdmin(async (admin) => {
      await admin.query(`CREATE DATABASE "${name}" TEMPLATE "${templateDatabase}"`)
    })
    db = createDb(urlFor(name))
  })

  afterAll(async () => {
    await db?.$client.end()
    await withAdmin(async (admin) => {
      await admin.query(`DROP DATABASE IF EXISTS "${name}" WITH (FORCE)`)
    })
  })

  return () => {
    if (!db) throw new Error('useTestDatabase(): o banco só existe dentro dos testes.')
    return db
  }
}
