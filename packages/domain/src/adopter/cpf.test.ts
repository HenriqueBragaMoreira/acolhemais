import { describe, expect, it } from 'vitest'
import { isValidCpf } from './cpf'

describe('BR-071: CPF do adotante', () => {
  it('aceita CPF com os dígitos verificadores certos, com ou sem pontuação', () => {
    expect(isValidCpf('529.982.247-25')).toBe(true)
    expect(isValidCpf('52998224725')).toBe(true)
    expect(isValidCpf('111.444.777-35')).toBe(true)
  })

  it('recusa dígito errado, tamanho errado e dígitos todos iguais', () => {
    expect(isValidCpf('529.982.247-26')).toBe(false)
    expect(isValidCpf('5299822472')).toBe(false)
    expect(isValidCpf('111.111.111-11')).toBe(false)
    expect(isValidCpf('')).toBe(false)
  })
})
