# Acolhe+

**Plataforma open source e gratuita de adoção responsável para ONGs e protetores de animais.**

Muitas ONGs e protetores independentes não têm site nem sistema para divulgar seus animais e triar
adotantes. O Acolhe+ oferece, de graça:

- **Página própria** para cada organização (`/ong/{slug}`), com logo, cores e informações da ONG;
- **Gestão de animais, candidaturas, pós-adoção e lar temporário** para a equipe da ONG;
- **Portal nacional** com todos os animais disponíveis, filtros e busca por distância;
- **Triagem com reputação moderada**, que protege os animais de adotantes com histórico de
  abandono ou maus-tratos, com direito de defesa e revisão humana.

> 🚧 **Status:** em desenvolvimento (Fase 0 — Fundação). Veja o [plano completo](docs/PLANO.md).

## Rodando localmente

Pré-requisitos: Node.js 24+, pnpm e Docker.

```bash
pnpm install
pnpm db:up        # Postgres + S3 local + Mailpit
pnpm dev
```

Nenhuma chave ou conta externa é necessária para desenvolver.

## Como contribuir

Toda ajuda é bem-vinda — código, design, testes, documentação ou conhecimento da rotina das ONGs.
Leia o [guia de contribuição](CONTRIBUTING.md) e o [código de conduta](CODE_OF_CONDUCT.md).
Encontrou uma falha de segurança? Siga a [política de segurança](SECURITY.md) — não abra issue pública.

## Licença

[AGPL-3.0](LICENSE). Qualquer pessoa pode usar, estudar e modificar o código, mas quem oferecer uma
versão modificada como serviço precisa publicar o código-fonte — assim o projeto continua livre para
as ONGs.
