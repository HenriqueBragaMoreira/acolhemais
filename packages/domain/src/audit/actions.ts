/**
 * Catálogo fechado das ações registradas na auditoria (tabela `audit_log`, só de acréscimo).
 * Cada ação diz sobre o que ela é (`target`) e o formato dos detalhes que guarda (`metadata`).
 *
 * Os detalhes guardam ids, papéis e nomes de campos, nunca dados pessoais (nome, e-mail, CPF)
 * nem segredos: a auditoria não pode ser apagada, nem quando o titular exclui a conta.
 * Mudanças aqui exigem revisão de 2 mantenedores (CODEOWNERS).
 */
export const AUDIT_ACTIONS = {
  // Equipe da plataforma e contas, pelo plugin `admin`.
  'user.created': { target: 'user', description: 'Conta criada pela equipe da plataforma' },
  'user.updated': { target: 'user', description: 'Dados da conta alterados pela plataforma' },
  'user.role_changed': { target: 'user', description: 'Papel na plataforma alterado' },
  'user.banned': { target: 'user', description: 'Conta banida' },
  'user.unbanned': { target: 'user', description: 'Banimento retirado' },
  'user.removed': { target: 'user', description: 'Conta removida pela plataforma' },
  'user.sessions_revoked': { target: 'user', description: 'Sessões encerradas pela plataforma' },

  // Organizações, pelo plugin `organization`.
  'organization.updated': { target: 'organization', description: 'Dados da organização alterados' },
  'member.added': { target: 'member', description: 'Membro adicionado à equipe' },
  'member.removed': { target: 'member', description: 'Membro removido da equipe' },
  'member.left': { target: 'member', description: 'Membro saiu da equipe' },
  'member.role_changed': { target: 'member', description: 'Papel do membro alterado' },
  'invitation.created': { target: 'invitation', description: 'Convite enviado' },
  'invitation.canceled': { target: 'invitation', description: 'Convite cancelado' },
  'invitation.accepted': { target: 'invitation', description: 'Convite aceito' },
  'invitation.rejected': { target: 'invitation', description: 'Convite recusado' },
  'organization_role.created': { target: 'organization_role', description: 'Papel criado' },
  'organization_role.updated': { target: 'organization_role', description: 'Papel alterado' },
  'organization_role.deleted': { target: 'organization_role', description: 'Papel apagado' },

  // Segurança da própria conta.
  'account.two_factor_enabled': { target: 'user', description: '2FA ativado' },
  'account.two_factor_disabled': { target: 'user', description: '2FA desativado' },
  'account.backup_codes_regenerated': {
    target: 'user',
    description: 'Códigos de recuperação do 2FA gerados de novo',
  },
  'account.password_changed': { target: 'user', description: 'Senha trocada' },
  'account.provider_linked': { target: 'user', description: 'Login externo vinculado' },
  'account.provider_unlinked': { target: 'user', description: 'Login externo desvinculado' },

  // Parâmetros da plataforma.
  'platform_setting.updated': {
    target: 'platform_setting',
    description: 'Parâmetro da plataforma alterado',
  },
} as const satisfies Record<string, { target: string; description: string }>

export type AuditAction = keyof typeof AUDIT_ACTIONS
export type AuditTargetType = (typeof AUDIT_ACTIONS)[AuditAction]['target']

type Empty = Record<string, never>
type PermissionMap = Record<string, readonly string[]>

/** Detalhes guardados em cada ação. */
export type AuditMetadata = {
  'user.created': { roles: string[] }
  'user.updated': { fields: string[] }
  'user.role_changed': { from: string[]; to: string[] }
  'user.banned': { reason: string | null; expiresAt: string | null }
  'user.unbanned': Empty
  'user.removed': Empty
  'user.sessions_revoked': { scope: 'all' | 'one' }
  'organization.updated': { fields: string[] }
  'member.added': { userId: string; role: string }
  'member.removed': { userId: string; role: string }
  'member.left': { userId: string; role: string }
  'member.role_changed': { userId: string; from: string; to: string }
  'invitation.created': { role: string }
  'invitation.canceled': Empty
  'invitation.accepted': { role: string; memberId: string | null }
  'invitation.rejected': Empty
  'organization_role.created': { role: string; permission: PermissionMap }
  'organization_role.updated': {
    role: string
    renamedTo: string | null
    permission: PermissionMap | null
  }
  'organization_role.deleted': { role: string }
  'account.two_factor_enabled': Empty
  'account.two_factor_disabled': Empty
  'account.backup_codes_regenerated': Empty
  'account.password_changed': { revokedOtherSessions: boolean }
  'account.provider_linked': { provider: string }
  'account.provider_unlinked': { provider: string }
  'platform_setting.updated': { from: unknown; to: unknown }
}

/** Um registro da auditoria, antes de gravado. */
export type AuditEntry<A extends AuditAction = AuditAction> = {
  [K in A]: {
    action: K
    /** Quem fez: `null` quando foi o próprio sistema (tarefa agendada, chamada interna). */
    actorUserId: string | null
    /** Organização afetada, quando a ação é de uma ONG. */
    organizationId?: string | null
    targetId: string
    metadata: AuditMetadata[K]
  }
}[A]

export const AUDIT_ACTION_KEYS = Object.keys(AUDIT_ACTIONS) as AuditAction[]

export function isAuditAction(value: string): value is AuditAction {
  return Object.hasOwn(AUDIT_ACTIONS, value)
}

/** Sobre o que é a ação (usuário, membro, convite...), para filtrar a auditoria por alvo. */
export function auditTargetType(action: AuditAction): AuditTargetType {
  return AUDIT_ACTIONS[action].target
}
