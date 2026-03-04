import { ELDRITCH_INVOCATIONS, ELDRITCH_INVOCATION_COUNT } from '../../../data/dndConstants'

interface Props {
  selected: string[]
  onChange: (invocations: string[]) => void
}

export function StepEldritchInvocations({ selected, onChange }: Props) {
  function toggle(key: string) {
    if (selected.includes(key)) {
      onChange(selected.filter(s => s !== key))
    } else if (selected.length < ELDRITCH_INVOCATION_COUNT) {
      onChange([...selected, key])
    }
  }

  return (
    <div>
      <h2 className="heading-l text-accent mb-1">Eldritch Invocations</h2>
      <p className="text-text-muted text-sm mb-1">
        Válassz {ELDRITCH_INVOCATION_COUNT} Eldritch Invocation-t – ezek különleges mágikus képességeket adnak a patronodtól kapott tudás révén.
      </p>
      <p className="body-s text-text-subtle mb-6">
        Kiválasztva: {selected.length}/{ELDRITCH_INVOCATION_COUNT}
      </p>

      <div className="grid grid-cols-1 gap-3">
        {ELDRITCH_INVOCATIONS.map(inv => {
          const isChosen = selected.includes(inv.key)
          const isDisabled = !isChosen && selected.length >= ELDRITCH_INVOCATION_COUNT

          return (
            <button
              key={inv.key}
              onClick={() => toggle(inv.key)}
              disabled={isDisabled}
              className={`
                text-left px-4 py-4 rounded-btn border-2 transition-colors
                ${isChosen
                  ? 'border-accent bg-accent/10'
                  : isDisabled
                    ? 'border-border-subtle bg-surface-overlay opacity-40 cursor-not-allowed'
                    : 'border-border bg-surface-raised hover:border-border-hover'}
              `}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-bold text-white">{inv.name}</p>
                  <p className="text-text-muted text-sm mt-1">{inv.description}</p>
                </div>
                {isChosen && (
                  <span className="text-accent text-sm font-bold shrink-0 mt-1">✓</span>
                )}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
