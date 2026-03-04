import { create } from 'zustand'
import type { AppCampaignEvent } from '../types/app/event'

export type UserRole = 'dm' | 'player'

interface CampaignPlayer {
  uid: string
  displayName: string
}

interface CampaignState {
  campaignCode: string | null
  campaignName: string | null
  role: UserRole | null
  players: CampaignPlayer[]
  recentEvents: AppCampaignEvent[]
  setCampaign: (code: string, name: string, role: UserRole) => void
  setPlayers: (players: CampaignPlayer[]) => void
  addEvent: (event: AppCampaignEvent) => void
  clearCampaign: () => void
}

export const useCampaignStore = create<CampaignState>((set) => ({
  campaignCode: null,
  campaignName: null,
  role: null,
  players: [],
  recentEvents: [],

  setCampaign: (code, name, role) =>
    set({ campaignCode: code, campaignName: name, role }),

  setPlayers: (players) => set({ players }),

  // Legutóbbi 50 eseményt tartjuk meg
  addEvent: (event) =>
    set((state) => ({
      recentEvents: [event, ...state.recentEvents].slice(0, 50),
    })),

  clearCampaign: () =>
    set({ campaignCode: null, campaignName: null, role: null, players: [], recentEvents: [] }),
}))
