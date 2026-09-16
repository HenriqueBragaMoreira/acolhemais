import { buttonVariants } from '@acolhemais/ui/components/button'
import { cn } from '@acolhemais/ui/lib/utils'
import { getTranslations } from 'next-intl/server'
import Link from 'next/link'
import { PAGE_CONTAINER } from '@/app/(public)/_components/page-container'

/** Organização encerrada: só o aviso, sem animais, contato nem doação (BR-044). */
export async function ClosedOrganization({ name }: { name: string }) {
  const t = await getTranslations('Organization.closed')
  return (
    <div
      className={`${PAGE_CONTAINER} flex min-h-[60svh] flex-col items-start justify-center py-16`}
    >
      <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">{t('title')}</h1>
      <p className="mt-3 max-w-prose text-lg text-pretty">{t('description', { name })}</p>
      <Link href="/" className={cn(buttonVariants({ size: 'lg' }), 'mt-8')}>
        {t('home')}
      </Link>
    </div>
  )
}
