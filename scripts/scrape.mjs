#!/usr/bin/env node
// Builds the project's OWN database (db/) from undecember.thein.ru so the app never depends on the site being online.
//   node scripts/scrape.mjs               # everything
//   node scripts/scrape.mjs runes uniques # only some sections
//   FORCE=1 node scripts/scrape.mjs       # ignore the html cache in data/cache
//   OFFLINE=1 node scripts/scrape.mjs     # only re-parse cached html (no network)
// Output:
//   db/{runes,runestones,uniques,authority,runemaster,essences,coins,potions,materials}.json  – structured data
//   public/icons/**                                                                            – mirrored images
//   data/cache/**.html                                                                         – raw pages (re-parse without re-downloading)
import fs from 'node:fs'; import path from 'node:path';
import { htmlToLines, mainOf, imgSrcs, links } from './lib/html.mjs';
import { parseRune, parseRunestone, parseUnique, parseAuthority } from './lib/parsers.mjs';

const root = path.resolve(new URL('..', import.meta.url).pathname);
const SITE = 'https://undecember.thein.ru';
const CACHE = path.join(root, 'data/cache'); const DB = path.join(root, 'db'); const ICONS = path.join(root, 'public/icons');
for (const d of [CACHE, DB, ICONS]) fs.mkdirSync(d, { recursive: true });
const wanted = process.argv.slice(2); const want = (s) => wanted.length === 0 || wanted.includes(s);
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
const readJson = (f, d) => fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf8')) : d;
const writeJson = (f, d) => fs.writeFileSync(f, JSON.stringify(d, null, 1));

async function fetchText(url, cacheRel) {
  const f = path.join(CACHE, cacheRel); if (!process.env.FORCE && fs.existsSync(f)) return fs.readFileSync(f, 'utf8');
  if (process.env.OFFLINE) return null; // re-parse cache only
  for (let attempt = 1; attempt <= 4; attempt++) {
    try { const r = await fetch(url, { headers: { 'user-agent': 'undecember-planer-db/1.0 (+github BanditGrey/Undecember-Planer)' } });
      if (r.status === 404) { console.warn('404', url); return null; } if (!r.ok) throw new Error('HTTP ' + r.status);
      const t = await r.text(); fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, t); await sleep(250); return t;
    } catch (e) { console.warn(`retry ${attempt} ${url}: ${e.message}`); await sleep(1500 * attempt); }
  }
  return null;
}
async function mirrorIcon(src) {
  if (!src || process.env.OFFLINE) return src ? 'icons/' + new URL(src, SITE).pathname.replace(/^\/image\//, '') : null; const url = src.startsWith('http') ? src : SITE + src; const u = new URL(url); if (!u.pathname.startsWith('/image/')) return null;
  const rel = u.pathname.replace(/^\/image\//, ''); const f = path.join(ICONS, rel);
  if (!fs.existsSync(f)) { try { const r = await fetch(url); if (r.ok) { fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, Buffer.from(await r.arrayBuffer())); await sleep(80); } } catch (e) { console.warn('icon fail', url); return null; } }
  return 'icons/' + rel;
}

/** Generic: paginate a list page collecting item hrefs matching /en/{section}/{Slug}/ */
async function listSlugs(section) {
  const out = []; let page = 1;
  while (true) {
    const html = await fetchText(`${SITE}/en/${section}/${page > 1 ? `?page=${page}` : ''}`, `list/${section}-${page}.html`); if (!html) break;
    const hrefs = links(html, new RegExp(`^(?:${SITE})?/en/${section}/[^/?#]+/$`)).map(h => h.replace(/.*\/en\/[^/]+\//, '').replace(/\/$/, ''));
    const fresh = hrefs.filter(h => !out.includes(h)); if (fresh.length === 0) break; out.push(...fresh);
    if (!new RegExp(`page=${page + 1}\\b`).test(html)) break; page++;
  }
  return out;
}

async function detailSection(section, urlPart, parse, seedItems) {
  const dbFile = path.join(DB, `${section}.json`); const db = readJson(dbFile, {});
  let items = seedItems; if (!items) { const slugs = await listSlugs(urlPart); items = slugs.map(slug => ({ slug })); }
  let n = 0;
  for (const it of items) {
    const html = await fetchText(`${SITE}/en/${urlPart}/${it.slug}/`, `${urlPart}/${it.slug}.html`); if (!html) continue;
    const main = mainOf(html); const lines = htmlToLines(main);
    const name = it.name || (html.match(/<title>[^-]*-\s*(.*?)\s*-\s*Undecember/)?.[1]) || it.slug;
    const icons = []; for (const src of imgSrcs(main).filter(s => /\/image\/(runes|items)\//.test(s))) { const p = await mirrorIcon(src); if (p && !icons.includes(p)) icons.push(p); }
    db[it.slug] = { ...it, name, icons, ...parse(lines, { ...it, name }), source: `${SITE}/en/${urlPart}/${it.slug}/`, scrapedAt: new Date().toISOString().slice(0, 10) };
    if (++n % 20 === 0) { writeJson(dbFile, db); console.log(section, n, '/', items.length); }
  }
  writeJson(dbFile, db); console.log('done', section, n);
}

const seed = (f) => readJson(path.join(root, 'src/data', f), null);
if (want('runes')) await detailSection('runes', 'runes', parseRune, seed('runes.json'));
if (want('runestones')) await detailSection('runestones', 'runecast', parseRunestone, seed('runestones.json'));
if (want('uniques')) await detailSection('uniques', 'uniques', parseUnique, seed('uniques.json'));
if (want('authority')) await detailSection('authority', 'authority', parseAuthority, seed('authority.json'));
for (const s of ['essences', 'coins', 'potions', 'materials']) if (want(s)) await detailSection(s, s, (lines) => ({ lines: lines.slice(0, 60) }), null);
if (want('runemaster')) { fs.copyFileSync(path.join(root, 'src/data/runemaster.json'), path.join(DB, 'runemaster.json')); console.log('done runemaster'); }
console.log('Database written to db/. Run `npm run data:build` to refresh the app bundle.');
