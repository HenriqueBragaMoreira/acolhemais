import { createDb, schema } from '@acolhemais/db'
import type { PlatformRole } from '@acolhemais/domain'
import { eq } from 'drizzle-orm'
import { afterAll, describe, expect, inject, it } from 'vitest'
import { loadConfig } from '../config'
import { platformMember as createPlatformMember, regularUser } from '../test/accounts'
import { env, get, post, uniqueEmail } from '../test/auth'
import { createAuth } from '.'

const db = createDb(inject('databaseUrl'))
// Instância do servidor, para montar organizações como a plataforma fará na aprovação (Fase 1).
const auth = createAuth({ config: loadConfig(env), db })

afterAll(async () => {
  await db.$client.end()
})

function platformMember(role: PlatformRole, options?: { twoFactor?: boolean }) {
  return createPlatformMember(db, role, options)
}

/** Pergunta à API se a sessão pode decidir sobre a inscrição de organizações. */
async function canReviewOrganizations(cookie: string) {
  const res = await post(
    '/admin/has-permission',
    { permissions: { organization_review: ['decide'] } },
    { cookie },
  )
  return (await res.json<{ success: boolean }>()).success
}

describe('equipe da plataforma (plugin admin)', () => {
  it('exige 2FA ativo de quem é da equipe', async () => {
    const { cookie } = await platformMember('superadmin', { twoFactor: false })
    const res = await get('/admin/list-users', { cookie })
    expect(res.status).toBe(403)
    expect(await res.json()).toMatchObject({ code: 'TWO_FACTOR_REQUIRED' })
  })

  it('deixa o superadmin listar usuários e mudar papéis', async () => {
    const { cookie } = await platformMember('superadmin')
    const target = await regularUser()

    expect((await get('/admin/list-users', { cookie })).status).toBe(200)
    const setRole = await post(
      '/admin/set-role',
      { userId: target.id, role: 'moderator' },
      { cookie },
    )
    expect(setRole.status).toBe(200)
  })

  it('recusa papel que não existe', async () => {
    const { cookie } = await platformMember('superadmin')
    const target = await regularUser()
    const res = await post('/admin/set-role', { userId: target.id, role: 'dono' }, { cookie })
    expect(res.status).toBe(400)
  })

  it('deixa o moderador consultar usuários, mas não mudar papéis nem suspender contas', async () => {
    const { cookie } = await platformMember('moderator')
    const target = await regularUser()

    expect((await get('/admin/list-users', { cookie })).status).toBe(200)
    const setRole = await post(
      '/admin/set-role',
      { userId: target.id, role: 'support' },
      { cookie },
    )
    expect(setRole.status).toBe(403)
    expect((await post('/admin/ban-user', { userId: target.id }, { cookie })).status).toBe(403)
  })

  it('aplica as permissões próprias da plataforma', async () => {
    const moderator = await platformMember('moderator')
    const support = await platformMember('support')

    expect(await canReviewOrganizations(moderator.cookie)).toBe(true)
    expect(await canReviewOrganizations(support.cookie)).toBe(false)
  })

  it('não deixa ninguém entrar como outro usuário', async () => {
    const { cookie } = await platformMember('superadmin')
    const target = await regularUser()
    const res = await post('/admin/impersonate-user', { userId: target.id }, { cookie })
    expect(res.status).toBe(403)
  })

  it('recusa as rotas da equipe para usuários comuns', async () => {
    const { cookie } = await regularUser()
    const res = await get('/admin/list-users', { cookie })
    expect(res.status).toBe(403)
    expect(await res.json()).not.toMatchObject({ code: 'TWO_FACTOR_REQUIRED' })
  })
})

/** Organização com `owner` como único Responsável. */
async function organizationOwnedBy(ownerId: string) {
  const slug = `ong-${crypto.randomUUID().slice(0, 8)}`
  const organization = await auth.api.createOrganization({
    body: { name: 'ONG de Teste', slug, userId: ownerId },
  })
  if (!organization) throw new Error('organização não criada')
  return organization.id
}

/** Status e código de erro de uma resposta recusada. */
async function refusal(res: Response) {
  const { code } = await res.json<{ code?: string }>()
  return { status: res.status, code }
}

describe('BR-008: editar a conta de outra pessoa aceita só nome e foto', () => {
  it('corrige nome e foto', async () => {
    const { cookie } = await platformMember('superadmin')
    const target = await regularUser()
    const res = await post(
      '/admin/update-user',
      { userId: target.id, data: { name: 'Ana Corrigida', image: 'https://img.test/a.png' } },
      { cookie },
    )
    expect(res.status).toBe(200)
  })

  it.each([
    { role: 'moderator' },
    { banned: true },
    { email: 'outro@acolhemais.test' },
    { emailVerified: true },
    { twoFactorEnabled: false },
    { name: 'Ana', banReason: 'x' },
  ])('recusa %o', async (data) => {
    const { cookie } = await platformMember('superadmin')
    const target = await regularUser()
    const res = await post('/admin/update-user', { userId: target.id, data }, { cookie })
    expect(await refusal(res)).toEqual({ status: 400, code: 'USER_FIELD_NOT_EDITABLE' })
  })
})

