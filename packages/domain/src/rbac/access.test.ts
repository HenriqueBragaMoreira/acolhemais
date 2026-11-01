import { describe, expect, it } from 'vitest'
import { DomainError } from '../errors'
import {
  assertCanAssign,
  assertOwnerRemains,
  can,
  effectivePermissions,
  requiresTwoFactor,
} from './access'
import { isPermission, PERMISSIONS } from './permissions'
import { SYSTEM_ROLES } from './roles'

function errorCode(fn: () => void): string | undefined {
  try {
    fn()
  } catch (error) {
    if (error instanceof DomainError) return error.code
    throw error
  }
  return undefined
}

describe('effectivePermissions', () => {
  it('soma permissões do papel com concessões individuais', () => {
    const perms = effectivePermissions({
      rolePermissions: SYSTEM_ROLES.volunteer,
      grants: ['application.approve'],
    })
    expect(can(perms, 'animal.create')).toBe(true)
    expect(can(perms, 'application.approve')).toBe(true)
    expect(can(perms, 'team.manage')).toBe(false)
  })
})

describe('assertCanAssign', () => {
  const owner = effectivePermissions({ rolePermissions: SYSTEM_ROLES.owner, grants: [] })
  const coordinator = effectivePermissions({
    rolePermissions: SYSTEM_ROLES.coordinator,
    grants: [],
  })

  it('permite ao Responsável conceder qualquer permissão', () => {
    expect(errorCode(() => assertCanAssign(owner, [...PERMISSIONS]))).toBeUndefined()
  })

  it('exige team.manage para conceder', () => {
    expect(errorCode(() => assertCanAssign(coordinator, ['animal.create']))).toBe(
      'rbac.team_manage_required',
    )
  })

  it('impede conceder permissão que o próprio ator não possui', () => {
    const manager = effectivePermissions({
      rolePermissions: SYSTEM_ROLES.volunteer,
      grants: ['team.manage'],
    })
    expect(errorCode(() => assertCanAssign(manager, ['animal.create']))).toBeUndefined()
    expect(errorCode(() => assertCanAssign(manager, ['application.view_sensitive']))).toBe(
      'rbac.cannot_assign_unowned_permission',
    )
  })
})

describe('assertOwnerRemains', () => {
  it('rejeita equipe sem Responsável', () => {
    expect(errorCode(() => assertOwnerRemains(['coordinator', 'volunteer']))).toBe(
      'rbac.owner_required',
    )
    expect(errorCode(() => assertOwnerRemains(['owner', 'volunteer']))).toBeUndefined()
  })
})

describe('requiresTwoFactor', () => {
  it('exige 2FA de quem acessa dados sensíveis', () => {
    expect(requiresTwoFactor(new Set(SYSTEM_ROLES.coordinator))).toBe(true)
    expect(requiresTwoFactor(new Set(SYSTEM_ROLES.volunteer))).toBe(false)
  })
})

describe('isPermission', () => {
  it('reconhece apenas permissões do catálogo', () => {
    expect(isPermission('animal.create')).toBe(true)
    expect(isPermission('admin.everything')).toBe(false)
  })
})
