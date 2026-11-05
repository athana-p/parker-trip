// ================= POSTCARDS: 3:2, drawn in code, cached per (id, side, res) =================
const PC_W = 900, PC_H = 600;
const FONT = '"PingFang SC","Hiragino Sans GB","Noto Sans SC","Microsoft YaHei","WenQuanYi Zen Hei",sans-serif';

// ---- shared paper props ----
function lantern(c, x, y, s) {          // khom loi sky lantern
  glow(c, x, y + 4 * s, 34 * s, '255,200,120', 0.5);
  const p = new Path2D(); p.moveTo(x - 9 * s, y - 10 * s); p.quadraticCurveTo(x, y - 16 * s, x + 9 * s, y - 10 * s);
  p.lineTo(x + 7 * s, y + 10 * s); p.quadraticCurveTo(x, y + 12 * s, x - 7 * s, y + 10 * s); p.closePath();
  castShadow(c, p, 2, 0.5, 1.5, 0.12); piece(c, p, '#f7c66c', { mul: 0.5, scr: 0.3 });
  piece(c, ell(x, y + 10.5 * s, 6 * s, 1.8 * s), '#e0874b', { mul: 0.5, scr: 0 });
}
function wavyGlints(c, cx, y0, n, w0, seed, col1 = '#fde6a0', col2 = '#fbd27e') {
  for (let i = 0; i < n; i++) {
    const w = w0 - i * (w0 / (n + 2)) + (i % 2) * 8, y = y0 + i * 9;
    tornPiece(c, [[cx - w / 2, y], [cx + w / 2, y + 1], [cx + w / 2 - 4, y + 5], [cx - w / 2 + 3, y + 4.5]], i % 2 ? col2 : col1, { amp: 1.2, seed: seed + i, rim: 0, shadow: 0 });
  }
}
function plumeria(c, x, y, r, seed) {   // frangipani
  const rr = rng(seed), a0 = rr() * TAU, p = new Path2D();
  for (let i = 0; i < 5; i++) { const a = a0 + i / 5 * TAU; p.addPath(ell(x + Math.cos(a) * r * 0.55, y + Math.sin(a) * r * 0.55, r * 0.62, r * 0.36, a + 0.35)); }
  castShadow(c, p, 2, 1, 2.5, 0.2); piece(c, p, '#fff8ee', { mul: 0.5, scr: 0.2 });
  piece(c, circ(x, y, r * 0.42), '#f7cf5e', { mul: 0.5, scr: 0.1 });
}
function leaf(c, x, y, L, w, ang, col) {
  const p = new Path2D(), dx = Math.cos(ang), dy = Math.sin(ang), nx = -dy, ny = dx;
  p.moveTo(x, y); p.quadraticCurveTo(x + dx * L / 2 + nx * w, y + dy * L / 2 + ny * w, x + dx * L, y + dy * L);
  p.quadraticCurveTo(x + dx * L / 2 - nx * w, y + dy * L / 2 - ny * w, x, y); p.closePath();
  castShadow(c, p, 2, 1, 2.5, 0.2); piece(c, p, col, { mul: 0.7, scr: 0.2 });
}

// ---- architecture kit (cartoon palette, shared by all postcards) ----
const ARCH = { red: '#e04a3a', redD: '#b8322c', green: '#2f9573', gold: '#f5c04a', goldD: '#d9982f', goldL: '#ffe08c', cream: '#fff3dc', wood: '#9a5530', woodD: '#6e3a22' };
function pp(c, p, col, sh = 0.2, o = {}) { if (sh) castShadow(c, p, o.blur ?? 2.5, 1, 2.5, sh); piece(c, p, col, { mul: o.mul ?? 0.55, scr: o.scr ?? 0.25 }); }
function slab(a, b, w) { const dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy) || 1, nx = -dy / L * w / 2, ny = dx / L * w / 2; return poly([[a[0] + nx, a[1] + ny], [b[0] + nx, b[1] + ny], [b[0] - nx, b[1] - ny], [a[0] - nx, a[1] - ny]]); }
// gold naga bargeboard along a roof slope a→b, flame crest on top, tail curling up at the eave
function bargeboard(c, a, b, side) {
  const dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy), ux = dx / L, uy = dy / L;
  let nx = uy, ny = -ux; if (ny > 0) { nx = -nx; ny = -ny; }
  const crest = new Path2D();
  for (let s = 10; s < L - 10; s += 11) { const x = a[0] + ux * s, y = a[1] + uy * s; crest.addPath(poly([[x - ux * 4 + nx * 2, y - uy * 4 + ny * 2], [x + nx * 9 + ux * 3, y + ny * 9 + uy * 3], [x + ux * 4 + nx * 2, y + uy * 4 + ny * 2]])); }
  pp(c, crest, ARCH.gold, 0.12);
  pp(c, slab(a, b, 7), ARCH.gold, 0.2);
  const [bx, by] = b, p = new Path2D();
  p.moveTo(bx - side * 3, by + 3); p.quadraticCurveTo(bx + side * 11, by + 4, bx + side * 12, by - 8); p.quadraticCurveTo(bx + side * 13, by - 17, bx + side * 6, by - 14);
  p.quadraticCurveTo(bx + side * 8, by - 8, bx + side * 3, by - 3); p.closePath();
  pp(c, p, ARCH.gold, 0.15);
}
function chofa(c, x, y, s = 1) {   // slender golden finial on the ridge
  const p = new Path2D(); p.moveTo(x - 3 * s, y + 4 * s); p.quadraticCurveTo(x - 2 * s, y - 14 * s, x + 7 * s, y - 22 * s); p.quadraticCurveTo(x + 9 * s, y - 24 * s, x + 7 * s, y - 18 * s);
  p.quadraticCurveTo(x + 2 * s, y - 10 * s, x + 3 * s, y + 4 * s); p.closePath(); pp(c, p, ARCH.gold, 0.15);
}
// front gable: red roof edge, green band, deep-red panel with a gold sunburst, gold bargeboards
function gable(c, cx, py, half, h, fin = true) {
  const by = py + h, tri = d => poly([[cx, py + d * 2.2], [cx + half - d * 1.9, by - d * 0.15], [cx - half + d * 1.9, by - d * 0.15]]);
  pp(c, poly([[cx, py], [cx + half + 6, by + 4], [cx - half - 6, by + 4]]), ARCH.red, 0.28);
  pp(c, tri(7), ARCH.green, 0.12); pp(c, tri(13), ARCH.redD, 0.12); pp(c, tri(18), ARCH.gold, 0.1); pp(c, tri(21), ARCH.redD, 0.1);
  clipped(c, tri(21), () => {
    const rays = new Path2D();
    for (let i = -3; i <= 3; i++) { const a = -Math.PI / 2 + i * 0.3, L = h * 0.8, x = cx + Math.cos(a) * L, y = by + Math.sin(a) * L; rays.addPath(poly([[cx - 3, by], [x, y], [cx + 3, by]])); }
    piece(c, rays, ARCH.gold, { mul: 0.5, scr: 0.25 });
    pp(c, circ(cx, by, h * 0.17), ARCH.goldL, 0.12);
  });
  pp(c, rectP(cx - half + 2, by - 2, half * 2 - 4, 7), ARCH.gold, 0.2);
  bargeboard(c, [cx, py + 3], [cx - half - 4, by + 2], -1); bargeboard(c, [cx, py + 3], [cx + half + 4, by + 2], 1);
  if (fin) chofa(c, cx, py + 2, 1.1);
}
// a lower side roof seen from the front, stepping down and outwards
function wing(c, cx, dir, x0, y0, x1, y1, th = 14) {
  const A = [cx + dir * x0, y0], B = [cx + dir * x1, y1];
  pp(c, poly([A, B, [B[0] + dir * 5, B[1] + 3], [B[0] + dir * 5, B[1] + th], [A[0], B[1] + th]]), ARCH.red, 0.25);
  pp(c, rectP(Math.min(A[0], B[0] + dir * 5), B[1] + th - 4, Math.abs(B[0] + dir * 5 - A[0]), 4), ARCH.redD, 0);
  pp(c, slab([A[0], A[1] + 6], [B[0], B[1] + 6], 5), ARCH.green, 0.1);
  bargeboard(c, A, B, dir);
}
function lannaTemple(c, cx) {
  // facade
  pp(c, rectP(cx - 78, 248, 156, 112), ARCH.cream, 0.2);
  for (const dx of [-66, -27, 27, 66]) { pp(c, rectP(cx + dx - 4.5, 252, 9, 110), ARCH.red, 0.15); pp(c, rectP(cx + dx - 7, 252, 14, 5), ARCH.gold, 0.1); }
  const door = new Path2D(); door.moveTo(cx - 15, 362); door.lineTo(cx - 15, 290); door.arc(cx, 290, 15, Math.PI, 0); door.lineTo(cx + 15, 362); door.closePath();
  pp(c, door, ARCH.gold, 0.2); pp(c, rectP(cx - 10, 292, 9, 70), ARCH.redD, 0); pp(c, rectP(cx + 1, 292, 9, 70), ARCH.redD, 0);
  // roofs, back to front
  for (const d of [-1, 1]) wing(c, cx, d, 70, 236, 142, 280);
  for (const d of [-1, 1]) wing(c, cx, d, 44, 196, 110, 250);
  gable(c, cx, 114, 52, 66);
  gable(c, cx, 146, 84, 100, false);
}
function goldChedi(c, cx, by) {
  glow(c, cx, by - 150, 80, '255,220,140', 0.45);
  const tier = (w, y, h, col) => { pp(c, rectP(cx - w / 2, y, w, h), col, 0.2); piece(c, rectP(cx - w / 2, y, w, 3), ARCH.goldL, { mul: 0.4, scr: 0.2 }); };
  tier(92, by - 22, 22, '#e2a63a'); tier(74, by - 38, 16, '#efb945'); tier(58, by - 50, 12, '#f5c652');
  const bell = new Path2D(); bell.moveTo(cx - 31, by - 50); bell.bezierCurveTo(cx - 33, by - 82, cx - 18, by - 104, cx, by - 104); bell.bezierCurveTo(cx + 18, by - 104, cx + 33, by - 82, cx + 31, by - 50); bell.closePath();
  pp(c, bell, ARCH.gold, 0.22);
  clipped(c, bell, () => {
    piece(c, ell(cx + 24, by - 70, 18, 44), ARCH.goldD, { mul: 0.4, scr: 0.1 });
    piece(c, ell(cx - 17, by - 82, 5, 20, 0.25), ARCH.goldL, { mul: 0.3, scr: 0.2 });
    pp(c, rectP(cx - 40, by - 66, 80, 5), '#ffd36b', 0.12);
  });
  pp(c, rectP(cx - 9, by - 116, 18, 12), '#e8ad40', 0.15);
  for (let i = 0; i < 7; i++) pp(c, ell(cx, by - 119 - i * 6, 13 - i * 1.4, 3), i % 2 ? ARCH.goldD : ARCH.gold, 0.1);
  pp(c, poly([[cx, by - 192], [cx - 3.5, by - 158], [cx + 3.5, by - 158]]), ARCH.gold, 0.12);
  pp(c, ell(cx, by - 168, 7, 2), ARCH.goldD, 0.1); pp(c, ell(cx, by - 176, 5, 1.6), ARCH.goldD, 0.1);
}
function merlonPts(x0, x1, y, mH, mW, gap) { const pts = [[x0, y]]; for (let x = x0 + gap / 2; x + mW <= x1; x += mW + gap) pts.push([x, y], [x, y - mH], [x + mW, y - mH], [x + mW, y]); pts.push([x1, y]); return pts; }
function bricks(c, x0, x1, y0, rows, seed) {
  const rb = rng(seed);
  for (let r = 0; r < rows; r++) for (let x = x0 + (r % 2) * 14; x < x1 - 20; x += 28) if (rb() < 0.33) piece(c, rectP(x + 2, y0 + r * 12, 22, 8), rb() < 0.6 ? '#ea8550' : '#c55a33', { mul: 0.45, scr: 0.2 });
}
// old city wall with merlons; optional gate (Tha Phae-style): raised tower, arched opening, open wooden doors
function cityWall(c, W, top, bot, gx) {
  const cap = '#f39d68';
  tornPiece(c, merlonPts(-20, W + 20, top, 16, 24, 22).concat([[W + 20, bot], [-20, bot]]), '#d9693f', { amp: 0.8, seed: 60, rimCol: cap, rimA: 0.9, shadow: 0.24, mul: 0.7 });
  piece(c, rectP(-20, top, W + 40, 5), cap, { mul: 0.5, scr: 0.2 });
  bricks(c, -20, W + 20, top + 12, 4, 61);
  piece(c, rectP(-20, bot - 12, W + 40, 12), '#b14f2c', { mul: 0.6 });
  if (gx == null) return;
  const gt = top - 24;
  tornPiece(c, merlonPts(gx - 62, gx + 62, gt, 14, 20, 16).concat([[gx + 62, bot], [gx - 62, bot]]), '#e27848', { amp: 0.6, seed: 62, rimCol: cap, rimA: 0.9, shadow: 0.3, mul: 0.7 });
  piece(c, rectP(gx - 62, gt, 124, 5), cap, { mul: 0.5, scr: 0.2 });
  bricks(c, gx - 62, gx + 62, gt + 12, 6, 63);
  piece(c, rectP(gx - 62, bot - 12, 124, 12), '#b14f2c', { mul: 0.6 });
  pp(c, rectP(gx - 15, gt + 6, 30, 11), ARCH.gold, 0.15); pp(c, rectP(gx - 12, gt + 8, 24, 7), ARCH.redD, 0);
  const op = new Path2D(); op.moveTo(gx - 22, bot); op.lineTo(gx - 22, top + 16); op.arc(gx, top + 16, 22, Math.PI, 0); op.lineTo(gx + 22, bot); op.closePath();
  piece(c, op, '#5a2c20', { mul: 0.6, scr: 0.1 });
  clipped(c, op, () => { piece(c, rectP(gx - 22, bot - 16, 44, 16), '#f2c98f', { mul: 0.4, scr: 0.2 }); glow(c, gx, bot - 10, 30, '255,220,160', 0.5); });
  for (const d of [-1, 1]) {
    const p = poly([[gx + d * 22, top - 2], [gx + d * 36, top + 4], [gx + d * 36, bot], [gx + d * 22, bot]]);
    pp(c, p, ARCH.wood, 0.25);
    clipped(c, p, () => { for (let k = 1; k < 3; k++) piece(c, rectP(gx + d * (22 + k * 4.7) - 0.8, top - 4, 1.6, bot - top + 8), ARCH.woodD, { mul: 0.5, scr: 0 }); });
    c.save(); c.fillStyle = ARCH.gold; for (let y = top + 12; y < bot - 6; y += 12) for (const k of [0.3, 0.75]) { c.beginPath(); c.arc(gx + d * (22 + 14 * k), y + d * 0, 1.4, 0, TAU); c.fill(); } c.restore();
  }
}

// ---- 1. Chiang Mai old city: moat, brick wall, temple roof (+ Doi Suthep, sky lanterns) ----
function pcChiangMai(c, W, H) {
  piece(c, rectP(0, 0, W, H), '#bfb2d8', { scr: 0.25 });
  [[60, '#cbb4d4'], [118, '#d9b5c6'], [172, '#e7bcb5'], [222, '#f0c8aa'], [266, '#f6d7a8']].forEach(([y, col], i) =>
    strip(c, -20, W + 20, x => y + 9 * Math.sin(x / (170 + i * 30) + i) + 3 * fbm1(x / 60, i), H, col, { seed: 30 + i, shadow: 0.1, amp: 3.5 }));
  glow(c, 820, 262, 300, '255,214,150', 0.55);
  tornPiece(c, ellipsePts(820, 266, 32, 32, 48), '#fde3a0', { amp: 1.5, seed: 7, shadow: 0, rimCol: '#fff5d6' });
  // Doi Suthep with its tiny golden chedi on top
  const mtn = x => 322 - 92 * Math.exp(-(((x - 680) / 170) ** 2)) - 30 * Math.exp(-(((x - 220) / 230) ** 2)) + 4 * fbm1(x / 60, 4);
  strip(c, -20, W + 20, mtn, H, '#a98cb2', { seed: 40, rimCol: '#dccde4', shadow: 0.12 });
  glow(c, 680, 226, 26, '255,220,150', 0.6);
  piece(c, poly([[680, 212], [675, 231], [685, 231]]), '#f5c04a', { mul: 0.5, scr: 0.3 });
  [[460, 112, 1], [548, 72, 0.8], [612, 150, 0.9], [404, 182, 0.7], [842, 104, 0.75], [690, 58, 0.6]].forEach(([x, y, s]) => lantern(c, x, y, s));
  // tree line, then the temple and chedi behind the wall
  strip(c, -20, W + 20, x => 338 - 12 * Math.max(0, fbm1(x / 70, 9) + 0.4) * 1.6, H, '#5f9a80', { seed: 41, rimCol: '#a8d0b8', shadow: 0.14, amp: 3 });
  lannaTemple(c, 250);
  goldChedi(c, 470, 342);
  cityWall(c, W, 356, 420, 712);
  // bougainvillea spilling over the wall
  [[150, 350, 56], [520, 350, 50]].forEach(([x, y, w], j) => {
    const r2 = rng(70 + j);
    for (let k = 0; k < 9; k++) leaf(c, x + (r2() - 0.5) * w, y + r2() * 10, 14, 5, r2() * TAU, '#4f9a52');
    for (let k = 0; k < 18; k++) { const px = x + (r2() - 0.5) * w * 1.1, py = y - 6 + r2() * (16 + (k % 3) * 10); piece(c, circ(px, py, 4.5 + r2() * 3), r2() < 0.5 ? '#e8559a' : '#f58cbf', { mul: 0.45, scr: 0.25 }); }
  });
  // moat
  strip(c, -20, W + 20, x => 418 + 1.5 * fbm1(x / 120, 3), H, '#46a3a6', { seed: 80, rimCol: '#a6dcd6', amp: 1.5, shadow: 0.2 });
  const rr = rng(81);
  for (let k = 0; k < 22; k++) { const x = rr() * W, y = 426 + rr() * 20; tornPiece(c, [[x, y], [x + 30 + rr() * 30, y], [x + 26, y + 3], [x + 4, y + 3]], '#3a8f93', { amp: 1, seed: 90 + k, rim: 0, shadow: 0, mul: 0.4 }); }
  strip(c, -20, W + 20, x => 446 + 2 * fbm1(x / 140, 5), H, '#66bdb8', { seed: 82, rimCol: '#c4ece4', amp: 1.8, shadow: 0.12 });
  wavyGlints(c, 820, 430, 5, 120, 100);
  [[180, 458], [250, 452], [410, 462]].forEach(([x, y], i) => {
    const pad = new Path2D(); pad.moveTo(x, y); pad.arc(x, y, 16, 0.3, TAU - 0.3); pad.closePath();
    castShadow(c, pad, 2, 1, 2, 0.2); piece(c, pad, i % 2 ? '#5fae5a' : '#6dbb63', { mul: 0.6 });
  });
  const bud = new Path2D(); bud.moveTo(243, 448); bud.quadraticCurveTo(232, 432, 243, 420); bud.quadraticCurveTo(254, 432, 243, 448); piece(c, bud, '#f0a0b6', { mul: 0.5, scr: 0.3 });
  // near bank: stone edge, grass, path
  strip(c, -20, W + 20, x => 470 + 2 * fbm1(x / 90, 6), H, '#e2c48f', { seed: 83, rimCol: '#f6e8c8', amp: 2, shadow: 0.24 });
  strip(c, -20, W + 20, x => 486 + 4 * fbm1(x / 120, 7), H, '#8fc46a', { seed: 84, rimCol: '#d8edb8', shadow: 0.2 });
  const rg = rng(85); for (let k = 0; k < 30; k++) tuft(c, rg() * W, 492 + rg() * 20, 10 + rg() * 8, rg() < 0.5 ? '#6fae55' : '#7dba60', 300 + k);
  strip(c, -20, W + 20, x => 522 + 4 * fbm1(x / 150, 8), H, '#f3d9a4', { seed: 86, rimCol: '#fdf2da', shadow: 0.22 });
  const rp = rng(87); for (let k = 0; k < 40; k++) piece(c, ell(rp() * W, 540 + rp() * 56, 2 + rp() * 4, 1.5 + rp() * 1.5), ['#d6bb8e', '#cdb2a2', '#e0c79a'][k % 3], { scr: 0.2 });
}
// props + Parker go on top of the static scene (still part of the cached card)
function pcChiangMaiFront(c, W, H, res) {
  pcChiangMai(c, W, H);
  // mango sticky rice on a banana leaf
  const lf = ell(700, 566, 46, 13); castShadow(c, lf, 3, 1, 3, 0.25); piece(c, lf, '#6f9e57', { mul: 0.7 });
  const rice = new Path2D(); rice.moveTo(668, 566); rice.quadraticCurveTo(672, 540, 690, 542); rice.quadraticCurveTo(706, 544, 708, 566); rice.closePath();
  castShadow(c, rice, 2, 1, 2, 0.2); piece(c, rice, '#fbf6ea', { mul: 0.5, scr: 0.3 });
  for (let i = 0; i < 3; i++) { const p = ell(718 + i * 9, 560 - i * 3, 13, 6, -0.3); castShadow(c, p, 1.5, 0.5, 1.5, 0.2); piece(c, p, '#f6c04e', { mul: 0.5, scr: 0.25 }); }
  // Parker, sitting by the moat, happy
  const k = 0.8, bx = { w: BOX_SIT.w * k, h: BOX_SIT.h * k, ox: BOX_SIT.ox * k, oy: BOX_SIT.oy * k };
  placePuppet(c, puppetCanvas(bx, res, x => { x.scale(k, k); drawSitB(x, 'happy', 0.1); }), bx, 590, 576, res);
  // frangipani in the near corner
  leaf(c, 30, 600, 90, 18, -1.1, '#5f8f4f'); leaf(c, 60, 610, 80, 16, -0.6, '#6e9c5a'); leaf(c, 836, 608, 86, 17, -2.2, '#5f8f4f');
  plumeria(c, 70, 548, 20, 1); plumeria(c, 108, 572, 17, 2); plumeria(c, 40, 584, 15, 3); plumeria(c, 860, 560, 18, 4);
  // light
  glow(c, 820, 262, 520, '255,206,150', 0.22);
  vignette(c, W, H, '176,140,170', 0.42, 1.0);
}

