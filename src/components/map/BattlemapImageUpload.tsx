import { useRef, useState } from 'react'
import { setBattlemapImageUrl, clearBattlemapImageUrl } from '../../services/firebase/battlemapService'
import type { BattlemapState } from '../../types/app/map'

interface BattlemapImageUploadProps {
  battlemap: BattlemapState
  campaignCode: string
}

/** Képet átméretez max 1024px szélességre és JPEG 70%-ra tömöríti – Firestore-ban tárolható méret */
function compressImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        const maxWidth = 1024
        const scale = img.width > maxWidth ? maxWidth / img.width : 1
        const canvas = document.createElement('canvas')
        canvas.width  = Math.round(img.width  * scale)
        canvas.height = Math.round(img.height * scale)
        const ctx = canvas.getContext('2d')!
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        resolve(canvas.toDataURL('image/jpeg', 0.7))
      }
      img.onerror = reject
      img.src = e.target?.result as string
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export function BattlemapImageUpload({ battlemap, campaignCode }: BattlemapImageUploadProps) {
  const inputRef   = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [removing, setRemoving]   = useState(false)

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const dataUrl = await compressImage(file)
      await setBattlemapImageUrl(campaignCode, dataUrl)
    } finally {
      setUploading(false)
      // Input törlése, hogy ugyanazt a fájlt újra ki lehessen választani
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  async function handleRemove() {
    setRemoving(true)
    try {
      await clearBattlemapImageUrl(campaignCode)
    } finally {
      setRemoving(false)
    }
  }

  return (
    <div className="flex items-center gap-3">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      {battlemap.backgroundImageUrl ? (
        <>
          {/* Thumbnail */}
          <img
            src={battlemap.backgroundImageUrl}
            alt="Háttérkép"
            className="w-10 h-10 rounded object-cover border border-gray-600"
          />
          <span className="text-gray-400 text-xs">Háttérkép aktív</span>
          <button
            onClick={handleRemove}
            disabled={removing}
            className="px-2 py-1 text-xs bg-gray-800 hover:bg-gray-700 disabled:opacity-40 text-red-400 hover:text-red-300 rounded transition-colors"
          >
            {removing ? 'Törlés...' : 'Eltávolítás'}
          </button>
          <button
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="px-2 py-1 text-xs bg-gray-800 hover:bg-gray-700 disabled:opacity-40 text-gray-300 rounded transition-colors"
          >
            Csere
          </button>
        </>
      ) : (
        <button
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="px-3 py-1.5 text-sm bg-gray-800 hover:bg-gray-700 disabled:opacity-40 text-amber-400 hover:text-amber-300 rounded-lg border border-gray-700 transition-colors flex items-center gap-1.5"
        >
          {uploading ? (
            <span>Feltöltés...</span>
          ) : (
            <>
              <span>🖼️</span>
              <span>Háttérkép feltöltése</span>
            </>
          )}
        </button>
      )}
    </div>
  )
}
