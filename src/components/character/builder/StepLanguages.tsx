import { STANDARD_LANGUAGES } from '../../../data/dndConstants'

interface Props {
  selected: string[]
  onChange: (languages: string[]) => void
  autoLanguages?: string[]
  extraCount?: number
}

export function StepLanguages({ selected, onChange, autoLanguages = [], extraCount = 2 }: Props) {
  const autoSet = new Set(autoLanguages)
  const extraSelected = selected.filter(l => l !== 'Common' && !autoSet.has(l))

  function toggle(lang: string) {
    if (lang === 'Common' || autoSet.has(lang)) return
    if (extraSelected.includes(lang)) {
      onChange(['Common', ...extraSelected.filter(l => l !== lang)])
    } else if (extraSelected.length < extraCount) {
      onChange(['Common', ...extraSelected, lang])
    }
  }

  return (
    <div>
      <h2 className="heading-l text-accent mb-1">Válassz Nyelveket</h2>
      <p className="text-text-muted text-sm mb-1">
        Karaktered ismeri a Közös nyelvet{autoLanguages.length > 0 ? `, automatikusan a ${autoLanguages.join(', ')}-t` : ''}, és választhatsz még {extraCount} további nyelvet.
      </p>
      <p className="body-s text-text-subtle mb-6">
        Kiválasztva: {extraSelected.length}/{extraCount}
      </p>

      <div className="grid grid-cols-1 gap-2">
        {STANDARD_LANGUAGES.map(lang => {
          const isCommon = lang === 'Common'
          const isAuto = autoSet.has(lang)
          const isChosen = extraSelected.includes(lang)
          const isDisabled = !isCommon && !isAuto && !isChosen && extraSelected.length >= extraCount

          return (
            <button
              key={lang}
              onClick={() => toggle(lang)}
              disabled={isCommon || isAuto || isDisabled}
              className={`
                text-left px-4 py-3 rounded-btn border-2 transition-colors
                ${isCommon || isAuto
                  ? 'border-border-subtle bg-surface-overlay/50 opacity-60 cursor-default'
                  : isChosen
                    ? 'border-accent bg-accent/10'
                    : isDisabled
                      ? 'border-border-subtle bg-surface-overlay opacity-40 cursor-not-allowed'
                      : 'border-border bg-surface-raised hover:border-border-hover'}
              `}
            >
              <div className="flex items-center justify-between">
                <span className="label-l text-white">{lang}</span>
                {(isCommon || isAuto) && (
                  <span className="text-text-subtle text-xs">Automatikus</span>
                )}
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
