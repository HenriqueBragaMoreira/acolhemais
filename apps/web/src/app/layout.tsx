import '@fontsource-variable/figtree'
import '@/styles/globals.css'
import type { Metadata } from 'next'
import { getLocale, getMessages, getTimeZone, getTranslations } from 'next-intl/server'
import type { ReactNode } from 'react'
import { brandThemeStyle, PLATFORM_COLORS } from '@/lib/brand-theme'
import { Providers } from './providers'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('Metadata')
  return {
    title: { default: t('title'), template: t('titleTemplate') },
    description: t('description'),
  }
}

export default async function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  const [locale, messages, timeZone] = await Promise.all([
    getLocale(),
    getMessages(),
    getTimeZone(),
  ])

  return (
    <html lang={locale}>
      <body style={brandThemeStyle(PLATFORM_COLORS)}>
        <Providers locale={locale} messages={messages} timeZone={timeZone}>
          {children}
        </Providers>
      </body>
    </html>
  )
}
