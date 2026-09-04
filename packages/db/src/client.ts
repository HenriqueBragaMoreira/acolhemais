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
  // Sem este handler, um erro em conexão ociosa (ex.: queda do banco) vira exceção não
  // tratada. No Workers, fechar o pool ao fim da requisição também dispara um "socket
  // closed" no socket já encerrado: esse é esperado e ignorado.
  pool.on('error', (error) => {
    if (!pool.ending) console.error('Erro em conexão ociosa com o Postgres:', error)
  })
  return drizzle({ client: pool, relations })
}
