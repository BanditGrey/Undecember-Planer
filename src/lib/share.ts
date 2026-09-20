import { emptyBuild, type Build } from '../types';

const b64 = (s: string) => btoa(unescape(encodeURIComponent(s))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const unb64 = (s: string) => decodeURIComponent(escape(atob(s.replace(/-/g, '+').replace(/_/g, '/'))));

export function encodeBuild(b: Build): string { return b64(JSON.stringify(b)); }
export function decodeBuild(code: string): Build | null {
  try { const b = JSON.parse(unb64(code)); if (b && b.v === 1) return { ...emptyBuild(), ...b }; } catch { /* ignore */ }
  return null;
}
export function buildFromLocation(): Build | null {
  const m = location.hash.match(/^#b=(.+)$/); return m ? decodeBuild(m[1]) : null;
}
export function shareUrl(b: Build): string { return `${location.origin}${location.pathname}#b=${encodeBuild(b)}`; }

const KEY = 'undecember-planer:builds';
export function savedBuilds(): Build[] { try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch { return []; } }
export function saveBuild(b: Build) { const all = savedBuilds().filter(x => x.name !== b.name); all.unshift(b); localStorage.setItem(KEY, JSON.stringify(all.slice(0, 50))); }
export function deleteBuild(name: string) { localStorage.setItem(KEY, JSON.stringify(savedBuilds().filter(x => x.name !== name))); }
