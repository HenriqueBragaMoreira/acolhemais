'use client'

import { cn } from '@acolhemais/ui/lib/utils'
import { ClockIcon } from 'lucide-react'
import { useFormatter, useTranslations } from 'next-intl'
import type { ApplicationWithAnimal } from '@/services/panel/types'
import { AdopterBadges } from '@/app/(application)/_components/adopter-badges'
import { AnimalThumb } from '@/app/(application)/_components/animal-thumb'
import { PANEL_SURFACE } from '@/app/(application)/_components/panel-surface'
import { StageProgress } from '@/app/(application)/_components/stage-progress'
import { ApplicationOutcome } from './application-outcome'

/** O topo da ficha: quem é a pessoa, os selos, a etapa e o pedido de informação em aberto. */
export function ApplicationOverview({ application }: { application: ApplicationWithAnimal }) {
  const t = useTranslations('Panel.file')
  const format = useFormatter()
  const { applicant } = application.profile
  const lastRequest = application.history.findLast((event) => event.kind === 'info-requested')

  return (
    <section
      className={cn(PANEL_SURFACE, 'p-5 sm:p-8 lg:col-start-1')}
      aria-labelledby="ficha-titulo"
    >
      <div className="flex items-start gap-4">
        <AnimalThumb photo={application.animal.cover} className="w-16 sm:w-20" sizes="80px" />
        <div className="min-w-0">
          <h1
            id="ficha-titulo"
            className="text-2xl font-bold tracking-tight text-balance sm:text-3xl"
          >
            {applicant.name}
          </h1>
          <p className="mt-1 text-muted-foreground">
            {t('subtitle', {
              animal: application.animal.name,
              date: format.dateTime(new Date(application.sentAt), {
                dateStyle: 'long',
                timeStyle: 'short',
              }),
            })}
          </p>
          <AdopterBadges
            badges={application.badges}
            incidents={application.incidents}
            className="mt-3"
          />
          <p className="mt-3 text-sm">{t('otherActive', { count: application.otherActive })}</p>
        </div>
      </div>

      <div className="mt-8 border-t border-border pt-6">
        <StageProgress stage={application.stage} />
        <ApplicationOutcome application={application} />
      </div>

      {application.awaitingAdopter && lastRequest?.kind === 'info-requested' && (
        <div className="mt-6 flex gap-3 rounded-lg bg-muted px-4 py-3">
          <ClockIcon aria-hidden className="mt-0.5 size-4 shrink-0" />
          <div className="text-pretty">
            <p className="font-semibold">
              {t('awaiting', {
                name: applicant.name.split(' ')[0] ?? applicant.name,
                date: format.dateTime(new Date(lastRequest.at), { dateStyle: 'medium' }),
              })}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">“{lastRequest.message}”</p>
          </div>
        </div>
      )}
    </section>
  )
}
