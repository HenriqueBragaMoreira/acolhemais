'use client'

import { cn } from '@acolhemais/ui/lib/utils'
import { PawPrintIcon } from 'lucide-react'
import Image from 'next/image'
import type { AnimalPhoto } from '@/services/animals'

/**
 * A foto do animal recortada 4:5, preenchendo o próprio quadro (a Regra do Quadro do Animal).
 * O rascunho sem foto mostra a pegada sobre a névoa.
 */
export function AnimalThumb({
  photo,
  className,
  sizes = '48px',
}: {
  photo: AnimalPhoto | null | undefined
  className?: string
  sizes?: string
}) {
  return (
    <span
      className={cn(
        'relative grid aspect-[4/5] shrink-0 place-items-center overflow-hidden rounded-lg bg-muted',
        // Sem foto, o quadro ganha borda para não sumir sobre a névoa.
        !photo && 'bg-background shadow-[inset_0_0_0_1px_rgb(31_26_23/0.12)]',
        className,
      )}
    >
      {photo ? (
        <Image
          src={photo.src}
          alt=""
          fill
          sizes={sizes}
          // Foto recém-escolhida no cadastro: ainda só existe no navegador.
          unoptimized={photo.src.startsWith('blob:')}
          className={cn('object-cover', photo.sensitive && 'blur-md')}
          style={{ objectPosition: photo.focus }}
        />
      ) : (
        <PawPrintIcon aria-hidden className="size-1/3 text-muted-foreground" />
      )}
    </span>
  )
}
