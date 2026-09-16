'use client'

import { maskCpf } from '@acolhemais/domain'
import { cn } from '@acolhemais/ui/lib/utils'
import { ArrowLeftIcon, ClockIcon } from 'lucide-react'
import { useFormatter, useTranslations } from 'next-intl'
import Link from 'next/link'
import { AnswerList } from '@/components/answer-list'
import { useAdopterAnswers } from '@/hooks/use-adopter-answers'
import type { OrganizationProfile } from '@/services/organizations'
import { type ApplicationWithAnimal } from '@/services/panel'
import { AdopterBadges } from '../../../../_components/adopter-badges'
import { AnimalThumb } from '../../../../_components/animal-thumb'
import { PANEL } from '../../../../_components/panel-surface'
import { StageProgress } from '../../../../_components/stage-progress'
import { ApplicationOutcome } from './application-outcome'
import { ApplicationActions } from './application-actions'
import { ApplicantContact } from './applicant-contact'
import { ApplicationHistory } from './application-history'

export function ApplicationDetails({
  application,
  organization,
}: {
  application: ApplicationWithAnimal
  organization: OrganizationProfile
}) {
  const t = useTranslations('Panel.file')
  const format = useFormatter()
  const { applicant } = application.profile
  const parts = useAdopterAnswers({
    email: application.email,
    profile: application.profile,
    answers: application.answers,
    questions: organization.questions,
    animalName: application.animal.name,
    cpf: maskCpf(applicant.cpf),
  })
  const lastRequest = application.history.findLast((event) => event.kind === 'info-requested')

  return (
    <>
      <Link
        href="/painel/candidaturas"
        className="inline-flex items-center gap-1.5 rounded-sm font-semibold underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      >
        <ArrowLeftIcon aria-hidden className="size-4" />
        {t('back')}
      </Link>

      {/* No celular, as ações vêm logo depois de quem é a pessoa; no computador, ficam ao lado. */}
      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start">
        <section className={cn(PANEL, 'p-5 sm:p-8 lg:col-start-1')} aria-labelledby="ficha-titulo">
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

        <div className="flex flex-col gap-6 lg:sticky lg:top-6 lg:col-start-2 lg:row-span-3 lg:row-start-1">
          <ApplicationActions application={application} organization={organization} />
          <ApplicantContact application={application} organization={organization} />
        </div>

        <section
          className={cn(PANEL, 'p-5 sm:p-8 lg:col-start-1')}
          aria-labelledby="respostas-titulo"
        >
          <h2 id="respostas-titulo" className="text-xl font-bold tracking-tight">
            {t('answers')}
          </h2>
          <div className="mt-6 flex flex-col gap-8">
            {parts.map(({ part, rows }) => (
              <section key={part} aria-labelledby={`parte-${part}`}>
                <h3
                  id={`parte-${part}`}
                  className="border-b border-border pb-2 font-bold tracking-tight"
                >
                  {t(`parts.${part}`, { organization: organization.name })}
                </h3>
                <AnswerList rows={rows} />
              </section>
            ))}
          </div>
        </section>

        <ApplicationHistory application={application} />
      </div>
    </>
  )
}
