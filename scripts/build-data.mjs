// Builds src/data/*.json (app bundle) from the project's own database.
// Priority: db/{section}.json (full scraped DB) > data/raw/*.txt (bootstrap index captured by hand).
import fs from 'node:fs'; import path from 'node:path';
const root = path.resolve(new URL('..', import.meta.url).pathname);
const raw = (f) => fs.readFileSync(path.join(root, 'data/raw', f), 'utf8').split('\n').filter(l => l.trim() && !l.startsWith('#'));
const db = (f) => { const p = path.join(root, 'db', f); return fs.existsSync(p) ? JSON.parse(fs.readFileSync(p, 'utf8')) : null; };
const out = (f, d) => fs.writeFileSync(path.join(root, 'src/data', f), JSON.stringify(d));
const hasLocalIcon = (rel) => fs.existsSync(path.join(root, 'public', rel));
const SITE = 'https://undecember.thein.ru';
// Icon path: local mirror if present, else remote fallback (until `npm run data:scrape` has been run).
const icon = (rel) => hasLocalIcon(rel) ? rel : `${SITE}/image/${rel.replace(/^icons\//, '')}`;
fs.mkdirSync(path.join(root, 'src/data'), { recursive: true });

const tagMembers = {}; for (const l of raw('tags_members.txt')) { const [tag, rest] = l.split(':'); tagMembers[tag.trim()] = (rest || '').trim().split(/\s+/).filter(Boolean); }
const tagsOf = {}; for (const [t, slugs] of Object.entries(tagMembers)) for (const s of slugs) (tagsOf[s] ||= []).push(t);

// ---- runes
const runesDb = db('runes.json') || {};
const runes = raw('runes_list.txt').map(l => { const [type, slug, name, ic] = l.split('|'); const d = runesDb[slug] || {};
  return { slug, name, type, icons: (d.icons?.length ? d.icons : ic.split(',').map(i => `icons/runes/${type}/${i}.png`)).map(icon), tags: d.tags?.length ? d.tags : (tagsOf[slug] || []),
    rarity: d.rarity ?? null, howToGet: d.howToGet ?? [], acts: d.acts ?? [], weapons: d.weapons ?? [], description: d.description ?? '', linkRules: d.linkRules ?? [],
    level1: d.level1 ?? [], level45: d.level45 ?? [], gradeBonuses: d.gradeBonuses ?? [], awakening: d.awakening ?? {} }; });

// ---- runestones
const rsDb = db('runestones.json') || {};
const runestones = raw('runestones.txt').map(l => { const [rarity, slug, name, ic] = l.split('|'); const d = rsDb[slug] || {};
  return { slug, name, rarity, icon: icon(d.icons?.[0] || `icons/items/RuneCast/${ic}.png`), effect: d.effect ?? [] }; });

// ---- uniques
const TYPE_NAMES = { dagger:'Dagger', sword:'One-Handed Sword', axe:'One-Handed Axe', mace:'One-Handed Blunt', staff:'Staff', bow:'Bow', wand:'Wand', sceptre:'Scepter', magicbow:'Magic Bow', quiver:'Quiver', bowgun:'Bowgun', magazine:'Magazine', shield:'Shield', helmet:'Helmet', shoulder:'Pauldrons', bodyarmor:'Armor', gloves:'Gloves', boots:'Shoes', belt:'Belt', ring:'Ring', necklace:'Necklace', twohand_sword:'Two-Handed Sword', twohand_axe:'Two-Handed Axe', twohand_mace:'Two-Handed Blunt' };
const uqDb = db('uniques.json') || {};
const uniques = raw('uniques_list.txt').map(l => { const [tier, slug, name, ic] = l.split('|'); const d = uqDb[slug] || {};
  const key = ic.replace(/^Icon_Equipment_/, '').replace(/(Dummy|[UT]\d+.*)$/, '').toLowerCase(); const type = TYPE_NAMES[key]; if (!type) throw new Error('unknown type ' + ic);
  return { slug, name, tier: +tier, typeKey: key, type: d.type || type, icon: icon(d.icons?.[0] || `icons/items/Equipment/${ic}.png`), requires: d.requires ?? [], baseStats: d.baseStats ?? [], affixes: d.affixes ?? [] }; });

// ---- rune master
const runemaster = raw('runemaster.txt').map((l, i) => { const [category, tier, unlockLevel, maxPoints, prereq, effect] = l.split('|');
  return { id: `rm${i}`, category, tier: +tier, unlockLevel: +unlockLevel, maxPoints: +maxPoints, prereqPointsPrevTier: +prereq, effect }; });

// ---- authority
const SLOTS = ['Weapons','Shield','Quiver','Magazine','Helmet','Pauldrons','Armor','Gloves','Shoes','Necklace','Ring','Belt'];
const GODS = ['Alyssa','Hamal','Boreal','Casthor','Acuben','Leo','Spica','Aquilla','Vesper','Sephdar','Capri','Miraseti'];
const auDb = db('authority.json') || {};
const authority = SLOTS.flatMap(slot => GODS.map(god => { const slug = `${slot}${god}`; const d = auDb[slug] || {};
  return { slug, slot, god, name: `${god}'s Authority (${slot})`, unique: d.unique ?? [], prefix: d.prefix ?? [], suffix: d.suffix ?? [] }; }));

// ---- misc sections (only from db)
const misc = {}; for (const s of ['essences', 'coins', 'potions', 'materials']) { const d = db(`${s}.json`); misc[s] = d ? Object.values(d).map(x => ({ slug: x.slug, name: x.name, icon: x.icons?.[0] ? icon(x.icons[0]) : null, lines: x.lines ?? [] })) : []; }

out('runes.json', runes); out('runestones.json', runestones); out('uniques.json', uniques); out('runemaster.json', runemaster); out('authority.json', authority); out('tags.json', Object.keys(tagMembers).sort()); out('misc.json', misc);
const filled = (arr, k) => arr.filter(x => (Array.isArray(x[k]) ? x[k].length : x[k])).length;
console.log({ runes: runes.length, runesWithDetails: filled(runes, 'level1'), runestones: runestones.length, uniques: uniques.length, uniquesWithAffixes: filled(uniques, 'affixes'), runemaster: runemaster.length, authority: authority.length, authorityWithOptions: filled(authority, 'unique'), misc: Object.fromEntries(Object.entries(misc).map(([k, v]) => [k, v.length])) });
