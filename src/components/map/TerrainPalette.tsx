import type { TerrainType } from '../../types/app/map'

const TERRAINS: { type: TerrainType; label: string; color: string }[] = [
  { type: 'floor',     label: 'Padló',   color: 'bg-gray-700' },
  { type: 'wall',      label: 'Fal',     color: 'bg-gray-950' },
  { type: 'difficult', label: 'Nehéz',   color: 'bg-amber-900' },
  { type: 'water',     label: 'Víz',     color: 'bg-blue-800' },
  { type: 'special',   label: 'Spec.',   color: 'bg-purple-800' },
]

interface TerrainPaletteProps {
  selected: TerrainType
  onSelect: (t: TerrainType) => void
}

export function TerrainPalette({ selected, onSelect }: TerrainPaletteProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {TERRAINS.map(({ type, label, color }) => (
        <button
          key={type}
          onClick={() => onSelect(type)}
          className={`
            flex items-center gap-1.5 px-3 py-1.5 rounded-input text-sm font-medium
            border transition-all
            ${selected === type
              ? 'border-accent ring-1 ring-accent text-white'
              : 'border-border text-text-muted hover:border-border-hover hover:text-white'
            }
          `}
        >
          <span className={`w-3.5 h-3.5 rounded-sm border border-border ${color}`} />
          {label}
        </button>
      ))}
    </div>
  )
}
