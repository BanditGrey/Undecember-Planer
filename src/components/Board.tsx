import { useState } from 'react';
import { runes, runestones, runeBySlug, runestoneBySlug, tags } from '../data';
import { analyzeBoard, key } from '../lib/rules';
import { BOARD_SIZE, CENTER, type Build } from '../types';
import { Picker } from './Picker';

export function Board({ build, set }: { build: Build; set: (b: Build) => void }) {
  const [pick, setPick] = useState<{ cell: string; kind: 'rune' | 'runestone' } | null>(null);
  const { groups, orphans } = analyzeBoard(build);
  const badCells = new Set(groups.flatMap(g => g.links.filter(l => !l.check.ok).map(l => l.cell)));
  const orphanCells = new Set(orphans.map(o => o.cell));

  const update = (cell: string, patch: Partial<{ rune?: string; runestone?: string }>) => {
    const board = { ...build.board, [cell]: { ...build.board[cell], ...patch } };
    if (!board[cell].rune && !board[cell].runestone) delete board[cell];
    set({ ...build, board });
  };

  return (
    <section className="panel">
      <h2>Rune Cast <small className="muted">clique esquerdo: runa · clique direito: runestone · centro = Ataque Básico</small></h2>
      <div className="board" style={{ gridTemplateColumns: `repeat(${BOARD_SIZE}, 1fr)` }}>
        {Array.from({ length: BOARD_SIZE * BOARD_SIZE }, (_, i) => {
          const k = key(Math.floor(i / BOARD_SIZE), i % BOARD_SIZE); const c = build.board[k] || {};
          const r = c.rune ? runeBySlug.get(c.rune) : undefined; const s = c.runestone ? runestoneBySlug.get(c.runestone) : undefined;
          const cls = ['cell', r?.type === 'Skill' && 'skill', r?.type === 'Link' && 'link', badCells.has(k) && 'bad', orphanCells.has(k) && 'orphan', k === CENTER && 'center'].filter(Boolean).join(' ');
          return <div key={k} className={cls} title={r ? `${r.name} [${r.tags.join(', ')}]` : ''}
            onClick={() => setPick({ cell: k, kind: 'rune' })} onContextMenu={e => { e.preventDefault(); setPick({ cell: k, kind: 'runestone' }); }}>
            {r && <img src={r.icons[0]} alt={r.name} />}
            {s && <img className="stone" src={s.icon} alt={s.name} title={s.name} />}
            {!r && k === CENTER && <span className="muted">BA</span>}
          </div>;
        })}
      </div>
      <div className="groups">
        {groups.map(g => <div key={g.cell} className="group">
          <div className="gh"><img src={g.skill.icons[0]} alt="" /><b>{g.skill.name}</b> <span className="tags">{g.skill.tags.map(t => <i key={t}>{t}</i>)}</span>
            {g.runestone && <em className="muted"> · {runestoneBySlug.get(g.runestone)?.name}</em>}</div>
          {g.links.length === 0 && <p className="muted">Nenhuma link rune adjacente.</p>}
          {g.links.map(l => <div key={l.cell} className={l.check.ok ? 'ok' : 'bad'}><img src={l.rune.icons[0]} alt="" /> {l.rune.name} — <small>{l.check.reason}</small></div>)}
        </div>)}
        {orphans.length > 0 && <div className="group warn"><b>Link runes sem skill adjacente:</b> {orphans.map(o => o.rune.name).join(', ')}</div>}
        {groups.length === 0 && <p className="muted">Adicione skill runes ao tabuleiro. Link runes ortogonalmente adjacentes são vinculadas à skill.</p>}
      </div>
      {pick && pick.kind === 'rune' && <Picker title={`Runa em ${pick.cell}`} allowClear onClose={() => setPick(null)}
        items={runes.map(r => ({ slug: r.slug, name: r.name, icon: r.icons[0], sub: r.type, tags: r.tags }))}
        filters={[{ label: 'Tipo', options: ['Skill', 'Link'], match: (i, v) => i.sub === v }, { label: 'Tag', options: tags, match: (i, v) => !!i.tags?.includes(v) }]}
        onPick={s => { update(pick.cell, { rune: s ?? undefined }); setPick(null); }} />}
      {pick && pick.kind === 'runestone' && <Picker title={`Runestone em ${pick.cell}`} allowClear onClose={() => setPick(null)}
        items={runestones.map(r => ({ slug: r.slug, name: r.name, icon: r.icon, sub: r.rarity }))}
        filters={[{ label: 'Raridade', options: ['Magic', 'Rare', 'Unique'], match: (i, v) => i.sub === v }]}
        onPick={s => { update(pick.cell, { runestone: s ?? undefined }); setPick(null); }} />}
    </section>
  );
}
