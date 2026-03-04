export interface Monster {
  key: string        // slug az API-ból
  name: string
  size: string       // "Small", "Medium", "Large" stb.
  type: string       // "Humanoid", "Beast" stb.
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
  senses: string
  languages: string
}
