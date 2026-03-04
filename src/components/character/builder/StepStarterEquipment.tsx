import { CLASS_STARTER_EQUIPMENT, BACKGROUND_STARTER_EQUIPMENT } from '../../../data/dndConstants'

interface Props {
  classKey: string | null
  backgroundKey: string | null
  classAsGold: boolean
  onClassAsGoldChange: (v: boolean) => void
  backgroundAsGold: boolean
  onBackgroundAsGoldChange: (v: boolean) => void
}

export function StepStarterEquipment({
  classKey, backgroundKey,
  classAsGold, onClassAsGoldChange,
  backgroundAsGold, onBackgroundAsGoldChange,
}: Props) {
  const classEq = classKey ? CLASS_STARTER_EQUIPMENT[classKey] : undefined
  const bgEq    = backgroundKey ? BACKGROUND_STARTER_EQUIPMENT[backgroundKey] : undefined

  // Minden tárgy (fix + összes választási opció) egy listában
  const allClassItems = classEq
    ? [
        ...classEq.fixed,
        ...classEq.choices.flatMap(c => c.options.map(o => o.label)),
      ]
    : []

  return (
    <div>
      <h2 className="heading-l text-accent mb-1">Felszerelés</h2>
      <p className="body-m text-text-muted mb-6">
        Mindkét forrásból (kaszt és háttér) elveheted a felszerelést, vagy átválthatod aranyra.
      </p>

      {/* Kaszt felszerelés */}
      {classEq && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <p className="subheading-m text-text-secondary">Kaszt felszerelés</p>
            <div className="flex gap-1 bg-surface-raised rounded-input p-1">
              <button
                onClick={() => onClassAsGoldChange(false)}
                className={`px-3 py-1 rounded-md label-m transition-colors ${
                  !classAsGold ? 'bg-accent text-gray-950' : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                Felszerelés
              </button>
              <button
                onClick={() => onClassAsGoldChange(true)}
                className={`px-3 py-1 rounded-md label-m transition-colors ${
                  classAsGold ? 'bg-accent text-gray-950' : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                {classEq.gold} GP
              </button>
            </div>
          </div>

          {classAsGold ? (
            <div className="p-4 bg-yellow-900/20 border border-yellow-700/40 rounded-xl">
              <p className="heading-s text-yellow-300">{classEq.gold} Arany</p>
              <p className="text-text-muted text-xs mt-0.5">Felszerelés helyett aranyat kapsz, amivel magad vásárolhatsz felszerelést.</p>
            </div>
          ) : (
            <div className="p-4 bg-surface-raised/60 border border-border rounded-xl">
              <ul className="flex flex-col gap-1">
                {allClassItems.map((item, i) => (
                  <li key={i} className="flex items-center gap-2 text-white text-sm">
                    <span className="text-accent text-xs">✦</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Háttér felszerelés */}
      {bgEq && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="subheading-m text-text-secondary">Háttér felszerelés</p>
            <div className="flex gap-1 bg-surface-raised rounded-input p-1">
              <button
                onClick={() => onBackgroundAsGoldChange(false)}
                className={`px-3 py-1 rounded-md label-m transition-colors ${
                  !backgroundAsGold ? 'bg-accent text-gray-950' : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                Felszerelés
              </button>
              <button
                onClick={() => onBackgroundAsGoldChange(true)}
                className={`px-3 py-1 rounded-md label-m transition-colors ${
                  backgroundAsGold ? 'bg-accent text-gray-950' : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                {bgEq.gold} GP
              </button>
            </div>
          </div>

          {backgroundAsGold ? (
            <div className="p-4 bg-yellow-900/20 border border-yellow-700/40 rounded-xl">
              <p className="heading-s text-yellow-300">{bgEq.gold} Arany</p>
              <p className="text-text-muted text-xs mt-0.5">Felszerelés helyett aranyat kapsz, amivel magad vásárolhatsz felszerelést.</p>
            </div>
          ) : (
            <div className="p-4 bg-surface-raised/60 border border-border rounded-xl">
              <ul className="flex flex-col gap-1">
                {bgEq.fixed.map((item, i) => (
                  <li key={i} className="flex items-center gap-2 text-white text-sm">
                    <span className="text-accent text-xs">✦</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
