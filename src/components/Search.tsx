import { useMemo, useState } from 'react';
import { authority, runemaster, runes, runestones, uniques } from '../data';
import { useT } from '../lib/i18n';
import { Picker, type PickItem } from './Picker';
import { AuthorityTip, RuneTip, RunestoneTip, UniqueTip } from './Tooltip';

/** Global search (Ctrl+K): every rune, runestone, unique, authority and rune master node with its tooltip. */
export function Search({ onClose }: { onClose: () => void }) {
  const { t } = useT(); const [sel, setSel] = useState<string | null>(null);
  const items = useMemo<PickItem[]>(() => [
    ...runes.map(r => ({ slug: 'rune:' + r.slug, name: r.name, icon: r.icons[0], sub: r.type === 'Skill' ? 'Skill Rune' : 'Link Rune', tags: ['Rune'], tip: <RuneTip r={r} /> })),
    ...runestones.map(s => ({ slug: 'stone:' + s.slug, name: s.name, icon: s.icon, sub: `Runestone · ${s.rarity}`, tags: ['Runestone'], tip: <RunestoneTip s={s} /> })),
    ...uniques.map(u => ({ slug: 'uniq:' + u.slug, name: u.name, icon: u.icon, sub: `${u.type} · T${u.tier}`, tags: ['Unique'], tip: <UniqueTip u={u} /> })),
    ...authority.map(a => ({ slug: 'auth:' + a.slug, name: `${a.god} — ${a.slot}`, sub: a.name, tags: ['Authority'], tip: <AuthorityTip a={a} /> })),
    ...runemaster.map(n => ({ slug: 'rm:' + n.id, name: `${n.category} T${n.tier}`, sub: n.effect, tags: ['Rune Master'] })),
  ], []);
  const picked = sel && items.find(i => i.slug === sel);
  return <>
    <Picker title={t('searchTitle')} items={items} onClose={onClose} onPick={s => setSel(s)}
      filters={[{ label: t('type'), options: ['Rune', 'Runestone', 'Unique', 'Authority', 'Rune Master'], match: (i, v) => i.tags?.[0] === v }]} />
    {picked && <div className="modal-bg" style={{ zIndex: 60 }} onClick={() => setSel(null)}><div className="modal narrow" onClick={e => e.stopPropagation()}>
      <div className="modal-head"><h3>{picked.name}</h3><button onClick={() => setSel(null)}>✕</button></div>
      {picked.tip ? <div className="inline-tip">{picked.tip}</div> : <p>{picked.sub}</p>}
    </div></div>}
  </>;
}
