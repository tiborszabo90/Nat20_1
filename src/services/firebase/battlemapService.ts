import {
  doc,
  setDoc,
  updateDoc,
  onSnapshot,
  deleteField,
  serverTimestamp,
  type Unsubscribe,
} from 'firebase/firestore'
import { db } from '../../lib/firebase'
import type { BattlemapState, BattlemapToken, TerrainType } from '../../types/app/map'

const battlemapDoc = (code: string) =>
  doc(db, 'campaigns', code, 'battlemap', 'state')


/** Új, üres térképet hoz létre a megadott mérettel */
export async function initBattlemap(
  code: string,
  cols: number,
  rows: number
): Promise<void> {
  await setDoc(battlemapDoc(code), {
    cols,
    rows,
    cells: {},
    backgroundImageUrl: null,
    updatedAt: serverTimestamp(),
  })
}

/**
 * Adott cellák tereptípusát írja Firestore-ba.
 * Floor értéknél deleteField()-el törli a kulcsot (floor az alapértelmezett).
 */
export async function updateBattlemapCells(
  code: string,
  changes: Record<string, TerrainType>
): Promise<void> {
  const updateData: Record<string, unknown> = { updatedAt: serverTimestamp() }

  for (const [key, terrain] of Object.entries(changes)) {
    updateData[`cells.${key}`] = terrain === 'floor' ? deleteField() : terrain
  }

  await updateDoc(battlemapDoc(code), updateData)
}

/**
 * Grid átméretezése – teljes felülírás, keretből kiesett cellákat elveti,
 * de a háttérképet megőrzi.
 */
export async function resizeBattlemap(
  code: string,
  cols: number,
  rows: number,
  currentCells: Record<string, TerrainType>,
  currentImageUrl: string | null
): Promise<void> {
  const filteredCells: Record<string, TerrainType> = {}

  for (const [key, terrain] of Object.entries(currentCells)) {
    const [c, r] = key.split(':').map(Number)
    if (c < cols && r < rows) {
      filteredCells[key] = terrain
    }
  }

  await setDoc(battlemapDoc(code), {
    cols,
    rows,
    cells: filteredCells,
    backgroundImageUrl: currentImageUrl,
    updatedAt: serverTimestamp(),
  })
}

/** Tömörített base64 kép URL mentése Firestore-ba (Firebase Storage nélkül) */
export async function setBattlemapImageUrl(code: string, url: string): Promise<void> {
  await updateDoc(battlemapDoc(code), {
    backgroundImageUrl: url,
    updatedAt: serverTimestamp(),
  })
}

/** Háttérkép URL eltávolítása Firestore-ból */
export async function clearBattlemapImageUrl(code: string): Promise<void> {
  await updateDoc(battlemapDoc(code), {
    backgroundImageUrl: deleteField(),
    updatedAt: serverTimestamp(),
  })
}

/** Token hozzáadása a battlemap-hez */
export async function addBattlemapToken(code: string, token: BattlemapToken): Promise<void> {
  await updateDoc(battlemapDoc(code), {
    [`tokens.${token.id}`]: token,
    updatedAt: serverTimestamp(),
  })
}

/** Token pozíciójának frissítése */
export async function moveBattlemapToken(
  code: string,
  id: string,
  col: number,
  row: number
): Promise<void> {
  await updateDoc(battlemapDoc(code), {
    [`tokens.${id}.col`]: col,
    [`tokens.${id}.row`]: row,
    updatedAt: serverTimestamp(),
  })
}

/** Encounter token HP frissítése */
export async function updateTokenHp(code: string, id: string, currentHp: number): Promise<void> {
  await updateDoc(battlemapDoc(code), {
    [`tokens.${id}.currentHp`]: currentHp,
    updatedAt: serverTimestamp(),
  })
}

/** Token eltávolítása */
export async function removeBattlemapToken(code: string, id: string): Promise<void> {
  await updateDoc(battlemapDoc(code), {
    [`tokens.${id}`]: deleteField(),
    updatedAt: serverTimestamp(),
  })
}

/** Valós idejű Firestore figyelő a battlemap állapotára */
export function subscribeToBattlemap(
  code: string,
  cb: (state: BattlemapState | null) => void
): Unsubscribe {
  return onSnapshot(battlemapDoc(code), (snap) => {
    if (snap.exists()) {
      const data = snap.data()
      cb({
        cols: data['cols'] as number,
        rows: data['rows'] as number,
        cells: (data['cells'] ?? {}) as Record<string, TerrainType>,
        backgroundImageUrl: (data['backgroundImageUrl'] as string | null) ?? null,
        tokens: (data['tokens'] ?? {}) as Record<string, BattlemapToken>,
      })
    } else {
      cb(null)
    }
  })
}
