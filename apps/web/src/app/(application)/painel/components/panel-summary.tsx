'use client'

import { buttonVariants } from '@acolhemais/ui/components/button'
import { cn } from '@acolhemais/ui/lib/utils'
import { useQuery } from '@tanstack/react-query'
import { ArrowRightIcon, ClockIcon, PlusIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { panelServices } from '@/services/panel'
import { AdopterBadges } from '../../_components/adopter-badges'
import { AnimalThumb } from '../../_components/animal-thumb'
import { PANEL } from '../../_components/panel-surface'
import { TimeAgo } from '../../_components/time-ago'
import { StageCounts } from '../../_components/stage-counts'
import { animalsHref } from '../animais/search-params'
import { PanelSummarySkeleton } from './panel-summary-skeleton'

export function PanelSummary() {
  const t = useTranslations('Panel.home')
  const { data, isPending, isError, refetch } = useQuery({
    queryKey: ['panel', 'summary'],
    queryFn: () => panelServices.summary(),
  })

  if (isPending) return <PanelSummarySkeleton />
  if (isError) {
    return (
      <div className={cn(PANEL, 'mt-8 p-6')}>
        <p className="font-semibold">{t('error')}</p>
        <button
          type="button"
          className={cn(buttonVariants({ variant: 'outline' }), 'mt-4')}
          onClick={() => void refetch()}
        >
          {t('retry')}
        </button>
      </div>
    )
  }

  const animalRows = [
    { key: 'available', count: data.animals.available, filter: 'disponiveis' },
    { key: 'inProcess', count: data.animals.inProcess, filter: 'em-processo' },
    { key: 'draft', count: data.animals.draft, filter: 'rascunhos' },
    { key: 'unavailable', count: data.animals.unavailable, filter: 'indisponiveis' },
  ] as const

  return (
    <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start">
      <section aria-labelledby="pipeline-title" className={cn(PANEL, 'p-5 sm:p-8')}>
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <h2 id="pipeline-title" className="text-xl font-bold tracking-tight">
            {t('applications')}
          </h2>
          <Link
            href="/painel/candidaturas"
            className="inline-flex items-center gap-1 rounded-sm font-semibold text-ring underline decoration-1 underline-offset-4 hover:decoration-2"
          >
            {t('seeAll')}
            <ArrowRightIcon aria-hidden className="size-4" />
          </Link>
        </div>
        <div className="mt-6">
          <StageCounts counts={data.pipeline} />
        </div>
        {data.awaitingAdopter > 0 && (
          <p className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
            <ClockIcon aria-hidden className="size-4" />
            {t('awaiting', { count: data.awaitingAdopter })}
          </p>
        )}

        <h3 className="mt-10 border-t border-border pt-6 font-bold tracking-tight">
          {t('recent')}
        </h3>
        {data.recent.length === 0 ? (
          <p className="mt-3 text-muted-foreground">{t('noRecent')}</p>
        ) : (
          <ul className="mt-2 divide-y divide-border">
            {data.recent.map((application) => (
              <li
                key={application.id}
                className="group relative -mx-2 flex items-center gap-4 rounded-lg px-2 py-3 has-[a:hover]:bg-muted"
              >
                <AnimalThumb photo={application.animal.cover} className="w-11" />
                <div className="min-w-0 flex-1">
                  {/* O nome é o link e cobre a linha; os selos abrem a explicação por cima dele. */}
                  <Link
                    href={`/painel/candidaturas/${application.id}`}
                    className="block font-semibold after:absolute after:inset-0 after:rounded-lg focus-visible:outline-none focus-visible:after:outline-2 focus-visible:after:outline-offset-2 focus-visible:after:outline-ring"
                  >
                    {application.profile.applicant.name}
                  </Link>
                  <p className="text-sm text-muted-foreground">
                    {t('recentFor', { animal: application.animal.name })} ·{' '}
                    <TimeAgo value={application.sentAt} />
                  </p>
                  {/* No celular, os selos descem para baixo do nome: "Atenção" nunca some. */}
                  <AdopterBadges
                    badges={application.badges}
                    incidents={application.incidents}
                    className="relative z-10 mt-2 w-fit sm:hidden"
                  />
                </div>
                <AdopterBadges
                  badges={application.badges}
                  incidents={application.incidents}
                  className="relative z-10 hidden sm:flex"
                />
                <ArrowRightIcon
                  aria-hidden
                  className="size-4 shrink-0 text-muted-foreground group-has-[a:hover]:text-foreground"
                />
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="animals-title" className={cn(PANEL, 'p-5 sm:p-6')}>
        <h2 id="animals-title" className="text-xl font-bold tracking-tight">
          {t('animals')}
        </h2>
        <dl className="mt-4 divide-y divide-border">
          {animalRows.map(({ key, count, filter }) => (
            <div key={key} className="flex items-center justify-between gap-4 py-2.5">
              <dt>
                <Link
                  href={`/painel/animais${animalsHref({ status: filter })}`}
                  className="rounded-sm underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                >
                  {t(`animalCounts.${key}`)}
                </Link>
              </dt>
              <dd className="text-lg font-bold tabular-nums">{count}</dd>
            </div>
          ))}
        </dl>
        <Link
          href="/painel/animais/novo"
          className={cn(buttonVariants({ size: 'lg' }), 'mt-6 w-full')}
        >
          <PlusIcon aria-hidden />
          {t('newAnimal')}
        </Link>
      </section>
    </div>
  )
}
