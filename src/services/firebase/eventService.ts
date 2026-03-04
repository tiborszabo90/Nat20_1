import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../../lib/firebase'
import type {
  SpellCastPayload,
  SaveRequiredPayload,
  DcSetPayload,
  ConditionAppliedPayload,
} from '../../types/app/event'

const CAMPAIGNS = 'campaigns'
const EVENTS = 'events'

export async function sendSpellCastEvent(
  campaignCode: string,
  fromUid: string,
  payload: SpellCastPayload
): Promise<void> {
  const eventsRef = collection(db, CAMPAIGNS, campaignCode, EVENTS)
  await addDoc(eventsRef, { type: 'spell_cast', payload, fromUid, createdAt: serverTimestamp() })
}

export async function sendSaveRequiredEvent(
  campaignCode: string,
  fromUid: string,
  payload: SaveRequiredPayload
): Promise<void> {
  const eventsRef = collection(db, CAMPAIGNS, campaignCode, EVENTS)
  await addDoc(eventsRef, { type: 'save_required', payload, fromUid, createdAt: serverTimestamp() })
}

export async function sendDcSetEvent(
  campaignCode: string,
  fromUid: string,
  payload: DcSetPayload
): Promise<void> {
  const eventsRef = collection(db, CAMPAIGNS, campaignCode, EVENTS)
  await addDoc(eventsRef, { type: 'dc_set', payload, fromUid, createdAt: serverTimestamp() })
}

export async function sendConditionAppliedEvent(
  campaignCode: string,
  fromUid: string,
  payload: ConditionAppliedPayload
): Promise<void> {
  const eventsRef = collection(db, CAMPAIGNS, campaignCode, EVENTS)
  await addDoc(eventsRef, { type: 'condition_applied', payload, fromUid, createdAt: serverTimestamp() })
}
