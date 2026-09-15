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

### BR-061: Fotos

- **Status**: `in-progress`
- **Escopo (web)**: a foto sensível aparece desfocada, na grande e na miniatura, com o aviso
  "Foto sensível" e o botão "Ver a foto"; o botão com o olho riscado a esconde de novo. Falta o
  cadastro (marcar como sensível ao enviar).

### BR-062: Só a cidade é pública

- **Status**: `in-progress`
- **Escopo (web)**: galeria, página do animal e página da organização mostram só a cidade (e as
  cidades de atuação), nunca o endereço.

### BR-063: Taxa de adoção não é preço

- **Status**: `in-progress`
- **Escopo (web)**: a página do animal mostra a taxa com o que ela cobre, ou "Sem taxa". Falta o
  cadastro com o teto do parâmetro.
