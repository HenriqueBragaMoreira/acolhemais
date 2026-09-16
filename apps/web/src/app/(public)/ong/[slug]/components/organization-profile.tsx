import { cn } from '@acolhemais/ui/lib/utils'
import Image from 'next/image'
import { notFound, permanentRedirect } from 'next/navigation'
import { Suspense } from 'react'
import { brandThemeStyle, PLATFORM_COLORS } from '@/lib/brand-theme'
import { organizationsServices } from '@/services/organizations'
import { AnimalResults } from '../../../components/animal-results'
import { AnimalSearch } from '../../../components/animal-search'
import { AnimalResultsSkeleton } from '../../../components/animal-results-skeleton'
import { AnimalSearchSkeleton } from '../../../components/animal-search-skeleton'
import { PixDonation } from './pix-donation'
import { CONTAINER } from './organization-container'
import { OrganizationIdentity } from './organization-identity'
import { ClosedOrganization } from './closed-organization'

/** A página da organização (FR-026): capa, identidade, PIX e os animais dela. */
export async function OrganizationProfile({ slug }: { slug: Promise<string> }) {
  const requested = await slug
  const organization = await organizationsServices.get(requested)
  if (!organization) notFound()
  // shortcut: o slug antigo redireciona dentro do streaming, sem o status 301; com a API, o
  // redirecionamento vai para o proxy do Next, antes da página (BR-047).
  if (organization.slug !== requested) permanentRedirect(`/ong/${organization.slug}`)
  if (organization.status === 'closed') return <ClosedOrganization name={organization.name} />

  return (
    <div
      style={brandThemeStyle(organization.colors ?? PLATFORM_COLORS)}
      className="bg-[color-mix(in_oklab,var(--primary)_8%,var(--background))]"
    >
      {/* A capa ocupa a largura; sem foto, vira uma faixa baixa na cor secundária da organização. */}
      <div
        className={cn(
          'relative border-b-8 border-(--brand-secondary) bg-(--brand-secondary)',
          organization.cover ? 'h-56 sm:h-72 lg:h-[22rem]' : 'h-28 sm:h-36 lg:h-52',
        )}
      >
        {organization.cover && (
          <>
            <Image
              src={organization.cover.src}
              alt=""
              fill
              priority
              sizes="100vw"
              className="object-cover"
              style={{ objectPosition: organization.cover.focus }}
            />
            <div
              aria-hidden
              className="absolute inset-0 bg-linear-to-t/oklab from-veil/55 via-veil/10 via-45% to-transparent"
            />
          </>
        )}
      </div>

      {/* A busca usa a mesma coluna do painel de identidade, para as bordas baterem. */}
      <div
        className={cn(
          CONTAINER,
          'relative -mt-20 grid gap-4 sm:-mt-28 lg:-mt-36 lg:gap-6',
          organization.pix && 'lg:grid-cols-[minmax(0,1fr)_27rem]',
        )}
      >
        <OrganizationIdentity organization={organization} />
        {organization.pix && (
          <PixDonation organization={{ ...organization, pix: organization.pix }} />
        )}
        <div className="mt-6 sm:mt-8">
          <Suspense fallback={<AnimalSearchSkeleton />}>
            <AnimalSearch />
          </Suspense>
        </div>
      </div>

      <div className={`${CONTAINER} pt-10 pb-20 sm:pt-14`}>
        <div>
          <Suspense fallback={<AnimalResultsSkeleton />}>
            <AnimalResults organization={organization.slug} />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
