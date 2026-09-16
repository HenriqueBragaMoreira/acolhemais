'use client'

import type { PipelineStage } from '@acolhemais/domain'
import { Button } from '@acolhemais/ui/components/button'
import { Menu, MenuContent, MenuItem, MenuTrigger } from '@acolhemais/ui/components/menu'
import { ChevronDownIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'

type MoveStageMenuProps = {
  stages: PipelineStage[]
  disabled: boolean
  onMove: (stage: PipelineStage) => void
}

/** "Mover para…": as etapas para onde a candidatura pode ir além da próxima. */
export function MoveStageMenu({ stages, disabled, onMove }: MoveStageMenuProps) {
  const t = useTranslations('Panel.file')
  const tStages = useTranslations('Panel.stages')

  return (
    <Menu>
      <MenuTrigger render={<Button variant="outline" className="w-full" disabled={disabled} />}>
        {t('actions.moveTo')}
        <ChevronDownIcon aria-hidden />
      </MenuTrigger>
      <MenuContent>
        {stages.map((stage) => (
          <MenuItem key={stage} onClick={() => onMove(stage)}>
            {tStages(stage)}
          </MenuItem>
        ))}
      </MenuContent>
    </Menu>
  )
}
