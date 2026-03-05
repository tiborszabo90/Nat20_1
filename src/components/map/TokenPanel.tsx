import { useEffect, useMemo, useState } from 'react'
import { collection, onSnapshot } from 'firebase/firestore'
import { db } from '../../lib/firebase'
import { removeBattlemapToken } from '../../services/firebase/battlemapService'
import { useDndDataStore } from '../../store/dndDataStore'
import { useBattlemapStore } from '../../store/battlemapStore'
import { TokenInfo } from './TokenInfo'
import type { BattlemapToken, BattlemapState } from '../../types/app/map'
import type { Character } from '../../types/dnd/character'
import type { Monster } from '../../types/dnd/monster'

const PRESET_COLORS = [
  '#f59e0b', // amber – karakter alap
  '#ef4444', // red – encounter alap
  '#3b82f6', // blue
  '#22c55e', // green
  '#a855f7', // purple
  '#f97316', // orange
  '#06b6d4', // cyan
  '#ec4899', // pink
]

// Képességmódosító számítás
function mod(score: number): string {
  const m = Math.floor((score - 10) / 2)
  return m >= 0 ? `+${m}` : `${m}`
}

interface TokenPanelProps {
  battlemap: BattlemapState
  campaignCode: string
  placingToken: BattlemapToken | null
  onStartPlacing: (token: BattlemapToken) => void
  onCancelPlacing: () => void
  hideActiveTokens?: boolean
}

