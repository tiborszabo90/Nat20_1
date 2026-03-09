import { useState, useRef, useEffect, useCallback } from 'react'
import type { Character } from '../../../types/dnd/character'
import {
  ABILITIES, SKILLS, getAbilityModifier, getProficiencyBonus,
  ELVEN_LINEAGES, GNOMISH_LINEAGES, GIANT_ANCESTRIES, TIEFLING_LEGACIES,
  ELDRITCH_INVOCATIONS, DIVINE_ORDERS, PRIMAL_ORDERS,
  SPECIES_SPEED, SPECIES_DARKVISION, DRAGONBORN_ANCESTRIES, DND_CONDITIONS, CLASS_PROFICIENCIES,
  BASE_ACTIONS, CLASS_BONUS_ACTIONS, CLASS_REACTIONS, BACKGROUND_INFO, BACKGROUND_ABILITY_OPTIONS, BACKGROUND_ORIGIN_FEAT, BACKGROUND_STARTER_EQUIPMENT,
  HIT_DIE_VALUES, SIMPLE_MELEE_WEAPONS, SIMPLE_RANGED_WEAPONS, MARTIAL_MELEE_WEAPONS, MARTIAL_RANGED_WEAPONS,
} from '../../../data/dndConstants'
import type { ActionEntry } from '../../../data/dndConstants'
import type { Ability } from '../../../data/dndConstants'
import { useDndDataStore } from '../../../store/dndDataStore'
import { useCharacterStore } from '../../../store/characterStore'
import { updateHp, updateHeroicInspiration, updateConditions, updateUsedHitDice } from '../../../services/firebase/characterService'
import { SpellDetailCard } from './SpellDetailCard'
import { EQUIPMENT_INFO } from '../../../data/equipmentData'
import { Card } from '../../ui'

interface Props {
  character: Character
}

function formatKey(key: string): string {
  return key.split(/[-_]/).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
}

