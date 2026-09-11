# Regras de negócio

Fonte única das regras do Acolhe+. Requisitos em [REQUIREMENTS.md](REQUIREMENTS.md), decisões
pendentes em [OPEN-QUESTIONS.md](OPEN-QUESTIONS.md), onde cada regra é aplicada em
[api/BUSINESS-RULES.md](api/BUSINESS-RULES.md) e [web/BUSINESS-RULES.md](web/BUSINESS-RULES.md).

Status como em [REQUIREMENTS.md](REQUIREMENTS.md#status). **Em aberto** aponta uma questão que
pode mudar a regra: em `draft`, ela só vira `refined` depois da decisão; já implementada, a regra
volta para `in-progress` se a decisão pedir mudança. Mudar uma regra de reputação, privacidade ou
permissão exige revisão reforçada (GOVERNANCE.md).

Nomes de permissão são os do código (`recurso.ação`, em inglês). Prazos e limites marcados com
`parâmetro` vêm de BR-030 e não podem ser fixados no código.

---

## Contas e autenticação

### BR-001: Senha forte

- **Status**: `implemented`
- **Quando**: alguém cadastra, troca ou redefine a senha
- **Então**: exige 12+ caracteres e recusa senhas que aparecem em vazamentos (consulta por
  k-anonimato: só o prefixo do hash SHA-1 sai do servidor). Fora de localhost a checagem é
  sempre ligada. Hash scrypt com os parâmetros padrão do Better Auth, nunca enfraquecidos.
- **Por quê**: senha curta ou vazada é a porta mais comum de invasão (OWASP ASVS L2).

### BR-002: Bloqueio progressivo por e-mail

- **Status**: `in-progress`
- **Quando**: o login por senha falha por senha errada
- **Então**: conta erros seguidos por e-mail (guardado como HMAC). A partir de 5 erros bloqueia
  1 min; de 10, 15 min; de 15, 60 min — cada novo erro renova o bloqueio. Bloqueado recusa até
  a senha certa, com `Retry-After`. Senha certa zera a contagem; 24 h sem errar também; redefinir
  a senha (FR-004) também. Vale para e-mails sem conta (não revela quais existem).
- **Por quê**: o rate limit por IP não segura ataque distribuído contra uma conta.
- **Nota**: quem sabe o e-mail de alguém consegue manter o login por senha dele travado. Aceito:
  o Google e a redefinição de senha continuam funcionando, e o rate limit por IP limita o
  atacante. Falta só zerar na redefinição, que entra com FR-004.

### BR-003: Rate limit por IP

- **Status**: `implemented`
- **Quando**: qualquer rota do Better Auth é chamada
- **Então**: limite por IP (header `cf-connecting-ip`), guardado no banco, com limites menores
  nas rotas sensíveis. Só pode ser desligado com a API em localhost (E2E).
- **Por quê**: no Workers a memória não é compartilhada entre instâncias.

### BR-004: Vínculo do Google só com e-mail verificado

- **Status**: `implemented`
- **Quando**: alguém entra pelo Google com o e-mail de uma conta local
- **Então**: vincula só se o e-mail da conta local estiver verificado; senão recusa. Tokens do
  Google guardados cifrados.
- **Por quê**: impede o pré-sequestro (cadastrar o e-mail alheio com senha e manter acesso
  depois que o dono entrar pelo Google).

### BR-005: 2FA vale também no Google

- **Status**: `implemented`
- **Quando**: quem tem 2FA ativo volta do login pelo Google
- **Então**: a sessão não abre; vai para a página do código 2FA, como no login por senha.
- **Por quê**: o plugin de 2FA só desafia o login por senha; sem isso o Google pularia o 2FA.

### BR-006: Redefinir a senha derruba as outras sessões

- **Status**: `implemented`
- **Quando**: a senha é redefinida pelo "esqueci a senha"
- **Então**: todas as outras sessões da conta são encerradas.
- **Por quê**: quem redefine pode estar recuperando uma conta invadida.
- **Nota**: já configurado; o fluxo depende de FR-004.

### BR-007: E-mail verificado

- **Status**: `refined`
- **Quando**: uma conta com senha entra, aceita convite ou se candidata
- **Então**: o login por senha exige e-mail verificado; quem tenta entrar sem verificar é
  recusado e recebe de novo o e-mail de verificação. Aceitar convite também exige (pronto).
  Quem entra pelo Google já chega com o e-mail verificado pelo Google.
- **Por quê**: o e-mail é o canal das decisões, prazos e redefinição de senha; uma regra só para
  todas as ações.

### BR-008: Ninguém age como outra pessoa

- **Status**: `implemented`
- **Quando**: alguém da equipe da plataforma age sobre a conta de outra pessoa
- **Então**: ninguém personifica usuários, define a senha ou o e-mail de outra pessoa, nem
  enfraquece a segurança da conta dela (2FA, e-mail verificado). Editar a conta de outra pessoa
  aceita só nome e foto, para a equipe corrigir o que o titular não consegue; qualquer outro
  campo é recusado. Criar conta segue BR-015. Mudar isso exige revisar o catálogo da
  plataforma.
- **Por quê**: seria acesso a dados pessoais sem o titular e porta para sequestro de conta.

### BR-009: 2FA por app autenticador

- **Status**: `in-progress`
- **Quando**: alguém ativa ou usa o 2FA
- **Então**: TOTP (emissor "Acolhe+") com códigos de recuperação de uso único; segredo e códigos
  cifrados com o segredo da API. Quem só usa o Google também pode ativar. Para desativar ou
  gerar novos códigos, quem tem senha informa a senha. Na verificação do código, qualquer pessoa
  (inclusive a equipe da plataforma) pode marcar "confiar neste dispositivo": o navegador fica
  30 dias sem pedir o código. A tela oferece a caixa, desmarcada por padrão.
- **Por quê**: 2FA é obrigatório para a equipe da plataforma (BR-011) e para dados sensíveis
  (BR-057). Desmarcada por padrão por causa de computadores compartilhados.

---

## Equipe da plataforma

### BR-010: Papéis da plataforma

- **Status**: `implemented`
- **Quando**: alguém da equipe usa uma rota da plataforma
- **Então**: vale a tabela abaixo (um usuário pode ter mais de um papel; vale a união). Usuário
  comum tem o papel `user`, sem permissão da plataforma.

  | Permissão                                  | superadmin | moderator | support |
  | ------------------------------------------ | :--------: | :-------: | :-----: |
  | `user.list`, `user.get`                    |     ✓      |     ✓     |    ✓    |
  | `user.create` (BR-015)                     |     ✓      |           |         |
  | `user.update` (só nome e foto, BR-008)     |     ✓      |           |         |
  | `user.set-role` (sem `superadmin`, BR-013) |     ✓      |           |         |
  | `user.ban` (BR-014)                        |     ✓      |           |         |
  | `session.list/revoke/delete`               |     ✓      |           |         |
  | `organization_review.view`                 |     ✓      |     ✓     |    ✓    |
  | `organization_review.decide`               |     ✓      |     ✓     |         |
  | `incident.view`, `incident.decide`         |     ✓      |     ✓     |         |
  | `content_report.view`                      |     ✓      |     ✓     |    ✓    |
  | `content_report.decide`                    |     ✓      |     ✓     |         |
  | `platform_setting.view`                    |     ✓      |     ✓     |    ✓    |
  | `platform_setting.update`                  |     ✓      |           |         |
  | `audit_log.view`                           |     ✓      |           |         |

  Ninguém tem `user.impersonate`, `user.impersonate-admins`, `user.set-password`,
  `user.set-email` nem `user.delete` (BR-016).

- **Por quê**: menor privilégio; o suporte só lê e não vê ocorrências.

### BR-011: 2FA obrigatório para a equipe da plataforma

- **Status**: `implemented`
- **Quando**: alguém com papel da plataforma chama uma rota da equipe (as do plugin `admin` ou
  as próprias)
- **Então**: sem 2FA ativo, recusa com `TWO_FACTOR_REQUIRED`.
- **Por quê**: a equipe acessa dados de todas as organizações.

### BR-012: Permissão lida a cada requisição

- **Status**: `implemented`
- **Quando**: qualquer rota autenticada
- **Então**: papel, banimento e 2FA vêm da sessão lida no banco a cada requisição (sem cache no
  cookie): tirar um papel ou banir vale na hora.
- **Por quê**: permissão antiga em cache é escalada de privilégio.

### BR-013: Continuidade dos superadmins

- **Status**: `implemented`
- **Quando**: um papel de superadmin é dado ou retirado
- **Então**: só pela linha de comando (FR-011), nunca pela API. Pela API, o superadmin só dá ou
  tira `moderator` e `support`; pedido que dê, tire ou inclua `superadmin` é recusado, inclusive
  sobre a própria conta. Pela API ninguém bane um superadmin: o papel sai antes, pela linha de
  comando. A linha de comando recusa tirar o último superadmin.
- **Por quê**: superadmin altera parâmetros e lê a auditoria; ficar sem nenhum trava a
  plataforma, e promover sem controle concentra poder. Quem tem acesso ao deploy é quem cria.

### BR-014: Banimento de conta

- **Status**: `implemented`
- **Quando**: o superadmin bane uma conta
- **Então**: as sessões dela são encerradas, o login é recusado até o fim do banimento (ou para
  sempre) e o motivo e o prazo vão para a auditoria. Ninguém bane a si mesmo nem um superadmin
  (BR-013). Recusa banir quem é o único Responsável de uma organização ativa ou suspensa
  (BR-055). Banimento é sobre a conta; inelegibilidade para adotar é outra coisa (BR-096).
- **Nota**: até existir o status da organização (Fase 1), toda organização conta como ativa.

### BR-015: Conta criada pela equipe

- **Status**: `in-progress`
- **Quando**: o superadmin cria a conta de outra pessoa
- **Então**: informa só nome, e-mail e, se for da equipe, o papel (`moderator` ou `support`,
  BR-013). A conta nasce sem senha e com o e-mail não verificado; senha, "e-mail verificado" e
  qualquer outro campo são recusados. A pessoa recebe um e-mail de primeiro acesso, que é o
  mesmo link de uso único da redefinição de senha (FR-004): ao usá-lo, cria a senha (BR-001) e o
  e-mail fica verificado. Se o link expirar, "esqueci a senha" envia outro, mesmo sem senha
  criada. Depois, se quiser, ativa o 2FA (obrigatório só para a equipe, BR-011). Até usar o
  link, entrar pelo Google com esse e-mail é recusado (BR-004).
- **Nota**: a trava da criação está pronta (só nome, e-mail e papel; conta sem senha e sem login
  por senha). A redefinição de senha cria o login quando ele não existe (Better Auth 1.7.15).
  Faltam o e-mail de primeiro acesso (FR-080) e marcar o e-mail como verificado quando a senha é
  redefinida (`onPasswordReset`): usar o link já prova que a pessoa recebe o e-mail. Vale para
  toda redefinição, não só a de primeiro acesso.
- **Por quê**: a equipe pode abrir contas sem nunca conhecer a senha de ninguém, e quem pré-cria
  uma conta não fica com acesso a ela.

### BR-016: A equipe não remove contas

- **Status**: `implemented`
- **Quando**: alguém da equipe quer remover uma conta
- **Então**: recusado para todos (ninguém tem `user.delete`); conta nunca é apagada. Só o
  titular inativa a própria conta, pelo fluxo de FR-092 (BR-140). Para afastar alguém, a equipe
  bane (BR-014).
- **Por quê**: apagar a conta apagaria o histórico que sustenta a reputação e deixaria
  organizações sem Responsável.

---

## Auditoria

### BR-020: Auditoria só de acréscimo

- **Status**: `implemented`
- **Quando**: qualquer registro é gravado na auditoria
- **Então**: o banco recusa `UPDATE`, `DELETE` e `TRUNCATE` na tabela. Sem chave estrangeira
  para usuário ou organização. Os detalhes guardam ids, papéis e nomes de campos — nunca nome,
  e-mail, CPF ou segredos. Guarda autor (`null` = sistema), organização, ação, alvo, IP e Ray ID.
- **Por quê**: a auditoria precisa sobreviver à anonimização de contas (LGPD) e a quem quiser apagar
  rastros pela aplicação.

### BR-021: Catálogo fechado de ações

- **Status**: `implemented`
- **Quando**: o código registra uma ação
- **Então**: só ações do catálogo do domínio, cada uma com tipo de alvo e formato de detalhes
  tipado; nomes `recurso.verbo` em minúsculas. Ação nova entra no catálogo com revisão
  reforçada.

### BR-022: Como a auditoria é gravada

- **Status**: `implemented`
- **Quando**: uma mudança auditada é salva
- **Então**: rotas e regras próprias gravam **na mesma transação** da mudança. Ações dos plugins
  do Better Auth são gravadas **logo após** a mudança, só se ela deu certo; se a gravação
  falhar, o erro vai para o log da API. Funções só do servidor (ex.: adicionar membro sem rota)
  são auditadas por quem as chama. Ações recusadas não são registradas.

### BR-023: O que é auditado

- **Status**: `in-progress`
- **Quando**: acontece um dos eventos abaixo
- **Então**: registra.
  - **Hoje**: conta criada/alterada/removida pela plataforma, papel da plataforma, banimento e
    desbanimento, sessões encerradas pela equipe; dados da organização, membros (entrada,
    saída, remoção, troca de papel), convites (envio, cancelamento, aceite, recusa), papéis da
    organização; 2FA ativado/desativado, novos códigos de recuperação, troca de senha, vínculo
    e desvínculo de login externo; parâmetros da plataforma.
  - **Com seus módulos**: mudanças de status de organização, concessões individuais, revelação
    de CPF, decisões de moderação (inscrição, conteúdo, ocorrência), exportações de dados,
    inativação de conta, acesso a evidências privadas.
  - **Não**: cada login (a sessão e o bloqueio já guardam isso).

### BR-024: Quem consulta a auditoria

- **Status**: `in-progress`
- **Quando**: alguém consulta a auditoria
- **Então**: a auditoria inteira só quem tem `audit_log.view` (o superadmin; pronto). O
  Responsável de uma organização vê só os eventos dela (filtrados por `organization_id`), sem o
  IP e sem o Ray ID.
- **Nota**: falta a consulta do Responsável (Fase 1).

### BR-025: Retenção do IP

- **Status**: `draft`
- **Quando**: um registro da auditoria guarda o IP
- **Então**: a definir antes do beta, sem abrir mão do só de acréscimo.
- **Por quê**: IP é dado pessoal e a tabela não aceita exclusão.
- **Em aberto**: Q-060

---

## Parâmetros da plataforma

### BR-030: Parâmetros configuráveis

- **Status**: `implemented`
- **Quando**: uma regra usa um prazo ou limite da plataforma
- **Então**: lê o valor em vigor. O banco guarda só os valores alterados; os demais valem o
  padrão do catálogo. Um valor guardado que deixou de ser válido lança erro (mudar as regras de
  um parâmetro exige migrar os valores).

  | Parâmetro                   | Padrão        | Limites                     | Usado em       |
  | --------------------------- | ------------- | --------------------------- | -------------- |
  | `maxActiveApplications`     | 3             | 1–5                         | BR-074         |
  | `applicationResponseDays`   | 7 dias        | 1–60                        | BR-080, BR-081 |
  | `incidentDefenseDays`       | 15 dias       | 5–60                        | BR-095         |
  | `minorIncidentExpiryMonths` | 24 meses      | 1–120                       | BR-096         |
  | `ineligibilityReviewMonths` | 60 meses      | 12–120                      | BR-099         |
  | `postAdoptionCheckinDays`   | [30, 90, 180] | 1–6 itens, 1–730, crescente | BR-110         |
  | `refusalResubmissionDays`   | 30 dias       | 0–365                       | BR-042         |
  | `adoptionFeeCapCents`       | `null` (R$ 0) | 0–50000 (R$ 500)            | BR-063         |

- **Em aberto**: Q-036, Q-061

### BR-031: Quem altera parâmetros

- **Status**: `implemented`
- **Quando**: alguém altera parâmetros
- **Então**: só `platform_setting.update` (superadmin, com 2FA). Valida tudo antes de gravar
  (um inválido recusa o lote); cada valor alterado vai para a auditoria com o anterior e o
  novo, na mesma transação.

### BR-032: Parâmetro alterado e prazos em andamento

- **Status**: `refined`
- **Quando**: um parâmetro muda enquanto há prazos correndo ou limites já atingidos
- **Então**: todo prazo é calculado e gravado quando começa, com o parâmetro em vigor naquele
  momento; mudar o parâmetro não altera prazos já em andamento. Limites valem só para novas
  ações: quem já passou do novo limite não perde nada, só não abre mais.
- **Por quê**: ninguém perde um prazo ou uma candidatura por uma mudança que não viu.

---

## Organizações

### BR-040: Tipos de organização

- **Status**: `refined`
- **Quando**: alguém se inscreve
- **Então**: **ONG** — CNPJ com dígito válido e consulta pública (BrasilAPI) ativa. **Protetor
  independente** — CPF válido + comprovação de atuação (redes sociais, referências, fotos de
  resgates), avaliada pela moderação. Um CNPJ tem no máximo uma organização não encerrada, e um
  CPF, no máximo uma organização de protetor independente. A mesma pessoa pode ser membro de
  várias organizações (inclusive sendo protetora independente).

### BR-041: Ciclo de vida da inscrição e da organização

- **Status**: `refined`
- **Quando**: a moderação decide ou a situação muda
- **Então**: a **inscrição** é um registro próprio, com os dados, os documentos e o status da
  análise: `Pendente → Em análise ⇄ Informações solicitadas → Aprovada | Recusada`. A decisão
  (aprovar ou recusar) guarda quem decidiu, quando e o motivo. A **organização** só nasce na
  aprovação (BR-046) e tem o próprio status: `Ativa → Suspensa → Ativa | Encerrada`. Ela guarda o
  status atual, o motivo e a data da última mudança; o histórico completo de cada mudança (quem,
  quando, de/para, motivo) fica na auditoria (BR-023).
- **Por quê**: o plugin `organization` só enxerga organizações aprovadas, sem hook que bloqueie
  equipe e convites de uma ONG ainda em análise.

### BR-042: Recusa e nova inscrição

- **Status**: `refined`
- **Quando**: a inscrição é recusada
- **Então**: a recusa tem motivo enviado ao inscrito; nova inscrição só depois de
  `refusalResubmissionDays` (parâmetro). A espera vale para o documento (CNPJ da ONG ou HMAC do
  CPF do protetor) **e** para a conta que se inscreveu.
- **Por quê**: sem isso, basta outra conta para tentar de novo.

### BR-043: Suspensão

- **Status**: `refined`
- **Quando**: a moderação suspende (ex.: indício de venda de animais)
- **Então**: tudo congela até a reativação:
  - a página e os animais saem do portal e voltam na reativação;
  - toda escrita da organização é recusada, inclusive convites, troca de papéis e as demais rotas
    do plugin `organization`; a equipe mantém só a leitura;
  - os prazos em andamento (candidaturas, convites, respostas) ficam pausados e voltam de onde
    pararam na reativação;
  - quem tem candidatura ativa recebe um aviso neutro ("a organização está temporariamente
    indisponível"), sem citar o motivo.

### BR-044: Encerramento

- **Status**: `refined`
- **Quando**: a organização é encerrada
- **Então**: animais arquivados, candidaturas abertas canceladas com aviso aos adotantes,
  histórico de adoções mantido (alimenta a reputação). A página pública mostra só "organização
  encerrada", sem animais; o slug não volta a ficar livre (BR-047).

### BR-045: Ninguém apaga uma organização

- **Status**: `implemented`
- **Quando**: alguém tenta apagar uma organização
- **Então**: recusado para todos; encerrar é um status.
- **Por quê**: o histórico de adoções sustenta a reputação.

### BR-046: Organização nasce no servidor

- **Status**: `in-progress`
- **Quando**: alguém tenta criar uma organização
- **Então**: usuário nenhum cria organização pela API; ela nasce da aprovação da inscrição, com
  o inscrito como Responsável e os papéis padrão (bloqueio pronto; a aprovação é FR-021).
  Antes disso existe só a inscrição (BR-041).

### BR-047: Slug

- **Status**: `refined`
- **Quando**: uma organização escolhe ou troca o slug
- **Então**: único, minúsculo, fora da lista de reservados (`admin`, `api`, `ong`, `portal`, …).
  Troca permitida; o antigo vai para o histórico e redireciona (301) para o atual. Slug usado
  uma vez fica reservado para sempre, inclusive o de organização encerrada: nenhuma outra
  organização o recebe.
- **Por quê**: o redirecionamento mandaria o público para a organização errada.

### BR-048: Cores da organização

- **Status**: `implemented`
- **Quando**: a organização escolhe cor primária e secundária
- **Então**: qualquer cor é aceita; nada é recusado por contraste. O tema é derivado com
  contraste WCAG AA garantido: texto preto ou branco sobre a cor, e uma variante escurecida da
  primária para texto e foco sobre branco (pronto no domínio e na web). A prévia mostra o tema
  já ajustado. Layout fixo. A cor secundária só aparece em detalhes decorativos (faixas, ícones,
  fundo do banner), nunca em texto nem em botão; o desenho fino sai do design da tela de
  personalização (FR-025).

### BR-049: Doações só para a organização

- **Status**: `refined`
- **Quando**: a página mostra como doar
- **Então**: só a chave PIX (e QR) da própria organização. A plataforma nunca recebe, guarda ou
  intermedia dinheiro. Qualquer tipo de chave é aceito; antes de salvar, um aviso explica que a
  chave fica pública, e chave CPF pede confirmação explícita.
- **Por quê**: protetor independente costuma usar CPF ou telefone como chave.

---

## Permissões na organização (RBAC)

### BR-050: Catálogo fixo de permissões

- **Status**: `implemented`
- **Quando**: alguém monta um papel ou concede uma permissão
- **Então**: só permissões do catálogo; a organização combina, não cria. Recursos do plugin:
  `organization.update`, `member.create|update|delete`, `invitation.create|cancel`,
  `ac.create|read|update|delete`. Da plataforma: `animal.create|update|archive`,
  `application.view|view_sensitive|move_stage|approve`, `adoption.complete`,
  `post_adoption.review`, `incident.report`, `foster.manage`, `page.customize`.
  `organization.delete` existe no plugin, mas ninguém recebe. Permissão nova exige revisão
  reforçada.

### BR-051: Papéis padrão

- **Status**: `implemented`
- **Quando**: uma organização é criada
- **Então**: ela tem três papéis fixos:
  - **Responsável** (`owner`): tudo, menos `organization.delete`.
  - **Coordenador** (`coordinator`): animais (criar, editar, arquivar), candidaturas (ver, ver
    dados sensíveis, mover, aprovar), concluir adoção, avaliar pós-adoção, reportar ocorrência,
    lar temporário.
  - **Voluntário** (`volunteer`): criar e editar animais. Não arquiva nem vê candidaturas.
- **Nota**: todo membro é adicionado com um desses papéis ou um papel próprio, nunca com o
  padrão `member` da tabela do plugin (que não existe no catálogo). Quem quiser um Voluntário
  que veja candidaturas cria um papel próprio (BR-052).

### BR-052: Papéis próprios da organização

- **Status**: `implemented`
- **Quando**: a organização cria ou edita um papel
- **Então**: só com permissões do catálogo, sem repetir o nome de um papel padrão, e ninguém
  cria um papel com permissão que não tem.

### BR-053: Permissão efetiva

- **Status**: `in-progress`
- **Quando**: o sistema checa se um membro pode fazer algo
- **Então**: permissões do papel ∪ concessões individuais. Concessões só somam, nunca tiram
  (regra pura pronta; concessões ainda não existem). As concessões ficam numa tabela própria,
  lida pelo nosso `can()` nas rotas próprias, e só podem ser de permissões da plataforma
  (`animal.*`, `application.*`, `adoption.*`, `post_adoption.*`, `incident.*`, `foster.*`,
  `page.*`). Gestão da equipe (`organization.*`, `member.*`, `invitation.*`, `ac.*`) vem só do
  papel.
- **Por quê**: o plugin só conhece permissões de papéis; uma concessão de gestão da equipe não
  valeria nas rotas dele.

### BR-054: Ninguém concede o que não tem

- **Status**: `in-progress`
- **Quando**: alguém concede uma permissão, convida com um papel, troca o papel de um membro ou
  remove um membro
- **Então**: só quem já tem todas as permissões envolvidas:
  - **convidar** com o papel P exige `invitation.create` e ter todas as permissões de P;
  - **trocar o papel** de alguém exige `member.update` e ter todas as permissões do papel antigo
    e do novo;
  - **remover** um membro exige `member.delete` e ter todas as permissões dele;
  - **conceder** uma permissão exige gerenciar a equipe e ter a permissão concedida.

  Só o Responsável promove a Responsável (pronto no plugin). A regra fica no domínio e é
  aplicada por hook nas rotas do plugin; falta ajustar `assertCanAssign` (hoje exige
  `member.update` até para convites) e ligar o hook.

- **Por quê**: escalada de privilégio por convite ou troca de papel.

### BR-055: Sempre um Responsável

- **Status**: `in-progress`
- **Quando**: alguém sai, é removido, muda de papel, é banido ou inativa a conta
- **Então**: a organização ativa ou suspensa mantém ao menos um Responsável: o último não sai,
  não é removido nem rebaixado (pronto no plugin), não pode ser banido (BR-014, pronto) nem
  inativar a conta (BR-140, FR-092) enquanto for o único.

### BR-056: Convites

- **Status**: `in-progress`
- **Quando**: alguém convida para a equipe
- **Então**: entrada só por convite por e-mail; vale 7 dias; aceitar exige e-mail verificado e o
  mesmo e-mail do convite; reconvidar cancela os convites pendentes da mesma pessoa (pronto). O
  e-mail do convite depende de FR-080.

### BR-057: 2FA para dados sensíveis

- **Status**: `refined`
- **Quando**: um membro tem permissão sensível: `application.view_sensitive`,
  `organization.update` ou qualquer permissão de gestão da equipe (`member.*`, `invitation.*`,
  `ac.*`)
- **Então**: precisa de 2FA ativo (regra pura pronta; ainda não aplicada). Sem ele, todas as
  rotas da organização respondem `TWO_FACTOR_REQUIRED`, exceto as de ativar o 2FA, como na
  equipe da plataforma (BR-011). Convidar ou promover alguém para um papel sensível continua
  permitido; a exigência vale quando a pessoa age. O Responsável e o Coordenador sempre caem
  aqui.

### BR-058: Equipe auditada

- **Status**: `implemented`
- **Quando**: muda a equipe, um convite ou um papel da organização
- **Então**: vai para a auditoria (BR-023).

### BR-059: Membro em causa própria

- **Status**: `refined`
- **Quando**: um membro da organização se candidata a um animal dela, ou é alvo de uma
  ocorrência
- **Então**: pode se candidatar a um animal da própria organização, mas não move, aprova,
  conclui nem avalia a própria candidatura ou adoção, nem reporta ou decide ocorrência sobre si
  mesmo; outro membro com a permissão precisa fazer.
- **Por quê**: ninguém decide em causa própria.

---

## Animais

### BR-060: Dados do animal

- **Status**: `draft`
- **Quando**: um animal é cadastrado ou publicado
- **Então**: nome, espécie (cão/gato/outro), sexo, faixa etária + nascimento aproximado, porte,
  pelagem, temperamento (convive com crianças/cães/gatos), **saúde obrigatória** (castrado,
  vacinas, vermifugado, FIV/FeLV para gatos, necessidades especiais), 1–10 fotos com capa,
  link de vídeo, história, cidade, taxa de adoção opcional. Rascunho pode ficar incompleto;
  publicar exige os obrigatórios.

### BR-061: Fotos

- **Status**: `draft`
- **Quando**: alguém envia fotos
- **Então**: 1 a 10 por animal, uma é a capa; reencodadas sem EXIF/GPS (NFR-007). Fotos
  marcadas como sensíveis (ferimentos de resgate) aparecem desfocadas até o clique.

### BR-062: Só a cidade é pública

- **Status**: `draft`
- **Quando**: um animal, organização ou lar temporário aparece publicamente
- **Então**: só a cidade; nunca o endereço da organização nem o do lar temporário.

### BR-063: Taxa de adoção não é preço

- **Status**: `draft`
- **Quando**: a organização define uma taxa de adoção
- **Então**: opcional; a taxa do animal nasce vazia (sem taxa). Se maior que zero, exige
  justificativa (castração, vacinas…) e não passa de `adoptionFeeCapCents` (parâmetro). O
  parâmetro nasce `null`, que vale R$ 0: nenhuma taxa até a equipe definir um teto, que vai no
  máximo a R$ 500. Indício de comércio vira denúncia e pode suspender a organização (BR-043).
- **Por quê**: a taxa só cobre custos; venda de animais é proibida.

### BR-064: Status do animal

- **Status**: `refined`
- **Quando**: a situação do animal muda
- **Então**: `Rascunho → Disponível ⇄ Em processo → Adotado`, além de `Indisponível`
  (tratamento) e `Arquivado` (óbito, transferência). Toda mudança vai para o histórico.
  - **Em processo**: quando uma candidatura chega a `Aprovada`; volta a `Disponível` se ela
    terminar sem adoção.
  - **Indisponível**: pausa — não aceita candidaturas novas e mantém as ativas.
  - **Adotado** e **Arquivado**: cancelam as candidaturas ativas (BR-078).
  - **Lar temporário** não é status: é um vínculo à parte (FR-071), e o animal continua com o
    status que tiver (pode estar `Disponível` ou `Em processo` num lar temporário).

### BR-065: Devolução

- **Status**: `draft`
- **Quando**: um animal adotado é devolvido
- **Então**: volta para `Disponível` mantendo o histórico; a organização classifica o motivo
  (BR-092).

---

## Candidaturas

### BR-070: Ficha da candidatura

- **Status**: `draft`
- **Quando**: alguém se candidata
- **Então**: questionário base fixo da plataforma (moradia, telas, outros animais, rotina,
  experiência…), preenchido a partir do perfil, + perguntas extras da organização (texto,
  múltipla escolha, sim/não). As extras são versionadas; a candidatura guarda a versão
  respondida e as respostas da época.

### BR-071: CPF do adotante

- **Status**: `draft`
- **Quando**: alguém se candidata ou cadastra o CPF
- **Então**: CPF sempre obrigatório para candidatar, com dígito válido. Um CPF pertence a no
  máximo uma conta; se o CPF já é de uma conta, a candidatura exige login nela.
- **Em aberto**: Q-033, Q-034

### BR-072: Candidatura sem conta

- **Status**: `draft`
- **Quando**: alguém se candidata sem conta
- **Então**: e-mail verificado por código (OTP) + CPF + Turnstile; cria um perfil sombra ligado
  ao HMAC do CPF.

### BR-073: União do perfil sombra

- **Status**: `draft`
- **Quando**: uma conta cadastra o CPF de um perfil sombra
- **Então**: as candidaturas do perfil sombra passam para a conta.
- **Em aberto**: Q-032

### BR-074: Limite de candidaturas ativas

- **Status**: `draft`
- **Quando**: alguém envia uma candidatura
- **Então**: recusa se o CPF já tem `maxActiveApplications` (parâmetro) candidaturas ativas em
  toda a plataforma. Baixar o parâmetro não cancela candidaturas já enviadas (BR-032).
- **Em aberto**: Q-030

### BR-075: Uma candidatura por animal

- **Status**: `draft`
- **Quando**: alguém se candidata a um animal
- **Então**: a definir.
- **Em aberto**: Q-031

### BR-076: Etapas da candidatura

- **Status**: `draft`
- **Quando**: a organização ou o sistema move uma candidatura
- **Então**: `Recebida → Em análise → Entrevista/Visita → Aprovada → Concluída`, além de
  `Aguardando confirmação` (BR-080). Terminais: `Recusada`, `Desistência`, `Expirada`,
  `Cancelada`. Terminal não volta. Toda mudança vai para o histórico. Mover exige
  `application.move_stage`; aprovar, `application.approve`.
- **Em aberto**: Q-035, Q-037

### BR-077: Recusa

- **Status**: `draft`
- **Quando**: a organização recusa
- **Então**: motivo interno (só a organização vê) + mensagem ao adotante. Recusa é neutra para a
  reputação.

### BR-078: Cancelamento automático

- **Status**: `refined`
- **Quando**: o animal é adotado por outra pessoa ou arquivado
- **Então**: as candidaturas ativas para ele viram `Cancelada`, com mensagem gentil automática.
  Neutro para a reputação. `Indisponível` não cancela (BR-064).

### BR-079: Concluir a adoção

- **Status**: `draft`
- **Quando**: a organização conclui uma candidatura aprovada
- **Então**: exige data, `adoption.complete` e a confirmação "documento com foto conferido".
  Cria a adoção, leva o animal a `Adotado` e dispara BR-078 e BR-080.
- **Por quê**: fecha a brecha de alguém usar CPF alheio.

### BR-080: Depois de uma adoção concluída

- **Status**: `draft`
- **Quando**: uma adoção do adotante é concluída
- **Então**: as demais candidaturas ativas dele viram `Aguardando confirmação`; ele recebe
  e-mail com "continuar" ou "desistir"; sem resposta em `applicationResponseDays` (parâmetro)
  → `Expirada`, neutra. As organizações afetadas veem o aviso "adotou recentemente".
- **Em aberto**: Q-036

### BR-081: Inatividade do adotante

- **Status**: `draft`
- **Quando**: a organização pede uma informação e o adotante não responde
- **Então**: depois de `applicationResponseDays` (parâmetro) → `Expirada`, neutra.
- **Em aberto**: Q-035, Q-036

### BR-082: Ordem na visão da organização

- **Status**: `draft`
- **Quando**: a organização lista as candidaturas
- **Então**: por nível e, dentro dele, por data de envio: 1) histórico positivo; 2) conta
  verificada; 3) sem conta; 4) selo "Atenção".
