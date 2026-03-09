// D&D 2024 (5.5e) statikus konstansok – nem API adat, nem változik futás közben

export type Ability = 'STR' | 'DEX' | 'CON' | 'INT' | 'WIS' | 'CHA'
export type CasterType = 'full' | 'half' | 'third' | 'warlock' | 'none'

export const ABILITIES: Ability[] = ['STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA']

// Proficiency Bonus szintenként (index = szint, index 0 = null)
export const PROFICIENCY_BONUS: (number | null)[] = [
  null, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 6, 6, 6, 6,
]

// Ability Score elosztás módszerek
export const STANDARD_ARRAY = [15, 14, 13, 12, 10, 8]

// Point Buy: score → pont (8-tól indul, 27 pont összesen)
export const POINT_BUY_COSTS: Record<number, number> = {
  8: 0, 9: 1, 10: 2, 11: 3, 12: 4, 13: 5, 14: 7, 15: 9,
}
export const POINT_BUY_TOTAL = 27

// 17 skill D&D 2024-ben
export interface SkillDef {
  key: string
  name: string
  ability: Ability
}

export const SKILLS: SkillDef[] = [
  { key: 'acrobatics',     name: 'Acrobatics',     ability: 'DEX' },
  { key: 'animalHandling', name: 'Animal Handling', ability: 'WIS' },
  { key: 'arcana',         name: 'Arcana',          ability: 'INT' },
  { key: 'athletics',      name: 'Athletics',       ability: 'STR' },
  { key: 'deception',      name: 'Deception',       ability: 'CHA' },
  { key: 'history',        name: 'History',         ability: 'INT' },
  { key: 'insight',        name: 'Insight',         ability: 'WIS' },
  { key: 'intimidation',   name: 'Intimidation',    ability: 'CHA' },
  { key: 'investigation',  name: 'Investigation',   ability: 'INT' },
  { key: 'medicine',       name: 'Medicine',        ability: 'WIS' },
  { key: 'nature',         name: 'Nature',          ability: 'INT' },
  { key: 'perception',     name: 'Perception',      ability: 'WIS' },
  { key: 'performance',    name: 'Performance',     ability: 'CHA' },
  { key: 'persuasion',     name: 'Persuasion',      ability: 'CHA' },
  { key: 'sleightOfHand',  name: 'Sleight of Hand', ability: 'DEX' },
  { key: 'stealth',        name: 'Stealth',         ability: 'DEX' },
  { key: 'survival',       name: 'Survival',        ability: 'WIS' },
]

// Kaszt → Mentődobás jártasságok (2024 PHB)
export const CLASS_SAVING_THROWS: Record<string, Ability[]> = {
  barbarian:  ['STR', 'CON'],
  bard:       ['DEX', 'CHA'],
  cleric:     ['WIS', 'CHA'],
  druid:      ['INT', 'WIS'],
  fighter:    ['STR', 'CON'],
  monk:       ['STR', 'DEX'],
  paladin:    ['WIS', 'CHA'],
  ranger:     ['STR', 'WIS'],
  rogue:      ['DEX', 'INT'],
  sorcerer:   ['CON', 'CHA'],
  warlock:    ['WIS', 'CHA'],
  wizard:     ['INT', 'WIS'],
  artificer:  ['CON', 'INT'],
}

// Kaszt → Hit Die (szöveges, megjelenítéshez)
export const CLASS_HIT_DICE: Record<string, string> = {
  barbarian: 'd12',
  bard:      'd8',
  cleric:    'd8',
  druid:     'd8',
  fighter:   'd10',
  monk:      'd8',
  paladin:   'd10',
  ranger:    'd10',
  rogue:     'd8',
  sorcerer:  'd6',
  warlock:   'd8',
  wizard:    'd6',
  artificer: 'd8',
}

// Kaszt → Hit Die numerikus értéke (HP számításhoz)
export const HIT_DIE_VALUES: Record<string, number> = {
  barbarian: 12, bard: 8, cleric: 8, druid: 8, fighter: 10,
  monk: 8, paladin: 10, ranger: 10, rogue: 8, sorcerer: 6,
  warlock: 8, wizard: 6, artificer: 8,
}

// Fegyverlisták az SRD 5.2.1 Equipment szekciójából (90. oldal)
export const SIMPLE_MELEE_WEAPONS = [
  'Club', 'Dagger', 'Greatclub', 'Handaxe', 'Javelin',
  'Light Hammer', 'Mace', 'Quarterstaff', 'Sickle', 'Spear',
]
export const MARTIAL_MELEE_WEAPONS = [
  'Battleaxe', 'Flail', 'Glaive', 'Greataxe', 'Greatsword',
  'Halberd', 'Lance', 'Longsword', 'Maul', 'Morningstar',
  'Pike', 'Rapier', 'Scimitar', 'Shortsword', 'Trident',
  'War Pick', 'Warhammer', 'Whip',
]
export const SIMPLE_RANGED_WEAPONS = ['Dart', 'Light Crossbow', 'Shortbow', 'Sling']
export const MARTIAL_RANGED_WEAPONS = ['Blowgun', 'Hand Crossbow', 'Heavy Crossbow', 'Longbow', 'Musket', 'Pistol']

// Kaszt → Weapon Mastery választás (SRD 5.2.1)
// Barbarian: 2 melee | Fighter: 3 bármilyen | Paladin/Ranger: 2 bármilyen
const ALL_WEAPONS = [...SIMPLE_MELEE_WEAPONS, ...MARTIAL_MELEE_WEAPONS, ...SIMPLE_RANGED_WEAPONS, ...MARTIAL_RANGED_WEAPONS]
// Barbarian: csak melee fegyverek (D&D 2024 PHB)
const BARBARIAN_MELEE_WEAPONS = [...SIMPLE_MELEE_WEAPONS, ...MARTIAL_MELEE_WEAPONS]
// Monk: Simple fegyverek + Shortsword (D&D 2024)
const MONK_WEAPONS = [...SIMPLE_MELEE_WEAPONS, ...SIMPLE_RANGED_WEAPONS, 'Shortsword']
// Rogue: Simple fegyverek + proficienciájuk martialjai (Shortsword, Rapier, Hand Crossbow)
const ROGUE_WEAPONS = [...SIMPLE_MELEE_WEAPONS, ...SIMPLE_RANGED_WEAPONS, 'Shortsword', 'Rapier', 'Hand Crossbow']

export const CLASS_WEAPON_MASTERY: Record<string, { count: number; weapons: string[] }> = {
  barbarian: { count: 2, weapons: BARBARIAN_MELEE_WEAPONS },
  fighter:   { count: 3, weapons: ALL_WEAPONS },
  monk:      { count: 2, weapons: MONK_WEAPONS },
  paladin:   { count: 2, weapons: ALL_WEAPONS },
  ranger:    { count: 2, weapons: ALL_WEAPONS },
  rogue:     { count: 2, weapons: ROGUE_WEAPONS },
}

// Expertise – Rogue 1. szintű feature (D&D 2024)
export const EXPERTISE_CLASSES = new Set(['rogue'])
export const WEAPON_MASTERY_CLASSES = new Set(Object.keys(CLASS_WEAPON_MASTERY))

// Hangszer lista (SRD 5.2.1)
export const MUSICAL_INSTRUMENTS = [
  'Bagpipes', 'Drum', 'Dulcimer', 'Flute', 'Lute',
  'Lyre', 'Horn', 'Pan Flute', 'Shawm', 'Viol',
]

// Kaszt → Hangszer jártasság választás (SRD 5.2.1)
// Bard: 3 Musical Instrument of your choice
export const CLASS_INSTRUMENT_PROFICIENCIES: Record<string, { count: number }> = {
  bard:  { count: 3 },
  monk:  { count: 1 },
}
export const INSTRUMENT_PROFICIENCY_CLASSES = new Set(Object.keys(CLASS_INSTRUMENT_PROFICIENCIES))

