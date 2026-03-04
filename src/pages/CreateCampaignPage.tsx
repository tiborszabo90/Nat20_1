import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createCampaign } from '../services/firebase/campaignService'
import { useAuthStore } from '../store/authStore'
import { Button } from '../components/ui'

export function CreateCampaignPage() {
  const navigate = useNavigate()
  const uid = useAuthStore(s => s.uid)
  const [campaignName, setCampaignName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!campaignName.trim()) {
      setError('Add meg a kampány nevét.')
      return
    }
    if (!uid) {
      setError('Azonosítás folyamatban, próbáld újra.')
      return
    }

    setLoading(true)
    try {
      const code = await createCampaign(uid, campaignName.trim())
      navigate(`/dm/${code}/battlemap`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Hiba történt.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-surface-base text-white flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <h2 className="heading-xl text-accent mb-6 text-center">Új Kampány</h2>

        <form onSubmit={handleCreate} className="flex flex-col gap-4">
          <div>
            <label className="block body-m text-text-muted mb-1">Kampány neve</label>
            <input
              type="text"
              value={campaignName}
              onChange={e => setCampaignName(e.target.value)}
              placeholder="pl. A Elveszett Akna..."
              className="w-full bg-surface-raised border border-border rounded-input px-4 py-3 text-white focus:outline-none focus:border-accent"
            />
          </div>

          {error && (
            <p className="text-red-400 text-sm text-center">{error}</p>
          )}

          <Button type="submit" size="lg" fullWidth disabled={loading || !uid}>
            {loading ? 'Létrehozás...' : 'Kampány létrehozása'}
          </Button>
        </form>
      </div>
    </div>
  )
}
