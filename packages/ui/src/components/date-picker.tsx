'use client'

import { Calendar } from '@acolhemais/ui/components/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@acolhemais/ui/components/popover'
import { cn } from 'cn'
import { CalendarIcon } from 'lucide-react'
import { type Ref, useState } from 'react'
import { ptBR } from 'react-day-picker/locale'

/** "2026-11-12" vira a data local (meio-dia, para nenhum fuso trocar o dia). */
function parse(value: string) {
  const [year, month, day] = value.split('-').map(Number)
  return year && month && day ? new Date(year, month - 1, day, 12) : undefined
}

/** A data local em "AAAA-MM-DD", o formato que os formulários guardam. */
function serialize(date: Date) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
  ].join('-')
}

/**
 * Seletor de data do shadcn (Popover + Calendar), com a cara do campo de texto: 44px, borda de
 * campo, ícone de calendário e a data por extenso em pt-BR. O valor é "AAAA-MM-DD" (ou "").
 * Rotule com `<Label htmlFor>` apontando para o `id`.
 */
function DatePicker({
  id,
  value,
  onChange,
  onBlur,
  ref,
  placeholder,
  max,
  min,
  className,
  ...aria
}: {
  id: string
  value: string
  onChange: (value: string) => void
  onBlur?: () => void
  ref?: Ref<HTMLButtonElement>
  placeholder: string
  /** Última data que se pode escolher (datas depois dela ficam desativadas). */
  max?: Date
  min?: Date
  className?: string
  'aria-invalid'?: boolean
  'aria-describedby'?: string | undefined
}) {
  const [open, setOpen] = useState(false)
  const selected = parse(value)
  const disabled = [...(max ? [{ after: max }] : []), ...(min ? [{ before: min }] : [])]

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (!next) onBlur?.()
      }}
    >
      <PopoverTrigger
        id={id}
        ref={ref}
        className={cn(
          'flex h-11 w-full items-center justify-between gap-2 rounded-lg border border-input bg-background px-3 text-left text-base transition-colors hover:bg-muted focus-visible:border-ring focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring aria-invalid:border-destructive aria-invalid:shadow-[inset_0_0_0_1px_var(--destructive)] data-popup-open:border-ring',
          !selected && 'text-muted-foreground',
          className,
        )}
        {...aria}
      >
        <span className="truncate">
          {selected
            ? selected.toLocaleDateString('pt-BR', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })
            : placeholder}
        </span>
        <CalendarIcon aria-hidden className="size-4 shrink-0 text-muted-foreground" />
      </PopoverTrigger>
      <PopoverContent className="w-auto p-1">
        <Calendar
          mode="single"
          locale={ptBR}
          selected={selected}
          {...((selected ?? max) && { defaultMonth: selected ?? max })}
          disabled={disabled}
          // Clicar de novo no dia escolhido mantém a data (em vez de desmarcar) e fecha.
          required
          onSelect={(date: Date | undefined) => {
            if (date) onChange(serialize(date))
            setOpen(false)
          }}
        />
      </PopoverContent>
    </Popover>
  )
}

export { DatePicker }
