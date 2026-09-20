import { emptyBuild, type Build, type Cell, type RuneColor } from '../types';
import { DIRS, RADIUS, key, step } from './rules';
import { runeBySlug } from '../data';

// ---------------------------------------------------------------------------------------------
// Preset builds. Two kinds:
//  • community builds researched from creators' guides (YouTube/Google Docs), grouped by season;
//  • generic starters ("Geral").
// Each community preset carries its source URL. Link runes are the ones named in the guide; when a
// guide only names the main setup, the buff/utility skills follow the creator's standard pattern
// (Marksman/Fighter's Wrath + Increase Duration + Time Acceleration, Seal of Critical Chance,
// movement skill + Disarm). Runes added after the source site stopped updating live in
// db/runes-extra.json (transcribed from the official patch notes); the ones without published numbers
// (Toxic Mist, Wrathful Blow, Lightning Slash, Flash, Iai-jutsu, Chain of Pain) are flagged `unofficial`.
// ---------------------------------------------------------------------------------------------

type L = [string, RuneColor];
const inside = (q: number, r: number) => Math.max(Math.abs(q), Math.abs(r), Math.abs(-q - r)) <= RADIUS;
/** Place a skill at `at` and its link runes on free neighbouring cells (preferred directions first). Slot colours are set to the links' colours. */
function place(board: Record<string, Cell>, at: [number, number], slug: string, links: L[] = [], extra: Partial<Cell> = {}) {
  const k = key(at[0], at[1]);
  const dirs = DIRS.map((_, d) => d).filter(d => { const n = step(k, d); return n && !board[n]; });
  // prefer directions pointing towards the centre so corner skills keep their links inside the board
  dirs.sort((a, b) => dist(step(k, a)!) - dist(step(k, b)!));
  const slots: (RuneColor | undefined)[] = [];
  links.forEach(([l, c], i) => { const d = dirs[i]; if (d === undefined) throw new Error(`no room for ${l} around ${slug}`); board[step(k, d)!] = { rune: l }; slots[d] = c; });
  board[k] = { rune: slug, slots, ...extra };
}
const dist = (k: string) => { const [q, r] = k.split(',').map(Number); return Math.max(Math.abs(q), Math.abs(r), Math.abs(-q - r)); };
void inside;

// Board corners (radius 3) – far enough from the centre so link rings never touch two skills.
const C: Record<string, [number, number]> = { NE: [3, -3], E: [3, 0], SE: [0, 3], SW: [-3, 3], W: [-3, 0], NW: [0, -3] };
// Standard creator pattern for the utility skills of an attack build.
const bowUtility = (b: Build, seal = 'SealOfCriticalChance', move = 'TrickShot') => {
  place(b.board, C.NE, 'Marksman', [['IncreaseDuration', 'G'], ['TimeAcceleration', 'B']]);
  place(b.board, C.E, 'BulwarkOfProtection', [['IncreaseDuration', 'G'], ['TimeAcceleration', 'B']]);
  place(b.board, C.SW, move, [['Disarm', 'R']]);
  place(b.board, C.NW, seal, []);
};
const meleeUtility = (b: Build, seal = 'SealOfCriticalChance', move = 'LeapAttack') => {
  place(b.board, C.NE, 'FightersWrath', [['IncreaseDuration', 'G'], ['TimeAcceleration', 'B']]);
  place(b.board, C.E, 'BulwarkOfProtection', [['IncreaseDuration', 'G'], ['TimeAcceleration', 'B']]);
  place(b.board, C.SW, move, [['Disarm', 'R']]);
  place(b.board, C.NW, seal, []);
};

export type Season = 'S12' | 'S11' | 'S10' | 'S9' | 'GEN';
export const SEASONS: { id: Season; name: { pt: string; en: string }; date: string }[] = [
  { id: 'S12', name: { pt: 'Temporada 12 · Farside', en: 'Season 12 · Farside' }, date: '2026-09' },
  { id: 'S11', name: { pt: 'Temporada 11 · The Forge', en: 'Season 11 · The Forge' }, date: '2026-05' },
  { id: 'S10', name: { pt: 'Temporada 10 · New Age', en: 'Season 10 · New Age' }, date: '2026-01' },
  { id: 'S9', name: { pt: 'Temporada 9 · Abyss Gate', en: 'Season 9 · Abyss Gate' }, date: '2025-09' },
  { id: 'GEN', name: { pt: 'Geral · iniciantes', en: 'General · starters' }, date: '' },
];

export type Stage = 'start' | 'end';
export type Lang = 'pt' | 'en';
export interface Preset {
  id: string; season: Season; tier?: 'S' | 'A' | 'B';
  name: { pt: string; en: string }; desc: { pt: string; en: string };
  stat: Build['stat']; author?: string; source?: string;
  /** Rune slugs in the order they should be levelled / acquired. */
  priority?: string[];
  notes?: { pt: string; en: string };
  /** Stages available: 'end' always; 'start' when the preset has a campaign layout. */
  stages: Stage[];
  make: (stage: Stage) => Build;
}

