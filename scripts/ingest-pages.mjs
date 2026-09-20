// Parses text captures in data/pages/{section}/{slug}.txt (markdown-ish dumps of detail pages) into db/{section}.json.
// Used when the scraper can't run (no network) — same parsers as scrape.mjs, so results are identical in shape.
import fs from 'node:fs'; import path from 'node:path';
import { parseRune, parseRunestone, parseUnique, parseAuthority } from './lib/parsers.mjs';
const root = path.resolve(new URL('..', import.meta.url).pathname);
const SITE = 'https://undecember.thein.ru';
const sections = { runes: ['runes', parseRune], runecast: ['runestones', parseRunestone], uniques: ['uniques', parseUnique], authority: ['authority', parseAuthority] };
const seedFor = { runes: 'runes.json', runecast: 'runestones.json', uniques: 'uniques.json', authority: 'authority.json' };
const mdToLines = (md) => md.split('\n').map(l => l.replace(/^[-*]\s+/, '').replace(/\\\[/g, '[').replace(/\\\]/g, ']').replace(/\\\\/g, '').trim()).filter(l => l && !/^!\[/.test(l) && !/^\[.*\]\(.*\)$/.test(l) && !/^_\$_$/.test(l) && !/^(РУ|EN)/.test(l));
const imgs = (md) => [...md.matchAll(/!\[\]\((https:\/\/undecember\.thein\.ru\/image\/(runes|items)\/[^)]+)\)/g)].map(m => m[1]);
for (const [dir, [dbName, parse]] of Object.entries(sections)) {
  const src = path.join(root, 'data/pages', dir); if (!fs.existsSync(src)) continue;
  const dbFile = path.join(root, 'db', `${dbName}.json`); const db = fs.existsSync(dbFile) ? JSON.parse(fs.readFileSync(dbFile, 'utf8')) : {};
  const seed = Object.fromEntries(JSON.parse(fs.readFileSync(path.join(root, 'src/data', seedFor[dir]), 'utf8')).map(x => [x.slug, x]));
  let n = 0;
  for (const f of fs.readdirSync(src).filter(f => f.endsWith('.txt'))) {
    const slug = f.replace(/\.txt$/, ''); const md = fs.readFileSync(path.join(src, f), 'utf8'); const meta = seed[slug] || { slug };
    const lines = mdToLines(md); const name = meta.name || lines.find(l => /^[A-Z]/.test(l) && !/^(All|Say)/.test(l)) || slug;
    const icons = [...new Set(imgs(md))].map(u => u.replace(SITE + '/image/', 'icons/'));
    db[slug] = { slug, name, icons, ...parse(lines, { ...meta, name }), source: `${SITE}/en/${dir}/${slug}/`, scrapedAt: new Date().toISOString().slice(0, 10) }; n++;
  }
  fs.mkdirSync(path.join(root, 'db'), { recursive: true }); fs.writeFileSync(dbFile, JSON.stringify(db, null, 1)); console.log(dbName, n, 'pages →', Object.keys(db).length, 'records');
}
