import { ORIGIN_FEAT_KEYS } from '../../../data/dndConstants'
import { FEATS_BY_KEY } from '../../../data/featsData'

interface Props {
  selectedSize: string | null
  selectedFeat: string | null
  onSizeChange: (size: string) => void
  onFeatChange: (key: string) => void
}

const SIZES = ['Medium', 'Small']

export function StepHumanTraits({ selectedSize, selectedFeat, onSizeChange, onFeatChange }: Props) {
  return (
    <div>
      <h2 className="heading-l text-accent mb-1">Emberi Tulajdonságok</h2>
      <p className="text-text-muted text-sm mb-5">
        Az emberek sokoldalúak: választhatnak méretet, és a Versatile feature révén egy extra Origin Featet kapnak.
        A Skillful (+1 skill) a Skill lépésnél választható.
      </p>

      {/* Méret */}
      <p className="subheading-m text-text-secondary mb-1">Méret</p>
      <div className="flex gap-3 mb-6">
        {SIZES.map(size => (
          <button
            key={size}
            onClick={() => onSizeChange(size)}
            className={`flex-1 py-3 rounded-btn border-2 font-bold transition-colors ${
              selectedSize === size
                ? 'border-accent bg-accent/10 text-accent'
                : 'border-border bg-surface-raised text-text-secondary hover:border-border-hover'
            }`}
          >
            {size}
          </button>
        ))}
      </div>

      {/* Versatile – Origin Feat */}
      <p className="subheading-m text-text-secondary mb-1">Versatile – Origin Feat</p>
      <p className="text-text-muted text-xs mb-4">
        Válassz 1 Origin Featet. Ez a háttered Origin Featjétől független extra feat.
      </p>
      <div className="grid grid-cols-1 gap-2 max-h-[45vh] overflow-y-auto pr-1">
        {ORIGIN_FEAT_KEYS.map(key => {
          const feat = FEATS_BY_KEY[key]
          if (!feat) return null
          const isSelected = selectedFeat === key
          return (
            <button
              key={key}
              onClick={() => onFeatChange(key)}
              className={`
                text-left px-4 py-3 rounded-btn border-2 transition-colors
                ${isSelected
                  ? 'border-accent bg-accent/10'
                  : 'border-border bg-surface-raised hover:border-border-hover'}
              `}
            >
              <div className="flex items-center justify-between">
                <span className="label-l text-white">{feat.name}</span>
                {isSelected && <span className="text-accent text-xs font-bold">✓</span>}
              </div>
              {isSelected && (
                <p className="text-text-muted text-xs mt-1.5 line-clamp-3">{feat.description}</p>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
