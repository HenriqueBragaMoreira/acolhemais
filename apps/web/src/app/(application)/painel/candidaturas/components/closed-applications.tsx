'use client'

import { Button } from '@acolhemais/ui/components/button'
import { Spinner } from '@acolhemais/ui/components/spinner'
import { cn } from '@acolhemais/ui/lib/utils'
import { ChevronDownIcon } from 'lucide-react'
import { useInfiniteQuery } from '@tanstack/react-query'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { panelServices } from '@/services/panel'
import { PANEL_SURFACE } from '@/app/(application)/_components/panel-surface'

/** As encerradas (concluídas, recusadas, desistências…), fechadas por padrão. */
export function ClosedApplications({ animalId }: { animalId: string | null }) {
  const t = useTranslations('Panel.board')
  const tStages = useTranslations('Panel.stages')
  const closed = useInfiniteQuery({
    queryKey: ['panel', 'applications', 'closed', animalId],
    queryFn: ({ pageParam }) =>
      panelServices.applications({ stage: 'closed', animalId, page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: (last) => last.nextPage,
  })
  const applications = closed.data?.pages.flatMap((page) => page.applications) ?? []
  const total = closed.data?.pages[0]?.total ?? 0
  if (total === 0) return null

  return (
    <details className="group mt-12">
      <summary className="flex w-fit cursor-pointer list-none items-center gap-2 rounded-md font-bold tracking-tight focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring [&::-webkit-details-marker]:hidden">
        <ChevronDownIcon
          aria-hidden
          className="size-4 transition-transform duration-150 group-open:rotate-180"
        />
        {t('closed', { count: total })}
      </summary>
      <ul className={cn(PANEL_SURFACE, 'mt-4 divide-y divide-border')}>
        {applications.map((application) => (
          <li key={application.id}>
            <Link
              href={`/painel/candidaturas/${application.id}`}
              className="flex flex-wrap items-center gap-x-4 gap-y-1 px-4 py-3 hover:bg-muted focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring"
            >
              <span className="font-semibold">{application.profile.applicant.name}</span>
              <span className="text-sm text-muted-foreground">
                {t('for', { animal: application.animal.name })}
              </span>
              <span className="ml-auto text-sm font-semibold">{tStages(application.stage)}</span>
            </Link>
          </li>
        ))}
      </ul>
      {closed.hasNextPage && (
        <Button
          variant="outline"
          className="mt-3"
          disabled={closed.isFetchingNextPage}
          aria-busy={closed.isFetchingNextPage}
          onClick={() => void closed.fetchNextPage()}
        >
          {closed.isFetchingNextPage && <Spinner />}
          {t('more', { count: total - applications.length })}
        </Button>
      )}
    </details>
  )
}
