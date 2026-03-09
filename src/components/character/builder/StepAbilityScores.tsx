import { useState } from 'react'
import {
  ABILITIES,
  STANDARD_ARRAY,
  POINT_BUY_COSTS,
  POINT_BUY_TOTAL,
  getAbilityModifier,
} from '../../../data/dndConstants'
import type { Ability } from '../../../data/dndConstants'
import type { AbilityScores } from '../../../types/dnd/character'

type Method = 'standard' | 'pointbuy' | 'manual'

interface Props {
  baseScores: AbilityScores
  bonuses: Partial<AbilityScores>  // species + background bónuszok
  onChange: (scores: AbilityScores) => void
}

const ABILITY_NAMES: Record<Ability, string> = {
  STR: 'Strength', DEX: 'Dexterity', CON: 'Constitution',
  INT: 'Intelligence', WIS: 'Wisdom', CHA: 'Charisma',
}

export function StepAbilityScores({ baseScores: _baseScores, bonuses, onChange }: Props) {
  const [method, setMethod] = useState<Method>('standard')
  // Standard Array: melyik ability-hoz melyik értéket rendelték
  const [assignments, setAssignments] = useState<Partial<Record<Ability, number>>>({})
  // Point Buy: raw értékek (bónusz nélkül)
  const [pbScores, setPbScores] = useState<AbilityScores>({
    STR: 8, DEX: 8, CON: 8, INT: 8, WIS: 8, CHA: 8,
  })
  // Manual: szabad bevitel
  const [manualScores, setManualScores] = useState<AbilityScores>({
    STR: 10, DEX: 10, CON: 10, INT: 10, WIS: 10, CHA: 10,
  })

  // Végső értékek (base + bonus) az éppen aktív módszerhez
  function getFinalScores(): AbilityScores {
    const base = method === 'standard'
      ? getStandardScores()
      : method === 'pointbuy'
        ? pbScores
        : manualScores

    return ABILITIES.reduce((acc, ab) => {
      acc[ab] = (base[ab] ?? 8) + (bonuses[ab] ?? 0)
      return acc
    }, {} as AbilityScores)
  }

  function getStandardScores(): AbilityScores {
    return ABILITIES.reduce((acc, ab) => {
      acc[ab] = assignments[ab] ?? 8
      return acc
    }, {} as AbilityScores)
  }

  // Standard Array: egy érték egy ability-hoz rendelhető
  function assignStandard(ability: Ability, value: number) {
    // Ha más ability-nél már ez az érték van, töröljük onnét
    const cleared = Object.fromEntries(
      Object.entries(assignments).filter(([, v]) => v !== value)
    ) as Partial<Record<Ability, number>>
    const next = { ...cleared, [ability]: value }
    setAssignments(next)
    const scores = ABILITIES.reduce((acc, ab) => {
      acc[ab] = next[ab] ?? 8
      return acc
    }, {} as AbilityScores)
    onChange(applyBonuses(scores))
  }

  // Point Buy: +/- gomb
  function adjustPb(ability: Ability, delta: number) {
    const current = pbScores[ability]
    const next = current + delta
    if (next < 8 || next > 15) return
    const newScores = { ...pbScores, [ability]: next }
    const spent = ABILITIES.reduce((sum, ab) => sum + (POINT_BUY_COSTS[newScores[ab]] ?? 0), 0)
    if (spent > POINT_BUY_TOTAL) return
    setPbScores(newScores)
    onChange(applyBonuses(newScores))
  }

  function applyBonuses(scores: AbilityScores): AbilityScores {
    return ABILITIES.reduce((acc, ab) => {
      acc[ab] = scores[ab] + (bonuses[ab] ?? 0)
      return acc
    }, {} as AbilityScores)
  }

  function handleManual(ability: Ability, raw: string) {
    const val = parseInt(raw)
    if (isNaN(val)) return
    const clamped = Math.min(20, Math.max(3, val))
    const next = { ...manualScores, [ability]: clamped }
    setManualScores(next)
    onChange(applyBonuses(next))
  }

  const pbSpent = ABILITIES.reduce((sum, ab) => sum + (POINT_BUY_COSTS[pbScores[ab]] ?? 0), 0)
  const finalScores = getFinalScores()
  const usedStandardValues = Object.values(assignments)

  return (
    <div>
      <h2 className="heading-l text-accent mb-1">Képességpontok</h2>

      {/* Módszer választó */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {(['standard', 'pointbuy', 'manual'] as Method[]).map(m => (
          <button
            key={m}
            onClick={() => setMethod(m)}
            className={`px-3 py-1.5 rounded-input label-l transition-colors ${
              method === m ? 'bg-accent text-gray-950' : 'bg-surface-raised text-text-secondary hover:bg-neutral'
            }`}
          >
            {m === 'standard' ? 'Standard Array' : m === 'pointbuy' ? 'Point Buy' : 'Szabad'}
          </button>
        ))}
      </div>

      {/* Point Buy pont számláló */}
      {method === 'pointbuy' && (
        <div className="mb-4 text-center">
          <span className={`text-lg font-bold ${pbSpent > POINT_BUY_TOTAL ? 'text-red-400' : 'text-accent'}`}>
            {POINT_BUY_TOTAL - pbSpent}
          </span>
          <span className="text-text-muted text-sm"> pont maradt</span>
        </div>
      )}

      {/* Standard Array értékek */}
      {method === 'standard' && (
        <div className="flex gap-2 flex-wrap mb-4">
          {STANDARD_ARRAY.map(v => (
            <span
              key={v}
              className={`px-3 py-1 rounded-input text-sm font-mono font-bold ${
                usedStandardValues.includes(v) ? 'bg-neutral text-text-disabled line-through' : 'bg-surface-raised text-white'
              }`}
            >
              {v}
            </span>
          ))}
        </div>
      )}

      {/* Ability sorok */}
      <div className="space-y-2">
        {ABILITIES.map(ab => {
          const bonus = bonuses[ab] ?? 0
          const final = finalScores[ab]
          const mod = getAbilityModifier(final)

          return (
            <div key={ab} className="flex items-center gap-3 bg-surface-raised rounded-btn px-4 py-3">
              {/* Ability neve */}
              <div className="w-28">
                <p className="text-white text-sm font-semibold">{ab}</p>
                <p className="text-text-subtle text-xs">{ABILITY_NAMES[ab]}</p>
              </div>

              {/* Input a módszer szerint */}
              <div className="flex-1">
                {method === 'standard' && (
                  <select
                    value={assignments[ab] ?? ''}
                    onChange={e => assignStandard(ab, parseInt(e.target.value))}
                    className="bg-neutral text-white rounded-input px-3 py-1.5 text-sm w-full"
                  >
                    <option value="">–</option>
                    {STANDARD_ARRAY.map(v => (
                      <option
                        key={v}
                        value={v}
                        disabled={usedStandardValues.includes(v) && assignments[ab] !== v}
                      >
                        {v}
                      </option>
                    ))}
                  </select>
                )}

                {method === 'pointbuy' && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => adjustPb(ab, -1)}
                      disabled={pbScores[ab] <= 8}
                      className="w-7 h-7 rounded-input bg-neutral hover:bg-neutral-hover disabled:opacity-30 text-white font-bold"
                    >−</button>
                    <span className="w-6 text-center text-white font-bold">{pbScores[ab]}</span>
                    <button
                      onClick={() => adjustPb(ab, +1)}
                      disabled={pbScores[ab] >= 15 || pbSpent >= POINT_BUY_TOTAL}
                      className="w-7 h-7 rounded-input bg-neutral hover:bg-neutral-hover disabled:opacity-30 text-white font-bold"
                    >+</button>
                    <span className="text-text-subtle text-xs ml-1">
                      ({POINT_BUY_COSTS[pbScores[ab]] ?? 0} pont)
                    </span>
                  </div>
                )}

                {method === 'manual' && (
                  <input
                    type="number"
                    min={3}
                    max={20}
                    value={manualScores[ab]}
                    onChange={e => handleManual(ab, e.target.value)}
                    className={`bg-neutral text-white rounded-input px-3 py-1.5 text-sm w-24 ${
                      manualScores[ab] < 8 ? 'border border-yellow-600' : ''
                    }`}
                  />
                )}
              </div>

              {/* Bónusz */}
              {bonus !== 0 && (
                <span className="text-accent text-sm font-semibold">+{bonus}</span>
              )}

              {/* Végső érték + módosító */}
              <div className="text-right w-16">
                <p className="text-white font-bold">{final}</p>
                <p className="text-text-muted text-xs">{mod >= 0 ? `+${mod}` : mod}</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
