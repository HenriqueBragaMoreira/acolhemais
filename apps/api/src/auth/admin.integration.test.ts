import { createDb, schema } from '@acolhemais/db'
import type { PlatformRole } from '@acolhemais/domain'
import { eq } from 'drizzle-orm'
import { afterAll, describe, expect, inject, it } from 'vitest'
import { cookiesFrom, get, post, signUp } from '../test/auth'
import { enableTwoFactor } from '../test/two-factor'

const db = createDb(inject('databaseUrl'))

afterAll(async () => {
  await db.$client.end()
})

/**
 * Cria alguém da equipe da plataforma. O papel é gravado direto no banco, como faria o
 * `auth create-admin` para o primeiro superadmin.
 */
async function platformMember(role: PlatformRole, { twoFactor = true } = {}) {
  const { email, res } = await signUp()
  const { user } = await res.json<{ user: { id: string } }>()
  await db.update(schema.user).set({ role }).where(eq(schema.user.email, email))
  const cookie = cookiesFrom(res)
  return { id: user.id, cookie: twoFactor ? (await enableTwoFactor(cookie)).cookie : cookie }
}

async function regularUser() {
  const { res } = await signUp()
  const { user } = await res.json<{ user: { id: string } }>()
  return { id: user.id, cookie: cookiesFrom(res) }
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
