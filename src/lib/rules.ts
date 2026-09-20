import { runeBySlug } from '../data';
import type { Build, Rune, SlotColor } from '../types';

// ---- Hexagonal Rune Cast board (axial coordinates, pointy-top), radius 3 → 37 cells like the in-game board.
export const RADIUS = 3;
export const key = (q: number, r: number) => `${q},${r}`;
export const parse = (k: string) => k.split(',').map(Number) as [number, number];
export const cells: string[] = [];
for (let q = -RADIUS; q <= RADIUS; q++) for (let r = Math.max(-RADIUS, -q - RADIUS); r <= Math.min(RADIUS, -q + RADIUS); r++) cells.push(key(q, r));
export const CENTER = key(0, 0);
export const DIRS: [number, number][] = [[1, 0], [1, -1], [0, -1], [-1, 0], [-1, 1], [0, 1]];
export const step = (k: string, d: number) => { const [q, r] = parse(k); const [dq, dr] = DIRS[((d % 6) + 6) % 6]; const n = key(q + dq, r + dr); const [a, b] = parse(n); return Math.max(Math.abs(a), Math.abs(b), Math.abs(-a - b)) <= RADIUS ? n : null; };
/** Angle (deg, screen coords) of direction d for pointy-top hexes. */
export const dirAngle = (d: number) => [0, -60, -120, 180, 120, 60][((d % 6) + 6) % 6];
export const neighbors = (k: string) => { const [q, r] = parse(k); return DIRS.map(([dq, dr]) => key(q + dq, r + dr)).filter(n => { const [a, b] = parse(n); return Math.max(Math.abs(a), Math.abs(b), Math.abs(-a - b)) <= RADIUS; }); };
/** Pixel position (unit hex size = 1) for CSS layout. */
export const hexPos = (k: string) => { const [q, r] = parse(k); return { x: Math.sqrt(3) * (q + r / 2), y: 1.5 * r }; };

// Tags that describe the skill's nature; link runes with these tags need the skill to share at least one.
const GENERIC = new Set(['Duration', 'Area of Effect']);

export interface LinkCheck { ok: boolean; shared: string[]; reason: string; key?: 'linkNoTags' | 'linkVia' | 'linkMissing' | 'slotClosed' | 'slotColor'; tags?: string }
export const GRADE_NAMES = ['Normal', 'Magic', 'Rare', 'Legendary'] as const;
export const GRADE_HEX = ['#8a8fa3', '#4a8ef0', '#e6c93f', '#e2562f'];
/** Extra stat lines granted by the rune grade (Magic/Rare/Legendary). */
export const AWAKEN_KEYS = ['Source', 'Origin', 'Verity'] as const;
export const AWAKEN_HEX: Record<string, string> = { Source: '#7bd1e6', Origin: '#c98cf0', Verity: '#f0b35a' };
/** Stat lines from the selected awakening (ranges like [50-80]% are averaged by the DPS module). */
export const awakenLines = (r: Rune, k?: string) => (k ? r.awakening[k] ?? [] : []);
export const gradeLines = (r: Rune, grade?: number) => (grade ? r.gradeBonuses[grade - 1] ?? [] : []);
export const COLOR_HEX: Record<SlotColor, string> = { R: '#e04b4b', G: '#4fc35a', B: '#4a8ef0', W: '#f2f2f2' };
export const COLOR_NAME: Record<SlotColor, string> = { R: 'Red', G: 'Green', B: 'Blue', W: 'White' };
/** Slot colour rule: link rune colour must match the skill's link slot colour (white slot accepts any). Unset slots are not checked. */
export function checkSlot(slot: SlotColor | null | undefined, link: Rune): LinkCheck | null {
  if (slot === undefined) return null;
  if (slot === null) return { ok: false, shared: [], reason: '', key: 'slotClosed' };
  if (slot === 'W' || !link.color || slot === link.color) return null;
  return { ok: false, shared: [], reason: '', key: 'slotColor', tags: `${COLOR_NAME[slot]} ≠ ${COLOR_NAME[link.color]}` };
}
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

// ---- Trigger runes: "Must link an Activation (A, B) Skill and a Target (X) Skill in the arrow's direction."
export interface TriggerSpec { activation: string[]; target: string[] }
export function triggerSpec(r: Rune): TriggerSpec | null {
  if (r.type !== 'Link') return null;
  const d = r.description || '';
  const m = d.match(/Activation \(([^)]+)\) Skill and a Target \(([^)]+)\) Skill/);
  if (m) return { activation: m[1].split(',').map(x => x.trim()).map(x => x === 'Channeling' ? 'Channel' : x), target: m[2].split(',').map(x => x.trim()) };
  const t = d.match(/Must link a Target (.+?) Skill in the arrow/);
  if (t) return { activation: [], target: t[1].split(',').map(x => x.trim()) };
  return null;
}
export interface TriggerGroup { cell: string; rune: Rune; dir: number; spec: TriggerSpec; activation?: { cell: string; rune: Rune; ok: boolean }; target?: { cell: string; rune: Rune; ok: boolean }; ok: boolean }
const matchTags = (r: Rune, tags: string[]) => tags.some(t => r.tags.includes(t) || (t === 'Enhance' && r.tags.some(x => /Enhance/.test(x))));

