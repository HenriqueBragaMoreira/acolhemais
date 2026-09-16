'use client'

import { NO_FILTERS } from './animal-filters'
import { AnimalSearchForm } from './forms/animal-search-form'
import { useUrlFilters } from './use-url-filters'

/** Busca da galeria, no topo da página. */
export function AnimalSearch() {
  const { filters, apply } = useUrlFilters()
  return <AnimalSearchForm filters={filters} onApply={apply} onClear={() => apply(NO_FILTERS)} />
}
