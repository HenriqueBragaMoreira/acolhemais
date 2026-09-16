import { useTranslations } from 'next-intl'
import type { AdopterProfile } from '@/services/applications'
import type { OrganizationQuestion } from '@/services/organizations'

export type AnswerRow = [label: string, value: string | null | undefined]

export type AnswerPart = 'applicant' | 'home' | 'pets' | 'routine' | 'reasons' | 'organization'

/**
 * As respostas da candidatura por parte, como rótulo e valor: a mesma leitura na revisão do
 * adotante e na ficha da organização (BR-070). Partes sem nenhuma linha ficam de fora.
 */
export function useAdopterAnswers({
  email,
  profile,
  answers,
  questions,
  animalName,
  cpf = profile.applicant.cpf,
}: {
  email: string
  profile: AdopterProfile
  answers: Record<string, string>
  questions: OrganizationQuestion[]
  animalName: string
  /** A ficha da organização passa o CPF mascarado (BR-085). */
  cpf?: string
}) {
  const t = useTranslations('Application')
  const yesNo = (value: string | null) => (value ? t(value === 'yes' ? 'yes' : 'no') : null)
  const { applicant, home, pets, routine, reasons } = profile

  const parts: { part: AnswerPart; rows: AnswerRow[] }[] = [
    {
      part: 'applicant',
      rows: [
        [t('applicant.name'), applicant.name],
        [t('applicant.emailLabel'), email],
        [t('applicant.cpf'), cpf],
        [t('applicant.phone'), applicant.phone || t('review.empty')],
      ],
    },
    {
      part: 'home',
      rows: [
        [t('home.housing'), home.housing && t(`home.housingValue.${home.housing}`)],
        [t('home.ownership'), home.ownership && t(`home.ownershipValue.${home.ownership}`)],
        ...(home.ownership === 'rent'
          ? ([[t('home.landlordAllows'), yesNo(home.landlordAllows)]] as AnswerRow[])
          : []),
        [t('home.yard'), yesNo(home.yard)],
        [t('home.screens'), yesNo(home.screens)],
        [t('home.adults'), home.adults],
        [t('home.children'), home.children === 'yes' ? home.childrenAges : yesNo(home.children)],
        [t('home.everyoneAgrees'), yesNo(home.everyoneAgrees)],
      ],
    },
    {
      part: 'pets',
      rows: [
        [t('pets.hasPets'), pets.hasPets === 'yes' ? pets.pets : yesNo(pets.hasPets)],
        ...(pets.hasPets === 'yes'
          ? ([[t('pets.petsCared'), yesNo(pets.petsCared)]] as AnswerRow[])
          : []),
        [t('pets.hadPets'), pets.hadPets === 'yes' ? pets.pastPets : yesNo(pets.hadPets)],
      ],
    },
    {
      part: 'routine',
      rows: [
        [
          t('routine.hoursAlone'),
          routine.hoursAlone && t(`routine.hoursAloneValue.${routine.hoursAlone}`),
        ],
        [t('routine.whereStays'), routine.whereStays],
        [t('routine.travelCare'), routine.travelCare],
        [t('routine.awareOfCosts'), yesNo(routine.awareOfCosts)],
      ],
    },
    {
      part: 'reasons',
      rows: [
        [t('reasons.why', { name: animalName }), reasons.why],
        [t('reasons.ifMoving'), reasons.ifMoving],
        [t('reasons.ifBehavior'), reasons.ifBehavior],
      ],
    },
    {
      part: 'organization',
      rows: questions.map((question): AnswerRow => [
        question.label,
        question.type === 'yes-no' ? yesNo(answers[question.id] ?? null) : answers[question.id],
      ]),
    },
  ]

  return parts.filter((part) => part.rows.length > 0)
}
