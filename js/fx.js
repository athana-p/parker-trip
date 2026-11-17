// ================= ART: small effects and things drawn fresh every frame =================
// Everything here is entered in the art list (js/art.js). The game works out where things are and how big;
// these functions only draw what they are handed.

// ---- little cut-outs that fly about
ART.def('fx.dust', { group: 'fx', box: { w: 14, h: 12, ox: 7, oy: 6 }, stick: false, draw: (c, a) => tornPiece(c, ellipsePts(0, 0, 3 + (+a[1]), 2 + (+a[1]) * 0.6, 10), a[0], { amp: 0.5, seed: 30 + (+a[1]), rim: 0, shadow: 0.15, mul: 0.3 }), note: 'a scrap kicked up when he lands: colour | size 0–1' });
ART.def('fx.confetti', { group: 'fx', box: { w: 10, h: 8, ox: 5, oy: 4 }, stick: false, draw: (c, a) => tornPiece(c, [[-3, -1.6], [3, -2], [2.6, 1.8], [-2.8, 1.4]], a[0], { amp: 0.4, seed: 3, rim: 0, shadow: 0.12, mul: 0.3 }), note: 'a scrap from a popped bubble: colour' });
ART.def('fx.petal', { group: 'fx', box: { w: 12, h: 8, ox: 6, oy: 4 }, stick: false, draw: c => piece(c, ell(0, 0, 4, 1.8), '#f6c22c', { mul: 0.5 }), note: 'a dandelion petal' });
ART.def('fx.drop', { group: 'fx', box: { w: 12, h: 14, ox: 6, oy: 7 }, stick: false, draw: c => { const p = new Path2D(); p.moveTo(0, -4.5); p.quadraticCurveTo(3.4, 1, 0, 4); p.quadraticCurveTo(-3.4, 1, 0, -4.5); piece(c, p, '#8fcdef', { mul: 0.35 }); }, note: 'a drop of water' });
ART.def('fx.flake', { group: 'fx', box: { w: 14, h: 14, ox: 7, oy: 7 }, stick: false, draw: c => tornPiece(c, ellipsePts(0, 0, 3.4, 3, 14), '#ffffff', { amp: 0.6, seed: 905, rimCol: '#ffffff', shadow: 0.2, mul: 0.2 }), note: 'a snowflake he snaps at' });
ART.def('fx.seed', { group: 'fx', box: { w: 12, h: 14, ox: 6, oy: 7 }, stick: false, draw: c => { c.strokeStyle = '#fff'; c.lineWidth = 0.8; c.beginPath(); c.moveTo(0, 4); c.lineTo(0, -3); c.stroke(); for (let i = -2; i <= 2; i++) { c.beginPath(); c.moveTo(0, -3); c.lineTo(i * 1.8, -6); c.stroke(); } }, note: 'a dandelion seed' });

// ---- a soap bubble: one disc of tracing paper, kept, then stretched a little as it wobbles
ART.def('fx.bubble', { kind: 'kept', group: 'fx', box: { w: 32, h: 32, ox: 16, oy: 16 }, note: 'a soap bubble', draw: res => {
  const R = 16, cv = mk(R * 2 * res, R * 2 * res), c = cv.getContext('2d'); c.scale(res, res); c.translate(R, R);
  c.globalAlpha = 0.5; piece(c, circ(0, 0, R - 1.5), '#dceefa', { mul: 0.15, scr: 0.2 }); c.globalAlpha = 1;
  c.strokeStyle = 'rgba(110,150,190,0.55)'; c.lineWidth = 1.1; c.beginPath(); c.arc(0, 0, R - 1, 0, TAU); c.stroke();      // a thin blue-grey edge so it reads on white fur
  c.strokeStyle = 'rgba(255,255,255,0.95)'; c.lineWidth = 1.5; c.beginPath(); c.arc(0, 0, R - 2.3, 0, TAU); c.stroke();
  c.lineWidth = 1.6; for (const [a0, a1, col] of [[0.2, 1.1, 'rgba(246,170,200,0.7)'], [1.1, 1.9, 'rgba(250,220,130,0.7)'], [1.9, 2.6, 'rgba(150,210,170,0.7)']]) { c.strokeStyle = col; c.beginPath(); c.arc(0, 0, R - 4, a0, a1); c.stroke(); }   // a hint of rainbow
  piece(c, ell(-5, -6, 4.5, 2.2, -0.7), '#ffffff', { mul: 0.1 }); piece(c, circ(5, 6, 1.4), '#ffffff', { mul: 0.1 });
  return cv;
} });
ART.def('live.bubble', { kind: 'live', group: 'live', note: '(ctx, x, y, r, wobble, alpha)', draw: (ctx, x, y, r, w, a) => {
  const im = ART.kept('fx.bubble');
  ctx.save(); ctx.globalAlpha = a; ctx.drawImage(im, x - r * w, y - r / w, r * 2 * w, r * 2 / w); ctx.restore();
} });
ART.def('live.rainbow', { kind: 'live', group: 'live', note: '(ctx, x, groundY, alpha)', draw: (ctx, x, y, a) => {
  const im = ART.kept('fx.rainbow');
  ctx.save(); ctx.globalAlpha = 0.8 * a; ctx.drawImage(im, x - 70, y - 118, 140, 78); ctx.restore();
} });

