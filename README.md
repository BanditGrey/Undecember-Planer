# UNDECEMBER Build Planner

Planejador de builds para **UNDECEMBER** (LINE Games) com dados reais capturados de
[undecember.thein.ru](https://undecember.thein.ru/en/) e do guia oficial de Runas.
Site estático (Vite + React + TypeScript) para a comunidade montar e compartilhar builds por link.

## Funcionalidades
- **Rune Cast** – tabuleiro 7×7: skill runes, link runes e runestones (clique direito). Link runes
  ortogonalmente adjacentes são vinculadas à skill; validação de compatibilidade via tags
  (Attack/Spell/Projectile/Minion/etc.). Células inválidas ficam em vermelho, links órfãos em laranja.
- **Equipamento & Autoridade dos Deuses** – 11 slots com os 707 itens únicos (filtrados por tipo)
  e as 144 autoridades (12 slots × 12 deuses).
- **Caminho do Mestre de Runas** – 168 nós, 4 tiers, com pré-requisitos de pontos por tier.
- **Compartilhamento** – a build inteira é codificada na URL (`#b=…`); basta copiar o link.
  Também salva builds no navegador (localStorage).

## Banco de dados próprio
O projeto **não depende do site fonte em tempo de execução**. Todos os dados e ícones ficam no repositório:

```
data/raw/        índice bootstrap capturado manualmente (365 runas, 40 tags, 90 runestones, 707 únicos, 168 nós)
data/cache/      HTML bruto de cada página (ignorado no git; permite re-parsear sem baixar de novo)
db/              banco estruturado em JSON por seção (runes, runestones, uniques, authority, runemaster,
                 essences, coins, potions, materials) — cada registro com `source` e `scrapedAt`
public/icons/    espelho local de todas as imagens
src/data/        bundle final consumido pelo app (gerado por scripts/build-data.mjs)
```

Pipeline:
1. `npm run data:scrape` – baixa listas + páginas de detalhe + ícones e grava `db/` (com retry, cache e rate-limit).
   Aceita seções como argumento (`node scripts/scrape.mjs runes uniques`), `FORCE=1` para ignorar cache e
   `OFFLINE=1` para só re-parsear o cache após ajustar os parsers em `scripts/lib/parsers.mjs`.
2. `npm run data:build` – gera `src/data/*.json`; usa `db/` quando existe e cai para `data/raw/` (+ ícones remotos) quando não.
3. `.github/workflows/update-db.yml` – roda o scraper semanalmente (ou manualmente) e commita as mudanças do banco.
4. `.github/workflows/deploy.yml` – publica o site no GitHub Pages a cada push em `main`.

> O sandbox onde o projeto foi iniciado não consegue acessar o site (bloqueio TLS), então a **primeira** carga completa
> do `db/` precisa ser feita na sua máquina ou pela Action: `npm install && npm run data:scrape && npm run data:build`.

## Desenvolvimento
```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # gera dist/
npm run data:build # regenera JSON a partir de data/raw
npm run data:scrape # (requer acesso ao site) enriquece com páginas de detalhe
```

## Roadmap
- Rodar a primeira carga completa do `db/` e revisar os parsers com dados reais.
- Telas para essências, poções, moedas e materiais (já entram no `db/`).
- Backend/galeria pública de builds.

Projeto de fãs, não afiliado à LINE Games / Needs Games.
