'use client'

import type { AnimalStatus } from '@acolhemais/domain'
import { cn } from '@acolhemais/ui/lib/utils'
import { useTranslations } from 'next-intl'

/** A situação do animal num rótulo curto; rascunho e arquivado em tom de apoio. */
export function AnimalStatusLabel({ status }: { status: AnimalStatus }) {
  const t = useTranslations('Panel.animalStatus')
  return (
    <span
      className={cn(
        'inline-flex h-6 items-center gap-1.5 rounded-md px-2 text-xs font-semibold whitespace-nowrap',
        status === 'draft' || status === 'archived'
          ? 'border border-dashed border-input text-muted-foreground'
          : 'bg-muted text-foreground',
      )}
    >
      <span
        aria-hidden
        className={cn(
          'size-1.5 rounded-full',
          status === 'available' && 'bg-foreground',
          status === 'in-process' && 'bg-ring',
          status === 'adopted' && 'bg-ring',
          (status === 'draft' || status === 'archived' || status === 'unavailable') &&
            'bg-muted-foreground',
        )}
      />
      {t(status)}
    </span>
  )
}
