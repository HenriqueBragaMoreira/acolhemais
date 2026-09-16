'use client'

import { type AnimalStatus, manualStatusChanges } from '@acolhemais/domain'
import { Button } from '@acolhemais/ui/components/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@acolhemais/ui/components/dialog'
import { cn } from '@acolhemais/ui/lib/utils'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ArchiveIcon, CirclePauseIcon, CirclePlayIcon } from 'lucide-react'
import { useFormatter, useTranslations } from 'next-intl'
import { useState } from 'react'
import { authClient } from '@/lib/auth-client'
import { type ManagedAnimal, panelServices } from '@/services/panel'
import { PANEL } from '../../../_components/panel-surface'
import { ArchiveForm } from './forms/archive-form'

const ICONS: Partial<Record<AnimalStatus, typeof ArchiveIcon>> = {
  available: CirclePlayIcon,
  unavailable: CirclePauseIcon,
  archived: ArchiveIcon,
}

/** A situação (BR-064): as mudanças à mão, o que vem das candidaturas e o histórico (FR-032). */
export function AnimalStatusPanel({ animal }: { animal: ManagedAnimal }) {
  const t = useTranslations('Panel.animalStatus')
  const format = useFormatter()
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
  const [archiving, setArchiving] = useState(false)

  const change = useMutation({
    mutationFn: (to: AnimalStatus) => panelServices.changeAnimalStatus(animal.id, to, by),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['panel'] }),
  })

  // O rascunho se publica pela revisão do formulário, que confere os obrigatórios (BR-060).
  const changes = manualStatusChanges(animal.status).filter(
    (to) => !(animal.status === 'draft' && to === 'available'),
  )

  return (
    <aside aria-labelledby="situacao-titulo" className={cn(PANEL, 'p-5 sm:p-6 lg:sticky lg:top-6')}>
      <h2 id="situacao-titulo" className="text-lg font-bold tracking-tight">
        {t('title')}
      </h2>
      <p className="mt-1 text-sm text-pretty text-muted-foreground">
        {t(`explain.${animal.status}`)}
      </p>

      {changes.length > 0 && (
        <div className="mt-4 flex flex-col gap-2">
          {changes.map((to) => {
            const Icon = ICONS[to] ?? ArchiveIcon
            return (
              <Button
                key={to}
                variant="outline"
                className={cn('w-full justify-start', to === 'archived' && 'text-destructive')}
                disabled={change.isPending}
                onClick={() => (to === 'archived' ? setArchiving(true) : change.mutate(to))}
              >
                <Icon aria-hidden />
                {t(`change.${to}`)}
              </Button>
            )
          })}
        </div>
      )}

      <h3 className="mt-6 border-t border-border pt-5 font-bold tracking-tight">{t('history')}</h3>
      <ol className="mt-3 flex flex-col gap-3">
        {animal.history.toReversed().map((entry) => (
          <li key={`${entry.at}-${entry.to}`} className="text-sm text-pretty">
            <p className="font-semibold">
              {entry.from
                ? t('moved', { by: entry.by, to: t(entry.to) })
                : t('created', { by: entry.by })}
            </p>
            {entry.reason && <p>{t('reason', { reason: entry.reason })}</p>}
            <p className="text-muted-foreground">
              <time dateTime={entry.at}>
                {format.dateTime(new Date(entry.at), { dateStyle: 'medium', timeStyle: 'short' })}
              </time>
            </p>
          </li>
        ))}
      </ol>

      <Dialog open={archiving} onOpenChange={setArchiving}>
        <DialogContent>
          <DialogTitle>{t('archive.title', { name: animal.name })}</DialogTitle>
          <DialogDescription>{t('archive.description')}</DialogDescription>
          <ArchiveForm animalId={animal.id} onDone={() => setArchiving(false)} />
        </DialogContent>
      </Dialog>
    </aside>
  )
}
