'use client'

import { Button } from '@acolhemais/ui/components/button'
import { useMutation } from '@tanstack/react-query'
import { PencilIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { AnswerList } from '@/components/answer-list'
import { useAdopterAnswers } from '@/hooks/use-adopter-answers'
import { type AdopterProfile, applicationsServices } from '@/services/applications'
import { StepActions } from './step-actions'
import {
  type AccountData,
  applicationStepper,
  useAdvance,
  useApplicationTarget,
} from './application-stepper'
import type { ReviewProps } from './application-review'

export function ReviewAnswers({
  account,
  profile,
  answers,
  onSent,
}: ReviewProps & {
  account: AccountData
  profile: AdopterProfile
  answers: Record<string, string>
}) {
  const t = useTranslations('Application')
  const stepper = applicationStepper.useStepperContext()
  const { setReturning } = useAdvance()
  const { animal, organization } = useApplicationTarget()
  const parts = useAdopterAnswers({
    email: account.email,
    profile,
    answers,
    questions: organization.questions,
    animalName: animal.name,
  })

  const send = useMutation({
    mutationFn: () =>
      applicationsServices.submit({ animalId: animal.id, email: account.email, profile, answers }),
    onSuccess: () => onSent({ mode: account.mode, phone: profile.applicant.phone }),
  })

  return (
    <form
      noValidate
      onSubmit={(event) => {
        event.preventDefault()
        send.mutate()
      }}
    >
      <div className="flex flex-col gap-8">
        {parts.map(({ part, rows }) => (
          <section key={part} aria-labelledby={`revisar-${part}`}>
            <div className="flex items-center justify-between gap-4 border-b border-border pb-2">
              <h3 id={`revisar-${part}`} className="font-bold tracking-tight">
                {t(`steps.${part}`, { organization: organization.name })}
              </h3>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                aria-label={t('review.edit', {
                  section: t(`steps.${part}`, { organization: organization.name }),
                })}
                onClick={() => {
                  setReturning(true)
                  void stepper.goTo(part)
                }}
              >
                <PencilIcon aria-hidden />
                {t('review.editShort')}
              </Button>
            </div>
            <AnswerList rows={rows} />
          </section>
        ))}
      </div>

      <p className="mt-8 text-sm text-pretty text-muted-foreground">
        {t('review.consent', { organization: organization.name })}
      </p>
      {send.isError && (
        <p role="alert" className="mt-4 text-sm font-medium text-destructive">
          {t('review.error')}
        </p>
      )}
      <StepActions pending={send.isPending} submit={t('review.submit')} />
    </form>
  )
}
