import { SKILLS } from '../../../data/dndConstants'

interface Props {
  skillProficiencies: string[]
  selected: string[]
  onChange: (expertise: string[]) => void
}

const EXPERTISE_COUNT = 2

export function StepExpertise({ skillProficiencies, selected, onChange }: Props) {
  function toggle(key: string) {
    if (selected.includes(key)) {
      onChange(selected.filter(s => s !== key))
    } else if (selected.length < EXPERTISE_COUNT) {
      onChange([...selected, key])
    }
  }

  const eligibleSkills = SKILLS.filter(s => skillProficiencies.includes(s.key))

  return (
    <div>
      <h2 className="heading-l text-accent mb-1">Expertise</h2>
      <p className="text-text-muted text-sm mb-1">
        Válassz {EXPERTISE_COUNT} skillt, amelyekben Expertise-t kapsz – ezekre a Proficiency Bonus duplázódik.
      </p>
      <p className="body-s text-text-subtle mb-6">
        Kiválasztva: {selected.length}/{EXPERTISE_COUNT}
      </p>

      <div className="grid grid-cols-1 gap-2">
        {eligibleSkills.map(skill => {
          const isChosen = selected.includes(skill.key)
          const isDisabled = !isChosen && selected.length >= EXPERTISE_COUNT

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
                {isChosen && (
                  <span className="text-accent text-xs font-bold">✓ Expertise</span>
                )}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
