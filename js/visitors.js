// ================= SMALL VISITORS and the gifts they leave (new features, stage 4) =================
// Paper puppets in the same style as Parker and his friends. Origin = ground point under the body, facing right.
// The sparrow lives in props.js (drawBird); here: the neighbour's cat, the squirrel, the gifts and the gift box.

// ---------- the neighbour's cat: a ginger tabby with a white chest and a blue collar with a bell (she has a home!) ----------
const NCAT = { fur: '#f0a35a', dark: '#d27b38', light: '#fdebd2', earIn: '#f4b6a8', collar: '#4f8fd6', bell: '#f5c04a' };
function ncatHead(c, x, y, s, closed) {
  c.save(); c.translate(x, y); c.scale(s, s);
  for (const d of [-1, 1]) { pp(c, poly([[d * 28, -6], [d * 24, -40], [d * 5, -24]]), NCAT.fur, 0.15); piece(c, poly([[d * 23, -12], [d * 21, -32], [d * 10, -22]]), NCAT.earIn, { mul: 0.4 }); }
  const head = union(ell(0, 0, 30, 25), ell(0, 8, 33, 19)); pp(c, head, NCAT.fur, 0.2);
  clipped(c, head, () => { for (const [a, b] of [[[-9, -26], [-7, -13]], [[0, -27], [0, -14]], [[9, -26], [7, -13]], [[-32, 2], [-22, 4]], [[32, 2], [22, 4]]]) piece(c, slab(a, b, 4), NCAT.dark, { mul: 0.4 }); });
  piece(c, ell(0, 13, 17, 10), NCAT.light, { mul: 0.3 });
  blush(c, [[-19, 9], [21, 9]], 5, 0.5);
  dotEyes(c, [[-11, -1], [13, -1]], 4, closed);
  catNose(c, 1, 8, 1, '#e98a8a'); wMouth(c, 1, 10.5, 1); whiskers(c, 1, 12, 1);
  c.restore();
}
function ncatCollar(c, a, b) { pp(c, slab(a, b, 5), NCAT.collar, 0.1); const m = [(a[0] + b[0]) / 2 + 2, (a[1] + b[1]) / 2 + 4]; pp(c, circ(m[0], m[1], 3.6), NCAT.bell, 0.12); piece(c, rectP(m[0] - 2.4, m[1] + 0.5, 4.8, 0.9), '#b8862a', { mul: 0.3 }); }
// pose: 'sit' | 'blink' (sitting, tail round the paws) | 'swat' (sitting, one paw up at Parker) | 'eat' (sitting, head down) | 'walk0' / 'walk1' (side view)
function drawNeighborCat(c, pose = 'sit') {
  if (pose === 'sit' || pose === 'blink' || pose === 'swat' || pose === 'eat') {
    const tl = new Path2D(); tl.moveTo(-24, -12); tl.quadraticCurveTo(-44, 0, -18, 3); tl.lineTo(22, 3); tl.lineTo(22, -5); tl.lineTo(-16, -5); tl.quadraticCurveTo(-32, -7, -18, -14); tl.closePath(); pp(c, tl, NCAT.fur, 0.15);
    clipped(c, tl, () => { for (const x of [-30, -14, 2, 14]) piece(c, rectP(x, -12, 4, 18), NCAT.dark, { mul: 0.4 }); });
    const body = union(ell(0, -40, 25, 36), ell(-6, -16, 27, 16)); pp(c, body, NCAT.fur, 0.2);
    clipped(c, body, () => { for (const y of [-60, -46, -32]) piece(c, slab([-30, y], [-10, y - 6], 5), NCAT.dark, { mul: 0.4 }); piece(c, ell(14, -44, 13, 26), NCAT.light, { mul: 0.3 }); });
    pp(c, union(limb([4, -38], [5, -6], 9, 8), ell(6, -5, 7, 4.5)), NCAT.light, 0.14);
    if (pose === 'swat') pp(c, union(limb([17, -40], [36, -58], 9, 8), circ(38, -60, 6.5)), NCAT.light, 0.14);   // a soft paw-pat
    else pp(c, union(limb([17, -38], [18, -6], 9, 8), ell(19, -5, 7, 4.5)), NCAT.light, 0.14);
    ncatCollar(c, [-6, -70], [26, -66]);
    if (pose === 'eat') { pp(c, ell(16, -66, 13, 12, 0.5), NCAT.fur, 0.12); ncatHead(c, 26, -56, 0.86, true); }   // head down at the dish
    else ncatHead(c, 8, -90, 0.9, pose === 'blink');
    return;
  }
  const k = pose === 'walk1' ? -1 : 1, sw = 7 * k;
  const tail = new Path2D(); tail.moveTo(-30, -36); tail.quadraticCurveTo(-52, -52, -44, -78); tail.quadraticCurveTo(-40, -86, -36, -78); tail.quadraticCurveTo(-44, -54, -26, -42); tail.closePath();
  pp(c, tail, NCAT.fur, 0.14); clipped(c, tail, () => { for (const y of [-50, -62, -74]) piece(c, rectP(-56, y, 30, 4), NCAT.dark, { mul: 0.4 }); });
  for (const [x, a] of [[-20, -sw], [18, sw]]) pp(c, union(limb([x, -30], [x + a, -2], 7, 6), ell(x + a + 2, -2, 6, 3.5)), NCAT.dark, 0.12);   // far legs
  const body = union(ell(0, -36, 32, 15), circ(-22, -34, 13)); pp(c, body, NCAT.fur, 0.18);
  clipped(c, body, () => { for (const x of [-22, -10, 2, 14]) piece(c, slab([x, -52], [x + 3, -34], 5), NCAT.dark, { mul: 0.4 }); piece(c, ell(4, -24, 26, 6), NCAT.light, { mul: 0.3 }); });
  for (const [x, a] of [[-16, sw], [22, -sw]]) pp(c, union(limb([x, -30], [x + a, -2], 8, 7), ell(x + a + 2, -2, 6.5, 4)), x > 0 ? NCAT.light : NCAT.fur, 0.14);   // near legs
  ncatCollar(c, [20, -52], [34, -40]);
  ncatHead(c, 36, -60, 0.72, false);
}
const BOX_NCAT = { w: 140, h: 172, ox: 66, oy: 154 };   // tall enough for her ears when she sits

