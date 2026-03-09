import type { Timestamp } from 'firebase/firestore'
import type { Ability } from '../../data/dndConstants'

export type { Ability }
export type ContextMode = 'combat' | 'exploration' | 'social' | 'general'

export interface AbilityScores {
  STR: number
  DEX: number
  CON: number
  INT: number
  WIS: number
  CHA: number
}

export interface Character {
  id: string
  campaignCode: string
  playerUid: string
  playerName: string
  name: string
  speciesKey: string
  backgroundKey: string
  classKey: string
  level: number
  abilityScores: AbilityScores
  maxHp: number
  currentHp: number
  temporaryHp: number
  armorClass: number
  skillProficiencies: string[]
  savingThrowProficiencies: Ability[]
  originFeatKey: string
  weaponMasteries: string[]
  instrumentProficiencies: string[]
  divineOrder: string | null
  primalOrder: string | null
  expertiseSkills: string[]
  eldritchInvocations: string[]
  languages: string[]
  speciesSize: string | null
  draconicAncestry: string | null
  elvenLineage: string | null
  elvenSpellcastingAbility: string | null
  gnomishLineage: string | null
  gnomishSpellcastingAbility: string | null
  giantAncestry: string | null
  tieflingLegacy: string | null
  tieflingSpellcastingAbility: string | null
  humanVersatileFeat: string | null
  knownCantrips: string[]
  knownSpells: string[]
  // Magic Initiate feat (background origin feat) – 2 cantrip + 1 level 1 spell
  magicInitiateCantrips: string[]
  magicInitiateSpell: string | null
  starterEquipment: string[]
  // null ha nem varázsló kaszt, index 0 = 1st level slot max
  spellSlots: number[] | null
  // Elhasznált spell slotok, index 0 = 1st level
  usedSpellSlots: number[]
  avatarUrl?: string
  heroicInspiration?: boolean
  activeConditions?: string[]
  usedHitDice?: number
  createdAt: Timestamp
  updatedAt: Timestamp
}
