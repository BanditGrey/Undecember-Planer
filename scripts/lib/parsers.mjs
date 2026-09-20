// Text-structure parsers for undecember.thein.ru detail pages.
// They work on the line array produced by htmlToLines(mainOf(html)), so they don't depend on CSS classes.
const NAV_END = /^All (Runes|Runestones|Unique equipment|Authority)|^Back$/i;
const between = (lines, startRe, endRes) => {
  const i = lines.findIndex(l => startRe.test(l)); if (i < 0) return [];
  const out = []; for (let j = i + 1; j < lines.length; j++) { if (endRes.some(r => r.test(lines[j]))) break; out.push(lines[j]); } return out;
};
const after = (lines, label) => { const i = lines.findIndex(l => l.toLowerCase().startsWith(label.toLowerCase())); if (i < 0) return null; const inline = lines[i].slice(label.length).trim(); return inline || lines[i + 1] || null; };
const listAfter = (lines, label, stopRes) => { const i = lines.findIndex(l => l.toLowerCase().startsWith(label.toLowerCase())); if (i < 0) return []; const inline = lines[i].slice(label.length).trim(); const out = inline ? [inline] : []; for (let j = i + 1; j < lines.length; j++) { if (stopRes.some(r => r.test(lines[j]))) break; out.push(lines[j]); } return out; };
const LABEL = /^(Min\. rarity|How to get|To buy in|Weapon|Type|Tier|Requires|Rune Level|Rune Grade|Awakening|Rarity|Unique Options|Prefix Options|Suffix Options|Level \d+ Stats)/i;

// Site markup often concatenates stat lines; split on boundaries like "…Chance+100%…", "…300%Cold…", "…3Triggers…", "…Effect5% DMG…".
const splitStat = (s) => s
  .replace(/(?<=[a-z%)\]\d])(?=[+\-]\d|[+\-]\[)/g, '\n')
  .replace(/(?<=[a-z\]%])(?=\[)/g, '\n')
  .replace(/(?<=%|\d|\])(?=[A-Z][a-z])/g, '\n')
  .replace(/(?<=[a-z\)])(?=\d+(?:\.\d+)?%? [A-Z])/g, '\n')
  .replace(/(?<= Element)(?=[A-Z])/g, '\n')
  .split('\n').map(x => x.trim()).filter(Boolean);

export function parseRune(lines, meta) {
  const nameIdx = lines.findIndex(l => l === meta.name); const L = nameIdx >= 0 ? lines.slice(nameIdx) : lines;
  const stop = [LABEL];
  const rarity = after(L, 'Min. rarity:');
  const howToGet = listAfter(L, 'How to get:', stop).flatMap(x => x.split(/(?<=[a-z])(?=[A-Z])/));
  const acts = listAfter(L, 'To buy in:', stop).flatMap(x => x.split(/(?=Act)/)).map(x => x.trim()).filter(Boolean);
  const weaponLine = after(L, 'Weapon:'); const weapons = weaponLine ? (/^All weapons/i.test(weaponLine) ? ['All weapons'] : weaponLine.split(/(?<=[a-z])(?=[A-Z])/)) : [];
  // tags: lines between weapon/acts block and description – single/two-word capitalised lines; description = first long sentence
  const tagStart = Math.max(L.findIndex(l => /^Weapon:/i.test(l)), L.findIndex(l => /^To buy in:/i.test(l)), L.findIndex(l => /^How to get:/i.test(l)));
  const lvl1 = L.findIndex(l => /^Rune Level 1$/i.test(l));
  const mid = L.slice(tagStart + 1, lvl1 > 0 ? lvl1 : undefined).filter(l => !/^(Act|Drop|Shop|Synthesis|Guild|Unique Dungeon|Normal|Magic|Rare)/.test(l) && !LABEL.test(l));
  const description = mid.filter(l => l.length > 40 || /[.,]/.test(l)).pop() || '';
  const tags = mid.filter(l => l !== description && l !== weaponLine && l.length < 30 && !/[.:]/.test(l) && !weapons.includes(l));
  const linkRules = mid.filter(l => /linked|Applies to|Only one/i.test(l) && l !== description);
  const levelBlock = (n) => between(L, new RegExp(`^Rune Level ${n}$`, 'i'), [/^Rune Level/i, /^Rune Grade$/i, /^Awakening$/i]).flatMap(splitStat);
  const grades = between(L, /^Rune Grade$/i, [/^Awakening$/i]);
  const awaken = between(L, /^Awakening$/i, [/^\s*$/, NAV_END]);
  const aw = {}; let cur = null; for (const l of awaken) { if (/^(Source|Origin|Verity)$/.test(l)) { cur = l; aw[cur] = []; } else if (cur) aw[cur].push(...splitStat(l)); }
  return { rarity, howToGet, acts, weapons, tags, description, linkRules, level1: levelBlock(1), level45: levelBlock(45), gradeBonuses: grades.map(splitStat), awakening: aw };
}

export function parseRunestone(lines, meta) {
  const i = lines.findIndex(l => l === meta.name); const L = i >= 0 ? lines.slice(i + 1) : lines;
  const rarity = after(L, 'Rarity:'); const effect = L.filter(l => !/^Rarity/i.test(l) && l !== rarity && l.length > 15 && !NAV_END.test(l));
  return { rarity, effect };
}

export function parseUnique(lines, meta) {
  const i = lines.findIndex(l => l === meta.name); const L = i >= 0 ? lines.slice(i + 1) : lines;
  const type = after(L, 'Type:'); const tier = after(L, 'Tier:');
  const requires = L.filter(l => /^Requires/i.test(l));
  const rest = L.filter(l => !/^(Type|Tier|Requires)/i.test(l) && !NAV_END.test(l) && l !== type && l !== tier);
  const base = rest.filter(l => !/\[|\+|%/.test(l) && /\d/.test(l));
  const affixes = rest.filter(l => /\[|\+|%|when|if|per|Gain|Cannot|Immune|against/i.test(l) && !base.includes(l));
  return { type, tier: tier ? +tier : meta.tier, requires, baseStats: base, affixes, allLines: rest };
}

export function parseAuthority(lines, meta) {
  const sec = (name) => between(lines, new RegExp(`^${name} Options?$`, 'i'), [/Options?$/i, NAV_END]).flatMap(splitStat);
  return { unique: sec('Unique'), prefix: sec('Prefix'), suffix: sec('Suffix') };
}

export function parseGenericList(lines) { return lines; }
