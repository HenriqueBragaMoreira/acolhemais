# Requisitos

Definição de **o que** o Acolhe+ faz. As regras de negócio ficam em
[BUSINESS-RULES.md](BUSINESS-RULES.md), as decisões pendentes em
[OPEN-QUESTIONS.md](OPEN-QUESTIONS.md) e o status por camada em [api/](api/) e [web/](web/).

## Status

| Status        | Significado                                                     |
| ------------- | --------------------------------------------------------------- |
| `draft`       | Escrito, mas ainda vago ou com questão em aberto                |
| `refined`     | Revisado e esclarecido pelo mantenedor, pronto para implementar |
| `in-progress` | Em implementação (ou pronto só em parte das camadas)            |
| `implemented` | Código pronto em todas as camadas, aguardando revisão           |
| `verified`    | Revisado e aprovado — **só o mantenedor marca**                 |
| `deferred`    | Adiado de propósito                                             |
| `cancelled`   | Não vale mais; mantido como histórico                           |

O status daqui é o **agregado do sistema**: só sobe quando todas as camadas com escopo no item
chegam ao mesmo nível (ver os docs de cada camada). Itens sem camada (CI, repositório, deploy)
têm o status só aqui. **Fase** é a do roadmap ([PLANO](PLANO.md) §6).

---

## Requisitos funcionais

### Contas e acesso

#### FR-001: Entrar com e-mail e senha

- **Status**: `implemented`
- **Fase**: 0
- **Descrição**: Qualquer pessoa com conta entra com e-mail e senha e recebe um cookie de sessão
  seguro. Erros em português, sem revelar se o e-mail existe.
- **Regras**: BR-001, BR-002, BR-003

#### FR-002: Criar conta com e-mail e senha

- **Status**: `in-progress`
- **Fase**: 0 (API) / 2 (tela, com o perfil do adotante)
- **Descrição**: Cadastro com nome, e-mail e senha. Senha recusada se curta ou vazada.
- **Regras**: BR-001, BR-007

#### FR-003: Verificar o e-mail

- **Status**: `refined`
- **Fase**: 0 (pendência antes de produção)
- **Descrição**: E-mail com link de verificação no cadastro; reenvio sob demanda e a cada
  tentativa de login sem e-mail verificado, que é recusada.
- **Regras**: BR-007
- **Depende de**: FR-080

#### FR-004: Redefinir a senha

- **Status**: `draft`
- **Fase**: 0 (pendência antes de produção)
- **Descrição**: "Esqueci a senha" envia link por e-mail; a nova senha segue BR-001, derruba as
  outras sessões (BR-006) e zera o bloqueio progressivo (BR-002).
- **Regras**: BR-001, BR-002, BR-006
- **Depende de**: FR-080

#### FR-005: Entrar com Google

- **Status**: `implemented`
- **Fase**: 0
- **Descrição**: Login pelo Google, opcional (só liga com as credenciais configuradas). A tela
  só mostra o botão quando o provedor está ligado.
- **Regras**: BR-004, BR-005

#### FR-006: Código 2FA no login

- **Status**: `in-progress`
- **Fase**: 0
- **Descrição**: Quem tem 2FA ativo informa o código TOTP (ou um código de recuperação) depois
  da senha ou do Google; a sessão só abre com ele. Caixa "confiar neste dispositivo por 30
  dias", desmarcada por padrão, para todos.
- **Regras**: BR-005, BR-009

#### FR-007: Gerenciar a própria conta

- **Status**: `in-progress`
- **Fase**: 0 (API) / 1 (telas)
- **Descrição**: Ativar e desativar o 2FA, gerar novos códigos de recuperação, trocar a senha,
  vincular e desvincular o Google e encerrar sessões. Cada ação de segurança vai para a
  auditoria.
- **Regras**: BR-009, BR-023

#### FR-008: Painel mínimo e sair

- **Status**: `implemented`
- **Fase**: 0
- **Descrição**: Depois do login, `/painel` mostra nome, e-mail e situação do 2FA, com "Sair".
  Sem sessão, a área logada manda para `/entrar`.

### Equipe da plataforma

#### FR-010: Gerenciar usuários (equipe da plataforma)

