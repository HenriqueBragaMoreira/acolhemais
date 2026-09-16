'use client'

import { Button } from '@acolhemais/ui/components/button'
import { Spinner } from '@acolhemais/ui/components/spinner'
import { cn } from '@acolhemais/ui/lib/utils'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowLeftIcon, ArrowRightIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import { type ReactNode, useCallback, useRef, useState } from 'react'
import { type FieldPath, useForm } from 'react-hook-form'
import { z } from 'zod'
import { authServices } from '@/services/auth'
import { parseCurrencyToCents } from '@/utils/currency'
import { choice, optionalText, requireWhen, yesNo } from '@/utils/form-schema-fields'
import { AGE_GROUPS, COATS, SEXES, SIZES, SPECIES } from '@/constants/animal-options'
import { DEMO_FEE_CAP_CENTS } from '@/constants/panel'
import { panelServices } from '@/services/panel'
import type { AnimalInput, ManagedAnimal } from '@/services/panel/types'
import { PANEL_SURFACE } from '@/app/(application)/_components/panel-surface'
import { AnimalFormProgress } from '../animal-form-progress'
import { type Step, animalStepper } from '../animal-stepper'
import { AboutStep } from '../steps/about-step'
import { HealthStep } from '../steps/health-step'
import { MAX_PHOTOS, PhotosStep } from '../steps/photos-step'
import { ReviewStep } from '../steps/review-step'
import { StoryStep } from '../steps/story-step'

const companion = choice(['yes', 'no', 'untested'])

const baseSchema = z.object({
  name: z.string().trim().min(1, 'animalNameRequired').max(60, 'tooLong'),
  species: choice(SPECIES),
  sex: choice(SEXES),
  ageGroup: choice(AGE_GROUPS),
  bornAround: z.string().regex(/^\d{4}-\d{2}$/, 'bornAroundRequired'),
  size: choice(SIZES),
  coat: choice(COATS),
  city: z.string().trim().min(1, 'required').max(120, 'tooLong'),
  castrated: yesNo,
  vaccinated: yesNo,
  dewormed: yesNo,
  fivFelv: choice(['negative', 'positive', 'untested']).or(z.null()),
  specialNeeds: optionalText,
  goodWith: z.object({ children: companion, dogs: companion, cats: companion }),
  photos: z
    .array(z.object({ src: z.string(), focus: z.string(), sensitive: z.boolean().optional() }))
    .min(1, 'photosRequired')
    .max(MAX_PHOTOS, 'photosTooMany'),
  videoUrl: z.union([z.literal(''), z.url('videoInvalid')]),
  story: z.string().trim().min(1, 'storyRequired').max(2000, 'tooLong'),
  feeMode: choice(['none', 'fee']),
  feeValue: z.string(),
  feeCovers: optionalText,
})

/**
 * Tudo o que publicar exige (BR-060). As regras entre campos rodam mesmo com outros campos
 * vazios, para cada etapa conferir as suas sem esperar as seguintes.
 */
const animalSchema = baseSchema.superRefine(
  (animal, context) => {
    requireWhen(context, animal.species === 'cat', animal.fivFelv, 'fivFelv')
    if (animal.photos?.[0]?.sensitive) {
      context.addIssue({ code: 'custom', message: 'coverSensitive', path: ['photos'] })
    }
    if (animal.feeMode === 'fee') {
      const value = parseCurrencyToCents(animal.feeValue ?? '')
      if (!value) context.addIssue({ code: 'custom', message: 'feeInvalid', path: ['feeValue'] })
      else if (value > DEMO_FEE_CAP_CENTS) {
        context.addIssue({ code: 'custom', message: 'feeAboveCap', path: ['feeValue'] })
      }
      // Taxa maior que zero sempre diz o que cobre (BR-063).
      requireWhen(context, true, animal.feeCovers ?? '', 'feeCovers')
    }
  },
  { when: (payload) => typeof payload.value === 'object' && payload.value !== null },
)

export type AnimalFormValues = z.input<typeof animalSchema>

type FieldName = FieldPath<AnimalFormValues>

/** Os campos que cada etapa confere antes de seguir. */
const STEP_FIELDS: Record<Exclude<Step, 'review'>, FieldName[]> = {
  about: ['name', 'species', 'sex', 'ageGroup', 'bornAround', 'size', 'coat', 'city'],
  health: [
    'castrated',
    'vaccinated',
    'dewormed',
    'fivFelv',
    'specialNeeds',
    'goodWith.children',
    'goodWith.dogs',
    'goodWith.cats',
  ],
  photos: ['photos', 'videoUrl'],
  story: ['story', 'feeMode', 'feeValue', 'feeCovers'],
}

