import type { Timestamp } from 'firebase/firestore'

export interface SpellCastPayload {
  spellName: string
  savingThrow: string
  dc: number
  casterName: string
}

export interface SaveRequiredPayload {
  ability: string
  dc: number
  context: string
}

export interface DcSetPayload {
  dc: number
  reason: string
}

export interface ConditionAppliedPayload {
  conditionKey: string
  conditionName: string
  targetName: string
}

export interface SpellCastEvent {
  id: string
  type: 'spell_cast'
  payload: SpellCastPayload
  fromUid: string
  createdAt: Timestamp
}

export interface SaveRequiredEvent {
  id: string
  type: 'save_required'
  payload: SaveRequiredPayload
  fromUid: string
  createdAt: Timestamp
}

export interface DcSetEvent {
  id: string
  type: 'dc_set'
  payload: DcSetPayload
  fromUid: string
  createdAt: Timestamp
}

export interface ConditionAppliedEvent {
  id: string
  type: 'condition_applied'
  payload: ConditionAppliedPayload
  fromUid: string
  createdAt: Timestamp
}

export type AppCampaignEvent =
  | SpellCastEvent
  | SaveRequiredEvent
  | DcSetEvent
  | ConditionAppliedEvent
