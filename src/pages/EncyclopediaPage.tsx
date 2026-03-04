import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDndDataStore } from '../store/dndDataStore'
import { SpellDetailCard } from '../components/character/sheet/SpellDetailCard'
import { EncyclopediaEntry } from '../components/encyclopedia/EncyclopediaEntry'
import { CLASS_SPELL_NAME } from '../data/dndConstants'

type EncyclopediaCategory = 'spells' | 'conditions' | 'classes' | 'species' | 'backgrounds'

const CATEGORIES: { id: EncyclopediaCategory; label: string; icon: string }[] = [
  { id: 'spells',      label: 'Varázsatok', icon: '✨' },
  { id: 'conditions',  label: 'Kondíciók',  icon: '🎭' },
  { id: 'classes',     label: 'Kasztok',    icon: '⚔️' },
  { id: 'species',     label: 'Fajok',      icon: '🌿' },
  { id: 'backgrounds', label: 'Hátterek',   icon: '📜' },
]

// Spell szintcímkék
const LEVEL_LABELS: Record<number, string> = {
  0: 'Cantrip', 1: '1. szint', 2: '2. szint', 3: '3. szint',
  4: '4. szint', 5: '5. szint', 6: '6. szint', 7: '7. szint',
  8: '8. szint', 9: '9. szint',
}

// Spell osztályszűrő értékei
const SPELL_CLASSES = Object.values(CLASS_SPELL_NAME)

