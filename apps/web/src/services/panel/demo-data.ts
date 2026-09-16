import { DEMO_ANIMALS } from '../animals/demo-data'
import type { AdopterProfile } from '../applications/types'
import { DEMO_ACCOUNT_PROFILE } from '../applications/demo-data'
import { DEMO_ORGANIZATIONS } from '../organizations/demo-data'
import type { ManagedAnimal, ManagedApplication } from './types'

/*
 * O painel de demonstração antes da API: quem entra vê o Coletivo Focinho Gelado (FR-045,
 * FR-030). Adotantes, respostas e histórico são inventados; os CPFs têm dígitos válidos e os
 * e-mails usam o domínio reservado example.org.
 */

export const PANEL_ORGANIZATION = DEMO_ORGANIZATIONS.focinho

const TEAM = { ana: 'Ana Luíza', bruno: 'Bruno Teixeira' }

/** Os animais da organização na vitrine, mais o rascunho que ainda não foi publicado. */
export function demoAnimals(): ManagedAnimal[] {
  const published: ManagedAnimal[] = DEMO_ANIMALS.filter(
    (animal) => animal.organization.slug === PANEL_ORGANIZATION.slug,
  ).map((animal) => ({
    ...animal,
    photos: [...animal.photos],
    updatedAt: `${animal.publishedAt}T10:00:00-03:00`,
    history: [
      { at: `${animal.publishedAt}T10:00:00-03:00`, from: null, to: 'draft', by: TEAM.ana },
      { at: `${animal.publishedAt}T10:05:00-03:00`, from: 'draft', to: 'available', by: TEAM.ana },
      ...(animal.status === 'in-process'
        ? [
            {
              at: '2026-11-08T16:20:00-03:00',
              from: 'available' as const,
              to: 'in-process' as const,
              by: TEAM.bruno,
            },
          ]
        : []),
    ],
  }))

  return [
    ...published,
    {
      id: 'tobias',
      name: 'Tobias',
      species: 'dog',
      sex: 'male',
      ageGroup: 'puppy',
      bornAround: '2026-07',
      size: 'medium',
      coat: 'short',
      status: 'draft',
      city: PANEL_ORGANIZATION.city,
      organization: {
        slug: PANEL_ORGANIZATION.slug,
        name: PANEL_ORGANIZATION.name,
        city: PANEL_ORGANIZATION.city,
      },
      publishedAt: null,
      updatedAt: '2026-11-11T18:30:00-03:00',
      goodWith: { children: 'untested', dogs: 'yes', cats: 'untested' },
      health: { castrated: false, vaccinated: true, dewormed: true },
      photos: [],
      story: 'Chegou da feira de domingo, ainda tímido. Falta a castração e as fotos.',
      fee: null,
      history: [{ at: '2026-11-11T18:30:00-03:00', from: null, to: 'draft', by: TEAM.bruno }],
    },
  ]
}

/** Um perfil a partir do da conta de exemplo, trocando o que muda de pessoa para pessoa. */
function profile(
  applicant: AdopterProfile['applicant'],
  overrides: Partial<{ [K in keyof AdopterProfile]: Partial<AdopterProfile[K]> }> = {},
): AdopterProfile {
  const base = DEMO_ACCOUNT_PROFILE
  return {
    applicant,
    home: { ...base.home, ...overrides.home },
    pets: { ...base.pets, ...overrides.pets },
    routine: { ...base.routine, ...overrides.routine },
    reasons: { ...base.reasons, ...overrides.reasons },
  }
}

const sent = (at: string) => ({ kind: 'sent' as const, at })

type DemoApplication = Omit<ManagedApplication, 'incidents'> &
  Partial<Pick<ManagedApplication, 'incidents'>>

