import { schema } from '@acolhemais/db'
import type { Database } from '@acolhemais/db'
import { drizzleAdapter } from '@better-auth/drizzle-adapter/relations-v2'
import { i18n } from '@better-auth/i18n'
import { betterAuth } from 'better-auth'
import { admin } from 'better-auth/plugins/admin'
import { haveIBeenPwned } from 'better-auth/plugins/haveibeenpwned'
import { organization } from 'better-auth/plugins/organization'
import { twoFactor } from 'better-auth/plugins/two-factor'
import { eq } from 'drizzle-orm'
import type { Config } from '../config'
import { authEmails } from './emails'
import { auditTrail } from './plugins/audit-trail'
import { clearLoginLockout, loginLockout } from './plugins/login-lockout'
import { authMessages } from './messages'
import { organizationAc, organizationRoles } from './access/organization'
import { platformAc, platformRoles } from './access/platform'
import { firstAccess } from './plugins/first-access'
import { organizationGuards } from './plugins/organization-guards'
import { platformGuards } from './plugins/platform-guards'
import { platformTwoFactor } from './plugins/platform-two-factor'
import { socialTwoFactor } from './plugins/social-two-factor'

/** UUIDv7 (RFC 9562): 48 bits de milissegundos e o resto aleatório, como o `uuidv7()` do Postgres. */
function uuidv7(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(16))
  const now = Date.now()
  for (let i = 0; i < 6; i++) bytes[i] = Math.floor(now / 2 ** (8 * (5 - i))) & 0xff
  bytes[6] = ((bytes[6] ?? 0) & 0x0f) | 0x70
  bytes[8] = ((bytes[8] ?? 0) & 0x3f) | 0x80
  const hex = [...bytes].map((byte) => byte.toString(16).padStart(2, '0')).join('')
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`
}

type AuthDeps = {
  config: Config
  db: Database
  /** Mantém vivas as tarefas que terminam depois da resposta (no Workers, `waitUntil`). */
  waitUntil?: (promise: Promise<unknown>) => void
}

/**
 * Cria a instância do Better Auth. No Workers, a configuração e a conexão com o banco só
 * existem durante a requisição, então a instância também é criada por requisição.
 *
 * Opções que mudam tabelas exigem regenerar o schema com `pnpm auth:generate`.
 */
export function createAuth({ config, db, waitUntil }: AuthDeps) {
  const emails = authEmails(config, db)

  const auth = betterAuth({
    appName: 'Acolhe+',
    baseURL: config.BETTER_AUTH_URL,
    secret: config.BETTER_AUTH_SECRET,
    trustedOrigins: [config.WEB_ORIGIN],
    database: drizzleAdapter(db, { provider: 'pg', schema, transaction: true }),
    socialProviders: {
      // Opcional: só liga com as duas credenciais (ver config.ts).
      ...(config.google && {
        google: { ...config.google, prompt: 'select_account' as const },
      }),
    },
    account: {
      // Tokens do Google guardados cifrados (AES-256-GCM com o segredo da API).
      encryptOAuthTokens: true,
      accountLinking: {
        // Só vincula o Google a uma conta local com e-mail verificado. Sem isso, alguém poderia
        // cadastrar o e-mail de outra pessoa com uma senha e manter acesso depois que a dona
        // do e-mail entrasse pelo Google (pré-sequestro de conta). Já é o padrão; fica explícito.
        requireLocalEmailVerified: true,
      },
    },
    emailAndPassword: {
      enabled: true,
      minPasswordLength: 12,
      // Quem redefine a senha pode estar recuperando uma conta invadida: derruba as outras sessões.
      revokeSessionsOnPasswordReset: true,
      // O login por senha exige e-mail verificado (BR-007); o cadastro não abre sessão.
      requireEmailVerification: true,
      // Cadastro com e-mail já usado responde com um usuário falso, igual ao de um cadastro novo:
      // os campos dos plugins (2FA e admin) e um ID UUIDv7 como os do banco, para não revelar
      // quem tem conta.
      customSyntheticUser: ({ coreFields, additionalFields }) => ({
        ...coreFields,
        twoFactorEnabled: false,
        role: 'user',
        banned: false,
        banReason: null,
        banExpires: null,
        ...additionalFields,
        id: uuidv7(),
      }),
      // "Esqueci a senha" (FR-004): link de uso único, válido por 1 h (padrão do Better Auth).
      sendResetPassword: emails.resetPassword,
      // Usar o link prova que a pessoa recebe o e-mail: confirma o e-mail (BR-015) e zera o
      // bloqueio progressivo (BR-002).
      onPasswordReset: async ({ user }) => {
        await db.update(schema.user).set({ emailVerified: true }).where(eq(schema.user.id, user.id))
        await clearLoginLockout({ db, secret: config.BETTER_AUTH_SECRET }, user.email)
      },
    },
    emailVerification: {
      sendOnSignUp: true,
      // Login recusado por falta de verificação reenvia o link (só depois da senha certa).
      sendOnSignIn: true,
      // O link não abre sessão: entrar por ele pularia o 2FA. A pessoa entra em /entrar.
      autoSignInAfterVerification: false,
      expiresIn: 24 * 60 * 60,
      sendVerificationEmail: emails.verification,
    },
    // Ligado também em localhost, para o comportamento local ser o de produção (só o E2E
    // desliga, ver AUTH_RATE_LIMIT em config.ts). Guardado no banco: no Workers, a memória
    // não é compartilhada entre instâncias. As rotas sensíveis (login, cadastro, troca de
    // senha) já têm limites mais baixos por padrão.
    rateLimit: { enabled: config.AUTH_RATE_LIMIT === 'on', storage: 'database' },
    telemetry: { enabled: false },
    advanced: {
      // O Postgres gera os IDs (uuidv7(), ver `pnpm auth:generate`); o Better Auth não envia nenhum.
      database: { generateId: 'uuid', joins: true },
      cookiePrefix: 'acolhemais',
      useSecureCookies: config.BETTER_AUTH_URL.startsWith('https://'),
      // Atrás da Cloudflare, o IP real do cliente vem neste header (usado no rate limit).
      ipAddress: { ipAddressHeaders: ['cf-connecting-ip'] },
      ...(waitUntil && { backgroundTasks: { handler: waitUntil } }),
    },
    plugins: [
      // Recusa senhas que já vazaram (cadastro, troca e redefinição). Só o prefixo do hash SHA-1
      // sai do servidor (k-anonimato). Desligado em localhost para ninguém depender de rede.
      haveIBeenPwned({ enabled: !config.isLocal }),
      loginLockout({ db, secret: config.BETTER_AUTH_SECRET }),
      // 2FA por app autenticador (TOTP), com códigos de recuperação. O segredo TOTP e os códigos
      // ficam cifrados com o segredo da API. `allowPasswordless` deixa quem só usa o Google
      // ativar o 2FA (para quem tem senha, ela continua sendo pedida).
      twoFactor({ issuer: 'Acolhe+', allowPasswordless: true }),
      socialTwoFactor({ webOrigin: config.WEB_ORIGIN }),
      // Equipe da plataforma (Superadmin, Moderador, Suporte), com papéis em `user.role`.
      admin({ ac: platformAc, roles: platformRoles, defaultRole: 'user' }),
      platformTwoFactor(),
      // Travas que o plugin admin não oferece: campos editáveis, papel superadmin, conta sem
      // senha, último Responsável (BR-008, BR-013, BR-014, BR-015).
      platformGuards({ db }),
      firstAccess({
        requestPasswordReset: (email): Promise<unknown> =>
          auth.api.requestPasswordReset({ body: { email } }),
      }),
      // ONGs e protetores, com equipe, convites e papéis. As regras próprias da plataforma
      // (aprovação, concessões individuais, slugs) chegam na Fase 1.
      organization({
        ac: organizationAc,
        roles: organizationRoles,
        creatorRole: 'owner',
        // Organizações nascem da aprovação da plataforma (Fase 1), criadas no servidor.
        allowUserToCreateOrganization: false,
        disableOrganizationDeletion: true,
        // Papéis criados pela ONG a partir do catálogo. O plugin já impede criar um papel com
        // permissões que o próprio autor não tem.
        dynamicAccessControl: { enabled: true },
        invitationExpiresIn: 7 * 24 * 60 * 60,
        requireEmailVerificationOnInvitation: true,
        cancelPendingInvitationsOnReInvite: true,
        sendInvitationEmail: emails.invitation,
      }),
      // 2FA de quem tem permissão sensível e travas contra escalada (BR-054, BR-057).
      organizationGuards({ db }),
      // Auditoria das ações sobre permissões e a segurança das contas.
      auditTrail({ db }),
      i18n({ translations: { pt: authMessages }, defaultLocale: 'pt' }),
    ],
  })
  return auth
}

export type Auth = ReturnType<typeof createAuth>
