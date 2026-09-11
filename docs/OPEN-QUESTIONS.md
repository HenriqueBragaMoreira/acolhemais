# Questões em aberto

Brechas, incongruências e decisões que faltam nas regras. Cada questão diz o que ela trava
(**Bloqueia**), quais itens muda (**Afeta**), as opções e a recomendação. Decidida a questão, a
resposta entra na regra ou no requisito (que passa a `refined`) e a questão sai daqui. Se a
decisão for de arquitetura, vira ADR.

Ordem: primeiro o que é brecha no código de hoje, depois por fase.

---

## Brechas no código atual (Fase 0)

### Q-001: Superadmin consegue desligar o 2FA de outra pessoa

- **Bloqueia**: produção · **Afeta**: BR-008, BR-010, BR-011
- **Problema**: `POST /admin/update-user` (permissão `user.update`) grava qualquer campo enviado
  em `data`. O plugin só protege `password`, `id`, `role`, banimento e e-mail. Com
  `{ "twoFactorEnabled": false }`, um superadmin desliga o 2FA de outra pessoa — inclusive de
  outro membro da equipe, que passa a entrar sem código e a contornar BR-011.
- **Opções**: (a) tirar `user.update` do superadmin (o titular corrige os próprios dados,
  FR-091); (b) hook que só aceita `name` e `image` em `update-user`.
- **Recomendação**: (a) — nenhum fluxo do PLANO precisa que a equipe edite contas; menos
  superfície. Teste de integração cobrindo a recusa.

### Q-002: Superadmin consegue pré-criar a conta de outra pessoa

- **Bloqueia**: produção · **Afeta**: BR-004, BR-008, BR-015
- **Problema**: `POST /admin/create-user` (`user.create`) aceita senha e `data` livres: dá para
  criar `fulana@x` com uma senha conhecida e `emailVerified: true`, sem passar pela regra de 12
  caracteres nem pela checagem de vazamento. Quando a dona do e-mail entrar pelo Google, BR-004
  vincula à conta pré-criada (e-mail "verificado") e quem a criou mantém acesso pela senha.
- **Opções**: (a) tirar `user.create` do superadmin; contas da equipe só por
  `pnpm auth:create-admin` (CLI, sem rota); (b) hook recusando `emailVerified`, senha e campos
  extras em `create-user`.
- **Recomendação**: (a).

### Q-003: "Confiar neste dispositivo" no 2FA

- **Bloqueia**: produção · **Afeta**: BR-009, BR-011, FR-006
- **Problema**: a tela não oferece, mas a API aceita `trustDevice: true` na verificação do
  código e pula o 2FA nesse navegador por 30 dias — também para a equipe da plataforma.
- **Opções**: (a) recusar `trustDevice` para todos; (b) recusar só para a equipe da plataforma e
  membros com permissão sensível; (c) liberar para todos.
- **Recomendação**: (a) — coerente com a tela e sem exceções para manter.

### Q-004: Quem dá e tira o papel de superadmin

- **Bloqueia**: produção · **Afeta**: BR-010, BR-013
- **Problema**: qualquer superadmin promove qualquer conta a superadmin (ou tira o papel de
  outro, ou o próprio) e nada impede ficar sem nenhum.
- **Opções**: (a) papel `superadmin` só pela CLI; pela API, o superadmin só dá ou tira
  `moderator`/`support`; (b) pela API, mas recusando tirar o último superadmin.
- **Recomendação**: (a) — superadmin é raro e quem tem acesso ao deploy é quem deve criá-lo.

### Q-005: Remover ou banir o único Responsável (ou um adotante com histórico)

- **Bloqueia**: Fase 1 · **Afeta**: BR-014, BR-016, BR-055, BR-140, FR-092
- **Problema**: o superadmin remove ou bane uma conta sem checar se ela é a única Responsável de
  uma organização (a ONG fica sem ninguém que gerencie a equipe). A remoção pela equipe também
  apaga tudo, sem reter o registro de inelegibilidade de BR-140.
