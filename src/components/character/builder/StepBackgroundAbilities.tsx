import { useState } from 'react'
import type { Ability } from '../../../data/dndConstants'
import type { AbilityScores } from '../../../types/dnd/character'

interface Props {
  abilities: Ability[]
  bonuses: Partial<AbilityScores>
  onChange: (bonuses: Partial<AbilityScores>) => void
}

type Mode = 'even' | 'split' | null

const ABILITY_LABELS: Record<Ability, string> = {
  STR: 'Strength', DEX: 'Dexterity', CON: 'Constitution',
  INT: 'Intelligence', WIS: 'Wisdom', CHA: 'Charisma',
}

export function StepBackgroundAbilities({ abilities, bonuses, onChange }: Props) {
  // Mód belső state – inicializálás a bonuses alapján (visszalépés esetén helyes)
  const [mode, setMode] = useState<Mode>(() => {
    const total = abilities.reduce((s, ab) => s + (bonuses[ab] ?? 0), 0)
    if (total === 0) return null
    const allOne = abilities.every(ab => (bonuses[ab] ?? 0) === 1)
    return allOne ? 'even' : 'split'
  })

  function selectEven() {
    setMode('even')
    const result: Partial<AbilityScores> = {}
    abilities.forEach(ab => { result[ab] = 1 })
    onChange(result)
  }

  function selectSplit() {
    setMode('split')
    onChange({})
  }

  function assignSplit(ability: Ability, value: 1 | 2) {
    const current = bonuses[ability] ?? 0
    const newBonuses: Partial<AbilityScores> = { ...bonuses }

    if (current === value) {
      // Kattintás az aktív gombra → töröl
      delete newBonuses[ability]
    } else {
      // Ugyanezt az értéket töröljük a többi ability-ről
      abilities.forEach(ab => {
        if (ab !== ability && newBonuses[ab] === value) {
          delete newBonuses[ab]
        }
      })
      newBonuses[ability] = value
    }
    onChange(newBonuses)
  }

  const splitPlusTwo = abilities.find(ab => (bonuses[ab] ?? 0) === 2)
  const splitPlusOne = abilities.find(ab => (bonuses[ab] ?? 0) === 1)
  const splitReady = !!splitPlusTwo && !!splitPlusOne

  return (
    <div>
      <h2 className="heading-l text-accent mb-1">Háttér Képességpontok</h2>
      <p className="body-m text-text-muted mb-6">
        A háttered +3 pontot biztosít az alábbi 3 képesség között. Válaszd ki az elosztást.
      </p>

      {/* Módválasztó */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <button
          onClick={selectEven}
          className={`px-4 py-4 rounded-btn border-2 transition-colors text-left ${
            mode === 'even'
              ? 'border-accent bg-accent/10'
              : 'border-border bg-surface-raised hover:border-border-hover'
          }`}
        >
          <p className="heading-s text-white">+1 / +1 / +1</p>
          <p className="text-text-muted text-xs mt-1">Mindhárom képességhez +1</p>
        </button>
        <button
          onClick={selectSplit}
          className={`px-4 py-4 rounded-btn border-2 transition-colors text-left ${
            mode === 'split'
              ? 'border-accent bg-accent/10'
              : 'border-border bg-surface-raised hover:border-border-hover'
          }`}
        >
          <p className="heading-s text-white">+2 / +1</p>
          <p className="text-text-muted text-xs mt-1">Egyhez +2, egyhez +1</p>
        </button>
      </div>

      {/* Képességek */}
      {mode === 'even' && (
        <div className="grid grid-cols-1 gap-2">
          {abilities.map(ab => (
            <div key={ab} className="flex items-center justify-between bg-surface-raised rounded-btn px-4 py-3 border-2 border-accent/40">
              <div>
                <p className="font-bold text-white">{ab}</p>
                <p className="text-text-muted text-xs">{ABILITY_LABELS[ab]}</p>
              </div>
              <span className="text-accent font-bold text-lg">+1</span>
            </div>
          ))}
        </div>
      )}

      {mode === 'split' && (
        <div className="grid grid-cols-1 gap-2">
          {!splitReady && (
            <p className="text-text-subtle text-xs mb-2">
              Jelöld meg, melyik képességhez kerül a +2 és melyikhez a +1.
            </p>
          )}
          {abilities.map(ab => {
            const val = bonuses[ab] ?? 0
            return (
              <div key={ab} className="flex items-center justify-between bg-surface-raised rounded-btn px-4 py-3 border-2 border-border">
                <div>
                  <p className="font-bold text-white">{ab}</p>
                  <p className="text-text-muted text-xs">{ABILITY_LABELS[ab]}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => assignSplit(ab, 2)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-bold transition-colors ${
                      val === 2
                        ? 'bg-accent text-gray-950'
                        : splitPlusTwo && val !== 2
                          ? 'bg-neutral text-text-subtle opacity-40 cursor-not-allowed'
                          : 'bg-neutral text-text-secondary hover:bg-neutral-hover'
                    }`}
                    disabled={!!splitPlusTwo && val !== 2}
                  >
                    +2
                  </button>
                  <button
                    onClick={() => assignSplit(ab, 1)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-bold transition-colors ${
                      val === 1
                        ? 'bg-accent text-gray-950'
                        : splitPlusOne && val !== 1
                          ? 'bg-neutral text-text-subtle opacity-40 cursor-not-allowed'
                          : 'bg-neutral text-text-secondary hover:bg-neutral-hover'
                    }`}
                    disabled={!!splitPlusOne && val !== 1}
                  >
                    +1
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