const yesNoOf = (value: boolean | undefined) =>
  value === undefined ? null : value ? ('yes' as const) : ('no' as const)

function toValues(animal: ManagedAnimal | undefined, city: string): AnimalFormValues {
  if (!animal) {
    return {
      name: '',
      species: null,
      sex: null,
      ageGroup: null,
      bornAround: '',
      size: null,
      coat: null,
      city,
      castrated: null,
      vaccinated: null,
      dewormed: null,
      fivFelv: null,
      specialNeeds: '',
      goodWith: { children: null, dogs: null, cats: null },
      photos: [],
      videoUrl: '',
      story: '',
      feeMode: null,
      feeValue: '',
      feeCovers: '',
    }
  }
  return {
    name: animal.name,
    species: animal.species,
    sex: animal.sex,
    ageGroup: animal.ageGroup,
    bornAround: animal.bornAround,
    size: animal.size,
    coat: animal.coat,
    city: animal.city,
    castrated: yesNoOf(animal.health.castrated),
    vaccinated: yesNoOf(animal.health.vaccinated),
    dewormed: yesNoOf(animal.health.dewormed),
    fivFelv: animal.health.fivFelv ?? null,
    specialNeeds: animal.health.specialNeeds ?? '',
    goodWith: { ...animal.goodWith },
    photos: animal.photos.map((photo) => ({ ...photo })),
    videoUrl: animal.videoUrl ?? '',
    story: animal.story,
    feeMode: animal.fee ? 'fee' : animal.status === 'draft' && !animal.story ? null : 'none',
    feeValue: animal.fee ? (animal.fee.cents / 100).toFixed(2).replace('.', ',') : '',
    feeCovers: animal.fee?.covers ?? '',
  }
}

/**
 * Do formulário para o que se guarda. O rascunho pode ter respostas em branco: elas ficam com um
 * valor neutro até alguém preencher e publicar (BR-060).
 */
function toInput(values: AnimalFormValues): AnimalInput {
  const fee = values.feeMode === 'fee' ? parseCurrencyToCents(values.feeValue) : null
  return {
    name: values.name.trim(),
    species: values.species ?? 'dog',
    sex: values.sex ?? 'male',
    ageGroup: values.ageGroup ?? 'adult',
    bornAround: values.bornAround,
    size: values.size ?? 'medium',
    coat: values.coat ?? 'short',
    city: values.city.trim(),
    goodWith: {
      children: values.goodWith.children ?? 'untested',
      dogs: values.goodWith.dogs ?? 'untested',
      cats: values.goodWith.cats ?? 'untested',
    },
    health: {
      castrated: values.castrated === 'yes',
      vaccinated: values.vaccinated === 'yes',
      dewormed: values.dewormed === 'yes',
      ...(values.species === 'cat' && values.fivFelv && { fivFelv: values.fivFelv }),
      ...(values.specialNeeds.trim() && { specialNeeds: values.specialNeeds.trim() }),
    },
    photos: values.photos.map(({ src, focus, sensitive }) => ({
      src,
      focus,
      ...(sensitive && { sensitive }),
    })),
    videoUrl: values.videoUrl.trim(),
    story: values.story.trim(),
    fee: fee ? { cents: fee, covers: values.feeCovers.trim() } : null,
  }
}

/**
 * O cadastro em etapas (FR-030): rascunho a qualquer momento, publicar só com tudo preenchido.
 * Fica dentro de `animalStepper.Provider`.
 */
