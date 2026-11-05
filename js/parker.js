// ================= PARKER: white Shiba paper puppet (stage 0a: two design options) =================
// Puppet space: origin = ground point under the body centre, facing right, y up is negative.
// Each drawing is a set of paper pieces; changing expression = swapping the drawing.

const PK = {
  fur: '#fdf9f1',      // warm white
  furS: '#efe4d2',     // shadow-side cream (belly, far legs)
  cream: '#f0dcbc',    // faint cream on back / crown / tail
  ear: '#e8bb8a',      // apricot ear backs + rims
  earIn: '#eeb0a2',    // pink inner ear
  muzzle: '#fffaf2',   // muzzle: a slightly brighter sheet of white
  nose: '#7d5044',     // liver-brown nose
  noseD: '#4e3029',    // freckles on the nose
  eye: '#2a1c17',
  line: '#5b3a32',     // the only "lines": eye arcs, mouth
  tongue: '#ea8899',
  mouth: '#6e3436',
  blush: '#f3a3a6',
  harness: '#3f68a6',  // (0a placeholder, design A only)
  // his real harness: neck loop = yellow (his right side) + green (his left side), navy strap along the spine,
  // girth = short red piece over the back + khaki round the belly, light-blue strap down the chest
  hYellow: '#e3ad3a', hGreen: '#86a54b', hNavy: '#2f3b62', hRed: '#c45e4b', hKhaki: '#cbbb8a', hBlue: '#62a0c6',
  metal: '#cfcbc2', buckle: '#2c2a2a',
};

// fur piece = paper piece casting a small shadow on what's below (white on white needs this)
function fp(c, p, col, o = {}) {
  if (o.sh !== 0) castShadow(c, p, o.blur ?? 2.2, 0.8, 2, o.sh ?? 0.16);
  piece(c, p, col, { mul: o.mul ?? 0.38, scr: o.scr ?? 0.2 });
}
function clipped(c, clip, fn) { c.save(); c.clip(clip); fn(); c.restore(); }
function rot(p, c, a) { const s = Math.sin(a), k = Math.cos(a), x = p[0] - c[0], y = p[1] - c[1]; return [c[0] + x * k - y * s, c[1] + x * s + y * k]; }
const mix = (a, b, u) => [lerp(a[0], b[0], u), lerp(a[1], b[1], u)];

// ---- ears: rounded triangle; inner = smaller triangle toward the base ----
function earPath(b1, b2, tip, r = 7) {
  const m = mix(b1, b2, 0.5), out = [m[0] - (tip[0] - m[0]) * 0.1, m[1] - (tip[1] - m[1]) * 0.1];
  const p = new Path2D(); p.moveTo(b1[0], b1[1]); p.arcTo(tip[0], tip[1], b2[0], b2[1], r); p.lineTo(b2[0], b2[1]);
  p.quadraticCurveTo(out[0], out[1], b1[0], b1[1]); p.closePath(); return p;
}
function ear(c, E, o = {}) {
  let { b1, b2, tip } = E; const r = E.r || 7;
  if (o.droop) { const m = mix(b1, b2, 0.5); [b1, b2, tip] = [b1, b2, tip].map(p => rot(p, m, o.droop)); }
  const m = mix(b1, b2, 0.5);
  fp(c, earPath(b1, b2, tip, r), PK.ear, { mul: 0.7 });
  if (o.inner !== false) {
    const k = o.innerK || 0.6, sh = o.innerShift || [0, 0];
    const ib1 = mix(m, b1, k), ib2 = mix(m, b2, k), it = mix(m, tip, 0.8);
    const s = [sh[0], sh[1]];
    piece(c, earPath([ib1[0] + s[0], ib1[1] + s[1]], [ib2[0] + s[0], ib2[1] + s[1]], [it[0] + s[0], it[1] + s[1]], r * 0.7), PK.earIn, { mul: 0.6, scr: 0.15 });
  }
}

// ---- small details (the only lines) ----
function eyes(c, pts, R, expr) {
  c.save(); c.lineCap = 'round'; c.lineJoin = 'round';
  for (const [x, y] of pts) {
    if (expr === 'happy' || expr === 'content') {          // closed, smiling ∩
      c.strokeStyle = PK.line; c.lineWidth = R * 0.55;
      c.beginPath(); c.moveTo(x - R * 1.15, y + R * 0.35); c.quadraticCurveTo(x, y - R * 1.35, x + R * 1.15, y + R * 0.35); c.stroke();
    } else if (expr === 'sleepy' || expr === 'blink') {  // closed, relaxed ‿
      c.strokeStyle = PK.line; c.lineWidth = R * 0.5;
      c.beginPath(); c.moveTo(x - R * 1.15, y - R * 0.05); c.quadraticCurveTo(x, y + R * 1.1, x + R * 1.15, y - R * 0.05); c.stroke();
    } else {                         // round dot + tiny highlight
      c.fillStyle = PK.eye; c.beginPath(); c.arc(x, y, R, 0, TAU); c.fill();
      c.fillStyle = 'rgba(255,253,245,0.95)'; c.beginPath(); c.arc(x + R * 0.36, y - R * 0.38, R * 0.3, 0, TAU); c.fill();
    }
  }
  c.restore();
}
function nose(c, x, y, rx, ry) {
  const p = new Path2D(); // soft rounded triangle
  p.moveTo(x - rx, y - ry * 0.45); p.quadraticCurveTo(x, y - ry * 1.35, x + rx, y - ry * 0.45);
  p.quadraticCurveTo(x + rx * 0.75, y + ry * 0.9, x, y + ry); p.quadraticCurveTo(x - rx * 0.75, y + ry * 0.9, x - rx, y - ry * 0.45); p.closePath();
  castShadow(c, p, 1.5, 0.5, 1.2, 0.2);
  piece(c, p, PK.nose, { mul: 0.8, scr: 0.12 });
  c.save(); c.fillStyle = PK.noseD; c.globalAlpha = 0.55;          // his freckled liver nose
  for (const [dx, dy, r] of [[-0.35, 0.25, 0.13], [0.2, 0.42, 0.11], [0.45, 0.05, 0.09]]) { c.beginPath(); c.arc(x + dx * rx, y + dy * ry, r * rx, 0, TAU); c.fill(); }
  c.globalAlpha = 0.5; c.fillStyle = '#e9c3b4'; c.beginPath(); c.ellipse(x - rx * 0.3, y - ry * 0.45, rx * 0.28, ry * 0.18, -0.2, 0, TAU); c.fill();
  c.restore();
}
function blush(c, pts, R, a = 0.55) {
  c.save(); c.globalAlpha = a; for (const [x, y] of pts) piece(c, circ(x, y, R), PK.blush, { mul: 0.5, scr: 0.1 }); c.restore();
}
function tongue(c, x, y, w, h, tilt = 0) {
  const p = limb([x, y], [x + tilt, y + h], w * 0.9, w);
  castShadow(c, p, 1.2, 0.4, 1, 0.18);
  piece(c, p, PK.tongue, { mul: 0.55, scr: 0.12 });
  c.save(); c.strokeStyle = 'rgba(190,90,110,0.55)'; c.lineWidth = Math.max(1, w * 0.1); c.lineCap = 'round';
  c.beginPath(); c.moveTo(x + tilt * 0.3, y + h * 0.15); c.lineTo(x + tilt * 0.6, y + h * 0.65); c.stroke(); c.restore();
}
// front mouth: little "w" under the nose / open smile
function mouthFront(c, mx, my, s, expr) {
  c.save(); c.lineCap = 'round'; c.lineJoin = 'round'; c.strokeStyle = PK.line; c.lineWidth = 2 * s;
  if (expr === 'happy' || expr === 'pant' || expr === 'run') {
    const p = new Path2D();
    p.moveTo(mx - 12 * s, my + 1 * s); p.quadraticCurveTo(mx, my + 5 * s, mx + 10 * s, my + 1 * s);
    p.quadraticCurveTo(mx + 1 * s, my + 22 * s, mx - 12 * s, my + 1 * s); p.closePath();
    piece(c, p, PK.mouth, { mul: 0.5, scr: 0.08 });
    tongue(c, mx - 0.5 * s, my + 8 * s, 15 * s, 15 * s, 0.5 * s);
    c.beginPath(); c.moveTo(mx, my - 3 * s); c.lineTo(mx, my + 2.5 * s); c.stroke();
  } else {
    if (expr === 'calm') tongue(c, mx + 0.5 * s, my + 4 * s, 7 * s, 3.5 * s, 0.3 * s);   // the little blep
    c.beginPath(); c.moveTo(mx, my - 3 * s); c.lineTo(mx, my + 2 * s); c.stroke();
    c.beginPath(); c.moveTo(mx, my + 2 * s); c.quadraticCurveTo(mx - 3 * s, my + 7 * s, mx - 9 * s, my + 3 * s); c.stroke();
    c.beginPath(); c.moveTo(mx, my + 2 * s); c.quadraticCurveTo(mx + 3 * s, my + 7 * s, mx + 8 * s, my + 3 * s); c.stroke();
  }
  c.restore();
}

