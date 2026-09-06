import { createDb, schema } from '@acolhemais/db'
import type { SystemRoleKey } from '@acolhemais/domain'
import { asc, eq } from 'drizzle-orm'
import { afterAll, afterEach, describe, expect, inject, it, vi } from 'vitest'
import { loadConfig } from '../env'
import { platformMember, regularUser } from '../test/accounts'
import { cookiesFrom, env, password, post, uniqueEmail } from '../test/auth'
import { signInWithGoogle } from '../test/google'
import { totpCode } from '../test/totp'
import { enableTwoFactor } from '../test/two-factor'
import { createAuth } from '.'

const db = createDb(inject('databaseUrl'))
// Instância usada no servidor, para criar organizações como a plataforma fará (Fase 1).
const auth = createAuth({ config: loadConfig(env), db })

afterEach(() => {
  vi.restoreAllMocks()
})

afterAll(async () => {
  await db.$client.end()
})

/** Registros da auditoria sobre um alvo, do mais antigo ao mais novo. */
function entriesAbout(targetId: string) {
  return db
    .select()
    .from(schema.auditLog)
    .where(eq(schema.auditLog.targetId, targetId))
    .orderBy(asc(schema.auditLog.id))
}

async function organizationWithOwner() {
  const owner = await regularUser()
  const organization = await auth.api.createOrganization({
    body: {
      name: 'ONG de Teste',
      slug: `ong-${crypto.randomUUID().slice(0, 8)}`,
      userId: owner.id,
    },
  })
  if (!organization) throw new Error('organização não criada')
  return { organizationId: organization.id, owner }
}

describe('auditoria das ações do Better Auth', () => {
  it('registra a troca de papel na plataforma, com autor, antes e depois e IP', async () => {
    const admin = await platformMember(db, 'superadmin')
    const target = await regularUser()

    const res = await post(
      '/admin/set-role',
      { userId: target.id, role: 'moderator' },
      { cookie: admin.cookie, 'cf-connecting-ip': '203.0.113.7', 'cf-ray': '8f00aa11bb22-GRU' },
    )
    expect(res.status).toBe(200)

    const [entry] = await entriesAbout(target.id)
    expect(entry).toMatchObject({
      action: 'user.role_changed',
      actorUserId: admin.id,
      targetType: 'user',
      metadata: { from: ['user'], to: ['moderator'] },
      ip: '203.0.113.7',
      requestId: '8f00aa11bb22-GRU',
    })
  })

  it('registra banimento e desbanimento', async () => {
    const admin = await platformMember(db, 'superadmin')
    const target = await regularUser()

    await post(
      '/admin/ban-user',
      { userId: target.id, banReason: 'Venda de animais' },
      { cookie: admin.cookie },
    )
    await post('/admin/unban-user', { userId: target.id }, { cookie: admin.cookie })

    const entries = await entriesAbout(target.id)
    expect(entries.map((entry) => entry.action)).toEqual(['user.banned', 'user.unbanned'])
    expect(entries[0]?.metadata).toEqual({ reason: 'Venda de animais', expiresAt: null })
  })

  it('não registra ações recusadas', async () => {
    const moderator = await platformMember(db, 'moderator')
    const target = await regularUser()

    const res = await post(
      '/admin/set-role',
      { userId: target.id, role: 'superadmin' },
      { cookie: moderator.cookie },
    )
    expect(res.status).toBe(403)
    expect(await entriesAbout(target.id)).toEqual([])
  })

  it('registra a equipe da ONG: convite, troca de papel e papéis próprios', async () => {
    const { organizationId, owner } = await organizationWithOwner()
    const volunteer = await regularUser()
    const member = await auth.api.addMember({
      body: { userId: volunteer.id, organizationId, role: 'volunteer' as SystemRoleKey },
    })
    if (!member) throw new Error('membro não adicionado')

    const invite = await post(
      '/organization/invite-member',
      { organizationId, email: uniqueEmail(), role: 'coordinator' },
      { cookie: owner.cookie },
    )
    const invitation = await invite.json<{ id: string }>()
    await post(
      '/organization/update-member-role',
      { organizationId, memberId: member.id, role: 'coordinator' },
      { cookie: owner.cookie },
    )
    const created = await post(
      '/organization/create-role',
      { organizationId, role: 'fotografo', permission: { animal: ['create'] } },
      { cookie: owner.cookie },
    )
    const { roleData } = await created.json<{ roleData: { id: string } }>()
    await post(
      '/organization/delete-role',
      { organizationId, roleName: 'fotografo' },
      { cookie: owner.cookie },
    )

    // `addMember` é só do servidor: quem o chama registra a própria auditoria.
    expect(await entriesAbout(member.id)).toMatchObject([
      {
        action: 'member.role_changed',
        actorUserId: owner.id,
        organizationId,
        metadata: { userId: volunteer.id, from: 'volunteer', to: 'coordinator' },
      },
    ])
    expect(await entriesAbout(invitation.id)).toMatchObject([
      { action: 'invitation.created', actorUserId: owner.id, metadata: { role: 'coordinator' } },
    ])
    expect(await entriesAbout(roleData.id)).toMatchObject([
      {
        action: 'organization_role.created',
        metadata: { role: 'fotografo', permission: { animal: ['create'] } },
      },
      { action: 'organization_role.deleted', metadata: { role: 'fotografo' } },
    ])
  })

  it('registra a ativação do 2FA uma vez só, e não cada login com código', async () => {
    const user = await regularUser()
    const { totpURI } = await enableTwoFactor(user.cookie)

    const signIn = await post('/sign-in/email', { email: user.email, password })
    expect(await signIn.json()).toMatchObject({ twoFactorRedirect: true })
    const verify = await post(
      '/two-factor/verify-totp',
      { code: await totpCode(totpURI, 1) },
      { cookie: cookiesFrom(signIn) },
    )
    expect(verify.status).toBe(200)

    const entries = await entriesAbout(user.id)
    expect(entries.map((entry) => entry.action)).toEqual(['account.two_factor_enabled'])
    expect(entries[0]?.actorUserId).toBe(user.id)
  })

  it('registra a troca de senha', async () => {
    const user = await regularUser()
    const res = await post(
      '/change-password',
      {
        currentPassword: password,
        newPassword: 'outra-senha-bem-longa',
        revokeOtherSessions: true,
      },
      { cookie: user.cookie },
    )
    expect(res.status).toBe(200)

    expect(await entriesAbout(user.id)).toMatchObject([
      { action: 'account.password_changed', metadata: { revokedOtherSessions: true } },
    ])
  })

  it('registra o vínculo do login pelo Google', async () => {
    const email = uniqueEmail()
    const res = await signInWithGoogle({ email })
    expect(res.status).toBe(302)

    const [user] = await db.select().from(schema.user).where(eq(schema.user.email, email))
    expect(await entriesAbout(user?.id ?? '')).toMatchObject([
      { action: 'account.provider_linked', metadata: { provider: 'google' } },
    ])
  })
})
