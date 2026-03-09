import { useEffect, useRef } from 'react'
import {
  Application,
  Container,
  Graphics,
  Sprite,
  Text,
  Assets,
  type Texture,
} from 'pixi.js'
import { moveBattlemapToken } from '../../services/firebase/battlemapService'
import { useBattlemapStore } from '../../store/battlemapStore'
import type { BattlemapState, BattlemapToken } from '../../types/app/map'

const CELL_SIZE = 32

function redrawGrid(g: Graphics, cols: number, rows: number) {
  g.clear()
  for (let c = 0; c <= cols; c++) {
    g.moveTo(c * CELL_SIZE, 0).lineTo(c * CELL_SIZE, rows * CELL_SIZE)
  }
  for (let r = 0; r <= rows; r++) {
    g.moveTo(0, r * CELL_SIZE).lineTo(cols * CELL_SIZE, r * CELL_SIZE)
  }
  g.stroke({ color: 0x4b5563, width: 1, alpha: 0.5 })
}

async function loadBgImage(
  container: Container,
  url: string | null,
  cols: number,
  rows: number
) {
  container.removeChildren()
  if (!url) return
  let texture: Texture
  try {
    texture = await Assets.load<Texture>(url)
  } catch {
    return
  }
  const sprite = new Sprite(texture)
  sprite.width = cols * CELL_SIZE
  sprite.height = rows * CELL_SIZE
  container.addChild(sprite)
}

function hexToNumber(hex: string): number {
  return parseInt(hex.replace('#', ''), 16)
}

function redrawTokens(
  container: Container,
  tokens: Record<string, BattlemapToken>,
  selectedId: string | null
) {
  container.removeChildren()
  for (const token of Object.values(tokens)) {
    const cellCount = token.tokenSize ?? 1
    const radius = CELL_SIZE * cellCount / 2 * 0.9
    const cx = token.col * CELL_SIZE + CELL_SIZE * cellCount / 2
    const cy = token.row * CELL_SIZE + CELL_SIZE * cellCount / 2
    const color = hexToNumber(token.color)
    const isSelected = token.id === selectedId

    const circle = new Graphics()
    // Kiválasztott token köré amber kiemelő gyűrű
    if (isSelected) {
      circle.circle(0, 0, radius + 4).stroke({ color: 0xfbbf24, width: 3, alpha: 1 })
    }
    circle.circle(0, 0, radius).fill({ color, alpha: 0.9 })
    circle.circle(0, 0, radius).stroke({ color: 0xffffff, width: 1.5, alpha: 0.6 })
    circle.x = cx
    circle.y = cy

    const label = new Text({
      text: token.label.slice(0, 2).toUpperCase(),
      style: {
        fontSize: Math.round(CELL_SIZE * cellCount * 0.35),
        fill: 0xffffff,
        fontWeight: 'bold',
        align: 'center',
      },
    })
    label.anchor.set(0.5)
    label.x = cx
    label.y = cy

    container.addChild(circle)
    container.addChild(label)
  }
}

function clamp(val: number, min: number, max: number) {
  return Math.min(max, Math.max(min, val))
}

interface BattlemapCanvasProps {
  battlemap: BattlemapState
  campaignCode: string
  isEditable: boolean
  playerCharacterId?: string | null
  selectedTokenId: string | null
  placingToken: BattlemapToken | null
  onTokenPlace: (col: number, row: number) => void
  onTokenSelect: (tokenId: string) => void
}

