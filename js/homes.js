// ================= THE LITTLE VISITORS' HOMES (plan 2, stage 3: only at the big house) =================
// A good friend (level 3) moves in once he lives in the big house: on its next visit it brings something to the
// door, Parker sniffs it, and it has a home here from then on —
//   sparrow  a little nest under the eaves on the side of the house (outside; it stays there)
//   squirrel a hollow stump in his room (a floor thing in the decorating tray)
//   cat      a soft round cushion bed in his room (a floor thing in the decorating tray)
// Living here: the sparrow sings from its nest in the morning and flies in and out of the yard; the squirrel hides
// nuts in its stump and peeks out now and then; the cat sleeps in her bed and sometimes Parker naps beside her.
// They are home while he travels too. A home put back in the tray just means it visits like before: nothing is lost.

// ---------- the art ----------
const NEST = { straw: '#c99a5a', strawD: '#a87a40', strawL: '#e6c486', in: '#7a5636' };
// the sparrow's nest, stuck under the eave: origin = where it hangs from. state: 'empty' | 'in' | 'sing' | 'sleep'
function drawNest(c, state = 'empty') {
  const cup = new Path2D(); cup.moveTo(-17, -2); cup.quadraticCurveTo(-18, 16, 0, 18); cup.quadraticCurveTo(18, 16, 17, -2); cup.closePath();
  pp(c, ell(0, -2, 17, 5), NEST.in, 0.1);                                                    // the dark inside of the cup
  if (state !== 'empty') {                                                                    // the sparrow sitting in it
    c.save(); c.translate(-1, 9); c.scale(0.78, 0.78); if (state === 'sing') { c.translate(4, -14); c.rotate(-0.35); c.translate(-4, 14); }
    drawBird(c, 0);
    if (state === 'sleep') { pp(c, circ(11, -24, 2.4), '#a5603c', 0); c.save(); c.strokeStyle = PK.eye; c.lineWidth = 1.2; c.lineCap = 'round'; c.beginPath(); c.arc(11, -24.5, 1.6, 0.15 * Math.PI, 0.85 * Math.PI); c.stroke(); c.restore(); }
    if (state === 'sing') { piece(c, poly([[15, -21], [20, -18], [15, -18.5]]), '#4a3a32', { mul: 0.4 }); }   // beak open
    c.restore();
  }
  pp(c, cup, NEST.straw, 0.22);                                                               // the woven front, over its tummy
  clipped(c, cup, () => { const r = rng(7); for (let k = 0; k < 16; k++) { const y = -2 + r() * 18, x = -18 + r() * 30; piece(c, slab([x, y], [x + 8 + r() * 6, y + (r() - 0.5) * 5], 1.1), r() < 0.5 ? NEST.strawD : NEST.strawL, { mul: 0.3 }); } });
  c.save(); c.strokeStyle = NEST.strawD; c.lineWidth = 1.1; c.lineCap = 'round';
  for (const [a, b] of [[[-16, 1], [-23, -3]], [[15, 3], [22, 0]], [[-6, 17], [-9, 23]], [[6, 16], [8, 22]]]) { c.beginPath(); c.moveTo(...a); c.lineTo(...b); c.stroke(); }   // stray straws
  c.restore();
  pp(c, slab([-17, -2], [17, -2], 2.4), NEST.strawL, 0.08);                                    // the rim
}
const BOX_NEST = { w: 60, h: 56, ox: 30, oy: 30 };

