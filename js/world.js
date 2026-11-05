// ================= WORLD: shop, backpack, trips — pure rules on the save S, driven by Clock time =================
const rnd = ([a, b]) => a + Math.random() * (b - a);

function buy(id) {
  const it = ITEM[id];
  if (S.dandelions < it.price || (it.cat === 'toy' && S.toys.includes(id))) return false;
  S.dandelions -= it.price;
  if (it.cat === 'toy') { S.toys.push(id); S.toyPos[id] = TOY_SPOTS[id]; }
  else S.inv[id] = (S.inv[id] || 0) + 1;
  writeSave(S); return true;
}
const TOY_SPOTS = { ball: { x: 300, d: 118 }, duck: { x: 140, d: 112 }, bone: { x: 240, d: 214 } };

// put an item in its slot (food / charm); whatever was there goes back to the bag
function packItem(id) {
  const slot = ITEM[id].cat; if (S.trip || !(S.inv[id] > 0) || !(slot in S.pack)) return;
  if (S.pack[slot]) S.inv[S.pack[slot]] = (S.inv[S.pack[slot]] || 0) + 1;
  S.inv[id]--; S.pack[slot] = id;
  // he decides when to go: the player never does
  if (slot === 'food' && !S.leaveAt) S.leaveAt = notAtBedtime(Clock.now() + rnd(TRIP.decideMinutes) * 60000);
  writeSave(S);
}
// he never sets off while he's asleep: a time in his bedtime moves to the next morning, 06:00–08:00
function notAtBedtime(t) {
  const d = new Date(t), h = d.getHours(), [a, b] = HABITS.bedtime;
  if (!(h >= a || h < b)) return t;
  if (h >= a) d.setDate(d.getDate() + 1);
  d.setHours(6, 0, 0, 0); return d.getTime() + Math.random() * 2 * 3600000;
}
function unpack(slot) {
  const id = S.pack[slot]; if (!id || S.trip) return;
  S.inv[id] = (S.inv[id] || 0) + 1; S.pack[slot] = null;
  if (slot === 'food') S.leaveAt = null;
  writeSave(S);
}
function pickDest(charm) {
  const rareP = TRIP.baseRare + (charm ? ITEM[charm].rare : 0);
  let pool = DESTS.filter(d => !!d.rare === (Math.random() < rareP));
  if (pool.length > 1) pool = pool.filter(d => d.id !== S.lastDest);
  return pool[Math.floor(Math.random() * pool.length)].id;
}
function startTrip(at) {
  const food = S.pack.food || 'onigiri', charm = S.pack.charm, hours = rnd(ITEM[food].hours), dur = hours * 3600000;
  const dest = pickDest(charm), r = Math.random();
  const n = r < TRIP.cards.none ? 0 : (r < TRIP.cards.none + TRIP.cards.two && hours >= TRIP.cards.twoMinHours) ? 2 : 1;
  const cards = [...Array(n)].map(() => at + dur * rnd([0.2, 0.9])).sort((a, b) => a - b);
  const souvenir = !S.shelf.some(s => s.id === dest) && Math.random() < TRIP.souvenirChance;
  S.trip = { dest, food, charm, leaveAt: at, returnAt: at + dur, cards, souvenir };
  S.pack = { food: null, charm: null }; S.leaveAt = null;
}
function endTrip(at) {
  const t = S.trip; let got = null;
  if (t.souvenir && !S.shelf.some(s => s.id === t.dest)) { got = t.dest; S.shelf.push({ id: t.dest, at, isNew: true }); }
  S.lastDest = t.dest; S.trip = null;
  return got;
}
// catch the world up to `now` (also used after the game was closed). Returns what happened, in order.
function advanceWorld(now) {
  const ev = [];
  if (!S.trip && S.pack.food && S.leaveAt && now >= S.leaveAt) { const at = S.leaveAt; startTrip(at); ev.push({ type: 'leave', at }); }
  if (S.trip) {
    while (S.trip.cards.length && S.trip.cards[0] <= now) { const at = S.trip.cards.shift(); S.mail.push({ dest: S.trip.dest, at }); ev.push({ type: 'card', at }); }
    if (now >= S.trip.returnAt) { const at = S.trip.returnAt, got = endTrip(at); ev.push({ type: 'home', at, souvenir: got }); }
  }
  const fe = festivalTick(now); if (fe) ev.push(fe);
  if (ev.length) writeSave(S);
  return ev;
}
function keepCard() {
  const m = S.mail.shift(); if (!m) return;
  if (m.fest) addFestCard(m.fest, m.year); else S.album[m.dest] = (S.album[m.dest] || 0) + 1;
  writeSave(S);
}
// ---- festivals ----
function addFestCard(id, year) { const a = S.festAlbum[id] = S.festAlbum[id] || []; if (!a.includes(year)) a.push(year); }
// inside a festival window, set aside that year's card (once); it is handed over by mail or by Parker himself
function festivalTick(now) {
  if (!S.festPending) for (const f of activeFestivals(now)) {
    const key = `${f.id}-${f.year}`;
    if (S.festGot[key] || !POSTCARDS.some(p => p.id === festCard(f.id))) continue;   // cards not drawn yet wait for their art
    S.festGot[key] = now; S.festPending = { id: f.id, year: f.year }; writeSave(S); break;
  }
  if (S.festPending && S.trip) {                    // he's away: it comes in the post
    const f = S.festPending; S.festPending = null;
    S.mail.push({ dest: festCard(f.id), fest: f.id, year: f.year, at: now }); writeSave(S);
    return { type: 'card', at: now };
  }
  return null;
}
