// ================= HOME: Parker's little yard =================
// Scene is 400 units wide; height H follows the screen (portrait first). Things on the ground are placed by
// their distance d above the bottom edge, so saved positions survive any resize.
const SCENE_W = 400;

// ---- time of day ----
function timeOfDay(date) { const h = date.getHours() + date.getMinutes() / 60; return h >= 5 && h < 10 ? 'morning' : h < 16 && h >= 10 ? 'day' : h >= 16 && h < 19 ? 'dusk' : 'night'; }
const PALETTES = {
  morning: { sky: ['#9fcfee', '#b7dcef', '#d2e9ee', '#f1e6d4', '#fbdcc0'], sun: { x: 0.22, y: 0.78, r: 26, col: '#fff1c2', glow: '255,232,190' },
    hill1: '#b5d9a6', hill2: '#9ccc8a', tree: '#6fae6e', cloud: '#fff6ee', tint: [255, 246, 236], light: '255,236,200', vig: '228,220,226', mist: 0.45, motes: '255,246,220' },
  day: { sky: ['#62b6ee', '#7cc4f0', '#97d1f1', '#b4def2', '#d3edf0'], sun: { x: 0.8, y: 0.28, r: 28, col: '#fff3c6', glow: '255,244,210' },
    hill1: '#a9d68e', hill2: '#8cc874', tree: '#5fa463', cloud: '#ffffff', tint: [255, 255, 255], light: '255,244,215', vig: '228,226,232', motes: '255,250,225' },
  dusk: { sky: ['#7a6fb2', '#ad7fb4', '#e091a6', '#f3ae90', '#f8cd92'], sun: { x: 0.74, y: 0.86, r: 30, col: '#ffd590', glow: '255,190,140' },
    hill1: '#b28aa8', hill2: '#9a7da0', tree: '#6f6f96', cloud: '#f6b8b4', tint: [246, 196, 182], light: '255,190,140', vig: '170,120,150', motes: '255,214,160', lamp: 0.6 },
  night: { sky: ['#1d2452', '#262f67', '#313d7b', '#40498a', '#545b98'], moon: { x: 0.76, y: 0.3, r: 22, col: '#fff2c4', glow: '200,210,255' },
    hill1: '#3b4579', hill2: '#323c6c', tree: '#2c3561', cloud: '#5b6299', tint: [96, 108, 170], light: '170,190,255', vig: '60,60,110', stars: true, fireflies: true, lamp: 1 },
};

