import { buttonVariants } from '@acolhemais/ui/components/button'
import { cn } from '@acolhemais/ui/lib/utils'
import { MailIcon, MessageCircleIcon } from 'lucide-react'
import { getTranslations } from 'next-intl/server'
import { CONTACT_EMAIL, CONTACT_WHATSAPP } from '@/constants/project'
import { SectionHeading } from './section-heading'

export const HELP_SECTION_ID = 'como-ajudar'

/** "Como ajudar" (FR-053): contato do mantenedor por WhatsApp ou e-mail. */
export async function HelpProject() {
  const t = await getTranslations('About.help')
  const whatsapp = `https://wa.me/${CONTACT_WHATSAPP}?text=${encodeURIComponent(t('whatsappMessage'))}`

  return (
    <aside
      aria-labelledby={HELP_SECTION_ID}
      className="rounded-2xl bg-secondary p-6 lg:sticky lg:top-8"
    >
      <SectionHeading id={HELP_SECTION_ID}>{t('title')}</SectionHeading>
      <p className="mt-3 text-pretty">{t('description')}</p>
      <div className="mt-6 flex flex-col gap-3">
        <a href={whatsapp} className={cn(buttonVariants({ size: 'lg' }))}>
          <MessageCircleIcon aria-hidden />
          {t('whatsapp')}
        </a>
        <a
          href={`mailto:${CONTACT_EMAIL}`}
          className={cn(buttonVariants({ variant: 'outline', size: 'lg' }))}
        >
          <MailIcon aria-hidden />
          {t('email')}
        </a>
      </div>
      <dl className="mt-6 grid gap-1 text-sm">
        <dt className="text-muted-foreground">{t('emailLabel')}</dt>
        <dd className="font-medium break-all">{CONTACT_EMAIL}</dd>
        <dt className="mt-2 text-muted-foreground">{t('whatsappLabel')}</dt>
        <dd className="font-medium tabular-nums">{t('whatsappNumber')}</dd>
      </dl>
    </aside>
  )
}
