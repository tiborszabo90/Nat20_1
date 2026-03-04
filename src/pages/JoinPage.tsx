import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { joinCampaign } from '../services/firebase/campaignService'
import { useAuthStore } from '../store/authStore'
import { Button } from '../components/ui'

export function JoinPage() {
  const navigate = useNavigate()
  const uid = useAuthStore(s => s.uid)
  const [code, setCode] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleJoin(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    const trimmedCode = code.trim().toUpperCase()
    if (trimmedCode.length !== 6) {
      setError('A kampánykód pontosan 6 karakter hosszú.')
      return
    }
    if (!displayName.trim()) {
      setError('Add meg a nevedet.')
      return
    }
    if (!uid) {
      setError('Azonosítás folyamatban, próbáld újra.')
      return
    }

    setLoading(true)
    try {
      await joinCampaign(trimmedCode, uid, displayName.trim())
      navigate(`/player/${trimmedCode}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Hiba történt.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-surface-base text-white flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <h2 className="heading-xl text-accent mb-6 text-center">Csatlakozás</h2>

        <form onSubmit={handleJoin} className="flex flex-col gap-4">
          <div>
            <label className="block body-m text-text-muted mb-1">Kampánykód</label>
            <input
              type="text"
              value={code}
              onChange={e => setCode(e.target.value.toUpperCase())}
              maxLength={6}
              placeholder="pl. A3X7K2"
              className="w-full bg-surface-raised border border-border rounded-input px-4 py-3 text-white text-center text-xl font-mono tracking-widest focus:outline-none focus:border-accent"
            />
          </div>

          <div>
            <label className="block body-m text-text-muted mb-1">Neved</label>
            <input
              type="text"
              value={displayName}
              onChange={e => setDisplayName(e.target.value)}
              placeholder="pl. Aragorn"
              className="w-full bg-surface-raised border border-border rounded-input px-4 py-3 text-white focus:outline-none focus:border-accent"
            />
          </div>

          {error && (
            <p className="text-red-400 text-sm text-center">{error}</p>
          )}

          <Button type="submit" size="lg" fullWidth disabled={loading || !uid}>
            {loading ? 'Csatlakozás...' : 'Csatlakozás'}
          </Button>
        </form>
      </div>
    </div>
  )
}
