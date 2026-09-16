'use client'

import { Alert, AlertDescription, AlertTitle } from '@acolhemais/ui/components/alert'
import { Button } from '@acolhemais/ui/components/button'
import { Field, FieldLabel } from '@acolhemais/ui/components/field'
import { Input } from '@acolhemais/ui/components/input'
import { Spinner } from '@acolhemais/ui/components/spinner'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { MailCheckIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'
import { authClient } from '@/lib/auth-client'
import { requestMessageFor } from '@/app/(auth)/_components/auth-errors'
import { FieldMessage } from '@/components/field-message'

/** As mensagens são chaves do namespace `ForgotPassword` (traduzidas na tela). */
const forgotPasswordSchema = z.object({
  email: z.string().trim().min(1, 'emailRequired').pipe(z.email('emailInvalid')),
})

type ForgotPasswordFormType = z.infer<typeof forgotPasswordSchema>

/**
 * Pede o link de redefinição (FR-004). A resposta é a mesma com ou sem conta para o e-mail:
 * a tela nunca diz se ele está cadastrado.
 */
export function ForgotPasswordForm() {
  const t = useTranslations('ForgotPassword')
  const tRoot = useTranslations()

  const form = useForm<ForgotPasswordFormType>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  })

  const { mutate, isPending, isSuccess, variables } = useMutation({
    mutationKey: ['request-password-reset'],
    mutationFn: async ({ email }: ForgotPasswordFormType) => {
      const response = await authClient.requestPasswordReset({ email })
      if (response.error) throw response.error

      return response.data
    },
    onError: (error) => {
      // Só sobram falhas de rede, excesso de tentativas ou erro inesperado.
      form.setError('root.server', { message: requestMessageFor(error, tRoot) })
    },
  })

  if (isSuccess) {
    return (
      <Alert className="mt-8">
        <MailCheckIcon aria-hidden />
        <AlertTitle>{t('sentTitle')}</AlertTitle>
        <AlertDescription>{t('sent', { email: variables.email })}</AlertDescription>
      </Alert>
    )
  }

  const serverMessage = form.formState.errors.root?.server?.message

  return (
    <form
      noValidate
      onSubmit={form.handleSubmit((data) => mutate(data))}
      className="mt-8 flex flex-col gap-3"
    >
      <Controller
        name="email"
        control={form.control}
        render={({ field, fieldState }) => {
          // A falha do envio aparece no lugar do erro do campo (os dois nunca juntos).
          const message = fieldState.error?.message ? t(fieldState.error.message) : serverMessage
          return (
            <Field data-invalid={fieldState.invalid} className="gap-2">
              <FieldLabel htmlFor="forgot-email">{t('email')}</FieldLabel>
              <Input
                {...field}
                id="forgot-email"
                type="email"
                inputMode="email"
                autoComplete="username"
                autoCapitalize="none"
                spellCheck={false}
                aria-invalid={fieldState.invalid}
                aria-describedby={message ? 'forgot-email-error' : undefined}
              />
              <FieldMessage id="forgot-email-error" message={message} lines={2} />
            </Field>
          )
        }}
      />

      <Button type="submit" size="lg" className="w-full" disabled={isPending} aria-busy={isPending}>
        {isPending && <Spinner />}
        {isPending ? t('submitting') : t('submit')}
      </Button>
    </form>
  )
}
