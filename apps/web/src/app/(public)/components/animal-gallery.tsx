'use client'

import { Button } from '@acolhemais/ui/components/button'
import { NativeSelect } from '@acolhemais/ui/components/native-select'
import { Spinner } from '@acolhemais/ui/components/spinner'
import { cn } from '@acolhemais/ui/lib/utils'
import { keepPreviousData, useInfiniteQuery } from '@tanstack/react-query'
import { useTranslations } from 'next-intl'
import { type AnimalFilters, animalsServices, type Sort, SORTS } from '@/services/animals'
import { AnimalCard } from '../_components/animal-card'
import { AnimalGridSkeleton } from './animal-grid-skeleton'

type AnimalGalleryProps = {
  filters: AnimalFilters
  /** Slug da organização: só os animais dela (FR-026). */
  organization?: string | undefined
  onSortChange: (sort: Sort) => void
  onClear: () => void
}

/** O título da galeria recebe o foco quando "Ver animais" fecha os filtros no celular. */
export const GALLERY_HEADING_ID = 'galeria-titulo'

/** Galeria (FR-050, FR-026, BR-120), com a contagem, a ordem e o "Ver mais animais". */
export function AnimalGallery({
  filters,
  organization,
  onSortChange,
  onClear,
}: AnimalGalleryProps) {
  const t = useTranslations('AnimalGallery')

  const {
    data,
    isPending,
    isError,
    isPlaceholderData,
    refetch,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ['animals', organization, filters],
    queryFn: ({ pageParam }) => animalsServices.list(filters, pageParam, organization),
    initialPageParam: 0,
    getNextPageParam: (last) => last.nextPage,
    // Ao trocar um filtro, a galeria anterior fica na tela até a nova chegar.
    placeholderData: keepPreviousData,
  })

  const animals = data?.pages.flatMap((page) => page.animals) ?? []
  const total = data?.pages[0]?.total

  return (
    <section aria-labelledby={GALLERY_HEADING_ID}>
      <div className="mb-5 flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
        <div>
          <h2
            id={GALLERY_HEADING_ID}
            tabIndex={-1}
            className="scroll-mt-6 rounded-sm text-2xl font-bold tracking-tight"
          >
            {t('title')}
          </h2>
          <p aria-live="polite" className="mt-1 text-muted-foreground">
            {total === undefined ? ' ' : t('count', { count: total })}
          </p>
        </div>
        <div className="flex w-full items-center gap-3 sm:w-auto">
          <label htmlFor="gallery-sort" className="shrink-0 text-sm font-semibold">
            {t('sort.label')}
          </label>
          <NativeSelect
            id="gallery-sort"
            value={filters.sort}
            onChange={(event) => onSortChange(event.target.value as Sort)}
            className="min-w-0 flex-1 sm:w-68 sm:flex-none"
          >
            {SORTS.map((sort) => (
              <option key={sort} value={sort}>
                {t(`sort.${sort}`)}
              </option>
            ))}
          </NativeSelect>
        </div>
      </div>

      {isPending && <AnimalGridSkeleton />}

      {isError && (
        <div role="alert" className="rounded-2xl bg-background px-6 py-12 text-center">
          <p className="font-semibold">{t('error')}</p>
          <Button variant="outline" className="mt-4" onClick={() => void refetch()}>
            {t('retry')}
          </Button>
        </div>
      )}

      {total === 0 && (
        <div className="rounded-2xl bg-background px-6 py-12 text-center">
          <p className="text-lg font-semibold">{t('empty.title')}</p>
          <p className="mt-1 text-muted-foreground">{t('empty.description')}</p>
          <Button variant="outline" className="mt-5" onClick={onClear}>
            {t('empty.clear')}
          </Button>
        </div>
      )}

      {animals.length > 0 && (
        <ul
          aria-busy={isPlaceholderData}
          className={cn(
            'grid grid-cols-2 gap-3 transition-opacity duration-200 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5',
            isPlaceholderData && 'opacity-60',
          )}
        >
          {animals.map((animal, index) => (
            <li key={animal.id}>
              <AnimalCard animal={animal} priority={index < 5} />
            </li>
          ))}
        </ul>
      )}

      {hasNextPage && (
        <div className="mt-10 flex justify-center">
          <Button
            variant="outline"
            size="lg"
            disabled={isFetchingNextPage}
            aria-busy={isFetchingNextPage}
            onClick={() => void fetchNextPage()}
          >
            {isFetchingNextPage && <Spinner />}
            {isFetchingNextPage ? t('loadingMore') : t('loadMore')}
          </Button>
        </div>
      )}
    </section>
  )
}
