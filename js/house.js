// ================= HOME: Parker's house in three sizes =================
// 1 the doghouse he started with · 2 a log cabin with a door and a window · 3 a big house with a porch and window boxes.
// Every house is a list of paper pieces, back to front. Drawn one after another they make the house in the yard;
// in the upgrade animation the same pieces fly in one by one. Everything that depends on where the house is
// (his door, the dry spot under the eaves, the shade, the gift box, the bowl, the lamp, the stepping stones,
// where the sparrow can perch, where you tap) is listed per house in HOUSES and switched by applyHouse().

const HOUSE_MAX = 3;
// position of the house: x0 = left edge of the front wall, by = screen y of its base (its d is HOUSE.d = 250)
const HOUSES = [null,
  { level: 1, price: 0, x0: 24,
    door: { x: 84, d: 250 }, shelter: [118, 244], shade: [100, 238], giftbox: { x: 168, d: 249 }, bowl: [206, 246], eat: [160, 226], bed: [70, 226],
    lamp: { x: 222, d: 292, post: true }, stones: [[84, 238, 15], [96, 200, 14], [78, 162, 15], [94, 124, 14]], path: 88,
    tap: [10, 224, 150, 6], perches: [[150, 210]], top: 150,
    tour: [[36, 236, 1, 'sniff'], [84, 228, 1, 'look'], [158, 238, -1, 'sniff'], [204, 258, -1, 'sniff']] },
  { level: 2, price: 120, x0: 16,
    door: { x: 64, d: 250 }, shelter: [150, 245], shade: [104, 238], giftbox: { x: 110, d: 249 }, bowl: [214, 244], eat: [168, 226], bed: [140, 224],
    lamp: { x: 228, d: 292, post: true }, stones: [[78, 204, 14], [60, 166, 15], [76, 128, 14]], path: 70,
    tap: [0, 240, 205, 10], perches: [[234, 288]], ridgePerch: true, top: 214,
    tour: [[38, 236, 1, 'sniff'], [64, 228, 1, 'look'], [124, 232, 1, 'look'], [186, 238, -1, 'sniff'], [238, 258, -1, 'sniff']] },
  { level: 3, price: 300, x0: 8,
    door: { x: 112, d: 260 }, shelter: [150, 257], shade: [196, 236], giftbox: { x: 74, d: 261 }, bowl: [250, 241], eat: [204, 225], bed: [64, 224],
    lamp: { x: 136, d: 254, post: false }, stones: [[124, 204, 14], [106, 166, 15], [122, 128, 14]], path: 116, porch: [72, 152],
    tap: [0, 290, 200, 16], perches: [[284, 290]], ridgePerch: true, top: 200,
    tour: [[40, 234, 1, 'sniff'], [112, 226, 1, 'look'], [190, 234, 1, 'look'], [236, 238, -1, 'sniff'], [286, 254, -1, 'sniff']] },
];
const houseLevel = () => (typeof S !== 'undefined' && S && S.house) || 1;
const houseAt = (lv = houseLevel()) => HOUSES[clamp(lv, 1, HOUSE_MAX)];

// point everything that depends on the house at the house of this size (positions are shared objects/arrays,
// so the code that reads them keeps working unchanged)
function applyHouse(lv) {
  const h = houseAt(lv);
  Object.assign(DOOR, h.door); SHELTER[0] = h.shelter[0]; SHELTER[1] = h.shelter[1]; SHADE[0] = h.shade[0]; SHADE[1] = h.shade[1];
  BED[0] = h.bed[0]; BED[1] = h.bed[1]; Object.assign(GIFTBOX, h.giftbox); LAMP.x = h.lamp.x; LAMP.d = h.lamp.d;
}

