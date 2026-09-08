import { Field, FieldDescription, FieldError, FieldLabel } from '@acolhemais/ui/components/field'
import { Input } from '@acolhemais/ui/components/input'
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@acolhemais/ui/components/input-otp'
import { PasswordInput } from '@acolhemais/ui/components/password-input'
import { Textarea } from '@acolhemais/ui/components/textarea'
import { CircleAlertIcon } from 'lucide-react'
import { ShowcaseSection } from './showcase-section'

export function FieldShowcase({ scope }: { scope: string }) {
  const id = (name: string) => `${scope}-${name}`

  return (
    <ShowcaseSection
      id={id('fields')}
      title="Campos"
      description="Rótulo sempre visível, ajuda abaixo do campo e erro com ícone, no mesmo lugar da ajuda."
    >
      <div className="grid gap-x-8 gap-y-6 md:grid-cols-2">
        <Field>
          <FieldLabel htmlFor={id('name')}>Nome do animal</FieldLabel>
          <Input id={id('name')} defaultValue="Caramelo" />
          <FieldDescription>Como a ONG chama o animal.</FieldDescription>
        </Field>

        <Field data-invalid>
          <FieldLabel htmlFor={id('city')}>Cidade</FieldLabel>
          <Input id={id('city')} aria-invalid aria-describedby={id('city-error')} />
          <FieldError id={id('city-error')}>
            <CircleAlertIcon aria-hidden />
            Informe a cidade onde o animal está.
          </FieldError>
        </Field>

        <Field data-disabled>
          <FieldLabel htmlFor={id('cpf')}>CPF do adotante</FieldLabel>
          <Input id={id('cpf')} defaultValue="***.456.789-**" disabled />
          <FieldDescription>Só quem tem permissão vê o CPF completo.</FieldDescription>
        </Field>

        <Field>
          <FieldLabel htmlFor={id('password')}>Senha</FieldLabel>
          <PasswordInput
            id={id('password')}
            defaultValue="uma-senha-longa"
            showLabel="Mostrar"
            hideLabel="Ocultar"
          />
        </Field>

        <Field>
          <FieldLabel htmlFor={id('code')}>Código do aplicativo</FieldLabel>
          <InputOTP id={id('code')} maxLength={6} defaultValue="4821">
            <InputOTPGroup>
              {[0, 1, 2, 3, 4, 5].map((index) => (
                <InputOTPSlot key={index} index={index} />
              ))}
            </InputOTPGroup>
          </InputOTP>
        </Field>

        <Field>
          <FieldLabel htmlFor={id('story')}>História</FieldLabel>
          <Textarea
            id={id('story')}
            defaultValue="Resgatado na beira da estrada em março. Convive bem com gatos e crianças."
          />
        </Field>
      </div>
    </ShowcaseSection>
  )
}
