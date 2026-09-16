'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import type { AnimalFilters } from '@/services/animals/types'
import { filtersFromParams, hrefFor } from './animal-filters'

/** Os filtros da galeria vêm do endereço, e aplicá-los é trocar o endereço da mesma página. */
export function useUrlFilters() {
  const router = useRouter()
  const pathname = usePathname()
  const filters = filtersFromParams(useSearchParams())

  function apply(next: AnimalFilters) {
    router.replace(hrefFor(next, pathname), { scroll: false })
  }

  return { filters, apply }
}
