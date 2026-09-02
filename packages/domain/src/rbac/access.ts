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

/**
 * Valida se `actor` pode atribuir `permissions` a alguém — seja como concessão
 * individual, ao montar um papel customizado ou ao atribuir um papel existente.
 * Ninguém concede o que não possui (impede escalonamento de privilégio).
 */
export function assertCanAssign(
  actor: ReadonlySet<Permission>,
  permissions: readonly Permission[],
): void {
  if (!actor.has('team.manage')) {
    throw new DomainError('rbac.team_manage_required', 'Actor lacks team.manage')
  }
  const missing = permissions.filter((p) => !actor.has(p))
  if (missing.length > 0) {
    throw new DomainError(
      'rbac.cannot_assign_unowned_permission',
      `Actor cannot assign permissions it does not hold: ${missing.join(', ')}`,
    )
  }
}

/** Garante que, após uma mudança na equipe, ainda exista ao menos um Responsável. */
export function assertOwnerRemains(memberRoleKeys: readonly string[]): void {
  if (!memberRoleKeys.includes(OWNER_ROLE)) {
    throw new DomainError('rbac.owner_required', 'Organization must keep at least one owner')
  }
}
