// Tiny HTML helpers for the thein.ru Next.js markup (classes look like "Elem_card_title__JRiP_").
// We match on the stable prefix before the hash: cls('Elem_card_title') → regex for class^="Elem_card_title__".
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
export const decode = (s) => s.replace(/<!--.*?-->/g, '').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&#x27;|&#39;|&apos;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&#(\d+);/g, (_, n) => String.fromCharCode(+n));
export const text = (html) => decode(html.replace(/<[^>]+>/g, '')).replace(/\s+/g, ' ').trim();

/** Finds elements whose class starts with `prefix__`; returns inner HTML of each (balanced on div/span nesting). */
export function findAll(html, prefix, tag = '[a-z]+') {
  const re = new RegExp(`<(${tag})\\b[^>]*class="(?:[^"]*\\s)?${esc(prefix)}(?:__[^"\\s]*)?(?:\\s[^"]*)?"[^>]*>`, 'g');
  const out = []; let m;
  while ((m = re.exec(html))) {
    const t = m[1]; const start = m.index + m[0].length; let depth = 1; let i = start;
    const tre = new RegExp(`<(/?)${t}\\b[^>]*?(/?)>`, 'g'); tre.lastIndex = start; let mm;
    while (depth > 0 && (mm = tre.exec(html))) { if (mm[2] === '/') continue; depth += mm[1] ? -1 : 1; i = mm.index; }
    out.push({ open: m[0], inner: html.slice(start, i) });
    re.lastIndex = i;
  }
  return out;
}
export const findOne = (html, prefix, tag) => findAll(html, prefix, tag)[0];
export const attr = (open, name) => open.match(new RegExp(`\\s${name}="([^"]*)"`))?.[1] ?? null;
/** Direct child elements (span/div/a/p) of an inner-HTML string. */
export function children(inner) {
  const out = []; const re = /<(span|div|a|p|i)\b[^>]*>/g; let m;
  while ((m = re.exec(inner))) { const t = m[1]; let depth = 1; let i = m.index + m[0].length; const tre = new RegExp(`<(/?)${t}\\b[^>]*?(/?)>`, 'g'); tre.lastIndex = i; let mm;
    while (depth > 0 && (mm = tre.exec(inner))) { if (mm[2] === '/') continue; depth += mm[1] ? -1 : 1; i = mm.index; }
    out.push({ tag: t, open: m[0], inner: inner.slice(m.index + m[0].length, i) }); re.lastIndex = i; }
  return out;
}
export const imgs = (html) => [...html.matchAll(/<img[^>]+src="([^"]+)"/g)].map(m => m[1]);
