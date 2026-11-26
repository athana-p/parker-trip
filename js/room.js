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
    door: { x: 62, w: 56, h: 118, col: '#9a6242', colD: '#7e4c31' }, windows: [{ x: 170, w: 100, h: 84, top: 96 }],
    lamp: 300 },
  { level: 3, w: 640, wall: 'cream', floor: 'honey', side: 'siding', roof: '#e8604c', roofD: '#c94b3b',
    door: { x: 72, w: 58, h: 124, col: '#5b8ed1', colD: '#3f6fb0' }, windows: [{ x: 252, w: 100, h: 88, top: 100 }, { x: 444, w: 100, h: 88, top: 100 }],
    lamp: 348 },
];
const ROOM_K = 1.05, ROOM_D = 90, SV_K = 0.6, SV_SLOT = 32;      // his size indoors; the souvenirs' size and spacing on the shelves
const ROOMV = { on: false, cam: 0, trans: null, followAt: null, drag: null, doorOpenUntil: 0, wiggle: null };
const roomR = () => ROOMS[Math.max(2, houseLevel())];
function roomGeom() {
  const lift = ROOMV.lift || 0, F1 = V.H - 118 - lift, F0 = F1 - 92, C = F0 - 300;      // lift: raised while decorating, so the floor clears the tray
  return { F0, F1, C, lift, row: F0 + 46, rows: [F0 + 16, F0 + 46, F0 + 76], ground: F1 + 22 };
}

