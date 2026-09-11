# Acolhe+ — Plano

Plataforma open source de adoção para ONGs e protetores de animais. Este documento guarda a
visão, a arquitetura, o roadmap e os riscos. **Regras e requisitos não ficam aqui**:

- [REQUIREMENTS.md](REQUIREMENTS.md) — o que o sistema faz (FR) e com que qualidade (NFR);
- [BUSINESS-RULES.md](BUSINESS-RULES.md) — as regras de negócio (BR), fonte única;
- [OPEN-QUESTIONS.md](OPEN-QUESTIONS.md) — brechas e decisões pendentes (Q);
- [adr/](adr/) — decisões de arquitetura.

## 1. Contexto

Muitas ONGs e protetores independentes não têm site nem sistema para divulgar animais e triar
adotantes. Proposta: plataforma **multi-tenant, gratuita, hospedada centralmente e open source
(AGPL-3.0)** onde:

- cada organização se inscreve, é aprovada e ganha sua página (`/ong/{slug}`) com layout padrão e
  marca própria;
- equipes gerenciam animais, candidaturas, pós-adoção e lar temporário;
- adotantes encontram animais num **portal nacional** e se candidatam;
- um **sistema de reputação moderado** protege os animais de adotantes com histórico de
  abandono ou maus-tratos.

## 2. Atores

| Ator                  | Descrição                                                                                                           |
| --------------------- | ------------------------------------------------------------------------------------------------------------------- |
| Visitante             | Navega no portal e nas páginas, denuncia conteúdo                                                                   |
| Adotante              | Com conta (perfil reutilizável) ou sem conta (e-mail verificado por código). CPF sempre obrigatório para candidatar |
| Membro de organização | Usuário com papel numa ONG ou protetor (pode pertencer a várias)                                                    |
| Equipe da plataforma  | Superadmin, Moderador (aprovações, ocorrências, denúncias), Suporte (só leitura)                                    |

## 3. Onde estão as regras

As seções antigas deste plano (citadas pelos ADRs 0001–0007) viraram itens numerados:

| Seção antiga                   | Agora                                       |
| ------------------------------ | ------------------------------------------- |
| §3.1 Organizações              | BR-040 a BR-049; FR-020 a FR-026            |
| §3.2 Permissões (RBAC)         | BR-050 a BR-059; FR-023, FR-024             |
| §3.3 Animais                   | BR-060 a BR-065; FR-030 a FR-032            |
| §3.4 Candidaturas              | BR-070 a BR-085; FR-040 a FR-049            |
| §3.5 Reputação                 | BR-090 a BR-103; FR-060 a FR-065            |
| §3.6 Pós-adoção                | BR-110; FR-070                              |
| §3.7 Lar temporário            | BR-111; FR-071                              |
| §3.8 Portal e busca            | BR-120 a BR-122; FR-050 a FR-052            |
| §3.9 Notificações              | BR-130, BR-131; FR-080, FR-081              |
| §3.10 Parâmetros da plataforma | BR-030 a BR-032; FR-013                     |
| §4 Segurança                   | NFR-001 a NFR-010, NFR-022; BR-001 a BR-025 |
| §4 LGPD (direitos do titular)  | BR-140 a BR-143; FR-090 a FR-094; §4 abaixo |
| §9 Pendências                  | [OPEN-QUESTIONS.md](OPEN-QUESTIONS.md)      |

## 4. Compromissos de LGPD e jurídicos

Fora do código, mas condição para o beta:

- **Controlador**: o mantenedor principal (pessoa física) no início, com meta de formalizar uma
  **associação sem fins lucrativos antes de escalar a reputação**. Encarregado (DPO): o mesmo,
  com contato público.
- **Termos de Uso, Política de Privacidade e RIPD** do módulo de reputação, **revisados por
  advogado antes do lançamento público** (FR-094).
- **Bases legais** mapeadas: execução de procedimento a pedido do titular (candidatura);
  legítimo interesse / proteção (reputação) — validar juridicamente, junto com a retenção do
  registro de inelegibilidade (BR-140).
- **Plano de resposta a incidentes**, com comunicação à ANPD e aos titulares.
- Meta de segurança: **OWASP ASVS nível 2**.

## 5. Stack e arquitetura (orçamento ~R$0)

