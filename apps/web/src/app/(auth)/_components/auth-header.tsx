import { getTranslations } from 'next-intl/server'
import Link from 'next/link'
import { Wordmark } from '@/components/wordmark'

/** Marca e slogan sobre a ilustração, em branco sobre o véu escuro. */
export async function AuthHeader() {
  const t = await getTranslations('AuthFrame')

  return (
    <header className="absolute inset-x-0 top-0 p-6 text-white sm:p-8 lg:p-12">
      <Link
        href="/"
        aria-label={t('home')}
        className="inline-block rounded-md text-2xl focus-visible:outline-white lg:text-3xl"
      >
        <Wordmark onDark />
      </Link>
      <p className="mt-3 max-w-[17ch] text-2xl leading-tight font-bold tracking-tight text-balance sm:text-3xl lg:mt-6 lg:max-w-[14ch] lg:text-5xl lg:leading-[1.05] lg:[@media(max-height:820px)]:text-4xl">
        {t('tagline')}
      </p>
    </header>
  )
}
