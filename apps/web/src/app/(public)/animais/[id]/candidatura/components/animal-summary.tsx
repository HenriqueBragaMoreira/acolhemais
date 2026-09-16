'use client'

import { useFormatter, useTranslations } from 'next-intl'
import Image from 'next/image'
import { useApplicationTarget } from './use-application-target'

/** O animal da candidatura: foto, quem é, a organização e a taxa. */
export function AnimalSummary() {
  const t = useTranslations('Application.animal')
  const tProfile = useTranslations('AnimalProfile')
  const format = useFormatter()
  const { animal, organization } = useApplicationTarget()
  const summary = [
    tProfile('sex', { sex: animal.sex }),
    tProfile('age', { age: animal.ageGroup, sex: animal.sex }),
  ].join(' · ')

  return (
    <aside
      aria-label={t('label', { name: animal.name })}
      className="flex items-center gap-4 rounded-2xl bg-background p-3 shadow-[0_1px_2px_rgb(31_26_23/0.06),0_8px_24px_-12px_rgb(31_26_23/0.18)] lg:sticky lg:top-8 lg:flex-col lg:items-stretch lg:p-4"
    >
      <div className="relative size-20 shrink-0 overflow-hidden rounded-xl bg-muted lg:aspect-[4/5] lg:size-auto">
        <Image
          src={animal.cover.src}
          alt=""
          fill
          sizes="(min-width: 64rem) 20rem, 5rem"
          className="object-cover"
          style={{ objectPosition: animal.cover.focus }}
        />
      </div>
      <div className="min-w-0 lg:px-1 lg:pb-1">
        <p className="text-lg font-bold tracking-tight lg:text-xl">{animal.name}</p>
        <p className="text-sm">{summary}</p>
        <p className="text-sm text-muted-foreground">
          {organization.name} · {animal.city}
        </p>
        <p className="mt-2 hidden text-sm lg:block">
          {animal.fee
            ? t('fee', {
                value: format.number(animal.fee.cents / 100, {
                  style: 'currency',
                  currency: 'BRL',
                }),
              })
            : t('noFee')}
        </p>
      </div>
    </aside>
  )
}