// the squirrel's hollow stump: a round door, moss on top, a ring of growth lines on the cut top
function drawStump(c) {
  const body = new Path2D(); body.moveTo(-26, 0); body.lineTo(-23, -40); body.lineTo(23, -40); body.lineTo(27, 0); body.closePath();
  pp(c, union(body, ell(-26, -2, 8, 4), ell(27, -2, 8, 4)), '#a8703f', 0.25);                 // the stump, with roots at its feet
  clipped(c, body, () => { const r = rng(12); for (let k = 0; k < 7; k++) { const x = -22 + k * 7.5 + r() * 2; piece(c, slab([x, -38], [x + (r() - 0.5) * 3, -2], 1.6), '#8a5a30', { mul: 0.4 }); } piece(c, rectP(-26, -12, 54, 12), '#93602f', { mul: 0.3 }); });
  pp(c, ell(0, -40, 23, 6.5), '#e3b98a', 0.12); for (const r of [16, 10, 4.5]) { c.save(); c.strokeStyle = '#c9965f'; c.lineWidth = 1; c.beginPath(); c.ellipse(0, -40, r, r * 0.28, 0, 0, TAU); c.stroke(); c.restore(); }
  pp(c, union(ell(-12, -45, 10, 4.5), ell(-3, -47, 8, 4)), '#7fb86a', 0.1); piece(c, ell(-8, -47, 5, 1.6), '#a8d690', { mul: 0.2 });   // moss
  pp(c, circ(2, -22, 11.5), '#7a4c2a', 0.08); piece(c, circ(2, -22, 9.5), '#3f2716', { mul: 0.3 });       // the round door
  pp(c, rectP(10, -12, 13, 9), '#f3e3c0', 0.1); sqNut(c, 16.5, -7.6);                         // a little sign with a nut on it
}
const BOX_STUMP = { w: 76, h: 64, ox: 38, oy: 56 };
// the squirrel looking out of its door (drawn over the stump at its origin): 0 just the eyes, 1 head and paws out
function drawStumpPeek(c, k = 1) {
  c.save(); c.beginPath(); c.arc(2, -22, 9.5, 0, TAU); c.rect(-12, -60, 28, 38); c.clip();
  if (k) { sqHead(c, 2, -26, false, false); pp(c, ell(-3, -15, 3.2, 2.4), SQ.fur, 0.05); pp(c, ell(7, -15, 3.2, 2.4), SQ.fur, 0.05); }
  else { for (const x of [-1.5, 5.5]) { c.fillStyle = PK.eye; c.beginPath(); c.arc(x, -24, 1.7, 0, TAU); c.fill(); c.fillStyle = '#fff'; c.beginPath(); c.arc(x + 0.6, -24.6, 0.55, 0, TAU); c.fill(); } }
  c.restore();
  piece(c, slab([-8, -12.6], [12, -12.6], 2), '#7a4c2a', { mul: 0.2 });                       // the door's sill, in front
}
// the nuts it has hidden, in a little heap by the door (n = 0…5)
function drawStash(c, n) { for (let i = 0; i < Math.min(5, n); i++) { const [x, y] = [[-14, -1], [-9, -2], [-19, -2], [-12, -6], [-16, -5]][i]; sqNut(c, x, y); } }

