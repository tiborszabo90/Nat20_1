import { useEffect } from 'react'
import { loadMonsterIndexBackground } from '../services/dnd-data/dndDataService'
import { getCached, setCached } from '../services/dnd-data/indexedDbCache'
import { useDndDataStore } from '../store/dndDataStore'
import type { MonsterSummary } from '../types/dnd/monster'

// Monster névindex betöltése – IndexedDB cache-ből azonnal, API-ból csak cache miss esetén
export function useDndMonsterIndex() {
  const monsterIndex = useDndDataStore(s => s.monsterIndex)
  const isLoadingMonsterIndex = useDndDataStore(s => s.isLoadingMonsterIndex)
  const appendMonsters = useDndDataStore(s => s.appendMonsters)
  const setLoadingMonsterIndex = useDndDataStore(s => s.setLoadingMonsterIndex)

  useEffect(() => {
    if (monsterIndex.length > 0 || isLoadingMonsterIndex) return

    getCached('monsters').then(cached => {
      if (cached && cached.length > 0) {
        // Cache találat – azonnali betöltés IndexedDB-ből
        appendMonsters(cached)
        return
      }
      // Cache miss – API fetch, progresszív megjelenítés + mentés a végén
      setLoadingMonsterIndex(true)
      const allItems: MonsterSummary[] = []
      loadMonsterIndexBackground(items => {
        allItems.push(...items)
        appendMonsters(items)
      })
        .then(() => setCached('monsters', allItems))
        .catch(console.error)
        .finally(() => setLoadingMonsterIndex(false))
    }).catch(console.error)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
}