export function GeneralView({ character }: Props) {
  const pb = getProficiencyBonus(character.level)
  const spellsMap = useDndDataStore(s => s.spells)
  const getSpellName = (key: string) => spellsMap.get(key)?.name ?? key

  // ── HP kezelés ────────────────────────────────────────────────
  const updateHpLocal = useCharacterStore(s => s.updateHpLocal)
  const updateHeroicInspirationLocal = useCharacterStore(s => s.updateHeroicInspirationLocal)
  const updateConditionsLocal = useCharacterStore(s => s.updateConditionsLocal)
  const updateUsedHitDiceLocal = useCharacterStore(s => s.updateUsedHitDiceLocal)
  const hpDebounce = useRef<ReturnType<typeof setTimeout> | null>(null)

  const [activeTab, setActiveTab] = useState<'Actions' | 'Inventory' | 'Spells' | 'Features & Traits' | 'About'>('Actions')
  const [localCurrentHp, setLocalCurrentHp] = useState(character.currentHp)
  const [localTempHp, setLocalTempHp] = useState(character.temporaryHp)
  const [hpInput, setHpInput] = useState('')
  const [localInspiration, setLocalInspiration] = useState(character.heroicInspiration ?? false)

  useEffect(() => { setLocalCurrentHp(character.currentHp) }, [character.currentHp])
  useEffect(() => { setLocalTempHp(character.temporaryHp) }, [character.temporaryHp])
  useEffect(() => { setLocalInspiration(character.heroicInspiration ?? false) }, [character.heroicInspiration])

  const persistHp = useCallback((nextHp: number, nextTemp: number) => {
    if (hpDebounce.current) clearTimeout(hpDebounce.current)
    hpDebounce.current = setTimeout(() => {
      void updateHp(character.campaignCode, character.id, nextHp, nextTemp)
    }, 500)
  }, [character.campaignCode, character.id])

  function applyDelta(delta: number) {
    const next = Math.min(character.maxHp, Math.max(0, localCurrentHp + delta))
    setLocalCurrentHp(next)
    updateHpLocal(next, localTempHp)
    persistHp(next, localTempHp)
    setHpInput('')
  }

  function handleTempHpChange(val: number) {
    const next = Math.max(0, val)
    setLocalTempHp(next)
    updateHpLocal(localCurrentHp, next)
    persistHp(localCurrentHp, next)
  }

  function handleToggleInspiration() {
    const next = !localInspiration
    setLocalInspiration(next)
    updateHeroicInspirationLocal(next)
    void updateHeroicInspiration(character.campaignCode, character.id, next)
  }

  const inputAmount = parseInt(hpInput)
  const validInput = !isNaN(inputAmount) && inputAmount > 0

  // ── Conditions ────────────────────────────────────────────────
  function toggleCondition(cond: string) {
    const current = character.activeConditions ?? []
    const next = current.includes(cond)
      ? current.filter(c => c !== cond)
      : [...current, cond]
    updateConditionsLocal(next)
    void updateConditions(character.campaignCode, character.id, next)
  }

  function skillBonus(skillKey: string, ab: Ability): number {
    const isExpert = (character.expertiseSkills ?? []).includes(skillKey)
    const isProficient = character.skillProficiencies.includes(skillKey)
    return getAbilityModifier(character.abilityScores[ab]) + (isExpert ? 2 * pb : isProficient ? pb : 0)
  }

  // Faji tulajdonságok összegyűjtése
  const speciesTraits: { label: string; value: string }[] = []
  if (character.speciesSize)
    speciesTraits.push({ label: 'Méret', value: character.speciesSize })
  if (character.draconicAncestry)
    speciesTraits.push({ label: 'Draconic Ancestry', value: character.draconicAncestry })
  if (character.elvenLineage) {
    const lin = ELVEN_LINEAGES.find(l => l.key === character.elvenLineage)
    speciesTraits.push({ label: 'Elven Lineage', value: lin?.name ?? formatKey(character.elvenLineage) })
    if (character.elvenSpellcastingAbility)
      speciesTraits.push({ label: 'Spell Ability', value: character.elvenSpellcastingAbility })
  }
  if (character.gnomishLineage) {
    const lin = GNOMISH_LINEAGES.find(l => l.key === character.gnomishLineage)
    speciesTraits.push({ label: 'Gnomish Lineage', value: lin?.name ?? formatKey(character.gnomishLineage) })
    if (character.gnomishSpellcastingAbility)
      speciesTraits.push({ label: 'Spell Ability', value: character.gnomishSpellcastingAbility })
  }
  if (character.giantAncestry) {
    const anc = GIANT_ANCESTRIES.find(a => a.key === character.giantAncestry)
    speciesTraits.push({ label: 'Giant Ancestry', value: anc?.name ?? formatKey(character.giantAncestry) })
  }
  if (character.tieflingLegacy) {
    const leg = TIEFLING_LEGACIES.find(l => l.key === character.tieflingLegacy)
    speciesTraits.push({ label: 'Fiendish Legacy', value: leg?.name ?? formatKey(character.tieflingLegacy) })
    if (character.tieflingSpellcastingAbility)
      speciesTraits.push({ label: 'Spell Ability', value: character.tieflingSpellcastingAbility })
  }
  if (character.humanVersatileFeat)
    speciesTraits.push({ label: 'Versatile Feat', value: formatKey(character.humanVersatileFeat) })

  const divineOrderInfo = character.divineOrder
    ? DIVINE_ORDERS.find(d => d.key === character.divineOrder) : null
  const primalOrderInfo = character.primalOrder
    ? PRIMAL_ORDERS.find(p => p.key === character.primalOrder) : null
  const invocationNames = (character.eldritchInvocations ?? []).map(k => {
    const inv = ELDRITCH_INVOCATIONS.find(i => i.key === k)
    return inv?.name ?? formatKey(k)
  })

  const hasClassFeatures =
    !!character.originFeatKey ||
    (character.weaponMasteries ?? []).length > 0 ||
    (character.instrumentProficiencies ?? []).length > 0 ||
    !!divineOrderInfo || !!primalOrderInfo ||
    invocationNames.length > 0

  const spellsSection = (() => {
    const cantrips = character.knownCantrips ?? []
    const spells   = character.knownSpells ?? []
    const miCants  = character.magicInitiateCantrips ?? []
    const miSpell  = character.magicInitiateSpell ?? null
    const hasAny   = cantrips.length > 0 || spells.length > 0 || miCants.length > 0 || !!miSpell
    if (!hasAny) return null
    return (
      <Card title="Varázsatok">
        {cantrips.length > 0 && (
          <div className="mb-3">
            <p className="text-text-subtle text-xs mb-1 font-semibold">Cantripek</p>
            <div className="divide-y divide-gray-700/50">
              {cantrips.map(key => {
                const spell = spellsMap.get(key)
                return spell
                  ? <SpellDetailCard key={key} spell={spell} icon="✦" accentColor="amber" />
                  : <div key={key} className="flex items-center gap-2 py-1.5">
                      <span className="text-accent text-xs">✦</span>
                      <span className="text-white text-sm">{getSpellName(key)}</span>
                    </div>
              })}
            </div>
          </div>
        )}
        {spells.length > 0 && (
          <div className={cantrips.length > 0 ? 'pt-3 border-t border-border' : ''}>
            <p className="text-text-subtle text-xs mb-1 font-semibold">
              {character.spellSlots ? 'Előkészített varázsatok' : 'Ismert varázsatok'}
            </p>
            <div className="divide-y divide-gray-700/50">
              {spells.map(key => {
                const spell = spellsMap.get(key)
                return spell
                  ? <SpellDetailCard key={key} spell={spell} icon="◆" accentColor="amber" />
                  : <div key={key} className="flex items-center gap-2 py-1.5">
                      <span className="text-accent text-xs">◆</span>
                      <span className="text-white text-sm">{getSpellName(key)}</span>
                    </div>
              })}
            </div>
          </div>
        )}
        {(miCants.length > 0 || !!miSpell) && (
          <div className={cantrips.length > 0 || spells.length > 0 ? 'pt-3 border-t border-border mt-3' : ''}>
            <p className="text-magic text-xs mb-1 font-semibold">Magic Initiate</p>
            <div className="divide-y divide-gray-700/50">
              {miCants.map(key => {
                const spell = spellsMap.get(key)
                return spell
                  ? <SpellDetailCard key={key} spell={spell} icon="✦" accentColor="violet" />
                  : <div key={key} className="flex items-center gap-2 py-1.5">
                      <span className="text-magic text-xs">✦</span>
                      <span className="text-white text-sm">{getSpellName(key)}</span>
                    </div>
              })}
              {miSpell && (() => {
                const spell = spellsMap.get(miSpell)
                return spell
                  ? <SpellDetailCard key={miSpell} spell={spell} icon="◆" accentColor="violet" note="1×/Long Rest" />
                  : <div className="flex items-center gap-2 py-1.5">
                      <span className="text-violet-300 text-xs">◆</span>
                      <span className="text-white text-sm">{getSpellName(miSpell)}</span>
                      <span className="text-violet-500 text-xs ml-auto">1×/Long Rest</span>
                    </div>
              })()}
            </div>
          </div>
        )}
      </Card>
    )
  })()

  // Darkvision számítás
  const dvBase = SPECIES_DARKVISION[character.speciesKey] ?? 0
  const dvElf = character.elvenLineage
    ? (ELVEN_LINEAGES.find(l => l.key === character.elvenLineage)?.darkvision ?? 0)
    : 0
  const darkvision = character.speciesKey === 'elf' ? dvElf : dvBase

  // Resistances számítás
  const resistances: string[] = []
  if (character.speciesKey === 'dwarf') resistances.push('Poison')
  if (character.speciesKey === 'dragonborn' && character.draconicAncestry) {
    const anc = DRAGONBORN_ANCESTRIES.find(a => a.key === character.draconicAncestry)
    if (anc) resistances.push(anc.damageType)
  }
  if (character.speciesKey === 'tiefling' && character.tieflingLegacy) {
    const leg = TIEFLING_LEGACIES.find(l => l.key === character.tieflingLegacy)
    if (leg) resistances.push(leg.resistance)
  }

  const initiativeStr = (() => { const m = getAbilityModifier(character.abilityScores.DEX); return m >= 0 ? `+${m}` : `${m}` })()

  // Hit Dice logika – komponens szinten, hogy fejléc és kocka-blokk is elérhesse
  const hdDieValue = HIT_DIE_VALUES[character.classKey] ?? 8
  const hdTotal = character.level
  const hdUsed = character.usedHitDice ?? 0
  const hdRemaining = Math.max(0, hdTotal - hdUsed)
  function hdShortRest() {
    if (hdUsed <= 0) return
    const next = Math.max(0, hdUsed - Math.max(1, Math.floor(hdTotal / 2)))
    updateUsedHitDiceLocal(next)
    void updateUsedHitDice(character.campaignCode, character.id, next)
  }
  function hdLongRest() {
    updateUsedHitDiceLocal(0)
    void updateUsedHitDice(character.campaignCode, character.id, 0)
  }

  return (
    <div className="p-4 space-y-4">

      {/* ══ FELSŐ SOR – teljes szélesség, minden blokk egy sorban ══ */}
      <div className="flex flex-wrap min-[800px]:flex-nowrap gap-2 items-stretch">

        {/* Karakter fejléc – kitölti a maradék helyet */}
        <div className="bg-surface-raised rounded-btn px-4 py-3 flex-1 min-w-0 flex items-center gap-3">
          {/* Avatar */}
          {character.avatarUrl
            ? <img src={character.avatarUrl} alt={character.name} className="w-20 h-20 rounded-full object-cover shrink-0 border-2 border-accent/40" />
            : <div className="w-20 h-20 rounded-full bg-accent/20 border-2 border-accent/40 flex items-center justify-center shrink-0">
                <span className="text-accent font-black text-3xl leading-none">{character.name.charAt(0).toUpperCase()}</span>
              </div>
          }
          <div className="min-w-0 flex-1">
            <p className="text-2xl font-black text-white leading-tight truncate">{character.name}</p>
            <p className="text-accent text-sm mt-0.5">{character.classKey} · {character.level}. szint</p>
            <p className="text-text-muted text-xs mt-1">{character.speciesKey} · {character.backgroundKey}</p>
          </div>
          <div className="flex flex-col gap-1 shrink-0">
            <button
              onClick={hdShortRest}
              disabled={hdUsed <= 0}
              className="px-2 py-0.5 rounded border border-border bg-surface-overlay hover:bg-surface-raised disabled:opacity-40 text-text-secondary text-[10px] font-semibold transition-colors"
            >Short Rest</button>
            <button
              onClick={hdLongRest}
              disabled={hdUsed <= 0}
              className="px-2 py-0.5 rounded border border-border bg-surface-overlay hover:bg-surface-raised disabled:opacity-40 text-text-secondary text-[10px] font-semibold transition-colors"
            >Long Rest</button>
          </div>
        </div>

        {/* 5 stat pilla – egyenként külön blokk */}
        {([
          { label: 'Initiative', value: initiativeStr },
          { label: 'Speed',      value: `${SPECIES_SPEED[character.speciesKey] ?? 30} ft` },
          { label: 'AC',         value: `${character.armorClass}` },
          { label: 'Prof',       value: `+${pb}` },
        ] as { label: string; value: string }[]).map(({ label, value }) => (
          <div key={label} className="bg-surface-raised rounded-btn px-3 py-2 flex flex-col items-center justify-center gap-0.5 min-w-14 shrink-0">
            <p className="text-text-muted text-[9px] font-semibold uppercase tracking-wide">{label}</p>
            <p className="text-accent font-black text-sm">{value}</p>
          </div>
        ))}

        {/* HP szerkesztő blokk */}
        <div className="bg-surface-raised rounded-btn border border-border px-3 py-2 space-y-1.5 shrink-0">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <span className="text-text-muted text-[10px]">Jelenlegi</span>
              <input
                type="number"
                min={0}
                max={character.maxHp}
                value={localCurrentHp}
                onChange={e => {
                  const v = Math.min(character.maxHp, Math.max(0, parseInt(e.target.value) || 0))
                  setLocalCurrentHp(v)
                  updateHpLocal(v, localTempHp)
                  persistHp(v, localTempHp)
                }}
                className="w-12 bg-surface-base border border-border rounded px-1 py-0.5 text-white text-center text-sm font-bold focus:outline-none focus:border-accent"
              />
              <span className="text-text-muted text-xs">/ {character.maxHp}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-cyan-500 text-[10px]">Temp</span>
              <input
                type="number"
                min={0}
                value={localTempHp || ''}
                placeholder="0"
                onChange={e => handleTempHpChange(parseInt(e.target.value) || 0)}
                className="w-10 bg-surface-base border border-cyan-800/50 rounded px-1 py-0.5 text-cyan-300 text-center text-sm font-bold focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>
          <div className="flex gap-1">
            <input
              type="number"
              min={1}
              value={hpInput}
              placeholder="…"
              onChange={e => setHpInput(e.target.value)}
              className="w-12 bg-surface-base border border-border rounded px-1 py-0.5 text-white text-center text-xs focus:outline-none focus:border-accent"
            />
            <button
              onClick={() => validInput && applyDelta(-inputAmount)}
              disabled={!validInput}
              className="px-2 py-0.5 rounded bg-red-700 hover:bg-red-600 disabled:opacity-40 text-white font-bold text-xs transition-colors"
            >−</button>
            <button
              onClick={() => validInput && applyDelta(+inputAmount)}
              disabled={!validInput || localCurrentHp >= character.maxHp}
              className="px-2 py-0.5 rounded bg-green-700 hover:bg-green-600 disabled:opacity-40 text-white font-bold text-xs transition-colors"
            >+</button>
          </div>
        </div>

        {/* Heroic Inspiration – egyszerű toggle gomb */}
        <button
          onClick={handleToggleInspiration}
          className={`rounded-btn border px-3 py-2 text-sm font-semibold transition-colors shrink-0 text-center leading-tight ${
            localInspiration
              ? 'bg-accent/20 border-accent text-accent'
              : 'bg-surface-raised border-border text-text-muted hover:border-accent/40 hover:text-text-secondary'
          }`}
        >
          <span className="block">✦</span>
          <span className="block">Heroic</span>
          <span className="block">Inspiration</span>
        </button>
      </div>

      {/* ══ ABILITY SCORES + HIT DICE ══ */}
      <div className="flex gap-2 items-start">
        <div className="flex-1 grid grid-cols-3 min-[800px]:grid-cols-6 gap-2">
          {ABILITIES.map(ab => {
            const score = character.abilityScores[ab]
            const mod = getAbilityModifier(score)
            return (
              <div key={ab} className="bg-surface-raised rounded-btn p-3 text-center">
                <p className="text-text-muted text-xs font-semibold">{ab}</p>
                <p className="text-white font-black text-xl">{score}</p>
                <p className="text-text-muted text-xs">{mod >= 0 ? `+${mod}` : mod}</p>
              </div>
            )
          })}
        </div>

        {/* Hit Dice – az ability pontok jobb oldalán */}
        <div className="bg-surface-raised rounded-card p-3 shrink-0 space-y-2 min-w-30">
          <p className="text-text-muted text-[10px] font-semibold uppercase tracking-widest">Hit Dice</p>
          <div className="flex items-center justify-between">
            <span className="text-accent font-black text-xl">d{hdDieValue}</span>
            <span className="text-text-muted text-xs">{hdRemaining}/{hdTotal}</span>
          </div>
        </div>
      </div>

      {/* ══ 3-HASÁBOS ALSÓ RÉSZ ══ */}
      <div className="min-[800px]:grid min-[800px]:grid-cols-4 min-[800px]:gap-4 min-[800px]:items-start space-y-4 min-[800px]:space-y-0">

        {/* Bal 1/4: Mentődobások + Képzettségek */}
        <div className="space-y-4">
          <Card title="Mentődobások">
            <div className="flex flex-col gap-y-1.5">
              {ABILITIES.map(ab => {
                const isProficient = character.savingThrowProficiencies.includes(ab as Ability)
                const mod = getAbilityModifier(character.abilityScores[ab]) + (isProficient ? pb : 0)
                return (
                  <div key={ab} className="flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-badge shrink-0 ${isProficient ? 'bg-accent' : 'bg-text-disabled'}`} />
                    <span className="text-text-secondary text-xs flex-1">{ab}</span>
                    <span className={`text-xs font-bold ${isProficient ? 'text-accent' : 'text-text-muted'}`}>
                      {mod >= 0 ? `+${mod}` : mod}
                    </span>
                  </div>
                )
              })}
            </div>
          </Card>

          <Card title="Képzettségek">
            <div className="flex flex-col gap-y-1">
              {SKILLS.map(skill => {
                const isExpert = (character.expertiseSkills ?? []).includes(skill.key)
                const isProficient = character.skillProficiencies.includes(skill.key)
                const mod = skillBonus(skill.key, skill.ability)
                return (
                  <div key={skill.key} className="flex items-center gap-1.5">
                    <span className={`w-1.5 h-1.5 rounded-badge shrink-0 ${
                      isExpert     ? 'bg-yellow-300 ring-1 ring-yellow-200' :
                      isProficient ? 'bg-accent' : 'bg-text-disabled'
                    }`} />
                    <span className="text-text-secondary text-xs flex-1 truncate">
                      {skill.name}{isExpert ? ' ★' : ''}
                    </span>
                    <span className={`text-xs font-bold ${
                      isExpert ? 'text-yellow-300' : isProficient ? 'text-accent' : 'text-text-subtle'
                    }`}>
                      {mod >= 0 ? `+${mod}` : mod}
                    </span>
                  </div>
                )
              })}
            </div>
            {(character.expertiseSkills ?? []).length > 0 && (
              <p className="text-text-disabled text-xs mt-2">★ = Expertise (2× proficiency bonus)</p>
            )}
          </Card>
        </div>

        {/* Közép 1/2: Tab blokk */}
        <div className="min-[800px]:col-span-2 bg-surface-raised rounded-card border border-border overflow-hidden">

          {/* Tab sáv */}
          <div className="flex border-b border-border overflow-x-auto">
            {(['Actions', 'Inventory', 'Spells', 'Features & Traits', 'About'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2.5 text-sm font-semibold whitespace-nowrap transition-colors border-b-2 -mb-px ${
                  activeTab === tab
                    ? 'border-accent text-accent'
                    : 'border-transparent text-text-muted hover:text-text-secondary'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Tab tartalom */}
          <div className="p-4">

            {/* ── Actions tab ── */}
            {activeTab === 'Actions' && (() => {
              const strMod = getAbilityModifier(character.abilityScores.STR)
              const dexMod = getAbilityModifier(character.abilityScores.DEX)

              // Fegyver jártasság ellenőrzése
              const cpWeapons = CLASS_PROFICIENCIES[character.classKey]?.weapons ?? []
              const hasProfWith = (name: string) => {
                if (cpWeapons.includes(name)) return true
                const isSimple = (SIMPLE_MELEE_WEAPONS as readonly string[]).includes(name) || (SIMPLE_RANGED_WEAPONS as readonly string[]).includes(name)
                const isMartial = (MARTIAL_MELEE_WEAPONS as readonly string[]).includes(name) || (MARTIAL_RANGED_WEAPONS as readonly string[]).includes(name)
                return (cpWeapons.includes('Simple') && isSimple) || (cpWeapons.includes('Martial') && isMartial)
              }

              // Fegyvertámadás bejegyzések az inventory-ból
              const weaponEntries: ActionEntry[] = (character.starterEquipment ?? [])
                .filter(item => {
                  const stats = EQUIPMENT_INFO[item]?.stats
                  return stats && /\dd\d+/.test(stats) && !stats.startsWith('AC')
                })
                .map(item => {
                  const stats = EQUIPMENT_INFO[item]!.stats!
                  const isFinesse = stats.includes('Finesse')
                  const isRanged = stats.includes('Range') || (stats.includes('Ammunition') && !stats.includes('Thrown'))
                  const abilityMod = isFinesse ? Math.max(strMod, dexMod) : isRanged ? dexMod : strMod
                  const abilityLabel = isFinesse ? (strMod >= dexMod ? 'STR' : 'DEX') : isRanged ? 'DEX' : 'STR'
                  const profBonus = hasProfWith(item) ? pb : 0
                  const attackBonus = abilityMod + profBonus
                  const attackStr = attackBonus >= 0 ? `+${attackBonus}` : `${attackBonus}`
                  const dmgMod = abilityMod >= 0 ? `+${abilityMod}` : `${abilityMod}`
                  // Parse dice from stats: e.g. "1d8 slashing · Versatile (1d10)"
                  const diceMatch = stats.match(/(\d+d\d+)\s+(\w+)/)
                  const dmgDice = diceMatch ? diceMatch[1] : '?'
                  const dmgType = diceMatch ? diceMatch[2] : ''
                  return {
                    name: item,
                    actionType: 'Action' as const,
                    description: `Attack: ${attackStr} (${abilityLabel}${hasProfWith(item) ? ' + Prof' : ''}) · Damage: ${dmgDice} ${dmgMod} ${dmgType} · ${stats}`,
                  }
                })

              // Unarmed Strike
              const unarmedBonus = strMod + pb
              const unarmedStr = unarmedBonus >= 0 ? `+${unarmedBonus}` : `${unarmedBonus}`
              const unarmedDmg = 1 + strMod
              weaponEntries.push({
                name: 'Unarmed Strike',
                actionType: 'Action',
                description: `Attack: ${unarmedStr} (STR + Prof) · Damage: ${unarmedDmg} bludgeoning`,
              })

              // Spell akciók castingTime alapján
              const castTimeToType = (ct: string): ActionEntry['actionType'] | null => {
                const lower = ct.toLowerCase()
                if (lower.includes('bonus')) return 'Bonus Action'
                if (lower.includes('reaction')) return 'Reaction'
                if (lower.includes('action') && !lower.includes('minute') && !lower.includes('hour')) return 'Action'
                return null
              }
              const spellEntries: ActionEntry[] = [
                ...(character.knownCantrips ?? []),
                ...(character.knownSpells ?? []),
                ...(character.magicInitiateCantrips ?? []),
                ...(character.magicInitiateSpell ? [character.magicInitiateSpell] : []),
              ].flatMap(key => {
                const spell = spellsMap.get(key)
                if (!spell) return []
                const type = castTimeToType(spell.castingTime)
                if (!type) return []
                const levelLabel = spell.level === 0 ? 'Cantrip' : `Level ${spell.level}`
                const tags = [spell.castingTime, spell.range, spell.duration].filter(Boolean).join(' · ')
                return [{
                  name: spell.name,
                  actionType: type,
                  description: `${levelLabel} · ${spell.school} · ${tags}${spell.concentration ? ' · Concentration' : ''}`,
                }]
              })

              // Kaszt-specifikus bónusz akciók és reakciók
              const classActions: ActionEntry[] = [
                ...(CLASS_BONUS_ACTIONS[character.classKey] ?? []),
                ...(CLASS_REACTIONS[character.classKey] ?? []),
              ]
              const byType = (type: ActionEntry['actionType']) => [
                ...(type === 'Action' ? weaponEntries.filter(e => e.actionType === 'Action') : []),
                ...(type === 'Action' ? spellEntries.filter(e => e.actionType === 'Action') : []),
                ...(type === 'Bonus Action' ? spellEntries.filter(e => e.actionType === 'Bonus Action') : []),
                ...(type === 'Reaction' ? spellEntries.filter(e => e.actionType === 'Reaction') : []),
                ...classActions.filter(a => a.actionType === type),
              ]

              // Általános akciók (Dash, Disengage stb.) – Attack nélkül
              const otherActions = BASE_ACTIONS.filter(a => a.name !== 'Attack')

              return (
                <div className="space-y-5">
                  {(['Action', 'Bonus Action', 'Reaction'] as const).map(type => {
                    const entries = byType(type)
                    if (!entries.length) return null
                    return (
                      <div key={type}>
                        <p className="text-text-muted text-[10px] font-semibold uppercase tracking-widest mb-2">{type}</p>
                        <div className="space-y-1.5">
                          {entries.map((a, i) => (
                            <div key={`${a.name}-${i}`} className="bg-surface-overlay rounded-input px-3 py-2 border border-border">
                              <p className="text-white text-sm font-semibold">{a.name}</p>
                              <p className="text-text-muted text-xs mt-0.5 leading-relaxed">{a.description}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                  {/* Általános akciók legalul */}
                  <div>
                    <p className="text-text-muted text-[10px] font-semibold uppercase tracking-widest mb-2">Other Actions</p>
                    <div className="space-y-1.5">
                      {otherActions.map(a => (
                        <div key={a.name} className="bg-surface-overlay rounded-input px-3 py-2 border border-border">
                          <div className="flex items-center gap-2">
                            <p className="text-white text-sm font-semibold">{a.name}</p>
                            <span className="text-[10px] text-text-muted border border-border rounded px-1.5 py-0.5">{a.actionType}</span>
                          </div>
                          <p className="text-text-muted text-xs mt-0.5 leading-relaxed">{a.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )
            })()}

            {/* ── Inventory tab ── */}
            {activeTab === 'Inventory' && (
              (character.starterEquipment ?? []).length > 0
                ? <div className="divide-y divide-gray-700/50">
                    {character.starterEquipment.map((item, i) => (
                      <EquipmentRow key={i} name={item} />
                    ))}
                  </div>
                : <p className="text-text-disabled text-sm">Nincs felszerelés.</p>
            )}

            {/* ── Spells tab ── */}
            {activeTab === 'Spells' && (
              spellsSection
                ? spellsSection
                : <p className="text-text-disabled text-sm">Nincs elérhető varázslat.</p>
            )}

            {/* ── Features & Traits tab ── */}
            {activeTab === 'Features & Traits' && (
              <div className="space-y-5">
                {hasClassFeatures && (
                  <div>
                    <p className="text-text-muted text-[10px] font-semibold uppercase tracking-widest mb-2">Kaszt Tulajdonságok</p>
                    <div className="space-y-2">
                      {character.originFeatKey && (
                        <div className="bg-surface-overlay rounded-input px-3 py-2 border border-border flex items-center justify-between">
                          <span className="text-text-muted text-sm">Origin Feat</span>
                          <span className="text-white text-sm font-semibold">{formatKey(character.originFeatKey)}</span>
                        </div>
                      )}
                      {divineOrderInfo && (
                        <div className="bg-surface-overlay rounded-input px-3 py-2 border border-border flex items-center justify-between">
                          <span className="text-text-muted text-sm">Divine Order</span>
                          <span className="text-white text-sm font-semibold">{divineOrderInfo.name}</span>
                        </div>
                      )}
                      {primalOrderInfo && (
                        <div className="bg-surface-overlay rounded-input px-3 py-2 border border-border flex items-center justify-between">
                          <span className="text-text-muted text-sm">Primal Order</span>
                          <span className="text-white text-sm font-semibold">{primalOrderInfo.name}</span>
                        </div>
                      )}
                      {(character.weaponMasteries ?? []).length > 0 && (
                        <div className="bg-surface-overlay rounded-input px-3 py-2 border border-border">
                          <p className="text-text-muted text-sm mb-1.5">Weapon Mastery</p>
                          <div className="flex flex-wrap gap-1">
                            {character.weaponMasteries.map(w => (
                              <span key={w} className="text-xs bg-neutral text-text-secondary px-2 py-0.5 rounded-badge">{w}</span>
                            ))}
                          </div>
                        </div>
                      )}
                      {invocationNames.length > 0 && (
                        <div className="bg-surface-overlay rounded-input px-3 py-2 border border-border">
                          <p className="text-text-muted text-sm mb-1.5">Eldritch Invocations</p>
                          <div className="flex flex-wrap gap-1">
                            {invocationNames.map(n => (
                              <span key={n} className="text-xs bg-violet-900/50 text-violet-300 px-2 py-0.5 rounded-badge border border-violet-700/40">{n}</span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                {speciesTraits.length > 0 && (
                  <div>
                    <p className="text-text-muted text-[10px] font-semibold uppercase tracking-widest mb-2">Faji Tulajdonságok</p>
                    <div className="space-y-1.5">
                      {speciesTraits.map(t => (
                        <div key={t.label} className="bg-surface-overlay rounded-input px-3 py-2 border border-border flex items-center justify-between">
                          <span className="text-text-muted text-sm">{t.label}</span>
                          <span className="text-white text-sm font-semibold">{t.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {!hasClassFeatures && speciesTraits.length === 0 && (
                  <p className="text-text-disabled text-sm">Nincsenek elérhető tulajdonságok.</p>
                )}
              </div>
            )}

            {/* ── About tab ── */}
            {activeTab === 'About' && (() => {
              const bg = BACKGROUND_INFO[character.backgroundKey]
              const abilityOptions = BACKGROUND_ABILITY_OPTIONS[character.backgroundKey] ?? []
              const originFeat = BACKGROUND_ORIGIN_FEAT[character.backgroundKey]
              const equipment = BACKGROUND_STARTER_EQUIPMENT[character.backgroundKey]
              return (
                <div className="space-y-5">
                  {bg && (
                    <div>
                      <p className="text-white text-base font-bold mb-1">{bg.name}</p>
                      <p className="text-text-secondary text-sm leading-relaxed">{bg.description}</p>
                    </div>
                  )}
                  {bg && bg.skills.length > 0 && (
                    <div>
                      <p className="text-text-muted text-[10px] font-semibold uppercase tracking-widest mb-2">Skill Proficiencies</p>
                      <div className="flex flex-wrap gap-1.5">
                        {bg.skills.map(s => (
                          <span key={s} className="text-xs bg-surface-overlay border border-border text-text-secondary px-2 py-0.5 rounded-badge">{s}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  {abilityOptions.length > 0 && (
                    <div>
                      <p className="text-text-muted text-[10px] font-semibold uppercase tracking-widest mb-2">Ability Score Options</p>
                      <p className="text-text-secondary text-xs">+2/+1 or +1/+1/+1 to: <span className="text-white font-semibold">{abilityOptions.join(', ')}</span></p>
                    </div>
                  )}
                  {originFeat && (
                    <div>
                      <p className="text-text-muted text-[10px] font-semibold uppercase tracking-widest mb-2">Origin Feat</p>
                      <span className="text-white text-sm font-semibold">{formatKey(originFeat)}</span>
                    </div>
                  )}
                  {equipment && (
                    <div>
                      <p className="text-text-muted text-[10px] font-semibold uppercase tracking-widest mb-2">Starter Equipment</p>
                      <div className="flex flex-col gap-0.5">
                        {equipment.fixed.map((item, i) => (
                          <span key={i} className="text-text-secondary text-xs">{item}</span>
                        ))}
                        <span className="text-accent text-xs mt-1">{equipment.gold} GP starting gold (alternative)</span>
                      </div>
                    </div>
                  )}
                </div>
              )
            })()}

          </div>
        </div>

        {/* Jobb 1/4: Passzív értékek + Defenses + Conditions + Proficiencies */}
        <div className="space-y-4">

          <Card title="Passzív értékek">
            <div className="space-y-1.5">
              {[
                { label: 'Passive Perception',    val: 10 + skillBonus('perception',    'WIS') },
                { label: 'Passive Investigation', val: 10 + skillBonus('investigation', 'INT') },
                { label: 'Passive Insight',       val: 10 + skillBonus('insight',       'WIS') },
              ].map(({ label, val }) => (
                <div key={label} className="flex items-center justify-between">
                  <span className="text-text-secondary text-xs">{label}</span>
                  <span className="text-accent text-xs font-bold">{val}</span>
                </div>
              ))}
              {darkvision > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-text-secondary text-xs">Darkvision</span>
                  <span className="text-violet-400 text-xs font-bold">{darkvision} ft.</span>
                </div>
              )}
            </div>
          </Card>

          {resistances.length > 0 && (
            <Card title="Defenses">
              <p className="text-text-muted text-[10px] font-semibold uppercase tracking-wide mb-1.5">Resistances</p>
              <div className="flex flex-wrap gap-1.5">
                {resistances.map(r => (
                  <span key={r} className="px-2 py-0.5 rounded text-xs font-semibold bg-blue-900/50 border border-blue-700/50 text-blue-300">{r}</span>
                ))}
              </div>
            </Card>
          )}

          <Card title="Conditions">
            <div className="flex flex-wrap gap-1.5">
              {DND_CONDITIONS.map(cond => {
                const active = (character.activeConditions ?? []).includes(cond)
                return (
                  <button
                    key={cond}
                    onClick={() => toggleCondition(cond)}
                    className={`px-2 py-0.5 rounded text-xs font-semibold transition-colors border ${
                      active
                        ? 'bg-red-700/80 border-red-500 text-white'
                        : 'bg-surface-raised border-border text-text-muted hover:border-red-700/60 hover:text-red-300'
                    }`}
                  >
                    {cond}
                  </button>
                )
              })}
            </div>
          </Card>

          <Card title="Proficiencies, Training &amp; Languages">
            <div className="space-y-3">
              {(() => {
                const cp = CLASS_PROFICIENCIES[character.classKey]
                return cp ? (
                  <>
                    {cp.armor.length > 0 && (
                      <div>
                        <p className="text-text-muted text-[10px] font-semibold uppercase tracking-wide mb-1.5">Armor</p>
                        <div className="flex flex-col gap-0.5">
                          {cp.armor.map(a => <span key={a} className="text-text-secondary text-xs">{a}</span>)}
                        </div>
                      </div>
                    )}
                    {cp.weapons.length > 0 && (
                      <div>
                        <p className="text-text-muted text-[10px] font-semibold uppercase tracking-wide mb-1.5">Weapons</p>
                        <div className="flex flex-col gap-0.5">
                          {cp.weapons.map(w => <span key={w} className="text-text-secondary text-xs">{w}</span>)}
                        </div>
                      </div>
                    )}
                    {cp.tools.length > 0 && (
                      <div>
                        <p className="text-text-muted text-[10px] font-semibold uppercase tracking-wide mb-1.5">Tools</p>
                        <div className="flex flex-col gap-0.5">
                          {cp.tools.map(t => <span key={t} className="text-text-secondary text-xs">{t}</span>)}
                        </div>
                      </div>
                    )}
                  </>
                ) : null
              })()}
              {(character.instrumentProficiencies ?? []).length > 0 && (
                <div>
                  <p className="text-text-muted text-[10px] font-semibold uppercase tracking-wide mb-1.5">Training</p>
                  <div className="flex flex-col gap-0.5">
                    {character.instrumentProficiencies.map(i => (
                      <span key={i} className="text-text-secondary text-xs">{i}</span>
                    ))}
                  </div>
                </div>
              )}
              {(character.languages ?? []).length > 0 && (
                <div>
                  <p className="text-text-muted text-[10px] font-semibold uppercase tracking-wide mb-1.5">Languages</p>
                  <div className="flex flex-col gap-0.5">
                    {character.languages.map(lang => (
                      <span key={lang} className="text-text-secondary text-xs">{lang}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Card>

        </div>
      </div>

    </div>
  )
}

function EquipmentRow({ name }: { name: string }) {
  const [open, setOpen] = useState(false)
  const info = EQUIPMENT_INFO[name]

  if (!info) {
    return (
      <div className="flex items-center gap-2 py-1.5">
        <span className="text-amber-400 text-xs shrink-0">✦</span>
        <span className="text-white text-sm">{name}</span>
      </div>
    )
  }

  return (
    <div>
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-2 text-left py-1.5"
      >
        <span className="text-amber-400 text-xs shrink-0">✦</span>
        <span className="text-white text-sm flex-1">{name}</span>
        <span className="text-gray-600 text-xs">{open ? '▲' : '▼'}</span>
      </button>
      {open && (
        <div className="ml-4 mb-2 bg-gray-900/80 border border-border rounded-btn p-3 space-y-1.5">
          {info.stats && (
            <p className="text-accent/80 text-xs font-semibold">{info.stats}</p>
          )}
          <p className="text-text-secondary text-xs leading-relaxed">{info.summary}</p>
        </div>
      )}
    </div>
  )
}