- **Status**: `in-progress`
- **Fase**: 0 (API) / 1 (telas)
- **Descrição**: A equipe lista e consulta usuários; o superadmin cria contas sem senha (com
  e-mail de primeiro acesso), corrige nome e foto, dá e tira `moderator` e `support`, bane e
  desbane, e encerra sessões. Ninguém entra como outro usuário, remove contas nem mexe no papel
  `superadmin` pela API.
- **Regras**: BR-008, BR-010 a BR-016
- **Depende de**: FR-080 (e-mail de primeiro acesso)

#### FR-011: Gerenciar superadmins pela linha de comando

- **Status**: `in-progress`
- **Fase**: 0
- **Descrição**: `pnpm auth:create-admin` cria uma conta com papel da plataforma, sem tela nem
  rota pública (pronto). Dar e tirar o papel `superadmin` de uma conta existente também é só por
  linha de comando (BR-013; falta). A conta precisa ativar o 2FA antes de usar as rotas da
  equipe.
- **Regras**: BR-011, BR-013

#### FR-012: Consultar a auditoria

- **Status**: `in-progress`
- **Fase**: 0 (API da equipe) / 1 (telas e visão da organização)
- **Descrição**: Lista da auditoria do mais novo ao mais antigo, com filtros por autor, ação,
  alvo e organização e paginação por cursor. O superadmin vê tudo; o Responsável vê só os
  eventos da própria organização, sem IP nem Ray ID.
- **Regras**: BR-020 a BR-025

#### FR-013: Consultar e alterar os parâmetros da plataforma

- **Status**: `in-progress`
- **Fase**: 0 (API) / 1 (tela)
- **Descrição**: A equipe vê os parâmetros em vigor (padrão ou alterado); o superadmin altera,
  com validação de limites e registro na auditoria.
- **Regras**: BR-030, BR-031, BR-032

### Organizações

#### FR-020: Inscrever uma organização

- **Status**: `refined`
- **Fase**: 1
- **Descrição**: Uma pessoa com conta inscreve uma ONG (CNPJ) ou se inscreve como protetor
  independente (CPF + comprovação de atuação), com nome, slug desejado e contato. A inscrição é
  um registro próprio; nenhuma organização existe até a aprovação.
- **Regras**: BR-040, BR-041, BR-042, BR-047

#### FR-021: Analisar a inscrição

- **Status**: `refined`
- **Fase**: 1
- **Descrição**: A moderação abre a inscrição, pede informações, aprova ou recusa com motivo
  (guardando quem decidiu e quando). Na aprovação, a organização nasce com o inscrito como
  Responsável e os papéis padrão.
- **Regras**: BR-041, BR-042, BR-046

#### FR-022: Suspender, reativar e encerrar uma organização

- **Status**: `refined`
- **Fase**: 1
- **Descrição**: A moderação suspende (ex.: indício de venda), reativa ou encerra uma
  organização, com motivo e auditoria. A organização guarda o status atual, o motivo e a data da
  última mudança; o histórico fica na auditoria.
- **Regras**: BR-041, BR-043, BR-044, BR-045

#### FR-023: Gerenciar a equipe da organização

- **Status**: `in-progress`
- **Fase**: 1
- **Descrição**: Convidar por e-mail, aceitar ou recusar convite, trocar papel, remover membro,
  sair da equipe, criar e editar papéis próprios a partir do catálogo.
- **Regras**: BR-050 a BR-058
- **Depende de**: FR-080 (e-mail do convite)

#### FR-024: Conceder permissões individuais

- **Status**: `refined`
- **Fase**: 1
- **Descrição**: Quem gerencia a equipe concede a um membro permissões da plataforma além das do
  papel (somente aditivas) e as retira. Permissões de gestão da equipe só vêm do papel.
- **Regras**: BR-053, BR-054

#### FR-025: Personalizar a página da organização

- **Status**: `draft`
- **Fase**: 1
- **Descrição**: Logo, cor primária e secundária (com prévia e contraste garantido), banner,
  "sobre", redes sociais, contato (WhatsApp, e-mail), chave PIX com QR e cidades de atuação.
  Layout fixo. Qualquer cor é aceita e a prévia mostra o tema ajustado; chave PIX com aviso de
  que fica pública (e confirmação se for CPF). Onde exatamente a cor secundária entra é decidido
  no design da tela, com a skill `impeccable` e o mantenedor, dentro do limite de BR-048.
