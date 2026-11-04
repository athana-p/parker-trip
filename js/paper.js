// ================= CUT-PAPER CORE (ported from One More Walk / paper.js) =================
// Browser/real-time version. Changes vs. the film engine:
//  - no fixed W/H/FPS; everything is drawn in "user units" under whatever transform the caller set
//    (the game sets scale(devicePixelRatio) so shapes stay crisp)
//  - soft shadows use the shadowBlur trick (castShadow) instead of ctx.filter (Safari support)
//  - patterns cached per context (WeakMap); sticker() can take a hi-res source (o.res)
const TAU = Math.PI * 2;
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const lerp = (a, b, u) => a + (b - a) * u;
const inv = (a, b, x) => clamp((x - a) / (b - a));
const smooth = u => u * u * (3 - 2 * u);
const ease = (a, b, x) => smooth(inv(a, b, x));
function rng(seed) { let s = (seed * 2654435761) >>> 0 || 1; return () => { s ^= s << 13; s >>>= 0; s ^= s >> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; }; }
function hash1(i, s = 0) { let h = (i * 374761393 + s * 668265263) | 0; h = (h ^ (h >>> 13)) * 1274126177 | 0; return ((h ^ (h >>> 16)) >>> 0) / 4294967296; }
function noise1(x, s = 0) { const i = Math.floor(x), f = x - i, u = f * f * (3 - 2 * f); return lerp(hash1(i, s), hash1(i + 1, s), u) * 2 - 1; }
function fbm1(x, s = 0) { return noise1(x, s) * 0.6 + noise1(x * 2.3, s + 7) * 0.28 + noise1(x * 5.1, s + 13) * 0.12; }
function mk(w, h) { const c = document.createElement('canvas'); c.width = Math.max(1, Math.ceil(w)); c.height = Math.max(1, Math.ceil(h)); return c; }
function shade(hex, k) { const n = parseInt(hex.slice(1), 16); let r = n >> 16, g = (n >> 8) & 255, b = n & 255; if (k < 1) { r *= k; g *= k; b *= k; } else { const t = k - 1; r += (255 - r) * t; g += (255 - g) * t; b += (255 - b) * t; } return `rgb(${r | 0},${g | 0},${b | 0})`; }

// ---------- paper textures (tileable) ----------
function periodicNoise(size, cells, seed) {
  const out = new Float32Array(size * size), r = rng(seed), L = new Float32Array(cells * cells);
  for (let i = 0; i < L.length; i++) L[i] = r();
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    const fx = x / size * cells, fy = y / size * cells, ix = Math.floor(fx), iy = Math.floor(fy);
    let ux = fx - ix, uy = fy - iy; ux = ux * ux * (3 - 2 * ux); uy = uy * uy * (3 - 2 * uy);
    const a = L[(iy % cells) * cells + ix % cells], b = L[(iy % cells) * cells + (ix + 1) % cells];
    const c = L[((iy + 1) % cells) * cells + ix % cells], d = L[((iy + 1) % cells) * cells + (ix + 1) % cells];
    out[y * size + x] = lerp(lerp(a, b, ux), lerp(c, d, ux), uy);
  }
  return out;
}
const TEX = {};
function buildTextures(S = 1024) {
  // multiply plate: soft mottling + fine tooth + dark fibres
  const m = mk(S, S), mc = m.getContext('2d'), img = mc.createImageData(S, S);
  const n1 = periodicNoise(S, 6, 11), n2 = periodicNoise(S, 24, 12), n3 = periodicNoise(S, 128, 13), r = rng(5);
  for (let i = 0; i < S * S; i++) {
    const v = 255 - (n1[i] * 14 + n2[i] * 10 + n3[i] * 12 + r() * 9);
    img.data[i * 4] = v; img.data[i * 4 + 1] = v - 2; img.data[i * 4 + 2] = v - 5; img.data[i * 4 + 3] = 255;
  }
  mc.putImageData(img, 0, 0);
  const fib = (ctx, n, col, a0, a1, len, seed) => {
    const rr = rng(seed);
    for (let k = 0; k < n; k++) {
      const x = rr() * S, y = rr() * S, L = len * (0.4 + rr()), ang = rr() * TAU, bend = (rr() - 0.5) * 0.8;
      ctx.strokeStyle = col; ctx.globalAlpha = lerp(a0, a1, rr()); ctx.lineWidth = 0.6 + rr() * 0.9;
      for (const ox of [-S, 0, S]) for (const oy of [-S, 0, S]) {
        if (x + ox < -L || x + ox > S + L || y + oy < -L || y + oy > S + L) continue;
        ctx.beginPath(); ctx.moveTo(x + ox, y + oy);
        ctx.quadraticCurveTo(x + ox + Math.cos(ang + bend) * L * 0.5, y + oy + Math.sin(ang + bend) * L * 0.5, x + ox + Math.cos(ang) * L, y + oy + Math.sin(ang) * L);
        ctx.stroke();
      }
    }
    ctx.globalAlpha = 1;
  };
  const k = (S / 1024) ** 2;
  fib(mc, 900 * k | 0, '#6a5a48', 0.05, 0.14, 16, 21);
  TEX.mul = m;
  // screen plate: pale fibres and flecks (the white bits in torn paper)
  const s = mk(S, S), sc = s.getContext('2d'); sc.fillStyle = '#000'; sc.fillRect(0, 0, S, S);
  fib(sc, 700 * k | 0, '#fff6e8', 0.18, 0.5, 12, 31);
  fib(sc, 260 * k | 0, '#ffffff', 0.35, 0.7, 7, 32);
  TEX.scr = s;
}
const _PAT = new WeakMap();
function patterns(ctx) { let p = _PAT.get(ctx); if (!p) { p = { mul: ctx.createPattern(TEX.mul, 'repeat'), scr: ctx.createPattern(TEX.scr, 'repeat') }; _PAT.set(ctx, p); } return p; }