// ---- static layers ----
function buildSky(p, H, res) {
  const L = makeLayer(0, 0, SCENE_W, H, res), c = L.ctx, W = SCENE_W, hz = H - 330, rr = rng(5);
  piece(c, rectP(0, 0, W, H), p.sky[0], { scr: p.stars ? 0.1 : 0.25 });
  if (p.stars && !p.noStars) {
    for (let k = 0; k < 70; k++) { const x = rr() * W, y = rr() * hz * 0.9, r = 0.6 + rr() * 1.2; c.fillStyle = `rgba(255,246,214,${0.4 + rr() * 0.5})`; c.beginPath(); c.arc(x, y, r, 0, TAU); c.fill(); }
    for (let k = 0; k < 9; k++) { const x = 20 + rr() * (W - 40), y = 20 + rr() * hz * 0.7, s = 3 + rr() * 3; glow(c, x, y, s * 4, '255,240,200', 0.35); piece(c, poly([[x, y - s * 1.6], [x + s * 0.35, y - s * 0.35], [x + s * 1.6, y], [x + s * 0.35, y + s * 0.35], [x, y + s * 1.6], [x - s * 0.35, y + s * 0.35], [x - s * 1.6, y], [x - s * 0.35, y - s * 0.35]]), '#fff3c8', { mul: 0.3, scr: 0.2 }); }
  }
  const n = p.sky.length;
  for (let i = 1; i < n; i++) {
    const y = lerp(hz * 0.16, hz - 40, (i - 1) / (n - 2));
    strip(c, -20, W + 20, x => y + 7 * Math.sin(x / (90 + i * 23) + i * 1.7) + 3 * fbm1(x / 50, i), H, p.sky[i], { seed: 20 + i, shadow: p.stars ? 0.18 : 0.1, amp: 3.5, scr: 0.22 });
  }
  const orb = p.sun || p.moon, ox = orb.x * W, oy = hz * orb.y, veil = p.overcast > 0.4;
  c.save(); if (veil) c.globalAlpha = 0.3;          // behind the overcast the sun / moon is only a pale disc
  glow(c, ox, oy, orb.r * 5, orb.glow, 0.5 * (1 - p.overcast));
  if (p.moon) {
    const m = mk(orb.r * 2.6 * res, orb.r * 2.6 * res), mc = m.getContext('2d'); mc.scale(res, res);
    piece(mc, circ(orb.r * 1.3, orb.r * 1.3, orb.r), orb.col, { mul: 0.4, scr: 0.2 });
    mc.globalCompositeOperation = 'destination-out'; mc.fill(circ(orb.r * 1.75, orb.r * 1.05, orb.r * 0.86));
    c.drawImage(m, ox - orb.r * 1.3, oy - orb.r * 1.3, orb.r * 2.6, orb.r * 2.6);
  } else tornPiece(c, ellipsePts(ox, oy, orb.r, orb.r, 40), orb.col, { amp: 1.4, seed: 7, shadow: 0, rimCol: '#fffbe8' });
  c.restore();
  if (p.overcast) overcastClouds(c, p, hz);
  // hills and the trees behind the fence
  strip(c, -20, W + 20, x => hz - 18 - 30 * Math.exp(-(((x - 300) / 110) ** 2)) - 14 * Math.exp(-(((x - 60) / 90) ** 2)) + 3 * fbm1(x / 40, 3), H, p.hill1, { seed: 40, shadow: 0.12 });
  if (p.mist) { c.save(); c.globalAlpha = p.mist; strip(c, -20, W + 20, x => hz - 6 + 3 * Math.sin(x / 60), H, '#fff8f0', { seed: 44, shadow: 0, rim: 0, amp: 3 }); c.restore(); }
  strip(c, -20, W + 20, x => hz + 4 - 10 * Math.exp(-(((x - 140) / 120) ** 2)) + 3 * fbm1(x / 40, 4), H, p.hill2, { seed: 41, shadow: 0.15 });
  seasonTrees(c, p, hz);
  return L;
}
function cloudSprites(p, res) {
  return [[60, 16, 1], [44, 12, 2], [70, 18, 3]].map(([w, h, s]) => {
    const L = makeLayer(-w - 12, -h * 2 - 12, w + 12, h + 12, res), c = L.ctx;
    tornPiece(c, ellipsePts(0, 0, w, h, 36), p.cloud, { amp: 2.5, seed: 300 + s, rimCol: shade(p.cloud, 1.2), shadow: 0.1, mul: 0.6 });
    tornPiece(c, ellipsePts(-w * 0.25, -h * 0.7, w * 0.45, h * 0.9, 30), p.cloud, { amp: 2, seed: 310 + s, rimCol: shade(p.cloud, 1.2), shadow: 0.08, mul: 0.6 });
    return L;
  });
}
// overlay drawn with multiply each frame: tint the yard (not the sky) + soft vignette. Smooth, so low-res is fine.
function buildMulOverlay(p, H, lv = 1) {
  const L = makeLayer(0, 0, SCENE_W, H, 1), c = L.ctx, hz = H - 330, [r, g, b] = p.tint;
  c.fillStyle = '#fff'; c.fillRect(0, 0, SCENE_W, H);
  const g1 = c.createLinearGradient(0, hz - 60, 0, hz + 40); g1.addColorStop(0, 'rgba(255,255,255,1)'); g1.addColorStop(1, `rgb(${r},${g},${b})`);
  c.fillStyle = g1; c.fillRect(0, hz - 60, SCENE_W, H);
  if (lv > 1) { c.fillStyle = `rgb(${r},${g},${b})`; for (const q of houseOutline(lv, HOUSES[lv].x0, H - HOUSE.d)) c.fill(q); }   // the bigger roofs reach up into the sky: tint them like the yard
  vignette(c, SCENE_W, H, p.vig, 0.42, 1.0);
  return L;
}
function buildScrOverlay(p, H) {
  const L = makeLayer(0, 0, SCENE_W, H, 1), c = L.ctx, hz = H - 330, orb = p.sun || p.moon;
  c.fillStyle = '#000'; c.fillRect(0, 0, SCENE_W, H);
  glow(c, orb.x * SCENE_W, hz * orb.y, H * 0.55, p.light, (p.stars ? 0.08 : 0.14) * (p.lightA ?? 1));
  return L;
}

