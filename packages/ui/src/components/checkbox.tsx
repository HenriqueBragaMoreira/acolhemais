'use client'

import { Checkbox as CheckboxPrimitive } from '@base-ui/react/checkbox'
import { cn } from 'cn'
import { CheckIcon } from 'lucide-react'

/**
 * Caixa de seleção. Marcada, fica no âmbar de ação com o visto na cor legível sobre ele (as duas
 * trocam pela marca da ONG): não no âmbar tostado, que é do foco e dos links. A área de toque
 * se estende além dos 20px visíveis.
 *
 * Renderiza um `<button>` nativo, como a Base UI recomenda para rótulo irmão: use com
 * `<FieldLabel htmlFor>` apontando para o `id` da caixa.
 */
function Checkbox({ className, ...props }: CheckboxPrimitive.Root.Props) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      nativeButton
      render={(buttonProps) => <button type="button" {...buttonProps} />}
      className={cn(
        'peer relative flex size-5 shrink-0 items-center justify-center rounded-[6px] border border-input bg-background transition-colors after:absolute after:-inset-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive data-checked:border-primary data-checked:bg-primary data-checked:text-primary-foreground',
        className,
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className="grid place-content-center text-current [&>svg]:size-4"
      >
        <CheckIcon aria-hidden strokeWidth={3} />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )
}

export { Checkbox }