- **Regras**: BR-048, BR-049

#### FR-026: Página pública da organização

- **Status**: `refined`
- **Fase**: 1
- **Descrição**: `/ong/{slug}` com a marca da organização e seus animais disponíveis. Slug
  antigo redireciona (301) para o atual. Organização suspensa sai do ar; encerrada mostra só
  "organização encerrada", sem animais.
- **Regras**: BR-043, BR-044, BR-047, BR-062

### Animais

#### FR-030: Cadastrar e editar animais

- **Status**: `draft`
- **Fase**: 1
- **Descrição**: Cadastro com os campos de BR-060, rascunho antes de publicar, edição e
  arquivamento com motivo.
- **Regras**: BR-060, BR-062, BR-063, BR-064

#### FR-031: Fotos e vídeo do animal

- **Status**: `draft`
- **Fase**: 1
- **Descrição**: 1 a 10 fotos com capa, reordenáveis; fotos sensíveis desfocadas até o clique;
  link de vídeo.
- **Regras**: BR-061
- **Depende de**: NFR-007

#### FR-032: Status e histórico do animal

- **Status**: `refined`
- **Fase**: 1
- **Descrição**: Mudança de status com histórico (quem, quando, de/para, motivo), seguindo a
  máquina de BR-064. Lar temporário não é status (FR-071).
- **Regras**: BR-064, BR-065, BR-078

### Adotantes e candidaturas

#### FR-040: Perfil do adotante

- **Status**: `draft`
- **Fase**: 2
- **Descrição**: Perfil reutilizável com CPF e o questionário base da plataforma (moradia,
  telas, outros animais, rotina, experiência…), preenchido uma vez e usado em toda candidatura.
- **Regras**: BR-070, BR-071, BR-085
- **Em aberto**: Q-034, Q-039

#### FR-041: Candidatar-se com conta

- **Status**: `draft`
- **Fase**: 2
- **Descrição**: Com o perfil completo, o adotante responde às perguntas extras da organização
  e envia a candidatura.
- **Regras**: BR-070, BR-074, BR-075, BR-083

#### FR-042: Candidatar-se sem conta

- **Status**: `draft`
- **Fase**: 2
- **Descrição**: E-mail verificado por código, CPF e Turnstile; cria um perfil sombra ligado ao
  CPF.
- **Regras**: BR-071, BR-072, BR-074

#### FR-043: Unir o perfil sombra à conta

- **Status**: `draft`
- **Fase**: 2
- **Descrição**: Ao criar conta (ou cadastrar CPF) com o CPF de um perfil sombra, as candidaturas
  dele passam para a conta.
- **Regras**: BR-073
- **Em aberto**: Q-032

#### FR-044: Perguntas extras da organização

- **Status**: `draft`
- **Fase**: 2
- **Descrição**: A organização cria perguntas (texto, múltipla escolha, sim/não) somadas ao
  questionário base. Toda alteração gera uma nova versão; a candidatura guarda a versão
  respondida.
- **Regras**: BR-070

#### FR-045: Acompanhar candidaturas (visão da organização)

- **Status**: `draft`
- **Fase**: 2
- **Descrição**: Lista por animal e por etapa, na ordem de BR-082, com quantas outras
  candidaturas ativas o adotante tem. Mover de etapa, pedir informação, recusar.
- **Regras**: BR-076, BR-077, BR-082, BR-084, BR-085
- **Em aberto**: Q-035, Q-038

#### FR-046: Concluir a adoção

- **Status**: `draft`
- **Fase**: 2
- **Descrição**: Registrar a adoção com data e confirmação de documento com foto conferido.
- **Regras**: BR-079, BR-080

#### FR-047: Expirações automáticas

- **Status**: `draft`
- **Fase**: 2
- **Descrição**: Tarefa agendada expira candidaturas sem resposta (após adoção em outra
  organização e após pedido de informação), com e-mail ao adotante.
- **Regras**: BR-080, BR-081, BR-032
- **Em aberto**: Q-036

#### FR-048: Revelar o CPF do adotante

- **Status**: `draft`
- **Fase**: 2
- **Descrição**: CPF mascarado por padrão; "revelar" para quem tem permissão, com auditoria.
- **Regras**: BR-085

