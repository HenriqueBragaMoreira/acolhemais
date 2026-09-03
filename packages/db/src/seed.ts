import { faker } from '@faker-js/faker/locale/pt_BR'
import { createDb } from './client'
import { databaseUrl } from './connection'

// Dados fictícios para desenvolvimento. O seed fixo deixa os dados iguais em toda máquina,
// e cada módulo deve inserir de forma idempotente (rodar duas vezes não duplica nada).
faker.seed(20260902)

const url = new URL(databaseUrl())
if (
  !['localhost', '127.0.0.1'].includes(url.hostname) &&
  process.env.ALLOW_REMOTE_SEED !== 'true'
) {
  console.error(`Seed recusado em ${url.hostname}: use ALLOW_REMOTE_SEED=true para bancos remotos.`)
  process.exit(1)
}

const db = createDb(url.toString())
try {
  // Os módulos de domínio adicionam aqui os seus dados (organizações, animais, ...).
  console.info('Seed concluído.')
} finally {
  await db.$client.end()
}