// ---- shadows and light on the grass
ART.def('live.shadow.parker', { kind: 'live', group: 'live', note: 'his shadow on the grass; k shrinks and pales it as he jumps: (ctx, x, y, rx, ry, k)', draw: (ctx, x, y, rx, ry, k) => {
  ctx.save(); ctx.globalCompositeOperation = 'multiply'; ctx.fillStyle = `rgba(120,110,120,${0.35 * k})`;
  ctx.beginPath(); ctx.ellipse(x, y, rx, ry, 0, 0, TAU); ctx.fill(); ctx.restore();
} });
ART.def('live.shadow.ball', { kind: 'live', group: 'live', note: 'the ball\'s shadow: (ctx, x, y, rx, ry, k)', draw: (ctx, x, y, rx, ry, k) => {
  ctx.save(); ctx.globalCompositeOperation = 'multiply'; ctx.fillStyle = `rgba(110,100,115,${0.32 * k})`; ctx.beginPath(); ctx.ellipse(x, y, rx, ry, 0, 0, TAU); ctx.fill(); ctx.restore();
} });
ART.def('live.shadow.kite', { kind: 'live', group: 'live', note: 'the kite\'s shadow on the grass: (ctx, x, y, s, rot, alpha)', draw: (ctx, x, y, s, rot, a) => {
  ctx.save(); ctx.globalCompositeOperation = 'multiply'; ctx.fillStyle = `rgba(100,90,115,${0.42 * a})`; ctx.translate(x, y); ctx.rotate(rot); ctx.scale(1.5, 0.45);
  ctx.beginPath(); ctx.moveTo(0, -24 * s); ctx.lineTo(16 * s, -4 * s); ctx.lineTo(0, 24 * s); ctx.lineTo(-16 * s, -4 * s); ctx.closePath(); ctx.fill(); ctx.restore();
} });
ART.def('live.shade.hot', { kind: 'live', group: 'live', note: 'cool shade in front of the house on a hot afternoon: (ctx, x, y)', draw: (ctx, x, y) => {
  ctx.save(); ctx.globalCompositeOperation = 'multiply'; ctx.translate(x, y); ctx.scale(1, 0.2);
  const g = ctx.createRadialGradient(0, 0, 10, 0, 0, 110); g.addColorStop(0, 'rgba(150,170,205,0.6)'); g.addColorStop(0.6, 'rgba(170,186,214,0.35)'); g.addColorStop(1, 'rgba(190,200,220,0)');
  ctx.fillStyle = g; ctx.fillRect(-110, -110, 220, 220); ctx.restore();
} });
ART.def('live.fireflies', { kind: 'live', group: 'live', note: 'summer night: (ctx, t, H)', draw: (ctx, t, H) => {
  const r = rng(17);
  ctx.save(); ctx.globalCompositeOperation = 'screen';
  for (let i = 0; i < 9; i++) {
    const bx = r() * SCENE_W, bd = 90 + r() * 220, ph = r() * TAU, sp = 0.3 + r() * 0.3;
    const x = bx + Math.sin(t * sp + ph) * 26, y = H - bd + Math.sin(t * sp * 1.3 + ph * 2) * 14, a = 0.5 + 0.5 * Math.sin(t * 1.7 + ph);
    const g = ctx.createRadialGradient(x, y, 0, x, y, 9); g.addColorStop(0, `rgba(230,255,160,${a})`); g.addColorStop(1, 'rgba(230,255,160,0)');
    ctx.fillStyle = g; ctx.fillRect(x - 9, y - 9, 18, 18);
  }
  ctx.restore();
} });
ART.def('live.spark', { kind: 'live', group: 'live', note: 'a collected dandelion flying to the counter: (ctx, x, y)', draw: (ctx, x, y) => {
  glow(ctx, x, y, 16, '255,226,140', 0.9); ctx.fillStyle = '#ffe9a6'; ctx.beginPath(); ctx.arc(x, y, 3.2, 0, TAU); ctx.fill();
} });
ART.def('live.prints', { kind: 'live', group: 'live', note: 'paw prints in the snow: (ctx, [[x, y, size, alpha], …])', draw: (ctx, list) => {
  ctx.save(); ctx.fillStyle = 'rgb(136,154,186)';
  for (const [x, y, s, a] of list) {
    ctx.globalAlpha = a;
    ctx.beginPath(); ctx.ellipse(x, y, 6 * s, 3 * s, 0, 0, TAU); for (const dx of [-6, -2, 2, 6]) ctx.ellipse(x + dx * s, y - 4.6 * s + Math.abs(dx) * 0.4 * s, 2 * s, 1.4 * s, 0, 0, TAU); ctx.fill();
  }
  ctx.restore();
} });

