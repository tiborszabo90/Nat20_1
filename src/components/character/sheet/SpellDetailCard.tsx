import { useState } from 'react'
import type { Spell } from '../../../types/dnd/spell'

interface Props {
  spell: Spell
  icon?: string
  accentColor?: 'amber' | 'violet'
  note?: string
}

export function SpellDetailCard({ spell, icon = '◆', accentColor = 'amber', note }: Props) {
  const [open, setOpen] = useState(false)

  const iconColor  = accentColor === 'violet' ? 'text-violet-400' : 'text-amber-400'
  const titleColor = accentColor === 'violet' ? 'text-violet-300' : 'text-amber-300'

  return (
    <div className="rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-2 text-left py-1.5 px-0"
      >
        <span className={`${iconColor} text-xs shrink-0`}>{icon}</span>
        <span className="text-white text-sm flex-1">{spell.name}</span>
        <div className="flex items-center gap-1.5 shrink-0">
          {note && <span className="text-violet-500 text-xs">{note}</span>}
          {spell.concentration && <span className="text-cyan-500 text-xs font-bold">C</span>}
          {spell.ritual       && <span className="text-emerald-500 text-xs font-bold">R</span>}
          {spell.school       && <span className="text-gray-500 text-xs">{spell.school}</span>}
          <span className="text-gray-600 text-xs ml-0.5">{open ? '▲' : '▼'}</span>
        </div>
      </button>

      {open && (
        <div className="ml-4 mb-2 bg-gray-900/80 border border-gray-700 rounded-xl p-3 space-y-2.5">
          {/* Stat sorok */}
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
            <StatLine label="Casting Time" value={spell.castingTime} />
            <StatLine label="Range"        value={spell.range} />
            <StatLine label="Duration"     value={spell.duration} />
            <StatLine label="Components"   value={spell.components} />
            {spell.material   && <div className="col-span-2"><StatLine label="Material"  value={spell.material} italic /></div>}
            {spell.savingThrow && <StatLine label="Save"      value={spell.savingThrow} />}
            {spell.damageType  && <StatLine label="Damage"    value={spell.damageType} />}
          </div>

          {/* Leírás */}
          {spell.description && (
            <p className="text-gray-300 text-xs leading-relaxed whitespace-pre-line">
              {spell.description}
            </p>
          )}

          {/* Magasabb szinten */}
          {spell.higherLevel && (
            <p className="text-xs text-gray-400">
              <span className={`font-semibold ${titleColor}`}>Higher Levels: </span>
              {spell.higherLevel}
            </p>
          )}
        </div>
      )}
    </div>
  )
}

function StatLine({ label, value, italic }: { label: string; value: string; italic?: boolean }) {
  return (
    <div>
      <span className="text-gray-500">{label}: </span>
      <span className={`text-gray-300 ${italic ? 'italic' : ''}`}>{value}</span>
    </div>
  )
}
