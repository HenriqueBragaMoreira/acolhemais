'use client'

import { NextIntlClientProvider, type AbstractIntlMessages } from 'next-intl'
import type { ReactNode } from 'react'
import { QueryClientProvider } from '@/lib/tanstack-query'

type ProvidersProps = {
  children: ReactNode
  locale: string
  messages: AbstractIntlMessages
  timeZone: string
}

/** Tudo o que envolve a aplicação inteira, num lugar só. */
export function Providers({ children, locale, messages, timeZone }: ProvidersProps) {
  return (
    <NextIntlClientProvider locale={locale} messages={messages} timeZone={timeZone}>
      <QueryClientProvider>{children}</QueryClientProvider>
    </NextIntlClientProvider>
  )
}
