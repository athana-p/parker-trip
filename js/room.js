// ================= INSIDE: his room in the cabin and the big house, seen as a doll's-house cut-away =================
// Tap the house (cabin or bigger) to go in. The back wall, a strip of floor, a window that shows the yard outside
// as it is right now (time of day, weather), his bed, and shelves where his souvenirs set themselves out.
// If he's home he trots in after you, potters about, sniffs things and lies on his bed; the big house's room is
// wider and slides left and right under your finger. Everything drawn here is entered in the art list.
//
// Room coordinates: x along the room (0 … R.w), y in scene units like the yard; the camera shows 400 wide.
// Heights hang off the floor line F0 (where the back wall meets the floor), which hangs off the screen height.

const ROOMS = [null, null,
  { level: 2, w: 400, wall: 'logs', floor: 'planks', side: 'logs', roof: '#7189bd', roofD: '#556c9f',
    door: { x: 62, w: 56, h: 118, col: '#9a6242', colD: '#7e4c31' }, windows: [{ x: 170, w: 100, h: 84, top: 96 }], bed: { x: 300 },
    shelves: [[22, 378, 64], [236, 378, 150], [236, 378, 232], [22, 108, 150]], lamp: 300 },
  { level: 3, w: 640, wall: 'cream', floor: 'honey', side: 'siding', roof: '#e8604c', roofD: '#c94b3b',
    door: { x: 72, w: 58, h: 124, col: '#5b8ed1', colD: '#3f6fb0' }, windows: [{ x: 252, w: 100, h: 88, top: 100 }, { x: 444, w: 100, h: 88, top: 100 }], bed: { x: 566 },
    shelves: [[22, 618, 62], [506, 618, 150]], lamp: 348 },
];
const ROOM_K = 1.05, ROOM_D = 90, SV_K = 0.6, SV_SLOT = 32;      // his size indoors; the souvenirs' size and spacing on the shelves
const ROOMV = { on: false, cam: 0, trans: null, followAt: null, drag: null, doorOpenUntil: 0, wiggle: null };
const roomR = () => ROOMS[Math.max(2, houseLevel())];
function roomGeom() {
  const F1 = V.H - 118, F0 = F1 - 92, C = F0 - 300;
  return { F0, F1, C, row: F0 + 46, rows: [F0 + 16, F0 + 46, F0 + 76], ground: F1 + 22 };
}
// where each souvenir sits: along the shelves left to right, then on the window sills
function roomSlots(R, g) {
  const out = [];
  for (const [x0, x1, dy] of R.shelves) { const n = Math.floor((x1 - x0) / SV_SLOT), pad = (x1 - x0 - n * SV_SLOT) / 2; for (let i = 0; i < n; i++) out.push([x0 + pad + (i + 0.5) * SV_SLOT, g.C + dy]); }
  for (const w of R.windows) out.push([w.x, g.C + w.top + w.h + 6]);
  return out;
}

