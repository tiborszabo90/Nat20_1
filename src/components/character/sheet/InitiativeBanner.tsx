import { useState } from 'react'
import { useCombatStore } from '../../../store/combatStore'
import { useCampaignStore } from '../../../store/campaignStore'
import { useAuthStore } from '../../../store/authStore'
import { submitParticipant } from '../../../services/firebase/combatService'
import { getAbilityModifier } from '../../../data/dndConstants'
import type { Character } from '../../../types/dnd/character'

interface InitiativeBannerProps {
  character: Character
}

export function InitiativeBanner({ character }: InitiativeBannerProps) {
  const combat       = useCombatStore(s => s.combat)
  const campaignCode = useCampaignStore(s => s.campaignCode)
  const uid          = useAuthStore(s => s.uid)

  const [d20, setD20]       = useState<number>(1)
  const [submitting, setSubmitting] = useState(false)

  if (!combat || combat.phase !== 'initiative') return null
  if (!uid) return null

  const participantId = `player-${uid}`
  if (combat.participants[participantId]) return null  // már beküldte

  const dexMod = getAbilityModifier(character.abilityScores.DEX)
  const total  = d20 + dexMod

  async function handleSubmit() {
    if (!campaignCode || !uid) return
    setSubmitting(true)
    try {
      await submitParticipant(campaignCode, {
        id: participantId,
        name: character.name,
        type: 'player',
        playerUid: uid,
        dexMod,
        d20Roll: d20,
        total,
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-4 mt-4 bg-amber-900/40 border border-amber-500/60 rounded-card px-4 py-3">
      <p className="text-amber-300 text-xs font-display uppercase tracking-widest mb-3">
        ⚔️ Kezdeményezés – dobj d20-szal!
      </p>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <label className="text-text-muted text-sm">d20</label>
          <input
            type="number"
            min={1}
            max={20}
            value={d20}
            onChange={e => setD20(Math.min(20, Math.max(1, Number(e.target.value))))}
            className="w-14 bg-surface-raised border border-border rounded-input px-2 py-1 text-white text-center"
          />
        </div>
        <span className="text-text-muted text-sm">
          + {dexMod >= 0 ? `+${dexMod}` : dexMod} (DEX)
        </span>
        <span className="text-white font-bold text-lg">= {total}</span>
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="ml-auto bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-gray-950 font-semibold text-sm px-4 py-1.5 rounded-btn transition-colors"
        >
          {submitting ? 'Küldés...' : 'Beküld'}
        </button>
      </div>
    </div>
  )
}
