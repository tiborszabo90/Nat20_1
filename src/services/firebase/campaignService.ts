import {
  collection,
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
  query,
  where,
  getDocs,
} from 'firebase/firestore'
import { db } from '../../lib/firebase'
import type { Campaign, CampaignStatus, PlayerCampaignEntry } from '../../types/app/campaign'

const CAMPAIGNS_COLLECTION = 'campaigns'
const CODE_LENGTH = 6
const CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // kétértelmű karakterek kihagyva (0/O, 1/I)

/** Véletlenszerű 6 jegyű alfanumerikus kód generálása */
function generateCode(): string {
  let code = ''
  for (let i = 0; i < CODE_LENGTH; i++) {
    code += CODE_CHARS.charAt(Math.floor(Math.random() * CODE_CHARS.length))
  }
  return code
}

/** Ellenőrzi, hogy a kód szabad-e a Firestore-ban */
async function isCodeAvailable(code: string): Promise<boolean> {
  const docRef = doc(db, CAMPAIGNS_COLLECTION, code)
  const snap = await getDoc(docRef)
  return !snap.exists()
}

/** Egyedi, szabad kód generálása (max 10 próbálkozás) */
async function generateUniqueCode(): Promise<string> {
  for (let attempt = 0; attempt < 10; attempt++) {
    const code = generateCode()
    if (await isCodeAvailable(code)) {
      return code
    }
  }
  throw new Error('Nem sikerült egyedi kampánykódot generálni. Próbáld újra.')
}

/** Új kampány létrehozása (DM) */
export async function createCampaign(
  dmUid: string,
  campaignName: string
): Promise<string> {
  const code = await generateUniqueCode()
  const campaignRef = doc(db, CAMPAIGNS_COLLECTION, code)

  await setDoc(campaignRef, {
    name: campaignName,
    dmUid,
    status: 'active' satisfies CampaignStatus,
    createdAt: serverTimestamp(),
  })

  return code
}

/** Kampány lekérdezése kód alapján */
export async function getCampaignByCode(code: string): Promise<Campaign | null> {
  const docRef = doc(db, CAMPAIGNS_COLLECTION, code.toUpperCase())
  const snap = await getDoc(docRef)

  if (!snap.exists()) return null

  return { id: snap.id, ...snap.data() } as Campaign
}

/** Játékos csatlakozása kampányhoz */
export async function joinCampaign(
  campaignCode: string,
  playerUid: string,
  displayName: string
): Promise<void> {
  const code = campaignCode.toUpperCase()
  const campaign = await getCampaignByCode(code)

  if (!campaign) {
    throw new Error('Érvénytelen kampánykód.')
  }
  if (campaign.status !== 'active') {
    throw new Error('Ez a kampány jelenleg nem aktív.')
  }

  const playerRef = doc(db, CAMPAIGNS_COLLECTION, code, 'players', playerUid)
  await setDoc(
    playerRef,
    { displayName, joinedAt: serverTimestamp() },
    { merge: true }
  )

  // Játékos tagság denormalizálva – gyors lekérdezéshez index nélkül
  // Saját try-catch: ha Firestore rules nem fedik le ezt az útvonalat,
  // a csatlakozás akkor is sikerüljön (a kampánylista csak nem fog megjelenni a főoldalon)
  try {
    const membershipRef = doc(db, 'playerMemberships', playerUid, 'campaigns', code)
    await setDoc(membershipRef, { name: campaign.name, joinedAt: serverTimestamp() }, { merge: true })
  } catch {
    // szándékosan elnyelve – nem kritikus adat
  }
}

/** A játékos összes csatlakozott kampányának lekérdezése (denormalizált) */
export async function getPlayerCampaigns(playerUid: string): Promise<PlayerCampaignEntry[]> {
  const snap = await getDocs(collection(db, 'playerMemberships', playerUid, 'campaigns'))
  return snap.docs.map(d => ({ code: d.id, name: d.data()['name'] as string }))
}

/** A DM összes kampányának lekérdezése */
export async function getDmCampaigns(dmUid: string): Promise<Campaign[]> {
  const q = query(
    collection(db, CAMPAIGNS_COLLECTION),
    where('dmUid', '==', dmUid)
  )
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() }) as Campaign)
}
