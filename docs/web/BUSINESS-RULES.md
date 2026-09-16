# Regras de negócio — Web

O que a interface faz com cada regra (feedback, restrições visuais). A regra em si está em
[../BUSINESS-RULES.md](../BUSINESS-RULES.md). A web nunca é a única barreira: toda regra é
aplicada na API; aqui ela só é explicada e antecipada ao usuário.

### BR-002: Bloqueio progressivo por e-mail

- **Status**: `implemented`
- **Escopo (web)**: no login bloqueado, mostra quanto falta (a partir do `Retry-After`).

### BR-005: 2FA vale também no Google

- **Status**: `implemented`
- **Escopo (web)**: `/entrar/2fa` recebe quem volta do Google com desafio pendente.

### BR-007: E-mail verificado

- **Status**: `implemented`
- **Escopo (web)**: `/entrar` explica que o login foi recusado por falta de confirmação e que um
  novo link foi enviado, e avisa na volta do link se o e-mail foi confirmado ou se o link venceu.

### BR-015: Conta criada pela equipe

- **Status**: `implemented`
- **Escopo (web)**: o link de primeiro acesso abre `/redefinir-senha`, onde a pessoa cria a senha.

### BR-009: 2FA por app autenticador

- **Status**: `in-progress`
- **Escopo (web)**: desafio no login pronto (TOTP e recuperação) com a caixa "confiar neste
  dispositivo", desmarcada e com o alerta de computador compartilhado (FR-006); falta ativação e
  gestão (FR-007, Fase 1).

### BR-048: Cores da organização

- **Status**: `implemented`
- **Escopo (web)**: `brandThemeStyle()` aplica `--primary`, `--primary-foreground` e `--ring`
  derivados pelo domínio; componentes nunca usam cor fixa de marca. A secundária vai para
  `--brand-secondary` (o `--secondary` do design system é a areia) e, na página da organização,
  só pinta a faixa sob a capa, o fundo da capa sem foto e o círculo das iniciais.

### BR-043: Suspensão

- **Status**: `in-progress`
- **Escopo (web)**: a página de organização suspensa responde "Página não encontrada", como a de
  uma que não existe. Com dados fictícios até a API.

### BR-044: Encerramento

- **Status**: `in-progress`
- **Escopo (web)**: a página da organização encerrada mostra só "Organização encerrada" e o
  botão para a galeria, sem animais, contato nem doação. Com dados fictícios até a API.

### BR-047: Slug

- **Status**: `in-progress`
- **Escopo (web)**: o slug antigo leva ao atual. Por ora o redirecionamento acontece dentro da
  página (sem o status 301); com a API, ele vai para o proxy do Next, antes da página.

### BR-049: Doações só para a organização

- **Status**: `in-progress`
- **Escopo (web)**: a página da organização mostra a chave PIX com o tipo, "Copiar chave" e,
  do tablet para cima, o QR do PIX copia e cola (BR Code estático, sem valor, montado por
  `pixBrCode` no domínio), com o aviso de que a doação vai direto para a organização. Falta o
  cadastro da chave com o aviso de que fica pública (FR-025).

### BR-120: O que aparece no portal

- **Status**: `in-progress`
- **Escopo (web)**: a vitrine mostra `Em processo` com a etiqueta "Em processo de adoção" e
  ordena por "há mais tempo esperando", com a opção "mais recentes". Com dados fictícios até a
  API filtrar os adotáveis.

### BR-070: Ficha da candidatura

- **Status**: `in-progress`
- **Escopo (web)**: o questionário base em quatro etapas (casa e quem mora, outros animais e
  experiência, rotina e custos, motivo), com as perguntas que dependem de outra (proprietário
  permite?, idades das crianças, quais animais) aparecendo só quando se aplicam, mais as
  perguntas da organização.

### BR-071: CPF do adotante

- **Status**: `draft`
- **Escopo (web)**: o CPF é obrigatório e conferido pelos dígitos (`isValidCpf` no domínio). As
  questões Q-033 e Q-034 continuam com o mantenedor.

### BR-074: Limite de candidaturas ativas

- **Status**: `in-progress`
- **Escopo (web)**: ao informar o CPF (ou entrar na conta), a candidatura para com o aviso "Você
  chegou ao limite de candidaturas" e o máximo. Limite fixo em 3 na demonstração.

### BR-075: Uma candidatura por animal

