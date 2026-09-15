import { expect, type Page, test } from '@playwright/test'
import { expectAccessible } from '../src/a11y'

// shortcut: a candidatura lê os dados fictícios de apps/web/src/services/applications (qualquer
// código vale e nada é gravado); quando ler a API, estes testes passam a semear o banco.

/** Marca a opção de uma pergunta de escolha pelo texto da pergunta. */
async function answer(page: Page, question: string, option: string) {
  await page.getByRole('group', { name: question }).getByText(option, { exact: true }).click()
}

async function proceed(page: Page, nextStep: string) {
  await page.getByRole('button', { name: 'Continuar' }).click()
  await expect(page.getByRole('heading', { name: nextStep })).toBeFocused()
}

/** Primeira vez: confirma o e-mail com o código e chega aos dados pessoais. */
async function startAsNewApplicant(page: Page, animal: string) {
  await page.goto(`/animais/${animal}/candidatura`)
  await page.getByRole('radio', { name: 'Primeira vez no Acolhe+' }).click()
  await page.getByRole('textbox', { name: 'E-mail' }).fill('joana@example.org')
  await page.getByRole('button', { name: 'Enviar código' }).click()
  // O código confere sozinho ao completar os 6 dígitos.
  await page.getByRole('textbox', { name: 'Código' }).pressSequentially('123456')
  await expect(page.getByRole('heading', { name: 'Seus dados' })).toBeFocused()
}

test.describe('FR-042: candidatura sem conta', () => {
  test('confirma o e-mail, responde as etapas, revisa e envia', async ({ page }) => {
    await page.goto('/animais/barao')
    await page.getByRole('link', { name: 'Quero adotar' }).filter({ visible: true }).click()
    await expect(
      page.getByRole('heading', { level: 1, name: 'Candidatura para Barão' }),
    ).toBeVisible()
    await expectAccessible(page)

    await startAsNewApplicant(page, 'barao')
    await page.getByLabel('Nome completo').fill('Joana Lima')
    // Digitado sem pontuação, o CPF ganha a máscara enquanto se digita; o telefone também.
    await page.getByLabel('CPF').pressSequentially('12345678909')
    await expect(page.getByLabel('CPF')).toHaveValue('123.456.789-09')
    await page.getByLabel('Telefone (opcional)').pressSequentially('19987654321')
    await expect(page.getByLabel('Telefone (opcional)')).toHaveValue('(19) 98765-4321')
    await proceed(page, 'Sua casa')

    await answer(page, 'Você mora em', 'Apartamento')
    await answer(page, 'O imóvel é', 'Alugado')
    await answer(page, 'O proprietário permite animais?', 'Sim')
    await answer(page, 'Tem quintal?', 'Não')
    await answer(page, 'As janelas têm telas?', 'Sim')
    await page.getByLabel('Quantos adultos moram na casa?').fill('2')
    await answer(page, 'Moram crianças na casa?', 'Não')
    await answer(page, 'Todos na casa concordam com a adoção?', 'Sim')
    await proceed(page, 'Outros animais')

    await answer(page, 'Você tem outros animais hoje?', 'Não')
    await answer(page, 'Você já teve animais antes?', 'Não')
    await proceed(page, 'Rotina e custos')

    await answer(page, 'Quantas horas por dia o animal vai ficar sozinho?', 'De 2 a 4 horas')
    await page.getByLabel('Onde o animal vai ficar em casa?').fill('Na sala.')
    await page.getByLabel('Quem cuida dele quando você viajar?').fill('Minha irmã.')
    await answer(page, 'Você está ciente dos gastos com ração e veterinário?', 'Sim')
    await proceed(page, 'Por que adotar')

    await page.getByLabel('Por que você quer adotar Barão?').fill('Quero um companheiro calmo.')
    await page
      .getByLabel('Se você precisar se mudar, o que acontece com o animal?')
      .fill('Vai junto.')
    await page.getByLabel('E se ele tiver algum problema de comportamento?').fill('Adestrador.')
    await proceed(page, 'Perguntas da organização')

    await answer(page, 'Você consideraria adotar um animal idoso?', 'Sim')
    await answer(
      page,
      'Se adotar um gato, você instala telas em todas as janelas antes de ele chegar?',
      'Sim',
    )
    await page.getByLabel('Já tem um veterinário de confiança perto de casa? Qual?').fill('Sim.')
    await proceed(page, 'Revise e envie')

    await expect(page.getByText('Apartamento')).toBeVisible()
    await expect(page.getByText('123.456.789-09')).toBeVisible()
    await expectAccessible(page)

    // "Editar" abre a parte e o salvar volta direto para a revisão.
    await page.getByRole('button', { name: 'Editar Sua casa' }).click()
    await answer(page, 'Você mora em', 'Casa')
    await page.getByRole('button', { name: 'Salvar e voltar à revisão' }).click()
    await expect(page.getByRole('heading', { name: 'Revise e envie' })).toBeFocused()
    await expect(page.getByText('Casa', { exact: true })).toBeVisible()

    await page.getByRole('button', { name: 'Enviar candidatura' }).click()
    await expect(
      page.getByRole('heading', {
        name: 'Pronto! Abrigo Cantinho do Bigode recebeu a sua candidatura',
      }),
    ).toBeFocused()
    await expect(page.getByText('Crie uma conta com este e-mail')).toBeVisible()
    await expect(
      page.getByRole('link', { name: 'Falar com Abrigo Cantinho do Bigode' }),
    ).toHaveAttribute('href', /^https:\/\/wa\.me\/5519987650202\?text=/)
    await expectAccessible(page)
  })

  test('não avança com resposta faltando e explica o que falta', async ({ page }) => {
    await startAsNewApplicant(page, 'barao')
    await page.getByRole('button', { name: 'Continuar' }).click()
    await expect(page.getByText('Informe o nome completo.')).toBeVisible()
    await expect(page.getByText('Informe o CPF.')).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Seus dados' })).toBeVisible()
  })

  test('volta sem perder o que já foi respondido', async ({ page }) => {
    await startAsNewApplicant(page, 'barao')
    await page.getByLabel('Nome completo').fill('Joana Lima')
    await page.getByLabel('CPF').fill('123.456.789-09')
    await proceed(page, 'Sua casa')
    await page.getByRole('button', { name: 'Voltar' }).click()
    await expect(page.getByLabel('Nome completo')).toHaveValue('Joana Lima')
  })
})

