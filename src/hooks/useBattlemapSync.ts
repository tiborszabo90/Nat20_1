import { useEffect, useRef } from 'react'
import type { Unsubscribe } from 'firebase/firestore'
import { subscribeToBattlemap } from '../services/firebase/battlemapService'
import { useCampaignStore } from '../store/campaignStore'
import { useBattlemapStore } from '../store/battlemapStore'

/** Valós idejű Firestore figyelő a battlemap állapotára – BattlemapPage-en belül hívandó */
export function useBattlemapSync(): void {
  const campaignCode = useCampaignStore(s => s.campaignCode)
  const setBattlemap = useBattlemapStore(s => s.setBattlemap)
  const clearBattlemap = useBattlemapStore(s => s.clearBattlemap)

  const unsubscribe = useRef<Unsubscribe | null>(null)

  useEffect(() => {
    unsubscribe.current?.()

    if (!campaignCode) return

    unsubscribe.current = subscribeToBattlemap(campaignCode, setBattlemap)

    return () => {
      unsubscribe.current?.()
      unsubscribe.current = null
      clearBattlemap()
    }
  }, [campaignCode, setBattlemap, clearBattlemap])
}
