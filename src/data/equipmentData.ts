export interface EquipmentInfo {
  summary: string
  stats?: string
}

// Leírások a starter felszerelés tárgyaihoz (exact string kulcsok a konstansokból)
export const EQUIPMENT_INFO: Record<string, EquipmentInfo> = {

  // ── Fegyverek ──────────────────────────────────────────────────────
  'Greataxe': {
    summary: 'Kétkezes nehézcsatabárd. Hatalmas pusztítóereje van, de megforgatásához két kéz szükséges.',
    stats: '1d12 slashing · Heavy · Two-Handed',
  },
  'Handaxe': {
    summary: 'Kézbe vehető könnyű fejsze. Dobható és kézitusában egyaránt hasznos.',
    stats: '1d6 slashing · Light · Thrown (20/60 ft)',
  },
  'Dagger': {
    summary: 'Kis tőr. Finesse tulajdonsága miatt STR vagy DEX alapú támadáshoz használható, és dobható is.',
    stats: '1d4 piercing · Finesse · Light · Thrown (20/60 ft)',
  },
  'Rapier': {
    summary: 'Vékony, éles pengeű páncélátütő kard. Finesse tulajdonsága miatt STR vagy DEX alapú.',
    stats: '1d8 piercing · Finesse',
  },
  'Longsword': {
    summary: 'Sokoldalú egyenes kard. Egy- vagy kétkezes forgatásra egyaránt alkalmas.',
    stats: '1d8 slashing · Versatile (1d10)',
  },
  'Shortsword': {
    summary: 'Rövid, könnyű egyenes kard. Finesse és Light tulajdonsága miatt páros fegyverként is használható.',
    stats: '1d6 piercing · Finesse · Light',
  },
  'Scimitar': {
    summary: 'Ívelt, könnyű kard. Finessze és Light tulajdonsága miatt páros fegyverként is használható.',
    stats: '1d6 slashing · Finesse · Light',
  },
  'Quarterstaff': {
    summary: 'Hosszú harci bot. Egy- vagy kétkezes forgatásra egyaránt alkalmas.',
    stats: '1d6 bludgeoning · Versatile (1d8)',
  },
  'Javelin': {
    summary: 'Könnyű dobódárda. Közelharci fegyverként és dobásra is alkalmas.',
    stats: '1d6 piercing · Thrown (30/120 ft)',
  },
  'Shortbow': {
    summary: 'Kisebb méretű íj, lóháton is forgatható. Nyilak szükségesek hozzá.',
    stats: '1d6 piercing · Ammunition · Range (80/320 ft) · Two-Handed',
  },
  'Light Crossbow': {
    summary: 'Könnyű számszeríj. Minden lövés után újra kell tölteni.',
    stats: '1d8 piercing · Ammunition · Loading · Range (80/320 ft) · Two-Handed',
  },
  'Hand Crossbow': {
    summary: 'Egykézes számszeríj. Könnyű fegyver, páros fegyverként is alkalmazható.',
    stats: '1d6 piercing · Ammunition · Light · Loading · Range (30/120 ft)',
  },
  'Spear': {
    summary: 'Sokoldalú dárda, egy- vagy kétkezes forgatásra és dobásra is alkalmas.',
    stats: '1d6 piercing · Thrown (20/60 ft) · Versatile (1d8)',
  },
  'Mace': {
    summary: 'Nehézfejű ütőfegyver. Hatásos páncél ellen is.',
    stats: '1d6 bludgeoning',
  },
  'Warhammer': {
    summary: 'Harci kalapács, erős ütőerejű fegyver. Egy- vagy kétkezes forgatásra alkalmas.',
    stats: '1d8 bludgeoning · Versatile (1d10)',
  },
  'Sickle': {
    summary: 'Könnyű sarló. Olcsó, könnyen forgatható egykézes fegyver.',
    stats: '1d4 slashing · Light',
  },

  // ── Páncélzat ──────────────────────────────────────────────────────
  'Leather Armor': {
    summary: 'Könnyű bőrpáncél. Nem akadályozza a lopakodást, jó választás tolvajoknak és varázslóknak.',
    stats: 'AC 11 + DEX mod · Light Armor',
  },
  'Chain Mail': {
    summary: 'Nehézpáncél, láncszemekből szőtt. Erős STR-t igényel, és megnehezíti a lopakodást.',
    stats: 'AC 16 · Heavy Armor · Str 13 required · Stealth disadvantage',
  },
  'Scale Mail': {
    summary: 'Közepes páncél, pikkelyszerű fémlapokból. Korlátozza az ügyességi bónuszt és a lopakodást.',
    stats: 'AC 14 + DEX mod (max +2) · Medium Armor · Stealth disadvantage',
  },
  'Shield': {
    summary: 'Kézben tartott pajzs, jelentősen növeli a védelmet. Egy szabad kéz szükséges hozzá.',
    stats: '+2 AC · Requires one hand',
  },

  // ── Csomagok ────────────────────────────────────────────────────────
  "Explorer's Pack": {
    summary: 'Felfedező csomag. Minden alapfelszerelést tartalmaz hosszabb kalandozáshoz.',
    stats: 'Tartalom: hátizsák, hálózsák, tábori készlet, tűzszerszám, 10 fáklya, 10 napi étel, kulacs, 50 láb kötél',
  },
  "Dungeoneer's Pack": {
    summary: 'Tömlöcfelfedező csomag. Mélységekbe való bejáráshoz nélkülözhetetlen eszközök.',
    stats: 'Tartalom: hátizsák, feszítővas, kalapács, 10 szög, 10 fáklya, tűzszerszám, 10 napi étel, kulacs, 50 láb kötél',
  },
  "Priest's Pack": {
    summary: 'Papi csomag. Istentiszteleti és utazási eszközöket tartalmaz.',
    stats: 'Tartalom: hátizsák, takaró, 10 gyertya, tűzszerszám, perselye, 2 tömjénrúd, tömjénező, miseruha, 2 napi étel, kulacs',
  },
  "Burglar's Pack": {
    summary: 'Betörő csomag. Lopakodáshoz és csapdák semlegesítéséhez szükséges eszközök.',
    stats: 'Tartalom: hátizsák, 1000 golyó, 10 láb madzag, csengő, 5 gyertya, feszítővas, kalapács, 10 szög, kápás lámpa, 2 palack olaj, 5 napi étel, tűzszerszám, kulacs, 50 láb kötél',
  },
  "Entertainer's Pack": {
    summary: 'Előadóművész csomag. Fellépésekhez és utazáshoz szükséges kellékek.',
    stats: 'Tartalom: hátizsák, hálózsák, 2 jelmez, 5 gyertya, 5 napi étel, kulacs, álruha-készlet',
  },
  "Scholar's Pack": {
    summary: 'Tudósi csomag. Kutatáshoz és íráshoz szükséges felszerelés.',
    stats: 'Tartalom: hátizsák, tudáskönyv, tintásüveg, tollkés, 10 lap pergamen, homokzacskó, kisés kés',
  },
  "Merchant's Pack": {
    summary: 'Kereskedői csomag. Áruk mérlegeléséhez és elszámoláshoz szükséges eszközök.',
    stats: 'Tartalom: hátizsák, 2 zsák 1000 réz érmével, 5 erszény, mérleg, tinta, toll, pergamen, pénzestáska',
  },

  // ── Eszközök / Kellékek ────────────────────────────────────────────
  "Thieves' Tools": {
    summary: 'Tolvajszerszámok. Lakatnyitáshoz és csapdák hatástalanításához elengedhetetlenek.',
    stats: 'Tartalom: feszítőka, kis tükör nyélen, ollócska, fogó. Jártasság szükséges a használathoz.',
  },
  'Herbalism Kit': {
    summary: 'Gyógynövény-gyűjtő készlet. Gyógyhatású főzetek és kenőcsök elkészítéséhez.',
    stats: 'Tartalom: erszények, metszőkés, bőrkesztyű, üvegfiolák. Jártasság szükséges.',
  },
  "Cartographer's Tools": {
    summary: 'Térképész eszközök. Térképek készítéséhez és olvasásához.',
    stats: 'Tartalom: toll, tinta, pergamen, iránytű, tolóka, vonalzó. Jártasság szükséges.',
  },
  "Artisan's Tools (1 típus)": {
    summary: 'Kézműves eszközök egy választott mesterséghez (pl. kovács, ács, fazekas). Jártasságot adnak az adott kézműves tevékenységhez.',
  },
  'Disguise Kit': {
    summary: 'Álruha-készlet. Megjelenés megváltoztatásához szükséges kellékek.',
    stats: 'Tartalom: kozmetikumok, hajfesték, kellékek, tükör. Jártasság szükséges.',
  },
  'Forgery Kit': {
    summary: 'Hamisítókészlet. Okiratok és pecsétek hamisításához.',
    stats: 'Tartalom: különféle tinták, pergamenek, kis pecsétek és bélyegzők. Jártasság szükséges.',
  },
  "Merchant's Scale": {
    summary: 'Kis mérleg érmék és áruk mérlegeléséhez.',
    stats: 'Tartalom: mérlegkar, serpenyők, 5 súly.',
  },
  "Scribe's Tools": {
    summary: 'Scriptorium eszközök. Szövegek másolásához és pergamenek elkészítéséhez.',
    stats: 'Tartalom: toll, tinta, pergamen, viasz, pecsétbélyegzők. Jártasság szükséges.',
  },
  "Musical Instrument (1 típus)": {
    summary: 'Egy választott hangszer (pl. lant, furulya, dob). Jártasságot ad Charisma (Performance) próbákhoz az adott hangszeren.',
  },

  // ── Varázslati fókuszok ────────────────────────────────────────────
  'Druidic Focus': {
    summary: 'Druida mágikus fókusz. Mistletoe, totem, vagy természeti szimbólumokkal díszített fabot – varázslatokhoz szükséges anyagi komponenseket helyettesíti (ha nincs külön GP érték meghatározva).',
  },
  'Arcane Focus (kristály)': {
    summary: 'Kristálygömb arcane fókuszként. A mágus komponens erszény és számos anyagi komponens helyettesítésére szolgál.',
  },
  'Arcane Focus (amulett)': {
    summary: 'Amulett arcane fókuszként. Anyagi komponenseket helyettesít (ha nincs külön aranyérték meghatározva).',
  },
  'Arcane Focus (quarterstaff)': {
    summary: 'Harci botba foglalt arcane fókusz. Fegyverként és varázslatfókuszként egyaránt szolgál.',
  },
  'Holy Symbol': {
    summary: 'Szent szimbólum. Az isteni varázslatok fókusza. Lehet amulett, pajzson/páncélon vésett embléma, vagy ereklyetartó.',
  },
  'Spellbook': {
    summary: 'Varázslókönyv. 100 vellum oldal, bőrkötésű kötet. Minden felkészített varázslatot tartalmaz. 1. szinten 6 varázslatot tartalmaz (2 megadott + 4 szabadon választott).',
  },

  // ── Egyéb tárgyak ──────────────────────────────────────────────────
  'Crowbar': {
    summary: 'Feszítővas. Advantage-t ad STR próbákhoz, ahol emelőkaros erőre van szükség.',
  },
  'Signet Ring': {
    summary: 'Pecsétgyűrű egy nemesi ház szimbólumával. Okiratok hitelesítésére és azonosításra szolgál.',
  },
  'Quiver': {
    summary: 'Nyíltartó tegez. Legfeljebb 20 nyílvesszőt vagy számszeríjboltot tart.',
  },
  'Hooded Lantern': {
    summary: 'Kápás lámpa. Fényköre lezárható, hogy ne áruljon el. 1 korsó olajjal 6 óráig ég.',
    stats: 'Fény: 30 láb (bright), 60 láb (dim) · Lezárva: 5 láb (dim) · 6 óra/olaj',
  },
  '50ft Rope': {
    summary: 'Kenderkötél, 50 láb hosszú. Akár 3 teremtmény terhét is elbírja. Mászáshoz, biztosításhoz, megkötözéshez használható.',
  },
  'Abacus': {
    summary: 'Gyöngyvázas számológép. Gyors aritmetikához és számvitelhez.',
  },
  'Fine Clothes': {
    summary: 'Elegáns öltözet, nemesi vagy polgári viselet. Formális helyzetekben előnyös benyomást kelt.',
  },
  "Traveler's Clothes": {
    summary: 'Tartós utazóruha. Hosszú túrákhoz és időjárással szemben is megfelelő viselet.',
  },
  "Common Clothes": {
    summary: 'Egyszerű, hétköznapi ruházat. Szerény megjelenéshez.',
  },
  'Imakönyv': {
    summary: 'Vallásos szövegeket, imákat és istentiszteleti rítusokat tartalmazó kötet. Acolyte background hátterű karaktereknek elengedhetetlen.',
  },
}
