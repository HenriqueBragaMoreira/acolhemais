import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { Suspense } from 'react'
import { animalsServices } from '@/services/animals'
import { Application } from './components/application'
import { ApplicationSkeleton } from './components/application-skeleton'

type ApplicationPageProps = { params: Promise<{ id: string }> }

export async function generateMetadata({ params }: ApplicationPageProps): Promise<Metadata> {
  const { id } = await params
  const [animal, t] = await Promise.all([animalsServices.get(id), getTranslations('Application')])
  if (!animal) return {}
  // Página de formulário: não interessa a buscadores.
  return { title: t('title', { name: animal.name }), robots: { index: false } }
}

export default function ApplicationPage({ params }: ApplicationPageProps) {
  return (
    <Suspense fallback={<ApplicationSkeleton />}>
      <Application id={params.then(({ id }) => id)} />
    </Suspense>
  )
}
