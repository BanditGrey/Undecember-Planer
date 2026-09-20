import { authority, runemaster, uniques } from '../data';
import type { Build } from '../types';

export interface Issue { level: 'error' | 'warn'; key: 'reqLevel' | 'reqStat' | 'rmLevel' | 'authDup'; vars: Record<string, string | number> }
const STAT: Record<string, 'str' | 'dex' | 'int'> = { Strength: 'str', Dexterity: 'dex', Intelligence: 'int' };

/** Validates the build against character level/stats: unique requirements, rune master unlock levels, duplicate authorities. */
export function checkBuild(b: Build): Issue[] {
  const out: Issue[] = []; const c = b.char;
  for (const [slot, e] of Object.entries(b.equipment)) {
    const u = e?.unique && uniques.find(x => x.slug === e.unique); if (!u || !c) continue;
    for (const r of u.requires) {
      const m = r.match(/^(Level|Strength|Dexterity|Intelligence) (\d+)/); if (!m) continue; const n = +m[2];
      if (m[1] === 'Level') { if (c.level < n) out.push({ level: 'error', key: 'reqLevel', vars: { item: u.name, slot, n } }); }
      else if (c[STAT[m[1]]] < n) out.push({ level: 'error', key: 'reqStat', vars: { item: u.name, slot, stat: m[1], n } });
    }
  }
  if (c) for (const [id, pts] of Object.entries(b.runemaster)) { const n = runemaster.find(x => x.id === id); if (n && pts > 0 && c.level < n.unlockLevel) out.push({ level: 'error', key: 'rmLevel', vars: { node: `${n.category} T${n.tier}`, n: n.unlockLevel } }); }
  const seen = new Map<string, string>();
  for (const [slot, e] of Object.entries(b.equipment)) { const a = e?.authority && authority.find(x => x.slug === e.authority); if (!a) continue; if (seen.has(a.god)) out.push({ level: 'warn', key: 'authDup', vars: { god: a.god, a: seen.get(a.god)!, b: slot } }); else seen.set(a.god, slot); }
  return out;
}
