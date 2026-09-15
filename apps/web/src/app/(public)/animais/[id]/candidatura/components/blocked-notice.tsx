'use client'

import { Alert, AlertDescription, AlertTitle } from '@acolhemais/ui/components/alert'
import { CircleAlertIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { type ApplicationBlock, MAX_ACTIVE_APPLICATIONS } from '@/services/applications'
import { useApplicationTarget } from './application-stepper'

/** Por que a candidatura não segue: já existe uma para este animal (BR-075) ou o limite (BR-074). */
export function BlockedNotice({ reason }: { reason: ApplicationBlock }) {
  const t = useTranslations('Application.blocked')
  const { animal } = useApplicationTarget()

  return (
    <Alert variant="destructive" role="alert" className="mt-6">
      <CircleAlertIcon aria-hidden />
      <AlertTitle>{t(`${reason}.title`, { name: animal.name })}</AlertTitle>
      <AlertDescription>
        {t(`${reason}.description`, { max: MAX_ACTIVE_APPLICATIONS })}{' '}
        {reason === 'duplicate' && (
          <Link href="/" className="font-semibold underline underline-offset-4">
            {t('gallery')}
          </Link>
        )}
      </AlertDescription>
    </Alert>
  )
}