// Kaszt → Armor / Weapon / Tool jártasságok (D&D 2024 PHB)
export const CLASS_PROFICIENCIES: Record<string, { armor: string[]; weapons: string[]; tools: string[] }> = {
  barbarian: { armor: ['Light', 'Medium', 'Shields'],          weapons: ['Simple', 'Martial'],                                                    tools: [] },
  bard:      { armor: ['Light'],                               weapons: ['Simple', 'Hand Crossbow', 'Longsword', 'Rapier', 'Shortsword'],          tools: [] },
  cleric:    { armor: ['Light', 'Medium', 'Shields'],          weapons: ['Simple'],                                                               tools: [] },
  druid:     { armor: ['Light', 'Medium', 'Shields (non-metal)'], weapons: ['Simple'],                                                            tools: ['Herbalism Kit'] },
  fighter:   { armor: ['Light', 'Medium', 'Heavy', 'Shields'], weapons: ['Simple', 'Martial'],                                                    tools: [] },
  monk:      { armor: [],                                      weapons: ['Simple', 'Shortsword'],                                                  tools: [] },
  paladin:   { armor: ['Light', 'Medium', 'Heavy', 'Shields'], weapons: ['Simple', 'Martial'],                                                    tools: [] },
  ranger:    { armor: ['Light', 'Medium', 'Shields'],          weapons: ['Simple', 'Martial'],                                                    tools: [] },
  rogue:     { armor: ['Light'],                               weapons: ['Simple', 'Hand Crossbow', 'Longsword', 'Rapier', 'Shortsword'],          tools: ["Thieves' Tools"] },
  sorcerer:  { armor: [],                                      weapons: ['Dagger', 'Dart', 'Sling', 'Quarterstaff', 'Light Crossbow'],             tools: [] },
  warlock:   { armor: ['Light'],                               weapons: ['Simple'],                                                               tools: [] },
  wizard:    { armor: [],                                      weapons: ['Dagger', 'Dart', 'Sling', 'Quarterstaff', 'Light Crossbow'],             tools: [] },
}

// Divine Order – Cleric 1. szintű feature (SRD 5.2.1)
export const DIVINE_ORDERS = [
  {
    key: 'protector',
    name: 'Protector',
    description: 'Proficiency with Martial weapons and Heavy armor. You can use these weapons and armor without penalty.',
  },
  {
    key: 'thaumaturge',
    name: 'Thaumaturge',
    description: 'You learn one extra cantrip from the Cleric spell list. Your magical study broadens your arcane understanding.',
  },
]
export const DIVINE_ORDER_CLASSES = new Set(['cleric'])

// Primal Order – Druid 1. szintű feature (D&D 2024)
export const PRIMAL_ORDERS = [
  {
    key: 'magician',
    name: 'Magician',
    description: 'You know one extra cantrip from the Druid spell list. You can use an Arcane Focus or Druidic Focus as your spellcasting focus.',
  },
  {
    key: 'warden',
    name: 'Warden',
    description: 'You gain proficiency with Martial weapons and training with Medium armor, allowing you to wade into battle alongside your allies.',
  },
]
export const PRIMAL_ORDER_CLASSES = new Set(['druid'])

// Eldritch Invocations – Warlock 1. szintű feature (D&D 2024)
// 1. szinten 1 invocation választható, szint-előfeltétel nélküli opciók
export const ELDRITCH_INVOCATIONS = [
  {
    key: 'agonizing_blast',
    name: 'Agonizing Blast',
    description: 'Eldritch Blast cantripedhez add hozzá a CHA módosítódat minden egyes sugár sebzéséhez.',
  },
  {
    key: 'armor_of_shadows',
    name: 'Armor of Shadows',
    description: 'Mage Armort önmagadra bármikor előidézhetsz spell slot felhasználása nélkül.',
  },
  {
    key: 'beast_speech',
    name: 'Beast Speech',
    description: 'Speak with Animals varázslatot bármikor előidézhetsz spell slot felhasználása nélkül.',
  },
  {
    key: 'beguiling_influence',
    name: 'Beguiling Influence',
    description: 'Jártasságot szerzel a Deception és a Persuasion skillekben.',
  },
  {
    key: 'devils_sight',
    name: "Devil's Sight",
    description: 'Normálisan látsz mágikus és nem mágikus sötétségben 120 láb távolságig.',
  },
  {
    key: 'eldritch_mind',
    name: 'Eldritch Mind',
    description: 'Előnyt kapsz a Concentration megtartásához szükséges Constitution mentődobásokra.',
  },
  {
    key: 'eldritch_sight',
    name: 'Eldritch Sight',
    description: 'Detect Magic varázslatot bármikor előidézhetsz spell slot felhasználása nélkül.',
  },
  {
    key: 'fiendish_vigor',
    name: 'Fiendish Vigor',
    description: 'False Life varázslatot (1. szint) önmagadra bármikor előidézhetsz spell slot felhasználása nélkül.',
  },
  {
    key: 'mask_of_many_faces',
    name: 'Mask of Many Faces',
    description: 'Disguise Self varázslatot bármikor előidézhetsz spell slot felhasználása nélkül.',
  },
  {
    key: 'misty_visions',
    name: 'Misty Visions',
    description: 'Silent Image varázslatot bármikor előidézhetsz spell slot felhasználása nélkül.',
  },
  {
    key: 'pact_of_the_blade',
    name: 'Pact of the Blade',
    description: 'Pact Weapon-t idézhetsz elő. Varázslói támadás módosítódat használhatod a fegyverhez.',
  },
  {
    key: 'pact_of_the_chain',
    name: 'Pact of the Chain',
    description: 'Find Familiar varázslatot ismered, és speciális familiar típusok közül választhatsz (imp, pseudodragon, quasit, sprite).',
  },
  {
    key: 'pact_of_the_tome',
    name: 'Pact of the Tome',
    description: 'Book of Shadows-t kapsz, amelybe bármely kaszt listájáról 3 cantripet jegyezhetsz be.',
  },
  {
    key: 'repelling_blast',
    name: 'Repelling Blast',
    description: 'Eldritch Blast cantrip sikeres találata esetén a célt 10 lábbal taszítod el magadtól.',
  },
]
export const ELDRITCH_INVOCATION_COUNT = 1
export const ELDRITCH_INVOCATION_CLASSES = new Set(['warlock'])

// Dragonborn – Draconic Ancestry (D&D 2024 PHB)
export interface DraconicAncestry {
  key: string
  name: string
  damageType: string
  breathShape: string
}
export const DRAGONBORN_ANCESTRIES: DraconicAncestry[] = [
  { key: 'black',  name: 'Black',  damageType: 'Acid',      breathShape: 'Line (5 × 30 ft)' },
  { key: 'blue',   name: 'Blue',   damageType: 'Lightning', breathShape: 'Line (5 × 30 ft)' },
  { key: 'brass',  name: 'Brass',  damageType: 'Fire',      breathShape: 'Line (5 × 30 ft)' },
  { key: 'bronze', name: 'Bronze', damageType: 'Lightning', breathShape: 'Line (5 × 30 ft)' },
  { key: 'copper', name: 'Copper', damageType: 'Acid',      breathShape: 'Line (5 × 30 ft)' },
  { key: 'gold',   name: 'Gold',   damageType: 'Fire',      breathShape: 'Cone (15 ft)' },
  { key: 'green',  name: 'Green',  damageType: 'Poison',    breathShape: 'Cone (15 ft)' },
  { key: 'red',    name: 'Red',    damageType: 'Fire',      breathShape: 'Cone (15 ft)' },
  { key: 'silver', name: 'Silver', damageType: 'Cold',      breathShape: 'Cone (15 ft)' },
  { key: 'white',  name: 'White',  damageType: 'Cold',      breathShape: 'Cone (15 ft)' },
]
export const SPECIES_NEEDS_ANCESTRY = new Set(['dragonborn'])

