import { useEffect, useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useCampaignStore } from '../store/campaignStore'
import { useBattlemapStore } from '../store/battlemapStore'
import { useCharacterStore } from '../store/characterStore'
import { useCombatStore } from '../store/combatStore'
import { useAuthStore } from '../store/authStore'
import { useDndDataStore } from '../store/dndDataStore'
import { useBattlemapSync } from '../hooks/useBattlemapSync'
import { useCombatSync } from '../hooks/useCombatSync'
import { useFirestoreSync } from '../hooks/useFirestoreSync'
import { useDndMonsterIndex } from '../hooks/useDndMonsterIndex'
import { initBattlemap, addBattlemapToken } from '../services/firebase/battlemapService'
import {
  startInitiative,
  submitParticipant,
  startCombat,
  nextTurn,
  stopCombat,
} from '../services/firebase/combatService'
import { getAbilityModifier } from '../data/dndConstants'
import { fetchMonsterBySlug } from '../services/dnd-data/dndDataService'
import { BattlemapCanvas } from '../components/map/BattlemapCanvas'
import { BattlemapControls } from '../components/map/BattlemapControls'
import { TokenPanel } from '../components/map/TokenPanel'
import { TokenInfoModal } from '../components/map/TokenInfoModal'
import { InitiativeModal } from '../components/map/InitiativeModal'
import { CombatTurnPanel } from '../components/map/CombatTurnPanel'
import type { BattlemapToken } from '../types/app/map'

const DEFAULT_COLS = 30
const DEFAULT_ROWS = 30

