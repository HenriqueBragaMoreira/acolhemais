import { describe, expect, it } from 'vitest'
import { DomainError } from '../errors'
import { isPlatformSettingKey, parsePlatformSetting, resolvePlatformSettings } from './settings'

function errorOf(fn: () => unknown) {
  try {
    fn()
  } catch (error) {
    return error
  }
  throw new Error('não lançou erro')
}

describe('parâmetros da plataforma', () => {
  it('usa os padrões do PLANO quando nada foi alterado', () => {
    expect(resolvePlatformSettings({})).toEqual({
      maxActiveApplications: 3,
      applicationResponseDays: 7,
      incidentDefenseDays: 15,
      minorIncidentExpiryMonths: 24,
      ineligibilityReviewMonths: 60,
      postAdoptionCheckinDays: [30, 90, 180],
      refusalResubmissionDays: 30,
      adoptionFeeCapCents: null,
    })
  })

  it('aplica os valores alterados sobre os padrões', () => {
    const settings = resolvePlatformSettings({
      maxActiveApplications: 2,
      adoptionFeeCapCents: 15000,
    })
    expect(settings.maxActiveApplications).toBe(2)
    expect(settings.adoptionFeeCapCents).toBe(15000)
    expect(settings.incidentDefenseDays).toBe(15)
  })

  it('ignora chaves que não são parâmetros', () => {
    expect(resolvePlatformSettings({ removido: 1 })).not.toHaveProperty('removido')
    expect(isPlatformSettingKey('maxActiveApplications')).toBe(true)
    expect(isPlatformSettingKey('constructor')).toBe(false)
  })

  it('recusa números fora dos limites ou não inteiros', () => {
    expect(parsePlatformSetting('maxActiveApplications', 10)).toBe(10)
    expect(() => parsePlatformSetting('maxActiveApplications', 0)).toThrow(DomainError)
    expect(() => parsePlatformSetting('maxActiveApplications', 11)).toThrow(DomainError)
    expect(() => parsePlatformSetting('maxActiveApplications', 2.5)).toThrow(DomainError)
    expect(() => parsePlatformSetting('maxActiveApplications', '3')).toThrow(DomainError)
    expect(errorOf(() => parsePlatformSetting('maxActiveApplications', 0))).toMatchObject({
      code: 'INVALID_PLATFORM_SETTING',
    })
  })

  it('só aceita "não definido" onde o parâmetro permite', () => {
    expect(parsePlatformSetting('adoptionFeeCapCents', null)).toBeNull()
    expect(() => parsePlatformSetting('incidentDefenseDays', null)).toThrow(DomainError)
  })

  it('exige lembretes em ordem crescente e sem repetição', () => {
    expect(parsePlatformSetting('postAdoptionCheckinDays', [15, 60])).toEqual([15, 60])
    expect(() => parsePlatformSetting('postAdoptionCheckinDays', [90, 30])).toThrow(DomainError)
    expect(() => parsePlatformSetting('postAdoptionCheckinDays', [30, 30])).toThrow(DomainError)
    expect(() => parsePlatformSetting('postAdoptionCheckinDays', [])).toThrow(DomainError)
    expect(() => parsePlatformSetting('postAdoptionCheckinDays', 30)).toThrow(DomainError)
  })

  it('falha em vez de cair no padrão quando um valor guardado ficou inválido', () => {
    expect(() => resolvePlatformSettings({ incidentDefenseDays: 1 })).toThrow(DomainError)
  })

  it('não deixa alterar o padrão por referência', () => {
    resolvePlatformSettings({}).postAdoptionCheckinDays.push(365)
    expect(resolvePlatformSettings({}).postAdoptionCheckinDays).toEqual([30, 90, 180])
  })
})
