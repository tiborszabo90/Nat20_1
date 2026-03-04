import { useEffect, useRef } from 'react'
import {
  collection,
  doc,
  onSnapshot,
  query,
  orderBy,
  limit,
  type Unsubscribe,
} from 'firebase/firestore'
import { db } from '../lib/firebase'
import { useCampaignStore } from '../store/campaignStore'
import { useNotificationStore } from '../store/notificationStore'
import { useCharacterStore } from '../store/characterStore'
import type { AppCampaignEvent } from '../types/app/event'
import type { Character } from '../types/dnd/character'

// Valós idejű Firestore figyelők – csak akkor aktív, ha van campaignCode a store-ban
export function useFirestoreSync(): void {
  const campaignCode = useCampaignStore(s => s.campaignCode)
  const addEvent = useCampaignStore(s => s.addEvent)
  const setPlayers = useCampaignStore(s => s.setPlayers)
  const enqueue = useNotificationStore(s => s.enqueue)
  const characterId = useCharacterStore(s => s.character?.id ?? null)
  const setCharacter = useCharacterStore(s => s.setCharacter)

  const unsubscribeEvents = useRef<Unsubscribe | null>(null)
  const unsubscribePlayers = useRef<Unsubscribe | null>(null)
  const unsubscribeCharacter = useRef<Unsubscribe | null>(null)

  // Events + Players figyelők
  useEffect(() => {
    unsubscribeEvents.current?.()
    unsubscribePlayers.current?.()

    if (!campaignCode) return

    const eventsQuery = query(
      collection(db, 'campaigns', campaignCode, 'events'),
      orderBy('createdAt', 'desc'),
      limit(50)
    )

    // Az első snapshot csak az aktuális állapot – nem küldünk értesítést régi eseményekre
    let isFirstEventsSnapshot = true

    unsubscribeEvents.current = onSnapshot(eventsQuery, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          const data = change.doc.data()
          const event: AppCampaignEvent = {
            id: change.doc.id,
            type: data['type'] as AppCampaignEvent['type'],
            payload: data['payload'] as AppCampaignEvent['payload'],
            fromUid: data['fromUid'] as string,
            createdAt: data['createdAt'],
          }

          addEvent(event)

          if (!isFirstEventsSnapshot) {
            enqueue(event)
          }
        }
      })

      isFirstEventsSnapshot = false
    })

    unsubscribePlayers.current = onSnapshot(
      collection(db, 'campaigns', campaignCode, 'players'),
      (snapshot) => {
        const players = snapshot.docs.map(d => ({
          uid: d.id,
          displayName: d.data()['displayName'] as string,
        }))
        setPlayers(players)
      }
    )

    return () => {
      unsubscribeEvents.current?.()
      unsubscribePlayers.current?.()
      unsubscribeEvents.current = null
      unsubscribePlayers.current = null
    }
  }, [campaignCode, addEvent, setPlayers, enqueue])

  // Karakterlap valós idejű figyelője – HP és Spell Slot változások szinkronizálásához
  useEffect(() => {
    unsubscribeCharacter.current?.()

    if (!campaignCode || !characterId) return

    unsubscribeCharacter.current = onSnapshot(
      doc(db, 'campaigns', campaignCode, 'characters', characterId),
      (snap) => {
        if (snap.exists()) {
          setCharacter({ id: snap.id, ...snap.data() } as Character)
        }
      }
    )

    return () => {
      unsubscribeCharacter.current?.()
      unsubscribeCharacter.current = null
    }
  }, [campaignCode, characterId, setCharacter])
}