// ---------- 1. the doghouse (the pieces of the original drawing, in the original order) ----------
function doghousePieces(x0, by) {
  const C = { wall: '#f6cf86', plank: '#eab86c', side: '#e2ac62', trim: '#fff6e6', roof: '#e8604c', roofL: '#f27d5f', roofD: '#c94b3b', door: '#4a2f2b' };
  const fx0 = x0, fx1 = x0 + 120, mx = x0 + 60, top = by - 70, peak = by - 132, dx = 40, dy = -18;
  const R = poly([[mx, peak - 8], [mx + dx, peak - 8 + dy], [fx1 + dx + 14, top + dy + 10], [fx1 + 14, top + 10]]);
  const eaveL = [fx0 - 14, top + 10], eaveR = [fx1 + 14, top + 10];
  const door = new Path2D(); door.moveTo(mx - 24, by); door.lineTo(mx - 24, by - 34); door.arc(mx, by - 34, 24, Math.PI, 0); door.lineTo(mx + 24, by); door.closePath();
  return [
    c => { pp(c, rectP(x0 - 12, by - 4, 176, 12), '#c98b55', 0.3); piece(c, rectP(x0 - 12, by - 4, 176, 3), '#e3aa73', { mul: 0.4 }); },   // deck
    c => { pp(c, poly([[fx1, by], [fx1 + dx, by + dy], [fx1 + dx, top + dy], [fx1, top]]), C.side, 0.2);                             // side wall
      for (let k = 1; k < 5; k++) piece(c, poly([[fx1, by - k * 14], [fx1 + dx, by + dy - k * 14], [fx1 + dx, by + dy - k * 14 + 2], [fx1, by - k * 14 + 2]]), '#d39b54', { mul: 0.4, scr: 0 }); },
    c => { pp(c, poly([[fx0, by], [fx0, top], [mx, peak], [fx1, top], [fx1, by]]), C.wall, 0.25);                                     // front
      clipped(c, poly([[fx0, by], [fx0, top], [mx, peak], [fx1, top], [fx1, by]]), () => { for (let k = 1; k < 9; k++) piece(c, rectP(fx0, by - k * 14, 120, 2), C.plank, { mul: 0.4, scr: 0 }); }); },
    c => { for (const x of [fx0, fx1 - 8]) pp(c, rectP(x, top, 8, by - top), C.trim, 0.12); },
    // roof: side plane with scalloped shingles, then the front bargeboards
    c => { pp(c, R, C.roof, 0.28);
      clipped(c, R, () => { for (let r = 0; r < 6; r++) for (let k = 0; k < 8; k++) { const u = (r + 0.5) / 6, x = lerp(mx, fx1 + 14, u) + k * 6.2 - 6, y = lerp(peak - 8, top + 10, u) + k * -2.8 + 4; piece(c, circ(x, y, 4.4), r % 2 ? C.roofL : C.roof, { mul: 0.4, scr: 0.15 }); } }); },
    c => { pp(c, slab([mx, peak - 8], eaveL, 12), C.roofD, 0.25); pp(c, slab([mx, peak - 8], eaveR, 12), C.roofD, 0.25); },
    c => { pp(c, slab([mx, peak - 4], [fx0 - 10, top + 12], 6), C.trim, 0.1); pp(c, slab([mx, peak - 4], [fx1 + 10, top + 12], 6), C.trim, 0.1); },
    c => pp(c, slab([mx, peak - 8], [mx + dx, peak - 8 + dy], 7), C.roofD, 0.15),
    // nameplate with a paw print, in the gable
    c => { pp(c, rectP(mx - 15, top - 30, 30, 20), '#c98b55', 0.2); pp(c, rectP(mx - 12, top - 27, 24, 14), '#f4dcb2', 0); pawPrint(c, mx, top - 19, 0.62, '#b56a4a'); },
    // arched door with his blue cushion inside
    c => { pp(c, door, C.door, 0.1); clipped(c, door, () => { castShadow(c, door, 6, 0, 4, 0.5); pp(c, ell(mx, by - 4, 22, 9), '#7aaad6', 0.15); pp(c, ell(mx, by - 7, 17, 5), '#9cc2e6', 0); }); },
    c => pp(c, slab([mx - 28, by - 1], [mx + 28, by - 1], 5), C.trim, 0.12),
  ];
}
function doghouse(c, x0, by) { for (const p of doghousePieces(x0, by)) p(c); }

