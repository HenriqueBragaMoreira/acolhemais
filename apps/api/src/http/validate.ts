import type { ValidationTargets } from 'hono'
import { validator } from 'hono/validator'
import type { z } from 'zod'
import { apiError } from './errors'

/**
 * Valida a entrada da rota com Zod antes do handler, que lê o resultado com `c.req.valid()`.
 * Inválida, responde `INVALID_REQUEST`. Por passar pelo validator, o tipo da entrada chega ao
 * cliente `hc` do frontend.
 */
export function zodValidator<Target extends keyof ValidationTargets, Schema extends z.ZodType>(
  target: Target,
  schema: Schema,
) {
  return validator(target, (value, c) => {
    const result = schema.safeParse(value)
    if (!result.success) return apiError(c, 400, 'INVALID_REQUEST')
    return result.data as z.output<Schema>
  })
}
