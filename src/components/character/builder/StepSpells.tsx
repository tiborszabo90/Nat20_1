import { CLASS_SPELLCASTING, CLASS_SPELL_NAME, getAbilityModifier } from '../../../data/dndConstants'
import type { Spell } from '../../../types/dnd/spell'
import type { AbilityScores } from '../../../types/dnd/character'

interface Props {
  classKey: string | null
  abilityScores: AbilityScores
  spells: Spell[]
  knownCantrips: string[]
  onCantripsChange: (keys: string[]) => void
  knownSpells: string[]
  onSpellsChange: (keys: string[]) => void
  // Magic Initiate (háttér origin feat)
  magicInitiateClass?: string | null
  magicInitiateCantrips: string[]
  onMagicInitiateCantripsChange: (keys: string[]) => void
  magicInitiateSpell: string | null
  onMagicInitiateSpellChange: (key: string | null) => void
}

function computeSpellsNeeded(spellsKnown: number | 'wis+level' | 'wis+half' | 'cha+half', scores: AbilityScores): number {
  if (typeof spellsKnown === 'number') return spellsKnown
  if (spellsKnown === 'wis+level') return Math.max(1, getAbilityModifier(scores.WIS) + 1)
  if (spellsKnown === 'wis+half')  return Math.max(1, getAbilityModifier(scores.WIS))
  return Math.max(1, getAbilityModifier(scores.CHA))
}

function SpellCard({ spell, isSelected, isDisabled, onToggle, accent = 'amber' }: {
  spell: Spell
  isSelected: boolean
  isDisabled: boolean
  onToggle: () => void
  accent?: 'amber' | 'violet'
}) {
  const selectedClass = accent === 'violet'
    ? 'border-violet-500 bg-violet-500/10'
    : 'border-accent bg-accent/10'

  return (
    <button
      onClick={onToggle}
      disabled={isDisabled}
      className={`
        text-left px-4 py-3 rounded-btn border-2 transition-colors
        ${isSelected
          ? selectedClass
          : isDisabled
            ? 'border-border-subtle bg-surface-overlay opacity-40 cursor-not-allowed'
            : 'border-border bg-surface-raised hover:border-border-hover'}
      `}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="label-l text-white truncate">{spell.name}</p>
          <p className="text-text-subtle text-xs">
            {spell.school}
            {spell.concentration && ' · Concentration'}
            {spell.ritual && ' · Ritual'}
            {spell.components && ` · ${spell.components}`}
          </p>
        </div>
        {isSelected && (
          <span className={`text-xs font-bold shrink-0 ${accent === 'violet' ? 'text-violet-400' : 'text-accent'}`}>✓</span>
        )}
      </div>
    </button>
  )
}

function Counter({ current, total, accent = 'amber' }: { current: number; total: number; accent?: 'amber' | 'violet' }) {
  const done = current === total
  const colorClass = done
    ? accent === 'violet' ? 'bg-violet-500/20 text-violet-300' : 'bg-accent/20 text-accent'
    : 'bg-neutral text-text-muted'
  return (
    <span className={`text-xs font-bold px-2 py-0.5 rounded-badge ${colorClass}`}>
      {current}/{total}
    </span>
  )
}