- **Opções**: (a) remover pela equipe fica desligado; exclusão só pelo fluxo LGPD (FR-092), que
  aplica BR-140 e recusa enquanto a pessoa for a única Responsável; banimento recusado nesse
  mesmo caso; (b) manter a remoção pela equipe, com as mesmas checagens.
- **Recomendação**: (a).

### Q-006: Bloqueio progressivo trava a conta de outra pessoa

- **Bloqueia**: nada (registrar decisão) · **Afeta**: BR-002
- **Problema**: depois de 15 erros, cada novo erro renova 60 min de bloqueio. Quem sabe o e-mail
  de alguém mantém a conta dele travada para login por senha indefinidamente.
- **Opções**: (a) aceitar: o Google e a redefinição de senha continuam funcionando, e o bloqueio
  por IP limita o atacante; (b) redefinir a senha zera o bloqueio; (c) teto de horas por dia.
- **Recomendação**: (a) + (b) quando FR-004 existir.

### Q-007: Login sem e-mail verificado

- **Bloqueia**: produção · **Afeta**: BR-007, FR-002, FR-003
- **Problema**: hoje qualquer conta com senha entra sem verificar o e-mail. O ADR 0005 lista
  `requireEmailVerification` como pendência, sem dizer se bloqueia o login ou só ações.
- **Opções**: (a) login exige e-mail verificado (padrão do Better Auth; reenviar verificação ao
  tentar entrar); (b) login livre; candidatar, aceitar convite e inscrever organização exigem.
- **Recomendação**: (a) — uma regra só, e todas as ações da plataforma dependem do e-mail.

---

## Antes da Fase 1 (organizações e animais)

### Q-010: A organização existe antes de ser aprovada?

- **Bloqueia**: Fase 1 · **Afeta**: BR-041, BR-046, FR-020, FR-021, modelo de dados
- **Problema**: o PLANO §5 põe o status (`Pendente`, `Em análise`…) na própria `Organization`;
  o ADR 0005 diz que a organização é criada no servidor **na aprovação**. Se nasce pendente, o
  plugin `organization` já dá equipe, convites e papéis a uma ONG não aprovada.
- **Opções**: (a) tabela própria de inscrição (dados, documentos, status da análise); a
  organização só nasce aprovada; `Suspensa`/`Encerrada` ficam na organização; (b) organização
  nasce pendente e hooks bloqueiam o plugin até a aprovação.
- **Recomendação**: (a) — o plugin só enxerga organizações de verdade, sem hook de bloqueio.

### Q-011: Espera de 30 dias depois da recusa vale para quê?

- **Bloqueia**: Fase 1 · **Afeta**: BR-042
- **Problema**: o prazo não diz se conta por conta, CNPJ ou CPF; sem isso, basta outra conta.
- **Opções**: (a) por documento (CNPJ da ONG ou HMAC do CPF do protetor) **e** por conta;
  (b) só por conta.
- **Recomendação**: (a).

### Q-012: Unicidade de organizações

- **Bloqueia**: Fase 1 · **Afeta**: BR-040
- **Problema**: não está dito se um CNPJ pode ter duas organizações, nem se a mesma pessoa pode
  ser protetora independente duas vezes (ou protetora e Responsável de ONG).
- **Opções**: (a) CNPJ único entre organizações não encerradas; um CPF tem no máximo uma
  organização de protetor; pode ser membro de várias ONGs; (b) sem restrição.
- **Recomendação**: (a).

### Q-013: O que a suspensão congela

- **Bloqueia**: Fase 1 · **Afeta**: BR-043
- **Problema**: "só leitura" e "candidaturas congeladas" não dizem se: a equipe ainda convida e
  troca papéis; os prazos de expiração correm; os adotantes são avisados; reativar devolve tudo.