// Elf – Elven Lineage (D&D 2024 PHB)
export interface ElvenLineage {
  key: string
  name: string
  darkvision: number
  cantrip: string
  level3Spell: string
  level5Spell: string
}
export const ELVEN_LINEAGES: ElvenLineage[] = [
  {
    key: 'drow',
    name: 'Drow',
    darkvision: 120,
    cantrip: 'Dancing Lights',
    level3Spell: 'Faerie Fire',
    level5Spell: 'Darkness',
  },
  {
    key: 'high_elf',
    name: 'High Elf',
    darkvision: 60,
    cantrip: 'Prestidigitation',
    level3Spell: 'Detect Magic',
    level5Spell: 'Misty Step',
  },
  {
    key: 'wood_elf',
    name: 'Wood Elf',
    darkvision: 60,
    cantrip: 'Druidcraft',
    level3Spell: 'Longstrider',
    level5Spell: 'Pass without Trace',
  },
]
// Elf Keen Senses: 1 skill jártasság a 3 közül
export const ELF_KEEN_SENSES_SKILLS = ['insight', 'perception', 'survival']
export const SPECIES_NEEDS_LINEAGE = new Set(['elf'])

// Gnome – Gnomish Lineage (D&D 2024 PHB)
export interface GnomishLineage {
  key: string
  name: string
  cantrips: string[]
  needsSpellcastingAbility: boolean  // Forest: player picks INT/WIS/CHA; Rock: always INT
}
export const GNOMISH_LINEAGES: GnomishLineage[] = [
  { key: 'forest', name: 'Forest Gnome', cantrips: ['Minor Illusion'],              needsSpellcastingAbility: true  },
  { key: 'rock',   name: 'Rock Gnome',   cantrips: ['Mending', 'Prestidigitation'], needsSpellcastingAbility: false },
]
export const SPECIES_NEEDS_GNOMISH_LINEAGE = new Set(['gnome'])

// Goliath – Giant Ancestry (D&D 2024 PHB)
export interface GiantAncestry {
  key: string
  name: string
  description: string
}
export const GIANT_ANCESTRIES: GiantAncestry[] = [
  { key: 'cloud', name: "Cloud's Jaunt",     description: "Bonus Action: Invisible until start of next turn (1/Long Rest)" },
  { key: 'fire',  name: "Fire's Burn",       description: "On hit: extra Fire damage = Proficiency Bonus (1/turn)" },
  { key: 'frost', name: "Frost's Chill",     description: "On hit: extra Cold damage + Slow (CON save, 1/Long Rest)" },
  { key: 'hill',  name: "Hill's Tumble",     description: "On hit: knock Prone (DEX save, 1/Long Rest)" },
  { key: 'stone', name: "Stone's Endurance", description: "Reaction: reduce damage by 1d12 + CON mod (1/Short or Long Rest)" },
  { key: 'storm', name: "Storm's Thunder",   description: "After being hit: Thunder damage in 10 ft. (1/Long Rest)" },
]
export const SPECIES_NEEDS_GIANT_ANCESTRY = new Set(['goliath'])

// Tiefling – Fiendish Legacy (D&D 2024 PHB)
export interface TieflingLegacy {
  key: string
  name: string
  resistance: string
  cantrip: string
  level3Spell: string
  level5Spell: string
}
export const TIEFLING_LEGACIES: TieflingLegacy[] = [
  { key: 'abyssal',  name: 'Abyssal',  resistance: 'Poison',   cantrip: 'Poison Spray', level3Spell: 'Ray of Sickness',     level5Spell: 'Hold Person' },
  { key: 'chthonic', name: 'Chthonic', resistance: 'Necrotic', cantrip: 'Chill Touch',  level3Spell: 'False Life',          level5Spell: 'Ray of Enfeeblement' },
  { key: 'infernal', name: 'Infernal', resistance: 'Fire',     cantrip: 'Fire Bolt',    level3Spell: 'Hellish Rebuke',      level5Spell: 'Darkness' },
]
export const SPECIES_NEEDS_TIEFLING_LEGACY = new Set(['tiefling'])

// Human – Skillful (+1 bármilyen skill) és Versatile (+1 Origin Feat)
export const SPECIES_NEEDS_HUMAN_TRAITS = new Set(['human'])
export const ORIGIN_FEAT_KEYS = [
  'alert', 'crafter', 'lucky', 'magic-initiate', 'musician',
  'savage-attacker', 'skilled', 'tavern-brawler', 'tough',
]

// D&D 2024 állapotok (conditions)
export const DND_CONDITIONS = [
  'Blinded', 'Charmed', 'Deafened', 'Exhaustion', 'Frightened',
  'Grappled', 'Incapacitated', 'Invisible', 'Paralyzed', 'Petrified',
  'Poisoned', 'Prone', 'Restrained', 'Stunned', 'Unconscious',
] as const

// D&D 2024 fajok darkvision (láb, 0 = nincs)
export const SPECIES_DARKVISION: Record<string, number> = {
  aasimar:  60,
  dwarf:   120,
  gnome:    60,
  orc:     120,
  tiefling: 60,
}

// D&D 2024 fajok alapsebesség (láb)
export const SPECIES_SPEED: Record<string, number> = {
  aasimar:    30,
  dragonborn: 30,
  dwarf:      30,
  elf:        30,
  gnome:      30,
  goliath:    35,
  halfling:   30,
  human:      30,
  orc:        30,
  tiefling:   30,
}

// Csak méretet kell választani, semmi mást (Aasimar)
export const SPECIES_NEEDS_SIZE_ONLY = new Set(['aasimar'])
// Species méret választás (Medium vagy Small)
export const SPECIES_NEEDS_SIZE = new Set(['human', 'tiefling', 'aasimar'])

// Kaszt → Skill Proficiency választás (SRD 5.2.1)
// skills: [] = bármelyik skill (Bard eset)
export const CLASS_SKILL_PROFICIENCIES: Record<string, { count: number; skills: string[] }> = {
  barbarian: { count: 2, skills: ['animalHandling', 'athletics', 'intimidation', 'nature', 'perception', 'survival'] },
  bard:      { count: 3, skills: [] },
  cleric:    { count: 2, skills: ['history', 'insight', 'medicine', 'persuasion', 'religion'] },
  druid:     { count: 2, skills: ['animalHandling', 'arcana', 'insight', 'medicine', 'nature', 'perception', 'religion', 'survival'] },
  fighter:   { count: 2, skills: ['acrobatics', 'animalHandling', 'athletics', 'history', 'insight', 'intimidation', 'persuasion', 'perception', 'survival'] },
  monk:      { count: 2, skills: ['acrobatics', 'athletics', 'history', 'insight', 'religion', 'stealth'] },
  paladin:   { count: 2, skills: ['athletics', 'insight', 'intimidation', 'medicine', 'persuasion', 'religion'] },
  ranger:    { count: 3, skills: ['animalHandling', 'athletics', 'insight', 'investigation', 'nature', 'perception', 'stealth', 'survival'] },
  rogue:     { count: 4, skills: ['acrobatics', 'athletics', 'deception', 'insight', 'intimidation', 'investigation', 'perception', 'persuasion', 'sleightOfHand', 'stealth'] },
  sorcerer:  { count: 2, skills: ['arcana', 'deception', 'insight', 'intimidation', 'persuasion', 'religion'] },
  warlock:   { count: 2, skills: ['arcana', 'deception', 'history', 'intimidation', 'investigation', 'nature', 'religion'] },
  wizard:    { count: 2, skills: ['arcana', 'history', 'insight', 'investigation', 'medicine', 'nature', 'religion'] },
}

// Standard Languages (SRD 5.2.1, 20. oldal)
// Common automatikus – a játékos ebből a listából választ 2 további nyelvet
export const STANDARD_LANGUAGES = [
  'Common',
  'Common Sign Language',
  'Draconic',
  'Dwarvish',
  'Elvish',
  'Giant',
  'Gnomish',
  'Goblin',
  'Halfling',
  'Orc',
]

