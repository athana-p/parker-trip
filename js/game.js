// ================= GAME: home (stage 1) =================
const SPAWN_INTERVAL = 4 * 60 * 1000, FIELD_CAP = 12, PUFF_CHANCE = 0.15, START_DANDELIONS = 5;
const K_DOG = 0.55;                                   // puppet scale in the yard
const DEV = new URLSearchParams(location.search);     // dev: ?tod=night  ?pose=sleep  ?debug=1 (debug panel)

const cv = document.getElementById('scene'), ctx = cv.getContext('2d');
const V = { H: 700, res: 2, cssW: 1, cssH: 1, k: 1 };
const Y = d => V.H - d;
let S = null, TT = 0, LAY = null, TOD = null, shown = 0;

// ---------- sprites: puppet drawings rendered once (sticker edge + soft shadow baked), then reused ----------
function makeSprite(fn, box, k, stick = true) {
  const res = V.res, PAD = 22, bx = { w: box.w * k, h: box.h * k, ox: box.ox * k, oy: box.oy * k };
  const src = puppetCanvas(bx, res, c => { c.scale(k, k); fn(c); });
  const w = bx.w + PAD * 2, h = bx.h + PAD * 2;
  const img = mk(w * res, h * res), ic = img.getContext('2d'); ic.scale(res, res);
  if (stick) sticker(ic, src, PAD, PAD, { res, shadowA: 0 }); else ic.drawImage(src, PAD, PAD, bx.w, bx.h);
  const sh = mk(w * res, h * res), sc = sh.getContext('2d'); sc.scale(res, res);
  castShadow(sc, c => c.drawImage(img, 0, 0, w, h), stick ? 6 : 2.5, 0, 0, 1);
  return { img, sh, ox: bx.ox + PAD, oy: bx.oy + PAD, w, h, stick };
}
const SPRITES = {
  sit: a => [c => drawSitB(c, a[0], +a[1], { headRot: +a[2], headDy: +(a[3] || 0), pack: a[4] === 'pack', mouth: ['duck', 'card'].includes(a[4]) ? a[4] : null }), BOX_SIT, K_DOG],
  item: a => [c => drawItem(c, a[0], +a[1]), { w: 44, h: 44, ox: 22, oy: 22 }, 1, false],
  bird: a => [c => drawBird(c, +a[0]), { w: 60, h: 60, ox: 30, oy: 48 }, 1, false],
  belly: a => [c => drawBellyB(c, +a[0]), BOX_BELLY, K_DOG],
  puff: () => [c => drawPuff(c), { w: 30, h: 22, ox: 15, oy: 11 }, 1, false],
  trot: a => [c => drawStandB(c, { ...trotPose(+a[0]), pack: a[1] === 'pack' }), BOX_STAND, K_DOG],
  stand: a => [c => drawStandB(c, { ...STAND0, expr: a[0], pack: a[1] === 'pack' }), BOX_STAND, K_DOG],
  sniff: a => [c => drawStandB(c, sniffPose(+a[0])), BOX_STAND, K_DOG],
  look: a => [c => drawStandB(c, { ...lookBackPose(+a[0]), pack: a[1] === 'pack' }), BOX_STAND, K_DOG],
  lie: a => [c => drawLieB(c, a[0], { breath: +a[1], bone: a[2] === 'bone', headRot: a[3] != null ? +a[3] : undefined }), BOX_LIE, K_DOG],
  dand: a => [c => drawDandelion(c, a[0]), DANDELION_BOX, 1, false],
  heart: () => [c => drawHeart(c, 1), { w: 30, h: 30, ox: 15, oy: 15 }, 1, false],
  z: () => [c => drawZ(c, 1.1), { w: 24, h: 24, ox: 12, oy: 12 }, 1, false],
  petal: () => [c => piece(c, ell(0, 0, 4, 1.8), '#f6c22c', { mul: 0.5 }), { w: 12, h: 8, ox: 6, oy: 4 }, 1, false],
  seed: () => [c => { c.strokeStyle = '#fff'; c.lineWidth = 0.8; c.beginPath(); c.moveTo(0, 4); c.lineTo(0, -3); c.stroke(); for (let i = -2; i <= 2; i++) { c.beginPath(); c.moveTo(0, -3); c.lineTo(i * 1.8, -6); c.stroke(); } }, { w: 12, h: 14, ox: 6, oy: 7 }, 1, false],
};
const SPR = new Map();
function sprite(key) {
  let s = SPR.get(key);
  if (!s) { const a = key.split('|'), [fn, box, k, stick] = SPRITES[a[0]](a.slice(1)); s = makeSprite(fn, box, k, stick); SPR.set(key, s); if (SPR.size > 64) SPR.delete(SPR.keys().next().value); }
  return s;
}
function drawSprite(s, x, y, o = {}) {
  const { sx = 1, scale = 1, alpha = 1, rot = 0, shA = s.stick ? 0.3 : 0.22 } = o, off = s.stick ? [4, 7] : [1, 2.5];
  ctx.save(); ctx.globalAlpha = alpha * shA; ctx.translate(x + off[0] * scale, y + off[1] * scale); ctx.rotate(rot); ctx.scale(sx * scale, scale); ctx.drawImage(s.sh, -s.ox, -s.oy, s.w, s.h); ctx.restore();
  ctx.save(); ctx.globalAlpha = alpha; ctx.translate(x, y); ctx.rotate(rot); ctx.scale(sx * scale, scale); ctx.drawImage(s.img, -s.ox, -s.oy, s.w, s.h); ctx.restore();
}

