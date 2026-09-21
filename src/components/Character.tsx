import { checkBuild } from '../lib/check';
import { useT } from '../lib/i18n';
import type { Build } from '../types';

export function Character({ build, set }: { build: Build; set: (b: Build) => void }) {
  const { t } = useT();
  const c = build.char ?? { level: 100, str: 100, dex: 100, int: 100 };
  const upd = (k: keyof typeof c, v: number) => set({ ...build, char: { ...c, [k]: Math.max(0, v || 0) } });
  const issues = checkBuild({ ...build, char: c });
  return <section className="panel char">
    <div className="row between"><h3>{t('charTitle')} <small className="muted">{t('charHint')}</small></h3>
      <div className="row">{(['level', 'str', 'dex', 'int'] as const).map(k => <label key={k} className="muted">{t(`char_${k}`)} <input type="number" value={c[k]} onChange={e => upd(k, +e.target.value)} style={{ width: 64 }} /></label>)}</div></div>
    {issues.length > 0 && <ul className="issues">{issues.map((i, n) => <li key={n} className={i.level}>{t(i.key, i.vars)}</li>)}</ul>}
    {issues.length === 0 && <p className="ok small">{t('checkOk')}</p>}
  </section>;
}