const base = (name: string, stat: Build['stat'], author: string, ch: [number, number, number, number]) => {
  const b = emptyBuild(); b.name = name; b.stat = stat; b.author = author; b.char = { level: ch[0], str: ch[1], dex: ch[2], int: ch[3] }; return b;
};
/** Endgame finishing: legendary main skill with awakening, rare links, rune level 45 (+bonus from gear). */
function endgame(b: Build, main: string, awaken?: Cell['awaken'], linkGrade: Cell['grade'] = 2) {
  for (const [k, c] of Object.entries(b.board)) { if (!c.rune) continue; if (k === main) { c.grade = 3; if (awaken) c.awaken = awaken; } else if (c.slots === undefined && !c.dir) c.grade = linkGrade; }
  b.runeLevel = 45; b.runeLevelBonus = 2;
}
/** Campaign stage: normal runes, rune level ~20, lower stats. */
function starter(b: Build, level = 40) { for (const c of Object.values(b.board)) { delete c.grade; delete c.awaken; } b.runeLevel = 20; b.runeLevelBonus = 0; if (b.char) b.char = { level, str: Math.round(b.char.str / 3), dex: Math.round(b.char.dex / 3), int: Math.round(b.char.int / 3) }; b.equipment = {}; }
/** Build a preset for a stage, filling notes (bilingual) + priority list. */
export function makePreset(p: Preset, stage: Stage, lang: Lang): Build {
  const b = p.make(p.stages.includes(stage) ? stage : p.stages[p.stages.length - 1]);
  const pr = p.priority?.length ? (lang === 'pt' ? 'Prioridade: ' : 'Priority: ') + p.priority.map(sl => runeBySlug.get(sl)?.name ?? sl).join(' > ') : '';
  b.notes = [p.notes?.[lang] ?? '', pr].filter(Boolean).join('\n'); return b;
}

