import type { Build } from '../types';
import { decodeBuild, encodeBuild } from './share';

/** Optional hosted backend (Supabase, free tier) for short links, a searchable public gallery and votes.
 *  Enabled only when VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY are set at build time; otherwise the app stays
 *  fully static and the GitHub-Issues gallery is used. Schema: see supabase/schema.sql. Uses PostgREST directly
 *  (no SDK) to keep the bundle small. */
const URL = (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.replace(/\/$/, '');
const KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
export const cloudEnabled = !!(URL && KEY);

export interface CloudBuild { id: string; title: string; author: string; stat: string; season: string; skills: string[]; notes: string; code: string; votes: number; created_at: string; build: Build }
const H = () => ({ apikey: KEY!, Authorization: `Bearer ${KEY!}`, 'Content-Type': 'application/json', Prefer: 'return=representation' });
const req = async (path: string, init?: RequestInit) => { const r = await fetch(`${URL}/rest/v1/${path}`, { ...init, headers: { ...H(), ...(init?.headers || {}) } }); if (!r.ok) throw new Error(`cloud ${r.status}: ${await r.text()}`); return r.status === 204 ? null : r.json(); };

const skillsOf = (b: Build) => [...new Set(Object.values(b.board).map(c => c.rune).filter((x): x is string => !!x))];
const shortId = () => Math.random().toString(36).slice(2, 8) + Date.now().toString(36).slice(-2);

export async function publishBuild(b: Build, season = ''): Promise<CloudBuild> {
  const row = { id: shortId(), title: b.name || 'Build', author: b.author || 'anon', stat: b.stat, season, skills: skillsOf(b), notes: (b.notes || '').slice(0, 2000), code: encodeBuild(b) };
  const [r] = await req('builds', { method: 'POST', body: JSON.stringify(row) });
  return { ...r, build: b };
}
export async function fetchCloud(opts: { q?: string; stat?: string; skill?: string; sort?: 'votes' | 'created_at'; limit?: number } = {}): Promise<CloudBuild[]> {
  const p = new URLSearchParams({ select: '*', order: `${opts.sort ?? 'created_at'}.desc`, limit: String(opts.limit ?? 100) });
  if (opts.stat) p.set('stat', `eq.${opts.stat}`); if (opts.skill) p.set('skills', `cs.{${opts.skill}}`);
  if (opts.q) p.set('or', `(title.ilike.*${opts.q}*,author.ilike.*${opts.q}*,notes.ilike.*${opts.q}*)`);
  const rows: any[] = await req(`builds?${p}`);
  return rows.map(r => ({ ...r, build: decodeBuild(r.code) })).filter(r => r.build) as CloudBuild[];
}
export async function fetchCloudBuild(id: string): Promise<Build | null> {
  const rows: any[] = await req(`builds?id=eq.${encodeURIComponent(id)}&select=code`); return rows[0] ? decodeBuild(rows[0].code) : null;
}
/** One vote per browser per build (enforced client-side + a unique (build_id, voter) constraint server-side). */
export async function vote(id: string): Promise<void> {
  const k = 'undecember-planer:voter'; let voter = localStorage.getItem(k); if (!voter) { voter = crypto.randomUUID(); localStorage.setItem(k, voter); }
  await req('rpc/vote_build', { method: 'POST', body: JSON.stringify({ p_build: id, p_voter: voter }) });
}
export const cloudUrl = (id: string) => `${location.origin}${location.pathname}#c=${id}`;
export function cloudIdFromLocation(): string | null { const m = location.hash.match(/^#c=([A-Za-z0-9]+)/); return m ? m[1] : null; }
