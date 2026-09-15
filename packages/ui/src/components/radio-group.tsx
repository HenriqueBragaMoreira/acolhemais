'use client'

import { Radio as RadioPrimitive } from '@base-ui/react/radio'
import { RadioGroup as RadioGroupPrimitive } from '@base-ui/react/radio-group'
import { cn } from 'cn'

/** Grupo de opções em que só uma vale. Rotule com `aria-labelledby` (ou dentro de um `<fieldset>`). */
function RadioGroup({ className, ...props }: RadioGroupPrimitive.Props) {
  return (
    <RadioGroupPrimitive
      data-slot="radio-group"
      className={cn('flex flex-col gap-3', className)}
      {...props}
    />
  )
}

/**
 * Uma opção do grupo. Marcada, fica no âmbar de ação com o ponto na cor legível sobre ele, como a
 * caixa de seleção (as duas trocam pela marca da ONG). Renderiza um `<button>` nativo, para o
 * rótulo irmão: use com `<FieldLabel htmlFor>` apontando para o `id` da opção.
 */
function RadioGroupItem({ className, ...props }: RadioPrimitive.Root.Props) {
  return (
    <RadioPrimitive.Root
      data-slot="radio-group-item"
      nativeButton
      render={(buttonProps) => <button type="button" {...buttonProps} />}
      className={cn(
        'peer relative flex size-5 shrink-0 items-center justify-center rounded-full border border-input bg-background transition-colors after:absolute after:-inset-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive data-checked:border-primary data-checked:bg-primary',
        className,
      )}
      {...props}
    >
      <RadioPrimitive.Indicator
        data-slot="radio-group-indicator"
        className="size-2 rounded-full bg-primary-foreground"
      />
    </RadioPrimitive.Root>
  )
}

export { RadioGroup, RadioGroupItem }
