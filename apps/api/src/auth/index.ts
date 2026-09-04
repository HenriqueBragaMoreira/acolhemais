import { schema } from '@acolhemais/db'
import type { Database } from '@acolhemais/db'
import { drizzleAdapter } from '@better-auth/drizzle-adapter/relations-v2'
import { betterAuth } from 'better-auth'
import type { Config } from '../env'

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
    emailAndPassword: { enabled: true, minPasswordLength: 12 },
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
  })
}

export type Auth = ReturnType<typeof createAuth>