// ---------- the art ----------
function roomWall(c, style, x, y, w, h) {
  if (style === 'logs') {             // the cabin: the inside of the log walls, a little lighter
    piece(c, rectP(x, y, w, h), '#e7b67c', { mul: 0.5, scr: 0.1 });
    for (let k = 0; k * 22 < h; k++) { const yy = y + h - 22 - k * 22; if (k % 2) piece(c, rectP(x, yy, w, 22), '#dda96f', { mul: 0.4, scr: 0 }); piece(c, rectP(x, yy - 1.2, w, 2.6), '#bf884f', { mul: 0.4, scr: 0 }); piece(c, rectP(x, yy + 1.6, w, 2), '#f2ca95', { mul: 0.2, scr: 0.2 }); }
  } else {                            // the big house: cream wallpaper with little sprigs, a wainscot below
    piece(c, rectP(x, y, w, h), '#f7ead2', { mul: 0.4, scr: 0.15 });
    const r = rng(31); for (let yy = y + 18; yy < y + h - 70; yy += 34) for (let xx = x + 14 + ((yy / 34) % 2) * 17; xx < x + w; xx += 34) { leaf(c, xx - 3, yy + 2, 7, 2.4, -0.9 + r() * 0.3, '#c9d8b0'); leaf(c, xx + 3, yy + 2, 7, 2.4, -2.2 + r() * 0.3, '#c9d8b0'); piece(c, circ(xx, yy - 2, 1.8), '#f2b9b0', { mul: 0.2 }); }
    pp(c, rectP(x, y + h - 64, w, 64), '#e9cfa6', 0.12); for (let xx = x + 10; xx < x + w; xx += 26) piece(c, rectP(xx, y + h - 60, 2, 56), '#d9b98c', { mul: 0.3 }); pp(c, rectP(x, y + h - 68, w, 6), '#fff6e6', 0.15);
  }
}
function roomFloor(c, style, x, y, w, h) {
  const base = style === 'honey' ? '#dcaa6c' : '#c98f58', line = style === 'honey' ? '#c08e55' : '#a8713f', lite = style === 'honey' ? '#ecc48c' : '#dca46c';
  piece(c, rectP(x, y, w, h), base, { mul: 0.5, scr: 0.1 });
  const r = rng(style === 'honey' ? 41 : 42);
  for (let k = 0; k < 5; k++) { const yy = y + k * h / 5; piece(c, rectP(x, yy, w, 1.6), line, { mul: 0.4 }); for (let xx = x + r() * 60; xx < x + w; xx += 70 + r() * 40) piece(c, rectP(xx, yy, 1.6, h / 5), line, { mul: 0.4 }); if (k % 2) piece(c, rectP(x, yy + 2, w, 2), lite, { mul: 0.2, scr: 0.2 }); }
}
function roomShell(lv, H, res, look) {
  const R = ROOMS[lv], w = R.w;
  const F1 = H - 118, F0 = F1 - 92, C = F0 - 300, ground = F1 + 22;
  const L = makeLayer(-16, C - 140, w + 16, H, Math.min(res, lv === 3 ? 2 : 3)), c = L.ctx, K = YARD_LOOK[look] || YARD_LOOK.spring;
  const peakY = C - (lv === 3 ? 110 : 124);
  // the ground the house stands on
  strip(c, -40, w + 40, x => ground + 3 * fbm1(x / 60, 7), H, K.lawn[3], { seed: 71, rimCol: K.rims[3], shadow: 0.2 });
  // attic under the roof, the roof in section, the ceiling beam
  const attic = poly([[-6, C], [w / 2, peakY + 14], [w + 6, C]]);
  pp(c, attic, '#b98a5c', 0.2); clipped(c, attic, () => { piece(c, rectP(-6, C - 30, w + 12, 8), '#9a6e45', { mul: 0.4 }); for (let x = 40; x < w; x += 70) piece(c, rectP(x, peakY, 6, C - peakY), '#a77a4e', { mul: 0.4 }); });
  pp(c, circ(w / 2, C - 54, 13), '#fff6e6', 0.15); piece(c, circ(w / 2, C - 54, 9.5), '#bfe0f2', { mul: 0.3, scr: 0.2 }); piece(c, rectP(w / 2 - 9.5, C - 55, 19, 2), '#fff6e6', { mul: 0.2 });
  for (const s of [-1, 1]) { const a = [w / 2, peakY], b = [w / 2 + s * (w / 2 + 16), C + 6]; pp(c, slab(a, b, 20), R.roof, 0.25); for (let k = 1; k < 12; k++) { const u = k / 12; piece(c, circ(lerp(a[0], b[0], u), lerp(a[1], b[1], u) - 6, 4.6), R.roofD, { mul: 0.3 }); } }
  pp(c, rectP(-8, C - 4, w + 16, 12), '#8a5e3c', 0.25);
  // back wall, skirting, floor
  roomWall(c, R.wall, 14, C + 8, w - 28, F0 - C - 8);
  roomFloor(c, R.floor, 0, F0, w, F1 - F0);
  pp(c, rectP(14, F0 - 9, w - 28, 9), '#fff6e6', 0.15);
  // windows: a hole for the view, then the frame, glazing bars, sill and curtains
  for (const win of R.windows) {
    const x = win.x - win.w / 2, y = C + win.top;
    c.save(); c.globalCompositeOperation = 'destination-out'; c.fillRect(x, y, win.w, win.h); c.restore();
    ART.paint('room.window', c, x, y, win.w, win.h);
  }
  // shelves for the souvenirs
  for (const [x0, x1, dy] of R.shelves) ART.paint('furn.shelf', c, x0, x1, C + dy);
  ART.paint('furn.ceilingLamp', c, R.lamp, C + 8);
  // door frame (the door itself is drawn live: it opens)
  const d = R.door; pp(c, archDoor(d.x, F0, d.w + 12, d.h + 6), '#fff6e6', 0.15);
  // the walls and floor in section, the footing
  for (const x of [-2, w - 14]) { pp(c, rectP(x, C, 16, F1 - C), R.side === 'logs' ? '#cf9152' : '#f6cf86', 0.25); if (R.side === 'logs') for (let y = C + 10; y < F1; y += 22) { piece(c, ell(x + 8, y, 7, 9), '#f0c891', { mul: 0.3 }); piece(c, ell(x + 8, y, 3.6, 5), '#c4864e', { mul: 0.3 }); } else for (let y = C + 8; y < F1; y += 10) piece(c, rectP(x, y, 16, 1.6), '#eab86c', { mul: 0.4 }); }
  pp(c, rectP(-4, F1, w + 8, 12), '#8a5e3c', 0.3); pp(c, rectP(-8, F1 + 12, w + 16, 12), '#d9cdb9', 0.25); for (let x = -4; x < w; x += 24) piece(c, rectP(x, F1 + 14, 18, 8), '#cbbca7', { mul: 0.3 });
  return L;
}
ART.def('room.shell', { kind: 'layer', group: 'room', note: 'the cut-away room without the things in it: (level, H, res, season look); x = room x', draw: (lv, H, res, look) => roomShell(lv, H, res, look) });
ART.def('room.wall', { kind: 'paint', group: 'room', note: 'a back wall: (c, style logs | cream, x, y, w, h)', draw: (c, st, x, y, w, h) => roomWall(c, st, x, y, w, h) });
ART.def('room.floor', { kind: 'paint', group: 'room', note: 'a floor: (c, style planks | honey, x, y, w, h)', draw: (c, st, x, y, w, h) => roomFloor(c, st, x, y, w, h) });
ART.def('room.window', { kind: 'paint', group: 'room', note: 'a window frame round a hole: (c, x, y, w, h)', draw: (c, x, y, w, h) => {
  const f = '#fff6e6', fr = new Path2D(); fr.addPath(rectP(x - 6, y - 6, w + 12, 6)); fr.addPath(rectP(x - 6, y + h, w + 12, 6)); fr.addPath(rectP(x - 6, y, 6, h)); fr.addPath(rectP(x + w, y, 6, h));
  pp(c, fr, f, 0.2); piece(c, rectP(x + w / 2 - 2, y, 4, h), f, { mul: 0.2 }); piece(c, rectP(x, y + h / 2 - 2, w, 4), f, { mul: 0.2 });
  pp(c, slab([x - 12, y + h + 9], [x + w + 12, y + h + 9], 7), '#e8cfa4', 0.2);
  for (const s of [-1, 1]) { const cx = s < 0 ? x - 8 : x + w + 8, p = poly([[cx - 8, y - 10], [cx + 8, y - 10], [cx + 6 + s * 4, y + h * 0.7], [cx - 6 + s * 4, y + h * 0.75]]); pp(c, p, '#f3b9b0', 0.18); clipped(c, p, () => { for (let k = -2; k <= 2; k++) piece(c, rectP(cx + k * 4, y - 10, 1.4, h), '#e9a59c', { mul: 0.3 }); }); }
  pp(c, rectP(x - 16, y - 13, w + 32, 4), '#9a6e45', 0.15);
} });
ART.def('furn.shelf', { kind: 'paint', group: 'furn', note: 'a wall shelf: (c, x0, x1, y = its top)', draw: (c, x0, x1, y) => {
  for (const x of [x0 + 10, x1 - 10]) pp(c, poly([[x - 3, y + 4], [x + 3, y + 4], [x + 3, y + 16], [x - 3, y + 8]]), '#9a6e45', 0.15);
  pp(c, rectP(x0, y, x1 - x0, 6), '#b57a4a', 0.3); piece(c, rectP(x0, y, x1 - x0, 2), '#d39b66', { mul: 0.4 });
} });
ART.def('furn.ceilingLamp', { kind: 'paint', group: 'furn', note: 'the lamp hanging from the ceiling: (c, x, ceiling y)', draw: (c, x, y) => {
  c.save(); c.strokeStyle = '#5b4a40'; c.lineWidth = 1.2; c.beginPath(); c.moveTo(x, y); c.lineTo(x, y + 30); c.stroke(); c.restore();
  pp(c, poly([[x - 9, y + 30], [x + 9, y + 30], [x + 18, y + 46], [x - 18, y + 46]]), '#f6d79a', 0.2); piece(c, rectP(x - 18, y + 44, 36, 2.4), '#e2b86e', { mul: 0.3 });
  piece(c, circ(x, y + 48, 4.4), '#fff1c2', { mul: 0.1, scr: 0.4 });
} });
ART.def('furn.bed', { group: 'furn', box: { w: 150, h: 56, ox: 75, oy: 46 }, stick: false, note: 'his bed: a round cushion bed, origin on the floor under its middle', draw: c => {
  const base = ell(0, -14, 70, 16); castShadow(c, base, 4, 1, 4, 0.25); piece(c, base, '#5b8ed1', { mul: 0.4 });
  piece(c, ell(0, -19, 62, 11), '#7aaad6', { mul: 0.3, scr: 0.1 }); piece(c, ell(-6, -22, 44, 6), '#9cc2e6', { mul: 0.2, scr: 0.15 });
  const rim = new Path2D(); rim.addPath(ell(-58, -20, 14, 16, 0.2)); rim.addPath(ell(58, -20, 14, 16, -0.2)); pp(c, rim, '#4f80c2', 0.15);
  for (let k = -3; k <= 3; k++) piece(c, circ(k * 16, -4, 2), '#f6efe2', { mul: 0.2 });
  pawPrint(c, 0, -10, 0.35, '#3f6fb0');
} });
ART.def('room.door', { group: 'room', box: { w: 76, h: 140, ox: 38, oy: 134 }, stick: false, note: 'the door inside: level | open (1) or shut (0); origin on the floor under its middle', draw: (c, a) => {
  const R = ROOMS[+a[0]], d = R.door, path = archDoor(0, 0, d.w, d.h);
  if (+a[1]) { piece(c, path, '#3b2a2b', { mul: 0.5 }); clipped(c, path, () => { castShadow(c, path, 6, 0, 4, 0.5); piece(c, rectP(-d.w / 2, -d.h, 10, d.h), d.col, { mul: 0.4 }); piece(c, rectP(-d.w / 2 + 12, -d.h * 0.42, d.w - 24, d.h * 0.42), '#a6d878', { mul: 0.3, scr: 0.2 }); }); return; }
  pp(c, path, d.col, 0.12); clipped(c, path, () => { for (let k = 1; k < 4; k++) piece(c, rectP(-d.w / 2 + k * d.w / 4 - 1, -d.h, 2, d.h), d.colD, { mul: 0.4 }); });
  pp(c, circ(d.w / 2 - 10, -d.h * 0.45, 2.6), ARCH.gold, 0.12);
} });
// the yard through a window: the same sky, hills, fence and weather as outside, right now
ART.def('live.windowView', { kind: 'live', group: 'room', note: '(ctx, x, y, w, h, source centre x): the outside, framed', draw: (ctx, x, y, w, h, scx) => {
  const L = LAY, hz = V.H - 330, sw = 200, sh = sw * h / w, sx = scx - sw / 2, sy = hz - sh * 0.62, k = w / sw;
  const part = (Lr) => { if (!Lr) return; const r = Lr.res, ox = (sx - Lr.x0) * r, oy = (sy - Lr.y0) * r; ctx.drawImage(Lr.c, ox, oy, sw * r, sh * r, x, y, w, h); };
  ctx.save(); ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
  part(L.sky);
  ctx.save(); ctx.translate(x, y); ctx.scale(k, k); ctx.translate(-sx, -sy);
  L.clouds.forEach((cl, i) => { const span = SCENE_W + 200, cx = ((i * 157 + TT * (WX.kind === 'wind' ? 5 : 1) * (3 + i * 1.5)) % span) - 100; drawLayer(ctx, cl, cx, hz * [0.2, 0.42, 0.1][i]); });
  ctx.restore();
  part(ROOMLAY.view || L.yard);
  ctx.save(); ctx.translate(x, y); ctx.scale(k, k); ctx.translate(-sx, -sy); ART.draw('live.weather', ctx, WX, V.H, TT, V.res); ctx.restore();
  ctx.globalCompositeOperation = 'multiply'; part(L.mul);
  ctx.restore();
} });
// indoors at dusk and at night: a softer version of the outside light, and the lamp's warm glow
ART.def('live.roomLight', { kind: 'live', group: 'room', note: '(ctx, palette, lamp x, lamp y, area)', draw: (ctx, p, lx, ly, area) => {
  if (!p.lamp) return;
  const [r, g, b] = p.tint, m = t => Math.round(255 - (255 - t) * 0.45);
  ctx.save(); ctx.globalCompositeOperation = 'multiply'; ctx.fillStyle = `rgb(${m(r)},${m(g)},${m(b)})`; ctx.fill(area); ctx.restore();
  ctx.save(); ctx.globalCompositeOperation = 'screen'; glow(ctx, lx, ly, 190, '255,214,150', 0.32 * p.lamp); glow(ctx, lx, ly, 40, '255,236,190', 0.6 * p.lamp); ctx.restore();
} });