TypeScript em monorepo (pnpm + Turborepo), API e frontend separados (ADR 0004):

```
apps/api            API Hono — única camada que acessa banco, auth, storage e e-mail
apps/web            Next.js (App Router, RSC) — só interface; consome a API via cliente tipado `hc`
apps/e2e            Playwright + axe-core contra web, API e banco reais (ADR 0007)
packages/domain     Regras de negócio puras (sem framework): RBAC, reputação, máquinas de estado
packages/db         Drizzle ORM: schema, migrations versionadas, seeds (faker pt-BR)
packages/ui         Tailwind + shadcn/ui sobre Base UI, tema por organização (ADR 0007)
packages/emails     Templates React Email + interface EmailProvider (a criar, FR-080)
packages/config     tsconfig compartilhado (lint: oxlint; formatação: oxfmt — na raiz)
docs/adr            Architecture Decision Records
```

| Necessidade           | Escolha (free tier)                                                   | Observação                                                     |
| --------------------- | --------------------------------------------------------------------- | -------------------------------------------------------------- |
| Hosting               | Web: Vercel Hobby · API: Cloudflare Workers (ADR 0004)                | Hash de senha exige Workers Paid (US$ 5/mês) antes de produção |
| Banco                 | PostgreSQL no Neon via Cloudflare Hyperdrive                          | Branching para previews; Drizzle (SQL-first, combina com RLS)  |
| Auth                  | Better Auth (`twoFactor`, `admin`, `organization` + plugins próprios) | ADR 0005                                                       |
| Storage               | Cloudflare R2                                                         | 10 GB grátis, sem egress                                       |
| E-mail                | Resend (3 mil/mês)                                                    | Atrás de `EmailProvider`, troca por Brevo/SES ao crescer       |
| Jobs agendados        | Cron Triggers do Workers + tabela de jobs                             | Expirações, lembretes, retries de e-mail, limpeza de tabelas   |
| Anti-bot / rate limit | Cloudflare Turnstile + rate limit no Postgres                         | Upstash Redis em reavaliação (Q-066)                           |
| Erros                 | Sentry (free)                                                         |                                                                |
| Validação             | Zod compartilhado front/back                                          |                                                                |
| i18n                  | next-intl, pt-BR, textos em arquivos desde o início                   |                                                                |
| Testes                | Vitest (domínio), integração com Postgres real, Playwright + axe      |                                                                |

**Dev local**: `docker compose` com Postgres + PostGIS, S3Mock e Mailpit — sem nenhuma chave real
(NFR-017).

**Entidades principais**: User, Session, AdopterProfile (cpf_enc, cpf_hmac), OrganizationApplication
(inscrição e decisão da análise), Organization (nasce na aprovação; tipo, status, slug, tema),
OrganizationSlugHistory, Member, OrganizationRole, MemberPermissionGrant,
Animal, AnimalPhoto, AnimalStatusHistory, ApplicationForm (versionado), Application,
ApplicationStageHistory, Adoption, PostAdoptionCheckin, FosterHome, FosterAssignment, Incident,
IncidentEvidence, ModerationDecision, ReputationEvent, ContentReport, EmailOutbox, ScheduledJob,
AuditLog, PlatformSetting, Municipality (IBGE).

## 6. Roadmap

| Fase                         | Entregas                                                                                                              | Critério de pronto                                                                  |
| ---------------------------- | --------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| 0 — Fundação                 | Monorepo, CI, docker compose, governança, design system, Better Auth + 2FA, auditoria, parâmetros, proteção do `main` | Contribuidor externo clona, sobe e roda testes sem segredos; PR de fork passa no CI |
| 1 — Organizações             | FR-020 a FR-026, FR-030 a FR-032, NFR-001, NFR-007                                                                    | Testes de acesso cruzado entre organizações e de RBAC verdes                        |
| 2 — Adotantes e candidaturas | FR-002 (tela), FR-040 a FR-049, FR-080, FR-081, FR-090 a FR-093, NFR-003, NFR-022                                     | E2E do fluxo completo até "Concluída"                                               |
| 3 — Portal                   | FR-050 a FR-052, NFR-015                                                                                              | Busca rápida com seed de ~10 mil animais                                            |
| 4 — Reputação e pós-adoção   | FR-060 a FR-065, FR-070, FR-071                                                                                       | E2E de ocorrência ponta a ponta; auditoria completa                                 |
| 5 — Beta                     | FR-094, NFR-010, NFR-021, pentest básico (OWASP ZAP), 3–5 ONGs piloto                                                 | Go/no-go com checklist de segurança e LGPD                                          |