// Háttér → 3 választható Ability Score (D&D 2024 PHB)
// A játékos +2/+1 vagy +1/+1/+1 elosztást választhat a felsorolt képességek között
export const BACKGROUND_ABILITY_OPTIONS: Record<string, Ability[]> = {
  acolyte:     ['INT', 'WIS', 'CHA'],
  artisan:     ['STR', 'DEX', 'INT'],
  charlatan:   ['DEX', 'CON', 'CHA'],
  criminal:    ['DEX', 'CON', 'INT'],
  entertainer: ['STR', 'DEX', 'CHA'],
  farmer:      ['STR', 'CON', 'WIS'],
  guard:       ['STR', 'INT', 'WIS'],
  guide:       ['DEX', 'INT', 'WIS'],
  hermit:      ['CON', 'INT', 'WIS'],
  merchant:    ['CON', 'INT', 'CHA'],
  noble:       ['STR', 'INT', 'CHA'],
  sage:        ['CON', 'INT', 'WIS'],
  sailor:      ['STR', 'DEX', 'CON'],
  scribe:      ['DEX', 'INT', 'WIS'],
  soldier:     ['STR', 'DEX', 'CON'],
  wayfarer:    ['DEX', 'INT', 'CHA'],
}

// Háttér → Origin Feat kulcs (D&D 2024 PHB)
export const BACKGROUND_ORIGIN_FEAT: Record<string, string> = {
  'acolyte':    'magic-initiate',
  'artisan':    'crafter',
  'charlatan':  'skilled',
  'criminal':   'alert',
  'entertainer':'musician',
  'farmer':     'tough',
  'guard':      'alert',
  'guide':      'magic-initiate',
  'hermit':     'magic-initiate',
  'merchant':   'lucky',
  'noble':      'skilled',
  'sage':       'magic-initiate',
  'sailor':     'tavern-brawler',
  'scribe':     'skilled',
  'soldier':    'savage-attacker',
  'wayfarer':   'lucky',
}

// Háttér → Magic Initiate spell lista (csak azoknak, akik magic-initiate feat-et kapnak)
export const BACKGROUND_MAGIC_INITIATE_CLASS: Record<string, string> = {
  'acolyte': 'Cleric',
  'guide':   'Druid',
  'hermit':  'Druid',
  'sage':    'Wizard',
}
export const MAGIC_INITIATE_BACKGROUNDS = new Set(Object.keys(BACKGROUND_MAGIC_INITIATE_CLASS))

// Kaszt → Varázsló típus
export const CLASS_CASTER_TYPE: Record<string, CasterType> = {
  barbarian: 'none',  fighter:  'none',   monk:     'none',   rogue:    'none',
  bard:      'full',  cleric:   'full',   druid:    'full',   sorcerer: 'full',   wizard: 'full',
  paladin:   'half',  ranger:   'half',
  artificer: 'third',
  warlock:   'warlock',
}

// Spell Slot táblák – index 0 = null, index 1 = 1. szint, stb.
// Minden sor: [1st, 2nd, 3rd, 4th, 5th, 6th, 7th, 8th, 9th] slot count
// null = nincs slot ezen a szinten

const FULL_CASTER_SLOTS: (number[] | null)[] = [
  null,
  [2,0,0,0,0,0,0,0,0], [3,0,0,0,0,0,0,0,0], [4,2,0,0,0,0,0,0,0], [4,3,0,0,0,0,0,0,0],
  [4,3,2,0,0,0,0,0,0], [4,3,3,0,0,0,0,0,0], [4,3,3,1,0,0,0,0,0], [4,3,3,2,0,0,0,0,0],
  [4,3,3,3,1,0,0,0,0], [4,3,3,3,2,0,0,0,0], [4,3,3,3,2,1,0,0,0], [4,3,3,3,2,1,0,0,0],
  [4,3,3,3,2,1,1,0,0], [4,3,3,3,2,1,1,0,0], [4,3,3,3,2,1,1,1,0], [4,3,3,3,2,1,1,1,0],
  [4,3,3,3,2,1,1,1,1], [4,3,3,3,3,1,1,1,1], [4,3,3,3,3,2,1,1,1], [4,3,3,3,3,2,2,1,1],
]

const HALF_CASTER_SLOTS: (number[] | null)[] = [
  null,
  null,
  [2,0,0,0,0,0,0,0,0], [3,0,0,0,0,0,0,0,0], [3,0,0,0,0,0,0,0,0],
  [4,2,0,0,0,0,0,0,0], [4,2,0,0,0,0,0,0,0], [4,3,0,0,0,0,0,0,0], [4,3,0,0,0,0,0,0,0],
  [4,3,2,0,0,0,0,0,0], [4,3,2,0,0,0,0,0,0], [4,3,3,0,0,0,0,0,0], [4,3,3,0,0,0,0,0,0],
  [4,3,3,1,0,0,0,0,0], [4,3,3,1,0,0,0,0,0], [4,3,3,2,0,0,0,0,0], [4,3,3,2,0,0,0,0,0],
  [4,3,3,3,1,0,0,0,0], [4,3,3,3,1,0,0,0,0], [4,3,3,3,2,0,0,0,0], [4,3,3,3,2,0,0,0,0],
]

const THIRD_CASTER_SLOTS: (number[] | null)[] = [
  null,
  null,
  [2,0,0,0,0,0,0,0,0], [3,0,0,0,0,0,0,0,0], [3,2,0,0,0,0,0,0,0],
  [3,3,0,0,0,0,0,0,0], [3,3,0,0,0,0,0,0,0], [4,3,2,0,0,0,0,0,0], [4,3,3,0,0,0,0,0,0],
  [4,3,3,0,0,0,0,0,0], [4,3,3,1,0,0,0,0,0], [4,3,3,2,0,0,0,0,0], [4,3,3,2,0,0,0,0,0],
  [4,3,3,2,1,0,0,0,0], [4,3,3,2,1,0,0,0,0], [4,3,3,2,1,0,0,0,0], [4,3,3,2,1,1,0,0,0],
  [4,3,3,2,1,1,0,0,0], [4,3,3,3,1,1,0,0,0], [4,3,3,3,2,1,0,0,0], [4,3,3,3,2,1,0,0,0],
]

export const SPELL_SLOTS: Record<string, (number[] | null)[]> = {
  wizard:   FULL_CASTER_SLOTS,
  sorcerer: FULL_CASTER_SLOTS,
  cleric:   FULL_CASTER_SLOTS,
  druid:    FULL_CASTER_SLOTS,
  bard:     FULL_CASTER_SLOTS,
  paladin:  HALF_CASTER_SLOTS,
  ranger:   HALF_CASTER_SLOTS,
  artificer: THIRD_CASTER_SLOTS,
}

// Warlock Pact Magic – index 0 = 1. szint
// slots: hány Pact slot van | slotLevel: milyen szintű
export const WARLOCK_PACT = {
  slots:     [1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 3, 3, 3, 3, 3, 3, 4, 4, 4, 4],
  slotLevel: [1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5],
}

// --- Spellcasting (1. szint) ---

export type SpellsKnownFormula = number | 'wis+level' | 'wis+half' | 'cha+half'

export interface ClassSpellcastingInfo {
  cantripsKnown: number
  spellsKnown: SpellsKnownFormula
  isPrepared: boolean  // true = naponta változtatható (Cleric, Druid)
}

// Kasztok amelyek level 1-en kapnak spell slotot (Paladin, Ranger félvarázslók, de level 1-en kapnak slotot)
export const CLASS_SPELLCASTING: Record<string, ClassSpellcastingInfo> = {
  bard:     { cantripsKnown: 2, spellsKnown: 2,            isPrepared: false },
  cleric:   { cantripsKnown: 3, spellsKnown: 'wis+level',  isPrepared: true  },
  druid:    { cantripsKnown: 2, spellsKnown: 'wis+level',  isPrepared: true  },
  paladin:  { cantripsKnown: 0, spellsKnown: 'cha+half',   isPrepared: true  },
  ranger:   { cantripsKnown: 0, spellsKnown: 'wis+half',   isPrepared: true  },
  sorcerer: { cantripsKnown: 4, spellsKnown: 2,            isPrepared: false },
  warlock:  { cantripsKnown: 2, spellsKnown: 2,            isPrepared: false },
  wizard:   { cantripsKnown: 3, spellsKnown: 6,            isPrepared: false },
}

export const SPELLCASTING_CLASSES = new Set(Object.keys(CLASS_SPELLCASTING))

// Kaszt neve az open5e spell.classes[] mezőjében
export const CLASS_SPELL_NAME: Record<string, string> = {
  bard:     'Bard',
  cleric:   'Cleric',
  druid:    'Druid',
  paladin:  'Paladin',
  ranger:   'Ranger',
  sorcerer: 'Sorcerer',
  warlock:  'Warlock',
  wizard:   'Wizard',
}

