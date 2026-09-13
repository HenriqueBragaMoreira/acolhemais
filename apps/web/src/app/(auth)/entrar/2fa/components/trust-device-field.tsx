'use client'

import { Checkbox } from '@acolhemais/ui/components/checkbox'
import { Field, FieldContent, FieldDescription, FieldLabel } from '@acolhemais/ui/components/field'
import { useTranslations } from 'next-intl'

/**
 * "Confiar neste dispositivo por 30 dias" (FR-006, BR-009): desmarcada por padrão, por causa de
 * computadores compartilhados. Vale para o código do app e para o de recuperação.
 */
export function TrustDeviceField({
  checked,
  onCheckedChange,
}: {
  checked: boolean
  onCheckedChange: (checked: boolean) => void
}) {
  const t = useTranslations('TwoFactor')

  return (
    // 24px até o botão: a caixa fica junto do envio, sem encostar nele.
    <Field orientation="horizontal" className="mb-3 gap-3">
      <Checkbox
        id="trust-device"
        checked={checked}
        onCheckedChange={onCheckedChange}
        aria-describedby="trust-device-hint"
      />
      <FieldContent>
        <FieldLabel htmlFor="trust-device">{t('trustDevice')}</FieldLabel>
        <FieldDescription id="trust-device-hint">{t('trustDeviceHint')}</FieldDescription>
      </FieldContent>
    </Field>
  )
}