**Antes de produção** (qualquer fase): FR-003, FR-004, as travas da equipe da plataforma (BR-008,
BR-010, BR-013 a BR-016), NFR-008 (usuário de banco),
NFR-013 (Workers Paid), NFR-019, NFR-020.

**Pós-MVP**: termo de adoção digital em PDF, subdomínio/domínio próprio, eventos/feiras,
apadrinhamento, API pública, WhatsApp API, PWA, ES/EN.

## 7. Repositório, CI e governança

- **Repositório `HenriqueBragaMoreira/acolhemais`** (conta pessoal; transferir para a organização
  `acolhemais` ao entrar o 2º mantenedor ou ao formalizar a associação), AGPL-3.0, fork + PR,
  **DCO sign-off** (sem CLA).
- **`main` protegida** (NFR-018), **CODEOWNERS** com revisão reforçada nas áreas críticas
  (GOVERNANCE.md), **Conventional Commits** (título do PR no CI, commitlint local) e
  release-please (NFR-016).
- **CI em todo PR, sem segredos** (NFR-016). Preview com banco de branch do Neon só com o label
  `safe-to-preview` aplicado por mantenedor; nunca `pull_request_target` com checkout do fork.
- **Ambientes**: local → staging → produção (NFR-019). Dependabot semanal, agrupado.
- **Comunidade**: README, CONTRIBUTING, CODE_OF_CONDUCT, SECURITY.md, templates de issue/PR,
  labels `good first issue`/`help wanted`, ADRs, roadmap público.

## 8. Riscos e mitigação

| Risco                                                         | Mitigação                                                                                                                      |
| ------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| Responsabilidade jurídica da reputação recaindo sobre PF      | Moderação humana, defesa, revisão, sem texto livre compartilhado, revisão por advogado, associação antes de escalar            |
| Uso de CPF de terceiro                                        | OTP de e-mail, unicidade CPF↔conta, reputação só nasce de adoção com documento conferido ou ocorrência moderada (Q-032, Q-033) |
| Limites de free tier (e-mail/dia, banco 0,5 GB, Vercel Hobby) | Abstrações de provedor, monitoramento de cotas, plano B, buscar patrocínio/créditos OSS                                        |
| Sobrecarga de moderação                                       | Filas priorizadas, prazos, moderadores voluntários com 2FA e termo de confidencialidade (Q-055)                                |
| PR malicioso de fork                                          | CI sem segredos, CODEOWNERS, revisão reforçada, label para preview                                                             |
| Equipe da plataforma abusando do acesso                       | Catálogo sem personificação, 2FA obrigatório, auditoria só de acréscimo (BR-008, BR-010, BR-013, BR-015)                       |
| Burnout de mantenedor                                         | Governança clara, issues bem descritas, automação máxima                                                                       |

## 9. Pendências

Todas em [OPEN-QUESTIONS.md](OPEN-QUESTIONS.md). Fora delas: o domínio do site (`.org.br` exige
entidade; `.org`/`.com.br` servem em pessoa física).

## 10. Verificação

Cada fase só fecha com o critério de pronto (§6) e CI verde. Cenários E2E obrigatórios:

- inscrição → aprovação de organização (FR-020, FR-021);
- convite e concessão individual, com tentativa de escalada negada (FR-023, FR-024, BR-054);
- candidatura sem conta → criação de conta une o histórico (FR-042, FR-043);
- candidatura além do limite bloqueada (BR-074);
- adoção concluída → outras candidaturas aguardando confirmação → expiram (relógio simulado)
  (BR-080);
- ocorrência → defesa → decisão → selo visível a outra organização sem identificar a autora
  (FR-063, BR-100);
- inelegível bloqueado de se candidatar (BR-083);
- membro da organização A não acessa dados da B por ID direto na URL ou na API (NFR-001);
- foto enviada sai sem EXIF (NFR-007);
- exportação LGPD do titular (FR-090).
