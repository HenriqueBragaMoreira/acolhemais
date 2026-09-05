import { schema } from '@acolhemais/db'
import type { Database } from '@acolhemais/db'
import { drizzleAdapter } from '@better-auth/drizzle-adapter/relations-v2'
import { i18n } from '@better-auth/i18n'
import { betterAuth } from 'better-auth'
import { haveIBeenPwned } from 'better-auth/plugins/haveibeenpwned'
import type { Config } from '../env'
import { loginLockout } from './login-lockout'
import { authMessages } from './messages'

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
  return betterAuth({
    appName: 'Acolhe+',
    baseURL: config.BETTER_AUTH_URL,
    secret: config.BETTER_AUTH_SECRET,
    trustedOrigins: [config.WEB_ORIGIN],
    database: drizzleAdapter(db, { provider: 'pg', schema, transaction: true }),
    socialProviders: {
      // Opcional: só liga com as duas credenciais (ver env.ts).
      ...(config.GOOGLE_CLIENT_ID &&
        config.GOOGLE_CLIENT_SECRET && {
          google: {
            clientId: config.GOOGLE_CLIENT_ID,
            clientSecret: config.GOOGLE_CLIENT_SECRET,
            prompt: 'select_account' as const,
          },
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
    },
    // Ligado também em localhost, para o comportamento local ser o de produção. Guardado no
    // banco: no Workers, a memória não é compartilhada entre instâncias. As rotas sensíveis
    // (login, cadastro, troca de senha) já têm limites mais baixos por padrão.
    rateLimit: { enabled: true, storage: 'database' },
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
      i18n({ translations: { pt: authMessages }, defaultLocale: 'pt' }),
    ],
  })
}

export type Auth = ReturnType<typeof createAuth>