// --- PHB 2024 Subclass leírások ---

export interface SubclassInfo {
  name: string
  description: string
}

export const CLASS_SUBCLASSES: Record<string, SubclassInfo[]> = {
  barbarian: [
    { name: 'Path of the Berserker',   description: 'A path of untrammeled fury and bloodlust. You can enter a Frenzy during your Rage, making additional attacks at the cost of exhaustion. At higher levels you become immune to being Charmed or Frightened while raging, and can retaliate against attackers.' },
    { name: 'Path of the Wild Heart',  description: 'You forge a spiritual bond with the animal world. You can call on the powers of different animals, gaining aspects such as a Bear\'s resilience, an Eagle\'s speed, or a Wolf\'s pack instinct. Speak with Animals becomes available to you at will.' },
    { name: 'Path of the World Tree',  description: 'You draw power from Yggdrasil, the great cosmic World Tree. Your Rage lets you send vines to restrain foes, teleport along the tree\'s branches, and eventually travel between planes. You can also share your Rage\'s benefits with nearby allies.' },
    { name: 'Path of the Zealot',      description: 'Divine forces have marked you as a weapon of the gods. Your strikes carry radiant or necrotic energy, and you are so driven by holy fury that you can keep fighting even past death. At higher levels, resurrecting you requires no material cost.' },
  ],
  bard: [
    { name: 'College of Dance',   description: 'You express magic through movement. Your footwork empowers your spells, and you can use a Bonus Action to grant an ally extra movement and the ability to avoid opportunity attacks. At higher levels you and nearby allies move with supernatural grace.' },
    { name: 'College of Glamour', description: 'Your magic is steeped in the otherworldly beauty of the Feywild. You can weave a mantle of inspiration that bestows Temporary Hit Points, and charm audiences with a beguiling performance. Later, you can summon a veil of glamour to reshape how creatures perceive you.' },
    { name: 'College of Lore',    description: 'You collect knowledge and secrets from every corner of existence. You gain proficiency in additional skills, can undermine a foe\'s rolls with Cutting Words, and eventually learn spells from any class list, making you the ultimate arcane generalist.' },
    { name: 'College of Valor',   description: 'You recount the tales of heroes who stood against impossible odds. You gain martial weapon and armor proficiency, can use your Bardic Inspiration to boost attack rolls and damage, and eventually make an extra attack as part of the Cast a Spell action.' },
  ],
  cleric: [
    { name: 'Life Domain',     description: 'You are a conduit of divine healing energy. Your healing spells restore more Hit Points, and you can preserve a fallen ally\'s life with your Channel Divinity. At higher levels you can heal yourself whenever you cast a healing spell on another creature.' },
    { name: 'Light Domain',    description: 'You wield divine radiance to banish darkness. You can blind foes with a Warding Flare, channel a searing flash of brilliance with your Channel Divinity, and eventually surround yourself with an aura of sunlight that damages Undead and Oozes.' },
    { name: 'Trickery Domain', description: 'You are an agent of chaos who serves deities of trickery. You can bless allies with uncanny dodges, create illusory duplicates of yourself, and take on the guise of another creature. Later you become adept at passing as anyone and striking unseen.' },
    { name: 'War Domain',      description: 'Your deity inspires you to feats of martial excellence. Your Channel Divinity lets you add to an attack roll as a reaction, and you gain bonus attacks using your weapon. At higher levels you call down divine strikes that add radiant or necrotic damage.' },
  ],
  druid: [
    { name: 'Circle of the Land', description: 'You are tied to the land and draw power from a chosen terrain type—arctic, coast, desert, forest, grassland, mountain, swamp, or Underdark. This grants you bonus spells and extra spell recovery, keeping your magic replenished throughout the day.' },
    { name: 'Circle of the Moon', description: 'You are a master of Wild Shape. You can transform into powerful beasts of higher Challenge Rating, including creatures with a swim or fly speed. At higher levels you can turn into elementals and add magical strikes to your beast form.' },
    { name: 'Circle of the Sea',  description: 'You are attuned to the tempestuous power of the ocean. Your Wild Shape calls forth watery auras that deal cold and lightning damage, and you can unleash a crashing wave or a pull of the tide to control the battlefield.' },
    { name: 'Circle of Stars',    description: 'You track the movements of the stars and harness their power through a star map. Choose a constellation form when you Wild Shape to gain benefits to healing, ranged attacks, or concentration. At higher levels you become a radiant, starlit figure.' },
  ],
  fighter: [
    { name: 'Battle Master',    description: 'You are a consummate tactician who uses Superiority Dice to fuel powerful combat Maneuvers. From disarming strikes to rallying cries, you have a wide toolbox of techniques. Each short or long rest refreshes your Superiority Dice supply.' },
    { name: 'Champion',         description: 'You push the limits of physical excellence to perfection. Your critical hit range expands, you gain proficiency in additional skills and saving throws, and you recover some fighting ability on a short rest. A pure, elegant martial archetype.' },
    { name: 'Eldritch Knight',  description: 'You weave arcane magic into your martial skills. You learn spells from the Wizard spell list—primarily abjuration and evocation—and can bond with your weapon to summon it instantly. Later you can make an attack immediately after casting a cantrip.' },
    { name: 'Psi Warrior',      description: 'You have awakened your latent psychic powers. Psionic Energy Dice fuel telekinetic shoves, protective shields, and enhanced movement. At higher levels you can project a psionic bulwark around allies and even fly with your mental power.' },
  ],
  monk: [
    { name: 'Warrior of Mercy',          description: 'You channel life energy to harm or heal with a touch. Your Hand of Harm deals necrotic damage alongside your Unarmed Strike, while Hand of Healing restores Hit Points using your Focus Points. Later you can paralyze a creature or briefly glimpse its health.' },
    { name: 'Warrior of Shadow',         description: 'You harness the power of shadow magic. You can cast minor illusion for free, turn invisible in dim light or darkness, and eventually step through shadows like a teleport. Summon shadowy duplicates to confound your foes at higher levels.' },
    { name: 'Warrior of the Elements',   description: 'You learn to channel the four elements through your strikes. Spend Focus Points to make your attacks carry elemental energy, walk on water, breathe underwater, or ride currents of wind. At higher levels unleash a devastating elemental surge.' },
    { name: 'Warrior of the Open Hand',  description: 'You are the ultimate master of unarmed combat. Your Open Hand Technique can push, topple, or prevent reactions from a target you hit with Flurry of Blows. Later you can cure yourself of diseases and poisons, and deal lethal Quivering Palm strikes.' },
  ],
  paladin: [
    { name: 'Oath of Devotion',   description: 'You have sworn to uphold justice and fight the forces of evil. Sacred Weapon envelops your blade in holy energy, and Holy Nimbus fills you with blinding divine light. Your aura grants immunity to fear, and you can become an avatar of sanctity.' },
    { name: 'Oath of Glory',      description: 'You pursue a legend of heroism that others can emulate. Inspire Allies lets companions reroll movement checks, and Aura of Alacrity boosts your party\'s speed. At level 20 you become a beacon of divine glory that blinds enemies and inspires allies.' },
    { name: 'Oath of the Ancients', description: 'You have pledged to preserve the beauty of life against the creeping darkness. Nature\'s Wrath restrains foes with spectral vines, and your aura protects allies from spells. You gain resistance to damage from spells and can eventually never age or tire.' },
    { name: 'Oath of Vengeance',  description: 'You pursue wrongdoers with ruthless focus. Vow of Enmity gives you Advantage against a chosen target, and Abjure Foes causes enemies to cower in divine fear. At higher levels you can teleport to a foe and strike twice as a bonus, becoming an unstoppable avenger.' },
  ],
  ranger: [
    { name: 'Beast Master',    description: 'You form a deep bond with a primal beast that fights by your side. Your Primal Companion can be a land beast, sea beast, or sky beast. It attacks on your command and levels up alongside you, gaining extra Hit Points and new abilities.' },
    { name: 'Fey Wanderer',   description: 'You have been touched by the magic of the Feywild. Dreadful Strikes add psychic damage to your weapon attacks, and Otherworldly Glamour adds your Wisdom to Charisma checks. Later you can charm or frighten creatures and conjure fey warriors.' },
    { name: 'Gloom Stalker',  description: 'You are a hunter of the dark places. In dim light or darkness you become invisible to Darkvision, and you add extra damage on your first attack each turn. You gain a bonus on Initiative and can strike additional times when you open combat.' },
    { name: 'Hunter',         description: 'You have developed supreme hunting techniques. Prey on groups with Whirlwind Attack or Volley, or focus on single powerful targets with Giant Killer or Colossus Slayer. Hunter\'s Lore lets you learn a target\'s immunities and resistances instantly.' },
  ],
  rogue: [
    { name: 'Arcane Trickster', description: 'You supplement your roguish skills with arcane magic from the Wizard spell list—primarily enchantment and illusion. Mage Hand Legerdemain lets you manipulate objects from afar. At higher levels you can distract a foe with a spell as a bonus action before striking.' },
    { name: 'Assassin',         description: 'You are a master of infiltration and swift, lethal strikes. Surprise a creature to automatically score a critical hit. Impersonation lets you assume a creature\'s identity with uncanny accuracy, and at higher levels your poison becomes almost impossible to survive.' },
    { name: 'Soulknife',        description: 'Psychic power has awakened within you, manifesting as blades of pure mental energy. Psychic Blades deal extra psychic damage and can\'t be disarmed. Psionic Energy Dice fuel telepathy, teleportation, and the ability to turn invisible for a round.' },
    { name: 'Thief',            description: 'You are the quintessential burglar and opportunist. Fast Hands lets you use Cunning Action to activate magic items or sleight of hand. Supreme Sneak gives advantage on stealth, and Use Magic Device lets you ignore class requirements on any magic item.' },
  ],
  sorcerer: [
    { name: 'Aberrant Sorcery',  description: 'Your magic is warped by exposure to the Far Realm. You gain telepathy, can detect Aberrations, and eventually sprout tentacles or maddening whispers as part of your attacks. Your spells can unsettle enemy minds and bypass psychic resistances.' },
    { name: 'Clockwork Sorcery', description: 'Touched by the ordered plane of Mechanus, your magic imposes cosmic balance. Restore Order cancels Advantage or Disadvantage, and Bastion of Law creates a magical shield of sorcery points around a creature. You eventually nullify wild magic surges entirely.' },
    { name: 'Draconic Sorcery',  description: 'Draconic blood flows through your veins. You gain natural armor, your hit points increase, and you deal extra damage with your chosen elemental type. At higher levels you grow wings to fly, and can manifest draconic wings and a frightening presence.' },
    { name: 'Wild Magic Sorcery', description: 'Your spells are wreathed in uncontrolled arcane chaos. Wild Magic Surges cause unpredictable effects whenever you cast, and Tides of Chaos lets you force Advantage once before triggering a surge. Embrace the chaos for occasional devastating power.' },
  ],
  warlock: [
    { name: 'Archfey Patron',        description: 'You have made a pact with a lord of the Feywild. Beguiling Magic lets your spells charm or frighten targets, and you can teleport through shadows in a Misty Step. At higher levels you become immune to charm and fright, and can appear to die before reappearing unharmed.' },
    { name: 'Celestial Patron',      description: 'Your pact is with a powerful holy entity. You gain access to healing and radiant spells, and your Healing Light pool lets you heal allies with a bonus action. Later you gain resistance to radiant and necrotic damage and can send blinding bursts of holy fire.' },
    { name: 'Fiend Patron',          description: 'You have made a pact with a powerful devil or demon. Dark One\'s Blessing restores Hit Points whenever you kill a creature. You gain access to destructive spells, resistance to fire, and eventually become immune to fire and can walk on the surface of the infernal planes.' },
    { name: 'Great Old One Patron',  description: 'An unknowable entity from beyond the stars has granted you power. You develop telepathy, can communicate with any creature that has a language, and project thoughts into others\' minds. Eventually you can form a psychic link with a creature and read their surface thoughts.' },
  ],
  wizard: [
    { name: 'Abjurer',      description: 'You specialize in protective magic. Your Arcane Ward absorbs damage on your behalf and can be bolstered by your allies\' abjuration spells. Projected Ward extends this protection to others, and at higher levels you can rebuke attackers with a retributive blast.' },
    { name: 'Diviner',      description: 'You peer through time and space to uncover hidden truths. Your Portent feature lets you roll two dice each morning and substitute those results for any roll during the day. At higher levels you can cast Divination spells without spending spell slots and gain immunity to the Surprised condition.' },
    { name: 'Evoker',       description: 'You master spells of destructive power. Sculpt Spells protects allies from your area spells automatically, and Potent Cantrip ensures your cantrips deal half damage even on a successful save. At higher levels you can empower spells by rerolling low damage dice.' },
    { name: 'Illusionist',  description: 'You are a master of misdirection and phantasm. Malleable Illusions lets you change any existing illusion as an action, and your Illusory Self creates a spectral duplicate to take a hit for you once per rest. At higher levels your illusions can temporarily become real.' },
  ],
}

