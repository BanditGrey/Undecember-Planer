import { runeBySlug, nodeById } from '../data';
import { statsAtLevel } from './level';
import { analyzeBoard, type SkillGroup } from './rules';
import type { Build, Rune } from '../types';

export interface DpsInput { weaponAvg: number; charIncPct: number }
export interface Mod { source: string; line: string; kind: 'inc' | 'more' | 'amp' | 'flat' | 'less'; value: number }
export interface DpsResult { skill: Rune; stats: string[]; estimated: boolean; basePct: number; flat: number; manaCost: number | null; cooldown: number | null; mods: Mod[]; incTotal: number; ampTotal: number; moreProduct: number; damage: number; isSpell: boolean }

const num = (s: string) => { const m = s.match(/-?\d+(?:\.\d+)?/); return m ? parseFloat(m[0]) : 0; };
const avgRange = (s: string) => { const m = s.match(/(-?\d+(?:\.\d+)?)\s*-\s*(-?\d+(?:\.\d+)?)/); return m ? (parseFloat(m[1]) + parseFloat(m[2])) / 2 : num(s); };

/** Classifies a stat line the way UNDECEMBER stacks modifiers: "+X% DMG" (increase, additive), "X% DMG Amplification" (multiplicative), "Dampening" (less). */
export function classify(line: string, source: string): Mod | null {
  if (!/DMG|Damage/i.test(line) || /against|when|if|per |Taken|Dampening when|Cooldown|Recovery|Reflect|Minion|Sentry|Totem|Trap DMG/i.test(line) && !/Amplification$/.test(line)) {
    if (!/DMG Amplification$|% DMG$|DMG Dampening$|DMG Multiplier/.test(line)) return null;
  }
  const v = Math.abs(avgRange(line.replace(/\[|\]/g, '')));
  if (/DMG Amplification/i.test(line)) return { source, line, kind: 'amp', value: v };
  if (/DMG Dampening/i.test(line)) return { source, line, kind: 'less', value: v };
  if (/DMG Multiplier/i.test(line)) return { source, line, kind: 'more', value: v };
  if (/^\+\s*\d+(\.\d+)?%.*DMG$/.test(line) || /^\+\s*\[.*\]%.*DMG$/.test(line)) return { source, line, kind: 'inc', value: v };
  if (/^\+\s*\d+(\.\d+)?(-\d+(\.\d+)?)?\s.*DMG$/.test(line) && !/%/.test(line)) return { source, line, kind: 'flat', value: v };
  return null;
}

export function estimate(build: Build, g: SkillGroup, input: DpsInput): DpsResult {
  const level = (build.runeLevel ?? 45) + (build.runeLevelBonus ?? 0);
  const { lines: stats, estimated } = statsAtLevel(g.skill.level1, g.skill.level45, level);
  const isSpell = g.skill.tags.includes('Spell');
  const pctLine = stats.find(l => /DMG \d+(\.\d+)?%$/.test(l) && !/Dampening|Amplification/.test(l));
  const flatLine = stats.find(l => /DMG \+\d/.test(l) || /^\+\d+(-\d+)? [A-Za-z ]*DMG$/.test(l));
  const basePct = pctLine ? num(pctLine.match(/(\d+(?:\.\d+)?)%$/)?.[1] ?? '0') : 100;
  const flat = flatLine ? avgRange(flatLine.replace(/^.*DMG \+/, '').replace(/^\+/, '')) : 0;
  const manaLine = stats.find(l => /Mana Cost/.test(l)); const cdLine = stats.find(l => /^Cooldown/.test(l));
  const mods: Mod[] = [];
  for (const l of g.links) { if (!l.check.ok) continue; const ls = statsAtLevel(l.rune.level1, l.rune.level45, level).lines; for (const line of ls) { const m = classify(line, l.rune.name); if (m) mods.push(m); } }
  for (const [id, pts] of Object.entries(build.runemaster)) { const n = nodeById.get(id); if (!n || !pts) continue; const m = classify(n.effect.replace(/\b0\b/, String(pts)), `Rune Master: ${n.category} T${n.tier}`); if (m) { m.value *= 1; mods.push(m); } }
  const incTotal = mods.filter(m => m.kind === 'inc').reduce((a, m) => a + m.value, 0) + input.charIncPct;
  const ampTotal = mods.filter(m => m.kind === 'amp').reduce((a, m) => a + m.value, 0);
  const moreProduct = mods.filter(m => m.kind === 'more').reduce((a, m) => a * (1 + m.value / 100), 1) * mods.filter(m => m.kind === 'less').reduce((a, m) => a * (1 - m.value / 100), 1);
  const flatLinks = mods.filter(m => m.kind === 'flat').reduce((a, m) => a + m.value, 0);
  const base = isSpell ? flat + flatLinks : (input.weaponAvg * basePct / 100) + flat + flatLinks;
  const damage = base * (1 + incTotal / 100) * (1 + ampTotal / 100) * moreProduct;
  return { skill: g.skill, stats, estimated, basePct, flat, manaCost: manaLine ? num(manaLine) : null, cooldown: cdLine ? num(cdLine) : null, mods, incTotal, ampTotal, moreProduct, damage, isSpell };
}

export function estimateAll(build: Build, input: DpsInput) { return analyzeBoard(build).groups.map(g => estimate(build, g, input)); }
export { runeBySlug };