// ---------- layout + static layers ----------
function layout() {
  const r = document.getElementById('game').getBoundingClientRect(), dpr = window.devicePixelRatio || 1;
  V.cssW = r.width; V.cssH = r.height; V.H = SCENE_W * r.height / r.width;
  V.k = r.width * dpr / SCENE_W; V.res = Math.min(3, V.k);
  cv.width = Math.round(r.width * dpr); cv.height = Math.round(r.height * dpr);
  SPR.clear(); LAY = null; buildStatic(TOD);
}
function buildStatic(tod) {
  const p = PALETTES[tod], old = LAY;
  const L = { tod, sky: buildSky(p, V.H, V.res), clouds: cloudSprites(p, V.res), mul: buildMulOverlay(p, V.H), scr: buildScrOverlay(p, V.H), p };
  L.yard = old && old.yard || buildYard(V.H, V.res);
  L.fore = old && old.fore || buildFore(V.H, V.res);
  if (old) { L.old = old; L.fadeT0 = TT; old.old = null; }
  LAY = L;
}
function currentTod() { return DEV.get('tod') || timeOfDay(new Date(Clock.now())); }
// is it his bedtime? (the sky turns to night at 19:00, but he stays up until 22:00)
function sleepTime() { const h = new Date(Clock.now()).getHours(), [a, b] = HABITS.bedtime; return h >= a || h < b; }

// ---------- dandelions ----------
function spotFree(x, d) {
  if (Math.abs(x - 88) < 22 && d > 110) return false;                 // keep his stepping-stone path clear
  if (x > 296 && x < 368 && d > 205) return false;                   // mailbox post
  return S.field.every(f => Math.hypot(f.x - x, (f.d - d) * 1.6) > 34);
}
function spawnDandelion(born) {
  for (let tries = 0; tries < 40; tries++) {
    const x = 26 + Math.random() * (SCENE_W - 52), d = 96 + Math.random() * 136;
    if (!spotFree(x, d)) continue;
    S.field.push({ id: ++S.seq, x: Math.round(x), d: Math.round(d), kind: Math.random() < PUFF_CHANCE ? 'puff' : 'yellow', born });
    return true;
  }
  return false;
}
// real time keeps running while the game is closed: catch up from the saved timestamp
function tickSpawns() {
  const now = Clock.now(); let changed = false;
  while (S.nextSpawnAt <= now) {
    if (S.field.length >= FIELD_CAP) { S.nextSpawnAt = now + SPAWN_INTERVAL; break; }
    changed = spawnDandelion(S.nextSpawnAt) || changed; S.nextSpawnAt += SPAWN_INTERVAL;
  }
  if (changed) writeSave(S);
}
function collect(f) {
  S.field = S.field.filter(g => g !== f);
  const value = f.kind === 'puff' ? 3 : 1, x = f.x, y = Y(f.d) - 36 * depthScale(f.d);
  S.dandelions += value; S.seenHint = true; hideToast(); writeSave(S); SFX.collect(f.kind === 'puff');
  fx({ type: 'glow', x, y, life: 0.5, r: 34, rgb: '255,236,170' });
  if (f.kind === 'puff') for (let i = 0; i < 12; i++) fx({ type: 'spr', key: 'seed', x: x + (Math.random() - 0.5) * 16, y: y + (Math.random() - 0.5) * 16, vx: (Math.random() - 0.3) * 30, vy: -20 - Math.random() * 30, sway: Math.random() * TAU, life: 1.8 + Math.random(), rot: (Math.random() - 0.5) * 0.6 });
  else for (let i = 0; i < 9; i++) { const a = i / 9 * TAU; fx({ type: 'spr', key: 'petal', x, y, vx: Math.cos(a) * 60, vy: Math.sin(a) * 60 - 30, g: 120, life: 0.7, rot: a, vr: 6 }); }
  if (f.kind === 'puff' && /^(sit|look|sniff|lie|trot)$/.test(P.mode) && Math.random() < HABITS.fluffChase) {
    const side = Math.sign(x - P.x) || 1, tx = clamp(x - 44 * side, 40, 360), td = clamp(f.d, 100, 220);
    goTo(tx, td, () => faceThen(side, () => setMode('sniff', 2.2)));
  }
  const t = hudTarget();
  fx({ type: 'fly', x0: x, y0: y, x1: t[0], y1: t[1], life: 0.7, value });
}
function depthScale(d) { return lerp(1, 0.86, clamp((d - 90) / 150)); }

