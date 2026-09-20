import { useMemo, useState } from 'react';
import { authority, runeBySlug, runemaster, uniques } from '../data';
import { estimateAll } from '../lib/dps';
import { useT } from '../lib/i18n';
import { runeColor } from '../lib/rules';
import { decodeBuild, savedBuilds } from '../lib/share';
import type { Build, EquipSlot } from '../types';

const fmt = (n: number) => n.toLocaleString(undefined, { maximumFractionDigits: 0 });
const SLOTS: EquipSlot[] = ['Weapons', 'Offhand', 'Helmet', 'Pauldrons', 'Armor', 'Gloves', 'Shoes', 'Belt', 'Necklace', 'Ring1', 'Ring2'];
const uniqueName = (s?: string) => (s && uniques.find(u => u.slug === s)?.name) || '—';
const authName = (s?: string) => (s && authority.find(a => a.slug === s)?.name) || '—';

function summary(b: Build) {
  const skills = Object.values(b.board).map(c => c.rune && runeBySlug.get(c.rune)).filter(r => r && r.type === 'Skill') as NonNullable<ReturnType<typeof runeBySlug.get>>[];
  const links = Object.values(b.board).filter(c => c.rune && runeBySlug.get(c.rune)?.type === 'Link').length;
  const rmPts = Object.values(b.runemaster).reduce((a, v) => a + v, 0);
  return { skills, links, rmPts };
}

export function Compare({ build }: { build: Build }) {
  const { t } = useT();
  const [other, setOther] = useState<Build | null>(null); const [code, setCode] = useState(''); const [err, setErr] = useState('');
  const [weaponAvg, setW] = useState(300);
  const saved = savedBuilds();
  const load = (s: string) => { const m = s.match(/#b=([A-Za-z0-9_-]+)/); const b = decodeBuild(m ? m[1] : s.trim()); if (b) { setOther(b); setErr(''); } else setErr(t('cmpBad')); };
  const A = useMemo(() => estimateAll(build, { weaponAvg, charIncPct: 0 }), [build, weaponAvg]);
  const B = useMemo(() => other ? estimateAll(other, { weaponAvg, charIncPct: 0 }) : [], [other, weaponAvg]);
  const sa = summary(build), sb = other ? summary(other) : null;
  const skillSlugs = [...new Set([...A.map(r => r.skill.slug), ...B.map(r => r.skill.slug)])];
  const Delta = ({ a, b }: { a: number; b: number }) => { if (!other || !a || !b) return null; const d = (b - a) / a * 100; return <small className={d >= 0 ? 'ok' : 'bad'}> {d >= 0 ? '+' : ''}{d.toFixed(0)}%</small>; };
  const rmNodes = [...new Set([...Object.keys(build.runemaster), ...Object.keys(other?.runemaster ?? {})])].filter(id => (build.runemaster[id] ?? 0) !== (other?.runemaster[id] ?? 0));
  return <section className="panel">
    <h2>{t('cmpTitle')} <small className="muted">{t('cmpHint')}</small></h2>
    <div className="row">
      <select onChange={e => { const b = saved.find(x => x.name === e.target.value); if (b) { setOther(b); setErr(''); } }} defaultValue=""><option value="" disabled>{t('cmpPickSaved')}</option>{saved.map(b => <option key={b.name}>{b.name}</option>)}</select>
      <input placeholder={t('cmpPaste')} value={code} onChange={e => setCode(e.target.value)} style={{ flex: 1, minWidth: 220 }} /><button onClick={() => load(code)}>{t('cmpLoad')}</button>
      <label className="muted">{t('weaponDmg')} <input type="number" value={weaponAvg} onChange={e => setW(+e.target.value || 0)} style={{ width: 90 }} /></label>
      {err && <span className="bad">{err}</span>}
    </div>
    {!other && <p className="muted">{t('cmpEmpty')}</p>}
    <table className="cmp"><thead><tr><th></th><th>A · {build.name || '—'}</th><th>B · {other ? other.name || '—' : '—'}</th></tr></thead><tbody>
      <tr><td>{t('cmpStat')}</td><td>{build.stat}</td><td>{other?.stat ?? '—'}</td></tr>
      <tr><td>{t('cmpSkills')}</td><td>{sa.skills.map(r => <img key={r.slug} src={r.icons[0]} title={r.name} alt="" className="mini" />)}</td><td>{sb?.skills.map(r => <img key={r.slug} src={r.icons[0]} title={r.name} alt="" className="mini" />) ?? '—'}</td></tr>
      <tr><td>{t('cmpLinks')}</td><td>{sa.links}</td><td>{sb?.links ?? '—'}</td></tr>
      <tr><td>{t('cmpRm')}</td><td>{sa.rmPts}</td><td>{sb?.rmPts ?? '—'}</td></tr>
      <tr><td>{t('runeLevel')}</td><td>{(build.runeLevel ?? 45) + (build.runeLevelBonus ?? 0)}</td><td>{other ? (other.runeLevel ?? 45) + (other.runeLevelBonus ?? 0) : '—'}</td></tr>
      <tr className="sec"><td colSpan={3}>{t('dpsTitle')}</td></tr>
      {skillSlugs.map(s => { const a = A.find(r => r.skill.slug === s), b = B.find(r => r.skill.slug === s); const r = (a ?? b)!; return <tr key={s}><td><img src={r.skill.icons[0]} alt="" className="mini" /> <b style={{ color: runeColor(r.skill) }}>{r.skill.name}</b></td><td>{a ? fmt(a.damage) : '—'}</td><td>{b ? fmt(b.damage) : '—'}<Delta a={a?.damage ?? 0} b={b?.damage ?? 0} /></td></tr>; })}
      <tr className="sec"><td colSpan={3}>{t('tabEquip')}</td></tr>
      {SLOTS.map(sl => { const ea = build.equipment[sl], eb = other?.equipment[sl]; const diff = other && (ea?.unique !== eb?.unique || ea?.authority !== eb?.authority); return <tr key={sl} className={diff ? 'diff' : ''}><td>{sl}</td><td>{uniqueName(ea?.unique)}<br /><small className="muted">{authName(ea?.authority)}</small></td><td>{other ? <>{uniqueName(eb?.unique)}<br /><small className="muted">{authName(eb?.authority)}</small></> : '—'}</td></tr>; })}
      {other && <><tr className="sec"><td colSpan={3}>{t('tabRM')} — {t('cmpDiffOnly')}</td></tr>
        {rmNodes.length === 0 && <tr><td colSpan={3} className="muted">{t('cmpSame')}</td></tr>}
        {rmNodes.map(id => { const n = runemaster.find(x => x.id === id); return <tr key={id} className="diff"><td>{n ? `${n.category} T${n.tier}` : id}<br /><small className="muted">{n?.effect}</small></td><td>{build.runemaster[id] ?? 0}</td><td>{other.runemaster[id] ?? 0}</td></tr>; })}</>}
    </tbody></table>
  </section>;
}
