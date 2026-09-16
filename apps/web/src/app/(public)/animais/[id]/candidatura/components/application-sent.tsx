'use client'

import { buttonVariants } from '@acolhemais/ui/components/button'
import { cn } from '@acolhemais/ui/lib/utils'
import { CircleCheckIcon, MessageCircleIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { useEffect, useRef } from 'react'
import { MAX_ACTIVE_APPLICATIONS } from '@/constants/application'
import type { SentApplication } from './application-review'
import { useApplicationTarget } from './use-application-target'

/** O caminho da candidatura (BR-076), da enviada à adoção concluída. */
const STAGES = ['received', 'review', 'visit', 'approved', 'completed'] as const

/** Dias para responder a um pedido da organização (`applicationResponseDays`, BR-081). */
const RESPONSE_DAYS = 7

/**
 * Depois de enviar: o que acontece agora, como falar com a organização e o que aumenta as
 * chances. As dicas vêm das regras, não de promessa: conta, telefone, responder no prazo, casa
 * pronta e documento com foto (BR-079).
 */
export function ApplicationSent({ sent }: { sent: SentApplication }) {
  const t = useTranslations('Application.sent')
  const { animal, organization } = useApplicationTarget()
  const heading = useRef<HTMLHeadingElement>(null)

  useEffect(() => heading.current?.focus(), [])

  const tips = [
    sent.mode === 'new' && 'account',
    !sent.phone && Boolean(organization.whatsapp) && 'phone',
    'respond',
    animal.species === 'cat' ? 'homeCat' : 'homeDog',
    'document',
  ].filter((tip) => tip !== false)

  return (
    <div>
      <CircleCheckIcon aria-hidden className="size-10 text-ring" />
      <h2
        ref={heading}
        tabIndex={-1}
        className="mt-4 rounded-sm text-2xl font-bold tracking-tight text-balance sm:text-3xl"
      >
        {t('title', { organization: organization.name })}
      </h2>
      <p className="mt-2 text-lg text-pretty">
        {t('description', { organization: organization.name })}
      </p>

      <section aria-labelledby="proximos-passos" className="mt-10">
        <h3 id="proximos-passos" className="text-lg font-bold tracking-tight">
          {t('next.title')}
        </h3>
        <ol className="mt-4 flex flex-col gap-0">
          {STAGES.map((stage, index) => (
            <li key={stage} className="relative flex gap-4 pb-6 last:pb-0">
              {/* A linha liga cada etapa à seguinte. */}
              {index < STAGES.length - 1 && (
                <span
                  aria-hidden
                  className="absolute top-7 bottom-1 left-[0.6875rem] w-px bg-border"
                />
              )}
              <span
                aria-hidden
                className={cn(
                  'relative mt-0.5 grid size-6 shrink-0 place-items-center rounded-full border text-xs font-bold',
                  index === 0
                    ? 'border-foreground bg-foreground text-background'
                    : 'border-input bg-background text-muted-foreground',
                )}
              >
                {index + 1}
              </span>
              <div>
                <p className="font-semibold">
                  {t(`next.${stage}.title`)}
                  {index === 0 && <span className="sr-only"> {t('next.current')}</span>}
                </p>
                <p className="text-sm text-pretty text-muted-foreground">
                  {t(`next.${stage}.description`, {
                    organization: organization.name,
                    days: RESPONSE_DAYS,
                  })}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="chances" className="mt-10 rounded-2xl bg-secondary p-5 sm:p-6">
        <h3 id="chances" className="text-lg font-bold tracking-tight">
          {t('tips.title')}
        </h3>
        <ul className="mt-3 flex list-disc flex-col gap-2 pl-5 marker:text-muted-foreground">
          {tips.map((tip) => (
            <li key={tip} className="text-pretty">
              {t(`tips.${tip}`, { days: RESPONSE_DAYS })}
            </li>
          ))}
        </ul>
      </section>

      <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        {organization.whatsapp && (
          <a
            href={`https://wa.me/${organization.whatsapp}?text=${encodeURIComponent(
              t('whatsappMessage', { name: animal.name }),
            )}`}
            target="_blank"
            rel="noreferrer"
            className={cn(buttonVariants({ size: 'lg' }))}
          >
            <MessageCircleIcon aria-hidden />
            {t('whatsapp', { organization: organization.name })}
          </a>
        )}
        <Link href="/" className={cn(buttonVariants({ variant: 'outline', size: 'lg' }))}>
          {t('gallery')}
        </Link>
      </div>
      <p className="mt-3 text-sm text-muted-foreground">
        {t('limit', { max: MAX_ACTIVE_APPLICATIONS })}
      </p>
    </div>
  )
}
