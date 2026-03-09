import type { Spell } from '../../types/dnd/spell'
import type { Condition } from '../../types/dnd/condition'
import type { DndClass } from '../../types/dnd/class'
import type { Species } from '../../types/dnd/species'
import type { Background } from '../../types/dnd/background'
import type { Monster, MonsterSummary } from '../../types/dnd/monster'
import { getCached, setCached } from './indexedDbCache'

const OPEN5E_BASE = 'https://api.open5e.com'
const GITHUB_BASE = 'https://raw.githubusercontent.com/nick-aschenbach/dnd-data/main/data'
const PHB_2024 = "Player's Handbook (2024)"
const PAGE_SIZE = 100

interface PagedResponse<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

// Nyers API condition – descriptions tömböt tartalmaz
interface RawCondition {
  key: string
  name: string
  descriptions: Array<{ desc: string }>
}

// nick-aschenbach GitHub JSON nyers entry struktúra
interface RawEntry {
  name: string
  description: string
  properties: Record<string, unknown>
  publisher: string
  book: string
}

interface RawMonsterAction {
  name: string
  desc: string
  attack_bonus?: number
}

// Nyers open5e v1 monster struktúra
interface RawMonster {
  slug: string
  name: string
  size: string
  type: string
  subtype: string
  alignment: string
  armor_class: number
  armor_desc: string | null
  hit_points: number
  hit_dice: string
  speed: string
  strength: number
  dexterity: number
  constitution: number
  intelligence: number
  wisdom: number
  charisma: number
  challenge_rating: string
  xp: number
  senses: string
  languages: string
  strength_save: number | null
  dexterity_save: number | null
  constitution_save: number | null
  intelligence_save: number | null
  wisdom_save: number | null
  charisma_save: number | null
  skills: Record<string, number> | string | null
  damage_vulnerabilities: string
  damage_resistances: string
  damage_immunities: string
  condition_immunities: string
  special_abilities: RawMonsterAction[] | null
  actions: RawMonsterAction[] | null
  reactions: RawMonsterAction[] | null
  legendary_desc: string
  legendary_actions: RawMonsterAction[] | null
}

// Rekurzív lapozó: conditions esetén szükséges (open5e)
async function fetchAllPages<T>(url: string): Promise<T[]> {
  const results: T[] = []
  let nextUrl: string | null = url

  while (nextUrl !== null) {
    const response = await fetch(nextUrl)
    if (!response.ok) {
      throw new Error(`API hiba: ${response.status} – ${nextUrl}`)
    }
    const page = (await response.json()) as PagedResponse<T>
    results.push(...page.results)
    nextUrl = page.next
  }

  return results
}

// GitHub raw JSON fetch: egész fájl egyszerre, PHB 2024 szűrés
async function fetchGithubJson(type: string): Promise<RawEntry[]> {
  const response = await fetch(`${GITHUB_BASE}/${type}.json`)
  if (!response.ok) {
    throw new Error(`GitHub fetch hiba: ${response.status} – ${type}.json`)
  }
  const data = (await response.json()) as RawEntry[]
  return data.filter(e => e.book === PHB_2024)
}

