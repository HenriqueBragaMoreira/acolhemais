'use client'

import { Alert, AlertDescription } from '@acolhemais/ui/components/alert'
import { CircleAlertIcon, CircleCheckIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useSearchParams } from 'next/navigation'

/**
 * Aviso para quem chega a /entrar por um link: a volta da confirmação do e-mail (FR-003, com
 * `error` quando o link venceu) ou a senha recém-criada (FR-004).
 */
export function SignInNotice() {
  const t = useTranslations('SignIn')
  const params = useSearchParams()
  const verified = params.has('verificado')

  if (verified && params.has('error')) {
    return (
      <Alert variant="destructive">
        <CircleAlertIcon aria-hidden />
        <AlertDescription>{t('verificationFailed')}</AlertDescription>
      </Alert>
    )
  }

  const message = verified
    ? t('emailVerified')
    : params.get('senha') === 'redefinida'
      ? t('passwordReset')
      : null
  if (!message) return null

  return (
    <Alert>
      <CircleCheckIcon aria-hidden />
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  )
}
