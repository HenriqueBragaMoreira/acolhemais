import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { Suspense } from 'react'
import { AnimalsList } from './components/animals-list'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('Panel.animals')
  return { title: t('title') }
}

export default function AnimalsPage() {
  return (
    // O filtro por situação lê a URL no cliente.
    <Suspense>
      <AnimalsList />
    </Suspense>
  )
}
