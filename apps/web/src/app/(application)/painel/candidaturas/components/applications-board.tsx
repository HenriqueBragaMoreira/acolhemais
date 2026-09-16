'use client'

import { PIPELINE_STAGES } from '@acolhemais/domain'
import { Combobox } from '@acolhemais/ui/components/combobox'
import { Label } from '@acolhemais/ui/components/label'
import { useQuery } from '@tanstack/react-query'
import { useTranslations } from 'next-intl'
import { useQueryState } from 'nuqs'
import { panelServices } from '@/services/panel'
import { boardParams } from '../search-params'
import { StageColumn } from './stage-column'
import { ClosedApplications } from './closed-applications'

/**
 * As candidaturas por etapa (FR-045): colunas no computador e uma lista por etapa no celular,
 * cada uma na ordem de BR-082 e com "Ver mais". As encerradas ficam juntas no fim.
 */
export function ApplicationsBoard() {
  const t = useTranslations('Panel.board')
  const [animalId, setAnimalId] = useQueryState('animal', boardParams.animal)
  const names = useQuery({
    queryKey: ['panel', 'animal-names'],
    queryFn: () => panelServices.animalNames(),
  })

  return (
    <>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-balance">{t('title')}</h1>
          <p className="mt-2 max-w-prose text-pretty text-muted-foreground">{t('intro')}</p>
        </div>
        <div className="flex flex-col gap-2 sm:w-72">
          <Label htmlFor="filtro-animal">{t('animal')}</Label>
          <Combobox
            id="filtro-animal"
            options={(names.data ?? []).map(({ id, name }) => ({ value: id, label: name }))}
            value={animalId}
            onValueChange={(value) => void setAnimalId(value)}
            // Sem animal escolhido valem todos; o campo vazio diz isso.
            placeholder={t('allAnimals')}
            empty={t('noAnimal')}
            clearLabel={t('clearAnimal')}
          />
        </div>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-4 lg:gap-4">
        {PIPELINE_STAGES.map((stage) => (
          <StageColumn key={stage} stage={stage} animalId={animalId} />
        ))}
      </div>

      <ClosedApplications animalId={animalId} />
    </>
  )
}