export function AnimalForm({ animal, city }: { animal?: ManagedAnimal; city: string }) {
  const t = useTranslations('Panel.animalForm')
  const stepper = animalStepper.useStepperContext()
  const router = useRouter()
  const queryClient = useQueryClient()
  const { data: session } = useQuery({
    queryKey: ['session'],
    queryFn: () => authServices.session(),
  })
  const by = session?.user.name ?? ''
  const [saved, setSaved] = useState(false)
  const shownStep = useRef<string>(stepper.id)
  const form = useForm<AnimalFormValues, unknown, z.output<typeof animalSchema>>({
    resolver: zodResolver(animalSchema),
    defaultValues: toValues(animal, city),
  })
  const isDraft = !animal || animal.status === 'draft'

  const save = useMutation({
    mutationFn: ({ values, publish }: { values: AnimalFormValues; publish: boolean }) =>
      panelServices.saveAnimal(toInput(values), {
        ...(animal && { id: animal.id }),
        publish,
        by,
      }),
    onSuccess: async (result) => {
      await queryClient.invalidateQueries({ queryKey: ['panel'] })
      setSaved(true)
      if (!animal) router.push(`/painel/animais/${result.id}`)
    },
  })

  // A cada etapa nova o foco vai para o título dela, como na candidatura.
  const focusHeading = useCallback((node: HTMLHeadingElement | null) => {
    const step = node?.dataset.step
    if (!node || !step || step === shownStep.current) return
    shownStep.current = step
    node.focus()
    node.scrollIntoView({ block: 'nearest' })
  }, [])

  /** Publicar (ou salvar um animal já publicado) confere tudo; com erro, abre a etapa dele. */
  const submitFull = (publish: boolean) =>
    form.handleSubmit(
      () => save.mutate({ values: form.getValues(), publish }),
      (errors) => {
        const failed = (Object.keys(STEP_FIELDS) as Exclude<Step, 'review'>[]).find((step) =>
          STEP_FIELDS[step].some((field) => (field.split('.')[0] ?? field) in errors),
        )
        if (failed) void stepper.goTo(failed)
      },
    )()

  /** O rascunho só precisa do nome. */
  const saveDraft = async () => {
    setSaved(false)
    if (await form.trigger('name')) save.mutate({ values: form.getValues(), publish: false })
    else void stepper.goTo('about')
  }

  const next = async () => {
    setSaved(false)
    if (stepper.id === 'review') return
    if (await form.trigger(STEP_FIELDS[stepper.id])) void stepper.next()
  }

  const steps: Record<Step, ReactNode> = {
    about: <AboutStep control={form.control} />,
    health: <HealthStep control={form.control} />,
    photos: <PhotosStep control={form.control} />,
    story: <StoryStep control={form.control} />,
    review: <ReviewStep control={form.control} />,
  }

  return (
    <div className={cn(PANEL_SURFACE, 'p-5 sm:p-8')}>
      <AnimalFormProgress />
      <h2
        key={stepper.id}
        data-step={stepper.id}
        ref={focusHeading}
        tabIndex={-1}
        className="mt-6 scroll-mt-6 rounded-sm text-2xl font-bold tracking-tight text-balance outline-none sm:text-3xl"
      >
        {t(`steps.${stepper.id}`)}
      </h2>
      <p className="mt-2 mb-8 max-w-prose text-pretty text-muted-foreground">
        {t(`intro.${stepper.id}`)}
      </p>

      <form
        noValidate
        onSubmit={(event) => {
          event.preventDefault()
          if (stepper.id === 'review') void submitFull(isDraft)
          else void next()
        }}
      >
        {steps[stepper.id]}

        <p aria-live="polite" className="mt-6 min-h-5 text-sm font-semibold">
          {saved && !save.isPending && t(isDraft ? 'savedDraft' : 'saved')}
          {save.isError && <span className="text-destructive">{t('saveError')}</span>}
        </p>

        <div className="mt-4 flex flex-col-reverse gap-3 border-t border-border pt-6 sm:flex-row sm:items-center">
          {!stepper.isFirst && (
            <Button type="button" variant="outline" onClick={() => void stepper.prev()}>
              <ArrowLeftIcon aria-hidden />
              {t('back')}
            </Button>
          )}
          <div className="flex flex-col-reverse gap-3 sm:ml-auto sm:flex-row">
            {(isDraft || stepper.id !== 'review') && (
              <Button
                type="button"
                variant="outline"
                size="lg"
                disabled={save.isPending}
                onClick={() => void (isDraft ? saveDraft() : submitFull(false))}
              >
                {isDraft ? t('saveDraft') : t('saveChanges')}
              </Button>
            )}
            <Button type="submit" size="lg" disabled={save.isPending} aria-busy={save.isPending}>
              {save.isPending && <Spinner />}
              {stepper.id !== 'review' ? t('continue') : isDraft ? t('publish') : t('saveChanges')}
              {stepper.id !== 'review' && <ArrowRightIcon aria-hidden />}
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}