// fluffy curled tail: a round puff with the curl shown as a cream crescent
function tail(c, x, y, R, o = {}) {
  fp(c, circ(x, y, R), PK.fur, { sh: 0.18 });
  clipped(c, circ(x, y, R), () => {
    c.save(); c.globalAlpha = 0.8; piece(c, circ(x - R * 0.1, y + R * 0.12, R * 0.66), PK.cream, { mul: 0.3, scr: 0.15 }); c.restore();
    fp(c, circ(x + R * 0.04, y - R * 0.02, R * 0.56), PK.fur, { sh: 0.1, blur: 1.4 });
  });
}
function tailBase(c, x, y, R, base) { fp(c, limb(base, [x, y], R * 0.8, R * 0.9), PK.fur, { sh: 0.12 });
}

function legs(c, list, col) {
  for (const L of list) {
    let p = new Path2D();
    for (let i = 0; i < L.pts.length - 1; i++) p.addPath(limb(L.pts[i], L.pts[i + 1], L.w[i], L.w[i + 1]));
    if (L.paw) p.addPath(ell(...L.paw));
    fp(c, p, L.col || col, { sh: 0.14 });
  }
}

// ================= HEADS =================
// three-quarter head, facing the viewer and a little to the right. G = geometry, origin = head centre
function head3q(c, G, expr) {
  const droop = expr === 'sleepy' ? 0.22 : expr === 'run' ? 0.62 : expr === 'happy' ? 0.08 : 0;   // run: ears blown back flat
  ear(c, G.earL, { droop: -droop }); ear(c, G.earR, { droop });
  const head = union(ell(...G.skull), ell(...G.cheek));
  fp(c, head, PK.fur, { sh: 0.2 });
  blush(c, G.blush, G.blushR, expr === 'happy' ? 0.75 : 0.55);
  fp(c, ell(...G.muzzle), PK.muzzle, { sh: 0.17 });
  eyes(c, G.eyes, G.eyeR, expr);
  const [nx, ny, nrx, nry] = G.nose;
  mouthFront(c, nx, ny + nry + 1.5 * G.s, G.s, expr);
  nose(c, nx, ny, nrx, nry);
  if (HEAD_SNOW) noseSnow(c, nx, ny, nrx, nry);
}
// a dab of snow on his nose (stage 3): the sprite builder switches it on for drawings whose key ends in |sn
let HEAD_SNOW = false;
function noseSnow(c, x, y, rx, ry) {
  const m = union(ell(x, y - ry * 0.95, rx * 1.15, ry * 0.7), circ(x - rx * 0.35, y - ry * 1.45, rx * 0.55), circ(x + rx * 0.45, y - ry * 1.35, rx * 0.5));
  fp(c, m, '#dfe9f6', { sh: 0.45, mul: 0.2 });                       // cool shadowed underside so it reads on white fur
  fp(c, union(ell(x - rx * 0.1, y - ry * 1.25, rx * 0.95, ry * 0.5), circ(x - rx * 0.35, y - ry * 1.55, rx * 0.42)), '#ffffff', { sh: 0, mul: 0.15 });
}
// side head, facing right
function headSide(c, G, expr) {
  ear(c, G.earF, { inner: false });
  const head = union(circ(...G.skull), ell(...G.cheek));
  fp(c, head, PK.fur, { sh: 0.2 });
  ear(c, G.earN, { innerK: 0.5, innerShift: G.earInShift });
  blush(c, [G.blush], G.blushR);
  const mz = G.muzzle;
  fp(c, ell(...mz), PK.muzzle, { sh: 0.17 });
  eyes(c, [G.eye], G.eyeR, expr);
  const [nx, ny, nrx, nry] = G.nose, s = G.s;
  c.save(); c.lineCap = 'round'; c.strokeStyle = PK.line; c.lineWidth = 2 * s;
  if (expr === 'happy' || expr === 'pant') {
    const p = new Path2D(); p.moveTo(nx - 2 * s, ny + 8 * s); p.quadraticCurveTo(nx - 10 * s, ny + 20 * s, nx - 26 * s, ny + 9 * s); p.quadraticCurveTo(nx - 12 * s, ny + 12 * s, nx - 2 * s, ny + 8 * s);
    piece(c, p, PK.mouth, { mul: 0.5, scr: 0.08 });
    tongue(c, nx - 11 * s, ny + 12 * s, 12 * s, 14 * s, 1 * s);
  } else {
    if (expr === 'calm') tongue(c, nx - 6 * s, ny + 10 * s, 6 * s, 3 * s, 0.5 * s);
    c.beginPath(); c.moveTo(nx - 2 * s, ny + 8 * s); c.quadraticCurveTo(nx - 10 * s, ny + 15 * s, nx - 20 * s, ny + 10 * s); c.stroke();
  }
  c.restore();
  nose(c, nx, ny, nrx, nry);
  if (HEAD_SNOW) noseSnow(c, nx, ny, nrx, nry);
}

