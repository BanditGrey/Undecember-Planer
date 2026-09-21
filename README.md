# UNDECEMBER Build Planner

Planejador de builds para **UNDECEMBER** (LINE Games) com dados reais capturados de
[undecember.thein.ru](https://undecember.thein.ru/en/) e do guia oficial de Runas.
Site estático (Vite + React + TypeScript) para a comunidade montar e compartilhar builds por link.

## Funcionalidades
- **Rune Cast** – tabuleiro hexagonal de 37 slots como no jogo: skill runes, link runes e runestones (clique direito).
  Link runes nos 6 hexágonos vizinhos são vinculadas à skill e validadas pelas regras reais
  ("Can be linked with Skills that satisfy…"). Tooltips no estilo do jogo com descrição, stats por nível
  (1–50: 45 base + Rune Candor, + bônus de equipamento), Rune Grade e Awakening.
- **Equipamento & Autoridade dos Deuses** – 11 slots com os 707 itens únicos (filtrados por tipo)
  e as 144 autoridades (12 slots × 12 deuses).
- **Caminho do Mestre de Runas** – 168 nós, 4 tiers, com pré-requisitos de pontos por tier.
- **Compartilhamento** – a build inteira é codificada na URL (`#b=…`); basta copiar o link.
  Também salva builds no navegador (localStorage).
- **Galeria da comunidade** – aba *Galeria*: “Publicar” abre uma issue pré-preenchida no GitHub
  com o código da build; a galeria lê as issues abertas pela API pública (sem servidor) e permite
  abrir qualquer build direto no planner. Curtidas/comentários acontecem na própria issue.
- **Cores e slots** – cada runa tem sua cor (Vermelha/Verde/Azul, extraída do filtro “Rune stat” da fonte).
  Nas skills você define a cor de cada um dos 6 slots (R/G/B/Branco/fechado) e o planner valida
  cor + tags como no jogo; botão “Ajustar slots às link runes” preenche automaticamente. Painel “?”
  explica Essências de Nascimento/Cor/Vínculo/Candor/Hexa.
- **Grau e Despertar** – N/M/R/L e ☆ Source/Origin/Verity em cada runa do tabuleiro; ambos entram no tooltip e no DPS.
- **Runas de gatilho** – seta rotacionável no hexágono; valida a skill *Alvo* (direção da seta) e a
  skill de *Ativação* (lado oposto) pelas tags exigidas no texto da runa.
- **Busca global (Ctrl+K)** – runas, runestones, únicos, autoridades e nós do Mestre de Runas com tooltip.
- **Link somente leitura** – `…#b=…&view=1` abre a build em modo de visualização (ótimo para postar); botão “Editar” para copiar e alterar.
- **Tema claro/escuro** – botão ☀/☾ no cabeçalho.
- **Builds prontas por temporada** – 14 builds da comunidade reconstruídas a partir de guias públicos (tier lists e guias do Nirtas, Reddit, Pocket Gamer com builds dos jogadores Daimonios, Ya55 e Zismoo), agrupadas por temporada (S12 Farside, S11 The Forge, S10 New Age, S9 Abyss Gate, S7 Trials of Power) com tier, autor e link da fonte, mais 4 modelos iniciais genéricos. Todas passam pelas regras de link/cor/gatilho do planner.
  - Runas de link que o guia não cita explicitamente foram inferidas pelas tags do jogo (indicado nas notas de cada build).
  - Cada build tem estágio **Campanha** (runas normais, nível 20, links de campanha) e **Endgame** (skill lendária com awakening, links raros, nível 45+2, uniques do guia), lista de **prioridade** de runas, resumo das **cores de slot** necessárias na skill principal e uma estimativa de dano/hit calculada pelo módulo de DPS.
  - Runas lançadas depois que o undecember.thein.ru parou de atualizar (S8→S12) ficam em `db/runes-extra.json`, transcritas das notas oficiais de atualização (ud.floor.line.games): Frost Storm, Axe Throw, Charged Shot, Divine Punishment e as runas de link Transcendentes (Harmony, Enhance Effect, Improved Technique) com tabelas Lv1/Lv45, grau e awakening; Lightning Slash, Flash, Iai-jutsu, Wrathful Blow, Toxic Mist, Chain of Pain e Transcendent Mana Storm só tiveram descrição publicada e são marcadas como `unofficial` (sem números/DPS). Ícones provisórios (arte semelhante) até o mirror receber a arte oficial. O mesmo arquivo aplica o patch de S9 que dá a tag *Spell* às runas de link *Melee*.
- **Zodíaco (Especializações)** – aba própria com as 24 especializações oficiais (6 rotas × Ⅰ/Ⅱ/Ⅲ: Aço/Tristeza/Tipan/Tocha, Martelo/Ira/Chama/Fogueira, Respiração/Cadáver/Carrasco/Fogo-fátuo, Escuridão/Stra/Pescador/Veleiro, Brilho/Vácuo/Cachoeira/Pirata, Alvorada/Granizo/Monção/Simpatia), 504 nós Lua/Estrela/Sol/Cosmos desenhados como constelações, regra de pré-requisito por linha e limite de pontos (7/7/9). Transcrito das notas oficiais de 9/jan/2025 (`db/zodiac.json`); os nós ativos viajam junto no link da build e entram na estimativa de DPS (linhas incondicionais de dano; nós "com arma de 2 mãos/1 mão" só contam com a arma equipada).
- **Slots “a rolar”** – em cada grupo de skill o painel mostra as cores exigidas pelos links atuais e o que falta no Rune Cast: slot fechado → abrir (Essência de Nascimento), cor errada → rolar (Essência de Cor), slot indefinido → cor necessária.
- **Conversão de elemento** – `Convert X DMG` altera o elemento efetivo da skill para validar os demais links (ex.: Extract Earth Energy em Lightning Arrow + Convert Physical Damage).
- **Exportar PNG** – card 1200×675 da build (tabuleiro, skills, DPS, equipamento) para Discord/redes.
- **Desfazer/refazer & atalhos** – Ctrl+Z/Y, Ctrl+S salva, teclas 1–9 trocam de aba.
- **Personagem & checagem** – nível/FOR/DES/INT da build; avisa únicos com requisito não atendido, nós do Mestre de Runas acima do nível e autoridades do mesmo deus repetidas.
- **Comparar** – build atual (A) vs. build salva ou link colado (B): skills, DPS por skill com Δ%, equipamento e nós do Mestre de Runas diferentes.
- **DPS (estimativa)** – classifica cada stat parseado (increase / amplification / more-less / flat),
  respeitando tags da skill e ignorando condicionais, e mostra o DPS estimado por skill do tabuleiro
  (arma média × %base + flat) × (1+inc) × (1+amp) × more, incluindo nós do Mestre de Runas.
- **Itens** – essências, moedas, poções e materiais (com receitas).
- **PT / EN** – interface bilíngue (botão no topo). Em PT, os textos do jogo são traduzidos por um
  glossário próprio (`src/lib/glossary.ts`) e as 221 descrições de skills foram traduzidas à mão
  (`data/i18n/pt/rune_descriptions.json`). A opção “Texto original (EN)” mantém as strings do jogo
  em inglês para conferir com o cliente/wiki.

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

Estado atual do banco: **365 runas** (stats Lv1/45, grades, awakenings, regras de link), **90 runestones**, **707 únicos** (base + afixos),
**144 autoridades** (opções unique/prefix/suffix), **168 nós** do Mestre de Runas, **124 essências, 55 poções, 12 moedas, 94 materiais**,
e ~22 MB de ícones espelhados. Para forçar uma recarga: `date > .db-refresh && git push` ou rode o workflow manualmente.

## Desenvolvimento
```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # gera dist/
npm run data:build # regenera JSON a partir de data/raw
npm run data:scrape # (requer acesso ao site) enriquece com páginas de detalhe
```

## Roadmap
- Refinar glossário PT (nomes de itens únicos e autoridades).

Projeto de fãs, não afiliado à LINE Games / Needs Games.
