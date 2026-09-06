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

/**
 * Cliente do Better Auth: login, sessão, 2FA, equipe da plataforma e organizações. Fala direto
 * com a API (`/api/auth/*`), com os mesmos papéis e permissões definidos no servidor.
 */
export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001',
  plugins: [
    twoFactorClient({
      onTwoFactorRedirect() {
        window.location.href = TWO_FACTOR_PAGE
      },
    }),
    adminClient({ ac: platformAc, roles: platformRoles }),
    organizationClient({
      ac: organizationAc,
      roles: organizationRoles,
      dynamicAccessControl: { enabled: true },
    }),
  ],
})
