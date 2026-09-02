# Plataforma open source de adoção para ONGs de animais — Plano completo

## 1. Contexto

Muitas ONGs e protetores independentes não têm site nem sistema para divulgar animais e triar adotantes.
Proposta: plataforma **multi-tenant, gratuita, hospedada centralmente e open source (AGPL-3.0)** onde:

- cada organização se inscreve, é aprovada e ganha sua página (`/ong/{slug}`) com layout padrão e marca própria;
- equipes gerenciam animais, candidaturas, pós-adoção e lar temporário;
- adotantes encontram animais num **portal nacional** e se candidatam;
- um **sistema de reputação moderado** protege os animais de adotantes com histórico de abandono/maus-tratos.
  Diretório do projeto (`D:\Desktop\projects\ong-project`) está vazio — greenfield.

---

## 2. Atores

| Ator                  | Descrição                                                                                                           |
| --------------------- | ------------------------------------------------------------------------------------------------------------------- |
| Visitante             | Navega portal e páginas, denuncia conteúdo                                                                          |
| Adotante              | Com conta (perfil reutilizável) ou sem conta (e-mail verificado por código). CPF sempre obrigatório para candidatar |
| Membro de organização | Usuário com papel dentro de uma ONG/protetor (pode pertencer a várias)                                              |
| Plataforma            | Superadmin, Moderador (aprovações, ocorrências, denúncias), Suporte (somente leitura)                               |

---

## 3. Regras de negócio

### 3.1 Organizações

- **Tipos**: ONG (CNPJ validado por dígito + consulta pública BrasilAPI) e Protetor independente (CPF + comprovação de atuação: redes sociais, referências, fotos de resgates).
- **Ciclo de vida**: `Pendente → Em análise ⇄ Informações solicitadas → Aprovada | Recusada` ; `Aprovada → Suspensa → Reativada | Encerrada`.
  - Recusa tem motivo; pode reenviar após 30 dias.
  - Suspensão (ex.: denúncia de venda): página sai do ar, candidaturas congeladas, equipe mantém acesso só leitura.
  - Encerramento: animais arquivados, candidaturas abertas canceladas com aviso aos adotantes, histórico de adoções mantido (alimenta reputação).
- **Slug**: único, minúsculo, lista de reservados (`admin`, `api`, `ong`, `portal`, …). Troca permitida com redirecionamento 301 (histórico de slugs).
- **Personalização**: logo, cor primária/secundária (rejeita combinações abaixo de contraste WCAG AA e sugere ajuste), banner, "sobre", redes sociais, contato (WhatsApp/e-mail), chave PIX + QR, área de atuação (cidades). Layout fixo.
- **Doações**: só exibe PIX da própria ONG. Plataforma **nunca intermedia dinheiro**.

### 3.2 Permissões dentro da organização (RBAC)

- **Catálogo fixo no código** (ex.: `animal.criar|editar|arquivar`, `candidatura.ver`, `candidatura.ver_dados_sensiveis`, `candidatura.mover_etapa`, `candidatura.aprovar`, `adocao.concluir`, `posadocao.avaliar`, `ocorrencia.reportar`, `lar_temporario.gerenciar`, `pagina.personalizar`, `equipe.gerenciar`, `organizacao.configurar`).
- **Papéis padrão**: Responsável (tudo), Coordenador (candidaturas + animais), Voluntário (animais, sem dados sensíveis). ONG pode criar papéis próprios a partir do catálogo.
- **Permissão efetiva = permissões do papel ∪ concessões individuais** (somente aditivas).
- Travas: só concede quem tem `equipe.gerenciar`; ninguém concede permissão que não possui; sempre ≥1 Responsável; toda alteração vai para log de auditoria; sessões revalidam permissões a cada requisição.
- Entrada na equipe só por convite por e-mail (expira em 7 dias).

### 3.3 Animais

- **Campos**: nome, espécie (cão/gato/outro), sexo, faixa etária + nascimento aproximado, porte, pelagem, temperamento (convive com crianças/cães/gatos), **saúde obrigatória** (castrado, vacinas, vermifugado, FIV/FeLV p/ gatos, necessidades especiais), 1–10 fotos (capa), link de vídeo, história, cidade, taxa de adoção opcional.
- **Proibição de venda**: taxa de adoção opcional com **teto configurável pela plataforma** + justificativa obrigatória (castração, vacinas…). Indício de comércio → denúncia → suspensão.
- **Status**: `Rascunho → Disponível ⇄ Em lar temporário (ainda adotável) → Em processo → Adotado`; `Indisponível` (tratamento); `Arquivado` (óbito/transferência). Devolução volta para `Disponível` mantendo histórico.
- **Fotos sensíveis** (ferimentos de resgate) marcadas pela ONG → desfocadas até o clique.
- Localização exibida = **cidade** (nunca endereço de ONG ou lar temporário).

