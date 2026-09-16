'use client'

import { Spinner } from '@acolhemais/ui/components/spinner'
import { cn } from '@acolhemais/ui/lib/utils'
import { useQuery } from '@tanstack/react-query'
import { ShieldCheckIcon, ShieldOffIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { authServices } from '@/services/auth'
import { PANEL_SURFACE } from '@/app/(application)/_components/panel-surface'
import { PanelSummary } from './panel-summary'

/**
 * O Início do painel: o caminho das candidaturas, os animais e quem chegou agora. Sem sessão
 * (cookie vencido), volta para /entrar.
 */
export function PanelHome() {
  const t = useTranslations('Panel')
  const router = useRouter()
  const { data: session, isPending } = useQuery({
    queryKey: ['session'],
    queryFn: () => authServices.session(),
  })

  useEffect(() => {
    if (session === null) router.replace('/entrar')
  }, [session, router])

  if (isPending || !session) {
    return (
      <p className="flex items-center gap-2 text-muted-foreground">
        <Spinner />
        {t('loading')}
      </p>
    )
  }

  const { user } = session
  const twoFactorOn = Boolean(user.twoFactorEnabled)

  return (
    <>
      <h1 className="text-3xl font-bold tracking-tight text-balance">
        {t('greeting', { name: user.name })}
      </h1>
      <p className="mt-2 max-w-prose text-muted-foreground">{t('intro')}</p>

      <PanelSummary />

      <section aria-labelledby="account-title" className="mt-12 max-w-xl">
        <h2 id="account-title" className="text-lg font-semibold">
          {t('account')}
        </h2>
        <dl className={cn('mt-4 divide-y divide-border', PANEL_SURFACE, 'rounded-xl')}>
          <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3">
            <dt className="text-sm text-muted-foreground">{t('email')}</dt>
            <dd className="font-medium break-all">{user.email}</dd>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3">
            <dt className="text-sm text-muted-foreground">{t('twoFactor')}</dt>
            <dd className="flex items-center gap-1.5 font-medium">
              {twoFactorOn ? (
                <ShieldCheckIcon aria-hidden className="size-4 text-ring" />
              ) : (
                <ShieldOffIcon aria-hidden className="size-4 text-muted-foreground" />
              )}
              {twoFactorOn ? t('twoFactorOn') : t('twoFactorOff')}
            </dd>
          </div>
        </dl>
      </section>
    </>
  )
}