// ---------- shared bits ----------
function archDoor(cx, by, w, h) { const r = w / 2, p = new Path2D(); p.moveTo(cx - r, by); p.lineTo(cx - r, by - h + r); p.arc(cx, by - h + r, r, Math.PI, 0); p.lineTo(cx + r, by); p.closePath(); return p; }
function nameplate(c, x, y) { pp(c, rectP(x - 16, y - 11, 32, 22), '#c98b55', 0.2); pp(c, rectP(x - 13, y - 8, 26, 16), '#f4dcb2', 0); pawPrint(c, x, y, 0.66, '#b56a4a'); }
function paneWindow(c, x, y, w, h, o = {}) {        // a cream frame, pale glass, a cross of glazing bars, a glint
  pp(c, rectP(x - 3, y - 3, w + 6, h + 6), o.frame || '#fff6e6', 0.2);
  piece(c, rectP(x, y, w, h), o.glass || '#bfe0f2', { mul: 0.3, scr: 0.2 });
  clipped(c, rectP(x, y, w, h), () => { piece(c, poly([[x + w * 0.15, y + h], [x + w * 0.55, y], [x + w * 0.75, y], [x + w * 0.35, y + h]]), '#e9f5fb', { mul: 0.1 }); });
  piece(c, rectP(x + w / 2 - 1.5, y, 3, h), o.frame || '#fff6e6', { mul: 0.2 }); piece(c, rectP(x, y + h / 2 - 1.5, w, 3), o.frame || '#fff6e6', { mul: 0.2 });
}
function flowerBox(c, x, y, w, seed) {           // a planter under a window, flowers spilling over
  const r = rng(seed);
  for (let k = 0; k < 4; k++) leaf(c, x + 4 + r() * (w - 8), y + 2, 9 + r() * 4, 3.4, 1.2 + r() * 0.8, k % 2 ? '#5fa55a' : '#6db463');
  for (let k = 0; k < 5; k++) leaf(c, x + 3 + k * (w - 6) / 4, y - 2, 9, 3.6, -1.4 - r() * 0.5 + (k - 2) * 0.25, k % 2 ? '#5fa55a' : '#6db463');
  pp(c, rectP(x, y, w, 10), '#b8794e', 0.25); piece(c, rectP(x, y, w, 3), '#d39466', { mul: 0.4 });
  const cols = ['#f58cbf', '#fff7ee', '#f8d36a', '#f58cbf', '#e8604c'];
  for (let k = 0; k < 5; k++) flower(c, x + 4 + k * (w - 8) / 4 + (r() - 0.5) * 2, y - 3 - r() * 4, 3.4 + r() * 1.2, cols[(k + seed) % cols.length], seed * 10 + k, false);
}

