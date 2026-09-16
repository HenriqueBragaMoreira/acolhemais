'use client'

import { maskCpf } from '@acolhemais/domain'
import { cn } from '@acolhemais/ui/lib/utils'
import { useTranslations } from 'next-intl'
import { AnswerList } from '@/components/answer-list'
import { useAdopterAnswers } from '@/hooks/use-adopter-answers'
import type { OrganizationProfile } from '@/services/organizations/types'
import type { ApplicationWithAnimal } from '@/services/panel/types'
import { PANEL_SURFACE } from '@/app/(application)/_components/panel-surface'

type ApplicationAnswersProps = {
  application: ApplicationWithAnimal
  organization: OrganizationProfile
}

/** As respostas da candidatura por parte, com o CPF mascarado (BR-085). */
export function ApplicationAnswers({ application, organization }: ApplicationAnswersProps) {
  const t = useTranslations('Panel.file')
  const parts = useAdopterAnswers({
    email: application.email,
    profile: application.profile,
    answers: application.answers,
    questions: organization.questions,
    animalName: application.animal.name,
    cpf: maskCpf(application.profile.applicant.cpf),
  })

  return (
    <section
      className={cn(PANEL_SURFACE, 'p-5 sm:p-8 lg:col-start-1')}
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
  )
}
