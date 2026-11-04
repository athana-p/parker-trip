// ================= TORN-PAPER BACKGROUNDS (ported from One More Walk / bg.js) =================
// Generic pieces of the layered strip system. Scenes (yard, postcards) build their static layers
// once into offscreen canvases with these helpers; only moving things are redrawn per frame.

// an offscreen layer covering [x0,x1]×[y0,y1] in scene units, rendered at `res` pixels per unit
function makeLayer(x0, y0, x1, y1, res = 1) {
  const c = mk((x1 - x0) * res, (y1 - y0) * res), ctx = c.getContext('2d');
  ctx.scale(res, res); ctx.translate(-x0, -y0);
  return { c, ctx, x0, y0, w: x1 - x0, h: y1 - y0, res };
}
function drawLayer(ctx, L, dx = 0, dy = 0) { ctx.drawImage(L.c, L.x0 + dx, L.y0 + dy, L.w, L.h); }

// one torn horizontal strip (top edge = f(x)); back-to-front calls give the layered look
function strip(ctx, x0, x1, f, yBottom, col, o = {}) {
  return tornPiece(ctx, stripPts(x0, x1, f, yBottom, o.step || 10), col, { amp: 4, seed: 1, rimA: 0.8, shadow: 0.2, ...o });
}
// ridge line helper for hills / mountains
const ridge = (x, s, base, amp, wl = 380) => base - amp * Math.max(0, fbm1(x / wl, s) * 0.8 + 0.45) - amp * 0.12 * fbm1(x / 90, s + 9);

function flower(ctx, x, y, r, col, seed, stem = true) {
  const rr = rng(seed);
  if (stem) { ctx.save(); ctx.strokeStyle = '#3f6b4c'; ctx.lineWidth = Math.max(1.2, r * 0.3); ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(x + (rr() - 0.5) * 8, y + r * 2, x + (rr() - 0.5) * 4, y + r * 4.2); ctx.stroke(); ctx.restore(); }
  const petals = new Path2D(); const n = 5, a0 = rr() * TAU;
  for (let i = 0; i < n; i++) { const a = a0 + i / n * TAU; petals.addPath(ell(x + Math.cos(a) * r * 0.62, y + Math.sin(a) * r * 0.62, r * 0.56, r * 0.4, a)); }
  castShadow(ctx, petals, 2, 1, 3, 0.2);
  piece(ctx, petals, col, { scr: 0.3 });
  piece(ctx, circ(x, y, r * 0.3), '#f6c453', { scr: 0.2 });
}
function tuft(ctx, x, y, h, col, seed) {
  const rr = rng(seed), pts = [[x - h * 0.35, y]];
  const n = 3 + Math.floor(rr() * 3);
  for (let i = 0; i < n; i++) { const u = (i + 0.5) / n; pts.push([x - h * 0.35 + u * h * 0.7 + (rr() - 0.5) * 6, y - h * (0.6 + rr() * 0.5)]); pts.push([x - h * 0.35 + (u + 0.5 / n) * h * 0.7, y - h * 0.12]); }
  pts.push([x + h * 0.35, y]);
  piece(ctx, poly(pts), col, { scr: 0.25 });
}

// ---- light (per scene palette) ----
function glow(ctx, x, y, r, rgb, a) {
  ctx.save(); ctx.globalCompositeOperation = 'screen';
  const g = ctx.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, `rgba(${rgb},${a})`); g.addColorStop(0.5, `rgba(${rgb},${a * 0.25})`); g.addColorStop(1, `rgba(${rgb},0)`);
  ctx.fillStyle = g; ctx.fillRect(x - r, y - r, r * 2, r * 2); ctx.restore();
}
function vignette(ctx, w, h, rgb = '150,110,150', inner = 0.45, outer = 1.05) {
  ctx.save(); ctx.globalCompositeOperation = 'multiply';
  const R = Math.max(w, h), g = ctx.createRadialGradient(w / 2, h * 0.52, R * inner, w / 2, h * 0.52, R * outer);
  g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(1, `rgb(${rgb})`);
  ctx.fillStyle = g; ctx.fillRect(0, 0, w, h); ctx.restore();
}
// a few drifting light motes (smooth, not on twos)
function motes(ctx, t, w, h, n = 12, seed = 91, rgb = '255,236,190') {
  const r = rng(seed);
  ctx.save(); ctx.globalCompositeOperation = 'screen';
  for (let i = 0; i < n; i++) {
    const x0 = r() * w, y0 = r() * h, sp = 4 + r() * 8, ph = r() * TAU, sz = 1.2 + r() * 2.2;
    const x = ((x0 - t * sp) % w + w) % w, y = y0 + Math.sin(t * 0.5 + ph) * 14;
    const a = 0.3 + 0.3 * Math.sin(t * 1.1 + ph);
    const g = ctx.createRadialGradient(x, y, 0, x, y, sz * 3); g.addColorStop(0, `rgba(${rgb},${a})`); g.addColorStop(1, `rgba(${rgb},0)`);
    ctx.fillStyle = g; ctx.fillRect(x - sz * 3, y - sz * 3, sz * 6, sz * 6);
  }
  ctx.restore();
}
