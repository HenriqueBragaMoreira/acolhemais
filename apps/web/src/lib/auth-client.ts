import {
  organizationAc,
  organizationRoles,
  platformAc,
  platformRoles,
} from '@acolhemais/api/access'
import { adminClient, organizationClient, twoFactorClient } from 'better-auth/client/plugins'
import { createAuthClient } from 'better-auth/react'

/** Página que pede o código de 2FA para concluir o login (a mesma para onde a API redireciona). */
export const TWO_FACTOR_PAGE = '/entrar/2fa'

/** Para onde a pessoa vai depois de entrar. */
export const AFTER_SIGN_IN_PAGE = '/painel'

/**
 * Cliente do Better Auth: login, sessão, 2FA, equipe da plataforma e organizações. Fala direto
 * com a API (`/api/auth/*`), com os mesmos papéis e permissões definidos no servidor.
 *
 * Quando o login pede o código de 2FA, a resposta traz `twoFactorRedirect` e a própria tela
 * de login navega até TWO_FACTOR_PAGE (sem recarregar a página).
 */
export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001',
  plugins: [
    twoFactorClient(),
    adminClient({ ac: platformAc, roles: platformRoles }),
    organizationClient({
      ac: organizationAc,
      roles: organizationRoles,
      dynamicAccessControl: { enabled: true },
    }),
  ],
})
