'use client'

import type { AnimalStatus } from '@acolhemais/domain'
import { buttonVariants } from '@acolhemais/ui/components/button'
import { cn } from '@acolhemais/ui/lib/utils'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { animalsHref, STATUS_FILTERS, type StatusFilter } from '../search-params'

type AnimalStatusFiltersProps = {
  status: StatusFilter | null
  search: string
  /** Contagens por situação e o total; ausentes enquanto a lista carrega. */
  counts?: { byStatus: Record<AnimalStatus, number>; total: number } | undefined
}

/** As abas de situação da lista de animais ("Todos", "Disponíveis"…), com a contagem de cada. */
export function AnimalStatusFilters({ status, search, counts }: AnimalStatusFiltersProps) {
  const t = useTranslations('Panel.animals')

  return (
    <nav aria-label={t('filter')} className="-mx-4 overflow-x-auto px-4 lg:order-2">
      <ul className="flex gap-2">
        {([null, ...Object.keys(STATUS_FILTERS)] as (StatusFilter | null)[]).map((key) => (
          <li key={key ?? 'todos'}>
            <Link
              href={`/painel/animais${animalsHref({ status: key, search: search || null })}`}
              aria-current={status === key ? 'page' : undefined}
              className={cn(
                buttonVariants({ variant: status === key ? 'default' : 'ghost', size: 'sm' }),
                status === key && 'bg-foreground text-background hover:bg-foreground',
              )}
            >
              {t(`filters.${key ?? 'all'}`)}
              {counts && (
                <span className="tabular-nums opacity-70">
                  {key ? counts.byStatus[STATUS_FILTERS[key]] : counts.total}
                </span>
              )}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}
