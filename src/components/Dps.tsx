import { useState } from 'react';
import { estimateAll } from '../lib/dps';
import { useT } from '../lib/i18n';
import { runeColor } from '../lib/rules';
import type { Build } from '../types';

const fmt = (n: number) => n.toLocaleString(undefined, { maximumFractionDigits: 0 });
export function Dps({ build, set }: { build: Build; set?: (b: Build) => void }) {
  const { t, g } = useT();
  const [inp, setInp] = useState(build.dpsInput ?? { weaponAvg: 300, weaponSpeed: 1.2, critChancePct: 10, critDmgPct: 150, charIncPct: 0, targetResistPct: 30, targetArmorPct: 30 });
  const upd = (k: keyof typeof inp, v: number) => { const n = { ...inp, [k]: v }; setInp(n); set?.({ ...build, dpsInput: n }); };
  const res = estimateAll(build, { ...inp, dualWield: build.dualWield });
  const F = ({ k, label, step = 1, w = 70 }: { k: keyof typeof inp; label: string; step?: number; w?: number }) => <label className="muted">{label} <input type="number" step={step} value={inp[k]} onChange={e => upd(k, +e.target.value || 0)} style={{ width: w }} /></label>;
  return <section className="panel">
    <h2>{t('dpsTitle')}</h2><p className="muted">{t('dpsHint')}</p>
    <div className="dps-inputs">
      <fieldset><legend>{t('dpsChar')}</legend><F k="weaponAvg" label={t('weaponDmg')} w={80} /><F k="weaponSpeed" label={t('weaponSpeed')} step={0.05} /><F k="critChancePct" label={t('critBase')} /><F k="critDmgPct" label={t('critDmgBase')} /><F k="charIncPct" label={t('charStat')} />
        <label className="muted"><input type="checkbox" checked={!!build.dualWield} onChange={e => set?.({ ...build, dualWield: e.target.checked })} /> {t('dualWield')}</label></fieldset>
      <fieldset><legend>{t('dpsTarget')}</legend><F k="targetResistPct" label={t('targetResist')} /><F k="targetArmorPct" label={t('targetArmor')} /></fieldset>
    </div>
    {res.length === 0 && <p className="muted">{t('dpsNoSkill')}</p>}
    <div className="groups">{res.map(r => <div key={r.skill.slug} className="group dps">
      <div className="gh"><img src={r.skill.icons[0]} alt="" /><b style={{ color: runeColor(r.skill) }}>{r.skill.name}</b> <small className="muted">{r.isSpell ? 'Spell' : 'Attack'}{r.estimated ? ' ≈' : ''}</small></div>
      <table><tbody>
        <tr><td>{t('dpsBase')}</td><td>{r.isSpell ? '—' : `${r.basePct}%`}</td></tr>
        <tr><td>{t('dpsFlat')}</td><td>+{fmt(r.flat)}</td></tr>
        <tr><td>{t('dpsInc')}</td><td>+{r.incTotal.toFixed(1)}%</td></tr>
        <tr><td>{t('dpsAmp')}</td><td>+{r.ampTotal.toFixed(1)}%</td></tr>
        <tr><td>{t('dpsMore')}</td><td>×{r.moreProduct.toFixed(3)}</td></tr>
        {r.manaCost != null && <tr><td>{t('dpsCost')}</td><td>{r.manaCost}</td></tr>}
        <tr><td>{t('dpsResult')}</td><td>{fmt(r.damage)}</td></tr>
        <tr><td>{t('dpsCrit')}</td><td>{r.critChance.toFixed(1)}% × {r.critDmg.toFixed(0)}%</td></tr>
        <tr><td>{t('dpsMitig')}</td><td>×{r.mitigation.toFixed(2)}{r.penPct ? ` (${t('pen')} ${r.penPct.toFixed(0)}%)` : ''}</td></tr>
        <tr><td>{t('dpsAvgHit')}</td><td>{fmt(r.avgHit)}</td></tr>
        <tr><td>{r.cooldown ? t('dpsCd') : t('dpsRate')}</td><td>{r.cooldown ? `${r.cooldown} s` : `${r.hitsPerSec.toFixed(2)}/s (+${r.speedPct.toFixed(0)}%)`}</td></tr>
        <tr className="total"><td>DPS</td><td><b>{fmt(r.dps)}</b></td></tr>
      </tbody></table>
      {(r.mods.length > 0 || r.extras.length > 0) && <details><summary>{r.mods.length + r.extras.length} mods</summary><ul className="affix">{r.mods.map((m, i) => <li key={i}><b>{m.source}</b>: {g(m.line)} <em className="muted">({m.kind})</em></li>)}{r.extras.map((m, i) => <li key={'x' + i}><b>{m.source}</b>: {g(m.line)} <em className="muted">({m.kind})</em></li>)}</ul></details>}
    </div>)}</div>
  </section>;
}
