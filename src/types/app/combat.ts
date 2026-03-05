export interface CombatParticipant {
  id: string               // 'player-{uid}' | 'monster-{tokenId}'
  name: string
  type: 'player' | 'monster'
  playerUid: string | null
  dexMod: number | null
  d20Roll: number | null
  total: number | null     // null = még nem adta meg
}

export interface CombatState {
  phase: 'initiative' | 'combat'
  round: number
  currentTurnIndex: number
  participants: Record<string, CombatParticipant>
  turnOrder: string[]      // rendezett id-k total desc szerint (csak combat fázisban teli)
}
