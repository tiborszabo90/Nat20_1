import { create } from 'zustand'
import type { Spell } from '../types/dnd/spell'
import type { Condition } from '../types/dnd/condition'
import type { DndClass } from '../types/dnd/class'
import type { Species } from '../types/dnd/species'
import type { Background } from '../types/dnd/background'
import type { Monster, MonsterSummary } from '../types/dnd/monster'
import type { SpellSlotTable } from '../services/dnd-data/indexedDbCache'

// Varázslatok Map-ként: key → Spell (O(1) keresés Phase 4 AI-hoz)
type SpellMap = Map<string, Spell>

interface DndDataState {
  spells: SpellMap
  conditions: Condition[]
  classes: DndClass[]
  species: Species[]
  backgrounds: Background[]
  // Spell slot táblák open5e v2-ből: kaszt key → szintenként slot tömb
  spellTables: Record<string, SpellSlotTable>
  // Monster névindex – progresszívan töltődik háttérben (kereséshez), csak összefoglaló adatok
  monsterIndex: MonsterSummary[]
  isLoadingMonsterIndex: boolean
  // Monster stat block cache – on-demand token kiválasztáskor
  monsterCache: Map<string, Monster>
  isLoading: boolean
  error: string | null
  setData: (data: {
    spells: Spell[]
    conditions: Condition[]
    classes: DndClass[]
    species: Species[]
    backgrounds: Background[]
    spellTables: Record<string, SpellSlotTable>
  }) => void
  appendMonsters: (items: MonsterSummary[]) => void
  setLoadingMonsterIndex: (v: boolean) => void
  cacheMonster: (monster: Monster) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
}

export const useDndDataStore = create<DndDataState>((set) => ({
  spells: new Map(),
  conditions: [],
  classes: [],
  species: [],
  backgrounds: [],
  spellTables: {},
  monsterIndex: [],
  isLoadingMonsterIndex: false,
  monsterCache: new Map(),
  isLoading: false,
  error: null,

  setData: ({ spells, conditions, classes, species, backgrounds, spellTables }) =>
    set({
      spells: new Map(spells.map(s => [s.key, s])),
      conditions,
      classes,
      species,
      backgrounds,
      spellTables,
      isLoading: false,
      error: null,
    }),

  // Duplikátok kiszűrése key alapján, majd hozzáfűzés
  appendMonsters: (items) =>
    set(s => {
      const existing = new Set(s.monsterIndex.map(m => m.key))
      const fresh = items.filter(m => !existing.has(m.key))
      return { monsterIndex: [...s.monsterIndex, ...fresh] }
    }),

  setLoadingMonsterIndex: (isLoadingMonsterIndex) => set({ isLoadingMonsterIndex }),

  cacheMonster: (monster) =>
    set(s => ({ monsterCache: new Map(s.monsterCache).set(monster.key, monster) })),

  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error, isLoading: false }),
}))
