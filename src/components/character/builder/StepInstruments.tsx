import { MUSICAL_INSTRUMENTS, CLASS_INSTRUMENT_PROFICIENCIES } from '../../../data/dndConstants'

interface Props {
  classKey: string | null
  selected: string[]
  onChange: (instruments: string[]) => void
}

export function StepInstruments({ classKey, selected, onChange }: Props) {
  const def = classKey ? CLASS_INSTRUMENT_PROFICIENCIES[classKey] : undefined
  const count = def?.count ?? 0

  function toggle(instrument: string) {
    if (selected.includes(instrument)) {
      onChange(selected.filter(i => i !== instrument))
    } else if (selected.length < count) {
      onChange([...selected, instrument])
    }
  }

  if (!def) return null

  return (
    <div>
      <h2 className="heading-l text-accent mb-1">Hangszer Jártasságok</h2>
      <p className="text-text-muted text-sm mb-1">
        Válassz <span className="text-white font-semibold">{count}</span> hangszert, amellyel jártasságot kapsz.
      </p>
      <p className="body-s text-text-subtle mb-6">
        Kiválasztva: {selected.length}/{count}
      </p>

      <div className="grid grid-cols-1 gap-2">
        {MUSICAL_INSTRUMENTS.map(instrument => {
          const isChosen = selected.includes(instrument)
          const isDisabled = !isChosen && selected.length >= count

          return (
            <button
              key={instrument}
              onClick={() => toggle(instrument)}
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
                <span className="label-l text-white">{instrument}</span>
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
