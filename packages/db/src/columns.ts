import { sql } from 'drizzle-orm'
import { timestamp, uuid } from 'drizzle-orm/pg-core'

/** Chave primária UUIDv7 (ADR 0003): gerada pelo Postgres 18, não sequencial e ordenável no tempo. */
export const id = () =>
  uuid()
    .primaryKey()
    .default(sql`uuidv7()`)

/** `created_at` e `updated_at` com fuso horário; `updated_at` é renovado a cada update do Drizzle. */
export const timestamps = () => ({
  createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp({ withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
})
