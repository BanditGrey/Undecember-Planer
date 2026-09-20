import { runeBySlug } from '../data';
import { BOARD_SIZE, type Build, type Rune } from '../types';

// Tags that describe the skill's nature; link runes with these tags need the skill to share at least one.
const GENERIC = new Set(['Duration', 'Area of Effect']);

export const key = (r: number, c: number) => `${r},${c}`;
export const neighbors = (k: string) => {
  const [r, c] = k.split(',').map(Number); const out: string[] = [];
  for (const [dr, dc] of [[-1, 0], [1, 0], [0, -1], [0, 1]] as const) { const nr = r + dr, nc = c + dc; if (nr >= 0 && nc >= 0 && nr < BOARD_SIZE && nc < BOARD_SIZE) out.push(key(nr, nc)); }
  return out;
};

export interface LinkCheck { ok: boolean; shared: string[]; reason: string }
/** Heuristic compatibility: a link rune applies to a skill when they share a non-generic tag
 *  (the site's exact "Can be linked with Skills that satisfy…" text is not in the dataset yet). */
export function checkLink(link: Rune, skill: Rune): LinkCheck {
  const lt = link.tags.filter(t => !GENERIC.has(t));
  if (lt.length === 0) return { ok: true, shared: [], reason: 'Link rune sem tags restritivas — aplica-se a qualquer skill.' };
  const shared = lt.filter(t => skill.tags.includes(t));
  if (shared.length) return { ok: true, shared, reason: `Compatível via ${shared.join(', ')}` };
  return { ok: false, shared, reason: `Skill não possui nenhuma das tags: ${lt.join(', ')}` };
}

export interface SkillGroup { cell: string; skill: Rune; links: { cell: string; rune: Rune; check: LinkCheck }[]; runestone?: string }
export function analyzeBoard(b: Build): { groups: SkillGroup[]; orphans: { cell: string; rune: Rune }[] } {
  const groups: SkillGroup[] = []; const orphans: { cell: string; rune: Rune }[] = [];
  const linked = new Set<string>();
  for (const [cell, c] of Object.entries(b.board)) {
    const rune = c.rune && runeBySlug.get(c.rune); if (!rune || rune.type !== 'Skill') continue;
    const g: SkillGroup = { cell, skill: rune, links: [], runestone: c.runestone };
    for (const n of neighbors(cell)) {
      const lr = b.board[n]?.rune && runeBySlug.get(b.board[n].rune!);
      if (lr && lr.type === 'Link') { g.links.push({ cell: n, rune: lr, check: checkLink(lr, rune) }); linked.add(n); }
    }
    groups.push(g);
  }
  for (const [cell, c] of Object.entries(b.board)) { const r = c.rune && runeBySlug.get(c.rune); if (r && r.type === 'Link' && !linked.has(cell)) orphans.push({ cell, rune: r }); }
  return { groups, orphans };
}
