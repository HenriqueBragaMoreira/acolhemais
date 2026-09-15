'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslations } from 'next-intl'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import type { Reasons } from '@/services/applications'
import { StepActions, TextField } from '../application-fields'
import { useApplicationTarget, useStepData, useAdvance } from '../application-stepper'
import { text } from './answers'

const reasonsSchema = z.object({
  why: text,
  ifMoving: text,
  ifBehavior: text,
}) satisfies z.ZodType<Reasons>

const EMPTY: Reasons = { why: '', ifMoving: '', ifBehavior: '' }

/** Por que adotar e o que fazer nos imprevistos (BR-070). */
export function ReasonsForm() {
  const t = useTranslations('Application.reasons')
  const { advance } = useAdvance()
  const draft = useStepData()
  const { animal } = useApplicationTarget()

  const form = useForm<z.input<typeof reasonsSchema>, unknown, z.output<typeof reasonsSchema>>({
    resolver: zodResolver(reasonsSchema),
    defaultValues: draft('reasons') ?? EMPTY,
  })

  return (
    <form noValidate onSubmit={form.handleSubmit((data) => advance(data))}>
      <div className="flex flex-col gap-3">
        <TextField
          control={form.control}
          name="why"
          label={t('why', { name: animal.name })}
          multiline
        />
        <TextField control={form.control} name="ifMoving" label={t('ifMoving')} multiline />
        <TextField control={form.control} name="ifBehavior" label={t('ifBehavior')} multiline />
      </div>
      <StepActions />
    </form>
  )
}
