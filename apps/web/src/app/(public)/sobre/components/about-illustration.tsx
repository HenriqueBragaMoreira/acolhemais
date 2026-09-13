const SCENE = '/ilustracoes/caramelo-varanda'
const WIDTHS = [960, 1280, 1672]

function srcSet(format: 'avif' | 'webp') {
  return WIDTHS.map((width) => `${SCENE}-${width}.${format} ${width}w`).join(', ')
}

/** Faixa com a cena do caramelo na varanda, a mesma das telas de acesso. Decorativa. */
export function AboutIllustration() {
  return (
    <picture>
      <source type="image/avif" sizes="100vw" srcSet={srcSet('avif')} />
      <source type="image/webp" sizes="100vw" srcSet={srcSet('webp')} />
      {/* oxlint-disable-next-line nextjs/no-img-element -- fontes já otimizadas em várias larguras */}
      <img
        src={`${SCENE}-960.webp`}
        alt=""
        width={1672}
        height={941}
        fetchPriority="high"
        className="h-[clamp(14rem,40svh,28rem)] w-full object-cover object-[72%_18%]"
      />
    </picture>
  )
}
