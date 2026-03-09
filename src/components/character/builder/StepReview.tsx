import {
  ABILITIES,
  SKILLS,
  CLASS_SAVING_THROWS,
  BACKGROUND_ORIGIN_FEAT,
  DIVINE_ORDERS,
  PRIMAL_ORDERS,
  ELDRITCH_INVOCATIONS,
  DRAGONBORN_ANCESTRIES,
  ELVEN_LINEAGES,
  GNOMISH_LINEAGES,
  GIANT_ANCESTRIES,
  TIEFLING_LEGACIES,
  getProficiencyBonus,
  getAbilityModifier,
  getMaxHp,
} from '../../../data/dndConstants'
import { useDndDataStore } from '../../../store/dndDataStore'
import { FEATS_BY_KEY } from '../../../data/featsData'
import type { AbilityScores } from '../../../types/dnd/character'
import type { Species } from '../../../types/dnd/species'
import type { Background } from '../../../types/dnd/background'
import type { DndClass } from '../../../types/dnd/class'
import type { Spell } from '../../../types/dnd/spell'

interface Props {
  name: string
  onNameChange: (name: string) => void
  species: Species | undefined
  background: Background | undefined
  cls: DndClass | undefined
  abilityScores: AbilityScores
  skillProficiencies: string[]
  bonusSkill: string | null
  bonusSkillTitle?: string
  instrumentProficiencies: string[]
  divineOrder: string | null
  primalOrder: string | null
  expertiseSkills: string[]
  eldritchInvocations: string[]
  draconicAncestry: string | null
  elvenLineage: string | null
  elvenSpellcastingAbility: string | null
  gnomishLineage: string | null
  gnomishSpellcastingAbility: string | null
  giantAncestry: string | null
  speciesSize: string | null
  tieflingLegacy: string | null
  tieflingSpellcastingAbility: string | null
  humanVersatileFeat: string | null
  knownCantrips: string[]
  knownSpells: string[]
  spells: Spell[]
  starterEquipment: string[]
  languages: string[]
}