// ---- the yard itself (same for every time of day — the overlay tints it; it changes with the season and snow) ----
const HOUSE = { x: 24, d: 250 }, MAILBOX = { x: 330, d: 232 }, LAMP = { x: 222, d: 292 };
// (the doghouse and the bigger houses are drawn in js/house.js)
function mailbox(c, x, by) {
  pp(c, rectP(x - 6, by - 84, 12, 84), '#b77b4e', 0.25); piece(c, rectP(x - 6, by - 84, 4, 84), '#cf9466', { mul: 0.4 });
  pp(c, rectP(x - 20, by - 86, 40, 7), '#a56c43', 0.2);
  const body = new Path2D(); body.moveTo(x - 32, by - 86); body.lineTo(x - 32, by - 112); body.quadraticCurveTo(x - 32, by - 128, x - 16, by - 128); body.lineTo(x + 18, by - 128); body.quadraticCurveTo(x + 32, by - 128, x + 32, by - 112); body.lineTo(x + 32, by - 86); body.closePath();
  pp(c, body, '#e2574a', 0.28);
  clipped(c, body, () => { piece(c, rectP(x - 32, by - 92, 64, 6), '#c7453a', { mul: 0.4 }); piece(c, rectP(x - 26, by - 126, 44, 4), '#f07a6c', { mul: 0.4, scr: 0.2 }); });
  const lid = new Path2D(); lid.moveTo(x - 36, by - 84); lid.lineTo(x - 36, by - 112); lid.quadraticCurveTo(x - 36, by - 131, x - 28, by - 131); lid.lineTo(x - 28, by - 84); lid.closePath();
  pp(c, lid, '#f07466', 0.2);
  pp(c, circ(x - 32, by - 106, 2.4), ARCH.gold, 0.1);
  pawPrint(c, x + 6, by - 106, 0.7, '#fff1e6');
  // little flowerpot at the foot of the post
  pp(c, poly([[x + 10, by - 18], [x + 34, by - 18], [x + 31, by], [x + 13, by]]), '#d77a4f', 0.25);
  leaf(c, x + 22, by - 18, 18, 5, -1.9, '#5fa55a'); leaf(c, x + 22, by - 18, 16, 5, -1.2, '#6db463');
  flower(c, x + 16, by - 34, 5, '#f58cbf', 3, false); flower(c, x + 28, by - 30, 4.5, '#fff7ee', 4, false);
}
// the flag is drawn live (it goes up when a postcard arrives — stage 2)
function mailboxFlag(c, x, by, up) {
  c.save(); c.translate(x + 22, by - 100); c.rotate(up ? Math.PI / 2 : 0);   // pivot on the box's side; down = lying along it
  pp(c, rectP(-30, -2, 32, 4), '#7a5a48', 0.15); pp(c, rectP(-30, -2, 12, 11), ARCH.gold, 0.15); c.restore();
}
function fence(c, y, H) {
  pp(c, rectP(-10, y - 34, SCENE_W + 20, 6), '#efe0c8', 0.18); pp(c, rectP(-10, y - 14, SCENE_W + 20, 6), '#efe0c8', 0.18);
  for (let x = -4; x < SCENE_W + 10; x += 19) pp(c, poly([[x, y], [x, y - 44], [x + 6, y - 52], [x + 12, y - 44], [x + 12, y]]), '#fff5e4', 0.22);
}
function lampPost(c, x, by) {     // a little garden lantern, lit at dusk and night
  pp(c, rectP(x - 2.5, by - 70, 5, 70), '#4f4a5e', 0.2);
  pp(c, slab([x - 2, by - 70], [x + 14, by - 74], 3), '#4f4a5e', 0.1);
  pp(c, poly([[x + 8, by - 72], [x + 20, by - 72], [x + 18, by - 56], [x + 10, by - 56]]), '#fbe6ae', 0.15);
  pp(c, rectP(x + 7, by - 74, 14, 3), '#4f4a5e', 0.1);
}
function bowl(c, x, by) {
  pp(c, ell(x, by - 6, 20, 8), '#5b8ed1', 0.28); pp(c, ell(x, by - 10, 18, 5), '#e9f1fb', 0); pp(c, ell(x, by - 10, 13, 3), '#c7854a', 0);
}
function buildYard(H, res, look = 'spring', lv = 1, bare = false) {
  // lv = the house (1 doghouse, 2 cabin, 3 big house); bare = everything but the house (the upgrade animation builds it in)
  const h = HOUSES[lv], W = SCENE_W, y0 = H - (lv > 1 ? 500 : 440), L = makeLayer(0, y0, W, H, res), c = L.ctx, Y = d => H - d, K = YARD_LOOK[look];
  const covered = lv > 1 && !bare ? (x, y) => houseCovers(lv, h.x0, Y(HOUSE.d), x, y) : () => false;
  strip(c, -20, W + 20, x => Y(318) + 4 * fbm1(x / 70, 2), H, K.lawn[0], { seed: 80, rimCol: K.rims[0], shadow: 0.16 });
  fence(c, Y(296), H);
  if (K.caps) fenceSnow(c, Y);
  const rb = rng(81);
  for (const [x, w] of [[214, 46], [262, 34], [395, 40]]) {     // bushes along the fence
    tornPiece(c, ellipsePts(x, Y(300), w, w * 0.62, 30), K.bush, { amp: 2.4, seed: 90 + x, rimCol: K.bushRim, shadow: 0.2 });
    if (K.caps) bushSnow(c, Y, x, w);
    for (let k = 0; k < K.nBushFl; k++) flower(c, x + (rb() - 0.5) * w * 1.3, Y(304) - rb() * w * 0.5, 4 + rb() * 2, K.bushFl[k % K.bushFl.length], 100 + x + k, false);
  }
  strip(c, -20, W + 20, x => Y(286) + 3 * fbm1(x / 90, 3), H, K.lawn[1], { seed: 82, rimCol: K.rims[1], shadow: 0.2 });
  if (h.lamp.post) lampPost(c, h.lamp.x, Y(h.lamp.d) + 2);
  if (!bare) ART.paint('house.' + lv, c, h.x0, Y(HOUSE.d));
  bowl(c, h.bowl[0], Y(h.bowl[1]));
  strip(c, -20, W + 20, x => Y(220) + 3 * fbm1(x / 110, 4), H, K.lawn[2], { seed: 83, rimCol: K.rims[2], shadow: 0.1, amp: 2.5, rimA: 0.5 });
  mailbox(c, MAILBOX.x, Y(MAILBOX.d));
  if (K.caps) { if (lv === 1) yardSnowCaps(c, Y); else { Y_ = Y; ART.paint('house.snow', c, bare ? 0 : lv, h.x0, Y(HOUSE.d), h); } }
  for (const [x, d, r] of h.stones) {     // stepping stones from his door
    const st = ell(x, Y(d), r, r * 0.42); castShadow(c, st, 2, 0.5, 2, 0.25); piece(c, st, '#ece2cf', { mul: 0.5 }); piece(c, ell(x - 2, Y(d) - 1, r * 0.7, r * 0.22), '#f8f1e4', { mul: 0.3 });
  }
  for (let k = 0; k < K.nTuft; k++) { const x = 10 + rb() * (W - 20), y = Y(286 - rb() * 190), th = 9 + rb() * 6, col = rb() < 0.5 ? K.tuft[0] : K.tuft[1]; if (!covered(x, y)) tuft(c, x, y, th, col, 400 + k); }
  for (let k = 0; k < K.nFl; k++) { const x = 120 + rb() * 260, y = Y(110 + rb() * 150), r = 3.5 + rb() * 1.5; if (!covered(x, y)) flower(c, x, y, r, K.fl[k % K.fl.length], 500 + k, false); }
  if (K.fallen) yardFallen(c, Y, K, rng(85), undefined, undefined, covered);
  if (K.petals) yardPetals(c, Y, rng(86), K.petals, covered);
  return L;
}
function buildFore(H, res, look = 'spring') {
  const W = SCENE_W, L = makeLayer(0, H - 90, W, H, res), c = L.ctx, rb = rng(91), K = YARD_LOOK[look];
  strip(c, -20, W + 20, x => H - 56 + 4 * fbm1(x / 80, 6), H, K.lawn[3], { seed: 84, rimCol: K.rims[3], shadow: 0.24 });
  for (let k = 0; k < (K.caps ? 6 : 16); k++) tuft(c, rb() * W, H - 46 + rb() * 30, 14 + rb() * 8, rb() < 0.5 ? K.ftuft[0] : K.ftuft[1], 600 + k);
  for (let k = 0; k < K.nForeFl; k++) flower(c, rb() * W, H - 40 + rb() * 24, 6 + rb() * 2, ['#fff7ee', '#f58cbf', '#f8d36a'][k % 3], 700 + k, false);
  if (K.fallen) yardFallen(c, d => H - d, K, rng(92), [8, 40], 6);
  return L;
}

