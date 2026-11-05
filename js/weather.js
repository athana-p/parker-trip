// ================= WEATHER & SEASONS in the yard (stage 3) =================
// Seasons follow the real calendar (northern hemisphere). Weather is simulated: no network, no location.
// It is rolled once per half day from the date, so it never jumps around while playing, and the same
// rule can be asked about any past moment (offline catch-up uses weatherAt(t)).
const SEASON_OF_MONTH = ['winter', 'winter', 'spring', 'spring', 'spring', 'summer', 'summer', 'summer', 'autumn', 'autumn', 'autumn', 'winter'];
const SEASONS = ['spring', 'summer', 'autumn', 'winter'];
const WEATHER_KINDS = ['sunny', 'cloudy', 'rain', 'wind', 'fog', 'snow'];
// odds per half day (fog only shows in the early morning; otherwise that half day is just cloudy)
const WEATHER_ODDS = {
  spring: { sunny: 0.40, cloudy: 0.25, rain: 0.20, wind: 0.10, fog: 0.05 },
  summer: { sunny: 0.50, cloudy: 0.15, rain: 0.20, wind: 0.10, fog: 0.05 },
  autumn: { sunny: 0.35, cloudy: 0.25, rain: 0.15, wind: 0.20, fog: 0.05 },
  winter: { sunny: 0.25, cloudy: 0.25, rain: 0.05, wind: 0.10, fog: 0.10, snow: 0.25 },
};
const HEAVY_RAIN = 1 / 3;              // share of rainy half days that pour (no visitors then — stage 4)
const FOG_HOURS = [0, 10];             // fog lifts at 10:00
const HOT_HOURS = [13, 17];            // a sunny summer afternoon is a hot one

// debug: force a season and/or weather (kept on this device only, only read in debug mode)
const WX_KEY = 'parker-trip-wx';
let WX_FORCE = { season: '', kind: '' };
function loadWxForce() { try { WX_FORCE = { season: '', kind: '', ...JSON.parse(localStorage.getItem(WX_KEY) || '{}') }; } catch (e) { } }
function saveWxForce() { try { localStorage.setItem(WX_KEY, JSON.stringify(WX_FORCE)); } catch (e) { } }

function weatherAt(t, useForce = true) {
  const d = new Date(t), h = d.getHours(), half = h < 12 ? 0 : 1;
  const day = Math.round(new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime() / 864e5), idx = day * 2 + half;
  const fs = useForce && WX_FORCE.season, fk = useForce && WX_FORCE.kind;
  const season = fs || SEASON_OF_MONTH[d.getMonth()];
  let kind = 'sunny', u = hash1(idx, 31);
  const odds = WEATHER_ODDS[season];
  for (const k in odds) { u -= odds[k]; if (u <= 0) { kind = k; break; } }
  let heavy = kind === 'rain' && hash1(idx, 37) < HEAVY_RAIN;
  if (kind === 'fog' && !(h >= FOG_HOURS[0] && h < FOG_HOURS[1])) kind = 'cloudy';
  if (fk) { kind = fk === 'heavy' ? 'rain' : fk; heavy = fk === 'heavy'; }
  const hot = season === 'summer' && kind === 'sunny' && h >= HOT_HOURS[0] && h < HOT_HOURS[1];
  const look = kind === 'snow' ? 'snow' : season;       // snow covers the ground while it snows
  return { season, kind, heavy, hot, look, key: `${season}|${kind}|${heavy ? 1 : 0}|${hot ? 1 : 0}` };
}

