'use client'

import type { PipelineStage } from '@acolhemais/domain'
import { cn } from '@acolhemais/ui/lib/utils'
import { ArrowRightIcon, ClockIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import type { ApplicationWithAnimal } from '@/services/panel/types'
import { PANEL_SURFACE } from '@/app/(application)/_components/panel-surface'
import { StageCounts } from '@/app/(application)/_components/stage-counts'
import { RecentApplicationRow } from './recent-application-row'

type PipelineOverviewProps = {
  pipeline: Record<PipelineStage, number>
  awaitingAdopter: number
  recent: ApplicationWithAnimal[]
}

/** As candidaturas por etapa, quantas aguardam o adotante e as que acabaram de chegar. */
export function PipelineOverview({ pipeline, awaitingAdopter, recent }: PipelineOverviewProps) {
  const t = useTranslations('Panel.home')

  return (
    <section aria-labelledby="pipeline-title" className={cn(PANEL_SURFACE, 'p-5 sm:p-8')}>
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
        <StageCounts counts={pipeline} />
      </div>
      {awaitingAdopter > 0 && (
        <p className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
          <ClockIcon aria-hidden className="size-4" />
          {t('awaiting', { count: awaitingAdopter })}
        </p>
      )}

      <h3 className="mt-10 border-t border-border pt-6 font-bold tracking-tight">{t('recent')}</h3>
      {recent.length === 0 ? (
        <p className="mt-3 text-muted-foreground">{t('noRecent')}</p>
      ) : (
        <ul className="mt-2 divide-y divide-border">
          {recent.map((application) => (
            <RecentApplicationRow key={application.id} application={application} />
          ))}
        </ul>
      )}
    </section>
  )
}
