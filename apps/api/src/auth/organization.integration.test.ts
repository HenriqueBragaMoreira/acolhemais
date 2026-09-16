import { createDb } from '@acolhemais/db'
import type { SystemRoleKey } from '@acolhemais/domain'
import { afterAll, describe, expect, inject, it } from 'vitest'
import { loadConfig } from '../config'
import { regularUser as account } from '../test/accounts'
import { env, get, post, uniqueEmail, WEB_ORIGIN } from '../test/auth'
import { lastEmailTo, linkIn } from '../test/mailpit'
import { enableTwoFactor } from '../test/two-factor'
import { createAuth } from '.'

const db = createDb(inject('databaseUrl'))
// Instância usada no servidor, como a plataforma fará ao aprovar uma organização (Fase 1).
const auth = createAuth({ config: loadConfig(env), db })

afterAll(async () => {
  await db.$client.end()
})

/**
 * Organização aprovada pela plataforma, com `owner` como Responsável. Por padrão ele já tem o
 * 2FA, que o Responsável precisa para agir na organização (BR-057).
 */
async function approvedOrganization({ twoFactor = true } = {}) {
  const owner = await account({ twoFactor })
  const slug = `ong-${crypto.randomUUID().slice(0, 8)}`
  const organization = await auth.api.createOrganization({
    body: { name: 'ONG de Teste', slug, userId: owner.id },
  })
  if (!organization) throw new Error('organização não criada')
  return { organizationId: organization.id, slug, owner }
}

async function memberWithRole(organizationId: string, role: string, { twoFactor = false } = {}) {
  const user = await account({ twoFactor })
  // O tipo só conhece os papéis padrão; os criados pela ONG também são aceitos.
  const member = await auth.api.addMember({
    body: { userId: user.id, organizationId, role: role as SystemRoleKey },
  })
  if (!member) throw new Error('membro não adicionado')
  return { ...user, memberId: member.id }
}

async function createRole(
  cookie: string,
  organizationId: string,
  role: string,
  permission: Record<string, string[]>,
) {
  const res = await post(
    '/organization/create-role',
    { organizationId, role, permission },
    { cookie },
  )
  expect(res.status).toBe(200)
}

async function codeOf(res: Response) {
  return (await res.json<{ code?: string }>()).code
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

  it('BR-056: envia o convite por e-mail com o link da tela de convite', async () => {
    const { organizationId, owner } = await approvedOrganization()
    const email = uniqueEmail()
    const res = await post(
      '/organization/invite-member',
      { organizationId, email, role: 'volunteer' },
      { cookie: owner.cookie },
    )
    const { id } = await res.json<{ id: string }>()

    const message = await lastEmailTo(email)
    expect(message.Subject).toBe('Convite para a equipe de ONG de Teste no Acolhe+')
    expect(message.Text).toContain('Ana Souza convidou você')
    expect(linkIn(message).href).toBe(`${WEB_ORIGIN}/convites/${id}`)
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
    const manager = await memberWithRole(organizationId, 'gestor', { twoFactor: true })

    const res = await post(
      '/organization/create-role',
      { organizationId, role: 'espiao', permission: { application: ['view_sensitive'] } },
      { cookie: manager.cookie },
    )
    expect(res.status).toBe(403)
    expect(await codeOf(res)).not.toBe('TWO_FACTOR_REQUIRED')
  })
})

