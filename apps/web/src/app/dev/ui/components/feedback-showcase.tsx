import { Alert, AlertDescription, AlertTitle } from '@acolhemais/ui/components/alert'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@acolhemais/ui/components/card'
import { Separator } from '@acolhemais/ui/components/separator'
import { Spinner } from '@acolhemais/ui/components/spinner'
import { CircleAlertIcon, InfoIcon } from 'lucide-react'
import { ShowcaseSection } from './showcase-section'

export function FeedbackShowcase({ scope }: { scope: string }) {
  return (
    <ShowcaseSection
      id={`${scope}-feedback`}
      title="Avisos, cartão e separador"
      description="Alertas explicam o problema e o que fazer. O cartão agrupa um assunto; não aninhar cartões."
    >
      <div className="grid gap-6 md:grid-cols-2">
        <div className="flex flex-col gap-3">
          <Alert>
            <InfoIcon aria-hidden />
            <AlertTitle>Candidatura recebida</AlertTitle>
            <AlertDescription>A equipe responde em até 7 dias.</AlertDescription>
          </Alert>
          <Alert variant="destructive">
            <CircleAlertIcon aria-hidden />
            <AlertDescription>E-mail ou senha incorretos.</AlertDescription>
          </Alert>
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <Spinner label="Carregando candidaturas" />
            Carregando candidaturas…
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Caramelo</CardTitle>
            <CardDescription>Cão adulto, porte médio · Campinas, SP</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <p>Castrado, vacinado e vermifugado.</p>
            <Separator />
            <p className="text-muted-foreground">3 candidaturas ativas</p>
          </CardContent>
        </Card>
      </div>
    </ShowcaseSection>
  )
}
