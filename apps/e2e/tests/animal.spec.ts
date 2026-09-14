import { expect, test } from '@playwright/test'
import { expectAccessible } from '../src/a11y'

// shortcut: a página lê os dados fictícios de apps/web/src/services/animals; quando ler a API,
// estes testes passam a semear os animais no banco.

test.describe('FR-050: página do animal', () => {
  test('abre pelo cartão da galeria, com dados, taxa, organização e o "Quero adotar"', async ({
    page,
  }) => {
    await page.goto('/')
    await page.getByRole('link', { name: /Barão/ }).click()

    await expect(page).toHaveURL(/\/animais\/barao$/)
    await expect(page.getByRole('heading', { level: 1, name: 'Barão' })).toBeVisible()
    await expect(page.getByText('R$ 80,00')).toBeVisible()
    await expect(page.getByText('Cobre: Castração, vacinas e vermífugo.')).toBeVisible()
    await expect(page.getByRole('link', { name: 'Abrigo Cantinho do Bigode' })).toHaveAttribute(
      'href',
      '/ong/abrigo-cantinho-do-bigode',
    )
    await expect(page.getByText('Toma um comprimido para o coração')).toBeVisible()
    await expect(
      page.getByRole('link', { name: 'Quero adotar' }).filter({ visible: true }),
    ).toHaveAttribute('href', '/animais/barao/candidatura')
    await expectAccessible(page)
  })

  test('mostra mais animais da organização e animais parecidos de outras', async ({ page }) => {
    await page.goto('/animais/barao')
    const sameOrganization = page.getByRole('region', {
      name: 'Mais animais do Abrigo Cantinho do Bigode',
    })
    await expect(sameOrganization.getByRole('link').first()).toBeVisible()
    await expect(sameOrganization.getByRole('link', { name: /Barão/ })).toHaveCount(0)
    await expect(
      page.getByRole('region', { name: 'Parecidos com Barão' }).getByRole('link').first(),
    ).toBeVisible()
  })

  test('troca de foto pelas miniaturas e pelas setas', async ({ page }) => {
    await page.goto('/animais/pingo')
    await expect(page.getByRole('img', { name: 'Foto 1 de 3 de Pingo' })).toBeVisible()

    await page.getByRole('button', { name: 'Ver a foto 3 de 3' }).click()
    await expect(page.getByRole('img', { name: 'Foto 3 de 3 de Pingo' })).toBeVisible()
    await page.getByRole('button', { name: 'Próxima foto' }).click()
    await expect(page.getByRole('img', { name: 'Foto 1 de 3 de Pingo' })).toBeVisible()
    // Clique na borda de cima da seta: antes o botão descia ao ser pressionado e o clique se perdia.
    await page.getByRole('button', { name: 'Próxima foto' }).click({ position: { x: 20, y: 3 } })
    await expect(page.getByRole('img', { name: 'Foto 2 de 3 de Pingo' })).toBeVisible()
  })

  test('animal sem taxa diz isso com todas as letras', async ({ page }) => {
    await page.goto('/animais/pintada')
    await expect(page.getByText('Sem taxa')).toBeVisible()
  })

  test('endereço de animal que não existe mostra "não encontrada"', async ({ page }) => {
    await page.goto('/animais/nao-existe')
    await expect(page.getByRole('heading', { name: 'Página não encontrada' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Ver os animais para adoção' })).toHaveAttribute(
      'href',
      '/',
    )
  })
})

test.describe('FR-031: fotos do animal', () => {
  test('amplia a foto na tela inteira, troca pelas setas do teclado e fecha com Esc', async ({
    page,
  }) => {
    await page.goto('/animais/pingo')
    await page.getByRole('button', { name: 'Ampliar a foto' }).click()
    const enlarged = page.getByRole('dialog', { name: 'Pingo' })
    await expect(enlarged.getByRole('img', { name: 'Foto 1 de 3 de Pingo' })).toBeVisible()

    await page.keyboard.press('ArrowRight')
    await expect(enlarged.getByText('Foto 2 de 3', { exact: true })).toBeVisible()
    await expectAccessible(page)

    await page.keyboard.press('Escape')
    await expect(enlarged).toBeHidden()
    await expect(page.getByRole('button', { name: 'Ampliar a foto' })).toBeFocused()
  })
})

test.describe('BR-061: foto sensível', () => {
  test('fica desfocada até a pessoa escolher ver, e pode ser escondida de novo', async ({
    page,
  }) => {
    await page.goto('/animais/nuvem')
    await page.getByRole('button', { name: 'Ver a foto 2 de 2' }).click()
    await expect(page.getByText('Foto sensível')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Ampliar a foto' })).toHaveCount(0)
    await expectAccessible(page)

    await page.getByRole('button', { name: 'Ver a foto', exact: true }).click()
    await expect(page.getByText('Foto sensível')).toBeHidden()

    await page.getByRole('button', { name: 'Esconder a foto de novo' }).click()
    await expect(page.getByText('Foto sensível')).toBeVisible()
  })
})

test.describe('BR-120: animal em processo de adoção', () => {
  test('avisa que ainda aceita candidaturas', async ({ page }) => {
    await page.goto('/animais/caramelo')
    await expect(page.getByText('Em processo de adoção.')).toBeVisible()
    await expect(page.getByText('a organização ainda recebe candidaturas')).toBeVisible()
  })
})
