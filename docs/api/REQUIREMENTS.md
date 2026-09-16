# Requisitos — API

Status e escopo da camada de servidor (`apps/api`, `packages/domain`, `packages/db`). A definição
de cada item está em [../REQUIREMENTS.md](../REQUIREMENTS.md); aqui fica só o que cabe à API.
Item ausente = ainda sem escopo definido para a API; ao refinar, adicione-o aqui.

#### FR-001: Entrar com e-mail e senha

- **Status**: `implemented`
- **Escopo (api)**: `POST /api/auth/sign-in/email` do Better Auth, com bloqueio progressivo e
  rate limit; erros com `code` estável e mensagem em português (plugin `i18n`).

#### FR-002: Criar conta com e-mail e senha

- **Status**: `implemented`
- **Escopo (api)**: `POST /api/auth/sign-up/email`, com senha mínima e checagem de vazamento;
  não abre sessão: envia a verificação do e-mail (FR-003).

#### FR-003: Verificar o e-mail

- **Status**: `implemented`
- **Escopo (api)**: Better Auth com `requireEmailVerification`, envio no cadastro e no login
  recusado, link de 24 h para `GET /api/auth/verify-email` que volta para
  `/entrar?verificado=1` (ou com `error`) sem abrir sessão; reenvio sob demanda em
  `POST /api/auth/send-verification-email`.

#### FR-004: Redefinir a senha

- **Status**: `implemented`
- **Escopo (api)**: `POST /api/auth/request-password-reset` (resposta igual com ou sem conta) e
  `POST /api/auth/reset-password`; e-mail com link de 1 h para `/redefinir-senha?token=` da web;
  `onPasswordReset` confirma o e-mail e zera o bloqueio; outras sessões derrubadas.

#### FR-005: Entrar com Google

- **Status**: `implemented`
- **Escopo (api)**: provedor `google` ligado só com as duas credenciais; `GET /auth/providers`
  responde `{ google }` para a tela decidir se mostra o botão.

#### FR-006: Código 2FA no login

- **Status**: `implemented`
- **Escopo (api)**: plugin `twoFactor` (TOTP e códigos de recuperação) e plugin próprio
  `socialTwoFactor`, que leva o desafio ao callback do Google e redireciona para a página de 2FA
  da web.

#### FR-007: Gerenciar a própria conta

- **Status**: `implemented`
- **Escopo (api)**: rotas do Better Auth para ativar/desativar 2FA, gerar códigos, trocar senha,
  vincular/desvincular o Google e encerrar sessões; cada ação de segurança auditada pelo plugin
  `auditTrail`.

#### FR-008: Painel mínimo e sair

- **Status**: `implemented`
- **Escopo (api)**: `GET /api/auth/get-session` e `POST /api/auth/sign-out`.

#### FR-010: Gerenciar usuários (equipe da plataforma)

- **Status**: `implemented`
- **Escopo (api)**: rotas `/api/auth/admin/*` do plugin `admin` com o catálogo da plataforma e os
  plugins `platformTwoFactor`, `platformGuards` (travas de BR-008, BR-013, BR-014, BR-015 e
  BR-016) e `firstAccess` (e-mail de primeiro acesso da conta criada pela equipe).

#### FR-011: Gerenciar superadmins pela linha de comando

- **Status**: `implemented`
- **Escopo (api)**: `pnpm auth:create-admin` (CLI do Better Auth) cria a conta; `pnpm
  auth:superadmin grant|revoke <email>` dá e tira `superadmin` de uma conta existente, recusa
  tirar o último e grava na auditoria. Nenhum dos dois tem rota HTTP.

#### FR-012: Consultar a auditoria

- **Status**: `in-progress`
- **Escopo (api)**: `GET /platform/audit-log` com filtros (autor, ação, alvo, organização) e
  cursor (id UUIDv7), só com `audit_log.view` e 2FA (pronto). Falta a rota da organização para o
  Responsável (BR-024).

#### FR-013: Consultar e alterar os parâmetros da plataforma

- **Status**: `implemented`
- **Escopo (api)**: `GET /platform/settings` (`platform_setting.view`) e
  `PATCH /platform/settings` (`platform_setting.update`), validando pelo catálogo do domínio.

#### FR-023: Gerenciar a equipe da organização

- **Status**: `implemented`
- **Escopo (api)**: plugin `organization` configurado (papéis do catálogo, papéis próprios,
  convite de 7 dias e enviado por e-mail, sem criação por usuário nem exclusão), auditado, com
  erros em português e o plugin `organizationGuards` (trava contra escalada, BR-054, e 2FA de
  membros sensíveis, BR-057).

#### FR-080: E-mails transacionais

- **Status**: `in-progress`
- **Escopo (api)**: `EmailProvider` em `src/email/` (Resend ou Mailpit por `fetch`, escolhido pela
  configuração), `deliver` (falha só no log, sem o destinatário) e textos em pt-BR; e-mails da
  Fase 0 em `auth/emails.ts`, enviados pelo Better Auth em segundo plano (pronto). Falta a fila
  com novas tentativas (Fase 2).

---

#### NFR-002: IDs não sequenciais

- **Status**: `implemented`
- **Escopo (api)**: `uuidv7()` do Postgres 18 em todas as tabelas; schema do Better Auth gerado
  por `pnpm auth:generate`, que troca UUIDv4 por UUIDv7 e põe fuso nos timestamps.

#### NFR-004: Proteção contra força bruta e senhas fracas

- **Status**: `implemented`
- **Escopo (api)**: núcleo do Better Auth (scrypt, rate limit em banco), plugins
  `haveIBeenPwned` e `loginLockout`.

#### NFR-005: Sessão e origem

- **Status**: `implemented`
- **Escopo (api)**: `trustedOrigins` e CORS só com `WEB_ORIGIN`; cookies seguros em HTTPS;
  sem `cookieCache`.

#### NFR-006: Headers de segurança

- **Status**: `implemented`
- **Escopo (api)**: `secureHeaders` do Hono em todas as rotas.

#### NFR-008: Auditoria inviolável pela aplicação

- **Status**: `in-progress`
- **Escopo (api)**: trigger por comando contra `UPDATE`/`DELETE`/`TRUNCATE` (pronto); usuário de
  banco da API sem esses direitos (deploy).

#### NFR-009: Segredos

- **Status**: `implemented`
- **Escopo (api)**: bindings validadas com Zod na primeira requisição; `BETTER_AUTH_SECRET`
  obrigatório e `AUTH_RATE_LIMIT=off` proibido fora de localhost.

#### NFR-012: Textos em português e traduzíveis

- **Status**: `implemented`
- **Escopo (api)**: erros no formato `{ code, message }`, com mensagens próprias e traduções dos
  códigos do Better Auth. Os códigos do `DomainError` seguem `MAIUSCULAS_COM_SUBLINHADO`, e o tipo
  do construtor (`Uppercase<string>`) recusa minúsculas na compilação.

#### NFR-014: Compatível com o runtime do Workers

- **Status**: `implemented`
- **Escopo (api)**: `wrangler dev` local, testes no `workerd`, instância do Better Auth por
  requisição.
