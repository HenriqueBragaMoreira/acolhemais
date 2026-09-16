'use client'

import { cn } from '@acolhemais/ui/lib/utils'
import { PANEL } from '../../_components/panel-surface'

/** Mesma altura do resumo, para nada pular quando os números chegam. */
export function PanelSummarySkeleton() {
  return (
    <div aria-hidden className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start">
      <div className={cn(PANEL, 'h-[30rem] animate-pulse')} />
      <div className={cn(PANEL, 'h-[20rem] animate-pulse')} />
    </div>
  )
}
