'use client'

import { Button, buttonVariants } from '@acolhemais/ui/components/button'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { useState } from 'react'
import { BackupCodeForm } from './forms/backup-code-form'
import { TotpForm } from './forms/totp-form'

type Method = 'totp' | 'backup'

/** Escolha entre o código do app (padrão) e um código de recuperação. */
export function TwoFactorChallenge() {
  const t = useTranslations('TwoFactor')
  const [method, setMethod] = useState<Method>('totp')

  return (
    <>
      <p className="mt-2 text-muted-foreground">
        {method === 'totp' ? t('totpDescription') : t('backupDescription')}
      </p>

      <div className="mt-8">{method === 'totp' ? <TotpForm /> : <BackupCodeForm />}</div>

      <div className="mt-6 flex flex-col items-start gap-3">
        <Button variant="link" onClick={() => setMethod(method === 'totp' ? 'backup' : 'totp')}>
          {method === 'totp' ? t('useBackupCode') : t('useTotp')}
        </Button>
        <Link href="/entrar" className={buttonVariants({ variant: 'link' })}>
          {t('backToSignIn')}
        </Link>
      </div>
    </>
  )
}
