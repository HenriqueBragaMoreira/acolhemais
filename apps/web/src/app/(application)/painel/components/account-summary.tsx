'use client'

import { Spinner } from '@acolhemais/ui/components/spinner'
import { useQuery } from '@tanstack/react-query'
import { ShieldCheckIcon, ShieldOffIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { authClient } from '@/lib/auth-client'

/** Saudação e dados da conta. Sem sessão, volta para /entrar. */
export function AccountSummary() {
  const t = useTranslations('Panel')
  const router = useRouter()

  const { data: session, isPending } = useQuery({
    queryKey: ['session'],
    queryFn: async () => {
      const response = await authClient.getSession()
      if (response.error) throw response.error

      return response.data
    },
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

      <section aria-labelledby="account-title" className="mt-10 max-w-xl">
        <h2 id="account-title" className="text-lg font-semibold">
          {t('account')}
        </h2>
        <dl className="mt-4 divide-y divide-border rounded-xl bg-card shadow-[0_1px_2px_rgb(31_26_23/0.06),0_8px_24px_-12px_rgb(31_26_23/0.18)]">
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
