import { DomainError } from '../errors'
import { SENSITIVE_PERMISSIONS, type Permission } from './permissions'
import { OWNER_ROLE } from './roles'

/** Acesso de um membro: permissões do papel + concessões individuais (só aditivas). */
export interface MemberAccess {
  readonly rolePermissions: readonly Permission[]
  readonly grants: readonly Permission[]
}

export function effectivePermissions(access: MemberAccess): ReadonlySet<Permission> {
  return new Set([...access.rolePermissions, ...access.grants])
}

export function can(permissions: ReadonlySet<Permission>, permission: Permission): boolean {
  return permissions.has(permission)
}

export function requiresTwoFactor(permissions: ReadonlySet<Permission>): boolean {
  return SENSITIVE_PERMISSIONS.some((p) => permissions.has(p))
}

/** Ações sobre a equipe que mexem com as permissões de alguém (BR-054). */
export type TeamAction = 'invite' | 'change_role' | 'remove' | 'grant'

/** Permissão que cada ação exige de quem age, além de ter as permissões envolvidas. */
const TEAM_ACTION_PERMISSION: Readonly<Record<TeamAction, Permission>> = {
  invite: 'invitation.create',
  change_role: 'member.update',
  remove: 'member.delete',
  grant: 'member.update',
}

/**
 * Valida se `actor` pode fazer `action` envolvendo `permissions` (BR-054): as do papel do
 * convite, as do papel antigo e do novo, as do membro removido ou a concedida. Além da
 * permissão da ação, ninguém mexe com o que não possui (impede escalada de privilégio).
 */
export function assertCanAssign(
  actor: ReadonlySet<Permission>,
  action: TeamAction,
  permissions: Iterable<Permission>,
): void {
  if (!actor.has(TEAM_ACTION_PERMISSION[action])) {
    throw new DomainError('TEAM_MANAGE_REQUIRED', 'Actor cannot manage the team')
  }
  const missing = [...permissions].filter((p) => !actor.has(p))
  if (missing.length > 0) {
    throw new DomainError(
      'CANNOT_ASSIGN_UNOWNED_PERMISSION',
      `Actor cannot assign permissions it does not hold: ${missing.join(', ')}`,
    )
  }
}

/** Garante que, após uma mudança na equipe, ainda exista ao menos um Responsável. */
export function assertOwnerRemains(memberRoleKeys: readonly string[]): void {
  if (!memberRoleKeys.includes(OWNER_ROLE)) {
    throw new DomainError('OWNER_REQUIRED', 'Organization must keep at least one owner')
  }
}
