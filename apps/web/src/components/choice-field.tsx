'use client'

import { Field, FieldDescription, FieldLabel } from '@acolhemais/ui/components/field'
import { RadioGroup, RadioGroupItem } from '@acolhemais/ui/components/radio-group'
import { cn } from '@acolhemais/ui/lib/utils'
import { useTranslations } from 'next-intl'
import { useId } from 'react'
import { type Control, Controller, type FieldValues, type Path } from 'react-hook-form'
import { FieldMessage } from '@/components/field-message'

/*
 * Campos de pergunta dos formulários longos (candidatura, cadastro de animal). As mensagens de
 * erro dos schemas são chaves de `FormErrors`.
 */

export type BaseFieldProps<V extends FieldValues> = {
  control: Control<V>
  name: Path<V>
  label: string
  description?: string | undefined
}

/** Uma pergunta de escolha única, com as opções em linha quando são curtas (Sim/Não). */
export function ChoiceField<V extends FieldValues>({
  control,
  name,
  label,
  description,
  options,
  inline = false,
}: BaseFieldProps<V> & { options: { value: string; label: string }[]; inline?: boolean }) {
  const t = useTranslations('FormErrors')
  const id = useId()

  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <fieldset aria-describedby={fieldState.error ? `${id}-error` : description && `${id}-hint`}>
          <legend className="mb-3 text-[0.9375rem] font-semibold text-pretty">{label}</legend>
          {description && !fieldState.error && (
            <FieldDescription id={`${id}-hint`} className="-mt-2 mb-3">
              {description}
            </FieldDescription>
          )}
          <RadioGroup
            inputRef={field.ref}
            value={field.value ?? ''}
            onValueChange={field.onChange}
            className={cn(inline && 'flex-row flex-wrap gap-x-8')}
          >
            {options.map((option) => (
              <Field key={option.value} orientation="horizontal" className="w-auto gap-3">
                <RadioGroupItem
                  id={`${id}-${option.value}`}
                  value={option.value}
                  onBlur={field.onBlur}
                  aria-invalid={fieldState.invalid}
                />
                <FieldLabel htmlFor={`${id}-${option.value}`} className="font-normal">
                  {option.label}
                </FieldLabel>
              </Field>
            ))}
          </RadioGroup>
          <FieldMessage
            id={`${id}-error`}
            message={fieldState.error?.message && t(fieldState.error.message)}
          />
        </fieldset>
      )}
    />
  )
}
