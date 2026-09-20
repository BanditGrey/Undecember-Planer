import { useMemo, useState, type ReactNode } from 'react';
import { Tip } from './Tooltip';
import { useT } from '../lib/i18n';

export interface PickItem { slug: string; name: string; icon?: string; sub?: string; tags?: string[]; tip?: ReactNode }
interface Props { title: string; items: PickItem[]; filters?: { label: string; options: string[]; match: (i: PickItem, v: string) => boolean }[]; onPick: (slug: string | null) => void; onClose: () => void; allowClear?: boolean }

export function Picker({ title, items, filters = [], onPick, onClose, allowClear }: Props) {
  const [q, setQ] = useState('');
  const { t } = useT();
  const [fv, setFv] = useState<string[]>(filters.map(() => ''));
  const list = useMemo(() => items.filter(i => (!q || i.name.toLowerCase().includes(q.toLowerCase()) || i.slug.toLowerCase().includes(q.toLowerCase()))
    && filters.every((f, ix) => !fv[ix] || f.match(i, fv[ix]))).slice(0, 400), [items, q, fv, filters]);
  return (
    <div className="modal-bg" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-head"><h3>{title}</h3><button onClick={onClose}>✕</button></div>
        <div className="row">
          <input autoFocus placeholder={t('search')} value={q} onChange={e => setQ(e.target.value)} />
          {filters.map((f, ix) => <select key={f.label} value={fv[ix]} onChange={e => setFv(v => v.map((x, j) => j === ix ? e.target.value : x))}>
            <option value="">{f.label}: {t('all')}</option>{f.options.map(o => <option key={o}>{o}</option>)}</select>)}
          {allowClear && <button className="danger" onClick={() => onPick(null)}>{t('remove')}</button>}
        </div>
        <div className="pick-grid">
          {list.map(i => { const b = <button key={i.slug} className="pick" onClick={() => onPick(i.slug)}>
            {i.icon && <img src={i.icon} alt="" loading="lazy" />}<span><b>{i.name}</b>{i.sub && <small>{i.sub}</small>}</span></button>;
            return i.tip ? <Tip key={i.slug} content={i.tip}>{b}</Tip> : b; })}
          {list.length === 0 && <p className="muted">{t('nothing')}</p>}
        </div>
      </div>
    </div>
  );
}