// --- Segédfüggvények ---

export function getAbilityModifier(score: number): number {
  return Math.floor((score - 10) / 2)
}

export function getProficiencyBonus(level: number): number {
  return PROFICIENCY_BONUS[level] ?? 2
}

// Max HP számítás: 1. szint = max hit die + CON mod, magasabb szinteken átlag + CON mod
export function getMaxHp(classKey: string, level: number, conMod: number): number {
  const die = HIT_DIE_VALUES[classKey] ?? 8
  const firstLevelHp = die + conMod
  if (level === 1) return Math.max(1, firstLevelHp)
  // Magasabb szinteken: átlag = (die / 2 + 1) + CON mod per szint
  const avgPerLevel = Math.floor(die / 2) + 1 + conMod
  return Math.max(1, firstLevelHp) + (level - 1) * Math.max(1, avgPerLevel)
}

// --- Starter Equipment ---

export interface StarterEquipmentChoice {
  id: string
  prompt: string
  options: { id: string; label: string }[]
}

export interface ClassStarterEquipment {
  fixed: string[]
  choices: StarterEquipmentChoice[]
  gold: number  // arany alternatíva
}

export const CLASS_STARTER_EQUIPMENT: Record<string, ClassStarterEquipment> = {
  barbarian: {
    fixed: ['Greataxe', '4× Handaxe', "Explorer's Pack", '15 GP'],
    choices: [],
    gold: 75,
  },
  bard: {
    fixed: ['Leather Armor', '2× Dagger', "Entertainer's Pack", 'A kiválasztott hangszer'],
    choices: [
      { id: 'weapon', prompt: 'Fegyver', options: [
        { id: 'rapier',    label: 'Rapier' },
        { id: 'longsword', label: 'Longsword' },
        { id: 'simple',    label: 'Bármely Simple Weapon' },
      ]},
    ],
    gold: 125,
  },
  cleric: {
    fixed: ['Shield', "Priest's Pack"],
    choices: [
      { id: 'holy_symbol', prompt: 'Holy Symbol típusa', options: [
        { id: 'amulet',    label: 'Amulet' },
        { id: 'emblem',    label: 'Emblem (pajzson / páncélon)' },
        { id: 'reliquary', label: 'Reliquary' },
      ]},
      { id: 'armor', prompt: 'Páncél', options: [
        { id: 'chain_mail', label: 'Chain Mail' },
        { id: 'leather',    label: 'Leather Armor + Simple Weapon' },
      ]},
      { id: 'weapon', prompt: 'Fegyver', options: [
        { id: 'mace',      label: 'Mace' },
        { id: 'warhammer', label: 'Warhammer' },
      ]},
    ],
    gold: 110,
  },
  druid: {
    fixed: ['Leather Armor', 'Shield', 'Herbalism Kit', "Explorer's Pack", 'Druidic Focus'],
    choices: [
      { id: 'weapon', prompt: 'Fegyver', options: [
        { id: 'scimitar',     label: 'Scimitar' },
        { id: 'quarterstaff', label: 'Quarterstaff' },
      ]},
    ],
    gold: 50,
  },
  fighter: {
    fixed: ["Dungeoneer's Pack"],
    choices: [
      { id: 'armor', prompt: 'Páncél', options: [
        { id: 'chain_mail',  label: 'Chain Mail' },
        { id: 'leather_bow', label: 'Leather Armor + Shortbow + 20 Nyíl' },
      ]},
      { id: 'weapons', prompt: 'Fegyverek', options: [
        { id: 'martial_shield', label: 'Martial Weapon + Shield' },
        { id: 'two_martial',    label: '2× Martial Weapon' },
      ]},
      { id: 'sidearm', prompt: 'Mellékfegyver', options: [
        { id: 'handaxes', label: '2× Handaxe' },
        { id: 'simple',   label: 'Bármely Simple Weapon' },
      ]},
    ],
    gold: 175,
  },
  monk: {
    fixed: ["Explorer's Pack", '5 GP'],
    choices: [
      { id: 'weapon', prompt: 'Fegyver', options: [
        { id: 'shortsword', label: 'Shortsword' },
        { id: 'simple',     label: 'Bármely Simple Weapon' },
      ]},
      { id: 'tool', prompt: 'Szerszám / Hangszer', options: [
        { id: 'artisan', label: "Artisan's Tools (1 típus)" },
        { id: 'musical', label: 'Musical Instrument (1 típus)' },
      ]},
    ],
    gold: 5,
  },
  paladin: {
    fixed: ['5× Javelin', "Priest's Pack", 'Chain Mail'],
    choices: [
      { id: 'holy_symbol', prompt: 'Holy Symbol típusa', options: [
        { id: 'amulet',    label: 'Amulet' },
        { id: 'emblem',    label: 'Emblem (pajzson / páncélon)' },
        { id: 'reliquary', label: 'Reliquary' },
      ]},
      { id: 'weapons', prompt: 'Fegyverek', options: [
        { id: 'martial_shield', label: 'Martial Weapon + Shield' },
        { id: 'two_martial',    label: '2× Martial Weapon' },
      ]},
    ],
    gold: 150,
  },
  ranger: {
    fixed: ['Shortbow', 'Quiver', '20× Nyíl', "Dungeoneer's Pack"],
    choices: [
      { id: 'armor', prompt: 'Páncél', options: [
        { id: 'scale_mail', label: 'Scale Mail' },
        { id: 'leather',    label: 'Leather Armor' },
      ]},
      { id: 'weapons', prompt: 'Közelharci fegyverek', options: [
        { id: 'shortswords',  label: '2× Shortsword' },
        { id: 'simple_melee', label: '2× Simple Melee Weapon' },
      ]},
    ],
    gold: 150,
  },
  rogue: {
    fixed: ['Leather Armor', '2× Dagger', "Thieves' Tools", "Burglar's Pack"],
    choices: [
      { id: 'weapon', prompt: 'Főfegyver', options: [
        { id: 'rapier',     label: 'Rapier' },
        { id: 'shortsword', label: 'Shortsword' },
      ]},
      { id: 'ranged', prompt: 'Távolsági fegyver', options: [
        { id: 'shortbow',      label: 'Shortbow + Quiver + 20 Nyíl' },
        { id: 'hand_crossbow', label: 'Hand Crossbow + Quiver + 20 Bolt' },
      ]},
    ],
    gold: 100,
  },
  sorcerer: {
    fixed: ['2× Dagger', "Dungeoneer's Pack", 'Arcane Focus (kristály)'],
    choices: [
      { id: 'weapon', prompt: 'Plusz fegyver', options: [
        { id: 'dagger',       label: '+2× Dagger' },
        { id: 'quarterstaff', label: 'Quarterstaff' },
      ]},
    ],
    gold: 75,
  },
  warlock: {
    fixed: ['Leather Armor', 'Arcane Focus (amulett)', '2× Dagger', "Scholar's Pack"],
    choices: [
      { id: 'weapon', prompt: 'Plusz fegyver', options: [
        { id: 'simple', label: 'Bármely Simple Weapon' },
        { id: 'dagger', label: '+1× Dagger' },
      ]},
    ],
    gold: 100,
  },
  wizard: {
    fixed: ['Spellbook', "Scholar's Pack", 'Arcane Focus (quarterstaff)'],
    choices: [
      { id: 'sidearm', prompt: 'Mellékfegyver', options: [
        { id: 'daggers',      label: '2× Dagger' },
        { id: 'quarterstaff', label: 'Quarterstaff' },
      ]},
    ],
    gold: 55,
  },
}