// ---------- Parker ----------
const P = { x: 230, d: 150, face: -1, mode: 'sit', t0: 0, until: 6, data: {}, lastReact: null, blinkAt: 2, present: true, pack: false, hold: null, want: null };
const rand = ([a, b]) => a + Math.random() * (b - a);
function setMode(mode, dur, data = {}) { P.mode = mode; P.t0 = TT; P.until = dur == null ? Infinity : TT + dur; P.data = data; }
function pickWeighted(w) { const ks = Object.keys(w); let s = ks.reduce((a, k) => a + w[k], 0) * Math.random(); for (const k of ks) { s -= w[k]; if (s <= 0) return k; } return ks[0]; }
function randomSpot() {
  for (let i = 0; i < 30; i++) { const x = 50 + Math.random() * 300, d = 100 + Math.random() * 120; if (Math.abs(x - P.x) > 50) return [x, d]; }
  return [200, 150];
}
const BED = [70, 226];
function pickNext() {
  const tod = currentTod(), company = TT < (P.awakeUntil || 0), asleep = sleepTime() && !company;
  const w = { ...HABITS.idle[company && sleepTime() ? 'company' : asleep ? 'night' : tod === 'night' ? 'evening' : tod] };
  if (!asleep) { for (const t of S.toys) w[t] = HABITS.toys[t]; w.eat = HABITS.eat; }
  const k = P.want && S.toys.includes(P.want) && !asleep ? P.want : pickWeighted(w); P.want = null;
  if (k === 'ball') return playBall(0);
  if (k === 'duck') { const t = S.toyPos.duck, side = Math.sign(t.x - P.x) || 1; return goTo(clamp(t.x - 36 * side, 40, 360), t.d, () => faceThen(side, () => { P.hold = 'duck'; setMode('shake', HABITS.shakeTime); })); }
  if (k === 'bone') { const t = S.toyPos.bone, side = Math.sign(t.x - P.x) || 1; return goTo(clamp(t.x - 64 * side, 40, 360), clamp(t.d, 100, 224), () => faceThen(side, () => { P.hold = 'bone'; setMode('chew', rand(HABITS.duration.chew)); })); }
  if (k === 'eat') return goTo(160, 226, () => faceThen(1, () => setMode('eat', rand(HABITS.duration.eat))));
  if (k === 'trot') { const [x, d] = randomSpot(); return goTo(x, d, Math.random() < 0.45 ? () => setMode('sniff', rand(HABITS.duration.sniff)) : null); }
  if (k === 'sigh') return setMode('sigh', HABITS.sighTime, { lie: false });
  if (k === 'sleep') { if (Math.hypot(P.x - BED[0], P.d - BED[1]) > 6) return goTo(BED[0], BED[1], () => faceThen(1, () => setMode('sleep', rand(HABITS.duration.sleep)))); return setMode('sleep', rand(HABITS.duration.sleep)); }
  setMode(k, rand(HABITS.duration[k]));
}
function faceThen(f, then) { if (f === P.face) then(); else setMode('turn', 2 / 12, { to: f, then }); }
function goTo(x, d, then) { const f = Math.sign(x - P.x) || P.face; faceThen(f, () => setMode('trot', null, { x, d, then })); }
function updateParker(dt) {
  if (!P.present) return;
  if (P.mode === 'trot') {
    const dx = P.data.x - P.x, dd = P.data.d - P.d, L = Math.hypot(dx, dd), step = HABITS.trotSpeed * dt;
    if (L <= step) { P.x = P.data.x; P.d = P.data.d; const then = P.data.then; then ? then() : pickNext(); }
    else { P.x += dx / L * step; P.d += dd / L * step; }
    return;
  }
  if (TT < P.until) return;
  if (P.mode === 'turn') { P.face = P.data.to; P.data.then(); }
  else if (P.mode === 'watch') P.data.next();
  else if (P.mode === 'stir') setMode(P.data.back, P.data.left);
  else if (P.mode === 'packup') setMode('departLook', 1.7);
  else if (P.mode === 'drowsy') { setMode('wag', HABITS.reactionTime.wag); SFX.pop(); }
  else if (P.mode === 'departLook') goTo(480, P.d, () => { P.present = false; P.pack = false; setMode('away'); });
  else if (P.mode === 'arrive') { P.pack = false; setMode('sigh', HABITS.sighTime, { lie: false }); }
  else if (P.mode === 'nudge') kickBall();
  else if (P.mode === 'shake') { S.toyPos.duck = { x: clamp(P.x + 34 * P.face, 30, 370), d: clamp(P.d - 6, 96, 226) }; P.hold = null; writeSave(S); setMode('sigh', HABITS.sighTime, { lie: false }); }
  else if (P.mode === 'chew') { S.toyPos.bone = { x: clamp(P.x + 64 * P.face, 30, 370), d: P.d }; P.hold = null; writeSave(S); setMode('sigh', HABITS.sighTime, { lie: true }); }
  else if (P.mode === 'belly') setMode('sigh', HABITS.sighTime, { lie: true });
  else if (P.mode === 'sigh') P.data.lie ? setMode('lie', rand(HABITS.duration.lie)) : setMode('sit', rand([3, 6]));
  else if (HABITS.reactions.includes(P.mode)) Math.random() < HABITS.sighAfterHappy ? setMode('sigh', HABITS.sighTime, { lie: false }) : setMode('sit', rand([3, 6]));
  else pickNext();
}
// ---- toys, departure, arrival, the bag rustle ----
const BALL = { vx: 0, vd: 0, rot: 0 };
function playBall(n) {
  const t = S.toyPos.ball, side = Math.sign(t.x - P.x) || P.face;
  goTo(clamp(t.x - 34 * side, 36, 364), clamp(t.d, 100, 224), () => faceThen(side, () => setMode('nudge', 0.45, { n })));
}
function kickBall() {
  const n = P.data.n + 1, sp = rand([90, 140]), a = (Math.random() - 0.5) * 0.9;
  BALL.vx = Math.cos(a) * sp * P.face; BALL.vd = Math.sin(a) * sp * 0.5;
  fx({ type: 'glow', x: S.toyPos.ball.x, y: Y(S.toyPos.ball.d) - 10, life: 0.4, r: 24, rgb: '255,240,200' });
  if (n < HABITS.ballRounds) setMode('watch', 0.6, { next: () => playBall(n) }); else setMode('watch', 1.2, { next: () => setMode('sigh', HABITS.sighTime, { lie: false }) });
}
function updateBall(dt) {
  const t = S.toyPos.ball; if (!t) return;
  const v = Math.hypot(BALL.vx, BALL.vd); if (v < 1) { BALL.vx = BALL.vd = 0; return; }
  const k = Math.max(0, v - 110 * dt) / v; BALL.vx *= k; BALL.vd *= k;
  t.x += BALL.vx * dt; t.d += BALL.vd * dt; BALL.rot += BALL.vx * dt / 9;
  if (t.x < 28 || t.x > 372) { BALL.vx *= -0.6; t.x = clamp(t.x, 28, 372); }
  if (t.d < 96 || t.d > 228) { BALL.vd *= -0.6; t.d = clamp(t.d, 96, 228); }
}
function startDeparture() {
  press = null; P.hold = null; P.pack = true; P.present = true;
  setMode('packup', 1.5);
  const [hx, hy] = parkerCenter(); fx({ type: 'glow', x: hx, y: hy, life: 0.7, r: 70, rgb: '255,240,200' });
}
function startArrival() {
  P.present = true; P.pack = true; P.hold = null; P.x = 450; P.d = 150; P.face = -1;
  setMode('trot', null, { x: 236, d: 150, then: () => setMode('arrive', 1.8) });
}
function bagRustle() {          // the sound of a plastic bag: he comes running
  if (!P.present || P.pack || /packup|departLook|arrive|belly/.test(P.mode)) return;
  if (/sleep|nap/.test(P.mode)) return setMode('stir', HABITS.stirTime, { back: P.mode, left: Math.max(10, P.until - TT) });
  if (P.hold === 'duck') S.toyPos.duck = { x: clamp(P.x + 30 * P.face, 30, 370), d: P.d };
  if (P.hold === 'bone') S.toyPos.bone = { x: clamp(P.x + 60 * P.face, 30, 370), d: P.d };
  P.hold = null; goTo(200, 104, () => setMode('expect', HABITS.expectTime));
}
function tapParker() {
  if (/packup|departLook|arrive/.test(P.mode) || P.pack) return;
  if (P.mode === 'gift') return receiveGift();
  if (/^(sleep|nap|stir)$/.test(P.mode)) {
    // a few quick taps wake him up; one tap just makes him stir
    P.wakeTaps = TT - (P.lastTap || -9) < 1.5 ? (P.wakeTaps || 0) + 1 : 1; P.lastTap = TT;
    if (P.wakeTaps >= HABITS.wakeTaps) { P.wakeTaps = 0; P.awakeUntil = TT + HABITS.companyTime; setMode('drowsy', 1.8); const [hx, hy] = parkerCenter(); fx({ type: 'glow', x: hx, y: hy, life: 0.8, r: 70, rgb: '255,240,200' }); return; }
    if (P.mode !== 'stir') setMode('stir', HABITS.stirTime, { back: P.mode, left: Math.max(10, P.until - TT) });
    return;
  }
  const opts = HABITS.reactions.filter(r => r !== P.lastReact), r = opts[Math.floor(Math.random() * opts.length)];
  P.lastReact = r; setMode(r, HABITS.reactionTime[r]); SFX.pop();
  const [hx, hy] = parkerCenter();
  fx({ type: 'glow', x: hx, y: hy - 20, life: 0.6, r: 60, rgb: '255,240,200' });
  if (r !== 'tilt') for (let i = 0; i < 3; i++) fx({ type: 'spr', key: 'heart', x: hx + (i - 1) * 22, y: hy - 40, vx: (i - 1) * 8, vy: -34, delay: i * 0.18, sway: i, life: 1.4, rot: (i - 1) * 0.2 });
}
// which drawing to show (held on twos: the index changes 12 times per second)
function parkerDrawing() {
  const f = Math.floor((TT - P.t0) * 12 + 1e-6), blink = TT > P.blinkAt && TT < P.blinkAt + 2 / 12;
  if (TT > P.blinkAt + 2 / 12) P.blinkAt = TT + rand(HABITS.blinkEvery);
  const open = blink ? 'blink' : 'calm', pk = P.pack ? '|pack' : '';
  let key, sx = P.face, lift = 0;
  switch (P.mode) {
    case 'trot': key = `trot|${f % 6}${pk}`; break;
    case 'turn': key = `stand|calm${pk}`; sx = (f < 1 ? 0.55 : -0.55) * P.face; lift = 8 * Math.sin(Math.PI * clamp((TT - P.t0) / (2 / 12))); break;
    case 'sniff': key = `sniff|${Math.floor(f / 3) % 2}`; break;
    case 'look': key = `look|${Math.floor(f / 6) % 2}`; break;
    case 'lie': key = `lie|${open}|0`; break;
    case 'nap': case 'sleep': { const b = [0, 1.2, 2.4, 1.2][Math.floor(TT / 0.75) % 4]; key = `lie|sleepy|${b}`; break; }
    case 'stir': key = (TT - P.t0) < 0.6 ? 'lie|blink|0' : 'lie|sleepy|1.2'; break;
    case 'wag': key = `sit|happy|${f % 2 ? 0.3 : -0.25}|0`; break;
    case 'tilt': key = f < 2 ? `sit|calm|0|0` : `sit|calm|0|-0.3`; break;
    case 'sigh': { const inhale = (TT - P.t0) < HABITS.sighTime * 0.45; key = P.data.lie ? `lie|content|${inhale ? 2.4 : 0}` : (inhale ? 'sit|content|0|-0.05|-2.5' : 'sit|content|0|0.07|2'); break; }
    case 'belly': key = P.data.ending ? 'belly|0' : `belly|${Math.floor(f / 3) % 2}`; break;
    case 'drowsy': key = (TT - P.t0) < 0.9 ? 'sit|sleepy|0|0.08' : 'sit|blink|0|-0.05'; break;
    case 'gift': key = `sit|happy|${f % 6 < 3 ? 0.2 : -0.12}|0|0|card`; break;
    case 'packup': key = `sit|calm|0|0|0|pack`; break;
    case 'departLook': key = `look|${Math.floor(f / 6) % 2}|pack`; break;
    case 'arrive': key = `sit|happy|${f % 2 ? 0.3 : -0.25}|0|0|pack`; break;
    case 'nudge': key = 'sniff|1'; break;
    case 'watch': key = `stand|calm`; break;
    case 'shake': key = `sit|happy|0|${f % 4 < 2 ? -0.24 : 0.24}|0|duck`; break;
    case 'chew': key = `lie|calm|0|bone|${f % 6 < 3 ? 0.02 : 0.12}`; break;
    case 'eat': key = `sniff|${Math.floor(f / 2) % 2}`; break;
    case 'expect': key = `sit|${open}|${f % 6 < 3 ? 0.18 : -0.12}|0`; break;
    case 'hop': { const u = clamp((TT - P.t0) / 0.6); lift = 16 * Math.sin(Math.PI * u); key = 'sit|happy|0.1|0'; break; }
    default: key = `sit|${open}|0|0`;
  }
  return { key, sx, lift };
}
function parkerCenter() { const s = depthScale(P.d), lying = /sleep|nap|stir|lie|belly|chew/.test(P.mode) || (P.mode === 'sigh' && P.data.lie); return [P.x + (lying ? 20 : 4) * P.face * s, Y(P.d) - (lying ? 34 : 64) * s]; }