// ---- helpers shared by the postcards ----
// Parker as a die-cut sticker inside a card (flip = facing left)
function pcParker(c, res, box, k, fn, x, y, flip = false) {
  const bx = { w: box.w * k, h: box.h * k, ox: (flip ? box.w - box.ox : box.ox) * k, oy: box.oy * k };
  placePuppet(c, puppetCanvas(bx, res, p => { p.scale(flip ? -k : k, k); fn(p); }), bx, x, y, res);
}
function skyBands(c, W, cols, top, hz, seedBase) {
  piece(c, rectP(0, 0, W, 700), cols[0], { scr: 0.22 });
  for (let i = 1; i < cols.length; i++) {
    const y = lerp(top, hz, (i - 1) / (cols.length - 2));
    strip(c, -20, W + 20, x => y + 8 * Math.sin(x / (150 + i * 30) + i) + 3 * fbm1(x / 60, i + seedBase), 700, cols[i], { seed: seedBase + i, shadow: 0.1, amp: 3.5, scr: 0.22 });
  }
}
function bird(c, x, y, s, col = '#4a3a5a') { const p = new Path2D(); p.moveTo(x - 9 * s, y); p.quadraticCurveTo(x - 4 * s, y - 5 * s, x, y + 1 * s); p.quadraticCurveTo(x + 4 * s, y - 5 * s, x + 9 * s, y); p.quadraticCurveTo(x + 4 * s, y - 2 * s, x, y + 3 * s); p.quadraticCurveTo(x - 4 * s, y - 2 * s, x - 9 * s, y); piece(c, p, col, { mul: 0.4 }); }
function pine(c, x, y, h, col, seed) {
  for (let i = 0; i < 3; i++) { const w = h * (0.42 - i * 0.1), yy = y - i * h * 0.26; tornPiece(c, [[x - w, yy], [x, yy - h * 0.48], [x + w, yy]], col, { amp: 1, seed: seed + i, rim: 0, shadow: 0.15, mul: 0.7 }); }
  piece(c, rectP(x - 1.5, y, 3, h * 0.12), '#4a3a32', { mul: 0.5 });
}

// ---- 2. Pai Canyon at sunset: knife-edge ridges of red earth, pines, a huge low sun ----
function pcPai(c, W, H) {
  skyBands(c, W, ['#57478c', '#7e539a', '#b8609c', '#e57a88', '#f69d6c', '#fbc56c'], 70, 300, 200);
  glow(c, 640, 300, 320, '255,200,140', 0.55);
  tornPiece(c, ellipsePts(640, 300, 50, 50, 56), '#ffe08a', { amp: 1.5, seed: 9, shadow: 0, rimCol: '#fff6d6' });
  strip(c, -20, W + 20, x => 318 - 26 * Math.max(0, fbm1(x / 110, 3) + 0.3), H, '#9d6aa0', { seed: 210, rimCol: '#e2b4cf', shadow: 0.12 });
  c.save(); c.globalAlpha = 0.45; strip(c, -20, W + 20, x => 330 + 3 * Math.sin(x / 70), H, '#f7b48c', { seed: 211, shadow: 0, rim: 0, amp: 3 }); c.restore();
  strip(c, -20, W + 20, x => 352 - 20 * Math.max(0, Math.sin(x / 75 + 1)) - 8 * fbm1(x / 40, 4), H, '#8a5070', { seed: 212, rimCol: '#d9909c', shadow: 0.15 });
  const rp = rng(213); for (let k = 0; k < 16; k++) { const x = rp() * W; pine(c, x, 352 - 18 * Math.max(0, Math.sin(x / 75 + 1)) + 4, 16 + rp() * 10, '#5a4060', 220 + k); }
  // middle ridges: sharp, eroded, sunlit on top
  const midF = x => 412 - 46 * Math.max(0, Math.sin(x / 64 + 0.5)) ** 1.6 - 10 * fbm1(x / 30, 5);
  const midP = strip(c, -20, W + 20, midF, H, '#a24a3c', { seed: 214, rimCol: '#f3a66c', rimA: 0.95, shadow: 0.2 });
  clipped(c, midP, () => { const rf = rng(219); for (let k = 0; k < 60; k++) { const x = rf() * W, y = midF(x) + 4; piece(c, poly([[x - 2, y], [x + 2, y], [x + 4 + rf() * 3, 520], [x - 4, 520]]), rf() < 0.5 ? '#8a3c34' : '#c0664a', { mul: 0.5, scr: 0.1 }); } });
  strip(c, -20, W + 20, x => 470 + 6 * fbm1(x / 60, 6), H, '#5e2e40', { seed: 218, rim: 0, shadow: 0.2 });
  for (let k = 0; k < 12; k++) { const x = rp() * W; pine(c, x, midF(x) + 6, 18 + rp() * 12, '#3f4a40', 240 + k); }
  // the big near ridge Parker stands on: narrow crest, steep fluted sides
  const near = [[-20, 600], [-20, 548], [90, 528], [190, 506], [270, 486], [330, 474], [400, 468], [470, 468], [530, 476], [566, 520], [590, 600]];
  const crest = x => { for (let i = 1; i < near.length - 1; i++) if (x <= near[i + 1][0]) { const [a, b] = [near[i], near[i + 1]]; return lerp(a[1], b[1], (x - a[0]) / (b[0] - a[0] || 1)); } return 600; };
  const nearP = tornPiece(c, near, '#c0603f', { amp: 3, seed: 215, rimCol: '#f7b27a', rimA: 1, shadow: 0.28 });
  clipped(c, nearP, () => {
    const rf = rng(216);
    for (let k = 0; k < 70; k++) { const x = rf() * 600 - 10, y = crest(x) + 3 + rf() * 6, w = 2 + rf() * 4; piece(c, poly([[x - w, y], [x + w, y], [x + w * 0.4, 620], [x - w * 1.6, 620]]), rf() < 0.5 ? '#a84f36' : '#d98a5c', { mul: 0.5, scr: 0.1 }); }
    piece(c, ell(240, 640, 420, 80), '#923f30', { mul: 0.5 });
  });
  tornPiece(c, [[700, 600], [730, 520], [760, 500], [800, 506], [860, 530], [920, 540], [920, 600]], '#8e3f33', { amp: 3, seed: 217, rimCol: '#e5905e', shadow: 0.25 });
  pine(c, 790, 504, 34, '#33433a', 250); pine(c, 820, 512, 26, '#33433a', 253); pine(c, 60, 504, 30, '#33433a', 256);
  [[200, 150, 1], [232, 132, 0.8], [262, 160, 0.7], [740, 120, 0.8]].forEach(([x, y, s]) => bird(c, x, y, s));
}
function pcPaiFront(c, W, H, res) {
  pcPai(c, W, H);
  pcParker(c, res, BOX_STAND, 0.78, p => drawStandB(p, { ...lookBackPose(1), pack: true }), 450, 470);
  // a little wooden trail marker
  pp(c, rectP(196, 440, 6, 52), '#7a4a32', 0.25); pp(c, poly([[178, 440], [228, 440], [238, 450], [228, 460], [178, 460]]), '#c98b55', 0.25);
  glow(c, 640, 300, 560, '255,190,130', 0.18);
  vignette(c, W, H, '150,100,150', 0.42, 1.0);
}

// ---- 3. Railay Beach, Krabi: limestone towers, turquoise sea, a long-tail boat ----
function karst(c, pts, seed, col = '#cbbca2') {
  const p = tornPiece(c, pts, col, { amp: 4, seed, rimCol: '#efe4cf', shadow: 0.22 });
  clipped(c, p, () => {
    const r = rng(seed + 1); for (let k = 0; k < 14; k++) { const x = pts[0][0] + r() * (pts[pts.length - 1][0] - pts[0][0] + 200) - 100, y = 40 + r() * 300; piece(c, poly([[x, y], [x + 5, y], [x + 3 + r() * 4, y + 60 + r() * 120], [x - 2, y + 60]]), r() < 0.6 ? '#d9a26e' : '#a8a08a', { mul: 0.4, scr: 0.1 }); }
  });
  return p;
}
function greenery(c, x, y, w, seed) { const r = rng(seed); for (let k = 0; k < 6; k++) tornPiece(c, ellipsePts(x + (r() - 0.5) * w, y + (r() - 0.5) * 10, w * (0.18 + r() * 0.15), 7 + r() * 6, 20), r() < 0.5 ? '#4f9a52' : '#6fb35a', { amp: 2, seed: seed + k, rim: 0, shadow: 0.15 }); }
function longtail(c, x, y, s = 1) {
  c.save(); c.translate(x, y); c.scale(s, s);
  // the long tail: engine and a pole dipping into the water
  pp(c, slab([-70, -6], [-130, 22], 3), '#5a4a42', 0.1); pp(c, rectP(-84, -24, 22, 16), '#6a6a72', 0.2);
  const hull = new Path2D(); hull.moveTo(-72, -12); hull.lineTo(88, -14); hull.quadraticCurveTo(118, -26, 126, -66); hull.quadraticCurveTo(108, -30, 84, 6); hull.quadraticCurveTo(0, 16, -64, 6); hull.closePath();
  pp(c, hull, '#8a5a3a', 0.25); clipped(c, hull, () => { piece(c, rectP(-80, -14, 220, 6), '#c98b55', { mul: 0.4 }); piece(c, rectP(-80, 0, 220, 4), '#6e4228', { mul: 0.4 }); });
  // garlands on the bow
  const cols = ['#f58cbf', '#f7d04a', '#5fae5a', '#e2574a', '#62a0c6'];
  for (let i = 0; i < 9; i++) { const t = i / 8, bx = lerp(110, 124, t), by = lerp(-30, -62, t); piece(c, poly([[bx, by], [bx + 10, by + 6 + i % 2 * 4], [bx + 2, by + 9]]), cols[i % 5], { mul: 0.4 }); }
  pp(c, rectP(-30, -34, 70, 6), '#e8604c', 0.15); pp(c, rectP(-26, -28, 3, 16), '#7a4a32', 0); pp(c, rectP(34, -28, 3, 16), '#7a4a32', 0);
  c.restore();
}
function pcKrabi(c, W, H) {
  skyBands(c, W, ['#58b8e8', '#6cc4ee', '#86d0f0', '#a6dcf2', '#c8eaf2'], 60, 250, 300);
  glow(c, 760, 80, 200, '255,250,220', 0.4);
  [[540, 110, 60, 14], [300, 70, 44, 10], [820, 170, 50, 12]].forEach(([x, y, w, h], i) => { tornPiece(c, ellipsePts(x, y, w, h, 30), '#ffffff', { amp: 2.5, seed: 310 + i, rimCol: '#fff', shadow: 0.08, mul: 0.5 }); tornPiece(c, ellipsePts(x - w * 0.3, y - h * 0.7, w * 0.45, h * 0.9, 24), '#ffffff', { amp: 2, seed: 320 + i, rim: 0, shadow: 0.06, mul: 0.5 }); });
  // sea
  strip(c, -20, W + 20, x => 296 + 1.5 * fbm1(x / 100, 3), H, '#1fa5b4', { seed: 330, rimCol: '#9fe0e6', amp: 1.5, shadow: 0.1 });
  // distant islands and the island karst on the right
  karst(c, [[560, 300], [575, 250], [600, 236], [622, 250], [640, 300]], 340, '#b9c3c0');
  karst(c, [[650, 304], [662, 210], [690, 168], [720, 160], [748, 190], [760, 250], [772, 304]], 342, '#c7bfae'); greenery(c, 712, 170, 70, 344);
  strip(c, -20, W + 20, x => 324 + 2 * fbm1(x / 90, 4), H, '#33bdbc', { seed: 331, rimCol: '#b7ece8', amp: 2, shadow: 0.1 });
  strip(c, -20, W + 20, x => 360 + 3 * fbm1(x / 80, 5), H, '#5fd0c4', { seed: 332, rimCol: '#d2f6ee', amp: 2, shadow: 0.1 });
  wavyGlints(c, 430, 316, 4, 90, 333, '#ffffff', '#e6fbf6');
  // the great limestone tower on the left, with green ledges
  karst(c, [[-20, 440], [-20, 40], [40, 20], [110, 36], [150, 80], [176, 160], [168, 230], [196, 300], [214, 380], [236, 440]], 350);
  greenery(c, 60, 32, 110, 352); greenery(c, 160, 150, 50, 354); greenery(c, 186, 290, 46, 356);
  for (const [x, y] of [[132, 96], [150, 104], [176, 244]]) tornPiece(c, [[x, y], [x + 4, y], [x + 2, y + 34]], '#a8a08a', { amp: 0.6, seed: x, rim: 0, shadow: 0.1 });   // stalactites
  longtail(c, 600, 404, 1.3);
  // beach
  strip(c, -20, W + 20, x => 418 + 5 * Math.sin(x / 90) + 2 * fbm1(x / 40, 6), H, '#ffffff', { seed: 360, rim: 0, shadow: 0.08, amp: 2.5 });
  strip(c, -20, W + 20, x => 426 + 5 * Math.sin(x / 90) + 2 * fbm1(x / 40, 7), H, '#ead39e', { seed: 361, rimCol: '#fff6dc', shadow: 0.14 });
  strip(c, -20, W + 20, x => 446 + 4 * fbm1(x / 120, 8), H, '#f6e4b8', { seed: 362, rimCol: '#fffaf0', shadow: 0.16 });
  const rs = rng(363); for (let k = 0; k < 40; k++) piece(c, ell(rs() * W, 470 + rs() * 120, 1.5 + rs() * 2.5, 1 + rs()), rs() < 0.5 ? '#e0c890' : '#fffaf0', { mul: 0.3 });
}
function starfish(c, x, y, r, rot) { pp(c, poly([...Array(10)].map((_, i) => [x + Math.cos(rot + i * Math.PI / 5) * (i % 2 ? r * 0.42 : r), y + Math.sin(rot + i * Math.PI / 5) * (i % 2 ? r * 0.42 : r) * 0.75])), '#f08a4a', 0.2); }
function crab(c, x, y, s) {
  c.save(); c.translate(x, y); c.scale(s, s);
  for (const d of [-1, 1]) for (let i = 0; i < 3; i++) pp(c, slab([d * 8, -4 + i * 3], [d * (18 + i * 2), 4 + i * 3], 2.4), '#e2603c', 0.1);
  for (const d of [-1, 1]) { pp(c, slab([d * 10, -8], [d * 18, -18], 3), '#e2603c', 0.1); pp(c, ell(d * 20, -22, 6, 5, d * 0.4), '#ec6f48', 0.15); }
  pp(c, ell(0, -6, 14, 9), '#ec6f48', 0.2);
  for (const d of [-1, 1]) { pp(c, slab([d * 4, -12], [d * 5, -19], 1.6), '#e2603c', 0); c.fillStyle = PK.eye; c.beginPath(); c.arc(d * 5, -20, 2, 0, TAU); c.fill(); }
  blush(c, [[-7, -5], [7, -5]], 2.4, 0.5); c.restore();
}
function pcKrabiFront(c, W, H, res) {
  pcKrabi(c, W, H);
  // a little sandcastle, a starfish and a coconut to drink
  pp(c, rectP(222, 520, 46, 34), '#e6cc92', 0.25); pp(c, rectP(232, 500, 26, 22), '#e6cc92', 0.2); for (const x of [222, 238, 254]) pp(c, rectP(x, 514, 8, 8), '#e6cc92', 0.1);
  pp(c, slab([245, 500], [245, 482], 1.5), '#7a4a32', 0); pp(c, poly([[246, 482], [258, 486], [246, 490]]), '#e2574a', 0.1);
  starfish(c, 160, 566, 16, 0.3);
  pcParker(c, res, BOX_BOW, 0.8, p => drawPlayBowB(p, 'pant', { pack: true, wag: 0.25 }), 400, 566);
  crab(c, 560, 556, 1.2);
  c.save(); c.translate(690, 572); drawSouvenir(c, 'floatingmarket', 1.3); c.restore();
  // palm fronds framing the top right
  for (const [a, L] of [[2.3, 170], [2.7, 150], [1.9, 140], [3.0, 120]]) leaf(c, 930, -20, L, 26, a, '#3f8f4a');
  for (const [a, L] of [[2.5, 120], [2.1, 110]]) leaf(c, 930, -20, L, 18, a, '#5fae5a');
  glow(c, 760, 80, 500, '255,250,220', 0.12);
  vignette(c, W, H, '150,180,190', 0.45, 1.05);
}

