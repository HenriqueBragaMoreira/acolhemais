import { describe, expect, it } from 'vitest'
import {
  cookiesFrom,
  get,
  password,
  post,
  signUp,
  signUpUnverified,
  uniqueEmail,
  WEB_ORIGIN,
} from '../test/auth'
import { emailsTo, lastEmailTo, linkIn } from '../test/mailpit'

const newPassword = 'nova-senha-bem-comprida-2026'

/** Pede o "esqueci a senha" e devolve o token do link que chegou por e-mail. */
async function requestReset(email: string) {
  const res = await post('/request-password-reset', { email })
  expect(res.status).toBe(200)
  const message = await lastEmailTo(email)
  expect(message.Subject).toBe('Redefina sua senha do Acolhe+')
  const link = linkIn(message)
  expect(`${link.origin}${link.pathname}`).toBe(`${WEB_ORIGIN}/redefinir-senha`)
  return link.searchParams.get('token') ?? ''
}

function resetPassword(token: string, chosen = newPassword) {
  return post('/reset-password', { token, newPassword: chosen })
}

describe('FR-004: redefinir a senha', () => {
  it('envia o link para a tela da web e troca a senha com ele', async () => {
    const { email } = await signUp()
    expect((await resetPassword(await requestReset(email))).status).toBe(200)

    expect((await post('/sign-in/email', { email, password })).status).toBe(401)
    expect((await post('/sign-in/email', { email, password: newPassword })).status).toBe(200)
  })

  it('o link vale uma vez só', async () => {
    const { email } = await signUp()
    const token = await requestReset(email)
    expect((await resetPassword(token)).status).toBe(200)
    const again = await resetPassword(token, 'outra-senha-bem-comprida-2026')
    expect(again.status).toBe(400)
    expect(await again.json()).toMatchObject({ code: 'INVALID_TOKEN' })
  })

  it('não revela se o e-mail tem conta', async () => {
    const email = uniqueEmail()
    const res = await post('/request-password-reset', { email })
    expect(res.status).toBe(200)
    expect(await emailsTo(email)).toEqual([])
  })

  it('recusa senha curta (BR-001)', async () => {
    const { email } = await signUp()
    const res = await resetPassword(await requestReset(email), 'curta-11ch!')
    expect(res.status).toBe(400)
  })
})

describe('BR-006: redefinir a senha derruba as outras sessões', () => {
  it('encerra a sessão aberta antes da redefinição', async () => {
    const { email, res } = await signUp()
    const cookie = cookiesFrom(res)
    expect(await (await get('/get-session', { cookie })).json()).toMatchObject({ user: { email } })

    await resetPassword(await requestReset(email))
    expect(await (await get('/get-session', { cookie })).json()).toBeNull()
  })
})

describe('BR-002: redefinir a senha zera o bloqueio progressivo', () => {
  it('libera o login de um e-mail bloqueado por senhas erradas', async () => {
    const { email } = await signUp()
    for (let attempt = 0; attempt < 5; attempt++) {
      await post('/sign-in/email', { email, password: 'senha-errada-qualquer' })
    }
    expect((await post('/sign-in/email', { email, password })).status).toBe(429)

    await resetPassword(await requestReset(email))
    expect((await post('/sign-in/email', { email, password: newPassword })).status).toBe(200)
  })
})

describe('BR-015: redefinir a senha confirma o e-mail', () => {
  it('quem redefine sem ter confirmado o cadastro já entra', async () => {
    const { email } = await signUpUnverified()
    await resetPassword(await requestReset(email))
    expect((await post('/sign-in/email', { email, password: newPassword })).status).toBe(200)
  })
})
