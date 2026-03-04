import { PRIMAL_ORDERS } from '../../../data/dndConstants'

interface Props {
  selected: string | null
  onChange: (order: string) => void
}

export function StepPrimalOrder({ selected, onChange }: Props) {
  return (
    <div>
      <h2 className="heading-l text-accent mb-1">Primal Order</h2>
      <p className="body-m text-text-muted mb-6">
        Válaszd ki a Druid Primal Order-edet – ez határozza meg, hogy mágikus mesterség vagy harcos ösztönök vezérlik-e a természettel való kapcsolatodat.
      </p>

      <div className="grid grid-cols-1 gap-3">
        {PRIMAL_ORDERS.map(order => {
          const isChosen = selected === order.key

          return (
            <button
              key={order.key}
              onClick={() => onChange(order.key)}
              className={`
                text-left px-4 py-4 rounded-btn border-2 transition-colors
                ${isChosen
                  ? 'border-accent bg-accent/10'
                  : 'border-border bg-surface-raised hover:border-border-hover'}
              `}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="heading-s text-white">{order.name}</p>
                  <p className="text-text-muted text-sm mt-1">{order.description}</p>
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
