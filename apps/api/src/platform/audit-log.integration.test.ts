import { createDb } from '@acolhemais/db'
import { afterAll, describe, expect, inject, it } from 'vitest'
import { platformMember, regularUser } from '../test/accounts'
import { request } from '../test/api'
import { post } from '../test/auth'

const db = createDb(inject('databaseUrl'))

afterAll(async () => {
  await db.$client.end()
})

type Page = { entries: { id: string; action: string }[]; nextCursor: string | null }

async function page(cookie: string, query: string) {
  const res = await request('GET', `/platform/audit-log?${query}`, { cookie })
  expect(res.status).toBe(200)
  return res.json<Page>()
}

describe('consulta da auditoria', () => {
  it('é só de quem tem audit_log.view (o superadmin)', async () => {
    const moderator = await platformMember(db, 'moderator')
    const res = await request('GET', '/platform/audit-log', { cookie: moderator.cookie })
    expect(res.status).toBe(403)
  })

  it('filtra por alvo e pagina do mais novo ao mais antigo', async () => {
    const admin = await platformMember(db, 'superadmin')
    const target = await regularUser()
    for (const role of ['moderator', 'support', 'user']) {
      await post('/admin/set-role', { userId: target.id, role }, { cookie: admin.cookie })
    }

    const first = await page(admin.cookie, `targetType=user&targetId=${target.id}&limit=2`)
    expect(first.entries).toHaveLength(2)
    expect(first.nextCursor).toBe(first.entries[1]?.id)

    const second = await page(
      admin.cookie,
      `targetType=user&targetId=${target.id}&limit=2&before=${first.nextCursor}`,
    )
    expect(second.entries).toHaveLength(1)
    expect(second.nextCursor).toBeNull()

    const ids = [...first.entries, ...second.entries].map((entry) => entry.id)
    expect(ids).toEqual(ids.toSorted().toReversed())
  })

  it('filtra por autor e ação, e recusa filtros inválidos', async () => {
    const admin = await platformMember(db, 'superadmin')
    const target = await regularUser()
    await post('/admin/ban-user', { userId: target.id }, { cookie: admin.cookie })

    const banned = await page(admin.cookie, `actorUserId=${admin.id}&action=user.banned`)
    expect(banned.entries.map((entry) => entry.action)).toEqual(['user.banned'])

    const invalid = await request('GET', '/platform/audit-log?action=user.hacked', {
      cookie: admin.cookie,
    })
    expect(invalid.status).toBe(400)
  })
})