// ---------- 2. the log cabin ----------
function cabinGeom(x0, by) {
  const w = 156, fx0 = x0, fx1 = x0 + w, mx = x0 + w / 2, top = by - 96, peak = by - 170, dx = 46, dy = -20, ov = 16;
  const A = [mx, peak - 8], B = [mx + dx, peak - 8 + dy], Cc = [fx1 + dx + ov, top + dy + 10], D = [fx1 + ov, top + 10];
  return { w, fx0, fx1, mx, top, peak, dx, dy, ov, A, B, Cc, D, eaveL: [fx0 - ov, top + 10], eaveR: [fx1 + ov, top + 10], doorX: x0 + 48, win: [x0 + 102, by - 82, 38, 34] };
}
function cabinPieces(x0, by) {
  const C = { log: '#dfa468', log2: '#d39459', gap: '#b97a44', end: '#f0c891', ring: '#c4864e', side: '#cb8d52', sideGap: '#ad7140', roof: '#7189bd', roofL: '#8aa2d0', roofD: '#556c9f', trim: '#fff6e6', door: '#9a6242', doorD: '#7e4c31', stone: '#d9cdb9', stoneD: '#bfb19b' };
  const g = cabinGeom(x0, by), { fx0, fx1, mx, top, peak, dx, dy, ov, A, B, Cc, D } = g;
  const front = poly([[fx0, by], [fx0, top], [mx, peak], [fx1, top], [fx1, by]]);
  const side = poly([[fx1, by], [fx1 + dx, by + dy], [fx1 + dx, top + dy], [fx1, top]]);
  const R = poly([A, B, Cc, D]);
  const onRoof = (u, v) => [lerp(lerp(A[0], B[0], u), lerp(D[0], Cc[0], u), v), lerp(lerp(A[1], B[1], u), lerp(D[1], Cc[1], u), v)];
  const ch = onRoof(0.55, 0.32);
  const door = archDoor(g.doorX, by, 48, 82), frame = archDoor(g.doorX, by, 58, 88);
  const [wx, wy, ww, wh] = g.win;
  return [
    c => { pp(c, side, C.side, 0.2); clipped(c, side, () => { for (let k = 1; k < 9; k++) piece(c, poly([[fx1, by - k * 12], [fx1 + dx, by + dy - k * 12], [fx1 + dx, by + dy - k * 12 + 2.4], [fx1, by - k * 12 + 2.4]]), C.sideGap, { mul: 0.4, scr: 0 }); }); },
    c => { pp(c, poly([[fx1, by + 3], [fx1 + dx + 2, by + dy + 3], [fx1 + dx + 2, by + dy - 7], [fx1, by - 7]]), C.stoneD, 0.2); },        // side foundation
    c => { pp(c, front, C.log, 0.25);                                                                                              // front: logs
      clipped(c, front, () => { for (let k = 0; k * 12 < by - peak; k++) { const y = by - 8 - k * 12; if (k % 2) piece(c, rectP(fx0, y - 10, g.w, 10), C.log2, { mul: 0.4, scr: 0 }); piece(c, rectP(fx0, y - 1.4, g.w, 2.4), C.gap, { mul: 0.4, scr: 0 }); piece(c, rectP(fx0, y - 10, g.w, 2), '#f0c288', { mul: 0.2, scr: 0.2 }); } }); },
    c => { pp(c, rectP(fx0 - 4, by - 8, g.w + 8, 11), C.stone, 0.2); for (let k = 0; k < 9; k++) piece(c, rectP(fx0 - 2 + k * 18 + (k % 2) * 4, by - 6, 14, 7), k % 2 ? C.stoneD : '#e6dccb', { mul: 0.3 }); },   // stone footing
    c => { for (let k = 0; by - 14 - k * 12 > top + 4; k++) for (const x of [fx0 - 1, fx1 + 1]) { const y = by - 14 - k * 12; pp(c, ell(x, y, 5.6, 5.2), C.end, 0.15); piece(c, ell(x, y, 3, 2.7), C.ring, { mul: 0.4 }); piece(c, ell(x, y, 1.2, 1.1), C.end, { mul: 0.3 }); } },   // log ends at the corners
    c => { pp(c, R, C.roof, 0.28);                                                                                                 // roof: side plane, rows of shingles
      clipped(c, R, () => { for (let r = 0; r < 8; r++) for (let k = 0; k < 10; k++) { const u = (k + (r % 2) * 0.5 - 0.5) / 9, v = (r + 0.7) / 8, [x, y] = onRoof(u, v); piece(c, circ(x, y + 3, 5), r % 2 ? C.roofL : C.roof, { mul: 0.4, scr: 0.15 }); } }); },
    c => { pp(c, rectP(ch[0] - 9, ch[1] - 46, 18, 50), '#cbb9a3', 0.25); for (let k = 0; k < 6; k++) piece(c, rectP(ch[0] - 8 + (k % 2) * 7, ch[1] - 44 + k * 7.6, 8.5, 6), k % 2 ? '#b9a68f' : '#dccbb6', { mul: 0.3 }); pp(c, rectP(ch[0] - 12, ch[1] - 50, 24, 6), '#8f7f6e', 0.2); },   // stone chimney
    c => { pp(c, slab(A, g.eaveL, 14), C.roofD, 0.25); pp(c, slab(A, g.eaveR, 14), C.roofD, 0.25); },                       // bargeboards
    c => { pp(c, slab([mx, peak - 3], [fx0 - 11, top + 13], 6), C.trim, 0.1); pp(c, slab([mx, peak - 3], [fx1 + 11, top + 13], 6), C.trim, 0.1); },
    c => pp(c, slab(A, B, 8), C.roofD, 0.15),                                                                                    // ridge
    c => nameplate(c, mx, top - 30),
    c => { pp(c, frame, C.trim, 0.15); },                                                                                          // door frame
    c => { pp(c, door, C.door, 0.12);                                                                                              // the door: planks, a round window, a knob
      clipped(c, door, () => { for (let k = 1; k < 4; k++) piece(c, rectP(g.doorX - 24 + k * 12 - 1, by - 82, 2, 82), C.doorD, { mul: 0.4, scr: 0 }); piece(c, rectP(g.doorX - 24, by - 30, 48, 4), C.doorD, { mul: 0.4, scr: 0 }); });
      pp(c, circ(g.doorX, by - 58, 8.5), C.trim, 0.12); piece(c, circ(g.doorX, by - 58, 6.2), '#bfe0f2', { mul: 0.3, scr: 0.2 }); piece(c, ell(g.doorX - 2, by - 60, 2.4, 1.4, -0.6), '#ffffff', { mul: 0.1 });
      pp(c, circ(g.doorX + 15, by - 38, 2.6), ARCH.gold, 0.15); },
    c => { paneWindow(c, wx, wy, ww, wh); pp(c, slab([wx - 7, wy + wh + 5], [wx + ww + 7, wy + wh + 5], 5), C.trim, 0.15); },        // window and its sill
    c => { const st = ell(g.doorX, by + 5, 30, 6); castShadow(c, st, 2, 0.5, 2, 0.25); piece(c, st, C.stone, { mul: 0.5 }); piece(c, ell(g.doorX - 3, by + 4, 21, 2.6), '#f1e9da', { mul: 0.3 }); },   // the step
  ];
}

