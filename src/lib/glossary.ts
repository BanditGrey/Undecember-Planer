// PT-BR glossary for in-game stat text. Applied term-by-term (longest first) so unknown lines still come out mostly readable.
// Source data stays in English in db/; this only affects display when the UI language is PT.
const PHRASES: [string, string][] = [
  ['Applies to Minions when linked to Summon Skill', 'Aplica-se a Lacaios quando vinculada a uma Skill de Invocação'],
  ['Can be linked with Skills that satisfy any one of', 'Pode ser vinculada a Skills que tenham qualquer uma de:'],
  ['Can be linked with Skills that satisfy', 'Pode ser vinculada a Skills que tenham'],
  ['Cannot be linked with Skills that satisfy', 'Não pode ser vinculada a Skills que tenham'],
  ['Target Skill cannot be linked if any of the', 'A Skill alvo não pode ser vinculada se tiver qualquer uma das tags'],
  ['tags exist', ''], ['(must include all)', '(precisa ter todas)'],
  ['can be linked at once', 'pode ser vinculada por vez'], ['can be linked at a time', 'pode ser vinculada por vez'], ['Only one', 'Apenas uma'],
  ['Change Legendary effect to the following effect', 'Substitui o efeito Lendário pelo seguinte'],
  ['DMG Dampening when hitting the same target repeatedly', 'de Redução de DANO ao atingir o mesmo alvo repetidamente'],
  ['Shares Cooldowns between Rapid Seal Skills.', 'Compartilha recarga entre Skills de Selo Rápido'],
  ['Shares Cooldowns between Attack Enhance Skills', 'Compartilha recarga entre Skills de Aprimoramento de Ataque'],
  ['Shares Cooldowns between Movement Skills', 'Compartilha recarga entre Skills de Movimento'],
  ['Not affected by Active Seal Count Limit', 'Não conta para o limite de Selos ativos'],
  ['Not affected by Enhance Skill Rune Effect', 'Não é afetada por Efeito de Runa de Aprimoramento'],
  ['Skill Rune Cooldown Recovery Speed', 'Velocidade de Recarga de Runa de Skill'],
  ['Cooldown Recovery Speed', 'Velocidade de Recarga'], ['Triggers Immediately', 'Ativa imediatamente'],
  ['Affects yourself and allies', 'Afeta você e aliados'], ['Affects yourself', 'Afeta você'],
  ['Resource Cost Increase', 'Aumento de Custo de Recurso'], ['Resource Cost Amplification', 'Amplificação de Custo de Recurso'], ['Resource Cost Dampening', 'Redução de Custo de Recurso'], ['Resource Cost', 'Custo de Recurso'],
  ['Convert DMG to Main Element', 'Converte DANO para o Elemento principal'],
  ['against enemies affected by Cold Status Effect', 'contra inimigos sob Efeito de Gelo'], ['against enemies that are not affected by Cold Status Effect', 'contra inimigos sem Efeito de Gelo'],
  ['against enemies affected by Venom', 'contra inimigos Envenenados'], ['against Burning enemies', 'contra inimigos em Chamas'], ['against Shocked enemies', 'contra inimigos Eletrocutados'],
  ['against Bleeding enemies', 'contra inimigos Sangrando'], ['against Chilled enemies', 'contra inimigos Congelados'], ['against Stunned enemies', 'contra inimigos Atordoados'], ['against Disturbed enemies', 'contra inimigos Perturbados'],
  ['against Elites', 'contra Elites'], ['against Normal enemies', 'contra inimigos Normais'], ['against Bosses', 'contra Chefes'],
  ['chance to deal double Maximized DMG on hit', 'de chance de causar DANO Maximizado duplo ao acertar'], ['chance to deal triple Maximized DMG on hit', 'de chance de causar DANO Maximizado triplo ao acertar'],
  ['Freeze Rate against Chilled Enemies', 'Taxa de Congelamento contra inimigos Resfriados'],
  ['Max Use Count', 'Usos máximos'], ['Max Stacks', 'Acúmulos máx.'], ['Max Summon Count', 'Máx. de Invocações'], ['Summon Count', 'Nº de Invocações'], ['Summon Level', 'Nível da Invocação'], ['Summon Duration', 'Duração da Invocação'],
  ['Projectile Speed', 'Velocidade do Projétil'], ['Projectile Count', 'Nº de Projéteis'], ['Projectile DMG', 'DANO de Projétil'], ['Projectile Duration', 'Duração do Projétil'], ['Projectile Creation Range', 'Alcance de criação de Projétil'],
  ['Explosion Range', 'Raio de Explosão'], ['Area of Effect', 'Área de Efeito'], ['Area DMG', 'DANO em Área'], ['Weapon Range', 'Alcance da Arma'], ['Aura Range', 'Alcance da Aura'], ['Aura Radius', 'Raio da Aura'], ['Totem Effect Range', 'Alcance de Efeito do Totem'], ['Totem Range', 'Alcance do Totem'],
  ['Enhance Skill Rune Effect', 'Efeito de Runa de Aprimoramento'], ['Aura and Seal Effect', 'Efeito de Aura e Selo'], ['Skill Rune Effect', 'Efeito de Runa de Skill'], ['Totem Effect', 'Efeito do Totem'], ['Shout Skill Rune', 'Runa de Grito'], ['Rapid Seal', 'Selo Rápido'], ['Defense Seal', 'Selo de Defesa'], ['Attack Seal', 'Selo de Ataque'],
  ['Trap Detection Range', 'Alcance de Detecção da Armadilha'], ['Trap Installation Distance', 'Distância de Instalação da Armadilha'], ['Trap Install Speed', 'Velocidade de Instalação da Armadilha'], ['Simultaneous Trap Count', 'Armadilhas simultâneas'], ['Trap Projectile Count', 'Projéteis da Armadilha'], ['Trap Duration', 'Duração da Armadilha'], ['Trap Count', 'Nº de Armadilhas'], ['Max Trap Count', 'Máx. de Armadilhas'], ['Trap DMG', 'DANO de Armadilha'],
  ['Rune Knight', 'Cavaleiro Rúnico'], ['Abyssling', 'Abissal'], ['Sentry', 'Sentinela'], ['Minion', 'Lacaio'], ['Totem', 'Totem'],
  ['Status Effect Duration', 'Duração de Efeito de Estado'], ['Status Effect DMG', 'DANO de Efeito de Estado'], ['Status Effect Rate', 'Taxa de Efeito de Estado'], ['Status Effect', 'Efeito de Estado'], ['Crowd Control Rate', 'Taxa de Controle de Grupo'],
  ['Critical Rate', 'Taxa Crítica'], ['Critical Chance', 'Chance Crítica'], ['Critical DMG', 'DANO Crítico'], ['Maximized DMG', 'DANO Maximizado'], ['Hit Rate', 'Precisão'], ['Dodge Rate', 'Taxa de Esquiva'],
  ['Attack Speed', 'Velocidade de Ataque'], ['Cast Speed', 'Velocidade de Conjuração'], ['Movement Speed', 'Velocidade de Movimento'], ['Base Speed', 'Velocidade Base'],
  ['Armor Penetration', 'Penetração de Armadura'], ['Element Penetration', 'Penetração Elemental'], ['Fire Penetration', 'Penetração de Fogo'], ['Cold Penetration', 'Penetração de Gelo'], ['Lightning Penetration', 'Penetração de Raio'], ['Poison Penetration', 'Penetração de Veneno'], ['DMG Penetration', 'Penetração de DANO'],
  ['Element Resist', 'Resistência Elemental'], ['Element DMG', 'DANO Elemental'], ['Physical Element', 'Elemento Físico'], ['Fire Element', 'Elemento Fogo'], ['Cold Element', 'Elemento Gelo'], ['Lightning Element', 'Elemento Raio'], ['Poison Element', 'Elemento Veneno'],
  ['Physical DMG', 'DANO Físico'], ['Fire DMG', 'DANO de Fogo'], ['Cold DMG', 'DANO de Gelo'], ['Lightning DMG', 'DANO de Raio'], ['Poison DMG', 'DANO de Veneno'], ['Melee DMG', 'DANO Corpo a Corpo'], ['Strike DMG', 'DANO de Golpe'], ['Spell DMG', 'DANO de Magia'], ['Attack DMG', 'DANO de Ataque'], ['Burn DMG', 'DANO de Queimadura'], ['Venom DMG', 'DANO de Veneno'],
  ['Burn Chance', 'Chance de Queimar'], ['Chill Chance', 'Chance de Resfriar'], ['Chill Effect', 'Efeito de Resfriamento'], ['Shock Chance', 'Chance de Choque'], ['Shock Effect', 'Efeito de Choque'], ['Shock Rate', 'Taxa de Choque'], ['Bleed Chance', 'Chance de Sangramento'], ['Bleed Rate', 'Taxa de Sangramento'], ['Venom Chance', 'Chance de Veneno'], ['Stun Rate', 'Taxa de Atordoamento'], ['Blind Rate', 'Taxa de Cegueira'], ['Bind Rate', 'Taxa de Aprisionamento'], ['Knockback Chance', 'Chance de Repulsão'], ['Knockback Distance', 'Distância de Repulsão'], ['Disturb Effect', 'Efeito de Perturbação'], ['Freeze Rate', 'Taxa de Congelamento'],
  ['DMG Amplification', 'Amplificação de DANO'], ['DMG Dampening', 'Redução de DANO'], ['DMG Multiplier', 'Multiplicador de DANO'], ['Amplification', '(Amplificação)'], ['Dampening', '(Redução)'], ['Multiplier', 'Multiplicador'], ['Amplifies', 'Amplifica'], ['Increase', 'Aumento'], ['Decrease', 'Redução'],
  ['Mana Cost', 'Custo de Mana'], ['Cooldown', 'Recarga'], ['Duration', 'Duração'], ['Chain Count', 'Nº de Encadeamentos'], ['Chain Range', 'Alcance de Encadeamento'], ['Pierce Count', 'Nº de Perfurações'], ['Pierces All', 'Perfura tudo'], ['Cannot Pierce', 'Não perfura'], ['Strike Range Count', 'Nº de alcance de Golpe'],
  ['Overheat Accumulation', 'Acúmulo de Superaquecimento'], ['Overheat', 'Superaquecimento'], ['Tenacity Effect', 'Efeito de Tenacidade'], ['Regeneration Effect', 'Efeito de Regeneração'], ['Trigger Chance', 'Chance de Ativação'],
  ['Gear Armor', 'Armadura do Item'], ['Gear Dodge', 'Esquiva do Item'], ['Gear Barrier', 'Barreira do Item'], ['for every 1 Character Level(s)', 'por nível de personagem'], ['for every', 'a cada'], ['Character Level', 'Nível do Personagem'],
  ['2-handed Axe', 'Machado de 2 mãos'], ['2-handed sword', 'Espada de 2 mãos'], ['2-handed Blunt', 'Maça de 2 mãos'], ['1-handed sword', 'Espada de 1 mão'], ['1-handed Axe', 'Machado de 1 mão'], ['1-handed Blunt', 'Maça de 1 mão'],
  ['Steel Bow', 'Arco de Aço'], ['Spaulders', 'Ombreiras'], ['Pauldrons', 'Ombreiras'], ['Quiver', 'Aljava'], ['Magazine', 'Carregador'], ['Shield', 'Escudo'], ['Helmet', 'Elmo'], ['Gloves', 'Luvas'], ['Shoes', 'Botas'], ['Necklace', 'Colar'], ['Ring', 'Anel'], ['Belt', 'Cinto'], ['Weapons', 'Armas'], ['Offhand', 'Mão secundária'],
  ['Dagger', 'Adaga'], ['Sword', 'Espada'], ['Axe', 'Machado'], ['Blunt', 'Maça'], ['Staff', 'Cajado'], ['Scepter', 'Cetro'], ['Wand', 'Varinha'],
  ['Shield Block Chance', 'Chance de Bloqueio com Escudo'], ['Block Chance', 'Chance de Bloqueio'], ['Unique', 'Único'], ['Max', 'Máx.'],
  ['Link Rune Effect', 'Efeito de Runa de Vínculo'], ['Red Link Rune', 'Runa de Vínculo Vermelha'], ['Green Link Rune', 'Runa de Vínculo Verde'], ['Blue Link Rune', 'Runa de Vínculo Azul'], ['on linked Skill Rune', 'na Runa de Skill vinculada'], ['Link Rune', 'Runa de Vínculo'], ['Skill Rune', 'Runa de Skill'], ['Cannot link', 'Não pode vincular'], ['Gain', 'Ganha'], ['Change to Aura', 'Vira Aura'], ['Change to', 'Muda para'], ['Add', 'Adiciona'], ['Remove', 'Remove'], ['tag', 'tag'],
  ['Armor', 'Armadura'], ['Speed', 'Velocidade'], ['Range', 'Alcance'], ['Count', 'Quantidade'], ['Effect', 'Efeito'], ['Level', 'Nível'], ['Rate', 'Taxa'], ['Chance', 'Chance'], ['Cost', 'Custo'], ['Mana', 'Mana'], ['Skills', 'Skills'], ['Skill', 'Skill'], ['DMG', 'DANO'], ['HP', 'HP'],
  ['Requires', 'Requer'], ['Strength', 'Força'], ['Dexterity', 'Destreza'], ['Intelligence', 'Inteligência'],
  ['Attack', 'Ataque'], ['Spell', 'Magia'], ['Melee', 'Corpo a Corpo'], ['Projectile', 'Projétil'], ['Strike', 'Golpe'], ['Fire', 'Fogo'], ['Cold', 'Gelo'], ['Lightning', 'Raio'], ['Poison', 'Veneno'], ['Physical', 'Físico'], ['Movement', 'Movimento'], ['Channel', 'Canalização'], ['Trap', 'Armadilha'], ['Shout', 'Grito'], ['Toggle', 'Alternável'], ['Shadow', 'Sombra'], ['Bow', 'Arco'], ['Bowgun', 'Besta'],
  ['Red', 'Vermelha'], ['Green', 'Verde'], ['Blue', 'Azul'], ['White', 'Branca'],
  ['when', 'quando'], ['while', 'enquanto'], ['for', 'por'], ['upon', 'ao'], ['per', 'por'], ['on hit', 'ao acertar'], ['enemies', 'inimigos'], ['enemy', 'inimigo'], ['and', 'e'], ['or', 'ou'],
];
const RE = PHRASES.map(([en, pt]) => [new RegExp(`(?<![A-Za-z])${en.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?![A-Za-z])`, 'g'), pt] as const);
const cache = new Map<string, string>();
export function pt(line: string): string {
  if (!line) return line;
  // Long prose (descriptions) would come out half-translated; keep it in English.
  if (line.split(' ').length > 14 && !/linked|Skills that/i.test(line)) return line; const c = cache.get(line); if (c) return c;
  let out = line; for (const [re, rep] of RE) out = out.replace(re, rep);
  out = out.replace(/\s{2,}/g, ' ').trim(); cache.set(line, out); return out;
}

// Hand-translated skill descriptions (data/i18n/pt/rune_descriptions.json)
import descPt from '../../data/i18n/pt/rune_descriptions.json';
const DESC: Record<string, string> = descPt as any;
const GENERIC: [string, string][] = Object.entries((descPt as any)._generic as Record<string, string>)
  .sort((a, b) => b[0].length - a[0].length);

/** PT description for a rune: exact translation by slug, else generic sentence replacement, else original. */
export function ptDescription(slug: string, text: string): string {
  if (!text) return text;
  if (DESC[slug]) return DESC[slug];
  let out = text;
  for (const [en, p] of GENERIC) out = out.split(en).join(p);
  return out === text ? pt(text) : out.replace(/\s+/g, ' ').trim();
}
