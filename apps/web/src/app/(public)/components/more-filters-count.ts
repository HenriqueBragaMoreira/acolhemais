import type { AnimalFilters } from '@/services/animals/types'

/** Quantos filtros de "Mais filtros" estão ligados, para o número no botão. */
export function moreFiltersCount(filters: AnimalFilters) {
  return (
    filters.sex.length +
    filters.ageGroup.length +
    filters.size.length +
    filters.goodWith.length +
    Number(filters.castrated)
  )
}
