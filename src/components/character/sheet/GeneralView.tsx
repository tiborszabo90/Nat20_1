import { useState } from 'react'
import type { Character } from '../../../types/dnd/character'
import {
  ABILITIES, SKILLS, getAbilityModifier, getProficiencyBonus,
  ELVEN_LINEAGES, GNOMISH_LINEAGES, GIANT_ANCESTRIES, TIEFLING_LEGACIES,
  ELDRITCH_INVOCATIONS, DIVINE_ORDERS, PRIMAL_ORDERS,
} from '../../../data/dndConstants'
import type { Ability } from '../../../data/dndConstants'
import { useDndDataStore } from '../../../store/dndDataStore'
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
  const getSpellSchool = (key: string) => spellsMap.get(key)?.school ?? ''

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

  return (
    <div className="p-4 space-y-4">
      {/* Karakter fejléc */}
      <Card>
        <p className="text-2xl font-black text-white">{character.name}</p>
        <p className="text-accent text-sm mt-0.5">
          {character.classKey} · {character.level}. szint
        </p>
        <p className="text-text-muted text-xs mt-1">
          {character.speciesKey} · {character.backgroundKey}
        </p>
        <div className="flex gap-3 mt-2">
          <span className="text-text-subtle text-xs">Proficiency Bonus: <span className="text-accent font-bold">+{pb}</span></span>
        </div>
      </Card>

      {/* Ability Scores */}
      <div className="grid grid-cols-3 gap-2">
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

      {/* Mentődobások */}
      <Card title="Mentődobások">
        <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
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

      {/* Képzettségek */}
      <Card title="Képzettségek">
        <div className="grid grid-cols-2 gap-x-4 gap-y-1">
          {SKILLS.map(skill => {
            const isExpert = (character.expertiseSkills ?? []).includes(skill.key)
            const isProficient = character.skillProficiencies.includes(skill.key)
            const mod = skillBonus(skill.key, skill.ability)
            return (
              <div key={skill.key} className="flex items-center gap-1.5">
                <span className={`w-1.5 h-1.5 rounded-badge shrink-0 ${
                  isExpert    ? 'bg-yellow-300 ring-1 ring-yellow-200' :
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

      {/* Kaszt tulajdonságok */}
      {hasClassFeatures && (
        <Card title="Kaszt Tulajdonságok">
          <div className="space-y-3">
            {character.originFeatKey && (
              <div className="flex items-center justify-between">
                <span className="text-text-muted text-sm">Origin Feat</span>
                <span className="text-white text-sm font-semibold">{formatKey(character.originFeatKey)}</span>
              </div>
            )}
            {divineOrderInfo && (
              <div className="flex items-center justify-between">
                <span className="text-text-muted text-sm">Divine Order</span>
                <span className="text-white text-sm font-semibold">{divineOrderInfo.name}</span>
              </div>
            )}
            {primalOrderInfo && (
              <div className="flex items-center justify-between">
                <span className="text-text-muted text-sm">Primal Order</span>
                <span className="text-white text-sm font-semibold">{primalOrderInfo.name}</span>
              </div>
            )}
            {(character.weaponMasteries ?? []).length > 0 && (
              <div>
                <p className="text-text-muted text-sm mb-1.5">Weapon Mastery</p>
                <div className="flex flex-wrap gap-1">
                  {character.weaponMasteries.map(w => (
                    <span key={w} className="text-xs bg-neutral text-text-secondary px-2 py-0.5 rounded-badge">{w}</span>
                  ))}
                </div>
              </div>
            )}
            {(character.instrumentProficiencies ?? []).length > 0 && (
              <div>
                <p className="text-text-muted text-sm mb-1.5">Hangszer jártasságok</p>
                <div className="flex flex-wrap gap-1">
                  {character.instrumentProficiencies.map(i => (
                    <span key={i} className="text-xs bg-neutral text-text-secondary px-2 py-0.5 rounded-badge">{i}</span>
                  ))}
                </div>
              </div>
            )}
            {invocationNames.length > 0 && (
              <div>
                <p className="text-text-muted text-sm mb-1.5">Eldritch Invocations</p>
                <div className="flex flex-wrap gap-1">
                  {invocationNames.map(n => (
                    <span key={n} className="text-xs bg-violet-900/50 text-violet-300 px-2 py-0.5 rounded-badge border border-violet-700/40">{n}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Faji tulajdonságok */}
      {speciesTraits.length > 0 && (
        <Card title="Faji Tulajdonságok">
          <div className="space-y-2">
            {speciesTraits.map(t => (
              <div key={t.label} className="flex items-center justify-between">
                <span className="text-text-muted text-sm">{t.label}</span>
                <span className="text-white text-sm font-semibold">{t.value}</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Varázsatok */}
      {(() => {
        const cantrips = character.knownCantrips ?? []
        const spells   = character.knownSpells ?? []
        const miCants  = character.magicInitiateCantrips ?? []
        const miSpell  = character.magicInitiateSpell ?? null
        const hasAny   = cantrips.length > 0 || spells.length > 0 || miCants.length > 0 || !!miSpell
        if (!hasAny) return null
        return (
          <Card title="Varázsatok">
            {/* Cantripek */}
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

            {/* Ismert / Előkészített varázsatok */}
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

            {/* Magic Initiate */}
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
      })()}

      {/* Felszerelés */}
      {(character.starterEquipment ?? []).length > 0 && (
        <Card title="Felszerelés">
          <div className="divide-y divide-gray-700/50">
            {character.starterEquipment.map((item, i) => (
              <EquipmentRow key={i} name={item} />
            ))}
          </div>
        </Card>
      )}
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