// ---------- particles ----------
const FX = [];
function fx(o) { FX.push({ age: 0, delay: 0, vx: 0, vy: 0, rot: 0, ...o }); }
function updateFX(dt) {
  for (const p of FX) {
    if (p.delay > 0) { p.delay -= dt; continue; }
    p.age += dt; p.vy += (p.g || 0) * dt; p.x += (p.vx + (p.sway != null ? Math.sin(p.age * 3 + p.sway) * 14 : 0)) * dt; p.y += p.vy * dt; p.rot += (p.vr || 0) * dt;
    if (p.type === 'fly' && p.age >= p.life && !p.done) { p.done = true; shown += p.value; updateHUD(true); }
  }
  for (let i = FX.length - 1; i >= 0; i--) if (FX[i].age >= FX[i].life) FX.splice(i, 1);
}
function drawFX() {
  for (const p of FX) {
    if (p.delay > 0) continue;
    const u = p.age / p.life;
    if (p.type === 'spr') drawSprite(sprite(p.key), p.x, p.y, { alpha: Math.min(1, (1 - u) * 2.2), rot: p.rot, shA: 0.15, scale: p.grow ? lerp(0.6, 1.5, u) : 1 });
    else if (p.type === 'glow') glow(ctx, p.x, p.y, p.r * (0.6 + u * 0.6), p.rgb, 0.8 * (1 - u));
    else if (p.type === 'fly') {
      const e = smooth(u), cx = (p.x0 + p.x1) / 2, cy = Math.min(p.y0, p.y1) - 60;
      const x = (1 - e) * (1 - e) * p.x0 + 2 * (1 - e) * e * cx + e * e * p.x1, y = (1 - e) * (1 - e) * p.y0 + 2 * (1 - e) * e * cy + e * e * p.y1;
      glow(ctx, x, y, 16, '255,226,140', 0.9); ctx.fillStyle = '#ffe9a6'; ctx.beginPath(); ctx.arc(x, y, 3.2, 0, TAU); ctx.fill();
    }
  }
}
function sleepZ() {
  if (!P.present || !/sleep|nap/.test(P.mode)) return;
  const k = Math.floor(TT / 2.2);
  if (k !== P.lastZ) { P.lastZ = k; const [x, y] = parkerCenter(); fx({ type: 'spr', key: 'z', x: x + 30 * P.face, y: y - 26, vx: 6 * P.face, vy: -14, sway: k, life: 2.6, rot: -0.15 }); }
}