// ---- 4. Damnoen Saduak floating market, Bangkok: looking down a narrow canal packed with boats ----
// one-point perspective: lateral X (-1 left bank … +1 right bank), depth s (small = far, 1 = bottom edge)
const MK = { vx: 450, vy: 196, half: 330, drop: 404 };
const mkP = (X, s) => [MK.vx + X * MK.half * s, MK.vy + MK.drop * s];
function fruitPile(c, x, y, w, seed, k = 1) {
  const r = rng(seed);
  for (let n = 0; n < 16; n++) {
    const fx = x + (r() - 0.5) * w, fy = y - r() * 12 * k, t = r();
    if (t < 0.3) pp(c, ell(fx, fy, 7 * k, 5 * k, r()), '#f7c234', 0.15);
    else if (t < 0.5) { pp(c, circ(fx, fy, 5 * k), '#e0463c', 0.15); c.save(); c.strokeStyle = '#5fae5a'; c.lineWidth = Math.max(0.6, k); for (let i = 0; i < 6; i++) { const a = i * 1.05; c.beginPath(); c.moveTo(fx + Math.cos(a) * 5 * k, fy + Math.sin(a) * 5 * k); c.lineTo(fx + Math.cos(a) * 7.5 * k, fy + Math.sin(a) * 7.5 * k); c.stroke(); } c.restore(); }
    else if (t < 0.65) pp(c, ell(fx, fy, 8 * k, 6 * k), '#e45a9a', 0.15);
    else if (t < 0.8) pp(c, circ(fx, fy, 8 * k), '#7fb25a', 0.15);
    else for (let i = 0; i < 4; i++) pp(c, ell(fx + i * 3 * k, fy - Math.abs(i - 1.5) * 2 * k, 3 * k, 9 * k, 0.5), '#f7d04a', 0.1);
  }
}
function strawHat(c, x, y, s = 1) { pp(c, poly([[x - 22 * s, y], [x, y - 14 * s], [x + 22 * s, y]]), '#ecd08e', 0.25); piece(c, slab([x - 18 * s, y - 2 * s], [x + 18 * s, y - 2 * s], 2 * s), '#d4b46a', { mul: 0.4 }); }
// a vendor: indigo farmer's shirt and a conical hat that hides the face (no features, just shapes)
function vendor(c, x, y, k, paddle = 1) {
  if (paddle) pp(c, slab([x + 4 * k * paddle, y - 20 * k], [x + 26 * k * paddle, y + 14 * k], 3 * k), '#8a5a3a', 0.15);
  pp(c, poly([[x - 11 * k, y], [x - 8 * k, y - 22 * k], [x + 8 * k, y - 22 * k], [x + 11 * k, y]]), '#33507e', 0.2);
  pp(c, circ(x, y - 25 * k, 5 * k), '#c98b62', 0.1);
  strawHat(c, x, y - 26 * k, 0.9 * k);
}
// a sampan lying along the canal, from depth s0 (far) to s1 (near) at lateral X
function sampan(c, X, s0, s1, seed, o = {}) {
  const w = 0.1, a = mkP(X, s0), b = mkP(X, s1), l0 = mkP(X - w, s0 + 0.04), r0 = mkP(X + w, s0 + 0.04), l1 = mkP(X - w, s1 - 0.03), r1 = mkP(X + w, s1 - 0.03);
  const k = (s0 + s1) / 2, hull = poly([a, r0, r1, b, l1, l0]);
  pp(c, hull, '#6e4228', 0.25);
  pp(c, poly([mkP(X, s0 + 0.03), mkP(X + w * 0.7, s0 + 0.07), mkP(X + w * 0.7, s1 - 0.05), mkP(X, s1 - 0.02), mkP(X - w * 0.7, s1 - 0.05), mkP(X - w * 0.7, s0 + 0.07)]), '#9a6440', 0.05);
  const m = mkP(X, k);
  if (o.fruit !== false) fruitPile(c, m[0], m[1], 40 * k, seed, k * 1.1);
  if (o.pot) { pp(c, rectP(m[0] - 9 * k, m[1] - 16 * k, 18 * k, 14 * k), '#9aa6ad', 0.15); c.save(); c.strokeStyle = 'rgba(255,255,255,0.75)'; c.lineWidth = 1.6 * k; c.lineCap = 'round'; for (const dx of [-4, 3]) { c.beginPath(); c.moveTo(m[0] + dx * k, m[1] - 18 * k); c.quadraticCurveTo(m[0] + (dx - 5) * k, m[1] - 28 * k, m[0] + dx * k, m[1] - 36 * k); c.stroke(); } c.restore(); }
  if (o.umbrella) { const [ux, uy] = mkP(X, s1 - 0.04), R = 46 * k; pp(c, slab([ux, uy - 4 * k], [ux, uy - 50 * k], 2 * k), '#6e4a3a', 0.1); const u = new Path2D(); u.moveTo(ux - R, uy - 44 * k); u.quadraticCurveTo(ux, uy - 84 * k, ux + R, uy - 44 * k); u.closePath(); pp(c, u, o.umbrella, 0.25); clipped(c, u, () => { for (let i = -2; i <= 2; i += 2) piece(c, poly([[ux, uy - 76 * k], [ux + i * R * 0.38 - 6 * k, uy - 42 * k], [ux + i * R * 0.38 + 6 * k, uy - 42 * k]]), '#fff6e6', { mul: 0.3 }); }); }
  if (o.vendor) { const [vx, vy] = mkP(X, s1 - 0.05); vendor(c, vx, vy, k * 1.7, X < 0 ? 1 : -1); }
}
// a row of stilt shophouses along one bank, receding to the vanishing point
function bank(c, X, seed) {
  const r = rng(seed), d = Math.sign(X), segs = [0.07, 0.11, 0.16, 0.23, 0.33, 0.47, 0.66, 0.92, 1.3, 1.8];
  const walls = ['#b57a4e', '#c9935f', '#5aa7b6', '#d9a86a', '#a8673f', '#e0c08a'], roofs = ['#8fb0c0', '#d9573f', '#8fb0c0', '#c9783f'];
  for (let i = 0; i < segs.length - 1; i++) {
    const s0 = segs[i], s1 = segs[i + 1], Hh = 250 + r() * 50;
    const b0 = mkP(X, s0), b1 = mkP(X, s1), t0 = [b0[0], b0[1] - Hh * s0], t1 = [b1[0], b1[1] - Hh * s1];
    const wall = walls[(i + seed) % walls.length], face = poly([b0, b1, t1, t0]);
    pp(c, face, wall, 0.2);
    clipped(c, face, () => {
      for (let k = 1; k < 9; k++) { const u = k / 9; piece(c, poly([[b0[0], lerp(b0[1], t0[1], u)], [b1[0], lerp(b1[1], t1[1], u)], [b1[0], lerp(b1[1], t1[1], u) + 2 * s1], [b0[0], lerp(b0[1], t0[1], u) + 2 * s0]]), shade(wall, 0.86), { mul: 0.4 }); }
      // open shopfront at water level, with goods hanging in it
      const o0 = [b0[0], b0[1] - Hh * s0 * 0.12], o1 = [b1[0], b1[1] - Hh * s1 * 0.12], q0 = [b0[0], b0[1] - Hh * s0 * 0.55], q1 = [b1[0], b1[1] - Hh * s1 * 0.55];
      pp(c, poly([o0, o1, q1, q0]), '#3e2820', 0.05);
      for (let k = 0; k < 6; k++) { const u = (k + 0.5) / 6, x = lerp(q0[0], q1[0], u), y = lerp(q0[1], q1[1], u), sz = lerp(s0, s1, u); pp(c, rectP(x - 5 * sz, y, 10 * sz, (14 + r() * 26) * sz), ['#f7d04a', '#e2574a', '#5fae5a', '#62a0c6', '#f58cbf', '#f39a4a'][(k + i) % 6], 0.1); }
      // a sign board
      const g0 = [b0[0], b0[1] - Hh * s0 * 0.68], g1 = [b1[0], b1[1] - Hh * s1 * 0.68];
      pp(c, poly([lerp2(g0, g1, 0.2), lerp2(g0, g1, 0.8), [lerp2(g0, g1, 0.8)[0], lerp2(g0, g1, 0.8)[1] - 22 * lerp(s0, s1, 0.8)], [lerp2(g0, g1, 0.2)[0], lerp2(g0, g1, 0.2)[1] - 22 * lerp(s0, s1, 0.2)]]), ['#f5c04a', '#e2574a', '#fff1dc'][(i + seed) % 3], 0.15);
    });
    // overhanging roof
    const ro = 34;
    tornPiece(c, [[t0[0], t0[1] + 6 * s0], [t1[0], t1[1] + 6 * s1], [t1[0] - d * ro * s1, t1[1] - 26 * s1], [t0[0] - d * ro * s0, t0[1] - 26 * s0]], roofs[(i + seed) % roofs.length], { amp: 0.8, seed: seed * 10 + i, rim: 0, shadow: 0.25 });
    // stilts in the water
    for (const u of [0.15, 0.55, 0.9]) { const s = lerp(s0, s1, u), [x, y] = mkP(X, s); pp(c, rectP(x - 2.5 * s, y, 5 * s, 26 * s), '#4a3028', 0.1); }
  }
}
const lerp2 = (a, b, u) => [lerp(a[0], b[0], u), lerp(a[1], b[1], u)];
function pcMarket(c, W, H) {
  skyBands(c, W, ['#86cbe8', '#9ed6ec', '#c4e6ee', '#eef0dc'], 40, 150, 400);
  strip(c, -20, W + 20, x => 178 - 14 * Math.abs(Math.sin(x / 37)) - 6 * fbm1(x / 20, 2), H, '#7fae7a', { seed: 404, rimCol: '#c3dfb4', shadow: 0.1 });
  const rt = rng(406); for (let k = 0; k < 16; k++) { const x = rt() * W, h = 50 + rt() * 50, a = (rt() - 0.5) * 0.4; pp(c, slab([x, 200], [x + a * 30, 200 - h], 4), '#7a6a52', 0.1); for (let i = 0; i < 5; i++) leaf(c, x + a * 30, 200 - h, 34, 7, -Math.PI / 2 + (i - 2) * 0.6, i % 2 ? '#4f8f5a' : '#649f62'); }
  for (let k = 0; k < 7; k++) tornPiece(c, ellipsePts(330 + k * 40, 198, 40, 24, 24), k % 2 ? '#4f9a52' : '#5fae5a', { amp: 2.5, seed: 405 + k, rimCol: '#a6d8a0', shadow: 0.1 });
  for (const [x, a] of [[60, -0.4], [860, 0.4]]) { pp(c, slab([x, 210], [x + a * 40, 70], 7), '#8a6a4a', 0.2); for (let i = 0; i < 6; i++) leaf(c, x + a * 40, 70, 70, 13, -Math.PI / 2 + (i - 2.5) * 0.55, i % 2 ? '#3f8f4a' : '#5fae5a'); }
  // canal water
  const water = poly([mkP(-1, 0.06), mkP(1, 0.06), mkP(1, 1.5), mkP(-1, 1.5)]);
  pp(c, water, '#5f9a7e', 0);
  clipped(c, water, () => { const rr = rng(431); for (let k = 0; k < 40; k++) { const s = 0.1 + rr() * 1.3, X = (rr() - 0.5) * 1.8, [x, y] = mkP(X, s); piece(c, rectP(x, y, (20 + rr() * 40) * s, 2.2 * s), rr() < 0.5 ? '#86b9a0' : '#4c8569', { mul: 0.3 }); } glow(c, MK.vx, MK.vy + 30, 160, '255,250,220', 0.35); });
  bank(c, -1, 3); bank(c, 1, 6);
  // boats crowding the canal, far to near
  const boats = [[-0.6, 0.08, 0.13, { vendor: 1 }], [0.55, 0.08, 0.13, {}], [-0.1, 0.09, 0.14, { vendor: 1 }], [0.25, 0.1, 0.16, { umbrella: '#f58cbf' }],
    [-0.55, 0.12, 0.19, { vendor: 1 }], [0.55, 0.13, 0.2, { vendor: 1 }], [0.05, 0.14, 0.22, { umbrella: '#e8604c', vendor: 1 }], [-0.3, 0.17, 0.26, {}],
    [-0.65, 0.2, 0.3, { vendor: 1 }], [0.62, 0.21, 0.32, { pot: 1, vendor: 1 }], [0.3, 0.25, 0.37, { vendor: 1 }], [-0.18, 0.28, 0.42, { umbrella: '#f5c04a', vendor: 1 }],
    [-0.66, 0.36, 0.52, { vendor: 1, umbrella: '#5aa7b6' }], [0.66, 0.38, 0.55, { vendor: 1 }], [0.2, 0.46, 0.66, { pot: 1, vendor: 1 }], [-0.4, 0.54, 0.76, { vendor: 1 }], [0.6, 0.6, 0.84, { umbrella: '#e8604c' }]];
  boats.forEach(([X, a, b, o], i) => sampan(c, X, a, b, 440 + i, o));
}
function pcMarketFront(c, W, H, res) {
  pcMarket(c, W, H);
  // Parker in the front boat, wearing a borrowed straw hat
  const bx = 470, by = 560;
  fruitPile(c, bx - 120, by - 14, 120, 450); fruitPile(c, bx + 110, by - 14, 100, 451);
  pcParker(c, res, BOX_SIT, 0.78, p => drawSitB(p, 'happy', 0.2, { pack: true }), bx - 10, by + 6);
  strawHat(c, bx + 16, by - 158, 1.15);
  const hull = new Path2D(); hull.moveTo(bx - 230, by - 40); hull.quadraticCurveTo(bx - 214, by - 18, bx - 196, by + 4); hull.lineTo(bx + 196, by + 4); hull.quadraticCurveTo(bx + 214, by - 18, bx + 230, by - 40); hull.lineTo(bx + 206, by - 30); hull.lineTo(bx - 206, by - 30); hull.closePath();
  pp(c, hull, '#7a4a30', 0.3); clipped(c, hull, () => { piece(c, rectP(bx - 240, by - 32, 480, 6), '#b07a4e', { mul: 0.4 }); piece(c, rectP(bx - 240, by - 8, 480, 4), '#5e3622', { mul: 0.4 }); });
  pp(c, slab([bx + 240, by - 60], [bx + 300, by + 20], 6), '#8a5a3a', 0.25);
  strip(c, -20, W + 20, x => 576 + 3 * Math.sin(x / 40), H, '#5f9a7e', { seed: 452, rimCol: '#c4e6d2', amp: 1.5, shadow: 0.15 });
  vignette(c, W, H, '170,140,120', 0.45, 1.05);
}

// ---- 5. Doi Inthanon at dawn: a sea of clouds, the twin royal pagodas on the ridge ----
function cloudBank(c, y, col, seed, amp = 14) { strip(c, -40, 940, x => y - amp * Math.abs(Math.sin(x / 46 + seed)) - amp * 0.5 * Math.abs(Math.sin(x / 19 + seed * 2)), 700, col, { seed, rimCol: '#ffffff', rimA: 0.9, shadow: 0.12, amp: 1.5, mul: 0.5 }); }
function tieredPagoda(c, x, by, s, col, colL) {
  c.save(); c.translate(x, by); c.scale(s, s);
  pp(c, rectP(-40, -18, 80, 18), '#efe6f2', 0.25); pp(c, rectP(-34, -30, 68, 12), '#e4d8ea', 0.2);
  for (let i = 0; i < 6; i++) {            // flared tiers, narrowing upward
    const w = 34 - i * 4.6, y = -30 - i * 15;
    pp(c, poly([[-w - 6, y], [-w + 2, y - 12], [w - 2, y - 12], [w + 6, y]]), i % 2 ? colL : col, 0.2);
    piece(c, rectP(-w - 6, y - 1, (w + 6) * 2, 2), ARCH.gold, { mul: 0.4 });
  }
  pp(c, poly([[0, -150], [-4, -118], [4, -118]]), ARCH.gold, 0.15); glow(c, 0, -140, 30, '255,220,150', 0.5);
  c.restore();
}
function pcInthanon(c, W, H) {
  skyBands(c, W, ['#36468a', '#53579c', '#8a6aaa', '#c88aae', '#f2ae98', '#fcd49c'], 60, 270, 500);
  for (const [x, y] of [[90, 60], [180, 34], [320, 80], [760, 50], [850, 96]]) { c.fillStyle = 'rgba(255,246,214,0.8)'; c.beginPath(); c.arc(x, y, 1.6, 0, TAU); c.fill(); }
  glow(c, 290, 300, 340, '255,206,150', 0.6);
  tornPiece(c, ellipsePts(290, 300, 46, 46, 56), '#ffd98a', { amp: 1.5, seed: 9, shadow: 0, rimCol: '#fff3cc' });
  strip(c, -20, W + 20, x => 300 - 40 * Math.exp(-(((x - 120) / 90) ** 2)) - 30 * Math.exp(-(((x - 820) / 110) ** 2)), H, '#6c5f96', { seed: 510, rimCol: '#b3a3d0', shadow: 0.12 });
  cloudBank(c, 330, '#f8dfe2', 511);
  // the ridge with the two pagodas, rising out of the clouds
  const ridge = [[480, 420], [520, 330], [590, 300], [700, 290], [790, 300], [860, 330], [920, 360], [920, 420]];
  tornPiece(c, ridge, '#4f5a7a', { amp: 3, seed: 512, rimCol: '#f3b39a', rimA: 0.9, shadow: 0.2 });
  const rt = rng(513); for (let k = 0; k < 10; k++) { const x = 520 + rt() * 380; pine(c, x, 312 + Math.abs(x - 700) * 0.18 + 6, 16 + rt() * 8, '#3c4766', 520 + k); }
  tieredPagoda(c, 650, 300, 0.92, '#9a6e8c', '#b38aa6');
  tieredPagoda(c, 768, 302, 0.86, '#a58fc4', '#c2aed8');
  cloudBank(c, 372, '#fbe9ec', 514, 16);
  cloudBank(c, 420, '#ffffff', 515, 18);
  // puffy cumulus mounds in the near clouds
  const cumulus = (x, y, w, col, seed) => { const r = rng(seed), p = new Path2D(); p.addPath(ell(x, y, w * 0.5, w * 0.12)); for (let i = 0; i < 6; i++) p.addPath(circ(x - w * 0.4 + i * w * 0.16, y - w * (0.06 + 0.1 * Math.sin(Math.PI * i / 5)) + r() * 4, w * (0.1 + 0.06 * Math.sin(Math.PI * i / 5)))); pp(c, p, col, 0.12, { mul: 0.35, scr: 0.2 }); };
  cumulus(560, 470, 150, '#fff6f6', 560); cumulus(860, 480, 190, '#fdecee', 561); cumulus(700, 545, 230, '#ffffff', 562); cumulus(520, 590, 200, '#fdf3f4', 563);
  // golden light on the cloud tops near the sun
  c.save(); c.globalCompositeOperation = 'screen'; glow(c, 290, 360, 260, '255,200,140', 0.35); c.restore();
}
function rhodo(c, x, y, s, seed) { const r = rng(seed); for (let k = 0; k < 4; k++) leaf(c, x, y + 6 * s, 20 * s, 6 * s, -Math.PI / 2 + (k - 1.5) * 0.7, '#4f8a52'); for (let k = 0; k < 6; k++) pp(c, circ(x + (r() - 0.5) * 16 * s, y + (r() - 0.6) * 12 * s, 5 * s), r() < 0.5 ? '#e0463c' : '#f0686a', 0.15); }
function pcInthanonFront(c, W, H, res) {
  pcInthanon(c, W, H);
  // the viewpoint rock in the foreground, with rhododendrons
  const rock = [[-20, 600], [-20, 470], [60, 450], [170, 440], [300, 452], [380, 486], [420, 540], [440, 600]];
  const rp = tornPiece(c, rock, '#5e5a74', { amp: 3, seed: 530, rimCol: '#f3b39a', rimA: 0.9, shadow: 0.3 });
  clipped(c, rp, () => { piece(c, rectP(-20, 500, 480, 100), '#4c4862', { mul: 0.5 }); const r = rng(531); for (let k = 0; k < 8; k++) tornPiece(c, ellipsePts(r() * 420, 450 + r() * 20, 22 + r() * 18, 6, 18), '#6f8a5a', { amp: 2, seed: 532 + k, rim: 0, shadow: 0.1 }); });
  rhodo(c, 40, 452, 1.2, 540); rhodo(c, 352, 470, 1, 541);
  pcParker(c, res, BOX_BACK, 0.74, p => drawBackSitB(p, { pack: true }), 290, 456);
  // a thermos cup, steaming
  pp(c, rectP(372, 438, 20, 26), '#62a0c6', 0.25); pp(c, ell(382, 438, 10, 3), '#e9f1fb', 0);
  c.save(); c.strokeStyle = 'rgba(255,255,255,0.7)'; c.lineWidth = 2; c.lineCap = 'round'; for (const dx of [-3, 4]) { c.beginPath(); c.moveTo(382 + dx, 432); c.quadraticCurveTo(376 + dx, 422, 384 + dx, 414); c.quadraticCurveTo(390 + dx, 406, 382 + dx, 398); c.stroke(); } c.restore();
  glow(c, 290, 300, 120, '255,220,170', 0.35);
  vignette(c, W, H, '120,100,150', 0.42, 1.0);
}

// ---- 6. Mt Fuji over Lake Kawaguchi: snow-capped cone, its reflection, cherry blossoms, a swan boat ----
function fujiShape(c, cx, by, w, h, mirror = false) {
  const s = mirror ? -1 : 1, top = by - s * h;
  const cone = poly([[cx - w, by], [cx - w * 0.16, top + s * 6], [cx - w * 0.06, top], [cx + w * 0.06, top], [cx + w * 0.16, top + s * 6], [cx + w, by]]);
  pp(c, cone, '#5a7fc0', mirror ? 0 : 0.2);
  clipped(c, cone, () => {
    piece(c, poly([[cx, top], [cx + w, by], [cx + w * 0.2, by]]), '#4a6cab', { mul: 0.4 });            // shadow side
    const snow = []; for (let i = 0; i <= 12; i++) { const u = i / 12, x = cx - w * 0.5 + u * w, d = (i % 2 ? 14 : 30) + Math.sin(i * 1.7) * 6; snow.push([x, top + s * (h * 0.32 + d * 0.6)]); }
    piece(c, poly([[cx - w * 0.6, top - s * 10], [cx + w * 0.6, top - s * 10], ...snow.reverse()]), '#fbfbff', { mul: 0.25, scr: 0.2 });
    piece(c, poly([[cx, top], [cx + w * 0.6, top + s * h * 0.5], [cx + w * 0.2, top + s * h * 0.5]]), '#dfe6f6', { mul: 0.2 });
  });
}
function blossoms(c, x0, y0, x1, y1, seed, n = 40) {
  pp(c, slab([x0, y0], [x1, y1], 9), '#5a3a3a', 0.25);
  const r = rng(seed);
  for (let k = 0; k < n; k++) { const u = r(), x = lerp(x0, x1, u) + (r() - 0.5) * 60, y = lerp(y0, y1, u) + (r() - 0.3) * 40; flower(c, x, y, 6 + r() * 4, r() < 0.6 ? '#f9c6d6' : '#f6a8c0', seed + k, false); }
}
function pcFuji(c, W, H) {
  skyBands(c, W, ['#9fd0f0', '#b4daf2', '#cfe4f2', '#f2e2ea', '#fbd9d6'], 60, 260, 600);
  glow(c, 760, 200, 200, '255,236,220', 0.4);
  fujiShape(c, 450, 318, 330, 236);
  strip(c, -20, W + 20, x => 318 - 18 * Math.max(0, fbm1(x / 90, 2) + 0.4), H, '#3f6f78', { seed: 601, rimCol: '#8fb8b8', shadow: 0.15 });
  // the lake, with Fuji upside down in it
  const lake = rectP(-20, 326, W + 40, 300); pp(c, lake, '#86bfe0', 0);
  clipped(c, lake, () => { c.save(); c.globalAlpha = 0.45; fujiShape(c, 450, 330, 330, 200, true); c.restore(); const r = rng(602); for (let k = 0; k < 30; k++) piece(c, rectP(r() * W, 334 + r() * 140, 20 + r() * 50, 2), '#d8ecf6', { mul: 0.2 }); });
  pp(c, rectP(-20, 324, W + 40, 5), '#3f6f78', 0);
  // swan paddle boat
  pp(c, ell(240, 420, 34, 12), '#ffffff', 0.25); pp(c, slab([264, 416], [272, 386], 7), '#ffffff', 0.15); pp(c, circ(270, 384, 7), '#ffffff', 0.15);
  pp(c, poly([[276, 382], [288, 386], [276, 388]]), '#f0a33c', 0.1); pp(c, ell(230, 410, 16, 8), '#f9c6d6', 0.1);
  // near shore: grass and a little wooden pier
  strip(c, -20, W + 20, x => 486 + 6 * fbm1(x / 80, 4), H, '#8cc06a', { seed: 604, rimCol: '#d6eab8', shadow: 0.2 });
  const rg = rng(605); for (let k = 0; k < 20; k++) tuft(c, rg() * W, 500 + rg() * 90, 14 + rg() * 10, rg() < 0.5 ? '#6fae55' : '#7dba60', 610 + k);
}
function pcFujiFront(c, W, H, res) {
  pcFuji(c, W, H);
  pp(c, poly([[520, 600], [560, 470], [740, 470], [760, 600]]), '#c98b55', 0.3);
  for (let k = 0; k < 7; k++) piece(c, poly([[lerp(560, 740, k / 7), 470], [lerp(560, 740, (k + 0.06) / 7), 470], [lerp(520, 760, (k + 0.06) / 7), 600], [lerp(520, 760, k / 7), 600]]), '#a8703f', { mul: 0.4 });
  pcParker(c, res, BOX_LIE, 0.8, p => drawLieB(p, 'calm', { headRot: -0.04 }), 620, 548);
  c.save(); c.translate(620 + 97 * 0.8, 548 - 52 * 0.8); c.rotate(0.5); pp(c, ell(0, 0, 6, 3.4), '#f9c6d6', 0.15); c.restore();
  blossoms(c, -20, 30, 260, 130, 620, 70); blossoms(c, 60, -10, 140, 90, 650, 24); blossoms(c, 920, 10, 720, 100, 680, 60);
  const rp = rng(690); for (let k = 0; k < 14; k++) piece(c, ell(rp() * W, 120 + rp() * 460, 3.5, 2, rp() * 3), '#f9c6d6', { mul: 0.3 });
  vignette(c, W, H, '170,170,200', 0.45, 1.05);
}

