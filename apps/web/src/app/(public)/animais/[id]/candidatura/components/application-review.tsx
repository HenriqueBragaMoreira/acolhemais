'use client'

import { Button } from '@acolhemais/ui/components/button'
import { useMutation } from '@tanstack/react-query'
import { PencilIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { type AdopterProfile, applicationsServices } from '@/services/applications'
import { StepActions } from './application-fields'
import {
  type AccountData,
  type ApplicationStep,
  applicationStepper,
  useAdvance,
  useApplicationTarget,
  useStepData,
} from './application-stepper'

type Row = [label: string, value: string | null | undefined]
type ReviewProps = { onSent: (sent: SentApplication) => void }

/** O que a pessoa respondeu, por parte, para conferir antes de enviar. */
export function ApplicationReview({ onSent }: ReviewProps) {
  const draft = useStepData()
  const account = draft('account')
  const applicant = draft('applicant')
  const home = draft('home')
  const pets = draft('pets')
  const routine = draft('routine')
  const reasons = draft('reasons')
  // A revisão só se alcança passando pelas etapas; sem elas, não há o que revisar.
  if (!account || !applicant || !home || !pets || !routine || !reasons) return null

  return (
    <Review
      account={account}
      profile={{ applicant, home, pets, routine, reasons }}
      answers={draft('organization') ?? {}}
      onSent={onSent}
    />
  )
}

function Review({
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

  const send = useMutation({
    mutationFn: () =>
      applicationsServices.submit({ animalId: animal.id, email: account.email, profile, answers }),
    onSuccess: () => onSent({ mode: account.mode, phone: profile.applicant.phone }),
  })

  const yesNo = (value: string | null) => (value ? t(value === 'yes' ? 'yes' : 'no') : null)
  const { applicant, home, pets, routine, reasons } = profile

  const sections: { step: ApplicationStep; rows: Row[] }[] = [
    {
      step: 'applicant',
      rows: [
        [t('applicant.name'), applicant.name],
        [t('applicant.emailLabel'), account.email],
        [t('applicant.cpf'), applicant.cpf],
        [t('applicant.phone'), applicant.phone || t('review.empty')],
      ],
    },
    {
      step: 'home',
      rows: [
        [t('home.housing'), home.housing && t(`home.housingValue.${home.housing}`)],
        [t('home.ownership'), home.ownership && t(`home.ownershipValue.${home.ownership}`)],
        ...(home.ownership === 'rent'
          ? ([[t('home.landlordAllows'), yesNo(home.landlordAllows)]] as Row[])
          : []),
        [t('home.yard'), yesNo(home.yard)],
        [t('home.screens'), yesNo(home.screens)],
        [t('home.adults'), home.adults],
        [t('home.children'), home.children === 'yes' ? home.childrenAges : yesNo(home.children)],
        [t('home.everyoneAgrees'), yesNo(home.everyoneAgrees)],
      ],
    },
    {
      step: 'pets',
      rows: [
        [t('pets.hasPets'), pets.hasPets === 'yes' ? pets.pets : yesNo(pets.hasPets)],
        ...(pets.hasPets === 'yes'
          ? ([[t('pets.petsCared'), yesNo(pets.petsCared)]] as Row[])
          : []),
        [t('pets.hadPets'), pets.hadPets === 'yes' ? pets.pastPets : yesNo(pets.hadPets)],
      ],
    },
    {
      step: 'routine',
      rows: [
        [
          t('routine.hoursAlone'),
          routine.hoursAlone && t(`routine.hoursAloneValue.${routine.hoursAlone}`),
        ],
        [t('routine.whereStays'), routine.whereStays],
        [t('routine.travelCare'), routine.travelCare],
        [t('routine.awareOfCosts'), yesNo(routine.awareOfCosts)],
      ],
    },
    {
      step: 'reasons',
      rows: [
        [t('reasons.why', { name: animal.name }), reasons.why],
        [t('reasons.ifMoving'), reasons.ifMoving],
        [t('reasons.ifBehavior'), reasons.ifBehavior],
      ],
    },
    {
      step: 'organization',
      rows: organization.questions.map((question): Row => [
        question.label,
        question.type === 'yes-no' ? yesNo(answers[question.id] ?? null) : answers[question.id],
      ]),
    },
  ]

  return (
    <form
      noValidate
      onSubmit={(event) => {
        event.preventDefault()
        send.mutate()
      }}
    >
      <div className="flex flex-col gap-8">
        {sections
          .filter((section) => section.rows.length > 0)
          .map(({ step, rows }) => (
            <section key={step} aria-labelledby={`revisar-${step}`}>
              <div className="flex items-center justify-between gap-4 border-b border-border pb-2">
                <h3 id={`revisar-${step}`} className="font-bold tracking-tight">
                  {t(`steps.${step}`, { organization: organization.name })}
                </h3>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  aria-label={t('review.edit', {
                    section: t(`steps.${step}`, { organization: organization.name }),
                  })}
                  onClick={() => {
                    setReturning(true)
                    void stepper.goTo(step)
                  }}
                >
                  <PencilIcon aria-hidden />
                  {t('review.editShort')}
                </Button>
              </div>
              <dl className="divide-y divide-border">
                {rows.map(([label, value]) => (
                  <div
                    key={label}
                    className="grid gap-1 py-3 sm:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] sm:gap-6"
                  >
                    <dt className="text-sm text-muted-foreground">{label}</dt>
                    <dd className="font-medium text-pretty">{value}</dd>
                  </div>
                ))}
              </dl>
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

/** O que a tela de enviada precisa saber para as dicas. */
export type SentApplication = { mode: AccountData['mode']; phone: string }
