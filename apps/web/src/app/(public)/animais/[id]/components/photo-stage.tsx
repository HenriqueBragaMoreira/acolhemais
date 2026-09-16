'use client'

import { Button } from '@acolhemais/ui/components/button'
import { cn } from '@acolhemais/ui/lib/utils'
import { EyeOffIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'
import Image from 'next/image'
import type { AnimalPhoto } from '@/services/animals'

/** A foto num quadro que ela preenche, com o véu da foto sensível por cima enquanto escondida. */
export function PhotoStage({
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
