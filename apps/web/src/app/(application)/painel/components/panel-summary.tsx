'use client'

import { cn } from '@acolhemais/ui/lib/utils'
import { useQuery } from '@tanstack/react-query'
import { useTranslations } from 'next-intl'
import { QueryError } from '@/components/query-error'
import { panelServices } from '@/services/panel'
import { PANEL_SURFACE } from '@/app/(application)/_components/panel-surface'
import { AnimalCounts } from './animal-counts'
import { PanelSummarySkeleton } from './panel-summary-skeleton'
import { PipelineOverview } from './pipeline-overview'

/** O Início do painel: as candidaturas pelo caminho e, ao lado, os animais por situação. */
export function PanelSummary() {
  const t = useTranslations('Panel.home')
  const { data, isPending, isError, refetch } = useQuery({
    queryKey: ['panel', 'summary'],
    queryFn: () => panelServices.summary(),
  })

  if (isPending) return <PanelSummarySkeleton />
  if (isError) {
    return (
      <QueryError
        message={t('error')}
        retryLabel={t('retry')}
        onRetry={() => void refetch()}
        className={cn(PANEL_SURFACE, 'mt-8 p-6')}
      />
    )
  }

  return (
    <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start">
      <PipelineOverview
        pipeline={data.pipeline}
        awaitingAdopter={data.awaitingAdopter}
        recent={data.recent}
      />
      <AnimalCounts counts={data.animals} />
    </div>
  )
}
