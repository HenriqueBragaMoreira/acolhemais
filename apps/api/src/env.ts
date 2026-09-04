import type { Database } from '@acolhemais/db'
import { createMiddleware } from 'hono/factory'
import { z } from 'zod'

// No Workers, a configuração (vars e segredos do wrangler) só chega junto com a
// requisição, nas bindings. Ela é validada na primeira requisição e reaproveitada
// enquanto o mesmo objeto de bindings estiver vivo: configuração errada responde
// 500 com o motivo no log, em vez de falhar no meio de uma rota.
// Segredo fixo para desenvolvimento: só é aceito quando a API roda em localhost.
const DEV_AUTH_SECRET = 'acolhemais-dev-only-secret-never-use-in-production'

const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1'])

const configSchema = z
  .object({
    WEB_ORIGIN: z.url().default('http://localhost:3000'),
    // Do Hyperdrive só usamos a connection string do pool gerenciado pela Cloudflare.
    HYPERDRIVE: z.object({ connectionString: z.string().min(1) }),
    // URL pública da API: base das rotas do Better Auth (/api/auth) e dos callbacks OAuth.
    BETTER_AUTH_URL: z.url().default('http://localhost:3001'),
    // Assina os cookies de sessão e cifra os segredos de 2FA. Em produção vem de `wrangler secret`.
    BETTER_AUTH_SECRET: z.string().min(32).optional(),
    // Login com Google é opcional: sem as duas credenciais, o provedor fica desligado.
    GOOGLE_CLIENT_ID: z.string().min(1).optional(),
    GOOGLE_CLIENT_SECRET: z.string().min(1).optional(),
  })
  .superRefine((config, ctx) => {
    const isLocal =
      URL.canParse(config.BETTER_AUTH_URL) &&
      LOCAL_HOSTS.has(new URL(config.BETTER_AUTH_URL).hostname)
    if (!config.BETTER_AUTH_SECRET && !isLocal) {
      ctx.addIssue({
        code: 'custom',
        path: ['BETTER_AUTH_SECRET'],
        message: 'obrigatório fora do ambiente local',
      })
    }
    if (!config.GOOGLE_CLIENT_ID !== !config.GOOGLE_CLIENT_SECRET) {
      ctx.addIssue({
        code: 'custom',
        path: ['GOOGLE_CLIENT_SECRET'],
        message: 'GOOGLE_CLIENT_ID e GOOGLE_CLIENT_SECRET vêm juntos',
      })
    }
  })
  .transform((config) => ({
    ...config,
    BETTER_AUTH_SECRET: config.BETTER_AUTH_SECRET ?? DEV_AUTH_SECRET,
  }))

export type Config = z.infer<typeof configSchema>

/** Bindings que o Worker recebe, antes da validação. */
export type Bindings = z.input<typeof configSchema>

export type AppEnv = {
  Bindings: Bindings
  Variables: {
    config: Config
    /** Cliente do banco da requisição, criado no primeiro uso (ver `database` em ./db). */
    db: () => Database
  }
}

const cache = new WeakMap<Bindings, Config>()

export function loadConfig(bindings: Bindings): Config {
  const cached = cache.get(bindings)
  if (cached) return cached

  const result = configSchema.safeParse(bindings)
  if (!result.success) {
    throw new Error(`Configuração inválida da API:\n${z.prettifyError(result.error)}`)
  }
  cache.set(bindings, result.data)
  return result.data
}

/** Valida as bindings e expõe a configuração tipada em `c.var.config`. */
export const config = createMiddleware<AppEnv>(async (c, next) => {
  c.set('config', loadConfig(c.env))
  await next()
})
