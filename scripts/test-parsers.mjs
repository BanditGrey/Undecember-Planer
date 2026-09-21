import fs from 'node:fs';
import { parseRune, parseUnique, parseAuthority, parseItem, parseList } from './lib/parsers.mjs';
const s = (f) => fs.readFileSync(`data/samples/${f}.html`, 'utf8');
const show = (o) => console.log(JSON.stringify(o, null, 1).slice(0, 2500));
show(parseRune(s('runes_LightningStrike'), {})); show(parseRune(s('runes_Multishot'), {}));
show(parseUnique(s('uniques_StarChasersBow'), {})); show(parseAuthority(s('authority_WeaponsAlyssa'), {}));
show(parseItem(s('essences_MagicUpgradeEssence'), {}));
const l = parseList(s('runes'), 'runes'); console.log('list', l.total, l.items.length, l.items[0]);
const c = parseList(s('coins'), 'coins'); console.log('coins', c.total, c.items.length, c.items[0]);