// ---------- render ----------
function fireflies(t) {
  const r = rng(17);
  ctx.save(); ctx.globalCompositeOperation = 'screen';
  for (let i = 0; i < 9; i++) {
    const bx = r() * SCENE_W, bd = 90 + r() * 220, ph = r() * TAU, sp = 0.3 + r() * 0.3;
    const x = bx + Math.sin(t * sp + ph) * 26, y = Y(bd) + Math.sin(t * sp * 1.3 + ph * 2) * 14, a = 0.5 + 0.5 * Math.sin(t * 1.7 + ph);
    const g = ctx.createRadialGradient(x, y, 0, x, y, 9); g.addColorStop(0, `rgba(230,255,160,${a})`); g.addColorStop(1, 'rgba(230,255,160,0)');
    ctx.fillStyle = g; ctx.fillRect(x - 9, y - 9, 18, 18);
  }
  ctx.restore();
}
function drawScene() {
  const L = LAY, p = L.p, H = V.H;
  ctx.setTransform(cv.width / SCENE_W, 0, 0, cv.width / SCENE_W, 0, 0);
  const fade = L.old ? clamp((TT - L.fadeT0) / 3) : 1;
  if (L.old && fade >= 1) L.old = null;
  if (L.old) drawLayer(ctx, L.old.sky);
  ctx.save(); ctx.globalAlpha = fade; drawLayer(ctx, L.sky);
  const hz = H - 330;
  L.clouds.forEach((cl, i) => { const span = SCENE_W + 200, x = ((i * 157 + TT * (3 + i * 1.5)) % span) - 100; drawLayer(ctx, cl, x, hz * [0.2, 0.42, 0.1][i]); });
  ctx.restore();
  drawLayer(ctx, L.yard);
  const mail = S.mail.length > 0;
  if (mail) glow(ctx, MAILBOX.x, Y(MAILBOX.d) - 106, 46, '255,236,170', 0.35 + 0.1 * Math.sin(TT * 2));
  mailboxFlag(ctx, MAILBOX.x, Y(MAILBOX.d), mail);
  // ground things, back to front
  const items = S.field.map(f => ({ d: f.d, f }));
  for (const t of S.toys) if (P.hold !== t) items.push({ d: S.toyPos[t].d, toy: t });
  if (P.present) items.push({ d: P.d, parker: true });
  items.sort((a, b) => b.d - a.d);
  const now = Clock.now();
  for (const it of items) {
    if (it.toy) {
      const t = S.toyPos[it.toy], s = depthScale(t.d), k = { ball: 0.6, duck: 0.55, bone: 0.55 }[it.toy];
      drawSprite(sprite(`item|${it.toy}|${k}`), t.x, Y(t.d) - 11 * s, { scale: s, rot: it.toy === 'ball' ? BALL.rot : 0 });
    } else if (it.f) {
      const f = it.f, s = depthScale(f.d), grow = smooth(clamp((now - f.born) / 1200)), sw = 0.035 * Math.sin(TT * 1.1 + f.id * 1.7);
      if (grow > 0) drawSprite(sprite(`dand|${f.kind}`), f.x, Y(f.d), { scale: s * lerp(0.2, 1, grow), alpha: Math.min(1, grow * 3), rot: sw });
    } else {
      const s = depthScale(P.d), dr = parkerDrawing(), lying = /lie|sleep|nap|stir|belly|chew/.test(P.mode) || (P.mode === 'sigh' && P.data.lie);
      ctx.save(); ctx.globalCompositeOperation = 'multiply'; ctx.fillStyle = 'rgba(120,110,120,0.35)';
      ctx.beginPath(); ctx.ellipse(P.x + (lying ? 14 * P.face : 0) * s, Y(P.d) + 1, (lying ? 70 : 52) * s * Math.max(0.6, Math.abs(dr.sx)), 6 * s, 0, 0, TAU); ctx.fill(); ctx.restore();
      drawSprite(sprite(dr.key), P.x, Y(P.d) - dr.lift, { sx: dr.sx, scale: s });
      if (P.mode === 'turn') glow(ctx, P.x, Y(P.d) - 50 * s, 46, '255,240,200', 0.5);
      if (P.carrying && P.mode !== 'gift') drawSprite(sprite('item|card|0.5'), P.x + 64 * P.face * s * Math.abs(dr.sx), Y(P.d) - 72 * s - dr.lift, { scale: s, rot: 0.15 * P.face });   // the card in his mouth on the way
      if (P.mode === 'gift') glow(ctx, P.x, Y(P.d) - 70 * s, 70, '255,236,170', 0.25 + 0.08 * Math.sin(TT * 2.5));
    }
  }
  drawVisitor();
  drawLayer(ctx, L.fore);
  // light: multiply tint + vignette, then screen glow, lamp, motes
  ctx.save(); ctx.globalCompositeOperation = 'multiply';
  if (L.old) { ctx.globalAlpha = 1 - fade; drawLayer(ctx, L.old.mul); }
  ctx.globalAlpha = fade; drawLayer(ctx, L.mul);
  ctx.globalCompositeOperation = 'screen'; drawLayer(ctx, L.scr);
  ctx.restore();
  if (p.lamp) glow(ctx, LAMP.x + 14, Y(LAMP.d) - 62, 70, '255,206,130', 0.55 * p.lamp * (1 + 0.04 * Math.sin(TT * 2.3)));
  if (p.fireflies) fireflies(TT); else motes(ctx, TT, SCENE_W, H * 0.8, 8, 91, p.motes);
  drawFX();
}

