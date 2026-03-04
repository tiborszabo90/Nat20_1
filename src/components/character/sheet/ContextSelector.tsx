import type { ContextMode } from '../../../types/dnd/character'

interface Props {
  active: ContextMode
  onChange: (mode: ContextMode) => void
}

const TABS: { mode: ContextMode; label: string; icon: string }[] = [
  { mode: 'combat',      label: 'Harc',       icon: '⚔️' },
  { mode: 'exploration', label: 'Felfedezés', icon: '🗺️' },
  { mode: 'social',      label: 'Társasági',  icon: '💬' },
  { mode: 'general',     label: 'Általános',  icon: '📋' },
]

export function ContextSelector({ active, onChange }: Props) {
  return (
    <div className="flex border-b border-border-subtle">
      {TABS.map(tab => (
        <button
          key={tab.mode}
          onClick={() => onChange(tab.mode)}
          className={`flex-1 py-3 label-m transition-colors flex flex-col items-center gap-0.5 ${
            active === tab.mode
              ? 'text-accent border-b-2 border-accent'
              : 'text-text-subtle hover:text-text-secondary'
          }`}
        >
          <span>{tab.icon}</span>
          <span>{tab.label}</span>
        </button>
      ))}
    </div>
  )
}
