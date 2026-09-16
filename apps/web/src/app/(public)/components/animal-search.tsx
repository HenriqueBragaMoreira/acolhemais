'use client'

import { useQueryStates } from 'nuqs'
import { galleryParams, galleryUrlKeys } from '../search-params'
import { AnimalSearchForm } from './forms/animal-search-form'

/** Busca da galeria, no topo da página. */
export function AnimalSearch() {
  const [filters, setFilters] = useQueryStates(galleryParams, { urlKeys: galleryUrlKeys })
  return (
    <AnimalSearchForm
      filters={filters}
      onApply={(next) => void setFilters({ ...next, city: next.city.trim() })}
      onClear={() => void setFilters(null)}
    />
  )
}
