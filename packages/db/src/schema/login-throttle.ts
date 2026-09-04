import { integer, snakeCase, text, timestamp } from 'drizzle-orm/pg-core'
import { id, timestamps } from '../columns'

/**
 * Senhas erradas seguidas por e-mail, para o bloqueio progressivo de login (regra em
 * `loginLockoutMs`, de `@acolhemais/domain`). A tabela também recebe tentativas com e-mails
 * sem conta, então o e-mail não é guardado: a chave é um HMAC dele com o segredo da API.
 */
export const loginThrottle = snakeCase.table('login_throttle', {
  id: id(),
  emailHash: text().notNull().unique(),
  consecutiveFailures: integer().notNull().default(0),
  lastFailureAt: timestamp({ withTimezone: true }).notNull(),
  lockedUntil: timestamp({ withTimezone: true }),
  ...timestamps(),
})
