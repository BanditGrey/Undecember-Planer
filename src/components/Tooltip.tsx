import { useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import type { Rune, Runestone, Unique, Authority } from '../types';
import { ELEMENT_COLORS, runeColor } from '../lib/rules';
import { BASE_MAX_LEVEL, statsAtLevel } from '../lib/level';
import { useT } from '../lib/i18n';

/** Wraps children; shows an in-game-style tooltip on hover (positioned to stay on screen). */
export function Tip({ content, children, className }: { content: ReactNode; children: ReactNode; className?: string }) {
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => { if (!pos || !ref.current) return; const el = ref.current; const r = el.getBoundingClientRect();
    let x = pos.x, y = pos.y; if (x + r.width > innerWidth - 8) x = pos.x - r.width - 24; if (y + r.height > innerHeight - 8) y = Math.max(8, innerHeight - r.height - 8);
    el.style.left = x + 'px'; el.style.top = y + 'px'; el.style.visibility = 'visible'; });
  return <div className={className} style={{ display: 'contents' }} onMouseEnter={e => setPos({ x: e.clientX + 16, y: e.clientY + 12 })} onMouseMove={e => setPos({ x: e.clientX + 16, y: e.clientY + 12 })} onMouseLeave={() => setPos(null)}>
    {children}
    {pos && <div ref={ref} className="ud-tip" style={{ visibility: 'hidden' }}>{content}</div>}
  </div>;
}

const Tags = ({ tags }: { tags: string[] }) => { const { g } = useT(); return <div className="ud-tags">{tags.map(t => <span key={t} style={{ color: ELEMENT_COLORS[t] || '#d9d9e3' }}>#{g(t)}</span>)}</div>; };
const Lines = ({ lines, cls }: { lines: string[]; cls?: string }) => { const { g } = useT(); return <>{lines.map((l, i) => <div key={i} className={cls}>{g(l)}</div>)}</>; };

export function RuneTip({ r, level = BASE_MAX_LEVEL, bonus = 0 }: { r: Rune; level?: number; bonus?: number }) {
  const eff = level + bonus; const { lines: stats, estimated } = statsAtLevel(r.level1, r.level45, eff); const c = runeColor(r); const { t, g, gd } = useT();
  return <div className="ud-card">
    <div className="ud-head" style={{ borderColor: c }}><img src={r.icons[0]} alt="" /><div><div className="ud-name" style={{ color: c }}>{r.name}</div><div className="ud-sub">{r.type === 'Skill' ? 'Skill Rune' : 'Link Rune'}{r.rarity ? ` · ${r.rarity}` : ''}</div></div></div>
    <Tags tags={r.tags} />
    {r.description && <p className="ud-desc">{gd(r.slug, r.description)}</p>}
    {r.linkRules.length > 0 && <div className="ud-sec"><Lines lines={r.linkRules} cls="ud-rule" /></div>}
    {stats.length > 0 && <div className="ud-sec"><div className="ud-sec-t">Rune Level {level}{bonus ? ` (+${bonus})` : ''}{estimated && <span className="ud-est" title={t('tipEst')}> ≈</span>}</div><Lines lines={stats} cls="ud-stat" /></div>}
    {r.gradeBonuses.length > 0 && <div className="ud-sec"><div className="ud-sec-t">Rune Grade</div>{r.gradeBonuses.map((g, i) => <div key={i} className="ud-grade"><b>{['Magic', 'Rare', 'Legendary'][i] ?? `+${i + 1}`}</b><Lines lines={g} /></div>)}</div>}
    {Object.keys(r.awakening).length > 0 && <div className="ud-sec"><div className="ud-sec-t">Awakening</div>{Object.entries(r.awakening).map(([k, v]) => <div key={k} className="ud-grade"><b className="ud-aw">{k}</b><Lines lines={v} /></div>)}</div>}
    {r.weapons.length > 0 && <div className="ud-foot">{t('weapon')}: {r.weapons.map(g).join(', ')}</div>}
    {(r.howToGet.length > 0 || r.acts.length > 0) && <div className="ud-foot">{t('source')}: <span className="ud-src">{r.howToGet.join(' ')}</span> {r.acts.join(' ')}</div>}
    {stats.length === 0 && <div className="ud-foot ud-missing">{t('tipMissing')}</div>}
  </div>;
}

export function RunestoneTip({ s }: { s: Runestone }) {
  const c = { Magic: '#4a90e2', Rare: '#e6c93f', Unique: '#e2562f' }[s.rarity];
  return <div className="ud-card"><div className="ud-head" style={{ borderColor: c }}><img src={s.icon} alt="" /><div><div className="ud-name" style={{ color: c }}>{s.name}</div><div className="ud-sub">Runestone · {s.rarity}</div></div></div>
    {s.effect.length > 0 && <div className="ud-sec"><Lines lines={s.effect} cls="ud-stat" /></div>}</div>;
}

export function UniqueTip({ u }: { u: Unique }) {
  return <div className="ud-card"><div className="ud-head" style={{ borderColor: '#e2562f' }}><img src={u.icon} alt="" /><div><div className="ud-name" style={{ color: '#e2562f' }}>{u.name}</div><div className="ud-sub">Unique {u.type} · Tier {u.tier}</div></div></div>
    {u.requires.length > 0 && <div className="ud-foot">{u.requires.map(useT().g).join(' · ')}</div>}
    {u.baseStats.length > 0 && <div className="ud-sec"><Lines lines={u.baseStats} /></div>}
    {u.affixes.length > 0 && <div className="ud-sec"><Lines lines={u.affixes} cls="ud-stat" /></div>}
    </div>;
}

export function AuthorityTip({ a }: { a: Authority }) {
  return <div className="ud-card"><div className="ud-head" style={{ borderColor: '#c9a24a' }}><div><div className="ud-name" style={{ color: '#c9a24a' }}>⚜ {a.name}</div><div className="ud-sub">Authority of the Gods · {a.slot}</div></div></div>
    {a.unique.length > 0 && <div className="ud-sec"><div className="ud-sec-t">Unique Option</div><Lines lines={a.unique} cls="ud-stat" /></div>}
    {a.prefix.length > 0 && <div className="ud-sec"><div className="ud-sec-t">Prefix Options</div><Lines lines={a.prefix} /></div>}
    {a.suffix.length > 0 && <div className="ud-sec"><div className="ud-sec-t">Suffix Options</div><Lines lines={a.suffix} /></div>}
    </div>;
}
