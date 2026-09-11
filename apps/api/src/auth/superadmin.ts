import { schema } from '@acolhemais/db'
import type { Database } from '@acolhemais/db'
import { SUPERADMIN_ROLE, assertSuperadminRemains, splitRoles } from '@acolhemais/domain'
import { eq, ilike } from 'drizzle-orm'
import { recordAudit } from '../audit/record'

/**
 * Dá ou tira o papel `superadmin` de uma conta existente (BR-013, FR-011). Só a linha de comando
 * chama isto: pela API, o papel nunca muda. Mantém os outros papéis da conta, recusa tirar o
 * último superadmin e grava a troca na auditoria, como ação do sistema, na mesma transação.
 */
export async function setSuperadmin(db: Database, email: string, grant: boolean) {
  return db.transaction(async (tx) => {
    const [account] = await tx
      .select({ id: schema.user.id, role: schema.user.role })
      .from(schema.user)
      .where(eq(schema.user.email, email.trim().toLowerCase()))
    if (!account) throw new Error(`Nenhuma conta com o e-mail ${email}.`)

    const from = splitRoles(account.role)
    if (from.includes(SUPERADMIN_ROLE) === grant) return { userId: account.id, changed: false }

    if (!grant) {
      const superadmins = await tx
        .select({ id: schema.user.id, role: schema.user.role })
        .from(schema.user)
        .where(ilike(schema.user.role, `%${SUPERADMIN_ROLE}%`))
      assertSuperadminRemains(
        superadmins.filter(
          (u) => u.id !== account.id && splitRoles(u.role).includes(SUPERADMIN_ROLE),
        ).length,
      )
    }

    // `user` é o papel de quem não é da equipe: não se mistura com papéis da plataforma.
    const platform = from.filter((role) => role !== 'user' && role !== SUPERADMIN_ROLE)
    const to = grant ? [...platform, SUPERADMIN_ROLE] : platform
    const role = to.length > 0 ? to.join(',') : 'user'
    await tx.update(schema.user).set({ role }).where(eq(schema.user.id, account.id))
    await recordAudit(
      tx,
      {
        action: 'user.role_changed',
        actorUserId: null,
        targetId: account.id,
        metadata: { from, to: splitRoles(role) },
      },
      { ip: null, requestId: null },
    )
    return { userId: account.id, changed: true }
  })
}
