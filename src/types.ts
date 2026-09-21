export type RuneColor = 'R' | 'G' | 'B';
export type SlotColor = RuneColor | 'W';
export interface Rune { slug: string; name: string; type: 'Skill' | 'Link'; color: RuneColor | null; icons: string[]; tags: string[]; rarity: string | null; howToGet: string[]; acts: string[]; weapons: string[]; description: string; linkRules: string[]; level1: string[]; level45: string[]; gradeBonuses: string[][]; awakening: Record<string, string[]>; unofficial?: boolean; maxLevel?: number; source?: string; sourceUrl?: string; placeholderIcon?: boolean }
export interface Runestone { slug: string; name: string; rarity: 'Magic' | 'Rare' | 'Unique'; icon: string; effect: string[] }
export interface Unique { slug: string; name: string; tier: number; typeKey: string; type: string; icon: string; requires: string[]; baseStats: string[]; affixes: string[] }
export interface RuneMasterNode { id: string; category: string; tier: number; unlockLevel: number; maxPoints: number; prereqPointsPrevTier: number; effect: string }
export interface Authority { slug: string; slot: string; god: string; name: string; unique: string[]; prefix: string[]; suffix: string[] }

export type EquipSlot = 'Weapons' | 'Offhand' | 'Helmet' | 'Pauldrons' | 'Armor' | 'Gloves' | 'Shoes' | 'Belt' | 'Necklace' | 'Ring1' | 'Ring2';

/** Skill rune link slots: index = hex direction 0..5; undefined = slot closed. Colours come from Rune Birth/Color/Candor essences. */
export interface Cell { rune?: string; runestone?: string; dir?: number /* trigger rune arrow direction 0..5 (index into hex DIRS) */; slots?: (SlotColor | null | undefined)[]; grade?: 0 | 1 | 2 | 3 /* Normal, Magic, Rare, Legendary */; awaken?: 'Source' | 'Origin' | 'Verity' }

export interface Build {
  v: 1;
  name: string;
  author: string;
  stat: 'STR' | 'DEX' | 'INT' | 'HYBRID';
  notes: string;
  board: Record<string, Cell>; // key "q,r" (axial hex coordinates)
  equipment: Partial<Record<EquipSlot, { unique?: string; authority?: string; affixes?: string[] }>>; // affixes: free-text lines of rare/crafted gear (one per line)
  extras?: Extras; // charms, relics, lacrima, jewels (free text – no public structured database exists)
  runemaster: Record<string, number>; // node id -> points
  zodiac?: string[]; // activated specialization node ids ("Spec.index")
  runeLevel?: number; // 1..50 (45 base + up to 5 from Rune Candor)
  runeLevelBonus?: number; // +X skill rune level from gear
  char?: { level: number; str: number; dex: number; int: number }; // for requirement checks
}


export interface ExtraItem { name: string; lines: string[] }
export interface Lacrima { type: string; grade: 'Magic' | 'Rare' | 'Unique'; absorb: number; lines: string[] }
export interface Extras { charms: ExtraItem[]; relics: ExtraItem[]; lacrima: Lacrima[]; jewels: ExtraItem[]; notes?: string }
export const emptyExtras = (): Extras => ({ charms: [], relics: [], lacrima: [], jewels: [] });
export const emptyBuild = (): Build => ({ v: 1, name: 'Nova build', author: '', stat: 'HYBRID', notes: '', board: {}, equipment: {}, runemaster: {} });

export type ZodiacKind = 'Moon' | 'Star' | 'Sun' | 'Cosmos';
export interface ZodiacNode { id: string; kind: ZodiacKind; effects: string[] }
export interface ZodiacSpec { id: string; tier: 1 | 2 | 3; name: string; nodes: ZodiacNode[] }
export interface ZodiacRoute { id: string; name: { pt: string; en: string }; focus: 'STR' | 'DEX' | 'INT' | 'ANY'; tags: string[]; specs: ZodiacSpec[] }
export interface ZodiacData { sourceUrl: string; maxPoints: Record<string, number>; routes: ZodiacRoute[] }
