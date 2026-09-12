import { buttonVariants } from '@acolhemais/ui/components/button'
import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import Link from 'next/link'
import { ForgotPasswordForm } from './components/forms/forgot-password-form'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('ForgotPassword')
  return { title: t('metaTitle') }
}

export default async function ForgotPasswordPage() {
  const t = await getTranslations('ForgotPassword')

  return (
    <>
      <h1 className="text-3xl font-bold tracking-tight text-balance">{t('title')}</h1>
      <p className="mt-2 text-muted-foreground">{t('description')}</p>
      <ForgotPasswordForm />
      <div className="mt-6 flex flex-col items-start">
        <Link href="/entrar" className={buttonVariants({ variant: 'link' })}>
          {t('backToSignIn')}
        </Link>
      </div>
    </>
  )
}
