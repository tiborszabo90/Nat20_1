import { create } from 'zustand'
import type { Spell } from '../types/dnd/spell'
import type { Condition } from '../types/dnd/condition'
import type { DndClass } from '../types/dnd/class'
import type { Species } from '../types/dnd/species'
import type { Background } from '../types/dnd/background'
import type { Monster } from '../types/dnd/monster'

// Varázslatok Map-ként: key → Spell (O(1) keresés Phase 4 AI-hoz)
type SpellMap = Map<string, Spell>

interface DndDataState {
  spells: SpellMap
  conditions: Condition[]
  classes: DndClass[]
  species: Species[]
  backgrounds: Background[]
  monsters: Monster[]
  isLoading: boolean
  error: string | null
  setData: (data: {
    spells: Spell[]
    conditions: Condition[]
    classes: DndClass[]
    species: Species[]
    backgrounds: Background[]
    monsters: Monster[]
  }) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
}

export const useDndDataStore = create<DndDataState>((set) => ({
  spells: new Map(),
  conditions: [],
  classes: [],
  species: [],
  backgrounds: [],
  monsters: [],
  isLoading: false,
  error: null,

  setData: ({ spells, conditions, classes, species, backgrounds, monsters }) =>
    set({
      spells: new Map(spells.map(s => [s.key, s])),
      conditions,
      classes,
      species,
      backgrounds,
      monsters,
      isLoading: false,
      error: null,
    }),

  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error, isLoading: false }),
}))
