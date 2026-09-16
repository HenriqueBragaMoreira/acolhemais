'use client'

import { cn } from '@acolhemais/ui/lib/utils'
import { useTranslations } from 'next-intl'
import { animalStepper } from './animal-stepper'

/** "Etapa X de Y" e a barra de etapas do cadastro do animal. */
export function AnimalFormProgress() {
  const t = useTranslations('Panel.animalForm')
  const stepper = animalStepper.useStepperContext()

  return (
    <>
      <p className="text-sm font-semibold text-muted-foreground" aria-live="polite">
        {t('progress', { step: stepper.index + 1, total: stepper.count })}
      </p>
      <div aria-hidden className="mt-2 flex gap-1.5">
        {stepper.steps.map((item, index) => (
          <span
            key={item.id}
            className={cn(
              'h-1.5 flex-1 rounded-full transition-colors duration-300',
              index <= stepper.index ? 'bg-foreground' : 'bg-muted',
            )}
          />
        ))}
      </div>
    </>
  )
}
