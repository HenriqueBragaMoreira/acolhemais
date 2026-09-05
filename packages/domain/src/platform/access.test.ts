import { describe, expect, it } from 'vitest'
import { PLATFORM_ROLES, platformRequiresTwoFactor, platformRolesOf } from './access'

describe('papéis da plataforma', () => {
  it('não deixam ninguém personificar usuários nem trocar senha ou e-mail de outra pessoa', () => {
    for (const grants of Object.values(PLATFORM_ROLES)) {
      const userActions: readonly string[] = grants.user
      expect(userActions).not.toContain('impersonate')
      expect(userActions).not.toContain('impersonate-admins')
      expect(userActions).not.toContain('set-password')
      expect(userActions).not.toContain('set-email')
    }
  })

  it('deixam o suporte só ler, e sem ver ocorrências', () => {
    const support: Record<string, readonly string[]> = PLATFORM_ROLES.support
    for (const actions of Object.values(support)) {
      expect(actions.every((action) => ['list', 'get', 'view'].includes(action))).toBe(true)
    }
    expect(support.incident).toBeUndefined()
  })

  it('leem os papéis guardados separados por vírgula', () => {
    expect(platformRolesOf('user,moderator')).toEqual(['moderator'])
    expect(platformRolesOf('superadmin, support')).toEqual(['superadmin', 'support'])
    expect(platformRolesOf(null)).toEqual([])
  })

  it('exigem 2FA de toda a equipe da plataforma', () => {
    expect(platformRequiresTwoFactor('support')).toBe(true)
    expect(platformRequiresTwoFactor('user')).toBe(false)
    expect(platformRequiresTwoFactor(undefined)).toBe(false)
  })
})
