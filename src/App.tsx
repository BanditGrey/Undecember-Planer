import { useCallback, useEffect, useRef, useState } from 'react';
import { Board } from './components/Board';
import { Equipment } from './components/Equipment';
import { RuneMaster } from './components/RuneMaster';
import { Items } from './components/Items';
import { Gallery } from './components/Gallery';
import { Compare } from './components/Compare';
import { Character } from './components/Character';
import { presetsBySeason } from './lib/presets';
import { renderBuildCard } from './lib/card';
import { Search } from './components/Search';
import { runes, runestones, uniques, runemaster, authority } from './data';
import { buildFromLocation, deleteBuild, saveBuild, savedBuilds, shareUrl } from './lib/share';
import { emptyBuild, type Build } from './types';
import { useT } from './lib/i18n';
import { Dps } from './components/Dps';

type Tab = 'board' | 'equip' | 'rm' | 'dps' | 'items' | 'builds' | 'gallery' | 'compare';

export default function App() {
  const [build, setBuildRaw] = useState<Build>(() => buildFromLocation() || emptyBuild());
  // Undo / redo history (Ctrl+Z / Ctrl+Y or Ctrl+Shift+Z)
  const hist = useRef<{ past: Build[]; future: Build[] }>({ past: [], future: [] });
  const setBuild = useCallback((next: Build | ((b: Build) => Build)) => { setBuildRaw(prev => { const n = typeof next === 'function' ? next(prev) : next; if (n === prev) return prev; hist.current.past = [...hist.current.past.slice(-49), prev]; hist.current.future = []; return n; }); }, []);
  const undo = useCallback(() => setBuildRaw(cur => { const p = hist.current.past.pop(); if (!p) return cur; hist.current.future.push(cur); return p; }), []);
  const redo = useCallback(() => setBuildRaw(cur => { const f = hist.current.future.pop(); if (!f) return cur; hist.current.past.push(cur); return f; }), []);
  useEffect(() => { const h = (e: KeyboardEvent) => { const tag = (e.target as HTMLElement)?.tagName; if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return; if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); setSearch(v => !v); } else if (e.key === 'Escape') { setSearch(false); } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') { e.preventDefault(); e.shiftKey ? redo() : undo(); } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') { e.preventDefault(); redo(); } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') { e.preventDefault(); save(); } else if (!e.ctrlKey && !e.metaKey && !e.altKey && /^[1-8]$/.test(e.key)) { const tabs: Tab[] = ['board', 'equip', 'rm', 'dps', 'items', 'builds', 'gallery', 'compare']; setTab(tabs[+e.key - 1]); } }; addEventListener('keydown', h); return () => removeEventListener('keydown', h); });
  const [tab, setTab] = useState<Tab>('board');
  const [saved, setSaved] = useState(savedBuilds);
  const [msg, setMsg] = useState('');
  const [search, setSearch] = useState(false);
  const [view, setView] = useState(() => /[?&#]view=1/.test(location.href));
  const [theme, setTheme] = useState<'dark' | 'light'>(() => (localStorage.getItem('theme') as any) || 'dark');
  useEffect(() => { document.documentElement.dataset.theme = theme; localStorage.setItem('theme', theme); }, [theme]);
  const { t, lang, setLang, showOriginal, setShowOriginal } = useT();
  useEffect(() => { history.replaceState(null, '', shareUrl(build)); }, [build]);
  useEffect(() => { const h = () => { const b = buildFromLocation(); if (b) setBuild(b); }; addEventListener('hashchange', h); return () => removeEventListener('hashchange', h); }, []);
  const flash = (m: string) => { setMsg(m); setTimeout(() => setMsg(''), 2500); };
  const share = async () => { await navigator.clipboard.writeText(shareUrl(build)); flash(t('copied')); };
  const shareView = async () => { await navigator.clipboard.writeText(shareUrl(build) + '&view=1'); flash(t('copied')); };
  const exportImg = async () => { flash('…'); const url = await renderBuildCard(build, { lang, url: shareUrl(build).slice(0, 60) + '…' }); const a = document.createElement('a'); a.href = url; a.download = `${(build.name || 'build').replace(/[^\w-]+/g, '_')}.png`; a.click(); flash(t('exported')); };
  const save = () => { saveBuild(build); setSaved(savedBuilds()); flash(t('saved')); };

  return (
    <div className={'app' + (view ? ' view' : '')}>
      {search && <Search onClose={() => setSearch(false)} />}
      {view && <div className="viewbar"><b>{build.name || 'Build'}</b> <span className="muted">{build.author ? `${t('by')} ${build.author} · ` : ''}{build.stat}</span><button className="primary" onClick={() => { setView(false); history.replaceState(null, '', shareUrl(build)); }}>{t('editBuild')}</button></div>}
      <header>
        <h1>UNDECEMBER <span>{t('appSub')}</span></h1>
        <div className="row">
          <input value={build.name} onChange={e => setBuild({ ...build, name: e.target.value })} placeholder={t('buildName')} />
          <input value={build.author} onChange={e => setBuild({ ...build, author: e.target.value })} placeholder={t('author')} />
          <select value={build.stat} onChange={e => setBuild({ ...build, stat: e.target.value as Build['stat'] })}>{['STR', 'DEX', 'INT', 'HYBRID'].map(s => <option key={s}>{s}</option>)}</select>
          <button className="primary" onClick={share}>{t('share')}</button>
          <button onClick={save}>{t('save')}</button>
          <button onClick={() => setBuild(emptyBuild())}>{t('newBuild')}</button>
          <button onClick={shareView} title={t('shareViewTip')}>{t('shareView')}</button><button onClick={exportImg} title={t('exportTip')}>🖼 PNG</button><button onClick={() => setSearch(true)} title="Ctrl+K">🔍</button><button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} title={t('theme')}>{theme === 'dark' ? '☀' : '☾'}</button><button onClick={undo} title="Ctrl+Z">↶</button><button onClick={redo} title="Ctrl+Y">↷</button>
          {msg && <span className="flash">{msg}</span>}
          <span className="lang"><button className={lang === 'pt' ? 'on' : ''} onClick={() => setLang('pt')}>PT</button><button className={lang === 'en' ? 'on' : ''} onClick={() => setLang('en')}>EN</button>{lang === 'pt' && <label className="muted orig" title={t('origTip')}><input type="checkbox" checked={showOriginal} onChange={e => setShowOriginal(e.target.checked)} /> {t('origText')}</label>}</span>
        </div>
        <nav>{([['board', t('tabBoard')], ['equip', t('tabEquip')], ['rm', t('tabRM')], ['dps', t('tabDps')], ['items', t('tabItems')], ['builds', t('tabBuilds')], ['gallery', t('tabGallery')], ['compare', t('tabCompare')]] as [Tab, string][]).map(([t, l]) => <button key={t} className={tab === t ? 'on' : ''} onClick={() => setTab(t)}>{l}</button>)}</nav>
      </header>
      <main>
        {(tab === 'board' || tab === 'equip' || tab === 'rm') && <Character build={build} set={setBuild} />}
        {tab === 'board' && <Board build={build} set={setBuild} />}
        {tab === 'equip' && <Equipment build={build} set={setBuild} />}
        {tab === 'rm' && <RuneMaster build={build} set={setBuild} />}
        {tab === 'dps' && <Dps build={build} />}
        {tab === 'items' && <Items />}
        {tab === 'compare' && <Compare build={build} />}
        {tab === 'gallery' && <Gallery build={build} open={b => { setBuild(b); setTab('board'); }} />}
        {tab === 'builds' && <section className="panel"><h2>{t('presetsTitle')} <small className="muted">{t('presetsHint')}</small></h2>
          {presetsBySeason().map(g => <div key={g.season.id} className="season"><h3>{g.season.name[lang]} {g.season.date && <small className="muted">{g.season.date}</small>}</h3>
            <div className="gallery">{g.presets.map(p => <div key={p.id} className="gcard"><div className="gh"><b>{p.name[lang]}</b> <span className="pill">{p.stat}</span>{p.tier && <span className={`pill tier-${p.tier}`}>Tier {p.tier}</span>}</div>
              <small className="muted">{p.desc[lang]}</small>
              {p.author && <small className="muted">{t('by')} {p.author}{p.source && <> · <a href={p.source} target="_blank" rel="noreferrer">{t('source')}</a></>}</small>}
              <div className="row"><button className="primary" onClick={() => { setBuild(p.make()); setTab('board'); }}>{t('open')}</button></div></div>)}</div></div>)}
          <p className="muted"><small>{t('presetsDisclaimer')}</small></p>
        </section>}
        {tab === 'builds' && <section className="panel"><h2>{t('savedTitle')}</h2>
          {saved.length === 0 && <p className="muted">{t('savedEmpty')}</p>}
          {saved.map(b => <div key={b.name} className="saved"><b>{b.name}</b> <small className="muted">{b.author} · {b.stat} · {Object.keys(b.board).length} {t('cells')}</small>
            <button onClick={() => { setBuild(b); setTab('board'); }}>{t('open')}</button><button className="danger" onClick={() => { deleteBuild(b.name); setSaved(savedBuilds()); }}>{t('del')}</button></div>)}
        </section>}
        <section className="panel"><h3>{t('notes')}</h3><textarea rows={3} value={build.notes} onChange={e => setBuild({ ...build, notes: e.target.value })} placeholder={t('notesPh')} /></section>
      </main>
      <footer className="muted">{t('footer', { runes: runes.length, runestones: runestones.length, uniques: uniques.length, rm: runemaster.length, auth: authority.length })} <a href="https://undecember.thein.ru/en/" target="_blank" rel="noreferrer">undecember.thein.ru</a> {t('footer2')} · {t('shortcuts')}</footer>
    </div>
  );
}
