'use client'

import { Button } from '@acolhemais/ui/components/button'
import { Field, FieldLabel } from '@acolhemais/ui/components/field'
import { Input } from '@acolhemais/ui/components/input'
import { Spinner } from '@acolhemais/ui/components/spinner'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'
import { AFTER_SIGN_IN_PAGE, authClient } from '@/lib/auth-client'
import { twoFactorMessageFor } from '../../../../_components/auth-errors'
import { FieldMessage } from '../../../../_components/field-message'

/** As mensagens são chaves do namespace `TwoFactor` (traduzidas na tela). */
const backupCodeSchema = z.object({
  code: z.string().trim().min(1, 'backupCodeRequired'),
})

type BackupCodeFormType = z.infer<typeof backupCodeSchema>

/** Um dos códigos de recuperação (cada um vale uma vez), para quem perdeu o app autenticador. */
export function BackupCodeForm() {
  const t = useTranslations('TwoFactor')
  const tRoot = useTranslations()
  const router = useRouter()

  const form = useForm<BackupCodeFormType>({
    resolver: zodResolver(backupCodeSchema),
    defaultValues: { code: '' },
  })

  // A página existe só para digitar o código: o campo já abre com o foco.
  useEffect(() => form.setFocus('code'), [form])

  const { mutate, isPending } = useMutation({
    mutationKey: ['verify-backup-code'],
    mutationFn: async ({ code }: BackupCodeFormType) => {
      const response = await authClient.twoFactor.verifyBackupCode({ code })
      if (response.error) throw response.error
    },
    onSuccess: () => router.replace(AFTER_SIGN_IN_PAGE),
    onError: (error) => {
      form.setError('root.server', { message: twoFactorMessageFor(error, tRoot) })
      form.setFocus('code')
    },
  })

  const rootError = form.formState.errors.root?.server?.message

  return (
    <form
      noValidate
      onSubmit={form.handleSubmit((data) => mutate(data))}
      className="flex flex-col gap-3"
    >
      <Controller
        name="code"
        control={form.control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid} className="gap-2">
            <FieldLabel htmlFor="backup-code">{t('backupCode')}</FieldLabel>
            <Input
              {...field}
              id="backup-code"
              autoComplete="one-time-code"
              autoCapitalize="none"
              spellCheck={false}
              className="font-mono tracking-wider"
              aria-invalid={fieldState.invalid || Boolean(rootError)}
              aria-describedby={fieldState.error || rootError ? 'backup-code-error' : undefined}
            />
            <FieldMessage
              id="backup-code-error"
              message={fieldState.error?.message ? t(fieldState.error.message) : rootError}
              lines={2}
            />
          </Field>
        )}
      />

      <Button type="submit" size="lg" className="w-full" disabled={isPending} aria-busy={isPending}>
        {isPending && <Spinner />}
        {isPending ? t('submitting') : t('submit')}
      </Button>
    </form>
  )
}
