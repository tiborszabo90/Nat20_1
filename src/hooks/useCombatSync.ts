import { useEffect, useRef } from 'react'
import type { Unsubscribe } from 'firebase/firestore'
import { subscribeToCombat } from '../services/firebase/combatService'
import { useCampaignStore } from '../store/campaignStore'
import { useCombatStore } from '../store/combatStore'

/** Valós idejű Firestore figyelő a harc állapotára */
export function useCombatSync(): void {
  const campaignCode = useCampaignStore(s => s.campaignCode)
  const setCombat    = useCombatStore(s => s.setCombat)
  const clearCombat  = useCombatStore(s => s.clearCombat)

  const unsubscribe = useRef<Unsubscribe | null>(null)

  useEffect(() => {
    unsubscribe.current?.()

    if (!campaignCode) return

    unsubscribe.current = subscribeToCombat(campaignCode, setCombat)

    return () => {
      unsubscribe.current?.()
      unsubscribe.current = null
      clearCombat()
    }
  }, [campaignCode, setCombat, clearCombat])
}