// ---------- the squirrel: a red squirrel with ear tufts and a big plume of a tail ----------
const SQ = { fur: '#c8743a', dark: '#9c5428', light: '#f6e2c4', tail: '#d4844a', tip: '#e9a868', nut: '#8a5a2e' };
function sqTail(c, pts) {
  const p = union(...pts.map(([x, y, r]) => circ(x, y, r))); pp(c, p, SQ.tail, 0.14);
  clipped(c, p, () => pts.forEach(([x, y, r]) => piece(c, circ(x - r * 0.3, y - r * 0.3, r * 0.55), SQ.tip, { mul: 0.3 })));
}
function sqHead(c, x, y, closed, nibble) {
  pp(c, poly([[x - 6, y - 7], [x - 5, y - 21], [x + 1, y - 8]]), SQ.dark, 0.1);                // ear tuft
  pp(c, union(circ(x, y, 10), ell(x + 7, y + 2, 7, 5.5)), SQ.fur, 0.16);
  piece(c, ell(x + 6, y + 5, 5.5, 3.2), SQ.light, { mul: 0.3 });
  pp(c, poly([[x - 1, y - 7], [x + 1, y - 19], [x + 6, y - 7]]), SQ.fur, 0.1);
  if (closed) { c.save(); c.strokeStyle = PK.eye; c.lineWidth = 1.4; c.lineCap = 'round'; c.beginPath(); c.arc(x + 4, y - 2, 2, Math.PI * 0.1, Math.PI * 0.9); c.stroke(); c.restore(); }
  else { c.fillStyle = PK.eye; c.beginPath(); c.arc(x + 4, y - 2, 2.1, 0, TAU); c.fill(); c.fillStyle = '#fff'; c.beginPath(); c.arc(x + 4.7, y - 2.7, 0.7, 0, TAU); c.fill(); }
  pp(c, circ(x + 13.5, y + 1, 1.8), '#4e3029', 0);
  blush(c, [[x + 4, y + 4]], 2.6, 0.45);
}
function sqNut(c, x, y) { pp(c, ell(x, y + 1, 4.2, 5), SQ.nut, 0.12); piece(c, ell(x, y - 3, 4.6, 2.4), '#6e4426', { mul: 0.4 }); }
// pose: 'sit' | 'nibble' (sitting up, paws holding a nut) | 'hop0' (crouched) | 'hop1' (mid-leap)
function drawSquirrel(c, pose = 'sit') {
  if (pose === 'hop0' || pose === 'hop1') {
    const up = pose === 'hop1';
    sqTail(c, up ? [[-16, -16, 7], [-26, -20, 8.5], [-36, -26, 9.5], [-44, -34, 9], [-46, -44, 7.5]] : [[-12, -10, 7], [-18, -20, 8.5], [-20, -32, 9.5], [-16, -42, 9], [-8, -46, 7]]);
    if (up) { pp(c, limb([-8, -14], [-22, -8], 5, 4), SQ.dark, 0.1); pp(c, limb([10, -16], [22, -10], 4, 3.5), SQ.fur, 0.1); }
    else { pp(c, ell(-4, -4, 11, 6), SQ.fur, 0.12); pp(c, ell(6, -2, 7, 2.6), SQ.dark, 0.1); pp(c, limb([10, -8], [12, -1], 4, 3.5), SQ.fur, 0.1); }
    const body = up ? ell(0, -16, 17, 8.5, -0.12) : ell(0, -11, 14, 10, -0.1); pp(c, body, SQ.fur, 0.16);
    clipped(c, body, () => piece(c, ell(3, up ? -10 : -5, 12, 4), SQ.light, { mul: 0.3 }));
    sqHead(c, up ? 18 : 14, up ? -22 : -20, false, false);
    return;
  }
  sqTail(c, [[-8, -6, 7], [-16, -14, 9], [-22, -26, 11], [-22, -40, 12], [-16, -52, 11], [-8, -58, 8.5], [-2, -56, 6]]);
  pp(c, ell(-2, -6, 10, 7), SQ.fur, 0.14); pp(c, ell(5, -2, 7, 2.6), SQ.dark, 0.1);                 // hind leg + foot
  const body = ell(1, -20, 12, 17, -0.15); pp(c, body, SQ.fur, 0.16);
  clipped(c, body, () => piece(c, ell(6, -18, 6.5, 13, -0.15), SQ.light, { mul: 0.3 }));
  const nib = pose === 'nibble', ny = nib ? -35 : -28;
  sqNut(c, 14, ny);
  pp(c, limb([6, -28], [13, ny + 2], 3.6, 3), SQ.fur, 0.1);
  sqHead(c, 7, -40, nib, nib);
}
const BOX_SQ = { w: 106, h: 96, ox: 64, oy: 84 };   // wide enough for the tail streaming out behind a hop

