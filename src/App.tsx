import { useEffect, useState } from 'react';
import { Board } from './components/Board';
import { Equipment } from './components/Equipment';
import { RuneMaster } from './components/RuneMaster';
import { Items } from './components/Items';
import { runes, runestones, uniques, runemaster, authority } from './data';
import { buildFromLocation, deleteBuild, saveBuild, savedBuilds, shareUrl } from './lib/share';
import { emptyBuild, type Build } from './types';
import { useT } from './lib/i18n';
import { Dps } from './components/Dps';

type Tab = 'board' | 'equip' | 'rm' | 'dps' | 'items' | 'builds';

export default function App() {
  const [build, setBuild] = useState<Build>(() => buildFromLocation() || emptyBuild());
  const [tab, setTab] = useState<Tab>('board');
  const [saved, setSaved] = useState(savedBuilds);
  const [msg, setMsg] = useState('');
  const { t, lang, setLang, showOriginal, setShowOriginal } = useT();
  useEffect(() => { history.replaceState(null, '', shareUrl(build)); }, [build]);
  useEffect(() => { const h = () => { const b = buildFromLocation(); if (b) setBuild(b); }; addEventListener('hashchange', h); return () => removeEventListener('hashchange', h); }, []);
  const flash = (m: string) => { setMsg(m); setTimeout(() => setMsg(''), 2500); };
  const share = async () => { await navigator.clipboard.writeText(shareUrl(build)); flash(t('copied')); };
  const save = () => { saveBuild(build); setSaved(savedBuilds()); flash(t('saved')); };

  return (
    <div className="app">
      <header>
        <h1>UNDECEMBER <span>{t('appSub')}</span></h1>
        <div className="row">
          <input value={build.name} onChange={e => setBuild({ ...build, name: e.target.value })} placeholder={t('buildName')} />
          <input value={build.author} onChange={e => setBuild({ ...build, author: e.target.value })} placeholder={t('author')} />
          <select value={build.stat} onChange={e => setBuild({ ...build, stat: e.target.value as Build['stat'] })}>{['STR', 'DEX', 'INT', 'HYBRID'].map(s => <option key={s}>{s}</option>)}</select>
          <button className="primary" onClick={share}>{t('share')}</button>
          <button onClick={save}>{t('save')}</button>
          <button onClick={() => setBuild(emptyBuild())}>{t('newBuild')}</button>
          {msg && <span className="flash">{msg}</span>}
          <span className="lang"><button className={lang === 'pt' ? 'on' : ''} onClick={() => setLang('pt')}>PT</button><button className={lang === 'en' ? 'on' : ''} onClick={() => setLang('en')}>EN</button>{lang === 'pt' && <label className="muted orig" title={t('origTip')}><input type="checkbox" checked={showOriginal} onChange={e => setShowOriginal(e.target.checked)} /> {t('origText')}</label>}</span>
        </div>
        <nav>{([['board', t('tabBoard')], ['equip', t('tabEquip')], ['rm', t('tabRM')], ['dps', t('tabDps')], ['items', t('tabItems')], ['builds', t('tabBuilds')]] as [Tab, string][]).map(([t, l]) => <button key={t} className={tab === t ? 'on' : ''} onClick={() => setTab(t)}>{l}</button>)}</nav>
      </header>
      <main>
        {tab === 'board' && <Board build={build} set={setBuild} />}
        {tab === 'equip' && <Equipment build={build} set={setBuild} />}
        {tab === 'rm' && <RuneMaster build={build} set={setBuild} />}
        {tab === 'dps' && <Dps build={build} />}
        {tab === 'items' && <Items />}
        {tab === 'builds' && <section className="panel"><h2>{t('savedTitle')}</h2>
          {saved.length === 0 && <p className="muted">{t('savedEmpty')}</p>}
          {saved.map(b => <div key={b.name} className="saved"><b>{b.name}</b> <small className="muted">{b.author} · {b.stat} · {Object.keys(b.board).length} {t('cells')}</small>
            <button onClick={() => { setBuild(b); setTab('board'); }}>{t('open')}</button><button className="danger" onClick={() => { deleteBuild(b.name); setSaved(savedBuilds()); }}>{t('del')}</button></div>)}
        </section>}
        <section className="panel"><h3>{t('notes')}</h3><textarea rows={3} value={build.notes} onChange={e => setBuild({ ...build, notes: e.target.value })} placeholder={t('notesPh')} /></section>
      </main>
      <footer className="muted">{t('footer', { runes: runes.length, runestones: runestones.length, uniques: uniques.length, rm: runemaster.length, auth: authority.length })} <a href="https://undecember.thein.ru/en/" target="_blank" rel="noreferrer">undecember.thein.ru</a> {t('footer2')}</footer>
    </div>
  );
}
