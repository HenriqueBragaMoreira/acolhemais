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
- **Escopo (web)**: desafio no login pronto (TOTP e recuperação); falta a caixa "confiar neste
  dispositivo" (FR-006); ativação e gestão em FR-007.

### BR-048: Cores da organização

- **Status**: `implemented`
- **Escopo (web)**: `brandThemeStyle()` aplica `--primary`, `--primary-foreground` e `--ring`
  derivados pelo domínio; componentes nunca usam cor fixa de marca.
