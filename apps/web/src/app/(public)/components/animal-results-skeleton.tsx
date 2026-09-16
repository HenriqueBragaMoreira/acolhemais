import { AnimalGridSkeleton } from './animal-grid-skeleton'

/** Lugar da galeria até o endereço ser lido: o cabeçalho dela e os quadros dos cartões. */
export function AnimalResultsSkeleton() {
  return (
    <div aria-hidden>
      <div className="mb-5 h-16" />
      <AnimalGridSkeleton />
    </div>
  )
}
