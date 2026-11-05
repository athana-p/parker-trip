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
const TOY_SPOTS = { ball: { x: 300, d: 118 }, duck: { x: 140, d: 112 }, bone: { x: 240, d: 214 }, bubbles: { x: 150, d: 206 } };

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
  // a friend lives here? maybe they meet. The first time, a "we met" card comes in the post partway through.
  const fid = friendAt(dest), friend = fid && Math.random() < TRIP.friendChance ? fid : null;
  const meetAt = friend && !(S.friends[friend] && S.friends[friend].card) ? at + dur * rnd([0.15, 0.5]) : null;
  S.trip = { dest, food, charm, leaveAt: at, returnAt: at + dur, cards, souvenir, friend, meetAt };
  S.pack = { food: null, charm: null }; S.leaveAt = null;
}
function endTrip(at) {
  const t = S.trip; let got = null;
  if (t.souvenir && !S.shelf.some(s => s.id === t.dest)) { got = t.dest; S.shelf.push({ id: t.dest, at, isNew: true }); }
  if (t.friend) { const f = metFriend(t.friend, at); f.count++; }
  S.homeSay = { dest: t.dest, friend: t.friend || null };     // he says something about it once he's home and awake
  S.lastDest = t.dest; S.trip = null;
  return got;
}
function metFriend(id, at) { return S.friends[id] = S.friends[id] || { metAt: at, place: FRIENDS.find(f => f.id === id).place, count: 0, card: false };
}
// catch the world up to `now` (also used after the game was closed). Returns what happened, in order.
function advanceWorld(now) {
  const ev = [];
  if (!S.trip && S.pack.food && S.leaveAt && now >= S.leaveAt) { const at = S.leaveAt; startTrip(at); ev.push({ type: 'leave', at }); }
  if (S.trip) {
    const t = S.trip;
    if (t.meetAt && t.meetAt <= now) { metFriend(t.friend, t.meetAt); S.mail.push({ dest: 'meet-' + t.friend, meet: t.friend, at: t.meetAt }); t.metAt = t.meetAt; t.meetAt = null; ev.push({ type: 'card', at: now }); }
    while (t.cards.length && t.cards[0] <= now) {
      const at = t.cards.shift(), known = t.metAt ? at >= t.metAt : !!(t.friend && !t.meetAt && S.friends[t.friend] && S.friends[t.friend].card), withFriend = t.friend && known && Math.random() < TRIP.friendOnCard;   // only after they've met
      S.mail.push(withFriend ? { dest: t.dest, at, friend: t.friend } : { dest: t.dest, at }); ev.push({ type: 'card', at });
    }
    if (now >= S.trip.returnAt) { const at = S.trip.returnAt, got = endTrip(at); ev.push({ type: 'home', at, souvenir: got }); }
  }
  const fe = festivalTick(now); if (fe) ev.push(fe);
  if (ev.length) writeSave(S);
  return ev;
}
function keepCard() {
  const m = S.mail.shift(); if (!m) return;
  if (m.fest) addFestCard(m.fest, m.year);
  else if (m.meet) metFriend(m.meet, m.at).card = true;
  else { S.album[m.dest] = (S.album[m.dest] || 0) + 1; if (m.friend) S.albumFriend[m.dest] = m.friend; }
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
// ---- small visitors and their gifts (stage 4) ----
function visitorsSleep(t) { const h = new Date(t).getHours(), [a, b] = VISIT.night; return h >= a || h < b; }
function pickVisitor(t) { const se = weatherAt(t).season, w = { ...VISIT.who }; if (se === 'autumn') w.squirrel *= 1.6; if (se === 'winter') w.squirrel *= 0.5; return pickWeighted(w); }
function canGift(t) { return S.gifts.length < VISIT.groundCap && t - (S.lastGiftAt || 0) >= VISIT.giftGap * 60000; }
function rollGift(from, t) {
  let kind = Math.random() < VISIT.clover ? 'clover' : pickWeighted(VISIT.gifts[from]);
  if (kind === 'flower' && weatherAt(t).season === 'winter') kind = from === 'squirrel' ? 'pinecone' : 'pebble';   // no flowers to pick in winter
  const dand = kind === 'clover' ? VISIT.cloverDand : Math.random() < VISIT.dandChance ? Math.round(rnd(VISIT.dand)) : 0;
  return { kind, from, dand };
}
function dropGift(g, x, d, t) { const it = { id: ++S.seq, ...g, x: Math.round(x), d: Math.round(d), at: t }; S.gifts.push(it); S.lastGiftAt = t; return it; }
// while the game was closed: a few visit chances spread over the time away (none at night or in heavy rain), 0–2 gifts waiting
function offlineVisits(from, to) {
  const O = VISIT.offline, hours = (to - from) / 3600000; let n = 0;
  if (!(hours >= O.minHours)) return 0;
  const slots = Math.max(1, Math.min(O.slots, Math.floor(hours / O.slotHours)));
  const times = [...Array(slots)].map(() => from + Math.random() * (to - from)).sort((a, b) => a - b);
  for (const t of times) {
    if (visitorsSleep(t) || weatherAt(t).heavy) continue;
    const who = pickVisitor(t); S.visits[who] = (S.visits[who] || 0) + 1;
    if (n < O.max && canGift(t) && Math.random() < O.giftChance) { const [x, d] = giftSpot(); dropGift(rollGift(who, t), x, d, t); n++; }
  }
  writeSave(S);
  return n;
}