// fill a path as a piece of coloured paper: colour, then the paper's own texture (moves with the piece)
function piece(ctx, path, color, o = {}) {
  const { mul = 1, scr = 0.35 } = o, rule = o.rule || 'nonzero';
  ctx.fillStyle = color; ctx.fill(path, rule);
  const P = patterns(ctx);
  ctx.save();
  ctx.globalCompositeOperation = 'multiply'; ctx.globalAlpha *= mul; ctx.fillStyle = P.mul; ctx.fill(path, rule);
  ctx.restore();
  if (scr > 0) { ctx.save(); ctx.globalCompositeOperation = 'screen'; ctx.globalAlpha *= scr; ctx.fillStyle = P.scr; ctx.fill(path, rule); ctx.restore(); }
}

// ---------- soft shadow without ctx.filter ----------
// draws `what` (Path2D or fn(ctx)) only as a blurred shadow, offset by (dx,dy) in screen-aligned user units.
// blur ≈ CSS blur(px) radius.
function castShadow(ctx, what, blur, dx, dy, a, rgb = '42,24,48') {
  if (a <= 0) return;
  const m = ctx.getTransform(), s = Math.hypot(m.a, m.b) || 1, K = 30000 / s;
  ctx.save();
  ctx.shadowColor = `rgba(${rgb},${clamp(a)})`; ctx.shadowBlur = blur * 2 * s;
  ctx.shadowOffsetX = -m.a * K + dx * s; ctx.shadowOffsetY = -m.b * K + dy * s;
  ctx.translate(K, 0); ctx.fillStyle = '#000';
  if (what instanceof Path2D) ctx.fill(what); else what(ctx);
  ctx.restore();
}

// ---------- torn / cut outlines ----------
// polygon -> Path2D with edge displacement along the normal (fixed per seed: no boil)
function tornPath(pts, amp, seed, step = 5, closed = true) {
  const out = []; let s = 0;
  const n = pts.length, segs = closed ? n : n - 1;
  for (let i = 0; i < segs; i++) {
    const a = pts[i], b = pts[(i + 1) % n], dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy) || 1;
    const nx = -dy / L, ny = dx / L, k = Math.max(1, Math.round(L / step));
    for (let j = 0; j < k; j++) {
      const u = j / k, ss = s + L * u;
      const d = amp * (fbm1(ss / 22, seed) + 0.35 * noise1(ss / 3.2, seed + 3));
      out.push([a[0] + dx * u + nx * d, a[1] + dy * u + ny * d]);
    }
    s += L;
  }
  if (!closed) out.push(pts[n - 1]);
  const p = new Path2D(); p.moveTo(out[0][0], out[0][1]); for (let i = 1; i < out.length; i++) p.lineTo(out[i][0], out[i][1]); if (closed) p.closePath();
  return p;
}
// a horizontal strip whose top edge follows f(x), torn; bottom straight (hidden below other strips)
function stripPts(x0, x1, f, yBottom, step = 10) {
  const pts = []; for (let x = x0; x <= x1; x += step) pts.push([x, f(x)]); pts.push([x1, f(x1)]); pts.push([x1, yBottom], [x0, yBottom]); return pts;
}
function ellipsePts(cx, cy, rx, ry, n = 48, rot = 0) { const p = []; for (let i = 0; i < n; i++) { const a = i / n * TAU; const x = Math.cos(a) * rx, y = Math.sin(a) * ry; p.push([cx + x * Math.cos(rot) - y * Math.sin(rot), cy + x * Math.sin(rot) + y * Math.cos(rot)]); } return p; }