// ================= THE TWO DESIGN OPTIONS =================
// A — close to the photos: real Shiba proportions, longer legs and muzzle, medium ears
// B — rounder & stylised: big round head, bean body, stubby legs, tiny muzzle, cinnamon-bun tail
const DESIGNS = {
  A: {
    name: 'A',
    side: {
      box: { w: 330, h: 290, ox: 130, oy: 272 },
      farLegs: [{ pts: [[46, -84], [44, -6]], w: [22, 17], paw: [50, -6, 12, 6.5] }, { pts: [[-66, -92], [-58, -46], [-64, -6]], w: [30, 17, 14], paw: [-58, -6, 12, 6.5] }],
      body: [[-4, -104, 82, 38], [52, -104, 40, 40], [-58, -106, 36, 36]],
      belly: [0, -66, 84, 14], back: [-14, -146, 70, 14],
      tail: [-50, -150, 28], tailBase: [-74, -118],
      nearLegs: [{ pts: [[62, -84], [66, -6]], w: [24, 18], paw: [72, -6, 13, 7] }, { pts: [[-52, -98], [-44, -48], [-54, -6]], w: [38, 19, 15], paw: [-48, -6, 13, 7] }],
      chest: [74, -118, 26, 36],
      strap: { neck: [[72, -154], [92, -108]], girth: [[26, -142], [32, -66]], w: 11 },
      head: [98, -170], G: {
        s: 1, skull: [0, -6, 42], cheek: [-4, 10, 46, 36, 0], crown: [-10, -40, 34, 14, -0.2],
        muzzle: [40, 10, 28, 17, 0.06], nose: [66, 3, 8.5, 7], eye: [24, -6], eyeR: 5.5,
        earN: { b1: [-26, -28], b2: [4, -42], tip: [-12, -86], r: 7 }, earF: { b1: [6, -40], b2: [22, -28], tip: [18, -80], r: 6 }, earInShift: [4, 0],
        blush: [30, 17], blushR: 8,
      },
    },
    q: {
      box: { w: 330, h: 300, ox: 170, oy: 282 },
      farLegs: [{ pts: [[-112, -70], [-114, -6]], w: [24, 16], paw: [-110, -6, 11, 6], col: PK.furS }],
      body: [[-58, -104, 74, 44, -0.06]], back: [-70, -146, 60, 12],
      tail: [-110, -152, 27], tailBase: [-108, -116],
      midLegs: [{ pts: [[-82, -90], [-80, -46], [-86, -6]], w: [34, 18, 15], paw: [-82, -6, 12, 6.5] }, { pts: [[46, -84], [50, -6]], w: [24, 19], paw: [52, -6, 13, 8] }],
      chest: [22, -112, 48, 54],
      nearLegs: [{ pts: [[2, -84], [-2, -6]], w: [26, 20], paw: [-2, -6, 14, 8] }],
      strap: { y: -136, w: 11, x0: -20, x1: 66 },
      head: [26, -180], G: {
        s: 1, skull: [0, -10, 50, 46], cheek: [2, 10, 62, 42], crown: [2, -52, 30, 14],
        muzzle: [16, 18, 25, 18], nose: [19, 8, 10, 7.5], eyes: [[-18, -4], [44, -4]], eyeR: 6,
        earL: { b1: [-50, -20], b2: [-14, -48], tip: [-42, -90], r: 8 }, earR: { b1: [24, -50], b2: [56, -22], tip: [52, -88], r: 8 },
        blush: [[-32, 18], [57, 16]], blushR: 9,
      },
    },
  },
  B: {
    name: 'B',
    side: {
      box: { w: 300, h: 260, ox: 120, oy: 244 },
      farLegs: [{ pts: [[30, -44], [28, -8]], w: [22, 20], paw: [32, -7, 12, 7] }, { pts: [[-52, -44], [-56, -8]], w: [24, 20], paw: [-52, -7, 12, 7] }],
      body: [[-6, -62, 66, 40], [36, -66, 38, 38], [-44, -62, 38, 38]],
      belly: [0, -26, 70, 12], back: [-10, -100, 60, 12],
      tail: [-60, -110, 30], tailBase: [-66, -80],
      nearLegs: [{ pts: [[46, -44], [50, -8]], w: [24, 22], paw: [55, -7, 13, 7.5] }, { pts: [[-38, -48], [-42, -8]], w: [30, 22], paw: [-37, -7, 13, 7.5] }],
      chest: [54, -82, 26, 30],
      strap: { neck: [[58, -126], [76, -82]], girth: [[14, -100], [18, -26]], w: 11 },
      head: [74, -140], G: {
        s: 1, skull: [0, -4, 52], cheek: [-2, 12, 56, 42, 0], crown: [-12, -46, 36, 14, -0.2],
        muzzle: [46, 17, 20, 14, 0.05], nose: [63, 11, 7.5, 6.5], eye: [28, 0], eyeR: 6.5,
        earN: { b1: [-30, -36], b2: [4, -48], tip: [-16, -84], r: 11 }, earF: { b1: [10, -44], b2: [28, -32], tip: [26, -76], r: 9 }, earInShift: [4, 0],
        blush: [32, 22], blushR: 10,
      },
    },
    q: {
      box: { w: 300, h: 270, ox: 145, oy: 254 },
      farLegs: [{ pts: [[-88, -44], [-90, -8]], w: [24, 20], paw: [-86, -7, 12, 7], col: PK.furS }],
      body: [[-46, -64, 60, 42]], back: [-56, -100, 50, 10],
      tail: [-92, -106, 27], tailBase: [-86, -74],
      midLegs: [{ pts: [[-64, -46], [-66, -8]], w: [28, 22], paw: [-62, -7, 13, 7] }, { pts: [[38, -46], [40, -8]], w: [26, 24], paw: [42, -7, 14, 8] }],
      chest: [16, -76, 46, 42],
      nearLegs: [{ pts: [[-4, -46], [-6, -8]], w: [28, 24], paw: [-6, -7, 15, 8.5] }],
      strap: { y: -98, w: 11, x0: -24, x1: 58 },
      head: [16, -158], G: {
        s: 1, skull: [0, -6, 60, 54], cheek: [0, 14, 68, 46], crown: [0, -50, 34, 14],
        muzzle: [12, 23, 20, 15], nose: [14, 14, 8.5, 6.5], eyes: [[-24, 4], [38, 4]], eyeR: 7,
        earL: { b1: [-56, -16], b2: [-22, -50], tip: [-52, -86], r: 11 }, earR: { b1: [22, -54], b2: [56, -24], tip: [58, -82], r: 11 },
        blush: [[-38, 25], [54, 23]], blushR: 11,
      },
    },
  },
};

function bodyBlob(c, D) {
  const body = union(...D.body.map(b => b.length === 4 && D.body.length > 1 && b[2] === b[3] ? circ(b[0], b[1], b[2]) : ell(...b)));
  fp(c, body, PK.fur, { sh: 0.16 });
  clipped(c, body, () => {
    if (D.belly) { c.save(); c.globalAlpha = 0.85; piece(c, ell(...D.belly), PK.furS, { mul: 0.5, scr: 0.1 }); c.restore(); }
    if (D.back) { c.save(); c.globalAlpha = 0.5; piece(c, ell(...D.back), PK.cream, { mul: 0.4, scr: 0.1 }); c.restore(); }
  });
  return body;
}
function strapPiece(c, pts, w) { const p = limb(pts[0], pts[1], w, w); fp(c, p, PK.harness, { mul: 0.8, scr: 0.25, sh: 0.2, blur: 1.5 }); }

