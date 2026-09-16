import { describe, expect, it } from 'vitest'
import { DomainError } from '../errors'
import {
  assertCanAssign,
  assertOwnerRemains,
  can,
  effectivePermissions,
  requiresTwoFactor,
  type TeamAction,
} from './access'
import {
  fromStatements,
  isPermission,
  PERMISSIONS,
  toStatements,
  type Permission,
} from './permissions'
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
    expect(can(perms, 'member.update')).toBe(false)
  })
})

function actorWith(...permissions: Permission[]) {
  return effectivePermissions({ rolePermissions: SYSTEM_ROLES.volunteer, grants: permissions })
}

describe('BR-054: assertCanAssign', () => {
  const owner = effectivePermissions({ rolePermissions: SYSTEM_ROLES.owner, grants: [] })
  const coordinator = effectivePermissions({
    rolePermissions: SYSTEM_ROLES.coordinator,
    grants: [],
  })
  it('permite ao Responsável conceder qualquer permissão, menos apagar a organização', () => {
    const assignable = PERMISSIONS.filter((p) => p !== 'organization.delete')
    expect(errorCode(() => assertCanAssign(owner, 'grant', assignable))).toBeUndefined()
    expect(errorCode(() => assertCanAssign(owner, 'grant', ['organization.delete']))).toBe(
      'CANNOT_ASSIGN_UNOWNED_PERMISSION',
    )
  })

  it('exige a permissão de cada ação', () => {
    const cases: [TeamAction, Permission][] = [
      ['invite', 'invitation.create'],
      ['change_role', 'member.update'],
      ['remove', 'member.delete'],
      ['grant', 'member.update'],
    ]
    for (const [action, required] of cases) {
      expect(errorCode(() => assertCanAssign(coordinator, action, ['animal.create']))).toBe(
        'TEAM_MANAGE_REQUIRED',
      )
      expect(
        errorCode(() => assertCanAssign(actorWith(required), action, ['animal.create'])),
      ).toBeUndefined()
    }
  })

  it('convida sem precisar trocar papéis', () => {
    expect(
      errorCode(() => assertCanAssign(actorWith('invitation.create'), 'invite', ['animal.update'])),
    ).toBeUndefined()
  })

  it('impede envolver permissão que o próprio ator não possui', () => {
    const manager = actorWith('invitation.create', 'member.update', 'member.delete')
    for (const action of ['invite', 'change_role', 'remove', 'grant'] as const) {
      expect(errorCode(() => assertCanAssign(manager, action, ['animal.create']))).toBeUndefined()
      expect(
        errorCode(() => assertCanAssign(manager, action, ['application.view_sensitive'])),
      ).toBe('CANNOT_ASSIGN_UNOWNED_PERMISSION')
    }
  })
})

describe('assertOwnerRemains', () => {
  it('rejeita equipe sem Responsável', () => {
    expect(errorCode(() => assertOwnerRemains(['coordinator', 'volunteer']))).toBe('OWNER_REQUIRED')
    expect(errorCode(() => assertOwnerRemains(['owner', 'volunteer']))).toBeUndefined()
  })
})

describe('BR-057: requiresTwoFactor', () => {
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

describe('fromStatements', () => {
  it('lê o formato do Better Auth e ignora o que não está no catálogo', () => {
    expect(
      fromStatements({ animal: ['create', 'fly'], member: ['update'], admin: ['everything'] }),
    ).toEqual(['animal.create', 'member.update'])
    expect(fromStatements(null)).toEqual([])
    expect(fromStatements({ animal: 'create' })).toEqual([])
  })
})

describe('toStatements', () => {
  it('converte para o formato recurso → ações do Better Auth', () => {
    expect(toStatements(['animal.create', 'animal.update', 'member.update'])).toEqual({
      animal: ['create', 'update'],
      member: ['update'],
    })
  })
})