// ---------- gifts: feather, pine cone, smooth pebble, little flower, four-leaf clover (rare) ----------
const GIFTS = ['feather', 'pinecone', 'pebble', 'flower', 'clover', 'bluefeather', 'walnut', 'yarnbit', 'button', 'goldacorn', 'bell'];
const GIFT_RARE = { button: 'sparrow', goldacorn: 'squirrel', bell: 'cat' };     // each friend's own rare gift
function drawGift(c, kind) {
  if (kind === 'feather') {
    const v = new Path2D(); v.moveTo(-11, 2); v.quadraticCurveTo(-12, -10, 3, -19); v.quadraticCurveTo(10, -22, 12, -19); v.quadraticCurveTo(8, -6, -6, 0); v.closePath();
    pp(c, v, '#b8987a', 0.18, { mul: 0.4 });
    clipped(c, v, () => { for (let i = 0; i < 4; i++) piece(c, slab([-12 + i * 5, -4 - i * 4], [-4 + i * 5, -10 - i * 4], 2.2), '#7d6048', { mul: 0.4 }); piece(c, ell(10, -19, 5, 4), '#f6efe4', { mul: 0.3 }); });
    c.save(); c.strokeStyle = '#efe4d2'; c.lineWidth = 1.2; c.lineCap = 'round'; c.beginPath(); c.moveTo(-13, 4); c.quadraticCurveTo(-6, -8, 11, -20); c.stroke(); c.restore();
  } else if (kind === 'pinecone') {
    pp(c, ell(0, -9, 7, 10), '#7a4c2a', 0.2);
    for (let r = 0; r < 5; r++) for (let k = -1; k <= 1; k++) { const y = -16 + r * 4, w = 6 - Math.abs(r - 2) * 0.8; if (r % 2 && k === 1) continue; piece(c, ell(k * w * 0.7 + (r % 2 ? 2.2 : 0), y, 2.6, 1.9), r % 2 ? '#a8703e' : '#b9814a', { mul: 0.4 }); }
    pp(c, slab([0, -19], [1, -23], 1.6), '#5e3a20', 0.05);
  } else if (kind === 'pebble') {
    pp(c, ell(0, -5, 10, 6.5, -0.1), '#9aa6b2', 0.22, { mul: 0.4 });
    piece(c, ell(-3, -8, 4.5, 1.8, -0.2), '#d9e0e7', { mul: 0.2 });
    c.fillStyle = 'rgba(90,100,115,0.5)'; for (const [x, y] of [[3, -4], [6, -6], [-1, -2]]) { c.beginPath(); c.arc(x, y, 0.7, 0, TAU); c.fill(); }
  } else if (kind === 'flower') {
    pp(c, limb([0, 0], [1, -15], 1.6, 1.3), '#5f9e4f', 0.1);
    leaf(c, 0, -5, 8, 2.6, -2.6, '#6db463'); leaf(c, 1, -8, 7, 2.4, -0.5, '#6db463');
    flower(c, 1, -17, 5.5, '#c9a2e6', 77, false);
  } else if (kind === 'bluefeather') {      // a sparrow's friend finds a jay's feather: blue with dark bars
    const v = new Path2D(); v.moveTo(-11, 2); v.quadraticCurveTo(-12, -10, 3, -19); v.quadraticCurveTo(10, -22, 12, -19); v.quadraticCurveTo(8, -6, -6, 0); v.closePath();
    pp(c, v, '#6fa8e0', 0.18, { mul: 0.4 });
    clipped(c, v, () => { for (let i = 0; i < 5; i++) piece(c, slab([-12 + i * 4.4, -3 - i * 3.6], [-3 + i * 4.4, -9 - i * 3.6], 1.6), '#2f4f86', { mul: 0.4 }); piece(c, ell(10, -19, 5, 4), '#ffffff', { mul: 0.3 }); piece(c, ell(-6, -3, 5, 3), '#bfe0f6', { mul: 0.3 }); });
    c.save(); c.strokeStyle = '#eef5fb'; c.lineWidth = 1.2; c.lineCap = 'round'; c.beginPath(); c.moveTo(-13, 4); c.quadraticCurveTo(-6, -8, 11, -20); c.stroke(); c.restore();
  } else if (kind === 'walnut') {
    const w = ell(0, -8, 9, 8); pp(c, w, '#b98a5c', 0.2, { mul: 0.4 });
    clipped(c, w, () => { piece(c, slab([0, -16], [0, 0], 1.3), '#8a5f38', { mul: 0.3 }); for (const [x, y, r] of [[-4, -11, 2.4], [-5, -5, 2], [4, -12, 2.2], [5, -5, 2.4]]) piece(c, ell(x, y, r, r * 0.6, 0.6), '#9c6e44', { mul: 0.3 }); piece(c, ell(-3, -13, 2.6, 1.2, -0.4), '#d9b68c', { mul: 0.2 }); });
  } else if (kind === 'yarnbit') {           // a little tuft of yarn, snagged somewhere on her rounds
    pp(c, circ(0, -8, 7.5), '#ef8a9a', 0.2, { mul: 0.4 });
    c.save(); c.strokeStyle = '#c95f72'; c.lineWidth = 1.1; for (const a of [-0.6, 0.1, 0.8]) { c.beginPath(); c.ellipse(0, -8, 7, 3.6, a, 0, TAU); c.stroke(); }
    c.strokeStyle = '#ef8a9a'; c.lineWidth = 1.8; c.lineCap = 'round'; c.beginPath(); c.moveTo(6, -4); c.bezierCurveTo(12, 0, 6, 3, 13, 4); c.stroke(); c.restore();
  } else if (kind === 'button') {            // a shiny little button: magpie treasure
    pp(c, circ(0, -8, 8.5), '#e9655a', 0.2, { mul: 0.3 }); piece(c, circ(0, -8, 6.2), '#f58a7c', { mul: 0.2 });
    for (const [x, y] of [[-2, -10], [2, -10], [-2, -6], [2, -6]]) { c.fillStyle = '#a8433b'; c.beginPath(); c.arc(x, y, 1.1, 0, TAU); c.fill(); }
    piece(c, ell(-4, -12, 2.4, 1.2, -0.6), '#ffffff', { mul: 0.1 }); sparkle(c, 8, -16, 3.5);
  } else if (kind === 'goldacorn') {
    pp(c, ell(0, -7, 6.5, 8), '#f2c14e', 0.2, { mul: 0.3 }); piece(c, ell(-2, -9, 1.8, 4, -0.2), '#fff1b8', { mul: 0.1 });
    pp(c, union(ell(0, -14, 8, 4.5), rectP(-0.8, -20, 1.6, 4)), '#8a5a2e', 0.12);
    clipped(c, ell(0, -14, 8, 4.5), () => { for (let x = -8; x < 8; x += 3) piece(c, slab([x, -18], [x + 3, -10], 0.7), '#6e4426', { mul: 0.3 }); });
    sparkle(c, 8, -4, 3.5);
  } else if (kind === 'bell') {              // the little bell off her collar, on a bit of blue ribbon
    pp(c, poly([[-9, -14], [-2, -10], [-3, -6], [-10, -9]]), '#4f8fd6', 0.08);
    pp(c, circ(0, -7, 7), '#f5c04a', 0.2, { mul: 0.3 }); piece(c, rectP(-5, -6, 10, 1.4), '#b8862a', { mul: 0.3 }); piece(c, circ(0, -2.5, 1.4), '#8c6420', { mul: 0.2 });
    piece(c, ell(-2.5, -10, 2.2, 1.3, -0.5), '#fff4c4', { mul: 0.1 }); sparkle(c, 7, -14, 3.5);
  } else if (kind === 'clover') {
    pp(c, limb([0, 0], [-1, -12], 1.5, 1.2), '#4f8e44', 0.1);
    const heart = (a, col) => { c.save(); c.translate(-1, -14); c.rotate(a); const p = union(circ(-2.7, -7, 3.1), circ(2.7, -7, 3.1), poly([[-5.6, -5.6], [5.6, -5.6], [0, -0.6]])); pp(c, p, col, 0.14, { mul: 0.4 }); piece(c, slab([0, -1.5], [0, -7.5], 0.9), '#a6dc94', { mul: 0.3 }); c.restore(); };
    for (let i = 0; i < 4; i++) heart(i * Math.PI / 2 + Math.PI / 4, i % 2 ? '#4fa04a' : '#5db657');
  }
}
const BOX_GIFT = { w: 36, h: 36, ox: 18, oy: 28 };
function sparkle(c, x, y, r) { pp(c, poly([[x, y - r], [x + r * 0.28, y - r * 0.28], [x + r, y], [x + r * 0.28, y + r * 0.28], [x, y + r], [x - r * 0.28, y + r * 0.28], [x - r, y], [x - r * 0.28, y - r * 0.28]]), '#fffbe6', 0.05); }

