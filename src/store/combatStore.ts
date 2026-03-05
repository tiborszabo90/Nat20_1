import { create } from 'zustand'
import type { CombatState } from '../types/app/combat'

interface CombatStoreState {
  /** undefined = még tölt; null = nincs aktív harc; CombatState = aktív harc */
  combat: CombatState | null | undefined
  setCombat: (state: CombatState | null) => void
  clearCombat: () => void
}

export const useCombatStore = create<CombatStoreState>((set) => ({
  combat: undefined,
  setCombat: (combat) => set({ combat }),
  clearCombat: () => set({ combat: undefined }),
}))