### 3.4 Candidaturas

- **Ficha** = questionário base fixo da plataforma (moradia, telas, outros animais, rotina, experiência…) reaproveitado do perfil + perguntas extras por ONG (texto, múltipla escolha, sim/não; versionadas — candidatura guarda a versão respondida).
- **Sem conta**: e-mail verificado por código (OTP) + CPF + Cloudflare Turnstile. Cria um _perfil sombra_ ligado ao hash do CPF. Ao criar conta depois com o mesmo CPF, as candidaturas são vinculadas. Se o CPF já pertence a uma conta, exige login.
- **Limite**: até **3 candidaturas ativas** por CPF na plataforma; ONG vê quantas outras ativas o adotante tem.
- **Etapas fixas**: `Recebida → Em análise → Entrevista/Visita → Aprovada → Concluída`. Terminais: `Recusada` (motivo interno + mensagem ao adotante), `Desistência`, `Expirada`, `Cancelada` (animal adotado por outro/indisponível — mensagem gentil automática).
- **Concluir adoção** exige: data, permissão `adocao.concluir` e checkbox **"documento com foto conferido"** (fecha a brecha de alguém usar CPF alheio).
- **Após uma adoção concluída**: demais candidaturas ativas do adotante → `Aguardando confirmação`; e-mail com "continuar/desistir"; sem resposta em **7 dias → Expirada** (neutro, sem impacto em reputação). ONGs afetadas veem aviso "adotou recentemente".
- **Inatividade**: ONG pede informação e adotante não responde em 7 dias → Expirada (neutro).
- **Ordenação na visão da ONG** (dentro de cada nível, por data de envio): 1) Adotante com histórico positivo; 2) Com conta verificada; 3) Sem conta; 4) Com selo "Atenção". Inelegíveis não conseguem enviar candidatura.

### 3.5 Reputação (módulo mais sensível)

- **Selos transparentes (não nota numérica opaca)** — evita decisão automatizada inexplicável (LGPD art. 20): `Novo`, `Verificado`, `Adotante aprovado` (≥1 adoção avaliada positivamente), `Atenção` (ocorrência leve procedente ativa), `Inelegível`.
- **Eventos**:
  - Avaliação pós-adoção pela ONG (liberada após 1º acompanhamento ou 90 dias): `bem-sucedida` → positivo.
  - Devolução com motivo classificado: `responsável` (neutro) | `irresponsável/abandono` (gera ocorrência) | `maus-tratos` (ocorrência grave).
- **Fluxo de ocorrência**: ONG reporta (tipo, descrição, evidências privadas, B.O. recomendado e obrigatório para maus-tratos) → `Em análise` (**invisível às outras ONGs**) → adotante notificado, **15 dias para defesa** → moderador decide: `Improcedente` | `Procedente leve` (selo Atenção, expira em 2 anos) | `Procedente grave` (Inelegível) → decisão fundamentada enviada ao adotante → **1 pedido de revisão** julgado por outro moderador.
  - Suspensão cautelar só por moderador, em casos graves com evidência forte.
  - Moderador membro de uma ONG não modera casos dela (conflito de interesse).
  - Inelegível pode pedir revisão após 5 anos ou com evidência nova.
- **O que outras ONGs veem**: selo + resumo estruturado (categoria, mês/ano, resultado) **só de ocorrências procedentes**, sem texto livre, sem identificar a ONG autora. Comentários livres ficam visíveis só para a ONG que escreveu.
- **Adotante** vê todo o próprio histórico e decisões (direito de acesso).
- A plataforma orienta registrar B.O. em maus-tratos (crime — Lei 9.605/98 art. 32; Lei 14.064/20); não substitui autoridades.

### 3.6 Pós-adoção

- Lembretes automáticos ao adotante em **30 / 90 / 180 dias** para enviar fotos/atualização (link autenticado). Timeline visível à ONG. Falta de resposta não gera ocorrência automática, apenas sinaliza à ONG.

### 3.7 Lar temporário

