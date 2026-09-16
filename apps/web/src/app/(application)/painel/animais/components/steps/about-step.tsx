'use client'

import { useTranslations } from 'next-intl'
import { type Control } from 'react-hook-form'
import { ChoiceField } from '@/components/choice-field'
import { TextField } from '@/components/text-field'
import { AGE_GROUPS, COATS, SEXES, SIZES, SPECIES } from '@/constants/animal-options'
import { useAnimalFormOptions } from './use-animal-form-options'
import { BornAroundField } from './born-around-field'
import type { AnimalFormValues } from '../forms/animal-form'

export function AboutStep({ control }: { control: Control<AnimalFormValues> }) {
  const t = useTranslations('Panel.animalForm.fields')
  return (
    <div className="flex flex-col gap-5">
      <TextField control={control} name="name" label={t('name')} autoComplete="off" />
      <ChoiceField
        control={control}
        name="species"
        label={t('species')}
        options={useAnimalFormOptions('species', SPECIES)}
        inline
      />
      <ChoiceField
        control={control}
        name="sex"
        label={t('sex')}
        options={useAnimalFormOptions('sex', SEXES)}
        inline
      />
      <ChoiceField
        control={control}
        name="ageGroup"
        label={t('ageGroup')}
        options={useAnimalFormOptions('ageGroup', AGE_GROUPS)}
      />
      <BornAroundField control={control} />
      <ChoiceField
        control={control}
        name="size"
        label={t('size')}
        options={useAnimalFormOptions('size', SIZES)}
        inline
      />
      <ChoiceField
        control={control}
        name="coat"
        label={t('coat')}
        options={useAnimalFormOptions('coat', COATS)}
        inline
      />
      <TextField control={control} name="city" label={t('city')} description={t('cityHint')} />
    </div>
  )
}
