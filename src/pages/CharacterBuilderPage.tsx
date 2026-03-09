import { useState, useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useDndDataStore } from '../store/dndDataStore'
import { useCampaignStore } from '../store/campaignStore'
import { useCharacterStore } from '../store/characterStore'
import { useAuthStore } from '../store/authStore'
import { createCharacter, getCharacterByPlayerUid, deleteCharacter } from '../services/firebase/characterService'
import {
  CLASS_SAVING_THROWS,
  CLASS_CASTER_TYPE,
  CLASS_SKILL_PROFICIENCIES,
  CLASS_WEAPON_MASTERY,
  CLASS_INSTRUMENT_PROFICIENCIES,
  CLASS_STARTER_EQUIPMENT,
  BACKGROUND_STARTER_EQUIPMENT,
  CLASS_SPELLCASTING,
  SPELLCASTING_CLASSES,
  BACKGROUND_MAGIC_INITIATE_CLASS,
  MAGIC_INITIATE_BACKGROUNDS,
  SKILLS,
  WEAPON_MASTERY_CLASSES,
  INSTRUMENT_PROFICIENCY_CLASSES,
  DIVINE_ORDER_CLASSES,
  PRIMAL_ORDER_CLASSES,
  EXPERTISE_CLASSES,
  ELDRITCH_INVOCATION_CLASSES,
  ELDRITCH_INVOCATION_COUNT,
  BACKGROUND_ABILITY_OPTIONS,
  BACKGROUND_ORIGIN_FEAT,
  SPECIES_NEEDS_ANCESTRY,
  SPECIES_NEEDS_LINEAGE,
  ELF_KEEN_SENSES_SKILLS,
  SPECIES_NEEDS_GNOMISH_LINEAGE,
  GNOMISH_LINEAGES,
  SPECIES_NEEDS_GIANT_ANCESTRY,
  SPECIES_NEEDS_TIEFLING_LEGACY,
  SPECIES_NEEDS_HUMAN_TRAITS,
  SPECIES_NEEDS_SIZE_ONLY,
  getAbilityModifier,
  getMaxHp,
  getSpellSlots,
} from '../data/dndConstants'
import type { Ability } from '../data/dndConstants'
import type { AbilityScores } from '../types/dnd/character'
import { StepSpecies } from '../components/character/builder/StepSpecies'
import { StepBackground } from '../components/character/builder/StepBackground'
import { StepClass } from '../components/character/builder/StepClass'
import { StepAbilityScores } from '../components/character/builder/StepAbilityScores'
import { StepSkillProficiencies } from '../components/character/builder/StepSkillProficiencies'
import { StepWeaponMastery } from '../components/character/builder/StepWeaponMastery'
import { StepInstruments } from '../components/character/builder/StepInstruments'
import { StepDivineOrder } from '../components/character/builder/StepDivineOrder'
import { StepPrimalOrder } from '../components/character/builder/StepPrimalOrder'
import { StepExpertise } from '../components/character/builder/StepExpertise'
import { StepEldritchInvocations } from '../components/character/builder/StepEldritchInvocations'
import { StepBackgroundAbilities } from '../components/character/builder/StepBackgroundAbilities'
import { StepLanguages } from '../components/character/builder/StepLanguages'
import { StepDraconicAncestry } from '../components/character/builder/StepDraconicAncestry'
import { StepElvenLineage } from '../components/character/builder/StepElvenLineage'
import { StepGnomishLineage } from '../components/character/builder/StepGnomishLineage'
import { StepGiantAncestry } from '../components/character/builder/StepGiantAncestry'
import { StepTieflingLegacy } from '../components/character/builder/StepTieflingLegacy'
import { StepHumanTraits } from '../components/character/builder/StepHumanTraits'
import { StepSpeciesSize } from '../components/character/builder/StepSpeciesSize'
import { StepStarterEquipment } from '../components/character/builder/StepStarterEquipment'
import { StepSpells } from '../components/character/builder/StepSpells'
import { StepReview } from '../components/character/builder/StepReview'

// Faj opcionális lépés neve (null = nincs extra lépés)
function getSpeciesOptStepLabel(sk: string | null): string | null {
  switch (sk) {
    case 'dragonborn': return 'Draconic Ancestry'
    case 'elf':        return 'Elven Lineage'
    case 'gnome':      return 'Gnomish Lineage'
    case 'goliath':    return 'Giant Ancestry'
    case 'human':      return 'Emberi Tulajdonságok'
    case 'tiefling':   return 'Tiefling Örökség'
    case 'aasimar':    return 'Méret'
    default:           return null
  }
}

