import { ELVEN_LINEAGES } from '../../../data/dndConstants'
import type { Ability } from '../../../data/dndConstants'

interface Props {
  selectedLineage: string | null
  selectedAbility: Ability | null
  onLineageChange: (key: string) => void
  onAbilityChange: (ability: Ability) => void
}

const SPELLCASTING_ABILITIES: Ability[] = ['INT', 'WIS', 'CHA']

export function StepElvenLineage({ selectedLineage, selectedAbility, onLineageChange, onAbilityChange }: Props) {
  return (
    <div>
      <h2 className="heading-l text-accent mb-1">Elven Lineage</h2>
      <p className="body-m text-text-muted mb-6">
        Válaszd ki elfi örökségedet. Ez meghatározza a Darkvision hatótávolságát és az egyedi varázslataidat.
      </p>

      {/* Lineage kártyák */}
      <div className="grid grid-cols-1 gap-3 mb-6">
        {ELVEN_LINEAGES.map(lineage => {
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
              <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-0.5">
                <span className="text-blue-300 text-xs">Darkvision {lineage.darkvision} ft</span>
                <span className="text-violet-300 text-xs">Cantrip: {lineage.cantrip}</span>
              </div>
              {isSelected && (
                <div className="mt-2 text-xs text-text-muted space-y-0.5">
                  <p>3. szint: {lineage.level3Spell} (1/nap)</p>
                  <p>5. szint: {lineage.level5Spell} (1/nap)</p>
                </div>
              )}
            </button>
          )
        })}
      </div>

      {/* Spellcasting Ability – csak ha lineage kiválasztva */}
      {selectedLineage && (
        <div>
          <p className="subheading-m text-text-secondary mb-1">Spellcasting Ability</p>
          <p className="text-text-subtle text-xs mb-3">
            Melyik képességet használja az Elven Lineage varázslataid (cantrip + 3/5. szint)?
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
