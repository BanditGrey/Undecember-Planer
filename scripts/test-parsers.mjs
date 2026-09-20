// Smoke test for parsers against a text fixture (lines captured from the site).
import { parseRune } from './lib/parsers.mjs';
const lines = `Frost Wave
Min. rarity:
Normal
How to get:
DropShop
To buy in:
Act 1Act 6-10Act 11-12
Weapon:
SwordAxeBluntStaff
Attack
Melee
Area of Effect
Strike
Cold
Shadow
Emits Cold energy in front of the caster to deal damage to enemies
Rune Level 1
Mana Cost 3Triggers Immediately
Cold ElementArea of Effect 650Cold DMG 300%Cold DMG +90+50% Chill Chance
Rune Level 45
Mana Cost 10.2Triggers Immediately
Cold ElementArea of Effect 650Cold DMG 554%Cold DMG +1362+50% Chill Chance
Rune Grade
+15% Chill Effect5% DMG Amplification against enemies affected by Cold Status Effect
+30% Chill Effect15% DMG Amplification against enemies affected by Cold Status Effect+30% Area of Effect
+45% Chill Effect30% DMG Amplification against enemies affected by Cold Status Effect+60% Area of Effect
Awakening
Source
[12-17]% DMG Amplification against enemies affected by Cold Status Effect[8-12]% DMG Amplification against enemies that are not affected by Cold Status Effect
Origin
+2 Strike Range Count+[10-40]% Area DMG+[10-20]% Area of Effect
Verity
+[15-30]% Chill Chance+[15-30] Freeze Rate against Chilled Enemies`.split('\n');
console.log(JSON.stringify(parseRune(lines, { name: 'Frost Wave' }), null, 1));
