'use client'

import { Button } from '@acolhemais/ui/components/button'
import { Field, FieldLabel } from '@acolhemais/ui/components/field'
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@acolhemais/ui/components/input-otp'
import { PasswordInput } from '@acolhemais/ui/components/password-input'
import { RadioGroup, RadioGroupItem } from '@acolhemais/ui/components/radio-group'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { UserRoundCheckIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'
import { FieldMessage } from '@/components/field-message'
import { type ApplicationBlock, applicationsServices } from '@/services/applications'
import { StepActions, TextField } from '../application-fields'
import {
  type AccountData,
  applicationStepper,
  useApplicationTarget,
  useStepData,
} from '../application-stepper'
import { BlockedNotice } from '../blocked-notice'

const emailField = z.string().trim().min(1, 'emailRequired').pipe(z.email('emailInvalid'))
const emailSchema = z.object({ email: emailField })
const codeSchema = z.object({ code: z.string().regex(/^\d{6}$/, 'codeRequired') })
const signInSchema = z.object({
  email: emailField,
  password: z.string().min(1, 'passwordRequired'),
})

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

      {mode === 'new' && <NewApplicant />}
      {mode === 'account' && <SignIn />}
    </div>
  )
}

/** Sem conta: e-mail, o código que chega nele e só então segue. */
function NewApplicant() {
  const t = useTranslations('Application')
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
              message={fieldState.error?.message && t(`errors.${fieldState.error.message}`)}
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

/** Com conta: entra e as respostas do perfil preenchem o questionário (FR-041). */
function SignIn() {
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