- **Recomendação**: tudo de escrita bloqueado (inclusive as rotas do plugin, por hook); prazos
  pausados e retomados na reativação; adotantes com candidatura ativa recebem aviso neutro;
  animais saem do portal e voltam na reativação.

### Q-014: Slug antigo e de organização encerrada

- **Bloqueia**: Fase 1 · **Afeta**: BR-047, BR-044, FR-026
- **Problema**: não está dito se um slug antigo (ou de organização encerrada) pode ser usado por
  outra organização — o redirecionamento 301 mandaria o público para a ONG errada.
- **Recomendação**: slug usado uma vez fica reservado para sempre; página de encerrada mostra
  "organização encerrada", sem animais.

### Q-015: Contraste: rejeitar ou derivar?

- **Bloqueia**: Fase 1 · **Afeta**: BR-048, FR-025
- **Problema**: o PLANO diz "rejeita combinações abaixo de AA e sugere ajuste". O domínio nunca
  rejeita: escolhe texto preto ou branco (qualquer cor tem ≥4,5:1 com um dos dois) e escurece a
  primária para texto sobre branco. Não está definido o que seria "combinação" rejeitada, nem
  onde a cor secundária aparece.
- **Opções**: (a) aceitar qualquer cor, derivar o tema e mostrar a prévia com a variante
  ajustada (o código de hoje); atualizar o PLANO; (b) rejeitar a primária abaixo de 3:1 sobre
  branco e sugerir a escurecida.
- **Recomendação**: (a), e definir o uso da secundária antes da tela de personalização.

### Q-016: Chave PIX que expõe dado pessoal

- **Bloqueia**: Fase 1 · **Afeta**: BR-049, FR-025
- **Problema**: protetor independente (pessoa física) costuma usar CPF ou telefone como chave
  PIX; publicá-la expõe o CPF dele na página.
- **Opções**: (a) aceitar qualquer tipo, com aviso claro e confirmação para CPF; (b) recusar
  chave CPF; (c) só chave aleatória, e-mail ou CNPJ.
- **Recomendação**: (a).

### Q-017: Voluntário vê candidaturas?

- **Bloqueia**: Fase 1 · **Afeta**: BR-051
- **Problema**: o PLANO diz "Voluntário (animais, sem dados sensíveis)", que sugere ver
  candidaturas sem dados sensíveis. O código dá só `animal.create` e `animal.update` (nem
  arquivar, nem ver candidaturas). O PLANO também descreve o Coordenador como "candidaturas +
  animais", e o código dá a ele adoção, pós-adoção, ocorrência e lar temporário.
- **Opções**: (a) manter o código e corrigir o PLANO; (b) dar `application.view` ao Voluntário.
- **Recomendação**: (a) — a ONG cria um papel próprio se quiser mais.

### Q-018: Trava contra escalada em convites e troca de papel

- **Bloqueia**: Fase 1 · **Afeta**: BR-054, FR-023
- **Problema**: o plugin só garante "só o Responsável promove a Responsável". Quem tem
  `invitation.create` ou `member.update` (num papel próprio) pode convidar ou mover alguém para
  `coordinator` e dar `application.view_sensitive` que não tem. Além disso, `assertCanAssign`
  exige `member.update` até para convites, que no plugin dependem de `invitation.create`.
- **Recomendação**: convidar com o papel P exige `invitation.create` + ter todas as permissões
  de P; trocar o papel de alguém exige `member.update` + ter todas as permissões do papel antigo
  e do novo; remover um membro exige `member.delete` + ter todas as permissões dele. Aplicado por
  hook nas rotas do plugin, com a regra no domínio (ajustar `assertCanAssign`).

### Q-019: Como as concessões individuais convivem com o plugin

- **Bloqueia**: Fase 1 · **Afeta**: BR-053, FR-024
- **Problema**: o plugin só conhece permissões de papéis. Uma concessão individual de
  `member.update` não valeria nas rotas do plugin.
