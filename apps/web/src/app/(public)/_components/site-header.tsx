'use client'

import { buttonVariants } from '@acolhemais/ui/components/button'
import { cn } from '@acolhemais/ui/lib/utils'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Wordmark } from '@/components/wordmark'

/** Cabeçalho branco das páginas públicas: a marca e, à direita, "Sobre" e "Entrar". */
export function SiteHeader() {
  const t = useTranslations('SiteHeader')
  const pathname = usePathname()

  return (
    <header className="border-b border-border bg-background">
      <a
        href="#conteudo"
        className="sr-only rounded-md bg-background px-3 py-2 font-semibold focus-visible:not-sr-only focus-visible:absolute focus-visible:top-3 focus-visible:left-3 focus-visible:z-10"
      >
        {t('skipToContent')}
      </a>
      <div className="mx-auto flex h-16 max-w-[90rem] items-center justify-between gap-4 px-4 sm:px-6 lg:px-10">
        <Link href="/" aria-label={t('home')} className="rounded-md text-xl">
          <Wordmark />
        </Link>
        <nav aria-label={t('navigation')}>
          <ul className="flex items-center gap-1 sm:gap-2">
            <li>
              <Link
                href="/sobre"
                aria-current={pathname === '/sobre' ? 'page' : undefined}
                className={cn(buttonVariants({ variant: 'ghost' }), 'aria-[current=page]:bg-muted')}
              >
                {t('about')}
              </Link>
            </li>
            <li>
              <Link href="/entrar" className={cn(buttonVariants({ variant: 'outline' }))}>
                {t('signIn')}
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  )
}