// ---------- going in and out ----------
const PAPER = '#f6ead6';
function roomTransition(mid) { ROOMV.trans = { t0: TT, mid, done: false }; }
function drawTransition() {
  const T0 = ROOMV.trans; if (!T0) return;
  const u = (TT - T0.t0) / 0.4;
  if (u >= 0.5 && !T0.done) { T0.done = true; T0.mid(); }
  if (u >= 1) { ROOMV.trans = null; return; }
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1 - Math.abs(u - 0.5) * 2; ctx.fillStyle = PAPER; ctx.fillRect(0, 0, cv.width, cv.height); ctx.restore();
}
function showBars() {
  const panel = typeof UI !== 'undefined' && UI.panel;
  document.getElementById('bar').classList.toggle('hidden', !!panel || ROOMV.on);
  document.getElementById('roomBar').classList.toggle('hidden', !!panel || !ROOMV.on);
}
function enterRoom() {
  if (houseLevel() < 2 || ROOMV.on || ROOMV.trans || HOUSEFX.on) return;
  SFX.door(true);
  roomTransition(() => {
    FX.length = 0;                       // hearts and Zs from outside stay outside
    ROOMV.on = true; ROOMV.cam = 0; ROOMV.followAt = null; showBars(); hideToast();
    if (!P.present || P.pack || P.carrying || /packup|departLook|arrive|gift/.test(P.mode)) return;
    if (/^(inhouse|goin)$/.test(P.mode)) { const left = Math.max(20, P.until - TT); putInRoom(roomR().bed.x); P.onBed = true; P.face = 1; setMode('nap', left); return; }   // already napping inside: on his bed
    ROOMV.followAt = TT + 0.9;          // he follows you in
  });
}
function putInRoom(x) { P.inRoom = true; P.onBed = false; P.x = x; P.d = ROOM_D; }
function stopYardPlay() {               // whatever he was doing in the yard stops when he comes in
  if (P.hold) dropHeld(); P.hold = null;
  if (KITE.on) { KITE.on = false; KITE.drag = null; KITE.landing = false; }
  if (SPRINK.on) sprinklerOff();
  if (TUG.on) TUG.on = false;
  FETCH.drag = null; press = null;
}
function roomTick() {
  if (!ROOMV.on || ROOMV.followAt == null || TT < ROOMV.followAt) return;
  ROOMV.followAt = null;
  if (!P.present || P.inRoom || P.pack || /packup|departLook|arrive|gift/.test(P.mode)) return;
  const R = roomR(), sleepy = /^(sleep|nap|stir|drowsy)$/.test(P.mode);
  stopYardPlay(); putInRoom(R.door.x); P.face = 1; ROOMV.doorOpenUntil = TT + 1;
  if (sleepy || (sleepTime() && TT >= (P.awakeUntil || 0))) return roomBed('sleep');
  setMode('trot', null, { x: R.door.x + 80, d: ROOM_D, then: () => { SFX.pop(); setMode('wag', HABITS.reactionTime.wag); } });
}
function leaveRoom() {
  if (!ROOMV.on || ROOMV.trans) return;
  SFX.door(false);
  roomTransition(leaveRoomNow);
}
function leaveRoomNow() {
  if (!ROOMV.on) return;
  ROOMV.on = false; ROOMV.followAt = null; ROOMV.drag = null; FX.length = 0; showBars();
  if (S.shelf.some(s => s.isNew)) { S.shelf.forEach(s => s.isNew = false); writeSave(S); }
  if (!P.inRoom) return;
  const asleep = P.onBed && /^(sleep|nap|lie|stir)$/.test(P.mode);
  P.inRoom = false; P.onBed = false; press = null;
  if (asleep) { P.x = DOOR.x; P.d = DOOR.d; P.face = 1; setMode('inhouse', Math.max(20, P.until - TT)); return; }   // still asleep: he stays in
  P.x = DOOR.x; P.d = DOOR.d - 4; P.face = 1;                                                                           // he follows you out
  setMode('trot', null, { x: DOOR.x + 34, d: DOOR.d - 30, then: () => setMode('wag', HABITS.reactionTime.wag) });
}

