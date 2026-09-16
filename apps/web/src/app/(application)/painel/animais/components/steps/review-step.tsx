'use client'

import { Button } from '@acolhemais/ui/components/button'
import { PencilIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { type ReactNode } from 'react'
import { type Control, useWatch } from 'react-hook-form'
import { type Step, animalStepper } from '../animal-stepper'
import type { AnimalFormValues } from '../forms/animal-form'

/** Confere tudo antes de publicar; "Editar" abre a etapa de cada parte. */
export function ReviewStep({ control }: { control: Control<AnimalFormValues> }) {
  const t = useTranslations('Panel.animalForm')
  const stepper = animalStepper.useStepperContext()
  const values = useWatch({ control }) as AnimalFormValues
  const option = useTranslations('Panel.animalForm.options')
  const label = (group: string, value: string | null | undefined) =>
    value ? option(`${group}.${value}` as never) : t('review.empty')

  const parts: { step: Exclude<Step, 'review'>; rows: [string, ReactNode][] }[] = [
    {
      step: 'about',
      rows: [
        [t('fields.name'), values.name || t('review.empty')],
        [t('fields.species'), label('species', values.species)],
        [t('fields.sex'), label('sex', values.sex)],
        [t('fields.ageGroup'), label('ageGroup', values.ageGroup)],
        [t('fields.size'), label('size', values.size)],
        [t('fields.city'), values.city || t('review.empty')],
      ],
    },
    {
      step: 'health',
      rows: [
        [t('fields.castrated'), label('yesNo', values.castrated)],
        [t('fields.vaccinated'), label('yesNo', values.vaccinated)],
        [t('fields.dewormed'), label('yesNo', values.dewormed)],
        [t('fields.goodWithValue.children'), label('companion', values.goodWith?.children)],
        [t('fields.goodWithValue.dogs'), label('companion', values.goodWith?.dogs)],
        [t('fields.goodWithValue.cats'), label('companion', values.goodWith?.cats)],
      ],
    },
    {
      step: 'photos',
      rows: [[t('review.photos'), t('review.photoCount', { count: values.photos?.length ?? 0 })]],
    },
    {
      step: 'story',
      rows: [
        [t('fields.story'), values.story || t('review.empty')],
        [
          t('fields.fee'),
          values.feeMode === 'fee'
            ? `R$ ${values.feeValue} · ${values.feeCovers}`
            : label('feeMode', values.feeMode),
        ],
      ],
    },
  ]

  return (
    <div className="flex flex-col gap-8">
      {parts.map(({ step, rows }) => (
        <section key={step} aria-labelledby={`revisar-${step}`}>
          <div className="flex items-center justify-between gap-4 border-b border-border pb-2">
            <h3 id={`revisar-${step}`} className="font-bold tracking-tight">
              {t(`steps.${step}`)}
            </h3>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              aria-label={t('review.edit', { section: t(`steps.${step}`) })}
              onClick={() => void stepper.goTo(step)}
            >
              <PencilIcon aria-hidden />
              {t('review.editShort')}
            </Button>
          </div>
          <dl className="divide-y divide-border">
            {rows.map(([rowLabel, value]) => (
              <div
                key={rowLabel}
                className="grid gap-1 py-3 sm:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] sm:gap-6"
              >
                <dt className="text-sm text-muted-foreground">{rowLabel}</dt>
                <dd className="font-medium text-pretty">{value}</dd>
              </div>
            ))}
          </dl>
        </section>
      ))}
    </div>
  )
}