- **Em aberto**: Q-038, Q-051

### BR-083: Inelegível não se candidata

- **Status**: `draft`
- **Quando**: um CPF inelegível tenta enviar candidatura
- **Então**: recusa no envio, com mensagem que explica o caminho de revisão (BR-099).

### BR-084: Outras candidaturas do adotante

- **Status**: `draft`
- **Quando**: a organização vê uma candidatura
- **Então**: vê quantas outras candidaturas ativas o adotante tem, sem saber em quais
  organizações.

### BR-085: Dados sensíveis do adotante

- **Status**: `draft`
- **Quando**: alguém da organização vê os dados do adotante
- **Então**: CPF sempre mascarado; "revelar" exige `application.view_sensitive` e vai para a
  auditoria. Sem `application.view`, não vê candidaturas.

---

## Reputação

### BR-090: Selos

- **Status**: `draft`
- **Quando**: a organização vê o adotante
- **Então**: selos transparentes, nunca nota numérica: `Novo`, `Verificado`, `Adotante aprovado`
  (≥1 adoção avaliada como bem-sucedida), `Atenção` (ocorrência leve procedente ativa),
  `Inelegível`.
- **Por quê**: decisão automatizada inexplicável é vedada (LGPD art. 20).
- **Em aberto**: Q-050, Q-051

