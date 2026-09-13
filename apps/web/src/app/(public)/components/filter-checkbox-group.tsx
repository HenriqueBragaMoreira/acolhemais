'use client'

import { Checkbox } from '@acolhemais/ui/components/checkbox'
import { Field, FieldLabel } from '@acolhemais/ui/components/field'

type FilterCheckboxGroupProps<T extends string> = {
  name: string
  legend: string
  options: { value: T; label: string }[]
  value: T[]
  onChange: (value: T[]) => void
}

/** Um grupo de "Mais filtros": nenhuma caixa marcada vale como "todos". */
export function FilterCheckboxGroup<T extends string>({
  name,
  legend,
  options,
  value,
  onChange,
}: FilterCheckboxGroupProps<T>) {
  function toggle(option: T, checked: boolean) {
    onChange(checked ? [...value, option] : value.filter((selected) => selected !== option))
  }

  return (
    <fieldset className="flex flex-col gap-3">
      <legend className="mb-3 text-sm font-semibold">{legend}</legend>
      {options.map((option) => {
        const id = `${name}-${option.value}`
        return (
          <Field key={option.value} orientation="horizontal" className="gap-3">
            <Checkbox
              id={id}
              checked={value.includes(option.value)}
              onCheckedChange={(checked) => toggle(option.value, checked)}
            />
            <FieldLabel htmlFor={id} className="font-normal">
              {option.label}
            </FieldLabel>
          </Field>
        )
      })}
    </fieldset>
  )
}
