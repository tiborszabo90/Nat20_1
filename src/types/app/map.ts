export type TerrainType = 'floor' | 'wall' | 'difficult' | 'water' | 'special'

export interface BattlemapToken {
  id: string
  col: number
  row: number
  type: 'character' | 'encounter'
  characterId: string | null
  label: string      // 2 char initials vagy custom szöveg
  color: string      // hex szín, pl. '#f59e0b'
  currentHp?: number  // encounter tokenek HP követéséhez
  maxHp?: number      // encounter tokenek max HP
  monsterKey?: string // encounter tokenek monster lookup-jához (open5e slug)
  fullName?: string   // encounter token teljes neve (label csak 2 char)
}

export interface BattlemapState {
  cols: number
  rows: number
  // Csak nem-floor cellák tárolva; kulcs: "col:row"
  cells: Record<string, TerrainType>
  backgroundImageUrl: string | null
  tokens: Record<string, BattlemapToken>
}
