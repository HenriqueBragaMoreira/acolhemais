'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslations } from 'next-intl'
import { useForm, useWatch } from 'react-hook-form'
import { z } from 'zod'
import type { Pets } from '@/services/applications'
import { ChoiceField, StepActions, TextField, useYesNo } from '../application-fields'
import { useStepData, useAdvance } from '../application-stepper'
import { optionalText, requireWhen, yesNo } from './answers'

const petsSchema = z
  .object({
    hasPets: yesNo,
    pets: optionalText,
    petsCared: yesNo.or(z.null()),
    hadPets: yesNo,
    pastPets: optionalText,
  })
  .superRefine((pets, context) => {
    requireWhen(context, pets.hasPets === 'yes', pets.pets, 'pets')
    requireWhen(context, pets.hasPets === 'yes', pets.petsCared, 'petsCared')
    requireWhen(context, pets.hadPets === 'yes', pets.pastPets, 'pastPets')
  }) satisfies z.ZodType<Pets>

const EMPTY: Pets = { hasPets: null, pets: '', petsCared: null, hadPets: null, pastPets: '' }

/** Outros animais e experiência (BR-070). */
export function PetsForm() {
  const t = useTranslations('Application.pets')
  const yesNoOptions = useYesNo()
  const { advance } = useAdvance()
  const draft = useStepData()

  const form = useForm<z.input<typeof petsSchema>, unknown, z.output<typeof petsSchema>>({
    resolver: zodResolver(petsSchema),
    defaultValues: draft('pets') ?? EMPTY,
  })
  const [hasPets, hadPets] = useWatch({ control: form.control, name: ['hasPets', 'hadPets'] })

  return (
    <form noValidate onSubmit={form.handleSubmit((data) => advance(data))}>
      <div className="flex flex-col gap-5">
        <ChoiceField
          control={form.control}
          name="hasPets"
          label={t('hasPets')}
          inline
          options={yesNoOptions}
        />
        {hasPets === 'yes' && (
          <>
            <TextField control={form.control} name="pets" label={t('pets')} />
            <ChoiceField
              control={form.control}
              name="petsCared"
              label={t('petsCared')}
              inline
              options={yesNoOptions}
            />
          </>
        )}
        <ChoiceField
          control={form.control}
          name="hadPets"
          label={t('hadPets')}
          inline
          options={yesNoOptions}
        />
        {hadPets === 'yes' && (
          <TextField control={form.control} name="pastPets" label={t('pastPets')} multiline />
        )}
      </div>
      <StepActions />
    </form>
  )
}
