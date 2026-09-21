import { describe, it, expect } from 'vitest';
import { PRESETS, makePreset } from '../src/lib/presets';
import { analyzeBoard } from '../src/lib/rules';
import { estimateAll } from '../src/lib/dps';
import { runeBySlug, uniqueBySlug } from '../src/data';

describe('preset builds', () => {
  for (const p of PRESETS) for (const st of p.stages) it(`${p.id} [${st}] is valid`, () => {
    const b = makePreset(p, st, 'pt');
    for (const c of Object.values(b.board)) if (c.rune) expect(runeBySlug.get(c.rune), c.rune).toBeDefined();
    for (const e of Object.values(b.equipment)) if (e?.unique) expect(uniqueBySlug.get(e.unique), e.unique).toBeDefined();
    for (const sl of p.priority ?? []) expect(runeBySlug.get(sl), sl).toBeDefined();
    const a = analyzeBoard(b);
    for (const g of a.groups) for (const l of g.links) expect(l.check.ok, `${g.skill.slug} <- ${l.rune.slug}: ${l.check.key || l.check.reason}`).toBe(true);
    expect(a.orphans.map(o => o.rune.slug)).toEqual([]);
    for (const t of a.triggers) expect(t.ok, `trigger ${t.rune.slug}`).toBe(true);
    const res = estimateAll(b, { weaponAvg: 300, charIncPct: 0 });
    expect(res.length).toBeGreaterThan(0); for (const r of res) expect(Number.isFinite(r.damage)).toBe(true);
  });
});
