// ================= HOUSE UPGRADE: pieces of paper fly in and make the new house; then he goes round it, sniffing =================
// Bought in his house panel with dandelions (no timers, nothing that runs out). The new house is saved the moment you
// pay, so closing the game mid-animation loses nothing: he still gets to sniff round it next time he sees it.
const HOUSEFX = { on: false };
const HOUSE_FX = { apart: 0.05, apartDur: 0.55, gap: 0.3, step: 0.14, fly: 0.62, sparkle: 0.15, after: 1.1 };   // seconds

function upgradeHouse() {
  const from = houseLevel(), to = from + 1;
  if (to > HOUSE_MAX || HOUSEFX.on || S.dandelions < HOUSES[to].price) return false;
  S.dandelions -= HOUSES[to].price; S.house = to; writeSave(S); refreshCoins();
  startHouseBuild(from, to);
  return true;
}
function startHouseBuild(from, to) {
  if (ROOMV.on) leaveRoomNow();                                  // it's built from the yard
  if (VIS.on && VIS.kind === 'sparrow') visitorLeave();         // she may be sitting on the old roof
  if (LAY) LAY.old = null;
  applyHouse(to); tidyField();
  const by = Y(HOUSE.d), r = rng(700 + to);
  const ps = (lv) => ART.get('house.' + lv).pieces(HOUSES[lv].x0, by);
  Object.assign(HOUSEFX, {
    on: true, from, to, t0: TT, look: WX.look, sparkled: false,
    bare: ART.layer('scene.yard', V.H, V.res, WX.look, to, true),          // the yard without a house
    yard: ART.layer('scene.yard', V.H, V.res, WX.look, to),                // …and with the new one, for the end
    old: ps(from).map((fn, i) => ({ fn, vx: (r() - 0.5) * 220, spin: (r() - 0.5) * 3, cv: null })),
    new: ps(to).map((fn, i) => ({ fn, ox: (i % 2 ? -1 : 1) * (50 + r() * 90), oy: -(250 + r() * 90), rot: (r() < 0.5 ? -1 : 1) * (0.4 + r() * 0.6), cv: null, landed: false })),
  });
  SFX.flutter(1.2);
  // he stops and watches (if he's awake); out of the doorway first if he was napping inside
  if (!P.present) return;
  if (P.mode === 'inhouse' || P.mode === 'goin') { P.x = 250; P.d = 168; P.face = -1; setMode('expect', 99); return; }
  if (/sleep|nap/.test(P.mode)) return;
  if (P.hold) dropHeld();
  goTo(clamp(P.x, 230, 330), clamp(P.d, 130, 200), () => faceThen(-1, () => setMode('expect', 99)));
}
// one piece of the house on its own small canvas, cut to the size of what is on it
const HB = { scratch: null };
function housePieceCanvas(fn) {
  const by = Y(HOUSE.d), X0 = -10, Y0 = by - 250, W = 330, H = 290;
  if (!HB.scratch) HB.scratch = mk(W, H);
  const c = HB.scratch.getContext('2d', { willReadFrequently: true });
  c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = 1; c.globalCompositeOperation = 'source-over'; c.clearRect(0, 0, W, H); c.translate(-X0, -Y0); fn(c);
  const d = c.getImageData(0, 0, W, H).data; let x0 = W, y0 = H, x1 = -1, y1 = -1;
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (d[(y * W + x) * 4 + 3] > 3) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
  if (x1 < 0) return { cv: mk(1, 1), x: 0, y: 0, w: 0, h: 0 };
  const res = V.res, x = X0 + x0 - 2, y = Y0 + y0 - 2, w = x1 - x0 + 5, h = y1 - y0 + 5;
  const cv = mk(w * res, h * res), cc = cv.getContext('2d'); cc.scale(res, res); cc.translate(-x, -y); fn(cc);
  return { cv, x, y, w, h };
}
const houseBuildTimes = () => {
  const F = HOUSE_FX, nOld = HOUSEFX.old.length, tB = nOld * F.apart + F.apartDur + F.gap, tEnd = tB + (HOUSEFX.new.length - 1) * F.step + F.fly;
  return { tB, tEnd, tDone: tEnd + F.after };
};
// drawn right after the (bare) yard, so he, the toys and the visitors stay in front
function drawHouseBuild() {
  const F = HOUSE_FX, { tB, tEnd, tDone } = houseBuildTimes(), t = Math.floor((TT - HOUSEFX.t0) * 12) / 12;   // stop-motion: moves on twos
  // the old house comes apart, front pieces first, and floats away
  const nOld = HOUSEFX.old.length;
  HOUSEFX.old.forEach((p, i) => {
    const u = clamp((t - (nOld - 1 - i) * F.apart) / F.apartDur); if (u >= 1) return;
    if (!p.cv) p.cv = housePieceCanvas(p.fn);
    ART.draw('live.housePiece', ctx, p.cv, p.vx * u, -(50 * u + 260 * u * u), p.spin * u, 1, 1 - u * u);
  });
  // the new one flies in piece by piece, back to front, and lands with a little pat
  HOUSEFX.new.forEach((p, j) => {
    const s = tB + j * F.step, u = clamp((t - s) / F.fly); if (u <= 0) return;
    if (!p.cv) p.cv = housePieceCanvas(p.fn);
    const e = 1 - (1 - u) ** 3, land = t - s - F.fly;
    if (u >= 1 && !p.landed) { p.landed = true; SFX.paper(j); if (p.cv.w > 30) dustPuff(p.cv.x + p.cv.w / 2, p.cv.y + p.cv.h - 2, 4); }
    ART.draw('live.housePiece', ctx, p.cv, p.ox * (1 - e), p.oy * (1 - e) - Math.sin(Math.PI * u) * 26, p.rot * (1 - e), u >= 1 && land < 2 / 12 ? 1.05 : 1, 1);
  });
  if (t > tEnd + F.sparkle && !HOUSEFX.sparkled) {     // done: a warm glow, a music-box phrase, a few hearts
    HOUSEFX.sparkled = true; SFX.gift(true);
    const h = houseAt(HOUSEFX.to), cx = h.x0 + 100, cy = Y(HOUSE.d) - 90;
    fx({ type: 'glow', x: cx, y: cy, life: 1.6, r: 150, rgb: '255,236,170' });
    for (let i = 0; i < 4; i++) fx({ type: 'spr', key: 'fx.heart', x: cx - 60 + i * 40, y: cy - 30, vy: -30, delay: i * 0.15, sway: i, life: 1.4 });
  }
  if (TT - HOUSEFX.t0 > tDone) finishHouseBuild();
}
function finishHouseBuild() {
  if (!HOUSEFX.on) return;
  const to = HOUSEFX.to;
  if (LAY) { LAY.yard = LAY.look === HOUSEFX.look ? HOUSEFX.yard : ART.layer('scene.yard', V.H, V.res, LAY.look, to); LAY.house = to; LAY.mul = ART.layer('scene.light.mul', LAY.p, V.H, to); LAY.old = null; }
  Object.assign(HOUSEFX, { on: false, bare: null, yard: null, old: null, new: null });
  showToast('toast.house.done', 3000);
  if (P.present && /^(expect|trot|sit|wag)$/.test(P.mode)) pickNext();       // the first thing he does: go and see it
}

// ---- the first time he sees a new house, he goes round it sniffing, stops to look up at the door and the window ----
function inspectHouse() {
  const h = houseAt(), tour = h.tour;
  const step = i => {
    if (i >= tour.length) {
      S.houseSeen = h.level; writeSave(S); SFX.pop();
      const [hx, hy] = parkerCenter(); fx({ type: 'spr', key: 'fx.heart', x: hx, y: hy - 40, vy: -34, life: 1.4 });
      return setMode('wag', HABITS.reactionTime.wag);
    }
    const [x, d, f, kind] = tour[i];
    const next = () => step(i + 1);
    goTo(x, d, () => faceThen(f, () => kind === 'look' ? setMode('admire', rand([1.4, 2]), { next }) : setMode('sniff', rand([1.4, 2.2]), { next })), { speed: 58 });
  };
  step(0);
}