// the cat's bed: a round cushion with a soft blue gingham rim and a paw on the front
function drawCatBed(c) {
  pp(c, ell(0, -12, 44, 15), '#8fb9e2', 0.25);
  clipped(c, ell(0, -12, 44, 15), () => { for (let x = -44; x < 44; x += 9) piece(c, rectP(x, -30, 4.5, 36), '#b5d2ee', { mul: 0.2 }); for (let y = -27; y < 4; y += 9) piece(c, rectP(-46, y, 92, 4.5), '#b5d2ee', { mul: 0.2 }); });
  pp(c, ell(0, -17, 33, 9), '#fdf3e0', 0.1); piece(c, ell(0, -15, 31, 6.5), '#f3e3c8', { mul: 0.2 });   // the cushion
  pp(c, ell(0, -4, 42, 7), '#7aa6d8', 0.12); pawPrint(c, 0, -4, 0.3, '#fdf3e0');                // the front of the rim
}
const BOX_CATBED = { w: 100, h: 44, ox: 50, oy: 36 };
// the cat curled up asleep in it (origin = the bed's origin): b = breathing 0 | 1; 'wake' = head up, a slow blink
function drawCatCurl(c, b = 0) {
  const up = b === 'wake' || b === 'wakeopen', br = b === 1 ? 1.2 : 0;
  c.save(); c.translate(-2, 2); c.scale(0.86, 0.86);
  const body = union(ell(-4, -24 - br * 0.5, 24, 12 + br), ell(10, -20, 14, 9)); pp(c, body, NCAT.fur, 0.18);
  clipped(c, body, () => { for (const x of [-20, -10, 0]) piece(c, slab([x, -36], [x + 4, -20], 4), NCAT.dark, { mul: 0.4 }); });
  const tail = new Path2D(); tail.moveTo(-26, -18); tail.quadraticCurveTo(-24, -6, 6, -10); tail.quadraticCurveTo(18, -11, 22, -15); tail.lineTo(22, -10); tail.quadraticCurveTo(0, -3, -28, -14); tail.closePath();
  pp(c, tail, NCAT.fur, 0.12); clipped(c, tail, () => { for (const x of [-18, -6, 6, 16]) piece(c, rectP(x, -18, 4, 14), NCAT.dark, { mul: 0.4 }); });
  pp(c, ell(16, -14, 7, 3.6), NCAT.light, 0.1);                                                // a paw tucked under her chin
  ncatHead(c, up ? 22 : 20, up ? -36 : -26, 0.6, b !== 'wakeopen');
  c.restore();
}
// what each one brings to the door when it moves in: a bundle of straw, an acorn with a leaf, a little felt mouse
function drawMoveGift(c, k) {
  if (k === 'sparrow') {
    c.save(); c.lineCap = 'round'; for (let i = 0; i < 7; i++) { c.strokeStyle = i % 2 ? NEST.straw : NEST.strawL; c.lineWidth = 1.6; c.beginPath(); c.moveTo(-12 + i, -2 - i * 0.6); c.quadraticCurveTo(0, -8 - i, 13 - i * 0.4, -4 - i * 1.2); c.stroke(); } c.restore();
    pp(c, slab([-1, -9], [2, -2], 2.2), '#e2574a', 0.05);                                       // tied with a bit of red thread
  } else if (k === 'squirrel') {
    leaf(c, 6, -4, 13, 5, -0.5, '#e0913c');
    pp(c, ell(-2, -7, 6, 7.5), '#b9814a', 0.2); piece(c, ell(-4, -9, 1.8, 3.4, -0.2), '#d9a870', { mul: 0.1 });
    pp(c, union(ell(-2, -13, 7.4, 4), rectP(-2.6, -19, 1.6, 4)), '#7a4c2a', 0.12);
  } else {
    pp(c, union(ell(0, -6, 11, 6.5), poly([[8, -10], [15, -5], [8, -2]])), '#a9a6b6', 0.2);     // grey felt
    for (const x of [1, 6]) { pp(c, circ(x, -12, 3.4), '#a9a6b6', 0.08); piece(c, circ(x, -12, 2), '#f2b9b0', { mul: 0.2 }); }
    c.fillStyle = PK.eye; c.beginPath(); c.arc(10, -7, 1, 0, TAU); c.fill(); pp(c, circ(15, -5, 1.4), '#e98a8a', 0);
    c.save(); c.strokeStyle = '#e2574a'; c.lineWidth = 1.3; c.lineCap = 'round'; c.beginPath(); c.moveTo(-10, -5); c.bezierCurveTo(-18, -4, -14, 3, -21, 1); c.stroke(); c.restore();
  }
}
const BOX_MOVEGIFT = { w: 40, h: 30, ox: 20, oy: 22 };

