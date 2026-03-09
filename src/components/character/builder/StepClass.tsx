import { useState } from 'react'
import type { DndClass } from '../../../types/dnd/class'
import {
  CLASS_HIT_DICE,
  CLASS_SAVING_THROWS,
  CLASS_PROFICIENCIES,
  CLASS_SKILL_PROFICIENCIES,
  CLASS_CASTER_TYPE,
  CLASS_STARTER_EQUIPMENT,
  CLASS_SUBCLASSES,
  SKILLS,
} from '../../../data/dndConstants'
import { useDndDataStore } from '../../../store/dndDataStore'

const SPELL_LEVEL_LABELS = ['1st','2nd','3rd','4th','5th','6th','7th','8th','9th']

// Mondat-kezdő szavak – a feature neve itt ér véget
const DESC_STARTERS = new Set([
  'You','Your','As','While','When','The','A','An','At','If','Once',
  'By','In','For','On','This','These','That','Those','From','Starting',
  'During','Each','Some','Any','All','Both','Choose','Whenever','Until',
  'After','Before','Instead','Using','Having','Being','Upon',
  'Through','With','Without','Between','To','No','Not','It','Its',
  'Whenever','Provided','Unless','Although','Despite','Immediately',
])

interface FeatureEntry { level: number; name: string; description: string }

// Kinyeri a feature-leírás szekciót (Level N: NévLeírás formátum)
function extractFeatureDescriptions(text: string): FeatureEntry[] {
  const descStart = text.search(/Level \d+: \w/)
  if (descStart < 0) return []
  const section = text.slice(descStart)

  const entries: FeatureEntry[] = []
  const re = /Level (\d+): (.+?)(?=Level \d+: |$)/g
  let m: RegExpExecArray | null
  while ((m = re.exec(section)) !== null) {
    const level = parseInt(m[1])
    const raw = m[2].trim()

    // Névhatár: első DESC_STARTER szó előtt álló szavak alkotják a nevet
    const words = raw.split(' ')
    let nameEnd = words.length
    for (let i = 1; i < words.length; i++) {
      const w = words[i]
      if (DESC_STARTERS.has(w) || (w.length > 0 && w[0] === w[0].toLowerCase() && w[0] !== "'")) {
        nameEnd = i
        break
      }
    }
    const name = words.slice(0, nameEnd).join(' ')
    const description = words.slice(nameEnd).join(' ').trim()
    entries.push({ level, name, description })
  }
  return entries
}

interface SubclassesSection { intro: string; names: string[] }

// "ClassName Subclasses" szekció: bevezető szöveg + alnévosztályok listája
function extractSubclasses(text: string, className: string): SubclassesSection | null {
  const marker = className + ' Subclasses '
  const idx = text.indexOf(marker)
  if (idx < 0) return null
  const section = text.slice(idx + marker.length).trim()

  // "This section presents (the) X, Y, Z, and W subclasses."
  const m = section.match(/This section presents (?:the )?(.+?) subclasses\./)
  if (!m) return { intro: section, names: [] }

  const names = m[1]
    .replace(/, and /g, ', ').replace(/ and /g, ', ')
    .split(', ').map(n => n.trim()).filter(Boolean)

  const presentsIdx = section.indexOf('This section presents')
  const intro = presentsIdx > 0 ? section.slice(0, presentsIdx).trim() : ''
  return { intro, names }
}

// A "Core X Traits" szekció előtti narratív szöveg (flat string, nincs newline)
function extractIntro(text: string): string {
  const coreIdx = text.search(/Core \w+ Traits/)
  const relevant = (coreIdx > 0 ? text.slice(0, coreIdx) : text).trim()
  return relevant.length > 300 ? relevant.slice(0, 297) + '…' : relevant
}

// "Primary Ability Strength Hit Point Die..." – space-elválasztott, nincs newline
const ABILITY_NAMES = ['Strength', 'Dexterity', 'Constitution', 'Intelligence', 'Wisdom', 'Charisma']
function extractPrimaryAbility(text: string): string {
  const match = text.match(/Primary Abilit(?:y|ies)\s+(.{1,60})/i)
  if (!match) return ''
  const found = ABILITY_NAMES.filter(a => match[1].includes(a))
  return found.join(' / ')
}

