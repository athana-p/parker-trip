// ================= GAME: home (stage 1) =================
const SPAWN_INTERVAL = 4 * 60 * 1000, FIELD_CAP = 12, PUFF_CHANCE = 0.15, START_DANDELIONS = 5;
const K_DOG = 0.55;                                   // puppet scale in the yard
const DEV = new URLSearchParams(location.search);     // dev: ?tod=night  ?pose=sleep  ?debug=1 (debug panel)

const cv = document.getElementById('scene'), ctx = cv.getContext('2d');
const V = { H: 700, res: 2, cssW: 1, cssH: 1, k: 1 };
const Y = d => V.H - d;
let S = null, TT = 0, LAY = null, TOD = null, WX = null, shown = 0;

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
  sit: a => [c => drawSitB(c, a[0], +a[1], { headRot: +a[2], headDy: +(a[3] || 0), pack: a[4] === 'pack', mouth: ['duck', 'card', 'simit'].includes(a[4]) ? a[4] : null }), BOX_SIT, K_DOG],
  item: a => [c => drawItem(c, a[0], +a[1]), { w: 44, h: 44, ox: 22, oy: 22 }, 1, false],
  bow: a => [c => drawPlayBowB(c, a[0], { wag: +(a[1] || 0) }), BOX_BOW, K_DOG],
  dust: a => [c => tornPiece(c, ellipsePts(0, 0, 3 + (+a[1]), 2 + (+a[1]) * 0.6, 10), a[0], { amp: 0.5, seed: 30 + (+a[1]), rim: 0, shadow: 0.15, mul: 0.3 }), { w: 14, h: 12, ox: 7, oy: 6 }, 1, false],
  bird: a => [c => drawBird(c, +a[0]), { w: 60, h: 60, ox: 30, oy: 48 }, 1, false],
  ncat: a => [c => drawNeighborCat(c, a[0]), BOX_NCAT, 0.62],
  sq: a => [c => drawSquirrel(c, a[0]), BOX_SQ, 0.66],
  gift: a => [c => drawGift(c, a[0]), BOX_GIFT, 1.25, false],
  giftbox: () => [c => drawGiftBox(c), BOX_GIFTBOX, 1.2, false],
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
  shake: a => [c => drawShakeB(c, +a[0]), BOX_SHAKE, K_DOG],
  flat: a => [c => drawFlatB(c, +a[0]), BOX_FLAT, K_DOG],
  drop: () => [c => { const p = new Path2D(); p.moveTo(0, -4.5); p.quadraticCurveTo(3.4, 1, 0, 4); p.quadraticCurveTo(-3.4, 1, 0, -4.5); piece(c, p, '#8fcdef', { mul: 0.35 }); }, { w: 12, h: 14, ox: 6, oy: 7 }, 1, false],
  flake: () => [c => tornPiece(c, ellipsePts(0, 0, 3.4, 3, 14), '#ffffff', { amp: 0.6, seed: 905, rimCol: '#ffffff', shadow: 0.2, mul: 0.2 }), { w: 14, h: 14, ox: 7, oy: 7 }, 1, false],
  seed: () => [c => { c.strokeStyle = '#fff'; c.lineWidth = 0.8; c.beginPath(); c.moveTo(0, 4); c.lineTo(0, -3); c.stroke(); for (let i = -2; i <= 2; i++) { c.beginPath(); c.moveTo(0, -3); c.lineTo(i * 1.8, -6); c.stroke(); } }, { w: 12, h: 14, ox: 6, oy: 7 }, 1, false],
};
const SPR = new Map();
function sprite(key) {
  let s = SPR.get(key);
  if (!s) {
    const sn = key.endsWith('|sn'), a = (sn ? key.slice(0, -3) : key).split('|'), [fn, box, k, stick] = SPRITES[a[0]](a.slice(1));
    HEAD_SNOW = sn; try { s = makeSprite(fn, box, k, stick); } finally { HEAD_SNOW = false; }      // |sn = a dab of snow on his nose
    SPR.set(key, s); if (SPR.size > 72) SPR.delete(SPR.keys().next().value);
  }
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
  const p = wxPalette(PALETTES[tod], WX), old = LAY, look = WX.look;
  const L = { tod, look, sky: buildSky(p, V.H, V.res), clouds: cloudSprites(p, V.res), mul: buildMulOverlay(p, V.H), scr: buildScrOverlay(p, V.H), p };
  const same = old && old.look === look;            // the yard only changes with the season (and snow on the ground)
  L.yard = same ? old.yard : buildYard(V.H, V.res, look);
  L.fore = same ? old.fore : buildFore(V.H, V.res, look);
  if (old) { L.old = old; L.fadeT0 = TT; old.old = null; }
  LAY = L;
}
const weatherNow = () => weatherAt(Clock.now());
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
  if (P.wet) return shakeOff();
  if (!asleep && S.gifts.length) w.sniffgift = HABITS.giftSniff;
  const rule = !asleep && !company && HABITS.weather[WX.hot ? 'hot' : WX.kind];
  if (rule && !P.want) {
    for (const k in w) w[k] *= rule.calm;
    for (const k in rule.add) if (k !== 'sunbathe' || tod === 'morning' || tod === 'day') w[k] = rule.add[k];
  }
  const k = P.want && S.toys.includes(P.want) && !asleep ? P.want : pickWeighted(w); P.want = null;
  if (k === 'ball') return playBall(0);
  if (k === 'duck') { const t = S.toyPos.duck, side = Math.sign(t.x - P.x) || 1; return goTo(clamp(t.x - 36 * side, 40, 360), t.d, () => faceThen(side, () => { P.hold = 'duck'; setMode('shake', HABITS.shakeTime); })); }
  if (k === 'bone') { const t = S.toyPos.bone, side = Math.sign(t.x - P.x) || 1; return goTo(clamp(t.x - 64 * side, 40, 360), clamp(t.d, 100, 224), () => faceThen(side, () => { P.hold = 'bone'; setMode('chew', rand(HABITS.duration.chew)); })); }
  if (k === 'eat') return goTo(160, 226, () => faceThen(1, () => setMode('eat', rand(HABITS.duration.eat))));
  if (k === 'trot') { const [x, d] = randomSpot(); return goTo(x, d, Math.random() < 0.45 ? () => setMode('sniff', rand(HABITS.duration.sniff)) : null); }
  if (k === 'sigh') return setMode('sigh', HABITS.sighTime, { lie: false });
  if (WX_ACTS[k]) return WX_ACTS[k]();
  if (k === 'sniffgift') { const g = S.gifts[Math.floor(Math.random() * S.gifts.length)], side = Math.sign(g.x - P.x) || 1; return goTo(clamp(g.x - 46 * side, 40, 360), clamp(g.d, 100, 224), () => faceThen(side, () => setMode('sniff', rand([2.5, 4])))); }
  if (k === 'sleep') { if (Math.hypot(P.x - BED[0], P.d - BED[1]) > 6) return goTo(BED[0], BED[1], () => faceThen(1, () => setMode('sleep', rand(HABITS.duration.sleep)))); return setMode('sleep', rand(HABITS.duration.sleep)); }
  setMode(k, rand(HABITS.duration[k]));
}
function faceThen(f, then) { if (f === P.face) then(); else setMode('turn', 2 / 12, { to: f, then }); }
function goTo(x, d, then, o = {}) { const f = Math.sign(x - P.x) || P.face; faceThen(f, () => setMode('trot', null, { x, d, then, ...o })); }
// you picked a toy from his toy list: he goes to play with it (waking up first if he was asleep)
function toyWeatherOk(id) { const w = ITEM[id] && ITEM[id].weather; return !w || (w === 'wind' ? WX.kind === 'wind' : WX.kind === 'sunny' && WX.season !== 'winter'); }
function playToy(id) {
  if (!P.present || P.pack || /packup|departLook|arrive|gift/.test(P.mode)) return;
  if (TOY_START[id]) return TOY_START[id]();
  wakeThen(() => { P.want = id; pickNext(); });
}
const TOY_START = {};                    // toys that start with a tap of yours (filled in by each toy below)
// asleep when you want to play: he wakes slowly first (stretchy blink), then joins in. Returns true if he had to wake.
function wakeThen(fn) {
  if (!/^(sleep|nap|stir|sunnap|sunbelly)$/.test(P.mode)) { fn(); return false; }
  if (sleepTime()) P.awakeUntil = TT + HABITS.companyTime;        // up at night to play: stays up a while, like when you wake him
  setMode('drowsy', 1.8, { then: fn }); const [hx, hy] = parkerCenter(); fx({ type: 'glow', x: hx, y: hy, life: 0.8, r: 70, rgb: '255,240,200' });
  return true;
}
// a little puff of paper dust where he lands
function dustPuff(x, y, n = 6) {
  const col = WX.look === 'snow' ? '#f4f7fb' : WX.look === 'autumn' ? '#d9c08a' : '#d8c9a4';
  for (let i = 0; i < n; i++) { const a = (i / (n - 1) - 0.5) * 2.6; fx({ type: 'spr', key: `dust|${col}|${i % 2}`, x: x + Math.sin(a) * 10, y: y - 2, vx: Math.sin(a) * 46, vy: -18 - Math.random() * 16, g: 70, life: 0.5 + Math.random() * 0.2, rot: a }); }
}
// ---- weather behaviours (stage 3) ----
const SHELTER = [118, 244], SHADE = [100, 238];
const isLying = () => /lie|sleep|nap|stir|belly|chew|flat/.test(P.mode) || (P.mode === 'sigh' && P.data.lie);
const WX_ACTS = {
  shelter: () => goTo(SHELTER[0], SHELTER[1], () => faceThen(1, () => setMode('shelter', rand(HABITS.wxTime.shelter)))),
  splash: () => { const [x, d] = randomSpot(); goTo(clamp(x, 170, 350), Math.min(d, 190), () => { P.wet = true; setMode('wet', rand(HABITS.wxTime.wet)); }); },
  sunbathe: () => goTo(200 + Math.random() * 140, 110 + Math.random() * 70, () => faceThen(Math.random() < 0.5 ? 1 : -1, () => setMode('sunnap', rand(HABITS.wxTime.sunnap)))),
  flat: () => goTo(SHADE[0], SHADE[1], () => faceThen(1, () => setMode('flat', rand(HABITS.wxTime.flat)))),
  chase: () => {
    const dir = P.x < 200 ? 1 : -1, y = Y(P.d) - 58 * depthScale(P.d);
    faceThen(dir, () => { Object.assign(CHASE, { on: true, leaving: false, x: P.x + 30 * dir, y0: y, y, vx: 104 * dir, vy: 0, rot: 0, i: Math.floor(Math.random() * 3), season: WX.season }); setMode('chase', rand(HABITS.wxTime.chase), { dir }); });
  },
  snap: () => setMode('snap', HABITS.wxTime.snap, { hops: 0 }),
  snowwalk: () => { const a = randomSpot(), b = randomSpot(); goTo(a[0], a[1], () => goTo(b[0], b[1], () => setMode('look', rand(HABITS.duration.look)))); },
  fogsniff: () => {
    const step = n => { const [x, d] = randomSpot(); goTo(clamp(P.x + (x - P.x) * 0.5, 40, 360), d, () => setMode('sniff', rand([2.5, 4]), { next: n > 1 ? () => step(n - 1) : null }), { speed: HABITS.slowSpeed, slow: true }); };
    step(3);
  },
};
function shakeOff() { goTo(SHELTER[0], SHELTER[1], () => faceThen(1, () => { setMode('shakeoff', HABITS.wxTime.shakeOff); SFX.shake(); const [hx, hy] = parkerCenter(); for (let i = 0; i < 10; i++) { const a = -Math.PI * (0.1 + 0.8 * i / 9); fx({ type: 'spr', key: 'drop', x: hx, y: hy - 10, vx: Math.cos(a) * 90, vy: Math.sin(a) * 70, g: 220, life: 0.7, rot: a + Math.PI / 2 }); } })); }
// snapping at snowflakes: three little hops, a flake caught at the top of each
function snapTick() {
  const u = (TT - P.t0) / (HABITS.wxTime.snap / 3), n = Math.floor(u);
  if (n > P.data.hops - 1 && u - n > 0.45 && n < 3) {
    P.data.hops = n + 1; const s = depthScale(P.d), mx = P.x + 34 * P.face * s, my = Y(P.d) - 118 * s;
    fx({ type: 'spr', key: 'flake', x: mx + 6 * P.face, y: my - 22, vy: 30, life: 0.35, grow: false }); fx({ type: 'glow', x: mx, y: my, life: 0.35, r: 18, rgb: '255,255,255' });
  }
}
const CHASE = { on: false };
function updateChase(dt) {
  if (!CHASE.on) return;
  if (!CHASE.leaving && P.mode !== 'chase') { CHASE.leaving = true; CHASE.vy = -40; }
  CHASE.x += CHASE.vx * dt; CHASE.rot += 6 * dt * Math.sign(CHASE.vx);
  if (CHASE.leaving) { CHASE.vy -= 60 * dt; CHASE.y += CHASE.vy * dt; if (CHASE.y < -30 || CHASE.x < -40 || CHASE.x > SCENE_W + 40) CHASE.on = false; }
  else CHASE.y = CHASE.y0 + 14 * Math.sin(TT * 5) - 10 * Math.sin(TT * 1.7);
}
// paw prints in the snow
const PRINTS = [];
function leavePrint() {
  P.walked = 0; P.printSide = !P.printSide; const s = depthScale(P.d);
  PRINTS.push({ x: P.x + (P.printSide ? 18 : -26) * P.face * s, d: P.d + (P.printSide ? -2.5 : 2.5), t: TT, s });
  if (PRINTS.length > 70) PRINTS.shift();
}
function drawPrints() {
  if (!PRINTS.length) return;
  ctx.save(); ctx.fillStyle = 'rgb(136,154,186)';
  for (const p of PRINTS) {
    const a = 0.7 * clamp(1 - (TT - p.t) / 70); if (a <= 0) continue;
    const x = p.x, y = Y(p.d) - 1, s = p.s * 0.75; ctx.globalAlpha = a;
    ctx.beginPath(); ctx.ellipse(x, y, 6 * s, 3 * s, 0, 0, TAU); for (const dx of [-6, -2, 2, 6]) ctx.ellipse(x + dx * s, y - 4.6 * s + Math.abs(dx) * 0.4 * s, 2 * s, 1.4 * s, 0, 0, TAU); ctx.fill();
  }
  ctx.restore();
}
function updateParker(dt) {
  if (!P.present) return;
  if (P.mode === 'trot') {
    const dx = P.data.x - P.x, dd = P.data.d - P.d, L = Math.hypot(dx, dd), step = (P.data.speed || HABITS.trotSpeed) * dt;
    if (WX.look === 'snow' && (P.walked = (P.walked || 0) + Math.min(step, L)) > HABITS.printEvery) leavePrint();
    if (L <= step) { P.x = P.data.x; P.d = P.data.d; const then = P.data.then; then ? then() : pickNext(); }
    else { P.x += dx / L * step; P.d += dd / L * step; }
    return;
  }
  if (P.mode === 'chase') {
    const tx = CHASE.x - 52 * P.data.dir, step = HABITS.chaseSpeed * dt;
    P.x += clamp(tx - P.x, -step, step);
    if (WX.look === 'snow' && (P.walked = (P.walked || 0) + step) > HABITS.printEvery) leavePrint();
    if (P.x < 40 || P.x > 360) P.until = Math.min(P.until, TT);
  }
  if (P.mode === 'wet' && TT > (P.dripAt || 0)) { P.dripAt = TT + 0.25; const [hx, hy] = parkerCenter(); fx({ type: 'spr', key: 'drop', x: hx + (Math.random() - 0.5) * 50, y: hy + 10, vy: 30, g: 200, life: 0.5, rot: 0 }); }
  if (P.mode === 'snap') snapTick();
  if (TT < P.until) return;
  if (P.mode === 'turn') { P.face = P.data.to; P.data.then(); }
  else if (P.mode === 'watch') P.data.next();
  else if (P.mode === 'stir') setMode(P.data.back, P.data.left);
  else if (P.mode === 'packup') setMode('departLook', 1.7);
  else if (P.mode === 'drowsy') { const then = P.data.then; if (then) then(); else { setMode('wag', HABITS.reactionTime.wag); SFX.pop(); } }
  else if (P.mode === 'departLook') goTo(480, P.d, () => { P.present = false; P.pack = false; setMode('away'); });
  else if (P.mode === 'arrive') { P.pack = false; setMode('sigh', HABITS.sighTime, { lie: false }); }
  else if (P.mode === 'nudge') kickBall();
  else if (P.mode === 'shake') { S.toyPos.duck = { x: clamp(P.x + 34 * P.face, 30, 370), d: clamp(P.d - 6, 96, 226) }; P.hold = null; writeSave(S); setMode('sigh', HABITS.sighTime, { lie: false }); }
  else if (P.mode === 'chew') { S.toyPos.bone = { x: clamp(P.x + 64 * P.face, 30, 370), d: P.d }; P.hold = null; writeSave(S); setMode('sigh', HABITS.sighTime, { lie: true }); }
  else if (P.mode === 'belly') setMode('sigh', HABITS.sighTime, { lie: true });
  else if (/^cat(boop|bow|side)$/.test(P.mode)) catPlayEnd();
  else if (P.mode === 'wet') shakeOff();
  else if (P.mode === 'shakeoff') { P.wet = false; setMode('sigh', HABITS.sighTime, { lie: false }); }
  else if (P.mode === 'sunnap') { setMode('sunbelly', HABITS.wxTime.sunbelly); fx({ type: 'glow', x: P.x, y: Y(P.d) - 30, life: 0.8, r: 70, rgb: '255,236,180' }); }
  else if (P.mode === 'sunbelly') setMode('sigh', HABITS.sighTime, { lie: true });
  else if (P.mode === 'chase') { setMode('hop', HABITS.reactionTime.hop); SFX.pop(); }
  else if (P.mode === 'snap') { P.noseSnowUntil = TT + HABITS.noseSnow; setMode('tilt', HABITS.reactionTime.tilt + 0.6); }
  else if (P.mode === 'sniff' && P.data.next) P.data.next();
  else if (P.mode === 'sigh') P.data.lie ? setMode('lie', rand(HABITS.duration.lie)) : setMode('sit', rand([3, 6]));
  else if (HABITS.reactions.includes(P.mode)) Math.random() < HABITS.sighAfterHappy ? setMode('sigh', HABITS.sighTime, { lie: false }) : setMode('sit', rand([3, 6]));
  else pickNext();
}
// ---- toys, departure, arrival, the bag rustle ----
const BALL = { vx: 0, vd: 0, rot: 0 }, BALL_X = [36, 364], BALL_D = [96, 228], BALL_DRAG = 110;
// each push aims the ball at an open spot somewhere else in the yard: he walks round to the far side and
// nudges it that way (before, he always pushed it away from himself, so it drifted into a corner and stayed there)
function playBall(n) {
  const t = S.toyPos.ball; t.x = clamp(t.x, ...BALL_X); t.d = clamp(t.d, ...BALL_D);
  let to = null;
  for (let i = 0; i < 30 && !to; i++) { const x = rand([60, 340]), d = rand([104, 220]); if (Math.abs(x - t.x) > 80 && Math.hypot(x - t.x, d - t.d) < 230) to = { x, d }; }
  if (!to) to = { x: t.x < 200 ? 260 : 140, d: 160 };
  const side = Math.sign(to.x - t.x) || 1;
  goTo(clamp(t.x - 34 * side, 8, 392), clamp(t.d, 100, 224), () => faceThen(side, () => setMode('nudge', 0.45, { n, to })));
}
function kickBall() {
  const t = S.toyPos.ball, to = P.data.to || { x: t.x + 80 * P.face, d: t.d }, n = P.data.n + 1;
  const dx = to.x - t.x, dd = to.d - t.d, L = Math.hypot(dx, dd) || 1, sp = clamp(Math.sqrt(2 * BALL_DRAG * L) * rand([0.9, 1.08]), 70, 230);   // just enough to roll about that far
  BALL.vx = dx / L * sp; BALL.vd = dd / L * sp;
  fx({ type: 'glow', x: t.x, y: Y(t.d) - 10, life: 0.4, r: 24, rgb: '255,240,200' });
  if (n < HABITS.ballRounds) setMode('watch', 0.6 + L / sp, { next: () => playBall(n) }); else setMode('watch', 1.2, { next: () => setMode('sigh', HABITS.sighTime, { lie: false }) });
}
function updateBall(dt) {
  const t = S.toyPos.ball; if (!t) return;
  const v = Math.hypot(BALL.vx, BALL.vd); if (v < 1) { BALL.vx = BALL.vd = 0; return; }
  const k = Math.max(0, v - BALL_DRAG * dt) / v; BALL.vx *= k; BALL.vd *= k;
  t.x += BALL.vx * dt; t.d += BALL.vd * dt; BALL.rot += BALL.vx * dt / 9;
  if (t.x < BALL_X[0] || t.x > BALL_X[1]) { BALL.vx *= -0.6; t.x = clamp(t.x, ...BALL_X); }
  if (t.d < BALL_D[0] || t.d > BALL_D[1]) { BALL.vd *= -0.6; t.d = clamp(t.d, ...BALL_D); }
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
    case 'trot': key = `trot|${(P.data.slow ? Math.floor(f / 2) : f) % 6}${pk}`; break;
    case 'chase': key = `trot|${f % 6}`; break;
    case 'catboop': { const u = TT - P.t0; key = u > 0.7 && u < 2.1 ? 'sniff|1' : `stand|calm`; break; }   // nose to nose
    case 'catbow': key = `bow|pant|${f % 4 < 2 ? 0.25 : -0.2}`; break;
    case 'catside': key = (TT - P.t0) > 3 && (TT - P.t0) < 5 ? 'sit|content|0|0.07' : `sit|${open}|0|0`; break;
    case 'shelter': { const ph = Math.floor((TT - P.t0) / 3) % 3; key = `sit|${open}|0|${ph === 1 ? -0.16 : ph === 2 ? 0.1 : 0}`; break; }   // watching the rain, now and then looking up
    case 'wet': key = `look|${Math.floor(f / 6) % 2}`; break;
    case 'shakeoff': key = `shake|${f % 4 < 2 ? 0 : 1}`; sx = 1; break;
    case 'sunnap': { const b = [0, 1.2, 2.4, 1.2][Math.floor(TT / 0.9) % 4]; key = `lie|sleepy|${b}`; break; }
    case 'sunbelly': key = `belly|${Math.floor(f / 6) % 2}`; break;
    case 'flat': key = `flat|${Math.floor(TT * 4) % 2}`; break;
    case 'snap': { const u = ((TT - P.t0) / (HABITS.wxTime.snap / 3)) % 1; lift = 18 * Math.max(0, Math.sin(Math.PI * clamp((u - 0.15) / 0.6))); key = lift > 4 ? 'sit|happy|0|-0.34' : 'sit|calm|0|-0.24'; break; }
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
  if (P.noseSnowUntil > TT && !/^(shake|belly)/.test(key)) key += '|sn';
  return { key, sx, lift };
}
function parkerCenter() { const s = depthScale(P.d), lying = isLying(); return [P.x + (lying ? 20 : 4) * P.face * s, Y(P.d) - (lying ? 34 : 64) * s]; }

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
    if (p.type === 'spr') drawSprite(sprite(p.key), p.x, p.y, { alpha: Math.min(1, (1 - u) * 2.2), rot: p.rot, shA: 0.15, scale: (p.scale || 1) * (p.grow ? lerp(0.6, 1.5, u) : 1) });
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
  const cs = WX.kind === 'wind' ? 5 : 1;
  L.clouds.forEach((cl, i) => { const span = SCENE_W + 200, x = ((i * 157 + TT * cs * (3 + i * 1.5)) % span) - 100; drawLayer(ctx, cl, x, hz * [0.2, 0.42, 0.1][i]); });
  ctx.restore();
  if (L.old && L.old.yard !== L.yard) { drawLayer(ctx, L.old.yard); ctx.save(); ctx.globalAlpha = fade; drawLayer(ctx, L.yard); ctx.restore(); }   // the season / snow changes softly
  else drawLayer(ctx, L.yard);
  if (WX.hot) {           // cool shade in front of the house on a hot afternoon
    ctx.save(); ctx.globalCompositeOperation = 'multiply'; ctx.translate(SHADE[0] - 6, Y(SHADE[1] - 2)); ctx.scale(1, 0.2);
    const g = ctx.createRadialGradient(0, 0, 10, 0, 0, 110); g.addColorStop(0, 'rgba(150,170,205,0.6)'); g.addColorStop(0.6, 'rgba(170,186,214,0.35)'); g.addColorStop(1, 'rgba(190,200,220,0)');
    ctx.fillStyle = g; ctx.fillRect(-110, -110, 220, 220); ctx.restore();
  }
  drawPrints();
  const mail = S.mail.length > 0;
  if (mail) glow(ctx, MAILBOX.x, Y(MAILBOX.d) - 106, 46, '255,236,170', 0.35 + 0.1 * Math.sin(TT * 2));
  mailboxFlag(ctx, MAILBOX.x, Y(MAILBOX.d), mail);
  // ground things, back to front
  const items = S.field.map(f => ({ d: f.d, f }));
  for (const t of S.toys) if (P.hold !== t) items.push({ d: S.toyPos[t].d, toy: t });
  if (P.present) items.push({ d: P.d, parker: true });
  for (const g of S.gifts) items.push({ d: g.d, g });
  if (VIS.on && VIS.kind !== 'sparrow') items.push({ d: VIS.d, vis: true });
  items.push({ d: GIFTBOX.d, box: true });
  items.sort((a, b) => b.d - a.d);
  const now = Clock.now();
  for (const it of items) {
    if (it.g) {
      const g = it.g, s = depthScale(g.d), tw = 0.5 + 0.5 * Math.sin(TT * 1.6 + g.id);
      drawSprite(sprite(`gift|${g.kind}`), g.x, Y(g.d), { scale: s });
      if (tw > 0.85) glow(ctx, g.x + 5, Y(g.d) - 18 * s, 20, '255,250,225', (tw - 0.85) * 4);    // a little glint now and then
    } else if (it.vis) {
      const s = depthScale(VIS.d), dr = visitorDrawing();
      drawSprite(sprite(dr.key), VIS.x, Y(VIS.d) - dr.lift, { sx: VIS.face, scale: s });
    } else if (it.box) {
      if (S.giftNew) glow(ctx, GIFTBOX.x, Y(GIFTBOX.d) - 14, 34, '255,236,170', 0.35 + 0.1 * Math.sin(TT * 2));
      drawSprite(sprite('giftbox'), GIFTBOX.x, Y(GIFTBOX.d), { scale: depthScale(GIFTBOX.d) });
    } else if (it.toy) {
      const t = S.toyPos[it.toy], s = depthScale(t.d), k = { ball: 0.6, duck: 0.55, bone: 0.55 }[it.toy];
      drawSprite(sprite(`item|${it.toy}|${k}`), t.x, Y(t.d) - 11 * s, { scale: s, rot: it.toy === 'ball' ? BALL.rot : 0 });
    } else if (it.f) {
      const f = it.f, s = depthScale(f.d), grow = smooth(clamp((now - f.born) / 1200)), sw = 0.035 * Math.sin(TT * 1.1 + f.id * 1.7);
      if (grow > 0) drawSprite(sprite(`dand|${f.kind}`), f.x, Y(f.d), { scale: s * lerp(0.2, 1, grow), alpha: Math.min(1, grow * 3), rot: sw });
    } else {
      const s = depthScale(P.d), dr = parkerDrawing(), lying = isLying();
      const hk = 1 / (1 + dr.lift / 34);                               // the higher he jumps, the smaller and paler his shadow
      ctx.save(); ctx.globalCompositeOperation = 'multiply'; ctx.fillStyle = `rgba(120,110,120,${0.35 * hk})`;
      ctx.beginPath(); ctx.ellipse(P.x + (lying ? 14 * P.face : 0) * s, Y(P.d) + 1, (lying ? 70 : 52) * s * Math.max(0.6, Math.abs(dr.sx)) * (0.5 + 0.5 * hk), 6 * s * (0.5 + 0.5 * hk), 0, 0, TAU); ctx.fill(); ctx.restore();
      if ((P.prevLift || 0) > 5 && dr.lift < 1) dustPuff(P.x, Y(P.d));
      P.prevLift = dr.lift;
      drawSprite(sprite(dr.key), P.x, Y(P.d) - dr.lift, { sx: dr.sx, scale: s });
      if (P.mode === 'turn') glow(ctx, P.x, Y(P.d) - 50 * s, 46, '255,240,200', 0.5);
      if (P.carrying && P.mode !== 'gift') drawSprite(sprite('item|card|0.5'), P.x + 64 * P.face * s * Math.abs(dr.sx), Y(P.d) - 72 * s - dr.lift, { scale: s, rot: 0.15 * P.face });   // the card in his mouth on the way
      if (P.mode === 'gift') glow(ctx, P.x, Y(P.d) - 70 * s, 70, '255,236,170', 0.25 + 0.08 * Math.sin(TT * 2.5));
      if (/^sun/.test(P.mode)) glow(ctx, P.x + 14 * P.face * s, Y(P.d) - 30 * s, 84, '255,232,170', 0.3 + 0.05 * Math.sin(TT * 1.3));   // warm in the sun
    }
  }
  if (CHASE.on) drawBit(ctx, CHASE.season, CHASE.i, CHASE.x, CHASE.y, CHASE.rot, 1.9);
  drawVisitor();
  if (L.old && L.old.fore !== L.fore) { drawLayer(ctx, L.old.fore); ctx.save(); ctx.globalAlpha = fade; drawLayer(ctx, L.fore); ctx.restore(); }
  else drawLayer(ctx, L.fore);
  drawWeather(ctx, WX, H, TT, V.res);
  // light: multiply tint + vignette, then screen glow, lamp, motes
  ctx.save(); ctx.globalCompositeOperation = 'multiply';
  if (L.old) { ctx.globalAlpha = 1 - fade; drawLayer(ctx, L.old.mul); }
  ctx.globalAlpha = fade; drawLayer(ctx, L.mul);
  ctx.globalCompositeOperation = 'screen'; drawLayer(ctx, L.scr);
  ctx.restore();
  if (p.lamp) glow(ctx, LAMP.x + 14, Y(LAMP.d) - 62, 70, '255,206,130', 0.55 * p.lamp * (1 + 0.04 * Math.sin(TT * 2.3)));
  if (p.fireflies) fireflies(TT); else if (p.motes) motes(ctx, TT, SCENE_W, H * 0.8, 8, 91, p.motes);
  drawFX();
  drawSay();
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
  const g = giftAt(x, y); if (g) return pickGift(g);
  if (Math.abs(x - GIFTBOX.x) < 24 && y > Y(GIFTBOX.d) - 38 && y < Y(GIFTBOX.d) + 6) { S.giftNew = false; return openPanel('gifts'); }
  if (best) return collect(best);
  if (P.present && onParker(x, y)) { press = { id: e.pointerId, t0: TT, x, y, dist: 0, rub: false }; try { cv.setPointerCapture(e.pointerId); } catch (err) { } return; }
  if (tapVisitor(x, y)) return;
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
function toastText(text, ms) { const t = document.getElementById('toast'); delete t.dataset.i18n; t.textContent = text; t.classList.remove('hidden'); clearTimeout(toastTimer); if (ms) toastTimer = setTimeout(hideToast, ms); }
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
  if (debugOn()) { try { Clock.offset = +localStorage.getItem(CLOCK_KEY) || 0; } catch (e) { } loadWxForce(); }
  const lastSeen = S.lastSeen || now;
  tickSpawns();
  advanceWorld(Clock.now());                 // whatever happened while the game was closed
  const waiting = offlineVisits(lastSeen, Clock.now());
  P.present = !S.trip;
  shown = S.dandelions; updateHUD(false); drawCoinIcon();
  if (!S.seenHint) setTimeout(() => { if (!S.seenHint) showToast('hint.tap'); }, 2500);
  else if (waiting) setTimeout(() => showToast('toast.giftsWaiting', 4000), 1800);
  TOD = currentTod(); WX = weatherNow(); SFX.weather(WX); layout();
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
    if (TT > todAt) { todAt = TT + 1; worldTick(); wxCheck(); }
    if (TT > saveAt) { saveAt = TT + 15; writeSave(S); }
    checkRub(); updateParker(dt); updateBall(dt); updateVisitor(dt); updateChase(dt); updateWeather(dt, WX, V.H, TT); parkerExtras(); catPlayTick(); sayTick(); sleepZ(); updateFX(dt); drawScene();
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
window.__advance = secs => { for (let i = 0; i < secs * 30; i++) { TT += 1 / 30; checkRub(); updateParker(1 / 30); updateBall(1 / 30); updateVisitor(1 / 30); updateChase(1 / 30); updateWeather(1 / 30, WX, V.H, TT); parkerExtras(); catPlayTick(); sayTick(); updateFX(1 / 30); } drawScene(); };
// time of day or weather changed: rebuild the backdrop (it cross-fades), switch the weather sounds
function wxCheck() {
  const tod = currentTod(), wx = weatherNow();
  if (tod === TOD && wx.key === WX.key) return;
  if (wx.look !== WX.look) PRINTS.length = 0;
  TOD = tod; WX = wx; buildStatic(tod); SFX.weather(wx);
}
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
  visitTick();
  festGiftTick();
  if (window.debugRefresh) debugRefresh();
}
// ---------- festival cards handed over in person ----------
function festGiftTick() {
  const f = S.festPending; if (!f || S.trip || !P.present || (typeof UI !== 'undefined' && UI.panel)) return;
  if (P.mode === 'gift' || (P.carrying && /trot|turn/.test(P.mode))) return;
  if (/^(sleep|nap|stir)$/.test(P.mode)) { if (!P.giftHinted) { P.giftHinted = true; showToast('toast.giftLater', 4500); } return; }   // he'll give it when he's up
  if (P.pack || !/^(sit|lie|look|sniff|trot|sigh|eat|expect|watch|wag|tilt|hop|drowsy|shelter|flat|sunnap)$/.test(P.mode)) return;
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
// ---------- home from a trip: one short line in a little paper speech bubble above his head ----------
const SAY = { on: false };
function sayKey(h) {
  const pre = h.friend ? `say.fr.${h.friend}.` : `say.${h.dest}.`, ks = [1, 2, 3].map(i => pre + i).filter(k => STRINGS.zh[k]);
  return ks.length ? ks[Math.floor(Math.random() * ks.length)] : null;
}
function sayTick() {
  const h = S.homeSay;
  if (!h || SAY.on || !P.present || (typeof UI !== 'undefined' && UI.panel)) return;
  if (!/^(arrive|sit|sigh|look|sniff|wag|tilt|hop|lie|shelter|expect)$/.test(P.mode)) return;   // not while he's asleep or busy
  const key = sayKey(h); S.homeSay = null; writeSave(S);
  if (key) Object.assign(SAY, { on: true, key, t0: TT, until: TT + 4 + T_(key).length * (LANG === 'zh' ? 0.12 : 0.04), img: null, lang: null });
}
function bubblePts(w, h, r) {
  const pts = [], arc = (cx, cy, a0) => { for (let i = 0; i <= 4; i++) { const a = a0 + i / 4 * Math.PI / 2; pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]); } };
  arc(w - r, h - r, 0); arc(r, h - r, Math.PI / 2); arc(r, r, Math.PI); arc(w - r, r, Math.PI * 1.5); return pts;
}
function sayBubble(text) {
  const res = V.res, M = 8, maxW = 170, fs = 13, lh = 18, m = mk(1, 1).getContext('2d'); m.font = `600 ${fs}px ${FONT}`;
  // even-length lines (no lone last character), and a line never starts with punctuation
  const toks = LANG === 'zh' ? [...text] : text.split(/(?<= )/), lines = []; let line = '';
  const total = m.measureText(text).width, n = Math.ceil(total / maxW), lineW = n > 1 ? Math.min(maxW, total / n + fs * 0.6) : maxW;
  for (const t of toks) { if (line && !/^[，。！？、…,.!?]/.test(t) && m.measureText(line + t).width > lineW) { lines.push(line.trim()); line = t.trimStart(); } else line += t; }
  if (line.trim()) lines.push(line.trim());
  const w = Math.ceil(Math.max(...lines.map(l => m.measureText(l).width))) + 22, h = lines.length * lh + 14;
  const cv = mk((w + M * 2) * res, (h + M * 2) * res), c = cv.getContext('2d'); c.scale(res, res); c.translate(M, M);
  tornPiece(c, bubblePts(w, h, 9), '#fffaf0', { amp: 0.7, seed: 77, rimCol: '#ffffff', shadow: 0.22, mul: 0.3 });
  c.fillStyle = '#5b3f37'; c.font = `600 ${fs}px ${FONT}`; c.textAlign = 'center'; c.textBaseline = 'middle';
  lines.forEach((l, i) => c.fillText(l, w / 2, 7 + lh * (i + 0.5) + 0.5));
  return { cv, w, h, M };
}
function drawSay() {
  if (!SAY.on) return;
  if (TT > SAY.until + 0.35 || !P.present) { SAY.on = false; return; }
  if (!SAY.img || SAY.lang !== LANG) { SAY.img = sayBubble(T_(SAY.key)); SAY.lang = LANG; }
  const B = SAY.img, s = depthScale(P.d), lying = isLying(), dr = parkerDrawing();
  const [ox, oy] = lying ? [46, 74] : /^(trot|look|sniff|stand|watch|turn|chase|wet)$/.test(P.mode) ? [40, 124] : [20, 132];
  const tx = P.x + ox * P.face * s, ty = Y(P.d) - oy * s - dr.lift + 1.5 * Math.sin(TT * 2);
  const bx = clamp(tx - B.w / 2, 6, SCENE_W - B.w - 6), by = ty - 10 - B.h;
  const u = TT - SAY.t0, pop = [0.55, 0.85, 1.06, 1][Math.min(3, Math.floor(u * 12))];   // pops in on twos
  const a = TT > SAY.until ? clamp(1 - (TT - SAY.until) / 0.35) : 1;
  ctx.save(); ctx.globalAlpha = a; ctx.translate(tx, ty); ctx.scale(pop, pop); ctx.translate(-tx, -ty);
  const tail = poly([[clamp(tx - 7, bx + 10, bx + B.w - 18), by + B.h - 2], [clamp(tx + 5, bx + 20, bx + B.w - 8), by + B.h - 2], [tx + 2 * P.face, ty]]);
  castShadow(ctx, tail, 2, 1, 2, 0.18); piece(ctx, tail, '#fffaf0', { mul: 0.3 });
  ctx.drawImage(B.cv, bx - B.M, by - B.M, B.w + B.M * 2, B.h + B.M * 2);
  ctx.restore();
}
// ---------- small visitors: the sparrow, the neighbour's cat, the squirrel (stage 4) ----------
// One at a time. Mostly while he's away; nobody at night or in heavy rain. Some leave a gift where they were.
const VIS = { on: false, next: 25 };
const GIFTBOX = { x: 168, d: 249 };
const VIS_SPEED = { cat: 34, squirrel: 70 };
function birdPerches() { return [[150 + Math.random() * 60, Y(296) - 34, null], [MAILBOX.x - 6, Y(MAILBOX.d) - 128, null], ...[0, 1].map(() => { const d = 100 + Math.random() * 110; return [60 + Math.random() * 280, Y(d), d]; })]; }
function giftSpot(x0, d0) {             // a free spot on the lawn (near x0/d0 if given)
  for (let i = 0; i < 40; i++) {
    const x = x0 != null ? clamp(x0 + (Math.random() - 0.5) * (20 + i * 4), 30, 370) : 40 + Math.random() * 320, d = d0 != null ? clamp(d0 + (Math.random() - 0.5) * (10 + i * 2), 100, 220) : 100 + Math.random() * 120;
    if (spotFree(x, d) && S.gifts.every(g => Math.hypot(g.x - x, (g.d - d) * 1.6) > 30) && Math.hypot(x - GIFTBOX.x, d - GIFTBOX.d) > 30) return [x, d];
  }
  return [x0 != null ? clamp(x0, 30, 370) : 200, d0 != null ? clamp(d0, 100, 220) : 160];
}
function visitTick() {
  if (VIS.on || TT < VIS.next) return;
  const now = Clock.now();
  VIS.next = TT + rand(P.present ? VISIT.homeEvery : VISIT.awayEvery) * (WX.kind === 'rain' ? VISIT.rainSlow : 1);
  if (visitorsSleep(now) || WX.heavy || (P.present && /packup|departLook|arrive|gift/.test(P.mode))) return;
  startVisit(pickVisitor(now));
}
function startVisit(kind, forceGift) {
  const now = Clock.now(); S.visits[kind] = (S.visits[kind] || 0) + 1;
  const gift = forceGift || (canGift(now) && Math.random() < VISIT.giftChance) ? rollGift(kind, now) : null;
  const from = Math.random() < 0.5 ? -40 : SCENE_W + 40, stay = rand(VISIT.stay[kind]);
  if (kind === 'sparrow') {
    const ps = birdPerches(), [tx, ty, d] = ps[Math.floor(Math.random() * ps.length)];
    Object.assign(VIS, { on: true, kind, phase: 'in', x0: from, y0: ty - 160, tx, ty, x: from, y: ty - 160, d, t0: TT, face: Math.sign(tx - from), stay, pose: 0, poseAt: 0, gift });
    SFX.chirp();
  } else {
    let tx = 70 + Math.random() * 260, td = 110 + Math.random() * 100;
    if (P.present && Math.abs(tx - P.x) < 90) tx = clamp(P.x + (tx < P.x ? -110 : 110), 50, 350);
    Object.assign(VIS, { on: true, kind, phase: 'in', x: from, d: td, tx, t0: TT, face: Math.sign(tx - from), stay, pose: 'sit', poseAt: 0, gift });
    if (kind === 'squirrel') SFX.chitter();
  }
  writeSave(S);
  // he notices, and sits watching it
  if (P.present && /^(sit|lie|look|sniff)$/.test(P.mode)) faceThen(Math.sign(VIS.tx - P.x) || P.face, () => setMode('sit', rand([5, 9])));
}
function visitorLeave() {
  if (!VIS.on || VIS.phase === 'out') return;
  if (VIS.gift) {                         // the gift stays where it was
    const [x, d] = VIS.kind === 'sparrow' ? giftSpot(VIS.x, VIS.d != null ? VIS.d : 120 + Math.random() * 80) : giftSpot(VIS.x + 14 * VIS.face, VIS.d - 4);
    dropGift(VIS.gift, x, d, Clock.now()); VIS.gift = null; writeSave(S);
    fx({ type: 'glow', x, y: Y(d) - 10, life: 0.9, r: 30, rgb: '255,240,200' });
  }
  if (VIS.kind === 'sparrow') Object.assign(VIS, { phase: 'out', x0: VIS.x, y0: VIS.y, tx: VIS.x + VIS.face * 260, ty: VIS.y - 220, t0: TT });
  else { VIS.face = VIS.x < 200 ? -1 : 1; Object.assign(VIS, { phase: 'out', tx: VIS.face < 0 ? -60 : SCENE_W + 60, t0: TT }); }
}
function updateVisitor(dt) {
  if (!VIS.on) return;
  const near = VIS.kind !== 'cat' && P.present && Math.abs(P.x - VIS.x) < 64 && (VIS.d == null || Math.abs(P.d - VIS.d) < 40) && /trot|chase/.test(P.mode);   // the cat doesn't mind him
  if (near && VIS.phase === 'stay') visitorLeave();             // he came over to say hello: off they go
  if (VIS.kind === 'sparrow') {
    const u = clamp((TT - VIS.t0) / 1.6), e = smooth(u);
    if (VIS.phase === 'in') { VIS.x = lerp(VIS.x0, VIS.tx, e); VIS.y = lerp(VIS.y0, VIS.ty, e) - Math.sin(Math.PI * u) * 30; if (u >= 1) { VIS.phase = 'stay'; VIS.until = TT + VIS.stay; } }
    else if (VIS.phase === 'stay') { if (TT > VIS.poseAt) { VIS.pose = Math.random() < 0.45 ? 1 : 0; VIS.poseAt = TT + rand([0.4, 1.2]); if (Math.random() < 0.25) VIS.face *= -1; } if (TT > VIS.until) visitorLeave(); }
    else { VIS.x = lerp(VIS.x0, VIS.tx, e); VIS.y = lerp(VIS.y0, VIS.ty, e); if (u >= 1) VIS.on = false; }
    return;
  }
  if (VIS.phase === 'stay') {
    if (VIS.hold > TT) { if (TT > VIS.until) VIS.until = TT + 1; return; }      // busy saying hello to Parker
    if (TT > VIS.poseAt) {
      VIS.poseAt = TT + rand([1.2, 3]);
      VIS.pose = VIS.kind === 'cat' ? (Math.random() < 0.3 ? 'blink' : 'sit') : (Math.random() < 0.5 ? 'nibble' : 'sit');
      if (VIS.kind === 'squirrel' && Math.random() < 0.2) VIS.face *= -1;
    }
    if (TT > VIS.until) visitorLeave();
    return;
  }
  const dx = VIS.tx - VIS.x, step = VIS_SPEED[VIS.kind] * dt * (VIS.phase === 'out' ? 1.4 : 1);
  if (Math.abs(dx) <= step) {
    VIS.x = VIS.tx;
    if (VIS.phase === 'in') { VIS.phase = 'stay'; VIS.until = TT + VIS.stay; VIS.face = Math.random() < 0.5 ? 1 : -1; if (P.present) VIS.face = Math.sign(P.x - VIS.x) || 1; if (VIS.kind === 'cat') catHello(); }
    else VIS.on = false;
  } else VIS.x += Math.sign(dx) * step;
}
// the cat and Parker say hello (only while he's home, awake and free)
function catHello() {
  if (!P.present || !/^(sit|lie|look|sniff|trot|sigh|wag|tilt|hop|eat|expect|shelter)$/.test(P.mode) || P.pack || P.hold || Math.random() > HABITS.catPlayChance) return;
  const kind = pickWeighted(HABITS.catPlay), side = Math.sign(VIS.x - P.x) || 1, gap = { boop: 92, bow: 76, side: 70 }[kind];
  VIS.hold = TT + 30; VIS.until = Math.max(VIS.until, TT + 14);
  if (kind === 'boop') VIS.d = clamp(VIS.d, 104, 220) + 4;          // she sits just behind him, so his nose reaches her face
  const tx = clamp(VIS.x - gap * side, 30, 370), sideBy = kind === 'side';
  goTo(tx, clamp(VIS.d + (sideBy ? 6 : kind === 'boop' ? -4 : 0), 100, 224), () => faceThen(sideBy ? VIS.face : side, () => {
    VIS.face = sideBy ? VIS.face : -side;
    if (kind === 'boop') setMode('catboop', 2.6, { heart: false });
    else if (kind === 'bow') setMode('catbow', 2.4, { swat: false });
    else setMode('catside', rand([6, 9]), { sighed: false });
  }));
}
function catPlayTick() {
  if (!/^cat(boop|bow|side)$/.test(P.mode)) return;
  if (!VIS.on || VIS.kind !== 'cat') return setMode('sit', 2);
  const u = TT - P.t0, [mx, my] = [(P.x + VIS.x) / 2, Y(P.d) - 70 * depthScale(P.d)];
  if (P.mode === 'catboop') { VIS.pose = u > 0.8 && u < 2.2 ? 'blink' : 'sit'; if (u > 1.1 && !P.data.heart) { P.data.heart = true; SFX.pop(); fx({ type: 'spr', key: 'heart', x: mx, y: my - 6, vy: -28, sway: 1, life: 1.4 }); fx({ type: 'glow', x: mx, y: my + 10, life: 0.6, r: 30, rgb: '255,236,200' }); } }
  if (P.mode === 'catbow') { VIS.pose = u > 0.9 && u < 1.5 ? 'swat' : 'sit'; if (u > 1.0 && !P.data.swat) { P.data.swat = true; SFX.mew(); } }
  if (P.mode === 'catside') { VIS.pose = Math.floor(u / 2.5) % 2 ? 'blink' : 'sit'; if (u > 3 && !P.data.sighed) { P.data.sighed = true; SFX.sigh(); fx({ type: 'spr', key: 'puff', x: P.x + 44 * P.face, y: Y(P.d) - 66, vx: 14 * P.face, vy: -6, grow: true, life: 1.6 }); fx({ type: 'spr', key: 'heart', x: mx, y: my - 30, vy: -20, sway: 2, life: 1.6, scale: 0.8 }); } }
}
function catPlayEnd() {                  // after saying hello: he hops back (bow), or just sits there content
  const was = P.mode; VIS.hold = 0; VIS.pose = 'sit'; VIS.until = Math.max(VIS.until, TT + 4);
  if (was === 'catbow') { setMode('hop', HABITS.reactionTime.hop); SFX.pop(); } else setMode('sit', rand([4, 7]));
}
function tapVisitor(x, y) {
  if (!VIS.on || VIS.phase !== 'stay') return false;
  const cy = VIS.kind === 'sparrow' ? VIS.y - 16 : Y(VIS.d) - (VIS.kind === 'cat' ? 44 : 24) * depthScale(VIS.d);
  if (Math.hypot(x - VIS.x, y - cy) > (VIS.kind === 'cat' ? 42 : 32)) return false;
  if (VIS.kind === 'cat') {               // the cat doesn't mind: a slow blink back at you
    VIS.pose = 'blink'; VIS.poseAt = TT + 1.4; SFX.mew();
    fx({ type: 'spr', key: 'heart', x: VIS.x, y: cy - 30, vy: -26, sway: 1, life: 1.3, scale: 0.7 });
    return true;
  }
  VIS.face = x < VIS.x ? 1 : -1; visitorLeave(); return true;
}
function visitorDrawing() {
  if (VIS.kind === 'cat') return { key: VIS.phase === 'stay' ? `ncat|${VIS.pose}` : `ncat|walk${Math.floor(TT * 6) % 2}`, lift: 0 };
  if (VIS.phase === 'stay') return { key: `sq|${VIS.pose}`, lift: 0 };
  const u = (TT * 2.6) % 1; return { key: `sq|${u < 0.35 ? 'hop0' : 'hop1'}`, lift: u < 0.35 ? 0 : 12 * Math.sin(Math.PI * (u - 0.35) / 0.65) };
}
function drawVisitor() {                 // the sparrow (it perches up high, so it's drawn over the ground things)
  if (!VIS.on || VIS.kind !== 'sparrow') return;
  const k = VIS.phase !== 'stay' ? 2 + Math.floor(TT * 12) % 2 : VIS.pose;
  drawSprite(sprite(`bird|${k}`), VIS.x, VIS.y, { sx: VIS.face, scale: 1 });
}
// ---------- gifts on the ground ----------
function giftAt(x, y) { let best = null, bd = 30; for (const g of S.gifts) { const dd = Math.hypot(x - g.x, y - (Y(g.d) - 12)); if (dd < bd) { bd = dd; best = g; } } return best; }
function pickGift(g) {
  S.gifts = S.gifts.filter(h => h !== g);
  S.giftBox[g.kind] = (S.giftBox[g.kind] || 0) + 1; S.dandelions += g.dand; S.giftNew = true; writeSave(S);
  const y = Y(g.d) - 10; SFX.gift(g.kind === 'clover');
  fx({ type: 'glow', x: g.x, y, life: 0.7, r: g.kind === 'clover' ? 60 : 40, rgb: g.kind === 'clover' ? '220,255,190' : '255,236,170' });
  fx({ type: 'spr', key: `gift|${g.kind}`, x: g.x, y: y + 4, vy: -50, life: 0.8, scale: 1 });
  if (g.dand) { const t = hudTarget(); fx({ type: 'fly', x0: g.x, y0: y, x1: t[0], y1: t[1], life: 0.8, value: g.dand }); }
  toastText(T_('toast.giftPick').replace('{what}', T_('gift.' + g.kind + '.a')).replace('{who}', T_('vis.' + g.from + '.the')) + (g.dand ? T_('toast.giftDand').replace('{n}', g.dand) : ''), 3800);
}
boot();