// ---- dandelions (the currency) ----
function dandelionLeaf(c, ang, L, seed) {
  const r = rng(seed), dx = Math.cos(ang), dy = Math.sin(ang), nx = -dy, ny = dx, a = [], b = [];
  for (let j = 0; j <= 5; j++) { const u = j / 5, w = 4.2 * (1 - u * 0.85) * (j % 2 ? 1.5 : 0.8) + r() * 0.6; a.push([dx * L * u + nx * w, dy * L * u + ny * w]); b.push([dx * L * u - nx * w, dy * L * u - ny * w]); }
  fp(c, poly([[0, 0], ...a, [dx * L * 1.05, dy * L * 1.05], ...b.reverse()]), '#6fae55', { sh: 0.18, mul: 0.6 });
}
function drawDandelion(c, kind) {
  dandelionLeaf(c, -2.7, 18, 1); dandelionLeaf(c, -0.45, 17, 2); dandelionLeaf(c, -1.95, 14, 3);
  fp(c, limb([0, 0], [1, -34], 3, 2.4), '#79b55a', { sh: 0.15, mul: 0.6 });
  if (kind === 'puff') {
    c.save(); c.globalAlpha = 0.55; piece(c, circ(1, -36, 12), '#fffaf0', { mul: 0.2, scr: 0.3 }); c.restore();
    c.save(); c.strokeStyle = 'rgba(255,255,255,0.95)'; c.lineWidth = 0.8; c.fillStyle = '#fff';
    for (let i = 0; i < 20; i++) { const a = i / 20 * TAU; c.beginPath(); c.moveTo(1, -36); c.lineTo(1 + Math.cos(a) * 11, -36 + Math.sin(a) * 11); c.stroke(); c.beginPath(); c.arc(1 + Math.cos(a) * 11, -36 + Math.sin(a) * 11, 1.3, 0, TAU); c.fill(); }
    c.restore(); fp(c, circ(1, -36, 2.6), '#d9c9a4', { sh: 0.1 });
  } else {
    const ring = (n, r, rx, ry, col) => { const p = new Path2D(); for (let i = 0; i < n; i++) { const a = i / n * TAU; p.addPath(ell(1 + Math.cos(a) * r, -36 + Math.sin(a) * r, rx, ry, a)); } return p; };
    fp(c, ring(14, 6.4, 4.4, 1.9), '#f6c22c', { sh: 0.2, mul: 0.5 });
    fp(c, ring(10, 3.6, 3.2, 1.6), '#fbd648', { sh: 0.1, mul: 0.5 });
    fp(c, circ(1, -36, 2.4), '#eaa21c', { sh: 0.1, mul: 0.5 });
  }
}
const DANDELION_BOX = { w: 60, h: 66, ox: 28, oy: 56 };

