import { describe, it, expect } from 'vitest';
import { classify, classifyExtra, estimateAll } from '../src/lib/dps';
import { PRESETS, makePreset } from '../src/lib/presets';

describe('modifier classification', () => {
  it('increase / amplification / dampening / multiplier', () => {
    expect(classify('+45% Fire DMG', 's', { tags: ['Fire'] })?.kind).toBe('inc');
    expect(classify('12% DMG Amplification', 's')?.kind).toBe('amp');
    expect(classify('10% DMG Dampening', 's')?.kind).toBe('less');
    expect(classify('+30% Strike DMG Multiplier', 's', { tags: ['Strike'] })?.kind).toBe('more');
  });
  it('ignores tag-mismatched and conditional lines', () => {
    expect(classify('+45% Fire DMG', 's', { tags: ['Cold'] })).toBeNull();
    expect(classify('+150% DMG against Burning enemies', 's', { tags: ['Fire'] })).toBeNull();
  });
  it('extras: crit, speed, penetration', () => {
    expect(classifyExtra('+50% Critical Rate', 's', false)?.kind).toBe('crit');
    expect(classifyExtra('+25% Critical DMG', 's', false)?.kind).toBe('critDmg');
    expect(classifyExtra('+10% Attack Speed', 's', false)?.kind).toBe('speed');
    expect(classifyExtra('+10% Cast Speed', 's', false)).toBeNull();
    expect(classifyExtra('+15% Fire Penetration', 's', true)?.kind).toBe('pen');
  });
});

describe('estimate layers', () => {
  const base = () => makePreset(PRESETS[0], 'end', 'pt');
  const dmg = (b: ReturnType<typeof base>, extra = {}) => estimateAll(b, { weaponAvg: 300, charIncPct: 0, ...extra })[0];
  it('gear affixes, charms and lacrima (scaled) raise damage', () => {
    const b = base(); const d0 = dmg(b).damage;
    b.equipment.Gloves = { affixes: ['+40% Physical DMG'] }; b.extras = { charms: [{ name: 'c', lines: ['+30% DMG'] }], relics: [], jewels: [], lacrima: [{ type: 'Ring', grade: 'Rare', absorb: 50, lines: ['20% DMG Amplification'] }] };
    const r = dmg(b); expect(r.damage).toBeGreaterThan(d0);
    expect(r.mods.find(m => m.source.startsWith('Lacrima'))?.value).toBe(10);
  });
  it('zodiac weapon-conditional nodes need the matching weapon', () => {
    const b = base(); b.zodiac = ['Tipan.0', 'Tipan.1', 'Tipan.2']; b.equipment = {};
    expect(dmg(b).mods.some(m => /2-handed/.test(m.line))).toBe(false);
    b.equipment = { Weapons: { unique: base().equipment.Weapons?.unique ?? 'DarkMoon' } };
  });
  it('crit and target mitigation change DPS but not damage per hit', () => {
    const b = base(); const a = dmg(b, { critChancePct: 0, targetArmorPct: 0 }); const c = dmg(b, { critChancePct: 50, critDmgPct: 200, targetArmorPct: 30 });
    expect(a.damage).toBe(c.damage); expect(c.avgHit).not.toBe(a.avgHit); expect(c.critChance).toBeGreaterThanOrEqual(50);
  });
});