// ---------- colours ----------
function hexRGB(h) { const n = parseInt(h.slice(1), 16); return [n >> 16, (n >> 8) & 255, n & 255]; }
function rgbHex(a) { return '#' + a.map(v => clamp(Math.round(v), 0, 255).toString(16).padStart(2, '0')).join(''); }
function mixHex(a, b, u) { const A = hexRGB(a), B = hexRGB(b); return rgbHex(A.map((v, i) => lerp(v, B[i], u))); }
function greyOf(h, k = 1) { const [r, g, b] = hexRGB(h), y = (r * 0.3 + g * 0.59 + b * 0.11) * k; return rgbHex([y * 0.97, y * 0.99, y * 1.04]); }
// recolour something the way the time of day already tinted it: col was drawn for `ref` (daytime), now show `target`
function retint(col, ref, target) { const C = hexRGB(col), R = hexRGB(ref), T = hexRGB(target); return rgbHex(C.map((v, i) => v * T[i] / Math.max(1, R[i]))); }

// the hills and trees behind the fence, per season (daytime colours; the time of day tints them)
const SEASON_SKY = {
  spring: { hill1: '#acd88f', hill2: '#90ca76', trees: ['#62a866', '#f0b3c6', '#5fa463', '#f4c4d2', '#68ac68'], blossom: true },
  summer: { hill1: '#96c977', hill2: '#78b75e', trees: ['#3f8d4d', '#478f50', '#3a8549', '#4a9554', '#3f8a4c'] },
  autumn: { hill1: '#c3cd85', hill2: '#b0bd6c', trees: ['#df8a3a', '#cf5e3d', '#e6b443', '#d8763a', '#c9583c'] },
  winter: { hill1: '#b5c0a2', hill2: '#a3b192', bare: '#7b6658' },
  snow: { hill1: '#f4f6fa', hill2: '#e6ebf3', bare: '#6f5d52', caps: true },
};
// the yard itself, per season
const YARD_LOOK = {
  spring: { lawn: ['#a6d878', '#9bd16f', '#93cb68', '#7fbb58'], rims: ['#e1f3c8', '#d8efbb', '#cfe9b1', '#c3e3a3'], tuft: ['#78b553', '#86c15e'], ftuft: ['#68a84a', '#72b252'], nTuft: 34,
    bush: '#5fae62', bushRim: '#a6d8a0', bushFl: ['#f58cbf', '#fff7ee', '#f8d36a'], nBushFl: 6, fl: ['#fff7ee', '#c8a6df', '#f8d36a', '#f58cbf'], nFl: 12, nForeFl: 5, petals: 10 },
  summer: { lawn: ['#93c965', '#87c05b', '#7eb853', '#6aa846'], rims: ['#cfe8b0', '#c5e2a5', '#bcdc9b', '#b0d48f'], tuft: ['#5e9e44', '#6aa94c'], ftuft: ['#548f3c', '#5d9a42'], nTuft: 42,
    bush: '#4a9852', bushRim: '#8cc888', bushFl: ['#fff7ee'], nBushFl: 2, fl: ['#fff7ee', '#f8d36a', '#f58cbf'], nFl: 7, nForeFl: 4 },
  autumn: { lawn: ['#c4cf80', '#b8c874', '#adc06a', '#9db35c'], rims: ['#eef0c8', '#e6eabb', '#dfe5b1', '#d5dea3'], tuft: ['#9eaa55', '#acb55e'], ftuft: ['#8f9d4d', '#9aa655'], nTuft: 30,
    bush: '#cf8c40', bushRim: '#f0c584', bushFl: [], nBushFl: 0, fl: ['#f8d36a'], nFl: 3, nForeFl: 0, fallen: 26, leafCols: ['#e0893a', '#d2603e', '#e8b444', '#c47a3a'] },
  winter: { lawn: ['#b9c5a2', '#aebc97', '#a5b48e', '#95a880'], rims: ['#e6ecdc', '#dfe6d3', '#d9e1cc', '#cfd9c1'], tuft: ['#93a37b', '#9dad85'], ftuft: ['#879a70', '#8fa278'], nTuft: 24,
    bush: '#7d9672', bushRim: '#b5c6aa', bushFl: [], nBushFl: 0, fl: [], nFl: 0, nForeFl: 0, fallen: 6, leafCols: ['#a9845f', '#97754f'] },
  snow: { lawn: ['#f4f7fb', '#eef2f8', '#e8eef6', '#e1e8f2'], rims: ['#ffffff', '#ffffff', '#ffffff', '#ffffff'], tuft: ['#d6dfe9', '#dde5ee'], ftuft: ['#d3dce7', '#dae2ec'], nTuft: 10,
    bush: '#7d9672', bushRim: '#b5c6aa', bushFl: [], nBushFl: 0, fl: [], nFl: 0, nForeFl: 0, caps: true },
};
const OVERCAST = { cloudy: 0.42, rain: 0.6, snow: 0.5, fog: 0.55 };
// the time-of-day palette, adjusted for the season and the weather
function wxPalette(p0, wx) {
  const p = { ...p0 }, day = PALETTES.day, S = SEASON_SKY[wx.look];
  p.hill1 = retint(p0.hill1, day.hill1, S.hill1); p.hill2 = retint(p0.hill2, day.hill2, S.hill2);
  p.trees = S.trees ? S.trees.map(c => retint(p0.tree, day.tree, c)) : null;
  p.bare = S.bare ? retint(p0.tree, day.tree, S.bare) : null; p.blossom = !!S.blossom; p.caps = !!S.caps;
  let oc = OVERCAST[wx.kind] || 0; if (wx.kind === 'rain' && wx.heavy) oc = 0.72;
  p.overcast = oc; p.lightA = 1;
  if (oc) {
    const k = wx.kind === 'rain' ? 0.9 : wx.kind === 'cloudy' ? 1 : 1.06;
    p.sky = p0.sky.map(c => mixHex(c, greyOf(c, k), oc));
    p.cloud = mixHex(p0.cloud, greyOf(p0.cloud, wx.kind === 'rain' ? 0.84 : 0.94), 0.65);
    const t = p0.tint, y = (t[0] + t[1] + t[2]) / 3 * (wx.kind === 'rain' ? 0.9 : 0.97);
    p.tint = [lerp(t[0], y * 0.95, oc * 0.6), lerp(t[1], y * 0.97, oc * 0.6), lerp(t[2], y * 1.03, oc * 0.6)];
    p.lightA = 1 - oc * 0.85; p.noStars = oc > 0.4;
    if (wx.kind === 'rain' || wx.kind === 'snow') { p.motes = null; p.fireflies = false; }
  }
  if (wx.kind === 'fog') {
    const f = p.sky[3]; p.hill1 = mixHex(p.hill1, f, 0.6); p.hill2 = mixHex(p.hill2, f, 0.45);
    if (p.trees) p.trees = p.trees.map(c => mixHex(c, f, 0.4)); if (p.bare) p.bare = mixHex(p.bare, f, 0.4);
    p.mist = Math.max(p0.mist || 0, 0.75);
  }
  return p;
}

