import { expect, test, type Page } from '@playwright/test'
import { expectAccessible } from '../src/a11y'
import { createAccount, type Account } from '../src/accounts'
import { formError } from '../src/form-error'
import { totpCode } from '../src/totp'

async function signInWithPassword(page: Page, account: Account) {
  await page.goto('/entrar')
  await page.getByLabel('E-mail').fill(account.email)
  await page.getByLabel('Senha', { exact: true }).fill(account.password)
  await page.getByRole('button', { name: 'Entrar', exact: true }).click()
  await expect(page).toHaveURL('/entrar/2fa')
}

test.describe('Verificação em duas etapas', () => {
  test('pede o código, recusa o errado e entra com o certo', async ({ page }) => {
    const account = await createAccount({ twoFactor: true })
    await signInWithPassword(page, account)

    const code = page.getByLabel('Código do aplicativo')
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Verificação em duas etapas')
    await expect(code).toBeFocused()
    await expectAccessible(page)

    // Ao completar os 6 dígitos, o código é conferido sem precisar clicar.
    await code.fill('000000')
    await expect(formError(page)).toHaveText(
      'Código incorreto. Confira o aplicativo e digite o código atual.',
    )
    await expect(code).toHaveValue('')
    await expectAccessible(page)

    await code.fill(await totpCode(account.twoFactor?.totpURI ?? ''))
    await expect(page).toHaveURL('/painel')
    await expect(page.getByText('Ativa', { exact: true })).toBeVisible()
  })

  test('entra com um código de recuperação', async ({ page }) => {
    const account = await createAccount({ twoFactor: true })
    await signInWithPassword(page, account)

    await page.getByRole('button', { name: 'Perdi acesso ao aplicativo' }).click()
    const backupCode = page.getByLabel('Código de recuperação')
    await expect(backupCode).toBeFocused()
    await expectAccessible(page)

    await backupCode.fill(account.twoFactor?.backupCodes[0] ?? '')
    await page.getByRole('button', { name: 'Confirmar' }).click()
    await expect(page).toHaveURL('/painel')
  })

  test('sem login pendente, avisa que a verificação expirou', async ({ page }) => {
    await page.goto('/entrar/2fa')
    await page.getByLabel('Código do aplicativo').fill('123456')

    await expect(formError(page)).toHaveText(
      'A verificação expirou. Entre de novo para receber outro pedido de código.',
    )
    await page.getByRole('link', { name: 'Voltar para Entrar' }).click()
    await expect(page).toHaveURL('/entrar')
  })
})
