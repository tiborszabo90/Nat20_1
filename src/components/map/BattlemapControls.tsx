import { useState } from 'react'
import { resizeBattlemap, updateBattlemapCells } from '../../services/firebase/battlemapService'
import { useBattlemapStore } from '../../store/battlemapStore'
import { BattlemapImageUpload } from './BattlemapImageUpload'
import type { BattlemapState, TerrainType } from '../../types/app/map'

interface BattlemapControlsProps {
  battlemap: BattlemapState
  campaignCode: string
}

export function BattlemapControls({ battlemap, campaignCode }: BattlemapControlsProps) {
  const [cols, setCols] = useState(battlemap.cols)
  const [rows, setRows] = useState(battlemap.rows)
  const [resizing, setResizing] = useState(false)
  const [clearing, setClearing] = useState(false)
  const setGridSizeLocal      = useBattlemapStore(s => s.setGridSizeLocal)
  const setBattlemapCellLocal = useBattlemapStore(s => s.setBattlemapCellLocal)

  async function handleResize() {
    if (cols === battlemap.cols && rows === battlemap.rows) return
    setResizing(true)
    try {
      setGridSizeLocal(cols, rows)
      await resizeBattlemap(campaignCode, cols, rows, battlemap.cells, battlemap.backgroundImageUrl)
    } finally {
      setResizing(false)
    }
  }

  async function handleClear() {
    if (Object.keys(battlemap.cells).length === 0) return
    setClearing(true)
    try {
      const changes: Record<string, TerrainType> = {}
      for (const key of Object.keys(battlemap.cells)) {
        changes[key] = 'floor'
        setBattlemapCellLocal(key, 'floor')
      }
      await updateBattlemapCells(campaignCode, changes)
    } finally {
      setClearing(false)
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-4 text-sm">
      {/* Háttérkép feltöltés */}
      <BattlemapImageUpload battlemap={battlemap} campaignCode={campaignCode} />

      {/* Grid méret */}
      <div className="flex items-center gap-2">
        <span className="text-text-muted">Oszlopok:</span>
        <input
          type="number"
          min={10}
          max={40}
          value={cols}
          onChange={e => setCols(Math.min(40, Math.max(10, Number(e.target.value))))}
          className="w-16 bg-surface-raised border border-border rounded-input px-2 py-1 text-white text-center"
        />
        <span className="text-text-muted">Sorok:</span>
        <input
          type="number"
          min={10}
          max={30}
          value={rows}
          onChange={e => setRows(Math.min(30, Math.max(10, Number(e.target.value))))}
          className="w-16 bg-surface-raised border border-border rounded-input px-2 py-1 text-white text-center"
        />
        <button
          onClick={handleResize}
          disabled={resizing || (cols === battlemap.cols && rows === battlemap.rows)}
          className="px-3 py-1 bg-neutral hover:bg-neutral-hover disabled:opacity-40 text-white rounded-input transition-colors"
        >
          {resizing ? 'Mentés...' : 'Méret alkalmazása'}
        </button>
      </div>

      {/* Terep törlés */}
      <button
        onClick={handleClear}
        disabled={clearing || Object.keys(battlemap.cells).length === 0}
        className="px-3 py-1 bg-danger hover:bg-danger-hover disabled:opacity-40 text-white rounded-input transition-colors"
      >
        {clearing ? 'Törlés...' : 'Térkép törlése'}
      </button>
    </div>
  )
}
