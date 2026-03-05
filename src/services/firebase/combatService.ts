import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  serverTimestamp,
  type Unsubscribe,
} from 'firebase/firestore'
import { db } from '../../lib/firebase'
import type { CombatParticipant, CombatState } from '../../types/app/combat'
import type { BattlemapToken } from '../../types/app/map'

const combatDoc = (code: string) =>
  doc(db, 'campaigns', code, 'combat', 'state')

/**
 * Harc indítása – initiative fázis.
 * Beolvassa a battlemap encounter tokenjeit és ellenfél résztvevőként előtölti őket (total=null).
 * @param dexMods tokenId → DEX modifier (a DM-oldal számítja ki az ellenfél adataiból)
 */
export async function startInitiative(
  code: string,
  dexMods: Record<string, number> = {}
): Promise<void> {
  const bmSnap = await getDoc(doc(db, 'campaigns', code, 'battlemap', 'state'))
  const allTokens: BattlemapToken[] = bmSnap.exists()
    ? Object.values((bmSnap.data()['tokens'] ?? {}) as Record<string, BattlemapToken>)
    : []
  const encounterTokens = allTokens.filter(t => t.type === 'encounter')

  // Azonos nevű ellenfelek számozása (pl. "Goblin 1", "Goblin 2")
  const nameCounts: Record<string, number> = {}
  for (const token of encounterTokens) {
    const base = token.fullName ?? token.label
    nameCounts[base] = (nameCounts[base] ?? 0) + 1
  }
  const nameCounters: Record<string, number> = {}
  const participants: Record<string, CombatParticipant> = {}
  for (const token of encounterTokens) {
    const base = token.fullName ?? token.label
    let name = base
    if (nameCounts[base] > 1) {
      nameCounters[base] = (nameCounters[base] ?? 0) + 1
      name = `${base} ${nameCounters[base]}`
    }
    participants[token.id] = {
      id: token.id,
      name,
      type: 'monster',
      playerUid: null,
      dexMod: dexMods[token.id] ?? null,
      d20Roll: null,
      total: null,
    }
  }

  await setDoc(combatDoc(code), {
    phase: 'initiative',
    round: 0,
    currentTurnIndex: 0,
    participants,
    turnOrder: [],
    updatedAt: serverTimestamp(),
  })
}

/** Résztvevő hozzáadása / frissítése (játékos submit vagy DM ellenfél initiative) */
export async function submitParticipant(
  code: string,
  participant: CombatParticipant
): Promise<void> {
  await updateDoc(combatDoc(code), {
    [`participants.${participant.id}`]: participant,
    updatedAt: serverTimestamp(),
  })
}

/** Körök indítása – initiative eredmények alapján rendezi a sorrendet */
export async function startCombat(
  code: string,
  participants: Record<string, CombatParticipant>
): Promise<void> {
  const sorted = Object.values(participants).sort((a, b) => {
    if (a.total === null && b.total === null) return 0
    if (a.total === null) return 1
    if (b.total === null) return -1
    return b.total - a.total
  })

  await setDoc(combatDoc(code), {
    phase: 'combat',
    round: 1,
    currentTurnIndex: 0,
    participants,
    turnOrder: sorted.map(p => p.id),
    updatedAt: serverTimestamp(),
  })
}

/** Következő kör – currentTurnIndex lép, kör számlál ha átfordult */
export async function nextTurn(
  code: string,
  turnOrder: string[],
  currentTurnIndex: number,
  round: number
): Promise<void> {
  const nextIndex = (currentTurnIndex + 1) % turnOrder.length
  const nextRound = nextIndex === 0 ? round + 1 : round

  await updateDoc(combatDoc(code), {
    currentTurnIndex: nextIndex,
    round: nextRound,
    updatedAt: serverTimestamp(),
  })
}

/** Harc leállítása – törli a combat state dokumentumot */
export async function stopCombat(code: string): Promise<void> {
  await deleteDoc(combatDoc(code))
}

/** Valós idejű Firestore figyelő a harc állapotára */
export function subscribeToCombat(
  code: string,
  cb: (state: CombatState | null) => void
): Unsubscribe {
  return onSnapshot(combatDoc(code), (snap) => {
    if (snap.exists()) {
      const data = snap.data()
      cb({
        phase: data['phase'] as CombatState['phase'],
        round: data['round'] as number,
        currentTurnIndex: data['currentTurnIndex'] as number,
        participants: (data['participants'] ?? {}) as Record<string, CombatParticipant>,
        turnOrder: (data['turnOrder'] ?? []) as string[],
      })
    } else {
      cb(null)
    }
  })
}
