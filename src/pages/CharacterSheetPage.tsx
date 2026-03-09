import { useNavigate, useParams } from 'react-router-dom'
import { useCharacterStore } from '../store/characterStore'
import { GeneralView } from '../components/character/sheet/GeneralView'
export function CharacterSheetPage() {
  const { campaignId } = useParams<{ campaignId: string }>()
  const navigate = useNavigate()
  const character = useCharacterStore(s => s.character)

  if (!character) {
    return (
      <div className="min-h-screen bg-surface-base flex items-center justify-center">
        <p className="text-text-muted">Karakter betöltése...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-surface-base text-white flex flex-col">
      {/* Slim fejléc – csak gombok */}
      <div className="px-4 py-2 border-b border-border-subtle flex items-center justify-end gap-2">
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
        <button
          onClick={() => navigate(`/player/${campaignId}/battlemap`)}
          className="text-text-muted hover:text-white text-xl font-bold leading-none"
          title="Bezárás"
        >
          ✕
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        <GeneralView character={character} />
      </div>
    </div>
  )
}
