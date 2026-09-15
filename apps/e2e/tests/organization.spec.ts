import { expect, type Page, test } from '@playwright/test'
import { expectAccessible } from '../src/a11y'

// shortcut: a página lê os dados fictícios de apps/web/src/services/organizations; quando ler a
// API, estes testes passam a semear as organizações no banco.

const BIGODE = '/ong/abrigo-cantinho-do-bigode'

function gallery(page: Page) {
  return page.getByRole('region', { name: 'Esperando um lar' })
}

test.describe('FR-026: página pública da organização', () => {
  test('abre pelo link da página do animal, com a marca, o contato e só os animais dela', async ({
    page,
  }) => {
    await page.goto('/animais/barao')
    await page.getByRole('link', { name: 'Abrigo Cantinho do Bigode' }).click()

    await expect(page).toHaveURL(new RegExp(`${BIGODE}$`))
    await expect(
      page.getByRole('heading', { level: 1, name: 'Abrigo Cantinho do Bigode' }),
    ).toBeVisible()
    await expect(page.getByText('Atua em Campinas, Hortolândia e Sumaré.')).toBeVisible()
    await expect(page.getByRole('link', { name: 'WhatsApp' })).toHaveAttribute(
      'href',
      /^https:\/\/wa\.me\/5519987650202\?text=/,
    )
    await expect(page.getByRole('link', { name: 'E-mail' })).toHaveAttribute(
      'href',
      'mailto:adocao@cantinhodobigode.example.org',
    )
    await expect(gallery(page).getByText('6 animais')).toBeVisible()
    await expect(gallery(page).getByRole('link', { name: /Barão/ })).toBeVisible()
    await expect(gallery(page).getByRole('link', { name: /Pintada/ })).toHaveCount(0)
    await expectAccessible(page)
  })

  test('a busca filtra só entre os animais dela e fica no endereço da página', async ({ page }) => {
    await page.goto(BIGODE)
    await expect(gallery(page).getByText('6 animais')).toBeVisible()
    await page.getByRole('combobox', { name: 'Espécie' }).selectOption('Gatos')

    await expect(page).toHaveURL(new RegExp(`${BIGODE}\\?species=cat$`))
    await expect(gallery(page).getByRole('link', { name: /Barão/ })).toHaveCount(0)
    await expect(gallery(page).getByRole('link', { name: /Luna/ })).toBeVisible()
  })

  test('organização sem cores próprias usa as da plataforma e passa no axe', async ({ page }) => {
    await page.goto('/ong/lar-da-cida')
    await expect(page.getByRole('heading', { level: 1, name: 'Lar da Cida' })).toBeVisible()
    await expect(gallery(page).getByText('4 animais')).toBeVisible()
    await expectAccessible(page)
  })

  test('endereço de organização que não existe mostra "não encontrada"', async ({ page }) => {
    await page.goto('/ong/nao-existe')
    await expect(page.getByRole('heading', { name: 'Página não encontrada' })).toBeVisible()
  })
})

test.describe('BR-049: doação por PIX direto para a organização', () => {
  test('mostra a chave e copia com um toque', async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write'])
    await page.goto(BIGODE)
    const pix = page.getByRole('region', { name: 'Doe por PIX' })
    await expect(pix.getByText('Chave PIX (e-mail)')).toBeVisible()
    await expect(pix.getByText('A doação vai direto para a organização.')).toBeVisible()

    await pix.getByRole('button', { name: 'Copiar chave' }).click()
    await expect(pix.getByRole('button', { name: 'Chave copiada' })).toBeVisible()
    expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(
      'doacoes@cantinhodobigode.example.org',
    )
  })

  test('o QR aparece no computador e some no celular', async ({ page, isMobile }) => {
    await page.goto(BIGODE)
    const qr = page.getByRole('img', { name: 'QR Code do PIX de Abrigo Cantinho do Bigode' })
    if (isMobile) await expect(qr).toBeHidden()
    else await expect(qr).toBeVisible()
  })
})

test.describe('BR-047: slug antigo', () => {
  test('leva ao endereço atual da organização', async ({ page }) => {
    await page.goto('/ong/cantinho-do-bigode')
    await expect(page).toHaveURL(new RegExp(`${BIGODE}$`))
    await expect(
      page.getByRole('heading', { level: 1, name: 'Abrigo Cantinho do Bigode' }),
    ).toBeVisible()
  })
})

test.describe('BR-043: organização suspensa', () => {
  test('sai do ar como se não existisse', async ({ page }) => {
    await page.goto('/ong/protetores-do-vale')
    await expect(page.getByRole('heading', { name: 'Página não encontrada' })).toBeVisible()
  })
})

test.describe('BR-044: organização encerrada', () => {
  test('mostra só que foi encerrada, sem animais, contato nem doação', async ({ page }) => {
    await page.goto('/ong/grupo-amigos-de-pata')
    await expect(
      page.getByRole('heading', { level: 1, name: 'Organização encerrada' }),
    ).toBeVisible()
    await expect(page.getByRole('region', { name: 'Esperando um lar' })).toHaveCount(0)
    await expect(page.getByRole('region', { name: 'Doe por PIX' })).toHaveCount(0)
    await expect(page.getByRole('link', { name: 'Ver os animais para adoção' })).toHaveAttribute(
      'href',
      '/',
    )
  })
})
