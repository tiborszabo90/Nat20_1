import { useEffect } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '../lib/firebase'
import { useAuthStore } from '../store/authStore'

/**
 * Firebase Auth állapot figyelő – egyszer hívandó az App komponensben.
 * - Ha van érvényes session, setUser() tölti be az adatokat.
 * - Ha nincs bejelentkezett felhasználó, clearUser() + setReady() → LoginPage jelenik meg.
 */
export function useAuth(): void {
  const setUser = useAuthStore(s => s.setUser)
  const clearUser = useAuthStore(s => s.clearUser)
  const setReady = useAuthStore(s => s.setReady)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user.uid, user.email, user.displayName)
      } else {
        clearUser()
      }
      setReady()
    })

    return unsubscribe
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
}