describe('BR-057: 2FA de quem tem permissão sensível', () => {
  it('recusa as rotas da organização ao Responsável sem 2FA, até ele ativar', async () => {
    const { organizationId, slug, owner } = await approvedOrganization({ twoFactor: false })
    const invite = { organizationId, email: uniqueEmail(), role: 'volunteer' }

    const refused = [
      await post('/organization/invite-member', invite, { cookie: owner.cookie }),
      await get(`/organization/list-members?organizationId=${organizationId}`, {
        cookie: owner.cookie,
      }),
      await get(`/organization/get-full-organization?organizationSlug=${slug}`, {
        cookie: owner.cookie,
      }),
    ]
    for (const res of refused) {
      expect(res.status).toBe(403)
      expect(await codeOf(res)).toBe('TWO_FACTOR_REQUIRED')
    }

    const { cookie } = await enableTwoFactor(owner.cookie)
    expect((await post('/organization/invite-member', invite, { cookie })).status).toBe(200)
  })

  it('vale para o papel próprio com permissão sensível', async () => {
    const { organizationId, owner } = await approvedOrganization()
    await createRole(owner.cookie, organizationId, 'triagem', { application: ['view_sensitive'] })
    const screener = await memberWithRole(organizationId, 'triagem')

    const res = await get(`/organization/list-members?organizationId=${organizationId}`, {
      cookie: screener.cookie,
    })
    expect(res.status).toBe(403)
    expect(await codeOf(res)).toBe('TWO_FACTOR_REQUIRED')
  })

  it('não exige 2FA do Voluntário', async () => {
    const { organizationId } = await approvedOrganization()
    const volunteer = await memberWithRole(organizationId, 'volunteer')
    expect(await can(volunteer.cookie, organizationId, { animal: ['create'] })).toBe(true)
  })

  it('deixa responder ao convite para um papel sensível sem 2FA', async () => {
    const { organizationId, owner } = await approvedOrganization()
    const invited = await account()
    const invite = await post(
      '/organization/invite-member',
      { organizationId, email: invited.email, role: 'coordinator' },
      { cookie: owner.cookie },
    )
    const { id } = await invite.json<{ id: string }>()

    const res = await post(
      '/organization/accept-invitation',
      { invitationId: id },
      {
        cookie: invited.cookie,
      },
    )
    expect(res.status).toBe(200)
    // Já dentro da equipe, a exigência vale quando a pessoa age.
    const list = await get(`/organization/list-members?organizationId=${organizationId}`, {
      cookie: invited.cookie,
    })
    expect(await codeOf(list)).toBe('TWO_FACTOR_REQUIRED')
  })
})

describe('BR-054: ninguém concede o que não tem', () => {
  it('convida só com papéis cujas permissões quem convida tem', async () => {
    const { organizationId, owner } = await approvedOrganization()
    await createRole(owner.cookie, organizationId, 'recrutador', {
      invitation: ['create'],
      animal: ['create'],
    })
    await createRole(owner.cookie, organizationId, 'fotografo', { animal: ['create'] })
    const recruiter = await memberWithRole(organizationId, 'recrutador', { twoFactor: true })
    const invite = (role: string) =>
      post(
        '/organization/invite-member',
        { organizationId, email: uniqueEmail(), role },
        { cookie: recruiter.cookie },
      )

    // Convidar não exige poder trocar papéis (`member.update`).
    expect((await invite('fotografo')).status).toBe(200)
    const refused = await invite('volunteer')
    expect(refused.status).toBe(403)
    expect(await codeOf(refused)).toBe('CANNOT_ASSIGN_UNOWNED_PERMISSION')
  })

  it('troca o papel só quando quem age tem as permissões do papel antigo e do novo', async () => {
    const { organizationId, owner } = await approvedOrganization()
    await createRole(owner.cookie, organizationId, 'gestor', {
      member: ['update'],
      animal: ['create', 'update'],
    })
    await createRole(owner.cookie, organizationId, 'fotografo', { animal: ['create'] })
    const manager = await memberWithRole(organizationId, 'gestor', { twoFactor: true })
    const volunteer = await memberWithRole(organizationId, 'volunteer')
    const coordinator = await memberWithRole(organizationId, 'coordinator')
    const changeRole = (memberId: string, role: string) =>
      post(
        '/organization/update-member-role',
        { organizationId, memberId, role },
        { cookie: manager.cookie },
      )

    const promote = await changeRole(volunteer.memberId, 'coordinator')
    expect(promote.status).toBe(403)
    expect(await codeOf(promote)).toBe('CANNOT_ASSIGN_UNOWNED_PERMISSION')
    const demote = await changeRole(coordinator.memberId, 'volunteer')
    expect(demote.status).toBe(403)
    expect(await codeOf(demote)).toBe('CANNOT_ASSIGN_UNOWNED_PERMISSION')
    expect((await changeRole(volunteer.memberId, 'fotografo')).status).toBe(200)
  })

  it('remove só quem não tem permissões além das de quem remove', async () => {
    const { organizationId, owner } = await approvedOrganization()
    await createRole(owner.cookie, organizationId, 'removedor', {
      member: ['delete'],
      animal: ['create', 'update'],
    })
    const remover = await memberWithRole(organizationId, 'removedor', { twoFactor: true })
    const volunteer = await memberWithRole(organizationId, 'volunteer')
    const coordinator = await memberWithRole(organizationId, 'coordinator')
    const remove = (memberIdOrEmail: string) =>
      post(
        '/organization/remove-member',
        { organizationId, memberIdOrEmail },
        { cookie: remover.cookie },
      )

    const refused = await remove(coordinator.email)
    expect(refused.status).toBe(403)
    expect(await codeOf(refused)).toBe('CANNOT_ASSIGN_UNOWNED_PERMISSION')
    expect((await remove(volunteer.memberId)).status).toBe(200)
  })
})
