'use client'

import { type ApplicationStage, PIPELINE_STAGES } from '@acolhemais/domain'
import { cn } from '@acolhemais/ui/lib/utils'
import { useTranslations } from 'next-intl'

const TRACK = [...PIPELINE_STAGES, 'completed'] as const

/** Ficha: o caminho até a adoção, com a etapa atual marcada. */
export function StageProgress({ stage }: { stage: ApplicationStage }) {
  const t = useTranslations('Panel')
  const current = TRACK.indexOf(stage as (typeof TRACK)[number])
  if (current === -1) return null
  const span = 100 - 100 / TRACK.length

  return (
    <ol aria-label={t('track')} className="relative grid grid-cols-5">
      <span
        aria-hidden
        className="absolute top-[7px] h-0.5 bg-border"
        style={{ left: `${50 / TRACK.length}%`, right: `${50 / TRACK.length}%` }}
      />
      <span
        aria-hidden
        className="absolute top-[7px] h-0.5 bg-foreground transition-[width] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none"
        style={{
          left: `${50 / TRACK.length}%`,
          width: `${(current / (TRACK.length - 1)) * span}%`,
        }}
      />
      {TRACK.map((station, index) => (
        <li
          key={station}
          aria-current={index === current ? 'step' : undefined}
          className="relative flex flex-col items-center gap-2 px-1 text-center"
        >
          <span
            aria-hidden
            className={cn(
              'size-4 rounded-full border-2 transition-colors delay-300 duration-300 motion-reduce:transition-none',
              index <= current ? 'border-foreground bg-foreground' : 'border-input bg-background',
              index === current && 'ring-4 ring-foreground/15',
            )}
          />
          <span
            className={cn(
              'text-xs text-balance sm:text-sm',
              index === current ? 'font-bold' : 'text-muted-foreground',
            )}
          >
            {t(`stages.${station}`)}
          </span>
        </li>
      ))}
    </ol>
  )
}