### BR-091: Avaliação pós-adoção

- **Status**: `draft`
- **Quando**: depois do 1º acompanhamento ou de 90 dias da adoção
- **Então**: a organização pode avaliar; `bem-sucedida` gera evento positivo.
- **Em aberto**: Q-052

### BR-092: Classificação da devolução

- **Status**: `draft`
- **Quando**: a organização registra uma devolução
- **Então**: `responsável` → neutro; `irresponsável/abandono` → abre ocorrência; `maus-tratos` →
  abre ocorrência grave. Ocorrência só vale depois de moderada (BR-096).

### BR-093: Quem pode reportar uma ocorrência

- **Status**: `draft`
- **Quando**: uma organização reporta uma ocorrência
- **Então**: exige `incident.report`; tipo, descrição, evidências privadas; B.O. recomendado e
  obrigatório para maus-tratos.
- **Em aberto**: Q-053

### BR-094: Ocorrência em análise é sigilosa

- **Status**: `draft`
- **Quando**: uma ocorrência está `Em análise`
- **Então**: invisível às outras organizações; não afeta selos.

### BR-095: Defesa

- **Status**: `draft`
- **Quando**: uma ocorrência é aberta
- **Então**: o adotante é notificado e tem `incidentDefenseDays` (parâmetro) para se defender.
- **Em aberto**: Q-054

