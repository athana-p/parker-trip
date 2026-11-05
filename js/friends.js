// ================= FRIENDS Parker meets on his trips: cut-paper puppets in his style =================
// Puppet space like Parker's: origin = ground under the body, facing right. Each has two poses (draw<Friend>(c, pose, o)).

// small shared face bits
function dotEyes(c, pts, r, closed) { eyes(c, pts, r, closed ? 'happy' : 'calm'); }
function catNose(c, x, y, s, col = '#f08a9a') { const p = new Path2D(); p.moveTo(x - 4 * s, y - 2 * s); p.lineTo(x + 4 * s, y - 2 * s); p.lineTo(x, y + 2.5 * s); p.closePath(); pp(c, p, col, 0.08); }
function whiskers(c, x, y, s, dir = 1) { c.save(); c.strokeStyle = 'rgba(120,90,80,0.55)'; c.lineWidth = 1.1 * s; c.lineCap = 'round'; for (const d of [-1, 1]) for (const k of [-1, 1]) { c.beginPath(); c.moveTo(x + d * 10 * s, y + k * 2 * s); c.lineTo(x + d * 26 * s, y + k * 5 * s - 2 * s); c.stroke(); } c.restore(); }
function wMouth(c, x, y, s) { c.save(); c.strokeStyle = PK.line; c.lineWidth = 1.6 * s; c.lineCap = 'round'; c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo(x - 3 * s, y + 5 * s, x - 7 * s, y + 2 * s); c.moveTo(x, y); c.quadraticCurveTo(x + 3 * s, y + 5 * s, x + 7 * s, y + 2 * s); c.stroke(); c.restore(); }

// ---------- 1. Simit, an Istanbul street cat: a tuxedo ("cow") cat — white with black patches, a black cap over one ear and eye,
//            a little black "moustache" spot, and one ear tip clipped (a neutered street cat) ----------
const CAT = { fur: '#fbf8f2', black: '#2f2b2e', earIn: '#f4b6a8' };
function catHead(c, x, y, s, closed) {
  c.save(); c.translate(x, y); c.scale(s, s);
  const earL = poly([[-30, -10], [-26, -44], [-6, -24]]), earR = poly([[8, -26], [22, -38], [28, -40], [32, -8]]);
  pp(c, earL, CAT.black, 0.15); pp(c, earR, CAT.fur, 0.15);
  piece(c, poly([[-25, -14], [-23, -34], [-12, -24]]), '#6a5058', { mul: 0.4 }); piece(c, poly([[13, -24], [22, -32], [25, -32], [26, -12]]), CAT.earIn, { mul: 0.4 });
  const head = union(ell(0, 0, 34, 28), ell(0, 8, 38, 22)); pp(c, head, CAT.fur, 0.2);
  clipped(c, head, () => { piece(c, ell(-22, -12, 26, 22, 0.3), CAT.black, { mul: 0.4 }); piece(c, ell(26, -24, 14, 9, -0.3), CAT.black, { mul: 0.4 }); });   // the black cap and a small patch
  piece(c, ell(5, 15, 4.5, 3), CAT.black, { mul: 0.4 });                     // the "moustache" spot
  blush(c, [[-20, 10], [24, 10]], 5.5, 0.5);
  c.save(); if (!closed) { c.fillStyle = '#fbf8f2'; for (const [ex, ey] of [[-12, -2]]) { c.beginPath(); c.arc(ex, ey, 5.6, 0, TAU); c.fill(); } } c.restore();   // a pale ring so the eye inside the black patch still reads
  dotEyes(c, [[-12, -2], [16, -2]], 4.2, closed);
  catNose(c, 2, 8, 1); wMouth(c, 2, 10.5, 1); whiskers(c, 2, 12, 1);
  c.restore();
}
function catPatches(c, body, spots) { clipped(c, body, () => spots.forEach(([x, y, rx, ry, a]) => piece(c, ell(x, y, rx, ry, a || 0), CAT.black, { mul: 0.4 }))); }
function drawCat(c, pose = 'sit') {
  if (pose === 'loaf') {                                                     // the loaf: paws tucked in, eyes closed in the sun
    pp(c, limb([-40, -10], [30, -6], 14, 12), CAT.black, 0.15);             // black tail wrapped along the front
    const body = ell(-6, -26, 44, 26); pp(c, body, CAT.fur, 0.2);
    catPatches(c, body, [[-26, -40, 22, 16, 0.2], [8, -48, 14, 8], [-44, -20, 10, 14]]);
    for (const dx of [16, 30]) pp(c, ell(dx, -6, 8, 5), CAT.fur, 0.12);
    catHead(c, 30, -46, 0.95, true);
    return;
  }
  // sitting tall, the black tail curled round the white front paws
  const tl = new Path2D(); tl.moveTo(-26, -14); tl.quadraticCurveTo(-46, -2, -20, 2); tl.lineTo(24, 2); tl.lineTo(24, -6); tl.lineTo(-18, -6); tl.quadraticCurveTo(-34, -8, -20, -16); tl.closePath(); pp(c, tl, CAT.black, 0.15);
  const body = union(ell(0, -44, 28, 40), ell(-6, -18, 30, 18)); pp(c, body, CAT.fur, 0.2);
  catPatches(c, body, [[-22, -56, 18, 26, 0.2], [-14, -14, 16, 10], [20, -70, 8, 6]]);
  for (const dx of [2, 16]) pp(c, union(limb([dx, -40], [dx + 1, -6], 10, 9), ell(dx + 2, -5, 7.5, 5)), CAT.fur, 0.15);
  for (const dx of [-12, 16]) pp(c, ell(dx, -3, 8, 4.5), CAT.fur, 0.1);
  catHead(c, 8, -98, 1, false);
}

