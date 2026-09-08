import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { TwoFactorChallenge } from './components/two-factor-challenge'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('TwoFactor')
  return { title: t('metaTitle') }
}

export default async function TwoFactorPage() {
  const t = await getTranslations('TwoFactor')

  return (
    <>
      <h1 className="text-3xl font-bold tracking-tight text-balance">{t('title')}</h1>
      <TwoFactorChallenge />
    </>
  )
}
