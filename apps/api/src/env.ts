import { z } from 'zod'

// Toda variável de ambiente é validada na inicialização: configuração errada
// derruba o processo na hora, em vez de falhar no meio de uma requisição.
const envSchema = z.object({
  PORT: z.coerce.number().int().positive().default(3001),
  WEB_ORIGIN: z.url().default('http://localhost:3000'),
})

export const env = envSchema.parse(process.env)
