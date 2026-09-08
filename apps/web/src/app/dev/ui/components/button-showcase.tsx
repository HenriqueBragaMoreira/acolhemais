import { Button } from '@acolhemais/ui/components/button'
import { Spinner } from '@acolhemais/ui/components/spinner'
import { PlusIcon } from 'lucide-react'
import { ShowcaseSection } from './showcase-section'

export function ButtonShowcase({ scope }: { scope: string }) {
  return (
    <ShowcaseSection
      id={`${scope}-buttons`}
      title="Botões"
      description="A cor de ação aparece só no botão principal de cada tela. Os demais são contorno, secundário, fantasma ou link."
    >
      <div className="flex flex-wrap items-center gap-3">
        <Button>Salvar animal</Button>
        <Button variant="outline">Cancelar</Button>
        <Button variant="secondary">Ver candidaturas</Button>
        <Button variant="ghost">Mais opções</Button>
        <Button variant="destructive">Arquivar animal</Button>
        <Button variant="link">Ver histórico</Button>
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <Button size="sm">Pequeno</Button>
        <Button>Padrão</Button>
        <Button size="lg">Grande</Button>
        <Button size="icon" aria-label="Adicionar animal">
          <PlusIcon aria-hidden />
        </Button>
        <Button disabled>Desativado</Button>
        <Button disabled aria-busy>
          <Spinner />
          Salvando…
        </Button>
      </div>
    </ShowcaseSection>
  )
}
