import { schema } from '@acolhemais/db'
import type { Database } from '@acolhemais/db'
import type { PlatformRole } from '@acolhemais/domain'
import { eq } from 'drizzle-orm'
import { cookiesFrom, signUp } from './auth'
import { enableTwoFactor } from './two-factor'

/** Conta comum recém-cadastrada, já em sessão. */
export async function regularUser() {
  const { email, res } = await signUp()
  const { user } = await res.json<{ user: { id: string } }>()
  return { id: user.id, email, cookie: cookiesFrom(res) }
}

/**
 * Cria alguém da equipe da plataforma. O papel é gravado direto no banco, como faria o
 * `auth create-admin` para o primeiro superadmin.
 */
export async function platformMember(db: Database, role: PlatformRole, { twoFactor = true } = {}) {
  const account = await regularUser()
  await db.update(schema.user).set({ role }).where(eq(schema.user.id, account.id))
  const cookie = twoFactor ? (await enableTwoFactor(account.cookie)).cookie : account.cookie
  return { ...account, cookie }
}
