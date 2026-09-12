import { buttonVariants } from '@acolhemais/ui/components/button'
import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import Link from 'next/link'
import { Suspense } from 'react'
import { ResetPasswordEntry } from './components/reset-password-entry'
import { ResetPasswordSkeleton } from './components/reset-password-skeleton'

type ResetPasswordPageProps = {
  /** O link do e-mail traz o token de uso único (FR-004; também o primeiro acesso, BR-015). */
  searchParams: Promise<{ token?: string | string[] }>
}

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('ResetPassword')
  // O token vai na URL: nada da página é enviado a outro site como referência.
  return { title: t('metaTitle'), referrer: 'no-referrer' }
}

export default async function ResetPasswordPage({ searchParams }: ResetPasswordPageProps) {
  const t = await getTranslations('ResetPassword')

  return (
    <>
      <h1 className="text-3xl font-bold tracking-tight text-balance">{t('title')}</h1>
      {/* O token só existe na requisição: o resto da página é estático. */}
      <Suspense fallback={<ResetPasswordSkeleton />}>
        {searchParams.then(({ token }) => (
          <ResetPasswordEntry token={typeof token === 'string' ? token : undefined} />
        ))}
      </Suspense>
      <div className="mt-6 flex flex-col items-start gap-3">
        <Link href="/esqueci-a-senha" className={buttonVariants({ variant: 'link' })}>
          {t('requestNewLink')}
        </Link>
        <Link href="/entrar" className={buttonVariants({ variant: 'link' })}>
          {t('backToSignIn')}
        </Link>
      </div>
    </>
  )
}
