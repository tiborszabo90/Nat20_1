import { openDB } from 'idb'
import type { DBSchema, IDBPDatabase } from 'idb'
import type { Spell } from '../../types/dnd/spell'
import type { Condition } from '../../types/dnd/condition'
import type { DndClass } from '../../types/dnd/class'
import type { Species } from '../../types/dnd/species'
import type { Background } from '../../types/dnd/background'
import type { MonsterSummary } from '../../types/dnd/monster'

// Az adatok érvényességi ideje: 7 nap milliszekundumban
const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000
const DB_NAME = 'nat20-dnd-data-v4'
const DB_VERSION = 3

// Spell slot tábla típus: index 0 = null, index 1-20 = szintenként [1st..9th] slotok
export type SpellSlotTable = (number[] | null)[]

interface Nat20DBSchema extends DBSchema {
  spells: { key: string; value: { data: Spell[]; fetchedAt: number } }
  conditions: { key: string; value: { data: Condition[]; fetchedAt: number } }
  classes: { key: string; value: { data: DndClass[]; fetchedAt: number } }
  species: { key: string; value: { data: Species[]; fetchedAt: number } }
  backgrounds: { key: string; value: { data: Background[]; fetchedAt: number } }
  // v2: monsters store átváltva MonsterSummary[] névindexre (csak kereséshez)
  monsters: { key: string; value: { data: MonsterSummary[]; fetchedAt: number } }
  // v3: spell slot táblák open5e v2-ből (kaszt → szintenként)
  spellTables: { key: string; value: { data: Record<string, SpellSlotTable>; fetchedAt: number } }
}

// Egyszeri DB példány – lazy init
let dbPromise: Promise<IDBPDatabase<Nat20DBSchema>> | null = null

function getDb(): Promise<IDBPDatabase<Nat20DBSchema>> {
  if (!dbPromise) {
    dbPromise = openDB<Nat20DBSchema>(DB_NAME, DB_VERSION, {
      upgrade(db, oldVersion) {
        if (!db.objectStoreNames.contains('spells')) db.createObjectStore('spells')
        if (!db.objectStoreNames.contains('conditions')) db.createObjectStore('conditions')
        if (!db.objectStoreNames.contains('classes')) db.createObjectStore('classes')
        if (!db.objectStoreNames.contains('species')) db.createObjectStore('species')
        if (!db.objectStoreNames.contains('backgrounds')) db.createObjectStore('backgrounds')
        // v1→v2: régi Monster[] store törlése, új MonsterSummary[] store létrehozása
        if (oldVersion < 2) {
          if (db.objectStoreNames.contains('monsters')) db.deleteObjectStore('monsters')
          db.createObjectStore('monsters')
        }
        // v2→v3: spell slot táblák store
        if (oldVersion < 3) {
          db.createObjectStore('spellTables')
        }
      },
    })
  }
  return dbPromise
}

function isFresh(fetchedAt: number): boolean {
  return Date.now() - fetchedAt < CACHE_TTL_MS
}

type StoreDataMap = {
  spells: Spell[]
  conditions: Condition[]
  classes: DndClass[]
  species: Species[]
  backgrounds: Background[]
  monsters: MonsterSummary[]
  spellTables: Record<string, SpellSlotTable>
}

type StoreName = 'spells' | 'conditions' | 'classes' | 'species' | 'backgrounds' | 'monsters' | 'spellTables'

export async function getCached<K extends StoreName>(
  store: K
): Promise<StoreDataMap[K] | null> {
  const db = await getDb()
  const record = await db.get(store, store)
  if (!record || !isFresh(record.fetchedAt)) return null
  return record.data as StoreDataMap[K]
}

export async function setCached<K extends StoreName>(
  store: K,
  data: StoreDataMap[K]
): Promise<void> {
  const db = await getDb()
  const value = { data, fetchedAt: Date.now() } as Nat20DBSchema[K]['value']
  await db.put(store, value, store)
}
