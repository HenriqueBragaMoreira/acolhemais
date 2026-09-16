'use client'

import { PIPELINE_STAGES, type PipelineStage } from '@acolhemais/domain'
import { cn } from '@acolhemais/ui/lib/utils'
import { useTranslations } from 'next-intl'
import Link from 'next/link'

/*
 * O trilho das etapas: o mesmo caminho que o adotante vê ao enviar a candidatura, agora do lado
 * da organização. No Início, cada estação leva a sua contagem; na ficha, mostra onde a
 * candidatura está, e a linha desliza até a estação nova quando ela muda de etapa.
 */

/** Início: quantas candidaturas esperam em cada etapa; cada estação abre a sua coluna. */
export function StageCounts({ counts }: { counts: Record<PipelineStage, number> }) {
  const t = useTranslations('Panel.stages')

  return (
    <ol className="grid sm:grid-cols-4">
      {PIPELINE_STAGES.map((stage, index) => (
        <li key={stage} className="relative">
          {/*
           * A linha sai do centro desta estação e chega ao centro da próxima: no celular desce
           * (centro do ponto a 28px do topo), a partir de 40rem segue na horizontal (a 14px).
           */}
          {index < PIPELINE_STAGES.length - 1 && (
            <span
              aria-hidden
              className="absolute top-[28px] left-[5px] h-full w-0.5 bg-border sm:top-[13px] sm:left-1/2 sm:h-0.5 sm:w-full"
            />
          )}
          <Link
            href={`/painel/candidaturas#etapa-${stage}`}
            className="group relative flex items-start gap-4 rounded-lg py-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring sm:flex-col sm:items-center sm:gap-3 sm:px-2 sm:text-center"
          >
            <span
              aria-hidden
              className={cn(
                'relative mt-3.5 size-3 shrink-0 rounded-full sm:mt-0',
                counts[stage] > 0 ? 'bg-foreground' : 'border-2 border-input bg-background',
              )}
            />
            <span className="flex items-baseline gap-2 sm:flex-col sm:items-center sm:gap-0.5">
              <span className="text-3xl font-bold tracking-tight tabular-nums">
                {counts[stage]}
              </span>
              <span className="text-sm font-semibold text-muted-foreground underline-offset-4 group-hover:text-foreground group-hover:underline">
                {t(stage)}
              </span>
            </span>
          </Link>
        </li>
      ))}
    </ol>
  )
}
