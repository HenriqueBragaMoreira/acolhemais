import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { Suspense } from 'react'
import { EditAnimal } from '../components/edit-animal'

type AnimalPageProps = { params: Promise<{ id: string }> }

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('Panel.animalForm')
  return { title: t('editTitle') }
}

export default function ManagedAnimalPage({ params }: AnimalPageProps) {
  return (
    <Suspense>
      <EditAnimal id={params.then(({ id }) => id)} />
    </Suspense>
  )
}
