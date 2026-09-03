import { sql } from 'drizzle-orm'
import { describe, expect, it } from 'vitest'
import { useTestDatabase } from './testing'
import { templateDatabase } from './testing/databases'

const getDb = useTestDatabase()

describe('banco de dados', () => {
  it('roda em um banco próprio, clonado do template', async () => {
    const { rows } = await getDb().execute<{ name: string }>(sql`SELECT current_database() AS name`)
    expect(rows[0]?.name).not.toBe(templateDatabase)
  })

  it('tem o PostGIS habilitado pelas migrations', async () => {
    const { rows } = await getDb().execute<{ version: string }>(
      sql`SELECT postgis_lib_version() AS version`,
    )
    expect(rows[0]?.version).toMatch(/^3\./)
  })

  it('gera UUIDv7 nativamente', async () => {
    const { rows } = await getDb().execute<{ id: string }>(sql`SELECT uuidv7() AS id`)
    expect(rows[0]?.id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
    )
  })
})