export function StepReview({
  name, onNameChange, species, background, cls, abilityScores, skillProficiencies, bonusSkill, bonusSkillTitle, instrumentProficiencies, divineOrder, primalOrder, expertiseSkills, eldritchInvocations, draconicAncestry, elvenLineage, elvenSpellcastingAbility, gnomishLineage, gnomishSpellcastingAbility, giantAncestry, speciesSize, tieflingLegacy, tieflingSpellcastingAbility, humanVersatileFeat, knownCantrips, knownSpells, spells, starterEquipment, languages,
}: Props) {
  const spellTables = useDndDataStore(s => s.spellTables)
  const level = 1
  const pb = getProficiencyBonus(level)
  const conMod = getAbilityModifier(abilityScores.CON)
  const dexMod = getAbilityModifier(abilityScores.DEX)
  const maxHp = cls ? getMaxHp(cls.key, level, conMod) : 0
  const ac = 10 + dexMod
  const slots: number[] | null = cls ? (spellTables[cls.key]?.[level] ?? null) : null
  const savingThrows = cls ? (CLASS_SAVING_THROWS[cls.key] ?? []) : []
  const originFeatKey = background ? BACKGROUND_ORIGIN_FEAT[background.key] : undefined
  const originFeat = originFeatKey ? FEATS_BY_KEY[originFeatKey] : undefined

  return (
    <div>
      <h2 className="heading-l text-accent mb-1">Összefoglaló</h2>
      <p className="body-m text-text-muted mb-6">Adj nevet a karakterednek és ellenőrizd az adatokat</p>

      {/* Karakter neve */}
      <div className="mb-6">
        <label className="block text-sm text-text-muted mb-1">Karakter neve</label>
        <input
          type="text"
          value={name}
          onChange={e => onNameChange(e.target.value)}
          placeholder="pl. Thalindra Moonwhisper"
          className="w-full bg-surface-raised border border-border rounded-btn px-4 py-3 text-white focus:outline-none focus:border-accent"
        />
      </div>

      {/* Összefoglaló adatok */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <StatBox label="Faj" value={species?.name ?? '—'} />
        <StatBox label="Háttér" value={background?.name ?? '—'} />
        <StatBox label="Kaszt" value={cls?.name ?? '—'} />
        <StatBox label="Szint" value="1" />
        <StatBox label="Max HP" value={String(maxHp)} accent />
        <StatBox label="AC" value={String(ac)} />
        <StatBox label="Proficiency Bonus" value={`+${pb}`} />
        <StatBox label="Initiative" value={dexMod >= 0 ? `+${dexMod}` : String(dexMod)} />
        {originFeat && (
          <div className="col-span-2 bg-surface-raised rounded-btn p-3">
            <p className="text-gray-400 text-xs">Origin Feat</p>
            <p className="font-bold text-violet-300">{originFeat.name}</p>
          </div>
        )}
        {divineOrder && (() => {
          const order = DIVINE_ORDERS.find(o => o.key === divineOrder)
          return order ? (
            <div className="col-span-2 bg-surface-raised rounded-btn p-3">
              <p className="text-text-muted text-xs">Divine Order</p>
              <p className="font-bold text-sky-300">{order.name}</p>
            </div>
          ) : null
        })()}
        {primalOrder && (() => {
          const order = PRIMAL_ORDERS.find(o => o.key === primalOrder)
          return order ? (
            <div className="col-span-2 bg-surface-raised rounded-btn p-3">
              <p className="text-text-muted text-xs">Primal Order</p>
              <p className="font-bold text-green-300">{order.name}</p>
            </div>
          ) : null
        })()}
        {eldritchInvocations.length > 0 && (
          <div className="col-span-2 bg-surface-raised rounded-btn p-3">
            <p className="text-gray-400 text-xs mb-1">Eldritch Invocations</p>
            <div className="flex gap-2 flex-wrap">
              {eldritchInvocations.map(key => {
                const inv = ELDRITCH_INVOCATIONS.find(i => i.key === key)
                return inv ? (
                  <span key={key} className="bg-violet-700/30 text-violet-300 text-xs px-2 py-1 rounded-input font-semibold">
                    {inv.name}
                  </span>
                ) : null
              })}
            </div>
          </div>
        )}
        {draconicAncestry && (() => {
          const anc = DRAGONBORN_ANCESTRIES.find(a => a.key === draconicAncestry)
          return anc ? (
            <div className="col-span-2 bg-surface-raised rounded-btn p-3">
              <p className="text-text-muted text-xs">Draconic Ancestry</p>
              <p className="font-bold text-orange-300">{anc.name} Dragon – {anc.damageType}</p>
              <p className="text-text-subtle text-xs mt-0.5">{anc.breathShape}</p>
            </div>
          ) : null
        })()}
        {elvenLineage && (() => {
          const lineage = ELVEN_LINEAGES.find(l => l.key === elvenLineage)
          return lineage ? (
            <div className="col-span-2 bg-surface-raised rounded-btn p-3">
              <p className="text-text-muted text-xs">Elven Lineage</p>
              <p className="font-bold text-emerald-300">{lineage.name}</p>
              <p className="text-text-subtle text-xs mt-0.5">
                Cantrip: {lineage.cantrip} · Spellcasting: {elvenSpellcastingAbility}
              </p>
            </div>
          ) : null
        })()}
        {gnomishLineage && (() => {
          const lineage = GNOMISH_LINEAGES.find(l => l.key === gnomishLineage)
          return lineage ? (
            <div className="col-span-2 bg-surface-raised rounded-btn p-3">
              <p className="text-text-muted text-xs">Gnomish Lineage</p>
              <p className="font-bold text-emerald-300">{lineage.name}</p>
              <p className="text-text-subtle text-xs mt-0.5">
                Cantrips: {lineage.cantrips.join(', ')}
                {gnomishSpellcastingAbility ? ` · Spellcasting: ${gnomishSpellcastingAbility}` : ''}
              </p>
            </div>
          ) : null
        })()}
        {giantAncestry && (() => {
          const ancestry = GIANT_ANCESTRIES.find(a => a.key === giantAncestry)
          return ancestry ? (
            <div className="col-span-2 bg-surface-raised rounded-btn p-3">
              <p className="text-text-muted text-xs">Giant Ancestry</p>
              <p className="font-bold text-stone-300">{ancestry.name}</p>
              <p className="text-text-subtle text-xs mt-0.5">{ancestry.description}</p>
            </div>
          ) : null
        })()}
        {tieflingLegacy && (() => {
          const legacy = TIEFLING_LEGACIES.find(l => l.key === tieflingLegacy)
          return legacy ? (
            <div className="col-span-2 bg-surface-raised rounded-btn p-3">
              <p className="text-text-muted text-xs">Fiendish Legacy</p>
              <p className="font-bold text-red-300">{legacy.name}</p>
              <p className="text-text-subtle text-xs mt-0.5">
                Resistance: {legacy.resistance} · Spellcasting: {tieflingSpellcastingAbility}
              </p>
            </div>
          ) : null
        })()}
        {humanVersatileFeat && (() => {
          const feat = FEATS_BY_KEY[humanVersatileFeat]
          return feat ? (
            <div className="col-span-2 bg-surface-raised rounded-btn p-3">
              <p className="text-text-muted text-xs">Versatile – Origin Feat</p>
              <p className="font-bold text-violet-300">{feat.name}</p>
            </div>
          ) : null
        })()}
        {speciesSize && (
          <div className="col-span-2 bg-surface-raised rounded-btn p-3">
            <p className="text-gray-400 text-xs">Méret</p>
            <p className="font-bold text-white">{speciesSize}</p>
          </div>
        )}
      </div>

      {/* Képességpontok */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        {ABILITIES.map(ab => (
          <div key={ab} className="bg-surface-raised rounded-btn p-3 text-center">
            <p className="text-text-muted text-xs">{ab}</p>
            <p className="text-white font-bold text-lg">{abilityScores[ab]}</p>
            <p className="text-text-muted text-xs">
              {getAbilityModifier(abilityScores[ab]) >= 0
                ? `+${getAbilityModifier(abilityScores[ab])}`
                : getAbilityModifier(abilityScores[ab])}
            </p>
          </div>
        ))}
      </div>

      {/* Mentődobások */}
      <div className="mb-4">
        <p className="text-text-muted text-xs mb-1">Mentődobás jártasságok</p>
        <div className="flex gap-2 flex-wrap">
          {savingThrows.map(ab => (
            <span key={ab} className="bg-accent/20 text-amber-300 text-xs px-2 py-1 rounded-input">{ab}</span>
          ))}
        </div>
      </div>

      {/* Spell Slotok (ha varázsló) */}
      {slots && slots.some(s => s > 0) && (
        <div className="mb-4">
          <p className="text-text-muted text-xs mb-1">Spell Slotok (1. szint)</p>
          <div className="flex gap-2 flex-wrap">
            {slots.map((count, idx) =>
              count > 0 ? (
                <span key={idx} className="bg-violet-700/30 text-violet-300 text-xs px-2 py-1 rounded-input">
                  {idx + 1}. szint: {count}×
                </span>
              ) : null
            )}
          </div>
        </div>
      )}

      {/* Nyelvek */}
      {languages.length > 0 && (
        <div className="mb-4">
          <p className="text-text-muted text-xs mb-1">Ismert nyelvek</p>
          <div className="flex gap-2 flex-wrap">
            {languages.map(lang => (
              <span key={lang} className="bg-blue-700/30 text-blue-300 text-xs px-2 py-1 rounded-input">
                {lang}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Skill jártasságok */}
      {(skillProficiencies.length > 0 || bonusSkill) && (
        <div className="mb-4">
          <p className="text-text-muted text-xs mb-1">Skill jártasságok</p>
          <div className="flex gap-2 flex-wrap">
            {bonusSkill && (() => {
              const skill = SKILLS.find(s => s.key === bonusSkill)
              return skill ? (
                <span key={bonusSkill} className="bg-emerald-700/30 text-emerald-300 text-xs px-2 py-1 rounded-input font-semibold">
                  {skill.name} ({bonusSkillTitle ?? 'Bonus'})
                </span>
              ) : null
            })()}
            {skillProficiencies.map(sk => {
              const skill = SKILLS.find(s => s.key === sk)
              const hasExpertise = expertiseSkills.includes(sk)
              return skill ? (
                <span
                  key={sk}
                  className={`text-xs px-2 py-1 rounded-input ${hasExpertise ? 'bg-accent/20 text-amber-300 font-semibold' : 'bg-neutral text-text-secondary'}`}
                >
                  {skill.name}{hasExpertise ? ' ★' : ''}
                </span>
              ) : null
            })}
          </div>
          {expertiseSkills.length > 0 && (
            <p className="text-accent text-xs mt-1">★ Expertise (dupla Proficiency Bonus)</p>
          )}
        </div>
      )}

      {/* Hangszer jártasságok */}
      {instrumentProficiencies.length > 0 && (
        <div className="mb-4">
          <p className="text-text-muted text-xs mb-1">Hangszer jártasságok</p>
          <div className="flex gap-2 flex-wrap">
            {instrumentProficiencies.map(inst => (
              <span key={inst} className="bg-neutral text-text-secondary text-xs px-2 py-1 rounded-input">
                {inst}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Cantripek */}
      {knownCantrips.length > 0 && (
        <div className="mb-4">
          <p className="text-text-muted text-xs mb-1">Cantripek</p>
          <div className="flex gap-2 flex-wrap">
            {knownCantrips.map(key => {
              const spell = spells.find(s => s.key === key)
              return (
                <span key={key} className="bg-violet-700/30 text-violet-300 text-xs px-2 py-1 rounded-input">
                  {spell?.name ?? key}
                </span>
              )
            })}
          </div>
        </div>
      )}

      {/* Varázsatok */}
      {knownSpells.length > 0 && (
        <div className="mb-4">
          <p className="text-text-muted text-xs mb-1">Varázsatok (1. szint)</p>
          <div className="flex gap-2 flex-wrap">
            {knownSpells.map(key => {
              const spell = spells.find(s => s.key === key)
              return (
                <span key={key} className="bg-blue-700/30 text-blue-300 text-xs px-2 py-1 rounded-input">
                  {spell?.name ?? key}
                </span>
              )
            })}
          </div>
        </div>
      )}

      {/* Felszerelés */}
      {starterEquipment.length > 0 && (
        <div className="mb-6">
          <p className="text-text-muted text-xs mb-1">Felszerelés</p>
          <ul className="flex flex-col gap-1">
            {starterEquipment.map((item, i) => (
              <li key={i} className="flex items-center gap-2 text-sm text-white">
                <span className="text-accent text-xs">✦</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}

    </div>
  )
}

function StatBox({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="bg-surface-raised rounded-btn p-3">
      <p className="text-text-muted text-xs">{label}</p>
      <p className={`font-bold ${accent ? 'text-accent' : 'text-white'}`}>{value}</p>
    </div>
  )
}