// ---------- input ----------
function toScene(e) { const r = cv.getBoundingClientRect(); return [(e.clientX - r.left) / r.width * SCENE_W, (e.clientY - r.top) / r.height * V.H]; }
let press = null;          // a press on Parker: short = tap, held or rubbed = belly rub
function onParker(x, y) { const [px, py] = parkerCenter(), s = depthScale(P.d); return ((x - px) / (70 * s)) ** 2 + ((y - py) / (62 * s)) ** 2 < 1; }
cv.addEventListener('pointerdown', e => {
  const [x, y] = toScene(e);
  // dandelions first (nearest head within reach), front-most wins
  let best = null, bd = 30;
  for (const f of S.field) { const s = depthScale(f.d), hx = f.x, hy = Y(f.d) - 36 * s, dd = Math.hypot(x - hx, y - hy); if (dd < bd && Clock.now() - f.born > 600) { bd = dd; best = f; } }
  if (best) return collect(best);
  if (P.present && onParker(x, y)) { press = { id: e.pointerId, t0: TT, x, y, dist: 0, rub: false }; try { cv.setPointerCapture(e.pointerId); } catch (err) { } return; }
  if (tapBird(x, y)) return;
  const mb = Y(MAILBOX.d);
  if (x > MAILBOX.x - 42 && x < MAILBOX.x + 42 && y > mb - 136 && y < mb - 70) return openPanel('mail');
  const hb = Y(HOUSE.d);
  if (x > HOUSE.x - 14 && x < HOUSE.x + 200 && y > hb - 150 && y < hb + 6) return openPanel('shelf');
});
cv.addEventListener('pointermove', e => {
  if (!press || e.pointerId !== press.id) return;
  const [x, y] = toScene(e); press.dist += Math.hypot(x - press.x, y - press.y); press.x = x; press.y = y;
});
cv.addEventListener('pointerup', e => { if (!press || e.pointerId !== press.id) return; press.rub ? endBelly() : tapParker(); press = null; });
cv.addEventListener('pointercancel', () => { if (press && press.rub) endBelly(); press = null; });
function checkRub() {
  if (!press || press.rub || /sleep|nap|stir|packup|departLook|arrive|gift/.test(P.mode) || P.pack) return;
  if (TT - press.t0 > HABITS.bellyRub.hold || press.dist > HABITS.bellyRub.rubDistance) {
    press.rub = true; setMode('belly', null, { nextHeart: TT + 0.3 });
    const [hx, hy] = parkerCenter(); fx({ type: 'glow', x: hx, y: hy, life: 0.6, r: 60, rgb: '255,240,200' });
  }
}
function endBelly() { if (P.mode === 'belly') setMode('belly', HABITS.bellyRub.endTime, { ending: true }); }
// small things that happen during a mode: hearts while his belly is rubbed, the breath cloud of a sigh
function parkerExtras() {
  if (P.mode === 'belly' && !P.data.ending && TT > P.data.nextHeart) {
    P.data.nextHeart = TT + 0.7; const [hx, hy] = parkerCenter();
    fx({ type: 'spr', key: 'heart', x: hx + (Math.random() - 0.5) * 50, y: hy - 30, vy: -30, sway: Math.random() * TAU, life: 1.3 });
  }
  if (P.mode === 'sigh' && !P.data.puffed && TT - P.t0 > HABITS.sighTime * 0.48) {
    P.data.puffed = true; SFX.sigh(); const s = depthScale(P.d), lie = P.data.lie;
    fx({ type: 'spr', key: 'puff', x: P.x + (lie ? 62 : 44) * P.face * s, y: Y(P.d) - (lie ? 28 : 70) * s, vx: 16 * P.face, vy: -6, grow: true, life: 1.6 });
  }
}

