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

- **Status**: `implemented`
- **Quando**: o login por senha falha por senha errada
- **Então**: conta erros seguidos por e-mail (guardado como HMAC). A partir de 5 erros bloqueia
  1 min; de 10, 15 min; de 15, 60 min — cada novo erro renova o bloqueio. Bloqueado recusa até
  a senha certa, com `Retry-After`. Senha certa zera a contagem; 24 h sem errar também. Vale
  para e-mails sem conta (não revela quais existem).
- **Por quê**: o rate limit por IP não segura ataque distribuído contra uma conta.
- **Em aberto**: Q-006

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

- **Status**: `draft`
- **Quando**: uma conta com senha entra, aceita convite ou se candidata
- **Então**: aceitar convite exige e-mail verificado (pronto). Falta decidir se o próprio login
  exige.
- **Por quê**: o e-mail é o canal das decisões, prazos e redefinição de senha.
- **Em aberto**: Q-007

### BR-008: Ninguém age como outra pessoa

- **Status**: `in-progress`
- **Quando**: alguém da equipe da plataforma age sobre a conta de outra pessoa
- **Então**: ninguém personifica usuários, define a senha ou o e-mail de outra pessoa, nem
  enfraquece a segurança da conta dela (2FA, e-mail verificado). Mudar isso exige revisar o
  catálogo da plataforma.
- **Por quê**: seria acesso a dados pessoais sem o titular e porta para sequestro de conta.
- **Nota**: personificação, senha e e-mail alheios estão bloqueados e testados; a brecha de
  Q-001 e Q-002 ainda permite enfraquecer ou pré-criar contas.
- **Em aberto**: Q-001, Q-002

### BR-009: 2FA por app autenticador

- **Status**: `in-progress`
- **Quando**: alguém ativa ou usa o 2FA
- **Então**: TOTP (emissor "Acolhe+") com códigos de recuperação de uso único; segredo e códigos
  cifrados com o segredo da API. Quem só usa o Google também pode ativar. Para desativar ou
  gerar novos códigos, quem tem senha informa a senha.
- **Por quê**: 2FA é obrigatório para a equipe da plataforma (BR-011) e para dados sensíveis
  (BR-057).
- **Em aberto**: Q-003

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
  | `user.create`, `user.update`               |     ✓      |           |         |
  | `user.set-role`, `user.ban`, `user.delete` |     ✓      |           |         |
  | `session.list/revoke/delete`               |     ✓      |           |         |
  | `organization_review.view`                 |     ✓      |     ✓     |    ✓    |
  | `organization_review.decide`               |     ✓      |     ✓     |         |
  | `incident.view`, `incident.decide`         |     ✓      |     ✓     |         |
  | `content_report.view`                      |     ✓      |     ✓     |    ✓    |
  | `content_report.decide`                    |     ✓      |     ✓     |         |
  | `platform_setting.view`                    |     ✓      |     ✓     |    ✓    |
  | `platform_setting.update`                  |     ✓      |           |         |
  | `audit_log.view`                           |     ✓      |           |         |

  Ninguém tem `user.impersonate`, `user.impersonate-admins`, `user.set-password` nem
  `user.set-email`.

- **Por quê**: menor privilégio; o suporte só lê e não vê ocorrências.
- **Em aberto**: Q-001, Q-002, Q-004

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

- **Status**: `draft`
- **Quando**: um papel de superadmin é dado ou retirado
- **Então**: a definir — hoje qualquer superadmin dá ou tira o papel de qualquer pessoa,
  inclusive o próprio, e nada impede ficar sem superadmin.
- **Por quê**: superadmin altera parâmetros e lê a auditoria; ficar sem nenhum trava a
  plataforma, e promover sem controle concentra poder.
- **Em aberto**: Q-004

### BR-014: Banimento de conta

- **Status**: `implemented`
- **Quando**: o superadmin bane uma conta
- **Então**: as sessões dela são encerradas, o login é recusado até o fim do banimento (ou para
  sempre) e o motivo e o prazo vão para a auditoria. Ninguém bane a si mesmo. Banimento é sobre
  a conta; inelegibilidade para adotar é outra coisa (BR-096).
- **Em aberto**: Q-005

### BR-015: A equipe não cria contas de terceiros

- **Status**: `draft`
- **Quando**: alguém da equipe quer criar uma conta
- **Então**: a definir — hoje o superadmin cria contas pela API com senha e "e-mail verificado"
  à escolha dele.
- **Em aberto**: Q-002

### BR-016: Remoção de conta pela equipe

- **Status**: `draft`
- **Quando**: o superadmin remove uma conta
- **Então**: a definir — hoje remove sem checar se a pessoa é a única Responsável de uma
  organização nem reter o mínimo exigido pela reputação (BR-140).
- **Em aberto**: Q-005

