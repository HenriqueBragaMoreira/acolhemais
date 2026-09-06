import { jsonb, snakeCase, text, timestamp, uuid } from 'drizzle-orm/pg-core'

/**
 * Parâmetros da plataforma que a equipe alterou. Só os alterados ficam aqui: os demais valem
 * o padrão do catálogo em `@acolhemais/domain` (PLATFORM_SETTINGS), que também valida os
 * valores. Cada alteração vai para a auditoria com o valor anterior e o novo.
 */
export const platformSetting = snakeCase.table('platform_setting', {
  key: text().primaryKey(),
  // `null` é um valor válido em alguns parâmetros ("não definido", ex.: teto da taxa).
  value: jsonb(),
  /** Quem alterou por último (sem chave estrangeira, como na auditoria). */
  updatedBy: uuid(),
  updatedAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
})
