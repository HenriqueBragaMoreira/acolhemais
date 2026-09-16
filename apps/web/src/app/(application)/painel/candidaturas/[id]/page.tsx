import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { Suspense } from 'react'
import { ApplicationFile } from './components/application-file'

type ApplicationFilePageProps = { params: Promise<{ id: string }> }

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('Panel.file')
  return { title: t('metaTitle') }
}

export default function ApplicationFilePage({ params }: ApplicationFilePageProps) {
  return (
    <Suspense>
      <ApplicationFile id={params.then(({ id }) => id)} />
    </Suspense>
  )
}
