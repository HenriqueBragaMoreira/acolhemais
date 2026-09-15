import { CONTAINER } from './application'

/** Lugar da candidatura enquanto o animal chega: o título, a etapa e o resumo ao lado. */
export function ApplicationSkeleton() {
  return (
    <div aria-hidden className="bg-secondary">
      <div className={`${CONTAINER} pt-6 pb-16 sm:pt-8`}>
        <div className="h-5 w-40 rounded bg-muted" />
        <div className="mt-4 mb-6 h-10 w-80 max-w-full rounded-lg bg-muted" />
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-10">
          <div className="h-26 rounded-2xl bg-background lg:order-last lg:h-[30rem]" />
          <div className="h-[32rem] rounded-2xl bg-background" />
        </div>
      </div>
    </div>
  )
}
