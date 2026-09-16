import type { ReactNode } from 'react'
import { AppHeader } from './_components/app-header'

/**
 * Área logada. O acesso é barrado antes em `src/proxy.ts` (sem cookie de sessão, vai para
 * /entrar); as páginas ainda conferem a sessão, porque o cookie pode estar vencido.
 */
export default function ApplicationLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <div className="min-h-dvh bg-secondary">
      <AppHeader />
      <main
        id="conteudo"
        tabIndex={-1}
        className="mx-auto max-w-7xl px-4 py-8 outline-none sm:px-6 sm:py-10 lg:px-10"
      >
        {children}
      </main>
    </div>
  )
}
