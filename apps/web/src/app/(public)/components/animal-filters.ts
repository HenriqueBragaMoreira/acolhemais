import {
  AGE_GROUPS,
  type AnimalFilters,
  COMPANIONS,
  SEXES,
  SIZES,
  SORTS,
  SPECIES,
} from '@/services/animals'

/*
 * Os filtros da vitrine vivem no endereço (`/?city=…&species=cat`): o link compartilhado abre a
 * mesma busca, e o voltar do navegador desfaz o último filtro.
 */

export const NO_FILTERS: AnimalFilters = {
  city: '',
  species: null,
  sex: [],
  ageGroup: [],
  size: [],
  goodWith: [],
  castrated: false,
  sort: 'longest-waiting',
}

/** Só os valores conhecidos: o endereço é digitável e não é confiável. */
function known<T extends string>(allowed: readonly T[], values: string[]): T[] {
  return values.filter((value): value is T => (allowed as readonly string[]).includes(value))
}

export function filtersFromParams(params: URLSearchParams): AnimalFilters {
  return {
    city: params.get('city')?.slice(0, 80) ?? '',
    species: known(SPECIES, params.getAll('species'))[0] ?? null,
    sex: known(SEXES, params.getAll('sex')),
    ageGroup: known(AGE_GROUPS, params.getAll('age')),
    size: known(SIZES, params.getAll('size')),
    goodWith: known(COMPANIONS, params.getAll('goodWith')),
    castrated: params.get('castrated') === 'true',
    sort: known(SORTS, params.getAll('sort'))[0] ?? NO_FILTERS.sort,
  }
}

/** Endereço da vitrine com estes filtros, sem os que estão no padrão. */
export function hrefFor(filters: AnimalFilters) {
  const params = new URLSearchParams()
  const city = filters.city.trim()
  if (city) params.set('city', city)
  if (filters.species) params.set('species', filters.species)
  for (const sex of filters.sex) params.append('sex', sex)
  for (const age of filters.ageGroup) params.append('age', age)
  for (const size of filters.size) params.append('size', size)
  for (const companion of filters.goodWith) params.append('goodWith', companion)
  if (filters.castrated) params.set('castrated', 'true')
  if (filters.sort !== NO_FILTERS.sort) params.set('sort', filters.sort)

  const query = params.toString()
  return query ? `/?${query}` : '/'
}

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