// ---------- HUD ----------
function hudTarget() { const a = document.getElementById('coinIcon').getBoundingClientRect(), r = cv.getBoundingClientRect(); return [(a.left + a.width / 2 - r.left) / r.width * SCENE_W, (a.top + a.height / 2 - r.top) / r.height * V.H]; }
function updateHUD(bump) {
  const el = document.getElementById('coinCount'); el.textContent = shown;
  if (bump) { const pill = document.getElementById('coins'); pill.classList.remove('bump'); void pill.offsetWidth; pill.classList.add('bump'); }
}
function drawCoinIcon() {
  const c = document.getElementById('coinIcon'), dpr = window.devicePixelRatio || 1, s = 26;
  c.width = s * dpr; c.height = s * dpr; const x = c.getContext('2d'); x.scale(dpr, dpr); x.translate(s / 2 - 1, s / 2 + 36 * 0.95); x.scale(0.95, 0.95);
  const ring = (n, r, rx, ry, col) => { const p = new Path2D(); for (let i = 0; i < n; i++) { const a = i / n * TAU; p.addPath(ell(1 + Math.cos(a) * r, -36 + Math.sin(a) * r, rx, ry, a)); } piece(x, p, col, { mul: 0.4 }); };
  ring(14, 6.4, 4.4, 1.9, '#f6c22c'); ring(10, 3.6, 3.2, 1.6, '#fbd648'); piece(x, circ(1, -36, 2.4), '#eaa21c', { mul: 0.4 });
}
function applyLang() {
  document.documentElement.lang = LANG === 'zh' ? 'zh-CN' : 'en'; document.title = T_('title');
  document.querySelectorAll('[data-i18n]').forEach(el => el.textContent = T_(el.dataset.i18n));
  document.querySelectorAll('[data-i18n-aria]').forEach(el => el.setAttribute('aria-label', T_(el.dataset.i18nAria)));
}
const T_ = k => window.T(k);
document.getElementById('langBtn').addEventListener('click', () => { LANG = LANG === 'zh' ? 'en' : 'zh'; storeLang(LANG); applyLang(); if (UI.panel) renderPanel(); });
let toastTimer = 0;
function showToast(k, ms = 0) { const t = document.getElementById('toast'); t.dataset.i18n = k; t.textContent = T_(k); t.classList.remove('hidden'); clearTimeout(toastTimer); if (ms) toastTimer = setTimeout(hideToast, ms); }
function hideToast() { document.getElementById('toast').classList.add('hidden'); }