export function BattlemapCanvas({
  battlemap,
  campaignCode,
  isEditable,
  playerCharacterId,
  selectedTokenId,
  placingToken,
  onTokenPlace,
  onTokenSelect,
}: BattlemapCanvasProps) {
  const moveTokenLocal = useBattlemapStore(s => s.moveTokenLocal)

  const wrapperRef = useRef<HTMLDivElement>(null)

  // Ref-ek a stale closure elkerülésére
  const battlemapRef           = useRef(battlemap)
  const isEditableRef          = useRef(isEditable)
  const playerCharacterIdRef   = useRef(playerCharacterId)
  const placingTokenRef        = useRef(placingToken)
  const onTokenPlaceRef        = useRef(onTokenPlace)
  const onTokenSelectRef       = useRef(onTokenSelect)
  const moveTokenLocalRef      = useRef(moveTokenLocal)
  useEffect(() => { battlemapRef.current = battlemap },                   [battlemap])
  useEffect(() => { isEditableRef.current = isEditable },                 [isEditable])
  useEffect(() => { playerCharacterIdRef.current = playerCharacterId },   [playerCharacterId])
  useEffect(() => { placingTokenRef.current = placingToken },             [placingToken])
  useEffect(() => { onTokenPlaceRef.current = onTokenPlace },             [onTokenPlace])
  useEffect(() => { onTokenSelectRef.current = onTokenSelect },           [onTokenSelect])
  useEffect(() => { moveTokenLocalRef.current = moveTokenLocal },         [moveTokenLocal])

  // PixiJS réteg ref-ek
  const viewportRef      = useRef<Container | null>(null)
  const bgContainerRef   = useRef<Container | null>(null)
  const gridRef          = useRef<Graphics | null>(null)
  const tokensLayerRef   = useRef<Container | null>(null)
  const selectedTokenRef = useRef(selectedTokenId)
  useEffect(() => { selectedTokenRef.current = selectedTokenId }, [selectedTokenId])

  // ──────────────────────────────────────────────
  // Init – egyszer fut
  // ──────────────────────────────────────────────
  useEffect(() => {
    const wrapper = wrapperRef.current
    if (!wrapper) return

    let cancelled = false
    let initializedApp: Application | null = null
    let isPanning        = false
    let isDragging       = false
    let dragTokenId      = ''
    let clickCandidateId = '' // Kattintás jelölt (ha nem dragelt, select)
    let panStartX = 0, panStartY = 0
    let panOriginX = 0, panOriginY = 0

    const initApp = async () => {
      const app = new Application()
      try {
        await app.init({
          resizeTo: wrapper,
          background: 0x030712,
          antialias: false,
          autoDensity: true,
          resolution: window.devicePixelRatio ?? 1,
        })
      } catch {
        return
      }

      if (cancelled) { app.destroy(true); return }

      initializedApp = app
      wrapper.appendChild(app.canvas)

      const viewport    = new Container()
      const bgContainer = new Container()
      const grid        = new Graphics()
      const tokensLayer = new Container()

      app.stage.addChild(viewport)
      viewport.addChild(bgContainer)
      viewport.addChild(grid)
      viewport.addChild(tokensLayer)

      viewportRef.current    = viewport
      bgContainerRef.current = bgContainer
      gridRef.current        = grid
      tokensLayerRef.current = tokensLayer

      const bm = battlemapRef.current
      redrawGrid(grid, bm.cols, bm.rows)
      redrawTokens(tokensLayer, bm.tokens, selectedTokenRef.current)
      loadBgImage(bgContainer, bm.backgroundImageUrl, bm.cols, bm.rows)

      // Térkép kezdeti pozíció: középre igazítva, teljes méretben kifér
      const mapW = bm.cols * CELL_SIZE
      const mapH = bm.rows * CELL_SIZE
      const fitScale = clamp(
        Math.min(wrapper.clientWidth / mapW, wrapper.clientHeight / mapH) * 0.95,
        0.2, 4
      )
      viewport.scale.set(fitScale)
      viewport.x = (wrapper.clientWidth  - mapW * fitScale) / 2
      viewport.y = (wrapper.clientHeight - mapH * fitScale) / 2

      const cv = app.canvas

      function getCellFromEvent(e: MouseEvent): { col: number; row: number } | null {
        const vp = viewportRef.current
        if (!vp) return null
        const bounds = cv.getBoundingClientRect()
        const worldX = (e.clientX - bounds.left - vp.x) / vp.scale.x
        const worldY = (e.clientY - bounds.top  - vp.y) / vp.scale.y
        const col = Math.floor(worldX / CELL_SIZE)
        const row = Math.floor(worldY / CELL_SIZE)
        const cur = battlemapRef.current
        if (col >= 0 && col < cur.cols && row >= 0 && row < cur.rows) {
          return { col, row }
        }
        return null
      }

      function getTokenAtCell(col: number, row: number): BattlemapToken | null {
        const tokens = battlemapRef.current.tokens
        return Object.values(tokens).find(t => {
          const s = t.tokenSize ?? 1
          return col >= t.col && col < t.col + s && row >= t.row && row < t.row + s
        }) ?? null
      }

      // ── Zoom ──
      cv.addEventListener('wheel', (e) => {
        e.preventDefault()
        const vp = viewportRef.current
        if (!vp) return
        const factor   = e.deltaY < 0 ? 1.15 : 1 / 1.15
        const newScale = clamp(vp.scale.x * factor, 0.2, 4)
        const bounds   = cv.getBoundingClientRect()
        const mouseX   = e.clientX - bounds.left
        const mouseY   = e.clientY - bounds.top
        const worldX   = (mouseX - vp.x) / vp.scale.x
        const worldY   = (mouseY - vp.y) / vp.scale.y
        vp.scale.set(newScale)
        vp.x = mouseX - worldX * newScale
        vp.y = mouseY - worldY * newScale
      }, { passive: false })

      // ── Egér le ──
      cv.addEventListener('mousedown', (e) => {
        if (e.button === 0) {
          const cell = getCellFromEvent(e)
          if (!cell) return

          // Token elhelyezése (placing mode)
          if (placingTokenRef.current) {
            onTokenPlaceRef.current(cell.col, cell.row)
            return
          }

          // Token drag vagy select – DM: bármely token; Játékos: csak saját token
          const token = getTokenAtCell(cell.col, cell.row)
          if (token) {
            const canDrag = isEditableRef.current ||
              (playerCharacterIdRef.current !== null &&
               playerCharacterIdRef.current !== undefined &&
               token.characterId === playerCharacterIdRef.current)
            if (canDrag) {
              clickCandidateId = token.id
              return
            }
          }
        }

        if (e.button === 2) {
          isPanning  = true
          panStartX  = e.clientX
          panStartY  = e.clientY
          panOriginX = viewportRef.current?.x ?? 0
          panOriginY = viewportRef.current?.y ?? 0
        }
      })

      // ── Egér mozgás ──
      cv.addEventListener('mousemove', (e) => {
        // Ha volt kattintásjelölt és elkezdett mozogni → drag indul
        if (clickCandidateId) {
          isDragging       = true
          dragTokenId      = clickCandidateId
          clickCandidateId = ''
        }
        if (isDragging && dragTokenId) {
          const cell = getCellFromEvent(e)
          if (cell) moveTokenLocalRef.current(dragTokenId, cell.col, cell.row)
        }
        if (isPanning && viewportRef.current) {
          viewportRef.current.x = panOriginX + (e.clientX - panStartX)
          viewportRef.current.y = panOriginY + (e.clientY - panStartY)
        }
      })

      // ── Egér fel ──
      const handleMouseUp = (e: MouseEvent) => {
        if (e.button === 0) {
          if (isDragging && dragTokenId) {
            // Drag befejezése – Firestore write
            const cell = getCellFromEvent(e)
            if (cell) {
              moveBattlemapToken(campaignCode, dragTokenId, cell.col, cell.row)
            }
            isDragging  = false
            dragTokenId = ''
          } else if (clickCandidateId) {
            // Kattintás drag nélkül → token kiválasztás
            onTokenSelectRef.current(clickCandidateId)
            clickCandidateId = ''
          }
        }
        if (e.button === 2) isPanning = false
      }
      cv.addEventListener('mouseup', handleMouseUp)
      window.addEventListener('mouseup', handleMouseUp)
      cv.addEventListener('contextmenu', (e) => e.preventDefault())
    }

    initApp()

    return () => {
      cancelled = true
      if (initializedApp) {
        initializedApp.canvas.remove()
        initializedApp.destroy(true)
        initializedApp = null
      }
      viewportRef.current    = null
      bgContainerRef.current = null
      gridRef.current        = null
      tokensLayerRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── Rács újrarajzolás + viewport újraközépre igazítás méretváltozáskor ──
  useEffect(() => {
    if (!gridRef.current) return
    redrawGrid(gridRef.current, battlemap.cols, battlemap.rows)

    const vp = viewportRef.current
    const wrapper = wrapperRef.current
    if (!vp || !wrapper) return
    const mapW = battlemap.cols * CELL_SIZE
    const mapH = battlemap.rows * CELL_SIZE
    const fitScale = clamp(
      Math.min(wrapper.clientWidth / mapW, wrapper.clientHeight / mapH) * 0.95,
      0.2, 4
    )
    vp.scale.set(fitScale)
    vp.x = (wrapper.clientWidth  - mapW * fitScale) / 2
    vp.y = (wrapper.clientHeight - mapH * fitScale) / 2
  }, [battlemap.cols, battlemap.rows])

  // ── Tokenek újrarajzolás (tokenek vagy kiválasztás változásakor) ──
  useEffect(() => {
    if (!tokensLayerRef.current) return
    redrawTokens(tokensLayerRef.current, battlemap.tokens, selectedTokenId)
  }, [battlemap.tokens, selectedTokenId])

  // ── Háttérkép frissítés ──
  useEffect(() => {
    if (!bgContainerRef.current) return
    loadBgImage(bgContainerRef.current, battlemap.backgroundImageUrl, battlemap.cols, battlemap.rows)
  }, [battlemap.backgroundImageUrl, battlemap.cols, battlemap.rows])

  const cursor = placingToken ? 'copy' : isEditable ? 'default' : playerCharacterId ? 'grab' : 'grab'

  return (
    <div
      ref={wrapperRef}
      className="w-full h-full"
      style={{ cursor }}
    />
  )
}
