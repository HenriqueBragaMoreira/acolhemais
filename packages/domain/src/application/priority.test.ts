import { describe, expect, it } from 'vitest'
import { byPriority, type PrioritizedApplication } from './priority'

function application(
  name: string,
  overrides: Partial<PrioritizedApplication>,
): PrioritizedApplication & { name: string } {
  return { name, badges: [], verifiedAccount: false, sentAt: '2026-11-10T10:00:00Z', ...overrides }
}

describe('BR-082: ordem na visão da organização', () => {
  it('histórico positivo, conta verificada, sem conta e, por último, selo Atenção', () => {
    const sorted = [
      application('sem conta', {}),
      application('atenção com histórico', { badges: ['approved-adopter', 'attention'] }),
      application('verificada', { verifiedAccount: true }),
      application('histórico positivo', { badges: ['approved-adopter'], verifiedAccount: true }),
    ].toSorted(byPriority)

    expect(sorted.map(({ name }) => name)).toEqual([
      'histórico positivo',
      'verificada',
      'sem conta',
      'atenção com histórico',
    ])
  })

  it('no mesmo nível, quem enviou antes vem primeiro', () => {
    const sorted = [
      application('depois', { sentAt: '2026-11-11T09:00:00Z' }),
      application('antes', { sentAt: '2026-11-09T09:00:00Z' }),
    ].toSorted(byPriority)

    expect(sorted.map(({ name }) => name)).toEqual(['antes', 'depois'])
  })
})
