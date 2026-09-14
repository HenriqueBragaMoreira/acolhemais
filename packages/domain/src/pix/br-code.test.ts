import { describe, expect, it } from 'vitest'
import { pixBrCode } from './br-code'

describe('BR-049: PIX copia e cola da organização', () => {
  it('gera o exemplo do manual do Banco Central', () => {
    expect(
      pixBrCode({
        key: '123e4567-e12b-12d1-a456-426655440000',
        name: 'Fulano de Tal',
        city: 'BRASILIA',
      }),
    ).toBe(
      '00020126580014br.gov.bcb.pix0136123e4567-e12b-12d1-a456-4266554400005204000053039865802BR5913Fulano de Tal6008BRASILIA62070503***63041D3D',
    )
  })

  it('tira os acentos e corta nome e cidade no tamanho do padrão', () => {
    const code = pixBrCode({
      key: 'doacoes@exemplo.org',
      name: 'Associação Protetora dos Animais de São José',
      city: 'Florianópolis, SC',
    })
    expect(code).toContain('5924Associacao Protetora dos6014Florianopolis,62')
    expect(code).toMatch(/6304[0-9A-F]{4}$/)
  })
})