#### FR-049: Contato por WhatsApp

- **Status**: `draft`
- **Fase**: 2
- **Descrição**: Botões `wa.me` com mensagem pré-preenchida entre organização e adotante, sem
  API paga.
- **Regras**: BR-131
- **Em aberto**: Q-039

### Portal

#### FR-050: Vitrine nacional

- **Status**: `draft`
- **Fase**: 3
- **Descrição**: Home com os animais adotáveis de organizações aprovadas. Filtros: espécie,
  sexo, porte, idade, convive com…, castrado, cidade/UF.
- **Regras**: BR-120
- **Em aberto**: Q-045

#### FR-051: Busca por distância a partir do CEP

- **Status**: `draft`
- **Fase**: 3
- **Descrição**: CEP → município → centroide; filtro por raio entre centroides.
- **Regras**: BR-121

#### FR-052: Denunciar conteúdo

- **Status**: `draft`
- **Fase**: 3
- **Descrição**: Denúncia de qualquer animal ou organização, por qualquer visitante, para a fila
  de moderação; a moderação decide e registra o desfecho.
- **Regras**: BR-122
- **Em aberto**: Q-046

### Reputação

#### FR-060: Selos do adotante

- **Status**: `draft`
- **Fase**: 4
- **Descrição**: Selos calculados a partir dos eventos de reputação e exibidos à organização na
  candidatura.
- **Regras**: BR-090, BR-103
- **Em aberto**: Q-050, Q-051

#### FR-061: Avaliação pós-adoção

- **Status**: `draft`
- **Fase**: 4
- **Descrição**: A organização avalia a adoção quando a avaliação é liberada.
- **Regras**: BR-091
- **Em aberto**: Q-052

#### FR-062: Registrar devolução

- **Status**: `draft`
- **Fase**: 4
- **Descrição**: Devolução do animal com motivo classificado; o animal volta a `Disponível`.
- **Regras**: BR-065, BR-092

#### FR-063: Ocorrências (reporte, defesa, decisão, revisão)

- **Status**: `draft`
- **Fase**: 4
- **Descrição**: Fluxo completo de ocorrência, da denúncia pela organização à decisão e à
  revisão.
- **Regras**: BR-093 a BR-099, BR-102
- **Em aberto**: Q-053 a Q-058

#### FR-064: Reputação vista por outras organizações

- **Status**: `draft`
- **Fase**: 4
- **Descrição**: Selo e resumo estruturado das ocorrências procedentes, sem a organização
  autora.
- **Regras**: BR-100

#### FR-065: Histórico do próprio adotante

- **Status**: `draft`
- **Fase**: 4
- **Descrição**: O adotante vê todo o seu histórico, ocorrências, decisões e prazos.
- **Regras**: BR-101
- **Em aberto**: Q-056

### Pós-adoção e lar temporário

#### FR-070: Acompanhamento pós-adoção

- **Status**: `draft`
- **Fase**: 4
- **Descrição**: Lembretes com link autenticado para o adotante mandar fotos e notícias;
  timeline visível à organização.
- **Regras**: BR-110

#### FR-071: Lar temporário

- **Status**: `draft`
- **Fase**: 4
- **Descrição**: Voluntário se cadastra com ficha própria; a organização aprova, vincula animal
  ao lar e registra início e fim.
- **Regras**: BR-111
- **Em aberto**: Q-059

### Notificações

#### FR-080: E-mails transacionais

- **Status**: `draft`
- **Fase**: 0 (verificação, senha, convites) / 2+ (demais)
- **Descrição**: Envio por uma interface `EmailProvider` (Resend em produção, Mailpit local),
  com fila e novas tentativas: verificação, redefinição, convites, candidaturas, lembretes,
  decisões e expirações.
- **Regras**: BR-130

#### FR-081: Preferências de e-mail

- **Status**: `draft`
- **Fase**: 2
- **Descrição**: O usuário desliga os e-mails opcionais; os obrigatórios não podem ser
  desligados.
- **Regras**: BR-130
- **Em aberto**: Q-065

### Direitos do titular (LGPD)

#### FR-090: Exportar os próprios dados

- **Status**: `draft`
- **Fase**: 2
- **Descrição**: Self-service, em JSON, com auditoria da exportação.

