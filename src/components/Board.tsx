import { useState } from 'react';
import { runes, runestones, runeBySlug, runestoneBySlug, tags } from '../data';
import { analyzeBoard, cells, CENTER, COLOR_HEX, dirAngle, hexPos, runeColor, triggerSpec, DIRS, step } from '../lib/rules';
import type { SlotColor } from '../types';
const SLOT_CYCLE: (SlotColor | null | undefined)[] = [undefined, 'R', 'G', 'B', 'W', null];
import type { Build } from '../types';
import { Picker } from './Picker';
import { RuneTip, RunestoneTip, Tip } from './Tooltip';
import { useT } from '../lib/i18n';

const HEX = 44; // px, hex "size" (center to corner)

export function Board({ build, set }: { build: Build; set: (b: Build) => void }) {
  const [pick, setPick] = useState<{ cell: string; kind: 'rune' | 'runestone' } | null>(null);
  const { t, g: tr, gd } = useT();
  const level = build.runeLevel ?? 45; const bonus = build.runeLevelBonus ?? 0;
  const setLevel = (v: number) => set({ ...build, runeLevel: v }); const setBonus = (v: number) => set({ ...build, runeLevelBonus: v });
  const { groups, orphans, triggers } = analyzeBoard(build);
  const trigByCell = new Map(triggers.map(x => [x.cell, x]));
  const badCells = new Set(groups.flatMap(g => g.links.filter(l => !l.check.ok).map(l => l.cell)));
  const orphanCells = new Set(orphans.map(o => o.cell));
  const linkedCells = new Set(groups.flatMap(g => g.links.filter(l => l.check.ok).map(l => l.cell)));

  const cycleSlot = (cell: string, d: number) => {
    const cur = [...(build.board[cell]?.slots ?? [])]; while (cur.length < 6) cur.push(undefined as any);
    cur[d] = SLOT_CYCLE[(SLOT_CYCLE.indexOf(cur[d]) + 1) % SLOT_CYCLE.length] as any;
    const slots = cur.every(x => x === undefined) ? undefined : cur.map(x => x === undefined ? undefined : x);
    update(cell, { slots });
  };
  const autoSlots = () => {
    const board = { ...build.board };
    for (const g of groups) { const slots: (SlotColor | null | undefined)[] = [...(board[g.cell].slots ?? [])]; while (slots.length < 6) slots.push(undefined);
      for (const l of g.links) if (l.rune.color) slots[l.dir] = l.rune.color; board[g.cell] = { ...board[g.cell], slots: slots as any }; }
    set({ ...build, board });
  };
  const update = (cell: string, patch: Partial<{ rune?: string; runestone?: string; dir?: number; slots?: (SlotColor | null | undefined)[] }>) => {
    const board = { ...build.board, [cell]: { ...build.board[cell], ...patch } };
    if (!board[cell].rune && !board[cell].runestone) delete board[cell];
    else { if (board[cell].dir === undefined || board[cell].dir === 0) delete board[cell].dir; if (!board[cell].slots) delete board[cell].slots; }
    set({ ...build, board });
  };
  const W = HEX * Math.sqrt(3) * 7 + 8, H = HEX * 1.5 * 6 + HEX * 2 + 8;

  return (
    <section className="panel">
      <div className="row between"><h2>Rune Cast <small className="muted">{t('boardHint')}</small></h2>
        <label className="muted" title={t('runeLevelTip')}>{t('runeLevel')} <input type="number" min={1} max={50} value={level} onChange={e => setLevel(Math.min(50, Math.max(1, +e.target.value || 1)))} style={{ width: 60 }} />
          <button onClick={autoSlots} title={t('slotHint')} style={{ marginLeft: 8 }}>{t('autoSlots')}</button><span title={t('bonusTip')}> {t('bonus')} +<input type="number" min={0} max={20} value={bonus} onChange={e => setBonus(Math.max(0, +e.target.value || 0))} style={{ width: 50 }} /></span></label></div>
      <div className="hexwrap"><div className="hexboard" style={{ width: W, height: H }}>
        <svg className="hexlinks" width={W} height={H}>
          {groups.flatMap(g => g.links.map(l => { const a = hexPos(g.cell), b = hexPos(l.cell); return <line key={g.cell + l.cell} x1={a.x * HEX + W / 2} y1={a.y * HEX + H / 2} x2={b.x * HEX + W / 2} y2={b.y * HEX + H / 2} stroke={l.check.ok ? '#c9a24a' : '#e05252'} strokeWidth={3} opacity={.8} />; }))}
          {triggers.flatMap(x => { const a = hexPos(x.cell); const ends = [x.target && { ...x.target, k: 't' }, x.activation && { ...x.activation, k: 'a' }].filter(Boolean) as { cell: string; ok: boolean; k: string }[];
            return ends.map(e => { const b = hexPos(e.cell); return <line key={x.cell + e.k} x1={a.x * HEX + W / 2} y1={a.y * HEX + H / 2} x2={b.x * HEX + W / 2} y2={b.y * HEX + H / 2} stroke={e.ok ? '#7bd1e6' : '#e05252'} strokeWidth={3} strokeDasharray={e.k === 'a' ? '6 4' : undefined} opacity={.85} />; }); })}
        </svg>
        {cells.map(k => {
          const p = hexPos(k); const c = build.board[k] || {};
          const r = c.rune ? runeBySlug.get(c.rune) : undefined; const s = c.runestone ? runestoneBySlug.get(c.runestone) : undefined;
          const tg = trigByCell.get(k); const isTrig = !!(r && triggerSpec(r));
          const cls = ['hex', r?.type === 'Skill' && 'skill', r?.type === 'Link' && 'link', isTrig && 'trigger', tg && (tg.ok ? 'linked' : 'bad'), badCells.has(k) && 'bad', orphanCells.has(k) && 'orphan', linkedCells.has(k) && 'linked', k === CENTER && 'center'].filter(Boolean).join(' ');
          const style: React.CSSProperties = { left: p.x * HEX + W / 2 - HEX * 0.866, top: p.y * HEX + H / 2 - HEX, width: HEX * 1.732, height: HEX * 2, ['--c' as string]: r ? runeColor(r) : '#3a3d4a', ['--rc' as string]: r?.color ? COLOR_HEX[r.color] : 'transparent' };
          const inner = <div className={cls} style={style} onClick={() => setPick({ cell: k, kind: 'rune' })} onContextMenu={e => { e.preventDefault(); setPick({ cell: k, kind: 'runestone' }); }}>
            <div className="hex-in">{r ? <img src={r.icons[0]} alt={r.name} /> : k === CENTER ? <span className="ba">⚔</span> : <span className="lock">🔒</span>}
              {s && <img className="stone" src={s.icon} alt={s.name} />}
              {r?.type === 'Skill' && DIRS.map((_, d) => { const sc = c.slots?.[d]; const ang = dirAngle(d) * Math.PI / 180; const has = !!step(k, d);
                return has ? <button key={d} className={'slot' + (sc === null ? ' closed' : sc ? '' : ' unset')} title={t('slots') + ' ' + (d + 1)} style={{ left: `calc(50% + ${Math.cos(ang) * 40}% - 5px)`, top: `calc(50% + ${Math.sin(ang) * 40}% - 5px)`, background: sc ? COLOR_HEX[sc] : undefined }} onClick={e => { e.stopPropagation(); cycleSlot(k, d); }} /> : null; })}
              {isTrig && <span className="arrow" style={{ transform: `rotate(${dirAngle(c.dir ?? 0)}deg)` }}>➜</span>}
              {isTrig && <button className="rot" title={t('rotate')} onClick={e => { e.stopPropagation(); update(k, { dir: ((c.dir ?? 0) + 1) % 6 }); }}>↻</button>}</div></div>;
          return r ? <Tip key={k} content={<><RuneTip r={r} level={level} bonus={bonus} />{s && <RunestoneTip s={s} />}</>}>{inner}</Tip> : <div key={k} style={{ display: 'contents' }}>{inner}</div>;
        })}
      </div></div>
      <div className="groups">
        {groups.map(g => <div key={g.cell} className="group">
          <div className="gh"><Tip content={<RuneTip r={g.skill} level={level} bonus={bonus} />}><img src={g.skill.icons[0]} alt="" /></Tip><b style={{ color: runeColor(g.skill) }}>{g.skill.name}</b> <span className="tags">{g.skill.tags.map(x => <i key={x}>#{tr(x)}</i>)}</span>
            {g.runestone && <em className="muted"> · {runestoneBySlug.get(g.runestone)?.name}</em>}</div>
          {g.skill.description && <p className="muted desc">{gd(g.skill.slug, g.skill.description)}</p>}
          {g.links.length === 0 && <p className="muted">{t('noLinks')}</p>}
          {g.links.map(l => <div key={l.cell} className={l.check.ok ? 'ok' : 'bad'}><Tip content={<RuneTip r={l.rune} level={level} bonus={bonus} />}><img src={l.rune.icons[0]} alt="" /></Tip> {l.rune.color && <i className="dot" style={{ background: COLOR_HEX[l.rune.color] }} />}{l.rune.name} — <small>{l.check.key ? t(l.check.key, { tags: l.check.tags ?? '' }) : tr(l.check.reason)}</small></div>)}
        </div>)}
        {triggers.map(x => <div key={x.cell} className={'group ' + (x.ok ? 'trig-ok' : 'trig-bad')}>
          <div className="gh"><Tip content={<RuneTip r={x.rune} level={level} bonus={bonus} />}><img src={x.rune.icons[0]} alt="" /></Tip><b style={{ color: '#7bd1e6' }}>{x.rune.name}</b> <span className="tags"><i>#Trigger</i></span></div>
          <div className={x.target?.ok ? 'ok' : 'bad'}>➜ {t('trigTarget')} ({x.spec.target.map(tr).join(', ')}): {x.target ? <>{x.target.rune.name}{!x.target.ok && <small> — {t('trigMismatch')}</small>}</> : <small>{t('trigNone')}</small>}</div>
          {x.spec.activation.length > 0 && <div className={x.activation?.ok ? 'ok' : 'bad'}>⇠ {t('trigActivation')} ({x.spec.activation.map(tr).join(', ')}): {x.activation ? <>{x.activation.rune.name}{!x.activation.ok && <small> — {t('trigMismatch')}</small>}</> : <small>{t('trigNone')}</small>}</div>}
          <p className="muted desc">{gd(x.rune.slug, x.rune.description)}</p>
        </div>)}
        {orphans.length > 0 && <div className="group warn"><b>{t('orphans')}</b> {orphans.map(o => o.rune.name).join(', ')}</div>}
        {groups.length === 0 && <p className="muted">{t('boardEmpty')}</p>}
      </div>
      {pick && pick.kind === 'rune' && <Picker title={t('pickRune')} allowClear onClose={() => setPick(null)}
        items={runes.map(r => ({ slug: r.slug, name: r.name, icon: r.icons[0], sub: r.type === 'Skill' ? 'Skill Rune' : triggerSpec(r) ? 'Trigger Rune' : 'Link Rune', tags: r.tags, tip: <RuneTip r={r} level={level} bonus={bonus} /> }))}
        filters={[{ label: t('type'), options: ['Skill Rune', 'Link Rune', 'Trigger Rune'], match: (i, v) => i.sub === v }, { label: t('color'), options: ['Red', 'Green', 'Blue'], match: (i, v) => runeBySlug.get(i.slug)?.color === v[0] }, { label: t('tag'), options: tags, match: (i, v) => !!i.tags?.includes(v) }]}
        onPick={s => { update(pick.cell, { rune: s ?? undefined }); setPick(null); }} />}
      {pick && pick.kind === 'runestone' && <Picker title={t('pickStone')} allowClear onClose={() => setPick(null)}
        items={runestones.map(r => ({ slug: r.slug, name: r.name, icon: r.icon, sub: r.rarity, tip: <RunestoneTip s={r} /> }))}
        filters={[{ label: t('rarity'), options: ['Magic', 'Rare', 'Unique'], match: (i, v) => i.sub === v }]}
        onPick={s => { update(pick.cell, { runestone: s ?? undefined }); setPick(null); }} />}
    </section>
  );
}
