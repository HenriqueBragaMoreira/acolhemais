'use client'

import { cn } from '@acolhemais/ui/lib/utils'
import { useFormatter, useTranslations } from 'next-intl'
import { type ApplicationEvent, type ApplicationWithAnimal } from '@/services/panel'
import { PANEL } from '../../../../_components/panel-surface'

/** Tudo o que aconteceu, em ordem (BR-076): quem, quando e o quê. */
export function ApplicationHistory({ application }: { application: ApplicationWithAnimal }) {
  const t = useTranslations('Panel.file.history')
  const tStages = useTranslations('Panel.stages')
  const format = useFormatter()
  const name = application.profile.applicant.name.split(' ')[0] ?? ''

  const describe = (event: ApplicationEvent) => {
    switch (event.kind) {
      case 'sent':
        return { title: t('sent', { name }) }
      case 'moved':
        return { title: t('moved', { by: event.by, stage: tStages(event.to) }) }
      case 'info-requested':
        return { title: t('infoRequested', { by: event.by }), quote: event.message }
      case 'info-answered':
        return { title: t('infoAnswered', { name }), quote: event.message }
      case 'refused':
        return {
          title: t('refused', { by: event.by }),
          notes: [t('reason', { reason: event.reason }), t('message', { message: event.message })],
        }
      case 'completed':
        return {
          title: t('completed', {
            by: event.by,
            date: format.dateTime(new Date(`${event.date}T12:00:00`), { dateStyle: 'long' }),
          }),
        }
      case 'cancelled':
        return { title: t('cancelled') }
      case 'withdrawn':
        return { title: t('withdrawn', { name }) }
      case 'cpf-revealed':
        return { title: t('cpfRevealed', { by: event.by }) }
    }
  }

  return (
    <section className={cn(PANEL, 'p-5 sm:p-8 lg:col-start-1')} aria-labelledby="historico-titulo">
      <h2 id="historico-titulo" className="text-xl font-bold tracking-tight">
        {t('title')}
      </h2>
      <ol className="mt-6 flex flex-col">
        {application.history.map((event, index) => {
          const { title, quote, notes } = describe(event) as {
            title: string
            quote?: string
            notes?: string[]
          }
          return (
            <li key={`${event.kind}-${event.at}`} className="relative flex gap-4 pb-6 last:pb-0">
              {index < application.history.length - 1 && (
                <span aria-hidden className="absolute top-4 bottom-0 left-[5px] w-0.5 bg-border" />
              )}
              <span
                aria-hidden
                className="relative mt-1.5 size-3 shrink-0 rounded-full bg-foreground"
              />
              <div className="min-w-0 text-pretty">
                <p className="font-semibold">{title}</p>
                <p className="text-sm text-muted-foreground">
                  <time dateTime={event.at}>
                    {format.dateTime(new Date(event.at), {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    })}
                  </time>
                </p>
                {quote && <p className="mt-2 text-sm">“{quote}”</p>}
                {notes?.map((note) => (
                  <p key={note} className="mt-2 text-sm">
                    {note}
                  </p>
                ))}
              </div>
            </li>
          )
        })}
      </ol>
    </section>
  )
}
