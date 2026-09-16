'use client'

import { Field, FieldLabel } from '@acolhemais/ui/components/field'
import { PasswordInput } from '@acolhemais/ui/components/password-input'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'
import { emailField } from '@/utils/form-schema-fields'
import { FieldMessage } from '@/components/field-message'
import { applicationsServices } from '@/services/applications'
import type { ApplicationBlock } from '@/services/applications/types'
import { TextField } from '@/components/text-field'
import { StepActions } from '../step-actions'
import { type AccountData, applicationStepper } from '../application-stepper'
import { useApplicationTarget } from '../use-application-target'
import { useStepData } from '../use-step-data'
import { BlockedNotice } from '../blocked-notice'

const signInSchema = z.object({
  email: emailField,
  password: z.string().min(1, 'passwordRequired'),
})

/** Com conta: entra e as respostas do perfil preenchem o questionário (FR-041). */
export function SignInForm() {
  const t = useTranslations('Application.account')
  const stepper = applicationStepper.useStepperContext()
  const draft = useStepData()
  const { animal } = useApplicationTarget()
  const [blocked, setBlocked] = useState<ApplicationBlock | null>(null)

  const form = useForm({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: draft('account')?.email ?? '', password: '' },
  })

  const signIn = useMutation({
    mutationFn: async ({ email, password }: z.infer<typeof signInSchema>) => {
      const profile = await applicationsServices.signIn(email, password)
      const block = await applicationsServices.check(profile.applicant.cpf, animal.id)
      setBlocked(block)
      if (block) return

      stepper.data.set('account', { mode: 'account', email } satisfies AccountData)
      stepper.data.set('applicant', profile.applicant)
      stepper.data.set('home', profile.home)
      stepper.data.set('pets', profile.pets)
      stepper.data.set('routine', profile.routine)
      stepper.data.set('reasons', profile.reasons)
      // O questionário já está respondido: segue para as perguntas da organização.
      await stepper.goTo('organization')
    },
  })

  return (
    <form noValidate onSubmit={form.handleSubmit((data) => signIn.mutate(data))}>
      <div className="flex flex-col gap-5">
        <TextField
          control={form.control}
          name="email"
          label={t('email')}
          type="email"
          autoComplete="email"
        />
        <Controller
          name="password"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid} className="gap-2">
              <FieldLabel htmlFor="application-password">{t('password')}</FieldLabel>
              <PasswordInput
                {...field}
                id="application-password"
                autoComplete="current-password"
                showLabel={t('showPassword')}
                hideLabel={t('hidePassword')}
                aria-invalid={fieldState.invalid}
                aria-describedby={fieldState.error ? 'application-password-error' : undefined}
              />
              <FieldMessage
                id="application-password-error"
                message={fieldState.error && t('passwordRequired')}
              />
            </Field>
          )}
        />
      </div>
      {blocked && <BlockedNotice reason={blocked} />}
      <StepActions pending={signIn.isPending} submit={t('signIn')} />
    </form>
  )
}