export function demoApplications(): ManagedApplication[] {
  const applications: DemoApplication[] = [
    {
      id: 'c-ana-nuvem',
      animalId: 'nuvem',
      email: 'ana.ribeiro@example.org',
      profile: profile(
        { name: 'Ana Clara Ribeiro', cpf: '286.475.031-71', phone: '(31) 99812-4410' },
        {
          home: { housing: 'apartment', yard: 'no', children: 'no', childrenAges: '' },
          pets: { pets: 'Um gato de 9 anos, o Tostão.' },
          reasons: { why: 'O Tostão adotado há 6 anos no Coletivo precisa de companhia.' },
        },
      ),
      answers: { visita: 'yes', conheceu: 'Indicação de alguém' },
      stage: 'received',
      awaitingAdopter: false,
      badges: ['verified', 'approved-adopter'],
      verifiedAccount: true,
      otherActive: 0,
      sentAt: '2026-11-10T21:02:00-03:00',
      movedAt: null,
      history: [sent('2026-11-10T21:02:00-03:00')],
    },
    {
      id: 'c-marina-caramelo',
      animalId: 'caramelo',
      email: 'marina.duarte@example.org',
      profile: DEMO_ACCOUNT_PROFILE,
      answers: { visita: 'yes', conheceu: 'Instagram' },
      stage: 'received',
      awaitingAdopter: false,
      badges: ['new'],
      verifiedAccount: true,
      otherActive: 0,
      sentAt: '2026-11-11T19:40:00-03:00',
      movedAt: null,
      history: [sent('2026-11-11T19:40:00-03:00')],
    },
    {
      id: 'c-joao-frajola',
      animalId: 'frajola',
      email: 'joao.almeida@example.org',
      profile: profile(
        { name: 'João Pedro Almeida', cpf: '734.190.562-06', phone: '(31) 98455-0921' },
        {
          home: { housing: 'apartment', ownership: 'rent', landlordAllows: 'yes', yard: 'no' },
          pets: { hasPets: 'no', pets: '', petsCared: null },
        },
      ),
      answers: { visita: 'yes', conheceu: 'Feira de adoção' },
      stage: 'received',
      awaitingAdopter: false,
      badges: ['new'],
      verifiedAccount: false,
      otherActive: 1,
      sentAt: '2026-11-11T22:15:00-03:00',
      movedAt: null,
      history: [sent('2026-11-11T22:15:00-03:00')],
    },
    {
      id: 'c-lucas-algodao',
      animalId: 'algodao',
      email: 'lucas.ferreira@example.org',
      profile: profile(
        { name: 'Lucas Ferreira', cpf: '415.862.903-98', phone: '(31) 99120-7734' },
        { routine: { hoursAlone: 'over-8' } },
      ),
      answers: { visita: 'no', conheceu: 'Outro' },
      stage: 'received',
      awaitingAdopter: false,
      badges: ['attention'],
      verifiedAccount: true,
      otherActive: 2,
      sentAt: '2026-11-09T13:30:00-03:00',
      movedAt: null,
      history: [sent('2026-11-09T13:30:00-03:00')],
      incidents: [
        {
          category: 'return-without-notice',
          outcome: 'minor',
          decidedIn: '2026-03',
          validUntil: '2027-03',
        },
      ],
    },
    {
      id: 'c-beatriz-seu-chico',
      animalId: 'seu-chico',
      email: 'beatriz.costa@example.org',
      profile: profile(
        { name: 'Beatriz Costa', cpf: '903.217.648-03', phone: '(31) 98701-3388' },
        { home: { screens: 'no' }, pets: { hasPets: 'no', pets: '', petsCared: null } },
      ),
      answers: { visita: 'yes', conheceu: 'Instagram' },
      stage: 'reviewing',
      awaitingAdopter: true,
      badges: ['new'],
      verifiedAccount: true,
      otherActive: 0,
      sentAt: '2026-11-06T10:12:00-03:00',
      movedAt: null,
      history: [
        sent('2026-11-06T10:12:00-03:00'),
        { kind: 'moved', at: '2026-11-07T09:30:00-03:00', to: 'reviewing', by: TEAM.ana },
        {
          kind: 'info-requested',
          at: '2026-11-07T09:34:00-03:00',
          by: TEAM.ana,
          message:
            'Oi, Beatriz! Você comentou que ainda não tem telas. Pretende instalar antes do Seu Chico chegar?',
        },
      ],
    },
    {
      id: 'c-carlos-frajola',
      animalId: 'frajola',
      email: 'carlos.lima@example.org',
      profile: profile(
        { name: 'Carlos Eduardo Lima', cpf: '652.081.374-53', phone: '(31) 99654-2210' },
        { home: { children: 'no', childrenAges: '' } },
      ),
      answers: { visita: 'yes', conheceu: 'Feira de adoção' },
      stage: 'reviewing',
      awaitingAdopter: false,
      badges: ['new'],
      verifiedAccount: false,
      otherActive: 0,
      sentAt: '2026-11-05T17:48:00-03:00',
      movedAt: null,
      history: [
        sent('2026-11-05T17:48:00-03:00'),
        { kind: 'moved', at: '2026-11-06T11:00:00-03:00', to: 'reviewing', by: TEAM.bruno },
        {
          kind: 'info-requested',
          at: '2026-11-06T11:02:00-03:00',
          by: TEAM.bruno,
          message: 'Quem cuida da Frajola quando você viaja a trabalho?',
        },
        {
          kind: 'info-answered',
          at: '2026-11-06T20:15:00-03:00',
          message: 'Minha irmã mora no mesmo prédio e já cuida das plantas quando eu viajo.',
        },
      ],
    },
    {
      id: 'c-fernanda-nuvem',
      animalId: 'nuvem',
      email: 'fernanda.oliveira@example.org',
      profile: profile(
        { name: 'Fernanda Oliveira', cpf: '529.982.247-25', phone: '(31) 98233-9087' },
        { home: { children: 'no', childrenAges: '' } },
      ),
      answers: { visita: 'yes', conheceu: 'Instagram' },
      stage: 'interview',
      awaitingAdopter: false,
      badges: ['verified'],
      verifiedAccount: true,
      otherActive: 2,
      sentAt: '2026-11-01T14:05:00-03:00',
      movedAt: null,
      history: [
        sent('2026-11-01T14:05:00-03:00'),
        { kind: 'moved', at: '2026-11-03T09:10:00-03:00', to: 'reviewing', by: TEAM.ana },
        { kind: 'moved', at: '2026-11-05T15:40:00-03:00', to: 'interview', by: TEAM.ana },
      ],
    },
    {
      id: 'c-rafael-caramelo',
      animalId: 'caramelo',
      email: 'rafael.moreira@example.org',
      profile: profile(
        { name: 'Rafael Moreira', cpf: '178.349.025-04', phone: '(31) 99377-6012' },
        { pets: { pets: 'Uma vira-lata de 6 anos, a Pituca.' } },
      ),
      answers: { visita: 'yes', conheceu: 'Indicação de alguém' },
      stage: 'approved',
      awaitingAdopter: false,
      badges: ['verified', 'approved-adopter'],
      verifiedAccount: true,
      otherActive: 0,
      sentAt: '2026-10-20T08:30:00-03:00',
      movedAt: null,
      history: [
        sent('2026-10-20T08:30:00-03:00'),
        { kind: 'moved', at: '2026-10-21T10:00:00-03:00', to: 'reviewing', by: TEAM.bruno },
        { kind: 'moved', at: '2026-10-28T19:00:00-03:00', to: 'interview', by: TEAM.bruno },
        { kind: 'moved', at: '2026-11-08T16:20:00-03:00', to: 'approved', by: TEAM.bruno },
      ],
    },
    {
      id: 'c-juliana-algodao',
      animalId: 'algodao',
      email: 'juliana.martins@example.org',
      profile: profile(
        { name: 'Juliana Martins', cpf: '340.956.187-01', phone: '(31) 98810-4467' },
        { home: { housing: 'apartment', yard: 'no' } },
      ),
      answers: { visita: 'yes', conheceu: 'Instagram' },
      stage: 'refused',
      awaitingAdopter: false,
      badges: ['new'],
      verifiedAccount: true,
      otherActive: 0,
      sentAt: '2026-10-15T12:00:00-03:00',
      movedAt: null,
      history: [
        sent('2026-10-15T12:00:00-03:00'),
        { kind: 'moved', at: '2026-10-16T09:00:00-03:00', to: 'reviewing', by: TEAM.ana },
        {
          kind: 'refused',
          at: '2026-10-17T14:30:00-03:00',
          by: TEAM.ana,
          reason:
            'Apartamento sem área externa; o Algodão precisa de quintal e não convive com cães.',
          message:
            'Juliana, obrigada pelo carinho com o Algodão. Ele precisa de um quintal grande, então não vamos seguir com esta candidatura. Que tal conhecer os gatos do Coletivo?',
        },
      ],
    },
    {
      id: 'c-thiago-seu-chico',
      animalId: 'seu-chico',
      email: 'thiago.santos@example.org',
      profile: profile({ name: 'Thiago Santos', cpf: '821.573.409-04', phone: '(31) 99001-5528' }),
      answers: { visita: 'no', conheceu: 'Outro' },
      stage: 'withdrawn',
      awaitingAdopter: false,
      badges: ['new'],
      verifiedAccount: false,
      otherActive: 0,
      sentAt: '2026-10-10T18:22:00-03:00',
      movedAt: null,
      history: [
        sent('2026-10-10T18:22:00-03:00'),
        { kind: 'withdrawn', at: '2026-10-12T08:05:00-03:00' },
      ],
    },
  ]
  return applications.map((application) => ({
    ...application,
    incidents: application.incidents ?? [],
  }))
}
