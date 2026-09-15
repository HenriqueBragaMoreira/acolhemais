'use client'

import { isValidCpf } from '@acolhemais/domain'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { formatCpf, formatPhone } from '@/lib/masks'
import {
  type Applicant,
  type ApplicationBlock,
  applicationsServices,
} from '@/services/applications'
import { StepActions, TextField } from '../application-fields'
import { useApplicationTarget, useStepData, useAdvance } from '../application-stepper'
import { BlockedNotice } from '../blocked-notice'

const applicantSchema = z.object({
  name: z.string().trim().min(3, 'nameRequired').max(120, 'tooLong'),
  cpf: z.string().trim().min(1, 'cpfRequired').refine(isValidCpf, 'cpfInvalid'),
  // Opcional (BR-131): com ele, a organização pode chamar pelo WhatsApp.
  phone: z
    .string()
    .trim()
    .refine(
      (phone) => phone === '' || /^\d{10,11}$/.test(phone.replace(/\D/g, '')),
      'phoneInvalid',
    ),
}) satisfies z.ZodType<Applicant>

const EMPTY: Applicant = { name: '', cpf: '', phone: '' }

/** Nome, CPF (obrigatório para candidatar, BR-071) e telefone. */
export function ApplicantForm() {
  const t = useTranslations('Application.applicant')
  const { advance } = useAdvance()
  const draft = useStepData()
  const { animal } = useApplicationTarget()
  const [blocked, setBlocked] = useState<ApplicationBlock | null>(null)

  const form = useForm<z.input<typeof applicantSchema>, unknown, z.output<typeof applicantSchema>>({
    resolver: zodResolver(applicantSchema),
    defaultValues: draft('applicant') ?? EMPTY,
  })

  const save = useMutation({
    mutationFn: async (applicant: Applicant) => {
      const block = await applicationsServices.check(applicant.cpf, animal.id)
      setBlocked(block)
      if (!block) await advance(applicant)
    },
  })

  return (
    <form noValidate onSubmit={form.handleSubmit((data) => save.mutate(data))}>
      <p className="mb-6 text-sm text-muted-foreground">
        {t('email', { email: draft('account')?.email ?? '' })}
      </p>
      <div className="flex flex-col gap-5">
        <TextField control={form.control} name="name" label={t('name')} autoComplete="name" />
        <div className="grid gap-x-4 gap-y-5 sm:grid-cols-2">
          <TextField
            control={form.control}
            name="cpf"
            label={t('cpf')}
            description={t('cpfHint')}
            inputMode="numeric"
            placeholder="000.000.000-00"
            format={formatCpf}
          />
          <TextField
            control={form.control}
            name="phone"
            label={t('phone')}
            description={t('phoneHint')}
            type="tel"
            autoComplete="tel"
            placeholder="(00) 00000-0000"
            format={formatPhone}
          />
        </div>
      </div>
      {blocked && <BlockedNotice reason={blocked} />}
      <StepActions pending={save.isPending} />
    </form>
  )
}
