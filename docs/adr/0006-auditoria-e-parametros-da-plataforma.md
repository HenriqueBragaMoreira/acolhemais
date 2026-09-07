# ADR 0006 — Auditoria só de acréscimo e parâmetros da plataforma

- **Status**: aceito
- **Data**: 2026-11-02

## Contexto

O [PLANO](../PLANO.md) §4 exige auditoria append-only de permissões, revelação de dados
sensíveis, decisões de moderação, exportações e mudanças de status de ONG, e o §3.10 exige que
limites e prazos (candidaturas, defesa, pós-adoção, teto da taxa) sejam configuráveis sem deploy.
Boa parte das ações sobre permissões acontece dentro dos plugins do Better Auth (ADR 0005), que
não expõem uma transação onde o nosso registro possa entrar.

## Decisão

### Auditoria

- Tabela `audit_log`: autor (`actor_user_id`, `null` = sistema), organização, ação, alvo,
  detalhes em jsonb, IP e Ray ID da Cloudflare. Id UUIDv7, que também serve de cursor.
- **Só de acréscimo no banco**: um trigger por comando recusa `UPDATE`, `DELETE` e `TRUNCATE`.
- **Sem chave estrangeira** para usuário ou organização: a exclusão de uma conta (LGPD) não pode
  alterar a auditoria. Os detalhes guardam ids, papéis e nomes de campos, nunca nome, e-mail, CPF
  ou segredos.
- **Catálogo fechado** de ações em `packages/domain/src/audit`, com o formato tipado dos detalhes
  de cada uma. Ação nova entra no catálogo (revisão de 2 mantenedores, CODEOWNERS).
- **Como gravar:**
  - Rotas e regras próprias: `recordAudit(tx, ...)` **na mesma transação** da mudança.
  - Ações do Better Auth: plugin `auditTrail`. Antes da ação guarda o autor e o estado anterior;
    depois, se deu certo, grava. O registro vem **logo após** a mudança já salva; se a gravação
    falhar, a mudança fica sem registro e o erro vai para o log da API.
  - Funções só do servidor, sem rota (ex.: `auth.api.addMember`), não passam pelo plugin: o
    código que as chama registra a auditoria.
- Eventos registrados hoje: papéis da plataforma, banimento, remoção de usuário, sessões
  encerradas pela equipe, dados da organização, membros, convites e papéis da ONG, ativação e
  desativação do 2FA, novos códigos de recuperação, troca de senha, vínculo e desvínculo de login
  externo e alteração de parâmetros. Cada login **não** é registrado (a sessão e o bloqueio
  progressivo já guardam isso); revelação de CPF, moderação e exportações entram com os módulos
  delas.
- Consulta: `GET /platform/audit-log` (`audit_log.view`, só o superadmin), com filtros e paginação.

### Parâmetros da plataforma

- Catálogo em `packages/domain/src/platform/settings.ts`: padrão, limites e unidade de cada
  parâmetro, com validação pura.
- Tabela `platform_setting` guarda **só os valores alterados**; os demais valem o padrão do
  código. Um valor guardado que deixou de ser válido lança erro em vez de cair no padrão em
  silêncio: mudar as regras de um parâmetro exige migrar os valores guardados.
- `GET /platform/settings` (`platform_setting.view`) e `PATCH /platform/settings`
  (`platform_setting.update`, só o superadmin). O PATCH valida tudo antes de gravar e registra
  cada valor alterado na auditoria, na mesma transação.
- O teto da taxa de adoção nasce "não definido" (PLANO §9).

### Rotas próprias da plataforma

`requirePlatformPermission` exige sessão, papel da plataforma com as permissões pedidas (o
catálogo do ADR 0005) e 2FA ativo. Previsto para a Fase 1, entrou junto com as primeiras rotas.

## Consequências

- O dono da tabela no Postgres ainda pode desligar o trigger ou apagar a tabela. **No item de
  deploy**, a API passa a usar um usuário de banco sem esses direitos (nem `UPDATE`/`DELETE` em
  `audit_log`), separado do usuário das migrations.
- Sem cadeia de hashes: adulteração feita direto no banco por quem tem acesso de dono não é
  detectável. Reavaliar se a auditoria virar prova em disputas (reputação, Fase 4).
- Ações do Better Auth podem, raramente, ficar sem registro (falha logo após a mudança). Os logs
  da API acusam esses casos.
- O IP é dado pessoal e a tabela não aceita exclusão: **a política de retenção do IP (e como
  aplicá-la sem abrir mão do append-only) precisa ser decidida antes do beta.**
- `auditTrail` depende dos caminhos e respostas das rotas dos plugins. Os testes de integração
  acusam se uma atualização do Better Auth mudar isso.
