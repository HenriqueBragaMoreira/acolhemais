import { expect, test } from '@playwright/test'
import { expectAccessible } from '../src/a11y'

test('a vitrine do design system passa no axe nos dois temas', async ({ page }) => {
  await page.goto('/dev/ui')

  await expect(page.getByRole('heading', { level: 2, name: 'Tema da plataforma' })).toBeVisible()
  await expect(
    page.getByRole('heading', { level: 2, name: 'Tema de uma ONG (exemplo)' }),
  ).toBeVisible()
  await expectAccessible(page)
})
