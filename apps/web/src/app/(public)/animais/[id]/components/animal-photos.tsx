'use client'

import { Button } from '@acolhemais/ui/components/button'
import { cn } from '@acolhemais/ui/lib/utils'
import { EyeOffIcon, Maximize2Icon, XIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'
import Image from 'next/image'
import { useRef, useState } from 'react'
import { flushSync } from 'react-dom'
import type { AnimalPhoto } from '@/services/animals/types'
import { PhotoStage } from './photo-stage'
import { PhotoArrows } from './photo-arrows'

/**
 * Fotos do animal (FR-031): a escolhida ocupa o quadro, as miniaturas trocam a foto e "Ampliar"
 * abre a foto na tela inteira. Foto sensível fica desfocada, na grande e na miniatura, até a
 * pessoa escolher vê-la, e pode ser escondida de novo (BR-061).
 */
export function AnimalPhotos({ name, photos }: { name: string; photos: AnimalPhoto[] }) {
  const t = useTranslations('AnimalProfile.photos')
  const [index, setIndex] = useState(0)
  const [revealed, setRevealed] = useState<ReadonlySet<number>>(() => new Set())
  const enlarged = useRef<HTMLDialogElement>(null)
  const [open, setOpen] = useState(false)

  const current = photos[index]
  if (!current) return null
  const hidden = (position: number) =>
    Boolean(photos[position]?.sensitive) && !revealed.has(position)
  const reveal = (visible: boolean) =>
    setRevealed((positions) => {
      const next = new Set(positions)
      if (visible) next.add(index)
      else next.delete(index)
      return next
    })
  const step = (delta: number) =>
    setIndex((position) => (position + delta + photos.length) % photos.length)
  const stage = (sizes: string, fit: 'cover' | 'contain', priority = false) => (
    <PhotoStage
      photo={current}
      alt={t('alt', { name, position: index + 1, total: photos.length })}
      hidden={hidden(index)}
      onReveal={() => reveal(true)}
      sizes={sizes}
      fit={fit}
      priority={priority}
    />
  )

  return (
    // No computador a coluna tem a largura da foto: foto e miniaturas cabem na altura da tela
    // enquanto a foto fica fixa, sem a foto ficar menor que 32rem em telas baixas.
    <div className="lg:w-[clamp(32rem,calc((100svh-9rem)*0.8),46rem)]">
      <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-muted">
        {stage('(min-width: 64rem) 46vw, 100vw', 'cover', index === 0)}
        {photos.length > 1 && <PhotoArrows onStep={step} />}
        {!hidden(index) && (
          <Button
            variant="outline"
            size="icon"
            aria-label={t('enlarge')}
            title={t('enlarge')}
            className="absolute top-3 right-3 rounded-full"
            onClick={() => {
              // O conteúdo precisa existir antes do showModal, que foca o primeiro botão dele.
              flushSync(() => setOpen(true))
              enlarged.current?.showModal()
            }}
          >
            <Maximize2Icon aria-hidden />
          </Button>
        )}
        {current.sensitive && !hidden(index) && (
          <Button
            variant="outline"
            size="icon"
            aria-label={t('sensitive.hide')}
            title={t('sensitive.hide')}
            className="absolute right-3 bottom-3 rounded-full"
            onClick={() => reveal(false)}
          >
            <EyeOffIcon aria-hidden />
          </Button>
        )}
      </div>

      {photos.length > 1 && (
        <ul className="mt-3 flex flex-wrap gap-2">
          {photos.map((photo, position) => (
            <li key={photo.src}>
              <button
                type="button"
                aria-label={t('choose', { position: position + 1, total: photos.length })}
                aria-current={position === index}
                onClick={() => setIndex(position)}
                className="relative block size-18 overflow-hidden rounded-lg outline-offset-2 focus-visible:outline-2 focus-visible:outline-ring aria-[current=true]:outline-2 aria-[current=true]:outline-ring"
              >
                <Image
                  src={photo.src}
                  alt=""
                  fill
                  sizes="4.5rem"
                  className={cn('object-cover', hidden(position) && 'scale-110 blur-md')}
                  style={{ objectPosition: photo.focus }}
                />
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* Foto ampliada: <dialog> nativo (Esc fecha e o foco volta ao "Ampliar"); as setas do
          teclado trocam a foto. O conteúdo só existe aberto. */}
      <dialog
        ref={enlarged}
        aria-label={name}
        onClose={() => setOpen(false)}
        onKeyDown={(event) => {
          if (event.key === 'ArrowLeft') step(-1)
          if (event.key === 'ArrowRight') step(1)
        }}
        className="m-0 size-full max-h-none max-w-none bg-veil p-0 text-white"
      >
        {open && (
          <div className="flex size-full flex-col">
            <div className="flex items-center justify-between gap-4 px-4 py-3 sm:px-6">
              <p className="text-sm tabular-nums">
                {t('counter', { position: index + 1, total: photos.length })}
              </p>
              <Button
                variant="outline"
                size="icon"
                aria-label={t('close')}
                title={t('close')}
                className="rounded-full focus-visible:outline-white"
                onClick={() => enlarged.current?.close()}
              >
                <XIcon aria-hidden />
              </Button>
            </div>
            <div className="relative min-h-0 flex-1 px-4 pb-4 sm:px-20 sm:pb-6">
              <div className="relative size-full overflow-hidden">{stage('100vw', 'contain')}</div>
              {photos.length > 1 && <PhotoArrows onStep={step} />}
            </div>
          </div>
        )}
      </dialog>
    </div>
  )
}