// ---- 7. Fushimi Inari, Kyoto: a tunnel of vermilion torii, fox guardians with red bibs ----
function pcFushimi(c, W, H) {
  piece(c, rectP(0, 0, W, H), '#3f5a3a', { scr: 0.2 });
  for (let k = 0; k < 12; k++) tornPiece(c, ellipsePts(k * 80, 40 + (k % 3) * 30, 90, 70, 30), k % 2 ? '#4f7a46' : '#5f8a50', { amp: 4, seed: 700 + k, rimCol: '#9fc48a', rimA: 0.6, shadow: 0.15 });
  // the path bends to the right, so the far gates turn away instead of meeting in one point
  const vy = 300, cxs = s => 430 + 230 * Math.pow(1 - Math.min(s, 1), 2.2), P = (X, s) => [cxs(s) + X * 300 * s, vy + 300 * s];
  glow(c, cxs(0.15) + 40, vy - 30, 200, '255,236,180', 0.85);
  const ground = []; for (let i = 0; i <= 20; i++) ground.push(P(-1, 0.12 + i * 0.07)); for (let i = 20; i >= 0; i--) ground.push(P(1, 0.12 + i * 0.07));
  pp(c, poly(ground), '#d9c7a4', 0);
  clipped(c, poly(ground), () => { for (let s = 0.2; s < 1.6; s *= 1.16) { const [a, y] = P(-1.2, s), [b] = P(1.2, s); piece(c, rectP(a, y, b - a, 3 * s), '#b8a682', { mul: 0.4 }); piece(c, rectP(a, y + 3 * s, b - a, 2 * s), '#efe2c4', { mul: 0.3 }); } });
  const r = rng(707), ss = []; for (let s = 0.16; s < 1.75; s *= 1.1 + r() * 0.1) ss.push(s);
  ss.forEach((s, i) => {
    if (i % 5 === 3) return;                                     // a gap now and then: forest and light show through
    const [lx, ly] = P(-1, s), [rx] = P(1, s), h = 330 * s, w = 18 * s, t = clamp((s - 0.16) / 0.7);
    const red = ['#e0412e', '#e85a3a', '#d8392a'][i % 3], top = ly - h;
    for (const x of [lx, rx]) { pp(c, rectP(x - w / 2, top, w, h), red, 0.25); pp(c, rectP(x - w / 2, ly - h * 0.12, w, h * 0.12), '#2f2a2e', 0); }
    pp(c, rectP(lx - w * 0.6, top + h * 0.1, rx - lx + w * 1.2, h * 0.05), red, 0.15);
    const mid = (lx + rx) / 2, kas = new Path2D(); kas.moveTo(lx - w * 1.6, top - h * 0.02); kas.quadraticCurveTo(mid, top + h * 0.03, rx + w * 1.6, top - h * 0.02); kas.lineTo(rx + w * 1.4, top + h * 0.05); kas.quadraticCurveTo(mid, top + h * 0.08, lx - w * 1.4, top + h * 0.05); kas.closePath();
    pp(c, kas, '#2f2a2e', 0.2);
    if (s > 0.3 && s < 1.3 && r() < 0.6) { c.save(); c.fillStyle = 'rgba(40,30,30,0.55)'; for (let k = 0; k < 3; k++) c.fillRect(lx - w * 0.3, top + h * (0.3 + k * 0.06), w * 0.6, h * 0.025); c.restore(); }
    if (t < 0.6) { c.save(); c.globalAlpha = 0.35 * (1 - t / 0.6); c.globalCompositeOperation = 'screen'; c.fillStyle = '#ffe6b0'; c.fillRect(lx - w * 2, top - h * 0.05, rx - lx + w * 4, h * 1.05); c.restore(); }   // haze toward the light
  });
  c.save(); c.globalCompositeOperation = 'screen'; for (const [x, y] of [[300, 430], [560, 470], [420, 540]]) glow(c, x, y, 50, '255,230,170', 0.35); c.restore();
}
// a big torii right in front of us, cut off by the frame, to break the symmetry
function bigTorii(c) {
  pp(c, rectP(18, 40, 46, 560), '#d8392a', 0.35); pp(c, rectP(18, 540, 46, 60), '#2f2a2e', 0.1);
  piece(c, rectP(18, 40, 12, 560), '#ef6a4a', { mul: 0.4 });
  pp(c, rectP(-20, 84, 380, 26), '#d8392a', 0.3);                               // nuki
  const k = new Path2D(); k.moveTo(-20, 18); k.quadraticCurveTo(200, 34, 420, 4); k.lineTo(416, 30); k.quadraticCurveTo(200, 58, -20, 46); k.closePath();
  pp(c, k, '#2f2a2e', 0.35);
  pp(c, rectP(150, 50, 70, 34), '#2f2a2e', 0.2); pp(c, rectP(156, 55, 58, 24), '#d8392a', 0); pp(c, rectP(160, 59, 50, 16), '#f3d38a', 0);   // the plaque
}
function kitsune(c, x, y, s, flip) {
  c.save(); c.translate(x, y); c.scale(flip ? -s : s, s);
  pp(c, rectP(-30, -20, 60, 20), '#9a9a94', 0.3); pp(c, rectP(-26, -24, 52, 6), '#b0b0aa', 0.1);
  pp(c, ell(0, -56, 18, 32), '#d8d4c8', 0.25); pp(c, ell(-14, -40, 10, 18, 0.4), '#d8d4c8', 0.15);
  pp(c, circ(2, -96, 15), '#d8d4c8', 0.2); pp(c, poly([[-8, -106], [-4, -128], [4, -108]]), '#d8d4c8', 0.1); pp(c, poly([[6, -106], [14, -126], [14, -102]]), '#d8d4c8', 0.1);
  pp(c, poly([[10, -98], [30, -92], [12, -88]]), '#d8d4c8', 0.1);
  pp(c, poly([[-14, -80], [18, -80], [2, -58]]), '#e0412e', 0.2);                                         // the red bib
  pp(c, limb([16, -44], [34, -94], 12, 16), '#d8d4c8', 0.2);                                              // tail
  c.fillStyle = '#5a5a56'; c.beginPath(); c.arc(8, -98, 1.6, 0, TAU); c.fill();
  c.restore();
}
function stoneLantern(c, x, y, s) {
  c.save(); c.translate(x, y); c.scale(s, s);
  pp(c, rectP(-14, -10, 28, 10), '#9a9a94', 0.3); pp(c, rectP(-5, -50, 10, 40), '#a8a8a2', 0.2); pp(c, rectP(-16, -64, 32, 14), '#b0b0aa', 0.2);
  pp(c, rectP(-10, -80, 20, 16), '#a8a8a2', 0.15); glow(c, 0, -72, 20, '255,220,150', 0.5); pp(c, rectP(-6, -78, 12, 10), '#ffe2a0', 0);
  pp(c, poly([[-22, -80], [0, -96], [22, -80]]), '#9a9a94', 0.2); c.restore();
}
function pcFushimiFront(c, W, H, res) {
  pcFushimi(c, W, H);
  stoneLantern(c, 820, 600, 1.4);
  kitsune(c, 230, 590, 1.15, false);
  pcParker(c, res, BOX_STAND, 0.8, p => drawStandB(p, { ...sniffPose(0), head: { view: 'side', dx: 6, dy: 14, rot: 0.2 }, pack: true }), 412, 590, true);
  bigTorii(c);
  vignette(c, W, H, '90,60,60', 0.4, 1.0);
}

// ---- 8. The Li River, Guilin: karst peaks fading into mist, a bamboo raft, cormorants ----
function karstRow(c, base, col, seed, n, hMin, hMax, mist) {
  const r = rng(seed); let x = -60;
  while (x < 960) {
    const w = 50 + r() * 60, h = hMin + r() * (hMax - hMin), cx = x + w / 2, lean = (r() - 0.5) * 0.25, pts = [];
    // steep sides, a narrow rounded top: half-width shrinks fast near the summit
    for (let i = 0; i <= 20; i++) { const t = i / 20, hw = w / 2 * Math.sqrt(1 - t ** 3.2) * (1 - 0.3 * t); pts.push([cx - hw + lean * h * t, base - h * t]); }
    for (let i = 20; i >= 0; i--) { const t = i / 20, hw = w / 2 * Math.sqrt(1 - t ** 3.2) * (1 - 0.3 * t); pts.push([cx + hw + lean * h * t, base - h * t]); }
    pts.push([cx + w / 2, base + 40], [cx - w / 2, base + 40]);
    const kp = tornPiece(c, pts, col, { amp: 1.8, seed: seed + Math.round(x), rimCol: shade(col, 1.25), rimA: 0.6, shadow: 0.12 });
    clipped(c, kp, () => { piece(c, poly(pts.map(([px, py]) => [px + w * 0.32, py + 6])), shade(col, 0.88), { mul: 0.3 }); for (let k = 0; k < 5; k++) piece(c, ell(cx + (r() - 0.5) * w * 0.7, base - r() * h * 0.8, 6 + r() * 6, 3 + r() * 3), shade(col, 0.8), { mul: 0.3 }); });
    x += w * (1.0 + r() * 1.1);
  }
  if (mist) { c.save(); c.globalAlpha = mist; strip(c, -20, 920, xx => base - 14 + 6 * Math.sin(xx / 70), 700, '#f4f6f2', { seed: seed + 3, rim: 0, shadow: 0, amp: 3 }); c.restore(); }
}
function pcGuilin(c, W, H) {
  skyBands(c, W, ['#cfe0dc', '#dbe8e2', '#e8efe6', '#f6f2e4'], 60, 200, 800);
  glow(c, 640, 150, 160, '255,246,220', 0.5);
  karstRow(c, 236, '#c3d6d2', 800, 0, 60, 150, 0.5);
  karstRow(c, 270, '#a3c3bc', 801, 0, 90, 200, 0.5);
  karstRow(c, 304, '#7fab9c', 802, 0, 110, 230, 0.45);
  karstRow(c, 336, '#5a8f78', 803, 0, 120, 260, 0.3);
  // the river, with soft reflections
  const river = rectP(-20, 336, W + 40, 300); pp(c, river, '#a9cfc4', 0);
  clipped(c, river, () => { c.save(); c.globalAlpha = 0.25; c.translate(0, 672); c.scale(1, -1); karstRow(c, 336, '#5a8f78', 803, 0, 120, 260, 0); c.restore(); const r = rng(804); for (let k = 0; k < 30; k++) piece(c, rectP(r() * W, 340 + r() * 220, 30 + r() * 60, 2), '#d6ece4', { mul: 0.2 }); });
  strip(c, -20, W + 20, x => 336 + 1.2 * fbm1(x / 60, 3), H, '#7fae98', { seed: 805, rim: 0, shadow: 0, amp: 1 });
}
function cormorant(c, x, y, s, flip) {
  c.save(); c.translate(x, y); c.scale(flip ? -s : s, s);
  pp(c, ell(0, -18, 9, 16, 0.2), '#2f3438', 0.2); pp(c, limb([2, -30], [8, -46], 5, 4), '#2f3438', 0.1); pp(c, circ(9, -48, 5), '#2f3438', 0.1);
  pp(c, poly([[13, -49], [24, -46], [13, -46]]), '#e8b04a', 0.05); c.fillStyle = '#9fd0e0'; c.beginPath(); c.arc(10, -49, 1.2, 0, TAU); c.fill();
  c.restore();
}
function pcGuilinFront(c, W, H, res) {
  pcGuilin(c, W, H);
  const y0 = 510;
  for (let i = 0; i < 7; i++) {                                                                       // bamboo raft: separate poles
    const a = [250 + i * 4, y0 + i * 9], b = [700 + i * 4, y0 - 20 + i * 9];
    pp(c, slab(a, b, 9), i % 2 ? '#c2c070' : '#a8ac5e', 0.2); piece(c, slab([a[0], a[1] - 2], [b[0], b[1] - 2], 2), '#dcdc94', { mul: 0.3 });
    for (const u of [0.25, 0.5, 0.75]) { const [x, y] = mix(a, b, u); piece(c, rectP(x - 1, y - 4.5, 2, 9), '#7f8446', { mul: 0.4 }); }
  }
  for (const u of [0.12, 0.88]) { const [x, y] = mix([254, y0 + 26], [704, y0 + 6], u); pp(c, slab([x, y - 30], [x + 2, y + 34], 5), '#8a6a3a', 0.15); }   // cross ties
  pp(c, slab([670, 500], [690, 330], 3), '#7a5a3a', 0.2); pp(c, slab([690, 332], [740, 352], 2), '#7a5a3a', 0.05);
  glow(c, 742, 370, 40, '255,210,140', 0.6); pp(c, ell(742, 372, 9, 12), '#e2574a', 0.15); pp(c, rectP(738, 358, 8, 4), '#2f2a2e', 0);   // lantern
  cormorant(c, 300, 500, 1.6, true); cormorant(c, 640, 488, 1.5, false);
  pcParker(c, res, BOX_STAND, 0.8, p => drawStandB(p, { ...STAND0, expr: 'pant', pack: true, wag: 0.18 }), 500, 506);
  // phoenix-tail bamboo leaning over the banks
  const bamboo = (x, y, dir, seed) => { const r = rng(seed); for (let k = 0; k < 9; k++) { const a = -Math.PI / 2 + dir * (0.15 + k * 0.12), L = 120 + r() * 90, tx = x + Math.cos(a) * L, ty = y + Math.sin(a) * L; pp(c, slab([x + k * 2 * dir, y], [tx, ty], 3), '#6f9a4a', 0.1); for (let j = 0; j < 10; j++) { const u = 0.35 + j * 0.07; leaf(c, lerp(x, tx, u), lerp(y, ty, u), 40, 6, a + dir * (0.7 + r() * 0.8) * (j % 2 ? 1 : -0.6), r() < 0.5 ? '#4f8a52' : '#6fae5a'); } } };
  bamboo(30, 600, 1, 830); bamboo(880, 600, -1, 840);
  strip(c, -20, W + 20, x => 548 + 3 * Math.sin(x / 50), H, '#a9cfc4', { seed: 820, rimCol: '#e2f2ec', amp: 1.5, shadow: 0.12 });
  vignette(c, W, H, '150,170,160', 0.45, 1.05);
}

// ---- 9. A Swiss alpine meadow: snowy peaks, a stone viaduct with a little red train, a chalet, a cow ----
function chalet(c, x, by, s) {
  c.save(); c.translate(x, by); c.scale(s, s);
  pp(c, rectP(-60, -70, 120, 70), '#8a5a3a', 0.3); clipped(c, rectP(-60, -70, 120, 70), () => { for (let k = 0; k < 7; k++) piece(c, rectP(-60, -70 + k * 10, 120, 2), '#6e4228', { mul: 0.4 }); });
  pp(c, rectP(-60, -16, 120, 16), '#e6ddd0', 0.1);
  for (const wx of [-36, 24]) { pp(c, rectP(wx - 12, -54, 24, 22), '#fff6e6', 0.15); pp(c, rectP(wx - 9, -51, 18, 16), '#6e8aa0', 0); pp(c, rectP(wx - 14, -32, 28, 6), '#7a4a2a', 0.1); for (let k = 0; k < 4; k++) pp(c, circ(wx - 10 + k * 7, -34, 4), '#e2463c', 0.1); }
  const roof = poly([[-80, -66], [0, -118], [80, -66], [70, -60], [0, -104], [-70, -60]]); pp(c, roof, '#5a3a2a', 0.3);
  pp(c, poly([[-70, -60], [0, -104], [70, -60]]), '#8a5a3a', 0.1); pp(c, circ(0, -80, 7), '#fff6e6', 0.05);
  c.restore();
}
function cow(c, x, y, s, flip) {
  c.save(); c.translate(x, y); c.scale(flip ? -s : s, s);
  for (const lx of [-22, -12, 14, 24]) pp(c, rectP(lx - 3, -18, 6, 18), '#f3ede4', 0.1);
  const body = ell(0, -26, 32, 16); pp(c, body, '#fbf6ee', 0.25); clipped(c, body, () => { piece(c, ell(-12, -30, 12, 9), '#8a5a3a', { mul: 0.4 }); piece(c, ell(14, -20, 10, 7), '#8a5a3a', { mul: 0.4 }); });
  pp(c, ell(36, -34, 11, 9, 0.3), '#fbf6ee', 0.15); pp(c, ell(42, -30, 6, 5), '#f3b6b0', 0.05); pp(c, poly([[30, -42], [26, -50], [34, -44]]), '#e6dcc8', 0.05);
  pp(c, ell(28, -40, 6, 3, -0.6), '#8a5a3a', 0.05); c.fillStyle = PK.eye; c.beginPath(); c.arc(36, -38, 1.4, 0, TAU); c.fill();
  pp(c, limb([30, -26], [30, -18], 3, 3), '#d9483b', 0); drawSouvenir(c, 'swiss', 0.32); c.restore();
}
function pcSwiss(c, W, H) {
  skyBands(c, W, ['#5fb4ec', '#76c0ee', '#94cdef', '#b6dcf0', '#d6ecf2'], 50, 200, 900);
  // snowy peaks, a Matterhorn-like horn on the right
  const peak = (pts, seed, col = '#8a96b4') => { const p = tornPiece(c, pts, col, { amp: 2, seed, rimCol: '#d8e0f0', shadow: 0.15 }); clipped(c, p, () => { const top = Math.min(...pts.map(q => q[1])); piece(c, rectP(-20, top - 10, 960, 60), '#fbfbff', { mul: 0.2 }); piece(c, poly(pts.map(([x, y]) => [x + 30, y + 10])), '#6e7a9a', { mul: 0.3 }); }); };
  peak([[-20, 300], [80, 180], [150, 150], [230, 210], [300, 300]], 901);
  peak([[200, 300], [330, 170], [420, 200], [520, 300]], 902);
  peak([[540, 300], [660, 150], [700, 70], [730, 90], [780, 190], [900, 300]], 903, '#7d88a8');
  strip(c, -20, W + 20, x => 290 - 26 * Math.max(0, Math.sin(x / 140 + 1)) - 4 * fbm1(x / 40, 2), H, '#6fae5a', { seed: 904, rimCol: '#b9de9a', shadow: 0.15 });
  const rp = rng(905); for (let k = 0; k < 18; k++) { const x = rp() * W; pine(c, x, 296 - 26 * Math.max(0, Math.sin(x / 140 + 1)) + 8, 22 + rp() * 14, '#3f6f4a', 910 + k); }
  // stone viaduct with arches, and the red train on top
  const vy = 352; pp(c, rectP(-20, vy, W + 40, 14), '#b8b2a8', 0.25);
  for (let i = 0; i < 9; i++) { const x = i * 110 - 10; pp(c, poly([[x, vy + 14], [x + 22, vy + 14], [x + 28, 460], [x - 6, 460]]), '#a8a29a', 0.2); }
  clipped(c, rectP(-20, vy + 14, W + 40, 100), () => { for (let i = 0; i < 9; i++) { const x = i * 110 + 12; const a = new Path2D(); a.moveTo(x, 470); a.lineTo(x, vy + 50); a.quadraticCurveTo(x + 44, vy + 4, x + 88, vy + 50); a.lineTo(x + 88, 470); a.closePath(); piece(c, a, '#6fae5a', { mul: 0.5 }); } });
  const car = (x, len, front) => {
    pp(c, rectP(x, vy - 34, len, 30), '#d9332e', 0.25); pp(c, rectP(x, vy - 38, len, 6), '#b22a26', 0.1); pp(c, rectP(x, vy - 10, len, 4), '#f6e6c8', 0);
    for (let k = 0; k < Math.floor(len / 22); k++) pp(c, rectP(x + 6 + k * 22, vy - 30, 14, 12), '#fff6e6', 0.05);
    for (const wx of [x + 10, x + len - 10]) pp(c, circ(wx, vy - 2, 5), '#3a3a40', 0.1);
    if (front) { pp(c, rectP(x + len - 4, vy - 40, 4, 6), '#3a3a40', 0); }
  };
  car(330, 100, false); car(436, 100, false); car(542, 80, true);
  strip(c, -20, W + 20, x => 430 + 10 * Math.sin(x / 160) + 3 * fbm1(x / 50, 3), H, '#86c464', { seed: 906, rimCol: '#cfe8b0', shadow: 0.2 });
  strip(c, -20, W + 20, x => 486 + 6 * fbm1(x / 90, 4), H, '#7dba5a', { seed: 907, rimCol: '#c3e3a3', shadow: 0.2 });
  const rf = rng(908); for (let k = 0; k < 40; k++) flower(c, rf() * W, 470 + rf() * 120, 4 + rf() * 3, ['#fff7ee', '#f8d36a', '#c8a6df', '#f58cbf', '#62a0c6'][k % 5], 920 + k, false);
}
function pcSwissFront(c, W, H, res) {
  pcSwiss(c, W, H);
  chalet(c, 140, 520, 1.1);
  cow(c, 760, 560, 1.4, true);
  // sitting in the meadow facing you, waving hello
  const r = rng(960); for (let k = 0; k < 8; k++) pp(c, ell(360 + r() * 200, 420 + r() * 120, 3.5, 2.2, r() * 3), ['#fff7ee', '#f8d36a', '#f58cbf', '#c8a6df'][k % 4], 0.08);   // a few petals in the air
  pcParker(c, res, BOX_WAVE, 0.95, p => drawWaveB(p, 1, { pack: true }), 450, 580);
  vignette(c, W, H, '150,170,190', 0.45, 1.05);
}

