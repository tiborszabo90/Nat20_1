import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useCampaignStore } from '../store/campaignStore'
import { useCharacterStore } from '../store/characterStore'
import { useAuthStore } from '../store/authStore'
import { getCharacterByPlayerUid } from '../services/firebase/characterService'

export function PlayerDashboardPage() {
  const { campaignId } = useParams<{ campaignId: string }>()
  const navigate = useNavigate()
  const setCampaign = useCampaignStore(s => s.setCampaign)
  const setCharacter = useCharacterStore(s => s.setCharacter)
  // uid közvetlenül az authStore-ból – nem a players tömb alapján azonosítunk
  const uid = useAuthStore(s => s.uid)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    if (!campaignId) return
    setCampaign(campaignId, '', 'player')
  }, [campaignId, setCampaign])

  // Karaktert keresünk – ha van, a sheet-re irányítjuk, ha nincs, a builderbe
  useEffect(() => {
    if (!campaignId || !uid) return

    async function checkCharacter() {
      setChecking(true)
      try {
        const character = await getCharacterByPlayerUid(campaignId!, uid!)
        if (character) {
          setCharacter(character)
          navigate(`/player/${campaignId}/battlemap`, { replace: true })
        } else {
          navigate(`/player/${campaignId}/build`, { replace: true })
        }
      } catch {
        navigate(`/player/${campaignId}/build`, { replace: true })
      } finally {
        setChecking(false)
      }
    }

    void checkCharacter()
  }, [campaignId, uid, navigate, setCharacter])

  return (
    <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
      <div className="text-center">
        <p className="text-gray-400 text-sm">
          {checking ? 'Karakter keresése...' : 'Átirányítás...'}
        </p>
      </div>
    </div>
  )
}