---

## Auditoria

### BR-020: Auditoria só de acréscimo

- **Status**: `implemented`
- **Quando**: qualquer registro é gravado na auditoria
- **Então**: o banco recusa `UPDATE`, `DELETE` e `TRUNCATE` na tabela. Sem chave estrangeira
  para usuário ou organização. Os detalhes guardam ids, papéis e nomes de campos — nunca nome,
  e-mail, CPF ou segredos. Guarda autor (`null` = sistema), organização, ação, alvo, IP e Ray ID.
- **Por quê**: a auditoria precisa sobreviver à exclusão de contas (LGPD) e a quem quiser apagar
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
    exclusão de conta, acesso a evidências privadas.
  - **Não**: cada login (a sessão e o bloqueio já guardam isso).

### BR-024: Quem consulta a auditoria

- **Status**: `implemented`
- **Quando**: alguém consulta a auditoria
- **Então**: só quem tem `audit_log.view` (o superadmin).
- **Em aberto**: Q-064

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
  | `adoptionFeeCapCents`       | não definido  | 0–50000 (R$ 500)            | BR-063         |

- **Em aberto**: Q-036, Q-061

### BR-031: Quem altera parâmetros

- **Status**: `implemented`
- **Quando**: alguém altera parâmetros
- **Então**: só `platform_setting.update` (superadmin, com 2FA). Valida tudo antes de gravar
  (um inválido recusa o lote); cada valor alterado vai para a auditoria com o anterior e o
  novo, na mesma transação.

### BR-032: Parâmetro alterado e prazos em andamento

- **Status**: `draft`
- **Quando**: um parâmetro muda enquanto há prazos correndo ou limites já atingidos
- **Então**: a definir.
- **Em aberto**: Q-024

---

## Organizações

### BR-040: Tipos de organização

- **Status**: `draft`
- **Quando**: alguém se inscreve
- **Então**: **ONG** — CNPJ com dígito válido e consulta pública (BrasilAPI) ativa. **Protetor
  independente** — CPF válido + comprovação de atuação (redes sociais, referências, fotos de
  resgates), avaliada pela moderação.
- **Em aberto**: Q-012

### BR-041: Ciclo de vida da organização

- **Status**: `draft`
- **Quando**: a moderação decide ou a situação muda
- **Então**: `Pendente → Em análise ⇄ Informações solicitadas → Aprovada | Recusada`;
  `Aprovada → Suspensa → Reativada (Aprovada) | Encerrada`. Toda mudança tem autor, motivo e
  auditoria.
- **Em aberto**: Q-010

### BR-042: Recusa e nova inscrição

- **Status**: `draft`
- **Quando**: a inscrição é recusada
- **Então**: a recusa tem motivo enviado ao inscrito; nova inscrição só depois de
  `refusalResubmissionDays` (parâmetro).
- **Em aberto**: Q-011

### BR-043: Suspensão

- **Status**: `draft`
- **Quando**: a moderação suspende (ex.: indício de venda de animais)
- **Então**: a página e os animais saem do ar, as candidaturas ficam congeladas e a equipe
  mantém acesso só de leitura.
- **Em aberto**: Q-013

### BR-044: Encerramento

- **Status**: `draft`
- **Quando**: a organização é encerrada
- **Então**: animais arquivados, candidaturas abertas canceladas com aviso aos adotantes,
  histórico de adoções mantido (alimenta a reputação).
- **Em aberto**: Q-014, Q-063

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
- **Em aberto**: Q-010

### BR-047: Slug

- **Status**: `draft`
- **Quando**: uma organização escolhe ou troca o slug
- **Então**: único, minúsculo, fora da lista de reservados (`admin`, `api`, `ong`, `portal`, …).
  Troca permitida; o antigo vai para o histórico e redireciona (301) para o atual.
- **Em aberto**: Q-014

### BR-048: Cores da organização

- **Status**: `implemented`
- **Quando**: a organização escolhe cor primária e secundária
- **Então**: o tema é derivado com contraste WCAG AA garantido: texto preto ou branco sobre a
  cor, e uma variante escurecida da primária para texto e foco sobre branco (pronto no domínio
  e na web). Layout fixo.
- **Em aberto**: Q-015

### BR-049: Doações só para a organização

- **Status**: `draft`
- **Quando**: a página mostra como doar
- **Então**: só a chave PIX (e QR) da própria organização. A plataforma nunca recebe, guarda ou
  intermedia dinheiro.
- **Em aberto**: Q-016

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
  - **Voluntário** (`volunteer`): criar e editar animais.
- **Nota**: todo membro é adicionado com um desses papéis ou um papel próprio, nunca com o
  padrão `member` da tabela do plugin (que não existe no catálogo).
- **Em aberto**: Q-017

### BR-052: Papéis próprios da organização