function drawSide(c, V, expr = 'calm') {
  const D = DESIGNS[V].side;
  legs(c, D.farLegs, PK.furS);
  tailBase(c, ...D.tail, D.tailBase);
  const body = bodyBlob(c, D);
  clipped(c, body, () => strapPiece(c, D.strap.girth, D.strap.w));
  legs(c, D.nearLegs, PK.fur);
  tail(c, ...D.tail);
  fp(c, ell(...D.chest), PK.fur, { sh: 0.12 });
  strapPiece(c, D.strap.neck, D.strap.w);
  c.save(); c.translate(...D.head); headSide(c, D.G, expr); c.restore();
}
function drawQ(c, V, expr = 'calm') {
  const D = DESIGNS[V].q;
  legs(c, D.farLegs, PK.furS);
  tailBase(c, ...D.tail, D.tailBase);
  bodyBlob(c, D);
  tail(c, ...D.tail);
  legs(c, D.midLegs, PK.fur);
  fp(c, ell(...D.chest), PK.fur, { sh: 0.14 });
  legs(c, D.nearLegs, PK.fur);
  // chest strap: a gently curved band under the chin
  const S = D.strap, p = new Path2D();
  p.moveTo(S.x0, S.y); p.quadraticCurveTo((S.x0 + S.x1) / 2, S.y + 16, S.x1, S.y - 2);
  p.lineTo(S.x1, S.y - 2 + S.w); p.quadraticCurveTo((S.x0 + S.x1) / 2, S.y + 16 + S.w, S.x0, S.y + S.w); p.closePath();
  if (V === 'B') {
    const mx = (S.x0 + S.x1) / 2 + 6;
    band(c, [mx, S.y + 14], [mx - 2, S.y + 50], 9, PK.hBlue);
    twoTone(c, p, mx, PK.hYellow, PK.hGreen);
    ring(c, mx, S.y + 13, 4);
  } else fp(c, p, PK.harness, { mul: 0.8, scr: 0.25, sh: 0.2, blur: 1.5 });
  c.save(); c.translate(...D.head); head3q(c, D.G, expr); c.restore();
}
// expression close-up = just the 3/4 head (with a cut-paper "z" when sleepy)
function drawFace(c, V, expr) {
  const G = DESIGNS[V].q.G;
  head3q(c, G, expr);
  if (expr === 'sleepy') {
    const Z = (x, y, s) => { const p = poly([[0, 0], [10, 0], [10, 2.6], [3.6, 9], [10, 9], [10, 11.6], [0, 11.6], [0, 9], [6.4, 2.6], [0, 2.6]].map(([a, b]) => [x + a * s, y + b * s])); fp(c, p, '#f6f0ff', { sh: 0.2, mul: 0.5 }); };
    Z(62, -96, 1.5); Z(84, -118, 1.1);
  }
}

// render a drawing into its own hi-res canvas (cached by the caller), then die-cut it onto dst
function puppetCanvas(box, res, fn) {
  const cv = mk(box.w * res, box.h * res), x = cv.getContext('2d');
  x.scale(res, res); x.translate(box.ox, box.oy); fn(x); return cv;
}
function placePuppet(dst, cv, box, x, y, res, o = {}) { sticker(dst, cv, x - box.ox, y - box.oy, { res, ...o }); }

// ================= POSES (design B, chosen) =================
// harness helpers
function band(c, a, b, w, col, o = {}) { fp(c, limb(a, b, w, w), col, { mul: 0.8, scr: 0.25, sh: o.sh ?? 0.2, blur: 1.4 }); }
function ring(c, x, y, r) { c.save(); c.strokeStyle = PK.metal; c.lineWidth = 2; c.beginPath(); c.arc(x, y, r, 0, TAU); c.stroke(); c.restore(); }
function rectP(x, y, w, h) { const q = new Path2D(); q.rect(x, y, w, h); return q; }
// a strap path split at x = mx into two colours (the neck loop: yellow on his right side, green on his left)
function twoTone(c, p, mx, colL, colR) {
  castShadow(c, p, 1.4, 0.8, 2, 0.2);
  clipped(c, p, () => { piece(c, rectP(mx - 400, -1000, 400, 2000), colL, { mul: 0.8, scr: 0.25 }); piece(c, rectP(mx, -1000, 400, 2000), colR, { mul: 0.8, scr: 0.25 }); });
}
// tiny "X" box stitching, like on his real straps
function stitchX(c, x, y, s, ang = 0) {
  c.save(); c.translate(x, y); c.rotate(ang); c.strokeStyle = 'rgba(255,250,235,0.55)'; c.lineWidth = 0.9;
  c.strokeRect(-s, -s * 0.7, s * 2, s * 1.4); c.beginPath(); c.moveTo(-s, -s * 0.7); c.lineTo(s, s * 0.7); c.moveTo(s, -s * 0.7); c.lineTo(-s, s * 0.7); c.stroke(); c.restore();
}
// the girth: red over the back (top `red` fraction), khaki round the belly, black buckle between
function girth(c, top, bot, w, red = 0.3) {
  const m = mix(top, bot, red);
  band(c, m, bot, w, PK.hKhaki, { sh: 0.16 });
  band(c, top, m, w, PK.hRed, { sh: 0.16 });
  const ang = Math.atan2(bot[1] - top[1], bot[0] - top[0]);
  c.save(); c.translate(m[0], m[1]); c.rotate(ang); piece(c, rectP(-4, -w * 0.62, 8, w * 1.24), PK.buckle, { mul: 0.5, scr: 0.2 }); c.restore();
  stitchX(c, ...mix(m, bot, 0.55), w * 0.32, ang);
}

// generic leg for the side rig: pivot, swing angle a (rad, + = forward), length, lift
function legB(c, pivot, a, len, lift, w0, w1, col) {
  const L = len - lift, foot = [pivot[0] + Math.sin(a) * L, pivot[1] + Math.cos(a) * L];
  fp(c, union(limb(pivot, foot, w0, w1), ell(foot[0] + 4, foot[1] + 1, w1 * 0.56, w1 * 0.32)), col, { sh: 0.14 });
}
function tailAt(c, D, wag = 0) {
  const [x, y, R] = D.tail, base = D.tailBase;
  c.save(); c.translate(base[0], base[1]); c.rotate(wag); c.translate(-base[0], -base[1]); tail(c, x, y, R); c.restore();
}