ART.def('home.nest', { group: 'home', box: BOX_NEST, k: 1, stick: false, draw: (c, a) => drawNest(c, a[0]), note: 'the sparrow\'s nest under the eaves: empty | in | sing | sleep; origin = where it hangs' });
ART.def('furn.sqnest', { group: 'furn', box: BOX_STUMP, k: 1, stick: false, draw: c => drawStump(c), note: 'the squirrel\'s hollow stump (a floor thing in his room)' });
ART.def('home.sqpeek', { group: 'home', box: BOX_STUMP, k: 1, stick: false, draw: (c, a) => drawStumpPeek(c, +a[0]), note: 'the squirrel looking out of its stump: 0 eyes | 1 head; same origin as furn.sqnest' });
ART.def('home.stash', { group: 'home', box: BOX_STUMP, k: 1, stick: false, draw: (c, a) => drawStash(c, +a[0]), note: 'the nuts it has hidden by its door: count 1–5; same origin as furn.sqnest' });
ART.def('furn.catbed', { group: 'furn', box: BOX_CATBED, k: 1, stick: false, draw: c => drawCatBed(c), note: 'the cat\'s cushion bed (a floor thing in his room)' });
ART.def('home.catcurl', { group: 'home', box: { w: 100, h: 60, ox: 50, oy: 36 }, k: 1, stick: false, draw: (c, a) => drawCatCurl(c, a[0] === 'wake' || a[0] === 'wakeopen' ? a[0] : +a[0]), note: 'the cat curled up in her bed: 0 | 1 (breathing) | wake | wakeopen; same origin as furn.catbed' });
for (const k of ['sparrow', 'squirrel', 'cat']) ART.def('home.gift.' + k, { group: 'home', box: BOX_MOVEGIFT, k: 1.1, stick: false, draw: c => drawMoveGift(c, k), note: 'what it brings to the door when it moves in' });
// a little paper music note (the sparrow singing in the morning)
ART.def('fx.note', { group: 'fx', box: { w: 20, h: 24, ox: 10, oy: 12 }, stick: false, draw: c => { pp(c, union(ell(-3, 6, 4.4, 3.2, -0.4), rectP(0.4, -9, 2, 15), poly([[0.4, -9], [8, -6], [8, -2], [2.4, -5]])), '#5b3f37', 0.05); } });

// ---------- the rules ----------
const HOME_FURN = { squirrel: 'sqnest', cat: 'catbed' };
const HOMEV = { singAt: 0, singUntil: 0, peekAt: 0, peekT0: -9, wakeUntil: 0, stashAt: 0, run: null };
const MOVEIN = { on: false };
const hasHome = k => !!(S.homes && S.homes[k]);
function homeFurnPlaced(k) { return placedCount(HOME_FURN[k]) > 0; }
// it lives here: its home is unlocked and, for the squirrel and the cat, set out in his room (put away = visiting, as before)
function palLives(k) { if (!hasHome(k) || houseLevel() < 3) return false; return k === 'sparrow' || homeFurnPlaced(k); }
function moveInDue(k) { return !hasHome(k) && houseLevel() >= 3 && palLv(k) >= 3; }
// is it at home right now (not out in the yard)? The sparrow whenever it isn't visiting; the others at night always, and in
// the day in blocks of 20 minutes, a little more in than out
function palAtHome(k, t = Clock.now()) {
  if (!palLives(k) || (VIS.on && VIS.kind === k) || (HOMEV.run && k === 'squirrel')) return false;
  if (k === 'sparrow' || visitorsSleep(t) || t - S.homes[k].at < 1800000) return true;     // the sparrow: in its nest whenever it isn't out in the yard; the others: home at night, and for a while after moving in
  return hash1(Math.floor(t / 1200000), k.length * 13 + 7) < 0.55;
}
// where the sparrow's nest hangs: on the side wall of the big house, under the gable's eave
function nestAt() { const g = bigGeom(HOUSES[3].x0, Y(HOUSE.d)); return [g.fx1 + 24, g.top - 4]; }
const moveInSpot = () => [DOOR.x + 36, DOOR.d - 16];

