import { create } from 'zustand'
import type { AppCampaignEvent } from '../types/app/event'

export interface Notification {
  id: string
  event: AppCampaignEvent
  receivedAt: number
}

interface NotificationState {
  queue: Notification[]
  enqueue: (event: AppCampaignEvent) => void
  dismiss: (id: string) => void
  dismissAll: () => void
}

export const useNotificationStore = create<NotificationState>((set) => ({
  queue: [],

  // Duplikátum-szűrés: Firestore onSnapshot újraküldés ellen
  enqueue: (event) =>
    set((state) => ({
      queue: state.queue.some(n => n.id === event.id)
        ? state.queue
        : [...state.queue, { id: event.id, event, receivedAt: Date.now() }],
    })),

  dismiss: (id) =>
    set((state) => ({ queue: state.queue.filter(n => n.id !== id) })),

  dismissAll: () => set({ queue: [] }),
}))
