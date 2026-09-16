'use client'

import { maskCpf } from '@acolhemais/domain'
import { Button, buttonVariants } from '@acolhemais/ui/components/button'
import { Spinner } from '@acolhemais/ui/components/spinner'
import { cn } from '@acolhemais/ui/lib/utils'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { EyeIcon, EyeOffIcon, MessageCircleIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { authClient } from '@/lib/auth-client'
import type { OrganizationProfile } from '@/services/organizations'
import { type ApplicationWithAnimal, panelServices } from '@/services/panel'
import { PANEL } from '../../../../_components/panel-surface'
import { CopyButton } from './copy-button'

/** Contato e CPF: mascarado por padrão, inteiro só no "Revelar", que vai para o histórico. */
export function ApplicantContact({
  application,
  organization,
}: {
  application: ApplicationWithAnimal
  organization: OrganizationProfile
}) {
  const t = useTranslations('Panel.file.contact')
  const { data: session } = useQuery({
    queryKey: ['session'],
    queryFn: async () => {
      const response = await authClient.getSession()
      if (response.error) throw response.error

      return response.data
    },
  })
  const by = session?.user.name ?? ''
  const queryClient = useQueryClient()
  const { applicant } = application.profile
  const [cpf, setCpf] = useState<string | null>(null)

  const reveal = useMutation({
    mutationFn: () => panelServices.revealCpf(application.id, by),
    onSuccess: async (full) => {
      setCpf(full)
      await queryClient.invalidateQueries({ queryKey: ['panel', 'application', application.id] })
    },
  })

  const firstName = applicant.name.split(' ')[0] ?? applicant.name
  const whatsapp = `https://wa.me/55${applicant.phone.replace(/\D/g, '')}?text=${encodeURIComponent(
    t('whatsappMessage', {
      name: firstName,
      organization: organization.name,
      animal: application.animal.name,
    }),
  )}`

  return (
    <section className={cn(PANEL, 'p-5 sm:p-6')} aria-labelledby="contato-titulo">
      <h2 id="contato-titulo" className="text-lg font-bold tracking-tight">
        {t('title')}
      </h2>
      <dl className="mt-3 divide-y divide-border">
        <div className="py-2.5">
          <dt className="text-sm text-muted-foreground">{t('email')}</dt>
          <dd className="flex items-center justify-between gap-2 font-medium">
            <a
              href={`mailto:${application.email}`}
              className="min-w-0 rounded-sm break-all text-ring underline decoration-1 underline-offset-4 hover:decoration-2"
            >
              {application.email}
            </a>
            <CopyButton text={application.email} label={t('copyEmail')} />
          </dd>
        </div>
        <div className="py-2.5">
          <dt className="text-sm text-muted-foreground">{t('phone')}</dt>
          <dd className="flex items-center justify-between gap-2 font-medium tabular-nums">
            {applicant.phone || t('noPhone')}
            {applicant.phone && <CopyButton text={applicant.phone} label={t('copyPhone')} />}
          </dd>
        </div>
        <div className="py-2.5">
          <dt className="text-sm text-muted-foreground">{t('cpf')}</dt>
          <dd>
            <span className="flex flex-wrap items-center justify-between gap-2">
              <span className="font-medium tabular-nums" aria-live="polite">
                {cpf ?? maskCpf(applicant.cpf)}
              </span>
              {cpf ? (
                // Esconder não vai para o histórico; revelar de novo vai.
                <Button variant="ghost" size="sm" onClick={() => setCpf(null)}>
                  <EyeOffIcon aria-hidden />
                  {t('hide')}
                </Button>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={reveal.isPending}
                  aria-busy={reveal.isPending}
                  aria-describedby="cpf-revelar-dica"
                  onClick={() => reveal.mutate()}
                >
                  {reveal.isPending ? <Spinner /> : <EyeIcon aria-hidden />}
                  {t('reveal')}
                </Button>
              )}
            </span>
            <span id="cpf-revelar-dica" className="mt-1 block text-xs text-muted-foreground">
              {cpf ? t('revealed') : t('revealHint')}
            </span>
          </dd>
        </div>
      </dl>
      {applicant.phone && (
        <a
          href={whatsapp}
          target="_blank"
          rel="noreferrer"
          className={cn(buttonVariants({ variant: 'outline' }), 'mt-4 w-full')}
        >
          <MessageCircleIcon aria-hidden />
          {t('whatsapp', { name: firstName })}
        </a>
      )}
    </section>
  )
}
