import { useMemo, useState } from 'react';
import { zodiac } from '../data';
import type { Build, ZodiacNode, ZodiacSpec } from '../types';
import { Tip } from './Tooltip';
import { useT } from '../lib/i18n';
import { branches, canActivate, activeIn, specCap, moonOf, toggleNode, totalZodiac, zodiacSpecs } from '../lib/zodiac';

const KIND = { Moon: { glyph: '☾', color: '#9fb4d8', r: 17 }, Star: { glyph: '✦', color: '#e9e2c8', r: 11 }, Sun: { glyph: '☀', color: '#e8b64a', r: 14 }, Cosmos: { glyph: '✺', color: '#c76bff', r: 15 } } as const;
const ROUTE_ICON: Record<string, string> = { melee: '⚔', area: '☄', lowhp: '☠', projectile: '➶', spell: '✦', bowgun: '⌖' };

function NodeTip({ n, spec, state }: { n: ZodiacNode; spec: ZodiacSpec; state: 'on' | 'ok' | 'cap' | 'prereq' }) {
  const { t, g } = useT(); const k = KIND[n.kind];
  return <div className="ud-card"><div className="ud-head" style={{ borderColor: k.color }}><div><div className="ud-name" style={{ color: k.color }}>{k.glyph} {t(`zk${n.kind}`)}</div><div className="ud-sub">{t('zSpec')} {['Ⅰ', 'Ⅱ', 'Ⅲ'][spec.tier - 1]} · {spec.name}</div></div></div>
    <div className="ud-sec">{n.effects.map((e, i) => { const m = e.match(/^\[(.+?)\]\s*(.*)$/); return <div key={i} className="ud-stat">{m ? <><b style={{ color: k.color }}>[{m[1]}]</b> {g(m[2])}</> : g(e)}</div>; })}</div>
    <div className="ud-foot">{state === 'on' ? t('zActive') : state === 'ok' ? t('zClick') : state === 'cap' ? t('zCap', { n: specCap(spec) }) : t('zPrereq')}</div></div>;
}

/** One specialization drawn as a constellation: Moon in the centre, branches radiating outwards. */
function Constellation({ spec, build, set }: { spec: ZodiacSpec; build: Build; set: (b: Build) => void }) {
  const { t } = useT(); const act = new Set(build.zodiac ?? []);
  const brs = useMemo(() => branches(spec), [spec]);
  const W = 560, H = 360, cx = W / 2, cy = H / 2;
  // long branches (ending in Cosmos) fan out on the sides; short tails go up/down.
  const long = brs.filter(b => b[b.length - 1].kind === 'Cosmos'), short = brs.filter(b => b[b.length - 1].kind !== 'Cosmos');
  const pos = new Map<string, [number, number]>(); pos.set(moonOf(spec).id, [cx, cy]);
  const longAngles = [-155, -25, 155, 25].map(a => a * Math.PI / 180);
  long.forEach((br, bi) => { const a = longAngles[bi % 4] + (bi >= 4 ? 0.35 : 0); br.forEach((n, i) => { const d = 58 + i * 54; pos.set(n.id, [cx + Math.cos(a) * d * 1.3, cy + Math.sin(a) * d * 0.75]); }); });
  const shortAngles = [-90, 90, -60, 120].map(a => a * Math.PI / 180);
  short.forEach((br, bi) => { const a = shortAngles[bi % 4]; br.forEach((n, i) => { const d = 70 + i * 62; pos.set(n.id, [cx + Math.cos(a) * d * 0.9, cy + Math.sin(a) * d * 0.95]); }); });
  const edges: [ZodiacNode, ZodiacNode][] = []; for (const br of brs) { let prev = moonOf(spec); for (const n of br) { edges.push([prev, n]); prev = n; } }
  const used = activeIn(build, spec), cap = specCap(spec);
  return <div className="zod-const">
    <div className="zod-head"><h4>{t('zSpec')} {['Ⅰ', 'Ⅱ', 'Ⅲ'][spec.tier - 1]} · {spec.name}</h4><span className={`zod-pts ${used >= cap ? 'full' : ''}`}>{used}/{cap} {t('points')}</span></div>
    <svg viewBox={`0 0 ${W} ${H}`} className="zod-svg">
      {edges.map(([a, b]) => { const pa = pos.get(a.id)!, pb = pos.get(b.id)!; const lit = act.has(a.id) && act.has(b.id); return <line key={a.id + b.id} x1={pa[0]} y1={pa[1]} x2={pb[0]} y2={pb[1]} className={lit ? 'lit' : ''} />; })}
      {spec.nodes.map(n => { const [x, y] = pos.get(n.id)!; const k = KIND[n.kind]; const on = act.has(n.id); const c = canActivate(build, spec, n); const state = on ? 'on' : c.ok ? 'ok' : c.reason!;
        return <Tip key={n.id} content={<NodeTip n={n} spec={spec} state={state} />}><g className={`zn ${n.kind} ${state}`} transform={`translate(${x},${y})`} onClick={() => set(toggleNode(build, spec, n))}>
          <circle r={k.r + 5} className="halo" /><circle r={k.r} className="core" style={{ stroke: k.color }} /><text dy=".35em" style={{ fill: on ? '#111' : k.color, fontSize: k.r }}>{k.glyph}</text></g></Tip>; })}
    </svg>
  </div>;
}

export function Zodiac({ build, set }: { build: Build; set: (b: Build) => void }) {
  const { t, lang } = useT();
  const [route, setRoute] = useState(zodiac.routes[0]?.id ?? '');
  const r = zodiac.routes.find(x => x.id === route) ?? zodiac.routes[0];
  const total = totalZodiac(build);
  const perRoute = (id: string) => zodiacSpecs.filter(s => s.route.id === id).reduce((a, s) => a + activeIn(build, s), 0);
  const named = (build.zodiac ?? []).flatMap(id => { const s = zodiacSpecs.find(sp => id.startsWith(sp.id + '.')); const n = s?.nodes.find(x => x.id === id); return n ? n.effects.filter(e => e.startsWith('[')).map(e => e.match(/^\[(.+?)\]/)![1]) : []; });
  if (!r) return null;
  return <section className="panel">
    <div className="row between"><h2>{t('zTitle')} <small className="muted">{t('zPts', { n: total })}</small></h2>
      <div className="row"><a className="muted small" href={zodiac.sourceUrl} target="_blank" rel="noreferrer">{t('patchNotes')} ↗</a><button onClick={() => set({ ...build, zodiac: [] })}>{t('reset')}</button></div></div>
    <p className="muted small">{t('zHelp')}</p>
    <div className="rm-cats">{zodiac.routes.map(x => <button key={x.id} className={`rm-catbtn ${x.id === r.id ? 'on' : ''} ${perRoute(x.id) ? 'has' : ''}`} onClick={() => setRoute(x.id)}><span className="rm-ico">{ROUTE_ICON[x.id] ?? '✧'}</span>{x.name[lang]}<small className="muted">{x.focus === 'ANY' ? '' : x.focus}</small>{perRoute(x.id) > 0 && <b>{perRoute(x.id)}</b>}</button>)}</div>
    {named.length > 0 && <div className="zod-named">{[...new Set(named)].map(n => <span key={n} className="chip">{n}</span>)}</div>}
    <div className="zod-grid">{r.specs.map(s => <Constellation key={s.id} spec={s} build={build} set={set} />)}</div>
  </section>;
}
