# ADR 0005 — Autenticação e permissões com Better Auth e seus plugins

- **Status**: aceito
- **Data**: 2026-11-02
- **Substitui parcialmente**: o RBAC próprio descrito no [PLANO](../PLANO.md) §3.2

## Contexto

O plano prevê login por e-mail e senha e pelo Google, 2FA por TOTP, rate limit com bloqueio
progressivo, checagem de senha vazada, papéis da equipe da plataforma e RBAC dentro das
organizações. A API roda no Cloudflare Workers (ADR 0004), onde a configuração e a conexão com o
banco só existem durante a requisição e o plano gratuito limita a CPU a 10 ms por requisição.

## Decisão

Usar o **Better Auth 1.7** na `apps/api`, com os plugins oficiais sempre que cobrirem a regra, e
plugins próprios (hooks com `matcher`) onde não cobrem.

| Necessidade                             | Como                                                                                   |
| --------------------------------------- | -------------------------------------------------------------------------------------- |
| E-mail e senha                          | Núcleo do Better Auth, hash scrypt padrão (N=16384, r=16), senha com 12+ caracteres    |
| Senha vazada                            | Plugin `haveIBeenPwned` (k-anonimato), desligado em localhost                          |
| Rate limit                              | Núcleo, guardado no banco (`rate_limit`), IP do header `cf-connecting-ip`              |
| Bloqueio progressivo                    | Plugin próprio `loginLockout`, regra em `packages/domain`, tabela `login_throttle`     |
| Google                                  | Opcional (só com credenciais); vincula só a conta local com e-mail verificado          |
| 2FA                                     | Plugin `twoFactor` (TOTP + códigos de recuperação, `allowPasswordless`)                |
| 2FA no login pelo Google                | Plugin próprio `socialTwoFactor`, que reaproveita o hook do `twoFactor` no callback    |
| Equipe da plataforma                    | Plugin `admin` com papéis `superadmin`, `moderator`, `support` (catálogo no domínio)   |
| 2FA obrigatório da equipe da plataforma | Plugin próprio `platformTwoFactor` nas rotas `/admin/*`                                |
| RBAC das organizações                   | Plugin `organization` com o catálogo do domínio e papéis criados pela ONG (dynamic AC) |
| Mensagens de erro                       | Plugin `i18n` (pt) e traduções próprias dos códigos dos plugins em `auth/messages.ts`  |

### Schema e IDs

As tabelas do Better Auth são geradas pela CLI dele com `pnpm auth:generate`, que ajusta o
resultado ao padrão do projeto: IDs `uuidv7()` (o Better Auth usa `generateId: "uuid"` e deixa o
Postgres gerar) e timestamps com fuso. O CI falha se o schema gerado não bater com a
configuração. Tabelas com regra própria (como `login_throttle`) são escritas à mão.

O adapter Drizzle usa Relations v2, o que exigiu atualizar o Drizzle para `1.0.0-rc.5`.

### Instância por requisição

`createAuth` é chamado no primeiro uso de cada requisição, com a conexão do banco daquela
requisição (custa cerca de 1 ms medido localmente). Tarefas que o Better Auth executa depois da
resposta são registradas em `c.var.waitUntil()`, e a conexão só fecha quando elas terminam.

### Organizações

O catálogo de permissões continua em `packages/domain` e passa ao formato do plugin (recurso →
ações). A gestão da equipe vira os recursos nativos `member`, `invitation` e `ac`. O plugin já
garante: último Responsável não sai, só o Responsável promove a Responsável, e ninguém cria um papel
com permissões que não tem. Ficam para a Fase 1, sobre o plugin: concessões individuais
(papel ∪ concessões), trava contra escalada ao trocar o papel de um membro ou convidar, aprovação
da organização (criada no servidor com `createOrganization`), slugs reservados e histórico de slug.

## Consequências

- **CPU do hash de senha.** Medido localmente: cerca de 47 ms de CPU por hash no Node e 35 ms no
  `workerd`. Cadastro e login por senha não cabem nos 10 ms do Workers gratuito. Conforme o
  ADR 0004, o hash não será enfraquecido: **antes de liberar login por senha em produção, a API
  migra para o Workers Paid**, e o item de deploy mede o CPU real no painel da Cloudflare. Login
  pelo Google não é afetado.
- O bundle da API passou de 240 KB para cerca de 590 KB (gzip), abaixo do limite de 3 MB.
- `socialTwoFactor` depende de um detalhe interno do plugin `twoFactor` (o hook de login). O
  teste de ponta a ponta (Google, código TOTP e sessão) acusa se uma atualização quebrar isso.
- **Pendências antes de produção:** exigir e-mail verificado (`requireEmailVerification`), e-mails
  de verificação, redefinição de senha e convites (dependem do item de e-mail); limpeza periódica
  de `rate_limit` e `login_throttle`; traduzir os erros do plugin `organization`.
- Ninguém da equipe da plataforma personifica usuários nem define senha ou e-mail de outra pessoa.
  Mudar isso exige revisar o catálogo em `packages/domain/src/platform`.
