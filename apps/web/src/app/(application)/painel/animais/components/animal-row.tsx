'use client'

import { useTranslations } from 'next-intl'
import Link from 'next/link'
import type { ManagedAnimal } from '@/services/panel/types'
import { AnimalStatusLabel } from '@/app/(application)/_components/animal-status-label'
import { AnimalThumb } from '@/app/(application)/_components/animal-thumb'
import { TimeAgo } from '@/app/(application)/_components/time-ago'
import { boardHref } from '@/app/(application)/painel/candidaturas/search-params'

type AnimalRowProps = { animal: ManagedAnimal & { activeApplications: number } }

/** Uma linha da lista de animais: foto, nome, situação, candidaturas ativas e última mudança. */
export function AnimalRow({ animal }: AnimalRowProps) {
  const t = useTranslations('Panel.animals')
  const tProfile = useTranslations('AnimalProfile')
  const tOptions = useTranslations('Panel.animalForm.options')

  return (
    <li className="relative grid grid-cols-[3.5rem_minmax(0,1fr)] items-center gap-x-4 gap-y-2 px-4 py-3 hover:bg-muted sm:grid-cols-[3.5rem_minmax(0,1fr)_9rem_11rem_12rem] sm:px-5">
      <AnimalThumb
        photo={animal.photos[0]}
        className="row-span-2 w-14 sm:row-span-1"
        sizes="56px"
      />
      <div className="min-w-0">
        <Link
          href={`/painel/animais/${animal.id}`}
          className="font-semibold underline-offset-4 after:absolute after:inset-0 hover:underline focus-visible:outline-none focus-visible:after:rounded-lg focus-visible:after:outline-2 focus-visible:after:-outline-offset-2 focus-visible:after:outline-ring"
        >
          {animal.name}
        </Link>
        <p className="text-sm text-muted-foreground">
          {[
            tOptions(`species.${animal.species}`),
            tProfile('sex', { sex: animal.sex }),
            tProfile('age', { age: animal.ageGroup, sex: animal.sex }),
          ].join(' · ')}
        </p>
      </div>
      <div className="col-start-2 flex flex-wrap items-center gap-x-4 gap-y-1 sm:contents">
        <span>
          <AnimalStatusLabel status={animal.status} />
        </span>
        <span className="text-sm">
          {animal.activeApplications > 0 ? (
            <Link
              href={`/painel/candidaturas${boardHref({ animal: animal.id })}`}
              className="relative z-10 rounded-sm font-semibold underline decoration-1 underline-offset-4 hover:decoration-2"
            >
              {t('applications', { count: animal.activeApplications })}
            </Link>
          ) : (
            <span className="text-muted-foreground">{t('applications', { count: 0 })}</span>
          )}
        </span>
        <span className="text-sm text-muted-foreground">
          {t('updated')} <TimeAgo value={animal.updatedAt} />
        </span>
      </div>
    </li>
  )
}
