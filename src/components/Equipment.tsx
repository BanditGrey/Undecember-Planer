import { useState } from 'react';
import { authority, uniqueBySlug, uniques, authorityBySlug } from '../data';
import type { Build, EquipSlot } from '../types';
import { Picker } from './Picker';
import { AuthorityTip, Tip, UniqueTip } from './Tooltip';
import { useT } from '../lib/i18n';

const SLOTS: { id: EquipSlot; types: string[]; authSlot: string[]; area: string; glyph: string }[] = [
  { id: 'Helmet', types: ['helmet'], authSlot: ['Helmet'], area: 'helm', glyph: '⛑' },
  { id: 'Necklace', types: ['necklace'], authSlot: ['Necklace'], area: 'neck', glyph: '📿' },
  { id: 'Pauldrons', types: ['shoulder'], authSlot: ['Pauldrons'], area: 'shoulder', glyph: '🛡' },
  { id: 'Armor', types: ['bodyarmor'], authSlot: ['Armor'], area: 'armor', glyph: '🥋' },
  { id: 'Weapons', types: ['dagger', 'sword', 'axe', 'mace', 'staff', 'bow', 'wand', 'sceptre', 'magicbow', 'twohand_sword', 'twohand_axe', 'twohand_mace'], authSlot: ['Weapons'], area: 'weapon', glyph: '⚔' },
  { id: 'Offhand', types: ['shield', 'quiver', 'bowgun', 'magazine', 'dagger', 'sword', 'axe', 'mace', 'wand', 'sceptre'], authSlot: ['Shield', 'Quiver', 'Magazine', 'Weapons'], area: 'offhand', glyph: '🛡' },
  { id: 'Gloves', types: ['gloves'], authSlot: ['Gloves'], area: 'gloves', glyph: '🧤' },
  { id: 'Belt', types: ['belt'], authSlot: ['Belt'], area: 'belt', glyph: '➰' },
  { id: 'Ring1', types: ['ring'], authSlot: ['Ring'], area: 'ring1', glyph: '💍' },
  { id: 'Ring2', types: ['ring'], authSlot: ['Ring'], area: 'ring2', glyph: '💍' },
  { id: 'Shoes', types: ['boots'], authSlot: ['Shoes'], area: 'boots', glyph: '🥾' },
];

export function Equipment({ build, set }: { build: Build; set: (b: Build) => void }) {
  const [pick, setPick] = useState<{ slot: EquipSlot; kind: 'unique' | 'authority' } | null>(null);
  const { t } = useT(); const label = (id: EquipSlot) => t(`slot_${id}` as const);
  const upd = (slot: EquipSlot, patch: { unique?: string; authority?: string }) => set({ ...build, equipment: { ...build.equipment, [slot]: { ...build.equipment[slot], ...patch } } });
  const def = pick && SLOTS.find(s => s.id === pick.slot)!;
  const equipped = SLOTS.map(s => ({ s, e: build.equipment[s.id] || {} })).filter(x => x.e.unique || x.e.authority);
  return (
    <section className="panel">
      <h2>{t('equipTitle')} <small className="muted">{t('equipHint')}</small></h2>
      <div className="doll-wrap">
        <div className="doll">
          <div className="doll-figure" />
          {SLOTS.map(s => { const e = build.equipment[s.id] || {}; const u = e.unique ? uniqueBySlug.get(e.unique) : undefined; const a = e.authority ? authorityBySlug.get(e.authority) : undefined;
            const box = <div className={`dslot ${u ? 'has' : ''} ${a ? 'auth' : ''}`} style={{ gridArea: s.area }} onClick={() => setPick({ slot: s.id, kind: 'unique' })} onContextMenu={ev => { ev.preventDefault(); setPick({ slot: s.id, kind: 'authority' }); }}>
              {u ? <img src={u.icon} alt={u.name} /> : <span className="glyph">{s.glyph}</span>}
              {a && <span className="auth-badge" title={a.name}>⚜</span>}
              <span className="dlabel">{label(s.id)}</span></div>;
            return (u || a) ? <Tip key={s.id} content={<>{u && <UniqueTip u={u} />}{a && <AuthorityTip a={a} />}</>}>{box}</Tip> : <div key={s.id} style={{ display: 'contents' }}>{box}</div>; })}
        </div>
        <div className="doll-list">
          {equipped.length === 0 && <p className="muted">{t('equipEmpty')}</p>}
          {equipped.map(({ s, e }) => { const u = e.unique ? uniqueBySlug.get(e.unique) : undefined; const a = e.authority ? authorityBySlug.get(e.authority) : undefined;
            return <div key={s.id} className="eq-row"><div className="eq-label">{label(s.id)}</div>
              {u && <div className="eq-uname">{u.name} <small className="muted">{u.type} · T{u.tier}</small></div>}
              {u && u.affixes.length > 0 && <ul className="affix">{u.affixes.map((x, i) => <li key={i}>{x}</li>)}</ul>}
              {a && <div className="eq-aname">⚜ {a.god} <small className="muted">({a.slot})</small>{a.unique.length > 0 && <ul className="affix">{a.unique.map((x, i) => <li key={i}>{x}</li>)}</ul>}</div>}
              <div className="row"><button onClick={() => setPick({ slot: s.id, kind: 'unique' })}>{t('item')}</button><button onClick={() => setPick({ slot: s.id, kind: 'authority' })}>{t('authority')}</button>
                <button className="danger" onClick={() => { const eq = { ...build.equipment }; delete eq[s.id]; set({ ...build, equipment: eq }); }}>✕</button></div></div>; })}
        </div>
      </div>
      {pick && def && pick.kind === 'unique' && <Picker title={t('uniquePick', { slot: label(def.id) })} allowClear onClose={() => setPick(null)}
        items={uniques.filter(u => def.types.includes(u.typeKey)).map(u => ({ slug: u.slug, name: u.name, icon: u.icon, sub: `${u.type} · Tier ${u.tier}`, tags: [u.type], tip: <UniqueTip u={u} /> }))}
        filters={[{ label: t('type'), options: [...new Set(uniques.filter(u => def.types.includes(u.typeKey)).map(u => u.type))], match: (i, v) => i.tags?.[0] === v }]}
        onPick={s => { upd(pick.slot, { unique: s ?? undefined }); setPick(null); }} />}
      {pick && def && pick.kind === 'authority' && <Picker title={t('authPick', { slot: label(def.id) })} allowClear onClose={() => setPick(null)}
        items={authority.filter(a => def.authSlot.includes(a.slot)).map(a => ({ slug: a.slug, name: `${a.god}`, sub: a.slot, tip: <AuthorityTip a={a} /> }))}
        onPick={s => { upd(pick.slot, { authority: s ?? undefined }); setPick(null); }} />}
    </section>
  );
}
