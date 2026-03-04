import { TIEFLING_LEGACIES } from '../../../data/dndConstants'
import type { Ability } from '../../../data/dndConstants'

interface Props {
  selectedSize: string | null
  selectedLegacy: string | null
  selectedAbility: Ability | null
  onSizeChange: (size: string) => void
  onLegacyChange: (key: string) => void
  onAbilityChange: (ability: Ability) => void
}

const SIZES = ['Medium', 'Small']
const SPELLCASTING_ABILITIES: Ability[] = ['INT', 'WIS', 'CHA']

const RESISTANCE_COLORS: Record<string, string> = {
  Poison:   'text-lime-400',
  Necrotic: 'text-purple-400',
  Fire:     'text-red-400',
}

export function StepTieflingLegacy({ selectedSize, selectedLegacy, selectedAbility, onSizeChange, onLegacyChange, onAbilityChange }: Props) {
  return (
    <div>
      <h2 className="heading-l text-accent mb-1">Tiefling Örökség</h2>

      {/* Méret */}
      <p className="subheading-m text-text-secondary mb-1 mt-4">Méret</p>
      <div className="flex gap-3 mb-5">
        {SIZES.map(size => (
          <button
            key={size}
            onClick={() => onSizeChange(size)}
            className={`flex-1 py-3 rounded-btn border-2 font-bold transition-colors ${
              selectedSize === size
                ? 'border-accent bg-accent/10 text-accent'
                : 'border-border bg-surface-raised text-text-secondary hover:border-border-hover'
            }`}
          >
            {size}
          </button>
        ))}
      </div>

      {/* Fiendish Legacy */}
      <p className="subheading-m text-text-secondary mb-1">Fiendish Legacy</p>
      <p className="text-text-muted text-xs mb-3">
        Válaszd ki tiefling örökséged. Ez adja az ellenállásod és varázslataidat.
      </p>
      <div className="grid grid-cols-1 gap-3 mb-5">
        {TIEFLING_LEGACIES.map(legacy => {
          const isSelected = selectedLegacy === legacy.key
          const colorClass = RESISTANCE_COLORS[legacy.resistance] ?? 'text-text-secondary'
          return (
            <button
              key={legacy.key}
              onClick={() => onLegacyChange(legacy.key)}
              className={`
                text-left p-4 rounded-btn border-2 transition-colors
                ${isSelected
                  ? 'border-accent bg-accent/10'
                  : 'border-border bg-surface-raised hover:border-border-hover'}
              `}
            >
              <div className="flex items-start justify-between gap-2">
                <span className="label-l text-white">{legacy.name}</span>
                {isSelected && <span className="text-accent text-xs font-bold shrink-0">✓</span>}
              </div>
              <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-0.5">
                <span className={`text-xs font-semibold ${colorClass}`}>{legacy.resistance} rezisztencia</span>
                <span className="text-violet-300 text-xs">Cantrip: {legacy.cantrip}</span>
              </div>
              {isSelected && (
                <div className="mt-2 text-xs text-text-muted space-y-0.5">
                  <p>3. szint: {legacy.level3Spell} (1/nap)</p>
                  <p>5. szint: {legacy.level5Spell} (1/nap)</p>
                </div>
              )}
            </button>
          )
        })}
      </div>

      {/* Spellcasting Ability – csak ha legacy kiválasztva */}
      {selectedLegacy && (
        <div>
          <p className="subheading-m text-text-secondary mb-1">Spellcasting Ability</p>
          <p className="text-text-subtle text-xs mb-3">
            Melyik képességet használja a Fiendish Legacy varázslataid?
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