// ---- 10. ★ Furano, Hokkaido: rainbow stripes of flowers on rolling hills, lavender, the Tokachi range ----
function flowerBand(c, f0, f1, col, colL, seed) {      // a stripe of flowers between two hill curves
  const pts = []; for (let x = -20; x <= 920; x += 20) pts.push([x, f0(x)]); for (let x = 920; x >= -20; x -= 20) pts.push([x, f1(x)]);
  const p = tornPiece(c, pts, col, { amp: 1.5, seed, rimCol: colL, rimA: 0.8, shadow: 0.15 });
  clipped(c, p, () => { const r = rng(seed + 1); for (let k = 0; k < 120; k++) { const x = r() * 940 - 20, y = lerp(f0(x), f1(x), r()); piece(c, circ(x, y, 1.6 + r() * 2), r() < 0.5 ? colL : shade(col, 0.85), { mul: 0.3 }); } });
}
function lavenderSprig(c, x, y, h, a, seed) {
  const r = rng(seed), tx = x + Math.sin(a) * h, ty = y - Math.cos(a) * h;
  pp(c, slab([x, y], [tx, ty], 2), '#6d9a5a', 0.1);
  for (let k = 0; k < 8; k++) { const u = 0.45 + k * 0.07; pp(c, ell(lerp(x, tx, u) + (k % 2 ? 3 : -3), lerp(y, ty, u), 3.4, 4.6, a), r() < 0.5 ? '#8f6cc8' : '#a585d8', 0.08); }
}
function pcFurano(c, W, H) {
  skyBands(c, W, ['#5fb2ea', '#78c0ee', '#98cff0', '#bcdff2', '#dceef2'], 50, 190, 1000);
  [[620, 90, 70, 16], [240, 60, 50, 12], [800, 150, 50, 12]].forEach(([x, y, w, h], i) => { tornPiece(c, ellipsePts(x, y, w, h, 30), '#ffffff', { amp: 2.5, seed: 1010 + i, rimCol: '#fff', shadow: 0.08, mul: 0.5 }); tornPiece(c, ellipsePts(x - w * 0.3, y - h * 0.7, w * 0.45, h * 0.9, 24), '#ffffff', { amp: 2, seed: 1020 + i, rim: 0, shadow: 0.06, mul: 0.5 }); });
  // the Tokachi range, snow on top
  const mt = tornPiece(c, [[-20, 260], [80, 214], [170, 196], [260, 226], [360, 188], [470, 210], [560, 180], [680, 216], [780, 198], [920, 230], [920, 300], [-20, 300]], '#7d8fb8', { amp: 2.5, seed: 1030, rimCol: '#d6deef', shadow: 0.12 });
  clipped(c, mt, () => piece(c, rectP(-20, 170, 960, 34), '#f4f6ff', { mul: 0.2 }));
  strip(c, -20, W + 20, x => 262 - 16 * Math.sin(x / 150 + 1), H, '#8ab86a', { seed: 1031, rimCol: '#cfe6b0', shadow: 0.12 });
  // a lone tree and a red-roofed barn on the far hill
  pp(c, slab([700, 250], [702, 222], 4), '#6a4a3a', 0.1); tornPiece(c, ellipsePts(702, 212, 18, 16, 24), '#3f7a4a', { amp: 1.5, seed: 1032, rim: 0, shadow: 0.15 });
  pp(c, rectP(160, 246, 40, 22), '#f6efe0', 0.2); pp(c, poly([[154, 248], [180, 228], [206, 248]]), '#d9483b', 0.2);
  // rainbow fields, far to near
  const hill = (base, amp, ph) => x => base - amp * Math.sin(x / 210 + ph) - amp * 0.4 * Math.sin(x / 90 + ph * 2);
  const bands = [['#e2463c', '#f5806a'], ['#f7c234', '#fbe08a'], ['#ffffff', '#fdf3f6'], ['#f39a4a', '#fbc58a'], ['#f58cbf', '#fbc6dc'], ['#8f6cc8', '#b9a0e6']];
  let prev = hill(282, 10, 0.5);
  bands.forEach(([col, colL], i) => { const next = hill(300 + i * 26, 12 + i * 2, 0.5 + i * 0.15); flowerBand(c, prev, next, col, colL, 1040 + i * 3); prev = next; });
  // the near lavender field: rows running toward us
  const lav = hill(452, 8, 1.4); const p = tornPiece(c, [[-20, 600], ...[...Array(48)].map((_, i) => [i * 20 - 20, lav(i * 20 - 20)]), [920, 600]], '#7d5fb8', { amp: 1.5, seed: 1060, rimCol: '#b9a0e6', shadow: 0.2 });
  clipped(c, p, () => { for (let k = -12; k < 13; k++) { const x0 = 450 + k * 26, x1 = 450 + k * 120; piece(c, poly([[x0, 450], [x0 + 6, 450], [x1 + 40, 620], [x1 - 10, 620]]), k % 2 ? '#9a7ad6' : '#6e52a8', { mul: 0.4 }); } });
}
function pcFuranoFront(c, W, H, res) {
  pcFurano(c, W, H);
  pcParker(c, res, BOX_BELLY, 0.8, p => drawBellyB(p, 0), 440, 560);
  // a lavender soft-serve, stuck in the ground
  c.save(); c.translate(640, 560); c.rotate(0.15);
  pp(c, poly([[-12, -40], [12, -40], [0, 0]]), '#e6b36a', 0.2); clipped(c, poly([[-12, -40], [12, -40], [0, 0]]), () => { for (let k = -3; k < 4; k++) piece(c, slab([k * 6 - 10, -40], [k * 6 + 10, -10], 1.2), '#c99446', { mul: 0.4 }); });
  pp(c, union(ell(0, -46, 15, 9), ell(0, -58, 11, 8), ell(1, -68, 7, 6)), '#c7b0ec', 0.2); c.restore();
  const r = rng(1070); for (let k = 0; k < 14; k++) lavenderSprig(c, r() * W, 600, 60 + r() * 50, (r() - 0.5) * 0.5, 1080 + k);
  // a butterfly
  pp(c, union(ell(298, 400, 9, 6, -0.5), ell(310, 400, 9, 6, 0.5)), '#f7d04a', 0.15); pp(c, slab([304, 394], [304, 406], 2), '#5a4a3a', 0);
  vignette(c, W, H, '160,150,200', 0.45, 1.05);
}

// ---- 11. ★ Mingsha dunes and Crescent Lake, Dunhuang: golden ridges, a moon-shaped spring, a pavilion, camels ----
// a sand dune with a curved knife-edge crest: sunlit on the left, shadow on the right of the ridge
function dune(c, x0, xp, yp, x1, yb, light, dark, seed) {
  const body = new Path2D(); body.moveTo(x0, yb); body.quadraticCurveTo(lerp(x0, xp, 0.55), yp + (yb - yp) * 0.08, xp, yp);
  body.quadraticCurveTo(lerp(xp, x1, 0.4), yp + (yb - yp) * 0.1, x1, yb); body.lineTo(x1, yb + 400); body.lineTo(x0, yb + 400); body.closePath();
  castShadow(c, body, 5, 2, 5, 0.18);
  c.save(); c.fillStyle = '#fbe2b0'; c.translate(0, -2.2); c.globalAlpha = 0.9; c.fill(body); c.restore();     // pale rim along the crest
  piece(c, body, light, { mul: 0.6, scr: 0.25 });
  const rx = lerp(xp, x1, 0.12), sh = new Path2D(); sh.moveTo(xp, yp); sh.quadraticCurveTo(lerp(xp, x1, 0.4), yp + (yb - yp) * 0.1, x1, yb); sh.lineTo(x1, yb + 400); sh.lineTo(rx, yb + 400);
  sh.bezierCurveTo(xp - 50, yb + 60, xp + 30, yp + (yb - yp) * 0.5, xp, yp); sh.closePath();
  clipped(c, body, () => { piece(c, sh, dark, { mul: 0.5, scr: 0.1 }); const r = rng(seed); for (let k = 0; k < 8; k++) { const y = lerp(yp, yb + 40, (k + 1) / 9), x = lerp(x0, xp, 0.3 + r() * 0.5); piece(c, slab([x - 40, y], [x + 40, y + 6], 1.4), shade(light, 0.92), { mul: 0.2 }); } });
}
function pavilion(c, x, by, s) {
  c.save(); c.translate(x, by); c.scale(s, s);
  pp(c, rectP(-46, -10, 92, 10), '#d8c6a0', 0.25);
  for (const px of [-34, -12, 12, 34]) pp(c, rectP(px - 3, -46, 6, 36), '#c0392e', 0.15);
  for (const [y, w, hh] of [[-46, 64, 18], [-80, 44, 16]]) {
    const roof = new Path2D(); roof.moveTo(-w - 12, y + 2); roof.quadraticCurveTo(-w, y - 2, -w + 10, y - hh * 0.6); roof.lineTo(w - 10, y - hh * 0.6); roof.quadraticCurveTo(w, y - 2, w + 12, y + 2); roof.quadraticCurveTo(w, y - 4, w - 8, y - 2); roof.lineTo(-w + 8, y - 2); roof.quadraticCurveTo(-w, y - 4, -w - 12, y + 2); roof.closePath();
    pp(c, poly([[-w + 10, y - hh * 0.6], [w - 10, y - hh * 0.6], [w * 0.4, y - hh], [-w * 0.4, y - hh]]), '#3f5a5a', 0.15); pp(c, roof, '#2f4646', 0.2);
    if (y < -60) pp(c, rectP(-26, y + 2, 52, 30), '#e6d6b0', 0.1);
  }
  pp(c, poly([[0, -104], [-3, -96], [3, -96]]), ARCH.gold, 0.1);
  c.restore();
}
function camel(c, x, y, s, col = '#5a3a3a') {
  const p = new Path2D(); p.moveTo(x - 20 * s, y); p.lineTo(x - 18 * s, y - 14 * s); p.quadraticCurveTo(x - 14 * s, y - 26 * s, x - 6 * s, y - 18 * s); p.quadraticCurveTo(x, y - 30 * s, x + 8 * s, y - 18 * s); p.lineTo(x + 14 * s, y - 20 * s); p.lineTo(x + 20 * s, y - 30 * s); p.lineTo(x + 25 * s, y - 28 * s); p.lineTo(x + 18 * s, y - 14 * s); p.lineTo(x + 14 * s, y); p.lineTo(x + 11 * s, y); p.lineTo(x + 10 * s, y - 10 * s); p.lineTo(x - 12 * s, y - 10 * s); p.lineTo(x - 14 * s, y); p.closePath();
  piece(c, p, col, { mul: 0.4 });
}
function pcDunhuang(c, W, H) {
  skyBands(c, W, ['#4fa0e0', '#6cb4e8', '#90c8ee', '#bcdcee', '#f2e4c8'], 40, 150, 1100);
  glow(c, 760, 70, 140, '255,246,210', 0.6);
  // towering dunes, far to near
  dune(c, -120, 120, 150, 420, 340, '#e8b066', '#c08046', 1101);
  dune(c, 300, 600, 110, 1000, 340, '#eeb86c', '#c88a4c', 1102);
  for (let i = 0; i < 5; i++) camel(c, 470 + i * 24, 196 + i * 13, 0.7);                       // a caravan walking down the crest
  dune(c, -60, 160, 260, 440, 380, '#f0c078', '#cf9052', 1103);
  // the valley: the crescent spring, its green banks, the pavilion
  strip(c, -20, W + 20, x => 366 + 3 * fbm1(x / 90, 2), H, '#e8c084', { seed: 1104, rimCol: '#fbe6bc', shadow: 0.12 });
  for (const [x, y, r] of [[500, 360, 24], [540, 354, 20], [700, 358, 24], [742, 352, 19]]) tornPiece(c, ellipsePts(x, y, r, r * 0.9, 24), '#5f9a52', { amp: 2, seed: 1110 + x, rimCol: '#a6d08a', shadow: 0.15 });
  pavilion(c, 620, 370, 0.9);
  // Crescent Lake: the moon shape = an ellipse with a bigger one bitten out of its upper side
  const moon = new Path2D(); moon.ellipse(620, 404, 170, 34, 0, 0, TAU); const cut = new Path2D(); cut.rect(400, 340, 440, 120); cut.ellipse(650, 390, 150, 26, 0, 0, TAU);
  c.save(); c.clip(moon); c.clip(cut, 'evenodd'); castShadow(c, rectP(400, 340, 440, 120), 2, 0, 2, 0.15); piece(c, rectP(400, 340, 440, 120), '#4fb4ac', { mul: 0.4, scr: 0.2 }); piece(c, rectP(440, 414, 360, 3), '#bfeee6', { mul: 0.2 }); c.restore();
  // the near dune Parker runs down
  dune(c, -200, 170, 420, 1100, 600, '#f5cc86', '#dba660', 1120);
  const rp = rng(1121); for (let k = 0; k < 16; k++) { const x = 380 + rp() * 520, y = 470 + rp() * 120; piece(c, slab([x - 30, y], [x + 30, y + 4], 0.9), '#e6b06a', { mul: 0.2 }); }   // wind ripples
}
function pcDunhuangFront(c, W, H, res) {
  pcDunhuang(c, W, H);
  for (let i = 0; i < 8; i++) { const x = 170 + i * 30, y = 432 + i * 12 + (i % 2) * 6; pp(c, ell(x, y, 5, 2.4, 0.3), '#d39a56', 0); }   // his paw prints, leading to the spot
  const hx = 480, hy = 548;
  // sand flying out to both sides in big arcs: pale and dark bits so they read against the dune
  const r = rng(1140), spray = (side, n) => { for (let k = 0; k < n; k++) { const u = (k + r() * 0.6) / n, x = hx + side * (70 + u * 190), y = hy - 120 - Math.sin(u * Math.PI) * 110 + u * 120 + (r() - 0.5) * 22, sz = 3.5 + r() * 5 * (1 - u * 0.4); pp(c, poly([[x - sz, y], [x - sz * 0.2, y - sz * 0.9], [x + sz, y - sz * 0.2], [x + sz * 0.3, y + sz * 0.8]]), r() < 0.5 ? '#fff0cc' : '#b8783e', 0.18); } };
  spray(-1, 22); spray(1, 22);
  for (const side of [-1, 1]) pp(c, ell(hx + side * 70, hy + 22, 30, 9), '#f6d494', 0.15);                  // mounds of thrown sand
  pcParker(c, res, BOX_DIG, 1.0, p => drawDigB(p, 1, { pack: true }), hx, hy);
  // the hole, right under his nose
  pp(c, ell(hx, hy + 30, 44, 12), '#d9a05a', 0.12); pp(c, ell(hx, hy + 31, 34, 8), '#8a5a2e', 0);
  vignette(c, W, H, '190,150,110', 0.45, 1.05);
}

// ---- 12. ★ Lake Tekapo: the Milky Way, the little stone church, lupins ----
function pcTekapo(c, W, H) {
  skyBands(c, W, ['#0f1638', '#141d48', '#1c2858', '#26346a', '#33447a'], 60, 300, 1200);
  // the Milky Way: a soft diagonal band of light and star dust
  c.save(); c.globalCompositeOperation = 'screen';
  for (let k = 0; k < 14; k++) { const u = k / 13, x = lerp(120, 820, u), y = lerp(60, 330, u) - 60 * Math.sin(u * Math.PI); glow(c, x, y, 110, k % 3 ? '170,170,230' : '230,200,230', 0.2); }
  c.restore();
  const r = rng(1201); for (let k = 0; k < 260; k++) { const u = r(), band = r() < 0.55, x = band ? lerp(120, 820, u) + (r() - 0.5) * 160 : r() * W, y = band ? lerp(60, 330, u) - 60 * Math.sin(u * Math.PI) + (r() - 0.5) * 120 : r() * 340; c.fillStyle = `rgba(255,248,226,${0.3 + r() * 0.6})`; c.beginPath(); c.arc(x, y, 0.5 + r() * 1.2, 0, TAU); c.fill(); }
  for (const [x, y, s] of [[160, 80, 5], [700, 60, 4], [520, 160, 3.5], [840, 220, 4]]) { glow(c, x, y, s * 5, '255,240,200', 0.4); piece(c, poly([[x, y - s * 1.6], [x + s * 0.35, y - s * 0.35], [x + s * 1.6, y], [x + s * 0.35, y + s * 0.35], [x, y + s * 1.6], [x - s * 0.35, y + s * 0.35], [x - s * 1.6, y], [x - s * 0.35, y - s * 0.35]]), '#fff3c8', { mul: 0.3 }); }
  // a shooting star
  c.save(); c.globalCompositeOperation = 'screen'; const g = c.createLinearGradient(300, 120, 420, 70); g.addColorStop(0, 'rgba(255,240,210,0)'); g.addColorStop(1, 'rgba(255,240,210,0.9)'); c.strokeStyle = g; c.lineWidth = 2.4; c.lineCap = 'round'; c.beginPath(); c.moveTo(300, 120); c.lineTo(420, 70); c.stroke(); c.restore();
  // mountains, the lake with starry reflections
  tornPiece(c, [[-20, 360], [90, 300], [170, 318], [280, 280], [380, 320], [500, 290], [620, 326], [740, 296], [920, 340], [920, 380], [-20, 380]], '#1d2448', { amp: 2, seed: 1210, rimCol: '#4a5a8a', rimA: 0.7, shadow: 0.2 });
  const lake = rectP(-20, 362, W + 40, 120); pp(c, lake, '#24607a', 0);
  clipped(c, lake, () => { const rl = rng(1211); for (let k = 0; k < 60; k++) { c.fillStyle = `rgba(255,248,226,${0.2 + rl() * 0.4})`; c.fillRect(rl() * W, 366 + rl() * 100, 1.5 + rl() * 3, 1); } glow(c, 450, 420, 200, '120,200,210', 0.25); });
  // the Church of the Good Shepherd: a small stone church on the shore
  const cx = 610, by = 404;
  pp(c, rectP(cx - 46, by - 46, 92, 46), '#8a8070', 0.3);
  clipped(c, rectP(cx - 46, by - 46, 92, 46), () => { const rs = rng(1212); for (let k = 0; k < 30; k++) piece(c, ell(cx - 46 + rs() * 92, by - 46 + rs() * 46, 5 + rs() * 4, 3 + rs() * 2), rs() < 0.5 ? '#a09684' : '#746a5c', { mul: 0.4 }); });
  pp(c, poly([[cx - 54, by - 44], [cx, by - 96], [cx + 54, by - 44]]), '#4a4652', 0.3);
  pp(c, rectP(cx - 10, by - 30, 20, 30), '#3a2a24', 0.1); glow(c, cx, by - 16, 30, '255,206,130', 0.6); pp(c, rectP(cx - 6, by - 26, 12, 22), '#ffd88a', 0);
  pp(c, slab([cx, by - 96], [cx, by - 118], 2.5), '#8a8070', 0.1); pp(c, slab([cx - 7, by - 110], [cx + 7, by - 110], 2.5), '#8a8070', 0.1);
  // grassy shore
  strip(c, -20, W + 20, x => 446 + 6 * fbm1(x / 80, 4), H, '#2f4a3a', { seed: 1213, rimCol: '#4f6a5a', shadow: 0.2 });
}
function lupin(c, x, y, h, col, seed) {
  const r = rng(seed); pp(c, slab([x, y], [x, y - h], 3), '#3f5a3a', 0.1);
  for (let k = 0; k < 4; k++) leaf(c, x, y - 6, 18, 4, -Math.PI / 2 + (k - 1.5) * 0.7, '#4a6a48');
  for (let k = 0; k < 12; k++) { const u = k / 12, w = 8 * (1 - u * 0.6); pp(c, ell(x + (k % 2 ? w * 0.5 : -w * 0.5), y - h * 0.4 - u * h * 0.6, w * 0.6, 3.4), k % 3 ? col : shade(col, 1.25), 0.08); }
}
function pcTekapoFront(c, W, H, res) {
  pcTekapo(c, W, H);
  const r = rng(1220), cols = ['#9a6cd0', '#e86aa6', '#6a86d8', '#f2a8c8'];
  for (let k = 0; k < 9; k++) lupin(c, 20 + k * 30 + r() * 10, 600, 90 + r() * 60, cols[k % 4], 1230 + k);
  for (let k = 0; k < 7; k++) lupin(c, 690 + k * 32 + r() * 10, 600, 80 + r() * 60, cols[(k + 2) % 4], 1250 + k);
  c.save(); c.translate(296, 562); backpack(c, 0, -14, 0.1); c.restore();                        // his pillow, under his chin
  pcParker(c, res, BOX_LIE, 0.8, p => drawLieB(p, 'sleepy', { breath: 1.2 }), 400, 566, true);
  for (const [x, y, s] of [[318, 470, 1.4], [300, 440, 1.1]]) { c.save(); c.translate(x, y); c.scale(s, s); drawZ(c, 1); c.restore(); }
  c.save(); c.globalCompositeOperation = 'screen'; glow(c, 400, 540, 140, '120,140,220', 0.25); c.restore();
  vignette(c, W, H, '40,40,80', 0.45, 1.0);
}

