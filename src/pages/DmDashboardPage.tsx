import { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useCampaignStore } from '../store/campaignStore'

export function DmDashboardPage() {
  const { campaignId } = useParams<{ campaignId: string }>()
  const navigate = useNavigate()
  const setCampaign = useCampaignStore(s => s.setCampaign)

  // Store-ba töltjük a kampánykódot, majd azonnal a battlemap-re irányítunk
  useEffect(() => {
    if (campaignId) {
      setCampaign(campaignId, '', 'dm')
      navigate(`/dm/${campaignId}/battlemap`, { replace: true })
    }
  }, [campaignId, setCampaign, navigate])

  return (
    <div className="min-h-screen bg-surface-base text-white flex flex-col items-center justify-center p-6">
      <div className="text-center">
        <p className="text-text-subtle text-sm mb-2">DM nézet</p>
        <h2 className="heading-l text-accent">Kampánykód</h2>
        <div className="mt-4 bg-surface-raised rounded-card px-8 py-6">
          <span className="text-5xl font-black font-mono tracking-widest text-white">
            {campaignId}
          </span>
        </div>
        <p className="mt-4 text-text-muted text-sm">
          Oszd meg ezt a kódot a játékosaiddal.
        </p>
        <div className="mt-6 flex flex-col items-center gap-3">
          <button
            onClick={() => navigate(`/dm/${campaignId}/battlemap`)}
            className="text-accent hover:text-accent-hover label-l flex items-center gap-1.5 transition-colors"
          >
            <span>🗺️</span>
            <span>Battlemap megnyitása</span>
          </button>
          <button
            onClick={() => navigate(`/dm/${campaignId}/encyclopedia`)}
            className="text-accent hover:text-accent-hover label-l flex items-center gap-1.5 transition-colors"
          >
            <span>📖</span>
            <span>Tudástár megnyitása</span>
          </button>
        </div>
      </div>
    </div>
  )
}
