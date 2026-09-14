import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { Suspense } from 'react'
import { animalsServices } from '@/services/animals'
import { AnimalProfile } from './components/animal-profile'
import { AnimalProfileSkeleton } from './components/animal-profile-skeleton'

type AnimalPageProps = { params: Promise<{ id: string }> }

/** Título e prévia do link (foto de capa) para quando a página é compartilhada. */
export async function generateMetadata({ params }: AnimalPageProps): Promise<Metadata> {
  const { id } = await params
  const [animal, t] = await Promise.all([animalsServices.get(id), getTranslations('AnimalProfile')])
  if (!animal) return {}

  return {
    title: t('metaTitle', { name: animal.name, city: animal.city }),
    description: animal.story,
    openGraph: { images: [animal.photos[0].src] },
  }
}

export default function AnimalPage({ params }: AnimalPageProps) {
  return (
    // O id só se conhece na requisição: a moldura da página sai pronta e o animal chega depois.
    <Suspense fallback={<AnimalProfileSkeleton />}>
      <AnimalProfile id={params.then(({ id }) => id)} />
    </Suspense>
  )
}