// ---- standing family (side view, facing right). P = { bob, tilt, legs:{fn,ff,hn,hf}:{a,lift}, wag, head:{view,dx,dy,rot}, expr }
const STAND0 = { bob: 0, tilt: 0, legs: { fn: { a: 0, lift: 0 }, ff: { a: 0, lift: 0 }, hn: { a: 0, lift: 0 }, hf: { a: 0, lift: 0 } }, wag: 0, head: { view: 'side', dx: 0, dy: 0, rot: 0 }, expr: 'calm' };
function drawStandB(c, P) {
  const D = DESIGNS.B.side, L = P.legs;
  c.save(); c.translate(0, P.bob); c.translate(0, -62); c.rotate(P.tilt); c.translate(0, 62);
  legB(c, [30, -44], L.ff.a, 36, L.ff.lift, 22, 20, PK.furS);
  legB(c, [-54, -44], L.hf.a, 36, L.hf.lift, 24, 20, PK.furS);
  c.save(); c.translate(...D.tailBase); c.rotate(P.wag); c.translate(-D.tailBase[0], -D.tailBase[1]); tailBase(c, ...D.tail, D.tailBase); c.restore();
  const body = bodyBlob(c, D);
  clipped(c, body, () => girth(c, [16, -104], [20, -22], 10));
  band(c, [50, -100], [18, -100], 8, PK.hNavy, { sh: 0.14 }); stitchX(c, 36, -100, 3);
  ring(c, 16, -104, 4);
  legB(c, [46, -44], L.fn.a, 36, L.fn.lift, 24, 22, PK.fur);
  legB(c, [-40, -48], L.hn.a, 40, L.hn.lift, 30, 22, PK.fur);
  tailAt(c, D, P.wag);
  fp(c, ell(...D.chest), PK.fur, { sh: 0.12 });
  band(c, [58, -124], [74, -84], 10, PK.hYellow);       // neck loop, his right side (mostly hidden under the big head — on purpose)
  ring(c, 75, -82, 3.5);
  if (P.pack) backpack(c, 4, -112, -0.04);
  const H = P.head, hx = D.head[0] + H.dx, hy = D.head[1] + H.dy;
  c.save(); c.translate(hx, hy); c.rotate(H.rot);
  if (H.view === 'side') headSide(c, D.G, P.expr);
  else { const k = 0.9; c.scale(H.view === 'back' ? -k : k, k); head3q(c, DESIGNS.B.q.G, P.expr); }
  c.restore();
  c.restore();
}
// trot: 6 drawings per 0.5 s cycle (held on twos); k = drawing index
function trotPose(k) {
  const ph = (k % 6) / 6 * TAU;
  const leg = q => ({ a: 0.6 * Math.sin(ph + q), lift: 12 * Math.max(0, Math.cos(ph + q)) });
  return { ...STAND0, bob: -3.5 * Math.max(0, Math.sin(2 * ph)), tilt: 0.025 * Math.sin(2 * ph),
    legs: { fn: leg(0), hf: leg(0.15), ff: leg(Math.PI), hn: leg(Math.PI + 0.15) },
    wag: 0.08 * Math.sin(2 * ph), head: { view: 'side', dx: 0, dy: 1.5 * Math.sin(2 * ph + 0.6), rot: 0.03 * Math.sin(2 * ph) }, expr: 'pant' };
}
function lookBackPose(wagK = 0) {
  return { ...STAND0, wag: 0.12 * Math.sin(wagK * 1.9), head: { view: 'back', dx: -26, dy: -2, rot: 0.14 }, expr: 'calm' };
}

// ---- sitting (side body, head turned 3/4 to the viewer) ----
function drawSitB(c, expr = 'calm', wag = 0, o = {}) {
  const scarfLater = !!o.scarf;
  // tail puff peeking out behind the rump
  c.save(); c.translate(-30, -40); c.rotate(wag); c.translate(30, 40); tail(c, -50, -62, 25); c.restore();
  fp(c, union(limb([22, -84], [26, -9], 22, 20), ell(30, -8, 11, 6.5)), PK.furS, { sh: 0.14 });   // far front leg
  const body = union(circ(-20, -40, 40), ell(-2, -72, 40, 56, 0.35), circ(22, -104, 32));
  fp(c, body, PK.fur, { sh: 0.16 });
  clipped(c, body, () => {
    c.save(); c.globalAlpha = 0.5; piece(c, ell(-34, -86, 12, 40, 0.35), PK.cream, { mul: 0.4, scr: 0.1 }); c.restore();
    girth(c, [-36, -98], [42, -66], 10, 0.32);
  });
  clipped(c, body, () => { band(c, [10, -124], [-26, -94], 8, PK.hNavy, { sh: 0.14 }); stitchX(c, -8, -109, 3, 0.7); });
  fp(c, ell(-14, -30, 34, 27, -0.15), PK.fur, { sh: 0.18 });                   // folded hind leg
  fp(c, ell(20, -7, 17, 8), PK.fur, { sh: 0.14 });                             // hind paw, poking forward
  fp(c, ell(40, -100, 24, 30), PK.fur, { sh: 0.12 });                          // chest ruff
  band(c, [46, -104], [44, -64], 9, PK.hBlue);                                  // light-blue chest strap
  fp(c, union(limb([36, -86], [42, -9], 24, 22), ell(46, -8, 13, 7.5)), PK.fur, { sh: 0.14 }); // near front leg
  // neck loop under the chin: yellow (his right) → ring → green (his left)
  const p = new Path2D(); p.moveTo(-4, -118); p.quadraticCurveTo(30, -100, 70, -116); p.lineTo(70, -106); p.quadraticCurveTo(30, -88, -4, -108); p.closePath();
  clipped(c, union(body, ell(40, -100, 24, 30)), () => twoTone(c, p, 46, PK.hYellow, PK.hGreen)); ring(c, 46, -101, 3.5);
  if (o.pack) backpack(c, -26, -96, 0.5);
  if (scarfLater) scarfSide(c);
  c.save(); c.translate(34, -166 + (o.headDy || 0)); c.rotate(o.headRot || 0); c.scale(0.9, 0.9); head3q(c, DESIGNS.B.q.G, expr);
  if (o.mouth) { c.translate(30, 52); c.rotate(0.2); drawItem(c, o.mouth, o.mouth === 'simit' ? 0.85 : o.mouth === 'bouquet' ? 1.6 : 1.05); }        // a toy held in his mouth
  c.restore();
}
const BOX_SIT = { w: 250, h: 280, ox: 115, oy: 264 };
const BOX_STAND = { w: 300, h: 270, ox: 125, oy: 254 };

