import { useRef, useState, useEffect, useCallback } from 'react'
import { useDndDataStore } from '../../store/dndDataStore'
import { useBattlemapStore } from '../../store/battlemapStore'
import { updateHp } from '../../services/firebase/characterService'
import { updateTokenHp } from '../../services/firebase/battlemapService'
import type { BattlemapToken } from '../../types/app/map'
import type { Character } from '../../types/dnd/character'

// Képességmódosító szövegként
function mod(score: number): string {
  const m = Math.floor((score - 10) / 2)
  return m >= 0 ? `+${m}` : `${m}`
}

// HP progress bar szín
function hpColor(current: number, max: number): string {
  if (max === 0) return 'bg-gray-600'
  const pct = current / max
  if (pct > 0.5) return 'bg-green-500'
  if (pct > 0.25) return 'bg-yellow-400'
  return 'bg-red-500'
}

interface TokenInfoProps {
  token: BattlemapToken
  characters: Character[]
  campaignCode: string
  readOnly?: boolean
}

export function TokenInfo({ token, characters, campaignCode, readOnly = false }: TokenInfoProps) {
  const monsterCache = useDndDataStore(s => s.monsterCache)
  const updateTokenHpLocal = useBattlemapStore(s => s.updateTokenHpLocal)
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // ── Encounter token ──────────────────────────────────────────
  const isEncounter = token.type === 'encounter'
  const monster = isEncounter && token.monsterKey
    ? monsterCache.get(token.monsterKey) ?? null
    : null

  const encMaxHp = token.maxHp ?? monster?.hp ?? 0
  const [encLocalHp, setEncLocalHp] = useState(token.currentHp ?? encMaxHp)

  // Firestore szinkron után frissítjük a lokális HP-t
  useEffect(() => {
    if (token.currentHp !== undefined) {
      setEncLocalHp(token.currentHp)
    }
  }, [token.currentHp])

  const handleEncHpChange = useCallback((delta: number) => {
    const next = Math.min(encMaxHp, Math.max(0, encLocalHp + delta))
    setEncLocalHp(next)
    updateTokenHpLocal(token.id, next)
    if (debounceTimer.current) clearTimeout(debounceTimer.current)
    debounceTimer.current = setTimeout(() => {
      void updateTokenHp(campaignCode, token.id, next)
    }, 500)
  }, [encLocalHp, encMaxHp, token.id, campaignCode, updateTokenHpLocal])

  // ── Karakter token ──────────────────────────────────────────
  const character = !isEncounter && token.characterId
    ? characters.find(c => c.id === token.characterId) ?? null
    : null

  const charMaxHp = character?.maxHp ?? 0
  const [charLocalHp, setCharLocalHp] = useState(character?.currentHp ?? 0)

  useEffect(() => {
    if (character?.currentHp !== undefined) {
      setCharLocalHp(character.currentHp)
    }
  }, [character?.currentHp])

  const handleCharHpChange = useCallback((delta: number) => {
    if (!character) return
    const next = Math.min(charMaxHp, Math.max(0, charLocalHp + delta))
    setCharLocalHp(next)
    if (debounceTimer.current) clearTimeout(debounceTimer.current)
    debounceTimer.current = setTimeout(() => {
      void updateHp(campaignCode, character.id, next, character.temporaryHp)
    }, 500)
  }, [charLocalHp, charMaxHp, character, campaignCode])

  // ── Encounter token renderelés ──────────────────────────────
  if (isEncounter) {
    const encPct = encMaxHp > 0 ? Math.round((encLocalHp / encMaxHp) * 100) : 0
    const displayName = token.fullName ?? token.label

    return (
      <div className="bg-gray-800/70 border border-gray-700 rounded-xl p-3 space-y-3">
        {/* Fejléc */}
        <div className="flex items-center gap-2">
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
            style={{ background: token.color }}
          >
            {token.label.slice(0, 2)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-amber-400 font-bold text-sm truncate">{displayName}</p>
            {monster && (
              <p className="text-gray-400 text-xs">
                {monster.size} {monster.type} · CR {monster.cr}
              </p>
            )}
          </div>
        </div>

        {/* HP kezelés */}
        <div>
          <div className="flex justify-between text-xs text-gray-400 mb-1">
            <span>Hit Points</span>
            <span>{encLocalHp} / {encMaxHp}</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2 mb-2">
            <div
              className={`h-2 rounded-full transition-all ${hpColor(encLocalHp, encMaxHp)}`}
              style={{ width: `${encPct}%` }}
            />
          </div>
          {!readOnly && (
            <div className="flex gap-2">
              <button
                onClick={() => handleEncHpChange(-1)}
                className="flex-1 py-1.5 rounded-lg bg-red-700 hover:bg-red-600 text-white font-bold text-sm transition-colors"
              >
                −1
              </button>
              <button
                onClick={() => handleEncHpChange(-5)}
                className="flex-1 py-1.5 rounded-lg bg-red-900/60 hover:bg-red-800/60 text-red-300 font-semibold text-xs transition-colors"
              >
                −5
              </button>
              <button
                onClick={() => handleEncHpChange(+5)}
                className="flex-1 py-1.5 rounded-lg bg-green-900/60 hover:bg-green-800/60 text-green-300 font-semibold text-xs transition-colors"
              >
                +5
              </button>
              <button
                onClick={() => handleEncHpChange(+1)}
                disabled={encLocalHp >= encMaxHp}
                className="flex-1 py-1.5 rounded-lg bg-green-700 hover:bg-green-600 disabled:opacity-40 text-white font-bold text-sm transition-colors"
              >
                +1
              </button>
            </div>
          )}
        </div>

        {/* Monster alap statok (ha elérhető) */}
        {monster && (
          <>
            <div className="flex gap-3 text-xs text-gray-300 border-t border-gray-700 pt-2">
              <span><span className="text-gray-500">AC</span> {monster.ac}</span>
              <span><span className="text-gray-500">Sebesség</span> {monster.speed}</span>
            </div>
            <div className="grid grid-cols-6 gap-1 text-center">
              {(
                [
                  ['STR', monster.str],
                  ['DEX', monster.dex],
                  ['CON', monster.con],
                  ['INT', monster.int],
                  ['WIS', monster.wis],
                  ['CHA', monster.cha],
                ] as [string, number][]
              ).map(([label, val]) => (
                <div key={label} className="bg-gray-900/60 rounded py-1">
                  <p className="text-gray-500 text-[9px]">{label}</p>
                  <p className="text-gray-200 text-xs font-semibold">{val}</p>
                  <p className="text-gray-400 text-[9px]">{mod(val)}</p>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    )
  }

  // ── Karakter token renderelés ──────────────────────────────
  if (!character) {
    return (
      <div className="bg-gray-800/70 border border-gray-700 rounded-xl p-3">
        <p className="text-gray-500 text-xs">Karakter nem található.</p>
      </div>
    )
  }

  const charPct = charMaxHp > 0 ? Math.round((charLocalHp / charMaxHp) * 100) : 0

  return (
    <div className="bg-gray-800/70 border border-gray-700 rounded-xl p-3 space-y-3">
      {/* Fejléc */}
      <div className="flex items-center gap-2">
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-gray-950 shrink-0"
          style={{ background: token.color }}
        >
          {token.label.slice(0, 2)}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-amber-400 font-bold text-sm truncate">{character.name}</p>
          <p className="text-gray-400 text-xs capitalize">
            {character.classKey} {character.level} · {character.speciesKey}
          </p>
        </div>
      </div>

      {/* HP kezelés */}
      <div>
        <div className="flex justify-between text-xs text-gray-400 mb-1">
          <span>Hit Points</span>
          <span>{charLocalHp} / {charMaxHp}</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2 mb-2">
          <div
            className={`h-2 rounded-full transition-all ${hpColor(charLocalHp, charMaxHp)}`}
            style={{ width: `${charPct}%` }}
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => handleCharHpChange(-1)}
            className="flex-1 py-1.5 rounded-lg bg-red-700 hover:bg-red-600 text-white font-bold text-sm transition-colors"
          >
            −1
          </button>
          <button
            onClick={() => handleCharHpChange(-5)}
            className="flex-1 py-1.5 rounded-lg bg-red-900/60 hover:bg-red-800/60 text-red-300 font-semibold text-xs transition-colors"
          >
            −5
          </button>
          <button
            onClick={() => handleCharHpChange(+5)}
            className="flex-1 py-1.5 rounded-lg bg-green-900/60 hover:bg-green-800/60 text-green-300 font-semibold text-xs transition-colors"
          >
            +5
          </button>
          <button
            onClick={() => handleCharHpChange(+1)}
            disabled={charLocalHp >= charMaxHp}
            className="flex-1 py-1.5 rounded-lg bg-green-700 hover:bg-green-600 disabled:opacity-40 text-white font-bold text-sm transition-colors"
          >
            +1
          </button>
        </div>
        {character.temporaryHp > 0 && (
          <p className="text-cyan-400 text-xs mt-1">+{character.temporaryHp} ideiglenes HP</p>
        )}
      </div>
    </div>
  )
}