export function BattlemapPage() {
  const { campaignId } = useParams<{ campaignId: string }>()
  const navigate = useNavigate()

  const setCampaign = useCampaignStore(s => s.setCampaign)
  const role = useCampaignStore(s => s.role)
  const campaignCode = useCampaignStore(s => s.campaignCode)
  const players = useCampaignStore(s => s.players)

  const battlemap = useBattlemapStore(s => s.battlemap)
  const selectedTokenId = useBattlemapStore(s => s.selectedTokenId)
  const setSelectedTokenId = useBattlemapStore(s => s.setSelectedTokenId)
  const [placingToken, setPlacingToken] = useState<BattlemapToken | null>(null)

  const character = useCharacterStore(s => s.character)
  const combat = useCombatStore(s => s.combat)
  const uid = useAuthStore(s => s.uid)
  const monsterCache = useDndDataStore(s => s.monsterCache)
  const cacheMonster = useDndDataStore(s => s.cacheMonster)

  // Combat DM state – szörnyenként a d20 dobás értéke + globális szerkesztés mód
  const [monsterD20Values, setMonsterD20Values] = useState<Record<string, string>>({})
  const [editingEnemyInitiatives, setEditingEnemyInitiatives] = useState(false)
  const [starting, setStarting]   = useState(false)
  const [advancing, setAdvancing] = useState(false)
  const [stopping, setStopping]   = useState(false)
  const [showMapSettings, setShowMapSettings] = useState(false)

  // Combat player state
  const [d20, setD20]             = useState<number>(1)
  const [submitting, setSubmitting] = useState(false)

  // Játékos meglévő tokenjének azonosítása
  const playerToken = character && battlemap
    ? Object.values(battlemap.tokens).find(t => t.characterId === character.id) ?? null
    : null

  const handleTokenPlace = useCallback((col: number, row: number) => {
    if (!placingToken || !campaignCode) return
    addBattlemapToken(campaignCode, { ...placingToken, col, row })
    setPlacingToken(null)
  }, [placingToken, campaignCode])

  // Játékos saját tokenjének elhelyezése
  const handlePlayerPlaceToken = useCallback(() => {
    if (!character) return
    const template: BattlemapToken = {
      id: `player-${character.id}`,
      col: 0,
      row: 0,
      type: 'character',
      characterId: character.id,
      label: character.name.slice(0, 2).toUpperCase(),
      color: '#6366f1',
    }
    setPlacingToken(template)
  }, [character])

  // Store inicializálás (pl. ha direkt URL-ről érkezik a felhasználó)
  useEffect(() => {
    if (campaignId && !campaignCode) {
      setCampaign(campaignId, '', 'dm')
    }
  }, [campaignId, campaignCode, setCampaign])

  // Firestore realtime szinkronok
  useBattlemapSync()
  useCombatSync()
  useFirestoreSync()
  useDndMonsterIndex() // Monster névindex háttérbetöltése (TokenPanel keresőhöz)

  // DM: ha még nincs battlemap, auto-init
  useEffect(() => {
    if (role === 'dm' && campaignCode && battlemap === null) {
      initBattlemap(campaignCode, DEFAULT_COLS, DEFAULT_ROWS)
    }
  }, [role, campaignCode, battlemap])

  // Initiative fázis: szörny d20 input értékek inicializálása (már beküldötteknél a d20Roll töltődik vissza)
  useEffect(() => {
    if (combat?.phase !== 'initiative') return
    setMonsterD20Values(prev => {
      const next: Record<string, string> = { ...prev }
      for (const [id, p] of Object.entries(combat.participants)) {
        if (p.type === 'monster' && !(id in next)) {
          next[id] = p.d20Roll !== null ? String(p.d20Roll) : ''
        }
      }
      return next
    })
  }, [combat])

  // --- Combat handlers ---
  const handleStartInitiative = async () => {
    if (!campaignCode || !battlemap) return
    setStarting(true)
    try {
      // Hiányzó monsterek párhuzamos fetch-je a cache-be (ha monsterIndex sem tartalmazza)
      const encounterTokens = Object.values(battlemap.tokens).filter(t => t.type === 'encounter' && t.monsterKey)
      await Promise.all(
        encounterTokens
          .filter(t => !monsterCache.has(t.monsterKey!))
          .map(t => fetchMonsterBySlug(t.monsterKey!).then(m => { if (m) cacheMonster(m) }))
      )
      // Szörny DEX modok kiszámítása: cache → 0
      const dexMods: Record<string, number> = {}
      for (const token of encounterTokens) {
        const monster = token.monsterKey ? monsterCache.get(token.monsterKey) : undefined
        dexMods[token.id] = monster ? getAbilityModifier(monster.dex) : 0
      }
      await startInitiative(campaignCode, dexMods)
    } finally {
      setStarting(false)
    }
  }

  const handleMonsterSubmit = async (monsterId: string) => {
    if (!campaignCode || !combat) return
    const d20Roll = parseInt(monsterD20Values[monsterId] ?? '', 10)
    if (isNaN(d20Roll)) return
    const p = combat.participants[monsterId]
    if (!p) return
    const total = d20Roll + (p.dexMod ?? 0)
    await submitParticipant(campaignCode, { ...p, d20Roll, total })
  }

  // Szerkesztés mód: minden ellenfél d20 értékét visszatölti a jelenlegi d20Roll alapján
  const handleEditEnemyInitiatives = () => {
    if (!combat) return
    setMonsterD20Values(prev => {
      const next = { ...prev }
      for (const [id, p] of Object.entries(combat.participants)) {
        if (p.type === 'monster') next[id] = p.d20Roll !== null ? String(p.d20Roll) : ''
      }
      return next
    })
    setEditingEnemyInitiatives(true)
  }

  const handleStartCombat = async () => {
    if (!campaignCode || !combat) return
    setStarting(true)
    try { await startCombat(campaignCode, combat.participants) } finally { setStarting(false) }
  }

  const handleNextTurn = async () => {
    if (!campaignCode || !combat) return
    setAdvancing(true)
    try { await nextTurn(campaignCode, combat.turnOrder, combat.currentTurnIndex, combat.round) } finally { setAdvancing(false) }
  }

  const handleStopCombat = async () => {
    if (!campaignCode) return
    setStopping(true)
    try { await stopCombat(campaignCode) } finally { setStopping(false) }
  }

  const handlePlayerSubmitInitiative = async () => {
    if (!campaignCode || !uid || !character) return
    const dexMod = getAbilityModifier(character.abilityScores.DEX)
    setSubmitting(true)
    try {
      await submitParticipant(campaignCode, {
        id: `player-${uid}`,
        name: character.name,
        type: 'player',
        playerUid: uid,
        dexMod,
        d20Roll: d20,
        total: d20 + dexMod,
      })
    } finally {
      setSubmitting(false)
    }
  }

  const isDm = role === 'dm'
  const backPath = isDm ? `/dm/${campaignId}` : `/player/${campaignId}/sheet`

  // Encounter token modal
  const selectedToken = selectedTokenId && battlemap ? battlemap.tokens[selectedTokenId] ?? null : null
  const encounterModalToken = selectedToken?.type === 'encounter' ? selectedToken : null

  // Derived combat values
  const monsters = combat ? Object.values(combat.participants).filter(p => p.type === 'monster') : []
  const hasAnyParticipant = combat ? Object.keys(combat.participants).length > 0 : false
  const playerParticipantId = uid ? `player-${uid}` : null
  const playerAlreadySubmitted = !!(playerParticipantId && combat?.participants[playerParticipantId])
  // Összes résztvevő (játékos + ellenfél) beküldte az initiative-ét
  const allInitiativeSubmitted = combat?.phase === 'initiative'
    ? players.every(pl => `player-${pl.uid}` in combat.participants) &&
      Object.values(combat.participants).filter(p => p.type === 'monster').every(p => p.total !== null)
    : true

  // Tooltip: miért disabled a "Körök indítása" gomb
  const startCombatBlockReason = (() => {
    if (!hasAnyParticipant) return 'Nincsenek harc résztvevők'
    if (combat?.phase !== 'initiative') return null
    const waitingPlayers = players.filter(pl => !(`player-${pl.uid}` in combat.participants))
    if (waitingPlayers.length > 0)
      return `Várakozás: ${waitingPlayers.map(p => p.displayName).join(', ')}`
    const waitingEnemies = Object.values(combat.participants).filter(p => p.type === 'monster' && p.total === null)
    if (waitingEnemies.length > 0)
      return `Hiányzó ellenfél initiative: ${waitingEnemies.map(p => p.name).join(', ')}`
    return null
  })()
  const dexMod = character ? getAbilityModifier(character.abilityScores.DEX) : 0

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
            <div className="flex-1 min-w-0">
              <h1 className="heading-s text-white leading-tight">Battlemap</h1>
              <p className="body-s text-accent">
                {isDm ? 'DM – szerkesztés' : 'Játékos'}
              </p>
            </div>
          </div>
          <span className="font-mono text-text-subtle body-s">{campaignId}</span>
        </div>

        {/* DM eszközök */}
        {isDm && battlemap && (
          <div className="px-4 py-4 space-y-4">
            {/* Térkép beállítások – összecsukható */}
            <div>
              <button
                onClick={() => setShowMapSettings(s => !s)}
                className="w-full flex items-center justify-between text-xs font-display uppercase tracking-widest text-text-muted hover:text-white transition-colors py-1"
              >
                <span>Térkép beállítások</span>
                <span>{showMapSettings ? '▲' : '▼'}</span>
              </button>
              {showMapSettings && (
                <div className="mt-3">
                  <BattlemapControls battlemap={battlemap} campaignCode={campaignCode!} />
                </div>
              )}
            </div>
            <TokenPanel
              battlemap={battlemap}
              campaignCode={campaignCode!}
              placingToken={placingToken}
              onStartPlacing={setPlacingToken}
              onCancelPlacing={() => setPlacingToken(null)}
              hideActiveTokens={combat?.phase === 'combat'}
            />

            {/* Combat fázisban körök blokk váltja fel az aktív tokeneket */}
            {combat?.phase === 'combat' && (
              <>
                <CombatTurnPanel
                  combat={combat}
                  battlemap={battlemap}
                  campaignCode={campaignCode!}
                />
                <div className="flex gap-2 pt-2">
                  <button
                    onClick={handleNextTurn}
                    disabled={advancing}
                    className="flex-1 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-gray-950 font-semibold text-xs py-2 px-3 rounded-btn transition-colors"
                  >
                    {advancing ? '...' : 'Következő →'}
                  </button>
                  <button
                    onClick={handleStopCombat}
                    disabled={stopping}
                    className="text-text-muted hover:text-red-400 text-xs border border-border rounded-btn px-3 py-2 transition-colors"
                  >
                    {stopping ? '...' : 'Leállít'}
                  </button>
                </div>
              </>
            )}

            {/* Harc indítása – csak harc előtt */}
            {!combat && (
              <button
                onClick={handleStartInitiative}
                disabled={starting}
                className="w-full bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-gray-950 font-semibold text-sm py-2 px-4 rounded-btn transition-colors"
              >
                {starting ? 'Indítás...' : '⚔️ Harc indítása'}
              </button>
            )}
          </div>
        )}

        {/* Játékos eszközök */}
        {!isDm && character && battlemap && (
          <div className="px-4 py-4 space-y-4">
            <div>
              {placingToken ? (
                <div className="space-y-2">
                  <p className="body-s text-accent text-sm">Kattints a térképen egy cellára a token elhelyezéséhez.</p>
                  <button
                    onClick={() => setPlacingToken(null)}
                    className="w-full text-sm text-text-muted hover:text-white border border-border rounded-btn py-2 transition-colors"
                  >
                    Mégse
                  </button>
                </div>
              ) : playerToken ? (
                <button
                  onClick={() => navigate(`/player/${campaignId}/sheet`)}
                  className="w-full flex items-center gap-3 border border-border rounded-btn px-3 py-2 hover:border-accent transition-colors text-left"
                >
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                    style={{ backgroundColor: playerToken.color }}
                  >
                    {playerToken.label}
                  </div>
                  <div className="min-w-0">
                    <p className="text-white text-sm truncate">{character.name}</p>
                  </div>
                </button>
              ) : (
                <button
                  onClick={handlePlayerPlaceToken}
                  className="w-full bg-accent hover:bg-accent-hover text-gray-950 font-semibold text-sm py-2 px-4 rounded-btn transition-colors"
                >
                  Token elhelyezése
                </button>
              )}
            </div>

            {/* Körök blokk – combat fázisban */}
            {combat?.phase === 'combat' && (
              <CombatTurnPanel
                combat={combat}
                battlemap={battlemap}
                campaignCode={campaignCode!}
                readOnly
              />
            )}
          </div>
        )}
      </div>

      {/* Canvas terület */}
      <div className="flex-1 flex flex-col overflow-hidden relative">

        {/* Tudástár gomb – jobb felső sarok */}
        <button
          onClick={() => navigate(isDm ? `/dm/${campaignId}/encyclopedia` : `/player/${campaignId}/encyclopedia`)}
          className="absolute top-3 right-3 z-10 bg-surface-raised hover:bg-surface-hover border border-border hover:border-border-hover text-text-muted hover:text-white rounded-btn px-3 py-2 text-sm transition-colors flex items-center gap-1.5"
          title="Tudástár"
        >
          📖
        </button>

        {/* ── Initiative modal – DM és játékos egyaránt ── */}
        {combat?.phase === 'initiative' && (
          <InitiativeModal
            isDm={isDm}
            combat={combat}
            players={players}
            monsters={monsters}
            monsterD20Values={monsterD20Values}
            editingEnemyInitiatives={editingEnemyInitiatives}
            allInitiativeSubmitted={allInitiativeSubmitted}
            startCombatBlockReason={startCombatBlockReason}
            starting={starting}
            stopping={stopping}
            onMonsterD20Change={(id, val) => setMonsterD20Values(prev => ({ ...prev, [id]: val }))}
            onMonsterSubmit={handleMonsterSubmit}
            onEditEnemyInitiatives={handleEditEnemyInitiatives}
            onStopEditing={() => setEditingEnemyInitiatives(false)}
            onStartCombat={handleStartCombat}
            onStopCombat={handleStopCombat}
            d20={d20}
            dexMod={dexMod}
            playerAlreadySubmitted={playerAlreadySubmitted}
            submitting={submitting}
            onD20Change={setD20}
            onSubmitInitiative={handlePlayerSubmitInitiative}
          />
        )}

        {/* Canvas */}
        <div className="flex-1 overflow-hidden">
          {battlemap == null ? (
            <div className="h-full flex items-center justify-center">
              <p className="body-m text-text-subtle">
                {battlemap === undefined
                  ? 'Térkép betöltése...'
                  : isDm
                    ? 'Térkép inicializálása...'
                    : 'Nincs aktív térkép. Várj a DM-re.'}
              </p>
            </div>
          ) : (
            <BattlemapCanvas
              battlemap={battlemap}
              campaignCode={campaignCode!}
              isEditable={isDm}
              playerCharacterId={!isDm ? (character?.id ?? null) : null}
              selectedTokenId={selectedTokenId}
              placingToken={placingToken}
              onTokenPlace={handleTokenPlace}
              onTokenSelect={setSelectedTokenId}
            />
          )}
        </div>
      </div>
      {/* Encounter token info modal */}
      {encounterModalToken && campaignCode && (
        <TokenInfoModal
          token={encounterModalToken}
          campaignCode={campaignCode}
          readOnly={!isDm}
          onClose={() => setSelectedTokenId(null)}
        />
      )}
    </div>
  )
}
