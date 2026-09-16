'use client'

import { Button } from '@acolhemais/ui/components/button'
import { Spinner } from '@acolhemais/ui/components/spinner'
import { ArrowLeftIcon, ArrowRightIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { applicationStepper } from './application-stepper'
import { useAdvance } from './use-advance'

/**
 * Voltar e Continuar no pé de cada etapa; Continuar envia o formulário da etapa. Aberta pelo
 * "Editar" da revisão, os dois levam de volta à revisão.
 */
export function StepActions({ pending = false, submit }: { pending?: boolean; submit?: string }) {
  const t = useTranslations('Application')
  const stepper = applicationStepper.useStepperContext()
  const { returning, backToReview } = useAdvance()

  return (
    <div className="mt-8 flex flex-col-reverse gap-3 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
      {stepper.isFirst ? (
        <span />
      ) : (
        <Button
          type="button"
          variant="outline"
          onClick={() => void (returning ? backToReview() : stepper.prev())}
        >
          <ArrowLeftIcon aria-hidden />
          {returning ? t('backToReview') : t('back')}
        </Button>
      )}
      <Button type="submit" size="lg" disabled={pending} aria-busy={pending}>
        {pending && <Spinner />}
        {returning ? t('saveAndReview') : (submit ?? t('continue'))}
        {!pending && !submit && !returning && <ArrowRightIcon aria-hidden />}
      </Button>
    </div>
  )
}
