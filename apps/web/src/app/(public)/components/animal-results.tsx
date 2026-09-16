'use client'

import { NO_FILTERS } from './animal-filters'
import { AnimalGallery } from './animal-gallery'
import { useUrlFilters } from './use-url-filters'

/**
 * Galeria abaixo da busca: a de todos os animais na página inicial, ou só os de uma organização
 * (slug) na página dela.
 */
export function AnimalResults({ organization }: { organization?: string }) {
  const { filters, apply } = useUrlFilters()
  return (
    <AnimalGallery
      filters={filters}
      organization={organization}
      onSortChange={(sort) => apply({ ...filters, sort })}
      onClear={() => apply(NO_FILTERS)}
    />
  )
}