// ---------- 2. Jade, a green peafowl from northern Thailand: scaled green plumage, a straight crest, blue-and-yellow face ----------
const PEA = { body: '#2f8a78', scale: '#1f6a5e', light: '#5fb8a0', wing: '#8a7a3a', train: '#3f7a52', eyeA: '#c99a3a', eyeB: '#2f5ab0', face: '#f2c94a', blue: '#3f6fd0' };
function scales(c, path, x0, y0, w, h, r = 5) { clipped(c, path, () => { for (let y = y0; y < y0 + h; y += r * 1.4) for (let x = x0 + ((y / (r * 1.4)) % 2) * r; x < x0 + w; x += r * 2) { piece(c, circ(x, y, r), PEA.scale, { mul: 0.3 }); piece(c, circ(x, y - r * 0.3, r * 0.6), PEA.light, { mul: 0.3 }); } }); }
function eyespot(c, x, y, s) { pp(c, ell(x, y, 7 * s, 9 * s), PEA.eyeA, 0.08); pp(c, ell(x, y, 4.5 * s, 6 * s), PEA.blue, 0); pp(c, ell(x, y + s, 2.4 * s, 3 * s), '#16244a', 0); }
function peaHead(c, x, y) {
  for (let i = -1; i <= 1; i++) { pp(c, slab([x + i * 2, y - 8], [x + i * 3, y - 30], 2), PEA.body, 0.05); pp(c, ell(x + i * 3, y - 32, 3.4, 5), PEA.light, 0.05); }   // the straight crest
  pp(c, slab([x - 2, y + 2], [x - 4, y + 40], 14), PEA.body, 0.15);
  scales(c, slab([x - 2, y + 2], [x - 4, y + 40], 14), x - 14, y, 24, 40, 3.2);
  pp(c, ell(x, y, 11, 10), PEA.body, 0.15);
  pp(c, ell(x + 3, y + 3, 6, 5), PEA.face, 0); pp(c, ell(x + 3, y - 2, 5, 3.4), PEA.blue, 0);
  pp(c, poly([[x + 9, y - 2], [x + 20, y + 1], [x + 9, y + 3]]), '#d6cdb8', 0.05);
  dotEyes(c, [[x + 4, y - 2]], 2.2, false);
}
function drawPeafowl(c, pose = 'stand') {
  if (pose === 'display') {                                                  // fan open behind, facing you
    const fan = new Path2D(); fan.moveTo(0, -60); fan.arc(0, -60, 120, Math.PI * 1.02, Math.PI * 1.98); fan.closePath();
    pp(c, fan, PEA.train, 0.25);
    clipped(c, fan, () => { for (let i = 0; i < 18; i++) { const a = Math.PI * (1.04 + i / 17 * 0.92); piece(c, slab([0, -60], [Math.cos(a) * 124, -60 + Math.sin(a) * 124], 2), '#2f5a40', { mul: 0.3 }); } });
    for (const R of [110, 82, 56]) for (let i = 0; i < (R > 100 ? 11 : R > 70 ? 8 : 5); i++) { const n = R > 100 ? 11 : R > 70 ? 8 : 5, a = Math.PI * (1.08 + i / (n - 1) * 0.84); eyespot(c, Math.cos(a) * R, -60 + Math.sin(a) * R, R / 90); }
    for (const d of [-1, 1]) pp(c, union(limb([d * 8, -30], [d * 10, -4], 5, 4), ell(d * 12, -3, 7, 2.5)), '#9a9488', 0.1);
    const body = ell(0, -56, 22, 32); pp(c, body, PEA.body, 0.2); scales(c, body, -24, -90, 48, 64, 4);
    peaHead(c, 2, -104);
    return;
  }
  // standing, the long train sweeping behind
  const tr = new Path2D(); tr.moveTo(-6, -64); tr.bezierCurveTo(-60, -60, -110, -30, -150, -4); tr.lineTo(-138, 0); tr.bezierCurveTo(-90, -14, -40, -30, 4, -40); tr.closePath();
  pp(c, tr, PEA.train, 0.2); clipped(c, tr, () => { for (let i = 0; i < 6; i++) piece(c, slab([-10 - i * 4, -50], [-140 + i * 6, -2], 1.6), '#2f5a40', { mul: 0.3 }); });
  for (let i = 0; i < 6; i++) { const u = 0.25 + i * 0.13; eyespot(c, lerp(-10, -146, u), lerp(-54, -4, u) + Math.sin(u * 3) * 4, 0.75); }
  for (const dx of [-2, 12]) pp(c, union(limb([dx, -40], [dx + 2, -4], 5, 4), ell(dx + 6, -3, 8, 2.5)), '#9a9488', 0.1);
  const body = ell(4, -62, 26, 30, -0.2); pp(c, body, PEA.body, 0.2); scales(c, body, -24, -94, 56, 64, 4);
  const wing = ell(-4, -60, 20, 15, -0.2); pp(c, wing, PEA.wing, 0.15); clipped(c, wing, () => { for (let k = 0; k < 4; k++) piece(c, rectP(-30, -72 + k * 7, 60, 2.4), '#5a4a22', { mul: 0.4 }); });
  peaHead(c, 26, -128);
}

