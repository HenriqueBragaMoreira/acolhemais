import { cn } from '@acolhemais/ui/lib/utils'

const ILLUSTRATIONS = '/ilustracoes'

const SCENE = { name: 'caramelo-varanda', widths: [960, 1280, 1672] } as const
const PORTRAIT = { name: 'caramelo-retrato', widths: [800, 1200] } as const

function srcSet(
  { name, widths }: { name: string; widths: readonly number[] },
  format: 'avif' | 'webp',
) {
  return widths.map((width) => `${ILLUSTRATIONS}/${name}-${width}.${format} ${width}w`).join(', ')
}

/**
 * Ilustração do vira-lata caramelo (origem em public/ilustracoes/PROVENIENCIA.md), o fundo das
 * telas de acesso e do topo da página inicial. No computador é a cena da varanda, com o cão à
 * direita e a esquerda calma para o texto; no celular, o retrato. É decorativa: nada da página
 * depende dela.
 */
export function CaramelIllustration({ className }: { className?: string }) {
  return (
    <picture>
      <source
        media="(min-width: 64rem)"
        type="image/avif"
        sizes="100vw"
        srcSet={srcSet(SCENE, 'avif')}
      />
      <source
        media="(min-width: 64rem)"
        type="image/webp"
        sizes="100vw"
        srcSet={srcSet(SCENE, 'webp')}
      />
      <source type="image/avif" sizes="100vw" srcSet={srcSet(PORTRAIT, 'avif')} />
      <source type="image/webp" sizes="100vw" srcSet={srcSet(PORTRAIT, 'webp')} />
      {/* oxlint-disable-next-line nextjs/no-img-element -- direção de arte com fontes já otimizadas */}
      <img
        src={`${ILLUSTRATIONS}/${PORTRAIT.name}-800.webp`}
        alt=""
        width={1672}
        height={941}
        fetchPriority="high"
        /* `className` ajusta o enquadramento a cada moldura (ex.: `lg:object-[72%_20%]`). */
        className={cn(
          'size-full object-cover object-[38%_30%] motion-safe:animate-settle lg:object-[72%_50%]',
          className,
        )}
      />
    </picture>
  )
}
