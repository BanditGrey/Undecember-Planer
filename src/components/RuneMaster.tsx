import { useMemo, useState } from 'react';
import { runemaster } from '../data';
import type { Build } from '../types';

export function RuneMaster({ build, set }: { build: Build; set: (b: Build) => void }) {
  const [cat, setCat] = useState('');
  const cats = useMemo(() => [...new Set(runemaster.map(n => n.category))], []);
  const pts = build.runemaster; const total = Object.values(pts).reduce((a, b) => a + b, 0);
  const tierPts = (c: string, t: number) => runemaster.filter(n => n.category === c && n.tier === t).reduce((a, n) => a + (pts[n.id] || 0), 0);
  const change = (id: string, v: number) => { const rm = { ...pts }; if (v > 0) rm[id] = v; else delete rm[id]; set({ ...build, runemaster: rm }); };
  const shown = cat ? cats.filter(c => c === cat) : cats;
  return (
    <section className="panel">
      <h2>Caminho do Mestre de Runas <small className="muted">{total} pontos</small></h2>
      <div className="row"><select value={cat} onChange={e => setCat(e.target.value)}><option value="">Todas as categorias</option>{cats.map(c => <option key={c}>{c}</option>)}</select>
        <button onClick={() => set({ ...build, runemaster: {} })}>Limpar</button></div>
      {shown.map(c => <div key={c} className="rm-cat"><h4>{c} <small className="muted">{runemaster.filter(n => n.category === c).reduce((a, n) => a + (pts[n.id] || 0), 0)} pts</small></h4>
        {runemaster.filter(n => n.category === c).map(n => { const locked = n.tier > 1 && tierPts(c, n.tier - 1) < n.prereqPointsPrevTier; const v = pts[n.id] || 0;
          return <div key={n.id} className={`rm-node ${locked ? 'locked' : ''} ${v ? 'active' : ''}`} title={locked ? `Requer ${n.prereqPointsPrevTier} pontos no tier ${n.tier - 1}` : ''}>
            <span className="rm-tier">T{n.tier}<small>Lv{n.unlockLevel}</small></span>
            <span className="rm-eff">{n.effect}</span>
            <span className="rm-pts"><button disabled={v <= 0} onClick={() => change(n.id, v - 1)}>−</button>{v}/{n.maxPoints}<button disabled={locked || v >= n.maxPoints} onClick={() => change(n.id, v + 1)}>+</button></span>
          </div>; })}
      </div>)}
    </section>
  );
}
