// ================= FURNITURE FROM THE SHOP (house plan, stage 5) =================
// Cut-paper furniture for his room, every piece entered in the art list (group 'furn'). The rules for where each one
// can go are in js/decor.js (DECOR); prices in js/items.js (FURN_SHOP). Origins: floor things on the floor under
// their middle (the rug: its middle, it lies flat); wall things on the nail or rod they hang from.

const rrP = (x, y, w, h, r) => { const p = new Path2D(); p.moveTo(x + r, y); p.arcTo(x + w, y, x + w, y + h, r); p.arcTo(x + w, y + h, x, y + h, r); p.arcTo(x, y + h, x, y, r); p.arcTo(x, y, x + w, y, r); p.closePath(); return p; };
const FURN_INK = '#5b4a40';

// an oval rug with a border, a blue band and little diamonds, fringe at both ends
function drawRug(c) {
  c.save(); c.strokeStyle = '#f3e3c8'; c.lineWidth = 1.3;
  for (const s of [-1, 1]) for (let k = -3; k <= 3; k++) { c.beginPath(); c.moveTo(s * 78, k * 2.4); c.lineTo(s * 86, k * 2.7); c.stroke(); }
  c.restore();
  pp(c, ell(0, 0, 80, 12), '#e58a6e', 0.1);
  piece(c, ell(0, 0, 70, 9.8), '#f6d6a8', { mul: 0.3, scr: 0.15 });
  piece(c, ell(0, 0, 54, 7.2), '#8fb9e2', { mul: 0.3 });
  piece(c, ell(0, 0, 36, 4.6), '#fdf3e0', { mul: 0.2 });
  for (let k = 0; k < 12; k++) { const a = k / 12 * TAU, x = Math.cos(a) * 62, y = Math.sin(a) * 8.5; piece(c, poly([[x, y - 1.8], [x + 3, y], [x, y + 1.8], [x - 3, y]]), '#e58a6e', { mul: 0.2 }); }
  pawPrint(c, 0, 0.4, 0.22, '#e9a59c');
}
// a square floor cushion: mustard, a stitched edge, a button in the middle, tassels at the corners
function drawCushion(c) {
  const body = rrP(-32, -24, 64, 23, 10);
  for (const s of [-1, 1]) pp(c, poly([[s * 30, -22], [s * 38, -17], [s * 35, -13]]), '#e8604c', 0.1);
  pp(c, body, '#f2b452', 0.22);
  clipped(c, body, () => { piece(c, rectP(-32, -24, 64, 7), '#f8cd7a', { mul: 0.2, scr: 0.2 }); piece(c, rectP(-32, -6, 64, 5), '#dc9a3c', { mul: 0.3 }); });
  c.save(); c.setLineDash([2.4, 2.2]); c.strokeStyle = '#c9822f'; c.lineWidth = 1; c.stroke(rrP(-28, -21, 56, 17, 7)); c.restore();
  pp(c, circ(0, -13, 2.6), '#c9773a', 0.05);
}
// a monstera in a terracotta pot
function drawPlant(c) {
  const L = [[-26, -50, -2.7], [24, -56, -0.45], [-20, -74, -2.1], [16, -82, -1.05], [-2, -96, -1.6]];
  for (const [x, y] of L) piece(c, slab([0, -34], [x * 0.75, y + 6], 2.2), '#3f7a46', { mul: 0.3 });
  L.forEach(([x, y, a], i) => {
    const lf = ell(x, y, 18, 11.5, a); pp(c, lf, i % 2 ? '#5ea35a' : '#4f9a52', 0.15);
    clipped(c, lf, () => { piece(c, slab([x - Math.cos(a) * 16, y - Math.sin(a) * 16], [x + Math.cos(a) * 16, y + Math.sin(a) * 16], 1.2), '#8cc47a', { mul: 0.2 });
      for (const t of [-0.5, 0, 0.5]) { const px = x + Math.cos(a) * t * 22, py = y + Math.sin(a) * t * 22, n = a + Math.PI / 2; piece(c, slab([px + Math.cos(n) * 5, py + Math.sin(n) * 5], [px + Math.cos(n) * 13, py + Math.sin(n) * 13], 1.3), '#cfe3b8', { mul: 0.2 }); } });
  });
  pp(c, poly([[-17, -32], [17, -32], [13, 0], [-13, 0]]), '#d9774f', 0.25);
  piece(c, rectP(-15, -22, 30, 2.4), '#c4643f', { mul: 0.3 });
  pp(c, rrP(-20, -37, 40, 8, 2), '#e58a62', 0.1);
}
// a standing lamp: a round foot, a thin pole, a cream shade with red bands (it glows at night: js/decor.js)
function drawFloorLamp(c) {
  pp(c, ell(0, -3, 16, 4.6), FURN_INK, 0.2);
  pp(c, rectP(-1.8, -122, 3.6, 120), '#7a5a46', 0.15);
  piece(c, ell(0, -117, 9, 2.4), '#fff1c2', { mul: 0.1, scr: 0.4 });
  pp(c, poly([[-14, -146], [14, -146], [22, -118], [-22, -118]]), '#f6d79a', 0.2);
  piece(c, poly([[-21, -122], [21, -122], [22, -118], [-22, -118]]), '#e8604c', { mul: 0.3 }); piece(c, rectP(-14, -146, 28, 2.6), '#e8604c', { mul: 0.3 });
}
// a low wooden table (things can stand on it)
function drawLowTable(c) {
  for (const x of [-34, 34]) pp(c, poly([[x - 3, -27], [x + 3, -27], [x + 2, 0], [x - 2, 0]]), '#9a6242', 0.15);
  piece(c, rectP(-38, -27, 76, 5), '#8a5a3c', { mul: 0.3 });
  pp(c, rrP(-44, -33, 88, 7, 3), '#c98a52', 0.25); piece(c, rectP(-42, -33, 84, 2), '#e0a870', { mul: 0.3, scr: 0.2 });
}
// a bookcase full of little books (things can stand on top)
function drawBookcase(c) {
  pp(c, rectP(-32, -112, 64, 112), '#a8703f', 0.25); piece(c, rectP(-27, -106, 54, 100), '#6e4426', { mul: 0.4 });
  const cols = ['#e8604c', '#5b8ed1', '#f5c04a', '#7fb86a', '#f3b9b0', '#9a6fb0', '#fdf3e0', '#7fa8c9'], r = rng(57);
  for (const [y0, y1] of [[-106, -74], [-70, -40], [-36, -6]]) {
    let x = -26; while (x < 22) {
      const w = 4 + r() * 4, h = (y1 - y0) * (0.66 + r() * 0.3); if (x + w > 26) break;
      const col = cols[Math.floor(r() * cols.length)];
      if (r() < 0.12 && x + h * 0.5 < 26) { pp(c, slab([x + 1, y1], [x + h * 0.5, y1 - h * 0.84], w), col, 0.1); x += h * 0.5 + 2; continue; }   // one leaning over
      pp(c, rectP(x, y1 - h, w, h), col, 0.1); piece(c, rectP(x, y1 - h + 3, w, 1.4), '#fff6e6', { mul: 0.2 }); x += w + 0.6;
    }
    pp(c, rectP(-28, y1, 56, 4), '#b57a4a', 0.1);
  }
  piece(c, rectP(-32, -112, 64, 3), '#c98f58', { mul: 0.3, scr: 0.2 });
}
// a round wall clock (its hands are drawn live, showing the real time: js/decor.js)
const CLOCK_C = [0, 24];
function drawClock(c) {
  pp(c, circ(0, 24, 19), '#b57a4a', 0.25); piece(c, circ(0, 24, 16.5), '#9a6242', { mul: 0.3 });
  piece(c, circ(0, 24, 15), '#fdf3e0', { mul: 0.15, scr: 0.15 });
  for (let k = 0; k < 12; k++) { const a = k / 12 * TAU, r0 = k % 3 ? 12.5 : 11, x0 = Math.sin(a), y0 = -Math.cos(a); piece(c, slab([x0 * r0, 24 + y0 * r0], [x0 * 13.8, 24 + y0 * 13.8], k % 3 ? 1 : 1.8), k % 3 ? '#c9b49a' : FURN_INK, { mul: 0.2 }); }
  pawPrint(c, 0, 31.5, 0.16, '#f0b9ae');
  pp(c, circ(0, 3, 2.2), FURN_INK, 0.05);
}
// the hands: (ctx, x, y, scale, Date)
function drawClockHands(ctx, x, y, k, d) {
  const h = (d.getHours() % 12 + d.getMinutes() / 60) / 12 * TAU, m = d.getMinutes() / 60 * TAU;
  ctx.save(); ctx.translate(x, y); ctx.scale(k, k); ctx.lineCap = 'round'; ctx.strokeStyle = FURN_INK;
  ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.sin(h) * 7.5, -Math.cos(h) * 7.5); ctx.stroke();
  ctx.lineWidth = 1.3; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.sin(m) * 11.5, -Math.cos(m) * 11.5); ctx.stroke();
  ctx.fillStyle = '#e8604c'; ctx.beginPath(); ctx.arc(0, 0, 1.6, 0, TAU); ctx.fill(); ctx.restore();
}
// a small woven hanging on a rod: sky, a sun, blue mountains, a green hill, fringe
function drawTapestry(c) {
  c.save(); c.strokeStyle = FURN_INK; c.lineWidth = 0.9; c.beginPath(); c.moveTo(-26, 0); c.lineTo(0, -9); c.lineTo(26, 0); c.stroke(); c.restore();
  pp(c, circ(0, -9, 1.8), FURN_INK, 0.05);
  const cloth = poly([[-25, 2], [25, 2], [25, 66], [0, 70], [-25, 66]]);
  pp(c, cloth, '#f8dcd6', 0.2);
  clipped(c, cloth, () => {
    piece(c, rectP(-26, 2, 52, 16), '#fbe9c4', { mul: 0.2 });
    pp(c, circ(10, 22, 7), '#f5c04a', 0.05);
    piece(c, poly([[-26, 52], [-10, 26], [4, 44], [14, 32], [26, 50], [26, 72], [-26, 72]]), '#7fa8c9', { mul: 0.3 });
    piece(c, poly([[-10, 26], [-6, 32], [-12, 33]]), '#fdf3e0', { mul: 0.1 });
    piece(c, poly([[-26, 58], [-4, 50], [26, 58], [26, 72], [-26, 72]]), '#7fb86a', { mul: 0.3 });
    for (let y = 6; y < 70; y += 6) piece(c, rectP(-26, y, 52, 0.8), '#ffffff', { mul: 0, scr: 0.3 });
  });
  for (let x = -22; x <= 22; x += 4) piece(c, slab([x, 66 + (1 - Math.abs(x) / 25) * 4], [x, 74 + (1 - Math.abs(x) / 25) * 4], 1.3), '#f3e3c8', { mul: 0.2 });
  pp(c, rectP(-30, -1, 60, 4), '#9a6e45', 0.15); for (const s of [-1, 1]) pp(c, circ(s * 31, 1, 3), '#b57a4a', 0.05);
}
// a postcard frame: a wooden frame, a cream mount, and one of his postcards in it (drawn by the postcard code itself).
// pc = 'card id~year~friend' ('' = empty: a paw print waits for a card)
const FRAME_WIN = [-27, 13, 54, 36];
function drawFrame(c, pc) {
  c.save(); c.strokeStyle = FURN_INK; c.lineWidth = 0.9; c.beginPath(); c.moveTo(-22, 8); c.lineTo(0, -1); c.lineTo(22, 8); c.stroke(); c.restore();
  pp(c, circ(0, -1, 1.8), FURN_INK, 0.05);
  pp(c, rectP(-36, 6, 72, 50), '#b57a4a', 0.25); piece(c, rectP(-33, 9, 66, 44), '#d39b66', { mul: 0.3 });
  piece(c, rectP(-31, 11, 62, 40), '#fdf3e0', { mul: 0.12 });
  const [x, y, w, h] = FRAME_WIN;
  if (pc) { const [id, yr, fr] = pc.split('~'); try { c.drawImage(ART.card(id, 'front', 0.25, yr ? +yr : undefined, fr || undefined), x, y, w, h); } catch (e) { piece(c, rectP(x, y, w, h), '#efe2c8'); } }
  else { piece(c, rectP(x, y, w, h), '#efe2c8', { mul: 0.2 }); pawPrint(c, 0, y + h / 2 + 2, 0.32, '#d9c6a4'); }
  c.save(); c.strokeStyle = 'rgba(91,74,64,0.35)'; c.lineWidth = 0.8; c.strokeRect(x, y, w, h); c.restore();
}

