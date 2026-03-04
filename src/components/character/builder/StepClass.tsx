import type { DndClass } from '../../../types/dnd/class'
import { CLASS_HIT_DICE, CLASS_SAVING_THROWS } from '../../../data/dndConstants'

interface Props {
  classes: DndClass[]
  selectedKey: string | null
  onSelect: (key: string) => void
}

export function StepClass({ classes, selectedKey, onSelect }: Props) {
  return (
    <div>
      <h2 className="heading-l text-accent mb-1">Válassz Kasztot</h2>
      <p className="body-m text-text-muted mb-6">D&D 2024 SRD kasztok</p>

      <div className="grid grid-cols-2 gap-3">
        {classes.map(cls => {
          const hitDie = CLASS_HIT_DICE[cls.key] ?? cls.hit_points?.hit_dice_name ?? '?'
          const saves = CLASS_SAVING_THROWS[cls.key] ?? []
          const isSelected = selectedKey === cls.key

          return (
            <button
              key={cls.key}
              onClick={() => onSelect(cls.key)}
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
              <span className="label-l text-white">{cls.name}</span>
              <div className="flex flex-col gap-0.5 text-xs text-text-muted">
                <span>Hit Die: <span className="text-text-secondary">{hitDie}</span></span>
                {saves.length > 0 && (
                  <span>Saves: <span className="text-text-secondary">{saves.join(', ')}</span></span>
                )}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
