import { CLASS_SKILL_PROFICIENCIES, SKILLS } from '../../../data/dndConstants'

interface Props {
  classKey: string | null
  selected: string[]
  onChange: (skills: string[]) => void
  // Háttér által automatikusan adott, zárolt skill jártasságok
  backgroundSkills?: string[]
  // Faji bónusz skill szekció (Elf Keen Senses, Human Skillful stb.)
  bonusSkillTitle?: string
  bonusSkillDescription?: string
  bonusSkillOptions?: string[]
  bonusSkillSelected?: string | null
  onBonusSkillChange?: (skill: string) => void
}

export function StepSkillProficiencies({ classKey, selected, onChange, backgroundSkills = [], bonusSkillTitle, bonusSkillDescription, bonusSkillOptions, bonusSkillSelected, onBonusSkillChange }: Props) {
  const def = classKey ? CLASS_SKILL_PROFICIENCIES[classKey] : undefined
  const count = def?.count ?? 0
  // Ha skills üres (Bard) → az összes skill elérhető; háttér által adott skilleket kizárjuk
  const available = (def && def.skills.length > 0
    ? SKILLS.filter(s => def.skills.includes(s.key))
    : SKILLS
  ).filter(s => !backgroundSkills.includes(s.key))

  function toggle(key: string) {
    if (selected.includes(key)) {
      onChange(selected.filter(k => k !== key))
    } else if (selected.length < count) {
      onChange([...selected, key])
    }
  }

  if (!def) {
    return (
      <div>
        <h2 className="heading-l text-accent mb-1">Skill Jártasságok</h2>
        <p className="text-text-muted text-sm">Először válassz kasztot.</p>
      </div>
    )
  }

  return (
    <div>
      <h2 className="heading-l text-accent mb-1">Skill Jártasságok</h2>

      {/* Faji bónusz skill szekció (Elf Keen Senses, Human Skillful stb.) */}
      {bonusSkillOptions && bonusSkillOptions.length > 0 && onBonusSkillChange && (
        <div className="mb-5 p-4 bg-emerald-900/20 border border-emerald-700/40 rounded-xl">
          <p className="subheading-m text-emerald-300 mb-1">{bonusSkillTitle ?? 'Bonus Skill'}</p>
          <p className="text-text-muted text-xs mb-3">{bonusSkillDescription ?? '1 extra skill jártasság.'}</p>
          <div className="flex flex-col gap-2">
            {bonusSkillOptions.map(key => {
              const skill = SKILLS.find(s => s.key === key)
              if (!skill) return null
              const isChosen = bonusSkillSelected === key
              return (
                <button
                  key={key}
                  onClick={() => onBonusSkillChange(key)}
                  className={`text-left px-4 py-3 rounded-btn border-2 transition-colors ${
                    isChosen
                      ? 'border-emerald-500 bg-emerald-500/10'
                      : 'border-gray-700 bg-gray-800 hover:border-emerald-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="label-l text-white">{skill.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-text-subtle text-xs">{skill.ability}</span>
                      {isChosen && <span className="text-emerald-400 text-xs font-bold">✓</span>}
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Háttér által adott, zárolt skill jártasságok */}
      {backgroundSkills.length > 0 && (
        <div className="mb-5 p-4 bg-amber-900/20 border border-amber-700/40 rounded-xl">
          <p className="subheading-m text-amber-300 mb-1">Háttér jártasságai</p>
          <p className="text-text-muted text-xs mb-3">Ezeket a háttéred automatikusan adja – nem módosíthatók.</p>
          <div className="flex flex-col gap-2">
            {backgroundSkills.map(key => {
              const skill = SKILLS.find(s => s.key === key)
              if (!skill) return null
              return (
                <div
                  key={key}
                  className="text-left px-4 py-3 rounded-btn border-2 border-amber-600/50 bg-amber-500/10 opacity-80 cursor-not-allowed"
                >
                  <div className="flex items-center justify-between">
                    <span className="label-l text-white">{skill.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-text-subtle text-xs">{skill.ability}</span>
                      <span className="text-amber-400 text-xs font-bold">✓</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      <p className="text-text-muted text-sm mb-1">
        Válassz <span className="text-white font-semibold">{count}</span> skill jártasságot az alábbiak közül.
      </p>
      <p className="body-s text-text-subtle mb-6">
        Kiválasztva: {selected.length}/{count}
      </p>

      <div className="grid grid-cols-1 gap-2">
        {available.map(skill => {
          const isChosen = selected.includes(skill.key)
          const isDisabled = !isChosen && selected.length >= count

          return (
            <button
              key={skill.key}
              onClick={() => toggle(skill.key)}
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
                <span className="label-l text-white">{skill.name}</span>
                <div className="flex items-center gap-2">
                  <span className="text-text-subtle text-xs">{skill.ability}</span>
                  {isChosen && (
                    <span className="text-accent text-xs font-bold">✓</span>
                  )}
                </div>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
