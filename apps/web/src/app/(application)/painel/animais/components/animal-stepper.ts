import { defineStepper } from '@stepperize/react'

export const animalStepper = defineStepper([
  { id: 'about' },
  { id: 'health' },
  { id: 'photos' },
  { id: 'story' },
  { id: 'review' },
])

export type Step = (typeof animalStepper.steps)[number]['id']
