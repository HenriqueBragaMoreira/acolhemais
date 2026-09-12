import { expect, test } from '@playwright/test'
import { expectAccessible } from '../src/a11y'
import { createAccount, lastEmailLink } from '../src/accounts'
import { formError } from '../src/form-error'

const NEW_PASSWORD = 'nova-senha-do-teste-e2e-2026'

test.describe('FR-004: esqueci a senha', () => {
  test('pede o link sem revelar se o e-mail tem conta', async ({ page }) => {
    await page.goto('/entrar')
    await page.getByRole('link', { name: 'Esqueci a senha' }).click()
    await expect(page.getByRole('heading', { level: 1, name: 'Esqueci a senha' })).toBeVisible()
    await expectAccessible(page)

    // A tela de Entrar continua no DOM, escondida (o Next guarda a rota anterior): o papel
    // acessível só acha o campo visível.
    const emailField = page.getByRole('textbox', { name: 'E-mail' })
    await page.getByRole('button', { name: 'Enviar link' }).click()
    await expect(formError(page)).toHaveText('Informe seu e-mail.')
    await expect(emailField).toBeFocused()

    const email = `e2e-${crypto.randomUUID()}@acolhemais.test`
    await emailField.fill(email)
    await page.getByRole('button', { name: 'Enviar link' }).click()
    const sent = page.locator('[data-slot="alert"]')
    await expect(sent).toContainText('Confira seu e-mail')
    await expect(sent).toContainText(`Se houver uma conta com ${email}`)
    await expectAccessible(page)
  })

  test('cria a nova senha pelo link do e-mail e entra com ela', async ({ page }) => {
    const account = await createAccount()
    await page.goto('/esqueci-a-senha')
    await page.getByLabel('E-mail').fill(account.email)
    await page.getByRole('button', { name: 'Enviar link' }).click()
    await expect(page.locator('[data-slot="alert"]')).toContainText('Confira seu e-mail')

    await page.goto(await lastEmailLink(account.email))
    await expect(page.getByRole('heading', { level: 1, name: 'Criar nova senha' })).toBeVisible()
    await expectAccessible(page)

    await page.getByLabel('Nova senha').fill('curta-11ch!')
    await page.getByRole('button', { name: 'Salvar senha' }).click()
    await expect(formError(page)).toHaveText('A senha precisa ter pelo menos 12 caracteres.')
    await expectAccessible(page)

    await page.getByLabel('Nova senha').fill(NEW_PASSWORD)
    await page.getByRole('button', { name: 'Salvar senha' }).click()
    await expect(page).toHaveURL('/entrar?senha=redefinida')
    await expect(page.locator('[data-slot="alert"]')).toHaveText(
      'Senha criada. Entre com o seu e-mail e a nova senha.',
    )

    await page.getByLabel('E-mail').fill(account.email)
    await page.getByLabel('Senha', { exact: true }).fill(NEW_PASSWORD)
    await page.getByRole('button', { name: 'Entrar', exact: true }).click()
    await expect(page).toHaveURL('/painel')
  })

  test('recusa link vencido ou adulterado e oferece pedir outro', async ({ page }) => {
    await page.goto('/redefinir-senha?token=token-adulterado')
    await page.getByLabel('Nova senha').fill(NEW_PASSWORD)
    await page.getByRole('button', { name: 'Salvar senha' }).click()
    await expect(formError(page)).toHaveText(
      'Este link expirou ou já foi usado. Peça outro em “Esqueci a senha”.',
    )
    await expect(page.getByRole('link', { name: 'Pedir outro link' })).toBeVisible()
    await expectAccessible(page)
  })

  test('sem token, não mostra o formulário', async ({ page }) => {
    await page.goto('/redefinir-senha')
    await expect(page.locator('[data-slot="alert"]')).toHaveText(
      'Este link expirou ou já foi usado. Peça outro em “Esqueci a senha”.',
    )
    await expect(page.getByLabel('Nova senha')).toHaveCount(0)
    await expectAccessible(page)
  })
})
