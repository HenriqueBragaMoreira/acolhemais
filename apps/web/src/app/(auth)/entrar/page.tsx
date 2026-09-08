import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { Suspense } from 'react'
import { LoginForm } from './components/forms/login-form'
import { LoginFormSkeleton } from './components/login-form-skeleton'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('SignIn')
  return { title: t('metaTitle') }
}

export default async function LoginPage() {
  const t = await getTranslations('SignIn')

  return (
    <>
      <h1 className="text-3xl font-bold tracking-tight text-balance">{t('title')}</h1>
      <p className="mt-2 text-muted-foreground">{t('description')}</p>
      {/* O formulário lê ?erro=google da URL, por isso fica sob Suspense. */}
      <Suspense fallback={<LoginFormSkeleton />}>
        <LoginForm />
      </Suspense>
    </>
  )
}
