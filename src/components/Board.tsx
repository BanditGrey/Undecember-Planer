import { useState } from 'react';
import { runes, runestones, runeBySlug, runestoneBySlug, tags } from '../data';
import { analyzeBoard, cells, CENTER, hexPos, runeColor } from '../lib/rules';
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
  const { groups, orphans } = analyzeBoard(build);
  const badCells = new Set(groups.flatMap(g => g.links.filter(l => !l.check.ok).map(l => l.cell)));
  const orphanCells = new Set(orphans.map(o => o.cell));
  const linkedCells = new Set(groups.flatMap(g => g.links.filter(l => l.check.ok).map(l => l.cell)));

  const update = (cell: string, patch: Partial<{ rune?: string; runestone?: string }>) => {
    const board = { ...build.board, [cell]: { ...build.board[cell], ...patch } };
    if (!board[cell].rune && !board[cell].runestone) delete board[cell];
    set({ ...build, board });
  };
  const W = HEX * Math.sqrt(3) * 7 + 8, H = HEX * 1.5 * 6 + HEX * 2 + 8;

  return (
    <section className="panel">
      <div className="row between"><h2>Rune Cast <small className="muted">{t('boardHint')}</small></h2>
        <label className="muted" title={t('runeLevelTip')}>{t('runeLevel')} <input type="number" min={1} max={50} value={level} onChange={e => setLevel(Math.min(50, Math.max(1, +e.target.value || 1)))} style={{ width: 60 }} />
          <span title={t('bonusTip')}> {t('bonus')} +<input type="number" min={0} max={20} value={bonus} onChange={e => setBonus(Math.max(0, +e.target.value || 0))} style={{ width: 50 }} /></span></label></div>
      <div className="hexwrap"><div className="hexboard" style={{ width: W, height: H }}>
        <svg className="hexlinks" width={W} height={H}>
          {groups.flatMap(g => g.links.map(l => { const a = hexPos(g.cell), b = hexPos(l.cell); return <line key={g.cell + l.cell} x1={a.x * HEX + W / 2} y1={a.y * HEX + H / 2} x2={b.x * HEX + W / 2} y2={b.y * HEX + H / 2} stroke={l.check.ok ? '#c9a24a' : '#e05252'} strokeWidth={3} opacity={.8} />; }))}
        </svg>
        {cells.map(k => {
          const p = hexPos(k); const c = build.board[k] || {};
          const r = c.rune ? runeBySlug.get(c.rune) : undefined; const s = c.runestone ? runestoneBySlug.get(c.runestone) : undefined;
          const cls = ['hex', r?.type === 'Skill' && 'skill', r?.type === 'Link' && 'link', badCells.has(k) && 'bad', orphanCells.has(k) && 'orphan', linkedCells.has(k) && 'linked', k === CENTER && 'center'].filter(Boolean).join(' ');
          const style: React.CSSProperties = { left: p.x * HEX + W / 2 - HEX * 0.866, top: p.y * HEX + H / 2 - HEX, width: HEX * 1.732, height: HEX * 2, ['--c' as string]: r ? runeColor(r) : '#3a3d4a' };
          const inner = <div className={cls} style={style} onClick={() => setPick({ cell: k, kind: 'rune' })} onContextMenu={e => { e.preventDefault(); setPick({ cell: k, kind: 'runestone' }); }}>
            <div className="hex-in">{r ? <img src={r.icons[0]} alt={r.name} /> : k === CENTER ? <span className="ba">⚔</span> : <span className="lock">🔒</span>}
              {s && <img className="stone" src={s.icon} alt={s.name} />}</div></div>;
          return r ? <Tip key={k} content={<><RuneTip r={r} level={level} bonus={bonus} />{s && <RunestoneTip s={s} />}</>}>{inner}</Tip> : <div key={k} style={{ display: 'contents' }}>{inner}</div>;
        })}
      </div></div>
      <div className="groups">
        {groups.map(g => <div key={g.cell} className="group">
          <div className="gh"><Tip content={<RuneTip r={g.skill} level={level} bonus={bonus} />}><img src={g.skill.icons[0]} alt="" /></Tip><b style={{ color: runeColor(g.skill) }}>{g.skill.name}</b> <span className="tags">{g.skill.tags.map(x => <i key={x}>#{tr(x)}</i>)}</span>
            {g.runestone && <em className="muted"> · {runestoneBySlug.get(g.runestone)?.name}</em>}</div>
          {g.skill.description && <p className="muted desc">{gd(g.skill.slug, g.skill.description)}</p>}
          {g.links.length === 0 && <p className="muted">{t('noLinks')}</p>}
          {g.links.map(l => <div key={l.cell} className={l.check.ok ? 'ok' : 'bad'}><Tip content={<RuneTip r={l.rune} level={level} bonus={bonus} />}><img src={l.rune.icons[0]} alt="" /></Tip> {l.rune.name} — <small>{l.check.key ? t(l.check.key, { tags: l.check.tags ?? '' }) : tr(l.check.reason)}</small></div>)}
        </div>)}
        {orphans.length > 0 && <div className="group warn"><b>{t('orphans')}</b> {orphans.map(o => o.rune.name).join(', ')}</div>}
        {groups.length === 0 && <p className="muted">{t('boardEmpty')}</p>}
      </div>
      {pick && pick.kind === 'rune' && <Picker title={t('pickRune')} allowClear onClose={() => setPick(null)}
        items={runes.map(r => ({ slug: r.slug, name: r.name, icon: r.icons[0], sub: r.type === 'Skill' ? 'Skill Rune' : 'Link Rune', tags: r.tags, tip: <RuneTip r={r} level={level} bonus={bonus} /> }))}
        filters={[{ label: t('type'), options: ['Skill Rune', 'Link Rune'], match: (i, v) => i.sub === v }, { label: t('tag'), options: tags, match: (i, v) => !!i.tags?.includes(v) }]}
        onPick={s => { update(pick.cell, { rune: s ?? undefined }); setPick(null); }} />}
      {pick && pick.kind === 'runestone' && <Picker title={t('pickStone')} allowClear onClose={() => setPick(null)}
        items={runestones.map(r => ({ slug: r.slug, name: r.name, icon: r.icon, sub: r.rarity, tip: <RunestoneTip s={r} /> }))}
        filters={[{ label: t('rarity'), options: ['Magic', 'Rare', 'Unique'], match: (i, v) => i.sub === v }]}
        onPick={s => { update(pick.cell, { runestone: s ?? undefined }); setPick(null); }} />}
    </section>
  );
}
