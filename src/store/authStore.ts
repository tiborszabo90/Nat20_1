import { create } from 'zustand'
import { signOut as firebaseSignOut } from 'firebase/auth'
import { auth } from '../lib/firebase'

interface AuthState {
  uid: string | null
  email: string | null
  displayName: string | null
  /** true ha onAuthStateChanged már tüzelt – ez előtt ne rendereljünk UID-függő tartalmat */
  isReady: boolean
  setUser: (uid: string, email: string | null, displayName: string | null) => void
  clearUser: () => void
  setReady: () => void
  signOut: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  uid: null,
  email: null,
  displayName: null,
  isReady: false,

  setUser: (uid, email, displayName) => set({ uid, email, displayName }),

  clearUser: () => set({ uid: null, email: null, displayName: null }),

  setReady: () => set({ isReady: true }),

  // Kijelentkezés: Firebase Auth session törlése + lokális state nullázása
  signOut: async () => {
    await firebaseSignOut(auth)
    set({ uid: null, email: null, displayName: null })
  },
}))
