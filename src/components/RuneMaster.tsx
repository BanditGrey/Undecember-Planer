import { useMemo, useState } from 'react';
import { runemaster } from '../data';
import type { Build, RuneMasterNode } from '../types';
import { Tip } from './Tooltip';
import { useT } from '../lib/i18n';

const CAT_ICON: Record<string, string> = { Attack: '⚔', Spell: '✦', DoT: '☠', Trap: '⚙', Minion: '☗', Sentry: '⌖', Totem: '♜', Shout: '♪', Seal: '◈', Movement: '➶', Stat: '▲', Resistance: '⛨', Penetration: '➤', Decrease: '▽', Potion: '⚗' };
const catIcon = (c: string) => Object.entries(CAT_ICON).find(([k]) => c.toLowerCase().includes(k.toLowerCase()))?.[1] ?? '✧';

function NodeTip({ n, v, locked, need }: { n: RuneMasterNode; v: number; locked: boolean; need: number }) {
  const { t } = useT();
  return <div className="ud-card"><div className="ud-head" style={{ borderColor: '#c9a24a' }}><div><div className="ud-name" style={{ color: '#c9a24a' }}>{n.category} · Tier {n.tier}</div><div className="ud-sub">{t('rmUnlock', { lv: n.unlockLevel, max: n.maxPoints })}</div></div></div>
    <div className="ud-sec"><div className="ud-stat">{n.effect.replace(/\b0\b/, t('perPoint'))}</div></div>
    <div className="ud-foot">{v}/{n.maxPoints} {t('points')}{n.prereqPointsPrevTier > 0 && <> · {t('rmReq', { n: n.prereqPointsPrevTier, t: n.tier - 1 })}{locked && <span style={{ color: '#e05252' }}> ({t('rmMissing', { n: need })})</span>}</>}</div></div>;
}

export function RuneMaster({ build, set }: { build: Build; set: (b: Build) => void }) {
  const [cat, setCat] = useState('');
  const { t } = useT();
  const cats = useMemo(() => [...new Set(runemaster.map(n => n.category))], []);
  const pts = build.runemaster; const total = Object.values(pts).reduce((a, b) => a + b, 0);
  const tierPts = (c: string, t: number) => runemaster.filter(n => n.category === c && n.tier === t).reduce((a, n) => a + (pts[n.id] || 0), 0);
  const catPts = (c: string) => runemaster.filter(n => n.category === c).reduce((a, n) => a + (pts[n.id] || 0), 0);
  const change = (id: string, v: number) => { const rm = { ...pts }; if (v > 0) rm[id] = v; else delete rm[id]; set({ ...build, runemaster: rm }); };
  const shown = cat ? [cat] : cats;
  return (
    <section className="panel">
      <div className="row between"><h2>{t('rmTitle')} <small className="muted">{t('rmPts', { n: total })}</small></h2>
        <div className="row"><select value={cat} onChange={e => setCat(e.target.value)}><option value="">{t('rmAll')}</option>{cats.map(c => <option key={c}>{c} ({catPts(c)})</option>)}</select>
          <button onClick={() => set({ ...build, runemaster: {} })}>{t('reset')}</button></div></div>
      <div className="rm-cats">
        {cats.map(c => <button key={c} className={`rm-catbtn ${cat === c ? 'on' : ''} ${catPts(c) ? 'has' : ''}`} onClick={() => setCat(cat === c ? '' : c)}><span className="rm-ico">{catIcon(c)}</span>{c}{catPts(c) > 0 && <b>{catPts(c)}</b>}</button>)}
      </div>
      {shown.map(c => <div key={c} className="constellation">
        <h4><span className="rm-ico">{catIcon(c)}</span>{c} <small className="muted">{catPts(c)} pts</small></h4>
        <div className="tiers">
          {[1, 2, 3, 4].map(t => { const nodes = runemaster.filter(n => n.category === c && n.tier === t); if (!nodes.length) return null;
            const prevOk = t === 1 || nodes.every(n => tierPts(c, t - 1) >= n.prereqPointsPrevTier);
            return <div key={t} className={`tier ${prevOk ? '' : 'tier-locked'}`}><div className="tier-label">Tier {t}<small>Lv {nodes[0].unlockLevel}</small></div>
              <div className="orbs">{nodes.map(n => { const v = pts[n.id] || 0; const have = tierPts(c, n.tier - 1); const locked = n.tier > 1 && have < n.prereqPointsPrevTier;
                return <Tip key={n.id} content={<NodeTip n={n} v={v} locked={locked} need={n.prereqPointsPrevTier - have} />}>
                  <div className={`orb ${v ? 'lit' : ''} ${v >= n.maxPoints ? 'full' : ''} ${locked ? 'locked' : ''}`}
                    onClick={() => !locked && v < n.maxPoints && change(n.id, v + 1)} onContextMenu={e => { e.preventDefault(); if (v > 0) change(n.id, v - 1); }}>
                    <svg viewBox="0 0 40 40"><circle cx="20" cy="20" r="17" className="orb-ring" strokeDasharray={`${(v / n.maxPoints) * 107} 107`} /></svg>
                    <span className="orb-v">{v}<small>/{n.maxPoints}</small></span>
                    <div className="orb-eff">{n.effect}</div></div></Tip>; })}</div></div>; })}
        </div></div>)}
      <p className="muted" style={{ marginTop: 8 }}>{t('rmHint')}</p>
    </section>
  );
}
