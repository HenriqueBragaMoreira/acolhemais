import type { Context } from 'hono'
import type { ContentfulStatusCode } from 'hono/utils/http-status'
import { authMessages } from '../auth/messages'

/** Mensagens das rotas próprias da API, no mesmo formato de erro do Better Auth (`code`, `message`). */
export const apiMessages = {
  UNAUTHORIZED: 'Entre na sua conta para continuar.',
  FORBIDDEN: 'Você não tem permissão para fazer isso.',
  TWO_FACTOR_REQUIRED: authMessages.TWO_FACTOR_REQUIRED,
  INVALID_REQUEST: 'Os dados enviados são inválidos.',
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
