'use client'

import {
  type ApplicationTarget,
  ApplicationTargetProvider,
  applicationStepper,
} from './application-stepper'
import { ReturnToReview } from './return-to-review'
import { ApplicationFlow } from './application-flow'
import { AnimalSummary } from './animal-summary'

/** A candidatura em etapas, com o animal sempre à vista (FR-041, FR-042). */
export function ApplicationWizard(target: ApplicationTarget) {
  return (
    <ApplicationTargetProvider value={target}>
      <applicationStepper.Provider>
        <ReturnToReview>
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start lg:gap-10">
            <AnimalSummary />
            <ApplicationFlow />
          </div>
        </ReturnToReview>
      </applicationStepper.Provider>
    </ApplicationTargetProvider>
  )
}
