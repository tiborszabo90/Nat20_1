import type { Character } from '../../../types/dnd/character'
import { SKILLS, getAbilityModifier, getProficiencyBonus } from '../../../data/dndConstants'
import type { Ability } from '../../../data/dndConstants'
import { Card } from '../../ui'

interface Props {
  character: Character
}

export function ExplorationView({ character }: Props) {
  const pb = getProficiencyBonus(character.level)
  const wisMod = getAbilityModifier(character.abilityScores.WIS)

  const passivePerception = 10 + wisMod +
    (character.skillProficiencies.includes('perception') ? pb : 0) +
    ((character.expertiseSkills ?? []).includes('perception') ? pb : 0)

  function skillBonus(skillKey: string, ab: Ability): number {
    const isExpert = (character.expertiseSkills ?? []).includes(skillKey)
    const isProficient = character.skillProficiencies.includes(skillKey)
    return getAbilityModifier(character.abilityScores[ab]) + (isExpert ? 2 * pb : isProficient ? pb : 0)
  }

  return (
    <div className="p-4 space-y-4">
      {/* Passive Perception */}
      <Card>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-text-muted text-xs">Passzív Észlelés</p>
            <p className="text-white text-sm mt-0.5">Perception (WIS)</p>
          </div>
          <span className="text-3xl font-black text-accent">{passivePerception}</span>
        </div>
      </Card>

      {/* Mozgás */}
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-surface-raised rounded-btn p-3 text-center">
          <p className="text-text-muted text-xs">Mozgás</p>
          <p className="text-white font-bold">30 ft</p>
        </div>
        <div className="bg-surface-raised rounded-btn p-3 text-center">
          <p className="text-text-muted text-xs">Proficiency Bonus</p>
          <p className="text-accent font-bold">+{pb}</p>
        </div>
      </div>

      {/* Skill lista */}
      <Card title="Képzettségek">
        <div className="space-y-1.5">
          {SKILLS.map(skill => {
            const isExpert = (character.expertiseSkills ?? []).includes(skill.key)
            const isProficient = character.skillProficiencies.includes(skill.key)
            const total = skillBonus(skill.key, skill.ability)
            return (
              <div key={skill.key} className="flex items-center gap-3">
                <span className={`w-2 h-2 rounded-badge shrink-0 ${
                  isExpert ? 'bg-yellow-300 ring-1 ring-yellow-200' :
                  isProficient ? 'bg-accent' : 'bg-text-disabled'
                }`} />
                <span className="text-text-secondary text-sm flex-1">
                  {skill.name}{isExpert ? ' ★' : ''}
                </span>
                <span className="text-text-subtle text-xs">{skill.ability}</span>
                <span className={`text-sm font-bold w-8 text-right ${
                  isExpert ? 'text-yellow-300' : isProficient ? 'text-accent' : 'text-text-muted'
                }`}>
                  {total >= 0 ? `+${total}` : total}
                </span>
              </div>
            )
          })}
        </div>
        {(character.expertiseSkills ?? []).length > 0 && (
          <p className="text-text-disabled text-xs mt-2">★ = Expertise (2× proficiency bonus)</p>
        )}
      </Card>

      {/* Nyelvek */}
      {(character.languages ?? []).length > 0 && (
        <Card title="Nyelvek">
          <div className="flex flex-wrap gap-2">
            {character.languages.map(lang => (
              <span key={lang} className="text-sm bg-neutral text-text-secondary px-3 py-1 rounded-badge">{lang}</span>
            ))}
          </div>
        </Card>
      )}

      {/* Felszerelés */}
      {(character.starterEquipment ?? []).length > 0 && (
        <Card title="Felszerelés">
          <ul className="space-y-1.5">
            {character.starterEquipment.map((item, i) => (
              <li key={i} className="flex items-center gap-2 text-white text-sm">
                <span className="text-accent text-xs shrink-0">✦</span>
                {item}
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  )
}
