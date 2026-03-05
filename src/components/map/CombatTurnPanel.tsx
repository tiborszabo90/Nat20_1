import { useEffect, useState } from 'react'
import { collection, onSnapshot } from 'firebase/firestore'
import { db } from '../../lib/firebase'
import { TokenInfo } from './TokenInfo'
import type { CombatState } from '../../types/app/combat'
import type { BattlemapState } from '../../types/app/map'
import type { Character } from '../../types/dnd/character'

interface CombatTurnPanelProps {
  combat: CombatState
  battlemap: BattlemapState
  campaignCode: string
  readOnly?: boolean
}

export function CombatTurnPanel({ combat, battlemap, campaignCode, readOnly = false }: CombatTurnPanelProps) {
  const [characters, setCharacters] = useState<Character[]>([])
  const [expandedId, setExpandedId] = useState<string | null>(null)

  useEffect(() => {
    const ref = collection(db, 'campaigns', campaignCode, 'characters')
    return onSnapshot(ref, snap => {
      setCharacters(snap.docs.map(d => d.data() as Character))
    })
  }, [campaignCode])

  return (
    <div className="space-y-1 border-t border-gray-800 pt-2">
      {combat.turnOrder.map((id, idx) => {
        const p = combat.participants[id]
        if (!p) return null
        const isCurrent = idx === combat.currentTurnIndex
        const isExpanded = expandedId === id

        // Token keresés: monster → id alapján, karakter → név egyezés alapján
        const token = p.type === 'monster'
          ? battlemap.tokens[id] ?? null
          : Object.values(battlemap.tokens).find(
              t => t.type === 'character' &&
              characters.find(c => c.id === t.characterId)?.name === p.name
            ) ?? null

        return (
          <div key={id}>
            <button
              onClick={() => setExpandedId(isExpanded ? null : id)}
              className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg transition-colors text-left ${
                isCurrent
                  ? 'bg-amber-500/20 border border-amber-500/40'
                  : 'hover:bg-gray-800/60 border border-transparent'
              }`}
            >
              {/* Szín jelző */}
              {token ? (
                <div
                  className="w-5 h-5 rounded-full shrink-0 flex items-center justify-center text-[10px] font-bold text-white"
                  style={{ background: token.color }}
                >
                  {token.label.slice(0, 1)}
                </div>
              ) : (
                <div className={`w-5 h-5 rounded-full shrink-0 flex items-center justify-center text-[10px] font-bold ${
                  isCurrent ? 'bg-amber-500 text-gray-950' : 'bg-gray-600 text-gray-300'
                }`}>
                  {p.name.slice(0, 1).toUpperCase()}
                </div>
              )}

              <span className={`text-sm flex-1 truncate ${isCurrent ? 'text-amber-300 font-semibold' : 'text-gray-300'}`}>
                {p.name}
              </span>

              {isCurrent && (
                <span className="text-amber-400 text-xs shrink-0">◀</span>
              )}

              {token && (
                <span className="text-gray-600 text-xs shrink-0">{isExpanded ? '▲' : '▼'}</span>
              )}
            </button>

            {isExpanded && token && (
              <div className="mt-1 pl-1">
                <TokenInfo
                  token={token}
                  characters={characters}
                  campaignCode={campaignCode}
                  readOnly={readOnly && token.type === 'encounter'}
                />
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
