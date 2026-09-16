'use client'

import { Field, FieldDescription, FieldLabel } from '@acolhemais/ui/components/field'
import { Input } from '@acolhemais/ui/components/input'
import { Textarea } from '@acolhemais/ui/components/textarea'
import { useTranslations } from 'next-intl'
import { type ComponentProps, useId } from 'react'
import { Controller, type FieldValues } from 'react-hook-form'
import { FieldMessage } from '@/components/field-message'
import type { BaseFieldProps } from './choice-field'

/** Uma pergunta de texto: campo de uma linha ou, com `multiline`, área de texto. */
export function TextField<V extends FieldValues>({
  control,
  name,
  label,
  description,
  multiline = false,
  inputClassName,
  format,
  ...inputProps
}: BaseFieldProps<V> & {
  multiline?: boolean
  inputClassName?: string
  /** Formata enquanto se digita (máscara de CPF, telefone). */
  format?: (value: string) => string
} & Pick<ComponentProps<'input'>, 'type' | 'inputMode' | 'autoComplete' | 'placeholder'>) {
  const t = useTranslations('FormErrors')
  const id = useId()

  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => {
        const props = {
          ...field,
          onChange: (event: { target: { value: string } }) =>
            field.onChange(format ? format(event.target.value) : event.target.value),
          id,
          'aria-invalid': fieldState.invalid,
          'aria-describedby': fieldState.error ? `${id}-error` : description && `${id}-hint`,
        }
        return (
          <Field data-invalid={fieldState.invalid} className="gap-2">
            <FieldLabel htmlFor={id} className="text-[0.9375rem] text-pretty">
              {label}
            </FieldLabel>
            {multiline ? (
              <Textarea {...props} />
            ) : (
              <Input {...props} {...inputProps} className={inputClassName} />
            )}
            {description && !fieldState.error && (
              <FieldDescription id={`${id}-hint`}>{description}</FieldDescription>
            )}
            <FieldMessage
              id={`${id}-error`}
              message={fieldState.error?.message && t(fieldState.error.message)}
            />
          </Field>
        )
      }}
    />
  )
}
