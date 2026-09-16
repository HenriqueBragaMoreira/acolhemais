'use client'

import { Button } from '@acolhemais/ui/components/button'
import { Checkbox } from '@acolhemais/ui/components/checkbox'
import { Label } from '@acolhemais/ui/components/label'
import { ImagePlusIcon, StarIcon, Trash2Icon } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useRef } from 'react'
import { type Control, useController } from 'react-hook-form'
import { FieldMessage } from '@/components/field-message'
import { TextField } from '@/components/text-field'
import { AnimalThumb } from '../../../../_components/animal-thumb'
import type { AnimalFormValues } from '../forms/animal-form'

export const MAX_PHOTOS = 10

/** De 1 a 10 fotos; a primeira é a capa e nunca é sensível (BR-061). */
export function PhotosStep({ control }: { control: Control<AnimalFormValues> }) {
  const t = useTranslations('Panel.animalForm.photos')
  const tErrors = useTranslations('FormErrors')
  const tFields = useTranslations('Panel.animalForm.fields')
  const { field, fieldState } = useController({ control, name: 'photos' })
  const photos = field.value
  const inputRef = useRef<HTMLInputElement>(null)

  const update = (next: typeof photos) => field.onChange(next)

  return (
    <div className="flex flex-col gap-6">
      <div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-[0.9375rem] font-semibold" id="fotos-rotulo">
            {t('label', { count: photos.length, max: MAX_PHOTOS })}
          </p>
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            className="sr-only"
            id="fotos-arquivos"
            aria-label={t('add')}
            tabIndex={-1}
            onChange={(event) => {
              const files = [...(event.target.files ?? [])].slice(0, MAX_PHOTOS - photos.length)
              update([
                ...photos,
                ...files.map((file) => ({ src: URL.createObjectURL(file), focus: '50% 50%' })),
              ])
              event.target.value = ''
            }}
          />
          <Button
            type="button"
            variant="outline"
            disabled={photos.length >= MAX_PHOTOS}
            onClick={() => inputRef.current?.click()}
          >
            <ImagePlusIcon aria-hidden />
            {t('add')}
          </Button>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">{t('hint')}</p>

        {photos.length === 0 ? (
          <div className="mt-4 grid min-h-40 place-items-center rounded-xl border border-dashed border-input px-4 text-center text-muted-foreground">
            {t('empty')}
          </div>
        ) : (
          <ul
            aria-labelledby="fotos-rotulo"
            className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4"
          >
            {photos.map((photo, index) => (
              <li key={photo.src} className="flex flex-col gap-2">
                <div className="relative">
                  <AnimalThumb photo={photo} className="w-full rounded-xl" sizes="12rem" />
                  {index === 0 && (
                    <span className="absolute top-2 left-2 rounded-md bg-background px-2 py-0.5 text-xs font-semibold">
                      {t('cover')}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  {index > 0 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      aria-label={t('makeCover', { number: index + 1 })}
                      onClick={() =>
                        update([
                          { ...photo, sensitive: false },
                          ...photos.filter((_, other) => other !== index),
                        ])
                      }
                    >
                      <StarIcon aria-hidden />
                    </Button>
                  )}
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    aria-label={t('remove', { number: index + 1 })}
                    onClick={() => update(photos.filter((_, other) => other !== index))}
                  >
                    <Trash2Icon aria-hidden />
                  </Button>
                  {index > 0 && (
                    <span className="ml-auto flex items-center gap-2">
                      <Checkbox
                        id={`foto-sensivel-${index}`}
                        checked={Boolean(photo.sensitive)}
                        onCheckedChange={(checked) =>
                          update(
                            photos.map((other, position) =>
                              position === index ? { ...other, sensitive: checked } : other,
                            ),
                          )
                        }
                      />
                      <Label htmlFor={`foto-sensivel-${index}`} className="text-sm font-normal">
                        {t('sensitive')}
                      </Label>
                    </span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
        <FieldMessage
          id="fotos-erro"
          message={fieldState.error?.message && tErrors(fieldState.error.message)}
        />
      </div>
      <TextField
        control={control}
        name="videoUrl"
        label={tFields('videoUrl')}
        description={tFields('videoUrlHint')}
        type="url"
        inputMode="url"
      />
    </div>
  )
}
