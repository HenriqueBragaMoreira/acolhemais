'use client'

import { Button } from '@acolhemais/ui/components/button'
import { Field, FieldLabel } from '@acolhemais/ui/components/field'
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@acolhemais/ui/components/input-otp'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'
import { emailField } from '@/lib/form-answers'
import { FieldMessage } from '@/components/field-message'
import { applicationsServices } from '@/services/applications'
import { TextField } from '@/components/text-field'
import { StepActions } from '../step-actions'
import { type AccountData, applicationStepper, useStepData } from '../application-stepper'

const emailSchema = z.object({ email: emailField })

const codeSchema = z.object({ code: z.string().regex(/^\d{6}$/, 'codeRequired') })

/** Sem conta: e-mail, o código que chega nele e só então segue. */
export function NewApplicantForm() {
  const t = useTranslations('Application')
  const tErrors = useTranslations('FormErrors')
  const stepper = applicationStepper.useStepperContext()
  const draft = useStepData()
  const [sentTo, setSentTo] = useState<string | null>(null)

  const emailForm = useForm({
    resolver: zodResolver(emailSchema),
    defaultValues: { email: draft('account')?.email ?? '' },
  })
  const codeForm = useForm({ resolver: zodResolver(codeSchema), defaultValues: { code: '' } })

  const send = useMutation({
    mutationFn: (address: string) => applicationsServices.sendCode(address),
    onSuccess: (_, address) => setSentTo(address),
  })
  const verify = useMutation({
    mutationFn: async ({ code }: { code: string }) => {
      if (!sentTo) return
      const valid = await applicationsServices.verifyCode(sentTo, code)
      if (!valid) {
        codeForm.setError('code', { message: 'codeWrong' })
        return
      }
      await stepper.next({ data: { mode: 'new', email: sentTo } satisfies AccountData })
    },
  })

  if (!sentTo) {
    return (
      <form noValidate onSubmit={emailForm.handleSubmit(({ email }) => send.mutate(email))}>
        <TextField
          control={emailForm.control}
          name="email"
          label={t('account.email')}
          description={t('account.emailHint')}
          type="email"
          autoComplete="email"
        />
        <StepActions pending={send.isPending} submit={t('account.sendCode')} />
      </form>
    )
  }

  return (
    <form noValidate onSubmit={codeForm.handleSubmit((data) => verify.mutate(data))}>
      <p className="mb-4 text-pretty">{t('account.codeSent', { email: sentTo })}</p>
      <Controller
        name="code"
        control={codeForm.control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid} className="max-w-sm gap-2">
            <FieldLabel htmlFor="application-code">{t('account.code')}</FieldLabel>
            <InputOTP
              ref={field.ref}
              id="application-code"
              name={field.name}
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              maxLength={6}
              // Confere sozinho ao completar os 6 dígitos (DESIGN.md, código de 6 dígitos).
              onComplete={() => void codeForm.handleSubmit((data) => verify.mutate(data))()}
              containerClassName="w-full"
              pattern="^\d+$"
              inputMode="numeric"
              autoComplete="one-time-code"
              aria-invalid={fieldState.invalid}
              aria-describedby={fieldState.error ? 'application-code-error' : undefined}
            >
              <InputOTPGroup className="w-full">
                {[0, 1, 2, 3, 4, 5].map((index) => (
                  <InputOTPSlot key={index} index={index} className="w-auto flex-1" />
                ))}
              </InputOTPGroup>
            </InputOTP>
            <FieldMessage
              id="application-code-error"
              message={fieldState.error?.message && tErrors(fieldState.error.message)}
            />
          </Field>
        )}
      />
      <Button
        type="button"
        variant="link"
        className="mt-1"
        onClick={() => {
          setSentTo(null)
          codeForm.reset()
        }}
      >
        {t('account.changeEmail')}
      </Button>
      <StepActions pending={verify.isPending} />
    </form>
  )
}