#### FR-091: Corrigir os próprios dados

- **Status**: `draft`
- **Fase**: 2
- **Descrição**: Edição dos dados pessoais; CPF segue BR-071.
- **Em aberto**: Q-034

#### FR-092: Inativar a conta

- **Status**: `refined`
- **Fase**: 2
- **Descrição**: Self-service. Conta nunca é apagada, só inativada (BR-140), e esse é o único
  caminho: a equipe não remove nem inativa, só bane (BR-016). Recusa enquanto a pessoa for o
  único Responsável de uma organização ativa ou suspensa. Por 30 dias, entrar de novo reativa;
  depois, os dados pessoais são anonimizados (FR-093).
- **Regras**: BR-016, BR-055, BR-140, BR-142

#### FR-093: Anonimizar dados antigos

- **Status**: `draft`
- **Fase**: 2
- **Descrição**: Tarefa agendada anonimiza candidaturas encerradas sem adoção após o prazo de
  retenção e os dados pessoais de contas inativadas há mais de 30 dias.
- **Regras**: BR-140, BR-141
- **Em aberto**: Q-061

#### FR-094: Páginas legais

- **Status**: `draft`
- **Fase**: 5
- **Descrição**: Termos de Uso, Política de Privacidade e contato do encarregado (DPO),
  revisados por advogado, e RIPD do módulo de reputação.

---

## Requisitos não funcionais

#### NFR-001: Isolamento entre organizações

- **Status**: `draft`
- **Fase**: 1
- **Descrição**: Todo dado de organização tem `organization_id` e só é acessado por uma camada
  com escopo (`scopedRepo(orgId, actor)`) que filtra e checa permissão. RLS do Postgres nas
  tabelas sensíveis (candidaturas, perfis de adotante, ocorrências). Testes tentam ler dados de
  outra organização por ID direto e devem falhar (ADR 0003).

#### NFR-002: IDs não sequenciais

- **Status**: `implemented`
- **Fase**: 0
- **Descrição**: IDs UUIDv7 gerados pelo Postgres (`uuidv7()`), inclusive nas tabelas do Better
  Auth; timestamps com fuso. Checagem de IDOR em toda rota.

#### NFR-003: CPF protegido

- **Status**: `draft`
- **Fase**: 2
- **Descrição**: CPF cifrado (AES-256-GCM, chave fora do banco) + HMAC-SHA256 com chave secreta
  para busca e unicidade. Exibido mascarado.
- **Em aberto**: Q-062

#### NFR-004: Proteção contra força bruta e senhas fracas

- **Status**: `implemented`
- **Fase**: 0
- **Descrição**: scrypt (padrão do Better Auth), 12+ caracteres, senha vazada recusada
  (k-anonimato), rate limit por IP e bloqueio progressivo por e-mail.
- **Regras**: BR-001, BR-002, BR-003

#### NFR-005: Sessão e origem

- **Status**: `implemented`
- **Fase**: 0
- **Descrição**: Cookies `httpOnly`, `secure` (em HTTPS) e `SameSite=Lax`, prefixo `acolhemais`;
  CORS da API só para a origem da web; API e web sob o mesmo domínio-raiz. Permissões lidas a
  cada requisição (sem cache de sessão no cookie).

#### NFR-006: Headers de segurança

- **Status**: `in-progress`
- **Fase**: 0 (API) / 1 (web)
- **Descrição**: CSP estrita, HSTS e `frame-ancestors` na web; `secureHeaders` na API.

#### NFR-007: Uploads seguros

- **Status**: `draft`
- **Fase**: 1
- **Descrição**: URLs pré-assinadas, limite de tamanho e tipo, reencode das imagens (sem
  EXIF/GPS nem payloads), bucket público (fotos de animais) separado do privado (evidências,
  documentos) com URLs assinadas curtas e acesso auditado. Estratégia de reencode no Workers em
  ADR próprio antes do upload (ADR 0004).

#### NFR-008: Auditoria inviolável pela aplicação

- **Status**: `in-progress`
- **Fase**: 0 / deploy
- **Descrição**: Trigger recusa `UPDATE`, `DELETE` e `TRUNCATE` em `audit_log` (pronto). No
  deploy, a API usa um usuário de banco sem DDL nem `UPDATE`/`DELETE` na auditoria, separado do
  usuário das migrations.
