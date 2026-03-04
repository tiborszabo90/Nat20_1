import type { Timestamp } from 'firebase/firestore'

export type CampaignStatus = 'active' | 'paused' | 'ended'

export interface CampaignPlayer {
  displayName: string
  characterId: string
  joinedAt: Timestamp
}

export interface Campaign {
  id: string              // 6 jegyű alfanumerikus kód (pl. "A3X7K2")
  name: string
  dmUid: string
  status: CampaignStatus
  createdAt: Timestamp
}

/** Játékos tagságának minimális adata a főoldali kampánylistához */
export interface PlayerCampaignEntry {
  code: string
  name: string
}

export interface CampaignEvent {
  id: string
  type: string
  payload: Record<string, unknown>
  fromUid: string
  createdAt: Timestamp
}
