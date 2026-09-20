import { emptyBuild, type Build, type Cell } from '../types';

// Starter builds for new players. Hex axial coords: centre 0,0; neighbours (1,0) (1,-1) (0,-1) (-1,0) (-1,1) (0,1).
// Slot colours are set to the link runes' colours so the board validates green; players adjust to their real rune.
const ring = (c: [number, number]) => [[1, 0], [1, -1], [0, -1], [-1, 0], [-1, 1], [0, 1]].map(([dq, dr]) => `${c[0] + dq},${c[1] + dr}`);
function skill(board: Record<string, Cell>, at: [number, number], slug: string, links: [string, 'R' | 'G' | 'B'][], extra: Partial<Cell> = {}) {
  const n = ring(at); const slots: ('R' | 'G' | 'B' | undefined)[] = []; links.forEach(([l, c], i) => { board[n[i]] = { rune: l }; slots[i] = c; });
  board[`${at[0]},${at[1]}`] = { rune: slug, slots, ...extra };
}

export interface Preset { id: string; name: { pt: string; en: string }; desc: { pt: string; en: string }; stat: Build['stat']; make: () => Build }
export const PRESETS: Preset[] = [
  { id: 'ww', stat: 'STR', name: { pt: 'Redemoinho (Whirlwind)', en: 'Whirlwind Spinner' }, desc: { pt: 'Corpo a corpo de canalização: Whirlwind com amplificação melee, roubo de vida e alcance de arma. Fighter\'s Wrath e Selo de Destruição como buffs.', en: 'Channeling melee: Whirlwind with melee amplification, life on hit and weapon range. Fighter\'s Wrath and Seal of Destruction as buffs.' },
    make: () => { const b = emptyBuild(); b.name = 'Whirlwind Starter'; b.stat = 'STR'; b.char = { level: 60, str: 200, dex: 60, int: 40 };
      skill(b.board, [0, 0], 'Whirlwind', [['MeleeDMGAmplification', 'R'], ['AdditionalPhysicalDMG', 'R'], ['Hunger', 'R'], ['Savagery', 'R'], ['QuickAttack', 'G'], ['ChannelingEnhancement', 'B']]);
      skill(b.board, [3, -3], 'FightersWrath', []); skill(b.board, [-3, 3], 'SealOfCondensedDestruction', []); skill(b.board, [3, 0], 'Sprint', []);
      b.notes = 'Prioridade: Whirlwind lv > Melee DMG Amp > Hunger. Arma de 2 mãos (machado/espada). Rune Master: Attack / Melee.'; return b; } },
  { id: 'fb', stat: 'INT', name: { pt: 'Bola de Fogo (Fire Ball)', en: 'Fire Ball Mage' }, desc: { pt: 'Magia de projétil em área: Fire Ball com multishot, conjuração rápida, dano de fogo adicional e penetração. Release Element como buff.', en: 'AoE projectile spell: Fire Ball with multishot, quick cast, extra fire damage and penetration. Release Element as buff.' },
    make: () => { const b = emptyBuild(); b.name = 'Fire Ball Starter'; b.stat = 'INT'; b.char = { level: 60, str: 40, dex: 60, int: 200 };
      skill(b.board, [0, 0], 'FireBall', [['QuickCast', 'B'], ['Multishot', 'G'], ['ElementDMGAmplification', 'B'], ['AdditionalFireDMG', 'R'], ['FirePenetration', 'R'], ['Ignite', 'R']]);
      skill(b.board, [3, -3], 'ReleaseElement', []); skill(b.board, [-3, 3], 'SealOfCondensedElements', []); skill(b.board, [3, 0], 'Teleport', []);
      b.notes = 'Prioridade: Fire Ball lv > Quick Cast > Element DMG Amp. Cajado ou varinha+cetro. Rune Master: Spell / Fire.'; return b; } },
  { id: 'bow', stat: 'DEX', name: { pt: 'Arqueiro (Spread Shot)', en: 'Spread Shot Archer' }, desc: { pt: 'Ataque com arco em leque: Spread Shot com perfuração, abate, crítico e precisão. Marksman e Vital Strike como buffs.', en: 'Fan bow attack: Spread Shot with piercing, slaughter, crit and precision. Marksman and Vital Strike as buffs.' },
    make: () => { const b = emptyBuild(); b.name = 'Spread Shot Starter'; b.stat = 'DEX'; b.char = { level: 60, str: 60, dex: 200, int: 40 };
      skill(b.board, [0, 0], 'SpreadShot', [['Piercing', 'G'], ['Slaughter', 'G'], ['FindWeakness', 'G'], ['Precision', 'G'], ['QuickAttack', 'G'], ['ProjectileAcceleration', 'G']]);
      skill(b.board, [3, -3], 'Marksman', []); skill(b.board, [-3, 3], 'VitalStrike', []); skill(b.board, [3, 0], 'Roll', []);
      b.notes = 'Prioridade: Spread Shot lv > Find Weakness > Piercing. Arco + aljava. Rune Master: Attack / Projectile.'; return b; } },
  { id: 'summ', stat: 'INT', name: { pt: 'Invocador (Abissais)', en: 'Abyssling Summoner' }, desc: { pt: 'Lacaios: Abissais corpo a corpo e lanceiros com dano, HP, armadura e velocidade de lacaio. Gather Minions para reposicionar.', en: 'Minions: melee and javelin Abysslings with minion damage, HP, armour and speed. Gather Minions to reposition.' },
    make: () => { const b = emptyBuild(); b.name = 'Summoner Starter'; b.stat = 'INT'; b.char = { level: 60, str: 40, dex: 40, int: 220 };
      skill(b.board, [0, 0], 'SummonAbyssling', [['MinionDMG', 'B'], ['MinionHP', 'B'], ['MinionArmor', 'B'], ['MinionSpeed', 'B']]);
      skill(b.board, [-2, 3], 'SummonJavelinAbyssling', [['MinionDMG', 'B'], ['MinionHP', 'B']]); skill(b.board, [3, -3], 'GatherMinions', []); skill(b.board, [3, 0], 'Teleport', []);
      b.notes = 'Prioridade: Minion DMG > Minion HP. Cajado com afixos de lacaio. Rune Master: Minion.'; return b; } },
];
