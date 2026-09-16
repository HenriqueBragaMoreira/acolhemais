'use client'

import { isActiveStage, nextStage, stageMoves } from '@acolhemais/domain'
import { Button } from '@acolhemais/ui/components/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@acolhemais/ui/components/dialog'
import { Menu, MenuContent, MenuItem, MenuTrigger } from '@acolhemais/ui/components/menu'
import { Spinner } from '@acolhemais/ui/components/spinner'
import { cn } from '@acolhemais/ui/lib/utils'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  ArrowRightIcon,
  ChevronDownIcon,
  HeartHandshakeIcon,
  MessageSquareTextIcon,
  XIcon,
} from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { authClient } from '@/lib/auth-client'
import type { OrganizationProfile } from '@/services/organizations'
import { type ApplicationWithAnimal, panelServices } from '@/services/panel'
import { PANEL } from '../../../../_components/panel-surface'
import { CompleteForm } from './forms/complete-form'
import { RefuseForm } from './forms/refuse-form'
import { RequestInfoForm } from './forms/request-info-form'

type DialogKind = 'request-info' | 'refuse' | 'complete'

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
    queryFn: async () => {
      const response = await authClient.getSession()
      if (response.error) throw response.error

      return response.data
    },
  })
  const by = session?.user.name ?? ''
  const queryClient = useQueryClient()
  const [dialog, setDialog] = useState<DialogKind | null>(null)
  const { applicant } = application.profile

  const move = useMutation({
    mutationFn: (to: Parameters<typeof panelServices.moveApplication>[1]) =>
      panelServices.moveApplication(application.id, to, by),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['panel'] }),
  })

  if (!isActiveStage(application.stage)) return null

  const next = nextStage(application.stage)
  const others = stageMoves(application.stage).filter((stage) => stage !== next)
  const close = () => setDialog(null)

  return (
    <section className={cn(PANEL, 'p-5 sm:p-6')} aria-labelledby="acoes-titulo">
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
          <Menu>
            <MenuTrigger
              render={<Button variant="outline" className="w-full" disabled={move.isPending} />}
            >
              {t('actions.moveTo')}
              <ChevronDownIcon aria-hidden />
            </MenuTrigger>
            <MenuContent>
              {others.map((stage) => (
                <MenuItem key={stage} onClick={() => move.mutate(stage)}>
                  {tStages(stage)}
                </MenuItem>
              ))}
            </MenuContent>
          </Menu>
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

      <Dialog open={dialog !== null} onOpenChange={(open) => !open && close()}>
        <DialogContent>
          {dialog && (
            <>
              <DialogTitle>
                {t(`${dialog === 'request-info' ? 'requestInfo' : dialog}.title`, {
                  name: applicant.name,
                  animal: application.animal.name,
                })}
              </DialogTitle>
              <DialogDescription>
                {t(`${dialog === 'request-info' ? 'requestInfo' : dialog}.description`, {
                  name: applicant.name.split(' ')[0] ?? applicant.name,
                  animal: application.animal.name,
                })}
              </DialogDescription>
              {dialog === 'request-info' && (
                <RequestInfoForm
                  applicationId={application.id}
                  applicantName={applicant.name}
                  onDone={close}
                />
              )}
              {dialog === 'refuse' && (
                <RefuseForm
                  applicationId={application.id}
                  applicantName={applicant.name}
                  animalName={application.animal.name}
                  organizationName={organization.name}
                  onDone={close}
                />
              )}
              {dialog === 'complete' && (
                <CompleteForm
                  applicationId={application.id}
                  applicantName={applicant.name}
                  animalName={application.animal.name}
                  onDone={close}
                />
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </section>
  )
}
