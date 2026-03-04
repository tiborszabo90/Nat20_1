const SIZES = ['Medium', 'Small']

interface Props {
  selected: string | null
  onChange: (size: string) => void
}

export function StepSpeciesSize({ selected, onChange }: Props) {
  return (
    <div>
      <h2 className="heading-l text-accent mb-1">Méret</h2>
      <p className="body-m text-text-muted mb-6">
        Válaszd meg a karaktered méretét.
      </p>
      <div className="flex gap-3">
        {SIZES.map(size => (
          <button
            key={size}
            onClick={() => onChange(size)}
            className={`flex-1 py-3 rounded-btn border-2 label-l transition-colors ${
              selected === size
                ? 'border-accent bg-accent/10 text-accent'
                : 'border-border bg-surface-raised text-text-secondary hover:border-border-hover'
            }`}
          >
            {size}
          </button>
        ))}
      </div>
    </div>
  )
}