- **Opções**: (a) tabela de concessões lida pelo nosso `can()` nas rotas próprias; concessões só
  de permissões da plataforma (animais, candidaturas…), e gestão da equipe só por papel;
  (b) cada membro com concessões ganha um papel oculto só dele, somado ao papel por vírgula
  (o plugin aceita vários papéis).
- **Recomendação**: (a) — simples e explícito; (b) polui a lista de papéis e abre edição pelas
  rotas `ac`.

### Q-020: 2FA de membro com permissão sensível

- **Bloqueia**: Fase 1 · **Afeta**: BR-057
- **Problema**: não está dito o que acontece com um membro sensível sem 2FA: bloqueia tudo da
  organização, só as ações sensíveis, ou o convite/troca de papel é recusado.
- **Recomendação**: igual à equipe da plataforma — sem 2FA, as rotas da organização respondem
  `TWO_FACTOR_REQUIRED` (exceto ativar o 2FA); convidar e promover continuam permitidos.

### Q-021: Membro em causa própria

- **Bloqueia**: Fase 2 · **Afeta**: BR-059
- **Problema**: nada impede um membro de aprovar e concluir a própria candidatura, nem de
  reportar ou avaliar a si mesmo.
- **Recomendação**: pode se candidatar a animal da própria organização, mas não move, aprova,
  conclui nem avalia a própria candidatura ou adoção; outro membro precisa fazer.

### Q-022: Taxa de adoção com teto "não definido"

- **Bloqueia**: Fase 1 · **Afeta**: BR-063, BR-030
- **Problema**: `adoptionFeeCapCents` nasce `null` e o significado não está definido. Também
  falta o valor do teto (PLANO §9).
- **Opções**: (a) `null` = nenhuma taxa permitida até a plataforma definir; (b) `null` = sem
  teto.
- **Recomendação**: (a), e decidir o valor antes do CRUD de animais.

### Q-023: Máquina de status do animal

- **Bloqueia**: Fase 1 · **Afeta**: BR-064, BR-078, FR-032
- **Problema**: (1) "Em lar temporário (ainda adotável)" é um local, não uma situação: um animal
  em lar temporário também pode estar `Em processo`. (2) Não está dito quando o animal vira
  `Em processo`. (3) `Indisponível` (tratamento) cancela as candidaturas (BR-078) ou só pausa?
- **Recomendação**: (1) lar temporário é um vínculo à parte (FR-071), não um status;
  (2) `Em processo` quando uma candidatura chega a `Aprovada`, e volta a `Disponível` se ela
  terminar sem adoção; (3) `Indisponível` pausa (não aceita novas, mantém as ativas);
  `Arquivado` e `Adotado` cancelam.

### Q-024: Parâmetro alterado com prazos correndo

- **Bloqueia**: Fase 2 · **Afeta**: BR-032, BR-074
- **Problema**: se o prazo de resposta cai de 7 para 3 dias, ou o limite de candidaturas de 5
  para 3, não está dito o que acontece com o que já está em andamento.
- **Recomendação**: todo prazo é calculado e gravado quando começa (vale o parâmetro da época);
  limites só valem para novas ações (quem já tem 5 ativas não perde nenhuma).

---

## Antes da Fase 2 (adotantes e candidaturas)

### Q-030: O que conta como candidatura "ativa"

- **Bloqueia**: Fase 2 · **Afeta**: BR-074
- **Recomendação**: toda etapa não terminal (`Recebida`, `Em análise`, `Entrevista/Visita`,
  `Aprovada`, `Aguardando confirmação`).

### Q-031: Mais de uma candidatura ao mesmo animal

- **Bloqueia**: Fase 2 · **Afeta**: BR-075
- **Problema**: o mesmo CPF pode ter duas candidaturas ativas ao mesmo animal? E se candidatar de
  novo depois de recusado?