### BR-096: Decisão da moderação

- **Status**: `draft`
- **Quando**: o moderador decide (depois da defesa ou do prazo)
- **Então**: `Improcedente` | `Procedente leve` (selo Atenção por `minorIncidentExpiryMonths`,
  parâmetro) | `Procedente grave` (Inelegível). Decisão fundamentada enviada ao adotante e
  auditada.
- **Em aberto**: Q-058

### BR-097: Revisão

- **Status**: `draft`
- **Quando**: o adotante (ou a organização) discorda da decisão
- **Então**: um pedido de revisão, julgado por outro moderador.
- **Em aberto**: Q-055

### BR-098: Conflito de interesse na moderação

- **Status**: `draft`
- **Quando**: um moderador abre um caso
- **Então**: quem é membro da organização envolvida não modera o caso; quem decidiu não revisa.

### BR-099: Revisão do inelegível

- **Status**: `draft`
- **Quando**: um inelegível pede revisão
- **Então**: aceita depois de `ineligibilityReviewMonths` (parâmetro) ou, a qualquer tempo, com
  evidência nova.
- **Em aberto**: Q-058

### BR-100: O que as outras organizações veem

- **Status**: `draft`
- **Quando**: uma organização vê a reputação de um adotante
- **Então**: selo + resumo estruturado (categoria, mês/ano, resultado) **só das ocorrências
  procedentes**, sem texto livre e sem identificar a organização autora. Comentários livres
  ficam só com a organização que os escreveu.

