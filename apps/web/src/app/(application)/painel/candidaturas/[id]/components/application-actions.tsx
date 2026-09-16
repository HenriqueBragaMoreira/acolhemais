'use client'

import { isActiveStage, nextStage, stageMoves } from '@acolhemais/domain'
import { Button } from '@acolhemais/ui/components/button'
import { Spinner } from '@acolhemais/ui/components/spinner'
import { cn } from '@acolhemais/ui/lib/utils'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowRightIcon, HeartHandshakeIcon, MessageSquareTextIcon, XIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { authServices } from '@/services/auth'
import type { OrganizationProfile } from '@/services/organizations/types'
import { panelServices } from '@/services/panel'
import type { ApplicationWithAnimal } from '@/services/panel/types'
import { PANEL_SURFACE } from '@/app/(application)/_components/panel-surface'
import { ApplicationActionDialog, type ApplicationDialogKind } from './application-action-dialog'
import { MoveStageMenu } from './move-stage-menu'

/** O que a organização pode fazer agora: a próxima etapa em destaque, as outras num menu. */
export function ApplicationActions({
  application,
  organization,
}: {
  application: ApplicationWithAnimal
  organization: OrganizationProfile
}) {
  const t = useTranslations('Panel.file')
  const tStages = useTranslations('Panel.stages')
  const { data: session } = useQuery({
    queryKey: ['session'],
    queryFn: () => authServices.session(),
  })
  const by = session?.user.name ?? ''
  const queryClient = useQueryClient()
  const [dialog, setDialog] = useState<ApplicationDialogKind | null>(null)

  const move = useMutation({
    mutationFn: (to: Parameters<typeof panelServices.moveApplication>[1]) =>
      panelServices.moveApplication(application.id, to, by),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['panel'] }),
  })

  if (!isActiveStage(application.stage)) return null

  const next = nextStage(application.stage)
  const others = stageMoves(application.stage).filter((stage) => stage !== next)

  return (
    <section className={cn(PANEL_SURFACE, 'p-5 sm:p-6')} aria-labelledby="acoes-titulo">
      <h2 id="acoes-titulo" className="text-lg font-bold tracking-tight">
        {t('actions.title')}
      </h2>
      <p className="mt-1 text-sm text-muted-foreground" aria-live="polite">
        {t('actions.current', { stage: tStages(application.stage) })}
      </p>

      <div className="mt-5 flex flex-col gap-3">
        {next ? (
          <Button
            size="lg"
            className="w-full"
            disabled={move.isPending}
            aria-busy={move.isPending}
            onClick={() => move.mutate(next)}
          >
            {move.isPending ? <Spinner /> : <ArrowRightIcon aria-hidden />}
            {t(`actions.next.${next}`)}
          </Button>
        ) : (
          application.stage === 'approved' && (
            <Button size="lg" className="w-full" onClick={() => setDialog('complete')}>
              <HeartHandshakeIcon aria-hidden />
              {t('actions.complete')}
            </Button>
          )
        )}

        {others.length > 0 && (
          <MoveStageMenu
            stages={others}
            disabled={move.isPending}
            onMove={(stage) => move.mutate(stage)}
          />
        )}

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
          <Button variant="outline" onClick={() => setDialog('request-info')}>
            <MessageSquareTextIcon aria-hidden />
            {t('actions.requestInfo')}
          </Button>
          <Button
            variant="outline"
            className="text-destructive"
            onClick={() => setDialog('refuse')}
          >
            <XIcon aria-hidden />
            {t('actions.refuse')}
          </Button>
        </div>
      </div>
      {move.isError && (
        <p role="alert" className="mt-3 text-sm font-medium text-destructive">
          {t('actions.error')}
        </p>
      )}

      <ApplicationActionDialog
        kind={dialog}
        application={application}
        organizationName={organization.name}
        onClose={() => setDialog(null)}
      />
    </section>
  )
}
