import { describe, expect, it } from 'vitest'
import { isActiveStage, nextStage, stageMoves } from './stages'

describe('BR-076: etapas da candidatura', () => {
  it('segue o caminho Recebida → Em análise → Entrevista/Visita → Aprovada', () => {
    expect(nextStage('received')).toBe('reviewing')
    expect(nextStage('reviewing')).toBe('interview')
    expect(nextStage('interview')).toBe('approved')
    expect(nextStage('approved')).toBeNull()
  })

  it('move para qualquer outra etapa do caminho enquanto está ativa', () => {
    expect(stageMoves('interview')).toEqual(['received', 'reviewing', 'approved'])
    expect(stageMoves('awaiting-confirmation')).toEqual([
      'received',
      'reviewing',
      'interview',
      'approved',
    ])
  })

  it('terminal não volta', () => {
    for (const stage of ['completed', 'refused', 'withdrawn', 'expired', 'cancelled'] as const) {
      expect(isActiveStage(stage)).toBe(false)
      expect(stageMoves(stage)).toEqual([])
      expect(nextStage(stage)).toBeNull()
    }
  })
})
