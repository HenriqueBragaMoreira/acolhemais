'use client'

import { Combobox as ComboboxPrimitive } from '@base-ui/react/combobox'
import { cn } from 'cn'
import { CheckIcon, ChevronDownIcon, XIcon } from 'lucide-react'
import type { ReactNode } from 'react'

export type ComboboxOption = { value: string; label: string }

/**
 * Seleção com busca digitada: a lista filtra enquanto se digita (sem acento e sem caixa, no
 * idioma da página). Com a cara do campo de texto (44px, borda de campo, foco em `ring`).
 * Rotule com `<Label htmlFor>` apontando para o `id`.
 */
function Combobox({
  id,
  options,
  value,
  onValueChange,
  placeholder,
  empty,
  clearLabel,
  className,
}: {
  id: string
  options: ComboboxOption[]
  /** O `value` da opção escolhida, ou `null` (nada escolhido: o `placeholder` diz o que vale). */
  value: string | null
  onValueChange: (value: string | null) => void
  placeholder?: string
  /** Nome do botão que tira a escolha ("Limpar o filtro"). */
  clearLabel: string
  /** O que dizer quando a busca não acha nada. */
  empty: ReactNode
  className?: string
}) {
  const selected = options.find((option) => option.value === value) ?? null

  return (
    <ComboboxPrimitive.Root
      items={options}
      value={selected}
      onValueChange={(option: ComboboxOption | null) => onValueChange(option?.value ?? null)}
      // Apagar todo o texto tira a escolha; sem isso o campo devolve o nome escolhido.
      onInputValueChange={(input, details) => {
        if (input === '' && details.reason === 'input-change' && selected) onValueChange(null)
      }}
      isItemEqualToValue={(item: ComboboxOption, current: ComboboxOption) =>
        item.value === current.value
      }
      locale="pt-BR"
    >
      <ComboboxPrimitive.InputGroup
        className={cn(
          'relative flex h-11 w-full items-center rounded-lg border border-input bg-background text-base transition-colors has-focus-visible:border-ring has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-ring',
          className,
        )}
      >
        <ComboboxPrimitive.Input
          id={id}
          placeholder={placeholder}
          className="h-full min-w-0 flex-1 rounded-lg bg-transparent pr-18 pl-3 caret-ring outline-none placeholder:text-muted-foreground"
        />
        <ComboboxPrimitive.Clear
          aria-label={clearLabel}
          className="absolute right-9 grid size-8 place-items-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring"
        >
          <XIcon aria-hidden className="size-4" />
        </ComboboxPrimitive.Clear>
        <ComboboxPrimitive.Trigger
          aria-hidden
          tabIndex={-1}
          className="absolute right-0 grid h-full w-10 place-items-center text-muted-foreground"
        >
          <ChevronDownIcon className="size-4" />
        </ComboboxPrimitive.Trigger>
      </ComboboxPrimitive.InputGroup>

      <ComboboxPrimitive.Portal>
        <ComboboxPrimitive.Positioner sideOffset={6} className="z-50">
          <ComboboxPrimitive.Popup
            className={cn(
              'max-h-[min(20rem,var(--available-height))] w-(--anchor-width) overflow-y-auto rounded-xl bg-background p-1 text-foreground shadow-[0_0_0_1px_rgb(31_26_23/0.1),0_12px_32px_-12px_rgb(31_26_23/0.3)] outline-none',
              'origin-(--transform-origin) transition-[opacity,scale] duration-150 ease-out data-ending-style:opacity-0 data-starting-style:scale-[0.98] data-starting-style:opacity-0',
            )}
          >
            <ComboboxPrimitive.Empty className="px-3 py-2.5 text-sm text-muted-foreground empty:hidden">
              {empty}
            </ComboboxPrimitive.Empty>
            <ComboboxPrimitive.List>
              {(option: ComboboxOption) => (
                <ComboboxPrimitive.Item
                  key={option.value}
                  value={option}
                  className="flex h-10 cursor-default items-center gap-2 rounded-lg px-3 text-[0.9375rem] outline-none select-none data-highlighted:bg-muted"
                >
                  <span className="flex-1 truncate">{option.label}</span>
                  <ComboboxPrimitive.ItemIndicator>
                    <CheckIcon aria-hidden className="size-4" />
                  </ComboboxPrimitive.ItemIndicator>
                </ComboboxPrimitive.Item>
              )}
            </ComboboxPrimitive.List>
          </ComboboxPrimitive.Popup>
        </ComboboxPrimitive.Positioner>
      </ComboboxPrimitive.Portal>
    </ComboboxPrimitive.Root>
  )
}

export { Combobox }
