// Enriches src/data/*.json with detail pages from undecember.thein.ru.
// Run on a machine that can reach the site:  node scripts/scrape.mjs [runes|runestones|uniques|authority]
// Output: data/details/{section}/{slug}.html (raw) + src/data/{section}_details.json (text extracted).
import fs from 'node:fs'; import path from 'node:path';
const root = path.resolve(new URL('..', import.meta.url).pathname);
const SITE = 'https://undecember.thein.ru';
const sections = { runes: 'runes', runestones: 'runecast', uniques: 'uniques', authority: 'authority' };
const only = process.argv[2];
const strip = (h) => h.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/g, '').replace(/<br\s*\/?>|<\/(p|div|li|tr|h\d)>/g, '\n').replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&#39;|&apos;/g, "'").replace(/&quot;/g, '"').replace(/[ \t]+\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim();
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
for (const [sec, urlPart] of Object.entries(sections)) {
  if (only && only !== sec) continue;
  const items = JSON.parse(fs.readFileSync(path.join(root, 'src/data', `${sec}.json`), 'utf8'));
  const dir = path.join(root, 'data/details', sec); fs.mkdirSync(dir, { recursive: true });
  const outFile = path.join(root, 'src/data', `${sec}_details.json`);
  const details = fs.existsSync(outFile) ? JSON.parse(fs.readFileSync(outFile, 'utf8')) : {};
  let n = 0;
  for (const it of items) {
    const f = path.join(dir, `${it.slug}.html`); let html;
    if (fs.existsSync(f)) html = fs.readFileSync(f, 'utf8');
    else { const res = await fetch(`${SITE}/en/${urlPart}/${it.slug}/`); if (!res.ok) { console.warn('FAIL', sec, it.slug, res.status); continue; } html = await res.text(); fs.writeFileSync(f, html); await sleep(300); }
    const main = html.match(/<main[\s\S]*?<\/main>/)?.[0] || html.match(/<body[\s\S]*?<\/body>/)?.[0] || html;
    details[it.slug] = { text: strip(main) };
    if (++n % 25 === 0) { fs.writeFileSync(outFile, JSON.stringify(details)); console.log(sec, n, '/', items.length); }
  }
  fs.writeFileSync(outFile, JSON.stringify(details)); console.log('done', sec, n);
}
