// ================= CLOCK + SAVE =================
// Clock: every game timer reads Clock.now(). (Stage 2 adds a debug time-speed on top of this.)
const Clock = {
  speed: 1, offset: 0,                    // debug: time runs `speed`× faster; offset = how far game time is ahead of real time
  now() { return Date.now() + this.offset; },
  tick(dtReal) { if (this.speed !== 1) this.offset += dtReal * 1000 * (this.speed - 1); },
};
const CLOCK_KEY = 'parker-trip-debug-clock';

const SAVE_KEY = 'parker-trip-save', LANG_KEY = 'parker-trip-lang', SAVE_VERSION = 5;
function defaultSave(now) {
  return addV5(addV4(addV3(addV2({ v: SAVE_VERSION, createdAt: now, lastSeen: now, dandelions: 0, field: [], nextSpawnAt: now, seq: 0, seenHint: false }))));
}
// upgrade older saves step by step here when the format changes (v1 → v2 → …)
function migrateSave(s) {
  if (!s || typeof s !== 'object' || !s.v) return null;
  if (s.v === 1) { addV2(s); s.v = 2; }
  if (s.v === 2) { addV3(s); s.v = 3; }
  if (s.v === 3) { addV4(s); s.v = 4; }
  if (s.v === 4) { addV5(s); s.v = 5; }
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
//     hasn't been read yet ({ friend, toy } or null). Both optional, so older v5 saves need nothing.
function addV5(s) {
  return Object.assign(s, { gifts: [], giftBox: {}, visits: {}, lastGiftAt: 0, homeSay: null, toyNote: null, ...s });
}
