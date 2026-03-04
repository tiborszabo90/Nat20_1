# Nat20 – Claude Code Projekt Útmutató

## Projekt Áttekintés

A **Nat20** egy hibrid D&D segédalkalmazás, amely támogatja az offline (személyes) játékot digitális eszközök segítségével. Egyetlen reszponzív webes platformon (PWA) érhető el, valós idejű szinkronizációval a DM és a játékosok között.

- **Célcsoport:** Dungeon Masterek és Játékosok
- **Szabályrendszer:** Kizárólag D&D 2024 (5.5e)
- **Platform:** Reszponzív Webalkalmazás (PWA)
- **Kulcsérték:** Azonnali válaszok, kevesebb keresgélés, több játék

---

## Technikai Stack

| Réteg | Technológia |
|---|---|
| Frontend keretrendszer | React 19 + TypeScript (Vite) |
| Stíluskönyvtár | Tailwind CSS |
| Állapotkezelés | Zustand |
| Backend / Realtime DB | Firebase (Firestore) |
| AI | Google Gemini 2.5 Flash API |
| Offline Cache | IndexedDB |
| Adatforrás | GitHub JSON (open5e / 5e-database) – csak "2024" rekordok |

---

## Fejlesztési Elvek

1. **Hallucinációmentes AI:** Az AI Assistant kizárólag a betöltött JSON adatokra (RAG) támaszkodik. Soha ne hagyjon az AI szabad szöveges találgatást szabályok terén.
2. **Manuális kockadobás:** Az app sohasem dob kockát helyetted. Csak a szükséges nyers kockaértéket jelzi ki (pl. "Dobj d20-szal, a sikerhez 12+ kell").
3. **Valós idejű szinkron:** Minden akció azonnal szinkronizálódik Firestore-on keresztül a DM és a játékosok között.
4. **Szituáció-tudatos UI:** A karakterlap kontextus-érzékeny (Combat / Exploration / Social / General).
5. **TypeScript-first:** Minden adat belső TypeScript interface-ekre van leképezve. Nincs `any` típus.
6. **Komponens granularitás:** Kis, újrahasználható komponensek. Egy fájl = egy felelősség.

---

## Mappastruktúra

```
src/
├── assets/           # Statikus képek, ikonok
├── components/       # Újrahasználható UI komponensek
│   ├── ui/           # Generikus UI elemek (Button, Modal, Badge…)
│   ├── character/    # Karakterlap és Builder komponensek
│   ├── combat/       # Harci nézethez kapcsolódó komponensek
│   ├── map/          # Battlemap komponensek
│   └── notifications/ # Értesítési modalok
├── hooks/            # Egyedi React hookok
├── lib/              # Segédkönyvtárak (firebase.ts, gemini.ts…)
├── pages/            # Oldal-szintű komponensek (React Router)
├── store/            # Zustand store-ok
├── types/            # TypeScript interface-ek és type-ok
│   ├── dnd/          # D&D entitások (Character, Spell, Class…)
│   └── app/          # App-specifikus típusok (Campaign, Notification…)
├── data/             # Statikusan betöltött / cachedelt JSON adatok
└── services/         # API hívások, Firestore műveletek
    ├── firebase/
    ├── gemini/
    └── dnd-data/
```

---

## Fejlesztési Roadmap (Fázisok)

### Phase 1 – Alap Infrastruktúra ✅ (jelenlegi)
- [x] CLAUDE.md
- [ ] Vite + React + TypeScript projekt inicializálás
- [ ] Tailwind CSS konfiguráció
- [ ] Zustand telepítés
- [ ] Firebase projekt és konfiguráció (`lib/firebase.ts`)
- [ ] 6 jegyű alfanumerikus kampány-csatlakozás (Firestore)
- [ ] Alap routing (React Router): `/`, `/join`, `/dm/:campaignId`, `/player/:campaignId`

### Phase 2 – Adatréteg és Realtime Szinkron
- [ ] GitHub JSON fetcher (open5e API vagy raw JSON)
- [ ] Belső TypeScript interface-ekre mapping
- [ ] IndexedDB caching réteg
- [ ] Real-time Interakciós Rendszer alapjai (Firestore listeners)
- [ ] Dinamikus értesítési modál rendszer

### Phase 3 – Karakterkezelés
- [ ] Karakterlétrehozó (Species → Background → Class → Ability Scores)
- [ ] Szituáció-tudatos karakterlap (Combat / Exploration / Social / General)
- [ ] HP, Spell Slot, Inventory valós idejű követés

### Phase 4 – Haladó Funkciók
- [ ] Battlemap modul (token drag-drop, ruler, grid snap)
- [ ] Nat20 AI Assistant (Gemini 2.5 Flash + RAG)
- [ ] Enciklopédia / Tudástár nézettel
- [ ] PWA manifest és service worker

---

## Firebase Adatstruktúra

```
firestore/
└── campaigns/
    └── {campaignId}/          # 6 jegyű alfanumerikus kód (pl. "A3X7K2")
        ├── dmUid: string
        ├── name: string
        ├── createdAt: timestamp
        ├── status: "active" | "paused" | "ended"
        ├── players/
        │   └── {playerUid}/
        │       ├── displayName: string
        │       ├── characterId: string
        │       └── joinedAt: timestamp
        ├── characters/
        │   └── {characterId}/   # Teljes karakterlap
        └── events/
            └── {eventId}/       # Akció-események (Fireball, DC set, stb.)
                ├── type: string
                ├── payload: object
                ├── fromUid: string
                └── createdAt: timestamp
```

---

## Kampány Csatlakozási Logika

- A DM létrehoz egy kampányt → Firestore generál egy **6 jegyű alfanumerikus kódot** (pl. `A3X7K2`).
- A játékosok a kóddal csatlakoznak a `/join` oldalon.
- A kód ütközések elkerülése érdekében a generálás előtt ellenőrizzük, hogy a kód szabad-e.

---

## Környezeti Változók (`.env`)

```
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_GEMINI_API_KEY=
```

---

## Kód Konvenciók

- **Fájlnév:** `PascalCase` komponensekhez, `camelCase` hookokhoz és service-ekhez
- **Export:** Named export minden komponenshez (nincs default export)
- **Típusok:** Minden prop-hoz és store state-hez explicit TypeScript típus
- **Stílus:** Tailwind utility-first; egyedi CSS csak ha Tailwind nem elegendő
- **Kommentek:** Csak nem-triviális logikánál, magyarul
- **Tesztek:** Vitest (Phase 2-től)