// ---------- 3. Kinako, a little red Shiba from Kyoto: orange-red with white cheeks, chest and socks, white "eyebrow" dots, black nose ----------
const KIN = { fur: '#e3904a', dark: '#c8742e', white: '#fff6ea', earIn: '#f6e2c6', nose: '#2a2321' };
function kinakoHead(c, x, y, s, rot = 0, expr = 'calm') {
  c.save(); c.translate(x, y); c.rotate(rot); c.scale(s, s);
  for (const E of [{ b1: [-54, -18], b2: [-20, -48], tip: [-48, -84], r: 11 }, { b1: [20, -50], b2: [54, -20], tip: [52, -82], r: 11 }]) { pp(c, earPath(E.b1, E.b2, E.tip, E.r), KIN.dark, 0.15); const m = mix(E.b1, E.b2, 0.5); piece(c, earPath(mix(m, E.b1, 0.6), mix(m, E.b2, 0.6), mix(m, E.tip, 0.8), 7), KIN.earIn, { mul: 0.4 }); }
  const head = union(ell(0, -6, 58, 52), ell(0, 14, 64, 44)); pp(c, head, KIN.fur, 0.2);
  clipped(c, head, () => { for (const d of [-1, 1]) piece(c, ell(d * 34, 26, 30, 24), KIN.white, { mul: 0.3 }); piece(c, ell(4, 30, 30, 22), KIN.white, { mul: 0.3 }); });   // urajiro
  for (const [ex] of [[-20], [34]]) pp(c, ell(ex, -24, 6.5, 4), KIN.white, 0.05);                       // the white eyebrow dots
  blush(c, [[-34, 20], [50, 18]], 9, 0.5);
  eyes(c, [[-20, -4], [34, -4]], 6.5, expr);
  const p = new Path2D(); p.moveTo(-7, 12); p.quadraticCurveTo(7, 4, 21, 12); p.quadraticCurveTo(14, 26, 7, 26); p.quadraticCurveTo(0, 26, -7, 12); p.closePath(); pp(c, p, KIN.nose, 0.1);
  mouthFront(c, 7, 28, 1, expr === 'happy' ? 'happy' : 'w');
  c.restore();
}
function drawKinako(c, pose = 'sit') {
  if (pose === 'play') {                                                     // play bow, tail high
    for (const d of [0, 1]) pp(c, union(limb([-36 + d * 10, -50], [-40 + d * 10, -4], 16, 13), ell(-36 + d * 10, -3, 9, 5.5)), d ? KIN.fur : KIN.dark, 0.12);
    tail(c, -50, -86, 16); clipped(c, circ(-50, -86, 16), () => piece(c, circ(-50, -86, 16), KIN.fur, { mul: 0.4 })); piece(c, ell(-46, -80, 9, 6), KIN.white, { mul: 0.3 });
    const body = union(ell(-6, -40, 44, 22, 0.4), circ(-30, -52, 22), circ(22, -26, 22)); pp(c, body, KIN.fur, 0.2);
    clipped(c, body, () => piece(c, ell(4, -18, 40, 9, 0.4), KIN.white, { mul: 0.3 }));
    for (const d of [0, 1]) pp(c, union(limb([26 + d * 6, -16], [62 + d * 6, -6], 13, 12), ell(66 + d * 6, -5, 9, 5)), d ? KIN.white : '#f2e6d2', 0.15);
    pp(c, slab([34, -42], [42, -26], 7), '#d9332e', 0.1);
    kinakoHead(c, 52, -46, 0.6, -0.12, 'happy');
    return;
  }
  // sitting, head tilted with curiosity
  tail(c, -32, -46, 15); clipped(c, circ(-32, -46, 15), () => piece(c, circ(-32, -46, 15), KIN.fur, { mul: 0.4 }));
  for (const d of [-1, 1]) pp(c, ell(d * 24, -14, 18, 14), KIN.fur, 0.15);
  const body = ell(0, -42, 28, 34); pp(c, body, KIN.fur, 0.2);
  pp(c, ell(0, -46, 18, 24), KIN.white, 0.08);                                                    // white chest
  for (const d of [-1, 1]) { pp(c, limb([d * 11, -40], [d * 12, -6], 13, 12), KIN.fur, 0.15); pp(c, ell(d * 12, -4, 9, 5.5), KIN.white, 0.12); pp(c, ell(d * 32, -4, 9, 5), KIN.white, 0.1); }
  const col = new Path2D(); col.moveTo(-24, -66); col.quadraticCurveTo(0, -54, 24, -66); col.lineTo(24, -59); col.quadraticCurveTo(0, -47, -24, -59); col.closePath(); pp(c, col, '#d9332e', 0.12);
  pp(c, circ(0, -50, 4.5), ARCH.gold, 0.12); piece(c, rectP(-2.5, -50, 5, 1.4), '#8a6a2a', { mul: 0.4 });   // little bell
  kinakoHead(c, 0, -98, 0.6, 0.22, 'calm');
}

