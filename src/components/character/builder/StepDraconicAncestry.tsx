import { DRAGONBORN_ANCESTRIES } from '../../../data/dndConstants'

interface Props {
  selected: string | null
  onChange: (key: string) => void
}

const DAMAGE_COLORS: Record<string, string> = {
  Acid:      'text-green-400',
  Lightning: 'text-blue-400',
  Fire:      'text-red-400',
  Poison:    'text-lime-400',
  Cold:      'text-cyan-400',
}

export function StepDraconicAncestry({ selected, onChange }: Props) {
  return (
    <div>
      <h2 className="heading-l text-accent mb-1">Draconic Ancestry</h2>
      <p className="body-m text-text-muted mb-6">
        Válaszd ki sárkányos ősöd típusát. Ez határozza meg lélegzetfegyvered sebzéstípusát és alakját.
      </p>

      <div className="grid grid-cols-1 gap-2">
        {DRAGONBORN_ANCESTRIES.map(ancestry => {
          const isSelected = selected === ancestry.key
          const colorClass = DAMAGE_COLORS[ancestry.damageType] ?? 'text-text-secondary'

          return (
            <button
              key={ancestry.key}
              onClick={() => onChange(ancestry.key)}
              className={`
                text-left px-4 py-3 rounded-btn border-2 transition-colors
                ${isSelected
                  ? 'border-accent bg-accent/10'
                  : 'border-border bg-surface-raised hover:border-border-hover'}
              `}
            >
              <div className="flex items-center justify-between">
                <span className="label-l text-white">{ancestry.name} Dragon</span>
                {isSelected && <span className="text-accent text-xs font-bold">✓</span>}
              </div>
              <div className="flex gap-3 mt-1">
                <span className={`text-xs font-semibold ${colorClass}`}>{ancestry.damageType}</span>
                <span className="text-text-subtle text-xs">{ancestry.breathShape}</span>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
