# Regras de negócio — API

Onde cada regra é aplicada no servidor. A regra em si está em
[../BUSINESS-RULES.md](../BUSINESS-RULES.md). Regra pura fica no domínio (sem framework nem
banco, com teste unitário); a API valida a entrada, checa escopo e permissão e orquestra.

### BR-001: Senha forte

- **Status**: `implemented`
- **Escopo (api)**: `minPasswordLength: 12` e plugin `haveIBeenPwned` (desligado só em
  localhost).

### BR-002: Bloqueio progressivo por e-mail

- **Status**: `in-progress`
- **Escopo (api)**: regra `loginLockoutMs` no domínio; plugin `loginLockout` com a tabela
  `login_throttle` (chave = HMAC do e-mail, upsert atômico). Faltam zerar o bloqueio na
  redefinição de senha (com FR-004) e a limpeza periódica da tabela.

### BR-003: Rate limit por IP

- **Status**: `implemented`
- **Escopo (api)**: `rateLimit` do Better Auth em banco (`rate_limit`), IP de `cf-connecting-ip`.
  Falta a limpeza periódica da tabela.

### BR-004: Vínculo do Google só com e-mail verificado

- **Status**: `implemented`
- **Escopo (api)**: `accountLinking.requireLocalEmailVerified` e `encryptOAuthTokens`.

### BR-005: 2FA vale também no Google

- **Status**: `implemented`
- **Escopo (api)**: plugin `socialTwoFactor`, que reaproveita o hook do `twoFactor` (achado pelo
  `matcher`); coberto por teste de integração a cada upgrade do Better Auth.

### BR-006: Redefinir a senha derruba as outras sessões

- **Status**: `implemented`
- **Escopo (api)**: `revokeSessionsOnPasswordReset`.

### BR-008: Ninguém age como outra pessoa

- **Status**: `in-progress`
- **Escopo (api)**: catálogo da plataforma sem `impersonate`, `set-password` e `set-email`
  (teste de domínio e de integração). Falta hook em `update-user` que só aceite `name` e `image`
  em `data`.

### BR-009: 2FA por app autenticador

- **Status**: `implemented`
- **Escopo (api)**: plugin `twoFactor` com `issuer` e `allowPasswordless`; `trustDevice` aceito
  (padrão do plugin, 30 dias).

### BR-010: Papéis da plataforma

- **Status**: `in-progress`
- **Escopo (api)**: `PLATFORM_ROLES` no domínio → plugin `admin` (`platformAc`); `platformCan` nas
  rotas próprias. Faltam tirar `user.delete` do superadmin e as travas de BR-008, BR-013 e BR-015.

### BR-013: Continuidade dos superadmins

- **Status**: `refined`
- **Escopo (api)**: hook em `set-role` (e em `create-user`) que recusa dar, tirar ou incluir
  `superadmin`; comando de linha para dar e tirar o papel (FR-011).

### BR-011: 2FA obrigatório para a equipe da plataforma

- **Status**: `implemented`
- **Escopo (api)**: plugin `platformTwoFactor` em `/admin/*` e `requirePlatformPermission` nas
  rotas próprias, ambos pela mesma função (`lacksPlatformTwoFactor`).

### BR-012: Permissão lida a cada requisição

- **Status**: `implemented`
- **Escopo (api)**: `getSession` em cada rota protegida; sem cache de sessão no cookie.

### BR-014: Banimento de conta

- **Status**: `in-progress`
- **Escopo (api)**: plugin `admin` (encerra sessões, recusa login); auditado. Falta hook em
  `ban-user` que recuse o único Responsável (`assertOwnerRemains`).

### BR-015: Conta criada pela equipe

- **Status**: `refined`
- **Escopo (api)**: hook em `create-user` que aceite só nome, e-mail e papel da equipe, sem senha
  nem `emailVerified`; e-mail de primeiro acesso com link de uso único (FR-080).

### BR-016: A equipe não remove contas

- **Status**: `refined`
- **Escopo (api)**: nenhum papel com `user.delete`; conta só é inativada, por FR-092.

### BR-020: Auditoria só de acréscimo