// Name → key: "Human" → "human", "Half-Orc" → "half-orc"
function toKey(name: string): string {
  return name.toLowerCase().replace(/['\s]+/g, '-').replace(/[^a-z0-9-]/g, '')
}

async function fetchConditions(): Promise<Condition[]> {
  const url = `${OPEN5E_BASE}/v2/conditions/?limit=${PAGE_SIZE}`
  const raw = await fetchAllPages<RawCondition>(url)
  return raw.map(c => ({
    key: c.key,
    name: c.name,
    desc: c.descriptions[0]?.desc ?? '',
  }))
}

async function fetchClasses(): Promise<DndClass[]> {
  const raw = await fetchGithubJson('classes')
  return raw.map(c => ({
    key: toKey(c.name),
    name: c.name,
    description: c.description,
  }))
}

async function fetchSpecies(): Promise<Species[]> {
  const raw = await fetchGithubJson('species')
  return raw.map(s => ({
    key: toKey(s.name),
    name: s.name,
    description: s.description,
  }))
}

async function fetchBackgrounds(): Promise<Background[]> {
  const raw = await fetchGithubJson('backgrounds')
  return raw.map(b => ({
    key: toKey(b.name),
    name: b.name,
    description: b.description,
  }))
}

interface RawOpen5eSpell {
  key: string
  name: string
  desc: string
  level: number
  school: { name: string }
  classes: Array<{ name: string }>
  verbal: boolean
  somatic: boolean
  material: boolean
  material_specified: string
  casting_time: string
  range_text: string
  duration: string
  concentration: boolean
  ritual: boolean
  damage_types?: string[]
}

async function fetchSpells(): Promise<Spell[]> {
  const url = `${OPEN5E_BASE}/v2/spells/?document__key=srd-2024&limit=${PAGE_SIZE}`
  const raw = await fetchAllPages<RawOpen5eSpell>(url)
  return raw.map(s => {
    const compParts: string[] = []
    if (s.verbal) compParts.push('V')
    if (s.somatic) compParts.push('S')
    if (s.material) compParts.push('M')
    return {
      key: toKey(s.name),
      name: s.name,
      description: s.desc,
      level: s.level,
      school: s.school.name,
      classes: s.classes.map(c => c.name),
      castingTime: s.casting_time,
      range: s.range_text,
      components: compParts.join(', '),
      material: s.material_specified ?? '',
      duration: s.duration,
      concentration: s.concentration,
      ritual: s.ritual,
      savingThrow: '',
      damageType: s.damage_types?.[0] ?? '',
      higherLevel: '',
    }
  })
}

// Saving throw mezők formázása egységes stringgé
function formatSaves(m: RawMonster): string | undefined {
  const entries: [string, number | null][] = [
    ['Str', m.strength_save], ['Dex', m.dexterity_save],
    ['Con', m.constitution_save], ['Int', m.intelligence_save],
    ['Wis', m.wisdom_save], ['Cha', m.charisma_save],
  ]
  const result = entries
    .filter(([, v]) => v !== null)
    .map(([label, v]) => `${label} ${v! >= 0 ? '+' : ''}${v}`)
    .join(', ')
  return result || undefined
}

// Nyers API adat → Monster interface
function mapMonster(m: RawMonster): Monster {
  return {
    key: m.slug,
    name: m.name,
    size: m.size,
    type: m.type,
    subtype: m.subtype || undefined,
    alignment: m.alignment,
    ac: m.armor_class,
    acDesc: m.armor_desc ?? '',
    hp: m.hit_points,
    hitDice: m.hit_dice,
    speed: typeof m.speed === 'string' ? m.speed : `${(m.speed as Record<string, number>).walk ?? 0} ft.`,
    str: m.strength,
    dex: m.dexterity,
    con: m.constitution,
    int: m.intelligence,
    wis: m.wisdom,
    cha: m.charisma,
    cr: m.challenge_rating,
    xp: m.xp || undefined,
    senses: m.senses,
    languages: m.languages,
    savingThrows: formatSaves(m),
    skills: m.skills
      ? typeof m.skills === 'object'
        ? Object.entries(m.skills)
            .map(([k, v]) => `${k.charAt(0).toUpperCase() + k.slice(1)} ${v >= 0 ? '+' : ''}${v}`)
            .join(', ')
        : m.skills
      : undefined,
    damageVulnerabilities: m.damage_vulnerabilities || undefined,
    damageResistances: m.damage_resistances || undefined,
    damageImmunities: m.damage_immunities || undefined,
    conditionImmunities: m.condition_immunities || undefined,
    traits: m.special_abilities?.map(a => ({ name: a.name, desc: a.desc, attackBonus: a.attack_bonus })) ?? undefined,
    actions: m.actions?.map(a => ({ name: a.name, desc: a.desc, attackBonus: a.attack_bonus })) ?? undefined,
    reactions: m.reactions?.map(a => ({ name: a.name, desc: a.desc })) ?? undefined,
    legendaryDesc: m.legendary_desc || undefined,
    legendaryActions: m.legendary_actions?.map(a => ({ name: a.name, desc: a.desc })) ?? undefined,
  }
}

// Nyers névindex entry – csak a keresőhöz szükséges mezők
interface RawMonsterSummary {
  slug: string
  name: string
  challenge_rating: string
  type: string
}

// Monster névindex háttérben, oldalanként – csak nevet és alap adatokat tölt (gyors)
export async function loadMonsterIndexBackground(
  onPage: (items: MonsterSummary[]) => void
): Promise<void> {
  let nextUrl: string | null =
    `${OPEN5E_BASE}/v1/monsters/?limit=${PAGE_SIZE}&fields=slug,name,challenge_rating,type`
  while (nextUrl !== null) {
    const resp = await fetch(nextUrl)
    if (!resp.ok) return
    const page = (await resp.json()) as PagedResponse<RawMonsterSummary>
    onPage(page.results.map(m => ({
      key: m.slug,
      name: m.name,
      cr: m.challenge_rating,
      type: m.type,
    })))
    nextUrl = page.next
  }
}

// Live monster keresés a TokenPanel dropdownhoz (max 8 találat)
export async function searchMonsters(query: string): Promise<Monster[]> {
  const url = `${OPEN5E_BASE}/v1/monsters/?search=${encodeURIComponent(query)}&limit=8`
  const response = await fetch(url)
  if (!response.ok) return []
  const page = (await response.json()) as PagedResponse<RawMonster>
  return page.results.map(mapMonster)
}

// Egy monster teljes adatlapja slug alapján (token kiválasztáskor)
export async function fetchMonsterBySlug(slug: string): Promise<Monster | null> {
  const response = await fetch(`${OPEN5E_BASE}/v1/monsters/${encodeURIComponent(slug)}/`)
  if (!response.ok) return null
  const raw = (await response.json()) as RawMonster
  return mapMonster(raw)
}

export interface AllDndData {
  spells: Spell[]
  conditions: Condition[]
  classes: DndClass[]
  species: Species[]
  backgrounds: Background[]
}

// Főbelépési pont: cache-ből tölt ha friss, egyébként API-ból
// Monsters nincs itt – on-demand töltődnek token kiválasztáskor
export async function loadAllDndData(): Promise<AllDndData> {
  const [
    cachedSpells,
    cachedConditions,
    cachedClasses,
    cachedSpecies,
    cachedBackgrounds,
  ] = await Promise.all([
    getCached('spells'),
    getCached('conditions'),
    getCached('classes'),
    getCached('species'),
    getCached('backgrounds'),
  ])

  if (
    cachedSpells &&
    cachedConditions &&
    cachedClasses &&
    cachedSpecies &&
    cachedBackgrounds
  ) {
    return {
      spells: cachedSpells,
      conditions: cachedConditions,
      classes: cachedClasses,
      species: cachedSpecies,
      backgrounds: cachedBackgrounds,
    }
  }

  const [spells, conditions, classes, species, backgrounds] = await Promise.all([
    cachedSpells ?? fetchSpells(),
    cachedConditions ?? fetchConditions(),
    cachedClasses ?? fetchClasses(),
    cachedSpecies ?? fetchSpecies(),
    cachedBackgrounds ?? fetchBackgrounds(),
  ])

  const saves: Promise<void>[] = []
  if (!cachedSpells) saves.push(setCached('spells', spells))
  if (!cachedConditions) saves.push(setCached('conditions', conditions))
  if (!cachedClasses) saves.push(setCached('classes', classes))
  if (!cachedSpecies) saves.push(setCached('species', species))
  if (!cachedBackgrounds) saves.push(setCached('backgrounds', backgrounds))
  await Promise.all(saves)

  return { spells, conditions, classes, species, backgrounds }
}