// ---- lying down / sleeping (side body, chin resting on the paws, face 3/4) ----
function drawLieB(c, expr = 'sleepy', o = {}) {
  const br = o.breath || 0;                                   // 0..1: chest rise while sleeping
  tail(c, -64, -30, 23);
  fp(c, union(limb([34, -22], [86, -9], 18, 16), ell(90, -8, 11, 6)), PK.furS, { sh: 0.14 });
  const body = union(ell(-6, -34 - br, 64, 32 + br), circ(-40, -36, 32), circ(30, -36 - br * 0.6, 32 + br * 0.6));
  fp(c, body, PK.fur, { sh: 0.16 });
  clipped(c, body, () => {
    c.save(); c.globalAlpha = 0.85; piece(c, ell(0, -4, 70, 10), PK.furS, { mul: 0.5, scr: 0.1 }); c.restore();
    c.save(); c.globalAlpha = 0.5; piece(c, ell(-14, -66, 56, 10), PK.cream, { mul: 0.4, scr: 0.1 }); c.restore();
    girth(c, [6, -72 - br], [10, -2], 10);
    band(c, [40, -68 - br], [8, -70 - br], 8, PK.hNavy, { sh: 0.14 });
  });
  fp(c, ell(-30, -22, 30, 20, -0.1), PK.fur, { sh: 0.18 });                  // folded hind leg
  fp(c, ell(-2, -7, 15, 7), PK.fur, { sh: 0.14 });
  fp(c, union(limb([40, -20], [94, -7], 20, 18), ell(98, -7, 12, 7)), PK.fur, { sh: 0.14 });
  if (o.bone) { c.save(); c.translate(116, -12); c.rotate(-0.2); drawItem(c, 'bone', 0.6); c.restore(); }
  c.save(); c.translate(84, -58 - br * 0.5); c.rotate(o.headRot ?? 0.06); c.scale(0.86, 0.86); head3q(c, DESIGNS.B.q.G, expr); c.restore();
}
const BOX_LIE = { w: 280, h: 170, ox: 110, oy: 150 };
// flat out on a hot afternoon (stage 3): belly on the cool ground, hind legs stretched out behind, panting
function drawFlatB(c, k = 0) {
  const br = k ? 1.2 : 0;
  tail(c, -84, -16, 19);
  fp(c, union(limb([-36, -12], [-100, -9], 17, 13), ell(-104, -8, 11, 6)), PK.furS, { sh: 0.14 });    // far hind leg, stretched back
  fp(c, union(limb([34, -14], [88, -7], 17, 15), ell(92, -6, 11, 6)), PK.furS, { sh: 0.14 });         // far front leg
  const body = union(ell(-6, -24 - br, 66, 22 + br), circ(-40, -24, 22), circ(30, -26 - br * 0.6, 24 + br * 0.6));
  fp(c, body, PK.fur, { sh: 0.16 });
  clipped(c, body, () => {
    c.save(); c.globalAlpha = 0.85; piece(c, ell(0, -3, 70, 8), PK.furS, { mul: 0.5, scr: 0.1 }); c.restore();
    c.save(); c.globalAlpha = 0.5; piece(c, ell(-14, -44, 56, 8), PK.cream, { mul: 0.4, scr: 0.1 }); c.restore();
    girth(c, [6, -50 - br], [10, -2], 10);
    band(c, [40, -48 - br], [8, -48 - br], 8, PK.hNavy, { sh: 0.14 });
  });
  fp(c, union(limb([-28, -10], [-94, -3], 19, 15), ell(-98, -3, 12, 6.5)), PK.fur, { sh: 0.16 });     // near hind leg, frog-style
  fp(c, union(limb([40, -12], [98, -5], 19, 17), ell(102, -5, 12, 7)), PK.fur, { sh: 0.14 });         // near front leg
  c.save(); c.translate(88, -42 - br * 0.4); c.rotate(0.1); c.scale(0.86, 0.86); head3q(c, DESIGNS.B.q.G, 'pant'); c.restore();
}
const BOX_FLAT = { w: 320, h: 150, ox: 140, oy: 128 };
// sniffing: standing, head low, two drawings (sniff-sniff)
function sniffPose(k) { return { ...STAND0, wag: 0.1, head: { view: 'side', dx: 6, dy: 32 + (k % 2) * 2.5, rot: 0.4 + (k % 2) * 0.03 }, expr: 'sniff' }; }

// little paper bits used as particles
function drawZ(c, s = 1) { const p = poly([[0, 0], [10, 0], [10, 2.6], [3.6, 9], [10, 9], [10, 11.6], [0, 11.6], [0, 9], [6.4, 2.6], [0, 2.6]].map(([a, b]) => [(a - 5) * s, (b - 5.8) * s])); fp(c, p, '#f6f0ff', { sh: 0.2, mul: 0.5 }); }
function drawHeart(c, s = 1) {
  const p = new Path2D(); p.moveTo(0, 4 * s); p.bezierCurveTo(-9 * s, -2 * s, -6 * s, -10 * s, 0, -5 * s); p.bezierCurveTo(6 * s, -10 * s, 9 * s, -2 * s, 0, 4 * s); p.closePath();
  c.save(); c.lineJoin = 'round'; c.strokeStyle = '#fffdf7'; c.lineWidth = 3 * s; castShadow(c, p, 2, 0.5, 1.5, 0.2); c.stroke(p); c.restore();
  piece(c, p, '#f38fae', { mul: 0.5, scr: 0.2 });
}

// ---- belly up (for belly rubs): on his back, paws in the air, k = paddle drawing 0/1 ----
function drawBellyB(c, k = 0) {
  const kick = k ? 1 : -1;
  const legUp = (base, a, len, w, col) => { const tip = [base[0] + Math.sin(a) * len, base[1] - Math.cos(a) * len]; fp(c, union(limb(base, tip, w, w * 0.9), ell(tip[0], tip[1] - 2, w * 0.55, w * 0.42)), col, { sh: 0.14 }); };
  tail(c, -70, -26, 22);
  legUp([20, -46], 0.2 + 0.14 * kick, 40, 20, PK.furS);
  legUp([-34, -46], -0.3 - 0.14 * kick, 38, 22, PK.furS);
  const body = union(ell(-2, -30, 64, 28), circ(-38, -30, 28), circ(32, -32, 28));
  fp(c, body, PK.fur, { sh: 0.16 });
  clipped(c, body, () => {
    c.save(); c.globalAlpha = 0.9; piece(c, ell(-6, -50, 52, 15), '#fbe1d8', { mul: 0.4, scr: 0.1 }); c.restore();
    c.save(); c.globalAlpha = 0.8; piece(c, ell(0, -4, 66, 8), PK.furS, { mul: 0.4, scr: 0.1 }); c.restore();
    girth(c, [10, -2], [6, -60], 10, 0.3);
  });
  legUp([34, -48], 0.05 - 0.16 * kick, 42, 22, PK.fur);
  legUp([-22, -48], -0.12 + 0.16 * kick, 40, 24, PK.fur);
  c.save(); c.translate(100, -42); c.rotate(0.45); c.scale(0.84, 0.84); head3q(c, DESIGNS.B.q.G, 'happy'); c.restore();
}
const BOX_BELLY = { w: 300, h: 190, ox: 110, oy: 160 };
// the little breath cloud of a happy sigh
function drawPuff(c) { fp(c, union(circ(-5, 0, 5), circ(2, -3, 6.5), circ(9, 1, 4.5)), '#ffffff', { sh: 0.12, mul: 0.3 }); }

// ---- play bow: chest down, forelegs flat on the ground, rear up, tail high ("let's play!") ----
function drawPlayBowB(c, expr = 'pant', o = {}) {
  const wag = o.wag || 0;
  fp(c, union(limb([-52, -62], [-58, -8], 22, 18), ell(-54, -7, 12, 7)), PK.furS, { sh: 0.14 });          // far hind leg
  fp(c, union(limb([36, -24], [80, -12], 18, 16), ell(86, -10, 12, 6.5)), PK.furS, { sh: 0.14 });        // far foreleg
  c.save(); c.translate(-50, -88); c.rotate(wag); c.translate(50, 88); tailBase(c, -64, -110, 25, [-50, -84]); c.restore();
  const body = union(ell(-6, -58, 62, 32, 0.4), circ(30, -38, 30), circ(-40, -74, 32));
  fp(c, body, PK.fur, { sh: 0.16 });
  clipped(c, body, () => {
    c.save(); c.globalAlpha = 0.8; piece(c, ell(0, -26, 60, 12, 0.4), PK.furS, { mul: 0.4, scr: 0.1 }); c.restore();
    girth(c, [0, -84], [24, -16], 10, 0.3);
    band(c, [-6, -86], [26, -66], 8, PK.hNavy, { sh: 0.14 });
  });
  if (o.pack) backpack(c, -24, -96, 0.38);
  fp(c, union(limb([-40, -64], [-44, -8], 26, 20), ell(-38, -7, 13, 7.5)), PK.fur, { sh: 0.16 });         // near hind leg
  fp(c, union(limb([44, -22], [92, -10], 20, 18), ell(98, -9, 13, 7)), PK.fur, { sh: 0.14 });            // near foreleg
  c.save(); c.translate(-50, -88); c.rotate(wag); c.translate(50, 88); tail(c, -64, -110, 25); c.restore();
  c.save(); c.translate(76, -66); c.rotate(-0.12); c.scale(0.86, 0.86); head3q(c, DESIGNS.B.q.G, expr); c.restore();
}
const BOX_BOW = { w: 300, h: 200, ox: 125, oy: 186 };

