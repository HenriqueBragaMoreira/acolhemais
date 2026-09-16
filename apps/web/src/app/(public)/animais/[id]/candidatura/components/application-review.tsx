'use client'

import { type AccountData } from './application-stepper'
import { useStepData } from './use-step-data'
import { ReviewAnswers } from './review-answers'

export type ReviewProps = { onSent: (sent: SentApplication) => void }

/** O que a pessoa respondeu, por parte, para conferir antes de enviar. */
export function ApplicationReview({ onSent }: ReviewProps) {
  const draft = useStepData()
  const account = draft('account')
  const applicant = draft('applicant')
  const home = draft('home')
  const pets = draft('pets')
  const routine = draft('routine')
  const reasons = draft('reasons')
  // A revisão só se alcança passando pelas etapas; sem elas, não há o que revisar.
  if (!account || !applicant || !home || !pets || !routine || !reasons) return null

  return (
    <ReviewAnswers
      account={account}
      profile={{ applicant, home, pets, routine, reasons }}
      answers={draft('organization') ?? {}}
      onSent={onSent}
    />
  )
}

/** O que a tela de enviada precisa saber para as dicas. */
export type SentApplication = { mode: AccountData['mode']; phone: string }