// ---------- boot ----------
function boot() {
  LANG = loadLang(); applyLang();
  for (const ev of ['pointerdown', 'pointerup', 'touchend', 'click', 'keydown']) addEventListener(ev, () => SFX.unlock(), true);   // iPhone only unlocks sound on touchend / click
  if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol)) {           // offline play (not available inside the preview frame)
    const hadOld = !!navigator.serviceWorker.controller; let reloading = false;
    navigator.serviceWorker.register('sw.js').then(reg => addEventListener('visibilitychange', () => { if (!document.hidden) reg.update().catch(() => { }); })).catch(() => { });
    // a new version finished downloading: reload once so the player sees it (not on the very first visit)
    navigator.serviceWorker.addEventListener('controllerchange', () => { if (hadOld && !reloading) { reloading = true; writeSave(S); location.reload(); } });
  }
  buildTextures(512);
  buildBar();
  const now = Clock.now();
  S = loadSave();
  if (!S) { S = defaultSave(now); for (let i = 0; i < START_DANDELIONS; i++) spawnDandelion(now + 400 + i * 350); S.nextSpawnAt = now + SPAWN_INTERVAL; writeSave(S); }
  if (debugOn()) { try { Clock.offset = +localStorage.getItem(CLOCK_KEY) || 0; } catch (e) { } }
  tickSpawns();
  advanceWorld(Clock.now());                 // whatever happened while the game was closed
  P.present = !S.trip;
  shown = S.dandelions; updateHUD(false); drawCoinIcon();
  if (!S.seenHint) setTimeout(() => { if (!S.seenHint) showToast('hint.tap'); }, 2500);
  TOD = currentTod(); layout();
  buildDebug(); wireDebugTaps();
  const pose = DEV.get('pose');
  if (pose) { if (pose === 'sleep') { P.x = BED[0]; P.d = BED[1]; P.face = 1; } setMode(pose, 9999); }
  else if (P.present && sleepTime()) { P.x = BED[0]; P.d = BED[1]; P.face = 1; setMode('sleep', rand(HABITS.duration.sleep)); }
  let t0 = performance.now(), last = t0, saveAt = 0, todAt = 0, rz = 0;
  addEventListener('resize', () => { clearTimeout(rz); rz = setTimeout(layout, 200); });
  addEventListener('visibilitychange', () => { if (document.hidden) writeSave(S); else tickSpawns(); });
  addEventListener('pagehide', () => writeSave(S));
  const loop = ts => {
    const dt = Math.min(0.05, (ts - last) / 1000); last = ts; TT += dt;
    Clock.tick(dt);
    if (TT > todAt) { todAt = TT + 1; worldTick(); const tod = currentTod(); if (tod !== TOD) { TOD = tod; buildStatic(tod); } }
    if (TT > saveAt) { saveAt = TT + 15; writeSave(S); }
    checkRub(); updateParker(dt); updateBall(dt); updateBird(dt); parkerExtras(); sleepZ(); updateFX(dt); drawScene();
    if (!window.READY) window.READY = true;
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);
  // warm up the common drawings while idle so the first walk doesn't hitch
  const warm = ['trot|0', 'trot|1', 'trot|2', 'trot|3', 'trot|4', 'trot|5', 'stand|calm', 'sit|calm|0|0', 'sit|blink|0|0', 'sniff|0', 'sniff|1', 'dand|yellow', 'dand|puff'];
  const idle = window.requestIdleCallback || (f => setTimeout(f, 60));
  const step = () => { const k = warm.shift(); if (k) { sprite(k); idle(step); } };
  idle(step);
}
// test hook (screenshots): advance the simulation deterministically
window.__advance = secs => { for (let i = 0; i < secs * 30; i++) { TT += 1 / 30; checkRub(); updateParker(1 / 30); updateBall(1 / 30); updateBird(1 / 30); parkerExtras(); updateFX(1 / 30); } drawScene(); };
// ---------- world events (trips, mail) ----------
function worldTick() {
  tickSpawns();
  for (const e of advanceWorld(Clock.now())) {
    const live = Clock.now() - e.at < 2500 * Clock.speed;
    if (e.type === 'leave') { if (live && P.present) startDeparture(); else P.present = false; showToast('toast.left', 3500); }
    if (e.type === 'card') { showToast('toast.mail', 4000); SFX.mail(); fx({ type: 'glow', x: MAILBOX.x, y: Y(MAILBOX.d) - 106, life: 1.2, r: 60, rgb: '255,236,170' }); }
    if (e.type === 'home') {
      if (live) startArrival(); else { P.present = true; P.pack = false; P.x = 236; P.d = 150; P.face = -1; setMode('sit', 5); }
      showToast(e.souvenir ? 'toast.souvenir' : 'toast.home', 4500);
      if (e.souvenir) fx({ type: 'glow', x: HOUSE.x + 60, y: Y(HOUSE.d) - 50, life: 2, r: 90, rgb: '255,236,170' });
    }
  }
  if (!P.present) birdTick();
  festGiftTick();
  if (window.debugRefresh) debugRefresh();
}
// ---------- festival cards handed over in person ----------
function festGiftTick() {
  const f = S.festPending; if (!f || S.trip || !P.present || (typeof UI !== 'undefined' && UI.panel)) return;
  if (P.mode === 'gift' || (P.carrying && /trot|turn/.test(P.mode))) return;
  if (/^(sleep|nap|stir)$/.test(P.mode)) { if (!P.giftHinted) { P.giftHinted = true; showToast('toast.giftLater', 4500); } return; }   // he'll give it when he's up
  if (P.pack || !/^(sit|lie|look|sniff|trot|sigh|eat|expect|watch|wag|tilt|hop|drowsy)$/.test(P.mode)) return;
  if (P.hold === 'duck') S.toyPos.duck = { x: clamp(P.x + 30 * P.face, 30, 370), d: P.d };
  if (P.hold === 'bone') S.toyPos.bone = { x: clamp(P.x + 60 * P.face, 30, 370), d: P.d };
  P.hold = null; P.carrying = true;
  goTo(200, 160, () => { setMode('gift', null); showToast('toast.gift', 6000); });
}
function receiveGift() {
  const f = S.festPending; if (!f) return;
  addFestCard(f.id, f.year); S.festPending = null; P.carrying = false; P.giftHinted = false; writeSave(S);
  SFX.mail(); const [hx, hy] = parkerCenter(); fx({ type: 'glow', x: hx, y: hy - 20, life: 0.8, r: 80, rgb: '255,236,170' });
  for (let i = 0; i < 3; i++) fx({ type: 'spr', key: 'heart', x: hx + (i - 1) * 22, y: hy - 40, vx: (i - 1) * 8, vy: -34, delay: i * 0.18, sway: i, life: 1.4 });
  setMode('sigh', HABITS.sighTime, { lie: false }); showToast('toast.giftGot', 3000);
  UI.tab = 'fests'; openPanel('album'); UI.view = festCard(f.id); UI.viewYear = f.year; renderPanel();
}
// ---------- the bird (only while he's away) ----------
const BIRD = { on: false, next: 0 };
function birdPerches() { return [[150 + Math.random() * 60, Y(296) - 34], [MAILBOX.x - 6, Y(MAILBOX.d) - 128], [60 + Math.random() * 280, Y(100 + Math.random() * 110)]]; }
function birdTick() {
  if (BIRD.on || TT < BIRD.next) return;
  const [tx, ty] = birdPerches()[Math.floor(Math.random() * 3)], from = Math.random() < 0.5 ? -30 : SCENE_W + 30;
  Object.assign(BIRD, { on: true, phase: 'in', x0: from, y0: ty - 160, tx, ty, x: from, y: ty - 160, t0: TT, face: Math.sign(tx - from), until: TT + rand([8, 16]), pose: 0, poseAt: 0 });
}
function updateBird(dt) {
  if (!BIRD.on) return;
  if (P.present && BIRD.phase !== 'out') birdLeave();
  const u = clamp((TT - BIRD.t0) / 1.6), e = smooth(u);
  if (BIRD.phase === 'in') { BIRD.x = lerp(BIRD.x0, BIRD.tx, e); BIRD.y = lerp(BIRD.y0, BIRD.ty, e) - Math.sin(Math.PI * u) * 30; if (u >= 1) { BIRD.phase = 'stay'; BIRD.t0 = TT; } }
  else if (BIRD.phase === 'stay') { if (TT > BIRD.poseAt) { BIRD.pose = Math.random() < 0.45 ? 1 : 0; BIRD.poseAt = TT + rand([0.4, 1.2]); if (Math.random() < 0.25) BIRD.face *= -1; } if (TT > BIRD.until) birdLeave(); }
  else { BIRD.x = lerp(BIRD.x0, BIRD.tx, e); BIRD.y = lerp(BIRD.y0, BIRD.ty, e); if (u >= 1) { BIRD.on = false; BIRD.next = TT + rand(TRIP.birdEvery); } }
}
function birdLeave() { Object.assign(BIRD, { phase: 'out', x0: BIRD.x, y0: BIRD.y, tx: BIRD.x + BIRD.face * 260, ty: BIRD.y - 220, t0: TT }); }
function tapBird(x, y) { if (!BIRD.on || BIRD.phase !== 'stay' || Math.hypot(x - BIRD.x, y - (BIRD.y - 14)) > 30) return false; BIRD.face = x < BIRD.x ? 1 : -1; birdLeave(); return true; }
function drawVisitor() {
  if (!BIRD.on) return;
  const k = BIRD.phase !== 'stay' ? 2 + Math.floor(TT * 12) % 2 : BIRD.pose;
  drawSprite(sprite(`bird|${k}`), BIRD.x, BIRD.y, { sx: BIRD.face, scale: 0.8 });
}
boot();
