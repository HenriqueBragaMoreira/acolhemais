'use client'

import { Button } from '@acolhemais/ui/components/button'
import { cn } from '@acolhemais/ui/lib/utils'
import { ChevronLeftIcon, ChevronRightIcon, EyeOffIcon, Maximize2Icon, XIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'
import Image from 'next/image'
import { useRef, useState } from 'react'
import { flushSync } from 'react-dom'
import type { AnimalPhoto } from '@/services/animals'

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
        {photos.length > 1 && <Arrows onStep={step} />}
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
              {photos.length > 1 && <Arrows onStep={step} />}
            </div>
          </div>
        )}
      </dialog>
    </div>
  )
}

/** A foto num quadro que ela preenche, com o véu da foto sensível por cima enquanto escondida. */
function PhotoStage({
  photo,
  alt,
  hidden,
  onReveal,
  sizes,
  fit,
  priority,
}: {
  photo: AnimalPhoto
  alt: string
  hidden: boolean
  onReveal: () => void
  sizes: string
  fit: 'cover' | 'contain'
  priority: boolean
}) {
  const t = useTranslations('AnimalProfile.photos.sensitive')
  return (
    <>
      <Image
        key={photo.src}
        src={photo.src}
        alt={alt}
        fill
        priority={priority}
        sizes={sizes}
        className={cn(
          fit === 'cover' ? 'object-cover' : 'object-contain',
          hidden && 'scale-110 blur-2xl',
        )}
        style={{ objectPosition: photo.focus }}
      />
      {hidden && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-veil/75 px-6 text-center text-white">
          <EyeOffIcon aria-hidden className="size-6" />
          <p className="font-semibold">{t('title')}</p>
          <p className="max-w-xs text-sm text-white/90">{t('description')}</p>
          <Button variant="outline" className="mt-1 focus-visible:outline-white" onClick={onReveal}>
            {t('show')}
          </Button>
        </div>
      )}
    </>
  )
}

/**
 * Setas de foto anterior e próxima. Centralizadas com `inset-y-0 my-auto`, não com translate: o
 * botão desce 1px ao ser pressionado (translate), o que anularia o centramento e o tiraria de
 * baixo do ponteiro no meio do clique.
 */
function Arrows({ onStep }: { onStep: (delta: number) => void }) {
  const t = useTranslations('AnimalProfile.photos')
  return (
    <>
      <Button
        variant="outline"
        size="icon"
        aria-label={t('previous')}
        className="absolute inset-y-0 left-3 my-auto rounded-full"
        onClick={() => onStep(-1)}
      >
        <ChevronLeftIcon aria-hidden />
      </Button>
      <Button
        variant="outline"
        size="icon"
        aria-label={t('next')}
        className="absolute inset-y-0 right-3 my-auto rounded-full"
        onClick={() => onStep(1)}
      >
        <ChevronRightIcon aria-hidden />
      </Button>
    </>
  )
}
