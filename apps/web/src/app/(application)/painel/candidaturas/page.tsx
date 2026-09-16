import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { Suspense } from 'react'
import { ApplicationsBoard } from './components/applications-board'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('Panel.board')
  return { title: t('title') }
}

export default function ApplicationsPage() {
  return (
    // O filtro por animal lê a URL no cliente.
    <Suspense>
      <ApplicationsBoard />
    </Suspense>
  )
}
