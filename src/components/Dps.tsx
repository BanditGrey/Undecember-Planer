import { useState } from 'react';
import { estimateAll } from '../lib/dps';
import { useT } from '../lib/i18n';
import { runeColor } from '../lib/rules';
import type { Build } from '../types';

const fmt = (n: number) => n.toLocaleString(undefined, { maximumFractionDigits: 0 });
export function Dps({ build }: { build: Build }) {
  const { t } = useT();
  const [weaponAvg, setW] = useState(300); const [charInc, setC] = useState(0);
  const res = estimateAll(build, { weaponAvg, charIncPct: charInc });
  return <section className="panel">
    <h2>{t('dpsTitle')}</h2><p className="muted">{t('dpsHint')}</p>
    <div className="row"><label className="muted">{t('weaponDmg')} <input type="number" value={weaponAvg} onChange={e => setW(+e.target.value || 0)} style={{ width: 90 }} /></label>
      <label className="muted">{t('charStat')} <input type="number" value={charInc} onChange={e => setC(+e.target.value || 0)} style={{ width: 80 }} /></label></div>
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
        <tr className="total"><td>{t('dpsResult')}</td><td><b>{fmt(r.damage)}</b></td></tr>
      </tbody></table>
      {r.mods.length > 0 && <details><summary>{r.mods.length} mods</summary><ul className="affix">{r.mods.map((m, i) => <li key={i}><b>{m.source}</b>: {m.line} <em className="muted">({m.kind})</em></li>)}</ul></details>}
    </div>)}</div>
  </section>;
}