- **Recomendação**: uma ativa por CPF e animal; depois de `Recusada`, não volta ao mesmo animal;
  depois de `Desistência`/`Expirada`/`Cancelada`, pode.

### Q-032: Sequestro do perfil sombra

- **Bloqueia**: Fase 2 · **Afeta**: BR-073, FR-043
- **Problema**: se alguém cria conta com o CPF de outra pessoa que só tem perfil sombra, herda as
  candidaturas dela (respostas sobre moradia, rotina, contatos) e a reputação.
- **Recomendação**: une automaticamente só quando o e-mail verificado da conta é o mesmo do perfil
  sombra; senão, o CPF fica pendente e a união exige confirmar um código enviado ao e-mail do
  perfil sombra.

### Q-033: CPF de terceiro usado sem conta

- **Bloqueia**: Fase 2 · **Afeta**: BR-071, BR-074
- **Problema**: alguém pode usar o CPF de outra pessoa sem conta e ocupar as candidaturas ativas
  dela (o limite é por CPF), ou gerar histórico em nome dela.
- **Recomendação**: o titular, ao criar conta com o próprio CPF e e-mail diferente, vê as
  candidaturas feitas com ele e pode cancelá-las e contestá-las com o suporte; reputação só nasce
  com documento conferido (BR-103).

### Q-034: Correção do CPF

- **Bloqueia**: Fase 2 · **Afeta**: BR-071, FR-091
- **Problema**: a LGPD garante correção, mas o CPF é a chave da reputação: trocá-lo livremente
  apagaria um histórico negativo.
- **Recomendação**: CPF editável até a primeira candidatura; depois, só pelo suporte, com
  documento e auditoria.

### Q-035: Pedido de informação ao adotante

- **Bloqueia**: Fase 2 · **Afeta**: BR-076, BR-081, FR-045
- **Problema**: BR-081 depende de "a organização pede informação", mas não há etapa nem estado
  para isso nas etapas fixas.
- **Recomendação**: marcação "aguardando o adotante" sobre a etapa atual (não é etapa nova), com
  prazo; a resposta do adotante tira a marcação.

### Q-036: Um parâmetro para dois prazos

- **Bloqueia**: Fase 2 · **Afeta**: BR-030, BR-080, BR-081
- **Problema**: `applicationResponseDays` serve ao prazo depois de uma adoção (BR-080) e ao de
  inatividade (BR-081); mudar um muda o outro.
- **Recomendação**: dois parâmetros, ambos com padrão 7 dias.

### Q-037: Candidatura aprovada que nunca é concluída

- **Bloqueia**: Fase 2 · **Afeta**: BR-076
- **Problema**: `Aprovada` ocupa uma vaga do limite e trava o animal em `Em processo` para sempre
  se a organização não concluir nem cancelar.
- **Recomendação**: sem expiração automática; depois de 30 dias, a organização recebe lembrete
  para concluir ou cancelar.

### Q-038: "Conta verificada" na ordenação

- **Bloqueia**: Fase 2 · **Afeta**: BR-082
- **Problema**: o nível 2 ("com conta verificada") não diz o que é verificado, e ainda não há
  selo nem regra que o defina antes da Fase 4.
- **Recomendação**: conta com e-mail verificado e CPF cadastrado; junto com Q-050.

### Q-039: Telefone do adotante

- **Bloqueia**: Fase 2 · **Afeta**: BR-131, FR-040, FR-049
- **Problema**: o botão `wa.me` da organização para o adotante precisa do telefone, que não está
  no perfil, e não está dito quem vê.
- **Recomendação**: telefone opcional no perfil; a organização vê só enquanto houver candidatura
  ativa com ela.

---

## Fase 3 (portal)

### Q-045: Status que aparecem no portal

