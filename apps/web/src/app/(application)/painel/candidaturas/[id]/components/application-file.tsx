'use client'

import { buttonVariants } from '@acolhemais/ui/components/button'
import { Spinner } from '@acolhemais/ui/components/spinner'
import { cn } from '@acolhemais/ui/lib/utils'
import { useQuery } from '@tanstack/react-query'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { use } from 'react'
import { panelServices } from '@/services/panel'
import { ApplicationDetails } from './application-details'

/** A ficha da candidatura (FR-045): quem é, o que respondeu, o caminho e as ações. */
export function ApplicationFile({ id }: { id: Promise<string> }) {
  const applicationId = use(id)
  const t = useTranslations('Panel.file')
  const application = useQuery({
    queryKey: ['panel', 'application', applicationId],
    queryFn: () => panelServices.application(applicationId),
  })
  const organization = useQuery({
    queryKey: ['panel', 'organization'],
    queryFn: () => panelServices.organization(),
  })

  if (application.isPending || organization.isPending) {
    return (
      <p className="flex items-center gap-2 text-muted-foreground">
        <Spinner />
        {t('loading')}
      </p>
    )
  }
  if (!application.data || !organization.data) {
    return (
      <div className="max-w-xl">
        <h1 className="text-3xl font-bold tracking-tight">{t('notFound')}</h1>
        <p className="mt-2 text-muted-foreground">{t('notFoundHint')}</p>
        <Link href="/painel/candidaturas" className={cn(buttonVariants(), 'mt-6')}>
          {t('back')}
        </Link>
      </div>
    )
  }

  return <ApplicationDetails application={application.data} organization={organization.data} />
}
