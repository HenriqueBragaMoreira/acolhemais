'use client'

import { buttonVariants } from '@acolhemais/ui/components/button'
import { Spinner } from '@acolhemais/ui/components/spinner'
import { cn } from '@acolhemais/ui/lib/utils'
import { useQuery } from '@tanstack/react-query'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { use } from 'react'
import { panelServices } from '@/services/panel'
import { AnimalStatusLabel } from '../../../_components/animal-status-label'
import { AnimalThumb } from '../../../_components/animal-thumb'
import { AnimalStatusPanel } from './animal-status-panel'
import { animalStepper } from './animal-stepper'
import { BackToAnimals } from './back-to-animals'
import { AnimalForm } from './forms/animal-form'

/** Um animal da organização: a edição em etapas e, ao lado, a situação e o histórico. */
export function AnimalPage({ id }: { id: Promise<string> }) {
  const animalId = use(id)
  const t = useTranslations('Panel.animalForm')
  const { data: animal, isPending } = useQuery({
    queryKey: ['panel', 'animal', animalId],
    queryFn: () => panelServices.animal(animalId),
  })

  if (isPending) {
    return (
      <p className="flex items-center gap-2 text-muted-foreground">
        <Spinner />
        {t('loading')}
      </p>
    )
  }
  if (!animal) {
    return (
      <div className="max-w-xl">
        <h1 className="text-3xl font-bold tracking-tight">{t('notFound')}</h1>
        <Link href="/painel/animais" className={cn(buttonVariants(), 'mt-6')}>
          {t('backToAnimals')}
        </Link>
      </div>
    )
  }

  return (
    <>
      <BackToAnimals />
      <div className="mt-6 flex items-center gap-4">
        <AnimalThumb photo={animal.photos[0]} className="w-16" sizes="64px" />
        <div className="min-w-0">
          <h1 className="text-3xl font-bold tracking-tight text-balance">{animal.name}</h1>
          <div className="mt-1">
            <AnimalStatusLabel status={animal.status} />
          </div>
        </div>
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start">
        {/* `key`: depois de salvar, o formulário recomeça com o que foi guardado. */}
        <animalStepper.Provider key={animal.updatedAt}>
          <AnimalForm animal={animal} city={animal.city} />
        </animalStepper.Provider>
        <AnimalStatusPanel animal={animal} />
      </div>
    </>
  )
}