### BR-101: O que o adotante vê

- **Status**: `draft`
- **Quando**: o adotante consulta a própria reputação
- **Então**: todo o histórico, ocorrências, decisões e prazos (direito de acesso).
- **Em aberto**: Q-056

### BR-102: Suspensão cautelar

- **Status**: `draft`
- **Quando**: caso grave com evidência forte
- **Então**: só um moderador suspende cautelarmente, com motivo e auditoria.
- **Em aberto**: Q-057

### BR-103: De onde a reputação nasce

- **Status**: `draft`
- **Quando**: qualquer evento de reputação
- **Então**: só de adoção concluída com documento conferido (BR-079) ou de ocorrência moderada.
  A plataforma orienta registrar B.O. em maus-tratos (Lei 9.605/98 art. 32; Lei 14.064/20) e não
  substitui as autoridades.

---

## Pós-adoção e lar temporário

### BR-110: Acompanhamento pós-adoção

- **Status**: `draft`
- **Quando**: passam os dias de `postAdoptionCheckinDays` (parâmetro) desde a adoção
- **Então**: lembrete ao adotante com link autenticado para fotos e notícias; a timeline fica
  visível à organização. Sem resposta, só sinaliza à organização — nunca vira ocorrência
  sozinho.

### BR-111: Lar temporário

