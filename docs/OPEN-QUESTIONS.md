# Questões em aberto

Brechas, incongruências e decisões que faltam nas regras. Cada questão diz o que ela trava
(**Bloqueia**), quais itens muda (**Afeta**), as opções e a recomendação. Decidida a questão, a
resposta entra na regra ou no requisito (que passa a `refined`) e a questão sai daqui. Se a
decisão for de arquitetura, vira ADR.

Ordem: por fase.

---

## Antes da Fase 2 (adotantes e candidaturas)

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

### Q-036: Um parâmetro para dois prazos

- **Bloqueia**: Fase 2 · **Afeta**: BR-030, BR-080, BR-081
- **Problema**: `applicationResponseDays` serve ao prazo depois de uma adoção (BR-080) e ao de
  inatividade (BR-081); mudar um muda o outro.
- **Recomendação**: dois parâmetros, ambos com padrão 7 dias.

---

## Fase 3 (portal)

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