// ---- sitting, seen from behind (watching something far away) ----
function drawBackSitB(c, o = {}) {
  fp(c, union(ell(-30, -12, 24, 13), ell(30, -12, 24, 13)), PK.fur, { sh: 0.16 });                       // haunches
  const body = union(ell(0, -64, 46, 54), circ(0, -32, 44));
  fp(c, body, PK.fur, { sh: 0.18 });
  clipped(c, body, () => {
    c.save(); c.globalAlpha = 0.45; piece(c, ell(0, -96, 24, 30), PK.cream, { mul: 0.4, scr: 0.1 }); c.restore();
    band(c, [0, -116], [0, -78], 8, PK.hNavy, { sh: 0.12 });
    band(c, [-50, -80], [50, -80], 10, PK.hKhaki, { sh: 0.14 }); band(c, [-16, -80], [16, -80], 10, PK.hRed, { sh: 0.12 });
  });
  if (o.pack) backpack(c, 0, -90, 0);
  // neck loop from behind: green on his left (viewer's left), yellow on his right
  const nl = new Path2D(); nl.moveTo(-40, -118); nl.quadraticCurveTo(0, -104, 40, -118); nl.lineTo(40, -108); nl.quadraticCurveTo(0, -94, -40, -108); nl.closePath();
  twoTone(c, nl, 0, PK.hGreen, PK.hYellow);
  // the back of his head: round, ear backs apricot, no face
  for (const d of [-1, 1]) ear(c, { b1: [d * 50, -156], b2: [d * 8, -186], tip: [d * 42, -232], r: 11 }, { inner: false });
  fp(c, union(circ(0, -148, 50), ell(0, -130, 56, 36)), PK.fur, { sh: 0.2 });
  clipped(c, circ(0, -148, 50), () => { c.save(); c.globalAlpha = 0.35; piece(c, ell(0, -186, 30, 12), PK.cream, { mul: 0.3 }); c.restore(); });
  tail(c, -8, -46, 22);                                                                                    // curl resting on his rump
}
const BOX_BACK = { w: 220, h: 260, ox: 110, oy: 248 };

// ---- digging, facing you: head down at the hole, forelegs braced wide, one paw scooping, rump and tail high (k = 0/1 paw) ----
function drawDigB(c, k = 0, o = {}) {
  const up = k ? 1 : -1;
  fp(c, circ(0, -118, 36), PK.fur, { sh: 0.16 });                          // rump, raised high behind
  tail(c, 12, -152, 22);                                                     // curl on top
  fp(c, ell(0, -86, 42, 34), PK.fur, { sh: 0.16 });                         // back, sloping down toward us
  clipped(c, ell(0, -86, 42, 34), () => girth(c, [-40, -92], [40, -92], 9, 0.0));
  if (o.pack) backpack(c, 0, -100, 0);
  fp(c, ell(0, -58, 50, 28), PK.fur, { sh: 0.16 });                         // shoulders
  const leg = (side, raised) => {
    const sh = [side * 36, -60], foot = raised ? [side * 66, -38] : [side * 52, -6];
    fp(c, union(limb(sh, foot, 22, 18), ell(foot[0] + side * 3, foot[1] + (raised ? 0 : 1), 13, raised ? 8.5 : 7.5, raised ? side * 0.6 : 0)), PK.fur, { sh: 0.18 });
  };
  leg(-1, up < 0); leg(1, up > 0);
  c.save(); c.translate(0, -40); c.rotate(-0.12); c.scale(0.7, 0.7); head3q(c, DESIGNS.B.q.G, o.expr || 'happy'); c.restore();
}
const BOX_DIG = { w: 260, h: 230, ox: 130, oy: 210 };

// ---- running straight at you: ears blown back, one forepaw reaching toward you (k = 0/1 which paw) ----
function drawRunFrontB(c, k = 0, o = {}) {
  const d = k ? 1 : -1;                                                     // side of the reaching paw
  tail(c, -d * 46, -150, 19);                                               // the curl bouncing up behind
  for (const side of [-1, 1]) fp(c, ell(side * 52, -24, 14, 8.5, side * 0.45), PK.furS, { sh: 0.14 });   // hind paws kicking out behind
  fp(c, ell(0, -74, 46, 34), PK.fur, { sh: 0.16 });                        // body behind the chest
  if (o.pack) for (const side of [-1, 1]) band(c, [side * 30, -104], [side * 38, -66], 7, '#c7453a', { sh: 0.12 });   // backpack straps over the shoulders
  fp(c, union(limb([-d * 22, -48], [-d * 44, -34], 20, 18), ell(-d * 49, -32, 12, 8, -d * 0.5)), PK.fur, { sh: 0.16 });   // tucked paw, out to the side
  fp(c, ell(0, -42, 36, 26), PK.fur, { sh: 0.14 });                        // chest
  band(c, [4, -46], [4, -20], 8, PK.hBlue, { sh: 0.12 });
  const nl = new Path2D(); nl.moveTo(-34, -56); nl.quadraticCurveTo(0, -40, 34, -56); nl.lineTo(34, -47); nl.quadraticCurveTo(0, -31, -34, -47); nl.closePath();
  twoTone(c, nl, 4, PK.hYellow, PK.hGreen); ring(c, 4, -43, 3.5);
  fp(c, union(limb([d * 16, -40], [d * 26, -4], 24, 22), ell(d * 28, -2, 17, 11)), PK.fur, { sh: 0.2 });   // the paw reaching toward you
  c.save(); c.translate(0, -104); c.rotate(d * 0.06); c.scale(0.8, 0.8); head3q(c, DESIGNS.B.q.G, 'run'); c.restore();
}
const BOX_RUN = { w: 250, h: 250, ox: 125, oy: 226 };