export interface SkillGroup { cell: string; skill: Rune; links: { cell: string; rune: Rune; check: LinkCheck; dir: number; slot?: SlotColor | null; grade?: number; awaken?: string }[]; runestone?: string; grade?: number; awaken?: string; slots?: (SlotColor | null | undefined)[] }
export function analyzeBoard(b: Build): { groups: SkillGroup[]; orphans: { cell: string; rune: Rune }[]; triggers: TriggerGroup[] } {
  const groups: SkillGroup[] = []; const orphans: { cell: string; rune: Rune }[] = []; const linked = new Set<string>(); const triggers: TriggerGroup[] = [];
  for (const [cell, c] of Object.entries(b.board)) {
    const rune = c.rune && runeBySlug.get(c.rune); const spec = rune && triggerSpec(rune); if (!rune || !spec) continue;
    const dir = c.dir ?? 0; const tg: TriggerGroup = { cell, rune, dir, spec, ok: false }; linked.add(cell);
    const tc = step(cell, dir); const tr = tc && b.board[tc]?.rune && runeBySlug.get(b.board[tc].rune!);
    if (tc && tr && tr.type === 'Skill') tg.target = { cell: tc, rune: tr, ok: matchTags(tr, spec.target) };
    const ac = step(cell, dir + 3); const ar = ac && b.board[ac]?.rune && runeBySlug.get(b.board[ac].rune!);
    if (spec.activation.length && ac && ar && ar.type === 'Skill') tg.activation = { cell: ac, rune: ar, ok: matchTags(ar, spec.activation) };
    tg.ok = !!tg.target?.ok && (spec.activation.length === 0 || !!tg.activation?.ok);
    triggers.push(tg);
  }
  for (const [cell, c] of Object.entries(b.board)) {
    const rune = c.rune && runeBySlug.get(c.rune); if (!rune || rune.type !== 'Skill') continue;
    const g: SkillGroup = { cell, skill: rune, links: [], runestone: c.runestone, slots: c.slots, grade: c.grade, awaken: c.awaken };
    DIRS.forEach((_, d) => { const n = step(cell, d); if (!n) return; const lr = b.board[n]?.rune && runeBySlug.get(b.board[n].rune!); if (lr && lr.type === 'Link' && !triggerSpec(lr)) { const slot = c.slots?.[d]; const tagCheck = checkLink(lr, rune); const check = tagCheck.ok ? (checkSlot(slot, lr) ?? tagCheck) : tagCheck; g.links.push({ cell: n, rune: lr, check, dir: d, slot, grade: b.board[n].grade, awaken: b.board[n].awaken }); linked.add(n); } });
    // "Only one X can be linked at once" + the game never allows the same link rune twice on a skill
    const seen = new Set<string>(); for (const l of g.links) { if (seen.has(l.rune.slug) && l.check.ok) l.check = { ok: false, shared: [], reason: `Only one ${l.rune.name} can be linked at once` }; seen.add(l.rune.slug); }
    if (g.links.length > 6) g.links = g.links.slice(0, 6);
    groups.push(g);
  }
  for (const [cell, c] of Object.entries(b.board)) { const r = c.rune && runeBySlug.get(c.rune); if (r && r.type === 'Link' && !linked.has(cell)) orphans.push({ cell, rune: r }); }
  return { groups, orphans, triggers };
}

// ---- Element / tag colouring like the in-game rune frames.
export const ELEMENT_COLORS: Record<string, string> = { Fire: '#e2562f', Cold: '#3fa7e6', Lightning: '#e6c93f', Poison: '#7bcf3a', Physical: '#c9c9c9', Spell: '#4a6fe2', Attack: '#e08a2f', Minion: '#a066e2', Projectile: '#2fbf9b', Movement: '#e6e6ee', Defense: '#8fb0c0' };
export const runeColor = (r: Rune) => { for (const t of ['Fire', 'Cold', 'Lightning', 'Poison', 'Physical', 'Minion', 'Spell', 'Attack', 'Projectile']) if (r.tags.includes(t)) return ELEMENT_COLORS[t]; return '#8a8fa3'; };