// ---------- 4. Sasa, a fennec fox in the Dunhuang dunes: sand-coloured, enormous ears, black-tipped tail ----------
const FEN = { fur: '#ecc890', dark: '#d8a868', white: '#fff6e6', earIn: '#f6b8a8', tip: '#3a2e2a' };
function fennecHead(c, x, y, s, folded, closed) {
  c.save(); c.translate(x, y); c.scale(s, s);
  // big broad ears (a narrow tip needs a small corner radius, or the rounding eats the whole ear)
  const ears = folded ? [[[-20, -4], [-2, -18], [-54, -26]], [[2, -18], [20, -4], [54, -22]]] : [[[-26, -4], [-2, -20], [-40, -80]], [[2, -20], [26, -4], [42, -78]]];
  for (const [b1, b2, tip] of ears) { pp(c, earPath(b1, b2, tip, 4), FEN.fur, 0.15); const m = mix(b1, b2, 0.5); piece(c, earPath(mix(m, b1, 0.62), mix(m, b2, 0.62), mix(m, tip, 0.8), 3), FEN.earIn, { mul: 0.4 }); }
  const head = union(ell(0, 0, 24, 20), poly([[-14, 4], [0, 24], [14, 4]])); pp(c, head, FEN.fur, 0.2);
  clipped(c, head, () => piece(c, ell(0, 16, 14, 10), FEN.white, { mul: 0.3 }));
  dotEyes(c, [[-9, -1], [9, -1]], 3.8, closed);
  pp(c, ell(0, 20, 3.4, 2.6), FEN.tip, 0.05); blush(c, [[-14, 8], [14, 8]], 4, 0.45);
  c.restore();
}
function drawFennec(c, pose = 'sit') {
  if (pose === 'sleep') {                                                    // curled up, the bushy tail over the nose
    const body = ell(0, -20, 40, 22); pp(c, body, FEN.fur, 0.2);
    fennecHead(c, 24, -26, 0.9, true, true);
    const t = new Path2D(); t.moveTo(-36, -18); t.bezierCurveTo(-30, 8, 30, 6, 44, -12); t.bezierCurveTo(30, -2, -16, -4, -24, -26); t.closePath(); pp(c, t, FEN.dark, 0.18);
    pp(c, ell(42, -12, 9, 7, -0.4), FEN.tip, 0.1);
    return;
  }
  const t = new Path2D(); t.moveTo(-14, -18); t.bezierCurveTo(-46, -20, -50, 0, -16, 2); t.lineTo(10, 2); t.bezierCurveTo(-20, -6, -26, -14, -10, -24); t.closePath(); pp(c, t, FEN.dark, 0.15);
  pp(c, ell(12, 0, 8, 5), FEN.tip, 0.1);                                                          // black tail tip by the paws
  const body = ell(0, -30, 20, 28); pp(c, body, FEN.fur, 0.2); pp(c, ell(3, -34, 11, 17), FEN.white, 0.08);
  for (const d of [-1, 1]) pp(c, union(limb([d * 7, -26], [d * 8, -4], 8, 7), ell(d * 8, -3, 6, 3.5)), FEN.fur, 0.12);
  fennecHead(c, 2, -66, 1, false, false);
}

const FRIEND_DRAW = { cat: drawCat, peafowl: drawPeafowl, kinako: drawKinako, fennec: drawFennec };
const BOX_FRIEND = { cat: { w: 140, h: 190, ox: 60, oy: 170 }, peafowl: { w: 300, h: 230, ox: 170, oy: 210 }, kinako: { w: 200, h: 190, ox: 90, oy: 170 }, fennec: { w: 150, h: 180, ox: 70, oy: 160 } };
