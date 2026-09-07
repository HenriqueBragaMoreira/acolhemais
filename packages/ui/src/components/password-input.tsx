'use client'

import { EyeIcon, EyeOffIcon } from 'lucide-react'
import * as React from 'react'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from '@acolhemais/ui/components/input-group'

/**
 * Campo de senha com o botão de mostrar e ocultar. Os textos do botão vêm de quem usa (i18n).
 * O valor some de novo quando o formulário é enviado, para não ficar exposto na tela.
 */
function PasswordInput({
  className,
  showLabel,
  hideLabel,
  ...props
}: Omit<React.ComponentProps<'input'>, 'type'> & { showLabel: string; hideLabel: string }) {
  const [visible, setVisible] = React.useState(false)
  const inputRef = React.useRef<HTMLInputElement>(null)

  React.useEffect(() => {
    const form = inputRef.current?.form
    if (!form) return
    const hide = () => setVisible(false)
    form.addEventListener('submit', hide)
    return () => form.removeEventListener('submit', hide)
  }, [])

  return (
    <InputGroup data-slot="password-input" className={className}>
      <InputGroupInput ref={inputRef} type={visible ? 'text' : 'password'} {...props} />
      <InputGroupAddon align="inline-end">
        <InputGroupButton
          size="sm"
          className="h-8 px-2.5 text-sm font-semibold"
          aria-controls={props.id}
          disabled={props.disabled}
          onClick={() => setVisible((current) => !current)}
        >
          {visible ? <EyeOffIcon aria-hidden /> : <EyeIcon aria-hidden />}
          {visible ? hideLabel : showLabel}
        </InputGroupButton>
      </InputGroupAddon>
    </InputGroup>
  )
}

export { PasswordInput }
