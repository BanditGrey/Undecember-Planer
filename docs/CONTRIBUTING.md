# Contribuindo

## Setup
```bash
npm ci
npm run dev      # http://localhost:5173
npm test         # vitest
npm run build    # tsc + vite
```

## Atualizando dados do jogo
- Correções de parser: edite `scripts/lib/parsers.mjs`, rode `OFFLINE=1 npm run data:scrape` (usa `data/cache`) e depois `npm run data:build`.
- Conteúdo novo que não existe na fonte (runas pós-S8, zodíaco): edite `db/runes-extra.json` / `db/zodiac.json` à mão,
  cite a fonte (`source`, `sourceUrl`) e regenere com `npm run data:build`. **Commite `src/data` junto** — o CI compara.
- Ícones: PNG 64×64 em `public/icons/runes/<slug>.png`; remova `placeholderIcon: true` do registro.
- Traduções PT: `data/i18n/pt/rune_descriptions.json` (descrições) e `src/lib/glossary.ts` (termos).

## Presets
`src/lib/presets.ts`. Cada preset precisa de `source` (link público), temporada, tier e passar em `tests/presets.test.ts`
(links válidos, cores de slot coerentes, triggers resolvidos). Rode `npm test` antes de abrir PR.

## Estilo
- Um componente por arquivo em `src/components`; lógica pura em `src/lib` (testável sem DOM).
- Strings de UI sempre via `useT()` com chave em PT **e** EN (`src/lib/i18n.tsx`).
- Textos do jogo ficam em inglês no banco; a tradução acontece na renderização (glossário).

## Precisa de ajuda da comunidade
1. Valores dos nós normais do Zodíaco (constelações I–IX) — screenshots ou tabela.
2. Ícones oficiais das 15 runas provisórias (`placeholderIcon: true` em `src/data/runes.json`).
3. Revisão dos 17 presets por jogadores da temporada atual.
