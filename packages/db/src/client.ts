import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import { relations } from './relations'

export type Database = ReturnType<typeof createDb>

/**
 * Cria o cliente do banco. Na API, é criado por requisição com a connection string do
 * Hyperdrive, que já mantém o pool real de conexões com o Postgres.
 */
export function createDb(connectionString: string) {
  const pool = new Pool({ connectionString, max: 5 })
  return drizzle({ client: pool, relations })
}
