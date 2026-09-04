import {
  templateDatabase,
  testDatabasePrefix,
  urlFor,
  withAdmin,
} from '@acolhemais/db/testing/databases'
import {
  setup as migrateTemplate,
  teardown as dropTemplate,
} from '@acolhemais/db/testing/global-setup'
import type { TestProject } from 'vitest/node'

declare module 'vitest' {
  export interface ProvidedContext {
    /** Banco da execução, clonado do template já migrado. */
    databaseUrl: string
  }
}

// Roda no Node, antes dos testes (que rodam no workerd): migra o template e clona um banco
// para esta execução. Os testes compartilham o banco e usam dados próprios (e-mails únicos).
export async function setup(project: TestProject) {
  await migrateTemplate()
  const name = `${testDatabasePrefix}api_${crypto.randomUUID().replaceAll('-', '')}`
  await withAdmin(async (admin) => {
    await admin.query(`CREATE DATABASE "${name}" TEMPLATE "${templateDatabase}"`)
  })
  project.provide('databaseUrl', urlFor(name))

  return async () => {
    await withAdmin(async (admin) => {
      await admin.query(`DROP DATABASE IF EXISTS "${name}" WITH (FORCE)`)
    })
    await dropTemplate()
  }
}
