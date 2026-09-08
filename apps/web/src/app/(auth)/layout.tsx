import type { ReactNode } from 'react'
import { AuthFooter } from './_components/auth-footer'
import { AuthHeader } from './_components/auth-header'
import { AuthIllustration } from './_components/auth-illustration'

/**
 * Moldura das telas de acesso (Entrar e código 2FA): o animal ocupa o quadro e a interface
 * fica ancorada embaixo, à esquerda, num painel claro. No celular, a ilustração fica no topo
 * e o formulário logo abaixo, sem sobreposição.
 */
export default function AuthLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <div className="relative isolate flex min-h-dvh flex-col bg-background lg:bg-shell">
      <div className="relative h-[36svh] min-h-56 overflow-hidden lg:absolute lg:inset-0 lg:-z-10 lg:h-auto">
        <AuthIllustration />
        <div
          aria-hidden
          className="absolute inset-0 bg-linear-to-b from-veil/75 via-veil/25 via-45% to-transparent lg:bg-linear-160 lg:from-veil/80 lg:via-veil/35 lg:via-30% lg:to-transparent lg:to-60%"
        />
        <AuthHeader />
      </div>

      <main className="relative flex flex-1 flex-col lg:min-h-dvh lg:justify-end lg:px-12 lg:pt-[clamp(13rem,30svh,18rem)] lg:pb-12">
        <div className="flex w-full flex-1 flex-col bg-card px-6 pt-8 pb-6 sm:px-8 lg:w-108 lg:flex-none lg:rounded-2xl lg:p-8 lg:shadow-[0_24px_64px_-16px_rgb(26_16_10/0.55)]">
          <div className="flex-1">{children}</div>
          <AuthFooter />
        </div>
      </main>
    </div>
  )
}