// ================= FESTIVAL CARDS =================
// ---- Loy Krathong: Sukhothai Historical Park at night, krathongs on the pond, a full moon ----
function krathong(c, x, y, s, seed) {
  const r = rng(seed);
  glow(c, x, y + 4 * s, 80 * s, '255,180,100', 0.6);                                            // warm light on the water
  piece(c, rectP(x - 3 * s, y + 6 * s, 6 * s, 26 * s), 'rgba(255,214,140,0.35)', { mul: 0, scr: 0 });   // its reflection
  pp(c, ell(x, y, 26 * s, 8 * s), '#4f7a44', 0.2);                                               // banana-trunk raft
  const petals = new Path2D();                                                                    // folded banana-leaf petals, lotus style
  for (let i = 0; i < 9; i++) { const a = Math.PI + (i / 8) * Math.PI, px = x + Math.cos(a) * 22 * s; petals.addPath(poly([[px - 5 * s, y - 2 * s], [px + Math.cos(a) * 3 * s, y - 16 * s - Math.abs(Math.sin(a)) * 3 * s], [px + 5 * s, y - 2 * s]])); }
  pp(c, petals, '#7fae5a', 0.15);
  for (let k = 0; k < 6; k++) pp(c, circ(x + (r() - 0.5) * 30 * s, y - 8 * s - r() * 6 * s, (3 + r() * 2) * s), ['#f39a2a', '#f6c234', '#f58cbf', '#fff3e6'][k % 4], 0.08);   // marigolds and orchids
  pp(c, rectP(x - 2.5 * s, y - 30 * s, 5 * s, 18 * s), '#fff6e6', 0.1);                           // candle
  for (const dx of [-7, 7]) { pp(c, slab([x + dx * s, y - 10 * s], [x + dx * 1.3 * s, y - 34 * s], 1.4 * s), '#8a4a3a', 0); glow(c, x + dx * 1.3 * s, y - 34 * s, 4 * s, '255,120,80', 0.8); }   // incense
  glow(c, x, y - 36 * s, 40 * s, '255,214,140', 0.95);
  pp(c, ell(x, y - 36 * s, 3 * s, 6 * s), '#ffd36a', 0); pp(c, ell(x, y - 35 * s, 1.5 * s, 3 * s), '#fff6d6', 0);
}
function lotusChedi(c, x, by, s, col, lit) {                                                       // the Sukhothai lotus-bud chedi
  c.save(); c.translate(x, by); c.scale(s, s);
  for (const [w, y, h] of [[120, -26, 26], [96, -46, 20], [76, -62, 16]]) { pp(c, rectP(-w / 2, y, w, h), col, 0.25); piece(c, rectP(-w / 2, y + h - 5, w, 5), lit, { mul: 0.4 }); }
  pp(c, rectP(-26, -130, 52, 68), col, 0.2); piece(c, rectP(-26, -72, 52, 10), lit, { mul: 0.4 });
  for (const [w, y] of [[64, -136], [56, -144], [48, -150]]) pp(c, rectP(-w / 2, y, w, 7), col, 0.12);
  const bud = new Path2D(); bud.moveTo(-24, -150); bud.bezierCurveTo(-30, -186, -12, -214, 0, -234); bud.bezierCurveTo(12, -214, 30, -186, 24, -150); bud.closePath();
  pp(c, bud, col, 0.22); clipped(c, bud, () => { piece(c, ell(14, -180, 14, 40), shade(col, 0.8), { mul: 0.3 }); for (let k = 0; k < 3; k++) piece(c, rectP(-30, -160 - k * 18, 60, 3), shade(col, 0.82), { mul: 0.3 }); });
  pp(c, slab([0, -232], [0, -270], 3.5), col, 0.1);
  c.restore();
}
function prang(c, x, by, s, col) {                                                                  // a smaller corn-cob tower
  c.save(); c.translate(x, by); c.scale(s, s);
  pp(c, rectP(-34, -24, 68, 24), col, 0.22); pp(c, rectP(-24, -74, 48, 50), col, 0.2); pp(c, rectP(-8, -64, 16, 40), '#2a2238', 0);
  const cob = new Path2D(); cob.moveTo(-24, -74); cob.bezierCurveTo(-26, -120, -8, -140, 0, -150); cob.bezierCurveTo(8, -140, 26, -120, 24, -74); cob.closePath();
  pp(c, cob, col, 0.2); clipped(c, cob, () => { for (let k = 0; k < 5; k++) piece(c, rectP(-30, -84 - k * 13, 60, 3), shade(col, 0.82), { mul: 0.3 }); });
  c.restore();
}
function pcLoyKrathong(c, W, H) {
  skyBands(c, W, ['#0d1536', '#121c46', '#192757', '#213266', '#2b3e74'], 50, 250, 1300);
  const rs = rng(1301); for (let k = 0; k < 110; k++) { c.fillStyle = `rgba(255,248,226,${0.25 + rs() * 0.5})`; c.beginPath(); c.arc(rs() * W, rs() * 260, 0.5 + rs() * 1.1, 0, TAU); c.fill(); }
  // the full moon
  glow(c, 700, 108, 260, '255,236,190', 0.45);
  tornPiece(c, ellipsePts(700, 108, 50, 50, 60), '#fff1c8', { amp: 1.2, seed: 1302, shadow: 0, rimCol: '#fffbe8' });
  c.save(); c.globalAlpha = 0.18; for (const [dx, dy, r] of [[-14, -10, 12], [12, 8, 9], [-4, 18, 7], [18, -16, 6]]) piece(c, circ(700 + dx, 108 + dy, r), '#d8c08a', { mul: 0.3 }); c.restore();
  [[170, 130, 0.7], [250, 70, 0.55], [460, 50, 0.6], [560, 150, 0.5], [860, 210, 0.55]].forEach(([x, y, s]) => lantern(c, x, y, s));
  // trees and sugar palms against the sky
  strip(c, -20, W + 20, x => 306 - 22 * Math.abs(Math.sin(x / 48)) - 8 * fbm1(x / 30, 2), H, '#16203e', { seed: 1303, rimCol: '#2e3d66', shadow: 0.15 });
  for (const [x, h] of [[90, 120], [150, 96], [780, 130], [840, 104]]) { pp(c, slab([x, 300], [x + 4, 300 - h], 4), '#1a2342', 0.1); for (let i = 0; i < 9; i++) leaf(c, x + 4, 300 - h, 30, 6, -Math.PI / 2 + (i - 4) * 0.42, '#1a2648'); }
  // the temple platform, rows of laterite columns, the chedi and two prangs, warm light from the candles below
  const brick = '#7a5f74', lit = '#c99a7a';
  pp(c, rectP(150, 380, 600, 30), brick, 0.25); piece(c, rectP(150, 404, 600, 6), lit, { mul: 0.4 });
  prang(c, 300, 384, 0.95, '#6e566c'); prang(c, 600, 384, 0.95, '#6e566c');
  lotusChedi(c, 450, 384, 1.0, brick, lit);
  for (let i = 0; i < 9; i++) { const x = 190 + i * 62, h = 54 + (i * 37) % 30; if (i === 4) continue; pp(c, rectP(x - 7, 380 - h, 14, h), '#8a6a74', 0.2); piece(c, rectP(x - 7, 380 - h, 14, 4), shade('#8a6a74', 0.85), { mul: 0.3 }); }
  c.save(); c.globalCompositeOperation = 'screen'; glow(c, 450, 390, 240, '255,190,120', 0.3); c.restore();
  // the pond: the temple and the moon mirrored in it
  const pond = rectP(-20, 412, W + 40, 200); pp(c, pond, '#142450', 0);
  clipped(c, pond, () => {
    c.save(); c.globalAlpha = 0.28; c.translate(0, 824); c.scale(1, -1); lotusChedi(c, 450, 412, 1.0, brick, lit); prang(c, 300, 412, 0.95, '#6e566c'); prang(c, 600, 412, 0.95, '#6e566c'); c.restore();
    const rm = rng(1304); c.save(); c.globalAlpha = 0.55; for (let k = 0; k < 14; k++) piece(c, rectP(700 - (14 - k) * 2 - rm() * 10, 420 + k * 11, (14 - k) * 4 + rm() * 20, 2.5), '#e8d6a0', { mul: 0.2 }); c.restore();
    for (let k = 0; k < 30; k++) piece(c, rectP(rm() * W, 420 + rm() * 180, 20 + rm() * 50, 1.6), '#2a4078', { mul: 0.3 });
  });
  pp(c, rectP(-20, 410, W + 40, 4), '#1d2f5e', 0);
  // krathongs drifting, far to near
  [[230, 442, 0.6, 1], [390, 448, 0.62, 2], [560, 440, 0.58, 3], [830, 452, 0.7, 4], [300, 470, 0.75, 9], [650, 478, 0.9, 5], [130, 490, 0.95, 6], [480, 508, 1.05, 7], [770, 536, 1.25, 8]].forEach(([x, y, s, k]) => krathong(c, x, y, s, 1310 + k));
}
function pcLoyKrathongFront(c, W, H, res) {
  pcLoyKrathong(c, W, H);
  // the near bank Parker lies on
  const bank = tornPiece(c, [[-20, 600], [-20, 520], [80, 508], [200, 512], [300, 530], [360, 560], [380, 600]], '#1e3a32', { amp: 2.5, seed: 1320, rimCol: '#3f6a5a', shadow: 0.25 });
  for (const [x, y] of [[520, 590], [580, 578], [870, 584]]) { const pad = new Path2D(); pad.moveTo(x, y); pad.ellipse(x, y, 26, 9, 0, 0.4, TAU - 0.4); pad.closePath(); pp(c, pad, '#2f5a46', 0.15); }
  pcParker(c, res, BOX_LIE, 0.82, p => drawLieB(p, 'content', { headRot: 0.04 }), 210, 548);
  krathong(c, 336, 568, 1.4, 1330);                                     // the one he just set on the water
  vignette(c, W, H, '40,40,90', 0.42, 1.0);
}


// ---- Christmas: a snowy Alpine village at dusk, warm windows; Parker in a little scarf ----
function snowFall(c, W, H, seed, n = 70) { const r = rng(seed); for (let k = 0; k < n; k++) { const x = r() * W, y = r() * H * 0.9, s = 1.5 + r() * 2.5; c.save(); c.globalAlpha = 0.6 + r() * 0.4; piece(c, poly([[x - s, y], [x, y - s], [x + s, y], [x, y + s]]), '#ffffff', { mul: 0.2 }); c.restore(); } }
function snowPine(c, x, y, h, seed) { pine(c, x, y, h, '#2f5a4a', seed); for (let i = 0; i < 3; i++) { const w = h * (0.42 - i * 0.1) * 0.7, yy = y - i * h * 0.26 - h * 0.3; piece(c, poly([[x - w, yy + 4], [x, yy - h * 0.18], [x + w, yy + 4]]), '#f4f8ff', { mul: 0.2 }); } }
function litChalet(c, x, by, s) {
  chalet(c, x, by, s);
  c.save(); c.translate(x, by); c.scale(s, s);
  pp(c, poly([[-82, -66], [0, -120], [82, -66], [72, -60], [0, -108], [-72, -60]]), '#f4f8ff', 0.1);         // snow on the roof
  for (const wx of [-36, 24]) { glow(c, wx, -43, 30, '255,200,120', 0.7); pp(c, rectP(wx - 9, -51, 18, 16), '#ffd88a', 0); pp(c, rectP(wx - 1, -51, 2, 16), '#8a5a3a', 0); }
  for (let i = 0; i < 9; i++) { const u = i / 8, px = lerp(-70, 70, u), py = -60 - Math.sin(u * Math.PI) * 4; glow(c, px, py, 6, ['255,120,120', '255,220,120', '140,220,160'][i % 3], 0.9); }   // string lights under the eaves
  c.restore();
}
function pcXmas(c, W, H) {
  skyBands(c, W, ['#232b58', '#2e3870', '#475290', '#736ca8', '#b297bf'], 50, 250, 1400);
  for (const [pts, seed] of [[[[-20, 300], [110, 170], [200, 210], [320, 300]], 1401], [[[260, 300], [430, 150], [560, 230], [700, 300]], 1402], [[[600, 300], [760, 140], [860, 200], [940, 300]], 1403]]) {
    const m = tornPiece(c, pts.concat([[pts[pts.length - 1][0], 340], [pts[0][0], 340]]), '#7f8ab8', { amp: 2, seed, rimCol: '#d8e0f4', shadow: 0.15 });
    clipped(c, m, () => piece(c, rectP(-20, 120, 960, 80), '#eef2fc', { mul: 0.2 }));
  }
  strip(c, -20, W + 20, x => 300 + 6 * fbm1(x / 70, 2), H, '#dfe6f6', { seed: 1404, rimCol: '#ffffff', shadow: 0.12 });
  const rp = rng(1405); for (let k = 0; k < 14; k++) snowPine(c, rp() * W, 304 + rp() * 10, 30 + rp() * 20, 1410 + k);
  // the little church
  pp(c, rectP(150, 300, 70, 70), '#efe6dc', 0.25); pp(c, poly([[140, 304], [185, 268], [230, 304]]), '#5a3a3a', 0.2); pp(c, poly([[140, 304], [185, 268], [230, 304], [222, 300], [185, 276], [148, 300]]), '#f4f8ff', 0);
  pp(c, rectP(196, 240, 22, 64), '#efe6dc', 0.2); pp(c, poly([[192, 242], [207, 200], [222, 242]]), '#5a3a3a', 0.2); glow(c, 185, 336, 26, '255,200,120', 0.7); pp(c, rectP(178, 322, 14, 24), '#ffd88a', 0);
  litChalet(c, 330, 392, 0.9); litChalet(c, 820, 400, 1.0);
  strip(c, -20, W + 20, x => 400 + 5 * fbm1(x / 90, 3), H, '#e8eef8', { seed: 1406, rimCol: '#ffffff', shadow: 0.16 });
  // the village Christmas tree
  for (let i = 0; i < 4; i++) { const w = 62 - i * 13, y = 410 - i * 34; pp(c, poly([[560 - w, y], [560, y - 52], [560 + w, y]]), i % 2 ? '#2f6a4a' : '#3a7a52', 0.25); }
  const rl = rng(1407); for (let k = 0; k < 18; k++) { const y = 400 - rl() * 130, half = (410 - y) * 0.42, x = 560 + (rl() - 0.5) * 2 * half; glow(c, x, y, 8, ['255,120,120', '255,220,120', '140,200,255'][k % 3], 0.9); }
  pp(c, poly([...Array(10)].map((_, i) => [560 + Math.cos(i * Math.PI / 5 - Math.PI / 2) * (i % 2 ? 6 : 14), 268 + Math.sin(i * Math.PI / 5 - Math.PI / 2) * (i % 2 ? 6 : 14)])), ARCH.gold, 0.15); glow(c, 560, 268, 30, '255,230,150', 0.8);
  strip(c, -20, W + 20, x => 470 + 6 * fbm1(x / 120, 4), H, '#f4f7fd', { seed: 1408, rimCol: '#ffffff', shadow: 0.2 });
}
function snowman(c, x, y, s) {
  c.save(); c.translate(x, y); c.scale(s, s);
  for (const [cy, r] of [[-26, 30], [-74, 22], [-108, 16]]) pp(c, circ(0, cy, r), '#fbfdff', 0.25);
  for (const [dx, dy] of [[-6, -112], [6, -112]]) { c.fillStyle = '#2f2a2e'; c.beginPath(); c.arc(dx, dy, 2.2, 0, TAU); c.fill(); }
  pp(c, poly([[0, -106], [18, -103], [0, -100]]), '#f08a3c', 0.1);
  for (const d of [-1, 1]) pp(c, slab([d * 20, -78], [d * 46, -96], 3), '#7a5a3a', 0.1);
  pp(c, rectP(-16, -128, 32, 6), '#3a3a4a', 0.15); pp(c, rectP(-10, -150, 20, 24), '#3a3a4a', 0.15);
  blush(c, [[-11, -104], [11, -104]], 3, 0.5); c.restore();
}
function pcXmasFront(c, W, H, res) {
  pcXmas(c, W, H);
  for (let i = 0; i < 7; i++) pp(c, ell(240 + i * 34, 590 - i * 6, 5, 2.4), '#d6e0f2', 0);                         // his paw prints in the snow
  snowman(c, 730, 580, 1.0);
  pcParker(c, res, BOX_SIT, 0.86, p => drawSitB(p, 'calm', 0.1, { pack: true, scarf: true, mouth: 'gift' }), 520, 590);
  snowFall(c, W, H, 1409);
  vignette(c, W, H, '80,90,140', 0.42, 1.0);
}

// ---- New Year's Day: the first sunrise of the year, right on the summit of Mt Fuji ----
function kadomatsu(c, x, y, s) {
  c.save(); c.translate(x, y); c.scale(s, s);
  for (const [dx, h] of [[-12, 118], [0, 140], [12, 104]]) { pp(c, rectP(dx - 7, -h, 14, h), '#5fa55a', 0.2); pp(c, ell(dx, -h, 7, 3.4), '#d8eec0', 0); }
  for (let i = 0; i < 8; i++) leaf(c, (i - 3.5) * 6, -36, 30, 6, -Math.PI / 2 + (i - 3.5) * 0.3, i % 2 ? '#2f6a4a' : '#3f7a52');
  for (const [dx, dy] of [[-22, -46], [24, -52], [-16, -60]]) flower(c, dx, dy, 5, '#e85a6a', 1500 + dx, false);
  pp(c, poly([[-30, -40], [30, -40], [26, 0], [-26, 0]]), '#d9c08a', 0.25); for (const yy of [-30, -14]) pp(c, rectP(-29, yy, 58, 4), '#a8864a', 0);
  c.restore();
}
function kagamiMochi(c, x, y, s) {
  c.save(); c.translate(x, y); c.scale(s, s);
  pp(c, poly([[-26, 0], [26, 0], [22, -12], [-22, -12]]), '#e8d4a8', 0.2);
  pp(c, ell(0, -22, 24, 11), '#fbfaf4', 0.2); pp(c, ell(0, -36, 18, 9), '#fbfaf4', 0.2);
  pp(c, circ(0, -50, 9), '#f39a2a', 0.15); leaf(c, 2, -58, 12, 4, -0.6, '#4f8a52');
  c.restore();
}
function pcNewYear(c, W, H) {
  skyBands(c, W, ['#283070', '#433f86', '#7c5f9e', '#d9839c', '#f4ad86', '#fbd68e'], 50, 290, 1500);
  // the rising sun sits exactly on the summit, rays fanning out behind
  c.save(); c.globalCompositeOperation = 'screen';
  for (let i = 0; i < 14; i++) { const a = -Math.PI + (i + 0.5) / 14 * Math.PI, L = 520; piece(c, poly([[450, 166], [450 + Math.cos(a - 0.04) * L, 166 + Math.sin(a - 0.04) * L], [450 + Math.cos(a + 0.04) * L, 166 + Math.sin(a + 0.04) * L]]), 'rgba(255,220,150,0.18)', { mul: 0, scr: 0 }); }
  glow(c, 450, 166, 300, '255,214,140', 0.8); c.restore();
  tornPiece(c, ellipsePts(450, 166, 30, 30, 48), '#fff0b8', { amp: 1, seed: 1501, shadow: 0, rimCol: '#fffbe8' });
  fujiShape(c, 450, 330, 330, 162);
  c.save(); c.globalCompositeOperation = 'screen'; glow(c, 450, 190, 110, '255,180,160', 0.5); c.restore();   // first light on the snow
  strip(c, -20, W + 20, x => 318 - 16 * Math.max(0, fbm1(x / 90, 2) + 0.4), H, '#3f4a78', { seed: 1502, rimCol: '#8a90c0', shadow: 0.15 });
  const lake = rectP(-20, 326, W + 40, 300); pp(c, lake, '#8a94c8', 0);
  clipped(c, lake, () => { c.save(); c.globalAlpha = 0.4; fujiShape(c, 450, 330, 330, 150, true); c.restore(); c.save(); c.globalAlpha = 0.6; const r = rng(1503); for (let k = 0; k < 12; k++) piece(c, rectP(450 - (12 - k) * 3 - r() * 8, 336 + k * 12, (12 - k) * 6 + r() * 20, 2.5), '#fbe2a0', { mul: 0.2 }); c.restore(); });
  pp(c, rectP(-20, 324, W + 40, 5), '#3f4a78', 0);
  for (const [x, y, s] of [[620, 110, 1.6], [668, 132, 1.3]]) bird(c, x, y, s, '#fff6ea');                       // two cranes flying into the new year
  strip(c, -20, W + 20, x => 486 + 6 * fbm1(x / 80, 4), H, '#e6e2ec', { seed: 1504, rimCol: '#ffffff', shadow: 0.2 });   // a dusting of snow on the shore
}
function pcNewYearFront(c, W, H, res) {
  pcNewYear(c, W, H);
  kadomatsu(c, 150, 590, 1.1); kagamiMochi(c, 720, 586, 1.2);
  pcParker(c, res, BOX_WAVE, 0.92, p => drawWaveB(p, 0, { pack: true, paws: 'bow' }), 450, 590);
  vignette(c, W, H, '120,90,140', 0.45, 1.05);
}