- **Status**: `draft`
- **Quando**: alguém se oferece como lar temporário
- **Então**: ficha própria (base + extras), mesmo esquema de CPF e conta; a organização aprova,
  vincula um animal com início e fim. Endereço do lar nunca é público.
- **Em aberto**: Q-059

---

## Portal

### BR-120: O que aparece no portal

- **Status**: `draft`
- **Quando**: alguém navega no portal ou na página de uma organização
- **Então**: só animais adotáveis de organizações aprovadas (não suspensas nem encerradas).
- **Em aberto**: Q-045

### BR-121: Distância sem endereço

- **Status**: `draft`
- **Quando**: alguém busca por raio
- **Então**: CEP → município (BrasilAPI) → centroide (base IBGE estática); distância entre
  centroides. Nunca geolocaliza endereço.

### BR-122: Denúncia pública

- **Status**: `draft`
- **Quando**: alguém denuncia um animal ou organização
- **Então**: Turnstile + rate limit; vai para a fila de moderação.
- **Em aberto**: Q-046

---

## Notificações

### BR-130: E-mails obrigatórios e opcionais

- **Status**: `draft`
- **Quando**: o sistema manda um e-mail
- **Então**: respeita as preferências do usuário, exceto os obrigatórios.
- **Em aberto**: Q-065

