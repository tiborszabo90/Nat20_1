import type { CombatParticipant, CombatState } from '../../types/app/combat'

interface InitiativeModalProps {
  isDm: boolean
  combat: CombatState
  players: { uid: string; displayName: string }[]
  // DM
  monsters: CombatParticipant[]
  monsterD20Values: Record<string, string>
  editingEnemyInitiatives: boolean
  allInitiativeSubmitted: boolean
  startCombatBlockReason: string | null
  starting: boolean
  stopping: boolean
  onMonsterD20Change: (id: string, val: string) => void
  onMonsterSubmit: (id: string) => void
  onEditEnemyInitiatives: () => void
  onStopEditing: () => void
  onStartCombat: () => void
  onStopCombat: () => void
  // Játékos
  d20: number
  dexMod: number
  playerAlreadySubmitted: boolean
  submitting: boolean
  onD20Change: (val: number) => void
  onSubmitInitiative: () => void
}

export function InitiativeModal({
  isDm,
  combat,
  players,
  monsters,
  monsterD20Values,
  editingEnemyInitiatives,
  allInitiativeSubmitted,
  startCombatBlockReason,
  starting,
  stopping,
  onMonsterD20Change,
  onMonsterSubmit,
  onEditEnemyInitiatives,
  onStopEditing,
  onStartCombat,
  onStopCombat,
  d20,
  dexMod,
  playerAlreadySubmitted,
  submitting,
  onD20Change,
  onSubmitInitiative,
}: InitiativeModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm bg-black/60">
      <div className="w-full max-w-md bg-surface-overlay border border-amber-500/40 rounded-card shadow-2xl p-6 space-y-5">

        {/* Fejléc */}
        <div className="flex items-center gap-2">
          <span className="text-amber-400 font-display text-sm uppercase tracking-widest">⚔️ Kezdeményezés</span>
        </div>

        {isDm ? (
          <>
            {/* Ellenfelek */}
            {monsters.length > 0 && (
              <div className="space-y-2">
                <p className="text-text-muted text-xs uppercase tracking-widest">Ellenfelek</p>
                {monsters.map(m => {
                  const dexM = m.dexMod ?? 0
                  const d20Val = parseInt(monsterD20Values[m.id] ?? '', 10)
                  const previewTotal = isNaN(d20Val) ? null : d20Val + dexM
                  return (
                    <div key={m.id} className="flex items-center gap-2">
                      <span className="text-text-secondary text-sm flex-1 truncate">{m.name}</span>
                      {m.total !== null && !editingEnemyInitiatives ? (
                        <span className="text-green-400 text-sm font-mono font-semibold">{m.total}</span>
                      ) : (
                        <>
                          <input
                            type="number"
                            min={1} max={20}
                            value={monsterD20Values[m.id] ?? ''}
                            onChange={e => onMonsterD20Change(m.id, e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && void onMonsterSubmit(m.id)}
                            onBlur={() => void onMonsterSubmit(m.id)}
                            placeholder="d20"
                            className="w-14 bg-surface-raised border border-border rounded px-2 py-1 text-sm text-center text-white focus:outline-none focus:border-accent [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          />
                          <span className="text-text-muted text-xs w-8 text-right">{dexM >= 0 ? `+${dexM}` : dexM}</span>
                          <span className="text-white text-sm font-mono w-8 text-right">
                            {previewTotal !== null ? `=${previewTotal}` : ''}
                          </span>
                        </>
                      )}
                    </div>
                  )
                })}
              </div>
            )}

            {/* Játékosok */}
            {players.length > 0 && (
              <div className="space-y-2">
                <p className="text-text-muted text-xs uppercase tracking-widest">Játékosok</p>
                {players.map(pl => {
                  const submitted = `player-${pl.uid}` in combat.participants
                  const total = combat.participants[`player-${pl.uid}`]?.total
                  return (
                    <div key={pl.uid} className="flex items-center gap-2">
                      <span className={`text-sm flex-1 truncate ${submitted ? 'text-text-secondary' : 'text-text-disabled'}`}>
                        {pl.displayName}
                      </span>
                      {submitted
                        ? <span className="text-green-400 text-sm font-mono font-semibold">{total ?? '–'}</span>
                        : <span className="text-text-disabled text-sm">…</span>
                      }
                    </div>
                  )
                })}
              </div>
            )}

            {/* Gombok */}
            <div className="flex flex-wrap gap-2 pt-1 border-t border-border-subtle">
              {monsters.length > 0 && monsters.every(m => m.total !== null) && !editingEnemyInitiatives && (
                <button
                  onClick={onEditEnemyInitiatives}
                  className="text-text-muted hover:text-white text-xs border border-border rounded-btn px-3 py-1.5 transition-colors"
                >
                  Értékek módosítása
                </button>
              )}
              {editingEnemyInitiatives && (
                <button
                  onClick={onStopEditing}
                  className="text-text-muted hover:text-white text-xs border border-border rounded-btn px-3 py-1.5 transition-colors"
                >
                  Kész
                </button>
              )}
              <div className="flex gap-2 ml-auto">
                <button
                  onClick={onStopCombat}
                  disabled={stopping}
                  className="text-text-muted hover:text-red-400 text-xs border border-border rounded-btn px-3 py-1.5 transition-colors"
                >
                  Mégsem
                </button>
                <button
                  onClick={onStartCombat}
                  disabled={starting || !allInitiativeSubmitted || editingEnemyInitiatives}
                  title={editingEnemyInitiatives ? 'Fejezd be az értékek módosítását' : (startCombatBlockReason ?? undefined)}
                  className="bg-amber-500 hover:bg-amber-400 disabled:opacity-40 disabled:cursor-not-allowed text-gray-950 font-semibold text-xs py-1.5 px-4 rounded-btn transition-colors"
                >
                  {starting ? '...' : 'Körök indítása →'}
                </button>
              </div>
            </div>
          </>
        ) : (
          /* Játékos nézet */
          <>
            {playerAlreadySubmitted ? (
              <div className="text-center py-4 space-y-2">
                <p className="text-green-400 text-lg font-semibold">✓ Initiative beküldve</p>
                <p className="text-text-muted text-sm">Várj a DM-re…</p>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-text-secondary text-sm">Dobj d20-szal, majd add meg az eredményt!</p>
                <div className="flex items-center justify-center gap-3">
                  <div className="text-center">
                    <p className="text-text-muted text-xs mb-1">d20</p>
                    <input
                      type="number"
                      min={1} max={20}
                      value={d20}
                      onChange={e => onD20Change(Math.min(20, Math.max(1, Number(e.target.value))))}
                      className="w-16 bg-surface-raised border border-border rounded px-2 py-2 text-lg text-center text-white font-bold focus:outline-none focus:border-accent [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                  </div>
                  <span className="text-text-muted text-xl mt-4">{dexMod >= 0 ? `+${dexMod}` : dexMod}</span>
                  <div className="text-center mt-4">
                    <span className="text-white font-bold text-2xl">= {d20 + dexMod}</span>
                  </div>
                </div>
                <button
                  onClick={onSubmitInitiative}
                  disabled={submitting}
                  className="w-full bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-gray-950 font-semibold py-2.5 px-4 rounded-btn transition-colors"
                >
                  {submitting ? 'Küldés...' : 'Beküld'}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
