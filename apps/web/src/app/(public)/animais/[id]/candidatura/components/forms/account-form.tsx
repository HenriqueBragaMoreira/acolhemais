'use client'

import { Button } from '@acolhemais/ui/components/button'
import { RadioGroup, RadioGroupItem } from '@acolhemais/ui/components/radio-group'
import { UserRoundCheckIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { type AccountData, applicationStepper } from '../application-stepper'
import { useStepData } from '../use-step-data'
import { StepActions } from '../step-actions'
import { NewApplicantForm } from './new-applicant-form'
import { SignInForm } from './sign-in-form'

type Mode = AccountData['mode']

/**
 * Quem está se candidatando. Sem conta, confirma o e-mail com um código (FR-042); com conta,
 * entra e as respostas salvas no perfil vêm preenchidas (FR-041).
 */
export function AccountForm() {
  const t = useTranslations('Application.account')
  const stepper = applicationStepper.useStepperContext()
  const draft = useStepData()
  const [account, setAccount] = useState(draft('account'))
  const [mode, setMode] = useState<Mode | null>(null)

  // Quem já entrou (ou já confirmou o e-mail) e voltou até aqui não refaz isso: só confirma.
  if (account) {
    return (
      <form
        noValidate
        onSubmit={(event) => {
          event.preventDefault()
          void stepper.next()
        }}
      >
        <p className="flex gap-2.5 rounded-lg bg-secondary px-3.5 py-3 text-pretty">
          <UserRoundCheckIcon aria-hidden className="mt-0.5 size-4 shrink-0" />
          {t(account.mode === 'account' ? 'signedInAs' : 'confirmedAs', { email: account.email })}
        </p>
        <Button
          type="button"
          variant="link"
          className="mt-3"
          onClick={() => {
            // Outra pessoa ou outro e-mail: nada do que foi respondido segue junto.
            stepper.data.reset()
            setAccount(undefined)
          }}
        >
          {t(account.mode === 'account' ? 'changeAccount' : 'changeEmail')}
        </Button>
        <StepActions />
      </form>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <RadioGroup
        aria-label={t('choose')}
        value={mode ?? ''}
        onValueChange={(value) => setMode(value as Mode)}
        className="grid gap-3 sm:grid-cols-2"
      >
        {(['new', 'account'] as const).map((option) => (
          // O rótulo cobre o cartão todo (after:inset-0), mas só o título dá nome à opção; a
          // explicação vai por aria-describedby.
          <div
            key={option}
            className="relative flex gap-3 rounded-xl border border-input bg-background p-4 transition-colors hover:bg-muted has-data-checked:border-ring has-data-checked:bg-muted"
          >
            <RadioGroupItem
              id={`account-${option}`}
              value={option}
              aria-describedby={`account-${option}-hint`}
              className="relative z-10 mt-0.5"
            />
            <div>
              <label
                htmlFor={`account-${option}`}
                className="block cursor-pointer font-semibold after:absolute after:inset-0"
              >
                {t(`${option}.title`)}
              </label>
              <p
                id={`account-${option}-hint`}
                className="mt-1 text-sm text-pretty text-muted-foreground"
              >
                {t(`${option}.description`)}
              </p>
            </div>
          </div>
        ))}
      </RadioGroup>

      {mode === 'new' && <NewApplicantForm />}
      {mode === 'account' && <SignInForm />}
    </div>
  )
}
