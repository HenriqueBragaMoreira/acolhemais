import { expect, vi } from 'vitest'
import { cookiesFrom, env, get, post, WEB_ORIGIN } from './auth'

/** Bindings com o login pelo Google ligado (credenciais fictícias). */
export const googleEnv = {
  ...env,
  GOOGLE_CLIENT_ID: 'google-client-id.apps.googleusercontent.com',
  GOOGLE_CLIENT_SECRET: 'google-client-secret',
}

type GoogleProfile = { email: string; emailVerified?: boolean; name?: string }

function base64url(value: unknown) {
  return btoa(JSON.stringify(value)).replaceAll('+', '-').replaceAll('/', '_').replaceAll('=', '')
}

/**
 * Simula o endpoint de token do Google, que devolve o `id_token` com o perfil do usuário. O
 * Better Auth só decodifica esse token (ele vem direto do Google, por TLS), então ele pode ir
 * sem assinatura nos testes.
 */
export function mockGoogleToken({
  email,
  emailVerified = true,
  name = 'Ana Souza',
}: GoogleProfile) {
  const now = Math.floor(Date.now() / 1000)
  const idToken = [
    base64url({ alg: 'RS256', typ: 'JWT' }),
    base64url({
      iss: 'https://accounts.google.com',
      aud: googleEnv.GOOGLE_CLIENT_ID,
      // Mesmo e-mail, mesma conta Google: o login seguinte encontra a conta já vinculada.
      sub: `google-${email}`,
      email,
      email_verified: emailVerified,
      name,
      iat: now,
      exp: now + 3600,
    }),
    'assinatura',
  ].join('.')

  const realFetch = globalThis.fetch
  vi.spyOn(globalThis, 'fetch').mockImplementation(async (input, init) => {
    const url = new Request(input).url
    if (url !== 'https://oauth2.googleapis.com/token') return realFetch(input, init)
    return Response.json({
      access_token: 'access-token',
      id_token: idToken,
      expires_in: 3600,
      token_type: 'Bearer',
      scope: 'openid email profile',
    })
  })
}

/**
 * Faz o login pelo Google de ponta a ponta: pede a URL de autorização, como o frontend faria,
 * e chama o callback como o Google faria depois do consentimento.
 */
export async function signInWithGoogle(profile: GoogleProfile) {
  mockGoogleToken(profile)
  const start = await post(
    '/sign-in/social',
    { provider: 'google', callbackURL: `${WEB_ORIGIN}/painel` },
    {},
    googleEnv,
  )
  expect(start.status).toBe(200)
  const { url } = await start.json<{ url: string }>()
  const state = new URL(url).searchParams.get('state') ?? ''

  return get(
    `/callback/google?code=codigo-do-google&state=${encodeURIComponent(state)}`,
    { cookie: cookiesFrom(start) },
    googleEnv,
  )
}