// ---- sitting facing you, waving one paw (k = 0/1: the two ends of the wave), paw pads showing ----
function drawWaveB(c, k = 0, o = {}) {
  tail(c, -50, -64, 19);                                                    // curl peeking out behind
  for (const s of [-1, 1]) fp(c, ell(s * 38, -20, 26, 19), PK.fur, { sh: 0.16 });            // folded hind legs
  fp(c, ell(0, -60, 40, 50), PK.fur, { sh: 0.16 });                        // body
  if (o.pack) for (const s of [-1, 1]) band(c, [s * 28, -104], [s * 34, -66], 7, '#c7453a', { sh: 0.12 });   // backpack straps
  fp(c, ell(0, -64, 30, 30), PK.fur, { sh: 0.12 });                        // chest ruff
  band(c, [3, -84], [3, -34], 8, PK.hBlue, { sh: 0.12 });
  const nl = new Path2D(); nl.moveTo(-34, -94); nl.quadraticCurveTo(0, -78, 34, -94); nl.lineTo(34, -85); nl.quadraticCurveTo(0, -69, -34, -85); nl.closePath();
  twoTone(c, nl, 3, PK.hYellow, PK.hGreen); ring(c, 3, -81, 3.5);
  for (const s of [-1, 1]) fp(c, ell(s * 46, -6, 14, 7.5), PK.fur, { sh: 0.14 });            // hind paws
  const paws = o.paws || 'wave';
  fp(c, union(limb([-16, -62], [-18, -8], 20, 18), ell(-18, -6, 13, 7.5)), PK.fur, { sh: 0.16 });   // the paw on the ground
  if (paws === 'bow') fp(c, union(limb([16, -62], [18, -8], 20, 18), ell(18, -6, 13, 7.5)), PK.fur, { sh: 0.16 });
  if (o.scarf) scarfFront(c, -86);
  const bow = paws === 'bow';
  c.save(); c.translate(0, bow ? -100 : -130); c.rotate(bow ? 0.04 : -0.06); c.scale(bow ? 0.76 : 0.8, bow ? 0.76 : 0.8); head3q(c, DESIGNS.B.q.G, o.expr || (bow ? 'content' : 'happy')); c.restore();
  if (paws === 'gong') {                                                     // forepaws pressed together at the chest, a red envelope between them
    fp(c, rectP(-11, -86, 22, 30), '#d9332e', 0.2); piece(c, rectP(-11, -86, 22, 9), '#b8282a', { mul: 0.4 }); piece(c, circ(0, -74, 4.5), ARCH.gold, { mul: 0.3 });
    for (const s of [-1, 1]) {
      fp(c, limb([s * 30, -84], [s * 14, -66], 20, 17), PK.fur, { sh: 0.2 });
      fp(c, ell(s * 12, -64, 11, 13, s * -0.25), PK.fur, { sh: 0.22 });
      c.save(); c.strokeStyle = 'rgba(150,120,100,0.45)'; c.lineWidth = 1.2; for (const t of [-4, 2]) { c.beginPath(); c.moveTo(s * 12 - 6, -58 + t); c.lineTo(s * 12 + 6, -58 + t); c.stroke(); } c.restore();
    }
  }
  if (paws !== 'wave') return;
  // the waving paw, palm toward you
  const paw = k ? [70, -124] : [58, -136];
  fp(c, limb([20, -76], paw, 20, 17), PK.fur, { sh: 0.18 });
  c.save(); c.translate(...paw); c.rotate(k ? 0.35 : 0.1);
  fp(c, ell(0, -2, 12, 13), PK.fur, { sh: 0.14 });
  piece(c, ell(0, 2, 5, 4), '#f3a3a6', { mul: 0.4 }); for (const [x, y] of [[-6, -5], [0, -8], [6, -5]]) piece(c, circ(x, y, 2.2), '#f3a3a6', { mul: 0.4 });
  c.restore();
}
const BOX_WAVE = { w: 230, h: 260, ox: 112, oy: 236 };

// ---- a little knitted scarf (Christmas): red with cream stripes and a fringed end ----
function knit(c, p) {
  fp(c, p, '#d9433a', { sh: 0.2, mul: 0.5 });
  clipped(c, p, () => { for (let k = -8; k < 8; k++) piece(c, rectP(k * 14, -400, 5, 800), '#f6e6cc', { mul: 0.3 }); });
}
function scarfFront(c, y) {
  const p = new Path2D(); p.moveTo(-38, y - 8); p.quadraticCurveTo(0, y + 12, 38, y - 8); p.lineTo(38, y + 6); p.quadraticCurveTo(0, y + 26, -38, y + 6); p.closePath(); knit(c, p);
  const t = poly([[8, y + 10], [24, y + 8], [28, y + 46], [12, y + 48]]); knit(c, t);
  for (let i = 0; i < 4; i++) fp(c, rectP(13 + i * 4, y + 47, 2.4, 7), '#f6e6cc', { sh: 0 });
}
function scarfSide(c) {                                     // around the neck of the 3/4 sitting pose
  const p = new Path2D(); p.moveTo(-6, -122); p.quadraticCurveTo(32, -100, 72, -118); p.lineTo(72, -102); p.quadraticCurveTo(32, -84, -6, -106); p.closePath(); knit(c, p);
  const t = poly([[40, -96], [56, -98], [60, -58], [44, -56]]); knit(c, t);
  for (let i = 0; i < 4; i++) fp(c, rectP(45 + i * 4, -57, 2.4, 7), '#f6e6cc', { sh: 0 });
}

// ---- shaking off water, facing you: soaked spiky fur, head whipping to one side (k = 0/1: the two ends of the shake) ----
function drawShakeB(c, k = 0, o = {}) {
  const d = k ? 1 : -1;
  tail(c, -d * 34, -126, 17);
  for (const s of [-1, 1]) fp(c, union(limb([s * 30, -52], [s * 34, -8], 18, 16), ell(s * 36, -6, 12, 7)), PK.furS, { sh: 0.14 });   // hind legs behind
  const body = ell(d * 4, -72, 46, 36, d * 0.08);
  const spikes = new Path2D(); for (let i = 0; i < 18; i++) { const a = i / 18 * TAU, x = d * 4 + Math.cos(a) * 44, y = -72 + Math.sin(a) * 34; spikes.addPath(poly([[x - Math.sin(a) * 6, y + Math.cos(a) * 6], [x + Math.cos(a) * 12, y + Math.sin(a) * 12], [x + Math.sin(a) * 6, y - Math.cos(a) * 6]])); }
  fp(c, union(body, spikes), PK.fur, { sh: 0.16 });                         // wet, spiky outline
  if (o.pack) for (const s of [-1, 1]) band(c, [s * 30, -100], [s * 36, -62], 7, '#c7453a', { sh: 0.12 });
  fp(c, ell(0, -50, 32, 22), PK.fur, { sh: 0.12 });
  band(c, [3, -60], [3, -30], 8, PK.hBlue, { sh: 0.12 });
  for (const s of [-1, 1]) fp(c, union(limb([s * 16, -52], [s * 18, -6], 19, 17), ell(s * 19, -5, 13, 7.5)), PK.fur, { sh: 0.16 });   // forelegs
  // motion: pale paper slivers either side, and drops flying off
  for (const s of [-1, 1]) for (let i = 0; i < 2; i++) { const r = 64 + i * 12, p = new Path2D(); p.arc(d * 6, -110, r, s > 0 ? -0.5 : Math.PI - 0.4, s > 0 ? 0.4 : Math.PI + 0.5); p.arc(d * 6, -110, r - 4, s > 0 ? 0.4 : Math.PI + 0.5, s > 0 ? -0.5 : Math.PI - 0.4, true); p.closePath(); piece(c, p, '#cfe8f6', { mul: 0.2 }); }
  for (const [x, y] of [[-78, -150], [84, -140], [-70, -96], [90, -100], [-60, -170], [66, -172]]) { const p = new Path2D(); p.moveTo(x, y - 7); p.quadraticCurveTo(x + 5, y, x, y + 4); p.quadraticCurveTo(x - 5, y, x, y - 7); fp(c, p, '#7cc4ec', { sh: 0.1, mul: 0.4 }); }
  c.save(); c.translate(d * 14, -118); c.rotate(d * 0.34); c.scale(0.78, 0.78); head3q(c, DESIGNS.B.q.G, o.expr || 'happy'); c.restore();
}
const BOX_SHAKE = { w: 260, h: 260, ox: 130, oy: 236 };
