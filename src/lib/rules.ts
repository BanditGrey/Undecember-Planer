import { runeBySlug } from '../data';
import type { Build, Rune } from '../types';

// ---- Hexagonal Rune Cast board (axial coordinates, pointy-top), radius 3 → 37 cells like the in-game board.
export const RADIUS = 3;
export const key = (q: number, r: number) => `${q},${r}`;
export const parse = (k: string) => k.split(',').map(Number) as [number, number];
export const cells: string[] = [];
for (let q = -RADIUS; q <= RADIUS; q++) for (let r = Math.max(-RADIUS, -q - RADIUS); r <= Math.min(RADIUS, -q + RADIUS); r++) cells.push(key(q, r));
export const CENTER = key(0, 0);
const DIRS: [number, number][] = [[1, 0], [1, -1], [0, -1], [-1, 0], [-1, 1], [0, 1]];
export const neighbors = (k: string) => { const [q, r] = parse(k); return DIRS.map(([dq, dr]) => key(q + dq, r + dr)).filter(n => { const [a, b] = parse(n); return Math.max(Math.abs(a), Math.abs(b), Math.abs(-a - b)) <= RADIUS; }); };
/** Pixel position (unit hex size = 1) for CSS layout. */
export const hexPos = (k: string) => { const [q, r] = parse(k); return { x: Math.sqrt(3) * (q + r / 2), y: 1.5 * r }; };

// Tags that describe the skill's nature; link runes with these tags need the skill to share at least one.
const GENERIC = new Set(['Duration', 'Area of Effect']);

export interface LinkCheck { ok: boolean; shared: string[]; reason: string }
export function checkLink(link: Rune, skill: Rune): LinkCheck {
  // Exact rules from the database take precedence when available.
  for (const rule of link.linkRules) {
    const m = rule.match(/Cannot be linked with Skills that satisfy (.+?)\.?$/i);
    if (m && m[1].split(/,| or /).some(t => skill.tags.includes(t.trim()))) return { ok: false, shared: [], reason: rule };
    const c = rule.match(/Can be linked with Skills that satisfy (?:any one of )?(.+?)\.?$/i);
    if (c) { const need = c[1].split(/,| or /).map(t => t.trim()); const shared = need.filter(t => skill.tags.includes(t));
      const ok = (/any one of/i.test(rule) || need.length === 1) ? shared.length > 0 : shared.length === need.length; return { ok, shared, reason: rule }; }
  }
  const lt = link.tags.filter(t => !GENERIC.has(t));
  if (lt.length === 0) return { ok: true, shared: [], reason: 'Link rune sem tags restritivas — aplica-se a qualquer skill.' };
  const shared = lt.filter(t => skill.tags.includes(t));
  if (shared.length) return { ok: true, shared, reason: `Compatível via ${shared.join(', ')}` };
  return { ok: false, shared, reason: `Skill não possui nenhuma das tags: ${lt.join(', ')}` };
}

export interface SkillGroup { cell: string; skill: Rune; links: { cell: string; rune: Rune; check: LinkCheck }[]; runestone?: string }
export function analyzeBoard(b: Build): { groups: SkillGroup[]; orphans: { cell: string; rune: Rune }[] } {
  const groups: SkillGroup[] = []; const orphans: { cell: string; rune: Rune }[] = []; const linked = new Set<string>();
  for (const [cell, c] of Object.entries(b.board)) {
    const rune = c.rune && runeBySlug.get(c.rune); if (!rune || rune.type !== 'Skill') continue;
    const g: SkillGroup = { cell, skill: rune, links: [], runestone: c.runestone };
    for (const n of neighbors(cell)) { const lr = b.board[n]?.rune && runeBySlug.get(b.board[n].rune!); if (lr && lr.type === 'Link') { g.links.push({ cell: n, rune: lr, check: checkLink(lr, rune) }); linked.add(n); } }
    groups.push(g);
  }
  for (const [cell, c] of Object.entries(b.board)) { const r = c.rune && runeBySlug.get(c.rune); if (r && r.type === 'Link' && !linked.has(cell)) orphans.push({ cell, rune: r }); }
  return { groups, orphans };
}

// ---- Element / tag colouring like the in-game rune frames.
export const ELEMENT_COLORS: Record<string, string> = { Fire: '#e2562f', Cold: '#3fa7e6', Lightning: '#e6c93f', Poison: '#7bcf3a', Physical: '#c9c9c9', Spell: '#4a6fe2', Attack: '#e08a2f', Minion: '#a066e2', Projectile: '#2fbf9b', Movement: '#e6e6ee', Defense: '#8fb0c0' };
export const runeColor = (r: Rune) => { for (const t of ['Fire', 'Cold', 'Lightning', 'Poison', 'Physical', 'Minion', 'Spell', 'Attack', 'Projectile']) if (r.tags.includes(t)) return ELEMENT_COLORS[t]; return '#8a8fa3'; };