- **Status**: `implemented`
- **Escopo (api)**: tabela `audit_log` sem FK; trigger da migration `audit_log_append_only`.

### BR-021: Catálogo fechado de ações

- **Status**: `implemented`
- **Escopo (api)**: `AUDIT_ACTIONS` e `AuditMetadata` no domínio; `recordAudit` só aceita ações do
  catálogo.

### BR-022: Como a auditoria é gravada

- **Status**: `implemented`
- **Escopo (api)**: `recordAudit(tx, …)` nas rotas próprias; plugin `auditTrail` para os plugins
  do Better Auth.

### BR-023: O que é auditado

- **Status**: `in-progress`
- **Escopo (api)**: eventos de hoje cobertos pelo `auditTrail` e pela rota de parâmetros; os
  demais entram com os módulos.

### BR-024: Quem consulta a auditoria

- **Status**: `in-progress`
- **Escopo (api)**: `requirePlatformPermission({ audit_log: ['view'] })` para a auditoria inteira
  (pronto); falta a rota da organização, só para o Responsável, filtrada pela organização e sem
  IP nem Ray ID.

### BR-030: Parâmetros configuráveis

- **Status**: `implemented`
- **Escopo (api)**: `PLATFORM_SETTINGS`, `parsePlatformSetting` e `resolvePlatformSettings` no
  domínio; tabela `platform_setting` só com valores alterados.

### BR-031: Quem altera parâmetros

- **Status**: `implemented`
- **Escopo (api)**: `PATCH /platform/settings` valida o lote inteiro e grava valores e auditoria
  na mesma transação.

### BR-045: Ninguém apaga uma organização

- **Status**: `implemented`
- **Escopo (api)**: `disableOrganizationDeletion` e nenhum papel com `organization.delete`.

### BR-046: Organização nasce no servidor

- **Status**: `in-progress`
- **Escopo (api)**: `allowUserToCreateOrganization: false` (pronto); criação na aprovação (FR-021).

### BR-048: Cores da organização

- **Status**: `implemented`
- **Escopo (api)**: `deriveBrandTheme` e validação de cor hexadecimal no domínio.

### BR-050: Catálogo fixo de permissões

- **Status**: `implemented`
- **Escopo (api)**: `ORGANIZATION_STATEMENTS` no domínio → `organizationAc`.

### BR-051: Papéis padrão

- **Status**: `implemented`
- **Escopo (api)**: `SYSTEM_ROLES` no domínio → `organizationRoles`; `creatorRole: 'owner'`.

### BR-052: Papéis próprios da organização

- **Status**: `implemented`
- **Escopo (api)**: `dynamicAccessControl` do plugin (recusa nome de papel padrão e permissão que
  o autor não tem).

### BR-053: Permissão efetiva

- **Status**: `in-progress`
- **Escopo (api)**: `effectivePermissions` e `can` no domínio; falta a tabela de concessões e o
  uso nas rotas próprias (só permissões da plataforma, BR-053).

### BR-054: Ninguém concede o que não tem

- **Status**: `in-progress`
- **Escopo (api)**: `assertCanAssign` no domínio (falta separar convite, troca de papel e
  remoção, cada um com sua permissão); falta hook nas rotas do plugin.

### BR-055: Sempre um Responsável

- **Status**: `in-progress`
- **Escopo (api)**: plugin garante que o último Responsável não sai nem é rebaixado;
  `assertOwnerRemains` no domínio, a ligar no banimento (BR-014) e na inativação da conta
  (FR-092).

### BR-056: Convites

- **Status**: `in-progress`
- **Escopo (api)**: `invitationExpiresIn` de 7 dias, `requireEmailVerificationOnInvitation`,
  `cancelPendingInvitationsOnReInvite`; falta o envio do e-mail.

### BR-058: Equipe auditada

- **Status**: `implemented`
- **Escopo (api)**: plugin `auditTrail` nas rotas de organização, membros, convites e papéis.

### BR-142: Auditoria sobrevive à anonimização

- **Status**: `implemented`
- **Escopo (api)**: `audit_log` sem FK para usuário ou organização.
