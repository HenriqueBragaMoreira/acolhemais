'use client'

import { Button } from '@acolhemais/ui/components/button'
import { Field, FieldLabel } from '@acolhemais/ui/components/field'
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@acolhemais/ui/components/input-otp'
import { Spinner } from '@acolhemais/ui/components/spinner'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'
import { AFTER_SIGN_IN_PAGE, authClient } from '@/lib/auth-client'
import { twoFactorMessageFor } from '@/app/(auth)/_components/auth-errors'
import { FieldMessage } from '@/components/field-message'
import { TrustDeviceField } from '../trust-device-field'

/** As mensagens são chaves do namespace `TwoFactor` (traduzidas na tela). */
const totpSchema = z.object({
  code: z.string().regex(/^\d{6}$/, 'codeRequired'),
})

type TotpFormType = z.infer<typeof totpSchema>

const SLOTS = [0, 1, 2, 3, 4, 5]

/**
 * Código de 6 dígitos do app autenticador. Só confere no "Confirmar": com a caixa de confiar no
 * dispositivo depois do campo, o envio ao completar os dígitos a deixaria fora de alcance.
 */
export function TotpForm({
  trustDevice,
  onTrustDeviceChange,
}: {
  trustDevice: boolean
  onTrustDeviceChange: (checked: boolean) => void
}) {
  const t = useTranslations('TwoFactor')
  const tRoot = useTranslations()
  const router = useRouter()

  const form = useForm<TotpFormType>({
    resolver: zodResolver(totpSchema),
    defaultValues: { code: '' },
  })

  // A página existe só para digitar o código: o campo já abre com o foco.
  useEffect(() => form.setFocus('code'), [form])

  const { mutate, isPending } = useMutation({
    mutationKey: ['verify-totp'],
    mutationFn: async ({ code }: TotpFormType) => {
      const response = await authClient.twoFactor.verifyTotp({ code, trustDevice })
      if (response.error) throw response.error
    },
    onSuccess: () => router.replace(AFTER_SIGN_IN_PAGE),
    onError: (error) => {
      form.reset({ code: '' })
      form.setError('root.server', { message: twoFactorMessageFor(error, tRoot) })
      form.setFocus('code')
    },
  })

  const submit = form.handleSubmit((data) => mutate(data))
  const rootError = form.formState.errors.root?.server?.message

  return (
    <form noValidate onSubmit={submit} className="flex flex-col gap-3">
      <Controller
        name="code"
        control={form.control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid} className="gap-2">
            <FieldLabel htmlFor="totp-code">{t('code')}</FieldLabel>
            <InputOTP
              ref={field.ref}
              id="totp-code"
              name={field.name}
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              maxLength={6}
              containerClassName="w-full"
              pattern="^\d+$"
              inputMode="numeric"
              autoComplete="one-time-code"
              aria-invalid={fieldState.invalid || Boolean(rootError)}
              aria-describedby={fieldState.error || rootError ? 'totp-code-error' : undefined}
            >
              <InputOTPGroup className="w-full">
                {SLOTS.map((index) => (
                  <InputOTPSlot key={index} index={index} className="w-auto flex-1" />
                ))}
              </InputOTPGroup>
            </InputOTP>
            <FieldMessage
              id="totp-code-error"
              message={fieldState.error?.message ? t(fieldState.error.message) : rootError}
              lines={2}
            />
          </Field>
        )}
      />

      <TrustDeviceField checked={trustDevice} onCheckedChange={onTrustDeviceChange} />

      <Button type="submit" size="lg" className="w-full" disabled={isPending} aria-busy={isPending}>
        {isPending && <Spinner />}
        {isPending ? t('submitting') : t('submit')}
      </Button>
    </form>
  )
}
