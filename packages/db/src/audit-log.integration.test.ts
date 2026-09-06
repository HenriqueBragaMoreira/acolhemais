import { eq, sql } from 'drizzle-orm'
import { describe, expect, it } from 'vitest'
import { auditLog } from './schema'
import { useTestDatabase } from './testing'

const getDb = useTestDatabase()

async function insertEntry() {
  const [entry] = await getDb()
    .insert(auditLog)
    .values({
      action: 'user.banned',
      targetType: 'user',
      targetId: crypto.randomUUID(),
      metadata: { reason: null, expiresAt: null },
    })
    .returning()
  if (!entry) throw new Error('registro não gravado')
  return entry
}

/** Mensagem do Postgres, que o Drizzle embrulha em `cause`. */
async function rejection(query: Promise<unknown>) {
  const failure = await query.then(
    () => undefined,
    (error: unknown) => error,
  )
  expect(failure).toBeDefined()
  return String((failure as { cause?: unknown }).cause ?? failure)
}

describe('auditoria (audit_log)', () => {
  it('aceita novos registros, com id UUIDv7 e data', async () => {
    const entry = await insertEntry()
    expect(entry.id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-7/)
    expect(entry.occurredAt).toBeInstanceOf(Date)
  })

  it('não deixa alterar registros', async () => {
    const entry = await insertEntry()
    const message = await rejection(
      getDb().update(auditLog).set({ action: 'user.unbanned' }).where(eq(auditLog.id, entry.id)),
    )
    expect(message).toContain('só de acréscimo: UPDATE')
  })

  it('não deixa apagar registros, nem esvaziar a tabela', async () => {
    const entry = await insertEntry()
    expect(await rejection(getDb().delete(auditLog).where(eq(auditLog.id, entry.id)))).toContain(
      'DELETE',
    )
    expect(await rejection(getDb().execute(sql`TRUNCATE audit_log`))).toContain('TRUNCATE')

    const [kept] = await getDb().select().from(auditLog).where(eq(auditLog.id, entry.id))
    expect(kept?.action).toBe('user.banned')
  })
})
