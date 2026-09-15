'use client'

import { Button } from '@acolhemais/ui/components/button'
import { Field, FieldDescription, FieldLabel } from '@acolhemais/ui/components/field'
import { Input } from '@acolhemais/ui/components/input'
import { RadioGroup, RadioGroupItem } from '@acolhemais/ui/components/radio-group'
import { Spinner } from '@acolhemais/ui/components/spinner'
import { Textarea } from '@acolhemais/ui/components/textarea'
import { cn } from '@acolhemais/ui/lib/utils'
import { ArrowLeftIcon, ArrowRightIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { type ComponentProps, useId } from 'react'
import { type Control, Controller, type FieldValues, type Path } from 'react-hook-form'
import { FieldMessage } from '@/components/field-message'
import { applicationStepper, useAdvance } from './application-stepper'

type BaseFieldProps<V extends FieldValues> = {
  control: Control<V>
  name: Path<V>
  label: string
  description?: string
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
  const t = useTranslations('Application.errors')
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
  const t = useTranslations('Application.errors')
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

/** Opções Sim/Não, na ordem em que aparecem em todas as perguntas. */
export function useYesNo() {
  const t = useTranslations('Application')
  return [
    { value: 'yes', label: t('yes') },
    { value: 'no', label: t('no') },
  ]
}

/**
 * Voltar e Continuar no pé de cada etapa; Continuar envia o formulário da etapa. Aberta pelo
 * "Editar" da revisão, os dois levam de volta à revisão.
 */
export function StepActions({ pending = false, submit }: { pending?: boolean; submit?: string }) {
  const t = useTranslations('Application')
  const stepper = applicationStepper.useStepperContext()
  const { returning, backToReview } = useAdvance()

  return (
    <div className="mt-8 flex flex-col-reverse gap-3 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
      {stepper.isFirst ? (
        <span />
      ) : (
        <Button
          type="button"
          variant="outline"
          onClick={() => void (returning ? backToReview() : stepper.prev())}
        >
          <ArrowLeftIcon aria-hidden />
          {returning ? t('backToReview') : t('back')}
        </Button>
      )}
      <Button type="submit" size="lg" disabled={pending} aria-busy={pending}>
        {pending && <Spinner />}
        {returning ? t('saveAndReview') : (submit ?? t('continue'))}
        {!pending && !submit && !returning && <ArrowRightIcon aria-hidden />}
      </Button>
    </div>
  )
}
