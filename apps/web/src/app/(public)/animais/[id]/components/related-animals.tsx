import type { Animal } from '@/services/animals'
import { AnimalCard } from '../../../_components/animal-card'

/**
 * Uma fileira de cartões da vitrine com título, no fim da página do animal. Recebe até 5 e
 * mostra só os que fecham a fileira: 2 e 4 no celular, 3 no tablet, 4 no notebook, 5 na tela
 * larga.
 */
export function RelatedAnimals({
  id,
  title,
  animals,
}: {
  id: string
  title: string
  animals: Animal[]
}) {
  if (animals.length === 0) return null

  return (
    <section aria-labelledby={id}>
      <h2 id={id} className="mb-5 text-2xl font-bold tracking-tight text-balance">
        {title}
      </h2>
      <ul className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 [&>li:nth-child(5)]:hidden md:[&>li:nth-child(4)]:hidden lg:[&>li:nth-child(4)]:block xl:[&>li:nth-child(5)]:block">
        {animals.map((animal) => (
          <li key={animal.id}>
            <AnimalCard animal={animal} />
          </li>
        ))}
      </ul>
    </section>
  )
}