// ---- toys that change shape as they are played with
ART.def('live.yarnThread', { kind: 'live', group: 'live', note: 'the red thread the yarn ball leaves: (ctx, [[x, y], …])', draw: (ctx, pts) => {
  ctx.save(); ctx.strokeStyle = '#c94a40'; ctx.lineWidth = 2.2; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.beginPath();
  pts.forEach(([x, y], i) => { i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); });
  ctx.stroke(); ctx.restore();
} });
ART.def('live.tugRope', { kind: 'live', group: 'live', note: 'the tug rope between your finger (a) and his mouth (b): (ctx, ax, ay, bx, by, restLength, tugging, t)', draw: (ctx, ax, ay, bx, by, len, tugging, t) => {
  const dist = Math.hypot(ax - bx, ay - by), tension = clamp((dist - len) / 70), N = 12, nx = -(ay - by) / (dist || 1), ny = (ax - bx) / (dist || 1);
  const sag = Math.max(0, len - dist) * 0.55, w = lerp(6, 3.6, tension), pts = [];
  for (let i = 0; i <= N; i++) { const u = i / N, wob = Math.sin(t * (tugging ? 26 : 6) + u * 9) * (tugging ? 0.6 + 1.6 * tension : 0.4) * Math.sin(Math.PI * u); pts.push([lerp(bx, ax, u) + nx * wob, lerp(by, ay, u) + sag * Math.sin(Math.PI * u) + ny * wob]); }
  ctx.save(); castShadow(ctx, c => { c.beginPath(); c.moveTo(...pts[0]); pts.forEach(p => c.lineTo(...p)); c.lineWidth = w; c.strokeStyle = '#000'; c.stroke(); }, 3, 1, 3, 0.25); ctx.restore();
  for (let i = 0; i < N; i++) piece(ctx, slab(pts[i], pts[i + 1], w), i % 2 ? '#f6efe2' : '#5b8ed1', { mul: 0.3 });
  for (const [x, y] of [[ax, ay], [bx, by]]) piece(ctx, circ(x, y, w * 0.95), '#5b8ed1', { mul: 0.3 });
} });
ART.def('live.kiteString', { kind: 'live', group: 'live', note: 'from your hand below the screen to the kite: (ctx, sx, sy, kx, ky)', draw: (ctx, sx, sy, kx, ky) => {
  const mx = (sx + kx) / 2, my = (sy + ky) / 2 + 40;
  ctx.save(); ctx.strokeStyle = 'rgba(255,255,255,0.75)'; ctx.lineWidth = 0.9; ctx.beginPath(); ctx.moveTo(sx, sy); ctx.quadraticCurveTo(mx, my, kx, ky + 6); ctx.stroke(); ctx.restore();
} });
ART.KITE_BOWS = ['#f5c04a', '#5b8ed1', '#e2574a'];        // the colours of the kite tail's bows, in order
ART.def('live.sprinklerWater', { kind: 'live', group: 'live', note: 'each drop is a short paper strip pointing the way it flies: (ctx, [[x, y, dx, dy, young], …])', draw: (ctx, drops) => {
  ctx.save(); ctx.lineCap = 'round';
  for (const [x, y, dx, dy, young] of drops) {
    ctx.strokeStyle = young ? 'rgba(240,248,255,0.95)' : 'rgba(170,214,244,0.92)'; ctx.lineWidth = 2.2;
    ctx.beginPath(); ctx.moveTo(x - dx, y - dy); ctx.lineTo(x, y); ctx.stroke();
  }
  ctx.restore();
} });
ART.def('live.sprinklerArm', { kind: 'live', group: 'live', note: 'the yellow arm that turns while it is on: (ctx, cx, cy, s, angle)', draw: (ctx, cx, cy, s, a) => {
  const ex = Math.cos(a) * 16 * s, ey = Math.sin(a) * 4 * s;
  ctx.save(); ctx.strokeStyle = '#f5c04a'; ctx.lineWidth = 4 * s; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(cx - ex, cy - ey); ctx.lineTo(cx + ex, cy + ey); ctx.stroke();
  ctx.fillStyle = '#e2a93d'; ctx.beginPath(); ctx.arc(cx, cy, 4 * s, 0, TAU); ctx.fill(); ctx.restore();
} });

