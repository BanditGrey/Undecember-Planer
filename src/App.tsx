import { useEffect, useState } from 'react';
import { Board } from './components/Board';
import { Equipment } from './components/Equipment';
import { RuneMaster } from './components/RuneMaster';
import { runes, runestones, uniques, runemaster, authority } from './data';
import { buildFromLocation, deleteBuild, saveBuild, savedBuilds, shareUrl } from './lib/share';
import { emptyBuild, type Build } from './types';

type Tab = 'board' | 'equip' | 'rm' | 'builds';

export default function App() {
  const [build, setBuild] = useState<Build>(() => buildFromLocation() || emptyBuild());
  const [tab, setTab] = useState<Tab>('board');
  const [saved, setSaved] = useState(savedBuilds);
  const [msg, setMsg] = useState('');
  useEffect(() => { history.replaceState(null, '', shareUrl(build)); }, [build]);
  useEffect(() => { const h = () => { const b = buildFromLocation(); if (b) setBuild(b); }; addEventListener('hashchange', h); return () => removeEventListener('hashchange', h); }, []);
  const flash = (m: string) => { setMsg(m); setTimeout(() => setMsg(''), 2500); };
  const share = async () => { await navigator.clipboard.writeText(shareUrl(build)); flash('Link copiado!'); };
  const save = () => { saveBuild(build); setSaved(savedBuilds()); flash('Build salva localmente.'); };

  return (
    <div className="app">
      <header>
        <h1>UNDECEMBER <span>Build Planner</span></h1>
        <div className="row">
          <input value={build.name} onChange={e => setBuild({ ...build, name: e.target.value })} placeholder="Nome da build" />
          <input value={build.author} onChange={e => setBuild({ ...build, author: e.target.value })} placeholder="Autor" />
          <select value={build.stat} onChange={e => setBuild({ ...build, stat: e.target.value as Build['stat'] })}>{['STR', 'DEX', 'INT', 'HYBRID'].map(s => <option key={s}>{s}</option>)}</select>
          <button className="primary" onClick={share}>Compartilhar link</button>
          <button onClick={save}>Salvar</button>
          <button onClick={() => setBuild(emptyBuild())}>Nova</button>
          {msg && <span className="flash">{msg}</span>}
        </div>
        <nav>{([['board', 'Rune Cast'], ['equip', 'Equipamento'], ['rm', 'Mestre de Runas'], ['builds', 'Builds salvas']] as [Tab, string][]).map(([t, l]) => <button key={t} className={tab === t ? 'on' : ''} onClick={() => setTab(t)}>{l}</button>)}</nav>
      </header>
      <main>
        {tab === 'board' && <Board build={build} set={setBuild} />}
        {tab === 'equip' && <Equipment build={build} set={setBuild} />}
        {tab === 'rm' && <RuneMaster build={build} set={setBuild} />}
        {tab === 'builds' && <section className="panel"><h2>Builds salvas neste navegador</h2>
          {saved.length === 0 && <p className="muted">Nenhuma. Use "Salvar" para guardar a build atual; use "Compartilhar link" para enviá-la à comunidade.</p>}
          {saved.map(b => <div key={b.name} className="saved"><b>{b.name}</b> <small className="muted">{b.author} · {b.stat} · {Object.keys(b.board).length} células</small>
            <button onClick={() => { setBuild(b); setTab('board'); }}>Abrir</button><button className="danger" onClick={() => { deleteBuild(b.name); setSaved(savedBuilds()); }}>Excluir</button></div>)}
        </section>}
        <section className="panel"><h3>Notas</h3><textarea rows={3} value={build.notes} onChange={e => setBuild({ ...build, notes: e.target.value })} placeholder="Descrição, ordem de prioridade, dicas…" /></section>
      </main>
      <footer className="muted">Dados: {runes.length} runas · {runestones.length} runestones · {uniques.length} únicos · {runemaster.length} nós do Mestre de Runas · {authority.length} autoridades — fonte <a href="https://undecember.thein.ru/en/" target="_blank" rel="noreferrer">undecember.thein.ru</a> e guia oficial. Não afiliado à LINE Games.</footer>
    </div>
  );
}
