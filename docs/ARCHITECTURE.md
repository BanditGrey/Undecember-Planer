# Arquitetura

Site estático (Vite + React 18 + TypeScript, sem backend obrigatório). Toda a lógica roda no navegador;
os dados do jogo são JSON versionados no repositório.

```
data/raw/            índice bootstrap (capturado manualmente do undecember.thein.ru)
data/i18n/pt/        traduções manuais (221 descrições de skills)
db/                  banco estruturado por seção (saída do scraper) + runes-extra.json / zodiac.json transcritos das notas oficiais
scripts/
  scrape.mjs         baixa listas, páginas de detalhe e ícones → db/ (cache em data/cache, retry, rate-limit)
  lib/parsers.mjs    parsers HTML por seção
  build-data.mjs     db/ (+ data/raw fallback) → src/data/*.json  (npm run data:build)
public/icons/        espelho local das imagens (~22 MB)
src/
  data/index.ts      carrega os JSON e expõe Maps (runeBySlug, uniqueBySlug, nodeById, zodiacNodeById…)
  types.ts           tipos do domínio e do objeto Build
  lib/
    rules.ts         geometria hexagonal (axial q,r; RADIUS 3 = 37 células), regras de link/cor/grau, triggers, conversão de elemento
    level.ts         interpolação de stats Lv1→Lv45 (+5 Candor, + bônus de gear)
    dps.ts           classificador de linhas de stat e estimativa de DPS (ver DPS.md)
    zodiac.ts        pré-requisitos e limite de pontos das especializações
    check.ts         avisos da build (requisitos de únicos, nível do Runemaster, autoridades repetidas)
    share.ts         codificação da build em base64url na URL (#b=), localStorage
    gallery.ts       galeria via GitHub Issues (API pública, sem servidor)
    cloud.ts         galeria hospedada opcional (Supabase/PostgREST) — links curtos #c=, votos
    presets.ts       17 builds prontas por temporada + estágios Campanha/Endgame
    card.ts          export PNG 1200×675 (canvas)
    glossary.ts      glossário EN→PT aplicado aos textos do jogo
    i18n.tsx         strings da interface PT/EN
  components/        Board (Rune Cast), Equipment, RuneMaster, Zodiac, Dps, Items, Gallery, Compare, Character, Picker, Search, Tooltip
tests/               vitest (presets, dps, rules)
supabase/schema.sql  schema + RLS + RPC de voto para a galeria hospedada
.github/workflows/   ci.yml (PRs), deploy.yml (Pages), update-db.yml (scraper semanal)
```

## Fluxo de estado
`App.tsx` mantém um único objeto `Build` (ver BUILD_FORMAT.md) com histórico de undo/redo. Cada alteração
reescreve `location.hash` (`#b=<base64url>`), então qualquer estado é um link compartilhável. A abertura de
`#c=<id>` consulta o backend opcional e substitui a build.

## Tabuleiro hexagonal
Coordenadas axiais `(q, r)` com raio 3 → 37 células; `DIRS` define as 6 direções (índice usado tanto para os
slots de link de uma skill quanto para a seta das runas de gatilho). `analyzeBoard()` agrupa cada skill com as
link runes vizinhas, valida via `checkLink()` (tags exigidas no texto "Can be linked with…", cor do slot) e
resolve triggers (alvo = direção da seta, ativação = lado oposto).

## Build de dados
`npm run data:build` é determinístico; o CI falha se `src/data` divergir do que os scripts geram, garantindo
que mudanças em `db/` sempre venham acompanhadas do bundle regenerado.

## Bundle
`vite.config.ts` divide em `vendor`, `data-runes`, `data-uniques`, `data-items` e app — dados mudam raramente e
ficam em cache separado do código.