- Voluntário se cadastra com ficha própria (base + extras), mesmo esquema de CPF/conta. ONG aprova, vincula animal ao lar (status `Em lar temporário`), registra início/fim. Endereço do lar nunca é público.

### 3.8 Portal central e busca

- Home = vitrine de todos os animais disponíveis de ONGs aprovadas. Filtros: espécie, sexo, porte, idade, convive com…, castrado, cidade/UF, **raio a partir do CEP**.
- Geolocalização: CEP → município (BrasilAPI) → centroide do município (base IBGE estática). Distância calculada entre centroides (privacidade + custo zero).
- **Denúncia pública** em qualquer animal/ONG (Turnstile + rate limit) → fila de moderação.

### 3.9 Notificações

- E-mails transacionais (nova candidatura, mudança de etapa, convites, lembretes, decisões de moderação, expirações). Preferências de e-mail por usuário (exceto obrigatórios).
- Botões `wa.me` com mensagem pré-preenchida (ONG ↔ adotante). Sem API paga.

### 3.10 Parâmetros configuráveis da plataforma (não hardcoded)

Limite de candidaturas (3), prazos de expiração (7d), prazo de defesa (15d), expiração de ocorrência leve (2a), revisão de inelegível (5a), teto de taxa de adoção, intervalos de pós-adoção (30/90/180), reenvio após recusa (30d).

---

## 4. Segurança e LGPD

- **Meta**: OWASP ASVS nível 2.
- **Isolamento multi-tenant**: banco compartilhado com `organization_id`; todo acesso a dados de tenant passa por uma camada `scopedRepo(orgId, actor)` que aplica escopo + permissão. **Postgres RLS** como defesa em profundidade nas tabelas sensíveis (candidaturas, adotantes, ocorrências). Testes automatizados de acesso cruzado entre tenants.
- **IDs** não sequenciais (UUIDv7). Checagem de IDOR em todas as rotas.
- **CPF**: criptografado (AES-256-GCM, chave fora do banco) + **HMAC-SHA256 com chave secreta** para busca/unicidade (hash puro de CPF é quebrável por força bruta). Exibido mascarado; "revelar" exige `candidatura.ver_dados_sensiveis` e gera auditoria.
- **Auth**: e-mail+senha (hash scrypt/argon2, verificação de senha vazada), Google OAuth, **2FA TOTP obrigatório** para admins da plataforma e membros com acesso a dados sensíveis. Rate limit + lockout progressivo. Cookies httpOnly/secure/SameSite.
- **Uploads**: URLs pré-assinadas, limite de tamanho/tipo, **reencode das imagens (remove EXIF/GPS e payloads)**; bucket público (fotos de animais) separado do privado (evidências, documentos) com URLs assinadas de curta duração e acesso auditado.
- **Headers**: CSP estrita, HSTS, frame-ancestors; Turnstile em formulários públicos.
- **Auditoria append-only**: permissões, revelação de dados sensíveis, decisões de moderação, exportações, mudanças de status de ONG.
- **Segredos**: só em variáveis de ambiente validadas com Zod no boot; gitleaks no CI.
- **Backups**: `pg_dump` diário via GitHub Action → R2 criptografado, retenção 30 dias, teste de restauração mensal.
- **LGPD**:
  - Controlador: você (PF) inicialmente, com meta de formalizar **associação sem fins lucrativos antes de escalar a reputação**. Encarregado (DPO) = você, contato público.
  - Termos de Uso + Política de Privacidade + **RIPD (relatório de impacto) do módulo de reputação** — **revisão por advogado antes do lançamento público**.
  - Bases legais mapeadas (execução de procedimento a pedido do titular para candidatura; legítimo interesse/proteção para reputação — validar juridicamente).
  - Direitos do titular self-service: acesso/exportação (JSON), correção, exclusão. Na exclusão, dados pessoais são apagados, mas o **registro de inelegibilidade (HMAC do CPF + categoria)** é mantido — validar juridicamente.
  - Retenção: candidaturas recusadas/expiradas anonimizadas após 12 meses.
  - Plano de resposta a incidentes (comunicação à ANPD e titulares).

---

## 5. Stack e arquitetura (orçamento ~R$0)

**TypeScript em monorepo (pnpm + Turborepo), API e frontend separados (ver ADR 0004):**