// ---------- snacks for the visitors: the packet in the shop, and the little dish you put out in the yard ----------
const DISH = { sparrow: { band: '#8fb9e2', food: '#e3c48a' }, squirrel: { band: '#9cc98a', food: '#9c6a3c' }, cat: { band: '#f0a35a', food: '#c7d3de' } };
function dishFood(c, k) {
  if (k === 'sparrow') { const r = rng(3); for (let i = 0; i < 22; i++) piece(c, ell((r() - 0.5) * 22, -5 - r() * 4, 1.5, 1, r() * 3), r() < 0.3 ? '#c99a5a' : r() < 0.6 ? '#f1dca8' : '#e3c48a', { mul: 0.2 }); }
  else if (k === 'squirrel') { for (const [x, y] of [[-6, -6], [3, -7], [8, -5], [-1, -4]]) { pp(c, ell(x, y, 3.6, 3, 0.3), '#a8703f', 0.1); piece(c, ell(x, y - 1.4, 3.6, 1.3, 0.3), '#7a4c2a', { mul: 0.3 }); } }
  else for (const [x, y, a] of [[-3, -6, -0.15], [4, -5, 0.2]]) { c.save(); c.translate(x, y); c.rotate(a); pp(c, union(ell(0, 0, 7.5, 2.4), poly([[-7, 0], [-11, -2.6], [-11, 2.6]])), '#c7d3de', 0.1); piece(c, ell(1, -0.8, 6, 0.8), '#eef2f6', { mul: 0.1 }); c.fillStyle = '#4a3a5a'; c.beginPath(); c.arc(5, -0.5, 0.7, 0, TAU); c.fill(); c.restore(); }
}
function drawDish(c, k) {
  const d = DISH[k]; pp(c, ell(0, -3, 17, 6), '#fffaf0', 0.25); piece(c, ell(0, -2, 17, 4.5), d.band, { mul: 0.3 }); piece(c, ell(0, -4, 13, 3.6), '#f3ead8', { mul: 0.2 });
  dishFood(c, k);
}
const BOX_DISH = { w: 44, h: 26, ox: 22, oy: 18 };
function drawSnack(c, id) {                // the packet in the shop: kraft paper, a coloured label, a peek at what's inside
  const k = { seed: 'sparrow', nuts: 'squirrel', fish: 'cat' }[id], d = DISH[k]; c.scale(1.5, 1.5);
  const bag = poly([[-14, 18], [14, 18], [12, -12], [9, -16], [-9, -16], [-12, -12]]); pp(c, bag, '#d9b98a', 0.2);
  clipped(c, bag, () => { piece(c, rectP(-16, -16, 32, 5), '#c9a676', { mul: 0.3 }); for (let x = -12; x < 14; x += 4) piece(c, rectP(x, -16, 1.6, 4), '#b8955f', { mul: 0.3 }); });
  pp(c, rectP(-10, -6, 20, 16), '#fffaf0', 0.05); piece(c, rectP(-10, -6, 20, 3.5), d.band, { mul: 0.3 });
  c.save(); c.translate(0, 8); c.scale(0.62, 0.62); dishFood(c, k); c.restore();
  pawPrint(c, 9, 13, 0.18, '#b5835a');
}

