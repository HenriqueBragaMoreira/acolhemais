import type { AdopterProfile } from './index'

/*
 * Dados fictícios da candidatura, para a demonstração antes da API (FR-041, FR-042). A pessoa e o
 * CPF são inventados; os CPFs abaixo têm dígitos válidos e são os usados em exemplos de teste.
 */

/** O perfil salvo da conta de exemplo, que entra com qualquer e-mail e senha. */
export const DEMO_ACCOUNT_PROFILE: AdopterProfile = {
  applicant: { name: 'Marina Duarte', cpf: '111.444.777-35', phone: '(19) 98765-4321' },
  home: {
    housing: 'house',
    ownership: 'own',
    landlordAllows: null,
    yard: 'yes',
    screens: 'yes',
    adults: '2',
    children: 'yes',
    childrenAges: '7 e 10 anos',
    everyoneAgrees: 'yes',
  },
  pets: {
    hasPets: 'yes',
    pets: 'Uma gata de 4 anos, a Mel.',
    petsCared: 'yes',
    hadPets: 'yes',
    pastPets: 'Tivemos um cão por 14 anos; ele morreu de velhice.',
  },
  routine: {
    hoursAlone: '2-to-4',
    whereStays: 'Dentro de casa, com acesso ao quintal.',
    travelCare: 'Meus pais, que moram a duas quadras.',
    awareOfCosts: 'yes',
  },
  reasons: {
    why: 'As crianças cresceram com a nossa cachorra e a casa ficou vazia sem ela.',
    ifMoving: 'O animal vai junto; só alugamos onde aceitam animais.',
    ifBehavior: 'Procuramos um adestrador e a orientação da organização.',
  },
}

/**
 * Candidaturas ativas por CPF (só dígitos). A conta de exemplo já se candidatou ao Caramelo
 * (BR-075); o segundo CPF chegou ao limite (BR-074).
 */
export const DEMO_ACTIVE_APPLICATIONS: Record<string, string[]> = {
  '11144477735': ['caramelo'],
  '52998224725': ['barao', 'nuvem', 'pingo'],
}
