import type { Background } from '../../../types/dnd/background'
import { BACKGROUND_ORIGIN_FEAT, BACKGROUND_ABILITY_OPTIONS } from '../../../data/dndConstants'
import { FEATS_BY_KEY } from '../../../data/featsData'

interface Props {
  backgrounds: Background[]
  selectedKey: string | null
  onSelect: (key: string) => void
}

export function StepBackground({ backgrounds, selectedKey, onSelect }: Props) {
  return (
    <div>
      <h2 className="heading-l text-accent mb-1">Válassz Hátteret</h2>
      <p className="body-m text-text-muted mb-6">D&D 2024 háttérsztori</p>

      <div className="grid grid-cols-2 gap-3">
        {backgrounds.map(bg => {
          const featKey = BACKGROUND_ORIGIN_FEAT[bg.key]
          const feat = featKey ? FEATS_BY_KEY[featKey] : undefined
          const abilityOptions = BACKGROUND_ABILITY_OPTIONS[bg.key] ?? []
          const isSelected = selectedKey === bg.key

          return (
            <button
              key={bg.key}
              onClick={() => onSelect(bg.key)}
              className={`
                relative text-left p-4 rounded-btn border-2 transition-colors flex flex-col gap-2
                ${isSelected
                  ? 'border-accent bg-accent/10'
                  : 'border-border bg-surface-raised hover:border-border-hover'}
              `}
            >
              {isSelected && (
                <span className="absolute top-2 right-2 text-accent text-xs font-bold">✓</span>
              )}
              <span className="label-l text-white">{bg.name}</span>

              {/* Ability bónuszok – informatív */}
              {abilityOptions.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {abilityOptions.map(ab => (
                    <span key={ab} className="bg-blue-900/40 text-blue-300 text-xs px-2 py-0.5 rounded-badge">
                      {ab}
                    </span>
                  ))}
                </div>
              )}

              {feat && (
                <span className="inline-block bg-violet-700/40 text-violet-200 text-xs px-2 py-0.5 rounded-badge">
                  {feat.name}
                </span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
