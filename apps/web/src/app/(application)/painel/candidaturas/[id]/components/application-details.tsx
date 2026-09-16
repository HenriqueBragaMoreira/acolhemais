'use client'

import { ArrowLeftIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import type { OrganizationProfile } from '@/services/organizations/types'
import type { ApplicationWithAnimal } from '@/services/panel/types'
import { ApplicantContact } from './applicant-contact'
import { ApplicationActions } from './application-actions'
import { ApplicationAnswers } from './application-answers'
import { ApplicationHistory } from './application-history'
import { ApplicationOverview } from './application-overview'

/** A ficha da candidatura: quem é, as respostas e o histórico; ao lado, as ações e o contato. */
export function ApplicationDetails({
  application,
  organization,
}: {
  application: ApplicationWithAnimal
  organization: OrganizationProfile
}) {
  const t = useTranslations('Panel.file')

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
        <ApplicationOverview application={application} />

        <div className="flex flex-col gap-6 lg:sticky lg:top-6 lg:col-start-2 lg:row-span-3 lg:row-start-1">
          <ApplicationActions application={application} organization={organization} />
          <ApplicantContact application={application} organization={organization} />
        </div>

        <ApplicationAnswers application={application} organization={organization} />

        <ApplicationHistory application={application} />
      </div>
    </>
  )
}
