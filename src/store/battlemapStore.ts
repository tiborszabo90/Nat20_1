import { create } from 'zustand'
import type { BattlemapState, TerrainType } from '../types/app/map'

interface BattlemapStoreState {
  /** undefined = még nem töltött be; null = Firestore megerősítette, nincs doc; BattlemapState = betöltött */
  battlemap: BattlemapState | null | undefined
  selectedTerrain: TerrainType
  selectedTokenId: string | null
  setBattlemap: (s: BattlemapState | null) => void
  setSelectedTerrain: (t: TerrainType) => void
  setSelectedTokenId: (id: string | null) => void
  /** Optimista lokális frissítés – UI azonnal reagál, Firestore write aszinkron */
  setBattlemapCellLocal: (key: string, terrain: TerrainType) => void
  /** Grid átméretezéskor lokális frissítés, keretből kiesett cellák eldobva */
  setGridSizeLocal: (cols: number, rows: number) => void
  /** Token pozíciójának optimista lokális frissítése drag közben */
  moveTokenLocal: (id: string, col: number, row: number) => void
  /** Encounter token HP optimista frissítése */
  updateTokenHpLocal: (id: string, currentHp: number) => void
  clearBattlemap: () => void
}

export const useBattlemapStore = create<BattlemapStoreState>((set) => ({
  battlemap: undefined,
  selectedTerrain: 'wall',
  selectedTokenId: null,

  setBattlemap: (battlemap) => set({ battlemap }),

  setSelectedTerrain: (selectedTerrain) => set({ selectedTerrain }),

  setSelectedTokenId: (selectedTokenId) => set({ selectedTokenId }),

  setBattlemapCellLocal: (key, terrain) =>
    set((state) => {
      if (!state.battlemap) return {}
      const newCells = { ...state.battlemap.cells }
      if (terrain === 'floor') {
        delete newCells[key]
      } else {
        newCells[key] = terrain
      }
      return { battlemap: { ...state.battlemap, cells: newCells } }
    }),

  setGridSizeLocal: (cols, rows) =>
    set((state) => {
      if (!state.battlemap) return {}
      const newCells: Record<string, TerrainType> = {}
      for (const [key, terrain] of Object.entries(state.battlemap.cells)) {
        const [c, r] = key.split(':').map(Number)
        if (c < cols && r < rows) newCells[key] = terrain
      }
      return { battlemap: { ...state.battlemap, cols, rows, cells: newCells } }
    }),

  moveTokenLocal: (id, col, row) =>
    set((state) => {
      if (!state.battlemap) return {}
      const token = state.battlemap.tokens[id]
      if (!token) return {}
      return {
        battlemap: {
          ...state.battlemap,
          tokens: { ...state.battlemap.tokens, [id]: { ...token, col, row } },
        },
      }
    }),

  updateTokenHpLocal: (id, currentHp) =>
    set((state) => {
      if (!state.battlemap) return {}
      const token = state.battlemap.tokens[id]
      if (!token) return {}
      return {
        battlemap: {
          ...state.battlemap,
          tokens: { ...state.battlemap.tokens, [id]: { ...token, currentHp } },
        },
      }
    }),

  clearBattlemap: () => set({ battlemap: null, selectedTokenId: null }),
}))
