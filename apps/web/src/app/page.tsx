import { useTranslations } from 'next-intl'

export default function Home() {
  const t = useTranslations('Home')

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col justify-center gap-4 px-6">
      <h1 className="text-brand-text text-5xl font-bold">{t('title')}</h1>
      <p className="text-2xl">{t('tagline')}</p>
      <p className="text-neutral-700">{t('underConstruction')}</p>
    </main>
  )
}
