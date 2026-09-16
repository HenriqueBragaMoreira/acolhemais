'use client'

import { cn } from '@acolhemais/ui/lib/utils'
import { ClockIcon, SparkleIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { useState } from 'react'
import type { ApplicationWithAnimal } from '@/services/panel/types'
import { AdopterBadges } from '@/app/(application)/_components/adopter-badges'
import { AnimalThumb } from '@/app/(application)/_components/animal-thumb'
import { PANEL_SURFACE } from '@/app/(application)/_components/panel-surface'
import { TimeAgo } from '@/app/(application)/_components/time-ago'

/** Quanto tempo a candidatura movida continua marcada "Movida agora". */
const MOVED_HIGHLIGHT_MS = 10 * 60 * 1000

export function ApplicationCard({ application }: { application: ApplicationWithAnimal }) {
  const t = useTranslations('Panel.board')
  // A hora de chegada à tela: a marca vale para esta visita, sem mudar a cada nova renderização.
  const [openedAt] = useState(() => Date.now())
  const movedNow =
    application.movedAt !== null && openedAt - Date.parse(application.movedAt) < MOVED_HIGHLIGHT_MS

  return (
    <div
      className={cn(
        PANEL_SURFACE,
        'relative rounded-xl p-3 transition-shadow duration-150 has-[a:hover]:shadow-[0_1px_2px_rgb(31_26_23/0.08),0_12px_28px_-12px_rgb(31_26_23/0.3)]',
        movedNow && 'ring-2 ring-ring',
      )}
    >
      <div className="flex items-start gap-3">
        <AnimalThumb photo={application.animal.cover} className="w-10" sizes="40px" />
        <div className="min-w-0">
          {/* O nome é o link e cobre o cartão; os selos abrem a explicação por cima dele. */}
          <Link
            href={`/painel/candidaturas/${application.id}`}
            className="block font-semibold text-pretty after:absolute after:inset-0 after:rounded-xl focus-visible:outline-none focus-visible:after:outline-2 focus-visible:after:outline-offset-2 focus-visible:after:outline-ring"
          >
            {application.profile.applicant.name}
          </Link>
          <p className="text-sm text-muted-foreground">
            {t('for', { animal: application.animal.name })} · <TimeAgo value={application.sentAt} />
          </p>
        </div>
      </div>
      <AdopterBadges
        badges={application.badges}
        incidents={application.incidents}
        className="relative z-10 mt-3 w-fit"
      />
      {application.otherActive > 0 && (
        <p className="mt-2 text-xs text-muted-foreground">
          {t('otherActive', { count: application.otherActive })}
        </p>
      )}
      {application.awaitingAdopter && (
        <p className="mt-2 flex items-center gap-1.5 text-sm font-semibold">
          <ClockIcon aria-hidden className="size-4" />
          {t('awaiting')}
        </p>
      )}
      {movedNow && (
        <p className="mt-2 flex items-center gap-1.5 text-sm font-semibold text-ring">
          <SparkleIcon aria-hidden className="size-4" />
          {t('movedNow')}
        </p>
      )}
    </div>
  )
}