- **Bloqueia**: Fase 3 · **Afeta**: BR-120, FR-050
- **Problema**: `Em processo` aparece? Aceita novas candidaturas?
- **Recomendação**: aparecem `Disponível` (inclusive em lar temporário) e `Em processo` com o
  aviso "em processo de adoção"; `Em processo` ainda aceita candidaturas.

### Q-046: Desfecho da denúncia pública

- **Bloqueia**: Fase 3 · **Afeta**: BR-122, FR-052
- **Recomendação**: denúncia anônima; desfechos `improcedente`, `conteúdo removido`,
  `organização suspensa`; o denunciante não recebe retorno; a organização denunciada é avisada
  quando houver remoção ou suspensão; tudo auditado.

### Q-047: Meta de desempenho da busca

- **Bloqueia**: Fase 3 · **Afeta**: NFR-015
- **Recomendação**: p95 abaixo de 300 ms na API com 10 mil animais, filtros e raio, medido no CI.

---

## Fase 4 (reputação, pós-adoção e lar temporário)

### Q-050: O que dá o selo "Verificado"

- **Bloqueia**: Fase 4 · **Afeta**: BR-090, FR-060
- **Opções**: (a) conta com e-mail verificado e CPF; (b) documento conferido em uma adoção
  concluída; (c) remover o selo e usar só `Novo` / `Adotante aprovado`.
- **Recomendação**: (b) — é a única verificação de identidade real; (a) vira só o critério de
  ordenação (Q-038).

### Q-051: Combinação dos selos

- **Bloqueia**: Fase 4 · **Afeta**: BR-082, BR-090
- **Problema**: não está dito se `Atenção` e `Adotante aprovado` aparecem juntos nem qual vence na
  ordenação.
- **Recomendação**: `Inelegível` é exclusivo; os demais coexistem; na ordenação, `Atenção` sempre
  vai para o último nível.

### Q-052: Opções da avaliação pós-adoção

- **Bloqueia**: Fase 4 · **Afeta**: BR-091
- **Problema**: só existe `bem-sucedida`; não está dito o que mais a organização pode marcar nem
  se "1º acompanhamento ou 90 dias" é o que vier primeiro.
- **Recomendação**: `bem-sucedida` ou `sem avaliação`; problema vira ocorrência (BR-093); libera no
  que vier primeiro.

### Q-053: Sobre quem uma organização pode reportar ocorrência

- **Bloqueia**: Fase 4 · **Afeta**: BR-093
- **Problema**: sem vínculo exigido, qualquer organização poderia reportar qualquer CPF.
- **Recomendação**: só sobre adoção concluída pela própria organização (devolução ou
  acompanhamento).

### Q-054: Defesa de quem não tem conta

- **Bloqueia**: Fase 4 · **Afeta**: BR-095
- **Recomendação**: link de defesa por e-mail, com OTP; e-mail que volta (bounce) suspende o prazo
  e avisa a moderação.

### Q-055: Revisão sem outro moderador

- **Bloqueia**: Fase 4 · **Afeta**: BR-097, BR-098
- **Problema**: com um só moderador elegível (comum no começo), não há quem revise.
- **Recomendação**: a revisão espera até haver outro moderador sem conflito; o selo da decisão
  continua valendo e o adotante é avisado do motivo da espera.

### Q-056: O que o adotante vê da acusação

- **Bloqueia**: Fase 4 · **Afeta**: BR-101, BR-094
- **Problema**: para se defender, o adotante precisa saber do que é acusado; "evidências privadas"
  e "sem identificar a ONG autora" valem para ele?
- **Recomendação**: o adotante vê a organização autora, o tipo e a descrição; evidências chegam
  como resumo do moderador (sem dados de terceiros); o anonimato da autora vale só para as outras
  organizações.

### Q-057: Efeito da suspensão cautelar

- **Bloqueia**: Fase 4 · **Afeta**: BR-102
- **Recomendação**: impede novas candidaturas e congela as ativas até a decisão; o adotante é
  avisado.