// ---------- 3. the big house with a porch ----------
function bigGeom(x0, by) {
  const w = 214, fx0 = x0, fx1 = x0 + w, top = by - 104, dx = 44, dy = -20, G = 50, ov = 14;
  const E0 = [fx0 - ov, top + 10], E1 = [fx1 + ov, top + 10], RL = [fx0 - ov + dx / 2, top + dy / 2 - G], RR = [fx1 + ov + dx / 2, top + dy / 2 - G], E2 = [fx1 + ov + dx, top + dy + 10];
  return { w, fx0, fx1, top, dx, dy, G, ov, E0, E1, RL, RR, E2, doorX: x0 + 104, floor: by - 10, posts: [x0 + 50, x0 + 158], beamY: by - 96, gable: by - 134, wins: [[x0 + 12, by - 82, 32, 36], [x0 + 172, by - 82, 32, 36]] };
}
function bigHousePieces(x0, by) {
  const C = { wall: '#f6cf86', siding: '#eab86c', side: '#e2ac62', sideLine: '#d39b54', trim: '#fff6e6', roof: '#e8604c', roofL: '#f27d5f', roofD: '#c94b3b', door: '#5b8ed1', doorD: '#3f6fb0', porch: '#c98b55', porchL: '#e3aa73' };
  const g = bigGeom(x0, by), { fx0, fx1, top, dx, dy, G, E0, E1, RL, RR, E2 } = g;
  const front = rectP(fx0, top, g.w, by - top);
  const side = poly([[fx1, by], [fx1 + dx, by + dy], [fx1 + dx, top + dy], [fx1 + dx / 2, top + dy / 2 - G + 10], [fx1, top]]);
  const roof = poly([E0, E1, RR, RL]);
  const door = archDoor(g.doorX, g.floor, 48, 76), frame = archDoor(g.doorX, g.floor, 58, 82);
  const [pL, pR] = g.posts, gL = [pL - 12, g.beamY + 2], gR = [pR + 12, g.beamY + 2], gP = [g.doorX, g.gable];
  const roofAt = (u, v) => [lerp(lerp(E0[0], RL[0], v), lerp(E1[0], RR[0], v), u), lerp(E0[1], RL[1], v)];
  return [
    c => { pp(c, side, C.side, 0.2); clipped(c, side, () => { for (let k = 1; k < 14; k++) piece(c, poly([[fx1, by - k * 11], [fx1 + dx, by + dy - k * 11], [fx1 + dx, by + dy - k * 11 + 2], [fx1, by - k * 11 + 2]]), C.sideLine, { mul: 0.4, scr: 0 }); }); },
    c => { const cx = fx1 + g.ov + dx / 2, cy = top + dy / 2 - G * 0.3; pp(c, circ(cx, cy, 9), C.trim, 0.15); piece(c, circ(cx, cy, 6.4), '#bfe0f2', { mul: 0.3, scr: 0.2 }); piece(c, rectP(cx - 6.4, cy - 1, 12.8, 2), C.trim, { mul: 0.2 }); },   // round attic window in the gable
    c => { const [x, y] = roofAt(0.2, 0.8); pp(c, rectP(x - 10, y - 40, 20, 52), '#d98b6c', 0.25); for (let k = 0; k < 5; k++) piece(c, rectP(x - 10, y - 30 + k * 9, 20, 1.6), '#c06f53', { mul: 0.3 }); pp(c, rectP(x - 13, y - 44, 26, 6), '#9a5a45', 0.2); },   // brick chimney, behind the ridge
    c => { pp(c, front, C.wall, 0.25); clipped(c, front, () => { for (let k = 1; k * 10 < by - top; k++) piece(c, rectP(fx0, by - k * 10, g.w, 2), C.siding, { mul: 0.4, scr: 0 }); }); },
    c => { for (const x of [fx0, fx1 - 8]) pp(c, rectP(x, top, 8, by - top), C.trim, 0.12); },
    c => { pp(c, roof, C.roof, 0.28);                                                                                           // the long roof, rows of round shingles
      clipped(c, roof, () => { for (let r = 0; r < 7; r++) for (let k = 0; k < 22; k++) { const v = (r + 0.4) / 7, u = (k + (r % 2) * 0.5) / 21, [x, y] = roofAt(u, v); piece(c, circ(x, y + 4, 5.2), r % 2 ? C.roofL : C.roof, { mul: 0.4, scr: 0.15 }); } }); },
    c => { pp(c, slab(E0, RL, 9), C.roofD, 0.2); },                                                                              // the left roof edge
    c => { pp(c, slab(E1, RR, 12), C.roofD, 0.25); pp(c, slab(RR, E2, 12), C.roofD, 0.25); pp(c, slab([E1[0] - 3, E1[1] + 3], [RR[0], RR[1] + 5], 5), C.trim, 0.1); },   // the gable end
    c => pp(c, slab(RL, RR, 9), C.roofD, 0.18),                                                                                   // ridge
    c => { pp(c, slab([E0[0] - 2, E0[1] + 2], [E1[0] + 2, E1[1] + 2], 6), C.trim, 0.15); },                                     // the eave
    c => { for (const [x, y, w, h] of g.wins) paneWindow(c, x, y, w, h); },
    c => { for (const [x, y, w, h] of g.wins) flowerBox(c, x - 5, y + h + 4, w + 10, Math.round(x)); },
    c => { pp(c, rectP(pL - 8, g.floor, pR - pL + 16, 12), C.porch, 0.3); piece(c, rectP(pL - 8, g.floor, pR - pL + 16, 3), C.porchL, { mul: 0.4 }); },          // porch floor
    c => { pp(c, rectP(g.doorX - 28, by + 2, 56, 7), C.porch, 0.25); piece(c, rectP(g.doorX - 28, by + 2, 56, 2.4), C.porchL, { mul: 0.4 });                 // two steps down
      pp(c, rectP(g.doorX - 34, by + 9, 68, 7), C.porch, 0.25); piece(c, rectP(g.doorX - 34, by + 9, 68, 2.4), C.porchL, { mul: 0.4 }); },
    c => pp(c, frame, C.trim, 0.15),
    c => { pp(c, door, C.door, 0.12);
      clipped(c, door, () => { piece(c, rectP(g.doorX - 17, g.floor - 30, 34, 22), C.doorD, { mul: 0.3 }); piece(c, rectP(g.doorX - 13, g.floor - 27, 26, 16), '#6f9dd8', { mul: 0.3 }); });
      pp(c, circ(g.doorX, g.floor - 54, 8), C.trim, 0.12); piece(c, circ(g.doorX, g.floor - 54, 5.8), '#cfe8f6', { mul: 0.3, scr: 0.2 }); pawPrint(c, g.doorX, g.floor - 53, 0.28, '#5b8ed1');
      pp(c, circ(g.doorX + 15, g.floor - 36, 2.6), ARCH.gold, 0.15); },
    c => { for (const x of [pL, pR]) { for (let k = 0; k < 4; k++) pp(c, rectP(x + (x < g.doorX ? 9 + k * 7 : -12 - k * 7), g.floor - 26, 3, 26), C.trim, 0.1);     // a little railing each side
        pp(c, rectP(x < g.doorX ? x : g.doorX + 30, g.floor - 30, x < g.doorX ? g.doorX - 30 - x : x - g.doorX - 30, 4), C.trim, 0.12); } },
    c => { for (const x of [pL, pR]) pp(c, rectP(x - 3.5, g.beamY, 7, g.floor - g.beamY), C.trim, 0.18); },                       // posts
    c => { const tri = poly([gL, gP, gR]); pp(c, tri, C.roof, 0.25);                                                                     // the porch's own little gable
      clipped(c, tri, () => { for (let r = 0; r < 4; r++) for (let k = -6; k <= 6; k++) piece(c, circ(g.doorX + k * 10 + (r % 2) * 5, g.beamY - 4 - r * 9, 5), r % 2 ? C.roofL : C.roof, { mul: 0.4, scr: 0.15 }); });
      pp(c, rectP(gL[0], g.beamY, gR[0] - gL[0], 8), C.roofD, 0.2); },
    c => { pp(c, slab([gP[0], gP[1] - 3], [gL[0] - 4, gL[1] + 2], 8), C.roofD, 0.2); pp(c, slab([gP[0], gP[1] - 3], [gR[0] + 4, gR[1] + 2], 8), C.roofD, 0.2);
      pp(c, slab([gP[0], gP[1] + 3], [gL[0] + 2, gL[1] + 1], 4), C.trim, 0.1); pp(c, slab([gP[0], gP[1] + 3], [gR[0] - 2, gR[1] + 1], 4), C.trim, 0.1); nameplate(c, g.doorX, g.beamY - 16); },
    c => { const lx = pR - 16; c.save(); c.strokeStyle = '#4f4a5e'; c.lineWidth = 1.2; c.beginPath(); c.moveTo(lx, g.beamY + 8); c.lineTo(lx, g.beamY + 18); c.stroke(); c.restore();   // porch lantern
      pp(c, rectP(lx - 6, g.beamY + 18, 12, 3), '#4f4a5e', 0.1); pp(c, poly([[lx - 5, g.beamY + 21], [lx + 5, g.beamY + 21], [lx + 4, g.beamY + 33], [lx - 4, g.beamY + 33]]), '#fbe6ae', 0.15); pp(c, rectP(lx - 5, g.beamY + 33, 10, 2.6), '#4f4a5e', 0.1); },
  ];
}

