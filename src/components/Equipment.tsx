import { useState } from 'react';
import { authority, uniqueBySlug, uniques, authorityBySlug } from '../data';
import type { Build, EquipSlot } from '../types';
import { Picker } from './Picker';

const SLOTS: { id: EquipSlot; label: string; types: string[]; authSlot: string[] }[] = [
  { id: 'Weapons', label: 'Arma', types: ['dagger', 'sword', 'axe', 'mace', 'staff', 'bow', 'wand', 'sceptre', 'magicbow', 'twohand_sword', 'twohand_axe', 'twohand_mace'], authSlot: ['Weapons'] },
  { id: 'Offhand', label: 'Mão secundária', types: ['shield', 'quiver', 'bowgun', 'magazine', 'dagger', 'sword', 'axe', 'mace', 'wand', 'sceptre'], authSlot: ['Shield', 'Quiver', 'Magazine', 'Weapons'] },
  { id: 'Helmet', label: 'Elmo', types: ['helmet'], authSlot: ['Helmet'] },
  { id: 'Pauldrons', label: 'Ombreiras', types: ['shoulder'], authSlot: ['Pauldrons'] },
  { id: 'Armor', label: 'Armadura', types: ['bodyarmor'], authSlot: ['Armor'] },
  { id: 'Gloves', label: 'Luvas', types: ['gloves'], authSlot: ['Gloves'] },
  { id: 'Shoes', label: 'Botas', types: ['boots'], authSlot: ['Shoes'] },
  { id: 'Belt', label: 'Cinto', types: ['belt'], authSlot: ['Belt'] },
  { id: 'Necklace', label: 'Colar', types: ['necklace'], authSlot: ['Necklace'] },
  { id: 'Ring1', label: 'Anel 1', types: ['ring'], authSlot: ['Ring'] },
  { id: 'Ring2', label: 'Anel 2', types: ['ring'], authSlot: ['Ring'] },
];

export function Equipment({ build, set }: { build: Build; set: (b: Build) => void }) {
  const [pick, setPick] = useState<{ slot: EquipSlot; kind: 'unique' | 'authority' } | null>(null);
  const upd = (slot: EquipSlot, patch: { unique?: string; authority?: string }) => set({ ...build, equipment: { ...build.equipment, [slot]: { ...build.equipment[slot], ...patch } } });
  const def = pick && SLOTS.find(s => s.id === pick.slot)!;
  return (
    <section className="panel">
      <h2>Equipamento &amp; Autoridade dos Deuses</h2>
      <div className="equip">
        {SLOTS.map(s => { const e = build.equipment[s.id] || {}; const u = e.unique ? uniqueBySlug.get(e.unique) : undefined; const a = e.authority ? authorityBySlug.get(e.authority) : undefined;
          return <div key={s.id} className="eq-slot">
            <div className="eq-label">{s.label}</div>
            <button className="eq-item" onClick={() => setPick({ slot: s.id, kind: 'unique' })}>{u ? <><img src={u.icon} alt="" /><span>{u.name}<small>{u.type} · T{u.tier}</small></span></> : <span className="muted">Único…</span>}</button>
            {u && u.affixes.length > 0 && <ul className="affix">{u.affixes.map((x, i) => <li key={i}>{x}</li>)}</ul>}
            <button className="eq-auth" onClick={() => setPick({ slot: s.id, kind: 'authority' })}>{a ? <span>⚜ {a.god} <small>({a.slot})</small></span> : <span className="muted">Autoridade…</span>}</button>
            {a && a.unique.length > 0 && <ul className="affix">{a.unique.map((x, i) => <li key={i}>{x}</li>)}</ul>}
          </div>; })}
      </div>
      {pick && def && pick.kind === 'unique' && <Picker title={`Único — ${def.label}`} allowClear onClose={() => setPick(null)}
        items={uniques.filter(u => def.types.includes(u.typeKey)).map(u => ({ slug: u.slug, name: u.name, icon: u.icon, sub: `${u.type} · Tier ${u.tier}`, tags: [u.type] }))}
        filters={[{ label: 'Tipo', options: [...new Set(uniques.filter(u => def.types.includes(u.typeKey)).map(u => u.type))], match: (i, v) => i.tags?.[0] === v }]}
        onPick={s => { upd(pick.slot, { unique: s ?? undefined }); setPick(null); }} />}
      {pick && def && pick.kind === 'authority' && <Picker title={`Autoridade — ${def.label}`} allowClear onClose={() => setPick(null)}
        items={authority.filter(a => def.authSlot.includes(a.slot)).map(a => ({ slug: a.slug, name: `${a.god}`, sub: a.slot }))}
        onPick={s => { upd(pick.slot, { authority: s ?? undefined }); setPick(null); }} />}
    </section>
  );
}