// ---------- the art list ----------
ART.def('furn.rug', { group: 'furn', box: { w: 180, h: 30, ox: 90, oy: 15 }, stick: false, draw: c => drawRug(c), note: 'an oval rug; it lies flat, origin = its middle on the floor' });
ART.def('furn.cushion', { group: 'furn', box: { w: 84, h: 30, ox: 42, oy: 28 }, stick: false, draw: c => drawCushion(c), note: 'a square floor cushion with tassels' });
ART.def('furn.plant', { group: 'furn', box: { w: 96, h: 116, ox: 48, oy: 108 }, stick: false, draw: c => drawPlant(c), note: 'a monstera in a terracotta pot' });
ART.def('furn.floorlamp', { group: 'furn', box: { w: 52, h: 152, ox: 26, oy: 148 }, stick: false, draw: c => drawFloorLamp(c), note: 'a standing lamp (glows at night)' });
ART.def('furn.lowtable', { group: 'furn', box: { w: 96, h: 40, ox: 48, oy: 36 }, stick: false, draw: c => drawLowTable(c), note: 'a low table; its top (33 up) takes small things' });
ART.def('furn.bookcase', { group: 'furn', box: { w: 72, h: 120, ox: 36, oy: 114 }, stick: false, draw: c => drawBookcase(c), note: 'a bookcase; its top (112 up) takes small things' });
ART.def('furn.clock', { group: 'furn', box: { w: 48, h: 52, ox: 24, oy: 6 }, stick: false, draw: c => drawClock(c), note: 'a wall clock (hands drawn live: live.clockHands); origin = its nail' });
ART.def('live.clockHands', { kind: 'live', group: 'furn', note: '(ctx, x, y, scale, Date): the clock\'s hands at the real time; x, y = the middle of its face', draw: drawClockHands });
ART.def('furn.tapestry', { group: 'furn', box: { w: 72, h: 92, ox: 36, oy: 14 }, stick: false, draw: c => drawTapestry(c), note: 'a small woven hanging on a rod; origin = the middle of the rod' });
ART.def('furn.frame', { group: 'furn', box: { w: 76, h: 62, ox: 38, oy: 6 }, stick: false, draw: (c, a) => drawFrame(c, a[0] || ''), note: 'a postcard frame: arg = \'card id~year~friend\' or empty; the card is the postcard code\'s own picture' });
ART.def('live.lampGlow', { kind: 'live', group: 'furn', note: '(ctx, x, y, amount 0–1): a standing lamp\'s warm light at night; x, y = under its shade', draw: (ctx, x, y, a) => {
  ctx.save(); ctx.globalCompositeOperation = 'screen'; glow(ctx, x, y + 10, 120, '255,214,150', 0.34 * a); glow(ctx, x, y, 30, '255,236,190', 0.7 * a); ctx.restore();
} });
