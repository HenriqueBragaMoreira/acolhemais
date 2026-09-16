'use client'

import { cn } from '@acolhemais/ui/lib/utils'
import { useTranslations } from 'next-intl'
import Link from 'next/link'

const SECTIONS = [
  { href: '/painel', key: 'home' },
  { href: '/painel/animais', key: 'animals' },
  { href: '/painel/candidaturas', key: 'applications' },
] as const

export function Sections({ pathname }: { pathname: string | null }) {
  const t = useTranslations('AppHeader')
  return SECTIONS.map(({ href, key }) => {
    const current = href === '/painel' ? pathname === href : Boolean(pathname?.startsWith(href))
    return (
      <li key={href}>
        <Link
          href={href}
          aria-current={current ? 'page' : undefined}
          className={cn(
            'relative flex h-12 items-center lg:h-16 rounded-md px-3 font-semibold whitespace-nowrap text-white/75 transition-colors duration-150 hover:text-white focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-white',
            // O âmbar como traço só sobre o marrom, onde ele tem contraste (DESIGN.md).
            current &&
              'text-white after:absolute after:inset-x-3 after:bottom-0 after:h-[3px] after:rounded-full after:bg-primary',
          )}
        >
          {t(`sections.${key}`)}
        </Link>
      </li>
    )
  })
}
