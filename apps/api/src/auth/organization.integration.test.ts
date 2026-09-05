import { createDb } from '@acolhemais/db'
import type { SystemRoleKey } from '@acolhemais/domain'
import { afterAll, describe, expect, inject, it } from 'vitest'
import { loadConfig } from '../env'
import { cookiesFrom, env, post, signUp, uniqueEmail } from '../test/auth'
import { createAuth } from '.'

const db = createDb(inject('databaseUrl'))
// Instância usada no servidor, como a plataforma fará ao aprovar uma organização (Fase 1).
const auth = createAuth({ config: loadConfig(env), db })

afterAll(async () => {
  await db.$client.end()
})

async function account() {
  const { res } = await signUp()
  const { user } = await res.json<{ user: { id: string } }>()
  return { id: user.id, cookie: cookiesFrom(res) }
}

/** Organização aprovada pela plataforma, com `owner` como Responsável. */
async function approvedOrganization() {
  const owner = await account()
  const slug = `ong-${crypto.randomUUID().slice(0, 8)}`
  const organization = await auth.api.createOrganization({
    body: { name: 'ONG de Teste', slug, userId: owner.id },
  })
  if (!organization) throw new Error('organização não criada')
  return { organizationId: organization.id, owner }
}

async function memberWithRole(organizationId: string, role: string) {
  const member = await account()
  // O tipo só conhece os papéis padrão; os criados pela ONG também são aceitos.
  await auth.api.addMember({
    body: { userId: member.id, organizationId, role: role as SystemRoleKey },
  })
  return member
}

async function can(cookie: string, organizationId: string, permissions: object) {
  const res = await post(
    '/organization/has-permission',
    { organizationId, permissions },
    { cookie },
  )
  return (await res.json<{ success: boolean }>()).success
}

describe('organizações (plugin organization)', () => {
  it('não deixa o usuário criar uma organização sozinho', async () => {
    const { cookie } = await account()
    const res = await post(
      '/organization/create',
      { name: 'Minha ONG', slug: 'minha-ong' },
      { cookie },
    )
    expect(res.status).toBe(403)
  })

  it('cria a organização aprovada com o Responsável e os papéis padrão', async () => {
    const { organizationId, owner } = await approvedOrganization()
    const volunteer = await memberWithRole(organizationId, 'volunteer')

    expect(await can(owner.cookie, organizationId, { page: ['customize'] })).toBe(true)
    expect(await can(owner.cookie, organizationId, { member: ['update'] })).toBe(true)
    expect(await can(volunteer.cookie, organizationId, { animal: ['create'] })).toBe(true)
    expect(await can(volunteer.cookie, organizationId, { application: ['view_sensitive'] })).toBe(
      false,
    )
  })

  it('não deixa apagar a organização, nem o Responsável', async () => {
    const { organizationId, owner } = await approvedOrganization()
    const res = await post('/organization/delete', { organizationId }, { cookie: owner.cookie })
    expect(res.status).not.toBe(200)
    expect(await can(owner.cookie, organizationId, { organization: ['delete'] })).toBe(false)
  })

  it('cria convites que valem 7 dias', async () => {
    const { organizationId, owner } = await approvedOrganization()
    const res = await post(
      '/organization/invite-member',
      { organizationId, email: uniqueEmail(), role: 'coordinator' },
      { cookie: owner.cookie },
    )
    expect(res.status).toBe(200)
    const { expiresAt } = await res.json<{ expiresAt: string }>()
    const days = (new Date(expiresAt).getTime() - Date.now()) / (24 * 60 * 60 * 1000)
    expect(days).toBeGreaterThan(6.9)
    expect(days).toBeLessThanOrEqual(7)
  })

  it('deixa a ONG criar papéis próprios a partir do catálogo', async () => {
    const { organizationId, owner } = await approvedOrganization()
    const res = await post(
      '/organization/create-role',
      { organizationId, role: 'fotografo', permission: { animal: ['create', 'update'] } },
      { cookie: owner.cookie },
    )
    expect(res.status).toBe(200)

    const photographer = await memberWithRole(organizationId, 'fotografo')
    expect(await can(photographer.cookie, organizationId, { animal: ['update'] })).toBe(true)
    expect(await can(photographer.cookie, organizationId, { animal: ['archive'] })).toBe(false)
  })

  it('não deixa criar papel com permissão que o próprio autor não tem', async () => {
    const { organizationId, owner } = await approvedOrganization()
    await post(
      '/organization/create-role',
      { organizationId, role: 'gestor', permission: { ac: ['create'], animal: ['create'] } },
      { cookie: owner.cookie },
    )
    const manager = await memberWithRole(organizationId, 'gestor')

    const res = await post(
      '/organization/create-role',
      { organizationId, role: 'espiao', permission: { application: ['view_sensitive'] } },
      { cookie: manager.cookie },
    )
    expect(res.status).toBe(403)
  })
})