// ---------- the trees behind the fence ----------
function seasonTrees(c, p, hz) {
  const rt = rng(9), rb = rng(19);
  [[262, 30], [300, 38], [346, 28], [380, 34], [-6, 26]].forEach(([x, r], i) => {
    if (p.bare) return bareTree(c, x, hz, r, p.bare, p.caps, 60 + x | 0);
    const col = p.trees ? p.trees[i] : p.tree;
    tornPiece(c, ellipsePts(x, hz + 2 - r * 0.5, r, r * 0.92, 36), col, { amp: 2.2, seed: 60 + x | 0, rimCol: shade(col, 1.3), rimA: 0.6, shadow: 0.16 });
    if (rt() < 0.7) tornPiece(c, ellipsePts(x - r * 0.3, hz - r * 0.9, r * 0.6, r * 0.55, 30), shade(col, 1.12), { amp: 2, seed: 70 + x | 0, rim: 0, shadow: 0.1 });
    if (p.blossom) {             // spring: blossom dots on every tree (white on the cherries, pink on the green ones)
      const pink = i === 1 || i === 3, n = pink ? 14 : 6;
      for (let k = 0; k < n; k++) {
        const a = rb() * TAU, rr = Math.sqrt(rb()) * r * 0.8, bx = x + Math.cos(a) * rr, by = hz + 2 - r * 0.5 + Math.sin(a) * rr * 0.9;
        piece(c, circ(bx, by, 1.6 + rb() * 1.6), pink ? shade(col, 1.55) : retint(col, PALETTES.day.tree, '#f6b9cc'), { mul: 0.3, scr: 0.2 });
      }
    }
  });
}
function bareTree(c, x, hz, r, col, snow, seed) {
  const rr = rng(seed), base = [x, hz + 16], top = [x + (rr() - 0.5) * 6, hz - r * 0.55];
  const segs = [[base, top, 6, 4.2]];
  const grow = (from, ang, len, w, depth) => {
    const to = [from[0] + Math.sin(ang) * len, from[1] - Math.cos(ang) * len]; segs.push([from, to, w, w * 0.6]);
    if (depth > 0) for (const da of [-0.5, 0.45]) grow(to, ang + da + (rr() - 0.5) * 0.3, len * 0.66, w * 0.62, depth - 1);
  };
  for (const a of [-0.75, -0.2, 0.35, 0.85]) grow(top, a + (rr() - 0.5) * 0.25, r * (0.5 + rr() * 0.25), 3.2, 2);
  const p = union(...segs.map(([a, b, wa, wb]) => limb(a, b, wa, wb)));
  pp(c, p, col, 0.16, { mul: 0.5 });
  if (snow) for (const [a, b, w] of segs) if (w > 1.6 && Math.abs(b[0] - a[0]) > 2) piece(c, limb([a[0], a[1] - w * 0.5], [b[0], b[1] - w * 0.4], w * 0.55, w * 0.4), '#ffffff', { mul: 0.2, scr: 0.1 });
}
// overcast: a layer of big flat paper clouds across the sky
function overcastClouds(c, p, hz) {
  const rr = rng(23), col = p.cloud, n = 7;
  for (let i = 0; i < n; i++) {
    const x = -30 + i * (SCENE_W + 60) / (n - 1) + (rr() - 0.5) * 30, y = hz * (0.08 + rr() * 0.32), rx = 60 + rr() * 40, ry = 18 + rr() * 12;
    tornPiece(c, ellipsePts(x, y, rx, ry, 36), i % 2 ? col : shade(col, 1.06), { amp: 2.6, seed: 400 + i, rimCol: shade(col, 1.18), shadow: 0.12, mul: 0.6 });
  }
}