// ---------- snow on the roofs (only drawn when there is snow on the ground) ----------
function houseSnow(c, lv, x0, by, h) {      // lv 0 = no house yet (the upgrade animation's bare yard)
  if (lv === 2) {
    const g = cabinGeom(x0, by), { A, B, Cc, D } = g;
    snowCap(c, [[A[0], A[1] - 9], [B[0], B[1] - 9], [Cc[0] + 3, Cc[1] - 6], [D[0] + 3, D[1] - 6], [D[0] - 8, D[1] + 2]], 811);
    snowCap(c, [[A[0], A[1] - 9], [g.eaveL[0] - 2, g.eaveL[1] - 6], [g.eaveL[0] + 2, g.eaveL[1] + 2], [A[0], A[1] + 2]], 812);
  } else if (lv === 3) {
    const g = bigGeom(x0, by), { E0, E1, RL, RR, E2 } = g;
    snowCap(c, [[RL[0] - 2, RL[1] - 7], [RR[0] + 2, RR[1] - 7], [RR[0] - 4, RR[1] + 22], [RL[0] - 8, RL[1] + 22]], 813);
    snowCap(c, [[RR[0], RR[1] - 7], [E2[0] + 3, E2[1] - 6], [E2[0] - 2, E2[1] + 2], [RR[0], RR[1] + 3]], 814);
    snowCap(c, [[g.doorX, g.gable - 7], [g.posts[0] - 16, g.beamY - 4], [g.posts[0] - 12, g.beamY + 3], [g.doorX, g.gable + 4], [g.posts[1] + 12, g.beamY + 3], [g.posts[1] + 16, g.beamY - 4]], 815);
    for (const [x, y, w] of g.wins) snowCap(c, ellipsePts(x + w / 2, y + 38 + 3, w / 2 + 6, 3.4, 18), 816 + x | 0);
  }
  if (h.lamp.post) snowCap(c, ellipsePts(h.lamp.x + 14, Y_(h.lamp.d) - 74, 10, 3.5, 16), 804);
  snowCap(c, ellipsePts(MAILBOX.x - 2, Y_(MAILBOX.d) - 128, 38, 7, 24), 803);
}
let Y_ = d => d;                                  // set while the yard is being built (its own H)

