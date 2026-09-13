import { AnimalGridSkeleton } from './animal-grid-skeleton'

/** Lugar da busca até o endereço ser lido (mesma altura do bloco). */
export function AnimalSearchSkeleton() {
  return <div aria-hidden className="h-[10.5rem] rounded-2xl bg-background sm:h-[6.5rem]" />
}

/** Lugar da galeria até o endereço ser lido: o cabeçalho dela e os quadros dos cartões. */
export function AnimalResultsSkeleton() {
  return (
    <div aria-hidden>
      <div className="mb-5 h-16" />
      <AnimalGridSkeleton />
    </div>
  )
}
