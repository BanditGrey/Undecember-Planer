import { useState } from 'react';
import { authority, uniqueBySlug, uniques, authorityBySlug } from '../data';
import { emptyExtras, type Build, type EquipSlot, type Extras, type ExtraItem, type Lacrima } from '../types';
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
  const { t, g } = useT(); const label = (id: EquipSlot) => t(`slot_${id}` as const);
  const upd = (slot: EquipSlot, patch: { unique?: string; authority?: string; affixes?: string[] }) => set({ ...build, equipment: { ...build.equipment, [slot]: { ...build.equipment[slot], ...patch } } });
  const def = pick && SLOTS.find(s => s.id === pick.slot)!;
  const equipped = SLOTS.map(s => ({ s, e: build.equipment[s.id] || {} })).filter(x => x.e.unique || x.e.authority || x.e.affixes?.length);
  const rareSlots = SLOTS.filter(s => !equipped.some(x => x.s.id === s.id));
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
          <div className="row wrap"><span className="muted small">{t('rareGear')}:</span>{rareSlots.map(s => <button key={s.id} className="mini" onClick={() => upd(s.id, { affixes: [''] })}>+ {label(s.id)}</button>)}</div>
          {equipped.map(({ s, e }) => { const u = e.unique ? uniqueBySlug.get(e.unique) : undefined; const a = e.authority ? authorityBySlug.get(e.authority) : undefined;
            return <div key={s.id} className="eq-row"><div className="eq-label">{label(s.id)}</div>
              {u && <div className="eq-uname">{u.name} <small className="muted">{g(u.type)} · T{u.tier}</small></div>}
              {u && u.affixes.length > 0 && <ul className="affix">{u.affixes.map((x, i) => <li key={i}>{g(x)}</li>)}</ul>}
              {a && <div className="eq-aname">⚜ {a.god} <small className="muted">({g(a.slot)})</small>{a.unique.length > 0 && <ul className="affix">{a.unique.map((x, i) => <li key={i}>{g(x)}</li>)}</ul>}</div>}
              <AffixEditor value={e.affixes ?? []} onChange={v => upd(s.id, { affixes: v.length ? v : undefined })} />
              <div className="row"><button onClick={() => setPick({ slot: s.id, kind: 'unique' })}>{t('item')}</button><button onClick={() => setPick({ slot: s.id, kind: 'authority' })}>{t('authority')}</button>
                <button className="danger" onClick={() => { const eq = { ...build.equipment }; delete eq[s.id]; set({ ...build, equipment: eq }); }}>✕</button></div></div>; })}
        </div>
      </div>
      <ExtrasPanel extras={build.extras ?? emptyExtras()} onChange={x => set({ ...build, extras: x })} />
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

/** Free-text affix lines (one per line). Lines like "+45% Fire DMG" / "12% DMG Amplification" feed the DPS estimate. */
function AffixEditor({ value, onChange, placeholder }: { value: string[]; onChange: (v: string[]) => void; placeholder?: string }) {
  const { t } = useT();
  return <textarea className="affix-edit" rows={Math.max(2, Math.min(6, value.length + 1))} placeholder={placeholder ?? t('affixPh')} value={value.join('\n')} onChange={e => onChange(e.target.value.split('\n'))} onBlur={e => onChange(e.target.value.split('\n').map(x => x.trim()).filter(Boolean))} />;
}

const LACRIMA_TYPES = ['Weapon', 'Shield', 'Quiver', 'Magazine', 'Helmet', 'Pauldrons', 'Armor', 'Gloves', 'Shoes', 'Belt', 'Necklace', 'Ring'];
function ItemList({ title, hint, items, onChange, max }: { title: string; hint: string; items: ExtraItem[]; onChange: (v: ExtraItem[]) => void; max: number }) {
  const { t } = useT();
  const upd = (i: number, patch: Partial<ExtraItem>) => onChange(items.map((x, j) => j === i ? { ...x, ...patch } : x));
  return <div className="extra-box"><div className="row between"><b>{title} <small className="muted">{items.length}/{max}</small></b>{items.length < max && <button className="mini" onClick={() => onChange([...items, { name: '', lines: [] }])}>+ {t('add')}</button>}</div>
    <p className="muted small">{hint}</p>
    {items.map((it, i) => <div key={i} className="extra-item"><div className="row"><input value={it.name} placeholder={t('name')} onChange={e => upd(i, { name: e.target.value })} /><button className="danger" onClick={() => onChange(items.filter((_, j) => j !== i))}>✕</button></div>
      <AffixEditor value={it.lines} onChange={lines => upd(i, { lines })} /></div>)}</div>;
}
function ExtrasPanel({ extras, onChange }: { extras: Extras; onChange: (x: Extras) => void }) {
  const { t } = useT();
  const lac = extras.lacrima; const updL = (i: number, patch: Partial<Lacrima>) => onChange({ ...extras, lacrima: lac.map((x, j) => j === i ? { ...x, ...patch } : x) });
  return <div className="extras">
    <h3>{t('extrasTitle')} <small className="muted">{t('extrasHint')}</small></h3>
    <div className="extras-grid">
      <ItemList title={t('charms')} hint={t('charmsHint')} items={extras.charms} max={12} onChange={v => onChange({ ...extras, charms: v })} />
      <ItemList title={t('relics')} hint={t('relicsHint')} items={extras.relics} max={6} onChange={v => onChange({ ...extras, relics: v })} />
      <ItemList title={t('jewels')} hint={t('jewelsHint')} items={extras.jewels} max={8} onChange={v => onChange({ ...extras, jewels: v })} />
      <div className="extra-box"><div className="row between"><b>{t('lacrima')} <small className="muted">{lac.length}/3</small></b>{lac.length < 3 && <button className="mini" onClick={() => onChange({ ...extras, lacrima: [...lac, { type: 'Ring', grade: 'Rare', absorb: 100, lines: [] }] })}>+ {t('add')}</button>}</div>
        <p className="muted small">{t('lacrimaHint')}</p>
        {lac.map((l, i) => <div key={i} className="extra-item"><div className="row wrap">
          <select value={l.type} onChange={e => updL(i, { type: e.target.value })}>{LACRIMA_TYPES.map(x => <option key={x}>{x}</option>)}</select>
          <select value={l.grade} onChange={e => updL(i, { grade: e.target.value as Lacrima['grade'] })}>{['Magic', 'Rare', 'Unique'].map(x => <option key={x}>{x}</option>)}</select>
          <label className="small">{t('absorb')} <input type="number" min={1} max={200} value={l.absorb} style={{ width: 64 }} onChange={e => updL(i, { absorb: +e.target.value || 100 })} />%</label>
          <button className="danger" onClick={() => onChange({ ...extras, lacrima: lac.filter((_, j) => j !== i) })}>✕</button></div>
          <AffixEditor value={l.lines} onChange={lines => updL(i, { lines })} /></div>)}</div>
    </div>
    <textarea rows={2} placeholder={t('extrasNotesPh')} value={extras.notes ?? ''} onChange={e => onChange({ ...extras, notes: e.target.value })} />
  </div>;
}
