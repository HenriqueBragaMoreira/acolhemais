import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { Suspense } from 'react'
import { organizationsServices } from '@/services/organizations'
import { OrganizationProfile } from './components/organization-profile'
import { OrganizationProfileSkeleton } from './components/organization-profile-skeleton'

type OrganizationPageProps = { params: Promise<{ slug: string }> }

/** Título e prévia do link (a capa) para quando a página é compartilhada. */
export async function generateMetadata({ params }: OrganizationPageProps): Promise<Metadata> {
  const { slug } = await params
  const [organization, t] = await Promise.all([
    organizationsServices.get(slug),
    getTranslations('Organization'),
  ])
  if (!organization) return {}
  if (organization.status === 'closed')
    return { title: organization.name, robots: { index: false } }

  return {
    title: organization.name,
    description: organization.about || t('metaDescription', { name: organization.name }),
    ...(organization.cover && { openGraph: { images: [organization.cover.src] } }),
  }
}

export default function OrganizationPage({ params }: OrganizationPageProps) {
  return (
    // O slug só se conhece na requisição: a moldura da página sai pronta e a organização depois.
    <Suspense fallback={<OrganizationProfileSkeleton />}>
      <OrganizationProfile slug={params.then(({ slug }) => slug)} />
    </Suspense>
  )
}