// ---- Chinese New Year: the Li River at dusk, red lanterns all along it, fireworks ----
function redLantern(c, x, y, s) {
  glow(c, x, y, 34 * s, '255,120,80', 0.55);
  pp(c, slab([x, y - 22 * s], [x, y - 14 * s], 2 * s), ARCH.gold, 0);
  pp(c, ell(x, y, 16 * s, 13 * s), '#d9332e', 0.2); clipped(c, ell(x, y, 16 * s, 13 * s), () => { for (const dx of [-8, 0, 8]) piece(c, ell(x + dx * s, y, 2 * s, 13 * s), '#b8282a', { mul: 0.4 }); });
  pp(c, rectP(x - 8 * s, y - 15 * s, 16 * s, 4 * s), ARCH.gold, 0); pp(c, rectP(x - 8 * s, y + 11 * s, 16 * s, 4 * s), ARCH.gold, 0);
  pp(c, rectP(x - 2 * s, y + 15 * s, 4 * s, 12 * s), '#e2a93d', 0);
}
function firework(c, x, y, r, col, seed) {
  glow(c, x, y, r * 1.6, col, 0.35); const rr = rng(seed), p = new Path2D();
  for (let i = 0; i < 16; i++) { const a = i / 16 * TAU + rr() * 0.1, L = r * (0.7 + rr() * 0.3); p.addPath(poly([[x + Math.cos(a) * 6, y + Math.sin(a) * 6], [x + Math.cos(a - 0.05) * L, y + Math.sin(a - 0.05) * L], [x + Math.cos(a) * (L + 6), y + Math.sin(a) * (L + 6)], [x + Math.cos(a + 0.05) * L, y + Math.sin(a + 0.05) * L]])); }
  c.save(); c.globalCompositeOperation = 'screen'; piece(c, p, `rgb(${col})`, { mul: 0, scr: 0.2 }); c.restore();
}
function pcCNY(c, W, H) {
  skyBands(c, W, ['#30244e', '#53305e', '#963e5a', '#d96a4a', '#f2a65e'], 40, 210, 1600);
  firework(c, 220, 90, 60, '255,200,120', 1601); firework(c, 640, 70, 70, '255,140,160', 1602); firework(c, 790, 160, 44, '255,230,160', 1603);
  karstRow(c, 236, '#8a5f86', 1604, 0, 60, 150, 0.35); karstRow(c, 270, '#6e4a72', 1605, 0, 90, 200, 0.3); karstRow(c, 304, '#55385c', 1606, 0, 110, 230, 0.25);
  const river = rectP(-20, 306, W + 40, 300); pp(c, river, '#5a3e66', 0);
  clipped(c, river, () => { c.save(); c.globalAlpha = 0.25; c.translate(0, 612); c.scale(1, -1); karstRow(c, 306, '#55385c', 1606, 0, 110, 230, 0); c.restore(); const r = rng(1607); for (let k = 0; k < 26; k++) piece(c, rectP(r() * W, 312 + r() * 200, 30 + r() * 60, 2), r() < 0.5 ? '#f2a65e' : '#e85a4a', { mul: 0.2 }); });
  // a small boat with a lantern on the water
  const hull = new Path2D(); hull.moveTo(560, 380); hull.quadraticCurveTo(620, 396, 700, 380); hull.lineTo(690, 392); hull.quadraticCurveTo(620, 404, 570, 392); hull.closePath(); pp(c, hull, '#3a2a30', 0.2);
  pp(c, slab([660, 382], [660, 346], 2), '#3a2a30', 0); redLantern(c, 660, 340, 0.6);
  // strings of red lanterns across the top
  for (const [y0, sag, n, s] of [[16, 60, 7, 0.9], [-6, 40, 6, 0.75]]) {
    c.save(); c.strokeStyle = '#3a2a30'; c.lineWidth = 2; c.beginPath(); c.moveTo(-20, y0); c.quadraticCurveTo(450, y0 + sag * 2, 920, y0); c.stroke(); c.restore();
    for (let i = 0; i < n; i++) { const u = (i + 0.5) / n, x = lerp(-20, 920, u), y = (1 - u) * (1 - u) * y0 + 2 * u * (1 - u) * (y0 + sag * 2) + u * u * y0 + 22 * s; redLantern(c, x, y, s); }
  }
  // the riverside pier
  pp(c, rectP(-20, 506, W + 40, 100), '#7a4a3a', 0.25); for (let k = 0; k < 9; k++) piece(c, rectP(-20, 512 + k * 11, W + 40, 2), '#5e3628', { mul: 0.4 });
  for (const x of [60, 840]) { pp(c, rectP(x - 5, 440, 10, 70), '#5e3628', 0.2); redLantern(c, x, 436, 1.0); }
}
function mandarins(c, x, y, s) { c.save(); c.translate(x, y); c.scale(s, s); pp(c, ell(0, 0, 40, 10), '#e8d4a8', 0.2); for (const [dx, dy] of [[-18, -10], [0, -12], [18, -10], [-9, -26], [9, -26]]) { pp(c, circ(dx, dy, 11), '#f39a2a', 0.15); leaf(c, dx + 2, dy - 10, 10, 3, -0.8, '#4f8a52'); } c.restore(); }
function firecrackers(c, x, y, s) { c.save(); c.translate(x, y); c.scale(s, s); pp(c, slab([0, -120], [0, -8], 2), '#7a5a3a', 0); for (let i = 0; i < 9; i++) pp(c, rectP(-10 + (i % 2) * 8, -110 + i * 11, 8, 12), '#d9332e', 0.12); pp(c, rectP(-8, -122, 16, 8), ARCH.gold, 0.1); c.restore(); }
function pcCNYFront(c, W, H, res) {
  pcCNY(c, W, H);
  mandarins(c, 250, 584, 1.2); firecrackers(c, 680, 590, 1.1);
  pcParker(c, res, BOX_WAVE, 0.92, p => drawWaveB(p, 0, { pack: true, paws: 'gong' }), 450, 590);
  vignette(c, W, H, '120,70,90', 0.45, 1.05);
}

// ---- Songkran: Tha Phae Gate in Chiang Mai, water flying everywhere; Parker soaked and delighted ----
function waterArc(c, x0, y0, x1, y1, h, w, seed) {
  const p = new Path2D(), mx = (x0 + x1) / 2, my = Math.min(y0, y1) - h;
  p.moveTo(x0, y0 - w / 2); p.quadraticCurveTo(mx, my - w / 2, x1, y1); p.quadraticCurveTo(mx, my + w / 2, x0, y0 + w / 2); p.closePath();
  c.save(); c.globalAlpha = 0.75; fp(c, p, '#8fd0f0', { sh: 0.12, mul: 0.2 }); c.restore();
  const r = rng(seed); for (let k = 0; k < 10; k++) { const u = 0.7 + r() * 0.35, x = lerp(x0, x1, u) + (r() - 0.5) * 40, y = lerp(y0, y1, u) - (1 - u) * h + (r() - 0.5) * 30; drop(c, x, y, 3 + r() * 3); }
}
function drop(c, x, y, s) { const p = new Path2D(); p.moveTo(x, y - s * 1.8); p.quadraticCurveTo(x + s, y, x, y + s); p.quadraticCurveTo(x - s, y, x, y - s * 1.8); fp(c, p, '#7cc4ec', { sh: 0.08, mul: 0.3 }); }
function waterGun(c, x, y, s, col) { c.save(); c.translate(x, y); c.scale(s, s); pp(c, rectP(-26, -14, 52, 14), col, 0.2); pp(c, rectP(-20, 0, 12, 20), col, 0.15); pp(c, rectP(18, -10, 16, 6), '#3a3a4a', 0); pp(c, circ(-6, -22, 10), '#8fd0f0', 0.12); c.restore(); }
function silverBowl(c, x, y, s) { c.save(); c.translate(x, y); c.scale(s, s); pp(c, poly([[-30, -20], [30, -20], [22, 0], [-22, 0]]), '#d6dae2', 0.22); pp(c, ell(0, -20, 30, 7), '#8fd0f0', 0); for (const dx of [-14, -2, 10]) pp(c, circ(dx, -22, 4), '#fff8ee', 0); for (let i = 0; i < 4; i++) piece(c, rectP(-24 + i * 14, -16, 6, 12), '#eef0f4', { mul: 0.3 }); c.restore(); }
function pcSongkran(c, W, H) {
  skyBands(c, W, ['#4fb0ea', '#68bcee', '#8acbf0', '#b4dcf2'], 40, 200, 1700);
  glow(c, 760, 70, 160, '255,250,220', 0.5);
  strip(c, -20, W + 20, x => 268 - 12 * Math.max(0, fbm1(x / 70, 9) + 0.4) * 1.6, H, '#5f9a80', { seed: 1701, rimCol: '#a8d0b8', shadow: 0.14, amp: 3 });
  // festival bunting strung across the sky
  for (const [y0, sag, seed] of [[30, 30, 1711], [96, 26, 1712]]) {
    c.save(); c.strokeStyle = '#7a5a48'; c.lineWidth = 1.6; c.beginPath(); c.moveTo(-20, y0); c.quadraticCurveTo(450, y0 + sag * 2, 920, y0); c.stroke(); c.restore();
    const cols = ['#e2463c', '#f7c234', '#5fae5a', '#3f8fd0', '#f58cbf', '#ffffff'];
    for (let i = 0; i < 22; i++) { const u = (i + 0.5) / 22, x = lerp(-20, 920, u), y = (1 - u) * (1 - u) * y0 + 2 * u * (1 - u) * (y0 + sag * 2) + u * u * y0; pp(c, poly([[x - 12, y], [x + 12, y], [x, y + 22]]), cols[(i + seed) % 6], 0.12); }
  }
  cityWall(c, W, 300, 420, 450);
  [[140, 294, 56], [760, 294, 60]].forEach(([x, y, w], j) => { const r2 = rng(1702 + j); for (let k = 0; k < 9; k++) leaf(c, x + (r2() - 0.5) * w, y + r2() * 10, 14, 5, r2() * TAU, '#4f9a52'); for (let k = 0; k < 18; k++) pp(c, circ(x + (r2() - 0.5) * w * 1.1, y - 6 + r2() * 26, 4.5 + r2() * 3), r2() < 0.5 ? '#e8559a' : '#f58cbf', 0); });
  // the wet street in front of the gate, with puddles
  strip(c, -20, W + 20, x => 420 + 2 * fbm1(x / 90, 3), H, '#d8c4a8', { seed: 1703, rimCol: '#f2e6d4', shadow: 0.2 });
  for (const [x, y, w] of [[200, 520, 70], [660, 540, 90], [420, 470, 60]]) { pp(c, ell(x, y, w, w * 0.18), '#9fcfe6', 0); piece(c, ell(x - w * 0.3, y - 2, w * 0.3, 2), '#e8f6fc', { mul: 0.2 }); }
  // water flying in from both sides
  waterArc(c, -20, 260, 380, 470, 150, 26, 1704); waterArc(c, 920, 240, 560, 470, 170, 28, 1705); waterArc(c, -20, 420, 330, 520, 90, 20, 1706); waterArc(c, 920, 400, 620, 520, 80, 22, 1707);
}
function pcSongkranFront(c, W, H, res) {
  pcSongkran(c, W, H);
  waterGun(c, 170, 590, 1.2, '#f39a2a'); waterGun(c, 760, 586, 1.1, '#5fae5a'); silverBowl(c, 300, 594, 1.1);
  const rb = rng(1712); c.save(); c.globalAlpha = 0.8; for (let k = 0; k < 26; k++) { const a = -Math.PI + rb() * Math.PI, R = 110 + rb() * 70; drop(c, 470 + Math.cos(a) * R * 1.2, 470 + Math.sin(a) * R * 0.9, 4 + rb() * 4); } c.restore();   // a burst of spray behind him
  pcParker(c, res, BOX_SHAKE, 1.0, p => drawShakeB(p, 1, { pack: true }), 470, 592);
  const r = rng(1710); for (let k = 0; k < 14; k++) drop(c, 330 + r() * 280, 380 + r() * 200, 3 + r() * 3);
  vignette(c, W, H, '120,160,190', 0.45, 1.05);
}


