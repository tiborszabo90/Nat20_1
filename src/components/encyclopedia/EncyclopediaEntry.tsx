import { useState } from 'react'

interface Props {
  name: string
  description: string
  tags?: string[]
}

export function EncyclopediaEntry({ name, description, tags }: Props) {
  const [open, setOpen] = useState(false)

  return (
    <div>
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-2 text-left py-2"
      >
        <span className="text-white text-sm font-semibold flex-1">{name}</span>
        {tags && tags.length > 0 && (
          <div className="flex gap-1 shrink-0">
            {tags.map(tag => (
              <span key={tag} className="text-xs bg-gray-700 text-gray-300 px-1.5 py-0.5 rounded-full">
                {tag}
              </span>
            ))}
          </div>
        )}
        <span className="text-gray-600 text-xs shrink-0 ml-1">{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div className="mb-2 bg-gray-900/80 border border-gray-700 rounded-xl p-3">
          <p className="text-gray-300 text-xs leading-relaxed whitespace-pre-line">{description}</p>
        </div>
      )}
    </div>
  )
}
