import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { createCampaign, joinCampaign, getDmCampaigns, getPlayerCampaigns } from '../services/firebase/campaignService'
import { useCampaignStore } from '../store/campaignStore'
import { useAuthStore } from '../store/authStore'
import { Button } from '../components/ui'
import type { Campaign, PlayerCampaignEntry } from '../types/app/campaign'

export function HomePage() {
  const navigate = useNavigate()
  const setCampaign = useCampaignStore(s => s.setCampaign)
  const uid = useAuthStore(s => s.uid)
  const displayName = useAuthStore(s => s.displayName)
  const email = useAuthStore(s => s.email)
  const signOut = useAuthStore(s => s.signOut)
  const [testing, setTesting] = useState(false)

  const [dmCampaigns, setDmCampaigns] = useState<Campaign[]>([])
  const [playerCampaigns, setPlayerCampaigns] = useState<PlayerCampaignEntry[]>([])
  const [loadingCampaigns, setLoadingCampaigns] = useState(true)

  // Saját kampányok betöltése bejelentkezés után
  useEffect(() => {
    if (!uid) return

    async function fetchMyCampaigns() {
      setLoadingCampaigns(true)
      try {
        const [dm, player] = await Promise.all([
          getDmCampaigns(uid!),
          getPlayerCampaigns(uid!),
        ])
        setDmCampaigns(dm)
        setPlayerCampaigns(player)
      } catch (err) {
        console.error('Kampánylista betöltési hiba:', err)
      } finally {
        setLoadingCampaigns(false)
      }
    }

    void fetchMyCampaigns()
  }, [uid])

  async function handleSignOut() {
    await signOut()
    navigate('/login', { replace: true })
  }

  // Csak fejlesztői módban érhető el – gyors karakterteszt kampánykód nélkül
  async function handleQuickTest() {
    if (!uid) return
    setTesting(true)
    try {
      const code = await createCampaign(uid, 'Dev Teszt Kampány')
      await joinCampaign(code, uid, 'Teszt Játékos')
      setCampaign(code, 'Dev Teszt Kampány', 'player')
      navigate(`/player/${code}/build`)
    } catch (err) {
      console.error('Gyors teszt hiba:', err)
      setTesting(false)
    }
  }

  const hasCampaigns = dmCampaigns.length > 0 || playerCampaigns.length > 0

  return (
    <div className="relative min-h-screen bg-surface-base text-white flex flex-col items-center justify-center gap-8 p-6">
      {/* Felhasználói fejléc – jobb felső sarok */}
      <div className="absolute top-4 right-4 flex items-center gap-3">
        <div className="text-right">
          <p className="text-white text-sm font-medium">{displayName ?? 'Felhasználó'}</p>
          <p className="text-text-muted text-xs">{email}</p>
        </div>
        <Button variant="ghost" size="sm" onClick={() => { void handleSignOut() }}>
          Kilépés
        </Button>
      </div>

      <div className="text-center">
        <h1 className="font-display text-6xl font-extrabold tracking-tight text-accent">NAT20</h1>
        <p className="mt-2 text-text-muted text-lg">D&D 2024 Segédalkalmazás</p>
      </div>

      <div className="flex flex-col gap-4 w-full max-w-xs">
        <Link
          to="/create"
          className="bg-accent hover:bg-accent-hover text-gray-950 font-display font-semibold uppercase tracking-wider py-4 px-6 rounded-btn text-center text-lg transition-colors"
        >
          Kampány létrehozása (DM)
        </Link>
        <Link
          to="/join"
          className="border border-accent hover:bg-accent/10 text-accent font-display font-semibold uppercase tracking-wider py-4 px-6 rounded-btn text-center text-lg transition-colors"
        >
          Csatlakozás kóddal
        </Link>

        <Link
          to="/encyclopedia"
          className="border border-dashed border-border hover:border-border-hover text-text-muted hover:text-text-secondary label-l py-3 px-6 rounded-btn text-center transition-colors"
        >
          📖 Tudástár
        </Link>

        {import.meta.env.DEV && (
          <Button
            variant="ghost"
            fullWidth
            disabled={testing || !uid}
            onClick={() => { void handleQuickTest() }}
          >
            {testing ? 'Létrehozás...' : '⚡ Gyors teszt (dev)'}
          </Button>
        )}
      </div>

      {/* Saját kampányok szekció */}
      {(loadingCampaigns || hasCampaigns) && (
        <div className="w-full max-w-xs">
          <h2 className="text-text-muted text-xs font-display uppercase tracking-widest mb-3">
            Saját kampányaim
          </h2>

          {loadingCampaigns ? (
            <div className="flex justify-center py-4">
              <div className="w-5 h-5 border-2 border-accent border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {dmCampaigns.map(c => (
                <div
                  key={c.id}
                  className="flex items-center justify-between gap-3 border border-border rounded-btn px-4 py-3"
                >
                  <div className="min-w-0">
                    <p className="text-white text-sm font-medium truncate">{c.name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-accent text-xs font-mono">{c.id}</span>
                      <span className="text-text-muted text-xs">DM</span>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/dm/${c.id}`)}
                  >
                    Belépés
                  </Button>
                </div>
              ))}

              {playerCampaigns.map(c => (
                <div
                  key={c.code}
                  className="flex items-center justify-between gap-3 border border-border rounded-btn px-4 py-3"
                >
                  <div className="min-w-0">
                    <p className="text-white text-sm font-medium truncate">{c.name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-accent text-xs font-mono">{c.code}</span>
                      <span className="text-text-muted text-xs">Játékos</span>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/player/${c.code}`)}
                  >
                    Visszatérés
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