// ---------- the yard: snow caps, fallen leaves, petals ----------
const snowCap = (c, pts, seed) => tornPiece(c, pts, '#ffffff', { amp: 1.2, seed, rimCol: '#ffffff', shadow: 0.12, mul: 0.25 });
function fenceSnow(c, Y) {            // drawn right after the fence, so the bushes and mailbox stay in front
  const fy = Y(296);
  for (const yy of [fy - 34, fy - 14]) snowCap(c, [[-10, yy - 3], [SCENE_W + 10, yy - 3], [SCENE_W + 10, yy + 1], [-10, yy + 1]], 820 + yy | 0);
  for (let x = -4; x < SCENE_W + 10; x += 19) piece(c, ell(x + 6, fy - 50, 5.5, 3), '#ffffff', { mul: 0.2 });
}
function bushSnow(c, Y, x, w) { snowCap(c, ellipsePts(x, Y(300) - w * 0.42, w * 0.82, w * 0.24, 26), 810 + x); }
function yardSnowCaps(c, Y) {         // doghouse roof, mailbox, lamp
  const x0 = HOUSE.x, by = Y(HOUSE.d), mx = x0 + 60, top = by - 70, peak = by - 132, dx = 40, dy = -18, fx1 = x0 + 120;
  snowCap(c, [[mx, peak - 16], [mx + dx, peak - 16 + dy], [fx1 + dx + 16, top + dy + 4], [fx1 + 16, top + 4], [fx1 + 6, top + 12]], 801);
  snowCap(c, [[mx, peak - 16], [x0 - 16, top + 4], [x0 - 12, top + 12], [mx, peak - 6]], 802);
  snowCap(c, ellipsePts(MAILBOX.x - 2, Y(MAILBOX.d) - 128, 38, 7, 24), 803);
  snowCap(c, ellipsePts(LAMP.x + 14, Y(LAMP.d) - 74, 10, 3.5, 16), 804);
}
function yardFallen(c, Y, look, rb, dRange = [96, 290], n = look.fallen || 0) {
  for (let k = 0; k < n; k++) {
    const x = 10 + rb() * (SCENE_W - 20), y = Y(dRange[0] + rb() * (dRange[1] - dRange[0]));
    leaf(c, x, y, 7 + rb() * 4, 2.6 + rb(), rb() * TAU, look.leafCols[k % look.leafCols.length]);
  }
}
function yardPetals(c, Y, rb, n) {
  for (let k = 0; k < n; k++) piece(c, ell(20 + rb() * (SCENE_W - 40), Y(100 + rb() * 180), 2.4, 1.4, rb() * TAU), k % 2 ? '#f6c3d2' : '#fbe1e8', { mul: 0.4 });
}