// torn paper with the pale fibrous core showing along the tear (~2px above the edge)
function tornPiece(ctx, pts, color, o = {}) {
  const { amp = 5, seed = 1, rim = 1, rimA = 0.85, shadow = 0.2, mul = 1, scr = 0.4 } = o;
  const rimCol = o.rimCol || shade(color, 1.4);
  const main = tornPath(pts, amp, seed);
  if (shadow > 0) castShadow(ctx, main, 5, 2, 5, shadow);
  if (rim > 0) {
    const rp = tornPath(pts.map(p => [p[0], p[1] - 2.2 * rim]), amp * 1.25, seed + 50, 3);
    ctx.save(); ctx.globalAlpha *= rimA; ctx.fillStyle = rimCol; ctx.fill(rp); ctx.restore();
  }
  piece(ctx, main, color, { mul, scr });
  return main;
}

// ---------- characters: die-cut sticker border + drop shadow ----------
// src may be hi-res: o.res = source pixels per user unit. x,y = top-left in user units.
function sticker(dst, src, x, y, o = {}) {
  const { border = 6, col = '#fffdf7', shadowA = 0.3, shadowOff = [4, 7], shadowBlur = 6, lift = 0.2, glow = null, alpha = 1, res = 1 } = o;
  const w = src.width, h = src.height, dw = w / res, dh = h / res;
  const sil = scratch('sil', w, h), sc = sil.getContext('2d');
  sc.clearRect(0, 0, w, h); sc.globalCompositeOperation = 'source-over'; sc.drawImage(src, 0, 0);
  sc.globalCompositeOperation = 'source-in'; sc.fillStyle = col; sc.fillRect(0, 0, w, h); sc.globalCompositeOperation = 'source-over';
  const dil = scratch('dil', w, h), dc = dil.getContext('2d'); dc.clearRect(0, 0, w, h);
  const b = border * res, N = 24;
  for (let k = 0; k < N; k++) { const a = k / N * TAU; dc.drawImage(sil, Math.cos(a) * b, Math.sin(a) * b); }
  dc.drawImage(sil, 0, 0);
  // the cut puppet sits on its sticker backing: a tiny contact shadow so white-on-white still reads
  if (lift > 0) castShadow(dc, c => c.drawImage(src, 0, 0), 1.6 * res, 0.8 * res, 1.6 * res, lift);
  dc.drawImage(src, 0, 0);
  dst.save(); dst.globalAlpha *= alpha;
  if (glow) { dst.save(); dst.globalCompositeOperation = 'screen'; castShadow(dst, c => c.drawImage(dil, x, y, dw, dh), glow.blur, 0, 0, glow.a, '255,240,200'); dst.restore(); }
  if (shadowA > 0) castShadow(dst, c => c.drawImage(dil, x, y, dw, dh), shadowBlur, shadowOff[0], shadowOff[1], shadowA);
  dst.drawImage(dil, x, y, dw, dh);
  dst.restore();
}
const _scr = {};
function scratch(name, w, h) { let c = _scr[name]; if (!c || c.width !== w || c.height !== h) { c = _scr[name] = mk(w, h); } return c; }

// path helpers for authored shapes
function P2(d) { return new Path2D(d); }
// circles/ellipses wind the same way as limb(), so union() of overlapping shapes fills solid (nonzero)
function circ(x, y, r) { const p = new Path2D(); p.moveTo(x + r, y); p.arc(x, y, r, TAU, 0, true); return p; }
function ell(x, y, rx, ry, rot = 0) { const p = new Path2D(); p.moveTo(x + rx * Math.cos(rot), y + rx * Math.sin(rot)); p.ellipse(x, y, rx, ry, rot, TAU, 0, true); return p; }
function poly(pts) { const p = new Path2D(); p.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) p.lineTo(pts[i][0], pts[i][1]); p.closePath(); return p; }
function union(...ps) { const p = new Path2D(); for (const q of ps) p.addPath(q); return p; }
// a tapered limb between two joints (rounded ends), as one paper piece
function limb(a, b, wa, wb) {
  const dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy) || 1, nx = -dy / L, ny = dx / L;
  const p = new Path2D();
  p.moveTo(a[0] + nx * wa / 2, a[1] + ny * wa / 2); p.lineTo(b[0] + nx * wb / 2, b[1] + ny * wb / 2);
  p.arc(b[0], b[1], wb / 2, Math.atan2(ny, nx), Math.atan2(ny, nx) - Math.PI, true);
  p.lineTo(a[0] - nx * wa / 2, a[1] - ny * wa / 2);
  p.arc(a[0], a[1], wa / 2, Math.atan2(-ny, -nx), Math.atan2(-ny, -nx) - Math.PI, true);
  p.closePath(); return p;
}
// exposure: hold drawings on twos (12 drawings per second)
const ON2 = t => Math.floor(t * 12 + 1e-6) / 12;