- **Status**: `in-progress`
- **Escopo (web)**: quem já tem candidatura ativa para o animal vê "Você já se candidatou para
  {animal}" e o link para outros animais.

### BR-061: Fotos

- **Status**: `in-progress`
- **Escopo (web)**: a foto sensível aparece desfocada, na grande e na miniatura, com o aviso
  "Foto sensível" e o botão "Ver a foto"; o botão com o olho riscado a esconde de novo. No
  cadastro do painel, cada foto (menos a capa) tem a caixa "Sensível"; capa sensível é recusada.

### BR-062: Só a cidade é pública

- **Status**: `in-progress`
- **Escopo (web)**: galeria, página do animal e página da organização mostram só a cidade (e as
  cidades de atuação), nunca o endereço.

### BR-063: Taxa de adoção não é preço

- **Status**: `in-progress`
- **Escopo (web)**: a página do animal mostra a taxa com o que ela cobre, ou "Sem taxa". No
  cadastro, "Sem taxa" ou "Com taxa" (valor até o teto e o que ela cobre, obrigatório); na
  demonstração o teto é fixo (R$ 150), até ler o parâmetro da API.

### BR-060: Dados do animal

- **Status**: `in-progress`
- **Escopo (web)**: o cadastro em etapas pede os campos e valores da regra; o rascunho salva só
  com o nome, e publicar confere todos (FIV/FeLV só para gatos) e abre a etapa com erro.

### BR-064: Status do animal

- **Status**: `in-progress`
- **Escopo (web)**: a página do animal no painel oferece só as mudanças à mão permitidas
  (`manualStatusChanges` do domínio): rascunho publica pela revisão; disponível e indisponível se
  alternam; arquivar pede motivo. Aprovar uma candidatura põe o animal `Em processo`, e ele
  volta a `Disponível` quando não há mais aprovada; concluir põe em `Adotado`.

### BR-076: Etapas da candidatura

- **Status**: `in-progress`
- **Escopo (web)**: na ficha, o caminho mostra a etapa atual; o botão principal avança uma etapa
  e o menu "Mover para outra etapa" leva a qualquer outra ativa (`stageMoves` do domínio).
  Encerrada não mostra ações. Pedir informação marca "Aguardando o adotante" sem mudar a etapa.
  Toda mudança entra no histórico. Falta checar as permissões por papel.

### BR-077: Recusa

- **Status**: `in-progress`
- **Escopo (web)**: o diálogo pede o motivo interno (só a organização vê) e a mensagem ao
  adotante, que já vem escrita com o nome dele, o animal e a organização, e diz que a recusa não
  pesa na reputação.

### BR-078: Cancelamento automático

- **Status**: `in-progress`
- **Escopo (web)**: ao concluir uma adoção ou arquivar o animal, as candidaturas ativas para ele
  aparecem como `Cancelada`, com a explicação no histórico; o diálogo avisa antes.

### BR-079: Concluir a adoção

- **Status**: `in-progress`
- **Escopo (web)**: só na aprovada; exige a data (não futura) e a caixa "Conferi um documento com
  foto de {nome}", com a explicação do documento aceito.

### BR-082: Ordem na visão da organização

- **Status**: `in-progress`
- **Escopo (web)**: cada coluna segue `byPriority` do domínio, e a ordem é explicada no topo da
  página das candidaturas.

### BR-084: Outras candidaturas do adotante

- **Status**: `in-progress`
- **Escopo (web)**: cartão e ficha dizem quantas outras candidaturas ativas o adotante tem no
  Acolhe+, sem dizer onde.

### BR-085: Dados sensíveis do adotante

- **Status**: `in-progress`
- **Escopo (web)**: CPF mascarado na ficha e nas respostas; "Revelar" mostra inteiro e registra no
  histórico. Falta a permissão `application.view_sensitive` (API).

### BR-090: Selos

- **Status**: `in-progress`
- **Escopo (web)**: os selos aparecem em palavras no cartão e na ficha (Novo, Verificado, Adotante
  aprovado, Atenção, Inelegível), nunca como nota; `Atenção` em vermelho telha. Clicar ou tocar
  num selo abre o que ele significa.

### BR-100: O que as outras organizações veem

- **Status**: `in-progress`
- **Escopo (web)**: no selo `Atenção` (ou `Inelegível`), o resumo de cada ocorrência procedente:
  categoria, mês da decisão e até quando vale, com a nota de que a organização autora e os
  detalhes não aparecem. Na demonstração as categorias são de exemplo (Q-053 segue em aberto).
