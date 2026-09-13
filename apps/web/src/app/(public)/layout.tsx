import type { ReactNode } from 'react'
import { SiteFooter } from './_components/site-footer'
import { SiteHeader } from './_components/site-header'

/** Páginas públicas (vitrine e Sobre): cabeçalho branco, conteúdo e rodapé. */
export default function PublicLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <SiteHeader />
      <main id="conteudo" className="flex-1">
        {children}
      </main>
      <SiteFooter />
    </div>
  )
}
