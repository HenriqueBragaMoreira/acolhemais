import { describe, expect, it } from 'vitest'
import { AUDIT_ACTION_KEYS, auditTargetType, isAuditAction } from './actions'

describe('catálogo da auditoria', () => {
  it('reconhece só as ações do catálogo', () => {
    expect(isAuditAction('member.role_changed')).toBe(true)
    expect(isAuditAction('member.promoted')).toBe(false)
    expect(isAuditAction('toString')).toBe(false)
  })

  it('nomeia as ações como recurso.verbo, em minúsculas', () => {
    for (const action of AUDIT_ACTION_KEYS) {
      expect(action).toMatch(/^[a-z_]+\.[a-z_]+$/)
    }
  })

  it('diz sobre o que é cada ação', () => {
    expect(auditTargetType('user.role_changed')).toBe('user')
    expect(auditTargetType('member.role_changed')).toBe('member')
    expect(auditTargetType('platform_setting.updated')).toBe('platform_setting')
  })
})