export function StepSpells({
  classKey, abilityScores, spells,
  knownCantrips, onCantripsChange,
  knownSpells, onSpellsChange,
  magicInitiateClass,
  magicInitiateCantrips, onMagicInitiateCantripsChange,
  magicInitiateSpell, onMagicInitiateSpellChange,
}: Props) {
  const info = classKey ? CLASS_SPELLCASTING[classKey] : undefined
  const className = classKey ? CLASS_SPELL_NAME[classKey] : undefined

  const hasClassSpells  = !!info && !!className
  const hasMagicInitiate = !!magicInitiateClass

  const cantripsNeeded = info?.cantripsKnown ?? 0
  const spellsNeeded   = info ? computeSpellsNeeded(info.spellsKnown, abilityScores) : 0

  const classCantrips = hasClassSpells
    ? spells.filter(s => s.level === 0 && s.classes.includes(className!))
    : []
  const classSpells = hasClassSpells
    ? spells.filter(s => s.level === 1 && s.classes.includes(className!))
    : []

  const miCantrips = hasMagicInitiate
    ? spells.filter(s => s.level === 0 && s.classes.includes(magicInitiateClass!))
    : []
  const miSpells = hasMagicInitiate
    ? spells.filter(s => s.level === 1 && s.classes.includes(magicInitiateClass!))
    : []

  function toggleCantrip(key: string) {
    if (knownCantrips.includes(key)) {
      onCantripsChange(knownCantrips.filter(k => k !== key))
    } else if (knownCantrips.length < cantripsNeeded) {
      onCantripsChange([...knownCantrips, key])
    }
  }

  function toggleSpell(key: string) {
    if (knownSpells.includes(key)) {
      onSpellsChange(knownSpells.filter(k => k !== key))
    } else if (knownSpells.length < spellsNeeded) {
      onSpellsChange([...knownSpells, key])
    }
  }

  function toggleMiCantrip(key: string) {
    if (magicInitiateCantrips.includes(key)) {
      onMagicInitiateCantripsChange(magicInitiateCantrips.filter(k => k !== key))
    } else if (magicInitiateCantrips.length < 2) {
      onMagicInitiateCantripsChange([...magicInitiateCantrips, key])
    }
  }

  function toggleMiSpell(key: string) {
    onMagicInitiateSpellChange(magicInitiateSpell === key ? null : key)
  }

  const isWizard = classKey === 'wizard'

  return (
    <div>
      <h2 className="heading-l text-accent mb-1">Varázsatok</h2>
      <p className="body-m text-text-muted mb-6">
        {hasClassSpells && hasMagicInitiate
          ? 'Válaszd ki a kaszt varázslataidat és a Magic Initiate feat varázslatait.'
          : hasMagicInitiate
            ? 'Válaszd ki a Magic Initiate feat varázslatait.'
            : info?.isPrepared
              ? 'Válaszd ki a kezdő előkészített varázslataidat.'
              : isWizard
                ? 'Válaszd ki a varázskönyved kezdő varázslatait.'
                : 'Válaszd ki az ismert varázslataidat.'}
      </p>

      {/* ── Kaszt varázslatok ── */}
      {hasClassSpells && (
        <div className="mb-8">
          {hasMagicInitiate && (
            <p className="text-accent text-xs font-bold uppercase tracking-wider mb-3">
              {className} kaszt
            </p>
          )}

          {/* Cantripek */}
          {cantripsNeeded > 0 && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <p className="subheading-m text-text-secondary">Cantripek</p>
                <Counter current={knownCantrips.length} total={cantripsNeeded} />
              </div>
              <div className="flex flex-col gap-2">
                {classCantrips.length === 0
                  ? <p className="text-text-subtle text-sm">Nincsenek cantrip adatok betöltve.</p>
                  : classCantrips.map(spell => (
                    <SpellCard
                      key={spell.key}
                      spell={spell}
                      isSelected={knownCantrips.includes(spell.key)}
                      isDisabled={!knownCantrips.includes(spell.key) && knownCantrips.length >= cantripsNeeded}
                      onToggle={() => toggleCantrip(spell.key)}
                    />
                  ))
                }
              </div>
            </div>
          )}

          {/* 1. szintű varázsatok */}
          {spellsNeeded > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="subheading-m text-text-secondary">
                  {isWizard ? 'Varázskönyv – 1. szintű' : info!.isPrepared ? 'Előkészített varázsatok' : 'Ismert varázsatok'}
                </p>
                <Counter current={knownSpells.length} total={spellsNeeded} />
              </div>
              <div className="flex flex-col gap-2">
                {classSpells.length === 0
                  ? <p className="text-text-subtle text-sm">Nincsenek 1. szintű varázslat adatok betöltve.</p>
                  : classSpells.map(spell => (
                    <SpellCard
                      key={spell.key}
                      spell={spell}
                      isSelected={knownSpells.includes(spell.key)}
                      isDisabled={!knownSpells.includes(spell.key) && knownSpells.length >= spellsNeeded}
                      onToggle={() => toggleSpell(spell.key)}
                    />
                  ))
                }
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Magic Initiate ── */}
      {hasMagicInitiate && (
        <div className="border-t border-border pt-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-violet-400 text-xs font-bold uppercase tracking-wider">
              Magic Initiate – {magicInitiateClass}
            </span>
            <span className="text-gray-600 text-xs">(origin feat)</span>
          </div>
          <p className="text-text-subtle text-xs mb-4">
            Válassz 2 cantripet és 1 db 1. szintű varázslatot a {magicInitiateClass} listájából.
            Az 1. szintű varázslat naponta egyszer ingyenesen, Long Rest után visszatöltve használható.
          </p>

          {/* MI Cantripek */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <p className="subheading-m text-text-secondary">Cantripek</p>
              <Counter current={magicInitiateCantrips.length} total={2} accent="violet" />
            </div>
            <div className="flex flex-col gap-2">
              {miCantrips.length === 0
                ? <p className="text-text-subtle text-sm">Nincsenek cantrip adatok betöltve.</p>
                : miCantrips.map(spell => (
                  <SpellCard
                    key={spell.key}
                    spell={spell}
                    isSelected={magicInitiateCantrips.includes(spell.key)}
                    isDisabled={!magicInitiateCantrips.includes(spell.key) && magicInitiateCantrips.length >= 2}
                    onToggle={() => toggleMiCantrip(spell.key)}
                    accent="violet"
                  />
                ))
              }
            </div>
          </div>

          {/* MI 1. szintű varázslat */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="subheading-m text-text-secondary">1. szintű varázslat</p>
              <Counter current={magicInitiateSpell ? 1 : 0} total={1} accent="violet" />
            </div>
            <div className="flex flex-col gap-2">
              {miSpells.length === 0
                ? <p className="text-text-subtle text-sm">Nincsenek 1. szintű varázslat adatok betöltve.</p>
                : miSpells.map(spell => (
                  <SpellCard
                    key={spell.key}
                    spell={spell}
                    isSelected={magicInitiateSpell === spell.key}
                    isDisabled={false}
                    onToggle={() => toggleMiSpell(spell.key)}
                    accent="violet"
                  />
                ))
              }
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
