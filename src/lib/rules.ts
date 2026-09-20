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

export interface LinkCheck { ok: boolean; shared: string[]; reason: string; key?: 'linkNoTags' | 'linkVia' | 'linkMissing'; tags?: string }
export function checkLink(link: Rune, skill: Rune): LinkCheck {
  // Exact rules from the database take precedence when available.
  const split = (x: string) => x.replace(/\s*\((must include all|any one)\)\s*/i, '').split(/,| or /).map(t => t.trim()).filter(Boolean);
  let verdict: LinkCheck | null = null;
  for (const rule of link.linkRules) {
    const m = rule.match(/Cannot be linked with Skills that satisfy (.+?)\.?$/i) || rule.match(/cannot be linked if any of the (.+?) tags exist/i) || rule.match(/Cannot be linked with (.+?) Skills$/i);
    if (m && split(m[1]).map(t => t === 'Channeling' ? 'Channel' : t).some(t => skill.tags.includes(t))) return { ok: false, shared: [], reason: rule };
    const c = rule.match(/Can be linked with Skills that satisfy (?:any one of )?(.+?)\.?$/i);
    if (c) { const need = split(c[1]); const shared = need.filter(t => skill.tags.includes(t));
      const all = /must include all/i.test(rule) || (!/any one/i.test(rule) && need.length > 1 && !/,/.test(c[1]));
      const ok = all ? shared.length === need.length : shared.length > 0;
      if (!ok) return { ok: false, shared, reason: rule }; verdict = { ok: true, shared, reason: rule }; }
  }
  if (verdict) return verdict;
  const lt = link.tags.filter(t => !GENERIC.has(t));
  if (lt.length === 0) return { ok: true, shared: [], reason: '', key: 'linkNoTags' };
  const shared = lt.filter(t => skill.tags.includes(t));
  if (shared.length) return { ok: true, shared, reason: '', key: 'linkVia', tags: shared.join(', ') };
  return { ok: false, shared, reason: '', key: 'linkMissing', tags: lt.join(', ') };
}

export interface SkillGroup { cell: string; skill: Rune; links: { cell: string; rune: Rune; check: LinkCheck }[]; runestone?: string }
export function analyzeBoard(b: Build): { groups: SkillGroup[]; orphans: { cell: string; rune: Rune }[] } {
  const groups: SkillGroup[] = []; const orphans: { cell: string; rune: Rune }[] = []; const linked = new Set<string>();
  for (const [cell, c] of Object.entries(b.board)) {
    const rune = c.rune && runeBySlug.get(c.rune); if (!rune || rune.type !== 'Skill') continue;
    const g: SkillGroup = { cell, skill: rune, links: [], runestone: c.runestone };
    for (const n of neighbors(cell)) { const lr = b.board[n]?.rune && runeBySlug.get(b.board[n].rune!); if (lr && lr.type === 'Link') { g.links.push({ cell: n, rune: lr, check: checkLink(lr, rune) }); linked.add(n); } }
    // "Only one X can be linked at once" + the game never allows the same link rune twice on a skill
    const seen = new Set<string>(); for (const l of g.links) { if (seen.has(l.rune.slug) && l.check.ok) l.check = { ok: false, shared: [], reason: `Only one ${l.rune.name} can be linked at once` }; seen.add(l.rune.slug); }
    if (g.links.length > 6) g.links = g.links.slice(0, 6);
    groups.push(g);
  }
  for (const [cell, c] of Object.entries(b.board)) { const r = c.rune && runeBySlug.get(c.rune); if (r && r.type === 'Link' && !linked.has(cell)) orphans.push({ cell, rune: r }); }
  return { groups, orphans };
}

// ---- Element / tag colouring like the in-game rune frames.
export const ELEMENT_COLORS: Record<string, string> = { Fire: '#e2562f', Cold: '#3fa7e6', Lightning: '#e6c93f', Poison: '#7bcf3a', Physical: '#c9c9c9', Spell: '#4a6fe2', Attack: '#e08a2f', Minion: '#a066e2', Projectile: '#2fbf9b', Movement: '#e6e6ee', Defense: '#8fb0c0' };
export const runeColor = (r: Rune) => { for (const t of ['Fire', 'Cold', 'Lightning', 'Poison', 'Physical', 'Minion', 'Spell', 'Attack', 'Projectile']) if (r.tags.includes(t)) return ELEMENT_COLORS[t]; return '#8a8fa3'; };
