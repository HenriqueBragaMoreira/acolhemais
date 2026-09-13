import { expect, type Page, test } from '@playwright/test'
import { expectAccessible } from '../src/a11y'

// shortcut: a vitrine ainda lê os dados fictícios de apps/web/src/services/animals; quando ler a
// API, estes testes passam a semear os animais no banco.

function gallery(page: Page) {
  return page.getByRole('region', { name: 'Esperando um lar' })
}

test.describe('FR-050: vitrine de animais', () => {
  test('mostra quem espera há mais tempo primeiro e passa no axe', async ({ page }) => {
    await page.goto('/')
    await expect(
      page.getByRole('heading', { level: 1, name: 'Encontre um animal para adotar' }),
    ).toBeVisible()
    await expect(gallery(page).getByText('17 animais')).toBeVisible()
    await expect(gallery(page).getByRole('link').first()).toContainText('Seu Chico')
    await expectAccessible(page)

    await page.getByRole('combobox', { name: 'Ordenar por' }).selectOption('Mais recentes')
    await expect(page).toHaveURL(/sort=newest/)
    await expect(gallery(page).getByRole('link').first()).toContainText('Paçoca')
  })

  test('carrega o resto com "Ver mais animais"', async ({ page }) => {
    await page.goto('/')
    await expect(gallery(page).getByRole('link')).toHaveCount(15)

    await page.getByRole('button', { name: 'Ver mais animais' }).click()
    await expect(gallery(page).getByRole('link')).toHaveCount(17)
    await expect(page.getByRole('button', { name: 'Ver mais animais' })).toBeHidden()
  })

  test('filtra por cidade, sem acento, e por espécie', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('combobox', { name: 'Cidade' }).fill('goiania')
    await page.getByRole('button', { name: 'Buscar' }).click()
    await expect(page).toHaveURL(/city=goiania/)
    await expect(gallery(page).getByText('4 animais')).toBeVisible()

    await page.getByRole('combobox', { name: 'Espécie' }).selectOption('Gatos')
    await expect(page).toHaveURL(/species=cat/)
    await expect(gallery(page).getByRole('link')).toHaveCount(1)
    await expect(gallery(page).getByRole('link')).toContainText('Zeca')
  })

  test('"Mais filtros" aplica na hora e conta os filtros ativos', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: 'Mais filtros' }).click()
    await page.getByRole('checkbox', { name: 'Idoso (8 anos ou mais)' }).click()
    await expect(page).toHaveURL(/age=senior/)
    await expect(gallery(page).getByText('2 animais')).toBeVisible()
    await expect(page.getByRole('button', { name: /Mais filtros.*1 filtro ativo/ })).toBeVisible()
    await expectAccessible(page)

    await page.getByRole('button', { name: 'Limpar filtros' }).click()
    await expect(gallery(page).getByText('17 animais')).toBeVisible()
  })

  test('no celular, "Ver animais" fecha os filtros e leva à galeria', async ({
    page,
    isMobile,
  }) => {
    test.skip(!isMobile, 'o botão só existe no celular')
    await page.goto('/')
    await page.getByRole('button', { name: 'Mais filtros' }).click()
    await page.getByRole('checkbox', { name: 'Castrado' }).click()
    await expect(page).toHaveURL(/castrated=true/)

    await page.getByRole('button', { name: 'Ver animais' }).click()
    await expect(page.getByRole('heading', { name: 'Esperando um lar' })).toBeFocused()
    await expect(page.getByRole('checkbox', { name: 'Castrado' })).toBeHidden()
    await expect(gallery(page).getByText('14 animais')).toBeInViewport()
  })

  test('sem resultado, explica e oferece limpar os filtros', async ({ page }) => {
    await page.goto('/?city=Manaus')
    await expect(page.getByText('Nenhum animal com esses filtros')).toBeVisible()
    await expectAccessible(page)

    await gallery(page).getByRole('button', { name: 'Limpar filtros' }).click()
    await expect(page).toHaveURL(/\/$/)
    await expect(gallery(page).getByText('17 animais')).toBeVisible()
  })
})

test.describe('BR-120: o que aparece na vitrine', () => {
  test('animal em processo de adoção aparece com o aviso', async ({ page }) => {
    await page.goto('/')
    await expect(gallery(page).getByRole('link', { name: /Pantera/ })).toContainText(
      'Em processo de adoção',
    )
  })
})