// "As a Level 1 Character" szöveg a Core Traits és Multiclass között
function extractLevel1Text(text: string): string {
  const start = text.indexOf('As a Level 1 Character ')
  const end = text.indexOf('As a Multiclass Character')
  if (start < 0) return ''
  return text.slice(start + 'As a Level 1 Character '.length, end > start ? end : undefined).trim()
}

// "As a Multiclass Character" szöveg
function extractMulticlassText(text: string): string {
  const start = text.indexOf('As a Multiclass Character ')
  if (start < 0) return ''
  const after = text.slice(start + 'As a Multiclass Character '.length)
  const endIdx = after.search(/[A-Z][a-z]+ Class Features/)
  return (endIdx > 0 ? after.slice(0, endIdx) : after).trim()
}

// Érték-minta: távolság, kocka (9d6, D6), előjeles szám, szám, magányos kötőjel
const VAL_SRC = '[\\+\\-]?\\d+\\s*ft\\.|\\d+[dD]\\d+|[Dd]\\d+|[\\+\\-]\\d+|\\d+|(?<![A-Za-z])-(?![A-Za-z])'
const VAL_START_RE = new RegExp('^(?:' + VAL_SRC + ')')

// Oszlopneveket kinyeri tiszta class-specific szövegből (értékek közötti szavak)
function parseColNames(text: string): string[] {
  const cols: string[] = []
  let prev = 0
  for (const m of text.matchAll(new RegExp(VAL_SRC, 'g'))) {
    const name = text.slice(prev, m.index).trim()
    if (name) cols.push(name)
    prev = m.index! + m[0].length
  }
  return cols
}

