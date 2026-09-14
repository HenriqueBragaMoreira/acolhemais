'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import type { AnimalFilters } from '@/services/animals'
import { filtersFromParams, hrefFor, NO_FILTERS } from './animal-filters'
import { AnimalGallery } from './animal-gallery'
import { AnimalSearchForm } from './forms/animal-search-form'

/** Os filtros da galeria vêm do endereço, e aplicá-los é trocar o endereço da mesma página. */
function useUrlFilters() {
  const router = useRouter()
  const pathname = usePathname()
  const filters = filtersFromParams(useSearchParams())

  function apply(next: AnimalFilters) {
    router.replace(hrefFor(next, pathname), { scroll: false })
  }

  return { filters, apply }
}

/** Busca da galeria, no topo da página. */
export function AnimalSearch() {
  const { filters, apply } = useUrlFilters()
  return <AnimalSearchForm filters={filters} onApply={apply} onClear={() => apply(NO_FILTERS)} />
}

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
