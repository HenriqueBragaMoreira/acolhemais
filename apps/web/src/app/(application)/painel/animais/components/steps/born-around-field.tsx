'use client'

import { Label } from '@acolhemais/ui/components/label'
import { NativeSelect } from '@acolhemais/ui/components/native-select'
import { useFormatter, useTranslations } from 'next-intl'
import { type Control, useController } from 'react-hook-form'
import { FieldMessage } from '@/components/field-message'
import type { AnimalFormValues } from '../forms/animal-form'

/** Anos para o nascimento aproximado: deste ano até 25 anos atrás. */
const BIRTH_YEARS = Array.from({ length: 26 }, (_, back) => String(new Date().getFullYear() - back))

/**
 * Mês e ano em duas seleções nativas, que juntas dão o `AAAA-MM` do cadastro. O campo de mês do
 * navegador aparece em inglês ou como texto livre, conforme o navegador.
 */
export function BornAroundField({ control }: { control: Control<AnimalFormValues> }) {
  const t = useTranslations('Panel.animalForm.fields')
  const tErrors = useTranslations('FormErrors')
  const format = useFormatter()
  const {
    field: { ref, value: bornAround, onBlur, onChange },
    fieldState,
  } = useController({ control, name: 'bornAround' })
  const [year = '', month = ''] = bornAround.split('-')
  const set = (nextYear: string, nextMonth: string) =>
    onChange(nextYear || nextMonth ? `${nextYear}-${nextMonth}` : '')
  const describedBy = fieldState.error ? 'nascimento-erro' : 'nascimento-dica'

  return (
    <fieldset aria-describedby={describedBy}>
      <legend className="mb-3 text-[0.9375rem] font-semibold">{t('bornAround')}</legend>
      <div className="flex flex-wrap gap-3">
        <div className="flex w-44 flex-col gap-2">
          <Label htmlFor="nascimento-mes" className="text-sm font-normal text-muted-foreground">
            {t('bornMonth')}
          </Label>
          <NativeSelect
            id="nascimento-mes"
            ref={ref}
            value={month}
            aria-invalid={fieldState.invalid}
            onBlur={onBlur}
            onChange={(event) => set(year, event.target.value)}
          >
            <option value="">{t('choose')}</option>
            {Array.from({ length: 12 }, (_, index) => {
              const value = String(index + 1).padStart(2, '0')
              return (
                <option key={value} value={value}>
                  {format.dateTime(new Date(2000, index, 1), { month: 'long' })}
                </option>
              )
            })}
          </NativeSelect>
        </div>
        <div className="flex w-32 flex-col gap-2">
          <Label htmlFor="nascimento-ano" className="text-sm font-normal text-muted-foreground">
            {t('bornYear')}
          </Label>
          <NativeSelect
            id="nascimento-ano"
            value={year}
            aria-invalid={fieldState.invalid}
            onBlur={onBlur}
            onChange={(event) => set(event.target.value, month)}
          >
            <option value="">{t('choose')}</option>
            {BIRTH_YEARS.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </NativeSelect>
        </div>
      </div>
      {!fieldState.error && (
        <p id="nascimento-dica" className="mt-2 text-sm text-muted-foreground">
          {t('bornAroundHint')}
        </p>
      )}
      <FieldMessage
        id="nascimento-erro"
        message={fieldState.error?.message && tErrors(fieldState.error.message)}
      />
    </fieldset>
  )
}
