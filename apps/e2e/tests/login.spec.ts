import { expect, test } from '@playwright/test'
import { expectAccessible } from '../src/a11y'
import { formError } from '../src/form-error'
import { createAccount } from '../src/accounts'

test.describe('Entrar', () => {
  test('abre acessível, só com o que funciona', async ({ page }) => {
    await page.goto('/entrar')

    await expect(page.getByRole('heading', { level: 1, name: 'Entrar' })).toBeVisible()
    await expect(page.getByLabel('E-mail')).toBeVisible()
    await expect(page.getByLabel('Senha', { exact: true })).toBeVisible()
    // Sem credenciais do Google no ambiente de teste, o botão não aparece.
    await expect(page.getByRole('button', { name: 'Entrar com Google' })).toHaveCount(0)
    await expect(page.getByRole('link', { name: /esqueci|criar conta/i })).toHaveCount(0)
    await expectAccessible(page)
  })

  test('aponta os campos vazios e leva o foco ao primeiro', async ({ page }) => {
    await page.goto('/entrar')
    await page.getByRole('button', { name: 'Entrar', exact: true }).click()

    await expect(page.getByText('Informe seu e-mail.')).toBeVisible()
    await expect(page.getByText('Informe sua senha.')).toBeVisible()
    await expect(page.getByLabel('E-mail')).toBeFocused()
    await expect(page.getByLabel('E-mail')).toHaveAttribute('aria-invalid', 'true')
    await expectAccessible(page)
  })

  test('recusa senha errada, limpa a senha e devolve o foco a ela', async ({ page }) => {
    const account = await createAccount()
    await page.goto('/entrar')
    await page.getByLabel('E-mail').fill(account.email)
    await page.getByLabel('Senha', { exact: true }).fill('outra-senha-qualquer')
    await page.getByRole('button', { name: 'Entrar', exact: true }).click()

    await expect(formError(page)).toHaveText('E-mail ou senha incorretos.')
    await expect(page.getByLabel('Senha', { exact: true })).toHaveValue('')
    await expect(page.getByLabel('Senha', { exact: true })).toBeFocused()
    await expectAccessible(page)
  })

  test('bloqueia o e-mail depois de 5 senhas erradas e diz quanto esperar', async ({ page }) => {
    const account = await createAccount()
    await page.goto('/entrar')
    await page.getByLabel('E-mail').fill(account.email)
    const password = page.getByLabel('Senha', { exact: true })
    const submit = page.getByRole('button', { name: 'Entrar', exact: true })

    for (let attempt = 1; attempt <= 5; attempt++) {
      await password.fill(`senha-errada-numero-${attempt}`)
      await submit.click()
      await expect(formError(page)).toHaveText('E-mail ou senha incorretos.')
    }
    await password.fill(account.password)
    await submit.click()

    await expect(formError(page)).toHaveText(
      'Muitas tentativas com senha errada. Tente de novo em 1 minuto.',
    )
  })

  test('mostra e oculta a senha', async ({ page }) => {
    await page.goto('/entrar')
    const password = page.getByLabel('Senha', { exact: true })
    await password.fill('minha-senha-longa')

    await expect(password).toHaveAttribute('type', 'password')
    await page.getByRole('button', { name: 'Mostrar' }).click()
    await expect(password).toHaveAttribute('type', 'text')
    await page.getByRole('button', { name: 'Ocultar' }).click()
    await expect(password).toHaveAttribute('type', 'password')
  })

  test('entra só com o teclado e chega ao painel; sair volta para Entrar', async ({
    page,
    isMobile,
  }) => {
    test.skip(isMobile, 'navegação só por teclado é cenário de computador')
    const account = await createAccount()
    // O formulário chega por streaming: só usa o teclado depois de a página ficar interativa.
    await page.goto('/entrar', { waitUntil: 'networkidle' })

    await page.getByLabel('E-mail').focus()
    await page.keyboard.type(account.email)
    await page.keyboard.press('Tab')
    await expect(page.getByLabel('Senha', { exact: true })).toBeFocused()
    await page.keyboard.type(account.password)
    await page.keyboard.press('Enter')

    await expect(page).toHaveURL('/painel')
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(`Olá, ${account.name}!`)
    await expect(page.getByText(account.email)).toBeVisible()
    await expect(page.getByText('Desativada')).toBeVisible()
    await expectAccessible(page)

    await page.getByRole('button', { name: 'Sair' }).click()
    await expect(page).toHaveURL('/entrar')
  })

  test('o painel sem sessão manda para Entrar', async ({ page }) => {
    await page.goto('/painel')
    await expect(page).toHaveURL('/entrar')
  })
})