### Q-058: De quando contam os prazos da reputação

- **Bloqueia**: Fase 4 · **Afeta**: BR-096, BR-099
- **Recomendação**: os 24 meses do selo Atenção e os 60 meses do inelegível contam da decisão
  final (depois da revisão, se houver).

### Q-059: Lar temporário

- **Bloqueia**: Fase 4 · **Afeta**: BR-111, FR-071
- **Recomendação**: um lar temporário pode servir a várias organizações; problemas com o lar não
  entram na reputação de adotante no MVP.

---

## Antes do beta e de produção

### Q-060: Retenção do IP na auditoria

- **Bloqueia**: beta · **Afeta**: BR-025, BR-020
- **Opções**: (a) guardar o IP truncado (/24 no IPv4, /48 no IPv6) desde já; (b) IP completo em
  tabela à parte, apagada por tarefa depois de N meses, com a auditoria só de acréscimo
  intacta; (c) IP completo para sempre, justificado no RIPD.
- **Recomendação**: (b) com 6 meses.

### Q-061: O que é anonimizado e quando

- **Bloqueia**: Fase 2 · **Afeta**: BR-141, BR-030
- **Problema**: o PLANO fala só em recusadas e expiradas; ficam de fora `Desistência` e
  `Cancelada`. O prazo de 12 meses não é parâmetro.
- **Recomendação**: toda candidatura terminal sem adoção; prazo como parâmetro (padrão 12 meses).

### Q-062: Troca das chaves de cifra e HMAC

- **Bloqueia**: Fase 2 · **Afeta**: BR-143, NFR-003
- **Problema**: trocar a chave do HMAC do CPF quebra toda busca e unicidade; trocar o
  `BETTER_AUTH_SECRET` invalida segredos de 2FA, tokens cifrados e o bloqueio de login.
- **Recomendação**: chaves com versão gravada junto do dado; rotação por tarefa que decifra e
  regrava; o `BETTER_AUTH_SECRET` não é usado para os dados de CPF.

### Q-063: Exclusão de conta de quem tem papel numa organização

- **Bloqueia**: Fase 2 · **Afeta**: BR-140, BR-044, FR-092
- **Recomendação**: recusa enquanto a pessoa for a única Responsável; protetor independente
  encerra a organização antes; o nome dela some das telas da organização.

### Q-064: A organização vê a própria auditoria?

- **Bloqueia**: Fase 1 · **Afeta**: BR-024, FR-012
- **Recomendação**: o Responsável vê os eventos da própria organização (filtrados por
  `organization_id`), sem IP.

### Q-065: Quais e-mails são obrigatórios

- **Bloqueia**: Fase 2 · **Afeta**: BR-130, FR-081
- **Recomendação**: obrigatórios — segurança da conta, convites, mudanças de etapa, prazos e
  expirações, ocorrências, defesa e decisões; opcionais — lembretes de pós-adoção e novidades.

### Q-066: Upstash Redis ainda é necessário?

- **Bloqueia**: Fase 2 · **Afeta**: NFR-022
- **Problema**: o PLANO prevê Upstash Redis para rate limit, mas o ADR 0005 guardou o rate limit
  no Postgres.
- **Recomendação**: usar o mesmo rate limit no banco para as rotas públicas e tirar o Upstash da
  stack.

### Q-067: Formato dos códigos de erro do domínio

- **Bloqueia**: nada (padronizar antes da Fase 1) · **Afeta**: código do domínio e da API
- **Problema**: `DomainError` usa `rbac.team_manage_required` em um lugar e
  `INVALID_PLATFORM_SETTING` em outro; a API e o Better Auth usam `MAIUSCULAS_COM_SUBLINHADO`.
- **Recomendação**: `MAIUSCULAS_COM_SUBLINHADO` em todo lugar, para o frontend mapear direto.