```
apps/api            API Hono — única camada que acessa banco, auth, storage e e-mail
apps/web            Next.js (App Router, RSC) — só interface; consome a API via cliente tipado `hc`
packages/domain     Regras de negócio puras (sem framework): RBAC, reputação, máquinas de estado
packages/db         Drizzle ORM: schema, migrations versionadas, seeds (faker pt-BR)
packages/ui         Tailwind + shadcn/ui, tokens de tema por tenant (CSS variables)
packages/emails     Templates React Email + interface EmailProvider
packages/config     tsconfig compartilhado (lint: oxlint; formatação: oxfmt — ambos na raiz)
docs/adr            Architecture Decision Records
```

| Necessidade           | Escolha (free tier)                                                                      | Observação                                                                              |
| --------------------- | ---------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| Hosting               | Web: Vercel Hobby · API: Cloudflare Workers (ADR 0004)                                   | Workers grátis tem 10 ms de CPU/req: hash de senha pode exigir Workers Paid (US$ 5/mês) |
| Banco                 | PostgreSQL no Neon (free) via Cloudflare Hyperdrive                                      | Branching para previews; Drizzle (SQL-first, combina com RLS)                           |
| Auth                  | Better Auth                                                                              | E-mail/senha, Google, 2FA TOTP, dados no próprio Postgres (sem vendor lock-in)          |
| Storage               | Cloudflare R2                                                                            | 10 GB grátis, sem custo de egress                                                       |
| E-mail                | Resend (3k/mês)                                                                          | Atrás de `EmailProvider` para trocar por Brevo/SES ao crescer                           |
| Jobs agendados        | Cron Triggers do Cloudflare Workers + tabela de jobs                                     | Expirações, lembretes, retries de e-mail                                                |
| Anti-bot / rate limit | Cloudflare Turnstile + Upstash Redis (free)                                              |                                                                                         |
| Erros                 | Sentry (free)                                                                            |                                                                                         |
| Validação             | Zod compartilhado front/back                                                             |                                                                                         |
| i18n                  | next-intl, PT-BR, textos em arquivos desde o dia 1                                       |                                                                                         |
| Testes                | Vitest (domínio), integração com Postgres real, Playwright (E2E), axe-core (WCAG 2.1 AA) |                                                                                         |

**Dev local**: `docker compose` com Postgres+PostGIS, S3Mock (S3) e Mailpit — **contribuidor roda tudo sem nenhuma chave real**.

**Modelo de dados (entidades principais)**: User, Session, AdopterProfile (cpf_enc, cpf_hmac), Organization (tipo, status, slug, tema), OrganizationSlugHistory, Membership, Role, RolePermission, MemberPermissionGrant, Animal, AnimalPhoto, AnimalStatusHistory, ApplicationForm (versionado), Application, ApplicationStageHistory, Adoption, PostAdoptionCheckin, FosterHome, FosterAssignment, Incident (ocorrência), IncidentEvidence, ModerationDecision, ReputationEvent, ContentReport (denúncia), Notification/EmailOutbox, ScheduledJob, AuditLog, PlatformSetting, Municipality (IBGE).

---

## 6. Repositório, CI/CD e governança

- **Repositório `HenriqueBragaMoreira/acolhemais`** (conta pessoal; transferir para a organização `acolhemais` ao entrar o 2º mantenedor ou ao formalizar a associação), licença **AGPL-3.0**, contribuições via fork + PR, **DCO sign-off** (sem CLA).
- **Branch `main` protegida**: sem push direto, PR obrigatório, CI verde, squash merge, histórico linear, conversas resolvidas.
- **CODEOWNERS**: 1 aprovação padrão; **2 aprovações** em áreas críticas (`packages/domain/rbac`, `reputation`, auth, `packages/db/migrations`, `.github/`).
- **Conventional Commits** (commitlint) + release-please (changelog e tags semânticas).
- **CI em todo PR (sem segredos — funciona para forks)**: install com lockfile congelado → lint + typecheck → testes unitários → integração (Postgres de serviço) → build → E2E Playwright + axe → checagem de migrations (geradas = commitadas; migration já mergeada é imutável) → `pnpm audit` + licenças de dependências → gitleaks → CodeQL.
- **Preview deploy** com banco de branch Neon só após label `safe-to-preview` aplicado por mantenedor (protege segredos contra PRs maliciosos de forks; nunca usar `pull_request_target` com checkout do código do fork).
- **Ambientes**: local → staging (auto deploy do `main`) → produção (tag de release + aprovação manual no GitHub Environment).
- **Renovate/Dependabot** semanal, agrupado.
- **Docs da comunidade**: README, CONTRIBUTING (setup em <10 min), CODE_OF_CONDUCT (Contributor Covenant), SECURITY.md (divulgação responsável, canal privado), templates de issue/PR, labels `good first issue`/`help wanted`, ADRs para decisões, roadmap público (GitHub Projects).
- **Governança**: você é mantenedor principal; contribuidores recorrentes viram mantenedores por mérito (critérios no GOVERNANCE.md).

