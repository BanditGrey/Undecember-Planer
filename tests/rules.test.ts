import { describe, it, expect } from 'vitest';
import { checkLink } from '../src/lib/rules';
import { runeBySlug, runes, zodiacSpecs } from '../src/data';
import { emptyBuild } from '../src/types';
import { toggleNode, canActivate, branches, specCap } from '../src/lib/zodiac';

const R = (s: string) => { const r = runeBySlug.get(s); if (!r) throw new Error(s); return r; };
describe('link rules', () => {
  it('Attack/Spell alternative in must-include-all rules (S9 melee links gained Spell)', () => {
    expect(checkLink(R('Tenacity'), R('IllusionHook')).ok).toBe(true); // Spell, Melee, Strike
    expect(checkLink(R('Tenacity'), R('FireBall')).ok).toBe(false); // no Melee
  });
  it('database sanity', () => {
    expect(runes.length).toBeGreaterThanOrEqual(380);
    for (const r of runes) { expect(r.slug).toBeTruthy(); expect(['Skill', 'Link']).toContain(r.type); if (!r.unofficial) expect(r.level1.length, r.slug).toBeGreaterThan(0); }
  });
});
describe('zodiac tree', () => {
  const spec = zodiacSpecs.find(s => s.id === 'Steel')!;
  it('branches cover every non-moon node', () => { for (const s of zodiacSpecs) expect(branches(s).flat().length).toBe(s.nodes.length - 1); });
  it('prerequisites, caps and cascade removal', () => {
    let b = emptyBuild(); const [moon, n1, n2] = spec.nodes;
    expect(canActivate(b, spec, n1).ok).toBe(false); b = toggleNode(b, spec, moon); b = toggleNode(b, spec, n1); b = toggleNode(b, spec, n2);
    expect(b.zodiac).toHaveLength(3); b = toggleNode(b, spec, n1); expect(b.zodiac).toEqual([moon.id]);
    for (const n of spec.nodes) b = toggleNode(b, spec, n); expect(b.zodiac!.length).toBeLessThanOrEqual(specCap(spec));
  });
});