const DEFAULT_SCORES: AbilityScores = { STR: 10, DEX: 10, CON: 10, INT: 10, WIS: 10, CHA: 10 }

export function CharacterBuilderPage() {
  const { campaignId } = useParams<{ campaignId: string }>()
  const navigate = useNavigate()

  const species    = useDndDataStore(s => s.species)
  const backgrounds = useDndDataStore(s => s.backgrounds)
  const classes    = useDndDataStore(s => s.classes)
  const spellsMap  = useDndDataStore(s => s.spells)
  const spells     = useMemo(() => Array.from(spellsMap.values()), [spellsMap])
  const isDataLoading = useDndDataStore(s => s.isLoading)

  const campaignCode  = useCampaignStore(s => s.campaignCode)
  const setCharacter  = useCharacterStore(s => s.setCharacter)
  // uid és displayName közvetlenül az authStore-ból – megbízható forrás
  const authUid         = useAuthStore(s => s.uid)
  const authDisplayName = useAuthStore(s => s.displayName)

  const [step, setStep] = useState(0)

  // Alapválasztások
  const [speciesKey, setSpeciesKey]       = useState<string | null>(null)
  const [backgroundKey, setBackgroundKey] = useState<string | null>(null)
  const [classKey, setClassKey]           = useState<string | null>(null)

  // Faji extra state-ek
  const [speciesSize, setSpeciesSize]                           = useState<string | null>(null)
  const [draconicAncestry, setDraconicAncestry]                 = useState<string | null>(null)
  const [elvenLineage, setElvenLineage]                         = useState<string | null>(null)
  const [elvenSpellcastingAbility, setElvenSpellcastingAbility] = useState<Ability | null>(null)
  const [gnomishLineage, setGnomishLineage]                     = useState<string | null>(null)
  const [gnomishSpellcastingAbility, setGnomishSpellcastingAbility] = useState<Ability | null>(null)
  const [giantAncestry, setGiantAncestry]                       = useState<string | null>(null)
  const [tieflingLegacy, setTieflingLegacy]                     = useState<string | null>(null)
  const [tieflingSpellcastingAbility, setTieflingSpellcastingAbility] = useState<Ability | null>(null)
  const [humanVersatileFeat, setHumanVersatileFeat]             = useState<string | null>(null)

  // Skill + bónusz skill (Elf Keen Senses / Human Skillful)
  const [skillProficiencies, setSkillProficiencies] = useState<string[]>([])
  const [bonusSkill, setBonusSkill]                 = useState<string | null>(null)

  // Kaszt extra state-ek
  const [weaponMasteries, setWeaponMasteries]           = useState<string[]>([])
  const [instrumentProficiencies, setInstrumentProficiencies] = useState<string[]>([])
  const [divineOrder, setDivineOrder]                   = useState<string | null>(null)
  const [primalOrder, setPrimalOrder]                   = useState<string | null>(null)
  const [expertiseSkills, setExpertiseSkills]           = useState<string[]>([])
  const [eldritchInvocations, setEldritchInvocations]   = useState<string[]>([])

  // Varázsatok (kaszt)
  const [knownCantrips, setKnownCantrips] = useState<string[]>([])
  const [knownSpells, setKnownSpells]     = useState<string[]>([])

  // Magic Initiate (háttér origin feat)
  const [magicInitiateCantrips, setMagicInitiateCantrips] = useState<string[]>([])
  const [magicInitiateSpell, setMagicInitiateSpell]       = useState<string | null>(null)

  // Felszerelés
  const [classEquipmentAsGold, setClassEquipmentAsGold] = useState(false)
  const [bgEquipmentAsGold, setBgEquipmentAsGold]       = useState(false)

  // Közös state-ek
  const [languages, setLanguages]                             = useState<string[]>(['Common'])
  const [backgroundAbilityBonuses, setBackgroundAbilityBonuses] = useState<Partial<AbilityScores>>({})
  const [abilityScores, setAbilityScores]                     = useState<AbilityScores>(DEFAULT_SCORES)
  const [characterName, setCharacterName] = useState('')
  const [isSubmitting, setIsSubmitting]   = useState(false)
  const [error, setError]                 = useState('')

  const selectedSpecies    = species.find(s => s.key === speciesKey)
  const selectedBackground = backgrounds.find(b => b.key === backgroundKey)
  const selectedClass      = classes.find(c => c.key === classKey)

  // --- Faji jelzők ---
  const needsAncestry     = speciesKey ? SPECIES_NEEDS_ANCESTRY.has(speciesKey) : false
  const needsLineage      = speciesKey ? SPECIES_NEEDS_LINEAGE.has(speciesKey) : false
  const needsGnomeLineage = speciesKey ? SPECIES_NEEDS_GNOMISH_LINEAGE.has(speciesKey) : false
  const needsGiantAncestry = speciesKey ? SPECIES_NEEDS_GIANT_ANCESTRY.has(speciesKey) : false
  const needsTieflingLegacy = speciesKey ? SPECIES_NEEDS_TIEFLING_LEGACY.has(speciesKey) : false
  const needsHumanTraits  = speciesKey ? SPECIES_NEEDS_HUMAN_TRAITS.has(speciesKey) : false
  const needsSizeOnly     = speciesKey ? SPECIES_NEEDS_SIZE_ONLY.has(speciesKey) : false

  // Elf Keen Senses VAGY Human Skillful → bónusz skill szekció a Skill lépésben
  const needsBonusSkill = needsLineage || needsHumanTraits
  const bonusSkillOptions = needsLineage
    ? ELF_KEEN_SENSES_SKILLS
    : needsHumanTraits
      ? SKILLS.map(s => s.key)
      : []
  const bonusSkillTitle = needsLineage ? 'Keen Senses' : 'Skillful'
  const bonusSkillDescription = needsLineage
    ? 'Elfi érzékeid 1 skill jártasságot adnak az alábbiak közül.'
    : 'Emberi sokoldalúságod 1 extra skill jártasságot biztosít (bármilyen skill).'

  // Háttér ability opciók
  const backgroundAbilities = backgroundKey ? (BACKGROUND_ABILITY_OPTIONS[backgroundKey] ?? []) : []

  // --- Kaszt jelzők ---
  const hasMagicInitiate = backgroundKey ? MAGIC_INITIATE_BACKGROUNDS.has(backgroundKey) : false
  const magicInitiateClass = backgroundKey ? (BACKGROUND_MAGIC_INITIATE_CLASS[backgroundKey] ?? null) : null
  const needsSpellStep = (classKey ? SPELLCASTING_CLASSES.has(classKey) : false) || hasMagicInitiate
  const needsExpertise          = classKey ? EXPERTISE_CLASSES.has(classKey) : false
  const needsWeaponMastery      = classKey ? WEAPON_MASTERY_CLASSES.has(classKey) : false
  const needsInstruments        = classKey ? INSTRUMENT_PROFICIENCY_CLASSES.has(classKey) : false
  const needsDivineOrder        = classKey ? DIVINE_ORDER_CLASSES.has(classKey) : false
  const needsPrimalOrder        = classKey ? PRIMAL_ORDER_CLASSES.has(classKey) : false
  const needsEldritchInvocation = classKey ? ELDRITCH_INVOCATION_CLASSES.has(classKey) : false
  const thievesCantAuto         = classKey === 'rogue' ? ["Thieves' Cant"] : []
  const languageExtraCount      = 2

  // --- Lépés lista ---
  const speciesOptLabel = getSpeciesOptStepLabel(speciesKey)
  const SPECIES_OPT_STEPS = speciesOptLabel ? [speciesOptLabel] : []
  const SPECIES_OPT_COUNT = SPECIES_OPT_STEPS.length   // 0 vagy 1

  const CLASS_OPT_STEPS: string[] = []
  if (needsExpertise)          CLASS_OPT_STEPS.push('Expertise')
  if (needsWeaponMastery)      CLASS_OPT_STEPS.push('Fegyver Mastery')
  if (needsInstruments)        CLASS_OPT_STEPS.push('Hangszerek')
  if (needsDivineOrder)        CLASS_OPT_STEPS.push('Divine Order')
  if (needsPrimalOrder)        CLASS_OPT_STEPS.push('Primal Order')
  if (needsEldritchInvocation) CLASS_OPT_STEPS.push('Eldritch Invocations')
  const CLASS_OPT_COUNT = CLASS_OPT_STEPS.length

  const SPELL_OPT_COUNT = needsSpellStep ? 1 : 0

  // Sorrend: Kaszt → kaszt al-választások → Faj → faji al-választás → Háttér → Skill → Nyelvek → ...
  const STEPS = [
    'Kaszt',
    ...CLASS_OPT_STEPS,
    'Faj',
    ...SPECIES_OPT_STEPS,
    'Háttér', 'Skill Jártasságok',
    'Nyelvek', 'Képességpontok',
    ...(needsSpellStep ? ['Varázsatok'] : []),
    'Felszerelés', 'Összefoglaló',
  ]

  // --- Step index aliasok ---
  // Kaszt al-választások: közvetlenül step 0 után
  const classOptBase = 1
  const S_EXPERTISE    = needsExpertise     ? classOptBase : -1
  const S_WM           = needsWeaponMastery ? classOptBase + (needsExpertise ? 1 : 0) : -1
  const S_INSTRUMENTS  = needsInstruments   ? classOptBase + (needsExpertise ? 1 : 0) + (needsWeaponMastery ? 1 : 0) : -1
  const S_DIVINE_ORDER = needsDivineOrder   ? classOptBase + (needsExpertise ? 1 : 0) + (needsWeaponMastery ? 1 : 0) + (needsInstruments ? 1 : 0) : -1
  const S_PRIMAL_ORDER        = needsPrimalOrder        ? classOptBase + (needsExpertise ? 1 : 0) + (needsWeaponMastery ? 1 : 0) + (needsInstruments ? 1 : 0) + (needsDivineOrder ? 1 : 0) : -1
  const S_ELDRITCH_INVOCATION = needsEldritchInvocation ? classOptBase + (needsExpertise ? 1 : 0) + (needsWeaponMastery ? 1 : 0) + (needsInstruments ? 1 : 0) + (needsDivineOrder ? 1 : 0) + (needsPrimalOrder ? 1 : 0) : -1
  // Faj és faji al-választás
  const speciesBase   = 1 + CLASS_OPT_COUNT
  const S_SPECIES_OPT = SPECIES_OPT_COUNT > 0 ? speciesBase + 1 : -1
  // Háttér és Skill
  const S_BACKGROUND = speciesBase + 1 + SPECIES_OPT_COUNT
  const S_SKILLS     = speciesBase + 2 + SPECIES_OPT_COUNT
  // Tail lépések
  const tailBase    = speciesBase + 3 + SPECIES_OPT_COUNT
  const S_LANGUAGES = tailBase
  const S_ABILITY   = tailBase + 1
  const S_SPELLS    = needsSpellStep ? tailBase + 2 : -1
  const S_EQUIPMENT = tailBase + 2 + SPELL_OPT_COUNT
  const S_REVIEW    = tailBase + 3 + SPELL_OPT_COUNT

  function canProceed(): boolean {
    if (step === 0) return !!classKey
    if (step === speciesBase) return !!speciesKey

    // Faji opcionális lépés
    if (step === S_SPECIES_OPT) {
      if (needsAncestry)      return !!draconicAncestry
      if (needsLineage)       return !!elvenLineage && !!elvenSpellcastingAbility
      if (needsGnomeLineage) {
        const lin = GNOMISH_LINEAGES.find(l => l.key === gnomishLineage)
        return !!gnomishLineage && (!lin?.needsSpellcastingAbility || !!gnomishSpellcastingAbility)
      }
      if (needsGiantAncestry)   return !!giantAncestry
      if (needsHumanTraits)     return !!speciesSize && !!humanVersatileFeat
      if (needsTieflingLegacy)  return !!speciesSize && !!tieflingLegacy && !!tieflingSpellcastingAbility
      if (needsSizeOnly)        return !!speciesSize
      return true
    }

    if (step === S_BACKGROUND) return !!backgroundKey
    if (step === S_SKILLS) {
      const classOk = classKey ? skillProficiencies.length === (CLASS_SKILL_PROFICIENCIES[classKey]?.count ?? 0) : false
      const bonusOk = needsBonusSkill ? !!bonusSkill : true
      return classOk && bonusOk
    }

    if (step === S_EXPERTISE)    return expertiseSkills.length === 2
    if (step === S_WM)           return classKey ? weaponMasteries.length === (CLASS_WEAPON_MASTERY[classKey]?.count ?? 0) : false
    if (step === S_INSTRUMENTS)  return classKey ? instrumentProficiencies.length === (CLASS_INSTRUMENT_PROFICIENCIES[classKey]?.count ?? 0) : false
    if (step === S_DIVINE_ORDER) return !!divineOrder
    if (step === S_PRIMAL_ORDER) return !!primalOrder
    if (step === S_ELDRITCH_INVOCATION) return eldritchInvocations.length === ELDRITCH_INVOCATION_COUNT
    if (step === S_LANGUAGES) return languages.filter(l => l !== 'Common').length >= languageExtraCount
    if (step === S_ABILITY) {
      const total = backgroundAbilities.reduce((s, ab) => s + (backgroundAbilityBonuses[ab] ?? 0), 0)
      return total === 3
    }
    if (step === S_SPELLS) {
      const info = classKey ? CLASS_SPELLCASTING[classKey] : undefined
      const wisMod = getAbilityModifier(abilityScores.WIS)
      const chaMod = getAbilityModifier(abilityScores.CHA)

      // Kaszt varázslatok ellenőrzése (ha van spellcaster kaszt)
      let classSpellsOk = true
      if (info) {
        const spellsNeeded = typeof info.spellsKnown === 'number'
          ? info.spellsKnown
          : info.spellsKnown === 'wis+level'
            ? Math.max(1, wisMod + 1)
            : info.spellsKnown === 'wis+half'
              ? Math.max(1, wisMod)
              : Math.max(1, chaMod)
        classSpellsOk = knownCantrips.length === info.cantripsKnown && knownSpells.length === spellsNeeded
      }

      // Magic Initiate ellenőrzése (ha háttér adja)
      const miOk = hasMagicInitiate
        ? magicInitiateCantrips.length === 2 && magicInitiateSpell !== null
        : true

      return classSpellsOk && miOk
    }
    if (step === S_EQUIPMENT) return true
    return characterName.trim().length > 0
  }

  function resetSpeciesState() {
    setSpeciesSize(null)
    setDraconicAncestry(null)
    setElvenLineage(null); setElvenSpellcastingAbility(null)
    setGnomishLineage(null); setGnomishSpellcastingAbility(null)
    setGiantAncestry(null)
    setTieflingLegacy(null); setTieflingSpellcastingAbility(null)
    setHumanVersatileFeat(null)
    setBonusSkill(null)
  }

  async function handleSubmit() {
    if (!campaignCode || !speciesKey || !backgroundKey || !classKey) return
    setError('')
    setIsSubmitting(true)

    try {
      const level = 1
      const conMod = getAbilityModifier(abilityScores.CON)
      const dexMod = getAbilityModifier(abilityScores.DEX)
      const maxHp  = getMaxHp(classKey, level, conMod)
      const ac     = 10 + dexMod
      const savingThrows = (CLASS_SAVING_THROWS[classKey] ?? []) as Ability[]
      const spellSlots   = getSpellSlots(classKey, level)
      const casterType   = CLASS_CASTER_TYPE[classKey]

      // RequireAuth garantálja, hogy authUid nem null
      const playerUid  = authUid!
      const playerName = authDisplayName ?? 'Ismeretlen'

      // Bonus skill beolvasztása (Keen Senses / Skillful)
      const allSkills = needsBonusSkill && bonusSkill
        ? [...skillProficiencies, bonusSkill]
        : skillProficiencies

      // Felszerelés lista összeállítása (kaszt + háttér, mindkettő lehet arany)
      const classEqDef = CLASS_STARTER_EQUIPMENT[classKey]
      const bgEqDef    = backgroundKey ? BACKGROUND_STARTER_EQUIPMENT[backgroundKey] : undefined

      const classItems = classEquipmentAsGold
        ? [`${classEqDef?.gold ?? 0} GP (kaszt)`]
        : classEqDef
          ? [
              ...classEqDef.fixed,
              ...classEqDef.choices.flatMap(c => c.options.map(o => o.label)),
            ]
          : []
      const bgItems = bgEquipmentAsGold
        ? [`${bgEqDef?.gold ?? 0} GP (háttér)`]
        : bgEqDef ? [...bgEqDef.fixed] : []

      const starterEquipment = [...classItems, ...bgItems]

      // Meglévő karakter törlése – csak egy aktív karakter lehet játékosonként
      const existing = await getCharacterByPlayerUid(campaignCode, playerUid)
      if (existing) {
        await deleteCharacter(campaignCode, existing.id)
      }

      await createCharacter(campaignCode, playerUid, {
        playerName,
        name: characterName.trim(),
        speciesKey,
        backgroundKey,
        classKey,
        level,
        abilityScores,
        maxHp,
        currentHp: maxHp,
        temporaryHp: 0,
        armorClass: ac,
        skillProficiencies: allSkills,
        savingThrowProficiencies: savingThrows,
        originFeatKey: BACKGROUND_ORIGIN_FEAT[backgroundKey] ?? '',
        weaponMasteries,
        instrumentProficiencies,
        divineOrder: needsDivineOrder ? divineOrder : null,
        primalOrder: needsPrimalOrder ? primalOrder : null,
        expertiseSkills: needsExpertise ? expertiseSkills : [],
        eldritchInvocations: needsEldritchInvocation ? eldritchInvocations : [],
        languages: [...languages, ...thievesCantAuto],
        speciesSize: needsHumanTraits || needsTieflingLegacy || needsSizeOnly ? speciesSize : null,
        draconicAncestry: needsAncestry ? draconicAncestry : null,
        elvenLineage: needsLineage ? elvenLineage : null,
        elvenSpellcastingAbility: needsLineage ? (elvenSpellcastingAbility ?? null) : null,
        gnomishLineage: needsGnomeLineage ? gnomishLineage : null,
        gnomishSpellcastingAbility: needsGnomeLineage ? (gnomishSpellcastingAbility ?? null) : null,
        giantAncestry: needsGiantAncestry ? giantAncestry : null,
        tieflingLegacy: needsTieflingLegacy ? tieflingLegacy : null,
        tieflingSpellcastingAbility: needsTieflingLegacy ? (tieflingSpellcastingAbility ?? null) : null,
        humanVersatileFeat: needsHumanTraits ? humanVersatileFeat : null,
        starterEquipment,
        knownCantrips: needsSpellStep ? knownCantrips : [],
        knownSpells: needsSpellStep ? knownSpells : [],
        magicInitiateCantrips: hasMagicInitiate ? magicInitiateCantrips : [],
        magicInitiateSpell: hasMagicInitiate ? magicInitiateSpell : null,
        spellSlots: casterType !== 'none' ? (spellSlots ?? null) : null,
        usedSpellSlots: [0, 0, 0, 0, 0, 0, 0, 0, 0],
      })

      const newCharacter = await getCharacterByPlayerUid(campaignCode, playerUid)
      if (newCharacter) setCharacter(newCharacter)

      navigate(`/player/${campaignId}/sheet`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Hiba történt.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isDataLoading) {
    return (
      <div className="min-h-screen bg-surface-base flex items-center justify-center">
        <p className="text-text-muted">D&D adatok betöltése...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-surface-base text-white flex flex-col">
      {/* Lépés tartalma */}
      <div className="flex-1 overflow-y-auto p-4 pb-4">
        {step === 0 && (
          <StepClass
            classes={classes}
            selectedKey={classKey}
            onSelect={key => {
              setClassKey(key)
              setSkillProficiencies([]); setWeaponMasteries([]); setInstrumentProficiencies([])
              setDivineOrder(null); setPrimalOrder(null); setExpertiseSkills([]); setEldritchInvocations([])
              setClassEquipmentAsGold(false)
              setKnownCantrips([]); setKnownSpells([])
            }}
          />
        )}
        {step === speciesBase && (
          <StepSpecies
            species={species}
            selectedKey={speciesKey}
            onSelect={key => { setSpeciesKey(key); resetSpeciesState() }}
          />
        )}
        {/* Faji opcionális lépés */}
        {step === S_SPECIES_OPT && needsAncestry && (
          <StepDraconicAncestry selected={draconicAncestry} onChange={setDraconicAncestry} />
        )}
        {step === S_SPECIES_OPT && needsLineage && (
          <StepElvenLineage
            selectedLineage={elvenLineage}
            selectedAbility={elvenSpellcastingAbility}
            onLineageChange={setElvenLineage}
            onAbilityChange={setElvenSpellcastingAbility}
          />
        )}
        {step === S_SPECIES_OPT && needsGnomeLineage && (
          <StepGnomishLineage
            selectedLineage={gnomishLineage}
            selectedAbility={gnomishSpellcastingAbility}
            onLineageChange={setGnomishLineage}
            onAbilityChange={setGnomishSpellcastingAbility}
          />
        )}
        {step === S_SPECIES_OPT && needsGiantAncestry && (
          <StepGiantAncestry selected={giantAncestry} onChange={setGiantAncestry} />
        )}
        {step === S_SPECIES_OPT && needsHumanTraits && (
          <StepHumanTraits
            selectedSize={speciesSize}
            selectedFeat={humanVersatileFeat}
            onSizeChange={setSpeciesSize}
            onFeatChange={setHumanVersatileFeat}
          />
        )}
        {step === S_SPECIES_OPT && needsSizeOnly && (
          <StepSpeciesSize selected={speciesSize} onChange={setSpeciesSize} />
        )}
        {step === S_SPECIES_OPT && needsTieflingLegacy && (
          <StepTieflingLegacy
            selectedSize={speciesSize}
            selectedLegacy={tieflingLegacy}
            selectedAbility={tieflingSpellcastingAbility}
            onSizeChange={setSpeciesSize}
            onLegacyChange={setTieflingLegacy}
            onAbilityChange={setTieflingSpellcastingAbility}
          />
        )}
        {step === S_BACKGROUND && (
          <StepBackground
            backgrounds={backgrounds}
            selectedKey={backgroundKey}
            onSelect={key => {
              setBackgroundKey(key)
              setBackgroundAbilityBonuses({})
              setBgEquipmentAsGold(false)
              setMagicInitiateCantrips([])
              setMagicInitiateSpell(null)
            }}
          />
        )}
        {step === S_SKILLS && (
          <StepSkillProficiencies
            classKey={classKey}
            selected={skillProficiencies}
            onChange={setSkillProficiencies}
            bonusSkillTitle={needsBonusSkill ? bonusSkillTitle : undefined}
            bonusSkillDescription={needsBonusSkill ? bonusSkillDescription : undefined}
            bonusSkillOptions={needsBonusSkill ? bonusSkillOptions : undefined}
            bonusSkillSelected={bonusSkill}
            onBonusSkillChange={needsBonusSkill ? setBonusSkill : undefined}
          />
        )}
        {step === S_EXPERTISE && (
          <StepExpertise skillProficiencies={skillProficiencies} selected={expertiseSkills} onChange={setExpertiseSkills} />
        )}
        {step === S_WM && (
          <StepWeaponMastery classKey={classKey} selected={weaponMasteries} onChange={setWeaponMasteries} />
        )}
        {step === S_INSTRUMENTS && (
          <StepInstruments classKey={classKey} selected={instrumentProficiencies} onChange={setInstrumentProficiencies} />
        )}
        {step === S_DIVINE_ORDER && (
          <StepDivineOrder selected={divineOrder} onChange={setDivineOrder} />
        )}
        {step === S_PRIMAL_ORDER && (
          <StepPrimalOrder selected={primalOrder} onChange={setPrimalOrder} />
        )}
        {step === S_ELDRITCH_INVOCATION && (
          <StepEldritchInvocations selected={eldritchInvocations} onChange={setEldritchInvocations} />
        )}
        {step === S_LANGUAGES && (
          <StepLanguages
            selected={languages}
            onChange={setLanguages}
            autoLanguages={thievesCantAuto}
            extraCount={languageExtraCount}
          />
        )}
        {step === S_ABILITY && (
          <div className="space-y-6">
            <StepBackgroundAbilities
              abilities={backgroundAbilities}
              bonuses={backgroundAbilityBonuses}
              onChange={setBackgroundAbilityBonuses}
            />
            <StepAbilityScores
              baseScores={abilityScores}
              bonuses={backgroundAbilityBonuses}
              onChange={setAbilityScores}
            />
          </div>
        )}
        {step === S_SPELLS && (
          <StepSpells
            classKey={classKey}
            abilityScores={abilityScores}
            spells={spells}
            knownCantrips={knownCantrips}
            onCantripsChange={setKnownCantrips}
            knownSpells={knownSpells}
            onSpellsChange={setKnownSpells}
            magicInitiateClass={magicInitiateClass}
            magicInitiateCantrips={magicInitiateCantrips}
            onMagicInitiateCantripsChange={setMagicInitiateCantrips}
            magicInitiateSpell={magicInitiateSpell}
            onMagicInitiateSpellChange={setMagicInitiateSpell}
          />
        )}
        {step === S_EQUIPMENT && (
          <StepStarterEquipment
            classKey={classKey}
            backgroundKey={backgroundKey}
            classAsGold={classEquipmentAsGold}
            onClassAsGoldChange={setClassEquipmentAsGold}
            backgroundAsGold={bgEquipmentAsGold}
            onBackgroundAsGoldChange={setBgEquipmentAsGold}
          />
        )}
        {step === S_REVIEW && (
          <StepReview
            name={characterName}
            onNameChange={setCharacterName}
            species={selectedSpecies}
            background={selectedBackground}
            cls={selectedClass}
            abilityScores={abilityScores}
            skillProficiencies={skillProficiencies}
            bonusSkill={bonusSkill}
            bonusSkillTitle={needsBonusSkill ? bonusSkillTitle : undefined}
            instrumentProficiencies={instrumentProficiencies}
            divineOrder={divineOrder}
            primalOrder={primalOrder}
            expertiseSkills={expertiseSkills}
            eldritchInvocations={eldritchInvocations}
            draconicAncestry={draconicAncestry}
            elvenLineage={elvenLineage}
            elvenSpellcastingAbility={elvenSpellcastingAbility}
            gnomishLineage={gnomishLineage}
            gnomishSpellcastingAbility={gnomishSpellcastingAbility}
            giantAncestry={giantAncestry}
            speciesSize={speciesSize}
            tieflingLegacy={tieflingLegacy}
            tieflingSpellcastingAbility={tieflingSpellcastingAbility}
            humanVersatileFeat={humanVersatileFeat}
            knownCantrips={knownCantrips}
            knownSpells={knownSpells}
            spells={spells}
            starterEquipment={(() => {
              const classEqDef = classKey ? CLASS_STARTER_EQUIPMENT[classKey] : undefined
              const bgEqDef    = backgroundKey ? BACKGROUND_STARTER_EQUIPMENT[backgroundKey] : undefined
              const classItems = classEquipmentAsGold
                ? [`${classEqDef?.gold ?? 0} GP (kaszt)`]
                : classEqDef
                  ? [
                      ...classEqDef.fixed,
                      ...classEqDef.choices.flatMap(c => c.options.map(o => o.label)),
                    ]
                  : []
              const bgItems = bgEquipmentAsGold
                ? [`${bgEqDef?.gold ?? 0} GP (háttér)`]
                : bgEqDef ? [...bgEqDef.fixed] : []
              return [...classItems, ...bgItems]
            })()}
            languages={[...languages, ...thievesCantAuto]}
            onSubmit={handleSubmit}
            isLoading={isSubmitting}
          />
        )}

        {error && <p className="text-red-400 text-sm text-center mt-4">{error}</p>}
      </div>

      {/* Sticky alsó bar: lépésjelző + navigáció */}
      <div className="sticky bottom-0 bg-surface-base/95 backdrop-blur border-t border-border-subtle">
        <div className="px-4 pt-2.5 pb-1 flex flex-col items-center gap-1">
          <div className="flex justify-center gap-1">
            {STEPS.map((label, i) => (
              <div
                key={i}
                className={`h-1 rounded-full transition-all ${
                  i < step ? 'bg-accent-hover w-5' : i === step ? 'bg-accent w-5' : 'bg-surface-overlay w-3'
                }`}
                title={label}
              />
            ))}
          </div>
          <p className="text-text-muted text-[10px]">{step + 1}/{STEPS.length} – {STEPS[step]}</p>
        </div>
        <div className="px-4 pb-4 flex gap-3">
          {step > 0 && (
            <button
              onClick={() => setStep(s => s - 1)}
              className="flex-1 border border-border hover:border-border-hover text-text-secondary label-l py-3 rounded-btn transition-colors"
            >
              Vissza
            </button>
          )}
          {step < S_REVIEW && (
            <button
              onClick={() => setStep(s => s + 1)}
              disabled={!canProceed()}
              className="flex-1 bg-accent hover:bg-accent-hover disabled:opacity-40 text-gray-950 label-l py-3 rounded-btn transition-colors"
            >
              Tovább
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
