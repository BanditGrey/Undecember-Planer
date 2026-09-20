import { zodiac, zodiacSpecs, zodiacNodeById } from '../data';
import type { Build, ZodiacNode, ZodiacSpec } from '../types';

/** Split a specialization's node list (table order from the patch notes) into its constellation branches.
 *  Layout: Moon (entry) → branches of Star→Sun→Star→Cosmos, then short Star→Sun tails. */
export function branches(spec: ZodiacSpec): ZodiacNode[][] {
  const [, ...rest] = spec.nodes; const out: ZodiacNode[][] = []; let cur: ZodiacNode[] = [];
  for (let i = 0; i < rest.length; i++) { const n = rest[i]; cur.push(n);
    const end = n.kind === 'Cosmos' || (n.kind === 'Sun' && cur.length === 2 && rest[i + 2]?.kind !== 'Cosmos') || i === rest.length - 1;
    if (end) { out.push(cur); cur = []; } }
  return out;
}
export const specCap = (spec: ZodiacSpec) => zodiac.maxPoints[String(spec.tier)] ?? 7;
export const moonOf = (spec: ZodiacSpec) => spec.nodes[0];
export const specOf = (nodeId: string) => zodiacNodeById.get(nodeId)?.spec;
export const activeIn = (b: Build, spec: ZodiacSpec) => (b.zodiac ?? []).filter(id => id.startsWith(spec.id + '.')).length;

/** Node that must be active before `node` can be taken (Moon for branch heads, previous node otherwise). */
export function prerequisite(spec: ZodiacSpec, node: ZodiacNode): ZodiacNode | null {
  if (node.id === moonOf(spec).id) return null;
  for (const br of branches(spec)) { const i = br.indexOf(node); if (i === 0) return moonOf(spec); if (i > 0) return br[i - 1]; }
  return moonOf(spec);
}
export function canActivate(b: Build, spec: ZodiacSpec, node: ZodiacNode): { ok: boolean; reason?: 'cap' | 'prereq' } {
  const act = new Set(b.zodiac ?? []); if (act.has(node.id)) return { ok: true };
  if (activeIn(b, spec) >= specCap(spec)) return { ok: false, reason: 'cap' };
  const pre = prerequisite(spec, node); if (pre && !act.has(pre.id)) return { ok: false, reason: 'prereq' };
  return { ok: true };
}
/** Toggle a node; deactivating also removes every node that depended on it. */
export function toggleNode(b: Build, spec: ZodiacSpec, node: ZodiacNode): Build {
  const act = new Set(b.zodiac ?? []);
  if (act.has(node.id)) { let changed = true; act.delete(node.id);
    while (changed) { changed = false; for (const id of [...act]) { const s = specOf(id); const n = s?.nodes.find(x => x.id === id); if (!s || !n) continue; const pre = prerequisite(s, n); if (pre && !act.has(pre.id)) { act.delete(id); changed = true; } } } }
  else { if (!canActivate(b, spec, node).ok) return b; act.add(node.id); }
  return { ...b, zodiac: [...act] };
}
export const totalZodiac = (b: Build) => (b.zodiac ?? []).length;
/** Named ([Bracketed]) effects granted by the active nodes – handy for the summary / DPS notes. */
export function activeEffects(b: Build): { spec: ZodiacSpec; node: ZodiacNode }[] {
  return (b.zodiac ?? []).map(id => zodiacNodeById.get(id)).filter((x): x is NonNullable<typeof x> => !!x).map(x => ({ spec: x.spec, node: x.node }));
}
export { zodiacSpecs };
