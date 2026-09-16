'use client'

import { buttonVariants } from '@acolhemais/ui/components/button'
import { cn } from '@acolhemais/ui/lib/utils'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { PlusIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { useQueryStates } from 'nuqs'
import { Pagination } from '@/components/pagination'
import { QueryError } from '@/components/query-error'
import { panelServices } from '@/services/panel'
import { PANEL_SURFACE } from '@/app/(application)/_components/panel-surface'
import { animalsHref, animalsParams, animalsUrlKeys, STATUS_FILTERS } from '../search-params'
import { AnimalNameSearch } from './animal-name-search'
import { AnimalRow } from './animal-row'
import { AnimalStatusFilters } from './animal-status-filters'

/** Os animais da organização em qualquer situação, 20 por página (FR-030, FR-032). */
export function AnimalsList() {
  const t = useTranslations('Panel.animals')
  const [{ status, search, page }, setParams] = useQueryStates(animalsParams, {
    urlKeys: animalsUrlKeys,
  })
  const { data, isPending, isError, refetch } = useQuery({
    queryKey: ['panel', 'animals', status, search, page],
    queryFn: () =>
      panelServices.animals({ status: status && STATUS_FILTERS[status], search, page }),
    // Entre uma busca e outra, a lista anterior fica na tela em vez de piscar o esqueleto.
    placeholderData: keepPreviousData,
  })

  return (
    <>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-balance">{t('title')}</h1>
          <p className="mt-2 max-w-prose text-pretty text-muted-foreground">{t('intro')}</p>
        </div>
        <Link href="/painel/animais/novo" className={buttonVariants({ size: 'lg' })}>
          <PlusIcon aria-hidden />
          {t('new')}
        </Link>
      </div>

      <div className="mt-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <AnimalStatusFilters
          status={status}
          search={search}
          counts={data && { byStatus: data.counts, total: data.total }}
        />
        <AnimalNameSearch
          value={search}
          // Busca nova volta para a primeira página.
          onChange={(value) => void setParams({ search: value, page: null })}
        />
      </div>

      {isError ? (
        <QueryError
          message={t('error')}
          retryLabel={t('retry')}
          onRetry={() => void refetch()}
          className={cn(PANEL_SURFACE, 'mt-6 p-6 text-center')}
        />
      ) : isPending ? (
        <div aria-hidden className={cn(PANEL_SURFACE, 'mt-6 h-96 animate-pulse')} />
      ) : data.animals.length === 0 ? (
        <div className={cn(PANEL_SURFACE, 'mt-6 p-8 text-center')}>
          <p className="font-semibold">{search ? t('noMatch', { search }) : t('empty')}</p>
          <Link
            href="/painel/animais"
            className={cn(buttonVariants({ variant: 'outline' }), 'mt-4')}
          >
            {t('showAll')}
          </Link>
        </div>
      ) : (
        <>
          <p className="sr-only" aria-live="polite">
            {t('results', { count: data.animals.length, page: data.page, pages: data.pages })}
          </p>
          <ul className={cn(PANEL_SURFACE, 'mt-6 divide-y divide-border')}>
            {data.animals.map((animal) => (
              <AnimalRow key={animal.id} animal={animal} />
            ))}
          </ul>
          <Pagination
            className="mt-6"
            page={data.page}
            pages={data.pages}
            href={(target) =>
              `/painel/animais${animalsHref({ status, search: search || null, page: target })}`
            }
          />
        </>
      )}
    </>
  )
}
