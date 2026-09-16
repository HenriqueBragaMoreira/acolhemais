'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@acolhemais/ui/components/button'
import { Checkbox } from '@acolhemais/ui/components/checkbox'
import { Field, FieldLabel } from '@acolhemais/ui/components/field'
import { Input } from '@acolhemais/ui/components/input'
import { NativeSelect } from '@acolhemais/ui/components/native-select'
import { useQuery } from '@tanstack/react-query'
import { SearchIcon, SlidersHorizontalIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'
import { AGE_GROUPS, COMPANIONS, SEXES, SIZES, SPECIES } from '@/constants/animal-options'
import { animalsServices } from '@/services/animals'
import type { AnimalFilters } from '@/services/animals/types'
import { moreFiltersCount } from '../animal-filters'
import { GALLERY_HEADING_ID } from '../animal-gallery'
import { FilterCheckboxGroup } from '../filter-checkbox-group'

const searchSchema = z.object({
  city: z.string().trim().max(80),
  species: z.enum(SPECIES).or(z.literal('')),
  sex: z.array(z.enum(SEXES)),
  ageGroup: z.array(z.enum(AGE_GROUPS)),
  size: z.array(z.enum(SIZES)),
  goodWith: z.array(z.enum(COMPANIONS)),
  castrated: z.boolean(),
})

type SearchValues = z.infer<typeof searchSchema>

const MORE_FILTERS_ID = 'mais-filtros'

function toValues({ sort: _sort, species, ...filters }: AnimalFilters): SearchValues {
  return { ...filters, species: species ?? '' }
}

type AnimalSearchFormProps = {
  filters: AnimalFilters
  onApply: (filters: AnimalFilters) => void
  onClear: () => void
}

/**
 * Busca da vitrine (FR-050): a cidade vale ao buscar; espécie e "Mais filtros" valem na hora,
 * levando junto o que estiver digitado na cidade.
 */
export function AnimalSearchForm({ filters, onApply, onClear }: AnimalSearchFormProps) {
  const t = useTranslations('AnimalSearch')
  const [moreOpen, setMoreOpen] = useState(() => moreFiltersCount(filters) > 0)
  const activeMore = moreFiltersCount(filters)

  const { data: cities = [] } = useQuery({
    queryKey: ['animal-cities'],
    queryFn: () => animalsServices.cities(),
  })

  const { control, register, handleSubmit } = useForm<SearchValues>({
    resolver: zodResolver(searchSchema),
    // Segue o endereço: o voltar do navegador desfaz o filtro também no formulário.
    values: toValues(filters),
  })

  const apply = handleSubmit((values) =>
    onApply({ ...values, species: values.species || null, sort: filters.sort }),
  )

  /** Troca o valor e já aplica a busca. */
  function applyOnChange<T>(onChange: (value: T) => void) {
    return (value: T) => {
      onChange(value)
      void apply()
    }
  }

  function showResults() {
    setMoreOpen(false)
    document.getElementById(GALLERY_HEADING_ID)?.focus()
  }

  return (
    // Painel branco sobre a ilustração, com a sombra quente das telas de acesso.
    <search className="block rounded-2xl bg-background p-4 shadow-[0_24px_64px_-16px_rgb(26_16_10/0.55)] sm:p-5">
      <form aria-label={t('label')} onSubmit={apply}>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-[minmax(0,1fr)_11rem_10.5rem_auto] sm:items-end">
          <Field className="col-span-2 sm:col-span-1">
            <FieldLabel htmlFor="search-city">{t('city')}</FieldLabel>
            <Input
              id="search-city"
              list="search-city-options"
              autoComplete="off"
              placeholder={t('cityPlaceholder')}
              {...register('city')}
            />
            <datalist id="search-city-options">
              {cities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </datalist>
          </Field>
          <Field>
            <FieldLabel htmlFor="search-species">{t('species.label')}</FieldLabel>
            <Controller
              control={control}
              name="species"
              render={({ field }) => (
                <NativeSelect
                  id="search-species"
                  name={field.name}
                  ref={field.ref}
                  value={field.value}
                  onBlur={field.onBlur}
                  onChange={(event) =>
                    applyOnChange(field.onChange)(event.target.value as SearchValues['species'])
                  }
                >
                  <option value="">{t('species.all')}</option>
                  {SPECIES.map((species) => (
                    <option key={species} value={species}>
                      {t(`species.${species}`)}
                    </option>
                  ))}
                </NativeSelect>
              )}
            />
          </Field>
          <Button
            type="button"
            variant="outline"
            aria-expanded={moreOpen}
            aria-controls={MORE_FILTERS_ID}
            className="h-11 self-end"
            onClick={() => setMoreOpen((open) => !open)}
          >
            <SlidersHorizontalIcon aria-hidden />
            {t('more')}
            {activeMore > 0 && (
              <span className="ml-0.5 rounded-full bg-foreground px-1.5 text-xs leading-5 text-background tabular-nums">
                <span className="sr-only">{t('activeCount', { count: activeMore })}</span>
                <span aria-hidden>{activeMore}</span>
              </span>
            )}
          </Button>
          <Button type="submit" className="col-span-2 h-11 sm:col-span-1">
            <SearchIcon aria-hidden />
            {t('submit')}
          </Button>
        </div>

        <div id={MORE_FILTERS_ID} hidden={!moreOpen}>
          <div className="mt-5 grid grid-cols-2 gap-x-6 gap-y-6 border-t border-border pt-5 sm:grid-cols-3 lg:grid-cols-5">
            <Controller
              control={control}
              name="sex"
              render={({ field }) => (
                <FilterCheckboxGroup
                  name="sex"
                  legend={t('sex.label')}
                  options={SEXES.map((value) => ({ value, label: t(`sex.${value}`) }))}
                  value={field.value}
                  onChange={applyOnChange(field.onChange)}
                />
              )}
            />
            <Controller
              control={control}
              name="ageGroup"
              render={({ field }) => (
                <FilterCheckboxGroup
                  name="age"
                  legend={t('ageGroup.label')}
                  options={AGE_GROUPS.map((value) => ({ value, label: t(`ageGroup.${value}`) }))}
                  value={field.value}
                  onChange={applyOnChange(field.onChange)}
                />
              )}
            />
            <Controller
              control={control}
              name="size"
              render={({ field }) => (
                <FilterCheckboxGroup
                  name="size"
                  legend={t('size.label')}
                  options={SIZES.map((value) => ({ value, label: t(`size.${value}`) }))}
                  value={field.value}
                  onChange={applyOnChange(field.onChange)}
                />
              )}
            />
            <Controller
              control={control}
              name="goodWith"
              render={({ field }) => (
                <FilterCheckboxGroup
                  name="good-with"
                  legend={t('goodWith.label')}
                  options={COMPANIONS.map((value) => ({ value, label: t(`goodWith.${value}`) }))}
                  value={field.value}
                  onChange={applyOnChange(field.onChange)}
                />
              )}
            />
            <fieldset className="flex flex-col gap-3">
              <legend className="mb-3 text-sm font-semibold">{t('health')}</legend>
              <Controller
                control={control}
                name="castrated"
                render={({ field }) => (
                  <Field orientation="horizontal" className="gap-3">
                    <Checkbox
                      id="search-castrated"
                      checked={field.value}
                      onCheckedChange={applyOnChange(field.onChange)}
                    />
                    <FieldLabel htmlFor="search-castrated" className="font-normal">
                      {t('castrated')}
                    </FieldLabel>
                  </Field>
                )}
              />
            </fieldset>
          </div>
          <div className="mt-5 flex justify-end gap-3">
            <Button type="button" variant="ghost" onClick={onClear}>
              {t('clear')}
            </Button>
            {/* No celular o painel aberto empurra a galeria para fora da tela: este botão leva até ela. */}
            <Button type="button" variant="outline" className="sm:hidden" onClick={showResults}>
              {t('showResults')}
            </Button>
          </div>
        </div>
      </form>
    </search>
  )
}
