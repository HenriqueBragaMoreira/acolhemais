import { createDb, schema } from '@acolhemais/db'
import { eq } from 'drizzle-orm'
import { afterAll, describe, expect, inject, it } from 'vitest'
import { request } from '../test/api'
import { platformMember, regularUser } from '../test/accounts'

const db = createDb(inject('databaseUrl'))

afterAll(async () => {
  await db.$client.end()
})

type Setting = { key: string; value: unknown; default: unknown; updatedBy: string | null }

async function settings(cookie: string) {
  const res = await request('GET', '/platform/settings', { cookie })
  expect(res.status).toBe(200)
  const { settings: list } = await res.json<{ settings: Setting[] }>()
  return new Map(list.map((setting) => [setting.key, setting]))
}

function auditAbout(key: string) {
  return db.select().from(schema.auditLog).where(eq(schema.auditLog.targetId, key))
}

describe('rotas da plataforma', () => {
  it('exigem sessão, papel da plataforma e 2FA ativo', async () => {
    expect((await request('GET', '/platform/settings')).status).toBe(401)

    const user = await regularUser()
    const asUser = await request('GET', '/platform/settings', { cookie: user.cookie })
    expect(asUser.status).toBe(403)
    expect(await asUser.json()).toMatchObject({ code: 'FORBIDDEN' })

    const noTwoFactor = await platformMember(db, 'superadmin', { twoFactor: false })
    const asAdmin = await request('GET', '/platform/settings', { cookie: noTwoFactor.cookie })
    expect(asAdmin.status).toBe(403)
    expect(await asAdmin.json()).toMatchObject({ code: 'TWO_FACTOR_REQUIRED' })
  })
})

describe('parâmetros da plataforma', () => {
  it('mostram os padrões do PLANO a toda a equipe', async () => {
    const support = await platformMember(db, 'support')
    const list = await settings(support.cookie)
    expect(list.get('incidentDefenseDays')).toMatchObject({ value: 15, default: 15 })
    expect(list.get('adoptionFeeCapCents')).toMatchObject({ value: null, default: null })
  })

  it('só o superadmin altera', async () => {
    const moderator = await platformMember(db, 'moderator')
    const res = await request('PATCH', '/platform/settings', {
      cookie: moderator.cookie,
      body: { values: { maxActiveApplications: 2 } },
    })
    expect(res.status).toBe(403)
  })

  it('grava a alteração e registra na auditoria o valor anterior e o novo', async () => {
    const admin = await platformMember(db, 'superadmin')
    const res = await request('PATCH', '/platform/settings', {
      cookie: admin.cookie,
      body: { values: { refusalResubmissionDays: 45, adoptionFeeCapCents: 20_000 } },
    })
    expect(res.status).toBe(200)

    const list = await settings(admin.cookie)
    expect(list.get('refusalResubmissionDays')).toMatchObject({ value: 45, updatedBy: admin.id })
    expect(list.get('adoptionFeeCapCents')).toMatchObject({ value: 20_000 })
    expect(await auditAbout('refusalResubmissionDays')).toMatchObject([
      {
        action: 'platform_setting.updated',
        actorUserId: admin.id,
        targetType: 'platform_setting',
        metadata: { from: 30, to: 45 },
      },
    ])

    // Mesmo valor de novo: nada muda, nada é registrado.
    await request('PATCH', '/platform/settings', {
      cookie: admin.cookie,
      body: { values: { refusalResubmissionDays: 45 } },
    })
    expect(await auditAbout('refusalResubmissionDays')).toHaveLength(1)
  })

  it('recusa valores inválidos e parâmetros desconhecidos sem gravar nada', async () => {
    const admin = await platformMember(db, 'superadmin')
    const invalid = await request('PATCH', '/platform/settings', {
      cookie: admin.cookie,
      body: { values: { ineligibilityReviewMonths: 36, incidentDefenseDays: 1 } },
    })
    expect(invalid.status).toBe(400)
    expect(await invalid.json()).toMatchObject({ code: 'INVALID_PLATFORM_SETTING' })

    const unknown = await request('PATCH', '/platform/settings', {
      cookie: admin.cookie,
      body: { values: { taxaDaPlataforma: 10 } },
    })
    expect(unknown.status).toBe(400)
    expect(await unknown.json()).toMatchObject({ code: 'UNKNOWN_PLATFORM_SETTING' })

    expect((await settings(admin.cookie)).get('ineligibilityReviewMonths')).toMatchObject({
      value: 60,
    })
    expect(await auditAbout('ineligibilityReviewMonths')).toEqual([])
  })
})