// Háttér kezdő felszerelés – minden háttér alternatívája 50 GP
export interface BackgroundStarterEquipment {
  fixed: string[]
  gold: number
}

export const BACKGROUND_STARTER_EQUIPMENT: Record<string, BackgroundStarterEquipment> = {
  acolyte:     { fixed: ['Imakönyv', '5× Tömjén', 'Holy Symbol', '10× Pergamen', 'Köntös', '8 GP'],        gold: 50 },
  artisan:     { fixed: ["Artisan's Tools (1 típus)", 'Ajánlólevél', "Traveler's Clothes", '15 GP'],         gold: 50 },
  charlatan:   { fixed: ['Fine Clothes', 'Disguise Kit', 'Forgery Kit', '15 GP'],                            gold: 50 },
  criminal:    { fixed: ['Crowbar', "2× Common Clothes", "Thieves' Tools", '15 GP'],                         gold: 50 },
  entertainer: { fixed: ['Musical Instrument (1 típus)', 'Jelmez', '15 GP'],                                 gold: 50 },
  farmer:      { fixed: ['Sickle', "Traveler's Clothes", "Dungeoneer's Pack", '30 GP'],                      gold: 50 },
  guard:       { fixed: ['Spear', 'Light Crossbow', '20 Bolt', 'Quiver', "Traveler's Clothes", '10 GP'],     gold: 50 },
  guide:       { fixed: ["Cartographer's Tools", "Traveler's Clothes", "Dungeoneer's Pack", '10 GP'],        gold: 50 },
  hermit:      { fixed: ['Herbalism Kit', "Traveler's Clothes", '5 GP'],                                     gold: 50 },
  merchant:    { fixed: ["Merchant's Pack", 'Abacus', "Merchant's Scale", '25 GP'],                          gold: 50 },
  noble:       { fixed: ['Fine Clothes', 'Signet Ring', 'Scroll of Pedigree', '30 GP'],                      gold: 50 },
  sage:        { fixed: ['Quarterstaff', "Traveler's Clothes", "Scholar's Pack", '5 GP'],                    gold: 50 },
  sailor:      { fixed: ['Hooded Lantern', '50ft Rope', "Traveler's Clothes", '10 GP'],                      gold: 50 },
  scribe:      { fixed: ["Scribe's Tools", 'Fine Clothes', "Scholar's Pack", '5 GP'],                        gold: 50 },
  soldier:     { fixed: ['Katonai Rangjelzés', 'Zsákmány Emléktárgy', "Traveler's Clothes", '10 GP'],        gold: 50 },
  wayfarer:    { fixed: ['Szerencsehozó Tárgy', "Traveler's Clothes", "Dungeoneer's Pack", '12 GP'],         gold: 50 },
}

// ══ AKCIÓK (D&D 2024 PHB) ═══════════════════════════════════════════════════

export interface ActionEntry {
  name: string
  actionType: 'Action' | 'Bonus Action' | 'Reaction'
  description: string
}

