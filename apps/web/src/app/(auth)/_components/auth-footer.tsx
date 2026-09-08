import { getTranslations } from 'next-intl/server'

const REPOSITORY_URL = 'https://github.com/HenriqueBragaMoreira/acolhemais'

export async function AuthFooter() {
  const t = await getTranslations('AuthFrame')

  return (
    <p className="mt-8 text-sm text-muted-foreground">
      {t('openSource')}{' '}
      <a
        href={REPOSITORY_URL}
        className="rounded-sm font-medium text-ring underline decoration-1 underline-offset-4 hover:decoration-2"
      >
        {t('sourceCode')}
      </a>
    </p>
  )
}
