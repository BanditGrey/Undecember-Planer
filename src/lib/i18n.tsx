import { createContext, useContext, useState, type ReactNode } from 'react';

export type Lang = 'pt' | 'en';
const dict = {
  pt: {
    appSub: 'Build Planner', buildName: 'Nome da build', author: 'Autor', share: 'Compartilhar link', save: 'Salvar', newBuild: 'Nova', copied: 'Link copiado!', saved: 'Build salva localmente.',
    tabBoard: 'Rune Cast', tabEquip: 'Equipamento', tabRM: 'Mestre de Runas', tabItems: 'Itens', tabBuilds: 'Builds salvas', tabDps: 'DPS',
    savedTitle: 'Builds salvas neste navegador', savedEmpty: 'Nenhuma. Use "Salvar" para guardar a build atual; use "Compartilhar link" para enviá-la à comunidade.', open: 'Abrir', del: 'Excluir', cells: 'células',
    notes: 'Notas', notesPh: 'Descrição, ordem de prioridade, dicas…',
    footer: 'Dados: {runes} runas · {runestones} runestones · {uniques} únicos · {rm} nós do Mestre de Runas · {auth} autoridades — fonte', footer2: 'e guia oficial. Projeto de fãs, não afiliado à LINE Games.',
    boardHint: 'clique: runa · clique direito: runestone · passe o mouse para o tooltip', runeLevel: 'Nível da runa', runeLevelTip: 'Cap base 45; Rune Candor Essence: +1 a cada 5 sucessos, máx. +5', bonus: 'bônus', bonusTip: '+X Skill Rune Level de equipamentos / Improved Technique',
    noLinks: 'Nenhuma link rune adjacente.', orphans: 'Link runes sem skill adjacente:', boardEmpty: 'Adicione skill runes ao tabuleiro. Link runes nos 6 hexágonos vizinhos são vinculadas à skill.',
    pickRune: 'Selecionar runa', pickStone: 'Selecionar runestone', type: 'Tipo', tag: 'Tag', rarity: 'Raridade', all: 'todos', search: 'Buscar…', remove: 'Remover', nothing: 'Nada encontrado.', skillRune: 'Skill Rune', linkRune: 'Link Rune',
    linkNoTags: 'Link rune sem tags restritivas — aplica-se a qualquer skill.', linkVia: 'Compatível via {tags}', linkMissing: 'Skill não possui nenhuma das tags: {tags}',
    equipTitle: 'Equipamento & Autoridade dos Deuses', equipHint: 'clique: item único · clique direito: autoridade', equipEmpty: 'Nenhum item equipado. Clique num slot para escolher um item único (707 disponíveis) ou clique direito para definir a Autoridade dos Deuses do slot.', item: 'Item', authority: 'Autoridade', uniquePick: 'Único — {slot}', authPick: 'Autoridade — {slot}',
    slot_Helmet: 'Elmo', slot_Necklace: 'Colar', slot_Pauldrons: 'Ombreiras', slot_Armor: 'Armadura', slot_Weapons: 'Arma', slot_Offhand: 'Mão secundária', slot_Gloves: 'Luvas', slot_Belt: 'Cinto', slot_Ring1: 'Anel', slot_Ring2: 'Anel', slot_Shoes: 'Botas',
    rmTitle: 'Caminho do Mestre de Runas', rmPts: '{n} pontos distribuídos', rmAll: 'Todas as constelações', reset: 'Resetar', rmHint: 'Clique para adicionar ponto · clique direito para remover · tiers exigem pontos no tier anterior.', rmUnlock: 'Desbloqueia no nível {lv} · máx. {max} pontos', rmReq: 'requer {n} pontos no Tier {t}', rmMissing: 'faltam {n}', perPoint: '[por ponto]', points: 'pontos',
    itemsTitle: 'Itens', essences: 'Essências', potions: 'Poções', coins: 'Moedas', materials: 'Materiais', itemsEmpty: 'Sem dados ainda — a carga do banco preenche esta seção.',
    tipMissing: 'Detalhes ainda não importados', tipEst: 'Interpolado entre Lv1 e Lv45 do banco', weapon: 'Arma', source: 'Fonte', unlockAt: 'Desbloqueia',
    dpsTitle: 'Estimativa de dano', dpsHint: 'Estimativa simplificada a partir dos stats do banco (nível selecionado) e dos modificadores dos link runes / Mestre de Runas. Não substitui o cálculo do jogo.', dpsSkill: 'Skill', dpsBase: 'DMG base da runa', dpsFlat: 'DMG fixo', dpsMore: 'Multiplicadores (link runes)', dpsInc: 'Aumentos (%)', dpsAmp: 'Amplificação (%)', dpsResult: 'DMG por uso (estimado)', dpsCost: 'Custo de mana', dpsNoSkill: 'Coloque uma skill rune no tabuleiro para ver a estimativa.',
    weaponDmg: 'DMG da arma (média)', charStat: 'Bônus do personagem (%)',
  },
  en: {
    appSub: 'Build Planner', buildName: 'Build name', author: 'Author', share: 'Share link', save: 'Save', newBuild: 'New', copied: 'Link copied!', saved: 'Build saved locally.',
    tabBoard: 'Rune Cast', tabEquip: 'Equipment', tabRM: 'Rune Master', tabItems: 'Items', tabBuilds: 'Saved builds', tabDps: 'DPS',
    savedTitle: 'Builds saved in this browser', savedEmpty: 'None yet. Use "Save" to keep the current build; use "Share link" to send it to the community.', open: 'Open', del: 'Delete', cells: 'cells',
    notes: 'Notes', notesPh: 'Description, priority order, tips…',
    footer: 'Data: {runes} runes · {runestones} runestones · {uniques} uniques · {rm} Rune Master nodes · {auth} authorities — source', footer2: 'and the official guide. Fan project, not affiliated with LINE Games.',
    boardHint: 'click: rune · right-click: runestone · hover for tooltip', runeLevel: 'Rune level', runeLevelTip: 'Base cap 45; Rune Candor Essence: +1 per 5 successes, max +5', bonus: 'bonus', bonusTip: '+X Skill Rune Level from gear / Improved Technique',
    noLinks: 'No adjacent link rune.', orphans: 'Link runes without adjacent skill:', boardEmpty: 'Add skill runes to the board. Link runes in the 6 neighbouring hexes are linked to the skill.',
    pickRune: 'Select rune', pickStone: 'Select runestone', type: 'Type', tag: 'Tag', rarity: 'Rarity', all: 'all', search: 'Search…', remove: 'Remove', nothing: 'Nothing found.', skillRune: 'Skill Rune', linkRune: 'Link Rune',
    linkNoTags: 'Link rune without restrictive tags — applies to any skill.', linkVia: 'Compatible via {tags}', linkMissing: 'Skill has none of the tags: {tags}',
    equipTitle: 'Equipment & Authority of the Gods', equipHint: 'click: unique item · right-click: authority', equipEmpty: 'Nothing equipped. Click a slot to choose a unique item (707 available) or right-click to set the slot\'s Authority of the Gods.', item: 'Item', authority: 'Authority', uniquePick: 'Unique — {slot}', authPick: 'Authority — {slot}',
    slot_Helmet: 'Helmet', slot_Necklace: 'Necklace', slot_Pauldrons: 'Pauldrons', slot_Armor: 'Armor', slot_Weapons: 'Weapon', slot_Offhand: 'Off-hand', slot_Gloves: 'Gloves', slot_Belt: 'Belt', slot_Ring1: 'Ring', slot_Ring2: 'Ring', slot_Shoes: 'Shoes',
    rmTitle: 'Path of the Rune Master', rmPts: '{n} points allocated', rmAll: 'All constellations', reset: 'Reset', rmHint: 'Click to add a point · right-click to remove · tiers require points in the previous tier.', rmUnlock: 'Unlocks at level {lv} · max {max} points', rmReq: 'requires {n} points in Tier {t}', rmMissing: '{n} missing', perPoint: '[per point]', points: 'points',
    itemsTitle: 'Items', essences: 'Essences', potions: 'Potions', coins: 'Coins', materials: 'Materials', itemsEmpty: 'No data yet — the database refresh fills this section.',
    tipMissing: 'Details not imported yet', tipEst: 'Interpolated between Lv1 and Lv45 from the database', weapon: 'Weapon', source: 'Source', unlockAt: 'Unlocks',
    dpsTitle: 'Damage estimate', dpsHint: 'Simplified estimate from the database stats (selected level) plus link rune / Rune Master modifiers. Not a replacement for the in-game calculation.', dpsSkill: 'Skill', dpsBase: 'Rune base DMG', dpsFlat: 'Flat DMG', dpsMore: 'Multipliers (link runes)', dpsInc: 'Increases (%)', dpsAmp: 'Amplification (%)', dpsResult: 'DMG per use (estimated)', dpsCost: 'Mana cost', dpsNoSkill: 'Place a skill rune on the board to see the estimate.',
    weaponDmg: 'Weapon DMG (average)', charStat: 'Character bonus (%)',
  },
} as const;
export type Key = keyof typeof dict.pt;

const Ctx = createContext<{ lang: Lang; setLang: (l: Lang) => void; t: (k: Key, vars?: Record<string, string | number>) => string }>(null!);
export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => (localStorage.getItem('lang') as Lang) || (navigator.language.startsWith('pt') ? 'pt' : 'en'));
  const setLang = (l: Lang) => { localStorage.setItem('lang', l); setLangState(l); document.documentElement.lang = l === 'pt' ? 'pt-BR' : 'en'; };
  const t = (k: Key, vars: Record<string, string | number> = {}) => (dict[lang][k] as string).replace(/\{(\w+)\}/g, (_, v) => String(vars[v] ?? ''));
  return <Ctx.Provider value={{ lang, setLang, t }}>{children}</Ctx.Provider>;
}
export const useT = () => useContext(Ctx);
