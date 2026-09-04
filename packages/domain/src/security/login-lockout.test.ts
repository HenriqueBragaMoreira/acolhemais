import { describe, expect, it } from 'vitest'
import { loginLockoutMs } from './login-lockout'

const MINUTE = 60 * 1000

describe('loginLockoutMs', () => {
  it('não bloqueia antes de 5 senhas erradas seguidas', () => {
    expect(loginLockoutMs(0)).toBe(0)
    expect(loginLockoutMs(4)).toBe(0)
  })

  it('bloqueia por mais tempo conforme os erros se acumulam', () => {
    expect(loginLockoutMs(5)).toBe(1 * MINUTE)
    expect(loginLockoutMs(9)).toBe(1 * MINUTE)
    expect(loginLockoutMs(10)).toBe(15 * MINUTE)
    expect(loginLockoutMs(14)).toBe(15 * MINUTE)
    expect(loginLockoutMs(15)).toBe(60 * MINUTE)
    expect(loginLockoutMs(100)).toBe(60 * MINUTE)
  })
})
