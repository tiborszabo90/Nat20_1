import type { Character } from '../../../types/dnd/character'
import { SKILLS, getAbilityModifier, getProficiencyBonus } from '../../../data/dndConstants'
import { Card } from '../../ui'

interface Props {
  character: Character
}

const CHA_SKILLS = ['deception', 'intimidation', 'performance', 'persuasion']
const SECONDARY_SKILLS = ['insight', 'history', 'perception']

export function SocialView({ character }: Props) {
  const pb = getProficiencyBonus(character.level)

  function getSkillMod(skillKey: string): number {
    const skill = SKILLS.find(s => s.key === skillKey)
    if (!skill) return 0
    const isExpert = (character.expertiseSkills ?? []).includes(skillKey)
    const isProficient = character.skillProficiencies.includes(skillKey)
    return getAbilityModifier(character.abilityScores[skill.ability]) +
      (isExpert ? 2 * pb : isProficient ? pb : 0)
  }

  function isExpert(skillKey: string): boolean {
    return (character.expertiseSkills ?? []).includes(skillKey)
  }

  return (
    <div className="p-4 space-y-4">
      {/* Karakter adatok */}
      <Card>
        <p className="text-white font-bold text-lg">{character.name}</p>
        <p className="text-text-muted text-sm">{character.speciesKey} · {character.backgroundKey} · {character.classKey}</p>
      </Card>

      {/* CHA-alapú skillek */}
      <Card title="Társasági Képzettségek (CHA)">
        <div className="grid grid-cols-2 gap-2">
          {CHA_SKILLS.map(key => {
            const skill = SKILLS.find(s => s.key === key)
            const mod = getSkillMod(key)
            const isProficient = character.skillProficiencies.includes(key)
            const expert = isExpert(key)
            return (
              <div key={key} className={`rounded-btn p-3 ${
                expert ? 'bg-yellow-900/20 border border-yellow-600/30' :
                isProficient ? 'bg-accent/10 border border-accent/30' : 'bg-neutral'
              }`}>
                <p className="text-text-muted text-xs">
                  {skill?.name}{expert ? ' ★' : ''}
                </p>
                <p className={`text-2xl font-black ${
                  expert ? 'text-yellow-300' : isProficient ? 'text-accent' : 'text-white'
                }`}>
                  {mod >= 0 ? `+${mod}` : mod}
                </p>
              </div>
            )
          })}
        </div>
      </Card>

      {/* Másodlagos skillek */}
      <Card title="Egyéb hasznos képzettségek">
        <div className="space-y-2">
          {SECONDARY_SKILLS.map(key => {
            const skill = SKILLS.find(s => s.key === key)
            const mod = getSkillMod(key)
            const isProficient = character.skillProficiencies.includes(key)
            const expert = isExpert(key)
            return (
              <div key={key} className="flex items-center gap-3">
                <span className={`w-2 h-2 rounded-badge ${
                  expert ? 'bg-yellow-300 ring-1 ring-yellow-200' :
                  isProficient ? 'bg-accent' : 'bg-text-disabled'
                }`} />
                <span className="text-text-secondary text-sm flex-1">
                  {skill?.name}{expert ? ' ★' : ''}
                </span>
                <span className="text-text-subtle text-xs">{skill?.ability}</span>
                <span className={`text-sm font-bold ${
                  expert ? 'text-yellow-300' : isProficient ? 'text-accent' : 'text-text-muted'
                }`}>
                  {mod >= 0 ? `+${mod}` : mod}
                </span>
              </div>
            )
          })}
        </div>
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
    </div>
  )
}
