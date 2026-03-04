import { useEffect } from 'react'
import { loadAllDndData } from '../services/dnd-data/dndDataService'
import { useDndDataStore } from '../store/dndDataStore'

// D&D adatok inicializálása app induláskor – egyszer hívandó az App komponensben
export function useDndData(): { isLoading: boolean; error: string | null } {
  const setData = useDndDataStore(s => s.setData)
  const setLoading = useDndDataStore(s => s.setLoading)
  const setError = useDndDataStore(s => s.setError)
  const isLoading = useDndDataStore(s => s.isLoading)
  const error = useDndDataStore(s => s.error)

  useEffect(() => {
    let cancelled = false

    async function init() {
      setLoading(true)
      try {
        const data = await loadAllDndData()
        if (!cancelled) setData(data)
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'D&D adatok betöltése sikertelen.')
        }
      }
    }

    void init()

    return () => { cancelled = true }
  // Szándékosan üres dep. array – csak egyszer fut le app induláskor
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return { isLoading, error }
}
