import app from '../app'
import { env, randomIp, WEB_ORIGIN } from './auth'

/**
 * Requisição às rotas próprias da API (fora de `/api/auth`), como o frontend faria. Um `body`
 * em texto vai como está (ex.: JSON malformado); o resto vai serializado em JSON.
 */
export function request(
  method: string,
  path: string,
  { body, cookie }: { body?: unknown; cookie?: string } = {},
) {
  return app.request(
    path,
    {
      method,
      headers: {
        'cf-connecting-ip': randomIp(),
        origin: WEB_ORIGIN,
        ...(cookie && { cookie }),
        ...(body !== undefined && { 'content-type': 'application/json' }),
      },
      ...(body !== undefined && { body: typeof body === 'string' ? body : JSON.stringify(body) }),
    },
    env,
  )
}
