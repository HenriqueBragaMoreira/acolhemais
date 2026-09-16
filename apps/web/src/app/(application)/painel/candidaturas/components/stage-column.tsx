'use client'

import { type PipelineStage } from '@acolhemais/domain'
import { Button } from '@acolhemais/ui/components/button'
import { Spinner } from '@acolhemais/ui/components/spinner'
import { cn } from '@acolhemais/ui/lib/utils'
import { useInfiniteQuery } from '@tanstack/react-query'
import { useTranslations } from 'next-intl'
import { QueryError } from '@/components/query-error'
import { panelServices } from '@/services/panel'
import { PANEL_SURFACE } from '@/app/(application)/_components/panel-surface'
import { ApplicationCard } from './application-card'

export function StageColumn({
  stage,
  animalId,
}: {
  stage: PipelineStage
  animalId: string | null
}) {
  const t = useTranslations('Panel.board')
  const tStages = useTranslations('Panel.stages')
  const column = useInfiniteQuery({
    queryKey: ['panel', 'applications', stage, animalId],
    queryFn: ({ pageParam }) => panelServices.applications({ stage, animalId, page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: (last) => last.nextPage,
  })
  const applications = column.data?.pages.flatMap((page) => page.applications) ?? []
  const total = column.data?.pages[0]?.total ?? 0

  return (
    <section
      id={`etapa-${stage}`}
      aria-labelledby={`etapa-${stage}-titulo`}
      aria-busy={column.isPending}
      className="scroll-mt-6"
    >
      <h2
        id={`etapa-${stage}-titulo`}
        className="flex items-center gap-2 border-b-2 border-foreground pb-2 font-bold tracking-tight"
      >
        {tStages(stage)}
        {!column.isPending && (
          <span className="ml-auto inline-flex h-6 min-w-6 items-center justify-center rounded-md bg-background px-1.5 text-sm tabular-nums">
            <span className="sr-only">{t('count', { count: total })}</span>
            <span aria-hidden>{total}</span>
          </span>
        )}
      </h2>
      {column.isPending ? (
        <div aria-hidden className="mt-3 flex flex-col gap-3">
          <div className={cn(PANEL_SURFACE, 'h-32 animate-pulse rounded-xl')} />
          <div className={cn(PANEL_SURFACE, 'h-32 animate-pulse rounded-xl')} />
        </div>
      ) : column.isError ? (
        <QueryError
          message={t('error')}
          retryLabel={t('retry')}
          onRetry={() => void column.refetch()}
          size="sm"
          className="mt-3 text-sm"
        />
      ) : applications.length === 0 ? (
        <p className="mt-3 text-sm text-muted-foreground">{t('empty')}</p>
      ) : (
        <>
          <ol className="mt-3 flex flex-col gap-3">
            {applications.map((application) => (
              <li key={application.id}>
                <ApplicationCard application={application} />
              </li>
            ))}
          </ol>
          {column.hasNextPage && (
            <Button
              variant="outline"
              className="mt-3 w-full"
              disabled={column.isFetchingNextPage}
              aria-busy={column.isFetchingNextPage}
              onClick={() => void column.fetchNextPage()}
            >
              {column.isFetchingNextPage && <Spinner />}
              {t('more', { count: total - applications.length })}
            </Button>
          )}
        </>
      )}
    </section>
  )
}
