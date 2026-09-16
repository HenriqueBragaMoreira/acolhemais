'use client'

import { Button } from '@acolhemais/ui/components/button'
import { Checkbox } from '@acolhemais/ui/components/checkbox'
import { DatePicker } from '@acolhemais/ui/components/date-picker'
import { DialogClose } from '@acolhemais/ui/components/dialog'
import { Field, FieldContent, FieldDescription, FieldLabel } from '@acolhemais/ui/components/field'
import { Spinner } from '@acolhemais/ui/components/spinner'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'
import { authServices } from '@/services/auth'
import { FieldMessage } from '@/components/field-message'
import { panelServices } from '@/services/panel'

/** Hoje no fuso de quem usa, no formato do campo de data (AAAA-MM-DD). */
function today() {
  return new Date().toLocaleDateString('sv-SE')
}

const schema = z.object({
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'dateRequired')
    .refine((date) => date <= today(), 'dateFuture'),
  documentChecked: z.boolean().refine(Boolean, 'documentRequired'),
})

/**
 * Concluir a adoção (BR-079): a data e a confirmação de que um documento com foto foi
 * conferido, que fecha a brecha de alguém usar o CPF de outra pessoa.
 */
export function CompleteForm({
  applicationId,
  applicantName,
  animalName,
  onDone,
}: {
  applicationId: string
  applicantName: string
  animalName: string
  onDone: () => void
}) {
  const t = useTranslations('Panel.file.complete')
  const tErrors = useTranslations('FormErrors')
  const { data: session } = useQuery({
    queryKey: ['session'],
    queryFn: () => authServices.session(),
  })
  const by = session?.user.name ?? ''
  // Hoje, na abertura do diálogo: o último dia que o calendário deixa escolher.
  const [now] = useState(() => new Date())
  const queryClient = useQueryClient()
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: { date: today(), documentChecked: false },
  })

  const complete = useMutation({
    mutationFn: ({ date }: z.infer<typeof schema>) =>
      panelServices.complete(applicationId, date, by),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['panel'] })
      onDone()
    },
  })

  return (
    <form
      noValidate
      onSubmit={form.handleSubmit((data) => complete.mutate(data))}
      className="mt-6 flex flex-col gap-1"
    >
      <Controller
        control={form.control}
        name="date"
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid} className="gap-2">
            <FieldLabel htmlFor="data-adocao">{t('date')}</FieldLabel>
            <DatePicker
              id="data-adocao"
              className="sm:w-full"
              ref={field.ref}
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              placeholder={t('datePlaceholder')}
              max={now}
              aria-invalid={fieldState.invalid}
              aria-describedby={fieldState.error ? 'data-adocao-error' : undefined}
            />
            <FieldMessage
              id="data-adocao-error"
              message={fieldState.error?.message && tErrors(fieldState.error.message)}
            />
          </Field>
        )}
      />
      <Controller
        control={form.control}
        name="documentChecked"
        render={({ field, fieldState }) => (
          <div>
            <Field orientation="horizontal" className="gap-3">
              <Checkbox
                id="documento-conferido"
                inputRef={field.ref}
                checked={field.value}
                onCheckedChange={field.onChange}
                aria-invalid={fieldState.invalid}
                aria-describedby={
                  fieldState.error ? 'documento-conferido-error' : 'documento-conferido-hint'
                }
              />
              <FieldContent>
                <FieldLabel htmlFor="documento-conferido">
                  {t('document', { name: applicantName })}
                </FieldLabel>
                <FieldDescription id="documento-conferido-hint">
                  {t('documentHint')}
                </FieldDescription>
              </FieldContent>
            </Field>
            <FieldMessage
              id="documento-conferido-error"
              message={fieldState.error?.message && tErrors(fieldState.error.message)}
            />
          </div>
        )}
      />
      <p className="mt-2 rounded-lg bg-muted px-3.5 py-3 text-sm text-pretty">
        {t('effects', { animal: animalName })}
      </p>
      <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <DialogClose render={<Button variant="outline" />}>{t('cancel')}</DialogClose>
        <Button type="submit" disabled={complete.isPending} aria-busy={complete.isPending}>
          {complete.isPending && <Spinner />}
          {complete.isPending ? t('completing') : t('submit')}
        </Button>
      </div>
    </form>
  )
}
