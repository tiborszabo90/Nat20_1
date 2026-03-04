import { CLASS_WEAPON_MASTERY } from '../../../data/dndConstants'

interface Props {
  classKey: string | null
  selected: string[]
  onChange: (weapons: string[]) => void
}

export function StepWeaponMastery({ classKey, selected, onChange }: Props) {
  const def = classKey ? CLASS_WEAPON_MASTERY[classKey] : undefined
  const count = def?.count ?? 0
  const available = def?.weapons ?? []

  function toggle(weapon: string) {
    if (selected.includes(weapon)) {
      onChange(selected.filter(w => w !== weapon))
    } else if (selected.length < count) {
      onChange([...selected, weapon])
    }
  }

  if (!def) return null

  return (
    <div>
      <h2 className="heading-l text-accent mb-1">Weapon Mastery</h2>
      <p className="text-text-muted text-sm mb-1">
        Válassz <span className="text-white font-semibold">{count}</span> fegyvert, amellyel Weapon Mastery jártasságot kapsz.
      </p>
      <p className="body-s text-text-subtle mb-6">
        Kiválasztva: {selected.length}/{count}
      </p>

      <div className="grid grid-cols-1 gap-2 max-h-[60vh] overflow-y-auto pr-1">
        {available.map(weapon => {
          const isChosen = selected.includes(weapon)
          const isDisabled = !isChosen && selected.length >= count

          return (
            <button
              key={weapon}
              onClick={() => toggle(weapon)}
              disabled={isDisabled}
              className={`
                text-left px-4 py-3 rounded-btn border-2 transition-colors
                ${isChosen
                  ? 'border-accent bg-accent/10'
                  : isDisabled
                    ? 'border-border-subtle bg-surface-overlay opacity-40 cursor-not-allowed'
                    : 'border-border bg-surface-raised hover:border-border-hover'}
              `}
            >
              <div className="flex items-center justify-between">
                <span className="label-l text-white">{weapon}</span>
                {isChosen && (
                  <span className="text-accent text-xs font-bold">✓</span>
                )}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
