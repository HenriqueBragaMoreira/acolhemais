import { Alert, AlertDescription } from '@acolhemais/ui/components/alert'
import { CircleAlertIcon } from 'lucide-react'
import { getTranslations } from 'next-intl/server'
import { ResetPasswordForm } from './forms/reset-password-form'

/** Com o token do link, o formulário da nova senha; sem ele, o aviso de link inválido. */
export async function ResetPasswordEntry({ token }: { token: string | undefined }) {
  const t = await getTranslations('ResetPassword')

  if (!token) {
    return (
      <Alert variant="destructive" className="mt-8">
        <CircleAlertIcon aria-hidden />
        <AlertDescription>{t('invalidLink')}</AlertDescription>
      </Alert>
    )
  }

  return (
    <>
      <p className="mt-2 text-muted-foreground">{t('description')}</p>
      <ResetPasswordForm token={token} />
    </>
  )
}
