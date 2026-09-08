# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **Equipe das organizações** (primeiro público das telas da Fase 0): voluntários, coordenadores e
  protetores independentes de ONGs de animais. Entram para gerenciar animais, candidaturas,
  pós-adoção e lar temporário da própria organização; podem pertencer a várias.
- **Equipe da plataforma**: superadmin, moderadores (aprovações, ocorrências, denúncias) e suporte
  (somente leitura). Sempre com 2FA.
- **Adotantes** (a partir da Fase 2): procuram animais no portal nacional e se candidatam, com ou
  sem conta; CPF obrigatório para candidatar.
- **Visitantes**: navegam no portal e nas páginas das ONGs e denunciam conteúdo.

## Product Purpose

Muitas ONGs e protetores independentes não têm site nem sistema para divulgar animais e triar
adotantes. O Acolhe+ é uma plataforma gratuita, multi-tenant e open source (AGPL-3.0), hospedada
centralmente, em que cada organização aprovada ganha sua página (`/ong/{slug}`) com layout padrão
e marca própria, gerencia o processo de adoção ponta a ponta, e os adotantes encontram animais
num portal nacional. Sucesso é animal adotado com responsabilidade e sem retorno ao abandono.

## Positioning

- Gratuita e sem fins lucrativos; proíbe venda de animais (taxa de adoção só cobre custos, com
  teto configurável de até R$ 500).
- Sistema de reputação moderado e compartilhado entre ONGs: ocorrências com direito de defesa,
  selos e inelegibilidade protegem os animais de adotantes com histórico de abandono ou
  maus-tratos, sem expor a ONG autora.
- Cada ONG mantém a própria identidade (logo e cores, com contraste validado) dentro de um layout
  fixo da plataforma.

## Operating Context

- Fluxo da ONG: inscrição e aprovação → animais → candidaturas por etapas → adoção concluída
  (documento com foto conferido) → acompanhamento pós-adoção (30/90/180 dias).
- Comunicação por e-mail transacional e botões `wa.me`; sem API paga.
- Segurança como parte da rotina: 2FA para a equipe da plataforma e membros com acesso a dados
  sensíveis; CPF mascarado e revelação auditada.

## Capabilities and Constraints

- Português do Brasil apenas, com todos os textos em arquivos de mensagens (next-intl).
- Web em Next.js; API separada (Hono em Cloudflare Workers); orçamento de hospedagem ~R$ 0.
- Login por e-mail e senha ou Google, 2FA TOTP; ainda sem e-mail transacional (verificação de
  e-mail, recuperação de senha e convites por e-mail vêm em item posterior).
- Somente tema claro por enquanto.
- Termos usados no produto: organização (ONG ou protetor independente), adotante, candidatura,
  lar temporário, ocorrência, selo.

## Brand Commitments

- Nome: **Acolhe+** (definitivo).
- Cores, tipografia e logo: **ainda livres**; as cores atuais no código são provisórias.
- Voz: acolhedora e direta. Trata por "você", frases curtas, linguagem simples; calorosa sem ser
  fofa, séria em segurança, denúncias e maus-tratos.

## Evidence on Hand

Nenhuma ainda: não há logo, fotos reais de animais, depoimentos, ONGs parceiras nem números de
uso. Nada disso pode ser inventado como real; material ilustrativo deve ser rotulado como exemplo.

## Product Principles

1. O animal vem primeiro: regras e telas protegem o bem-estar dele antes da conveniência.
2. Justiça com o adotante: toda restrição tem motivo, prazo de defesa e revisão.
3. A ONG é a dona da relação: a plataforma dá a estrutura, a organização dá a cara.
4. Segurança e privacidade sem atrito desnecessário: dado sensível só aparece para quem precisa.
5. Qualquer pessoa consegue usar, inclusive sem enxergar a tela ou sem mouse.

## Accessibility & Inclusion

- WCAG 2.1 AA, verificado por axe nos testes E2E.
- Uso completo por leitor de tela (TalkBack, VoiceOver, NVDA) e só por teclado.
- As cores de cada ONG são aceitas apenas com contraste AA (validação no domínio).
