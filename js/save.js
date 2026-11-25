// ================= CLOCK + SAVE =================
// Clock: every game timer reads Clock.now(). (Stage 2 adds a debug time-speed on top of this.)
const Clock = {
  speed: 1, offset: 0,                    // debug: time runs `speed`× faster; offset = how far game time is ahead of real time
  now() { return Date.now() + this.offset; },
  tick(dtReal) { if (this.speed !== 1) this.offset += dtReal * 1000 * (this.speed - 1); },
};
const CLOCK_KEY = 'parker-trip-debug-clock';

const SAVE_KEY = 'parker-trip-save', LANG_KEY = 'parker-trip-lang', SAVE_VERSION = 12;
function defaultSave(now) {
  return addV12(addV11(addV10(addV9(addV8(addV7(addV6(addV5(addV4(addV3(addV2({ v: SAVE_VERSION, createdAt: now, lastSeen: now, dandelions: 0, field: [], nextSpawnAt: now, seq: 0, seenHint: false })))))))))));
}
// upgrade older saves step by step here when the format changes (v1 → v2 → …)
function migrateSave(s) {
  if (!s || typeof s !== 'object' || !s.v) return null;
  if (s.v === 1) { addV2(s); s.v = 2; }
  if (s.v === 2) { addV3(s); s.v = 3; }
  if (s.v === 3) { addV4(s); s.v = 4; }
  if (s.v === 4) { addV5(s); s.v = 5; }
  if (s.v === 5) { addV6(s); s.v = 6; }
  if (s.v === 6) { addV7(s); s.v = 7; }
  if (s.v === 7) { addV8(s); s.v = 8; }
  if (s.v === 8) { addV9(s); s.v = 9; }
  if (s.v === 9) { addV10(s); s.v = 10; }
  if (s.v === 10) { addV11(s); s.v = 11; }
  if (s.v === 11) { addV12(s); s.v = 12; }
  return s;
}
function loadSave() { try { return migrateSave(JSON.parse(localStorage.getItem(SAVE_KEY))); } catch (e) { return null; } }
function writeSave(S) { try { S.lastSeen = Clock.now(); localStorage.setItem(SAVE_KEY, JSON.stringify(S)); } catch (e) { /* storage blocked: keep playing */ } }
function loadLang() { try { const l = localStorage.getItem(LANG_KEY); return l === 'en' || l === 'zh' ? l : 'zh'; } catch (e) { return 'zh'; } }
function storeLang(l) { try { localStorage.setItem(LANG_KEY, l); } catch (e) { } }
// v2: shop, backpack, trips, mail, album, shelf, toys
function addV2(s) {
  return Object.assign(s, { inv: {}, toys: [], toyPos: {}, pack: { food: null, charm: null }, leaveAt: null, trip: null, mail: [], album: {}, shelf: [], lastDest: null, ...s });
}
// v3: festival cards — which festival-years are given (festGot), one waiting to be handed over (festPending), the album of them
function addV3(s) {
  return Object.assign(s, { festGot: {}, festPending: null, festAlbum: {}, ...s });
}
// v4: friends met on trips ({ id: { metAt, place, count, card } }) and which places' cards came with a friend in them
function addV4(s) {
  return Object.assign(s, { friends: {}, albumFriend: {}, ...s });
}
// v5: small visitors — gifts lying in the yard, the gift box ({ kind: count }), how often each visitor came, the last gift time;
//     homeSay: the trip he still wants to say a word about ({ dest, friend } or null); toyNote: a friend's toy whose note
//     hasn't been read yet ({ friend, toy } or null); snowman: the one you built ({ stage, x, d, meltFrom } or { twig } once melted, or null).
//     All optional, so older v5 saves need nothing.
function addV5(s) {
  return Object.assign(s, { gifts: [], giftBox: {}, visits: {}, lastGiftAt: 0, homeSay: null, toyNote: null, snowman: null, ...s });
}
// v6: albumSolo — places whose card he sent on his own (not with a friend), so the album can show both versions.
//     Older saves can't tell which one arrived, so every place already in the album counts (better one too many than one lost).
function addV6(s) {
  if (!s.albumSolo) { s.albumSolo = {}; for (const id in (s.album || {})) s.albumSolo[id] = true; }
  return s;
}
// v7: his house — house: 1 the doghouse, 2 the log cabin, 3 the big house with a porch; houseSeen: the biggest house he has
//     already been round sniffing (a new one he hasn't seen yet gets a look round the first time he's home and awake).
function addV7(s) {
  return Object.assign(s, { house: 1, houseSeen: 1, ...s });
}
// v8: decorating his room — decor: the layout ({ items, seq, seen, custom, level } or null until he first has a room:
//     it is then laid out the house's own way, every souvenir he has on a shelf); furn: furniture he owns ({ id: count }).
function addV8(s) {
  return Object.assign(s, { decor: null, furn: {}, ...s });
}
// v9: "Parker Sees the World" — notes: { got: [{ id, at }], waiting: { id, at, spot } | null, nextAt, allOpen (debug) };
//     been: the places he has been ({ place: first time }), for the notes that need a trip. Older saves didn't keep
//     a list of trips, so it starts from every place he sent a card from, brought a souvenir from or met a friend in.
function addV9(s) {
  if (!s.notes) s.notes = { got: [], waiting: null, nextAt: Date.now() + (1 + Math.random() * 2) * 864e5, allOpen: false };
  if (!s.been) {
    s.been = {}; const mark = (id, at) => { if (id && !s.been[id]) s.been[id] = at || 1; };
    for (const id in (s.album || {})) mark(id); for (const it of (s.shelf || [])) mark(it.id, it.at); for (const id in (s.albumFriend || {})) mark(id);
    for (const f in (s.friends || {})) mark(s.friends[f].place, s.friends[f].metAt); mark(s.lastDest);
  }
  return s;
}
// v10: getting to know the little visitors — pals: { sparrow|squirrel|cat: { pts (meals eaten, only ever grows), day (the
//     date of the last meal), today (meals that day), lv (the level last announced), name, gifts ({ kind: count } received
//     from them, counted from this version on: older gifts don't say who left them) } }; dishes: snacks put out in the
//     yard ({ sparrow|squirrel|cat: { x, d, at } }).
function addV10(s) {
  if (!s.pals) { s.pals = {}; for (const k of ['sparrow', 'squirrel', 'cat']) s.pals[k] = { pts: 0, day: '', today: 0, lv: 0, name: '', gifts: {} }; }
  if (!s.dishes) s.dishes = {};
  return s;
}
// v11: the visitors' homes (big house only) — homes: { sparrow|squirrel|cat: { at (when it moved in), nuts (the squirrel's
//     hidden nuts, 0–5) } }. The squirrel's stump and the cat's bed are furniture (furn.sqnest / furn.catbed) in the room.
function addV11(s) { if (!s.homes) s.homes = {}; return s; }
// v12: the furniture shop — roomLook: the wallpaper and the floor he has on ({ wall, floor }: a style name, or null for the
//     house's own). Wallpapers and floors you've bought are kept in furn as 'wall:<style>' / 'floor:<style>'; furniture
//     as before (furn.<id> = how many). A postcard frame in the layout carries the card it shows (pc: 'id~year~friend').
function addV12(s) { if (!s.roomLook) s.roomLook = { wall: null, floor: null }; return s; }
