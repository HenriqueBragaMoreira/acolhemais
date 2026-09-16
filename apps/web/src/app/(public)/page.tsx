import { useTranslations } from 'next-intl'
import { Suspense } from 'react'
import { CaramelIllustration } from '@/components/caramel-illustration'
import { AnimalResults } from './components/animal-results'
import { AnimalSearch } from './components/animal-search'
import { AnimalResultsSkeleton } from './components/animal-results-skeleton'
import { AnimalSearchSkeleton } from './components/animal-search-skeleton'

const CONTAINER = 'mx-auto max-w-[90rem] px-4 sm:px-6 lg:px-10'

export default function HomePage() {
  const t = useTranslations('Home')

  return (
    <>
      {/* O topo usa a cena do caramelo das telas de acesso, com o véu atrás do texto. */}
      <section className="relative isolate overflow-hidden bg-shell">
        <div className="absolute inset-0 -z-10">
          {/* A faixa é baixa: sobe o quadro para a cabeça do cão não cortar. */}
          <CaramelIllustration className="object-[60%_25%] lg:object-[72%_22%]" />
          <div
            aria-hidden
            className="absolute inset-0 bg-linear-to-b/oklab from-veil/85 via-veil/60 to-veil/35 lg:bg-linear-to-r/oklab lg:from-veil/85 lg:via-veil/45 lg:via-40% lg:to-transparent lg:to-75%"
          />
        </div>
        <div className={`${CONTAINER} py-12 sm:py-16 lg:py-20`}>
          <h1 className="max-w-xl text-3xl leading-[1.1] font-bold tracking-tight text-balance text-white sm:text-5xl sm:leading-[1.05]">
            {t('title')}
          </h1>
          <p className="mt-3 max-w-xl text-lg text-pretty text-white/90">{t('description')}</p>
          <div className="mt-8 max-w-4xl sm:mt-10">
            {/* Os filtros vêm do endereço, lido só no navegador. */}
            <Suspense fallback={<AnimalSearchSkeleton />}>
              <AnimalSearch />
            </Suspense>
          </div>
        </div>
      </section>
      <div className="bg-secondary">
        <div className={`${CONTAINER} pt-10 pb-20 sm:pt-14`}>
          <Suspense fallback={<AnimalResultsSkeleton />}>
            <AnimalResults />
          </Suspense>
        </div>
      </div>
    </>
  )
}
