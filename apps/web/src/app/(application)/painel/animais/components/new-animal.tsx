'use client'

import { Spinner } from '@acolhemais/ui/components/spinner'
import { useQuery } from '@tanstack/react-query'
import { useTranslations } from 'next-intl'
import { panelServices } from '@/services/panel'
import { animalStepper } from './animal-stepper'
import { BackToAnimals } from './back-to-animals'
import { AnimalForm } from './forms/animal-form'

/** Cadastrar animal: o formulário em etapas, começando pela cidade da organização. */
export function NewAnimal() {
  const t = useTranslations('Panel.animalForm')
  const organization = useQuery({
    queryKey: ['panel', 'organization'],
    queryFn: () => panelServices.organization(),
  })

  return (
    <div className="mx-auto max-w-3xl">
      <BackToAnimals />
      <h1 className="mt-6 text-3xl font-bold tracking-tight text-balance">{t('newTitle')}</h1>
      <div className="mt-6">
        {organization.data ? (
          <animalStepper.Provider>
            <AnimalForm city={organization.data.city} />
          </animalStepper.Provider>
        ) : (
          <p className="flex items-center gap-2 text-muted-foreground">
            <Spinner />
            {t('loading')}
          </p>
        )}
      </div>
    </div>
  )
}
