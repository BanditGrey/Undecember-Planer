import type { Build } from '../types';
import { decodeBuild, encodeBuild } from './share';

/** Public build gallery backed by GitHub Issues (label "build") — no server needed.
 *  Publishing opens a pre-filled "new issue" page; the gallery reads issues via the public REST API. */
export const REPO = 'BanditGrey/Undecember-Planer';
export const LABEL = 'build';
const CODE_RE = /```build\s*\n([\s\S]*?)\n```/;

export interface GalleryEntry { id: number; title: string; author: string; avatar: string; url: string; createdAt: string; reactions: number; comments: number; build: Build; body: string }

export function publishUrl(b: Build, appUrl: string): string {
  const code = encodeBuild(b);
  const skills = Object.values(b.board).map(c => c.rune).filter(Boolean).slice(0, 6).join(', ');
  const body = `**${b.name || 'Build'}** — ${b.stat}${b.author ? ` — by ${b.author}` : ''}\n\n${b.notes || ''}\n\n[Open in planner](${appUrl}#b=${code})\n\n<details><summary>build code</summary>\n\n\`\`\`build\n${code}\n\`\`\`\n</details>\n\n_Runes: ${skills}_`;
  const p = new URLSearchParams({ title: `[Build] ${b.name || 'Nova build'} (${b.stat})`, labels: LABEL, body });
  return `https://github.com/${REPO}/issues/new?${p}`;
}

export async function fetchGallery(): Promise<GalleryEntry[]> {
  const res = await fetch(`https://api.github.com/repos/${REPO}/issues?labels=${LABEL}&state=open&per_page=100&sort=created`, { headers: { Accept: 'application/vnd.github+json' } });
  if (!res.ok) throw new Error(`GitHub ${res.status}`);
  const issues: any[] = await res.json();
  const out: GalleryEntry[] = [];
  for (const i of issues) {
    if (i.pull_request) continue;
    const m = (i.body || '').match(CODE_RE) || (i.body || '').match(/#b=([A-Za-z0-9_-]+)/);
    const build = m && decodeBuild(m[1].trim()); if (!build) continue;
    out.push({ id: i.number, title: i.title.replace(/^\[Build\]\s*/, ''), author: i.user?.login ?? '', avatar: i.user?.avatar_url ?? '', url: i.html_url, createdAt: i.created_at, reactions: i.reactions?.['+1'] ?? 0, comments: i.comments ?? 0, build, body: i.body || '' });
  }
  return out;
}
