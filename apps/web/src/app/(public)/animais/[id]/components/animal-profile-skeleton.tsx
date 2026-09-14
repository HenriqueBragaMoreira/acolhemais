/** Lugar da página do animal enquanto ele chega: a foto 4:5 e o bloco de texto ao lado. */
export function AnimalProfileSkeleton() {
  return (
    <div aria-hidden className="mx-auto max-w-[90rem] px-4 pt-6 pb-16 sm:px-6 sm:pt-8 lg:px-10">
      <div className="h-5 w-40 rounded bg-muted" />
      <div className="mt-6 grid gap-8 lg:grid-cols-2 lg:gap-14">
        <div className="aspect-[4/5] rounded-2xl bg-muted" />
        <div className="flex max-w-xl flex-col gap-4">
          <div className="h-12 w-56 rounded-lg bg-muted" />
          <div className="h-6 w-72 rounded bg-muted" />
          <div className="h-12 w-48 rounded-lg bg-muted" />
          <div className="h-32 rounded-2xl bg-muted" />
        </div>
      </div>
    </div>
  )
}
