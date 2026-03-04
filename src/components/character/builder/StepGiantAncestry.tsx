import { GIANT_ANCESTRIES } from '../../../data/dndConstants'

interface Props {
  selected: string | null
  onChange: (key: string) => void
}

export function StepGiantAncestry({ selected, onChange }: Props) {
  return (
    <div>
      <h2 className="heading-l text-accent mb-1">Giant Ancestry</h2>
      <p className="body-m text-text-muted mb-6">
        Válaszd ki, melyik óriás típus vérét örökölted. Ez határozza meg természetfeletti képességedet.
      </p>

      <div className="grid grid-cols-1 gap-2">
        {GIANT_ANCESTRIES.map(ancestry => {
          const isSelected = selected === ancestry.key
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
                <span className="label-l text-white">{ancestry.name}</span>
                {isSelected && <span className="text-accent text-xs font-bold">✓</span>}
              </div>
              <p className="text-text-muted text-xs mt-1">{ancestry.description}</p>
            </button>
          )
        })}
      </div>
    </div>
  )
}
