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

## Dados
| Arquivo | Conteúdo |
|---|---|
| `data/raw/runes_list.txt` | 365 runas (Skill/Link, slug, nome, ícone) |
| `data/raw/tags_members.txt` | 40 tags → runas |
| `data/raw/runestones.txt` | 90 runestones (Magic/Rare/Unique) |
| `data/raw/uniques_list.txt` | 707 itens únicos (tier, slug, nome, ícone) |
| `data/raw/runemaster.txt` | 168 nós do Mestre de Runas |
| `scripts/build-data.mjs` | gera `src/data/*.json` a partir dos arquivos acima |
| `scripts/scrape.mjs` | baixa as páginas de detalhe (stats, regras de link, afixos) e gera `*_details.json` |

Os ícones são carregados diretamente do site fonte.

## Desenvolvimento
```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # gera dist/
npm run data:build # regenera JSON a partir de data/raw
npm run data:scrape # (requer acesso ao site) enriquece com páginas de detalhe
```

## Roadmap
- Importar textos de detalhe (regras exatas de link, stats nível 1/45, awakenings, afixos dos únicos, opções das autoridades) via `scripts/scrape.mjs`.
- Essências, poções, moedas e materiais.
- Backend/galeria pública de builds.

Projeto de fãs, não afiliado à LINE Games / Needs Games.
