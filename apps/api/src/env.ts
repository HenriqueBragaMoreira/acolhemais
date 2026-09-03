import type { Database } from '@acolhemais/db'
import { createMiddleware } from 'hono/factory'
import { z } from 'zod'

// No Workers, a configuração (vars e segredos do wrangler) só chega junto com a
// requisição, nas bindings. Ela é validada na primeira requisição e reaproveitada
// enquanto o mesmo objeto de bindings estiver vivo: configuração errada responde
// 500 com o motivo no log, em vez de falhar no meio de uma rota.
const configSchema = z.object({
  WEB_ORIGIN: z.url().default('http://localhost:3000'),
  // Do Hyperdrive só usamos a connection string do pool gerenciado pela Cloudflare.
  HYPERDRIVE: z.object({ connectionString: z.string().min(1) }),
})

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

function loadConfig(bindings: Bindings): Config {
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
