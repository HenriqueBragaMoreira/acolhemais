'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import type { AnimalFilters } from '@/services/animals'
import { filtersFromParams, hrefFor, NO_FILTERS } from './animal-filters'
import { AnimalGallery } from './animal-gallery'
import { AnimalSearchForm } from './forms/animal-search-form'

/** Os filtros da vitrine vêm do endereço, e aplicá-los é trocar o endereço. */
function useUrlFilters() {
  const router = useRouter()
  const filters = filtersFromParams(useSearchParams())

  function apply(next: AnimalFilters) {
    router.replace(hrefFor(next), { scroll: false })
  }

  return { filters, apply }
}

/** Busca da vitrine, no topo da página. */
export function AnimalSearch() {
  const { filters, apply } = useUrlFilters()
  return <AnimalSearchForm filters={filters} onApply={apply} onClear={() => apply(NO_FILTERS)} />
}

/** Galeria da vitrine, abaixo do topo. */
export function AnimalResults() {
  const { filters, apply } = useUrlFilters()
  return (
    <AnimalGallery
      filters={filters}
      onSortChange={(sort) => apply({ ...filters, sort })}
      onClear={() => apply(NO_FILTERS)}
    />
  )
}