// ---- moving in: it brings something to the door, he sniffs it, and it stays ----
function moveInCan() { return !MOVEIN.on && P.present && !P.inRoom && !ROOMV.on && !HOUSEFX.on && parkerFree(); }
function moveInPick() { const k = PALS.order.find(moveInDue); return k && moveInCan() && Math.random() < 0.7 ? k : null; }
function startMoveIn(kind) {
  const [x, d] = moveInSpot(), from = Math.random() < 0.5 ? -40 : SCENE_W + 40;
  Object.assign(MOVEIN, { on: true, k: kind, x, d, phase: 'bring', t0: TT, done: false });
  S.visits[kind] = (S.visits[kind] || 0) + 1;
  const base = { lv: palLv(kind), dish: null, ate: true, eatAt: Infinity, taps: 0, hopAt: -9, head: false, steal: null, hold: 0, gift: null, movein: true, stay: 40 };
  if (kind === 'sparrow') Object.assign(VIS, base, { on: true, kind, phase: 'in', x0: from, y0: Y(d) - 160, tx: x + (from < 0 ? -14 : 14), ty: Y(d), x: from, y: Y(d) - 160, d, t0: TT, face: Math.sign(x - from), pose: 0, poseAt: 0 });
  else Object.assign(VIS, base, { on: true, kind, phase: 'in', x: from, d: d + 2, td: null, tx: x + (from < 0 ? -26 : 26), t0: TT, face: Math.sign(x - from), pose: 'sit', poseAt: 0 });
  kind === 'sparrow' ? SFX.chirp() : kind === 'squirrel' ? SFX.chitter() : SFX.mew();
  writeSave(S);
}
function moveInArrive() {                 // it puts its present down by the door
  MOVEIN.phase = 'wait'; MOVEIN.t0 = TT; MOVEIN.deadline = TT + 10; VIS.until = TT + 40; VIS.hold = TT + 40; VIS.face = Math.sign(MOVEIN.x - VIS.x) || 1;
  SFX.pop(); fx({ type: 'glow', x: MOVEIN.x, y: Y(MOVEIN.d) - 8, life: 0.9, r: 34, rgb: '255,240,200' });
  if (P.present && !P.inRoom) {
    const side = Math.sign(MOVEIN.x - P.x) || 1;
    if (P.hold) dropHeld();
    wakeThen(() => goTo(clamp(MOVEIN.x - 62 * side, 30, 370), clamp(MOVEIN.d + 2, 100, 262), () => faceThen(side, () => setMode('sniff', 2.6, { next: () => { setMode('wag', HABITS.reactionTime.wag); SFX.pop(); moveInDone(); } }))));
  }
}
function moveInDone() {
  if (!MOVEIN.on || MOVEIN.done) return; MOVEIN.done = true; MOVEIN.phase = 'fade'; MOVEIN.t0 = TT;
  const k = MOVEIN.k; S.homes = S.homes || {}; S.homes[k] = { at: Clock.now(), nuts: 0 };
  if (HOME_FURN[k]) { const id = HOME_FURN[k]; S.furn[id] = Math.max(1, S.furn[id] || 0); decorEnsure(); }   // its home is set out in his room
  writeSave(S);
  toastText(capFirst(T_('home.move.' + k).replace('{who}', palWho(k))), 6500);
  SFX.gift(true); const y = Y(MOVEIN.d) - 20;
  for (let i = 0; i < 3; i++) fx({ type: 'spr', key: 'fx.heart', x: MOVEIN.x + (i - 1) * 16, y: y - i * 6, vy: -26, sway: 1, life: 1.5 + i * 0.2, scale: 0.8 });
  if (k === 'sparrow') { const [nx, ny] = nestAt(); fx({ type: 'glow', x: nx, y: ny + 6, life: 1.4, r: 40, rgb: '255,240,200' }); }
  VIS.hold = 0; VIS.movein = false; VIS.until = TT + 1.5;          // then off home: the sparrow to its new nest, the others in at the door
}
function moveInTick() {
  if (!MOVEIN.on) return;
  if (MOVEIN.phase === 'wait' && TT > MOVEIN.deadline) moveInDone();             // he was busy: it moves in all the same
  if (MOVEIN.phase === 'fade' && TT - MOVEIN.t0 > 1.2) MOVEIN.on = false;
  if (MOVEIN.phase === 'bring' && !VIS.on) MOVEIN.on = false;                   // (it was sent away before it got there)
}
function drawMoveInGift() {               // on the ground by the door (fading as it moves in), or in its mouth on the way
  if (!MOVEIN.on) return;
  const s = depthScale(MOVEIN.d);
  if (MOVEIN.phase === 'bring') {
    if (!VIS.on || VIS.phase === 'out') return;
    const [dx, dy] = VIS.kind === 'sparrow' ? [16, 20] : VIS.kind === 'cat' ? [40, 50] : [16, 28], ds = VIS.kind === 'sparrow' ? 1 : depthScale(VIS.d);
    const y = VIS.kind === 'sparrow' ? VIS.y : Y(VIS.d);
    return drawSprite(sprite('home.gift.' + VIS.kind), VIS.x + dx * VIS.face * ds, y - dy * ds, { sx: VIS.face, scale: ds * 0.8 });
  }
  const a = MOVEIN.phase === 'fade' ? 1 - clamp((TT - MOVEIN.t0) / 1.2) : 1;
  ART.draw('fx.glow', ctx, MOVEIN.x, Y(MOVEIN.d) - 10, 30, '255,244,210', 0.3 * a + 0.1 * Math.sin(TT * 3));
  drawSprite(sprite('home.gift.' + MOVEIN.k), MOVEIN.x, Y(MOVEIN.d), { scale: s, alpha: a });
}

