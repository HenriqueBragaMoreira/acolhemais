'use client'

import { useQueryStates } from 'nuqs'
import { galleryParams, galleryUrlKeys } from '../search-params'
import { AnimalGallery } from './animal-gallery'

/**
 * Galeria abaixo da busca: a de todos os animais na página inicial, ou só os de uma organização
 * (slug) na página dela.
 */
export function AnimalResults({ organization }: { organization?: string }) {
  const [filters, setFilters] = useQueryStates(galleryParams, { urlKeys: galleryUrlKeys })
  return (
    <AnimalGallery
      filters={filters}
      organization={organization}
      onSortChange={(sort) => void setFilters({ sort })}
      onClear={() => void setFilters(null)}
    />
  )
}
