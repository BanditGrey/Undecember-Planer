import { useEffect, useState } from 'react';
import { runeBySlug } from '../data';
import { fetchGallery, publishUrl, REPO, type GalleryEntry } from '../lib/gallery';
import { useT } from '../lib/i18n';
import { runeColor } from '../lib/rules';
import type { Build } from '../types';

export function Gallery({ build, open }: { build: Build; open: (b: Build) => void }) {
  const { t } = useT();
  const [list, setList] = useState<GalleryEntry[] | null>(null); const [err, setErr] = useState('');
  const [q, setQ] = useState(''); const [stat, setStat] = useState('');
  const load = () => { setErr(''); setList(null); fetchGallery().then(setList).catch(e => { setErr(String(e)); setList([]); }); };
  useEffect(load, []);
  const rows = (list ?? []).filter(e => (!stat || e.build.stat === stat) && (!q || (e.title + e.author + e.body).toLowerCase().includes(q.toLowerCase())));
  const appUrl = `${location.origin}${location.pathname}`;
  return <section className="panel">
    <div className="row between"><h2>{t('galleryTitle')} <small className="muted">{t('galleryHint')}</small></h2>
      <a className="btn primary" href={publishUrl(build, appUrl)} target="_blank" rel="noreferrer">{t('publish')}</a></div>
    <div className="row"><input placeholder={t('search')} value={q} onChange={e => setQ(e.target.value)} />
      <select value={stat} onChange={e => setStat(e.target.value)}><option value="">{t('allStats')}</option>{['STR', 'DEX', 'INT', 'HYBRID'].map(s => <option key={s}>{s}</option>)}</select>
      <button onClick={load}>↻</button></div>
    {list === null && <p className="muted">{t('loading')}</p>}
    {err && <p className="bad">{t('galleryErr')} ({err})</p>}
    {list && list.length === 0 && !err && <p className="muted">{t('galleryEmpty')}</p>}
    <div className="gallery">{rows.map(e => {
      const skills = Object.values(e.build.board).map(c => c.rune && runeBySlug.get(c.rune)).filter(r => r && r.type === 'Skill').slice(0, 6) as NonNullable<ReturnType<typeof runeBySlug.get>>[];
      return <div key={e.id} className="gcard">
        <div className="gh"><b>{e.title}</b> <span className="pill">{e.build.stat}</span></div>
        <div className="gicons">{skills.map(r => <img key={r.slug} src={r.icons[0]} title={r.name} alt="" style={{ borderColor: runeColor(r) }} />)}</div>
        <small className="muted">{e.avatar && <img className="avatar" src={e.avatar} alt="" />} {e.author} · {new Date(e.createdAt).toLocaleDateString()} · 👍 {e.reactions} · 💬 {e.comments}</small>
        <div className="row"><button onClick={() => open(e.build)}>{t('open')}</button><a className="btn" href={e.url} target="_blank" rel="noreferrer">GitHub</a></div>
      </div>; })}</div>
    <p className="muted small">{t('galleryFoot')} <a href={`https://github.com/${REPO}/issues?q=label%3Abuild`} target="_blank" rel="noreferrer">github.com/{REPO}</a></p>
  </section>;
}
