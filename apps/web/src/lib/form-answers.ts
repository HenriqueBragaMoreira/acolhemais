import { z } from 'zod'

/*
 * Peças dos schemas dos formulários longos (candidatura, cadastro de animal). As mensagens são
 * chaves de `FormErrors` (traduzidas na tela).
 */

/** Uma escolha obrigatória: nasce `null` (sem resposta) e precisa de uma das opções. */
export function choice<const T extends readonly [string, ...string[]]>(values: T) {
  return z
    .enum(values)
    .nullable()
    .refine((value) => value !== null, 'required')
}

/** E-mail obrigatório e válido. */
export const emailField = z.string().trim().min(1, 'emailRequired').pipe(z.email('emailInvalid'))

export const yesNo = choice(['yes', 'no'])

/** Texto obrigatório, sem espaços nas pontas. */
export const text = z.string().trim().min(1, 'required').max(1000, 'tooLong')

/** Texto que só vale quando outra resposta pede; vazio quando não se aplica. */
export const optionalText = z.string().trim().max(1000, 'tooLong')

/** Exige `field` quando `when` é verdade, para respostas que dependem de outra. */
export function requireWhen(
  context: z.RefinementCtx,
  when: boolean,
  value: unknown,
  field: string,
) {
  if (when && (value === null || value === '')) {
    context.addIssue({ code: 'custom', message: 'required', path: [field] })
  }
}
