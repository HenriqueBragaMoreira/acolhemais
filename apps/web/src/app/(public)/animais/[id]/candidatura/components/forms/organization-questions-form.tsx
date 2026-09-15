'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { UserRoundCheckIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import type { OrganizationQuestion } from '@/services/organizations'
import { ChoiceField, StepActions, TextField, useYesNo } from '../application-fields'
import { useApplicationTarget, useStepData, useAdvance } from '../application-stepper'
import { text } from './answers'

/** Toda pergunta da organização é obrigatória; as de escolha nascem sem resposta (''). */
function questionsSchema(questions: OrganizationQuestion[]) {
  return z.object(
    Object.fromEntries(
      questions.map((question) => [
        question.id,
        question.type === 'text' ? text : z.string().min(1, 'required'),
      ]),
    ),
  )
}

/** As perguntas próprias da organização (FR-044), depois do questionário da plataforma. */
export function OrganizationQuestionsForm() {
  const t = useTranslations('Application.organization')
  const yesNoOptions = useYesNo()
  const { advance } = useAdvance()
  const draft = useStepData()
  const { organization } = useApplicationTarget()
  const { questions } = organization
  const account = draft('account')

  const form = useForm<Record<string, string>>({
    resolver: zodResolver(questionsSchema(questions)),
    defaultValues:
      draft('organization') ?? Object.fromEntries(questions.map((question) => [question.id, ''])),
  })

  return (
    <form noValidate onSubmit={form.handleSubmit((data) => advance(data))}>
      {/* Quem entrou na conta pulou cinco etapas: diz de onde vieram as respostas. */}
      {account?.mode === 'account' && (
        <p className="mb-6 flex gap-2.5 rounded-lg bg-secondary px-3.5 py-3 text-sm text-pretty">
          <UserRoundCheckIcon aria-hidden className="mt-0.5 size-4 shrink-0" />
          {t('fromProfile', { email: account.email })}
        </p>
      )}
      {questions.length === 0 ? (
        <p>{t('none', { organization: organization.name })}</p>
      ) : (
        <div className="flex flex-col gap-5">
          {questions.map((question) =>
            question.type === 'text' ? (
              <TextField
                key={question.id}
                control={form.control}
                name={question.id}
                label={question.label}
                multiline
              />
            ) : (
              <ChoiceField
                key={question.id}
                control={form.control}
                name={question.id}
                label={question.label}
                inline={question.type === 'yes-no'}
                options={
                  'options' in question
                    ? question.options.map((option) => ({ value: option, label: option }))
                    : yesNoOptions
                }
              />
            ),
          )}
        </div>
      )}
      <StepActions />
    </form>
  )
}
