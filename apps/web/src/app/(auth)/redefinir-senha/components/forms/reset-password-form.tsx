'use client'

import { Button } from '@acolhemais/ui/components/button'
import { Field, FieldDescription, FieldLabel } from '@acolhemais/ui/components/field'
import { PasswordInput } from '@acolhemais/ui/components/password-input'
import { Spinner } from '@acolhemais/ui/components/spinner'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'
import { authClient } from '@/lib/auth-client'
import { resetPasswordMessageFor } from '../../../_components/auth-errors'
import { FieldMessage } from '../../../_components/field-message'

/** As mensagens são chaves do namespace `ResetPassword`. O mínimo é o da API (BR-001). */
const resetPasswordSchema = z.object({
  newPassword: z.string().min(1, 'passwordRequired').min(12, 'passwordTooShort'),
})

type ResetPasswordFormType = z.infer<typeof resetPasswordSchema>

/** Nova senha com o token do link (FR-004). Ao salvar, a pessoa entra com ela em /entrar. */
export function ResetPasswordForm({ token }: { token: string }) {
  const t = useTranslations('ResetPassword')
  const tRoot = useTranslations()
  const router = useRouter()

  const form = useForm<ResetPasswordFormType>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { newPassword: '' },
  })

  const { mutate, isPending } = useMutation({
    mutationKey: ['reset-password'],
    mutationFn: async ({ newPassword }: ResetPasswordFormType) => {
      const response = await authClient.resetPassword({ newPassword, token })
      if (response.error) throw response.error

      return response.data
    },
    onSuccess: () => router.replace('/entrar?senha=redefinida'),
    onError: (error) => {
      form.setError('root.server', { message: resetPasswordMessageFor(error, tRoot) })
      form.setFocus('newPassword')
    },
  })

  const serverMessage = form.formState.errors.root?.server?.message

  return (
    <form
      noValidate
      onSubmit={form.handleSubmit((data) => mutate(data))}
      className="mt-8 flex flex-col gap-3"
    >
      <Controller
        name="newPassword"
        control={form.control}
        render={({ field, fieldState }) => {
          // O erro (do campo ou do envio) ocupa o lugar da ajuda.
          const message = fieldState.error?.message ? t(fieldState.error.message) : serverMessage
          return (
            <Field data-invalid={fieldState.invalid} className="gap-2">
              <FieldLabel htmlFor="reset-password">{t('password')}</FieldLabel>
              <PasswordInput
                {...field}
                id="reset-password"
                autoComplete="new-password"
                showLabel={t('showPassword')}
                hideLabel={t('hidePassword')}
                aria-invalid={fieldState.invalid}
                aria-describedby={message ? 'reset-password-error' : 'reset-password-hint'}
              />
              {message ? (
                <FieldMessage id="reset-password-error" message={message} lines={2} />
              ) : (
                <FieldDescription id="reset-password-hint" className="min-h-10">
                  {t('passwordHint')}
                </FieldDescription>
              )}
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
