'use client'

import { useQuery } from '@tanstack/react-query'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { Suspense } from 'react'
import { Wordmark } from '@/components/wordmark'
import { panelServices } from '@/services/panel'
import { CurrentPanelNavLinks } from './current-panel-nav-links'
import { PanelNavLinks } from './panel-nav-links'
import { SignOutButton } from './sign-out-button'

/**
 * Faixa do topo da área logada, no marrom da moldura de acesso: a marca, a organização, a saída
 * e, embaixo, as abas do painel.
 */
export function AppHeader() {
  const t = useTranslations('AppHeader')
  const { data: organization } = useQuery({
    queryKey: ['panel', 'organization'],
    queryFn: () => panelServices.organization(),
  })

  return (
    <header className="bg-shell text-white">
      <a
        href="#conteudo"
        className="sr-only rounded-md bg-background px-3 py-2 font-semibold text-foreground focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-50"
      >
        {t('skip')}
      </a>
      {/* Uma faixa só de 64px no computador; abaixo de 64rem, as abas descem para uma segunda linha. */}
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-4 px-4 sm:px-6 lg:h-16 lg:flex-nowrap lg:px-10">
        <div className="flex h-16 min-w-0 flex-1 items-center gap-3 lg:flex-none">
          <Link
            href="/"
            aria-label={t('home')}
            className="shrink-0 rounded-md text-xl focus-visible:outline-white"
          >
            <Wordmark onDark />
          </Link>
          {organization && (
            <>
              <span aria-hidden className="h-5 w-px bg-white/30" />
              <span className="truncate font-semibold text-white/90">{organization.name}</span>
            </>
          )}
        </div>
        <SignOutButton />
        <nav
          aria-label={t('nav')}
          className="order-3 -mx-4 w-[calc(100%+2rem)] border-t border-white/10 sm:-mx-6 sm:w-[calc(100%+3rem)] lg:order-2 lg:mx-0 lg:w-auto lg:flex-1 lg:border-0"
        >
          {/* No computador, as abas ficam à direita, junto do "Sair" (decisão de 2026-11-12). */}
          <ul className="flex gap-1 overflow-x-auto px-2 sm:px-4 lg:justify-end lg:border-r lg:border-white/15 lg:px-0 lg:pr-3">
            {/* A aba atual depende da URL, que só existe na hora do pedido: sem ela, nenhuma marcada. */}
            <Suspense fallback={<PanelNavLinks pathname={null} />}>
              <CurrentPanelNavLinks />
            </Suspense>
          </ul>
        </nav>
      </div>
    </header>
  )
}