// the little gift box on the doghouse deck, where his visitors' presents are kept
function drawGiftBox(c) {
  pp(c, rectP(-12, -16, 24, 16), '#e2b77e', 0.22); piece(c, rectP(-12, -16, 24, 3), '#d4a066', { mul: 0.4 });
  pp(c, rectP(-14, -21, 28, 6), '#eec48c', 0.15);
  pp(c, rectP(-2, -21, 4, 21), '#e2574a', 0.08);
  for (const d of [-1, 1]) pp(c, ell(d * 5, -24, 5, 3, d * 0.5), '#e2574a', 0.1);
  pp(c, circ(0, -23, 1.8), '#c7453a', 0);
  pawPrint(c, -7, -6, 0.32, '#b5835a');
}
const BOX_GIFTBOX = { w: 40, h: 40, ox: 20, oy: 34 };

// ================= ART LIST: visitors and what they leave =================
ART.def('visitor.cat', { group: 'visitor', box: BOX_NCAT, k: 0.62, draw: (c, a) => drawNeighborCat(c, a[0]), note: 'the neighbour\'s cat: sit | blink | walk0 | walk1 | swat | eat' });
ART.def('visitor.squirrel', { group: 'visitor', box: BOX_SQ, k: 0.66, draw: (c, a) => drawSquirrel(c, a[0]), note: 'sit | nibble | hop0 | hop1' });
for (const kind of GIFTS) ART.def('gift.' + kind, { group: 'gift', box: BOX_GIFT, k: 1.25, stick: false, draw: c => drawGift(c, kind) });
ART.def('prop.giftbox', { group: 'prop', box: BOX_GIFTBOX, k: 1.2, stick: false, draw: c => drawGiftBox(c), note: 'the box by the door where gifts are kept' });
ART.def('prop.dish', { group: 'prop', box: BOX_DISH, k: 1.6, stick: false, draw: (c, a) => drawDish(c, a[0]), note: 'a snack put out in the yard: sparrow | squirrel | cat' });
for (const id of ['seed', 'nuts', 'fish']) ART.def('item.' + id, { group: 'snack', box: { w: 44, h: 44, ox: 22, oy: 22 }, stick: false, draw: (c, a) => { const k = +(a[0] === undefined ? 1 : a[0]); c.save(); c.scale(k, k); drawSnack(c, id); c.restore(); }, note: 'size' });
