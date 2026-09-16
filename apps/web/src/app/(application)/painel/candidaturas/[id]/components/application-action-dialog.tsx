'use client'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@acolhemais/ui/components/dialog'
import { useTranslations } from 'next-intl'
import type { ApplicationWithAnimal } from '@/services/panel/types'
import { CompleteForm } from './forms/complete-form'
import { RefuseForm } from './forms/refuse-form'
import { RequestInfoForm } from './forms/request-info-form'

export type ApplicationDialogKind = 'request-info' | 'refuse' | 'complete'

type ApplicationActionDialogProps = {
  kind: ApplicationDialogKind | null
  application: ApplicationWithAnimal
  organizationName: string
  onClose: () => void
}

/** O modal das ações com formulário: pedir informação, recusar ou concluir a adoção. */
export function ApplicationActionDialog({
  kind,
  application,
  organizationName,
  onClose,
}: ApplicationActionDialogProps) {
  const t = useTranslations('Panel.file')
  const { applicant } = application.profile
  const messages = kind === 'request-info' ? 'requestInfo' : kind

  return (
    <Dialog open={kind !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        {kind && (
          <>
            <DialogTitle>
              {t(`${messages}.title`, {
                name: applicant.name,
                animal: application.animal.name,
              })}
            </DialogTitle>
            <DialogDescription>
              {t(`${messages}.description`, {
                name: applicant.name.split(' ')[0] ?? applicant.name,
                animal: application.animal.name,
              })}
            </DialogDescription>
            {kind === 'request-info' && (
              <RequestInfoForm
                applicationId={application.id}
                applicantName={applicant.name}
                onDone={onClose}
              />
            )}
            {kind === 'refuse' && (
              <RefuseForm
                applicationId={application.id}
                applicantName={applicant.name}
                animalName={application.animal.name}
                organizationName={organizationName}
                onDone={onClose}
              />
            )}
            {kind === 'complete' && (
              <CompleteForm
                applicationId={application.id}
                applicantName={applicant.name}
                animalName={application.animal.name}
                onDone={onClose}
              />
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