export function TokenPanel({
  battlemap,
  campaignCode,
  placingToken,
  onStartPlacing,
  onCancelPlacing,
  hideActiveTokens = false,
}: TokenPanelProps) {
  const [characters, setCharacters] = useState<Character[]>([])
  const [search, setSearch] = useState('')
  const [selectedMonster, setSelectedMonster] = useState<Monster | null>(null)
  const [encounterColor, setEncounterColor] = useState('#ef4444')
  const [showAddEnemy, setShowAddEnemy] = useState(false)

  const monsters = useDndDataStore(s => s.monsters)
  const isLoading = useDndDataStore(s => s.isLoading)
  const selectedTokenId = useBattlemapStore(s => s.selectedTokenId)
  const setSelectedTokenId = useBattlemapStore(s => s.setSelectedTokenId)

  // Kampány karaktereinek valós idejű figyelése
  useEffect(() => {
    const ref = collection(db, 'campaigns', campaignCode, 'characters')
    return onSnapshot(ref, (snap) => {
      setCharacters(snap.docs.map(d => d.data() as Character))
    })
  }, [campaignCode])

  // Monster keresési eredmények (max 8 találat)
  const filteredMonsters = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return []
    return monsters
      .filter(m => m.name.toLowerCase().includes(q))
      .slice(0, 8)
  }, [search, monsters])

  function makeId() {
    return Math.random().toString(36).slice(2, 10)
  }

  function handleMonsterSelect(m: Monster) {
    setSelectedMonster(m)
    setSearch(m.name)
  }

  function handleEncounterPlace() {
    if (!selectedMonster) return
    onStartPlacing({
      id: makeId(),
      col: 0,
      row: 0,
      type: 'encounter',
      characterId: null,
      label: selectedMonster.name.slice(0, 2).toUpperCase(),
      color: encounterColor,
      monsterKey: selectedMonster.key,
      fullName: selectedMonster.name,
      maxHp: selectedMonster.hp,
      currentHp: selectedMonster.hp,
    })
  }

  function handleTokenClick(tokenId: string) {
    setSelectedTokenId(selectedTokenId === tokenId ? null : tokenId)
  }

  const activeTokens = Object.values(battlemap.tokens)

  return (
    <div className="space-y-3">
      {/* Elhelyezés folyamatban */}
      {placingToken && (
        <div className="flex items-center gap-2 px-3 py-2 bg-amber-900/40 border border-amber-500/40 rounded-lg text-sm">
          <span className="text-amber-400">Kattints a térképre a token elhelyezéséhez</span>
          <button
            onClick={onCancelPlacing}
            className="ml-auto text-gray-400 hover:text-white text-xs px-2 py-0.5 bg-gray-700 rounded"
          >
            Mégse
          </button>
        </div>
      )}

      <div>
        <button
          onClick={() => setShowAddEnemy(s => !s)}
          className="w-full flex items-center justify-between text-xs font-display uppercase tracking-widest text-text-muted hover:text-white transition-colors py-1"
        >
          <span>Ellenfél hozzáadása</span>
          <span>{showAddEnemy ? '▲' : '▼'}</span>
        </button>
        {showAddEnemy && (
        <div className="space-y-2 mt-3">
          {/* Ellenfél kereső */}
          <div className="relative">
            <input
              type="text"
              value={search}
              onChange={e => {
                setSearch(e.target.value)
                setSelectedMonster(null)
              }}
              placeholder={isLoading ? 'Adatok töltése...' : 'Keresés (pl. Goblin)'}
              disabled={isLoading}
              className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-amber-500 disabled:opacity-50"
            />
            {/* Legördülő találati lista */}
            {filteredMonsters.length > 0 && !selectedMonster && (
              <ul className="absolute z-10 top-full mt-1 w-full bg-gray-800 border border-gray-700 rounded-md shadow-lg max-h-48 overflow-y-auto">
                {filteredMonsters.map(m => (
                  <li key={m.key}>
                    <button
                      onClick={() => handleMonsterSelect(m)}
                      className="w-full text-left px-3 py-1.5 text-sm text-gray-200 hover:bg-gray-700 flex items-center justify-between gap-2"
                    >
                      <span className="truncate">{m.name}</span>
                      <span className="text-xs text-gray-500 shrink-0">CR {m.cr} · {m.type}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Kiválasztott monster stat block */}
          {selectedMonster && (
            <div className="bg-gray-800/60 border border-gray-700 rounded-lg p-3 space-y-2 text-xs">
              <div>
                <p className="text-amber-400 font-bold text-sm">{selectedMonster.name}</p>
                <p className="text-gray-400">
                  {selectedMonster.size} {selectedMonster.type}
                  {selectedMonster.alignment ? ` · ${selectedMonster.alignment}` : ''}
                </p>
              </div>
              <div className="flex gap-3 text-gray-300">
                <span><span className="text-gray-500">AC</span> {selectedMonster.ac}{selectedMonster.acDesc ? ` (${selectedMonster.acDesc})` : ''}</span>
                <span><span className="text-gray-500">HP</span> {selectedMonster.hp} ({selectedMonster.hitDice})</span>
                <span><span className="text-gray-500">CR</span> {selectedMonster.cr}</span>
              </div>
              <p className="text-gray-400"><span className="text-gray-500">Sebesség:</span> {selectedMonster.speed}</p>
              <div className="grid grid-cols-6 gap-1 text-center">
                {(
                  [
                    ['STR', selectedMonster.str],
                    ['DEX', selectedMonster.dex],
                    ['CON', selectedMonster.con],
                    ['INT', selectedMonster.int],
                    ['WIS', selectedMonster.wis],
                    ['CHA', selectedMonster.cha],
                  ] as [string, number][]
                ).map(([label, val]) => (
                  <div key={label} className="bg-gray-900/60 rounded py-1">
                    <p className="text-gray-500 text-[10px]">{label}</p>
                    <p className="text-gray-200 font-semibold">{val}</p>
                    <p className="text-gray-400 text-[10px]">{mod(val)}</p>
                  </div>
                ))}
              </div>
              {selectedMonster.senses && (
                <p className="text-gray-400 truncate"><span className="text-gray-500">Érzékek:</span> {selectedMonster.senses}</p>
              )}
            </div>
          )}

          {/* Szín + elhelyezés */}
          <div className="flex items-center gap-2">
            <div className="flex gap-1 flex-wrap flex-1">
              {PRESET_COLORS.map(c => (
                <button
                  key={c}
                  onClick={() => setEncounterColor(c)}
                  className={`w-5 h-5 rounded-full border-2 transition-transform ${
                    encounterColor === c ? 'border-white scale-110' : 'border-transparent'
                  }`}
                  style={{ background: c }}
                />
              ))}
            </div>
            <button
              onClick={handleEncounterPlace}
              disabled={!selectedMonster || !!placingToken}
              className="px-3 py-1 text-xs bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-gray-950 font-semibold rounded transition-colors shrink-0"
            >
              Elhelyez
            </button>
          </div>
        </div>
        )}
      </div>

      {/* Aktív tokenek */}
      {!hideActiveTokens && activeTokens.length > 0 && (
        <div className="pt-2 border-t border-gray-800 space-y-1">
          {activeTokens.map(token => {
            const isSelected = token.id === selectedTokenId
            return (
              <div key={token.id}>
                {/* Token sor – kattintható */}
                <button
                  onClick={() => handleTokenClick(token.id)}
                  className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg transition-colors text-left ${
                    isSelected
                      ? 'bg-amber-900/30 border border-amber-500/40'
                      : 'hover:bg-gray-800/60 border border-transparent'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full shrink-0 flex items-center justify-center text-xs font-bold text-white ${
                      isSelected ? 'ring-2 ring-amber-400' : ''
                    }`}
                    style={{ background: token.color }}
                  >
                    {token.label.slice(0, 1)}
                  </div>
                  <span className="text-sm text-gray-300 flex-1 truncate">
                    {token.fullName ?? token.label}
                  </span>
                  {/* HP badge encounter tokeneknél */}
                  {token.type === 'encounter' && token.maxHp !== undefined && (
                    <span className={`text-xs shrink-0 ${
                      (token.currentHp ?? token.maxHp) <= 0
                        ? 'text-red-400'
                        : 'text-gray-500'
                    }`}>
                      {token.currentHp ?? token.maxHp}/{token.maxHp} HP
                    </span>
                  )}
                  <span className="text-xs text-gray-600 shrink-0">{token.col},{token.row}</span>
                  {/* Törlés – stopPropagation hogy ne selectálja a tokent */}
                  <span
                    role="button"
                    tabIndex={0}
                    onClick={(e) => {
                      e.stopPropagation()
                      if (isSelected) setSelectedTokenId(null)
                      void removeBattlemapToken(campaignCode, token.id)
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.stopPropagation()
                        if (isSelected) setSelectedTokenId(null)
                        void removeBattlemapToken(campaignCode, token.id)
                      }
                    }}
                    className="text-xs text-red-400 hover:text-red-300 px-1.5 py-0.5 rounded hover:bg-gray-700 transition-colors shrink-0"
                  >
                    ✕
                  </span>
                </button>

                {/* Kiválasztott token info panel */}
                {isSelected && (
                  <div className="mt-1 pl-1">
                    <TokenInfo
                      token={token}
                      characters={characters}
                      campaignCode={campaignCode}
                    />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