// ---------- what he does indoors ----------
function roomBed(kind) {
  const R = roomR();
  goTo(R.bed.x - 10, ROOM_D, () => faceThen(1, () => { P.onBed = true; P.x = R.bed.x; kind === 'sleep' ? setMode('sleep', rand(HABITS.duration.sleep)) : setMode(kind, rand(kind === 'nap' ? HABITS.duration.nap || [20, 40] : HABITS.duration.lie)); }));
}
function roomPickNext() {
  const R = roomR(), g = roomGeom(), was = P.onBed; P.onBed = false;
  if (P.wet) { P.wet = false; SFX.shake(); return setMode('shakeoff', HABITS.wxTime.shakeOff); }
  if (sleepTime() && TT >= (P.awakeUntil || 0)) return roomBed('sleep');
  if (was) return setMode('sigh', HABITS.sighTime, { lie: false });            // just hopped off his bed
  const things = [[R.door.x, 'door'], [R.bed.x, 'bed'], ...R.windows.map(w => [w.x, 'window']), ...roomSlots(R, g).slice(0, Math.max(1, S.shelf.length)).filter(s => s[1] > g.C + 120).map(s => [s[0], 'shelf'])];
  const k = pickWeighted({ walk: 3, sniff: 2.6, sit: 1.6, bed: 1.6, window: 1, sigh: 0.5 });
  const lo = 44, hi = R.w - 44;
  if (k === 'walk') { const x = clamp(P.x + (Math.random() < 0.5 ? -1 : 1) * (60 + Math.random() * 180), lo, hi); return goTo(x, ROOM_D, Math.random() < 0.4 ? () => setMode('sniff', rand(HABITS.duration.sniff)) : null); }
  if (k === 'sniff') { const [tx] = things[Math.floor(Math.random() * things.length)], side = tx > P.x ? 1 : -1; return goTo(clamp(tx - 46 * side, lo, hi), ROOM_D, () => faceThen(side, () => setMode('sniff', rand([2, 3.5])))); }
  if (k === 'bed') return roomBed(Math.random() < 0.5 ? 'lie' : 'nap');
  if (k === 'window') { const w = R.windows[Math.floor(Math.random() * R.windows.length)]; return goTo(clamp(w.x - 20, lo, hi), ROOM_D, () => faceThen(1, () => setMode('admire', rand([2.5, 4])))); }
  if (k === 'sigh') return setMode('sigh', HABITS.sighTime, { lie: false });
  setMode('sit', rand([3, 6]));
}

