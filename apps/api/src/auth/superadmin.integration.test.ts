import { createDb, schema } from '@acolhemais/db'
import { and, eq } from 'drizzle-orm'
import { afterAll, describe, expect, inject, it } from 'vitest'
import { regularUser } from '../test/accounts'
import { setSuperadmin } from './superadmin'

const db = createDb(inject('databaseUrl'))

afterAll(async () => {
  await db.$client.end()
})

async function roleOf(userId: string) {
  const [row] = await db
    .select({ role: schema.user.role })
    .from(schema.user)
    .where(eq(schema.user.id, userId))
  return row?.role
}

async function roleChanges(userId: string) {
  return db
    .select({ actorUserId: schema.auditLog.actorUserId, metadata: schema.auditLog.metadata })
    .from(schema.auditLog)
    .where(
      and(eq(schema.auditLog.targetId, userId), eq(schema.auditLog.action, 'user.role_changed')),
    )
}

describe('FR-011 / BR-013: superadmin pela linha de comando', () => {
  it('dá e tira superadmin, mantendo os outros papéis e registrando na auditoria', async () => {
    const keeper = await regularUser()
    await setSuperadmin(db, keeper.email, true)
    const target = await regularUser()
    await db.update(schema.user).set({ role: 'moderator' }).where(eq(schema.user.id, target.id))

    expect(await setSuperadmin(db, target.email.toUpperCase(), true)).toMatchObject({
      changed: true,
    })
    expect(await roleOf(target.id)).toBe('moderator,superadmin')

    await setSuperadmin(db, target.email, false)
    expect(await roleOf(target.id)).toBe('moderator')

    expect(await roleChanges(target.id)).toEqual([
      { actorUserId: null, metadata: { from: ['moderator'], to: ['moderator', 'superadmin'] } },
      { actorUserId: null, metadata: { from: ['moderator', 'superadmin'], to: ['moderator'] } },
    ])
  })

  it('volta ao papel comum quando superadmin era o único papel', async () => {
    const keeper = await regularUser()
    await setSuperadmin(db, keeper.email, true)
    const target = await regularUser()
    await setSuperadmin(db, target.email, true)
    expect(await roleOf(target.id)).toBe('superadmin')
    await setSuperadmin(db, target.email, false)
    expect(await roleOf(target.id)).toBe('user')
  })

  it('não muda nada nem audita quando a conta já está assim', async () => {
    const target = await regularUser()
    expect(await setSuperadmin(db, target.email, false)).toMatchObject({ changed: false })
    expect(await roleChanges(target.id)).toEqual([])
  })

  it('recusa e-mail sem conta', async () => {
    await expect(setSuperadmin(db, 'ninguem@acolhemais.test', true)).rejects.toThrow(
      'Nenhuma conta',
    )
  })
})
