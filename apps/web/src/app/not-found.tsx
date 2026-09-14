import { buttonVariants } from '@acolhemais/ui/components/button'
import { cn } from '@acolhemais/ui/lib/utils'
import { getTranslations } from 'next-intl/server'
import Link from 'next/link'
import { Wordmark } from '@/components/wordmark'

export default async function NotFoundPage() {
  const t = await getTranslations('NotFound')

  return (
    <main className="mx-auto flex min-h-dvh max-w-xl flex-col items-start justify-center gap-4 px-6">
      <Link href="/" className="rounded-md text-xl">
        <Wordmark />
      </Link>
      <h1 className="mt-6 text-3xl font-bold tracking-tight">{t('title')}</h1>
      <p className="text-muted-foreground">{t('description')}</p>
      <Link href="/" className={cn(buttonVariants(), 'mt-2')}>
        {t('home')}
      </Link>
    </main>
  )
}