// ---------- drawing ----------
const ROOMLAY = { key: null, L: null, view: null };
function roomLayer() {
  const lv = Math.max(2, houseLevel()), key = [lv, V.H, V.res, WX.look].join('|');
  if (ROOMLAY.key !== key) { ROOMLAY.key = key; ROOMLAY.L = ART.layer('room.shell', lv, V.H, V.res, WX.look); ROOMLAY.view = ART.layer('scene.yard', V.H, Math.min(V.res, 2), WX.look, lv, true); }   // the yard as seen from inside: without the house
  return ROOMLAY.L;
}
function roomParkerScreen() { const g = roomGeom(); return [P.x - ROOMV.cam, g.row - (P.onBed ? 10 : 0)]; }
function drawRoom() {
  const L = LAY, R = roomR(), g = roomGeom(), cam = ROOMV.cam;
  ctx.setTransform(cv.width / SCENE_W, 0, 0, cv.width / SCENE_W, 0, 0);
  drawLayer(ctx, L.sky);
  const hz = V.H - 330;
  L.clouds.forEach((cl, i) => { const span = SCENE_W + 200, x = ((i * 157 + TT * (WX.kind === 'wind' ? 5 : 1) * (3 + i * 1.5)) % span) - 100; drawLayer(ctx, cl, x, hz * [0.2, 0.42, 0.1][i]); });
  // weather outside the house (above the roof)
  ctx.save(); ctx.beginPath(); ctx.rect(0, 0, SCENE_W, g.C - (R.level === 3 ? 110 : 124)); ctx.clip(); ART.draw('live.weather', ctx, WX, V.H, TT, V.res); ctx.restore();
  ctx.save(); ctx.translate(-cam, 0);
  const shell = roomLayer();
  for (const w of R.windows) ART.draw('live.windowView', ctx, w.x - w.w / 2, g.C + w.top, w.w, w.h, 180 + (w.x / R.w) * 140);
  drawLayer(ctx, shell);
  // souvenirs on the shelves
  const slots = roomSlots(R, g);
  S.shelf.forEach((s, i) => {
    const sl = slots[i]; if (!sl) return;
    const wig = ROOMV.wiggle && ROOMV.wiggle.id === s.id ? Math.sin((TT - ROOMV.wiggle.t0) * 24) * 0.12 * clamp(1 - (TT - ROOMV.wiggle.t0) / 0.6) : 0;
    if (s.isNew) ART.draw('fx.glow', ctx, sl[0], sl[1] - 16, 30, '255,236,170', 0.5 + 0.15 * Math.sin(TT * 2));
    drawSprite(sprite(`souvenir.${s.id}|${SV_K}`), sl[0], sl[1], { rot: wig, shA: 0.18 });
  });
  // the door, his bed, him
  drawSprite(sprite(`room.door|${R.level}|${TT < ROOMV.doorOpenUntil ? 1 : 0}`), R.door.x, g.F0, { shA: 0 });
  drawSprite(sprite('furn.bed'), R.bed.x, g.rows[1] + 4, { shA: 0 });
  if (P.present && P.inRoom) {
    const dr = parkerDrawing(), [sx, sy] = roomParkerScreen(), x = sx + cam;
    ART.draw('live.shadow.parker', ctx, x, sy + 1, (isLying() ? 70 : 52) * ROOM_K * Math.max(0.6, Math.abs(dr.sx)), 6 * ROOM_K, 1 / (1 + dr.lift / 34));
    drawSprite(sprite(dr.key), x, sy - dr.lift, { sx: dr.sx, scale: ROOM_K });
  }
  ctx.restore();
  // indoor light at dusk / night (over the house only)
  const area = new Path2D(); area.rect(-cam - 20, g.C - 140, R.w + 40, V.H);
  ART.draw('live.roomLight', ctx, L.p, R.lamp - cam, g.C + 56, area);
  drawFX();
}
// his middle, in screen units, when he's indoors (hearts, Zs and taps use it)
function roomParkerCenter() { const [x, y] = roomParkerScreen(), lying = isLying(); return [x + (lying ? 20 : 4) * P.face * ROOM_K, y - (lying ? 34 : 64) * ROOM_K]; }