// ---- the little paper speech bubble above his head
function bubblePts(w, h, r) {
  const pts = [], arc = (cx, cy, a0) => { for (let i = 0; i <= 4; i++) { const a = a0 + i / 4 * Math.PI / 2; pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]); } };
  arc(w - r, h - r, 0); arc(r, h - r, Math.PI / 2); arc(r, r, Math.PI); arc(w - r, r, Math.PI * 1.5); return pts;
}
ART.def('ui.sayBubble', { kind: 'paint', group: 'ui', note: 'builds the bubble for one line of text: (text, lang, res) → { cv, w, h, M }', draw: (text, lang, res) => {
  const M = 8, maxW = 170, fs = 13, lh = 18, m = mk(1, 1).getContext('2d'); m.font = `600 ${fs}px ${FONT}`;
  // even-length lines (no lone last character), and a line never starts with punctuation
  const toks = lang === 'zh' ? [...text] : text.split(/(?<= )/), lines = []; let line = '';
  const total = m.measureText(text).width, n = Math.ceil(total / maxW), lineW = n > 1 ? Math.min(maxW, total / n + fs * 0.6) : maxW;
  for (const t of toks) { if (line && !/^[，。！？、…,.!?]/.test(t) && m.measureText(line + t).width > lineW) { lines.push(line.trim()); line = t.trimStart(); } else line += t; }
  if (line.trim()) lines.push(line.trim());
  const w = Math.ceil(Math.max(...lines.map(l => m.measureText(l).width))) + 22, h = lines.length * lh + 14;
  const cv = mk((w + M * 2) * res, (h + M * 2) * res), c = cv.getContext('2d'); c.scale(res, res); c.translate(M, M);
  tornPiece(c, bubblePts(w, h, 9), '#fffaf0', { amp: 0.7, seed: 77, rimCol: '#ffffff', shadow: 0.22, mul: 0.3 });
  c.fillStyle = '#5b3f37'; c.font = `600 ${fs}px ${FONT}`; c.textAlign = 'center'; c.textBaseline = 'middle';
  lines.forEach((l, i) => c.fillText(l, w / 2, 7 + lh * (i + 0.5) + 0.5));
  return { cv, w, h, M };
} });
ART.def('live.say', { kind: 'live', group: 'live', note: 'the bubble and its little tail pointing at his head: (ctx, bubble, tx, ty, bx, by, face, pop, alpha)', draw: (ctx, B, tx, ty, bx, by, face, pop, a) => {
  ctx.save(); ctx.globalAlpha = a; ctx.translate(tx, ty); ctx.scale(pop, pop); ctx.translate(-tx, -ty);
  const tail = poly([[clamp(tx - 7, bx + 10, bx + B.w - 18), by + B.h - 2], [clamp(tx + 5, bx + 20, bx + B.w - 8), by + B.h - 2], [tx + 2 * face, ty]]);
  castShadow(ctx, tail, 2, 1, 2, 0.18); piece(ctx, tail, '#fffaf0', { mul: 0.3 });
  ctx.drawImage(B.cv, bx - B.M, by - B.M, B.w + B.M * 2, B.h + B.M * 2);
  ctx.restore();
} });
