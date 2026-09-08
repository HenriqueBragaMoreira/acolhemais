import { getRequestConfig } from 'next-intl/server'

// Por enquanto só pt-BR (ver docs/PLANO.md). Novos idiomas entram aqui e em messages/.
export const defaultLocale = 'pt-BR'

export default getRequestConfig(async () => ({
  locale: defaultLocale,
  // Datas e horas no fuso de Brasília (a plataforma atende o Brasil).
  timeZone: 'America/Sao_Paulo',
  messages: (await import(`../../messages/${defaultLocale}.json`)).default,
}))
