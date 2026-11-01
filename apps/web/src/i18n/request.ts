import { getRequestConfig } from 'next-intl/server'

// Por enquanto só pt-BR (ver docs/PLANO.md). Novos idiomas entram aqui e em messages/.
export const defaultLocale = 'pt-BR'

export default getRequestConfig(async () => ({
  locale: defaultLocale,
  messages: (await import(`../../messages/${defaultLocale}.json`)).default,
}))