// ---- living here ----
function homeTick() {
  moveInTick();
  const now = Clock.now(), h = new Date(now).getHours();
  // the sparrow sings from its nest in the morning
  if (!ROOMV.on && palAtHome('sparrow', now) && h >= 6 && h < 10 && TT > HOMEV.singAt) {
    HOMEV.singAt = TT + rand([14, 30]); HOMEV.singUntil = TT + 1.6; SFX.chirp();
    const [x, y] = nestAt(); for (let i = 0; i < 2; i++) fx({ type: 'spr', key: 'fx.note', x: x + 8 + i * 10, y: y - 14 - i * 6, vx: 10, vy: -18, sway: i, life: 1.6, scale: 0.8 });
  }
  if (!ROOMV.on) return;
  // in his room: the squirrel peeks out of its stump now and then; now and then it comes in with a nut to hide
  if (palAtHome('squirrel', now) && TT > HOMEV.peekAt) { HOMEV.peekAt = TT + rand([7, 18]); HOMEV.peekT0 = TT; }
  if (palLives('squirrel') && !HOMEV.run && TT > HOMEV.stashAt) { const first = !HOMEV.stashAt; HOMEV.stashAt = TT + rand([50, 110]); if (!first && Math.random() < 0.6 && !visitorsSleep(now) && !(VIS.on && VIS.kind === 'squirrel')) squirrelBringsNut(); }
  if (HOMEV.run) squirrelRun();
}
function squirrelBringsNut() {
  const R = roomR(), st = decorItems().find(r => r.id === 'sqnest'); if (!st) return;
  HOMEV.run = { x: R.door.x + 10, tx: st.x - 18 * (st.f ? -1 : 1), row: st.row, t0: TT, phase: 'in' };
  ROOMV.doorOpenUntil = TT + 1.2; SFX.chitter();
}
function squirrelRun() {
  const r = HOMEV.run, dt = 1 / 60, dx = r.tx - r.x;
  if (r.phase === 'in') { r.x += Math.sign(dx) * Math.min(Math.abs(dx), 80 * Math.min(0.05, TT - (r.last || TT))); if (Math.abs(dx) < 2) { r.phase = 'dive'; r.t0 = TT; } }
  else if (r.phase === 'dive' && TT - r.t0 > 0.5) { const hm = S.homes.squirrel; hm.nuts = Math.min(5, (hm.nuts || 0) + 1); writeSave(S); SFX.pop(); HOMEV.run = null; HOMEV.peekT0 = TT + 0.4; HOMEV.peekAt = TT + 9; }
  if (HOMEV.run) r.last = TT;
}
// the squirrel that lives here and eats the nuts you put out in the yard takes them home instead (the friendship counts all the same)
function squirrelStash() { const hm = S.homes.squirrel; hm.nuts = Math.min(5, (hm.nuts || 0) + 1); writeSave(S); }
// what to draw over a home in his room (called by drawDecorScene with the thing's anchor)
function drawHomeOverlay(r, a) {
  const sx = r.f ? -1 : 1, now = Clock.now();
  if (r.id === 'catbed' && palAtHome('cat', now)) {
    const st = TT < HOMEV.wakeUntil ? (TT > HOMEV.wakeUntil - 1.4 && TT < HOMEV.wakeUntil - 0.5 ? 'wakeopen' : 'wake') : Math.floor(TT / 1.1) % 2;
    drawSprite(sprite('home.catcurl|' + st), a[0], a[1], { sx, scale: a[2], shA: 0 });
  }
  if (r.id === 'sqnest') {
    const n = (S.homes.squirrel && S.homes.squirrel.nuts) || 0; if (n && palLives('squirrel')) drawSprite(sprite('home.stash|' + n), a[0], a[1], { sx, scale: a[2], shA: 0 });
    const u = TT - HOMEV.peekT0; if (palAtHome('squirrel', now) && u >= 0 && u < 2.8) drawSprite(sprite('home.sqpeek|' + (u < 0.4 || u > 2.4 ? 0 : 1)), a[0], a[1], { sx, scale: a[2], shA: 0 });
  }
}
function drawHomeRun(g) {                 // the squirrel hopping in with a nut
  const r = HOMEV.run; if (!r) return; const k = ROW_K[r.row] * 0.95, u = (TT * 2.6) % 1, lift = r.phase === 'in' && u > 0.35 ? 10 * Math.sin(Math.PI * (u - 0.35) / 0.65) : 0;
  const al = r.phase === 'dive' ? 1 - clamp((TT - r.t0) / 0.5) : 1;
  drawSprite(sprite(`visitor.squirrel|${r.phase === 'in' ? (u < 0.35 ? 'hop0' : 'hop1') : 'nibble'}`), r.x, g.rows[r.row] - 2 - lift, { sx: Math.sign(r.tx - r.x) || 1, scale: k * (r.phase === 'dive' ? 1 - 0.4 * (1 - al) : 1), alpha: al });
}
// taps on the homes
function homeTapRoom(r) {
  if (r.id === 'catbed') { if (palAtHome('cat')) { HOMEV.wakeUntil = TT + 2.4; SFX.mew(); fxHeartAt(r); } else toastText(capFirst(T_('home.out').replace('{who}', palWho('cat'))), 2600); return true; }
  if (r.id === 'sqnest') { if (palAtHome('squirrel')) { HOMEV.peekT0 = TT; HOMEV.peekAt = TT + 8; SFX.chitter(); fxHeartAt(r); } else toastText(capFirst(T_('home.out').replace('{who}', palWho('squirrel'))), 2600); return true; }
  return false;
}
function fxHeartAt(r) { const a = decorAnchor(r, roomGeom()); if (a) fx({ type: 'spr', key: 'fx.heart', x: a[0] - ROOMV.cam, y: a[1] - 52 * a[2], vy: -24, sway: 1, life: 1.3, scale: 0.7 }); }
function nestTap(x, y) {
  if (!palLives('sparrow')) return null; const [nx, ny] = nestAt(), dd = Math.hypot(x - nx, y - ny - 4);
  if (dd > 26) return null;
  return [dd, () => { if (palAtHome('sparrow')) { HOMEV.singUntil = TT + 1.4; SFX.chirp(); fx({ type: 'spr', key: 'fx.heart', x: nx, y: ny - 18, vy: -24, sway: 1, life: 1.2, scale: 0.6 }); } else toastText(capFirst(T_('home.nest.out').replace('{who}', palWho('sparrow'))), 2600); return true; }];
}
function drawNestYard() {
  if (houseLevel() < 3 || !hasHome('sparrow') || HOUSEFX.on) return;
  const now = Clock.now(), home = palAtHome('sparrow', now), st = !home ? 'empty' : visitorsSleep(now) ? 'sleep' : TT < HOMEV.singUntil ? 'sing' : 'in';
  const [x, y] = nestAt(); drawSprite(sprite('home.nest|' + st), x, y, { scale: 0.9, shA: 0.18 });
}
// the cat in her bed: sometimes he comes and naps beside her
function catNapSpot() {
  if (!palAtHome('cat')) return null; const b = decorItems().find(r => r.id === 'catbed'); if (!b) return null;
  const R = roomR(), side = b.x + 108 < R.w - 44 ? 1 : -1; return [b.x + 108 * side, -side];
}
