'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslations } from 'next-intl'
import { useForm, useWatch } from 'react-hook-form'
import { z } from 'zod'
import { HOUSING_TYPES, OWNERSHIPS } from '@/constants/application'
import type { Home } from '@/services/applications/types'
import { ChoiceField } from '@/components/choice-field'
import { TextField } from '@/components/text-field'
import { StepActions } from '../step-actions'
import { useYesNo } from '../use-yes-no'
import { useStepData } from '../use-step-data'
import { useAdvance } from '../use-advance'
import { choice, optionalText, requireWhen, yesNo } from '@/utils/form-schema-fields'

const homeSchema = z
  .object({
    housing: choice(HOUSING_TYPES),
    ownership: choice(OWNERSHIPS),
    landlordAllows: yesNo.or(z.null()),
    yard: yesNo,
    screens: yesNo,
    adults: z
      .string()
      .trim()
      .regex(/^([1-9]|1\d|20)$/, 'adultsInvalid'),
    children: yesNo,
    childrenAges: optionalText,
    everyoneAgrees: yesNo,
  })
  .superRefine((home, context) => {
    requireWhen(context, home.ownership === 'rent', home.landlordAllows, 'landlordAllows')
    requireWhen(context, home.children === 'yes', home.childrenAges, 'childrenAges')
  }) satisfies z.ZodType<Home>

const EMPTY: Home = {
  housing: null,
  ownership: null,
  landlordAllows: null,
  yard: null,
  screens: null,
  adults: '',
  children: null,
  childrenAges: '',
  everyoneAgrees: null,
}

/** Moradia e quem mora na casa (BR-070). */
export function HomeForm() {
  const t = useTranslations('Application.home')
  const yesNoOptions = useYesNo()
  const { advance } = useAdvance()
  const draft = useStepData()

  const form = useForm<z.input<typeof homeSchema>, unknown, z.output<typeof homeSchema>>({
    resolver: zodResolver(homeSchema),
    defaultValues: draft('home') ?? EMPTY,
  })
  const [ownership, children] = useWatch({ control: form.control, name: ['ownership', 'children'] })

  return (
    <form noValidate onSubmit={form.handleSubmit((data) => advance(data))}>
      <div className="flex flex-col gap-5">
        <ChoiceField
          control={form.control}
          name="housing"
          label={t('housing')}
          inline
          options={HOUSING_TYPES.map((value) => ({ value, label: t(`housingValue.${value}`) }))}
        />
        <ChoiceField
          control={form.control}
          name="ownership"
          label={t('ownership')}
          inline
          options={OWNERSHIPS.map((value) => ({ value, label: t(`ownershipValue.${value}`) }))}
        />
        {ownership === 'rent' && (
          <ChoiceField
            control={form.control}
            name="landlordAllows"
            label={t('landlordAllows')}
            inline
            options={yesNoOptions}
          />
        )}
        <ChoiceField
          control={form.control}
          name="yard"
          label={t('yard')}
          inline
          options={yesNoOptions}
        />
        <ChoiceField
          control={form.control}
          name="screens"
          label={t('screens')}
          description={t('screensHint')}
          inline
          options={yesNoOptions}
        />
      </div>

      <h3 className="mt-8 mb-5 text-lg font-bold tracking-tight">{t('household')}</h3>
      <div className="flex flex-col gap-5">
        <TextField
          control={form.control}
          name="adults"
          label={t('adults')}
          inputMode="numeric"
          inputClassName="max-w-28"
        />
        <ChoiceField
          control={form.control}
          name="children"
          label={t('children')}
          inline
          options={yesNoOptions}
        />
        {children === 'yes' && (
          <TextField control={form.control} name="childrenAges" label={t('childrenAges')} />
        )}
        <ChoiceField
          control={form.control}
          name="everyoneAgrees"
          label={t('everyoneAgrees')}
          inline
          options={yesNoOptions}
        />
      </div>
      <StepActions />
    </form>
  )
}
