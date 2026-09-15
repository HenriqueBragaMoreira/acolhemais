import { buttonVariants } from '@acolhemais/ui/components/button'
import { cn } from '@acolhemais/ui/lib/utils'
import { AtSignIcon, MailIcon, MessageCircleIcon } from 'lucide-react'
import { getTranslations } from 'next-intl/server'
import Image from 'next/image'
import Link from 'next/link'
import { notFound, permanentRedirect } from 'next/navigation'
import { Suspense } from 'react'
import { brandThemeStyle, PLATFORM_COLORS } from '@/lib/brand-theme'
import {
  type OrganizationProfile as Organization,
  organizationsServices,
} from '@/services/organizations'
import { AnimalResults, AnimalSearch } from '../../../components/animal-showcase'
import {
  AnimalResultsSkeleton,
  AnimalSearchSkeleton,
} from '../../../components/animal-showcase-skeleton'
import { PixDonation } from './pix-donation'

const CONTAINER = 'mx-auto max-w-[90rem] px-4 sm:px-6 lg:px-10'

/** Palavras que não entram nas iniciais: "Lar da Cida" vira "LC". */
const CONNECTORS = new Set(['de', 'da', 'do', 'das', 'dos', 'e'])

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter((word) => !CONNECTORS.has(word.toLowerCase()))
    .slice(0, 2)
    .map((word) => word[0])
    .join('')
    .toUpperCase()
}

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
        <Identity organization={organization} />
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

/** Quem é, onde atua e como falar com ela, no painel da cor da organização. */
async function Identity({ organization }: { organization: Organization }) {
  const t = await getTranslations('Organization')
  const { contact } = organization
  const links = [
    contact.whatsapp
      ? {
          href: `https://wa.me/${contact.whatsapp}?text=${encodeURIComponent(t('contact.whatsappMessage'))}`,
          label: t('contact.whatsapp'),
          Icon: MessageCircleIcon,
        }
      : null,
    contact.email
      ? { href: `mailto:${contact.email}`, label: t('contact.email'), Icon: MailIcon }
      : null,
    contact.instagram
      ? {
          href: `https://www.instagram.com/${contact.instagram}/`,
          label: t('contact.instagram'),
          Icon: AtSignIcon,
        }
      : null,
  ].filter((link) => link !== null)

  return (
    <section
      aria-labelledby="organizacao"
      className="rounded-3xl bg-primary p-6 text-primary-foreground shadow-[0_18px_40px_-16px_rgb(59_38_24/0.35)] sm:p-8"
    >
      <div className="flex items-center gap-4 sm:gap-5">
        {/* O lugar do logo (FR-025), no painel: uma marca, não o avatar redondo de rede social. */}
        <span
          aria-hidden
          className="grid size-16 shrink-0 place-items-center rounded-2xl bg-(--brand-secondary) text-xl font-bold text-(--brand-secondary-foreground) sm:size-20 sm:text-2xl"
        >
          {initials(organization.name)}
        </span>
        <div className="min-w-0">
          <h1
            id="organizacao"
            className="text-3xl leading-[1.1] font-bold tracking-tight text-balance sm:text-5xl sm:leading-[1.05]"
          >
            {organization.name}
          </h1>
          <p className="mt-1 text-lg">{organization.city}</p>
        </div>
      </div>
      {/* O "sobre" fica no painel: quem a organização é faz parte da identidade dela. */}
      <p className="mt-5 max-w-2xl text-pretty sm:text-lg">{organization.about}</p>
      <p className="mt-3 max-w-2xl text-pretty">
        {t('serves', {
          cities: new Intl.ListFormat('pt-BR', { type: 'conjunction' }).format(organization.serves),
        })}
      </p>
      {links.length > 0 && (
        <ul aria-label={t('contact.label')} className="mt-5 flex flex-wrap gap-2">
          {links.map(({ href, label, Icon }) => (
            <li key={href}>
              <a
                href={href}
                target="_blank"
                rel="noreferrer"
                className={cn(
                  buttonVariants({ variant: 'outline' }),
                  'focus-visible:outline-primary-foreground',
                )}
              >
                <Icon aria-hidden />
                {label}
              </a>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

/** Organização encerrada: só o aviso, sem animais, contato nem doação (BR-044). */
async function ClosedOrganization({ name }: { name: string }) {
  const t = await getTranslations('Organization.closed')
  return (
    <div className={`${CONTAINER} flex min-h-[60svh] flex-col items-start justify-center py-16`}>
      <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">{t('title')}</h1>
      <p className="mt-3 max-w-prose text-lg text-pretty">{t('description', { name })}</p>
      <Link href="/" className={cn(buttonVariants({ size: 'lg' }), 'mt-8')}>
        {t('home')}
      </Link>
    </div>
  )
}
