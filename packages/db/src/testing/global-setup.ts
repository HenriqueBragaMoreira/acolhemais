import { fileURLToPath } from 'node:url'
import { migrate } from 'drizzle-orm/node-postgres/migrator'
import { createDb } from '../client'
import { templateDatabase, testDatabasePrefix, urlFor, withAdmin } from './databases'

const migrationsFolder = fileURLToPath(new URL('../../migrations', import.meta.url))

// Recria o template com as migrations atuais. Também apaga bancos de teste que
// sobraram de execuções interrompidas.
export async function setup() {
  await withAdmin(async (admin) => {
    const { rows } = await admin.query<{ datname: string }>(
      'SELECT datname FROM pg_database WHERE starts_with(datname, $1)',
      [testDatabasePrefix],
    )
    for (const { datname } of rows) {
      await admin.query(`DROP DATABASE "${datname}" WITH (FORCE)`)
    }
    await admin.query(`CREATE DATABASE "${templateDatabase}"`)
  })

  const db = createDb(urlFor(templateDatabase))
  try {
    await migrate(db, { migrationsFolder })
  } finally {
    await db.$client.end()
  }
}

export async function teardown() {
  await withAdmin(async (admin) => {
    await admin.query(`DROP DATABASE IF EXISTS "${templateDatabase}" WITH (FORCE)`)
  })
}