// the whole outline (for the night tint over the part that sticks up into the sky)
function houseOutline(lv, x0, by) {
  if (lv === 2) { const g = cabinGeom(x0, by), ch = [lerp(lerp(g.A[0], g.B[0], 0.55), lerp(g.D[0], g.Cc[0], 0.55), 0.32), lerp(lerp(g.A[1], g.B[1], 0.55), lerp(g.D[1], g.Cc[1], 0.55), 0.32)];
    return [poly([[g.fx0 - 18, by + 6], [g.eaveL[0] - 4, g.eaveL[1] + 6], [g.A[0], g.A[1] - 8], [g.B[0] + 2, g.B[1] - 6], [g.Cc[0] + 4, g.Cc[1] + 4], [g.fx1 + g.dx + 2, by + g.dy + 4], [g.fx1 + g.dx + 2, by + 6]]), rectP(ch[0] - 13, ch[1] - 52, 26, 56)]; }
  if (lv === 3) { const g = bigGeom(x0, by), [x, y] = [lerp(lerp(g.E0[0], g.RL[0], 0.8), lerp(g.E1[0], g.RR[0], 0.8), 0.2), lerp(g.E0[1], g.RL[1], 0.8)];
    return [poly([[g.fx0 - 18, by + 18], [g.E0[0] - 4, g.E0[1] + 6], [g.RL[0] - 4, g.RL[1] - 8], [g.RR[0] + 4, g.RR[1] - 8], [g.E2[0] + 6, g.E2[1] + 4], [g.fx1 + g.dx + 2, by + g.dy + 4], [g.fx1 + g.dx + 2, by + 18]]), rectP(x - 14, y - 46, 28, 50)]; }
  return [];
}
// where far rain lands on the roof instead of the ground (screen y, or null outside the house)
function houseRoofY(lv, x, by, x0) {
  let pts;
  if (lv === 2) { const g = cabinGeom(x0, by); pts = [g.eaveL, g.A, g.B, g.Cc]; }
  else { const g = bigGeom(x0, by); pts = [g.E0, g.RL, g.RR, g.E2]; }
  if (x < pts[0][0] || x > pts[pts.length - 1][0]) return null;
  for (let i = 0; i < pts.length - 1; i++) if (x <= pts[i + 1][0]) return lerp(pts[i][1], pts[i + 1][1], (x - pts[i][0]) / (pts[i + 1][0] - pts[i][0] || 1));
  return null;
}
// does the house cover this point of the yard? (grass tufts and flowers are not drawn on its walls)
function houseCovers(lv, x0, by, x, y) {
  if (lv === 2) { const g = cabinGeom(x0, by); return x > g.fx0 - 4 && x < g.fx1 + g.dx + 2 && y < by + 8 && y > g.peak - 30; }
  if (lv === 3) { const g = bigGeom(x0, by); return (x > g.fx0 - 4 && x < g.fx1 + g.dx + 2 && y < by + 4 && y > g.RL[1] - 10) || (Math.abs(x - g.doorX) < 38 && y < by + 18 && y > by - 20); }
  return false;
}