// ---------- the art ----------
function roomWall(c, style, x, y, w, h) {
  if (style === 'logs') {             // the cabin: the inside of the log walls, a little lighter
    piece(c, rectP(x, y, w, h), '#e7b67c', { mul: 0.5, scr: 0.1 });
    for (let k = 0; k * 22 < h; k++) { const yy = y + h - 22 - k * 22; if (k % 2) piece(c, rectP(x, yy, w, 22), '#dda96f', { mul: 0.4, scr: 0 }); piece(c, rectP(x, yy - 1.2, w, 2.6), '#bf884f', { mul: 0.4, scr: 0 }); piece(c, rectP(x, yy + 1.6, w, 2), '#f2ca95', { mul: 0.2, scr: 0.2 }); }
  } else if (style === 'stripe') {    // shop wallpapers (stage 5): soft blue stripes with a thin pink line
    piece(c, rectP(x, y, w, h), '#f3f6f4', { mul: 0.4, scr: 0.15 });
    for (let xx = x + 6; xx < x + w; xx += 30) { piece(c, rectP(xx, y, 14, h), '#cfe0ef', { mul: 0.3 }); piece(c, rectP(xx + 21, y, 2, h), '#f3c4bb', { mul: 0.2 }); }
    wainscot(c, x, y, w, h, '#d5e4f1', '#b7cde2');
  } else if (style === 'gingham') {   // butter-yellow gingham
    piece(c, rectP(x, y, w, h), '#fbf2d4', { mul: 0.4, scr: 0.15 });
    for (let xx = x + 4; xx < x + w; xx += 22) piece(c, rectP(xx, y, 11, h), '#f6e2a2', { mul: 0.2 });
    for (let yy = y + 4; yy < y + h; yy += 22) { piece(c, rectP(x, yy, w, 11), '#f6e2a2', { mul: 0.2 }); for (let xx = x + 4; xx < x + w; xx += 22) piece(c, rectP(xx, yy, 11, 11), '#efcf78', { mul: 0.2 }); }
    wainscot(c, x, y, w, h, '#ecd6a0', '#d9bd7c');
  } else if (style === 'paw') {       // pale pink with little paw prints
    piece(c, rectP(x, y, w, h), '#f9e3dc', { mul: 0.4, scr: 0.15 });
    for (let yy = y + 22, n = 0; yy < y + h - 70; yy += 36, n++) for (let xx = x + 16 + (n % 2) * 20; xx < x + w; xx += 40) pawPrint(c, xx, yy, 0.34, n % 2 ? '#f0bfb4' : '#ecb3a7');
    wainscot(c, x, y, w, h, '#efcbc2', '#e0afa4');
  } else {                            // the big house: cream wallpaper with little sprigs, a wainscot below
    piece(c, rectP(x, y, w, h), '#f7ead2', { mul: 0.4, scr: 0.15 });
    const r = rng(31); for (let yy = y + 18; yy < y + h - 70; yy += 34) for (let xx = x + 14 + ((yy / 34) % 2) * 17; xx < x + w; xx += 34) { leaf(c, xx - 3, yy + 2, 7, 2.4, -0.9 + r() * 0.3, '#c9d8b0'); leaf(c, xx + 3, yy + 2, 7, 2.4, -2.2 + r() * 0.3, '#c9d8b0'); piece(c, circ(xx, yy - 2, 1.8), '#f2b9b0', { mul: 0.2 }); }
    wainscot(c, x, y, w, h, '#e9cfa6', '#d9b98c');
  }
}
// the panelling along the bottom of a papered wall
function wainscot(c, x, y, w, h, base, line) { pp(c, rectP(x, y + h - 64, w, 64), base, 0.12); for (let xx = x + 10; xx < x + w; xx += 26) piece(c, rectP(xx, y + h - 60, 2, 56), line, { mul: 0.3 }); pp(c, rectP(x, y + h - 68, w, 6), '#fff6e6', 0.15); }
function roomFloor(c, style, x, y, w, h) {
  if (style === 'herring') {          // shop floors (stage 5): herringbone parquet
    piece(c, rectP(x, y, w, h), '#c98f58', { mul: 0.5, scr: 0.1 });
    const bh = h / 5; for (let k = 0; k < 5; k++) { const yy = y + k * bh, dir = k % 2 ? 1 : -1; for (let xx = x - 30, i = 0; xx < x + w + 30; xx += 15, i++) piece(c, poly([[xx, yy + bh], [xx + 13, yy + bh], [xx + 13 + dir * bh * 0.7, yy], [xx + dir * bh * 0.7, yy]]), i % 2 ? '#d9a467' : '#cf9a5e', { mul: 0.35 }); piece(c, rectP(x, yy, w, 1.4), '#a8713f', { mul: 0.4 }); }
    return;
  }
  if (style === 'checker') {          // cream and sage tiles
    const n = 4, th = h / n; piece(c, rectP(x, y, w, h), '#f1e8d2', { mul: 0.4, scr: 0.12 });
    for (let k = 0; k < n; k++) for (let xx = x, i = 0; xx < x + w; xx += 24, i++) if ((i + k) % 2) piece(c, rectP(xx, y + k * th, 24, th), '#b9cfa6', { mul: 0.35 });
    for (let k = 1; k < n; k++) piece(c, rectP(x, y + k * th - 0.6, w, 1.2), '#e2d6bb', { mul: 0.2 });
    return;
  }
  if (style === 'terra') {            // terracotta tiles, staggered, with pale grout
    const n = 3, th = h / n; piece(c, rectP(x, y, w, h), '#f1d9c0', { mul: 0.4, scr: 0.12 });
    const r = rng(43); for (let k = 0; k < n; k++) for (let xx = x - (k % 2) * 16; xx < x + w; xx += 32) piece(c, rectP(xx + 1.2, y + k * th + 1.2, 29.6, th - 2.4), r() < 0.5 ? '#d98b62' : '#d1815a', { mul: 0.4, scr: 0.08 });
    return;
  }
  const base = style === 'honey' ? '#dcaa6c' : '#c98f58', line = style === 'honey' ? '#c08e55' : '#a8713f', lite = style === 'honey' ? '#ecc48c' : '#dca46c';
  piece(c, rectP(x, y, w, h), base, { mul: 0.5, scr: 0.1 });
  const r = rng(style === 'honey' ? 41 : 42);
  for (let k = 0; k < 5; k++) { const yy = y + k * h / 5; piece(c, rectP(x, yy, w, 1.6), line, { mul: 0.4 }); for (let xx = x + r() * 60; xx < x + w; xx += 70 + r() * 40) piece(c, rectP(xx, yy, 1.6, h / 5), line, { mul: 0.4 }); if (k % 2) piece(c, rectP(x, yy + 2, w, 2), lite, { mul: 0.2, scr: 0.2 }); }
}
function roomShell(lv, H, res, look, wall, floor) {
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
  roomWall(c, wall || R.wall, 14, C + 8, w - 28, F0 - C - 8);
  roomFloor(c, floor || R.floor, 0, F0, w, F1 - F0);
  pp(c, rectP(14, F0 - 9, w - 28, 9), '#fff6e6', 0.15);
  // windows: a hole for the view, then the frame, glazing bars, sill and curtains
  for (const win of R.windows) {
    const x = win.x - win.w / 2, y = C + win.top;
    c.save(); c.globalCompositeOperation = 'destination-out'; c.fillRect(x, y, win.w, win.h); c.restore();
    ART.paint('room.window', c, x, y, win.w, win.h);
  }
  ART.paint('furn.ceilingLamp', c, R.lamp, C + 8);
  // door frame (the door itself is drawn live: it opens)
  const d = R.door; pp(c, archDoor(d.x, F0, d.w + 12, d.h + 6), '#fff6e6', 0.15);
  // the walls and floor in section, the footing
  for (const x of [-2, w - 14]) { pp(c, rectP(x, C, 16, F1 - C), R.side === 'logs' ? '#cf9152' : '#f6cf86', 0.25); if (R.side === 'logs') for (let y = C + 10; y < F1; y += 22) { piece(c, ell(x + 8, y, 7, 9), '#f0c891', { mul: 0.3 }); piece(c, ell(x + 8, y, 3.6, 5), '#c4864e', { mul: 0.3 }); } else for (let y = C + 8; y < F1; y += 10) piece(c, rectP(x, y, 16, 1.6), '#eab86c', { mul: 0.4 }); }
  pp(c, rectP(-4, F1, w + 8, 12), '#8a5e3c', 0.3); pp(c, rectP(-8, F1 + 12, w + 16, 12), '#d9cdb9', 0.25); for (let x = -4; x < w; x += 24) piece(c, rectP(x, F1 + 14, 18, 8), '#cbbca7', { mul: 0.3 });
  return L;
}
ART.def('room.shell', { kind: 'layer', group: 'room', note: 'the cut-away room without the things in it: (level, H, res, season look, wall style, floor style — null: the house\'s own); x = room x', draw: (lv, H, res, look, wall, floor) => roomShell(lv, H, res, look, wall, floor) });
ART.def('room.wall', { kind: 'paint', group: 'room', note: 'a back wall: (c, style logs | cream | stripe | gingham | paw, x, y, w, h)', draw: (c, st, x, y, w, h) => roomWall(c, st, x, y, w, h) });
ART.def('room.floor', { kind: 'paint', group: 'room', note: 'a floor: (c, style planks | honey | herring | checker | terra, x, y, w, h)', draw: (c, st, x, y, w, h) => roomFloor(c, st, x, y, w, h) });
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

