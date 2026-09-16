'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslations } from 'next-intl'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { HOURS_ALONE } from '@/constants/application'
import type { Routine } from '@/services/applications/types'
import { ChoiceField } from '@/components/choice-field'
import { TextField } from '@/components/text-field'
import { StepActions } from '../step-actions'
import { useYesNo } from '../use-yes-no'
import { useStepData } from '../use-step-data'
import { useAdvance } from '../use-advance'
import { choice, text, yesNo } from '@/utils/form-schema-fields'

const routineSchema = z.object({
  hoursAlone: choice(HOURS_ALONE),
  whereStays: text,
  travelCare: text,
  awareOfCosts: yesNo,
}) satisfies z.ZodType<Routine>

const EMPTY: Routine = { hoursAlone: null, whereStays: '', travelCare: '', awareOfCosts: null }

/** Rotina e custos (BR-070). */
export function RoutineForm() {
  const t = useTranslations('Application.routine')
  const yesNoOptions = useYesNo()
  const { advance } = useAdvance()
  const draft = useStepData()

  const form = useForm<z.input<typeof routineSchema>, unknown, z.output<typeof routineSchema>>({
    resolver: zodResolver(routineSchema),
    defaultValues: draft('routine') ?? EMPTY,
  })

  return (
    <form noValidate onSubmit={form.handleSubmit((data) => advance(data))}>
      <div className="flex flex-col gap-5">
        <ChoiceField
          control={form.control}
          name="hoursAlone"
          label={t('hoursAlone')}
          options={HOURS_ALONE.map((value) => ({ value, label: t(`hoursAloneValue.${value}`) }))}
        />
        <TextField control={form.control} name="whereStays" label={t('whereStays')} />
        <TextField control={form.control} name="travelCare" label={t('travelCare')} />
        <ChoiceField
          control={form.control}
          name="awareOfCosts"
          label={t('awareOfCosts')}
          description={t('awareOfCostsHint')}
          inline
          options={yesNoOptions}
        />
      </div>
      <StepActions />
    </form>
  )
}