// ---------- the art list ----------
const HOUSE_PIECES = [null, doghousePieces, cabinPieces, bigHousePieces];
for (const lv of [1, 2, 3]) {
  const box = [null, { w: 198, h: 178, ox: 21, oy: 163 }, { w: 244, h: 228, ox: 23, oy: 212 }, { w: 302, h: 218, ox: 21, oy: 196 }][lv];   // measured; origin = (x0, by)
  ART.def('house.' + lv, { kind: 'paint', group: 'house', box, pieces: (x0, by) => HOUSE_PIECES[lv](x0, by), draw: (c, x0, by) => { for (const p of HOUSE_PIECES[lv](x0, by)) p(c); },
    note: ['', 'the doghouse', 'the log cabin', 'the big house with a porch'][lv] + ': (c, x0 = left of the front wall, by = its base); .pieces(x0, by) = the paper pieces, back to front' });
}
ART.def('house.snow', { kind: 'paint', group: 'house', draw: (c, lv, x0, by, h) => houseSnow(c, lv, x0, by, h), note: 'snow on the cabin / big house roofs and the mailbox' });
// the door standing open while he naps inside (cabin and big house): dark inside, the door swung in
for (const lv of [2, 3]) {
  const w = 48, h = lv === 2 ? 82 : 76;
  ART.def('house.' + lv + '.doorOpen', { group: 'house', box: { w: 64, h: h + 8, ox: 32, oy: h + 4 }, stick: false, note: 'his door, open: origin at the middle of the sill', draw: c => {
    const d = archDoor(0, 0, w, h); piece(c, d, '#3b2a2b', { mul: 0.5 });
    clipped(c, d, () => { castShadow(c, d, 6, 0, 4, 0.5); piece(c, rectP(-w / 2, -h, 9, h), lv === 2 ? '#9a6242' : '#5b8ed1', { mul: 0.4 }); piece(c, ell(0, -3, 20, 7), '#7aaad6', { mul: 0.3 }); });
  } });
}
// one flying piece of the upgrade animation
ART.def('live.housePiece', { kind: 'live', group: 'house', note: '(ctx, piece canvas {cv, x, y, w, h}, dx, dy, rot, scale, alpha)', draw: (ctx, p, dx, dy, rot, sc, a) => {
  const cx = p.x + p.w / 2, cy = p.y + p.h / 2;
  ctx.save(); ctx.globalAlpha = a; ctx.translate(cx + dx, cy + dy); ctx.rotate(rot); ctx.scale(sc, sc); ctx.drawImage(p.cv, -p.w / 2, -p.h / 2, p.w, p.h); ctx.restore();
} });
// a thumbnail of a house, for the panel
ART.def('ui.houseThumb', { kind: 'paint', group: 'ui', note: '(c, level, w, h): the house fitted into w × h', draw: (c, lv, w, h) => {
  const b = ART.get('house.' + lv).box, k = Math.min(w / b.w, h / b.h);
  c.save(); c.translate((w - b.w * k) / 2 + b.ox * k, (h - b.h * k) / 2 + b.oy * k); c.scale(k, k); ART.paint('house.' + lv, c, 0, 0); c.restore();
} });

// a point on the roof ridge of the cabin or the big house (u = 0…1 along it), for the sparrow to perch on
function houseRidgePoint(lv, u) {
  const h = HOUSES[lv], by = Y(HOUSE.d);
  if (lv === 2) { const g = cabinGeom(h.x0, by); return [lerp(g.A[0], g.B[0], u), lerp(g.A[1], g.B[1], u) - 3]; }
  const g = bigGeom(h.x0, by); return [lerp(g.RL[0], g.RR[0], u), lerp(g.RL[1], g.RR[1], u) - 3];
}
