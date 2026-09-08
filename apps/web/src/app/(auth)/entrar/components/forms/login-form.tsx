'use client'

import { Button } from '@acolhemais/ui/components/button'
import { Field, FieldLabel } from '@acolhemais/ui/components/field'
import { Input } from '@acolhemais/ui/components/input'
import { PasswordInput } from '@acolhemais/ui/components/password-input'
import { Spinner } from '@acolhemais/ui/components/spinner'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useTranslations } from 'next-intl'
import { useRouter, useSearchParams } from 'next/navigation'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'
import { AFTER_SIGN_IN_PAGE, authClient, TWO_FACTOR_PAGE } from '@/lib/auth-client'
import { authServices } from '@/services/auth'
import { isInvalidCredentials, signInMessageFor } from '../../../_components/auth-errors'
import { FieldMessage } from '../../../_components/field-message'
import { GoogleSignIn } from '../google-sign-in'

/** As mensagens são chaves do namespace `SignIn` (traduzidas na tela). */
const loginSchema = z.object({
  email: z.string().trim().min(1, 'emailRequired').pipe(z.email('emailInvalid')),
  password: z.string().min(1, 'passwordRequired'),
})

type LoginFormType = z.infer<typeof loginSchema>

export function LoginForm() {
  const t = useTranslations('SignIn')
  const tRoot = useTranslations()
  const router = useRouter()
  const googleFailed = useSearchParams().get('erro') === 'google'

  const form = useForm<LoginFormType>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

  const { data: providers } = useQuery({
    queryKey: ['auth-providers'],
    queryFn: authServices.providers,
    // Só muda com a configuração da API.
    staleTime: 1000 * 60 * 5,
  })

  const { mutate, isPending } = useMutation({
    mutationKey: ['sign-in'],
    mutationFn: async (data: LoginFormType) => {
      let retryAfter: number | null = null
      const response = await authClient.signIn.email(data, {
        onError: (context) => {
          retryAfter = Number(context.response.headers.get('retry-after')) || null
        },
      })
      if (response.error) throw { ...response.error, retryAfter }

      return response.data
    },
    onSuccess: (data) => {
      const twoFactor = 'twoFactorRedirect' in data && data.twoFactorRedirect
      if (twoFactor) router.push(TWO_FACTOR_PAGE)
      else router.replace(AFTER_SIGN_IN_PAGE)
    },
    onError: (error) => {
      form.setError('root.server', { message: signInMessageFor(error, tRoot) })
      if (isInvalidCredentials(error)) {
        form.resetField('password')
        form.setFocus('password')
      }
    },
  })

  const { errors, isSubmitted } = form.formState
  const formMessage =
    errors.root?.server?.message ?? (googleFailed && !isSubmitted ? t('googleFailed') : undefined)

  return (
    <div className="mt-8">
      {providers?.google && (
        <GoogleSignIn onError={(message) => form.setError('root.server', { message })} />
      )}

      <form
        noValidate
        onSubmit={form.handleSubmit((data) => mutate(data))}
        className="flex flex-col gap-3"
      >
        <Controller
          name="email"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid} className="gap-2">
              <FieldLabel htmlFor="login-email">{t('email')}</FieldLabel>
              <Input
                {...field}
                id="login-email"
                type="email"
                inputMode="email"
                autoComplete="username"
                autoCapitalize="none"
                spellCheck={false}
                aria-invalid={fieldState.invalid}
                aria-describedby={fieldState.error ? 'login-email-error' : undefined}
              />
              <FieldMessage
                id="login-email-error"
                message={fieldState.error?.message && t(fieldState.error.message)}
              />
            </Field>
          )}
        />

        <Controller
          name="password"
          control={form.control}
          render={({ field, fieldState }) => {
            // O erro do envio (senha errada, bloqueio…) aparece no lugar do erro deste campo.
            const message = fieldState.error?.message ? t(fieldState.error.message) : formMessage
            return (
              <Field data-invalid={fieldState.invalid} className="gap-2">
                <FieldLabel htmlFor="login-password">{t('password')}</FieldLabel>
                <PasswordInput
                  {...field}
                  id="login-password"
                  autoComplete="current-password"
                  showLabel={t('showPassword')}
                  hideLabel={t('hidePassword')}
                  aria-invalid={fieldState.invalid}
                  aria-describedby={message ? 'login-password-error' : undefined}
                />
                <FieldMessage id="login-password-error" message={message} lines={2} />
              </Field>
            )
          }}
        />

        <Button
          type="submit"
          size="lg"
          className="w-full"
          disabled={isPending}
          aria-busy={isPending}
        >
          {isPending && <Spinner />}
          {isPending ? t('submitting') : t('submit')}
        </Button>
      </form>
    </div>
  )
}