// Meghatározza az osztály-specifikus oszlopokat az összes szint nyers szövegéből
function detectColumns(raws: string[]): string[] {
  // Ha van üres-feature szint ("- OszlopNev Val ..."), abból tisztán kinyerhető
  const emptyRaw = raws.find(r => /^-\s/.test(r))
  if (emptyRaw) return parseColNames(emptyRaw.replace(/^-\s*/, '').trim())

  // Ha nincs: legrövidebb no-comma sor, 1-3 szavas feature prefix levágásával
  const noComma = raws.filter(r => !r.includes(','))
  const pool = noComma.length > 0 ? noComma : raws
  const minRaw = pool.reduce((a, b) => a.length <= b.length ? a : b)
  const otherRaws = raws.filter(r => r !== minRaw)

  // Szigorúbb ellenőrzés: az oszlopnévnek legalább 2 másik sorban is "[col] [érték]" formában kell megjelennie
  const colValRe = (col: string) =>
    new RegExp(col.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\s+(?:' + VAL_SRC + ')')

  for (const n of [1, 2, 3]) {
    const words = minRaw.split(/\s+/)
    if (words.length <= n) continue
    const cols = parseColNames(words.slice(n).join(' '))
    if (cols.length > 0 && cols.every(c => otherRaws.filter(r => colValRe(c).test(r)).length >= 2)) {
      return cols
    }
  }
  return []
}

// Jobbról balra keresi az oszlopok értékeit a nyers szövegben
function extractColValues(raw: string, columns: string[]): { vals: Record<string, string>; end: number } {
  const vals: Record<string, string> = {}
  let searchEnd = raw.length
  let specStart = raw.length

  for (const col of [...columns].reverse()) {
    const idx = raw.lastIndexOf(col, searchEnd - 1)
    if (idx < 0) continue
    const after = raw.slice(idx + col.length).trimStart()
    const vm = after.match(VAL_START_RE)
    if (!vm) continue
    vals[col] = vm[0].trim()
    searchEnd = idx
    specStart = idx
  }
  return { vals, end: specStart }
}

interface LevelRow { level: number; profBonus: string; features: string; extraCols: Record<string, string> }

function extractFeatureTable(text: string): { rows: LevelRow[]; columns: string[] } {
  const tableStart = text.indexOf('Level 1 Proficiency Bonus')
  if (tableStart < 0) return { rows: [], columns: [] }

  // Levágjuk a táblát az első zavaró szekció előtt:
  // - "Level Proficiency Bonus" (digit nélkül): másodlagos, oszlopos reprezentáció
  // - "Level N: Feature": feature-leírás szekció
  let tableText = text.slice(tableStart)
  const cuts: number[] = []
  const descStart = tableText.search(/Level \d+: \w/)
  if (descStart > 0) cuts.push(descStart)
  const secondaryStart = tableText.search(/Level Proficiency Bonus/)
  if (secondaryStart > 0) cuts.push(secondaryStart)
  if (cuts.length > 0) tableText = tableText.slice(0, Math.min(...cuts))

  type RawRow = { level: number; profBonus: string; raw: string }
  const rawRows: RawRow[] = tableText
    .split(/(?=Level \d+ Proficiency Bonus)/)
    .map(chunk => {
      const lm = chunk.match(/Level (\d+) Proficiency Bonus/)
      const pm = chunk.match(/Proficiency Bonus (\+\d+)/)
      const fm = chunk.match(/Class Features (.+?)(?=Level \d+ Proficiency|$)/)
      if (!lm || !pm || !fm) return null
      const level = parseInt(lm[1])
      return (level >= 1 && level <= 20) ? { level, profBonus: pm[1], raw: fm[1].trim() } : null
    })
    .filter((r): r is RawRow => r !== null)

  const columns = detectColumns(rawRows.map(r => r.raw))

  const rows: LevelRow[] = rawRows.map(row => {
    const { vals, end } = columns.length > 0
      ? extractColValues(row.raw, columns)
      : { vals: {}, end: row.raw.length }
    const features = row.raw.slice(0, end).replace(/,?\s*$/, '').trim() || '—'
    return { level: row.level, profBonus: row.profBonus, features, extraCols: vals }
  })

  return { rows, columns }
}


interface Props {
  classes: DndClass[]
  selectedKey: string | null
  onSelect: (key: string) => void
}

export function StepClass({ classes, selectedKey, onSelect }: Props) {
  const spellTables = useDndDataStore(s => s.spellTables)
  const [previewKey, setPreviewKey] = useState<string | null>(selectedKey)
  const [showFullDesc, setShowFullDesc] = useState(false)
  const [expandedFeature, setExpandedFeature] = useState<string | null>(null)

  const displayKey = previewKey ?? selectedKey
  const displayCls = displayKey ? classes.find(c => c.key === displayKey) : null

  return (
    <div>
      <h2 className="heading-l text-accent mb-1">Válassz Kasztot</h2>
      <p className="body-m text-text-muted mb-4">D&D 2024 SRD kasztok</p>

      <div className="flex gap-4" style={{ minHeight: '420px' }}>
        {/* Bal hasáb – kasztlista */}
        <div className="w-44 shrink-0 flex flex-col gap-1 overflow-y-auto">
          {classes.map(cls => {
            const isSelected = selectedKey === cls.key
            const isPreview = previewKey === cls.key

            return (
              <button
                key={cls.key}
                onClick={() => { setPreviewKey(cls.key); onSelect(cls.key) }}
                onMouseEnter={() => setPreviewKey(cls.key)}
                onMouseLeave={() => setPreviewKey(selectedKey)}
                className={`
                  text-left px-3 py-2.5 rounded-btn border transition-colors flex items-center justify-between gap-2
                  ${isSelected
                    ? 'border-accent bg-accent/10 text-white'
                    : isPreview
                      ? 'border-border-hover bg-surface-raised text-white'
                      : 'border-border bg-surface-raised text-text-secondary hover:border-border-hover hover:text-white'}
                `}
              >
                <span className="font-semibold text-sm">{cls.name}</span>
              </button>
            )
          })}
        </div>

        {/* Jobb hasáb – részletek */}
        <div className="flex-1 min-w-0">
          {displayCls ? (() => {
            const hitDie     = CLASS_HIT_DICE[displayCls.key] ?? '?'
            const saves      = CLASS_SAVING_THROWS[displayCls.key] ?? []
            const profs      = CLASS_PROFICIENCIES[displayCls.key]
            const skillProf  = CLASS_SKILL_PROFICIENCIES[displayCls.key]
            const casterType = CLASS_CASTER_TYPE[displayCls.key]
            const isSelected = selectedKey === displayCls.key

            const skillNames = skillProf?.skills.length
              ? skillProf.skills.map(k => SKILLS.find(s => s.key === k)?.name ?? k)
              : ['Any']

            return (
              <div className="bg-surface-raised rounded-card p-4 h-full flex flex-col overflow-y-auto">
                {/* Fejléc: hit die badge + kaszt neve */}
                <div className="flex items-start justify-between gap-2 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-accent/10 border border-accent/30 rounded-btn px-3 py-2 text-center shrink-0">
                      <p className="text-accent font-black text-lg leading-none">{hitDie}</p>
                      <p className="text-text-muted text-[9px] uppercase tracking-wide mt-0.5">Hit Die</p>
                    </div>
                    <div>
                      <h3 className="text-white font-black text-xl leading-tight">{displayCls.name}</h3>
                      {casterType && casterType !== 'none' && (
                        <span className="inline-block mt-1 text-[10px] font-semibold uppercase tracking-wide bg-surface-overlay border border-border rounded px-1.5 py-0.5 text-text-muted">
                          {casterType} caster
                        </span>
                      )}
                    </div>
                  </div>
                  {isSelected && (
                    <span className="text-accent text-xs font-bold shrink-0 mt-1">✓ Kiválasztva</span>
                  )}
                </div>

                {/* Primary Ability badge */}
                {displayCls.description && (() => {
                  const primaryAbility = extractPrimaryAbility(displayCls.description)
                  return primaryAbility ? (
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-[10px] font-semibold uppercase tracking-widest text-text-muted">Primary Ability</span>
                      <span className="bg-accent/10 border border-accent/30 text-accent text-xs font-bold px-2.5 py-1 rounded">{primaryAbility}</span>
                    </div>
                  ) : null
                })()}

                {/* Rövid intro */}
                {displayCls.description && (() => {
                  const intro = extractIntro(displayCls.description)
                  return intro ? (
                    <div className="border-t border-border py-3">
                      <p className="text-[10px] font-semibold uppercase tracking-widest text-text-muted mb-2">Description</p>
                      <p className="text-text-secondary text-sm leading-relaxed">{intro}</p>
                    </div>
                  ) : null
                })()}

                {/* Mentődobások */}
                {saves.length > 0 && (
                  <div className="border-t border-border py-3">
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-text-muted mb-2">Saving Throws</p>
                    <div className="flex gap-1.5 flex-wrap">
                      {saves.map(s => (
                        <span key={s} className="bg-accent/10 border border-accent/30 text-accent text-xs font-bold px-2.5 py-1 rounded">{s}</span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Jártasságok badge-ekkel */}
                {profs && (
                  <div className="border-t border-border py-3 space-y-2">
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-text-muted">Proficiencies</p>
                    {profs.armor.length > 0 && (
                      <div className="flex gap-2 items-start">
                        <span className="text-[10px] text-text-muted uppercase tracking-wide shrink-0 w-14 mt-0.5">Armor</span>
                        <div className="flex gap-1 flex-wrap">
                          {profs.armor.map(a => (
                            <span key={a} className="bg-surface-overlay border border-border text-text-secondary text-[11px] px-2 py-0.5 rounded">{a}</span>
                          ))}
                        </div>
                      </div>
                    )}
                    {profs.weapons.length > 0 && (
                      <div className="flex gap-2 items-start">
                        <span className="text-[10px] text-text-muted uppercase tracking-wide shrink-0 w-14 mt-0.5">Weapons</span>
                        <div className="flex gap-1 flex-wrap">
                          {profs.weapons.map(w => (
                            <span key={w} className="bg-surface-overlay border border-border text-text-secondary text-[11px] px-2 py-0.5 rounded">{w}</span>
                          ))}
                        </div>
                      </div>
                    )}
                    {profs.tools.length > 0 && (
                      <div className="flex gap-2 items-start">
                        <span className="text-[10px] text-text-muted uppercase tracking-wide shrink-0 w-14 mt-0.5">Tools</span>
                        <div className="flex gap-1 flex-wrap">
                          {profs.tools.map(t => (
                            <span key={t} className="bg-surface-overlay border border-border text-text-secondary text-[11px] px-2 py-0.5 rounded">{t}</span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Skill jártasságok badge-ekkel */}
                {skillProf && (
                  <div className="border-t border-border py-3">
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-text-muted mb-2">
                      Skills <span className="text-accent normal-case">— válassz {skillProf.count}-t</span>
                    </p>
                    <div className="flex gap-1 flex-wrap">
                      {skillNames.map(name => (
                        <span key={name} className="bg-surface-overlay border border-border text-text-secondary text-[11px] px-2 py-0.5 rounded">{name}</span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Starting Equipment */}
                {(() => {
                  const eq = CLASS_STARTER_EQUIPMENT[displayCls.key]
                  if (!eq) return null
                  const items = [
                    ...eq.fixed,
                    ...eq.choices.flatMap(c => c.options.map(o => o.label)),
                  ]
                  return (
                    <div className="border-t border-border py-3">
                      <p className="text-[10px] font-semibold uppercase tracking-widest text-text-muted mb-2">Starting Equipment</p>
                      <p className="text-[11px] text-text-secondary leading-relaxed">{items.join(', ')}</p>
                      <p className="text-[10px] text-text-secondary mt-1.5">vagy {eq.gold} GP arany</p>
                    </div>
                  )
                })()}

                {/* As a Level 1 Character */}
                {displayCls.description && (() => {
                  const txt = extractLevel1Text(displayCls.description)
                  return txt ? (
                    <div className="border-t border-border py-3">
                      <p className="text-[10px] font-semibold uppercase tracking-widest text-text-muted mb-2">As a Level 1 Character</p>
                      <p className="text-[11px] text-text-secondary leading-relaxed">{txt}</p>
                    </div>
                  ) : null
                })()}

                {/* As a Multiclass Character */}
                {displayCls.description && (() => {
                  const txt = extractMulticlassText(displayCls.description)
                  return txt ? (
                    <div className="border-t border-border py-3">
                      <p className="text-[10px] font-semibold uppercase tracking-widest text-text-muted mb-2">As a Multiclass Character</p>
                      <p className="text-[11px] text-text-secondary leading-relaxed">{txt}</p>
                    </div>
                  ) : null
                })()}

                {/* Features táblázat */}
                {displayCls.description && (() => {
                  const { rows, columns } = extractFeatureTable(displayCls.description)
                  if (rows.length === 0) return null

                  // Spell slot oszlopok: full/half castereknek (Warlock kihagyva – saját Pact rendszer)
                  const slotTable = spellTables[displayCls.key]
                  let maxSlotLevel = 0
                  if (slotTable) {
                    for (const entry of slotTable) {
                      if (!entry) continue
                      for (let i = entry.length - 1; i >= 0; i--) {
                        if (entry[i] > 0) { maxSlotLevel = Math.max(maxSlotLevel, i + 1); break }
                      }
                    }
                  }
                  const slotHeaders = SPELL_LEVEL_LABELS.slice(0, maxSlotLevel)

                  return (
                    <div className="border-t border-border py-3">
                      <p className="text-[10px] font-semibold uppercase tracking-widest text-text-muted mb-2">Class Features</p>
                      <div className="overflow-x-auto">
                        <table className="w-full text-[10px]">
                          <thead>
                            <tr className="text-text-muted uppercase tracking-wide border-b border-border">
                              <th className="text-left pb-1 pr-3">Lvl</th>
                              <th className="text-left pb-1 pr-3">Prof</th>
                              <th className="text-left pb-1 pr-3">Features</th>
                              {columns.map(col => (
                                <th key={col} className="text-left pb-1 pr-3 whitespace-nowrap">{col}</th>
                              ))}
                              {slotHeaders.map(h => (
                                <th key={h} className="text-center pb-1 pr-2 whitespace-nowrap">{h}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {rows.map(row => {
                              const levelSlots = slotTable?.[row.level] ?? null
                              return (
                                <tr key={row.level} className="border-b border-border/30 hover:bg-surface-overlay/30">
                                  <td className="py-0.5 pr-3 text-text-muted">{row.level}</td>
                                  <td className="py-0.5 pr-3 text-accent font-bold">{row.profBonus}</td>
                                  <td className="py-0.5 pr-3 text-text-secondary">{row.features}</td>
                                  {columns.map(col => (
                                    <td key={col} className="py-0.5 pr-3 text-text-secondary whitespace-nowrap">
                                      {row.extraCols[col] ?? '—'}
                                    </td>
                                  ))}
                                  {slotHeaders.map((_, i) => (
                                    <td key={i} className="py-0.5 pr-2 text-center text-text-secondary whitespace-nowrap">
                                      {levelSlots ? (levelSlots[i] > 0 ? levelSlots[i] : '—') : '—'}
                                    </td>
                                  ))}
                                </tr>
                              )
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )
                })()}

                {/* Feature leírások – accordion */}
                {displayCls.description && (() => {
                  const features = extractFeatureDescriptions(displayCls.description)
                  if (features.length === 0) return null
                  return (
                    <div className="border-t border-border py-3">
                      <p className="text-[10px] font-semibold uppercase tracking-widest text-text-muted mb-3">Feature Descriptions</p>
                      <div className="flex flex-col gap-1">
                        {features.map((f, i) => {
                          const key = `${f.level}-${f.name}-${i}`
                          const isOpen = expandedFeature === key
                          return (
                            <div key={key} className="rounded-lg border border-border overflow-hidden">
                              <button
                                onClick={() => setExpandedFeature(isOpen ? null : key)}
                                className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-surface-overlay/40 transition-colors"
                              >
                                <span className="shrink-0 text-[9px] font-bold text-accent bg-accent/10 border border-accent/30 rounded px-1.5 py-0.5 leading-none">
                                  {f.level}
                                </span>
                                <span className="text-white text-[11px] font-semibold flex-1 truncate">{f.name}</span>
                                <span className="text-text-muted text-[10px] shrink-0">{isOpen ? '▲' : '▼'}</span>
                              </button>
                              {isOpen && (
                                <div className="px-3 pb-3 pt-1 bg-surface-overlay/20">
                                  <p className="text-[11px] text-text-secondary leading-relaxed">{f.description}</p>
                                </div>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )
                })()}

                {/* Subclass leírások */}
                {(() => {
                  const scIntro = displayCls.description
                    ? extractSubclasses(displayCls.description, displayCls.name)
                    : null
                  const subclasses = CLASS_SUBCLASSES[displayCls.key] ?? []
                  if (subclasses.length === 0) return null
                  return (
                    <div className="border-t border-border py-3">
                      <p className="text-[10px] font-semibold uppercase tracking-widest text-text-muted mb-2">Subclasses</p>
                      {scIntro?.intro && (
                        <p className="text-[11px] text-text-secondary leading-relaxed mb-3">{scIntro.intro}</p>
                      )}
                      <div className="flex flex-col gap-1">
                        {subclasses.map(sc => (
                          <div key={sc.name} className="rounded-lg border border-border overflow-hidden">
                            <button
                              onClick={() => setExpandedFeature(expandedFeature === sc.name ? null : sc.name)}
                              className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-surface-overlay/40 transition-colors"
                            >
                              <span className="text-white text-[11px] font-semibold flex-1">{sc.name}</span>
                              <span className="text-text-muted text-[10px] shrink-0">
                                {expandedFeature === sc.name ? '▲' : '▼'}
                              </span>
                            </button>
                            {expandedFeature === sc.name && (
                              <div className="px-3 pb-3 pt-1 bg-surface-overlay/20">
                                <p className="text-[11px] text-text-secondary leading-relaxed">{sc.description}</p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })()}

                {/* Teljes leírás – fejlesztési segédlet */}
                {displayCls.description && (
                  <div className="border-t border-border py-3">
                    <button
                      onClick={() => setShowFullDesc(v => !v)}
                      className="text-[10px] font-semibold uppercase tracking-widest text-text-muted hover:text-white transition-colors"
                    >
                      {showFullDesc ? '▲ Teljes leírás elrejtése' : '▼ Teljes leírás mutatása'}
                    </button>
                    {showFullDesc && (
                      <pre className="mt-2 text-[10px] text-text-muted whitespace-pre-wrap leading-relaxed font-mono">
                        {displayCls.description}
                      </pre>
                    )}
                  </div>
                )}
              </div>
            )
          })() : (
            <div className="bg-surface-raised rounded-card p-4 h-full flex items-center justify-center">
              <p className="text-text-muted text-sm">Válassz kasztot a részletek megtekintéséhez</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