---

## 7. Roadmap de implementação

| Fase                         | Entregas                                                                                                                                                                    | Critério de pronto                                                                  |
| ---------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| 0 — Fundação                 | Monorepo, CI completo, docker compose, governança/docs, design system + tema por tenant, Better Auth + 2FA, auditoria, PlatformSettings                                     | Contribuidor externo clona, sobe e roda testes sem segredos; PR de fork passa no CI |
| 1 — Organizações             | Inscrição (ONG/protetor), moderação de aprovação, RBAC completo, convites, personalização com validação de contraste, página pública `/ong/{slug}`, CRUD de animais + fotos | Testes de acesso cruzado entre tenants e de RBAC verdes                             |
| 2 — Adotantes e candidaturas | Perfil, CPF cifrado/HMAC, candidatura com e sem conta (OTP), ficha base + extras versionadas, etapas, limite de 3, expirações, ordenação, e-mails + wa.me                   | E2E do fluxo completo até "Concluída"                                               |
| 3 — Portal                   | Vitrine nacional, filtros, raio por CEP, denúncia pública, moderação de conteúdo, fotos sensíveis                                                                           | Busca performática com seed de ~10k animais                                         |
| 4 — Reputação e pós-adoção   | Avaliações, ocorrências com defesa/decisão/revisão, selos, inelegibilidade, lembretes 30/90/180, lar temporário, PIX                                                        | E2E de ocorrência ponta a ponta; auditoria completa                                 |
| 5 — Beta                     | Revisão jurídica (Termos, Privacidade, RIPD), pentest básico (OWASP ZAP), 3–5 ONGs piloto, backups testados                                                                 | Go/no-go com checklist de segurança e LGPD                                          |

**Pós-MVP (roadmap)**: termo de adoção digital em PDF, subdomínio/domínio próprio, eventos/feiras, apadrinhamento, API pública, WhatsApp API, PWA, ES/EN.

---

## 8. Riscos e mitigação

| Risco                                                                    | Mitigação                                                                                                                      |
| ------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------ |
| Responsabilidade jurídica da reputação recaindo sobre PF                 | Moderação humana, defesa, revisão, sem texto livre compartilhado, revisão por advogado, formalizar associação antes de escalar |
| Uso de CPF de terceiro                                                   | OTP de e-mail, unicidade CPF↔conta, reputação só nasce de adoção com documento conferido ou ocorrência moderada                |
| Limites de free tier (e-mail 100/dia, DB 0,5 GB, termos da Vercel Hobby) | Abstrações de provedor, monitoramento de cotas, plano B documentado, buscar patrocínio/créditos OSS                            |
| Sobrecarga de moderação                                                  | Filas priorizadas, prazos (SLA), recrutar moderadores voluntários com 2FA e termo de confidencialidade                         |
| PR malicioso de fork                                                     | CI sem segredos, CODEOWNERS, 2 aprovações em áreas críticas, label para preview                                                |
| Burnout de mantenedor                                                    | Governança clara, issues bem descritas, automação máxima                                                                       |

---

## 9. Pendências não bloqueantes (decidir antes da Fase 0)

- Nome do projeto e domínio (.org.br exige entidade; .org/.com.br ok em PF).
- Valor do teto da taxa de adoção — **adiado: decidir antes da Fase 1** (CRUD de animais). Até lá existe apenas como `PlatformSetting` sem valor definido.

## 10. Verificação

- Cada fase só fecha com seu critério de pronto (tabela da seção 7) e CI verde.
- Cenários E2E obrigatórios: inscrição → aprovação de ONG; convite e concessão individual de permissão (e tentativa de escalonamento negada); candidatura sem conta → criação de conta vincula histórico; 4ª candidatura bloqueada; adoção concluída → outras candidaturas aguardando confirmação → expiram em 7 dias (simulação de relógio); ocorrência → defesa → decisão → selo visível a outra ONG sem identificar a autora; inelegível bloqueado de candidatar; usuário da ONG A não acessa dados da ONG B (por ID direto na URL/API); upload de foto sai sem EXIF; exportação LGPD do titular.
