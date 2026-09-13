import { getTranslations } from 'next-intl/server'
import Link from 'next/link'
import { Wordmark } from '@/components/wordmark'
import { REPOSITORY_URL } from '@/lib/project'

const LINK =
  'rounded-sm font-medium text-ring underline decoration-1 underline-offset-4 hover:decoration-2'

export async function SiteFooter() {
  const t = await getTranslations('SiteFooter')

  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-[90rem] flex-col gap-4 px-4 py-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-10">
        <p>
          <Wordmark className="mr-2 text-base text-foreground" />
          {t('openSource')}
        </p>
        <ul className="flex gap-6">
          <li>
            <Link href="/sobre" className={LINK}>
              {t('about')}
            </Link>
          </li>
          <li>
            <a href={REPOSITORY_URL} className={LINK}>
              {t('sourceCode')}
            </a>
          </li>
        </ul>
      </div>
    </footer>
  )
}
