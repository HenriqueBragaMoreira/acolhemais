# Requisitos — Web

Status e escopo da interface (`apps/web`, `packages/ui`). A definição de cada item está em
[../REQUIREMENTS.md](../REQUIREMENTS.md); aqui fica só o que cabe à web. Item ausente = ainda sem
escopo definido para a web; ao refinar, adicione-o aqui.

#### FR-001: Entrar com e-mail e senha

- **Status**: `implemented`
- **Escopo (web)**: `/entrar` com e-mail e senha (react-hook-form + zod), erro da API no
  formulário, espera do bloqueio a partir do `Retry-After`. Sem "esqueci a senha" nem "criar
  conta" até FR-002 e FR-004 existirem.

#### FR-002: Criar conta com e-mail e senha

- **Status**: `draft`
- **Escopo (web)**: tela de cadastro, junto com o perfil do adotante (Fase 2).

#### FR-003: Verificar o e-mail

- **Status**: `refined`
- **Escopo (web)**: em `/entrar`, a recusa `EMAIL_NOT_VERIFIED` avisa que o link foi reenviado;
  a volta do link (`/entrar?verificado=1`, ou com `error`) mostra se o e-mail foi confirmado.

#### FR-004: Redefinir a senha

- **Status**: `refined`
- **Escopo (web)**: link "Esqueci a senha" em `/entrar`; `/esqueci-a-senha` (pede o e-mail, sempre
  responde que, se houver conta, o link foi enviado); `/redefinir-senha?token=` (nova senha com
  as regras de BR-001; serve também ao primeiro acesso).

#### FR-005: Entrar com Google

- **Status**: `implemented`
- **Escopo (web)**: botão do Google só quando `GET /auth/providers` diz que está ligado.

#### FR-006: Código 2FA no login

- **Status**: `in-progress`
- **Escopo (web)**: `/entrar/2fa` com código de 6 dígitos (envia ao completar) e alternativa por
  código de recuperação. Falta a caixa "confiar neste dispositivo por 30 dias", desmarcada por
  padrão (a API já aceita).

#### FR-007: Gerenciar a própria conta

- **Status**: `draft`
- **Escopo (web)**: telas para ativar o 2FA (QR + confirmação + códigos), trocar senha, vínculos
  e sessões.

#### FR-008: Painel mínimo e sair

- **Status**: `implemented`
- **Escopo (web)**: `/painel` (nome, e-mail, 2FA, Sair) e `src/proxy.ts` mandando quem não tem
  sessão para `/entrar`.

#### FR-010: Gerenciar usuários (equipe da plataforma)

- **Status**: `draft`
- **Escopo (web)**: área da equipe (Fase 1).

#### FR-012: Consultar a auditoria

- **Status**: `draft`
- **Escopo (web)**: lista com filtros na área da equipe (Fase 1).

#### FR-013: Consultar e alterar os parâmetros da plataforma

- **Status**: `draft`
- **Escopo (web)**: formulário dos parâmetros com limites e unidades do catálogo (Fase 1).

---

#### NFR-006: Headers de segurança

- **Status**: `draft`
- **Escopo (web)**: CSP estrita, HSTS e `frame-ancestors` no Next.

#### NFR-011: Acessibilidade WCAG 2.1 AA

- **Status**: `implemented`
- **Escopo (web)**: axe no E2E das telas de acesso, do painel e da vitrine `/dev/ui`; foco com
  contorno sólido, alvos de 40 px ou mais.

#### NFR-012: Textos em português e traduzíveis

- **Status**: `implemented`
- **Escopo (web)**: next-intl com `messages/pt-BR.json`; mensagens de erro da API mapeadas por
  `code`.

#### NFR-021: Navegadores

- **Status**: `in-progress`
- **Escopo (web)**: E2E em Chromium (1440×900 e Pixel 7); Firefox e WebKit antes do beta.
