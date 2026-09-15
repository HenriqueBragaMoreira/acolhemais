# Requisitos — Web

Status e escopo da interface (`apps/web`, `packages/ui`). A definição de cada item está em
[../REQUIREMENTS.md](../REQUIREMENTS.md); aqui fica só o que cabe à web. Item ausente = ainda sem
escopo definido para a web; ao refinar, adicione-o aqui.

#### FR-001: Entrar com e-mail e senha

- **Status**: `implemented`
- **Escopo (web)**: `/entrar` com e-mail e senha (react-hook-form + zod), erro da API no
  formulário, espera do bloqueio a partir do `Retry-After`. Link "Esqueci a senha" (FR-004); sem
  "criar conta" até FR-002.

#### FR-002: Criar conta com e-mail e senha

- **Status**: `draft`
- **Escopo (web)**: tela de cadastro, junto com o perfil do adotante (Fase 2).

#### FR-003: Verificar o e-mail

- **Status**: `implemented`
- **Escopo (web)**: em `/entrar`, a recusa `EMAIL_NOT_VERIFIED` avisa que o link foi reenviado;
  a volta do link (`/entrar?verificado=1`, ou com `error`) mostra se o e-mail foi confirmado
  (`SignInNotice`). E2E com axe.

#### FR-004: Redefinir a senha

- **Status**: `implemented`
- **Escopo (web)**: link "Esqueci a senha" em `/entrar`; `/esqueci-a-senha` (pede o e-mail, sempre
  responde que, se houver conta, o link foi enviado); `/redefinir-senha?token=` (nova senha com
  as regras de BR-001; serve também ao primeiro acesso; sem referrer, porque o token vai na URL),
  que volta para `/entrar?senha=redefinida`. E2E com axe.

#### FR-005: Entrar com Google

- **Status**: `implemented`
- **Escopo (web)**: botão do Google só quando `GET /auth/providers` diz que está ligado.

#### FR-006: Código 2FA no login

- **Status**: `implemented`
- **Escopo (web)**: `/entrar/2fa` com código de 6 dígitos e alternativa por código de
  recuperação, os dois com a caixa "confiar neste dispositivo por 30 dias", desmarcada por padrão
  e mantida ao trocar de método. O código confere no "Confirmar" (sem envio ao completar os
  dígitos, para a caixa ficar ao alcance). E2E com axe.

#### FR-007: Gerenciar a própria conta

- **Status**: `draft`
- **Escopo (web)**: telas para ativar o 2FA (QR + confirmação + códigos), trocar senha, vínculos
  e sessões.

#### FR-008: Painel mínimo e sair

- **Status**: `implemented`
- **Escopo (web)**: `/painel` (nome, e-mail, 2FA, Sair) e `src/proxy.ts` mandando quem não tem
  sessão para `/entrar`.

#### FR-010: Gerenciar usuários (equipe da plataforma)

- **Status**: `draft`
- **Escopo (web)**: área da equipe (Fase 1).

#### FR-012: Consultar a auditoria

- **Status**: `draft`
- **Escopo (web)**: lista com filtros na área da equipe (Fase 1).

#### FR-013: Consultar e alterar os parâmetros da plataforma

- **Status**: `draft`
- **Escopo (web)**: formulário dos parâmetros com limites e unidades do catálogo (Fase 1).

#### FR-026: Página pública da organização

- **Status**: `in-progress`
- **Escopo (web)**: `/ong/{slug}` com a capa a toda a largura (sem foto, uma faixa na cor
  secundária) e, ancorados na borda dela, o painel de identidade na cor primária da organização
  (iniciais, nome, cidade, sobre, cidades de atuação, WhatsApp, e-mail e Instagram) e o painel
  "Doe por PIX" (BR-049). Abaixo, a mesma busca e galeria da página inicial, só com os animais
  dela, com os filtros no endereço da página. Slug antigo leva ao atual (BR-047); encerrada
  mostra só o aviso (BR-044); suspensa e inexistente, "não encontrada" (BR-043). Pronto com
  dados fictícios em `services/organizations` (capas do Unsplash); falta ler a API e o logo
  enviado (hoje, as iniciais). E2E com axe.

