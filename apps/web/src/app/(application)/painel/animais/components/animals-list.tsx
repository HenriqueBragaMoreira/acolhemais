'use client'

import { Button, buttonVariants } from '@acolhemais/ui/components/button'
import { Input } from '@acolhemais/ui/components/input'
import { Label } from '@acolhemais/ui/components/label'
import { cn } from '@acolhemais/ui/lib/utils'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { PlusIcon, SearchIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { useQueryStates } from 'nuqs'
import { Pagination } from '@/components/pagination'
import { panelServices } from '@/services/panel'
import { AnimalStatusLabel } from '../../../_components/animal-status-label'
import { AnimalThumb } from '../../../_components/animal-thumb'
import { PANEL } from '../../../_components/panel-surface'
import { TimeAgo } from '../../../_components/time-ago'
import { boardHref } from '../../candidaturas/search-params'
import {
  animalsHref,
  animalsParams,
  animalsUrlKeys,
  STATUS_FILTERS,
  type StatusFilter,
} from '../search-params'

/** Os animais da organização em qualquer situação, 20 por página (FR-030, FR-032). */
export function AnimalsList() {
  const t = useTranslations('Panel.animals')
  const tProfile = useTranslations('AnimalProfile')
  const tOptions = useTranslations('Panel.animalForm.options')
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
                  {data && (
                    <span className="tabular-nums opacity-70">
                      {key ? data.counts[STATUS_FILTERS[key]] : data.total}
                    </span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="flex flex-col gap-2 lg:w-72">
          <Label htmlFor="busca-animal">{t('search')}</Label>
          <div className="relative">
            <SearchIcon
              aria-hidden
              className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              id="busca-animal"
              type="search"
              value={search}
              placeholder={t('searchPlaceholder')}
              autoComplete="off"
              className="pl-9"
              // Busca nova volta para a primeira página.
              onChange={(event) => void setParams({ search: event.target.value, page: null })}
            />
          </div>
        </div>
      </div>

      {isError ? (
        <div className={cn(PANEL, 'mt-6 p-6 text-center')}>
          <p className="font-semibold">{t('error')}</p>
          <Button variant="outline" className="mt-4" onClick={() => void refetch()}>
            {t('retry')}
          </Button>
        </div>
      ) : isPending ? (
        <div aria-hidden className={cn(PANEL, 'mt-6 h-96 animate-pulse')} />
      ) : data.animals.length === 0 ? (
        <div className={cn(PANEL, 'mt-6 p-8 text-center')}>
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
          <ul className={cn(PANEL, 'mt-6 divide-y divide-border')}>
            {data.animals.map((animal) => (
              <li
                key={animal.id}
                className="relative grid grid-cols-[3.5rem_minmax(0,1fr)] items-center gap-x-4 gap-y-2 px-4 py-3 hover:bg-muted sm:grid-cols-[3.5rem_minmax(0,1fr)_9rem_11rem_12rem] sm:px-5"
              >
                <AnimalThumb
                  photo={animal.photos[0]}
                  className="row-span-2 w-14 sm:row-span-1"
                  sizes="56px"
                />
                <div className="min-w-0">
                  <Link
                    href={`/painel/animais/${animal.id}`}
                    className="font-semibold underline-offset-4 after:absolute after:inset-0 hover:underline focus-visible:outline-none focus-visible:after:rounded-lg focus-visible:after:outline-2 focus-visible:after:-outline-offset-2 focus-visible:after:outline-ring"
                  >
                    {animal.name}
                  </Link>
                  <p className="text-sm text-muted-foreground">
                    {[
                      tOptions(`species.${animal.species}`),
                      tProfile('sex', { sex: animal.sex }),
                      tProfile('age', { age: animal.ageGroup, sex: animal.sex }),
                    ].join(' · ')}
                  </p>
                </div>
                <div className="col-start-2 flex flex-wrap items-center gap-x-4 gap-y-1 sm:contents">
                  <span>
                    <AnimalStatusLabel status={animal.status} />
                  </span>
                  <span className="text-sm">
                    {animal.activeApplications > 0 ? (
                      <Link
                        href={`/painel/candidaturas${boardHref({ animal: animal.id })}`}
                        className="relative z-10 rounded-sm font-semibold underline decoration-1 underline-offset-4 hover:decoration-2"
                      >
                        {t('applications', { count: animal.activeApplications })}
                      </Link>
                    ) : (
                      <span className="text-muted-foreground">
                        {t('applications', { count: 0 })}
                      </span>
                    )}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {t('updated')} <TimeAgo value={animal.updatedAt} />
                  </span>
                </div>
              </li>
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
