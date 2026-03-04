import { useState, useRef, useCallback } from 'react'
import type { Character } from '../../../types/dnd/character'
import { ABILITIES, getAbilityModifier, getProficiencyBonus } from '../../../data/dndConstants'
import type { Ability } from '../../../data/dndConstants'
import { useCharacterStore } from '../../../store/characterStore'
import { useDndDataStore } from '../../../store/dndDataStore'
import { updateHp, useSpellSlot, restoreSpellSlots } from '../../../services/firebase/characterService'
import { SpellDetailCard } from './SpellDetailCard'
import { Button, Card } from '../../ui'

interface Props {
  character: Character
}

export function CombatView({ character }: Props) {
  const updateHpLocal = useCharacterStore(s => s.updateHpLocal)
  const useSpellSlotLocal = useCharacterStore(s => s.useSpellSlotLocal)
  const restoreSpellSlotsLocal = useCharacterStore(s => s.restoreSpellSlotsLocal)
  const spellsMap = useDndDataStore(s => s.spells)
  const [tempHpInput, setTempHpInput] = useState(String(character.temporaryHp))
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const pb = getProficiencyBonus(character.level)
  const dexMod = getAbilityModifier(character.abilityScores.DEX)

  const getSpellName = (key: string) => spellsMap.get(key)?.name ?? key

  const handleHpChange = useCallback((delta: number) => {
    const next = Math.min(
      character.maxHp,
      Math.max(0, character.currentHp + delta)
    )
    updateHpLocal(next, character.temporaryHp)
    if (debounceTimer.current) clearTimeout(debounceTimer.current)
    debounceTimer.current = setTimeout(() => {
      void updateHp(character.campaignCode, character.id, next, character.temporaryHp)
    }, 500)
  }, [character, updateHpLocal])

  function handleTempHpSave() {
    const val = Math.max(0, parseInt(tempHpInput) || 0)
    updateHpLocal(character.currentHp, val)
    void updateHp(character.campaignCode, character.id, character.currentHp, val)
  }

  function handleSlotUse(slotIndex: number) {
    const maxSlot = character.spellSlots?.[slotIndex] ?? 0
    const used = character.usedSpellSlots[slotIndex] ?? 0
    if (used >= maxSlot) return
    useSpellSlotLocal(slotIndex)
    void useSpellSlot(character.campaignCode, character.id, slotIndex, character.usedSpellSlots)
  }

  function handleRestoreSlots() {
    restoreSpellSlotsLocal()
    void restoreSpellSlots(character.campaignCode, character.id)
  }

  const hpPercent = character.maxHp > 0
    ? Math.round((character.currentHp / character.maxHp) * 100)
    : 0
  const hpColor = hpPercent > 50 ? 'bg-hp-full' : hpPercent > 25 ? 'bg-hp-injured' : 'bg-hp-critical'

  const knownCantrips       = character.knownCantrips ?? []
  const knownSpells         = character.knownSpells ?? []
  const miCantrips          = character.magicInitiateCantrips ?? []
  const miSpell             = character.magicInitiateSpell ?? null
  const weaponMasteries     = character.weaponMasteries ?? []

  return (
    <div className="p-4 space-y-4">
      {/* HP Tracker */}
      <Card>
        <div className="flex justify-between items-center mb-2">
          <span className="text-text-muted text-sm">Hit Points</span>
          <span className="text-text-secondary text-sm">{character.currentHp} / {character.maxHp}</span>
        </div>
        <div className="w-full bg-neutral rounded-badge h-3 mb-3">
          <div className={`h-3 rounded-badge transition-all ${hpColor}`} style={{ width: `${hpPercent}%` }} />
        </div>
        <div className="flex gap-2 justify-center">
          <Button variant="danger" size="icon" onClick={() => handleHpChange(-1)}>−</Button>
          <div className="flex-1 bg-surface-overlay rounded-btn flex items-center justify-center">
            <span className="text-3xl font-black text-white">{character.currentHp}</span>
          </div>
          <Button variant="success" size="icon" onClick={() => handleHpChange(+1)} disabled={character.currentHp >= character.maxHp}>+</Button>
        </div>
        <div className="flex items-center gap-2 mt-3">
          <span className="text-text-subtle text-xs">Temp HP:</span>
          <input
            type="number"
            min={0}
            value={tempHpInput}
            onChange={e => setTempHpInput(e.target.value)}
            onBlur={handleTempHpSave}
            className="bg-neutral text-white rounded-input px-2 py-1 text-sm w-16 text-center"
          />
          {character.temporaryHp > 0 && (
            <span className="text-concentration text-xs">+{character.temporaryHp} temp</span>
          )}
        </div>
      </Card>

      {/* Harci statisztikák */}
      <div className="grid grid-cols-3 gap-2">
        <StatBadge label="AC" value={String(character.armorClass)} />
        <StatBadge label="Initiative" value={dexMod >= 0 ? `+${dexMod}` : String(dexMod)} />
        <StatBadge label="Speed" value="30 ft" />
      </div>

      {/* Mentődobások */}
      <Card title="Mentődobások">
        <div className="grid grid-cols-2 gap-2">
          {ABILITIES.map(ab => {
            const isProficient = character.savingThrowProficiencies.includes(ab as Ability)
            const mod = getAbilityModifier(character.abilityScores[ab]) + (isProficient ? pb : 0)
            return (
              <div key={ab} className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-badge ${isProficient ? 'bg-accent' : 'bg-text-disabled'}`} />
                <span className="text-text-secondary text-sm flex-1">{ab}</span>
                <span className={`text-sm font-bold ${isProficient ? 'text-accent' : 'text-text-muted'}`}>
                  {mod >= 0 ? `+${mod}` : mod}
                </span>
              </div>
            )
          })}
        </div>
      </Card>

      {/* Weapon Mastery */}
      {weaponMasteries.length > 0 && (
        <Card title="Weapon Mastery">
          <div className="flex flex-wrap gap-2">
            {weaponMasteries.map(w => (
              <span key={w} className="text-sm bg-neutral text-text-secondary px-3 py-1 rounded-badge">{w}</span>
            ))}
          </div>
        </Card>
      )}

      {/* Spell Slotok */}
      {character.spellSlots && character.spellSlots.some(s => s > 0) && (
        <Card
          title="Spell Slotok"
          action={
            <button onClick={handleRestoreSlots} className="label-m text-accent hover:text-accent-hover transition-colors">
              Hosszú pihenő ↺
            </button>
          }
        >
          <div className="space-y-2">
            {character.spellSlots.map((maxSlots, idx) => {
              if (!maxSlots) return null
              const used = character.usedSpellSlots[idx] ?? 0
              return (
                <div key={idx} className="flex items-center gap-3">
                  <span className="text-text-subtle text-xs w-14">{idx + 1}. szint</span>
                  <div className="flex gap-1.5">
                    {Array.from({ length: maxSlots }).map((_, slotIdx) => (
                      <button
                        key={slotIdx}
                        onClick={() => handleSlotUse(idx)}
                        className={`w-6 h-6 rounded-badge border-2 transition-colors ${
                          slotIdx < used
                            ? 'border-magic-border bg-transparent'
                            : 'border-magic bg-magic-bright'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-text-disabled text-xs">{maxSlots - used}/{maxSlots}</span>
                </div>
              )
            })}
          </div>
        </Card>
      )}

      {/* Cantripek */}
      {knownCantrips.length > 0 && (
        <Card title="Cantripek">
          <div className="divide-y divide-gray-700/50">
            {knownCantrips.map(key => {
              const spell = spellsMap.get(key)
              return spell
                ? <SpellDetailCard key={key} spell={spell} icon="✦" accentColor="violet" />
                : <div key={key} className="flex items-center gap-2 py-1.5">
                    <span className="text-magic text-xs shrink-0">✦</span>
                    <span className="text-white text-sm">{getSpellName(key)}</span>
                  </div>
            })}
          </div>
        </Card>
      )}

      {/* Magic Initiate */}
      {(miCantrips.length > 0 || miSpell) && (
        <Card title="Magic Initiate">
          <div className="divide-y divide-gray-700/50">
            {miCantrips.map(key => {
              const spell = spellsMap.get(key)
              return spell
                ? <SpellDetailCard key={key} spell={spell} icon="✦" accentColor="violet" />
                : <div key={key} className="flex items-center gap-2 py-1.5">
                    <span className="text-magic text-xs shrink-0">✦</span>
                    <span className="text-white text-sm">{getSpellName(key)}</span>
                  </div>
            })}
            {miSpell && (() => {
              const spell = spellsMap.get(miSpell)
              return spell
                ? <SpellDetailCard key={miSpell} spell={spell} icon="◆" accentColor="violet" note="1×/Long Rest" />
                : <div className="flex items-center gap-2 py-1.5">
                    <span className="text-violet-300 text-xs shrink-0">◆</span>
                    <span className="text-white text-sm">{getSpellName(miSpell)}</span>
                    <span className="text-violet-500 text-xs ml-auto">1×/Long Rest</span>
                  </div>
            })()}
          </div>
        </Card>
      )}

      {/* Ismert / Előkészített varázsatok */}
      {knownSpells.length > 0 && (
        <Card title={character.spellSlots ? 'Előkészített Varázsatok' : 'Ismert Varázsatok'}>
          <div className="divide-y divide-gray-700/50">
            {knownSpells.map(key => {
              const spell = spellsMap.get(key)
              return spell
                ? <SpellDetailCard key={key} spell={spell} icon="◆" accentColor="violet" />
                : <div key={key} className="flex items-center gap-2 py-1.5">
                    <span className="text-magic text-xs shrink-0">◆</span>
                    <span className="text-white text-sm">{getSpellName(key)}</span>
                  </div>
            })}
          </div>
        </Card>
      )}
    </div>
  )
}

function StatBadge({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-surface-raised rounded-btn p-3 text-center">
      <p className="text-text-muted text-xs">{label}</p>
      <p className="text-white font-bold text-lg">{value}</p>
    </div>
  )
}
