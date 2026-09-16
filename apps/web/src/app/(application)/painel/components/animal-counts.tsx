'use client'

import { buttonVariants } from '@acolhemais/ui/components/button'
import { cn } from '@acolhemais/ui/lib/utils'
import { PlusIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { PANEL_SURFACE } from '@/app/(application)/_components/panel-surface'
import { animalsHref } from '../animais/search-params'

type AnimalCountsProps = {
  counts: { available: number; inProcess: number; draft: number; unavailable: number }
}

/** Quantos animais há em cada situação, cada um levando à lista filtrada, e o "Cadastrar". */
export function AnimalCounts({ counts }: AnimalCountsProps) {
  const t = useTranslations('Panel.home')
  const rows = [
    { key: 'available', count: counts.available, filter: 'disponiveis' },
    { key: 'inProcess', count: counts.inProcess, filter: 'em-processo' },
    { key: 'draft', count: counts.draft, filter: 'rascunhos' },
    { key: 'unavailable', count: counts.unavailable, filter: 'indisponiveis' },
  ] as const

  return (
    <section aria-labelledby="animals-title" className={cn(PANEL_SURFACE, 'p-5 sm:p-6')}>
      <h2 id="animals-title" className="text-xl font-bold tracking-tight">
        {t('animals')}
      </h2>
      <dl className="mt-4 divide-y divide-border">
        {rows.map(({ key, count, filter }) => (
          <div key={key} className="flex items-center justify-between gap-4 py-2.5">
            <dt>
              <Link
                href={`/painel/animais${animalsHref({ status: filter })}`}
                className="rounded-sm underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              >
                {t(`animalCounts.${key}`)}
              </Link>
            </dt>
            <dd className="text-lg font-bold tabular-nums">{count}</dd>
          </div>
        ))}
      </dl>
      <Link
        href="/painel/animais/novo"
        className={cn(buttonVariants({ size: 'lg' }), 'mt-6 w-full')}
      >
        <PlusIcon aria-hidden />
        {t('newAnimal')}
      </Link>
    </section>
  )
}
