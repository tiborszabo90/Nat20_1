import { GNOMISH_LINEAGES } from '../../../data/dndConstants'
import type { Ability } from '../../../data/dndConstants'

interface Props {
  selectedLineage: string | null
  selectedAbility: Ability | null
  onLineageChange: (key: string) => void
  onAbilityChange: (ability: Ability) => void
}

const SPELLCASTING_ABILITIES: Ability[] = ['INT', 'WIS', 'CHA']

export function StepGnomishLineage({ selectedLineage, selectedAbility, onLineageChange, onAbilityChange }: Props) {
  const selected = GNOMISH_LINEAGES.find(l => l.key === selectedLineage)

  return (
    <div>
      <h2 className="heading-l text-accent mb-1">Gnomish Lineage</h2>
      <p className="body-m text-text-muted mb-6">
        Válaszd ki gnóm örökségedet. Ez határozza meg egyedi képességeidet.
      </p>

      <div className="grid grid-cols-1 gap-3 mb-6">
        {GNOMISH_LINEAGES.map(lineage => {
          const isSelected = selectedLineage === lineage.key
          return (
            <button
              key={lineage.key}
              onClick={() => onLineageChange(lineage.key)}
              className={`
                text-left p-4 rounded-btn border-2 transition-colors
                ${isSelected
                  ? 'border-accent bg-accent/10'
                  : 'border-border bg-surface-raised hover:border-border-hover'}
              `}
            >
              <div className="flex items-start justify-between gap-2">
                <span className="label-l text-white">{lineage.name}</span>
                {isSelected && <span className="text-accent text-xs font-bold shrink-0">✓ Kiválasztva</span>}
              </div>
              <div className="flex gap-2 mt-1.5 flex-wrap">
                {lineage.cantrips.map(c => (
                  <span key={c} className="text-violet-300 text-xs">Cantrip: {c}</span>
                ))}
                {!lineage.needsSpellcastingAbility && (
                  <span className="text-text-subtle text-xs">Spellcasting: INT</span>
                )}
              </div>
              {isSelected && lineage.key === 'forest' && (
                <p className="text-text-muted text-xs mt-1.5">Speak with Animals (1/nap)</p>
              )}
            </button>
          )
        })}
      </div>

      {/* Spellcasting Ability – csak Forest Gnome esetén */}
      {selected?.needsSpellcastingAbility && (
        <div>
          <p className="subheading-m text-text-secondary mb-1">Spellcasting Ability</p>
          <p className="text-text-subtle text-xs mb-3">
            Melyik képességet használja a Minor Illusion cantrip és a Speak with Animals?
          </p>
          <div className="flex gap-3">
            {SPELLCASTING_ABILITIES.map(ab => (
              <button
                key={ab}
                onClick={() => onAbilityChange(ab)}
                className={`flex-1 py-3 rounded-btn border-2 font-bold transition-colors ${
                  selectedAbility === ab
                    ? 'border-accent bg-accent/10 text-accent'
                    : 'border-border bg-surface-raised text-text-secondary hover:border-border-hover'
                }`}
              >
                {ab}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
