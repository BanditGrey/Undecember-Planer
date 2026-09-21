// DOM-based parsers for undecember.thein.ru detail pages (see scripts/lib/dom.mjs).
import { findAll, findOne, children, text, attr, imgs } from './dom.mjs';

const content = (html) => { const i = html.indexOf('id="content"'); return i >= 0 ? html.slice(i) : html; };
const mainProps = (html) => { const o = {}; for (const p of findAll(html, 'Elem_card_main_prop')) { const label = text(p.inner.match(/<p>(.*?)<\/p>/)?.[1] ?? '').replace(/:$/, ''); o[label] = children(p.inner).filter(c => c.tag === 'span').map(c => text(c.inner)); } return o; };
const lines = (inner) => children(inner).filter(c => c.tag === 'span' || c.tag === 'div').map(c => text(c.inner)).filter(Boolean);
const title = (html) => text(findOne(html, 'Elem_card_title')?.inner ?? '');
const icons = (html) => [...new Set(imgs(findOne(html, 'Elem_card_main_image')?.inner ?? '').filter(s => /\/image\/(runes|items)\//.test(s)))];

export function parseRune(html, meta) {
  const h = content(html); const mp = mainProps(h);
  const tags = findAll(h, 'Elem_card_tags_item').map(t => text(t.inner));
  const descBlock = findOne(h, 'Elem_card_desc'); const descLines = descBlock ? lines(descBlock.inner).length ? lines(descBlock.inner) : [text(descBlock.inner)] : [];
  const linkRules = descLines.filter(l => /linked|Only one|Applies to/i.test(l)); const description = descLines.filter(l => !linkRules.includes(l)).join(' ');
  const levels = {};
  for (const col of findAll(h, 'Elem_card_tiles_col', 'div')) {
    const lvl = text(findOne(col.inner, 'Elem_card_props_lvl')?.inner ?? '').match(/(\d+)/)?.[1]; if (!lvl) continue;
    const res = findOne(col.inner, 'Elem_card_resource'); const props = findOne(col.inner, 'Elem_card_props');
    levels[lvl] = { resource: res ? lines(res.inner) : [], stats: props ? lines(props.inner) : [] };
  }
  const grades = {}; const gcol = findOne(h, 'Elem_card_tiles_col2');
  if (gcol) for (const g of findAll(gcol.inner, 'Elem_card_props')) grades[attr(g.open, 'rarity') || 'Grade'] = lines(g.inner);
  const awakening = {};
  for (const b of findAll(h, 'Elem_card_awakening_block', 'div')) { const t = text(findOne(b.inner, 'Elem_card_awakening_block_title')?.inner ?? ''); const ls = children(b.inner).filter(c => c.tag === 'span').map(c => text(c.inner)).filter(Boolean); if (t) awakening[t] = ls; }
  const l1 = levels['1'] ?? { resource: [], stats: [] }, l45 = levels['45'] ?? { resource: [], stats: [] };
  return { name: title(h) || meta.name, icons: icons(h), rarity: mp['Min. rarity']?.[0] ?? null, howToGet: mp['How to get'] ?? [], acts: mp['To buy in'] ?? [], weapons: mp['Weapon'] ?? [],
    tags, description, linkRules, level1: [...l1.resource, ...l1.stats], level45: [...l45.resource, ...l45.stats], levels, gradeBonuses: ['Magic', 'Rare', 'Legendary'].filter(k => grades[k]).map(k => grades[k]), grades, awakening };
}

export function parseRunestone(html, meta) {
  const h = content(html); const mp = mainProps(h); const d = findOne(h, 'Elem_card_desc'); const props = findAll(h, 'Elem_card_props').flatMap(p => lines(p.inner));
  const effect = [...(d ? lines(d.inner).length ? lines(d.inner) : [text(d.inner)] : []), ...props].filter(Boolean);
  return { name: title(h) || meta.name, icons: icons(h), rarity: mp['Rarity']?.[0] ?? meta.rarity ?? null, effect };
}

export function parseUnique(html, meta) {
  const h = content(html); const mp = mainProps(h);
  const req = findAll(h, 'Elem_card_main_prop').find(p => /Requires/.test(p.inner));
  const requires = req ? children(req.inner).filter(c => c.tag === 'span').map(c => text(c.inner.replace(/<i>/, ' '))) : [];
  const groups = {}; for (const p of findAll(h, 'Elem_card_props', 'div')) { const k = attr(p.open, 'prop-type') || 'other'; groups[k] = findAll(p.inner, 'Elem_card_props_el').map(e => text(e.inner)); }
  return { name: title(h) || meta.name, icons: icons(h), type: mp['Type']?.[0] ?? meta.type, tier: +(mp['Tier']?.[0] ?? meta.tier), requires, baseStats: groups.main ?? [], affixes: groups.options ?? [], other: groups.other ?? [] };
}

export function parseAuthority(html, meta) {
  const h = content(html); const out = { unique: [], prefix: [], suffix: [] };
  for (const sec of findAll(h, 'Elem_card_section', 'div')) {
    const st = text(findOne(sec.inner, 'Elem_card_subtitle')?.inner ?? ''); const key = /Unique/.test(st) ? 'unique' : /Prefix/.test(st) ? 'prefix' : /Suffix/.test(st) ? 'suffix' : null; if (!key) continue;
    for (const p of findAll(sec.inner, 'Elem_card_auth_prop', 'div')) { const t = text(findOne(p.inner, 'Elem_card_auth_prop_head_title')?.inner ?? ''); const v = text(findOne(p.inner, 'Elem_card_auth_prop_head_prc')?.inner ?? '').replace(/\[\s*/, '[').replace(/\s*\]/, ']'); out[key].push({ name: t, value: v, text: `${t}: ${v}` }); }
  }
  return { name: text(findOne(h, 'Elem_card_god_label')?.inner ?? '') || meta.name, unique: out.unique.map(x => x.text), prefix: out.prefix.map(x => x.text), suffix: out.suffix.map(x => x.text), options: out };
}

export function parseItem(html, meta) { // essences, coins, potions, materials
  const h = content(html); const mp = mainProps(h); const d = findOne(h, 'Elem_card_desc');
  const recipes = findAll(h, 'Elem_card_recipe', 'div').map(r => ({ title: text(findOne(r.inner, 'Elem_card_recipe_title')?.inner ?? ''), ingredients: findAll(r.inner, 'Elem_card_recipe_ing', 'a').map(a => ({ href: attr(a.open, 'href'), icon: imgs(a.inner)[0] ?? null, count: text(findOne(a.inner, 'Elem_image_count')?.inner ?? '').replace(/^x/, '') })) }));
  const props = findAll(h, 'Elem_card_props').flatMap(p => lines(p.inner));
  return { name: title(h) || meta.name, icons: icons(h), rarity: mp['Rarity']?.[0] ?? null, howToGet: mp['How to get'] ?? [], useOn: mp['Use on'] ?? [], description: d ? text(d.inner) : '', props, recipes };
}

/** Parses a list page: returns [{slug, name, icon}] and whether there is a next page. */
export function parseList(html, section) {
  const h = content(html); const items = [];
  for (const li of findAll(h, 'content_list_item', 'li')) { const href = li.inner.match(/href="([^"]+)"/)?.[1] ?? ''; const slug = href.match(new RegExp(`/en/${section}/([^/?#]+)/`))?.[1]; if (!slug) continue;
    items.push({ slug, name: text(findOne(li.inner, 'Elem_list_item_title')?.inner ?? ''), icon: imgs(li.inner)[0] ?? null, rarity: attr(findOne(li.inner, 'Elem_list_item_rarity')?.open ?? '', 'rarity') }); }
  const total = +(text(findOne(h, 'content_list_count')?.inner ?? '').match(/(\d+)/)?.[1] ?? items.length);
  return { items, total };
}