// a sunny morning or day: soft patches of sun on the floor under the windows, leaning with the hour (stage 6: he naps in one)
ART.def('live.sunPatch', { kind: 'live', group: 'room', note: '(ctx, windows, room geometry, hour)', draw: (ctx, wins, g, hr) => {
  const lean = clamp((12.5 - hr) * 9, -50, 50);
  ctx.save(); ctx.globalCompositeOperation = 'screen';
  for (const w of wins) {
    const y0 = g.F0 + 6, y1 = g.F0 + 70, a = w.w * 0.42, b = w.w * 0.52, cx = w.x + lean * 0.4, cx1 = w.x + lean * 1.3;
    const beam = new Path2D(); beam.moveTo(w.x - w.w / 2 + 6, g.C + w.top + w.h); beam.lineTo(w.x + w.w / 2 - 6, g.C + w.top + w.h); beam.lineTo(cx1 + b, y1); beam.lineTo(cx1 - b, y1); beam.closePath();
    ctx.globalAlpha = 0.07; ctx.fillStyle = '#fff0c8'; ctx.fill(beam);                                  // the light in the air
    const patch = new Path2D(); patch.moveTo(cx - a, y0); patch.lineTo(cx + a, y0); patch.lineTo(cx1 + b, y1); patch.lineTo(cx1 - b, y1); patch.closePath();
    const gr = ctx.createLinearGradient(0, y0, 0, y1); gr.addColorStop(0, 'rgba(255,232,180,0.10)'); gr.addColorStop(0.5, 'rgba(255,236,190,0.30)'); gr.addColorStop(1, 'rgba(255,236,190,0.12)');
    ctx.globalAlpha = 1; ctx.fillStyle = gr; ctx.fill(patch);
  }
  ctx.restore();
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
  document.getElementById('roomBar').classList.toggle('hidden', !!panel || !ROOMV.on || DECO.on);
}
function enterRoom() {
  if (houseLevel() < 2 || ROOMV.on || ROOMV.trans || HOUSEFX.on) return;
  SFX.door(true);
  roomTransition(() => {
    FX.length = 0;                       // hearts and Zs from outside stay outside
    ROOMV.on = true; ROOMV.cam = 0; ROOMV.followAt = null; showBars(); hideToast(); decorEnsure();      // (after the toast is cleared: it may want to say something went back to the tray)
    if (!P.present || P.pack || P.carrying || /packup|departLook|arrive|gift/.test(P.mode)) return;
    if (/^(inhouse|goin)$/.test(P.mode)) { const left = Math.max(20, P.until - TT), bed = decorBed(); putInRoom(bed ? bed.x : roomR().door.x + 90); P.onBed = !!bed; if (bed) { P.bedUid = bed.uid; P.d = rowD(bed.row); } P.face = 1; setMode('nap', left); return; }   // already napping inside: on his bed (or on the floor if his bed is put away)
    ROOMV.followAt = TT + 0.9;          // he follows you in
  });
}
function putInRoom(x) { P.inRoom = true; P.onBed = false; P.x = x; P.d = ROOM_D; P.dOff = 0; }
function stopYardPlay() {               // whatever he was doing in the yard stops when he comes in
  if (P.hold) dropHeld(); P.hold = null;
  if (KITE.on) { KITE.on = false; KITE.drag = null; KITE.landing = false; }
  if (SPRINK.on) sprinklerOff();
  if (TUG.on) TUG.on = false;
  FETCH.drag = null; press = null;
}
function roomTick() {
  const dt = Math.min(0.05, TT - (ROOMV.lastT || TT)); ROOMV.lastT = TT; decorTick(dt); roomAvoidTick(dt);
  if (ROOMV.on && !S.decor && houseLevel() > 1) decorEnsure();          // the room is never shown without its things
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
  if (DECO.on) endDecor();
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
// Where he is: P.d indoors is his depth — ROOM_D is the middle floor row, 30 a row (60 the back row, 120 the front).
// P.dOff is a step forward (or back) he takes on his own while he passes something standing in his row, so he goes
// round the furniture instead of through it (stage 6). On his bed or a cushion, P.onBed + P.bedUid say which.
const rowD = r => ROOM_D + (r - 1) * 30;
const NAP_LIFT = { bed: 10, cushion: 15 };                    // what he sleeps on indoors, and how high its top is
function roomRowF() { return clamp(1 + (P.d - ROOM_D) / 30 + (P.dOff || 0), 0, 2); }
function roomSpot() { if (!P.onBed) return null; const r = (P.bedUid && decorByUid(P.bedUid)) || decorBed(); return r && NAP_LIFT[r.id] != null ? r : null; }
const napSpots = () => decorItems().filter(r => NAP_LIFT[r.id] != null);
// things standing on the floor that he walks round (rugs lie flat: he walks on them)
function roomBlockers(skip) {
  const g = roomGeom(), out = [];
  for (const r of decorItems()) { const d = decorDef(r.id); if (r === skip || d.kind !== 'floor' || d.flat) continue; const rc = decorRect(r, g), c = (rc[0] + rc[2]) / 2, h = (rc[2] - rc[0]) / 2 * 0.85; out.push({ r, row: r.row, x0: c - h, x1: c + h }); }
  return out;
}
const PK_ROOM = { pass: 40, stand: 46 };                      // how close his middle comes to a thing as he passes it / where he stops
function roomAvoidTick(dt) {
  if (!P.inRoom || !P.present) { P.dOff = 0; return; }
  const base = 1 + (P.d - ROOM_D) / 30; let want = 0;
  if (!roomSpot() && P.mode !== 'sill') for (const b of roomBlockers()) if (Math.abs(b.row - base) < 0.6 && P.x > b.x0 - PK_ROOM.pass && P.x < b.x1 + PK_ROOM.pass) { want = base > 1.5 ? -0.55 : 0.55; break; }
  P.dOff = (P.dOff || 0) + (want - (P.dOff || 0)) * Math.min(1, dt * 7);
}
// the nearest spot to x (in a row) where he can stand without standing in something
function roomFreeX(x, row = 1, skip) {
  const R = roomR(), bl = roomBlockers(skip).filter(b => Math.abs(b.row - row) < 0.6), ok = v => bl.every(b => v < b.x0 - PK_ROOM.stand || v > b.x1 + PK_ROOM.stand);
  for (let d = 0; d < R.w; d += 8) for (const v of d ? [x + d, x - d] : [x]) if (v >= 44 && v <= R.w - 44 && ok(v)) return v;
  return clamp(x, 44, R.w - 44);
}
// walk over in his usual row, then step back or forward into another one
function roomGo(x, row, then) { if (row == null || row === 1) return goTo(x, ROOM_D, then); goTo(x, ROOM_D, () => setMode('trot', null, { x, d: rowD(row), then })); }

function roomBed(kind, spot) {
  const spots = napSpots(), bed = spot || (kind === 'sleep' ? decorBed() || spots[0] : spots[Math.floor(Math.random() * spots.length)]);
  const dur = () => rand(kind === 'sleep' ? HABITS.duration.sleep : kind === 'nap' ? HABITS.duration.nap || [20, 40] : HABITS.duration.lie);
  if (!bed) return setMode(kind === 'sleep' ? 'sleep' : kind, dur());          // nothing to sleep on in the room: he curls up where he is
  const face = bed.id === 'bed' ? 1 : bed.x < 140 ? 1 : bed.x > roomR().w - 140 ? -1 : (Math.random() < 0.5 ? 1 : -1);      // (his head not against a wall)
  roomGo(bed.x - 10 * face, bed.row, () => faceThen(face, () => { if (!decorItems().includes(bed)) return pickNext(); P.onBed = true; P.bedUid = bed.uid; P.x = bed.x; P.d = rowD(bed.row); P.dOff = 0; setMode(kind, dur()); }));
}
// a rug to roll on: a spot on it with nothing standing there
function rugSpot(only) {
  const rugs = only ? [only] : decorItems().filter(r => r.id === 'rug').sort(() => Math.random() - 0.5);
  for (const rug of rugs) { const k = ROW_K[rug.row], bl = roomBlockers().filter(b => b.row === rug.row);
    for (let d = 0; d <= 80 * k; d += 10) for (const x of d ? [rug.x + d, rug.x - d] : [rug.x]) if (x > 50 && x < roomR().w - 50 && bl.every(b => x < b.x0 - 46 || x > b.x1 + 46)) return { x, row: rug.row, rug }; }   // (towards the edge of the rug if something stands in the middle)
  return null;
}
function rugRoll(sp = rugSpot()) {
  if (!sp) return false;
  roomGo(sp.x, sp.row, () => { SFX.paper(2); setMode('roll', HABITS.room.roll); });
  return true;
}
// a window to look out of: he stands up with his front paws on the sill (from the back row under it if that's free, else from the middle row)
function windowSpot() {
  const R = roomR(), ws = R.windows.slice().sort(() => Math.random() - 0.5);
  for (const row of [0, 1]) for (const w of ws) { const bl = roomBlockers().filter(b => b.row === row);
    for (const dx of [0, -14, 14, -28, 28]) { const x = w.x + dx; if (bl.every(b => x < b.x0 - 34 || x > b.x1 + 34)) return { w, row, x }; } }
  return null;
}
function lookOut(sp = windowSpot()) {
  if (!sp) return false;
  const g = roomGeom(), { w, row } = sp, sill = g.C + w.top + w.h + 6;
  const reach = Math.round((g.rows[row] - sill + 4) / (ROOM_K * ROW_K[row] * K_DOG) / 4) * 4;
  const kind = WX.hot ? 'hot' : /night/.test(currentTod()) ? 'night' : WX.kind;
  roomGo(sp.x, row, () => setMode('sill', rand(HABITS.room.sill), { reach, kind, w }));
  return true;
}
// what he does once he gets down from the window, by the weather he was watching
function sillEnd() {
  const { kind, w } = P.data;
  if (kind === 'snow') { SFX.pop(); return setMode('hop', HABITS.reactionTime.hop); }               // snow! a little bounce
  if (kind === 'rain') return setMode('sigh', HABITS.sighTime, { lie: false });                       // a long look at the rain, a sigh
  if (kind === 'night') return setMode('sigh', HABITS.sighTime, { lie: true });
  if (kind === 'hot') return roomGo(roomFreeX(w.x + 110), 1, () => setMode('flat', rand(HABITS.wxTime.flat)));     // too warm: flat out on the floor
  if (kind === 'sunny' && /morning|day/.test(currentTod())) return roomGo(roomFreeX(w.x + 10), 1, () => faceThen(Math.random() < 0.5 ? 1 : -1, () => setMode('sunnap', rand(HABITS.wxTime.sunnap))));   // a nap in the patch of sun under the window
  setMode('tilt', HABITS.reactionTime.tilt);
}
// something new in the room (bought, taken out of the tray, moved, a new souvenir): he goes to have a look
function freshNext() {
  const f = (S.decor && S.decor.fresh) || [];
  while (f.length) { const r = decorByUid(f[0]); if (r && !(DECO.held && DECO.held.rec === r)) return r; f.shift(); }
  return null;
}
function checkThing(r) {
  S.decor.fresh = S.decor.fresh.filter(u => u !== r.uid); writeSave(S);
  const g = roomGeom(), a = decorAnchor(r, g), d = decorDef(r.id); if (!a) return pickNext();
  const rc = decorRect(r, g, a), half = (rc[2] - rc[0]) / 2 * 0.85, done = () => { setMode('wag', HABITS.reactionTime.wag); SFX.pop(); };
  const row = d.kind === 'floor' ? r.row : (r.surf || '').startsWith('row:') ? +r.surf.slice(4) : null;
  if (row == null) { const x = roomFreeX(a[0]); return goTo(x, ROOM_D, () => faceThen(Math.sign(a[0] - x) || P.face, () => setMode('admire', 2.6, { next: done }))); }   // up on the wall or a shelf: he looks up at it
  if (d.flat) return roomGo(clamp(a[0] + (P.x < a[0] ? -30 : 30), 44, roomR().w - 44), row, () => setMode('sniff', 2.4, { next: done }));   // a rug: he steps on and sniffs it
  let side = a[0] > P.x ? 1 : -1, x = a[0] - side * (half + 42);
  if (x < 44 || x > roomR().w - 44 || roomFreeX(x, row, r) !== x) { side = -side; x = a[0] - side * (half + 42); }
  roomGo(clamp(x, 44, roomR().w - 44), row, () => faceThen(side, () => setMode('sniff', 2.4, { next: done })));
}
function roomPickNext() {
  const R = roomR(), was = P.onBed; P.onBed = false;
  if (P.wet) { P.wet = false; SFX.shake(); return setMode('shakeoff', HABITS.wxTime.shakeOff); }
  if (sleepTime() && TT >= (P.awakeUntil || 0)) return roomBed('sleep');
  if (was) { P.dOff = roomBlockers().some(b => Math.abs(b.row - roomRowF()) < 0.6 && P.x > b.x0 - PK_ROOM.pass && P.x < b.x1 + PK_ROOM.pass) ? (roomRowF() > 1.5 ? -0.55 : 0.55) : 0; return setMode('sigh', HABITS.sighTime, { lie: false }); }   // just hopped off his bed: down in front of it, a sigh
  const fresh = freshNext(); if (fresh) return checkThing(fresh);               // something new to have a look at
  const g = roomGeom(), things = [[R.door.x, 'door'], ...R.windows.map(w => [w.x, 'window']), ...decorItems().map(r => [decorAnchor(r, g) || [0], r]).filter(([a, r]) => a[0] && (decorDef(r.id).kind !== 'wall' || r.yc > 150)).map(([a]) => [a[0], 'thing'])];
  const cn = catNapSpot(), cb = !cn && hasHome('cat') && decorItems().find(r => r.id === 'catbed'), wp = HABITS.room.pick, rug = rugSpot(), win = windowSpot();
  const k = pickWeighted({ walk: wp.walk, sniff: wp.sniff, sit: wp.sit, bed: napSpots().length ? wp.bed : wp.bed / 4, window: wp.window * (win ? 1 : 0.4), rug: rug ? wp.rug : 0, sigh: wp.sigh, catnap: cn ? wp.catnap : 0, catsniff: cb ? wp.catsniff : 0 });
  if (k === 'catnap') { const b = decorItems().find(r => r.id === 'catbed'); return roomGo(clamp(cn[0], 44, R.w - 44), b ? b.row : 1, () => faceThen(cn[1], () => { setMode('nap', rand([20, 40])); const [hx, hy] = roomParkerCenter(); fx({ type: 'spr', key: 'fx.heart', x: hx, y: hy - 30, vy: -20, sway: 1, life: 1.6, scale: 0.8 }); })); }   // a nap next to the cat in her bed
  if (k === 'catsniff') return checkThing(cb);                                  // she's out: her bed still smells of her
  const lo = 44, hi = R.w - 44;
  if (k === 'walk') { const x = roomFreeX(clamp(P.x + (Math.random() < 0.5 ? -1 : 1) * (60 + Math.random() * 180), lo, hi)); return goTo(x, ROOM_D, Math.random() < 0.4 ? () => setMode('sniff', rand(HABITS.duration.sniff)) : null); }
  if (k === 'sniff') { const [tx] = things[Math.floor(Math.random() * things.length)], side = tx > P.x ? 1 : -1, x = roomFreeX(clamp(tx - 46 * side, lo, hi)); return goTo(x, ROOM_D, () => faceThen(Math.sign(tx - x) || side, () => setMode('sniff', rand([2, 3.5])))); }
  if (k === 'bed') return roomBed(Math.random() < 0.5 ? 'lie' : 'nap');
  if (k === 'window') { if (lookOut(win)) return; const w = R.windows[Math.floor(Math.random() * R.windows.length)], x = roomFreeX(w.x - 20); return goTo(x, ROOM_D, () => faceThen(Math.sign(w.x - x) || 1, () => setMode('admire', rand([2.5, 4])))); }   // something under every window: he looks up at one from where he can
  if (k === 'rug') return rugRoll(rug);
  if (k === 'sigh') return setMode('sigh', HABITS.sighTime, { lie: false });
  P.dOff ? goTo(roomFreeX(P.x), ROOM_D, () => setMode('sit', rand([3, 6]))) : setMode('sit', rand([3, 6]));     // (not sitting in the middle of something)
}

// ---------- drawing ----------
const ROOMLAY = { key: null, L: null, view: null };
function roomLayer() {
  const lv = Math.max(2, houseLevel()), look = S.roomLook || {}, key = [lv, V.H, V.res, WX.look, look.wall, look.floor].join('|');
  if (ROOMLAY.key !== key) { ROOMLAY.key = key; ROOMLAY.L = ART.layer('room.shell', lv, V.H, V.res, WX.look, look.wall, look.floor); ROOMLAY.view = ART.layer('scene.yard', V.H, Math.min(V.res, 2), WX.look, lv, true); }   // the yard as seen from inside: without the house
  return ROOMLAY.L;
}
function roomParkerScreen() {
  const g = roomGeom(), sp = roomSpot(); if (sp) return [P.x - ROOMV.cam, g.rows[sp.row] - NAP_LIFT[sp.id], ROOM_K * ROW_K[sp.row]];      // on his bed or a cushion
  const f = roomRowF(), i = Math.min(1, Math.floor(f)), u = f - i;
  return [P.x - ROOMV.cam, lerp(g.rows[i], g.rows[i + 1], u), ROOM_K * lerp(ROW_K[i], ROW_K[i + 1], u)];
}
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
  drawLayer(ctx, shell, 0, -g.lift);
  // the door, then what's on the walls and the floor, row by row, with him in his row (js/decor.js)
  drawSprite(sprite(`room.door|${R.level}|${TT < ROOMV.doorOpenUntil ? 1 : 0}`), R.door.x, g.F0, { shA: 0 });
  drawDecorScene(g, R, () => {
    const dr = parkerDrawing(), [sx, sy, k] = roomParkerScreen(), x = sx + cam;
    ART.draw('live.shadow.parker', ctx, x, sy + 1, (isLying() ? 70 : 52) * k * Math.max(0.6, Math.abs(dr.sx)), 6 * k, 1 / (1 + dr.lift / 34));
    drawSprite(sprite(dr.key), x, sy - dr.lift, { sx: dr.sx, scale: k });
  });
  if (WX.kind === 'sunny' && /morning|day/.test(currentTod())) ART.draw('live.sunPatch', ctx, R.windows, g, new Date(Clock.now()).getHours());   // the sun through the windows
  if (noteOnBed()) { const a = decorAnchor(decorBed(), g); drawNoteAt(ctx, a[0] + 28, a[1] - 14, a[2]); }      // a note waiting on his bed
  ctx.restore();
  // indoor light at dusk / night (over the house only)
  const area = new Path2D(); area.rect(-cam - 20, g.C - 140, R.w + 40, V.H);
  ART.draw('live.roomLight', ctx, L.p, R.lamp - cam, g.C + 56, area);
  if (L.p.lamp) for (const r of decorItems()) if (r.id === 'floorlamp') { const a = decorAnchor(r, g); if (a) ART.draw('live.lampGlow', ctx, a[0] - cam, a[1] - DECOR.floorlamp.glow * a[2], L.p.lamp); }   // standing lamps at night
  drawFX();
}
// his middle, in screen units, when he's indoors (hearts, Zs and taps use it)
function roomParkerCenter() { const [x, y] = roomParkerScreen(), lying = isLying(); return [x + (lying ? 20 : 4) * P.face * ROOM_K, y - (lying ? 34 : 64) * ROOM_K]; }

// ---------- taps and slides ----------
function roomDown(e, x, y) {
  if (DECO.on) return decorDown(e, x, y);
  if (P.present && P.inRoom && onParker(x, y)) { press = { id: e.pointerId, t0: TT, x, y, dist: 0, rub: false }; try { cv.setPointerCapture(e.pointerId); } catch (err) { } return; }
  ROOMV.drag = { id: e.pointerId, x0: x, y0: y, cam0: ROOMV.cam, moved: false };          // slides the wide room; if it doesn't move, it's a tap
  try { cv.setPointerCapture(e.pointerId); } catch (err) { }
}
function roomTap(x, y) {
  const R = roomR(), g = roomGeom(), rx = x + ROOMV.cam;
  if (Math.abs(rx - R.door.x) < R.door.w / 2 + 4 && y > g.F0 - R.door.h && y < g.F0 + 6) return leaveRoom();       // the door: back out to the yard
  if (noteOnBed()) { const b = decorBed(), a = decorAnchor(b, g); if (Math.hypot(rx - a[0] - 28, y - (a[1] - 22)) < 28) return openNote(); }   // his note, on his bed
  const r = decorHit(rx, y, g); if (!r) return;
  if (homeTapRoom(r)) return;                                                                                       // the cat's bed, the squirrel's stump
  if (r.id === 'book') { ROOMV.wiggle = { id: r.id, t0: TT }; return openBook(); }                                  // his book: open it
  if (isSmall(r.id)) { const id = r.id.slice(3); ROOMV.wiggle = { id: r.id, t0: TT }; SFX.pop(); toastText(`${T('sv.' + id)} · ${T('pc.' + id + '.name')}`, 2200); return; }   // a souvenir: it wiggles and says what it is
  const free = P.present && P.inRoom && !/sleep|nap|stir|sill|roll/.test(P.mode);
  if ((r.id === 'bed' || r.id === 'cushion') && free) { if (r.id === 'cushion') { ROOMV.wiggle = { uid: r.uid, t0: TT }; SFX.pop(); } return roomBed('lie', r); }     // his bed, a cushion: he comes and lies down
  if (r.id === 'rug' && free) { ROOMV.wiggle = { uid: r.uid, t0: TT }; SFX.pop(); return void rugRoll(rugSpot(r)); }      // a rug: he comes and rolls on it (if there's room on it)
  if (r.id === 'frame') { if (!r.pc) return framePick(r); ROOMV.wiggle = { uid: r.uid, t0: TT }; SFX.pop(); toastText(frameCardName(r.pc), 2200); return; }   // a postcard frame: its card's name (empty: choose one)
  if (SHOP_FURN.includes(r.id)) { ROOMV.wiggle = { uid: r.uid, t0: TT }; SFX.pop(); }                                  // the other furniture: a little wobble
}
function roomMove(e, x, y) {
  if (DECO.on && decorMove(e, x, y)) return true;
  const D = ROOMV.drag; if (!D || e.pointerId !== D.id) return false;
  if (Math.abs(x - D.x0) > 6) D.moved = true;
  if (D.moved) ROOMV.cam = clamp(D.cam0 - (x - D.x0), 0, roomR().w - SCENE_W);
  return true;
}
function roomUp(e, x, y) {
  if (DECO.on && decorUp(e, x, y)) return true;
  const D = ROOMV.drag; if (!D || e.pointerId !== D.id) return false; ROOMV.drag = null;
  if (!D.moved) { if (DECO.on) { DECO.sel = null; placeTools(); } else roomTap(D.x0, D.y0); }
  return true;
}
