// ================= CLOCK + SAVE =================
// Clock: every game timer reads Clock.now(). (Stage 2 adds a debug time-speed on top of this.)
const Clock = {
  speed: 1, offset: 0,                    // debug: time runs `speed`× faster; offset = how far game time is ahead of real time
  now() { return Date.now() + this.offset; },
  tick(dtReal) { if (this.speed !== 1) this.offset += dtReal * 1000 * (this.speed - 1); },
};
const CLOCK_KEY = 'parker-trip-debug-clock';

const SAVE_KEY = 'parker-trip-save', LANG_KEY = 'parker-trip-lang', SAVE_VERSION = 2;
function defaultSave(now) {
  return addV2({ v: SAVE_VERSION, createdAt: now, lastSeen: now, dandelions: 0, field: [], nextSpawnAt: now, seq: 0, seenHint: false });
}
// upgrade older saves step by step here when the format changes (v1 → v2 → …)
function migrateSave(s) {
  if (!s || typeof s !== 'object' || !s.v) return null;
  if (s.v === 1) { addV2(s); s.v = 2; }
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
