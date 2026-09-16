import type { OrganizationProfile } from './types'

/*
 * Organizações fictícias da demonstração antes da API (FR-026). Nomes, textos e contatos são
 * inventados: e-mails e chaves PIX usam o domínio reservado example.org ou chaves aleatórias,
 * que não pertencem a ninguém. As capas são do Unsplash (public/demo/organizacoes/PROVENIENCIA.md).
 */

const cover = (file: string, focus: string) => ({ src: `/demo/organizacoes/${file}`, focus })

export const DEMO_ORGANIZATIONS = {
  focinho: {
    slug: 'coletivo-focinho-gelado',
    previousSlugs: [],
    name: 'Coletivo Focinho Gelado',
    city: 'Belo Horizonte, MG',
    serves: ['Belo Horizonte', 'Contagem', 'Betim'],
    status: 'active',
    colors: { primary: '#2a9d8f', secondary: '#e9c46a' },
    cover: cover('capa-focinho-gelado.jpg', '50% 45%'),
    about:
      'Somos voluntários que resgatam cães e gatos das ruas de BH. Cada animal passa por um lar temporário, é castrado e vacinado antes da adoção, e a gente acompanha a família nos primeiros meses.',
    contact: {
      whatsapp: '5531987650101',
      email: 'contato@focinhogelado.example.org',
      instagram: 'coletivofocinhogelado.demo',
    },
    pix: { key: 'doacoes@focinhogelado.example.org', type: 'email' },
    questions: [
      {
        id: 'visita',
        type: 'yes-no',
        label: 'Você aceita uma visita de um voluntário antes da adoção?',
      },
      {
        id: 'conheceu',
        type: 'choice',
        label: 'Como conheceu o Coletivo?',
        options: ['Instagram', 'Indicação de alguém', 'Feira de adoção', 'Outro'],
      },
    ],
  },
  bigode: {
    slug: 'abrigo-cantinho-do-bigode',
    previousSlugs: ['cantinho-do-bigode'],
    name: 'Abrigo Cantinho do Bigode',
    city: 'Campinas, SP',
    serves: ['Campinas', 'Hortolândia', 'Sumaré'],
    status: 'active',
    colors: { primary: '#6d3fa0', secondary: '#f4a896' },
    cover: cover('capa-cantinho-do-bigode.jpg', '50% 75%'),
    about:
      'Abrigo mantido por doações e por uma equipe de voluntários. Recebemos principalmente gatos adultos e cães idosos, que costumam esperar mais por uma família.',
    contact: {
      whatsapp: '5519987650202',
      email: 'adocao@cantinhodobigode.example.org',
      instagram: 'cantinhodobigode.demo',
    },
    pix: { key: 'doacoes@cantinhodobigode.example.org', type: 'email' },
    questions: [
      {
        id: 'janelas',
        type: 'yes-no',
        label: 'Se adotar um gato, você instala telas em todas as janelas antes de ele chegar?',
      },
      { id: 'idosos', type: 'yes-no', label: 'Você consideraria adotar um animal idoso?' },
      {
        id: 'veterinario',
        type: 'text',
        label: 'Já tem um veterinário de confiança perto de casa? Qual?',
      },
    ],
  },
  ilha: {
    slug: 'projeto-patinhas-da-ilha',
    previousSlugs: [],
    name: 'Projeto Patinhas da Ilha',
    city: 'Florianópolis, SC',
    serves: ['Florianópolis', 'São José', 'Palhoça'],
    status: 'active',
    colors: { primary: '#1d4e89', secondary: '#8fd3c8' },
    cover: cover('capa-patinhas-da-ilha.jpg', '50% 60%'),
    about:
      'Resgatamos animais abandonados nas praias e nos bairros da ilha. Os resgatados ficam em lares temporários até a adoção, e as feiras de adoção acontecem no último sábado do mês.',
    contact: { whatsapp: '5548987650303', email: 'ola@patinhasdailha.example.org' },
    pix: { key: '7d2f4c1a-9b3e-4f6a-8c5d-2e1b0a9f8c7d', type: 'random' },
    questions: [
      {
        id: 'feira',
        type: 'choice',
        label: 'Consegue ir a uma feira de adoção para conhecer o animal antes?',
        options: ['Sim', 'Prefiro uma visita do projeto', 'Não consigo'],
      },
      {
        id: 'acompanhamento',
        type: 'yes-no',
        label: 'Topa mandar fotos do animal nos primeiros meses?',
      },
    ],
  },
  cida: {
    slug: 'lar-da-cida',
    previousSlugs: [],
    name: 'Lar da Cida',
    city: 'Goiânia, GO',
    serves: ['Goiânia', 'Aparecida de Goiânia'],
    status: 'active',
    colors: null,
    cover: null,
    about:
      'Sou a Cida, protetora independente. Cuido dos animais na minha casa até cada um encontrar uma família, com a ajuda dos vizinhos para a ração e o veterinário.',
    contact: { whatsapp: '5562987650404' },
    pix: { key: '3b9e6a2d-5c71-4e08-a4f2-9d6c1b7e0a53', type: 'random' },
    questions: [
      {
        id: 'busca',
        type: 'yes-no',
        label: 'Você consegue buscar o animal aqui em casa, em Goiânia?',
      },
      { id: 'conte', type: 'text', label: 'Conte um pouco da sua casa para a Cida.' },
    ],
  },
  suspensa: {
    slug: 'protetores-do-vale',
    previousSlugs: [],
    name: 'Protetores do Vale',
    city: 'São José dos Campos, SP',
    serves: ['São José dos Campos'],
    status: 'suspended',
    colors: null,
    cover: null,
    about: '',
    contact: {},
    pix: null,
    questions: [],
  },
  amigos: {
    slug: 'grupo-amigos-de-pata',
    previousSlugs: [],
    name: 'Grupo Amigos de Pata',
    city: 'Recife, PE',
    serves: ['Recife'],
    status: 'closed',
    colors: null,
    cover: null,
    about: '',
    contact: {},
    pix: null,
    questions: [],
  },
} satisfies Record<string, OrganizationProfile>