- **Status**: `implemented`
- **Quando**: a organização cria ou edita um papel
- **Então**: só com permissões do catálogo, sem repetir o nome de um papel padrão, e ninguém
  cria um papel com permissão que não tem.

### BR-053: Permissão efetiva

- **Status**: `in-progress`
- **Quando**: o sistema checa se um membro pode fazer algo
- **Então**: permissões do papel ∪ concessões individuais. Concessões só somam, nunca tiram
  (regra pura pronta; concessões ainda não existem).
- **Em aberto**: Q-019

### BR-054: Ninguém concede o que não tem

- **Status**: `in-progress`
- **Quando**: alguém concede uma permissão, convida com um papel ou troca o papel de um membro
- **Então**: só quem gerencia a equipe, e só permissões que já tem. Só o Responsável promove a
  Responsável (pronto no plugin). A trava para concessões, convites e troca de papel em geral
  está no domínio, mas ainda não é aplicada nas rotas.
- **Por quê**: escalada de privilégio por convite ou troca de papel.
- **Em aberto**: Q-018

### BR-055: Sempre um Responsável

- **Status**: `in-progress`
- **Quando**: alguém sai, é removido ou muda de papel
- **Então**: a organização mantém ao menos um Responsável: o último não sai nem é rebaixado
  (pronto no plugin).
- **Em aberto**: Q-005 (remoção, banimento ou exclusão da conta do último Responsável)

### BR-056: Convites

- **Status**: `in-progress`
- **Quando**: alguém convida para a equipe
- **Então**: entrada só por convite por e-mail; vale 7 dias; aceitar exige e-mail verificado e o
  mesmo e-mail do convite; reconvidar cancela os convites pendentes da mesma pessoa (pronto). O
  e-mail do convite depende de FR-080.

### BR-057: 2FA para dados sensíveis

- **Status**: `draft`
- **Quando**: um membro tem permissão sensível: `application.view_sensitive`,
  `organization.update` ou qualquer permissão de gestão da equipe (`member.*`, `invitation.*`,
  `ac.*`)
- **Então**: precisa de 2FA ativo (regra pura pronta; ainda não aplicada). O Responsável e o
  Coordenador sempre caem aqui.
- **Em aberto**: Q-020

### BR-058: Equipe auditada

- **Status**: `implemented`
- **Quando**: muda a equipe, um convite ou um papel da organização
- **Então**: vai para a auditoria (BR-023).

### BR-059: Membro em causa própria

- **Status**: `draft`
- **Quando**: um membro da organização se candidata a um animal dela, ou é alvo de uma
  ocorrência
- **Então**: a definir.
- **Em aberto**: Q-021

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
- **Então**: opcional; se maior que zero, exige justificativa (castração, vacinas…) e não passa
  de `adoptionFeeCapCents` (parâmetro, até R$ 500). Indício de comércio vira denúncia e pode
  suspender a organização (BR-043).
- **Por quê**: a taxa só cobre custos; venda de animais é proibida.
- **Em aberto**: Q-022

### BR-064: Status do animal

- **Status**: `draft`
- **Quando**: a situação do animal muda
- **Então**: `Rascunho → Disponível ⇄ Em lar temporário (ainda adotável) → Em processo →
  Adotado`; `Indisponível` (tratamento); `Arquivado` (óbito, transferência). Toda mudança vai
  para o histórico.
- **Em aberto**: Q-023

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
  toda a plataforma.
- **Em aberto**: Q-030, Q-024

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

- **Status**: `draft`
- **Quando**: o animal é adotado por outra pessoa ou deixa de estar disponível
- **Então**: as candidaturas ativas para ele viram `Cancelada`, com mensagem gentil automática.
  Neutro para a reputação.
- **Em aberto**: Q-023

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

### BR-140: Exclusão da conta

- **Status**: `draft`
- **Quando**: o titular exclui a conta
- **Então**: os dados pessoais são apagados; fica só o registro de inelegibilidade (HMAC do CPF +
  categoria), se houver — validar juridicamente.
- **Em aberto**: Q-005, Q-063

### BR-141: Anonimização

- **Status**: `draft`
- **Quando**: passam 12 meses de uma candidatura recusada ou expirada
- **Então**: os dados pessoais dela são anonimizados.
- **Em aberto**: Q-061

### BR-142: Auditoria sobrevive à exclusão

- **Status**: `implemented`
- **Quando**: uma conta é excluída
- **Então**: a auditoria não muda (só guarda ids; BR-020).

### BR-143: Chaves de cifra e HMAC

- **Status**: `draft`
- **Quando**: dados são cifrados ou indexados por HMAC (CPF, e-mail do bloqueio, tokens)
- **Então**: a definir como trocar as chaves sem perder os dados.
- **Em aberto**: Q-062