export const PRESETS: Preset[] = [
  // ------------------------------------------------------------------ S12 Farside (Sep 2026)
  { id: 's12-ww-bleed', season: 'S12', tier: 'S', stat: 'STR', author: 'Nirtas', source: 'https://www.youtube.com/watch?v=_iT378uI6OA', stages: ['start', 'end'],
    name: { pt: 'Whirlwind + Frost Bomb (Sangramento)', en: 'Whirlwind + Frost Bomb (Bleed)' },
    desc: { pt: 'Tier S na lista S12 do Nirtas: Whirlwind canalizado com Endless Pain/Cut para sangrar, Extract Earth Energy e Frost Bomb disparada por Spell Activation while Channeling (convertida para físico).', en: 'S tier on Nirtas\' S12 list: channelled Whirlwind with Endless Pain/Cut for bleeds, Extract Earth Energy, and Frost Bomb triggered by Spell Activation while Channeling (converted to physical).' },
    priority: ['Whirlwind', 'EndlessPain', 'ExtractEarthEnergy', 'FrostBomb', 'Cut', 'IntensifyPain'],
    notes: { pt: 'Fonte: Nirtas – Build Tier List S12 Farside + Whirlwind Frostbomb Bleeds Starter (S11). Sangramento escala com Bleed Rate/Bleed DMG; o gatilho dispara Frost Bomb enquanto canaliza. Intensify Pain foi nerfado 30% em S12 mas segue sendo o buff. Ombreiras Cold Comfort são o unique de Frost Bomb. Slots: 4🔴 1🟢 no Whirlwind; 4🔴 1🔵 na Frost Bomb.', en: 'Source: Nirtas – Build Tier List S12 Farside + Whirlwind Frostbomb Bleeds Starter (S11). Bleeds scale with Bleed Rate/Bleed DMG; the trigger fires Frost Bomb while channelling. Intensify Pain was nerfed 30% in S12 but is still the buff. Cold Comfort pauldrons are the Frost Bomb unique. Slots: 4🔴 1🟢 on Whirlwind; 4🔴 1🔵 on Frost Bomb.' },
    make: (stage) => { const b = base('Whirlwind Frost Bomb Bleed (S12)', 'STR', 'Nirtas', [95, 320, 120, 80]);
      b.board['0,0'] = { rune: 'SpellActivationWhileChanneling', dir: 0 };
      place(b.board, [-1, 0], 'Whirlwind', [['EndlessPain', 'R'], ['Cut', 'G'], ['ExtractEarthEnergy', 'R'], ['AdditionalPhysicalDMG', 'R'], ['Savagery', 'R']]);
      place(b.board, [1, 0], 'FrostBomb', [['ConvertPhysicalDamage', 'R'], ['EndlessPain', 'R'], ['Strike', 'R'], ['Confidence', 'R'], ['QuickCast', 'B']]);
      place(b.board, C.NE, 'IntensifyPain', [['IncreaseDuration', 'G'], ['TimeAcceleration', 'B']]);
      place(b.board, C.SW, 'LeapAttack', [['Disarm', 'R']]); place(b.board, C.NW, 'SealOfCriticalChance', []); place(b.board, C.SE, 'BulwarkOfProtection', [['IncreaseDuration', 'G']]);
      endgame(b, '-1,0', 'Source'); b.board['1,0'].grade = 3; b.board['1,0'].awaken = 'Origin';
      b.equipment = { Pauldrons: { unique: 'ColdComfort' }, Armor: { unique: 'AquillasEternity' }, Helmet: { unique: 'SpicasRegret' }, Ring1: { unique: 'BandOfCertainty' } };
      if (stage === 'start') { starter(b, 45); for (const [k, c] of Object.entries(b.board)) if (c.rune === 'ExtractEarthEnergy') { c.rune = 'Hunger'; b.board[k] = c; } }
      return b; } },

  { id: 's12-wrk', season: 'S12', tier: 'S', stat: 'INT', author: 'Nirtas / r/undecember_global', source: 'https://www.reddit.com/r/undecember_global/comments/175c12s/most_effectivecapable_minion_build/', stages: ['start', 'end'],
    name: { pt: 'Wrathful Rune Knight (Invocador)', en: 'Wrathful Rune Knight (Summoner)' },
    desc: { pt: 'Lacaios são tier S em S12. Cavaleiro Rúnico Furioso com dano/HP/velocidade de lacaio, Abissais Lanceiros para fusão e Hazy Melody (High Tone) como amplificação permanente.', en: 'Minions are S tier in S12. Wrathful Rune Knight with minion damage/HP/speed, Javelin Abysslings to fuse, and Hazy Melody (High Tone) as a permanent amplification.' },
    priority: ['SummonWrathfulRuneKnight', 'MinionDMG', 'HazyMelodyLowToneHighTone', 'MinionHP', 'SummonJavelinAbyssling', 'MinionPresence'],
    notes: { pt: 'Fonte: tier list S12 (Nirtas) + guia da comunidade no Reddit. Escala com afixos de autoridade "Skill Rune Effect". Na campanha use Abissais de veneno até sintetizar o Wrathful/Javelin. Segundo cavaleiro (Lightning Rune Knight) via zodíaco no nível 77. Slots: 5🔵 1🔴 no cavaleiro.', en: 'Source: S12 tier list (Nirtas) + community Reddit guide. Scales with "Skill Rune Effect" authority affixes. During the campaign use poison Abysslings until you synthesise Wrathful/Javelin. Second knight (Lightning Rune Knight) via zodiac at level 77. Slots: 5🔵 1🔴 on the knight.' },
    make: (stage) => { const b = base('Wrathful Rune Knight (S12)', 'INT', 'Community', [95, 80, 100, 340]);
      place(b.board, [0, 0], 'SummonWrathfulRuneKnight', [['MinionDMG', 'B'], ['MinionHP', 'B'], ['MinionSpeed', 'B'], ['MinionPresence', 'B'], ['AbsorbMinionHP', 'R'], ['MinionArmor', 'B']]);
      place(b.board, C.SE, 'SummonJavelinAbyssling', [['MinionDMG', 'B'], ['MinionHP', 'B'], ['MinionSpeed', 'B']]);
      place(b.board, C.NE, 'HazyMelodyLowToneHighTone', []); place(b.board, C.E, 'MistTotem', []);
      place(b.board, C.SW, 'GatherMinions', []); place(b.board, C.W, 'Teleport', []); place(b.board, C.NW, 'SealOfElementResist', []);
      endgame(b, '0,0', 'Verity'); b.board[key(...C.SE)].grade = 3;
      b.equipment = { Helmet: { unique: 'SpicasRegret' }, Armor: { unique: 'AquillasEternity' }, Gloves: { unique: 'AquillasClaw' } };
      if (stage === 'start') { starter(b, 50); b.board['0,0'].rune = 'SummonPoisonArrowAbyssling'; b.board[key(...C.SE)].rune = 'SummonAbyssling'; }
      return b; } },

  { id: 's12-esentry', season: 'S12', tier: 'S', stat: 'DEX', author: 'Nirtas', source: 'https://www.youtube.com/watch?v=_iT378uI6OA', stages: ['end'],
    name: { pt: 'Electric Sentry (Sentinelas)', en: 'Electric Sentry (Sentries)' },
    desc: { pt: 'Sentinelas são tier S em S12: Electric Sentry agora dispara 6 projéteis. Multi/Precise/Sturdy Sentry, Quick Installation e Quick Attack; Sentry Expert como buff.', en: 'Sentries are S tier in S12: Electric Sentry now fires 6 projectiles. Multi/Precise/Sturdy Sentry, Quick Installation and Quick Attack; Sentry Expert as buff.' },
    priority: ['ElectricSentry', 'MultiSentry', 'PreciseSentry', 'SentryExpert', 'QuickSentryInstallation'],
    notes: { pt: 'Fonte: Nirtas – Build Tier List S12. Sentinelas escalam com o afixo de autoridade "Skill Rune Effect"; Electric Sentry também aplica Shock em chefes. Slots: 6🟢.', en: 'Source: Nirtas – Build Tier List S12. Sentries scale with the "Skill Rune Effect" authority affix; Electric Sentry also applies Shock on bosses. Slots: 6🟢.' },
    make: () => { const b = base('Electric Sentry (S12)', 'DEX', 'Nirtas', [95, 100, 320, 100]);
      place(b.board, [0, 0], 'ElectricSentry', [['MultiSentry', 'G'], ['PreciseSentry', 'G'], ['SturdySentry', 'G'], ['QuickSentryInstallation', 'G'], ['LifeImbuedSentry', 'G'], ['QuickAttack', 'G']]);
      place(b.board, C.NE, 'SentryExpert', []); place(b.board, C.E, 'BulwarkOfProtection', [['IncreaseDuration', 'G'], ['TimeAcceleration', 'B']]);
      place(b.board, C.SW, 'TrickShot', [['Disarm', 'R']]); place(b.board, C.NW, 'SealOfCriticalChance', []);
      endgame(b, '0,0', 'Source'); return b; } },

  // ------------------------------------------------------------------ S11 The Forge (May 2026)
  { id: 's11-la', season: 'S11', tier: 'S', stat: 'DEX', author: 'Nirtas', source: 'https://www.youtube.com/watch?v=nfUnfJyJOJg', stages: ['start', 'end'],
    name: { pt: 'Lightning Arrow 2.4T DPS', en: 'Lightning Arrow 2.4T DPS' },
    desc: { pt: 'Setup exato do guia: Lightning Arrow (Lendária, Origin) com Shadow Archer (Verity), Mana Storm, Chain, Convert Physical Damage, Opportunistic Strike (Origin) e Extract Earth Energy. Illusion Arrow (Verity) + Center of Gravity; Lower Armor para single target.', en: 'Exact guide setup: Lightning Arrow (Legendary, Origin) with Shadow Archer (Verity), Mana Storm, Chain, Convert Physical Damage, Opportunistic Strike (Origin) and Extract Earth Energy. Illusion Arrow (Verity) + Center of Gravity; Lower Armor for single target.' },
    priority: ['LightningArrow', 'ShadowArcher', 'ExtractEarthEnergy', 'ConvertPhysicalDamage', 'OpportunisticStrike', 'ManaStorm', 'Chain'],
    notes: { pt: 'Fonte: Nirtas – Lightning Arrow Build Guide 2.4T+ DPS | S11 Forge. Crítico + maximização; 500 STR / 500 DEX para Power of Harmony/Power of Servants. Lightning Arrow Origin precisa de ≥5% DMG dampening. Stage inicial: Multishot e Additional Physical DMG no lugar de Chain/Opportunistic Strike. Slots: 2🔴 2🟢 2🔵.', en: 'Source: Nirtas – Lightning Arrow Build Guide 2.4T+ DPS | S11 Forge. Crit + maximisation; 500 STR / 500 DEX for Power of Harmony/Power of Servants. Lightning Arrow Origin needs ≥5% DMG dampening. Starter stage: Multishot and Additional Physical DMG instead of Chain/Opportunistic Strike. Slots: 2🔴 2🟢 2🔵.' },
    make: (stage) => { const b = base('Lightning Arrow (S11)', 'DEX', 'Nirtas', [100, 500, 500, 100]);
      place(b.board, [0, 0], 'LightningArrow', [['ShadowArcher', 'G'], ['ManaStorm', 'B'], ['Chain', 'B'], ['ConvertPhysicalDamage', 'R'], ['OpportunisticStrike', 'G'], ['ExtractEarthEnergy', 'R']]);
      bowUtility(b); place(b.board, C.SE, 'IllusionArrow', [['CenterOfGravity', 'R'], ['LowerArmor', 'R']]);
      endgame(b, '0,0', 'Origin'); b.board['1,0'].awaken = 'Verity'; b.board['1,0'].grade = 3; b.board['-1,1'].awaken = 'Origin'; b.board[key(...C.SE)].grade = 3; b.board[key(...C.SE)].awaken = 'Verity';
      b.equipment = { Armor: { unique: 'TranscendentAquillasEternity' }, Gloves: { unique: 'AquillasClaw' }, Ring1: { unique: 'CasthorsRefraction' }, Belt: { unique: 'OvertureOfGrace' } };
      if (stage === 'start') { starter(b, 60); b.board['0,-1'].rune = 'Multishot'; b.board['-1,1'].rune = 'AdditionalPhysicalDMG'; b.board['0,0'].slots![2] = 'G'; b.board['0,0'].slots![4] = 'R'; }
      return b; } },

  { id: 's11-pa', season: 'S11', tier: 'A', stat: 'DEX', author: 'Nirtas', source: 'https://www.youtube.com/watch?v=tl4oX7XNjUA', stages: ['start', 'end'],
    name: { pt: 'Piercing Arrow (starter de campanha)', en: 'Piercing Arrow (campaign starter)' },
    desc: { pt: 'Starter do Nirtas para S11: Piercing Arrow com Shadow Archer, Multishot, Extract Earth Energy, Additional Physical DMG, Confidence e Find Weakness. 6-link já no Ato 2 com Rune Birth Essence.', en: 'Nirtas\' S11 starter: Piercing Arrow with Shadow Archer, Multishot, Extract Earth Energy, Additional Physical DMG, Confidence and Find Weakness. 6-link already in Act 2 with Rune Birth Essence.' },
    priority: ['PiercingArrow', 'ShadowArcher', 'ExtractEarthEnergy', 'AdditionalPhysicalDMG', 'Multishot', 'FindWeakness', 'Confidence'],
    notes: { pt: 'Fonte: Nirtas – Piercing Arrow Starter Guide | S11 Forge. Compre arcos no Mysterious Gear a cada 2–3 atos (só importa Attack DMG); Gale Claw + Overlapping Shadows para velocidade na campanha. Slots: 3🔴 3🟢.', en: 'Source: Nirtas – Piercing Arrow Starter Guide | S11 Forge. Buy bows from Mysterious Gear every 2–3 acts (only Attack DMG matters); Gale Claw + Overlapping Shadows for campaign speed. Slots: 3🔴 3🟢.' },
    make: (stage) => { const b = base('Piercing Arrow Starter (S11)', 'DEX', 'Nirtas', [80, 100, 300, 60]);
      place(b.board, [0, 0], 'PiercingArrow', [['ShadowArcher', 'G'], ['Multishot', 'G'], ['ExtractEarthEnergy', 'R'], ['AdditionalPhysicalDMG', 'R'], ['Confidence', 'R'], ['FindWeakness', 'G']]);
      bowUtility(b, 'SealOfCriticalChance', 'Roll');
      endgame(b, '0,0', 'Source'); b.equipment = { Shoes: { unique: 'GaleClaw' }, Pauldrons: { unique: 'OverlappingShadow' } };
      if (stage === 'start') { starter(b, 30); b.equipment = { Shoes: { unique: 'GaleClaw' }, Pauldrons: { unique: 'OverlappingShadow' } }; }
      return b; } },

  // ------------------------------------------------------------------ S10 New Age (Jan 2026)
  { id: 's10-fbs', season: 'S10', tier: 'S', stat: 'DEX', author: 'Nirtas', source: 'https://www.youtube.com/watch?v=Y0qJoZ4_Sm4', stages: ['end'],
    name: { pt: 'Fan Blade Sentry', en: 'Fan Blade Sentry' },
    desc: { pt: 'Sentinela que se manteve tier S em todas as listas do Nirtas (S9→S12). Multi/Precise/Sturdy Sentry, Quick Installation, Life Imbued e Quick Attack; Sentry Expert como buff; Electric Sentry secundária para Shock.', en: 'Sentry that stayed S tier across all Nirtas lists (S9→S12). Multi/Precise/Sturdy Sentry, Quick Installation, Life Imbued and Quick Attack; Sentry Expert as buff; secondary Electric Sentry for Shock.' },
    priority: ['FanBladeSentry', 'MultiSentry', 'PreciseSentry', 'SentryExpert', 'QuickSentryInstallation', 'ElectricSentry'],
    notes: { pt: 'Fonte: Nirtas – Build Tier List S10 New Age. Slots: 6🟢.', en: 'Source: Nirtas – Build Tier List S10 New Age. Slots: 6🟢.' },
    make: () => { const b = base('Fan Blade Sentry (S10)', 'DEX', 'Nirtas', [95, 100, 320, 100]);
      place(b.board, [0, 0], 'FanBladeSentry', [['MultiSentry', 'G'], ['PreciseSentry', 'G'], ['SturdySentry', 'G'], ['QuickSentryInstallation', 'G'], ['LifeImbuedSentry', 'G'], ['QuickAttack', 'G']]);
      place(b.board, C.NE, 'SentryExpert', []); place(b.board, C.E, 'BulwarkOfProtection', [['IncreaseDuration', 'G'], ['TimeAcceleration', 'B']]);
      place(b.board, C.SW, 'TrickShot', [['Disarm', 'R']]); place(b.board, C.NW, 'SealOfCriticalChance', []); place(b.board, C.SE, 'ElectricSentry', [['MultiSentry', 'G']]);
      endgame(b, '0,0', 'Source'); return b; } },

  { id: 's10-dpc', season: 'S10', tier: 'S', stat: 'DEX', author: 'Nirtas', source: 'https://www.youtube.com/watch?v=Y0qJoZ4_Sm4', stages: ['end'],
    name: { pt: 'Deadly Poison Claw (Veneno)', en: 'Deadly Poison Claw (Poison)' },
    desc: { pt: 'Buffada em S10 (dual wield sem luvas, +40% amp nas luvas únicas). Deadly Poison, Additional Poison DMG, Poison Penetration, Extract Poison Energy, Concentrated Area DMG e Melee DMG Amp.', en: 'Buffed in S10 (dual wield without gloves, +40% amp on the unique gloves). Deadly Poison, Additional Poison DMG, Poison Penetration, Extract Poison Energy, Concentrated Area DMG and Melee DMG Amp.' },
    priority: ['DeadlyPoisonClaw', 'DeadlyPoison', 'ExtractPoisonEnergy', 'AdditionalPoisonDMG', 'MeleeDMGAmplification', 'PoisonPenetration'],
    notes: { pt: 'Fonte: Nirtas – Build Tier List S10 New Age. Veneno não sofre com energias negativas: dá para jogar crítico ou maximizado. Runas de link inferidas das tags. Slots: 4🟢 2🔴.', en: 'Source: Nirtas – Build Tier List S10 New Age. Poison is not hurt by negative energies: crit or maximised both work. Link runes inferred from tags. Slots: 4🟢 2🔴.' },
    make: () => { const b = base('Deadly Poison Claw (S10)', 'DEX', 'Nirtas', [95, 150, 320, 80]);
      place(b.board, [0, 0], 'DeadlyPoisonClaw', [['DeadlyPoison', 'G'], ['AdditionalPoisonDMG', 'G'], ['PoisonPenetration', 'G'], ['ExtractPoisonEnergy', 'G'], ['ConcentratedAreaDMG', 'R'], ['MeleeDMGAmplification', 'R']]);
      meleeUtility(b, 'SealOfCriticalChance', 'IllusionStrike');
      endgame(b, '0,0', 'Source'); return b; } },

  // ------------------------------------------------------------------ S9 Abyss Gate (Sep 2025)
  { id: 's9-ica', season: 'S9', tier: 'S', stat: 'DEX', author: 'Nirtas', source: 'https://www.youtube.com/watch?v=oaIPps4qpFo', stages: ['start', 'end'],
    name: { pt: 'Ice Crystal Arrow (físico crítico)', en: 'Ice Crystal Arrow (physical crit)' },
    desc: { pt: 'Guia completo do Nirtas: Ice Crystal Arrow com Shadow Archer, Convert Physical Damage, Split Projectile, Extract Earth Energy, Additional Physical DMG e Confidence. Marksman/Bulwark com Increase Duration + Time Acceleration, Shout of Provocation automático, Illusion Arrow + Lower Armor.', en: 'Full Nirtas guide: Ice Crystal Arrow with Shadow Archer, Convert Physical Damage, Split Projectile, Extract Earth Energy, Additional Physical DMG and Confidence. Marksman/Bulwark with Increase Duration + Time Acceleration, auto Shout of Provocation, Illusion Arrow + Lower Armor.' },
    priority: ['IceCrystalArrow', 'ShadowArcher', 'ConvertPhysicalDamage', 'ExtractEarthEnergy', 'AdditionalPhysicalDMG', 'SplitProjectile', 'Confidence'],
    notes: { pt: 'Fonte: Nirtas – Ice Crystal Arrow Build Guide | Season Abyss Gate. Físico crítico (troque Split por Quick Attack se faltar velocidade). Zodíaco: Strong Strike, Tyrant of Nature, Physical Distortion, Darkness (HP absorb, convert mana), Falcon (30% amp ao usar movimento). Selo de defesa: Seal of Dodge. Slots: 4🔴 2🟢.', en: 'Source: Nirtas – Ice Crystal Arrow Build Guide | Season Abyss Gate. Physical crit (swap Split for Quick Attack if you lack speed). Zodiac: Strong Strike, Tyrant of Nature, Physical Distortion, Darkness (HP absorb, convert mana), Falcon (30% amp on movement skill). Defence seal: Seal of Dodge. Slots: 4🔴 2🟢.' },
    make: (stage) => { const b = base('Ice Crystal Arrow (S9)', 'DEX', 'Nirtas', [90, 100, 320, 80]);
      place(b.board, [0, 0], 'IceCrystalArrow', [['ShadowArcher', 'G'], ['ConvertPhysicalDamage', 'R'], ['SplitProjectile', 'G'], ['ExtractEarthEnergy', 'R'], ['AdditionalPhysicalDMG', 'R'], ['Confidence', 'R']]);
      bowUtility(b);
      place(b.board, C.SE, 'ShoutOfProvocation', [['LingeringShout', 'R'], ['HushedShout', 'R'], ['BuffActivationWhenHit', 'R']]);
      place(b.board, C.W, 'IllusionArrow', [['LowerArmor', 'R']]);
      endgame(b, '0,0', 'Origin'); b.board['1,0'].grade = 3; b.board['1,0'].awaken = 'Verity';
      b.equipment = { Helmet: { unique: 'SpicasRegret' }, Armor: { unique: 'AquillasEternity' }, Gloves: { unique: 'AquillasClaw' }, Ring1: { unique: 'CasthorsRefraction' }, Ring2: { unique: 'ThreeHoops' } };
      if (stage === 'start') { starter(b, 45); b.board['0,-1'].rune = 'Multishot'; }
      return b; } },

  { id: 's9-fbs', season: 'S9', tier: 'S', stat: 'DEX', author: 'Nirtas', source: 'https://www.youtube.com/watch?v=ssfC7_R2alA', stages: ['end'],
    name: { pt: 'Firebomb Shot (besta, fogo)', en: 'Firebomb Shot (bowgun, fire)' },
    desc: { pt: 'Tier S de progressão fácil em S9 (e buffada em S10 pela redução da penalidade de besta). Element DMG Amp, Fire Penetration, Concentrated Area DMG, Find Weakness, Extract Fire Energy e Harmony.', en: 'Easy-progression S tier in S9 (buffed again in S10 by the bowgun range change). Element DMG Amp, Fire Penetration, Concentrated Area DMG, Find Weakness, Extract Fire Energy and Harmony.' },
    priority: ['FirebombShot', 'ElementDMGAmplification', 'ExtractFireEnergy', 'ConcentratedAreaDMG', 'FirePenetration', 'FindWeakness'],
    notes: { pt: 'Fonte: Nirtas – Build Tier List S9 Abyss Gate. Runas de link inferidas das tags do guia oficial (exemplo Firebomb Shot). Slots: 3🔴 1🟢 2🔵.', en: 'Source: Nirtas – Build Tier List S9 Abyss Gate. Link runes inferred from the official guide\'s Firebomb Shot example. Slots: 3🔴 1🟢 2🔵.' },
    make: () => { const b = base('Firebomb Shot (S9)', 'DEX', 'Nirtas', [90, 100, 320, 80]);
      place(b.board, [0, 0], 'FirebombShot', [['ElementDMGAmplification', 'B'], ['FirePenetration', 'R'], ['ConcentratedAreaDMG', 'R'], ['FindWeakness', 'G'], ['ExtractFireEnergy', 'R'], ['Harmony', 'B']]);
      bowUtility(b, 'SealOfCriticalChance', 'InstantAcceleration');
      endgame(b, '0,0', 'Source'); return b; } },

  { id: 's9-cs', season: 'S9', tier: 'S', stat: 'STR', author: 'Nirtas', source: 'https://www.youtube.com/watch?v=ssfC7_R2alA', stages: ['end'],
    name: { pt: 'Crescent Slash (espada 2 mãos)', en: 'Crescent Slash (2H sword)' },
    desc: { pt: 'Tier S em S9 e A em S12. Extract Earth Energy, Additional Physical DMG, Melee DMG Amp, Concentrated Weapon Range DMG, Find Weakness e Warrior\'s Shadow. Fighter\'s Wrath e Leap Attack.', en: 'S tier in S9 and A in S12. Extract Earth Energy, Additional Physical DMG, Melee DMG Amp, Concentrated Weapon Range DMG, Find Weakness and Warrior\'s Shadow. Fighter\'s Wrath and Leap Attack.' },
    priority: ['CrescentSlash', 'WarriorsShadow', 'ExtractEarthEnergy', 'MeleeDMGAmplification', 'AdditionalPhysicalDMG', 'FindWeakness'],
    notes: { pt: 'Fonte: Nirtas – Build Tier List S9 Abyss Gate. Arco de 180° com bônus de crítico; awakening dá ainda mais crítico. Runas de link inferidas das tags. Slots: 5🔴 1🟢.', en: 'Source: Nirtas – Build Tier List S9 Abyss Gate. 180° arc with crit bonus; awakening adds even more crit. Link runes inferred from tags. Slots: 5🔴 1🟢.' },
    make: () => { const b = base('Crescent Slash (S9)', 'STR', 'Nirtas', [90, 320, 120, 60]);
      place(b.board, [0, 0], 'CrescentSlash', [['ExtractEarthEnergy', 'R'], ['AdditionalPhysicalDMG', 'R'], ['MeleeDMGAmplification', 'R'], ['ConcentratedWeaponRangeDMG', 'R'], ['FindWeakness', 'G'], ['WarriorsShadow', 'R']]);
      meleeUtility(b); endgame(b, '0,0', 'Source'); return b; } },

  // ------------------------------------------------------------------ Generic starters
  { id: 'ww', season: 'GEN', stat: 'STR', stages: ['start'], name: { pt: 'Redemoinho (Whirlwind)', en: 'Whirlwind Spinner' }, desc: { pt: 'Corpo a corpo de canalização: Whirlwind com amplificação melee, roubo de vida e alcance de arma. Fighter\'s Wrath e Selo de Destruição como buffs.', en: 'Channeling melee: Whirlwind with melee amplification, life on hit and weapon range. Fighter\'s Wrath and Seal of Destruction as buffs.' },
    priority: ['Whirlwind', 'MeleeDMGAmplification', 'Hunger', 'AdditionalPhysicalDMG'], notes: { pt: 'Arma de 2 mãos (machado/espada). Rune Master: Attack / Melee.', en: 'Two-handed weapon (axe/sword). Rune Master: Attack / Melee.' },
    make: () => { const b = base('Whirlwind Starter', 'STR', '', [60, 200, 60, 40]);
      place(b.board, [0, 0], 'Whirlwind', [['MeleeDMGAmplification', 'R'], ['AdditionalPhysicalDMG', 'R'], ['Hunger', 'R'], ['Savagery', 'R'], ['QuickAttack', 'G'], ['ChannelingEnhancement', 'B']]);
      place(b.board, C.NE, 'FightersWrath'); place(b.board, C.SW, 'SealOfCondensedDestruction'); place(b.board, C.E, 'Sprint'); return b; } },
  { id: 'fb', season: 'GEN', stat: 'INT', stages: ['start'], name: { pt: 'Bola de Fogo (Fire Ball)', en: 'Fire Ball Mage' }, desc: { pt: 'Magia de projétil em área: Fire Ball com multishot, conjuração rápida, dano de fogo adicional e penetração. Release Element como buff.', en: 'AoE projectile spell: Fire Ball with multishot, quick cast, extra fire damage and penetration. Release Element as buff.' },
    priority: ['FireBall', 'QuickCast', 'ElementDMGAmplification', 'Multishot'], notes: { pt: 'Cajado ou varinha+cetro. Rune Master: Spell / Fire.', en: 'Staff or wand+sceptre. Rune Master: Spell / Fire.' },
    make: () => { const b = base('Fire Ball Starter', 'INT', '', [60, 40, 60, 200]);
      place(b.board, [0, 0], 'FireBall', [['QuickCast', 'B'], ['Multishot', 'G'], ['ElementDMGAmplification', 'B'], ['AdditionalFireDMG', 'R'], ['FirePenetration', 'R'], ['Ignite', 'R']]);
      place(b.board, C.NE, 'ReleaseElement'); place(b.board, C.SW, 'SealOfCondensedElements'); place(b.board, C.E, 'Teleport'); return b; } },
  { id: 'bow', season: 'GEN', stat: 'DEX', stages: ['start'], name: { pt: 'Arqueiro (Spread Shot)', en: 'Spread Shot Archer' }, desc: { pt: 'Ataque com arco em leque: Spread Shot com perfuração, abate, crítico e precisão. Marksman e Vital Strike como buffs.', en: 'Fan bow attack: Spread Shot with piercing, slaughter, crit and precision. Marksman and Vital Strike as buffs.' },
    priority: ['SpreadShot', 'FindWeakness', 'Piercing', 'Slaughter'], notes: { pt: 'Arco + aljava. Rune Master: Attack / Projectile.', en: 'Bow + quiver. Rune Master: Attack / Projectile.' },
    make: () => { const b = base('Spread Shot Starter', 'DEX', '', [60, 60, 200, 40]);
      place(b.board, [0, 0], 'SpreadShot', [['Piercing', 'G'], ['Slaughter', 'G'], ['FindWeakness', 'G'], ['Precision', 'G'], ['QuickAttack', 'G'], ['ProjectileAcceleration', 'G']]);
      place(b.board, C.NE, 'Marksman'); place(b.board, C.SW, 'VitalStrike'); place(b.board, C.E, 'Roll'); return b; } },
  { id: 'summ', season: 'GEN', stat: 'INT', stages: ['start'], name: { pt: 'Invocador (Abissais)', en: 'Abyssling Summoner' }, desc: { pt: 'Lacaios: Abissais corpo a corpo e lanceiros com dano, HP, armadura e velocidade de lacaio. Gather Minions para reposicionar.', en: 'Minions: melee and javelin Abysslings with minion damage, HP, armour and speed. Gather Minions to reposition.' },
    priority: ['SummonAbyssling', 'MinionDMG', 'MinionHP'], notes: { pt: 'Cajado com afixos de lacaio. Rune Master: Minion.', en: 'Staff with minion affixes. Rune Master: Minion.' },
    make: () => { const b = base('Summoner Starter', 'INT', '', [60, 40, 40, 220]);
      place(b.board, [0, 0], 'SummonAbyssling', [['MinionDMG', 'B'], ['MinionHP', 'B'], ['MinionArmor', 'B'], ['MinionSpeed', 'B']]);
      place(b.board, C.SE, 'SummonJavelinAbyssling', [['MinionDMG', 'B'], ['MinionHP', 'B']]); place(b.board, C.NE, 'GatherMinions'); place(b.board, C.E, 'Teleport'); return b; } },
];

export const presetsBySeason = () => SEASONS.map(s => ({ season: s, presets: PRESETS.filter(p => p.season === s.id) })).filter(g => g.presets.length);
/** Slot colour requirement summary of the main skill, e.g. {R:4,G:2}. */
export function slotSummary(b: Build): Record<RuneColor, number> {
  const out: Record<RuneColor, number> = { R: 0, G: 0, B: 0 }; let best: Cell | undefined; let n = -1;
  for (const c of Object.values(b.board)) { const k = (c.slots ?? []).filter(Boolean).length; if (c.rune && k > n) { n = k; best = c; } }
  for (const s of best?.slots ?? []) if (s && s !== 'W') out[s]++; return out;
}
