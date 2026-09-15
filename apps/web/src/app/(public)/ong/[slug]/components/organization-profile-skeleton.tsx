/** Lugar da página da organização enquanto ela chega: a capa e os dois painéis sobre ela. */
export function OrganizationProfileSkeleton() {
  return (
    <div aria-hidden>
      <div className="h-56 bg-muted sm:h-72 lg:h-[22rem]" />
      <div className="relative mx-auto -mt-20 grid max-w-[90rem] gap-4 px-4 sm:-mt-28 sm:px-6 lg:-mt-36 lg:grid-cols-[minmax(0,1fr)_27rem] lg:gap-6 lg:px-10">
        <div className="h-80 rounded-3xl bg-background shadow-sm" />
        <div className="h-80 rounded-3xl bg-background shadow-sm" />
      </div>
    </div>
  )
}
