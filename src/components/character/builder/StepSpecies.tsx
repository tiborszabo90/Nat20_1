import type { Species } from '../../../types/dnd/species'

interface Props {
  species: Species[]
  selectedKey: string | null
  onSelect: (key: string) => void
}

export function StepSpecies({ species, selectedKey, onSelect }: Props) {
  return (
    <div>
      <h2 className="heading-l text-accent mb-1">Válassz Fajt</h2>
      <p className="body-m text-text-muted mb-6">D&D 2024 fajok</p>

      <div className="grid grid-cols-1 gap-3 max-h-[60vh] overflow-y-auto pr-1">
        {species.map(s => (
          <button
            key={s.key}
            onClick={() => onSelect(s.key)}
            className={`
              text-left p-4 rounded-btn border-2 transition-colors
              ${selectedKey === s.key
                ? 'border-accent bg-accent/10'
                : 'border-border bg-surface-raised hover:border-border-hover'}
            `}
          >
            <div className="flex items-start justify-between gap-2">
              <span className="label-l text-white">{s.name}</span>
              {selectedKey === s.key && (
                <span className="text-accent text-xs font-bold shrink-0">✓ Kiválasztva</span>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