// ---------- moving weather: rain strips, paper snowflakes, blown leaves & petals, fog banks ----------
// Everything here moves smoothly every frame (Parker is the one held on twos). Counts are kept low for phones.
const WXP = { kind: null, drops: [], splashes: [], flakes: [], bits: [], fog: null, img: {}, res: 0 };
const BIT_COLS = { spring: ['#f6bfd0', '#fbe0e7', '#f4a9c0'], summer: ['#5fa055', '#6fb062'], autumn: ['#e0893a', '#d2603e', '#e8b444'], winter: ['#a9845f', '#97754f'] };
function wxSprites(res) {
  if (WXP.res === res) return WXP.img;
  WXP.res = res; const img = {};
  const make = (w, h, fn) => { const cv = mk(w * res, h * res), c = cv.getContext('2d'); c.scale(res, res); c.translate(w / 2, h / 2); fn(c); return cv; };
  // snowflakes: little torn paper discs and a six-armed cut-out
  img.flake = [0, 1, 2].map(i => make(14, 14, c => {
    const p = i === 2 ? union(...[0, 1, 2].map(k => limb([Math.cos(k * TAU / 6) * -4.5, Math.sin(k * TAU / 6) * -4.5], [Math.cos(k * TAU / 6) * 4.5, Math.sin(k * TAU / 6) * 4.5], 1.8, 1.8))) : null;
    if (p) { castShadow(c, p, 1.2, 0.4, 1, 0.25); piece(c, p, '#ffffff', { mul: 0.2 }); }
    else tornPiece(c, ellipsePts(0, 0, 2.6 + i, 2.4 + i * 0.8, 14), '#ffffff', { amp: 0.5, seed: 900 + i, rimCol: '#ffffff', shadow: 0.25, mul: 0.2 });
  }));
  // blown bits: petals (spring), leaves (other seasons)
  img.bit = {};
  for (const s of SEASONS) img.bit[s] = BIT_COLS[s].map((col, i) => make(20, 14, c => {
    if (s === 'spring') { const p = ell(0, 0, 4.6, 2.8, 0.2); castShadow(c, p, 1.4, 0.5, 1.4, 0.25); piece(c, p, col, { mul: 0.4, scr: 0.15 }); }
    else leaf(c, -7, 0, 14, 4 + i * 0.4, 0, col);
  }));
  img.drop = make(8, 10, c => { const p = new Path2D(); p.moveTo(0, -4); p.quadraticCurveTo(3, 1, 0, 3.6); p.quadraticCurveTo(-3, 1, 0, -4); castShadow(c, p, 1, 0.3, 1, 0.2); piece(c, p, '#8fcdef', { mul: 0.35 }); });
  WXP.img = img; return img;
}
function buildFog(res) {
  return [0, 1, 2].map(i => {
    const w = 640, L = makeLayer(0, -40, w, 40, Math.min(res, 1.5)), c = L.ctx;
    for (let k = 0; k < 4; k++) tornPiece(c, ellipsePts(80 + k * 160 + (i * 37) % 60, 0, 120 + (k % 2) * 30, 15 + ((k + i) % 3) * 4, 40), '#f6f7fa', { amp: 3, seed: 950 + i * 10 + k, rim: 0, shadow: 0, mul: 0.15 });
    return L;
  });
}
// the doghouse roof line, where far rain lands instead of the ground
function roofY(x, H) {
  const by = H - HOUSE.d, x0 = HOUSE.x, mx = x0 + 60;
  if (x < x0 - 12 || x > x0 + 176) return null;
  if (x < mx) return lerp(by - 60, by - 140, (x - (x0 - 12)) / (mx - x0 + 12));
  if (x < x0 + 134) return lerp(by - 140, by - 60, (x - mx) / 74);
  return by - 74;
}
function newDrop(H, top) {
  const d = 60 + Math.random() * 250, x = -20 + Math.random() * (SCENE_W + 60);
  let gy = H - d; const r = d > 190 ? roofY(x, H) : null; if (r != null) gy = r;
  return { x, y: top ? -Math.random() * H : -10 - Math.random() * 60, gy, len: 12 + Math.random() * 8, v: 520 + Math.random() * 140, c: Math.random() < 0.5 ? 0 : 1 };
}
function newFlake(H, top) {
  const d = 70 + Math.random() * 240;
  return { x: Math.random() * SCENE_W, y: top ? Math.random() * (H - d) : -10 - Math.random() * 40, gy: H - d, v: 18 + Math.random() * 22, ph: Math.random() * TAU, s: 0.6 + Math.random() * 0.6, i: Math.floor(Math.random() * 3), land: 0 };
}
function newBit(H, wind, top) {
  const dir = 1;
  return { x: wind ? (top ? Math.random() * SCENE_W : -20 - Math.random() * 80) : Math.random() * SCENE_W, y: wind ? H * (0.25 + Math.random() * 0.6) : (top ? Math.random() * H * 0.7 : -10),
    vx: wind ? (90 + Math.random() * 70) * dir : 6 + Math.random() * 10, vy: wind ? -6 + Math.random() * 16 : 16 + Math.random() * 12,
    rot: Math.random() * TAU, vr: (Math.random() - 0.5) * (wind ? 8 : 3), ph: Math.random() * TAU, i: Math.floor(Math.random() * 3), s: wind ? 1.1 + Math.random() * 0.4 : 0.9 + Math.random() * 0.3 };
}
function wxCounts(wx) {
  const k = wx.kind, calmBits = wx.season === 'autumn' ? 5 : wx.season === 'spring' ? 4 : 0;
  return { drops: k === 'rain' ? (wx.heavy ? 62 : 36) : 0, flakes: k === 'snow' ? 34 : 0, bits: k === 'wind' ? (wx.season === 'winter' ? 4 : 8) : (k === 'rain' || k === 'snow' ? 0 : calmBits) };
}
function updateWeather(dt, wx, H, t) {
  const n = wxCounts(wx), wind = wx.kind === 'wind', fresh = WXP.kind !== wx.key;
  if (fresh) { WXP.kind = wx.key; WXP.season = wx.season; WXP.wind = wind; }
  const fill = (arr, want, make) => { while (arr.length < want) arr.push(make(fresh)); if (arr.length > want) arr.length = want; };
  fill(WXP.drops, n.drops, top => newDrop(H, top));
  fill(WXP.flakes, n.flakes, top => newFlake(H, top));
  if (fresh) WXP.bits.length = 0;
  fill(WXP.bits, n.bits, top => newBit(H, wind, top));
  for (const d of WXP.drops) {
    d.y += d.v * dt; d.x -= d.v * 0.08 * dt;
    if (d.y >= d.gy) { if (WXP.splashes.length < 24) WXP.splashes.push({ x: d.x, y: d.gy, age: 0 }); Object.assign(d, newDrop(H, false)); }
  }
  for (const s of WXP.splashes) s.age += dt;
  WXP.splashes = WXP.splashes.filter(s => s.age < 0.28);
  for (const f of WXP.flakes) {
    if (f.land) { f.land += dt; if (f.land > 1.2) Object.assign(f, newFlake(H, false)); continue; }
    f.y += f.v * dt; f.x += Math.sin(t * 1.3 + f.ph) * 12 * dt;
    if (f.y >= f.gy) { f.y = f.gy; f.land = 0.001; }
  }
  for (const b of WXP.bits) {
    b.x += (b.vx + (wind ? Math.sin(t * 2 + b.ph) * 20 : Math.sin(t * 1.4 + b.ph) * 18)) * dt;
    b.y += (b.vy + (wind ? Math.sin(t * 3 + b.ph) * 30 : 0)) * dt; b.rot += b.vr * dt;
    if (b.x > SCENE_W + 30 || b.y > H + 20 || b.y < -40) Object.assign(b, newBit(H, wind, false));
  }
}
// drawn over the yard, before the time-of-day light, so night tints it too
function drawWeather(ctx, wx, H, t, res) {
  const img = wxSprites(res);
  if (WXP.drops.length) {
    const cols = ['rgba(236,244,253,0.85)', 'rgba(206,226,244,0.8)'];
    for (const ci of [0, 1]) {
      ctx.fillStyle = cols[ci]; ctx.beginPath();
      for (const d of WXP.drops) if (d.c === ci) { const x = d.x, y = d.y, l = d.len, sx = l * 0.08; ctx.moveTo(x, y); ctx.lineTo(x + 1.9, y); ctx.lineTo(x + 1.9 + sx, y - l); ctx.lineTo(x + sx, y - l); ctx.closePath(); }
      ctx.fill();
    }
    ctx.strokeStyle = 'rgba(232,242,252,0.7)'; ctx.lineWidth = 0.9;
    for (const s of WXP.splashes) { const u = s.age / 0.28; ctx.globalAlpha = 1 - u; ctx.beginPath(); ctx.ellipse(s.x, s.y, 2 + u * 6, 0.8 + u * 1.6, 0, Math.PI, TAU); ctx.stroke(); }
    ctx.globalAlpha = 1;
  }
  for (const f of WXP.flakes) {
    const s = 14 * f.s; ctx.globalAlpha = f.land ? clamp(1 - f.land / 1.2) : 1;
    ctx.drawImage(img.flake[f.i], f.x - s / 2, f.y - s / 2, s, s);
  }
  ctx.globalAlpha = 1;
  const bits = img.bit[WXP.season || 'spring'];
  for (const b of WXP.bits) {
    const im = bits[b.i % bits.length], w = 20 * b.s, h = 14 * b.s;
    ctx.save(); ctx.translate(b.x, b.y); ctx.rotate(b.rot); ctx.scale(1, 0.55 + 0.45 * Math.abs(Math.sin(t * 2.2 + b.ph))); ctx.drawImage(im, -w / 2, -h / 2, w, h); ctx.restore();
  }
  if (wx.kind === 'fog') {
    if (!WXP.fog) WXP.fog = buildFog(res);
    ctx.fillStyle = 'rgba(238,240,245,0.22)'; ctx.fillRect(0, 0, SCENE_W, H);
    [[H - 300, 5, 0.55], [H - 190, -7, 0.45], [H - 95, 9, 0.4]].forEach(([y, sp, a], i) => {
      const L = WXP.fog[i], w = L.w, x = ((t * sp) % w + w) % w;
      ctx.globalAlpha = a; drawLayer(ctx, L, x - w, y); drawLayer(ctx, L, x, y);
    });
    ctx.globalAlpha = 1;
  }
}
// one bit that Parker can chase (windy days)
function drawBit(ctx, season, i, x, y, rot, s = 1.3) {
  const bits = wxSprites(WXP.res || 2).bit[season], im = bits[i % bits.length], w = 20 * s, h = 14 * s;
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.drawImage(im, -w / 2, -h / 2, w, h); ctx.restore();
}
