'use client'

import { Input } from '@acolhemais/ui/components/input'
import { Label } from '@acolhemais/ui/components/label'
import { SearchIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'

type AnimalNameSearchProps = {
  value: string
  onChange: (value: string) => void
}

/** A busca pelo nome na lista de animais. */
export function AnimalNameSearch({ value, onChange }: AnimalNameSearchProps) {
  const t = useTranslations('Panel.animals')

  return (
    <div className="flex flex-col gap-2 lg:w-72">
      <Label htmlFor="busca-animal">{t('search')}</Label>
      <div className="relative">
        <SearchIcon
          aria-hidden
          className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
        />
        <Input
          id="busca-animal"
          type="search"
          value={value}
          placeholder={t('searchPlaceholder')}
          autoComplete="off"
          className="pl-9"
          onChange={(event) => onChange(event.target.value)}
        />
      </div>
    </div>
  )
}