// ================= ART LIST: the yard =================
// backdrops, built once per time of day / season and kept by the game (w = the scene's 400 units; h follows the screen)
ART.def('scene.sky', { kind: 'layer', group: 'scene', box: { w: SCENE_W, h: 'screen', ox: 0, oy: 0 }, draw: (p, H, res) => buildSky(p, H, res), note: 'sky, sun or moon, hills, trees behind the fence: (palette, H, res)' });
ART.def('scene.clouds', { kind: 'layer', group: 'scene', box: { w: 164, h: 78, ox: 82, oy: 60 }, draw: (p, res) => cloudSprites(p, res), note: 'three clouds (the largest box is given): (palette, res)' });
ART.def('scene.yard', { kind: 'layer', group: 'scene', box: { w: SCENE_W, h: 440, ox: 0, oy: 440 }, draw: (H, res, look, lv, bare) => buildYard(H, res, look, lv, bare), note: 'lawn, fence, bushes, house, mailbox, lamp, bowl, stones: (H, res, season look, house level, without the house); 500 high for the cabin and the big house' });
ART.def('scene.fore', { kind: 'layer', group: 'scene', box: { w: SCENE_W, h: 90, ox: 0, oy: 90 }, draw: (H, res, look) => buildFore(H, res, look), note: 'grass in front of everything: (H, res, season look)' });
ART.def('scene.light.mul', { kind: 'layer', group: 'scene', box: { w: SCENE_W, h: 'screen', ox: 0, oy: 0 }, draw: (p, H, lv) => buildMulOverlay(p, H, lv), note: 'time-of-day tint over the yard and the house (multiplied): (palette, H, house level)' });
ART.def('scene.light.scr', { kind: 'layer', group: 'scene', box: { w: SCENE_W, h: 'screen', ox: 0, oy: 0 }, draw: (p, H) => buildScrOverlay(p, H), note: 'time-of-day glow (screened)' });
ART.def('prop.dandelion', { group: 'prop', box: DANDELION_BOX, stick: false, draw: (c, a) => drawDandelion(c, a[0]), note: 'yellow | puff' });
ART.def('live.mailFlag', { kind: 'live', group: 'live', box: { w: 34, h: 34, ox: 30, oy: 30 }, draw: (ctx, x, by, up) => mailboxFlag(ctx, x, by, up), note: 'the mailbox flag, up when there is post: (ctx, x, baseY, up)' });
