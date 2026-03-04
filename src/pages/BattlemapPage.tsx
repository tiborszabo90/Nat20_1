import { useEffect, useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useCampaignStore } from '../store/campaignStore'
import { useBattlemapStore } from '../store/battlemapStore'
import { useBattlemapSync } from '../hooks/useBattlemapSync'
import { initBattlemap, addBattlemapToken } from '../services/firebase/battlemapService'
import { BattlemapCanvas } from '../components/map/BattlemapCanvas'
import { BattlemapControls } from '../components/map/BattlemapControls'
import { TokenPanel } from '../components/map/TokenPanel'
import type { BattlemapToken } from '../types/app/map'

const DEFAULT_COLS = 20
const DEFAULT_ROWS = 15

export function BattlemapPage() {
  const { campaignId } = useParams<{ campaignId: string }>()
  const navigate = useNavigate()

  const setCampaign = useCampaignStore(s => s.setCampaign)
  const role = useCampaignStore(s => s.role)
  const campaignCode = useCampaignStore(s => s.campaignCode)

  const battlemap = useBattlemapStore(s => s.battlemap)
  const selectedTokenId = useBattlemapStore(s => s.selectedTokenId)
  const setSelectedTokenId = useBattlemapStore(s => s.setSelectedTokenId)
  const [placingToken, setPlacingToken] = useState<BattlemapToken | null>(null)

  const handleTokenPlace = useCallback((col: number, row: number) => {
    if (!placingToken || !campaignCode) return
    addBattlemapToken(campaignCode, { ...placingToken, col, row })
    setPlacingToken(null)
  }, [placingToken, campaignCode])

  // Store inicializálás (pl. ha direkt URL-ről érkezik a felhasználó)
  useEffect(() => {
    if (campaignId && !campaignCode) {
      // Szerepet nem tudjuk meghatározni direkt URL-ről, alapból DM
      setCampaign(campaignId, '', 'dm')
    }
  }, [campaignId, campaignCode, setCampaign])

  // Firestore realtime szinkron
  useBattlemapSync()

  // DM: ha még nincs battlemap, auto-init
  useEffect(() => {
    if (role === 'dm' && campaignCode && battlemap === null) {
      // null = snapshot megérkezett, de nincs doc; undefined = még tölt
      // A store null-ra áll, ha a doc nem létezik
      initBattlemap(campaignCode, DEFAULT_COLS, DEFAULT_ROWS)
    }
  }, [role, campaignCode, battlemap])

  const isDm = role === 'dm'
  const backPath = isDm
    ? `/dm/${campaignId}`
    : `/player/${campaignId}/sheet`

  return (
    <div className="h-screen bg-surface-base text-white flex overflow-hidden">
      {/* Bal oldali hasáb */}
      <div className="w-64 shrink-0 flex flex-col border-r border-border-subtle overflow-y-auto">
        {/* Fejléc */}
        <div className="px-4 pt-5 pb-4 border-b border-border-subtle">
          <div className="flex items-center gap-3 mb-3">
            <button
              onClick={() => navigate(backPath)}
              className="text-text-muted hover:text-white text-lg"
              aria-label="Vissza"
            >
              ←
            </button>
            <div>
              <h1 className="heading-s text-white leading-tight">Battlemap</h1>
              <p className="body-s text-accent">
                {isDm ? 'DM – szerkesztés' : 'Játékos – megtekintés'}
              </p>
            </div>
          </div>
          <span className="font-mono text-text-subtle body-s">{campaignId}</span>
        </div>

        {/* DM eszközök */}
        {isDm && battlemap && (
          <div className="px-4 py-4 space-y-4">
            <BattlemapControls battlemap={battlemap} campaignCode={campaignCode!} />
            <TokenPanel
              battlemap={battlemap}
              campaignCode={campaignCode!}
              placingToken={placingToken}
              onStartPlacing={setPlacingToken}
              onCancelPlacing={() => setPlacingToken(null)}
            />
          </div>
        )}
      </div>

      {/* Canvas terület */}
      <div className="flex-1 overflow-hidden">
        {battlemap === null ? (
          <div className="h-full flex items-center justify-center">
            <p className="body-m text-text-subtle">
              {isDm ? 'Térkép inicializálása...' : 'Nincs aktív térkép. Várj a DM-re.'}
            </p>
          </div>
        ) : (
          <BattlemapCanvas
            battlemap={battlemap}
            campaignCode={campaignCode!}
            isEditable={isDm}
            selectedTokenId={selectedTokenId}
            placingToken={placingToken}
            onTokenPlace={handleTokenPlace}
            onTokenSelect={setSelectedTokenId}
          />
        )}
      </div>
    </div>
  )
}
