// D&D 2024 feat adatok
// Forrás: SRD CC v5.2.1 (Alert, Magic Initiate, Savage Attacker, Skilled, General és Fighting Style featok)
// + PHB 2024 Origin Featok amelyek nem szerepelnek az SRD-ben (Crafter, Musician, Tough, Lucky, Tavern Brawler)
import type { Feat } from '../types/dnd/feat'

export const FEATS: Feat[] = [
  // ── Origin Feats (SRD) ─────────────────────────────────────────────────────
  {
    key: 'alert',
    name: 'Alert',
    category: 'origin',
    prerequisite: '',
    description: 'You gain the following benefits. Initiative Proficiency: When you roll Initiative, you can add your Proficiency Bonus to the roll. Initiative Swap: Immediately after you roll Initiative, you can swap your Initiative with the Initiative of one willing ally in the same combat. You can\'t make this swap if you or the ally has the Incapacitated condition.',
    repeatable: false,
  },
  {
    key: 'magic-initiate',
    name: 'Magic Initiate',
    category: 'origin',
    prerequisite: '',
    description: 'You gain the following benefits. Two Cantrips: You learn two cantrips of your choice from the Cleric, Druid, or Wizard spell list. Intelligence, Wisdom, or Charisma is your spellcasting ability for this feat\'s spells (choose when you select this feat). Level 1 Spell: Choose a level 1 spell from the same list. You always have that spell prepared. You can cast it once without a spell slot, and you regain the ability to cast it in that way when you finish a Long Rest. Spell Change: Whenever you gain a new level, you can replace one of the spells you chose for this feat with a different spell of the same level from the chosen spell list.',
    repeatable: true,
  },
  {
    key: 'savage-attacker',
    name: 'Savage Attacker',
    category: 'origin',
    prerequisite: '',
    description: 'You\'ve trained to deal particularly damaging strikes. Once per turn when you hit a target with a weapon, you can roll the weapon\'s damage dice twice and use either roll against the target.',
    repeatable: false,
  },
  {
    key: 'skilled',
    name: 'Skilled',
    category: 'origin',
    prerequisite: '',
    description: 'You gain proficiency in any combination of three skills or tools of your choice.',
    repeatable: true,
  },

  // ── Origin Feats (PHB 2024, nem SRD – hardcoded) ──────────────────────────
  {
    key: 'crafter',
    name: 'Crafter',
    category: 'origin',
    prerequisite: '',
    description: 'You gain proficiency with three kinds of Artisan\'s Tools of your choice. Whenever you make an ability check using Artisan\'s Tools, you can add double your Proficiency Bonus (instead of the normal Proficiency Bonus) if you are proficient with those tools. With a set of the appropriate tools and any required materials, you can craft items in half the time and at half the cost.',
    repeatable: false,
  },
  {
    key: 'musician',
    name: 'Musician',
    category: 'origin',
    prerequisite: '',
    description: 'You gain proficiency with three Musical Instruments of your choice. With a 1-minute performance using one of those instruments, you can grant Heroic Inspiration to a number of creatures up to your Proficiency Bonus. Once you use this benefit, you can\'t use it again until you finish a Long Rest.',
    repeatable: false,
  },
  {
    key: 'tough',
    name: 'Tough',
    category: 'origin',
    prerequisite: '',
    description: 'Your Hit Point maximum increases by an amount equal to twice your character level when you gain this feat. Whenever you gain a level thereafter, your Hit Point maximum increases by an additional 2 Hit Points.',
    repeatable: false,
  },
  {
    key: 'lucky',
    name: 'Lucky',
    category: 'origin',
    prerequisite: '',
    description: 'You have 2 Luck Points. You can spend 1 Luck Point when you make a D20 Test or when a creature makes an attack roll against you. Roll 1d20, and then choose whether to use your roll or the other roll. You regain expended Luck Points when you finish a Long Rest.',
    repeatable: false,
  },
  {
    key: 'tavern-brawler',
    name: 'Tavern Brawler',
    category: 'origin',
    prerequisite: '',
    description: 'You gain the following benefits. Enhanced Unarmed Strike: When you hit with your Unarmed Strike and deal damage, you can deal Bludgeoning damage equal to 1d4 plus your Strength modifier instead of the normal damage. Damage Rerolls: Whenever you take the Attack action and deal damage with an Unarmed Strike or an improvised weapon on your turn, you can reroll any 1s on the damage dice and use the new rolls. Shove: When you hit a creature with an Unarmed Strike as part of the Attack action on your turn, you can deal damage to the target and also push it 5 feet away or cause it to have the Prone condition.',
    repeatable: false,
  },

  // ── General Feats (SRD) ───────────────────────────────────────────────────
  {
    key: 'ability-score-improvement',
    name: 'Ability Score Improvement',
    category: 'general',
    prerequisite: 'Level 4+',
    description: 'Increase one ability score of your choice by 2, or increase two ability scores of your choice by 1. This feat can\'t increase an ability score above 20.',
    repeatable: true,
  },
  {
    key: 'grappler',
    name: 'Grappler',
    category: 'general',
    prerequisite: 'Level 4+, Strength or Dexterity 13+',
    description: 'You gain the following benefits. Ability Score Increase: Increase your Strength or Dexterity score by 1, to a maximum of 20. Punch and Grab: When you hit a creature with an Unarmed Strike as part of the Attack action on your turn, you can use both the Damage and the Grapple option. You can use this benefit only once per turn. Attack Advantage: You have Advantage on attack rolls against a creature Grappled by you. Fast Wrestler: You don\'t have to spend extra movement to move a creature Grappled by you if the creature is your size or smaller.',
    repeatable: false,
  },

  // ── Fighting Style Feats (SRD) ────────────────────────────────────────────
  {
    key: 'archery',
    name: 'Archery',
    category: 'fighting-style',
    prerequisite: 'Fighting Style Feature',
    description: 'You gain a +2 bonus to attack rolls you make with Ranged weapons.',
    repeatable: false,
  },
  {
    key: 'defense',
    name: 'Defense',
    category: 'fighting-style',
    prerequisite: 'Fighting Style Feature',
    description: 'While you\'re wearing Light, Medium, or Heavy armor, you gain a +1 bonus to Armor Class.',
    repeatable: false,
  },
  {
    key: 'great-weapon-fighting',
    name: 'Great Weapon Fighting',
    category: 'fighting-style',
    prerequisite: 'Fighting Style Feature',
    description: 'When you roll damage for an attack you make with a Melee weapon that you are holding with two hands, you can treat any 1 or 2 on a damage die as a 3. The weapon must have the Two-Handed or Versatile property to gain this benefit.',
    repeatable: false,
  },
  {
    key: 'two-weapon-fighting',
    name: 'Two-Weapon Fighting',
    category: 'fighting-style',
    prerequisite: 'Fighting Style Feature',
    description: 'When you make an extra attack as a result of using a weapon that has the Light property, you can add your ability modifier to the damage of that attack if you aren\'t already adding it to the damage.',
    repeatable: false,
  },

  // ── Epic Boon Feats (SRD) ─────────────────────────────────────────────────
  {
    key: 'boon-of-combat-prowess',
    name: 'Boon of Combat Prowess',
    category: 'epic-boon',
    prerequisite: 'Level 19+',
    description: 'You gain the following benefits. Ability Score Increase: Increase one ability score of your choice by 1, to a maximum of 30. Peerless Aim: When you miss with an attack roll, you can hit instead. Once you use this benefit, you can\'t use it again until the start of your next turn.',
    repeatable: false,
  },
  {
    key: 'boon-of-dimensional-travel',
    name: 'Boon of Dimensional Travel',
    category: 'epic-boon',
    prerequisite: 'Level 19+',
    description: 'You gain the following benefits. Ability Score Increase: Increase one ability score of your choice by 1, to a maximum of 30. Blink Steps: Immediately after you take the Attack action or the Magic action, you can teleport up to 30 feet to an unoccupied space you can see.',
    repeatable: false,
  },
  {
    key: 'boon-of-energy-resistance',
    name: 'Boon of Energy Resistance',
    category: 'epic-boon',
    prerequisite: 'Level 19+',
    description: 'You gain the following benefits. Ability Score Increase: Increase one ability score of your choice by 1, to a maximum of 30. Energy Resistances: You gain Resistance to two of the following damage types of your choice: Acid, Cold, Fire, Lightning, Necrotic, Poison, Psychic, Radiant, Thunder. Energy Redirection: When you take damage of one of those types, you can use your Reaction to direct damage of the same type at one creature you can see within 60 feet of yourself. That creature must succeed on a Constitution saving throw (DC 8 plus your Proficiency Bonus plus your Constitution modifier) or take 2d12 damage of that type.',
    repeatable: false,
  },
  {
    key: 'boon-of-fortitude',
    name: 'Boon of Fortitude',
    category: 'epic-boon',
    prerequisite: 'Level 19+',
    description: 'You gain the following benefits. Ability Score Increase: Increase one ability score of your choice by 1, to a maximum of 30. Fortified Health: Your Hit Point maximum increases by 40. In addition, whenever you regain Hit Points, you can regain additional Hit Points equal to your Constitution modifier. You can use this benefit a number of times equal to your Proficiency Bonus, and you regain all uses when you finish a Long Rest.',
    repeatable: false,
  },
  {
    key: 'boon-of-irresistible-offense',
    name: 'Boon of Irresistible Offense',
    category: 'epic-boon',
    prerequisite: 'Level 19+',
    description: 'You gain the following benefits. Ability Score Increase: Increase your Strength or Dexterity by 1, to a maximum of 30. Overcome Defenses: The Bludgeoning, Piercing, and Slashing damage you deal always ignores Resistance. Devastating Strikes: When you roll a 20 on an attack roll, you can deal extra damage to the target equal to the ability score increased by this feat. The extra damage type is the same as the attack\'s damage type.',
    repeatable: false,
  },
  {
    key: 'boon-of-recovery',
    name: 'Boon of Recovery',
    category: 'epic-boon',
    prerequisite: 'Level 19+',
    description: 'You gain the following benefits. Ability Score Increase: Increase one ability score of your choice by 1, to a maximum of 30. Last Stand: When you would be reduced to 0 Hit Points, you can drop to 1 Hit Point instead and regain Hit Points equal to half your Hit Point maximum. Once you use this benefit, you can\'t use it again until you finish a Long Rest. Recover Vitality: You have a pool of 10d10. As a Bonus Action, you can spend dice from the pool, rolling them and regaining a number of Hit Points equal to the roll. You regain all spent dice when you finish a Long Rest.',
    repeatable: false,
  },
  {
    key: 'boon-of-skill',
    name: 'Boon of Skill',
    category: 'epic-boon',
    prerequisite: 'Level 19+',
    description: 'You gain the following benefits. Ability Score Increase: Increase one ability score of your choice by 1, to a maximum of 30. All-Around Adept: You gain proficiency in all skills. Expertise: Choose one skill in which you lack Expertise. You gain Expertise in that skill.',
    repeatable: false,
  },
  {
    key: 'boon-of-speed',
    name: 'Boon of Speed',
    category: 'epic-boon',
    prerequisite: 'Level 19+',
    description: 'You gain the following benefits. Ability Score Increase: Increase your Dexterity score by 1, to a maximum of 30. Movement: Your Speed increases by 30 feet. Quick Escape: When you use the Dash or Disengage action, you can use a Bonus Action to make one attack with a weapon or an Unarmed Strike.',
    repeatable: false,
  },
  {
    key: 'boon-of-spell-recall',
    name: 'Boon of Spell Recall',
    category: 'epic-boon',
    prerequisite: 'Level 19+, Spellcasting or Pact Magic feature',
    description: 'You gain the following benefits. Ability Score Increase: Increase your Intelligence, Wisdom, or Charisma score by 1, to a maximum of 30. Free Casting: Whenever you cast a spell with a spell slot of level 1 through 4, roll 1d4. If the number you roll equals the slot\'s level, the slot isn\'t expended.',
    repeatable: false,
  },
  {
    key: 'boon-of-the-night-spirit',
    name: 'Boon of the Night Spirit',
    category: 'epic-boon',
    prerequisite: 'Level 19+',
    description: 'You gain the following benefits. Ability Score Increase: Increase one ability score of your choice by 1, to a maximum of 30. Merge with Shadows: While within Dim Light or Darkness, you can give yourself the Invisible condition as a Bonus Action. The condition ends on you immediately after you take an action, a Bonus Action, or a Reaction. Shadowy Form: While within Dim Light or Darkness, you have Resistance to all damage except Psychic and Radiant.',
    repeatable: false,
  },
  {
    key: 'boon-of-truesight',
    name: 'Boon of Truesight',
    category: 'epic-boon',
    prerequisite: 'Level 19+',
    description: 'You gain the following benefits. Ability Score Increase: Increase one ability score of your choice by 1, to a maximum of 30. Truesight: You have Truesight with a range of 60 feet.',
    repeatable: false,
  },
]

// O(1) keresés kulcs alapján
export const FEATS_BY_KEY: Record<string, Feat> = Object.fromEntries(
  FEATS.map(f => [f.key, f])
)
