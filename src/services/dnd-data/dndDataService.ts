import type { Spell } from '../../types/dnd/spell'
import type { Condition } from '../../types/dnd/condition'
import type { DndClass } from '../../types/dnd/class'
import type { Species } from '../../types/dnd/species'
import type { Background } from '../../types/dnd/background'
import type { Monster } from '../../types/dnd/monster'
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
  senses: string
  languages: string
}

// Rekurzív lapozó: conditions és monsters esetén szükséges (open5e)
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

async function fetchMonsters(): Promise<Monster[]> {
  const url = `${OPEN5E_BASE}/v1/monsters/?limit=${PAGE_SIZE}`
  const raw = await fetchAllPages<RawMonster>(url)
  return raw.map(m => ({
    key: m.slug,
    name: m.name,
    size: m.size,
    type: m.type,
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
    senses: m.senses,
    languages: m.languages,
  }))
}

export interface AllDndData {
  spells: Spell[]
  conditions: Condition[]
  classes: DndClass[]
  species: Species[]
  backgrounds: Background[]
  monsters: Monster[]
}

// Főbelépési pont: cache-ből tölt ha friss, egyébként API-ból
// Csak a lejárt store-okat fetcheli újra (részleges cache refresh)
export async function loadAllDndData(): Promise<AllDndData> {
  const [
    cachedSpells,
    cachedConditions,
    cachedClasses,
    cachedSpecies,
    cachedBackgrounds,
    cachedMonsters,
  ] = await Promise.all([
    getCached('spells'),
    getCached('conditions'),
    getCached('classes'),
    getCached('species'),
    getCached('backgrounds'),
    getCached('monsters'),
  ])

  if (
    cachedSpells &&
    cachedConditions &&
    cachedClasses &&
    cachedSpecies &&
    cachedBackgrounds &&
    cachedMonsters
  ) {
    return {
      spells: cachedSpells,
      conditions: cachedConditions,
      classes: cachedClasses,
      species: cachedSpecies,
      backgrounds: cachedBackgrounds,
      monsters: cachedMonsters,
    }
  }

  const [spells, conditions, classes, species, backgrounds, monsters] = await Promise.all([
    cachedSpells ?? fetchSpells(),
    cachedConditions ?? fetchConditions(),
    cachedClasses ?? fetchClasses(),
    cachedSpecies ?? fetchSpecies(),
    cachedBackgrounds ?? fetchBackgrounds(),
    cachedMonsters ?? fetchMonsters(),
  ])

  const saves: Promise<void>[] = []
  if (!cachedSpells) saves.push(setCached('spells', spells))
  if (!cachedConditions) saves.push(setCached('conditions', conditions))
  if (!cachedClasses) saves.push(setCached('classes', classes))
  if (!cachedSpecies) saves.push(setCached('species', species))
  if (!cachedBackgrounds) saves.push(setCached('backgrounds', backgrounds))
  if (!cachedMonsters) saves.push(setCached('monsters', monsters))
  await Promise.all(saves)

  return { spells, conditions, classes, species, backgrounds, monsters }
}