describe('BR-015: conta criada pela equipe', () => {
  it('cria com nome, e-mail e papel da equipe, sem senha e com o e-mail não verificado', async () => {
    const { cookie } = await platformMember('superadmin')
    const res = await post(
      '/admin/create-user',
      { name: 'Bia Lima', email: uniqueEmail(), role: 'moderator' },
      { cookie },
    )
    expect(res.status).toBe(200)
    const { user } = await res.json<{
      user: { id: string; role: string; emailVerified: boolean }
    }>()
    expect(user).toMatchObject({ role: 'moderator', emailVerified: false })
    const accounts = await db
      .select({ providerId: schema.account.providerId })
      .from(schema.account)
      .where(eq(schema.account.userId, user.id))
    expect(accounts).toEqual([])
  })

  it('cria conta comum sem papel', async () => {
    const { cookie } = await platformMember('superadmin')
    const res = await post('/admin/create-user', { name: 'Caio', email: uniqueEmail() }, { cookie })
    expect(res.status).toBe(200)
  })

  it.each([
    { password: 'senha-de-teste-bem-longa' },
    { data: { emailVerified: true } },
    { data: { banned: true } },
    { data: {} },
  ])('recusa %o', async (extra) => {
    const { cookie } = await platformMember('superadmin')
    const res = await post(
      '/admin/create-user',
      { name: 'Davi', email: uniqueEmail(), ...extra },
      { cookie },
    )
    expect(await refusal(res)).toEqual({ status: 400, code: 'CREATE_USER_FIELD_NOT_ALLOWED' })
  })

  it('recusa papel fora da equipe', async () => {
    const { cookie } = await platformMember('superadmin')
    const res = await post(
      '/admin/create-user',
      { name: 'Eva', email: uniqueEmail(), role: 'user' },
      { cookie },
    )
    expect(await refusal(res)).toEqual({ status: 400, code: 'ROLE_NOT_ASSIGNABLE' })
  })
})

describe('BR-013: superadmin só pela linha de comando', () => {
  it('recusa criar conta superadmin', async () => {
    const { cookie } = await platformMember('superadmin')
    const res = await post(
      '/admin/create-user',
      { name: 'Fabi', email: uniqueEmail(), role: ['moderator', 'superadmin'] },
      { cookie },
    )
    expect(await refusal(res)).toEqual({ status: 403, code: 'SUPERADMIN_CLI_ONLY' })
  })

  it('recusa dar superadmin', async () => {
    const { cookie } = await platformMember('superadmin')
    const target = await regularUser()
    const res = await post('/admin/set-role', { userId: target.id, role: 'superadmin' }, { cookie })
    expect(await refusal(res)).toEqual({ status: 403, code: 'SUPERADMIN_CLI_ONLY' })
  })

  it('recusa tirar superadmin de outra conta', async () => {
    const { cookie } = await platformMember('superadmin')
    const other = await platformMember('superadmin')
    const res = await post('/admin/set-role', { userId: other.id, role: 'moderator' }, { cookie })
    expect(await refusal(res)).toEqual({ status: 403, code: 'SUPERADMIN_CLI_ONLY' })
  })

  it('recusa mexer no papel da própria conta superadmin', async () => {
    const self = await platformMember('superadmin')
    const res = await post(
      '/admin/set-role',
      { userId: self.id, role: ['superadmin', 'moderator'] },
      { cookie: self.cookie },
    )
    expect(await refusal(res)).toEqual({ status: 403, code: 'SUPERADMIN_CLI_ONLY' })
  })

  it('recusa suspender um superadmin', async () => {
    const { cookie } = await platformMember('superadmin')
    const other = await platformMember('superadmin')
    expect(await refusal(await post('/admin/ban-user', { userId: other.id }, { cookie }))).toEqual({
      status: 403,
      code: 'SUPERADMIN_CLI_ONLY',
    })
  })

  it('dá e tira moderador e suporte', async () => {
    const { cookie } = await platformMember('superadmin')
    const target = await regularUser()
    for (const role of [['moderator', 'support'], 'user']) {
      const res = await post('/admin/set-role', { userId: target.id, role }, { cookie })
      expect(res.status).toBe(200)
    }
  })
})

describe('BR-014 / BR-055: banimento e o único Responsável', () => {
  it('recusa suspender o único Responsável de uma organização', async () => {
    const { cookie } = await platformMember('superadmin')
    const owner = await regularUser()
    await organizationOwnedBy(owner.id)
    expect(await refusal(await post('/admin/ban-user', { userId: owner.id }, { cookie }))).toEqual({
      status: 400,
      code: 'OWNER_REQUIRED',
    })
  })

  it('suspende o Responsável quando a organização tem outro', async () => {
    const { cookie } = await platformMember('superadmin')
    const owner = await regularUser()
    const coOwner = await regularUser()
    const organizationId = await organizationOwnedBy(owner.id)
    await auth.api.addMember({ body: { userId: coOwner.id, organizationId, role: 'owner' } })
    expect((await post('/admin/ban-user', { userId: owner.id }, { cookie })).status).toBe(200)
  })

  it('não revela a quem não pode banir se a conta é Responsável', async () => {
    const { cookie } = await platformMember('moderator')
    const owner = await regularUser()
    await organizationOwnedBy(owner.id)
    const res = await post('/admin/ban-user', { userId: owner.id }, { cookie })
    expect(res.status).toBe(403)
    expect(await res.json()).not.toMatchObject({ code: 'OWNER_REQUIRED' })
  })
})

describe('BR-016: a equipe não remove contas', () => {
  it('recusa remover uma conta, até para o superadmin', async () => {
    const { cookie } = await platformMember('superadmin')
    const target = await regularUser()
    expect((await post('/admin/remove-user', { userId: target.id }, { cookie })).status).toBe(403)
  })
})
