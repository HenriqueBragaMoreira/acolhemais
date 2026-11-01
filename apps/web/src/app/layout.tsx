import type { Metadata } from 'next'
import { NextIntlClientProvider } from 'next-intl'
import { getTranslations } from 'next-intl/server'
import { defaultLocale } from '@/i18n/request'
import { brandThemeStyle, PLATFORM_COLORS } from '@/lib/brand-theme'
import './globals.css'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('Metadata')
  return { title: t('title'), description: t('description') }
}

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang={defaultLocale}>
      <body style={brandThemeStyle(PLATFORM_COLORS)} className="bg-white text-neutral-900">
        <NextIntlClientProvider>{children}</NextIntlClientProvider>
      </body>
    </html>
  )
}
