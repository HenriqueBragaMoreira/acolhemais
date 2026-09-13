/** Lugar da galeria enquanto os animais chegam: os mesmos quadros 4:5 dos cartões. */
export function AnimalGridSkeleton() {
  return (
    <ul
      aria-hidden
      className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
    >
      {Array.from({ length: 10 }, (_, index) => (
        <li key={index} className="aspect-[4/5] rounded-xl bg-border" />
      ))}
    </ul>
  )
}
