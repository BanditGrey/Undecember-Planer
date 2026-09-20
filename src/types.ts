export interface Rune { slug: string; name: string; type: 'Skill' | 'Link'; icons: string[]; tags: string[]; url: string }
export interface Runestone { slug: string; name: string; rarity: 'Magic' | 'Rare' | 'Unique'; icon: string; url: string }
export interface Unique { slug: string; name: string; tier: number; typeKey: string; type: string; icon: string; url: string }
export interface RuneMasterNode { id: string; category: string; tier: number; unlockLevel: number; maxPoints: number; prereqPointsPrevTier: number; effect: string }
export interface Authority { slug: string; slot: string; god: string; name: string; url: string }

export type EquipSlot = 'Weapons' | 'Offhand' | 'Helmet' | 'Pauldrons' | 'Armor' | 'Gloves' | 'Shoes' | 'Belt' | 'Necklace' | 'Ring1' | 'Ring2';

export interface Cell { rune?: string; runestone?: string }

export interface Build {
  v: 1;
  name: string;
  author: string;
  stat: 'STR' | 'DEX' | 'INT' | 'HYBRID';
  notes: string;
  board: Record<string, Cell>; // key "r,c"
  equipment: Partial<Record<EquipSlot, { unique?: string; authority?: string }>>;
  runemaster: Record<string, number>; // node id -> points
}

export const BOARD_SIZE = 7;
export const CENTER = `${Math.floor(BOARD_SIZE / 2)},${Math.floor(BOARD_SIZE / 2)}`;

export const emptyBuild = (): Build => ({ v: 1, name: 'Nova build', author: '', stat: 'HYBRID', notes: '', board: {}, equipment: {}, runemaster: {} });
