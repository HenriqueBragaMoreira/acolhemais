'use client'

import { isActiveStage } from '@acolhemais/domain'
import { HeartHandshakeIcon } from 'lucide-react'
import { useFormatter, useTranslations } from 'next-intl'
import { type ApplicationWithAnimal } from '@/services/panel'

/** Como terminou, quando já terminou. */
export function ApplicationOutcome({ application }: { application: ApplicationWithAnimal }) {
  const t = useTranslations('Panel.file.outcome')
  const format = useFormatter()
  const last = application.history.at(-1)
  if (isActiveStage(application.stage) || !last) return null
  const date = format.dateTime(new Date(last.at), { dateStyle: 'long' })

  if (application.stage === 'completed' && last.kind === 'completed') {
    return (
      <p className="mt-6 flex items-center gap-2 font-semibold">
        <HeartHandshakeIcon aria-hidden className="size-5 text-ring" />
        {t('completed', {
          animal: application.animal.name,
          date: format.dateTime(new Date(`${last.date}T12:00:00`), { dateStyle: 'long' }),
        })}
      </p>
    )
  }
  return (
    <p className="mt-2 font-semibold">
      {t(application.stage === 'refused' ? 'refused' : 'closed', {
        stage: application.stage,
        date,
      })}
    </p>
  )
}
