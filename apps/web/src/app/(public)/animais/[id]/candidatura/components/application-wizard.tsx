'use client'

import { cn } from '@acolhemais/ui/lib/utils'
import { useFormatter, useTranslations } from 'next-intl'
import Image from 'next/image'
import { type ComponentType, type ReactNode, useCallback, useRef, useState } from 'react'
import { ApplicationReview, type SentApplication } from './application-review'
import { ApplicationSent } from './application-sent'
import {
  type ApplicationStep,
  type ApplicationTarget,
  ApplicationTargetProvider,
  applicationStepper,
  ReturnToReviewProvider,
  useApplicationTarget,
} from './application-stepper'
import { AccountForm } from './forms/account-form'
import { ApplicantForm } from './forms/applicant-form'
import { HomeForm } from './forms/home-form'
import { OrganizationQuestionsForm } from './forms/organization-questions-form'
import { PetsForm } from './forms/pets-form'
import { ReasonsForm } from './forms/reasons-form'
import { RoutineForm } from './forms/routine-form'

/** A candidatura em etapas, com o animal sempre à vista (FR-041, FR-042). */
export function ApplicationWizard(target: ApplicationTarget) {
  return (
    <ApplicationTargetProvider value={target}>
      <applicationStepper.Provider>
        <ReturnToReview>
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start lg:gap-10">
            <AnimalSummary />
            <Flow />
          </div>
        </ReturnToReview>
      </applicationStepper.Provider>
    </ApplicationTargetProvider>
  )
}

/** Guarda se a etapa aberta veio do "Editar" da revisão. */
function ReturnToReview({ children }: { children: ReactNode }) {
  const [returning, setReturning] = useState(false)
  return (
    <ReturnToReviewProvider value={{ returning, setReturning }}>{children}</ReturnToReviewProvider>
  )
}

/** O formulário de cada etapa; a revisão fica de fora porque recebe o aviso de enviada. */
const STEP_FORMS: Record<Exclude<ApplicationStep, 'review'>, ComponentType> & {
  review?: never
} = {
  account: AccountForm,
  applicant: ApplicantForm,
  home: HomeForm,
  pets: PetsForm,
  routine: RoutineForm,
  reasons: ReasonsForm,
  organization: OrganizationQuestionsForm,
}

function Flow() {
  const t = useTranslations('Application')
  const stepper = applicationStepper.useStepperContext()
  const { organization } = useApplicationTarget()
  const [sent, setSent] = useState<SentApplication | null>(null)
  const shownStep = useRef<string>(stepper.id)

  // A cada etapa nova o foco vai para o título dela (que remonta pela `key`): quem usa leitor de
  // tela sabe onde está. Na chegada à página o foco fica onde o navegador o pôs.
  const focusHeading = useCallback((node: HTMLHeadingElement | null) => {
    const step = node?.dataset.step
    if (!node || !step || step === shownStep.current) return
    shownStep.current = step
    node.focus()
    node.scrollIntoView({ block: 'nearest' })
  }, [])

  const step = { organization: organization.name }
  const StepForm = STEP_FORMS[stepper.id]

  return (
    <div className="rounded-2xl bg-background p-5 shadow-[0_1px_2px_rgb(31_26_23/0.06),0_8px_24px_-12px_rgb(31_26_23/0.18)] sm:p-8 lg:order-first">
      {sent ? (
        <ApplicationSent sent={sent} />
      ) : (
        <>
          <p className="text-sm font-semibold text-muted-foreground" aria-live="polite">
            {t('progress', { step: stepper.index + 1, total: stepper.count })}
          </p>
          <div aria-hidden className="mt-2 flex gap-1.5">
            {stepper.steps.map((item, index) => (
              <span
                key={item.id}
                className={cn(
                  'h-1.5 flex-1 rounded-full transition-colors duration-300',
                  index <= stepper.index ? 'bg-foreground' : 'bg-muted',
                )}
              />
            ))}
          </div>
          <h2
            key={stepper.id}
            data-step={stepper.id}
            ref={focusHeading}
            tabIndex={-1}
            className="mt-6 scroll-mt-6 rounded-sm text-2xl font-bold tracking-tight text-balance sm:text-3xl"
          >
            {t(`steps.${stepper.id}`, step)}
          </h2>
          <p className="mt-2 mb-8 text-pretty text-muted-foreground">
            {t(`intro.${stepper.id}`, step)}
          </p>
          {StepForm ? <StepForm /> : <ApplicationReview onSent={setSent} />}
        </>
      )}
    </div>
  )
}

/** O animal da candidatura: foto, quem é, a organização e a taxa. */
function AnimalSummary() {
  const t = useTranslations('Application.animal')
  const tProfile = useTranslations('AnimalProfile')
  const format = useFormatter()
  const { animal, organization } = useApplicationTarget()
  const summary = [
    tProfile('sex', { sex: animal.sex }),
    tProfile('age', { age: animal.ageGroup, sex: animal.sex }),
  ].join(' · ')

  return (
    <aside
      aria-label={t('label', { name: animal.name })}
      className="flex items-center gap-4 rounded-2xl bg-background p-3 shadow-[0_1px_2px_rgb(31_26_23/0.06),0_8px_24px_-12px_rgb(31_26_23/0.18)] lg:sticky lg:top-8 lg:flex-col lg:items-stretch lg:p-4"
    >
      <div className="relative size-20 shrink-0 overflow-hidden rounded-xl bg-muted lg:aspect-[4/5] lg:size-auto">
        <Image
          src={animal.cover.src}
          alt=""
          fill
          sizes="(min-width: 64rem) 20rem, 5rem"
          className="object-cover"
          style={{ objectPosition: animal.cover.focus }}
        />
      </div>
      <div className="min-w-0 lg:px-1 lg:pb-1">
        <p className="text-lg font-bold tracking-tight lg:text-xl">{animal.name}</p>
        <p className="text-sm">{summary}</p>
        <p className="text-sm text-muted-foreground">
          {organization.name} · {animal.city}
        </p>
        <p className="mt-2 hidden text-sm lg:block">
          {animal.fee
            ? t('fee', {
                value: format.number(animal.fee.cents / 100, {
                  style: 'currency',
                  currency: 'BRL',
                }),
              })
            : t('noFee')}
        </p>
      </div>
    </aside>
  )
}
