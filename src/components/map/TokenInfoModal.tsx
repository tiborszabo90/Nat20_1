import { useRef, useState, useEffect, useCallback } from 'react'
import { useDndDataStore } from '../../store/dndDataStore'
import { useBattlemapStore } from '../../store/battlemapStore'
import { updateTokenHp } from '../../services/firebase/battlemapService'
import { fetchMonsterBySlug } from '../../services/dnd-data/dndDataService'
import type { BattlemapToken } from '../../types/app/map'
import type { Monster, MonsterAction } from '../../types/dnd/monster'

function mod(score: number): string {
  const m = Math.floor((score - 10) / 2)
  return m >= 0 ? `+${m}` : `${m}`
}

function hpColor(current: number, max: number): string {
  if (max === 0) return 'bg-gray-600'
  const pct = current / max
  if (pct > 0.5) return 'bg-green-500'
  if (pct > 0.25) return 'bg-yellow-400'
  return 'bg-red-500'
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-display uppercase tracking-widest text-amber-400/80 border-b border-amber-900/50 pb-1 mb-2">
      {children}
    </p>
  )
}

function ActionList({ title, items }: { title: string; items: MonsterAction[] }) {
  return (
    <div>
      <SectionTitle>{title}</SectionTitle>
      <div className="space-y-2">
        {items.map((item, i) => (
          <div key={i}>
            <span className="text-white text-xs font-semibold italic">{item.name}. </span>
            <span className="text-gray-300 text-xs">{item.desc}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

interface TokenInfoModalProps {
  token: BattlemapToken
  campaignCode: string
  readOnly?: boolean
  onClose: () => void
}

export function TokenInfoModal({ token, campaignCode, readOnly = false, onClose }: TokenInfoModalProps) {
  const monsterCache = useDndDataStore(s => s.monsterCache)
  const cacheMonster = useDndDataStore(s => s.cacheMonster)
  const updateTokenHpLocal = useBattlemapStore(s => s.updateTokenHpLocal)
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Cache lookup → ha nincs, fetch on-demand
  const [monster, setMonster] = useState<Monster | null>(
    () => token.monsterKey ? monsterCache.get(token.monsterKey) ?? null : null
  )
  const [fetching, setFetching] = useState(false)

  useEffect(() => {
    if (monster || !token.monsterKey) return
    setFetching(true)
    fetchMonsterBySlug(token.monsterKey)
      .then(m => {
        if (m) {
          cacheMonster(m)
          setMonster(m)
        }
      })
      .catch(console.error)
      .finally(() => setFetching(false))
  }, [token.monsterKey, monster, cacheMonster])

  const maxHp = token.maxHp ?? monster?.hp ?? 0
  const [localHp, setLocalHp] = useState(token.currentHp ?? maxHp)

  useEffect(() => {
    if (token.currentHp !== undefined) setLocalHp(token.currentHp)
  }, [token.currentHp])

  const handleHpChange = useCallback((delta: number) => {
    const next = Math.min(maxHp, Math.max(0, localHp + delta))
    setLocalHp(next)
    updateTokenHpLocal(token.id, next)
    if (debounceTimer.current) clearTimeout(debounceTimer.current)
    debounceTimer.current = setTimeout(() => {
      void updateTokenHp(campaignCode, token.id, next)
    }, 500)
  }, [localHp, maxHp, token.id, campaignCode, updateTokenHpLocal])

  const hpPct = maxHp > 0 ? Math.round((localHp / maxHp) * 100) : 0
  const displayName = token.fullName ?? token.label

  const ABILITY_SCORES = monster
    ? ([
        ['STR', monster.str],
        ['DEX', monster.dex],
        ['CON', monster.con],
        ['INT', monster.int],
        ['WIS', monster.wis],
        ['CHA', monster.cha],
      ] as [string, number][])
    : []

  const hasDamageInfo = !!(
    monster?.damageImmunities ||
    monster?.damageResistances ||
    monster?.damageVulnerabilities ||
    monster?.conditionImmunities
  )

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-sm shadow-2xl flex flex-col"
        style={{ maxHeight: '85vh' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Fejléc */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-700/60 shrink-0">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0"
            style={{ background: token.color }}
          >
            {token.label.slice(0, 2)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-amber-400 font-bold text-base truncate">{displayName}</p>
            {monster && (
              <p className="text-gray-400 text-xs">
                {monster.size} {monster.type}
                {monster.subtype ? ` (${monster.subtype})` : ''}
                {monster.alignment ? ` · ${monster.alignment}` : ''}
                {' · '}CR {monster.cr}
                {monster.xp ? ` (${monster.xp.toLocaleString()} XP)` : ''}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-white text-lg leading-none px-1 transition-colors shrink-0"
            aria-label="Bezár"
          >
            ✕
          </button>
        </div>

        <div className="px-5 py-4 space-y-5 overflow-y-auto flex-1">
          {/* HP */}
          <div>
            <div className="flex justify-between text-xs text-gray-400 mb-1">
              <span>Hit Points</span>
              <span className="font-semibold text-white">{localHp} / {maxHp}</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2.5 mb-3">
              <div
                className={`h-2.5 rounded-full transition-all ${hpColor(localHp, maxHp)}`}
                style={{ width: `${hpPct}%` }}
              />
            </div>
            {!readOnly && (
              <div className="grid grid-cols-4 gap-2">
                {([-5, -1, +1, +5] as const).map(delta => (
                  <button
                    key={delta}
                    onClick={() => handleHpChange(delta)}
                    disabled={delta > 0 && localHp >= maxHp}
                    className={`py-2 rounded-lg font-semibold text-sm transition-colors disabled:opacity-40 ${
                      delta < 0
                        ? delta === -1
                          ? 'bg-red-700 hover:bg-red-600 text-white'
                          : 'bg-red-900/60 hover:bg-red-800/60 text-red-300'
                        : delta === 1
                          ? 'bg-green-700 hover:bg-green-600 text-white'
                          : 'bg-green-900/60 hover:bg-green-800/60 text-green-300'
                    }`}
                  >
                    {delta > 0 ? `+${delta}` : delta}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Stat block betöltés */}
          {fetching && (
            <div className="flex items-center justify-center py-6">
              <div className="w-6 h-6 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {monster && (
            <>
              {/* Alap statok */}
              <div className="grid grid-cols-3 gap-2 text-sm text-gray-300">
                <div className="bg-gray-800 rounded-lg px-3 py-2">
                  <p className="text-gray-500 text-xs mb-0.5">AC</p>
                  <p className="font-semibold text-white text-xs">
                    {monster.ac}
                    {monster.acDesc ? <span className="text-gray-400 font-normal ml-1">({monster.acDesc})</span> : null}
                  </p>
                </div>
                <div className="bg-gray-800 rounded-lg px-3 py-2">
                  <p className="text-gray-500 text-xs mb-0.5">Sebesség</p>
                  <p className="font-semibold text-white text-xs">{monster.speed}</p>
                </div>
                <div className="bg-gray-800 rounded-lg px-3 py-2">
                  <p className="text-gray-500 text-xs mb-0.5">Hit Dice</p>
                  <p className="font-semibold text-white text-xs">{monster.hitDice}</p>
                </div>
              </div>

              {/* Ability Scores */}
              <div className="grid grid-cols-6 gap-1.5 text-center">
                {ABILITY_SCORES.map(([label, val]) => (
                  <div key={label} className="bg-gray-800 rounded-lg py-2">
                    <p className="text-gray-500 text-[9px] uppercase tracking-wide">{label}</p>
                    <p className="text-white text-sm font-bold mt-0.5">{val}</p>
                    <p className="text-gray-400 text-[10px]">{mod(val)}</p>
                  </div>
                ))}
              </div>

              {/* Saving Throws & Skills */}
              {(monster.savingThrows || monster.skills) && (
                <div className="space-y-1.5 text-xs text-gray-300">
                  {monster.savingThrows && (
                    <p>
                      <span className="text-gray-500">Mentődobások: </span>
                      {monster.savingThrows}
                    </p>
                  )}
                  {monster.skills && (
                    <p>
                      <span className="text-gray-500">Képzettségek: </span>
                      {monster.skills}
                    </p>
                  )}
                </div>
              )}

              {/* Damage & Condition info */}
              {hasDamageInfo && (
                <div className="space-y-1.5 text-xs text-gray-300">
                  {monster.damageImmunities && (
                    <p>
                      <span className="text-gray-500">Sérülési immunitás: </span>
                      {monster.damageImmunities}
                    </p>
                  )}
                  {monster.damageResistances && (
                    <p>
                      <span className="text-gray-500">Ellenállás: </span>
                      {monster.damageResistances}
                    </p>
                  )}
                  {monster.damageVulnerabilities && (
                    <p>
                      <span className="text-gray-500">Sebezhetőség: </span>
                      {monster.damageVulnerabilities}
                    </p>
                  )}
                  {monster.conditionImmunities && (
                    <p>
                      <span className="text-gray-500">Állapot immunitás: </span>
                      {monster.conditionImmunities}
                    </p>
                  )}
                </div>
              )}

              {/* Senses & Languages */}
              <div className="space-y-1.5 text-xs text-gray-300">
                {monster.senses && (
                  <p>
                    <span className="text-gray-500">Érzékek: </span>
                    {monster.senses}
                  </p>
                )}
                {monster.languages && (
                  <p>
                    <span className="text-gray-500">Nyelvek: </span>
                    {monster.languages}
                  </p>
                )}
              </div>

              {/* Traits */}
              {monster.traits && monster.traits.length > 0 && (
                <ActionList title="Különleges képességek" items={monster.traits} />
              )}

              {/* Actions */}
              {monster.actions && monster.actions.length > 0 && (
                <ActionList title="Akciók" items={monster.actions} />
              )}

              {/* Reactions */}
              {monster.reactions && monster.reactions.length > 0 && (
                <ActionList title="Reakciók" items={monster.reactions} />
              )}

              {/* Legendary Actions */}
              {monster.legendaryActions && monster.legendaryActions.length > 0 && (
                <div>
                  <SectionTitle>Legendás akciók</SectionTitle>
                  {monster.legendaryDesc && (
                    <p className="text-gray-400 text-xs mb-2">{monster.legendaryDesc}</p>
                  )}
                  <div className="space-y-2">
                    {monster.legendaryActions.map((item, i) => (
                      <div key={i}>
                        <span className="text-white text-xs font-semibold italic">{item.name}. </span>
                        <span className="text-gray-300 text-xs">{item.desc}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
