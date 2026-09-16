import { expect, type Page, test } from '@playwright/test'
import { expectAccessible } from '../src/a11y'
import { createAccount, sessionCookies } from '../src/accounts'
import { formError } from '../src/form-error'

/*
 * O painel da organização com os dados fictícios do Coletivo Focinho Gelado. As mudanças ficam
 * na memória do navegador: dentro de um teste, navegar só por cliques (recarregar volta aos dados
 * de exemplo).
 */

/** Já começa logado (a tela de login tem os testes dela, em login.spec.ts). */
async function signIn(page: Page) {
  const account = await createAccount()
  await page.context().addCookies(await sessionCookies(account))
  await page.goto('/painel')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(`Olá, ${account.name}!`)
  return account
}

const column = (page: Page, stage: string) =>
  page.getByRole('region', { name: new RegExp(`^${stage}`) })

/** Os cartões de uma coluna (os selos dentro de cada um também são itens de lista). */
const cards = (page: Page, stage: string) => column(page, stage).locator('ol > li')

test.describe('FR-045: candidaturas por etapa', () => {
  test('o Início mostra o caminho e leva às colunas, acessível', async ({ page }) => {
    await signIn(page)
    await expect(page.getByRole('link', { name: /4\s*Recebida/ })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Chegaram agora' })).toBeVisible()
    await expectAccessible(page)

    await page.getByRole('link', { name: /4\s*Recebida/ }).click()
    await expect(page).toHaveURL('/painel/candidaturas#etapa-received')
    await expect(cards(page, 'Recebida')).toHaveCount(4)
    await expectAccessible(page)
  })

  test('BR-082: histórico positivo, conta verificada, sem conta e, por último, Atenção', async ({
    page,
  }) => {
    await signIn(page)
    await page
      .getByRole('navigation', { name: 'Painel' })
      .getByRole('link', { name: 'Candidaturas' })
      .click()
    const names = cards(page, 'Recebida')
    await expect(names.nth(0)).toContainText('Ana Clara Ribeiro')
    await expect(names.nth(1)).toContainText('Marina Duarte')
    await expect(names.nth(2)).toContainText('João Pedro Almeida')
    await expect(names.nth(3)).toContainText('Lucas Ferreira')
    // BR-084: quantas outras ativas, sem dizer onde.
    await expect(names.nth(3)).toContainText('Tem mais 2 candidaturas ativas no Acolhe+')
  })

  test('BR-076: avançar a etapa marca a estação nova, o histórico e a coluna', async ({ page }) => {
    await signIn(page)
    await page.getByRole('link', { name: /Ana Clara Ribeiro/ }).click()
    await expect(page.getByRole('heading', { level: 1, name: 'Ana Clara Ribeiro' })).toBeVisible()
    await expectAccessible(page)

    await page.getByRole('button', { name: 'Começar a análise' }).click()
    const track = page.getByRole('list', { name: 'Caminho da candidatura' })
    await expect(track.locator('[aria-current="step"]')).toHaveText('Em análise')
    await expect(page.getByText(/moveu para Em análise/)).toBeVisible()

    // As outras etapas ficam no menu; a terminal não aparece nele.
    await page.getByRole('button', { name: 'Mover para outra etapa' }).click()
    await expect(page.getByRole('menuitem')).toHaveText(['Recebida', 'Aprovada'])
    await page.keyboard.press('Escape')

    await page.getByRole('link', { name: 'Voltar para as candidaturas' }).click()
    const moved = cards(page, 'Em análise').filter({ hasText: 'Ana Clara' })
    await expect(moved).toContainText('Movida agora')
  })
})

test.describe('FR-045: filtro por animal', () => {
  test('a busca digitada escolhe o animal e fica no endereço', async ({ page }) => {
    await signIn(page)
    await page.getByRole('link', { name: 'Ver todas' }).click()
    const filter = page.getByRole('combobox', { name: 'Animal' })
    await filter.fill('nuv')
    await page.getByRole('option', { name: 'Nuvem' }).click()

    await expect(page).toHaveURL(/\?animal=nuvem$/)
    await expect(cards(page, 'Recebida')).toHaveCount(1)
    await expect(cards(page, 'Recebida')).toContainText('Ana Clara Ribeiro')
    await expect(cards(page, 'Entrevista ou visita')).toContainText('Fernanda Oliveira')
    await expectAccessible(page)

    // Apagar o texto tira o filtro (e o campo fica vazio, sem devolver o nome).
    await filter.fill('')
    await expect(page).toHaveURL(/\/painel\/candidaturas$/)
    await expect(filter).toHaveValue('')
    await expect(cards(page, 'Recebida')).toHaveCount(4)

    // O "×" também tira.
    await filter.fill('alg')
    await page.getByRole('option', { name: 'Algodão' }).click()
    await expect(page).toHaveURL(/\?animal=algodao$/)
    await page.getByRole('button', { name: 'Limpar o filtro de animal' }).click()
    await expect(page).toHaveURL(/\/painel\/candidaturas$/)
    await expect(filter).toHaveValue('')
  })
})

test.describe('BR-090: selos explicados', () => {
  test('Atenção mostra o resumo da ocorrência, sem a organização autora (BR-100)', async ({
    page,
  }) => {
    await signIn(page)
    await page.getByRole('link', { name: 'Ver todas' }).click()
    await cards(page, 'Recebida')
      .filter({ hasText: 'Lucas Ferreira' })
      .getByRole('button', { name: 'O que é o selo Atenção' })
      .click()

    const summary = page.getByRole('dialog', { name: 'Atenção' })
    await expect(summary).toContainText('Devolução sem aviso')
    await expect(summary).toContainText('vale até março de 2027')
    await expect(summary).toContainText('não mostramos qual organização reportou')
    await expectAccessible(page)
  })
})

test.describe('FR-030: lista de animais', () => {
  test('a busca pelo nome e a situação ficam no endereço', async ({ page }) => {
    await signIn(page)
    await page
      .getByRole('navigation', { name: 'Painel' })
      .getByRole('link', { name: 'Animais' })
      .click()
    await page.getByLabel('Buscar pelo nome').fill('car')

    await expect(page).toHaveURL(/busca=car/)
    const rows = page
      .getByRole('main')
      .locator('ul > li')
      .filter({ has: page.locator('img, svg') })
    await expect(page.getByRole('link', { name: 'Caramelo', exact: true })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Nuvem', exact: true })).toHaveCount(0)
    await expect(rows.first()).toBeVisible()

    await page.getByRole('link', { name: /^Rascunhos/ }).click()
    await expect(page).toHaveURL(/situacao=rascunhos/)
    await expect(page.getByText('Nenhum animal com “car” nesta situação.')).toBeVisible()
  })
})

test.describe('BR-085: CPF do adotante', () => {
  test('mascarado por padrão; revelar mostra inteiro e fica no histórico', async ({ page }) => {
    await signIn(page)
    await page.getByRole('link', { name: /Ana Clara Ribeiro/ }).click()
    const contact = page.getByRole('region', { name: 'Contato' })
    await expect(contact.getByText('•••.475.031-••')).toBeVisible()

    await contact.getByRole('button', { name: 'Revelar' }).click()
    await expect(contact.getByText('286.475.031-71')).toBeVisible()
    await expect(page.getByText(/revelou o CPF/)).toBeVisible()

    // Esconder volta a mascarar e não entra no histórico.
    await contact.getByRole('button', { name: 'Esconder' }).click()
    await expect(contact.getByText('•••.475.031-••')).toBeVisible()
    await expect(page.getByText(/revelou o CPF/)).toHaveCount(1)
    await expect(contact.getByRole('button', { name: 'Copiar o e-mail' })).toBeVisible()
    await expect(contact.getByRole('button', { name: 'Copiar o telefone' })).toBeVisible()
  })
})

test.describe('BR-077: recusa', () => {
  test('pede o motivo interno e manda a mensagem; a candidatura encerra', async ({ page }) => {
    await signIn(page)
    await page.getByRole('link', { name: /João Pedro Almeida/ }).click()
    await page.getByRole('button', { name: 'Recusar', exact: true }).click()

    const dialog = page.getByRole('dialog', { name: /Recusar a candidatura/ })
    await expect(dialog.getByLabel('Mensagem para João Pedro Almeida')).toHaveValue(/Olá, João!/)
    await dialog.getByRole('button', { name: 'Recusar candidatura' }).click()
    await expect(formError(page)).toHaveText('Informe o motivo.')
    await expectAccessible(page)

    await dialog.getByLabel('Motivo (só a organização vê)').fill('Já tem dois gatos não castrados.')
    await dialog.getByRole('button', { name: 'Recusar candidatura' }).click()
    await expect(dialog).toBeHidden()
    await expect(page.getByText(/^Recusada em/)).toBeVisible()
    await expect(page.getByText('Motivo interno: Já tem dois gatos não castrados.')).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Próximo passo' })).toHaveCount(0)
  })
})

test.describe('BR-079: concluir a adoção', () => {
  test('exige o documento conferido; o animal vira Adotado e as outras são canceladas (BR-078)', async ({
    page,
  }) => {
    await signIn(page)
    await page
      .getByRole('navigation', { name: 'Painel' })
      .getByRole('link', { name: 'Candidaturas' })
      .click()
    await page.getByRole('link', { name: /Rafael Moreira/ }).click()
    await page.getByRole('button', { name: 'Concluir adoção' }).click()

    const dialog = page.getByRole('dialog', { name: 'Concluir a adoção de Caramelo' })
    await dialog.getByRole('button', { name: 'Concluir adoção' }).click()
    await expect(formError(page)).toHaveText('Confirme que conferiu o documento com foto.')

    // A data vem com hoje e abre o calendário em pt-BR; dias futuros não se escolhem.
    await dialog.getByLabel('Data da adoção').click()
    const calendar = page.getByRole('grid')
    await expect(calendar).toBeVisible()
    await expect(calendar.locator('[data-selected-single="true"]')).toHaveCount(1)
    await calendar.locator('[data-selected-single="true"]').click()
    await expect(calendar).toBeHidden()

    await dialog.getByLabel('Conferi um documento com foto de Rafael Moreira').check()
    await dialog.getByRole('button', { name: 'Concluir adoção' }).click()
    await expect(dialog).toBeHidden()
    await expect(page.getByText(/^Adoção de Caramelo concluída em/)).toBeVisible()

    // A Marina também queria o Caramelo: a candidatura dela foi cancelada.
    await page.getByRole('link', { name: 'Voltar para as candidaturas' }).click()
    await page.getByText(/^Encerradas/).click()
    await expect(page.getByRole('link', { name: /Marina Duarte.*Cancelada/ })).toBeVisible()

    await page
      .getByRole('navigation', { name: 'Painel' })
      .getByRole('link', { name: 'Animais' })
      .click()
    const caramelo = page
      .getByRole('main')
      .getByRole('listitem')
      .filter({ has: page.getByRole('link', { name: 'Caramelo', exact: true }) })
    await expect(caramelo).toContainText('Adotado')
  })
})

test.describe('FR-030: cadastro de animal', () => {
  test('o rascunho só precisa do nome e abre a página do animal', async ({ page }) => {
    await signIn(page)
    await page.getByRole('link', { name: 'Cadastrar animal' }).click()
    await expect(page.getByRole('heading', { level: 2, name: 'Quem é' })).toBeVisible()
    await expectAccessible(page)

    await page.getByRole('button', { name: 'Salvar rascunho' }).click()
    await expect(formError(page)).toHaveText('Informe o nome do animal.')

    await page.getByLabel('Nome').fill('Pirata')
    await page.getByRole('button', { name: 'Salvar rascunho' }).click()
    await expect(page.getByRole('heading', { level: 1, name: 'Pirata' })).toBeVisible()
    await expect(page.getByText('Rascunho', { exact: true })).toBeVisible()
  })

  test('BR-060: publicar exige foto; a etapa não segue sem ela', async ({ page }) => {
    await signIn(page)
    await page
      .getByRole('navigation', { name: 'Painel' })
      .getByRole('link', { name: 'Animais' })
      .click()
    await page.getByRole('link', { name: 'Tobias' }).click()
    await expect(page.getByRole('heading', { level: 2, name: 'Quem é' })).toBeVisible()

    await page.getByRole('button', { name: 'Continuar' }).click()
    await expect(page.getByRole('heading', { level: 2, name: 'Saúde e convivência' })).toBeFocused()
    await page.getByRole('button', { name: 'Continuar' }).click()
    await expect(page.getByRole('heading', { level: 2, name: 'Fotos e vídeo' })).toBeFocused()
    await page.getByRole('button', { name: 'Continuar' }).click()
    await expect(formError(page)).toHaveText('Adicione pelo menos uma foto.')
    await expectAccessible(page)
  })
})
