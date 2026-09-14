import { useTranslations } from 'next-intl'
import Image from 'next/image'
import Link from 'next/link'
import type { Animal } from '@/services/animals'

/**
 * Cartão da vitrine no formato dos posts de resgate: a foto ocupa o quadro vertical e o nome
 * ancora embaixo, sobre o véu. A foto é decorativa: o nome e os dados estão no texto do link.
 */
export function AnimalCard({ animal, priority = false }: { animal: Animal; priority?: boolean }) {
  const t = useTranslations('AnimalCard')
  const [cover] = animal.photos

  return (
    <Link
      href={`/animais/${animal.id}`}
      className="group relative block aspect-[4/5] overflow-hidden rounded-xl bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
    >
      <Image
        src={cover.src}
        alt=""
        fill
        priority={priority}
        sizes="(min-width: 90rem) 17rem, (min-width: 80rem) 19vw, (min-width: 64rem) 23vw, (min-width: 48rem) 31vw, 48vw"
        className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] motion-safe:group-hover:scale-[1.04]"
        style={{ objectPosition: cover.focus }}
      />
      {animal.status === 'in-process' && (
        <span className="absolute top-3 left-3 rounded-md bg-background px-2 py-1 text-xs font-semibold text-foreground">
          {t('inProcess')}
        </span>
      )}
      <div className="absolute inset-x-0 bottom-0 bg-linear-to-t/oklab from-veil/90 via-veil/55 to-transparent px-3 pt-20 pb-3 text-white sm:px-4 sm:pb-4">
        <h3 className="text-lg leading-tight font-semibold sm:text-xl">{animal.name}</h3>
        <p className="mt-1 text-sm text-white/90">
          {t('sex', { sex: animal.sex })} · {t('age', { age: animal.ageGroup, sex: animal.sex })}
        </p>
        <p className="text-sm text-white/90">{animal.city}</p>
      </div>
    </Link>
  )
}
