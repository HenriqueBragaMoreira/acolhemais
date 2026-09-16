'use client'

import { useFormatter, useTranslations } from 'next-intl'
import { type Control, useWatch } from 'react-hook-form'
import { ChoiceField } from '@/components/choice-field'
import { TextField } from '@/components/text-field'
import { DEMO_FEE_CAP_CENTS } from '@/services/panel'
import { useOptions } from './use-options'
import type { AnimalFormValues } from '../forms/animal-form'

export function StoryStep({ control }: { control: Control<AnimalFormValues> }) {
  const t = useTranslations('Panel.animalForm.fields')
  const format = useFormatter()
  const feeMode = useWatch({ control, name: 'feeMode' })
  const cap = format.number(DEMO_FEE_CAP_CENTS / 100, { style: 'currency', currency: 'BRL' })

  return (
    <div className="flex flex-col gap-5">
      <TextField
        control={control}
        name="story"
        label={t('story')}
        description={t('storyHint')}
        multiline
      />
      <ChoiceField
        control={control}
        name="feeMode"
        label={t('fee')}
        description={t('feeHint')}
        options={useOptions('feeMode', ['none', 'fee'] as const)}
        inline
      />
      {feeMode === 'fee' && (
        <>
          <TextField
            control={control}
            name="feeValue"
            label={t('feeValue')}
            description={t('feeValueHint', { cap })}
            inputMode="decimal"
            placeholder="60,00"
            inputClassName="w-40"
          />
          <TextField
            control={control}
            name="feeCovers"
            label={t('feeCovers')}
            description={t('feeCoversHint')}
          />
        </>
      )}
    </div>
  )
}
