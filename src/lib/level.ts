// Rune level model.
// Sources: official guide (Rune Enchants) — max growth level 45 (raised from 30 → 35 → 45 over patches);
// each 5 successful Rune Candor Essence enchants raise the cap by 1, up to 5 times (→ Lv 50);
// equipment / link runes (e.g. Improved Technique) add "+X Skill Rune Level" on top, shown in-game as "Lv 45 (+3)".
export const BASE_MAX_LEVEL = 45;
export const CANDOR_MAX_BONUS = 5;
export const MAX_LEVEL = BASE_MAX_LEVEL + CANDOR_MAX_BONUS;

const NUM = /[+-]?\d+(?:\.\d+)?/g;
/** Interpolates every number that differs between the Lv1 and Lv45 versions of a stat line.
 *  The database only stores Lv1 & Lv45 (as the source site does), so intermediate/extra levels are linear estimates. */
export function statsAtLevel(l1: string[], l45: string[], level: number): { lines: string[]; estimated: boolean } {
  if (level === 1) return { lines: l1, estimated: false };
  if (level === BASE_MAX_LEVEL || l1.length !== l45.length) return { lines: l45, estimated: level !== BASE_MAX_LEVEL };
  const t = (level - 1) / (BASE_MAX_LEVEL - 1);
  const lines = l45.map((line45, i) => {
    const a = (l1[i] ?? '').match(NUM) ?? []; const b = line45.match(NUM) ?? [];
    if (a.length !== b.length) return line45;
    let k = 0;
    return line45.replace(NUM, (m) => { const x = parseFloat(a[k]), y = parseFloat(b[k]); k++; if (x === y) return m;
      const v = x + (y - x) * t; const dec = Math.max((a[k - 1].split('.')[1] || '').length, (b[k - 1].split('.')[1] || '').length, 1);
      const s = v.toFixed(dec).replace(/\.?0+$/, ''); return m.startsWith('+') && v >= 0 ? '+' + s : s; });
  });
  return { lines, estimated: true };
}