- **Regras**: BR-020

#### NFR-009: Segredos

- **Status**: `in-progress`
- **Fase**: 0
- **Descrição**: Segredos só em variáveis de ambiente (`wrangler secret`), validados com Zod na
  primeira requisição; segredo de desenvolvimento só aceito em localhost (pronto). gitleaks no
  CI (falta).

#### NFR-010: Backups

- **Status**: `draft`
- **Fase**: 5
- **Descrição**: `pg_dump` diário para o R2 cifrado, retenção de 30 dias, teste de restauração
  mensal.

#### NFR-011: Acessibilidade WCAG 2.1 AA

- **Status**: `implemented`
- **Fase**: 0 (contínuo)
- **Descrição**: axe-core no E2E em cada estado relevante das telas (vazio, com erro), Chromium
  em computador e celular; teclado e leitor de tela. Vale para toda tela nova.

#### NFR-012: Textos em português e traduzíveis

- **Status**: `in-progress`
- **Fase**: 0 (contínuo)
- **Descrição**: Textos da web em arquivos do next-intl (pt-BR) desde o início; mensagens da API
  com `code` estável em `MAIUSCULAS_COM_SUBLINHADO` (também nos erros do domínio) e `message` em
  português.

#### NFR-013: Custo de hospedagem perto de zero

- **Status**: `refined`
- **Fase**: deploy
- **Descrição**: Free tiers (Vercel, Workers, Neon, R2, Resend). Antes de liberar login por senha
  em produção, a API migra para o Workers Paid (hash de senha não cabe em 10 ms de CPU) e o
  custo real é medido no painel (ADR 0004, ADR 0005).

#### NFR-014: Compatível com o runtime do Workers

- **Status**: `implemented`
- **Fase**: 0 (contínuo)
- **Descrição**: Dependências da API rodam no `workerd` com `nodejs_compat`; testes da API rodam
  no próprio `workerd`; bundle abaixo de 3 MB.

#### NFR-015: Busca rápida no portal

- **Status**: `draft`
- **Fase**: 3
- **Descrição**: Busca com filtros e raio responde rápido com seed de ~10 mil animais.
- **Em aberto**: Q-047

#### NFR-016: CI completo e seguro para forks

- **Status**: `in-progress`
- **Fase**: 0
- **Descrição**: Todo PR, sem segredos: lockfile congelado, formatação, lint, tipos, unitários,
  integração com Postgres, build, E2E + axe, schema do Better Auth em dia, migrations geradas =
  commitadas e migrations mergeadas imutáveis, `pnpm audit`, CodeQL e título em Conventional
  Commits (pronto). Faltam: gitleaks, checagem de licenças, release-please e preview com label
  `safe-to-preview`.

#### NFR-017: Ambiente local sem chaves

- **Status**: `implemented`
- **Fase**: 0
- **Descrição**: `docker compose` com Postgres + PostGIS, S3Mock e Mailpit; nada externo é
  necessário para desenvolver e testar.

#### NFR-018: Proteção do `main`

- **Status**: `refined`
- **Fase**: 0
- **Descrição**: Sem push direto, PR obrigatório, CI verde, squash merge, histórico linear,
  conversas resolvidas, CODEOWNERS nas áreas críticas.

#### NFR-019: Ambientes e releases

- **Status**: `draft`
- **Fase**: deploy
- **Descrição**: local → staging (deploy automático do `main`) → produção (tag de release +
  aprovação manual no GitHub Environment).

#### NFR-020: Monitoramento de erros e cotas

- **Status**: `draft`
- **Fase**: deploy
- **Descrição**: Sentry (free) e monitoramento das cotas dos free tiers (e-mail/dia, tamanho do
  banco, consultas do Hyperdrive).

#### NFR-021: Navegadores

- **Status**: `in-progress`
- **Fase**: 0 / 5
- **Descrição**: Chromium no CI (pronto); Firefox e WebKit reavaliados antes do beta.

#### NFR-022: Anti-bot nos formulários públicos

- **Status**: `draft`
- **Fase**: 2
- **Descrição**: Cloudflare Turnstile e rate limit em candidatura sem conta, denúncia pública e
  cadastro de lar temporário.
- **Em aberto**: Q-066
