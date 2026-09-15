import { describe, expect, it } from 'vitest'
import { isAdoptable, manualStatusChanges } from './status'

describe('BR-064: status do animal', () => {
  it('rascunho publica; disponível e indisponível se alternam; os dois arquivam', () => {
    expect(manualStatusChanges('draft')).toEqual(['available', 'archived'])
    expect(manualStatusChanges('available')).toEqual(['unavailable', 'archived'])
    expect(manualStatusChanges('unavailable')).toEqual(['available', 'archived'])
  })

  it('em processo e adotado vêm das candidaturas, não da mão da organização', () => {
    expect(manualStatusChanges('in-process')).not.toContain('available')
    expect(manualStatusChanges('adopted')).toEqual([])
    expect(manualStatusChanges('archived')).toEqual([])
  })

  it('só disponível e em processo aparecem na vitrine', () => {
    expect(isAdoptable('available')).toBe(true)
    expect(isAdoptable('in-process')).toBe(true)
    expect(isAdoptable('draft')).toBe(false)
    expect(isAdoptable('unavailable')).toBe(false)
  })
})