test.describe('BR-071: CPF do adotante', () => {
  test('recusa CPF com dígito errado', async ({ page }) => {
    await startAsNewApplicant(page, 'barao')
    await page.getByLabel('Nome completo').fill('Joana Lima')
    await page.getByLabel('CPF').fill('123.456.789-00')
    await page.getByRole('button', { name: 'Continuar' }).click()
    await expect(page.getByText('Confira o CPF: os números não batem.')).toBeVisible()
  })
})

test.describe('BR-074: limite de candidaturas ativas', () => {
  test('avisa quando o CPF chegou ao limite', async ({ page }) => {
    await startAsNewApplicant(page, 'frajola')
    await page.getByLabel('Nome completo').fill('Joana Lima')
    await page.getByLabel('CPF').fill('529.982.247-25')
    await page.getByRole('button', { name: 'Continuar' }).click()
    await expect(page.getByRole('alert').filter({ hasText: 'Você chegou ao limite' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Seus dados' })).toBeVisible()
  })
})

test.describe('FR-041: candidatura com conta', () => {
  test('entra e segue para as perguntas da organização com o perfil preenchido', async ({
    page,
  }) => {
    await page.goto('/animais/pingo/candidatura')
    await page.getByRole('radio', { name: 'Já tenho conta' }).click()
    await page.getByRole('textbox', { name: 'E-mail' }).fill('marina@example.org')
    await page.getByLabel('Senha', { exact: true }).fill('qualquer-senha')
    await page.getByRole('button', { name: 'Entrar e continuar' }).click()

    await expect(page.getByRole('heading', { name: 'Perguntas da organização' })).toBeFocused()
    await expect(page.getByText('Você entrou como marina@example.org.')).toBeVisible()
    await page.getByRole('button', { name: 'Voltar' }).click()
    await expect(page.getByLabel('Por que você quer adotar Pingo?')).toHaveValue(/casa ficou vazia/)

    // Voltando até o começo, quem já entrou não precisa entrar de novo.
    for (const step of [
      'Rotina e custos',
      'Outros animais',
      'Sua casa',
      'Seus dados',
      'Quem é você',
    ]) {
      await page.getByRole('button', { name: 'Voltar' }).click()
      await expect(page.getByRole('heading', { name: step })).toBeFocused()
    }
    await expect(page.getByText('Você entrou como marina@example.org.')).toBeVisible()
    await page.getByRole('button', { name: 'Continuar' }).click()
    await expect(page.getByLabel('Nome completo')).toHaveValue('Marina Duarte')
  })
})

test.describe('BR-075: uma candidatura por animal', () => {
  test('avisa quem já se candidatou a este animal', async ({ page }) => {
    await page.goto('/animais/caramelo/candidatura')
    await page.getByRole('radio', { name: 'Já tenho conta' }).click()
    await page.getByRole('textbox', { name: 'E-mail' }).fill('marina@example.org')
    await page.getByLabel('Senha', { exact: true }).fill('qualquer-senha')
    await page.getByRole('button', { name: 'Entrar e continuar' }).click()
    await expect(
      page.getByRole('alert').filter({ hasText: 'Você já se candidatou para Caramelo.' }),
    ).toBeVisible()
  })
})