export function EncyclopediaPage() {
  const navigate = useNavigate()
  const { spells: spellsMap, conditions, classes, species, backgrounds, isLoading } = useDndDataStore()

  const [category, setCategory] = useState<EncyclopediaCategory>('spells')
  const [search, setSearch] = useState('')
  const [levelFilter, setLevelFilter] = useState<number | 'all'>('all')
  const [classFilter, setClassFilter] = useState<string | 'all'>('all')

  function changeCategory(cat: EncyclopediaCategory) {
    setCategory(cat)
    setSearch('')
    setLevelFilter('all')
    setClassFilter('all')
  }

  // Szűrt varázsatlista – szint szerint rendezve
  const filteredSpells = useMemo(() => {
    return Array.from(spellsMap.values())
      .filter(s => {
        if (levelFilter !== 'all' && s.level !== levelFilter) return false
        if (classFilter !== 'all' && !s.classes.includes(classFilter)) return false
        if (search && !s.name.toLowerCase().includes(search.toLowerCase())) return false
        return true
      })
      .sort((a, b) => a.level !== b.level ? a.level - b.level : a.name.localeCompare(b.name))
  }, [spellsMap, levelFilter, classFilter, search])

  // Varázsatok szint szerint csoportosítva (csak "all" szintszűrőnél)
  const spellsByLevel = useMemo(() => {
    if (levelFilter !== 'all') return null
    const groups = new Map<number, typeof filteredSpells>()
    for (const spell of filteredSpells) {
      const existing = groups.get(spell.level) ?? []
      groups.set(spell.level, [...existing, spell])
    }
    return groups
  }, [filteredSpells, levelFilter])

  const searchLower = search.toLowerCase()
  const filteredConditions  = conditions.filter(c  => !search || c.name.toLowerCase().includes(searchLower))
  const filteredClasses     = classes.filter(c     => !search || c.name.toLowerCase().includes(searchLower))
  const filteredSpecies     = species.filter(s     => !search || s.name.toLowerCase().includes(searchLower))
  const filteredBackgrounds = backgrounds.filter(b => !search || b.name.toLowerCase().includes(searchLower))

  return (
    <div className="min-h-screen bg-surface-base text-white flex flex-col">
      {/* Fejléc */}
      <div className="px-4 pt-5 pb-3 border-b border-border-subtle flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="text-text-muted hover:text-white text-lg shrink-0"
        >
          ←
        </button>
        <p className="heading-s text-white">Tudástár</p>
      </div>

      {/* Kategória tabsok */}
      <div className="flex border-b border-border-subtle shrink-0">
        {CATEGORIES.map(cat => (
          <button
            key={cat.id}
            onClick={() => changeCategory(cat.id)}
            className={`flex-1 py-2.5 label-m transition-colors flex flex-col items-center gap-0.5 ${
              category === cat.id
                ? 'text-accent border-b-2 border-accent'
                : 'text-text-subtle hover:text-text-secondary'
            }`}
          >
            <span className="text-base leading-none">{cat.icon}</span>
            <span className="leading-none">{cat.label}</span>
          </button>
        ))}
      </div>

      {/* Keresősáv */}
      <div className="px-4 py-2 border-b border-border-subtle shrink-0">
        <input
          type="search"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Keresés..."
          className="w-full bg-surface-raised text-white rounded-btn px-4 py-2 text-sm placeholder-text-subtle outline-none focus:ring-1 focus:ring-accent"
        />
      </div>

      {/* Spell szűrők */}
      {category === 'spells' && (
        <div className="px-4 py-2 border-b border-border-subtle space-y-2 shrink-0">
          {/* Szintszűrő */}
          <div className="flex gap-1.5 flex-wrap">
            <FilterChip label="Mind" active={levelFilter === 'all'} onClick={() => setLevelFilter('all')} />
            <FilterChip label="C" active={levelFilter === 0}    onClick={() => setLevelFilter(0)} />
            {[1,2,3,4,5,6,7,8,9].map(lvl => (
              <FilterChip key={lvl} label={String(lvl)} active={levelFilter === lvl} onClick={() => setLevelFilter(lvl)} />
            ))}
          </div>
          {/* Osztályszűrő */}
          <div className="flex gap-1.5 flex-wrap">
            <FilterChip label="Minden kaszt" active={classFilter === 'all'} onClick={() => setClassFilter('all')} accent="violet" />
            {SPELL_CLASSES.map(cls => (
              <FilterChip key={cls} label={cls} active={classFilter === cls} onClick={() => setClassFilter(cls)} accent="violet" />
            ))}
          </div>
        </div>
      )}

      {/* Lista */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <p className="text-text-subtle text-sm text-center mt-12">Adatok betöltése...</p>
        ) : (
          <div className="p-4">

            {/* Varázsatok */}
            {category === 'spells' && (
              <>
                {filteredSpells.length === 0 && (
                  <p className="text-text-subtle text-sm text-center mt-8">Nincs találat.</p>
                )}
                {spellsByLevel
                  ? Array.from(spellsByLevel.entries()).map(([level, spells]) => (
                      <div key={level} className="mb-4">
                        <p className="label-m text-text-subtle mb-1">
                          {LEVEL_LABELS[level]}
                        </p>
                        <div className="bg-surface-raised rounded-card px-4 py-1 divide-y divide-gray-700/50">
                          {spells.map(spell => (
                            <SpellDetailCard key={spell.key} spell={spell} icon="◆" accentColor="amber" />
                          ))}
                        </div>
                      </div>
                    ))
                  : (
                    <div className="bg-surface-raised rounded-card px-4 py-1 divide-y divide-gray-700/50">
                      {filteredSpells.map(spell => (
                        <SpellDetailCard key={spell.key} spell={spell} icon="◆" accentColor="amber" />
                      ))}
                    </div>
                  )
                }
              </>
            )}

            {/* Kondíciók */}
            {category === 'conditions' && (
              <>
                {filteredConditions.length === 0
                  ? <p className="text-gray-500 text-sm text-center mt-8">Nincs találat.</p>
                  : <div className="bg-gray-800 rounded-2xl px-4 py-1 divide-y divide-gray-700/50">
                      {filteredConditions.map(c => (
                        <EncyclopediaEntry key={c.key} name={c.name} description={c.desc} />
                      ))}
                    </div>
                }
              </>
            )}

            {/* Kasztok */}
            {category === 'classes' && (
              <>
                {filteredClasses.length === 0
                  ? <p className="text-gray-500 text-sm text-center mt-8">Nincs találat.</p>
                  : <div className="bg-gray-800 rounded-2xl px-4 py-1 divide-y divide-gray-700/50">
                      {filteredClasses.map(c => (
                        <EncyclopediaEntry key={c.key} name={c.name} description={c.description} />
                      ))}
                    </div>
                }
              </>
            )}

            {/* Fajok */}
            {category === 'species' && (
              <>
                {filteredSpecies.length === 0
                  ? <p className="text-gray-500 text-sm text-center mt-8">Nincs találat.</p>
                  : <div className="bg-gray-800 rounded-2xl px-4 py-1 divide-y divide-gray-700/50">
                      {filteredSpecies.map(s => (
                        <EncyclopediaEntry key={s.key} name={s.name} description={s.description} />
                      ))}
                    </div>
                }
              </>
            )}

            {/* Hátterek */}
            {category === 'backgrounds' && (
              <>
                {filteredBackgrounds.length === 0
                  ? <p className="text-gray-500 text-sm text-center mt-8">Nincs találat.</p>
                  : <div className="bg-gray-800 rounded-2xl px-4 py-1 divide-y divide-gray-700/50">
                      {filteredBackgrounds.map(b => (
                        <EncyclopediaEntry key={b.key} name={b.name} description={b.description} />
                      ))}
                    </div>
                }
              </>
            )}

          </div>
        )}
      </div>
    </div>
  )
}

function FilterChip({
  label, active, onClick, accent = 'amber',
}: {
  label: string
  active: boolean
  onClick: () => void
  accent?: 'amber' | 'violet'
}) {
  const activeClass = accent === 'violet'
    ? 'bg-violet-600 text-white border-violet-500'
    : 'bg-amber-600 text-white border-amber-500'

  return (
    <button
      onClick={onClick}
      className={`label-m px-2.5 py-1 rounded-badge border transition-colors ${
        active ? activeClass : 'bg-surface-raised text-text-muted border-border hover:border-border-hover'
      }`}
    >
      {label}
    </button>
  )
}
