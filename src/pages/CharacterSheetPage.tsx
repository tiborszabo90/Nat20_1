import { useNavigate, useParams } from 'react-router-dom'
import { useCharacterStore } from '../store/characterStore'
import { ContextSelector } from '../components/character/sheet/ContextSelector'
import { CombatView } from '../components/character/sheet/CombatView'
import { ExplorationView } from '../components/character/sheet/ExplorationView'
import { SocialView } from '../components/character/sheet/SocialView'
import { GeneralView } from '../components/character/sheet/GeneralView'

export function CharacterSheetPage() {
  const { campaignId } = useParams<{ campaignId: string }>()
  const navigate = useNavigate()
  const character = useCharacterStore(s => s.character)
  const contextMode = useCharacterStore(s => s.contextMode)
  const setContextMode = useCharacterStore(s => s.setContextMode)

  if (!character) {
    return (
      <div className="min-h-screen bg-surface-base flex items-center justify-center">
        <p className="text-text-muted">Karakter betöltése...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-surface-base text-white flex flex-col">
      {/* Fejléc */}
      <div className="px-4 pt-5 pb-3 border-b border-border-subtle flex items-start justify-between">
        <div>
          <p className="heading-s text-white leading-tight">{character.name}</p>
          <p className="body-s text-accent">
            {character.classKey} · {character.level}. szint · {character.speciesKey}
          </p>
        </div>
        <div className="flex items-center gap-2 mt-0.5 shrink-0">
          <button
            onClick={() => navigate(`/player/${campaignId}/battlemap`)}
            className="text-text-muted hover:text-accent text-xl"
            title="Battlemap"
          >
            🗺️
          </button>
          <button
            onClick={() => navigate(`/player/${campaignId}/encyclopedia`)}
            className="text-text-muted hover:text-accent text-xl"
            title="Tudástár"
          >
            📖
          </button>
          <button
            onClick={() => {
              if (window.confirm('Új karaktert hozol létre? A jelenlegi karakter törlődik.')) {
                navigate(`/player/${campaignId}/build`)
              }
            }}
            className="text-text-muted hover:text-accent text-xl"
            title="Új karakter"
          >
            ✨
          </button>
        </div>
      </div>

      {/* Context Selector */}
      <ContextSelector active={contextMode} onChange={setContextMode} />

      {/* Nézet tartalom */}
      <div className="flex-1 overflow-y-auto">
        {contextMode === 'combat'      && <CombatView character={character} />}
        {contextMode === 'exploration' && <ExplorationView character={character} />}
        {contextMode === 'social'      && <SocialView character={character} />}
        {contextMode === 'general'     && <GeneralView character={character} />}
      </div>
    </div>
  )
}
