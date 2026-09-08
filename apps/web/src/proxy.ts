import { getSessionCookie } from 'better-auth/cookies'
import { type NextRequest, NextResponse } from 'next/server'

/**
 * Barra as rotas da área logada (grupo `(application)`) para quem não tem cookie de sessão,
 * antes de renderizar qualquer coisa. Só confere se o cookie existe: a validade da sessão é
 * conferida pela API, e a página volta para /entrar se ela tiver vencido.
 *
 * O cookie é da API. Em localhost a web o recebe porque o host é o mesmo (só muda a porta);
 * em produção, web e API precisam compartilhar o domínio do cookie (item de deploy).
 */
export function proxy(request: NextRequest) {
  if (getSessionCookie(request, { cookiePrefix: 'acolhemais' })) return NextResponse.next()

  return NextResponse.redirect(new URL('/entrar', request.url))
}

export const config = {
  // As rotas do grupo (application). Nova página logada entra aqui.
  matcher: ['/painel/:path*'],
}
