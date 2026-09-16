'use client'

import { useTranslations } from 'next-intl'
import { type Control, useWatch } from 'react-hook-form'
import { ChoiceField } from '@/components/choice-field'
import { TextField } from '@/components/text-field'
import { useOptions } from './use-options'
import type { AnimalFormValues } from '../forms/animal-form'

export function HealthStep({ control }: { control: Control<AnimalFormValues> }) {
  const t = useTranslations('Panel.animalForm.fields')
  const species = useWatch({ control, name: 'species' })
  const yesNoOptions = useOptions('yesNo', ['yes', 'no'] as const)
  const companions = useOptions('companion', ['yes', 'no', 'untested'] as const)
  const fivFelvOptions = useOptions('fivFelv', ['negative', 'positive', 'untested'] as const)

  return (
    <div className="flex flex-col gap-5">
      <ChoiceField
        control={control}
        name="castrated"
        label={t('castrated')}
        options={yesNoOptions}
        inline
      />
      <ChoiceField
        control={control}
        name="vaccinated"
        label={t('vaccinated')}
        options={yesNoOptions}
        inline
      />
      <ChoiceField
        control={control}
        name="dewormed"
        label={t('dewormed')}
        options={yesNoOptions}
        inline
      />
      {species === 'cat' && (
        <ChoiceField
          control={control}
          name="fivFelv"
          label={t('fivFelv')}
          options={fivFelvOptions}
          inline
        />
      )}
      <TextField
        control={control}
        name="specialNeeds"
        label={t('specialNeeds')}
        description={t('specialNeedsHint')}
        multiline
      />
      <h3 className="mt-3 border-t border-border pt-6 font-bold tracking-tight">{t('goodWith')}</h3>
      {(['children', 'dogs', 'cats'] as const).map((who) => (
        <ChoiceField
          key={who}
          control={control}
          name={`goodWith.${who}`}
          label={t(`goodWithValue.${who}`)}
          options={companions}
          inline
        />
      ))}
    </div>
  )
}