// Mindenki számára elérhető alap akciók
export const BASE_ACTIONS: ActionEntry[] = [
  { name: 'Attack',            actionType: 'Action',   description: 'Attack with a weapon or make an Unarmed Strike.' },
  { name: 'Dash',              actionType: 'Action',   description: 'Gain extra movement equal to your Speed this turn.' },
  { name: 'Disengage',         actionType: 'Action',   description: 'Your movement won\'t provoke Opportunity Attacks for the rest of the turn.' },
  { name: 'Dodge',             actionType: 'Action',   description: 'Attacks against you have Disadvantage; DEX saves have Advantage. Ends if you are Incapacitated.' },
  { name: 'Help',              actionType: 'Action',   description: 'Give a creature Advantage on its next ability check or attack roll, or aid a creature with a task.' },
  { name: 'Hide',              actionType: 'Action',   description: 'Make a Stealth check to try to become hidden.' },
  { name: 'Influence',         actionType: 'Action',   description: 'Try to influence a creature\'s attitude using Persuasion, Deception, or Intimidation.' },
  { name: 'Magic',             actionType: 'Action',   description: 'Cast a spell, use a magic item, or use a magical feature.' },
  { name: 'Ready',             actionType: 'Action',   description: 'Prepare a Reaction triggered by a specified condition before your next turn.' },
  { name: 'Search',            actionType: 'Action',   description: 'Make a Perception or Investigation check to detect something.' },
  { name: 'Study',             actionType: 'Action',   description: 'Make an Intelligence check to recall information about a creature, place, or object.' },
  { name: 'Utilize',           actionType: 'Action',   description: 'Activate a nonmagical object\'s special function.' },
  { name: 'Opportunity Attack', actionType: 'Reaction', description: 'When a hostile creature you can see leaves your reach without Disengaging, make one melee attack against it.' },
]

// Kaszt-specifikus bónuszakciók (D&D 2024 PHB)
export const CLASS_BONUS_ACTIONS: Record<string, ActionEntry[]> = {
  barbarian: [
    { name: 'Rage', actionType: 'Bonus Action', description: 'Enter a Rage for 1 minute: Advantage on STR checks/saves, +2 damage with STR attacks, resistance to Bludgeoning/Piercing/Slashing.' },
  ],
  bard: [
    { name: 'Bardic Inspiration', actionType: 'Bonus Action', description: 'Give a creature within 60 ft a Bardic Inspiration die (d6) to add to one ability check, attack roll, or saving throw.' },
  ],
  druid: [
    { name: 'Wild Shape', actionType: 'Bonus Action', description: 'Magically transform into a Beast (CR ≤ 1/4, no swim or fly speed at level 2). Lasts 1 hour or until you drop to 0 HP.' },
  ],
  fighter: [
    { name: 'Second Wind', actionType: 'Bonus Action', description: 'Regain HP equal to 1d10 + Fighter level. Usable twice per Short Rest.' },
  ],
  monk: [
    { name: 'Flurry of Blows', actionType: 'Bonus Action', description: 'Spend 1 Focus Point to make two Unarmed Strikes immediately after taking the Attack action.' },
    { name: 'Martial Arts', actionType: 'Bonus Action', description: 'After attacking with a Monk weapon or Unarmed Strike as part of the Attack action, make one additional Unarmed Strike.' },
    { name: 'Step of the Wind', actionType: 'Bonus Action', description: 'Spend 1 Focus Point to take the Dash or Disengage action.' },
  ],
  ranger: [
    { name: "Hunter's Mark", actionType: 'Bonus Action', description: 'Mark a creature: +1d6 damage on weapon hits against it; Advantage on Perception/Survival checks to find it. Lasts 1 hour (Concentration).' },
  ],
  rogue: [
    { name: 'Cunning Action', actionType: 'Bonus Action', description: 'Take the Dash, Disengage, or Hide action.' },
  ],
  warlock: [
    { name: 'Hex', actionType: 'Bonus Action', description: 'Curse a creature within 90 ft: +1d6 Necrotic damage on weapon hits; Disadvantage on one ability check type you choose. Lasts 1 hour (Concentration).' },
  ],
}

// Kaszt-specifikus reakciók (D&D 2024 PHB)
export const CLASS_REACTIONS: Record<string, ActionEntry[]> = {
  fighter: [
    { name: 'Protection', actionType: 'Reaction', description: '(Fighting Style) When a creature attacks a target within 5 ft of you, impose Disadvantage on the attack roll (requires Shield).' },
  ],
  monk: [
    { name: 'Deflect Attack', actionType: 'Reaction', description: 'Reduce damage from a melee/ranged attack by 1d10 + DEX modifier + Monk level. If reduced to 0, you may redirect the attack at the original attacker.' },
  ],
  rogue: [
    { name: 'Uncanny Dodge', actionType: 'Reaction', description: '(Level 5) When an attacker you can see hits you, halve the attack\'s damage against you.' },
  ],
  wizard: [
    { name: 'Counterspell', actionType: 'Reaction', description: 'When a creature casts a spell of 3rd level or lower, negate it automatically. Higher-level spells require an ability check.' },
  ],
}

// Háttér → leírás és skill jártasságok (D&D 2024 PHB)
export const BACKGROUND_INFO: Record<string, { name: string; description: string; skills: string[] }> = {
  acolyte:     { name: 'Acolyte',     description: 'You have spent your life in the service of a temple to a specific god or pantheon of gods.',                                    skills: ['Insight', 'Religion'] },
  artisan:     { name: 'Artisan',     description: 'You are trained in a particular set of artisan\'s skills, well suited to a mercantile life.',                                  skills: ['Investigation', 'Persuasion'] },
  charlatan:   { name: 'Charlatan',   description: 'You have always had a knack for making people believe what you want them to believe.',                                          skills: ['Deception', 'Sleight of Hand'] },
  criminal:    { name: 'Criminal',    description: 'You are an experienced criminal with a history of breaking the law and surviving by your wits.',                               skills: ['Deception', 'Stealth'] },
  entertainer: { name: 'Entertainer', description: 'You thrive in front of an audience, knowing how to entrance, entertain, and inspire others.',                                  skills: ['Acrobatics', 'Performance'] },
  farmer:      { name: 'Farmer',      description: 'You grew up close to the land, giving you an understanding of animals and the cycle of seasons.',                              skills: ['Animal Handling', 'Nature'] },
  guard:       { name: 'Guard',       description: 'You have served as a guardian of a person, place, or thing, developing a keen sense of duty.',                                skills: ['Athletics', 'Perception'] },
  guide:       { name: 'Guide',       description: 'You grew up in the wilderness, learning to survive far from the comforts of civilization.',                                    skills: ['Stealth', 'Survival'] },
  hermit:      { name: 'Hermit',      description: 'You lived in seclusion—either in a sheltered community such as a monastery, or entirely alone.',                               skills: ['Medicine', 'Religion'] },
  merchant:    { name: 'Merchant',    description: 'You worked as a merchant, learning the value of commodities and the art of profitable trade.',                                 skills: ['Animal Handling', 'Persuasion'] },
  noble:       { name: 'Noble',       description: 'You understand wealth, power, and privilege, having been born to a family of high social standing.',                           skills: ['History', 'Persuasion'] },
  sage:        { name: 'Sage',        description: 'You spent years learning the lore of the multiverse, studying ancient texts and forbidden knowledge.',                         skills: ['Arcana', 'History'] },
  sailor:      { name: 'Sailor',      description: 'You sailed on a seagoing vessel for years, learning to navigate by the stars and weather any storm.',                         skills: ['Acrobatics', 'Perception'] },
  scribe:      { name: 'Scribe',      description: 'You spent your formative years in a scriptorium, studying and copying documents of all kinds.',                               skills: ['Investigation', 'Perception'] },
  soldier:     { name: 'Soldier',     description: 'War has been your life for as long as you can remember—training, tactics, and comradeship.',                                  skills: ['Athletics', 'Intimidation'] },
  wayfarer:    { name: 'Wayfarer',    description: 'You know the streets of towns and cities and how to navigate them to get whatever you need.',                                  skills: ['Insight', 'Stealth'] },
}

// Spell Slot tábla lekérdezése – null ha nem varázsló vagy nincs slot ezen a szinten
export function getSpellSlots(classKey: string, level: number): number[] | null {
  if (classKey === 'warlock') {
    const idx = level - 1
    const slots = WARLOCK_PACT.slots[idx]
    const slotLvl = WARLOCK_PACT.slotLevel[idx]
    if (!slots) return null
    // Warlock: csak 1 slot szint, a többi 0
    const result = [0, 0, 0, 0, 0, 0, 0, 0, 0]
    result[slotLvl - 1] = slots
    return result
  }
  return SPELL_SLOTS[classKey]?.[level] ?? null
}
