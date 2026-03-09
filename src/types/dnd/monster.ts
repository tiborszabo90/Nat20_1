// Lightweight index entry – csak kereséshez (névindex háttérbetöltés)
export interface MonsterSummary {
  key: string
  name: string
  cr: string
  type: string
}

export interface MonsterAction {
  name: string
  desc: string
  attackBonus?: number
}

export interface Monster {
  key: string        // slug az API-ból
  name: string
  size: string       // "Small", "Medium", "Large" stb.
  type: string       // "Humanoid", "Beast" stb.
  subtype?: string
  alignment: string
  ac: number
  acDesc: string     // pl. "leather armor"
  hp: number
  hitDice: string    // pl. "2d6"
  speed: string      // pl. "30 ft."
  str: number
  dex: number
  con: number
  int: number
  wis: number
  cha: number
  cr: string         // pl. "1/4", "1", "10"
  xp?: number
  senses: string
  languages: string
  savingThrows?: string         // pl. "Dex +2, Wis +4"
  skills?: string               // pl. "Perception +3, Stealth +2"
  damageVulnerabilities?: string
  damageResistances?: string
  damageImmunities?: string
  conditionImmunities?: string
  traits?: MonsterAction[]      // special_abilities az API-ban
  actions?: MonsterAction[]
  reactions?: MonsterAction[]
  legendaryDesc?: string
  legendaryActions?: MonsterAction[]
}
