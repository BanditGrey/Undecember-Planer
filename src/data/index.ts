import runesJson from './runes.json';
import runestonesJson from './runestones.json';
import uniquesJson from './uniques.json';
import runemasterJson from './runemaster.json';
import authorityJson from './authority.json';
import tagsJson from './tags.json';
import zodiacJson from './zodiac.json';
import type { Rune, Runestone, Unique, RuneMasterNode, Authority, ZodiacData } from '../types';

export const runes = runesJson as Rune[];
export const runestones = runestonesJson as Runestone[];
export const uniques = uniquesJson as Unique[];
export const runemaster = runemasterJson as RuneMasterNode[];
export const authority = authorityJson as Authority[];
export const tags = tagsJson as string[];
export const zodiac = zodiacJson as ZodiacData;
export const zodiacSpecs = zodiac.routes.flatMap(r => r.specs.map(s => ({ ...s, route: r })));
export const zodiacNodeById = new Map(zodiacSpecs.flatMap(s => s.nodes.map(n => [n.id, { node: n, spec: s }] as const)));

export const runeBySlug = new Map(runes.map(r => [r.slug, r]));
export const runestoneBySlug = new Map(runestones.map(r => [r.slug, r]));
export const uniqueBySlug = new Map(uniques.map(u => [u.slug, u]));
export const nodeById = new Map(runemaster.map(n => [n.id, n]));
export const authorityBySlug = new Map(authority.map(a => [a.slug, a]));
