import type { Page } from '@playwright/test'

/**
 * Mensagem de erro do envio (senha errada, código inválido…), anunciada como alerta abaixo do
 * último campo. Filtra pelo componente do design system porque o Next também mantém um
 * `role="alert"` na página (o anunciador de mudança de rota).
 */
export function formError(page: Page) {
  return page.getByRole('alert').and(page.locator('[data-slot="field-error"]'))
}
