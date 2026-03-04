import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { signIn, signUp } from '../services/firebase/authService'
import { useAuthStore } from '../store/authStore'
import { Button } from '../components/ui'

// Firebase hibakód → magyar szöveg
function translateError(code: string): string {
  switch (code) {
    case 'auth/invalid-email':        return 'Érvénytelen e-mail cím.'
    case 'auth/user-not-found':       return 'Nem találtunk fiókot ezzel az e-mail címmel.'
    case 'auth/wrong-password':       return 'Helytelen jelszó.'
    case 'auth/invalid-credential':   return 'Érvénytelen e-mail vagy jelszó.'
    case 'auth/email-already-in-use': return 'Ez az e-mail cím már regisztrálva van.'
    case 'auth/weak-password':        return 'A jelszó legalább 6 karakter kell legyen.'
    case 'auth/too-many-requests':    return 'Túl sok próbálkozás. Kérjük, várj egy kicsit.'
    default:                          return 'Ismeretlen hiba történt.'
  }
}

type Tab = 'login' | 'register'

export function LoginPage() {
  const navigate = useNavigate()
  const uid = useAuthStore(s => s.uid)

  const [tab, setTab] = useState<Tab>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Ha már be van jelentkezve, irányítsuk a főoldalra
  useEffect(() => {
    if (uid) navigate('/', { replace: true })
  }, [uid, navigate])

  function switchTab(t: Tab) {
    setTab(t)
    setError('')
    setPassword('')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (tab === 'register' && !displayName.trim()) {
      setError('Add meg a megjelenítési nevedet.')
      return
    }

    setLoading(true)
    try {
      if (tab === 'login') {
        await signIn(email.trim(), password)
      } else {
        await signUp(email.trim(), password, displayName.trim())
      }
      // onAuthStateChanged automatikusan frissíti az authStore-t → App.tsx átirányít
    } catch (err: unknown) {
      const code = (err as { code?: string }).code ?? ''
      setError(translateError(code))
    } finally {
      setLoading(false)
    }
  }

  const inputClass =
    'w-full bg-gray-900 border border-border rounded-btn px-4 py-3 text-white placeholder:text-text-muted focus:outline-none focus:border-accent transition-colors'

  return (
    <div className="min-h-screen bg-surface-base text-white flex flex-col items-center justify-center gap-8 p-6">
      <div className="text-center">
        <h1 className="font-display text-6xl font-extrabold tracking-tight text-accent">NAT20</h1>
        <p className="mt-2 text-text-muted text-lg">D&D 2024 Segédalkalmazás</p>
      </div>

      <div className="w-full max-w-sm">
        {/* Tab fejléc */}
        <div className="flex border-b border-border mb-6">
          <button
            type="button"
            onClick={() => switchTab('login')}
            className={`flex-1 pb-3 font-display uppercase tracking-wider text-sm transition-colors ${
              tab === 'login'
                ? 'text-accent border-b-2 border-accent'
                : 'text-text-muted hover:text-text-secondary'
            }`}
          >
            Bejelentkezés
          </button>
          <button
            type="button"
            onClick={() => switchTab('register')}
            className={`flex-1 pb-3 font-display uppercase tracking-wider text-sm transition-colors ${
              tab === 'register'
                ? 'text-accent border-b-2 border-accent'
                : 'text-text-muted hover:text-text-secondary'
            }`}
          >
            Regisztráció
          </button>
        </div>

        <form onSubmit={(e) => { void handleSubmit(e) }} className="flex flex-col gap-4">
          {tab === 'register' && (
            <div>
              <label className="block text-sm text-text-muted mb-1">Megjelenítési név</label>
              <input
                type="text"
                value={displayName}
                onChange={e => setDisplayName(e.target.value)}
                placeholder="pl. Gandalf"
                className={inputClass}
                autoComplete="nickname"
              />
            </div>
          )}

          <div>
            <label className="block text-sm text-text-muted mb-1">E-mail cím</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="pl. gandalf@middle-earth.me"
              className={inputClass}
              autoComplete="email"
            />
          </div>

          <div>
            <label className="block text-sm text-text-muted mb-1">Jelszó</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="minimum 6 karakter"
              className={inputClass}
              autoComplete={tab === 'login' ? 'current-password' : 'new-password'}
            />
          </div>

          {error && (
            <p className="text-red-400 text-sm text-center">{error}</p>
          )}

          <Button type="submit" size="lg" fullWidth disabled={loading}>
            {loading
              ? (tab === 'login' ? 'Bejelentkezés...' : 'Regisztráció...')
              : (tab === 'login' ? 'Bejelentkezés' : 'Fiók létrehozása')}
          </Button>
        </form>
      </div>
    </div>
  )
}