### BR-131: WhatsApp sem API paga

- **Status**: `draft`
- **Quando**: organização e adotante querem conversar
- **Então**: botão `wa.me` com mensagem pré-preenchida.
- **Em aberto**: Q-039

---

## Dados pessoais (LGPD)

### BR-140: Inativação da conta

- **Status**: `refined`
- **Quando**: o titular inativa a conta
- **Então**: não existe exclusão de conta: o registro nunca é apagado. É o único caminho
  (BR-016) e recusa enquanto o titular for o único Responsável de uma organização ativa ou
  suspensa (BR-055); o protetor independente encerra a organização antes (BR-044), e a tela
  explica o caminho.
  - **Na hora**: encerra as sessões e tira a pessoa das listas e buscas. As candidaturas ativas
    dela viram `Desistência` (neutra).
  - **Por 30 dias**: a inativação tem volta; entrar de novo reativa a conta.
  - **Depois de 30 dias**: a tarefa agendada de FR-093 anonimiza os dados pessoais (nome,
    e-mail, telefone, endereço, CPF cifrado). Ficam o id, o histórico (adoções, ocorrências,
    decisões) e o registro de inelegibilidade (HMAC do CPF + categoria), se houver. Selos e
    reputação continuam ligados ao HMAC do CPF.
  - **O que a organização vê**: membro inativado sai da equipe; nos históricos (status de
    animal, etapas, decisões) aparece "Conta inativada" no lugar do nome e, depois da
    anonimização, "Ex-membro". Nas candidaturas e adoções passadas de um adotante inativado
    aparece "Adotante com conta inativada", sem dados de contato.
- **Por quê**: o histórico sustenta a reputação, e a LGPD pede anonimizar o que não é mais
  necessário (art. 18). Os 30 dias protegem contra inativação por engano ou por quem invadiu a
  conta. Validar com o advogado (PLANO §4).

### BR-141: Anonimização

- **Status**: `draft`
- **Quando**: passam 12 meses de uma candidatura recusada ou expirada
- **Então**: os dados pessoais dela são anonimizados.
- **Em aberto**: Q-061

### BR-142: Auditoria sobrevive à anonimização

- **Status**: `implemented`
- **Quando**: dados pessoais de uma conta são anonimizados (BR-140, BR-141)
- **Então**: a auditoria não muda (só guarda ids; BR-020).

### BR-143: Chaves de cifra e HMAC

- **Status**: `draft`
- **Quando**: dados são cifrados ou indexados por HMAC (CPF, e-mail do bloqueio, tokens)
- **Então**: a definir como trocar as chaves sem perder os dados.
- **Em aberto**: Q-062
