'use client'

import type { AdopterBadge } from '@acolhemais/domain'
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverTitle,
  PopoverTrigger,
} from '@acolhemais/ui/components/popover'
import { cn } from '@acolhemais/ui/lib/utils'
import { BadgeCheckIcon, TriangleAlertIcon } from 'lucide-react'
import { useFormatter, useTranslations } from 'next-intl'
import type { AdopterIncident } from '@/services/panel/types'

/**
 * Os selos do adotante, sempre em palavras (BR-090): nunca uma nota. Cada um abre o que quer
 * dizer; `Atenção` e `Inelegível` mostram o resumo das ocorrências procedentes (BR-100).
 */
export function AdopterBadges({
  badges,
  incidents = [],
  className,
}: {
  badges: readonly AdopterBadge[]
  incidents?: readonly AdopterIncident[]
  className?: string
}) {
  const t = useTranslations('Panel.badges')
  const format = useFormatter()
  const month = (value: string) =>
    format.dateTime(new Date(`${value}-15T12:00:00`), { month: 'long', year: 'numeric' })

  return (
    <ul aria-label={t('label')} className={cn('flex flex-wrap gap-1.5', className)}>
      {badges.map((badge) => {
        const negative = badge === 'attention' || badge === 'ineligible'
        const related = negative
          ? incidents.filter((incident) =>
              badge === 'attention' ? incident.outcome === 'minor' : incident.outcome === 'severe',
            )
          : []
        return (
          <li key={badge}>
            <Popover>
              <PopoverTrigger
                aria-label={t('open', { badge: t(badge) })}
                className={cn(
                  'inline-flex h-6 cursor-pointer items-center gap-1 rounded-md px-2 text-xs font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
                  negative
                    ? 'bg-destructive-muted text-destructive hover:bg-[color-mix(in_oklch,var(--destructive-muted),var(--destructive)_10%)]'
                    : 'bg-muted text-foreground hover:bg-[color-mix(in_oklch,var(--muted),var(--foreground)_6%)]',
                )}
              >
                {negative && <TriangleAlertIcon aria-hidden className="size-3.5" />}
                {(badge === 'approved-adopter' || badge === 'verified') && (
                  <BadgeCheckIcon aria-hidden className="size-3.5" />
                )}
                {t(badge)}
              </PopoverTrigger>
              <PopoverContent>
                <PopoverTitle>{t(badge)}</PopoverTitle>
                <PopoverDescription>{t(`explain.${badge}`)}</PopoverDescription>
                {related.length > 0 && (
                  <ul className="mt-3 flex flex-col gap-2 border-t border-border pt-3">
                    {related.map((incident) => (
                      <li key={`${incident.category}-${incident.decidedIn}`}>
                        <p className="font-semibold">{t(`incidents.${incident.category}`)}</p>
                        <p className="text-muted-foreground">
                          {incident.validUntil
                            ? t('incidentMinor', {
                                decided: month(incident.decidedIn),
                                until: month(incident.validUntil),
                              })
                            : t('incidentSevere', { decided: month(incident.decidedIn) })}
                        </p>
                      </li>
                    ))}
                  </ul>
                )}
                {negative && <p className="mt-3 text-xs text-muted-foreground">{t('privacy')}</p>}
              </PopoverContent>
            </Popover>
          </li>
        )
      })}
    </ul>
  )
}