// ================= ISTANBUL + "WE MET" CARDS + friends added to ordinary cards =================
function galataTower(c, x, by, s) {
  c.save(); c.translate(x, by); c.scale(s, s);
  pp(c, rectP(-26, -170, 52, 170), '#d9c8ae', 0.25); clipped(c, rectP(-26, -170, 52, 170), () => { piece(c, rectP(8, -170, 18, 170), '#c4b094', { mul: 0.4 }); for (const y of [-120, -70]) piece(c, rectP(-26, y, 52, 4), '#bca888', { mul: 0.4 }); });
  for (const [wy, n] of [[-150, 3], [-100, 3], [-48, 2]]) for (let i = 0; i < n; i++) { const wx = -14 + i * (28 / Math.max(1, n - 1)); const w = new Path2D(); w.moveTo(wx - 3, wy + 10); w.lineTo(wx - 3, wy); w.arc(wx, wy, 3, Math.PI, 0); w.lineTo(wx + 3, wy + 10); w.closePath(); piece(c, w, '#4a3a38', { mul: 0.4 }); }
  pp(c, rectP(-32, -182, 64, 12), '#e6d6bc', 0.2); for (let i = 0; i < 7; i++) piece(c, rectP(-29 + i * 9, -180, 4, 8), '#8a7a6a', { mul: 0.4 });   // the balcony
  pp(c, poly([[-30, -182], [0, -246], [30, -182]]), '#4a5a7a', 0.25); pp(c, slab([0, -246], [0, -258], 2), ARCH.gold, 0);
  c.restore();
}
function mosque(c, x, by, s, col) {
  c.save(); c.translate(x, by); c.scale(s, s);
  for (const dx of [-70, -46, 46, 70]) { pp(c, rectP(dx - 3, -120, 6, 120), col, 0.08); pp(c, poly([[dx - 4, -120], [dx, -138], [dx + 4, -120]]), col, 0.05); }
  pp(c, rectP(-56, -40, 112, 40), col, 0.12);
  for (const [dx, r] of [[-34, 16], [34, 16]]) { const d = new Path2D(); d.moveTo(dx - r, -40); d.arc(dx, -40, r, Math.PI, 0); d.closePath(); pp(c, d, col, 0.08); }
  const dome = new Path2D(); dome.moveTo(-32, -54); dome.arc(0, -54, 32, Math.PI, 0); dome.closePath(); pp(c, rectP(-34, -56, 68, 18), col, 0.08); pp(c, dome, col, 0.1);
  pp(c, slab([0, -86], [0, -96], 1.5), col, 0); c.restore();
}
function ferry(c, x, y, s) {
  c.save(); c.translate(x, y); c.scale(s, s);
  piece(c, poly([[-80, 8], [80, 8], [60, 14], [-70, 14]]), 'rgba(255,255,255,0.7)', { mul: 0, scr: 0 });
  pp(c, poly([[-70, 0], [74, 0], [64, 10], [-62, 10]]), '#fbfaf4', 0.2); pp(c, rectP(-66, 0, 136, 3), '#2f4a6a', 0);
  pp(c, rectP(-44, -18, 90, 18), '#fbfaf4', 0.15); for (let i = 0; i < 8; i++) piece(c, rectP(-40 + i * 11, -14, 7, 6), '#5a7a9a', { mul: 0.4 });
  pp(c, rectP(-4, -34, 12, 16), '#2f2a2e', 0.12); pp(c, rectP(-4, -30, 12, 4), '#fbfaf4', 0);
  c.restore();
}
function simitCart(c, x, by, s) {
  c.save(); c.translate(x, by); c.scale(s, s);
  for (const dx of [-30, 30]) pp(c, circ(dx, -10, 10), '#3a3a40', 0.15);
  pp(c, rectP(-44, -54, 88, 40), '#d9332e', 0.25); pp(c, rectP(-40, -96, 80, 42), '#e8f2f6', 0.15); pp(c, rectP(-44, -100, 88, 6), '#d9332e', 0.1);
  for (const [dx, dy] of [[-22, -80], [0, -84], [22, -80], [-11, -68], [11, -68]]) { c.save(); c.translate(dx, dy); drawItem(c, 'simit', 0.42); c.restore(); }
  pp(c, slab([44, -40], [70, -54], 4), '#7a5a3a', 0.1);
  c.restore();
}
function teaGlass(c, x, by, s) {
  c.save(); c.translate(x, by); c.scale(s, s);
  pp(c, ell(0, -2, 14, 4), '#d9332e', 0.15);
  const g = new Path2D(); g.moveTo(-8, -32); g.quadraticCurveTo(-3, -18, -6, -4); g.lineTo(6, -4); g.quadraticCurveTo(3, -18, 8, -32); g.closePath();
  pp(c, g, '#c25a2a', 0.15); piece(c, rectP(-8, -32, 16, 5), '#f3e6d4', { mul: 0.2 }); piece(c, rectP(-5, -28, 2, 20), 'rgba(255,255,255,0.4)', { mul: 0, scr: 0 });
  c.restore();
}
function pcIstanbul(c, W, H, sunset) {
  skyBands(c, W, sunset ? ['#5a4a8a', '#9a5a8a', '#e07a7a', '#f4a46a', '#f8cc84'] : ['#78bde8', '#90caec', '#acd8ee', '#cfe6ee', '#efe2d0'], 50, 220, sunset ? 1910 : 1900);
  if (sunset) { glow(c, 640, 230, 300, '255,190,130', 0.6); tornPiece(c, ellipsePts(640, 236, 36, 36, 40), '#ffd98a', { amp: 1.2, seed: 1911, shadow: 0, rimCol: '#fff3cc' }); }
  // the old city across the water: domes and minarets
  const far = sunset ? '#7a5a86' : '#a6a6c4';
  strip(c, -20, W + 20, x => 296 + 4 * fbm1(x / 60, 2), H, far, { seed: 1901, rim: 0, shadow: 0.08, amp: 2 });
  mosque(c, 170, 298, 0.9, far); mosque(c, 360, 300, 0.6, far);
  // Galata hill: houses stepping up to the tower
  const hill = x => 300 - 70 * Math.exp(-(((x - 650) / 170) ** 2));
  const hp = strip(c, 440, W + 20, hill, H, sunset ? '#6a5a7a' : '#c9b8a0', { seed: 1902, rimCol: '#e8dcc8', shadow: 0.15 });
  const rh = rng(1903), cols = sunset ? ['#c98a7a', '#d9a080', '#b07a8a', '#e0b090'] : ['#f2c48a', '#e8907a', '#f6e2b8', '#a8c8d8', '#d9a6c0'];
  for (let k = 0; k < 26; k++) { const x = 460 + rh() * 440, top = hill(x) + 6 + rh() * 20, w = 18 + rh() * 16, h = 22 + rh() * 18; pp(c, rectP(x, top, w, h), cols[k % cols.length], 0.15); pp(c, poly([[x - 2, top], [x + w / 2, top - 8], [x + w + 2, top]]), '#c45a3a', 0.1); piece(c, rectP(x + 4, top + 6, 4, 6), '#5a4a48', { mul: 0.4 }); }
  galataTower(c, 650, 236, 0.85);
  // the Bosphorus
  strip(c, -20, W + 20, x => 312 + 1.5 * fbm1(x / 80, 3), H, sunset ? '#5a5a8a' : '#3f8fb0', { seed: 1904, rimCol: sunset ? '#e8a07a' : '#a6d6e6', amp: 1.5, shadow: 0.12 });
  wavyGlints(c, sunset ? 640 : 300, 330, 5, 110, 1905, sunset ? '#ffd98a' : '#ffffff', sunset ? '#f6b06a' : '#d6eef6');
  ferry(c, 300, 372, 1.0);
  [[140, 140, 1.2], [176, 120, 1], [520, 100, 1.1], [760, 160, 0.9], [420, 200, 0.8]].forEach(([x, y, s]) => bird(c, x, y, s, '#fbfaf4'));
  // the quay
  strip(c, -20, W + 20, x => 450 + 3 * fbm1(x / 120, 4), H, sunset ? '#b89a8a' : '#d8c8b0', { seed: 1906, rimCol: '#f2e6d4', shadow: 0.22 });
  for (let k = 0; k < 10; k++) piece(c, rectP(-20, 470 + k * 14, W + 40, 1.5), sunset ? '#a08070' : '#c4b094', { mul: 0.4 });
  pp(c, rectP(560, 494, 360, 40), sunset ? '#a88a7a' : '#cbb89a', 0.25); for (let k = 0; k < 6; k++) piece(c, rectP(560 + k * 60, 494, 2, 40), sunset ? '#8a6a5a' : '#b09a7a', { mul: 0.4 });   // a low stone wall
}
function pcIstanbulFront(c, W, H, res) {
  pcIstanbul(c, W, H, false);
  simitCart(c, 170, 580, 1.0); teaGlass(c, 290, 588, 1.2);
  pp(c, rectP(800, 470, 12, 30), '#5a5a62', 0.2); bird(c, 806, 462, 1.4, '#fbfaf4');                        // a gull on a bollard
  pcParker(c, res, BOX_SIT, 0.82, p => drawSitB(p, 'calm', 0.1, { pack: true, mouth: 'simit' }), 440, 588);
  vignette(c, W, H, '140,160,190', 0.45, 1.05);
}
const fr = (c, res, id, pose, x, y, k, flip) => pcParker(c, res, id === 'peafowl' && pose === 'display' ? { w: 320, h: 230, ox: 160, oy: 210 } : BOX_FRIEND[id], k, p => FRIEND_DRAW[id](p, pose), x, y, flip);
// --- we met: Simit, on the Bosphorus wall at sunset, sharing a sesame ring
function pcMeetCatFront(c, W, H, res) {
  pcIstanbul(c, W, H, true);
  fr(c, res, 'cat', 'loaf', 650, 500, 1.0, true);
  c.save(); c.translate(560, 486); drawItem(c, 'simit', 0.7); c.restore(); teaGlass(c, 610, 494, 0.9); teaGlass(c, 520, 494, 0.9);
  pcParker(c, res, BOX_SIT, 0.84, p => drawSitB(p, 'happy', 0.2, { pack: true }), 420, 588);
  vignette(c, W, H, '140,100,130', 0.45, 1.05);
}
// --- we met: Jade, in the misty Inthanon forest by a waterfall
function pcMeetPeafowl(c, W, H) {
  skyBands(c, W, ['#b8d6c8', '#c8e0d0', '#d8e8da', '#e8f0e4'], 40, 180, 2000);
  for (const [base, col, seed, mist] of [[200, '#9fc0ac', 2001, 0.5], [270, '#7aa68a', 2002, 0.4], [340, '#5a8a6a', 2003, 0.3]]) {
    strip(c, -20, W + 20, x => base - 40 * Math.abs(Math.sin(x / 60 + seed)) - 10 * fbm1(x / 30, seed), H, col, { seed, rimCol: shade(col, 1.2), shadow: 0.12 });
    c.save(); c.globalAlpha = mist; strip(c, -20, W + 20, x => base + 8 + 4 * Math.sin(x / 50), H, '#f2f6f0', { seed: seed + 5, rim: 0, shadow: 0, amp: 3 }); c.restore();
  }
  // the waterfall
  // mossy cliffs either side of the fall
  tornPiece(c, [[540, 440], [560, 200], [610, 130], [640, 150], [636, 440]], '#4a5e52', { amp: 3, seed: 2004, rimCol: '#7a9a80', shadow: 0.2 });
  tornPiece(c, [[700, 440], [704, 150], [740, 120], [800, 190], [820, 440]], '#435648', { amp: 3, seed: 2005, rimCol: '#7a9a80', shadow: 0.2 });
  for (const [x, y] of [[570, 230], [600, 300], [760, 220], [790, 320], [720, 380]]) tornPiece(c, ellipsePts(x, y, 18, 9, 16), '#6f9a5a', { amp: 2, seed: 2006 + x, rim: 0, shadow: 0.1 });
  // the white curtain of water, then the plunge pool and its spray
  const fall = poly([[632, 146], [708, 146], [714, 432], [626, 432]]); pp(c, fall, '#e8f4f6', 0.15);
  clipped(c, fall, () => { const rw = rng(2007); for (let k = 0; k < 16; k++) piece(c, rectP(628 + rw() * 84, 140 + rw() * 40, 2 + rw() * 4, 300), rw() < 0.5 ? '#b8dce6' : '#ffffff', { mul: 0.2 }); });
  pp(c, ell(670, 444, 110, 16), '#8fc8d6', 0.1);
  for (let k = 0; k < 9; k++) tornPiece(c, ellipsePts(600 + k * 18, 436 - (k % 2) * 6, 22, 10, 18), '#ffffff', { amp: 2, seed: 2010 + k, rim: 0, shadow: 0.04, mul: 0.3 });
  strip(c, -20, W + 20, x => 440 + 5 * fbm1(x / 90, 2), H, '#5f9a5a', { seed: 2006, rimCol: '#a6d08a', shadow: 0.2 });
  const rf = rng(2007); for (let k = 0; k < 10; k++) { const x = rf() * W; for (let i = 0; i < 5; i++) leaf(c, x, 470 + rf() * 40, 40, 8, -Math.PI / 2 + (i - 2) * 0.5, i % 2 ? '#3f7a4a' : '#4f8a52'); }
}
function pcMeetPeafowlFront(c, W, H, res) {
  pcMeetPeafowl(c, W, H);
  rhodo(c, 90, 520, 1.4, 2010); rhodo(c, 820, 530, 1.3, 2011);
  fr(c, res, 'peafowl', 'display', 590, 586, 1.05, true);
  pcParker(c, res, BOX_WAVE, 0.9, p => drawWaveB(p, 0, { pack: true, paws: 'bow' }), 300, 590);
  vignette(c, W, H, '120,150,130', 0.45, 1.05);
}
// --- we met: Kinako, playing in the torii tunnel
function pcMeetKinakoFront(c, W, H, res) {
  pcFushimi(c, W, H);
  stoneLantern(c, 820, 600, 1.4);
  fr(c, res, 'kinako', 'play', 590, 592, 1.25, true);
  pcParker(c, res, BOX_BOW, 0.82, p => drawPlayBowB(p, 'pant', { pack: true, wag: 0.25 }), 330, 590);
  bigTorii(c);
  vignette(c, W, H, '90,60,60', 0.4, 1.0);
}
// --- we met: Sasa, under the crescent moon and the stars in the dunes
function pcMeetFennec(c, W, H) {
  skyBands(c, W, ['#131a3e', '#1a2350', '#232e60', '#2e3a6e', '#3e4678'], 50, 260, 2100);
  const rs = rng(2101); for (let k = 0; k < 160; k++) { c.fillStyle = `rgba(255,248,226,${0.3 + rs() * 0.6})`; c.beginPath(); c.arc(rs() * W, rs() * 320, 0.5 + rs() * 1.2, 0, TAU); c.fill(); }
  glow(c, 230, 110, 160, '255,240,200', 0.4);
  const m = mk(120, 120), mc = m.getContext('2d'); piece(mc, circ(60, 60, 34), '#fff1c8', { mul: 0.3 }); mc.globalCompositeOperation = 'destination-out'; mc.fill(circ(76, 50, 30)); c.drawImage(m, 170, 50);   // a crescent moon, like the lake
  dune(c, -120, 160, 230, 460, 380, '#5a5a8a', '#3e3e6a', 2102);
  dune(c, 320, 620, 200, 1000, 380, '#62629a', '#44447a', 2103);
  dune(c, -200, 300, 400, 1100, 600, '#7070a8', '#55558a', 2104);
}
function pcMeetFennecFront(c, W, H, res) {
  pcMeetFennec(c, W, H);
  fr(c, res, 'fennec', 'sit', 600, 560, 1.25, true);
  pcParker(c, res, BOX_LIE, 0.82, p => drawLieB(p, 'calm', { headRot: -0.05 }), 380, 572);
  c.save(); c.globalCompositeOperation = 'screen'; glow(c, 480, 540, 200, '160,170,255', 0.2); c.restore();
  vignette(c, W, H, '50,50,100', 0.45, 1.0);
}
// where a friend stands when they show up on an ordinary card from their place
const FRIEND_SPOT = {
  istanbul: { pose: 'loaf', x: 700, y: 500, k: 0.8, flip: true },
  inthanon: { pose: 'stand', x: 150, y: 452, k: 0.55, flip: false },
  fushimi: { pose: 'sit', x: 660, y: 592, k: 0.85, flip: true },
  dunhuang: { pose: 'sit', x: 680, y: 556, k: 0.85, flip: true },
};

const POSTCARDS = [
  { id: 'chiangmai', rare: false, front: pcChiangMaiFront, scene: pcChiangMai, stamp: '#c4533f', ink: '#6c4a6e' },
  { id: 'pai', front: pcPaiFront, scene: pcPai, ink: '#7a4a6e' },
  { id: 'krabi', front: pcKrabiFront, scene: pcKrabi, ink: '#2f6f86' },
  { id: 'floatingmarket', front: pcMarketFront, scene: pcMarket, ink: '#7a4a32' },
  { id: 'inthanon', front: pcInthanonFront, scene: pcInthanon, ink: '#4f4a7a' },
  { id: 'fuji', front: pcFujiFront, scene: pcFuji, ink: '#4a5a8a' },
  { id: 'fushimi', front: pcFushimiFront, scene: pcFushimi, ink: '#8a3a2e' },
  { id: 'guilin', front: pcGuilinFront, scene: pcGuilin, ink: '#3f6a5a' },
  { id: 'swiss', front: pcSwissFront, scene: pcSwiss, ink: '#a8322e' },
  { id: 'furano', rare: true, front: pcFuranoFront, scene: pcFurano, ink: '#6a4a9a' },
  { id: 'dunhuang', rare: true, front: pcDunhuangFront, scene: pcDunhuang, ink: '#9a5a2a' },
  { id: 'tekapo', rare: true, front: pcTekapoFront, scene: pcTekapo, ink: '#2a3a6a' },
  { id: 'istanbul', front: pcIstanbulFront, scene: (c, W, H) => pcIstanbul(c, W, H, false), ink: '#2f4a6a' },
  { id: 'meet-cat', meet: 'cat', front: pcMeetCatFront, scene: (c, W, H) => pcIstanbul(c, W, H, true), ink: '#6a3a5a' },
  { id: 'meet-peafowl', meet: 'peafowl', front: pcMeetPeafowlFront, scene: pcMeetPeafowl, ink: '#2f6a5a' },
  { id: 'meet-kinako', meet: 'kinako', front: pcMeetKinakoFront, scene: pcFushimi, ink: '#8a3a2e' },
  { id: 'meet-fennec', meet: 'fennec', front: pcMeetFennecFront, scene: pcMeetFennec, ink: '#3a3a6a' },
  { id: 'fest-loykrathong', fest: 'loykrathong', front: pcLoyKrathongFront, scene: pcLoyKrathong, ink: '#3a3a7a' },
  { id: 'fest-christmas', fest: 'christmas', front: pcXmasFront, scene: pcXmas, ink: '#2a4a3a' },
  { id: 'fest-newyear', fest: 'newyear', front: pcNewYearFront, scene: pcNewYear, ink: '#7a3a4a' },
  { id: 'fest-cny', fest: 'cny', front: pcCNYFront, scene: pcCNY, ink: '#a8282a' },
  { id: 'fest-songkran', fest: 'songkran', front: pcSongkranFront, scene: pcSongkran, ink: '#2a6a8a' },
];

// ---- back: place name + a short line in both languages, stamp, postmark ----
function wrapText(c, text, x, y, maxW, lh) {
  const tokens = /[　-鿿＀-￯]/.test(text) ? [...text] : text.split(/(\s+)/);
  let line = '', yy = y;
  for (const t of tokens) { const test = line + t; if (c.measureText(test).width > maxW && line.trim()) { c.fillText(line.trim(), x, yy); line = t.trimStart(); yy += lh; } else line = test; }
  if (line.trim()) c.fillText(line.trim(), x, yy);
  return yy + lh;
}
function pawPrint(c, x, y, s, col) {
  c.save(); c.fillStyle = col; c.globalAlpha = 0.8;
  c.beginPath(); c.ellipse(x, y + 4 * s, 7 * s, 6 * s, 0, 0, TAU); c.fill();
  for (const [dx, dy] of [[-8, -4], [-3, -9], [3, -9], [8, -4]]) { c.beginPath(); c.ellipse(x + dx * s, y + dy * s, 2.6 * s, 3.2 * s, 0, 0, TAU); c.fill(); }
  c.restore();
}
function pcBack(c, W, H, pc, res, year, friend) {
  piece(c, rectP(0, 0, W, H), '#f8f0e1', { scr: 0.3 });
  tornPiece(c, [[W * 0.56 - 2, 60], [W * 0.56 + 2, 60], [W * 0.56 + 2, H - 60], [W * 0.56 - 2, H - 60]], '#dcc6a6', { amp: 0.8, seed: 5, rim: 0, shadow: 0.08 });
  const id = pc.id, L = 60, MW = W * 0.56 - 100;
  c.textAlign = 'left'; c.textBaseline = 'alphabetic';
  c.fillStyle = '#5b3f37'; c.font = `600 40px ${FONT}`; c.fillText(T(`pc.${id}.name`, 'zh') + (year ? '  ' + year : ''), L, 120);
  c.fillStyle = '#8a6a5c'; c.font = `20px ${FONT}`; c.fillText(`${T(`pc.${id}.name`, 'en')}${year ? ' ' + year : ''} · ${T(`pc.${id}.country`, 'en')}`, L, 154);
  const hasMsg = STRINGS.zh[`pc.${id}.msg`] !== undefined;
  c.fillStyle = '#5b3f37'; c.font = `24px ${FONT}`; let y = wrapText(c, hasMsg ? T(`pc.${id}.msg`, 'zh') : T('pc.placeholder', 'zh'), L, 216, MW, 38);
  c.fillStyle = '#7d6155'; c.font = `italic 19px ${FONT}`; y = wrapText(c, hasMsg ? T(`pc.${id}.msg`, 'en') : T('pc.placeholder', 'en'), L, y + 14, MW, 30);
  if (friend) { c.fillStyle = '#5b3f37'; c.font = `20px ${FONT}`; c.fillText(T('pc.withFriend', 'zh', { name: T('fr.' + friend, 'zh') }), L, y + 10); c.fillStyle = '#7d6155'; c.font = `italic 17px ${FONT}`; c.fillText(T('pc.withFriend', 'en', { name: T('fr.' + friend, 'en') }), L, y + 38); }
  c.fillStyle = '#5b3f37'; c.font = `22px ${FONT}`; c.textAlign = 'right'; c.fillText(T('pc.from', 'zh'), W * 0.56 - 70, H - 90);
  pawPrint(c, W * 0.56 - 48, H - 100, 1.1, '#9a6b5c');
  // stamp: perforated paper with a tiny scene of this place
  const sx = W - 180, sy = 56, sw = 124, sh = 150;
  const stamp = mk(sw * res, sh * res), sc = stamp.getContext('2d'); sc.scale(res, res);
  piece(sc, rectP(0, 0, sw, sh), '#fffaf0', { mul: 0.4 });
  piece(sc, rectP(10, 10, sw - 20, sh - 34), '#efc9a8', { mul: 0.5 });
  sc.save(); sc.beginPath(); sc.rect(10, 10, sw - 20, sh - 34); sc.clip(); sc.translate(10, 10); sc.scale((sw - 20) / PC_W * 1.6, (sh - 34) / PC_H * 1.1); sc.translate(-180, -150); (pc.scene || pc.front).call(pc, sc, PC_W, PC_H, res); sc.restore();
  sc.fillStyle = '#6b4a3f'; sc.font = `600 13px ${FONT}`; sc.textAlign = 'center'; sc.fillText(T(`pc.${id}.country`, 'en').split(', ').pop().toUpperCase(), sw / 2, sh - 10);
  sc.globalCompositeOperation = 'destination-out';
  for (let x = 0; x <= sw; x += 10) { sc.beginPath(); sc.arc(x, 0, 3.4, 0, TAU); sc.arc(x, sh, 3.4, 0, TAU); sc.fill(); }
  for (let yy = 0; yy <= sh; yy += 10) { sc.beginPath(); sc.arc(0, yy, 3.4, 0, TAU); sc.arc(sw, yy, 3.4, 0, TAU); sc.fill(); }
  c.save(); c.translate(sx + sw / 2, sy + sh / 2); c.rotate(0.04);
  castShadow(c, x => x.drawImage(stamp, -sw / 2, -sh / 2, sw, sh), 3, 1, 3, 0.25); c.drawImage(stamp, -sw / 2, -sh / 2, sw, sh); c.restore();
  // postmark (ink)
  c.save(); c.strokeStyle = pc.ink; c.fillStyle = pc.ink; c.globalAlpha = 0.55; c.lineWidth = 2;
  const px = sx - 20, py = sy + 120;
  c.beginPath(); c.arc(px, py, 46, 0, TAU); c.stroke(); c.beginPath(); c.arc(px, py, 38, 0, TAU); c.stroke();
  c.font = `600 10px ${FONT}`; c.textAlign = 'center'; c.fillText(T(`pc.${id}.name`, 'en').split(' ').slice(0, 2).join(' ').toUpperCase(), px, py - 4); c.fillText('· 2026 ·', px, py + 14);
  for (let i = 0; i < 4; i++) { c.beginPath(); for (let x = 0; x <= 120; x += 4) { const yy = py - 22 + i * 13 + Math.sin(x / 9) * 3; x ? c.lineTo(px + 50 + x, yy) : c.moveTo(px + 50, yy); } c.stroke(); }
  c.restore();
  // address lines
  c.fillStyle = '#5b3f37'; c.font = `21px ${FONT}`; c.textAlign = 'left';
  c.fillText(T('pc.to', 'zh'), W * 0.6, 380); c.fillStyle = '#8a6a5c'; c.font = `17px ${FONT}`; c.fillText(T('pc.to', 'en'), W * 0.6, 410);
  for (let i = 0; i < 3; i++) tornPiece(c, [[W * 0.6, 446 + i * 40], [W - 60, 446 + i * 40], [W - 60, 449 + i * 40], [W * 0.6, 449 + i * 40]], '#dcc6a6', { amp: 0.5, seed: 9 + i, rim: 0, shadow: 0 });
}

// a place whose card isn't drawn yet (stage 3 fills these in, 4 at a time)
function pcPlaceholderFront(c, W, H) {
  piece(c, rectP(0, 0, W, H), '#efe3cf', { scr: 0.3 });
  strip(c, -20, W + 20, x => H * 0.62 + 10 * Math.sin(x / 120), H, '#d9c8ab', { seed: 3, shadow: 0.15 });
  c.fillStyle = '#7d6155'; c.textAlign = 'center'; c.font = `600 44px ${FONT}`; c.fillText(T(`pc.${this.id}.name`), W / 2, H * 0.42);
  c.font = `22px ${FONT}`; c.fillText(T('pc.placeholder'), W / 2, H * 0.42 + 46);
}
function pcEntry(id) { return POSTCARDS.find(p => p.id === id) || { id, ink: '#6c4a6e', front: pcPlaceholderFront }; }
const _pcCache = new Map();
function postcardCanvas(id, side, res, year, friend) {
  const key = `${id}:${side}:${res}:${LANG}:${year || ''}:${friend || ''}`; if (_pcCache.has(key)) return _pcCache.get(key);
  const pc = pcEntry(id), cv = mk(PC_W * res, PC_H * res), c = cv.getContext('2d'); c.scale(res, res);
  if (side === 'front') pc.front.call(pc, c, PC_W, PC_H, res); else pcBack(c, PC_W, PC_H, pc, res, year, friend);
  if (side === 'front' && friend && FRIEND_SPOT[id]) { const f = FRIEND_SPOT[id]; fr(c, res, friend, f.pose, f.x, f.y, f.k, f.flip); }
  _pcCache.set(key, cv); return cv;
}
