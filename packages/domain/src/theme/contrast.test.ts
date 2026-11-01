import { describe, expect, it } from 'vitest'
import { DomainError } from '../errors'
import {
  contrastRatio,
  darkenUntilReadableOnWhite,
  deriveBrandTheme,
  MIN_TEXT_CONTRAST,
  parseHexColor,
  readableForeground,
} from './contrast'

describe('contrastRatio', () => {
  it('calcula os extremos da escala WCAG', () => {
    expect(contrastRatio('#000000', '#ffffff')).toBeCloseTo(21, 5)
    expect(contrastRatio('#123456', '#123456')).toBeCloseTo(1, 5)
  })
})

describe('parseHexColor', () => {
  it('rejeita cores fora do formato #RRGGBB', () => {
    for (const bad of ['red', '#fff', '#12345g', '123456']) {
      expect(() => parseHexColor(bad)).toThrow(DomainError)
    }
  })
})

describe('readableForeground', () => {
  it('usa texto branco em fundo escuro e preto em fundo claro', () => {
    expect(readableForeground('#1e3a8a')).toBe('#ffffff')
    expect(readableForeground('#fde047')).toBe('#000000')
  })
})

describe('darkenUntilReadableOnWhite', () => {
  it('mantém cores que já são legíveis', () => {
    expect(darkenUntilReadableOnWhite('#1e3a8a')).toBe('#1e3a8a')
  })

  it('escurece cores claras até atingir o contraste AA', () => {
    const adjusted = darkenUntilReadableOnWhite('#fde047')
    expect(adjusted).not.toBe('#fde047')
    expect(contrastRatio(adjusted, '#ffffff')).toBeGreaterThanOrEqual(MIN_TEXT_CONTRAST)
  })
})

describe('deriveBrandTheme', () => {
  it('garante contraste AA em todos os pares de texto/fundo', () => {
    const theme = deriveBrandTheme({ primary: '#FDE047', secondary: '#7C3AED' })
    expect(contrastRatio(theme.primary, theme.primaryForeground)).toBeGreaterThanOrEqual(
      MIN_TEXT_CONTRAST,
    )
    expect(contrastRatio(theme.secondary, theme.secondaryForeground)).toBeGreaterThanOrEqual(
      MIN_TEXT_CONTRAST,
    )
    expect(contrastRatio(theme.primaryText, '#ffffff')).toBeGreaterThanOrEqual(MIN_TEXT_CONTRAST)
  })
})
