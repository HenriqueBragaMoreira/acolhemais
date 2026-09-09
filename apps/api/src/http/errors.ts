import type { Context, ErrorHandler, NotFoundHandler } from 'hono'
import { HTTPException } from 'hono/http-exception'
import type { ContentfulStatusCode } from 'hono/utils/http-status'
import { authMessages } from '../auth/messages'

/** Mensagens das rotas próprias da API, no mesmo formato de erro do Better Auth (`code`, `message`). */
export const apiMessages = {
  UNAUTHORIZED: 'Entre na sua conta para continuar.',
  FORBIDDEN: 'Você não tem permissão para fazer isso.',
  TWO_FACTOR_REQUIRED: authMessages.TWO_FACTOR_REQUIRED,
  INVALID_REQUEST: 'Os dados enviados são inválidos.',
  NOT_FOUND: 'Endereço não encontrado.',
  INTERNAL_ERROR: 'Algo deu errado do nosso lado. Tente novamente em instantes.',
  UNKNOWN_PLATFORM_SETTING: 'Parâmetro da plataforma desconhecido.',
  INVALID_PLATFORM_SETTING: 'Valor inválido para o parâmetro da plataforma.',
} as const

export type ApiErrorCode = keyof typeof apiMessages

/** Resposta de erro: `code` estável para o frontend e `message` em português. */
export function apiError(
  c: Context,
  status: ContentfulStatusCode,
  code: ApiErrorCode,
  details?: string,
) {
  return c.json({ code, message: apiMessages[code], ...(details && { details }) }, status)
}

/**
 * Erros que escapam das rotas, no formato de `apiError`. Os do cliente lançados pelo Hono (ex.:
 * JSON malformado no validator) viram `INVALID_REQUEST`; o resto é falha nossa e vai para o log.
 */
export const handleError: ErrorHandler = (error, c) => {
  if (error instanceof HTTPException && error.status < 500) {
    return apiError(c, error.status, 'INVALID_REQUEST')
  }
  console.error(error)
  return apiError(c, 500, 'INTERNAL_ERROR')
}

export const handleNotFound: NotFoundHandler = (c) => apiError(c, 404, 'NOT_FOUND')