// ---------- taps and slides ----------
function roomDown(e, x, y) {
  if (P.present && P.inRoom && onParker(x, y)) { press = { id: e.pointerId, t0: TT, x, y, dist: 0, rub: false }; try { cv.setPointerCapture(e.pointerId); } catch (err) { } return; }
  ROOMV.drag = { id: e.pointerId, x0: x, y0: y, cam0: ROOMV.cam, moved: false };          // slides the wide room; if it doesn't move, it's a tap
  try { cv.setPointerCapture(e.pointerId); } catch (err) { }
}
function roomTap(x, y) {
  const R = roomR(), g = roomGeom(), rx = x + ROOMV.cam;
  // a souvenir: it wiggles and says what it is
  const slots = roomSlots(R, g);
  for (let i = 0; i < S.shelf.length; i++) { const sl = slots[i]; if (sl && Math.abs(rx - sl[0]) < 16 && y > sl[1] - 40 && y < sl[1] + 4) { const s = S.shelf[i]; ROOMV.wiggle = { id: s.id, t0: TT }; SFX.pop(); toastText(`${T('sv.' + s.id)} · ${T('pc.' + s.id + '.name')}`, 2200); return; } }
  if (Math.abs(rx - R.door.x) < R.door.w / 2 + 4 && y > g.F0 - R.door.h && y < g.F0 + 6) return leaveRoom();       // the door: back out to the yard
  if (P.present && P.inRoom && Math.abs(rx - R.bed.x) < 70 && y > g.rows[1] - 40 && y < g.rows[1] + 8 && !/sleep|nap|stir/.test(P.mode)) return roomBed('lie');   // his bed: come and lie down
}
function roomMove(e, x) {
  const D = ROOMV.drag; if (!D || e.pointerId !== D.id) return false;
  if (Math.abs(x - D.x0) > 6) D.moved = true;
  if (D.moved) ROOMV.cam = clamp(D.cam0 - (x - D.x0), 0, roomR().w - SCENE_W);
  return true;
}
function roomUp(e) { const D = ROOMV.drag; if (!D || e.pointerId !== D.id) return false; ROOMV.drag = null; if (!D.moved) roomTap(D.x0, D.y0); return true; }