#### FR-050: Vitrine nacional

- **Status**: `in-progress`
- **Escopo (web)**: `/` com o topo sobre a ilustração do caramelo (título e busca: cidade com
  sugestões, espécie, "Mais filtros" com sexo, idade, porte, convive com e castrado) e a galeria
  de cartões 4:5 em fundo areia, até 5 colunas, com "Ver mais animais".
  Filtros e ordem ficam no endereço. `/animais/{id}`: fotos com miniaturas, dados, taxa,
  organização, história, convivência e saúde, "Quero adotar" (barra fixa no celular),
  compartilhar (WhatsApp e copiar link), mais animais da organização e parecidos de outras.
  Pronto com dados fictícios em `services/animals` (fotos do Unsplash, para a demonstração);
  falta ler a API. E2E com axe.

#### FR-041: Candidatar-se com conta

- **Status**: `in-progress`
- **Escopo (web)**: `/animais/{id}/candidatura` em etapas (Stepperize, react-hook-form e zod):
  quem é você, seus dados, sua casa, outros animais, rotina e custos, por que adotar, perguntas
  da organização e revisão com "Editar" por parte. Com conta, o perfil salvo preenche o
  questionário e a pessoa segue direto para as perguntas da organização. Depois de enviar: o
  caminho da candidatura (BR-076), o WhatsApp da organização e "como aumentar as suas chances".
  Pronto com dados fictícios em `services/applications` (qualquer e-mail e senha entram na conta
  de exemplo); falta a API e a sessão real. E2E com axe.

#### FR-042: Candidatar-se sem conta

- **Status**: `in-progress`
- **Escopo (web)**: na primeira etapa, "Primeira vez no Acolhe+" confirma o e-mail com um código
  de 6 dígitos e segue para nome, CPF (BR-071) e telefone opcional. Na demonstração qualquer
  código vale e não há Turnstile. A união com a conta (FR-043, Q-032) e as dúvidas do CPF
  (Q-033, Q-034) seguem em aberto e não mudam a tela.

#### FR-044: Perguntas extras da organização

- **Status**: `in-progress`
- **Escopo (web)**: a etapa "Perguntas da organização" mostra as perguntas dela (sim/não,
  múltipla escolha, texto), todas obrigatórias; sem perguntas, avisa e segue. Falta o cadastro e
  o versionamento no painel da organização.

#### FR-031: Fotos e vídeo do animal

- **Status**: `in-progress`
- **Escopo (web)**: na página do animal, a capa e as demais fotos com miniaturas e setas,
  "Ampliar a foto" na tela inteira (setas do teclado, Esc fecha), a sensível desfocada até o
  clique (BR-061) e o link do vídeo quando houver. Falta o envio e a
  ordenação das fotos no cadastro (painel da organização).

#### FR-053: Página "Sobre"

- **Status**: `implemented`
- **Escopo (web)**: `/sobre` com o projeto, como funciona para adotantes e organizações, a
  adoção responsável, o código aberto e "Como ajudar" (WhatsApp e e-mail do mantenedor). Índice
  "Nesta página" e títulos-link: cada seção tem endereço próprio para compartilhar
  (`/sobre#como-ajudar`). E2E com axe.

---

#### NFR-006: Headers de segurança

- **Status**: `draft`
- **Escopo (web)**: CSP estrita, HSTS e `frame-ancestors` no Next.

#### NFR-011: Acessibilidade WCAG 2.1 AA

- **Status**: `implemented`
- **Escopo (web)**: axe no E2E das telas de acesso, do painel e da vitrine `/dev/ui`; foco com
  contorno sólido, alvos de 40 px ou mais.

#### NFR-012: Textos em português e traduzíveis

- **Status**: `implemented`
- **Escopo (web)**: next-intl com `messages/pt-BR.json`; mensagens de erro da API mapeadas por
  `code`.

#### NFR-021: Navegadores

- **Status**: `in-progress`
- **Escopo (web)**: E2E em Chromium (1440×900 e Pixel 7); Firefox e WebKit antes do beta.
