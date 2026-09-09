import { AxeBuilder } from '@axe-core/playwright'
import { expect, type Page } from '@playwright/test'

/** Regras do axe para WCAG 2.1 nível AA (o alvo do PLANO). */
const WCAG_21_AA = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']

/**
 * Roda o axe na página como está agora e falha listando cada violação. Chamar em cada estado
 * que importa (vazio, com erro, carregando), não só na abertura.
 */
export async function expectAccessible(page: Page) {
  const { violations } = await new AxeBuilder({ page }).withTags(WCAG_21_AA).analyze()
  const summary = violations.map(
    ({ id, impact, help, nodes }) =>
      `${impact ?? 'sem impacto'} · ${id}: ${help} (${nodes.map((node) => node.target.join(' ')).join(', ')})`,
  )
  expect(summary, 'violações de acessibilidade (WCAG 2.1 AA)').toEqual([])
}
