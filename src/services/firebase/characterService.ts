import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  query,
  where,
  serverTimestamp,
} from 'firebase/firestore'
import { db } from '../../lib/firebase'
import type { Character } from '../../types/dnd/character'
import type { Ability } from '../../data/dndConstants'
import type { AbilityScores } from '../../types/dnd/character'

const CAMPAIGNS = 'campaigns'
const CHARACTERS = 'characters'

// Karakter létrehozásához szükséges adatok (id és timestamps nélkül)
export interface CreateCharacterData {
  playerName: string
  name: string
  speciesKey: string
  backgroundKey: string
  classKey: string
  level: number
  abilityScores: AbilityScores
  maxHp: number
  currentHp: number
  temporaryHp: number
  armorClass: number
  skillProficiencies: string[]
  savingThrowProficiencies: Ability[]
  originFeatKey: string
  weaponMasteries: string[]
  instrumentProficiencies: string[]
  divineOrder: string | null
  languages: string[]
  spellSlots: number[] | null
  usedSpellSlots: number[]
}

export async function createCharacter(
  campaignCode: string,
  playerUid: string,
  data: CreateCharacterData
): Promise<string> {
  const ref = collection(db, CAMPAIGNS, campaignCode, CHARACTERS)
  const docRef = await addDoc(ref, {
    ...data,
    campaignCode,
    playerUid,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
  return docRef.id
}

export async function getCharacterByPlayerUid(
  campaignCode: string,
  playerUid: string
): Promise<Character | null> {
  const ref = collection(db, CAMPAIGNS, campaignCode, CHARACTERS)
  const q = query(ref, where('playerUid', '==', playerUid))
  const snap = await getDocs(q)
  if (snap.empty) return null
  const d = snap.docs[0]
  return { id: d.id, ...d.data() } as Character
}

/** Karakter törlése (új karakter létrehozása előtt) */
export async function deleteCharacter(
  campaignCode: string,
  characterId: string
): Promise<void> {
  await deleteDoc(doc(db, CAMPAIGNS, campaignCode, CHARACTERS, characterId))
}

export async function updateHp(
  campaignCode: string,
  characterId: string,
  currentHp: number,
  temporaryHp: number
): Promise<void> {
  const ref = doc(db, CAMPAIGNS, campaignCode, CHARACTERS, characterId)
  await updateDoc(ref, { currentHp, temporaryHp, updatedAt: serverTimestamp() })
}

export async function useSpellSlot(
  campaignCode: string,
  characterId: string,
  slotLevel: number,
  usedSpellSlots: number[]
): Promise<void> {
  const ref = doc(db, CAMPAIGNS, campaignCode, CHARACTERS, characterId)
  const updated = [...usedSpellSlots]
  updated[slotLevel] = (updated[slotLevel] ?? 0) + 1
  await updateDoc(ref, { usedSpellSlots: updated, updatedAt: serverTimestamp() })
}

export async function restoreSpellSlots(
  campaignCode: string,
  characterId: string
): Promise<void> {
  const ref = doc(db, CAMPAIGNS, campaignCode, CHARACTERS, characterId)
  await updateDoc(ref, { usedSpellSlots: [0,0,0,0,0,0,0,0,0], updatedAt: serverTimestamp() })
}
