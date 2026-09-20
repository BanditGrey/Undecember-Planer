#!/usr/bin/env node
// Builds the project's OWN database (db/) from undecember.thein.ru so the app never depends on the site being online.
//   node scripts/scrape.mjs               # everything
//   node scripts/scrape.mjs runes uniques # only some sections
//   FORCE=1   ignore the html cache in data/cache     OFFLINE=1  only re-parse cached html (no network)
// Output: db/{section}.json (structured) · public/icons/** (mirrored images) · data/cache/**.html (raw pages)
import fs from 'node:fs'; import path from 'node:path';
import { parseRune, parseRunestone, parseUnique, parseAuthority, parseItem, parseList } from './lib/parsers.mjs';

const root = path.resolve(new URL('..', import.meta.url).pathname);
const SITE = 'https://undecember.thein.ru';
const CACHE = path.join(root, 'data/cache'); const DB = path.join(root, 'db'); const ICONS = path.join(root, 'public/icons');
for (const d of [CACHE, DB, ICONS]) fs.mkdirSync(d, { recursive: true });
const wanted = process.argv.slice(2); const want = (s) => wanted.length === 0 || wanted.includes(s);
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
const readJson = (f, d) => fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf8')) : d;
const writeJson = (f, d) => fs.writeFileSync(f, JSON.stringify(d, null, 1));
const today = new Date().toISOString().slice(0, 10);

async function fetchText(url, cacheRel) {
  const f = path.join(CACHE, cacheRel); if (!process.env.FORCE && fs.existsSync(f)) return fs.readFileSync(f, 'utf8');
  if (process.env.OFFLINE) return null;
  for (let attempt = 1; attempt <= 4; attempt++) {
    try { const r = await fetch(url, { headers: { 'user-agent': 'undecember-planer-db/1.0 (+github BanditGrey/Undecember-Planer)' } });
      if (r.status === 404) { console.warn('404', url); return null; } if (!r.ok) throw new Error('HTTP ' + r.status);
      const t = await r.text(); fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, t); await sleep(200); return t;
    } catch (e) { console.warn(`retry ${attempt} ${url}: ${e.message}`); await sleep(1500 * attempt); }
  }
  return null;
}
async function mirrorIcon(src) {
  if (!src) return null; const u = new URL(src, SITE); if (!u.pathname.startsWith('/image/')) return null;
  const rel = u.pathname.replace(/^\/image\//, ''); const f = path.join(ICONS, rel);
  if (!fs.existsSync(f) && !process.env.OFFLINE) { try { const r = await fetch(u.href); if (r.ok) { fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, Buffer.from(await r.arrayBuffer())); await sleep(60); } } catch { console.warn('icon fail', u.href); } }
  return 'icons/' + rel;
}

async function section(name, urlPart, parse) {
  const dbFile = path.join(DB, `${name}.json`); const db = readJson(dbFile, {});
  const listHtml = await fetchText(`${SITE}/en/${urlPart}/`, `list/${urlPart}.html`); if (!listHtml) { console.warn('no list for', name); return; }
  const { items, total } = parseList(listHtml, urlPart); console.log(name, 'list', items.length, '/', total);
  let n = 0;
  for (const it of items) {
    const html = await fetchText(`${SITE}/en/${urlPart}/${it.slug}/`, `${urlPart}/${it.slug}.html`); if (!html) continue;
    const parsed = parse(html, it); const icons = []; for (const s of (parsed.icons?.length ? parsed.icons : [it.icon])) { const p = await mirrorIcon(s); if (p && !icons.includes(p)) icons.push(p); }
    db[it.slug] = { slug: it.slug, order: n, ...parsed, icons, source: `${SITE}/en/${urlPart}/${it.slug}/`, scrapedAt: today };
    if (++n % 50 === 0) { writeJson(dbFile, db); console.log(name, n, '/', items.length); }
  }
  for (const k of Object.keys(db)) if (!items.some(i => i.slug === k)) { console.log('removed upstream:', name, k); delete db[k]; }
  writeJson(dbFile, db); console.log('done', name, n);
}

if (want('runes')) await section('runes', 'runes', parseRune);
if (want('runestones')) await section('runestones', 'runecast', parseRunestone);
if (want('uniques')) await section('uniques', 'uniques', parseUnique);
if (want('authority')) await section('authority', 'authority', parseAuthority);
for (const s of ['essences', 'coins', 'potions', 'materials']) if (want(s)) await section(s, s, parseItem);
if (want('runemaster')) { fs.copyFileSync(path.join(root, 'src/data/runemaster.json'), path.join(DB, 'runemaster.json')); console.log('done runemaster'); }
console.log('Database written to db/. Run `npm run data:build` to refresh the app bundle.');
