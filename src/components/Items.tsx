import { useMemo, useState } from 'react';
import miscJson from '../data/misc.json';
import { Tip } from './Tooltip';
import { useT, type Key } from '../lib/i18n';

interface Item { slug: string; name: string; icon: string | null; rarity: string | null; howToGet: string[]; useOn: string[]; description: string; props: string[]; recipes: { title: string; ingredients: { href: string | null; icon: string | null; count: string }[] }[] }
const misc = miscJson as Record<string, Item[]>;
const SECTIONS: [string, Key][] = [['essences', 'essences'], ['potions', 'potions'], ['coins', 'coins'], ['materials', 'materials']];
const RC: Record<string, string> = { Normal: '#d9d9e3', Magic: '#4a90e2', Rare: '#e6c93f', Unique: '#e2562f', Legendary: '#e08a2f', Holy: '#f0e6c0', Ancient: '#b59cf0' };
const iconUrl = (p: string | null) => !p ? undefined : p.startsWith('http') || p.startsWith('icons/') ? p : `https://undecember.thein.ru${p}`;

function ItemTip({ it }: { it: Item }) {
  const { t } = useT();
  const c = RC[it.rarity ?? ''] ?? '#c9a24a';
  return <div className="ud-card"><div className="ud-head" style={{ borderColor: c }}>{it.icon && <img src={iconUrl(it.icon)} alt="" />}<div><div className="ud-name" style={{ color: c }}>{it.name}</div><div className="ud-sub">{[it.rarity, it.useOn.join(', ')].filter(Boolean).join(' · ')}</div></div></div>
    {it.description && <p className="ud-desc">{it.description}</p>}
    {it.props.length > 0 && <div className="ud-sec">{it.props.map((p, i) => <div key={i} className="ud-stat">{p}</div>)}</div>}
    {it.recipes.map((r, i) => <div key={i} className="ud-sec"><div className="ud-sec-t">{r.title}</div><div className="row">{r.ingredients.map((g, j) => <span key={j} className="ing">{g.icon && <img src={iconUrl(g.icon)} alt="" />}×{g.count}</span>)}</div></div>)}
    {it.howToGet.length > 0 && <div className="ud-foot">{t('source')}: <span className="ud-src">{it.howToGet.join(' ')}</span></div>}</div>;
}

export function Items() {
  const [sec, setSec] = useState('essences'); const [q, setQ] = useState('');
  const { t } = useT();
  const list = useMemo(() => (misc[sec] ?? []).filter(i => !q || i.name.toLowerCase().includes(q.toLowerCase()) || i.description.toLowerCase().includes(q.toLowerCase())), [sec, q]);
  return <section className="panel">
    <div className="row between"><h2>{t('itemsTitle')} <small className="muted">{SECTIONS.map(([k, l]) => `${t(l)} ${misc[k]?.length ?? 0}`).join(' · ')}</small></h2><input placeholder={t('search')} value={q} onChange={e => setQ(e.target.value)} /></div>
    <nav className="subnav">{SECTIONS.map(([k, l]) => <button key={k} className={sec === k ? 'on' : ''} onClick={() => setSec(k)}>{t(l)}</button>)}</nav>
    {list.length === 0 && <p className="muted">{t('itemsEmpty')}</p>}
    <div className="item-grid">{list.map(it => <Tip key={it.slug} content={<ItemTip it={it} />}><div className="item" style={{ borderColor: (RC[it.rarity ?? ''] ?? '#3a3124') + '88' }}>{it.icon && <img src={iconUrl(it.icon)} alt="" loading="lazy" />}<span>{it.name}</span></div></Tip>)}</div>
  </section>;
}
