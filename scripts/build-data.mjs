// Converts data/raw/*.txt (captured from undecember.thein.ru) into JSON consumed by the app.
import fs from 'node:fs';
import path from 'node:path';
const root = path.resolve(new URL('..', import.meta.url).pathname);
const raw = (f) => fs.readFileSync(path.join(root, 'data/raw', f), 'utf8').split('\n').filter(l => l.trim() && !l.startsWith('#'));
const out = (f, d) => fs.writeFileSync(path.join(root, 'src/data', f), JSON.stringify(d, null, 0));
const SITE = 'https://undecember.thein.ru';

// tags
const tagMembers = {};
for (const l of raw('tags_members.txt')) { const [tag, rest] = l.split(':'); tagMembers[tag.trim()] = (rest || '').trim().split(/\s+/).filter(Boolean); }
const tagsOf = {};
for (const [t, slugs] of Object.entries(tagMembers)) for (const s of slugs) (tagsOf[s] ||= []).push(t);

// runes
const runes = raw('runes_list.txt').map(l => { const [type, slug, name, icon] = l.split('|'); return {
  slug, name, type, icons: icon.split(',').map(i => `${SITE}/image/items/Rune/${i}.png`), tags: tagsOf[slug] || [], url: `${SITE}/en/runes/${slug}/` }; });

// runestones
const runestones = raw('runestones.txt').map(l => { const [rarity, slug, name, icon] = l.split('|'); return {
  slug, name, rarity, icon: `${SITE}/image/items/RuneCast/${icon}.png`, url: `${SITE}/en/runecast/${slug}/` }; });

// uniques
const TYPE_NAMES = { dagger:'Dagger', sword:'One-Handed Sword', axe:'One-Handed Axe', mace:'One-Handed Blunt', staff:'Staff', bow:'Bow', wand:'Wand', sceptre:'Scepter', magicbow:'Magic Bow', quiver:'Quiver', bowgun:'Bowgun', magazine:'Magazine', shield:'Shield', helmet:'Helmet', shoulder:'Pauldrons', bodyarmor:'Armor', gloves:'Gloves', boots:'Shoes', belt:'Belt', ring:'Ring', necklace:'Necklace', twohand_sword:'Two-Handed Sword', twohand_axe:'Two-Handed Axe', twohand_mace:'Two-Handed Blunt' };
const uniques = raw('uniques_list.txt').map(l => { const [tier, slug, name, icon] = l.split('|');
  let key = icon.replace(/^Icon_Equipment_/, '').replace(/(Dummy|[UT]\d+.*)$/, '').toLowerCase();
  const type = TYPE_NAMES[key]; if (!type) throw new Error('unknown type ' + icon);
  return { slug, name, tier: +tier, typeKey: key, type, icon: `${SITE}/image/items/Equipment/${icon}.png`, url: `${SITE}/en/uniques/${slug}/` }; });

// rune master
const runemaster = raw('runemaster.txt').map((l, i) => { const [category, tier, unlockLevel, maxPoints, prereq, effect] = l.split('|');
  return { id: `rm${i}`, category, tier: +tier, unlockLevel: +unlockLevel, maxPoints: +maxPoints, prereqPointsPrevTier: +prereq, effect }; });

// authority (12 slots x 12 gods)
const SLOTS = ['Weapons','Shield','Quiver','Magazine','Helmet','Pauldrons','Armor','Gloves','Shoes','Necklace','Ring','Belt'];
const GODS = ['Alyssa','Hamal','Boreal','Casthor','Acuben','Leo','Spica','Aquilla','Vesper','Sephdar','Capri','Miraseti'];
const authority = SLOTS.flatMap(slot => GODS.map(god => ({ slug: `${slot}${god}`, slot, god, name: `${god}'s Authority (${slot})`, url: `${SITE}/en/authority/${slot}${god}/` })));

out('runes.json', runes); out('runestones.json', runestones); out('uniques.json', uniques); out('runemaster.json', runemaster); out('authority.json', authority);
out('tags.json', Object.keys(tagMembers).sort());
console.log({ runes: runes.length, runestones: runestones.length, uniques: uniques.length, runemaster: runemaster.length, authority: authority.length, });
console.log([...new Set(uniques.map(u => u.typeKey))].join(' '));
