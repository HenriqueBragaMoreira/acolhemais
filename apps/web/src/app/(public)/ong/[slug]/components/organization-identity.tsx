import { buttonVariants } from '@acolhemais/ui/components/button'
import { cn } from '@acolhemais/ui/lib/utils'
import { AtSignIcon, MailIcon, MessageCircleIcon } from 'lucide-react'
import { getTranslations } from 'next-intl/server'
import type { OrganizationProfile as Organization } from '@/services/organizations/types'

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

/** Quem é, onde atua e como falar com ela, no painel da cor da organização. */
export async function OrganizationIdentity({ organization }: { organization: Organization }) {
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
