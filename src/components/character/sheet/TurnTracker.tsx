import { useCombatStore } from '../../../store/combatStore'
import { useAuthStore } from '../../../store/authStore'

export function TurnTracker() {
  const combat = useCombatStore(s => s.combat)
  const uid    = useAuthStore(s => s.uid)

  if (!combat || combat.phase !== 'combat') return null

  const { turnOrder, participants, currentTurnIndex, round } = combat
  const currentId = turnOrder[currentTurnIndex]

  return (
    <div className="mx-4 mt-4 border border-border-subtle rounded-card overflow-hidden">
      {/* Fejléc */}
      <div className="flex items-center justify-between px-4 py-2 bg-surface-raised border-b border-border-subtle">
        <p className="text-amber-400 text-xs font-display uppercase tracking-widest">⚔️ Harc</p>
        <p className="text-text-muted text-xs">{round}. kör</p>
      </div>

      {/* Sorrend */}
      <div className="divide-y divide-border-subtle">
        {turnOrder.map((id) => {
          const p          = participants[id]
          if (!p) return null
          const isCurrent  = id === currentId
          const isMe       = p.playerUid === uid

          return (
            <div
              key={id}
              className={`flex items-center gap-3 px-4 py-2 text-sm ${
                isCurrent ? 'bg-amber-500/15' : ''
              }`}
            >
              <span className={`flex-1 truncate ${isCurrent ? 'text-amber-300 font-semibold' : 'text-text-secondary'}`}>
                {p.name}
                {isMe && <span className="ml-1 text-accent text-xs">(te)</span>}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
