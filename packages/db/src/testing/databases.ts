import { Client } from 'pg'
import { databaseUrl } from '../connection'

/** Banco migrado uma vez por execução e clonado para cada arquivo de teste. */
export const templateDatabase = 'acolhemais_test_template'
export const testDatabasePrefix = 'acolhemais_test_'

/** URL do mesmo servidor de `DATABASE_URL`, apontando para outro banco. */
export function urlFor(database: string): string {
  const url = new URL(databaseUrl())
  url.pathname = `/${database}`
  return url.toString()
}

/** Executa comandos administrativos (CREATE/DROP DATABASE) pelo banco de manutenção. */
export async function withAdmin(fn: (client: Client) => Promise<void>): Promise<void> {
  const client = new Client({ connectionString: urlFor('postgres') })
  await client.connect()
  try {
    await fn(client)
  } finally {
    await client.end()
  }
}
