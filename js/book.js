// ================= "PARKER SEES THE WORLD": the little notes he leaves, and the book they go into =================
// Once or twice a week (real time, from the save's timestamps, so it also happens while the game is closed) he leaves
// one folded note somewhere at home: by the door, on his bed, next to one of his toys, or out in the yard. It rocks a
// little to catch your eye, nothing more. Tap it: it unfolds, in his wobbly handwriting with a paw print. Then it goes
// into his little book, which comes with the first note: a piece of furniture for his room (in the doghouse days it
// lives in his house panel). The book shows the notes in the order you found them, with the date; the ones still to
// come are not shown, and neither is how many there are.
// The texts are in js/notes.js and are used exactly as written.

const NOTE_FIRST = [1, 3], NOTE_EVERY = [3.5, 7];          // days until the first note, and between notes (≈ 1–2 a week)
const DAY = 864e5;

// ---------- rules (only change the save) ----------
function noteOpen(n) {                     // can this note turn up yet?
  const q = n.need; if (!q || S.notes.allOpen) return true;
  if (q.place && !S.been[q.place]) return false;
  if (q.friends && !q.friends.every(f => S.friends[f])) return false;
  return true;
}
function notesPool() { const got = new Set(S.notes.got.map(g => g.id)), w = S.notes.waiting; return NOTES.filter(n => !got.has(n.id) && !(w && w.id === n.id) && noteOpen(n)); }
function notesTick(now) {
  const N = S.notes; if (N.waiting || now < N.nextAt) return false;
  const pool = notesPool();
  // nothing to leave right now (all found, or the rest not unlocked yet): try again a normal while later, so a note that
  // has just been unlocked never pops up the moment it is
  if (!pool.length) { N.nextAt = now + rnd(NOTE_EVERY) * DAY; writeSave(S); return false; }
  const n = pool[Math.floor(Math.random() * pool.length)];
  N.waiting = { id: n.id, at: now, spot: noteSpotPick() };
  if (!S.furn.book) S.furn.book = 1;        // the book comes with the first note
  writeSave(S);
  return true;
}
// where he leaves it: by the door, on his bed (when he has a room and a bed), beside a toy, or somewhere in the yard
function noteSpotPick() {
  const opts = [['door', 1], ['yard', 1]];
  if (houseLevel() > 1 && S.decor && S.decor.items.some(r => r.id === 'bed')) opts.push(['bed', 1]);
  const toys = S.toys.filter(t => S.toyPos[t]); if (toys.length) opts.push(['toy', 1]);
  const where = pickWeighted(Object.fromEntries(opts));
  if (where === 'bed') return { where };
  if (where === 'door') return { where };
  if (where === 'toy') {
    const t = toys[Math.floor(Math.random() * toys.length)], p = S.toyPos[t];
    for (const dx of [34, -34, 46, -46]) { const x = clamp(p.x + dx, 30, 370), d = clamp(p.d - 4, 100, 224); if (spotFree(x, d)) return { where, x, d }; }
  }
  for (let i = 0; i < 40; i++) { const x = Math.round(40 + Math.random() * 320), d = Math.round(100 + Math.random() * 120); if (spotFree(x, d)) return { where: 'yard', x, d }; }
  return { where: 'door' };
}
// where it is right now, in the yard (the door moves with the house; if his bed was put away, it waits by the door)
function noteYardSpot() {
  const w = S.notes && S.notes.waiting; if (!w) return null;
  const s = w.spot;
  if (s.where === 'bed' && houseLevel() > 1 && typeof decorBed === 'function' && S.decor && decorBed()) return null;   // indoors, on his bed
  if (s.where === 'door' || s.where === 'bed') return { x: DOOR.x + 26, d: DOOR.d - 12 };
  return { x: s.x, d: s.d };
}
function noteHint() { if (S.notes && S.notes.waiting && !(typeof PV !== 'undefined' && PV.mode)) toastText(T_('book.hint'), 4500); }   // "Parker wrote a little note…" (it doesn't say where)
const noteOnBed = () => { const w = S.notes && S.notes.waiting; return !!(w && w.spot.where === 'bed' && houseLevel() > 1 && S.decor && decorBed()); };
function keepNote() {                       // read: into the book
  const N = S.notes, w = N.waiting; if (!w) return;
  const now = Clock.now(), first = !N.got.length;
  N.got.push({ id: w.id, at: now }); N.waiting = null;
  N.nextAt = Math.max(w.at + rnd(NOTE_EVERY) * DAY, now + DAY);     // counted from when it turned up (reading late doesn't slow them down), but never right after you read one
  if (!S.furn.book) S.furn.book = 1;
  writeSave(S);
  if (ROOMV.on) decorEnsure();              // the book sets itself out in his room
  toastText(T(first ? 'book.first' : 'book.kept'), first ? 4200 : 2400);
}

// ---------- the art ----------
// a torn-out notebook page folded in two, a strip of washi tape across it and his inked paw
ART.def('note.folded', { group: 'note', box: { w: 44, h: 36, ox: 22, oy: 30 }, stick: false, note: 'a folded note on the ground; origin under its middle', draw: c => {
  const back = poly([[-15, -1], [15, -1], [14, -21], [-14, -22]]); castShadow(c, back, 2.5, 1, 2.5, 0.28); piece(c, back, '#f1e5cf', { mul: 0.35 });
  const flap = poly([[-15, -1], [15, -1], [17, -13], [-13, -15]]); castShadow(c, flap, 1.6, 0, 1.6, 0.22); piece(c, flap, '#fffbf2', { mul: 0.25 });
  clipped(c, flap, () => { for (const y of [-11, -7, -3]) piece(c, rectP(-16, y, 34, 0.8), '#cfe0ec', { mul: 0.2 }); piece(c, rectP(-9.5, -16, 0.9, 16), '#f0b9ae', { mul: 0.2 }); });
  piece(c, slab([-13.5, -14.6], [16.5, -12.6], 1), '#e6d6b8', { mul: 0.3 });                   // the fold
  c.save(); c.translate(1, -15); c.rotate(-0.12); const tape = rectP(-6, -4, 12, 8); c.globalAlpha = 0.85; piece(c, tape, '#f3b9b0', { mul: 0.2 }); for (const x of [-4, 0, 4]) piece(c, rectP(x - 0.7, -4, 1.4, 8), '#fbe0da', { mul: 0.1 }); c.restore();
  c.save(); c.globalAlpha = 0.85; pawPrint(c, 8, -6, 0.26, '#b9705f'); c.restore();
} });
// his handwriting: Chinese wobbles character by character, English word by word (so the letters keep their spacing);
// each a little tilted, a little up or down, a little bigger or smaller — always the same for the same note.
// Shrinks the writing if it would need more than maxLines lines. Returns { lines, size, lineH }.
const HAND = { zh: '"Hannotate SC","HanziPen SC","Kaiti SC","STKaiti","KaiTi",', en: '"Chalkboard SE","Comic Neue","Comic Sans MS",' };
function handWrap(c, text, maxW, lang) {
  const toks = lang === 'zh' ? [...text] : text.split(/(?<= )/), lines = []; let line = '';
  for (const t of toks) { if (line && !/^[，。！？、…；：”）,.!?;:")]/.test(t) && c.measureText(line + t).width > maxW) { lines.push(line); line = t.trimStart(); } else line += t; }
  if (line) lines.push(line);
  return lines;
}
function scribble(c, text, x, y, maxW, size, lineH, lang, seed, col, maxLines, measureOnly) {
  const setFont = () => { c.font = `500 ${size}px ${HAND[lang]}${FONT}`; };
  c.save(); setFont(); let lines = handWrap(c, text, maxW, lang);
  while (maxLines && lines.length > maxLines && size > 13) { size -= 1; lineH -= 1.4; setFont(); lines = handWrap(c, text, maxW, lang); }
  if (!measureOnly) {
    const r = rng(seed); c.fillStyle = col; c.textBaseline = 'alphabetic'; c.textAlign = 'left';
    const glyph = (s, cx, cy) => { const w = c.measureText(s).width, k = 1 + (r() - 0.5) * (lang === 'zh' ? 0.12 : 0.06); c.save(); c.translate(cx + w / 2, cy + (r() - 0.5) * 2.4); c.rotate((r() - 0.5) * (lang === 'zh' ? 0.12 : 0.05)); c.scale(k, k); c.globalAlpha = 0.86 + r() * 0.12; c.fillText(s, -w / 2, 0); c.restore(); return w; };
    lines.forEach((ln, i) => {
      let cx = x; const cy = y + i * lineH;
      if (lang === 'zh') for (const ch of [...ln]) cx += glyph(ch, cx, cy) * (0.98 + r() * 0.06);
      else for (const word of ln.split(/(?<= )/)) { const w = c.measureText(word).width; glyph(word.trimEnd(), cx, cy); cx += w + (r() - 0.5) * 1.5; }
    });
  }
  c.restore();
  return { lines: lines.length, size, lineH };
}
// ---- the note slip: a page torn out of a little notebook — ruled lines, a red margin, the torn edge with its
// punched holes, fold creases where it was folded, held by washi tape. Used opened, and glued into the book.
const SLIP = { x: 46, top: 66, size: { zh: 20, en: 18 }, lineH: 30 };       // where his writing goes on an opened note
function noteSlip(c, x, y, w, h, seed, o = {}) {
  const r = rng(seed), wob = () => (r() - 0.5) * 1.6;
  const edge = [[x, y + 6]]; for (let k = 0; k <= 16; k++) edge.push([x + w * k / 16, y + (k % 2 ? 1 : 5) + wob()]);   // torn along the top
  edge.push([x + w, y + 6], [x + w + wob(), y + h], [x + wob(), y + h]);
  const sheet = poly(edge); castShadow(c, sheet, 8, 2, 6, 0.26); piece(c, sheet, '#fffbf2', { mul: 0.25, scr: 0.12 });
  clipped(c, sheet, () => {
    for (let yy = y + 44; yy < y + h - 12; yy += o.lineH || 30) piece(c, rectP(x, yy, w, 1.1), '#d3e2ee', { mul: 0.2 });
    piece(c, rectP(x + 26, y, 1.4, h), '#f0b4a8', { mul: 0.2 });
    if (o.folds) { piece(c, rectP(x, y + h / 2 - 1, w, 1), '#e9dcc2', { mul: 0.3 }); piece(c, rectP(x, y + h / 2, w, 1), '#ffffff', { mul: 0.1 }); piece(c, rectP(x + w / 2 - 1, y, 1, h), '#ede1ca', { mul: 0.3 }); }
    piece(c, rectP(x, y + h - 10, w, 10), '#f6edd9', { mul: 0.2 });
  });
  c.save(); if (o.holeCol) c.fillStyle = o.holeCol; else c.globalCompositeOperation = 'destination-out';
  for (let k = 0; k < 7; k++) { c.beginPath(); c.arc(x + 22 + k * (w - 44) / 6, y + 16, 3.1, 0, TAU); c.fill(); } c.restore();   // the punched holes
}
function washi(c, x, y, w, rot, col, col2, alpha = 0.82) {
  c.save(); c.translate(x, y); c.rotate(rot); c.globalAlpha = alpha;
  const t = poly([[-w / 2, -8], [w / 2, -9], [w / 2 + 1.5, -5], [w / 2 - 1, -1], [w / 2 + 1, 3], [w / 2, 8], [-w / 2, 9], [-w / 2 - 1.5, 4], [-w / 2 + 1, 0], [-w / 2 - 1, -4]]);
  piece(c, t, col, { mul: 0.15, scr: 0.1 }); clipped(c, t, () => { for (let k = -w / 2; k < w / 2; k += 7) piece(c, poly([[k, -10], [k + 3.5, -10], [k - 1.5, 10], [k - 5, 10]]), col2, { mul: 0.1 }); });
  c.restore();
}
// the note, opened: the slip with one tape at the top, his writing, his inked paw (c, note, lang, w, h)
ART.def('ui.note.open', { kind: 'paint', group: 'note', note: 'an opened note: (c, note, lang, w, h)', draw: (c, n, lang, w, h) => {
  noteSlip(c, 12, 10, w - 24, h - 20, 40 + n.id, { folds: true });
  washi(c, w / 2, 18, 70, -0.04, '#f3b9b0', '#fbe0da');
  scribble(c, lang === 'zh' ? n.zh : n.en, SLIP.x, SLIP.top + 8, w - 90, SLIP.size[lang], SLIP.lineH, lang, 900 + n.id, '#5b3f37', 8);
  c.save(); c.translate(w - 48, h - 42); c.rotate(-0.25); c.globalAlpha = 0.85; pawPrint(c, 0, 0, 1.15, '#b9705f'); c.restore();
} });
// the little picture at the top of a page, a sticker with a white die-cut edge:
// a nose with scent curls · a sneaker · the place's stamp with a postmark over it · a big paw with a heart
const NOTE_PLACE = n => n.need ? (n.need.place || (FRIENDS.find(f => f.id === n.need.friends[0]) || {}).place) : null;
ART.def('ui.note.deco', { kind: 'paint', group: 'note', note: 'the picture on a page of the book: (c, note, x, y, size, res)', draw: (c, n, x, y, s, res = 2) => {
  c.save(); c.translate(x, y); const k = s / 60;
  const place = n.cat === 'travel' && NOTE_PLACE(n);
  if (place) {                              // the stamp, a little crooked, with a postmark ring over its corner
    const st = ART.paint('card.stamp', null, place, res), w = 52 * k, h = 63 * k; c.rotate(0.05);
    castShadow(c, q => q.drawImage(st, -w / 2, -h / 2, w, h), 3, 1, 3, 0.25); c.drawImage(st, -w / 2, -h / 2, w, h); c.rotate(-0.05);
    c.save(); c.strokeStyle = (pcEntry(place).ink || '#6c4a6e'); c.globalAlpha = 0.5; c.lineWidth = 1.6; c.beginPath(); c.arc(w * 0.42, h * 0.3, 17 * k, 0, TAU); c.stroke(); c.beginPath(); c.arc(w * 0.42, h * 0.3, 13 * k, 0, TAU); c.stroke();
    for (let i = 0; i < 3; i++) { c.beginPath(); for (let xx = 0; xx <= 40 * k; xx += 3) { const yy = h * 0.3 - 7 * k + i * 7 * k + Math.sin(xx / 5) * 1.6; xx ? c.lineTo(w * 0.42 + 18 * k + xx, yy) : c.moveTo(w * 0.42 + 18 * k, yy); } c.stroke(); }
    c.restore(); c.restore(); return;
  }
  const col = { smell: '#f6d6c6', humans: '#d3e4f2', wisdom: '#f8e2ae' }[n.cat] || '#f3e6cd', disc = circ(0, 0, 27 * k);
  castShadow(c, disc, 4, 1, 3, 0.25); piece(c, circ(0, 0, 30 * k), '#ffffff', { mul: 0.1 }); piece(c, disc, col, { mul: 0.35, scr: 0.15 });
  clipped(c, disc, () => { const r = rng(n.id); for (let i = 0; i < 9; i++) piece(c, circ((r() - 0.5) * 50 * k, (r() - 0.5) * 50 * k, 1.6 * k), '#ffffff', { mul: 0.1 }); });
  if (n.cat === 'smell') {                  // his nose, with three curls of scent coming in
    c.save(); c.strokeStyle = '#e08a9a'; c.lineWidth = 1.8 * k; c.lineCap = 'round'; c.globalAlpha = 0.8;
    for (let i = 0; i < 3; i++) { c.beginPath(); const yy = (-12 + i * 9) * k; c.moveTo(-22 * k, yy); c.bezierCurveTo(-16 * k, yy - 6 * k, -12 * k, yy + 6 * k, -6 * k, yy); c.stroke(); }
    c.restore(); flower(c, 15 * k, -13 * k, 4.5 * k, '#f8d36a', 7, false);
    c.save(); c.translate(6 * k, 4 * k); c.scale(k * 1.3, k * 1.3); ART.paint('parker.part.nose', c, 0, 0, 9, 7); c.restore();
  } else if (n.cat === 'humans') {          // a sneaker, laces and all
    c.save(); c.scale(k, k); c.rotate(-0.12);
    const up = new Path2D(); up.moveTo(-20, 6); up.lineTo(-18, -9); up.quadraticCurveTo(-10, -14, -4, -8); up.quadraticCurveTo(8, -3, 17, -1); up.quadraticCurveTo(23, 3, 19, 7); up.closePath();
    pp(c, up, '#7aa6d8', 0.2); pp(c, rectP(-21, 5, 42, 5), '#fff6e6', 0.12); pp(c, ell(12, 1, 8, 5), '#fff6e6', 0.08);
    c.strokeStyle = '#fff6e6'; c.lineWidth = 1.3; for (let i = 0; i < 3; i++) { c.beginPath(); c.moveTo(-9 + i * 4, -9 + i * 1.5); c.lineTo(-5 + i * 4, -6 + i * 1.5); c.stroke(); }
    pp(c, rectP(-19, -8, 5, 9), '#e2574a', 0.05); c.restore();
  } else {                                  // a paw, and a little heart
    pawPrint(c, -2 * k, 2 * k, 1.25 * k, '#b9705f');
    c.save(); c.translate(15 * k, -15 * k); c.scale(k * 0.55, k * 0.55); drawHeart(c, 1); c.restore();
  }
  c.restore();
} });
// the book standing on a shelf or the floor: cloth cover, a tiny picture of a hill and the sun, its title label,
// a red ribbon hanging out
ART.def('furn.book', { group: 'furn', box: { w: 44, h: 50, ox: 22, oy: 46 }, stick: false, note: 'the book "Parker Sees the World", standing; origin under its middle', draw: c => {
  const cover = poly([[-13, 0], [13, 0], [14, -38], [-12, -38]]); castShadow(c, cover, 2.5, 1, 2.5, 0.28); piece(c, cover, '#4f7fb8', { mul: 0.45 });
  piece(c, rectP(-13, -38, 4, 38), '#3b6597', { mul: 0.4 }); for (const y of [-33, -5]) piece(c, rectP(-13, y, 4, 1.6), '#2f5585', { mul: 0.3 });
  const win = rectP(-6, -33, 16, 13); pp(c, rectP(-7, -34, 18, 15), '#fff6e6', 0.05); piece(c, win, '#bfe2f4', { mul: 0.2 });
  clipped(c, win, () => { piece(c, ell(2, -19, 12, 6), '#8cc06a', { mul: 0.3 }); piece(c, circ(6, -29, 2.2), '#fff0b0', { mul: 0.1 }); piece(c, ell(-2, -21, 1.6, 1.4), '#fffaf0', { mul: 0.1 }); });
  pp(c, rectP(-6, -16, 16, 5), '#fffaf0', 0.05); piece(c, rectP(-4, -14.2, 12, 1.2), '#b9705f', { mul: 0.2 });
  for (const [x, y] of [[14, -38], [13, 0]]) piece(c, poly([[x, y], [x - 5, y], [x, y + (y ? -5 : 5)]]), '#a8703f', { mul: 0.3 });
  pp(c, poly([[7, 0], [10, 0], [10.5, 6], [8.5, 4.5], [6.5, 6]]), '#e2574a', 0.1);
  c.save(); c.globalAlpha = 0.9; pawPrint(c, 2, -6, 0.22, '#fff6e6'); c.restore();
} });
// the cover: cloth boards with a stitched spine and leather corners, a cut-paper picture set into it — Parker,
// seen from behind, sitting on a hill and looking out over the world — the title on a torn paper label,
// a ribbon bookmark. (c, w, h, res)
ART.def('ui.book.cover', { kind: 'paint', group: 'note', note: 'the book\'s cover: (c, w, h, res)', draw: (c, w, h, res = 2) => {
  const board = rectP(14, 8, w - 26, h - 18); castShadow(c, board, 12, 4, 10, 0.32); piece(c, board, '#4f7fb8', { mul: 0.45, scr: 0.08 });
  clipped(c, board, () => { const r = rng(5); for (let k = 0; k < 90; k++) piece(c, rectP(14 + r() * w, 8 + r() * h, 10 + r() * 30, 0.7), r() < 0.5 ? '#5d8dc6' : '#4473ab', { mul: 0.2 }); });   // the cloth's weave
  piece(c, rectP(14, 8, 30, h - 18), '#3b6597', { mul: 0.4 });                     // the spine
  for (const y of [44, h - 56]) pp(c, rectP(14, y, 30, 6), '#2f5585', 0.12);
  c.save(); c.setLineDash([5, 4]); c.strokeStyle = 'rgba(243,230,205,0.85)'; c.lineWidth = 1.3; c.beginPath(); c.moveTo(40, 14); c.lineTo(40, h - 14); c.stroke(); c.restore();
  for (const [x, y, dx, dy] of [[w - 12, 8, -30, 30], [w - 12, h - 10, -30, -30]]) pp(c, poly([[x, y], [x + dx, y], [x, y + dy]]), '#a8703f', 0.15);   // leather corners
  // the picture
  const X = 64, Yp = 46, PW = w - 100, PH = 190, win = rectP(X, Yp, PW, PH);
  pp(c, rectP(X - 7, Yp - 7, PW + 14, PH + 14), '#fff6e6', 0.25); piece(c, rectP(X - 7, Yp - 7, PW + 14, 3), '#e8d9bf', { mul: 0.3 });
  clipped(c, win, () => {
    c.save(); c.translate(X, Yp);
    piece(c, rectP(0, 0, PW, PH), '#bfe2f4', { scr: 0.22 });
    for (const [y, col, i] of [[60, '#cfe8f4', 1], [92, '#f2e6d8', 2], [118, '#f8dcc6', 3]]) strip(c, -10, PW + 10, x => y + 5 * Math.sin(x / 40 + i) + 2 * fbm1(x / 30, i), PH, col, { seed: 70 + i, shadow: 0.08, amp: 2.5, scr: 0.2 });
    glow(c, PW * 0.74, 78, 60, '255,236,200', 0.5); tornPiece(c, ellipsePts(PW * 0.74, 78, 15, 15, 30), '#fff1c2', { amp: 0.8, seed: 7, shadow: 0, rimCol: '#fffbe8' });
    for (const [cx, cy, s] of [[40, 44, 1], [150, 30, 0.8]]) { tornPiece(c, ellipsePts(cx, cy, 20 * s, 6 * s, 24), '#ffffff', { amp: 1, seed: 80 + cx, shadow: 0.08, mul: 0.4 }); tornPiece(c, ellipsePts(cx - 6 * s, cy - 4 * s, 10 * s, 6 * s, 20), '#ffffff', { amp: 0.8, seed: 90 + cx, shadow: 0.06, mul: 0.4 }); }
    strip(c, -10, PW + 10, x => 128 - 16 * Math.exp(-(((x - 60) / 50) ** 2)) - 10 * Math.exp(-(((x - 170) / 40) ** 2)) + 2 * fbm1(x / 20, 4), PH, '#a9cfa0', { seed: 74, shadow: 0.12, amp: 2 });   // far hills
    for (const [hx, hy, col] of [[150, 126, '#f6cf86'], [168, 129, '#f3b9b0']]) { pp(c, rectP(hx - 5, hy - 7, 10, 8), col, 0.1); pp(c, poly([[hx - 7, hy - 7], [hx, hy - 13], [hx + 7, hy - 7]]), '#e8604c', 0.05); }   // two little houses far away
    pine(c, 32, 132, 22, '#6fa878', 11); pine(c, 196, 134, 18, '#6fa878', 12);
    strip(c, -10, PW + 10, x => 140 + 3 * fbm1(x / 30, 5), PH, '#8cc06a', { seed: 75, rimCol: '#cfe7b0', shadow: 0.16, amp: 2 });
    const road = new Path2D(); road.moveTo(PW * 0.48, 140); road.bezierCurveTo(PW * 0.62, 152, PW * 0.3, 166, PW * 0.55, PH + 4); road.lineTo(PW * 0.82, PH + 4); road.bezierCurveTo(PW * 0.48, 168, PW * 0.72, 150, PW * 0.52, 140); road.closePath();
    pp(c, road, '#f3e3c0', 0.12);                                                          // the road away into the world
    strip(c, -10, PW + 10, x => 170 - 18 * Math.exp(-(((x - 60) / 60) ** 2)) + 2 * fbm1(x / 25, 6), PH, '#6fae55', { seed: 76, rimCol: '#a9d68e', shadow: 0.22, amp: 2 });   // his hill
    for (let k = 0; k < 6; k++) tuft(c, 10 + k * 14, 166 - 10 * Math.exp(-(((10 + k * 14 - 60) / 60) ** 2)), 9, '#5fa463', 40 + k);
    flower(c, 104, 176, 3.5, '#f8d36a', 21, false); flower(c, 16, 178, 3.5, '#f58cbf', 22, false);
    pcParker(c, res, BOX_BACK, 0.29, p => drawBackSitB(p), 66, 166);                    // Parker, looking out at it all
    bird(c, 120, 52, 0.7); bird(c, 136, 60, 0.55);
    vignette(c, PW, PH, '200,170,190', 0.35, 0.9);
    c.restore();
  });
  // the title on a torn paper label
  const L = [[X - 6, 262], [X + PW + 6, 258], [X + PW + 8, 338], [X - 4, 342]], label = [];
  const r = rng(17); for (let i = 0; i < 4; i++) { const a = L[i], b = L[(i + 1) % 4]; for (let k = 0; k < 6; k++) label.push([lerp(a[0], b[0], k / 6) + (r() - 0.5) * 2, lerp(a[1], b[1], k / 6) + (r() - 0.5) * 2]); }
  tornPiece(c, label, '#fffaf0', { amp: 1.2, seed: 18, rimCol: '#ffffff', shadow: 0.25, mul: 0.3 });
  c.fillStyle = '#4a3a5a'; c.textAlign = 'center'; const cx = X + PW / 2;
  c.font = `600 30px ${FONT}`; c.fillText(T('book.title', 'zh'), cx, 302);
  c.font = `italic 16px ${FONT}`; c.fillStyle = '#7d6155'; c.fillText(T('book.title', 'en'), cx, 328);
  c.save(); c.globalAlpha = 0.85; pawPrint(c, X + 10, 278, 0.45, '#b9705f'); pawPrint(c, X + PW - 10, 324, 0.45, '#b9705f'); c.restore();
  // a trail of little paws, and the ribbon bookmark hanging out at the bottom
  for (let k = 0; k < 5; k++) { c.save(); c.globalAlpha = 0.7; pawPrint(c, X + 20 + k * 40, 380 - (k % 2) * 12, 0.5, '#9cc2e6'); c.restore(); }
  pp(c, poly([[w - 70, h - 14], [w - 58, h - 14], [w - 57, h + 2], [w - 64, h - 4], [w - 71, h + 2]]), '#e2574a', 0.15);
} });
// a page: thick cream paper with a deckled edge and the shadow of the binding, the sticker picture at the top, the
// note slip taped in, the date stamped in ink in the corner. (c, note, collected at, lang, w, h, res)
ART.def('ui.book.page', { kind: 'paint', group: 'note', note: 'one page: (c, note, collected at, lang, w, h, res)', draw: (c, n, at, lang, w, h, res = 2) => {
  const r = rng(300 + n.id), edge = [];
  for (let k = 0; k <= 20; k++) edge.push([14 + (w - 28) * k / 20, 8 + (r() - 0.5) * 1.6]);
  for (let k = 0; k <= 26; k++) edge.push([w - 12 + (r() - 0.5) * 2, 8 + (h - 18) * k / 26]);
  for (let k = 20; k >= 0; k--) edge.push([14 + (w - 28) * k / 20, h - 10 + (r() - 0.5) * 1.6]);
  const page = poly(edge); castShadow(c, page, 10, 3, 8, 0.25); piece(c, page, '#fbf1df', { mul: 0.35, scr: 0.15 });
  clipped(c, page, () => { const g = c.createLinearGradient(14, 0, 44, 0); g.addColorStop(0, 'rgba(150,110,80,0.28)'); g.addColorStop(1, 'rgba(150,110,80,0)'); c.fillStyle = g; c.fillRect(14, 0, 30, h); });
  c.save(); c.strokeStyle = 'rgba(200,170,130,0.45)'; c.lineWidth = 1; c.strokeRect(30, 22, w - 56, h - 46); c.strokeRect(34, 26, w - 64, h - 54); c.restore();
  // the slip, as long as his words need, a little crooked, taped at both top corners; picture and slip sit in the middle of the page
  const m = scribble(c, lang === 'zh' ? n.zh : n.en, 0, 0, w - 132, lang === 'zh' ? 19 : 17, 28, lang, 0, '#000', 7, true);
  const sh = 44 + m.lines * m.lineH + 20, top = Math.max(40, (h - 40 - (96 + sh)) / 2 - 6);
  ART.paint('ui.note.deco', c, n, w / 2 + 4, top + 36, 60, res);
  const sx = 40, sy = top + 90, sw = w - 76, rot = (r() - 0.5) * 0.04;
  c.save(); c.translate(sx + sw / 2, sy + sh / 2); c.rotate(rot); c.translate(-(sx + sw / 2), -(sy + sh / 2));
  noteSlip(c, sx, sy, sw, sh, 40 + n.id, { lineH: m.lineH, holeCol: '#ece0c8' });
  scribble(c, lang === 'zh' ? n.zh : n.en, sx + 38, sy + 44 + m.lineH * 0.72, sw - 56, lang === 'zh' ? 19 : 17, 28, lang, 900 + n.id, '#5b3f37', 7);
  c.restore();
  const tapes = [['#f3b9b0', '#fbe0da'], ['#b9d7ee', '#e2eff9'], ['#f8d98a', '#fcedc4'], ['#c3dfb2', '#e6f2dc']][n.id % 4];
  washi(c, sx + 18, sy + 6, 46, -0.5, ...tapes); washi(c, sx + sw - 16, sy + 8, 46, 0.45, ...tapes);
  // the date, stamped in ink (numbers read the same in both languages)
  const d = new Date(at), date = `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
  c.save(); c.translate(w - 84, h - 52); c.rotate(-0.1); c.globalAlpha = 0.72; c.strokeStyle = '#b0574a'; c.fillStyle = '#b0574a'; c.lineWidth = 1.6;
  c.strokeRect(-46, -15, 92, 30); c.lineWidth = 0.8; c.strokeRect(-42, -11, 84, 22);
  c.font = `600 13px ${FONT}`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(date, 0, 1); c.restore();
  c.save(); c.globalAlpha = 0.5; pawPrint(c, 52, h - 46, 0.55, '#e0b8aa'); c.restore();
} });
// ---------- on screen: in the yard, on his bed ----------
// gently rocking on twos, with a faint glint now and then
function drawNoteAt(ctx, x, y, scale) {
  const f = Math.floor(TT * 6), rot = [0, 0.05, 0.08, 0.05, 0, -0.05, -0.08, -0.05][f % 8];
  const g = (TT % 3.2) / 3.2; ART.draw('fx.glow', ctx, x, y - 12, 26, '255,246,214', 0.18 + (g < 0.25 ? Math.sin(Math.PI * g / 0.25) * 0.5 : 0));
  drawSprite(sprite('note.folded'), x, y, { scale: scale * 1.35, rot, shA: 0.2 });
}
function noteHitYard(x, y) { const s = noteYardSpot(); if (!s) return null; const k = depthScale(s.d), dd = Math.hypot(x - s.x, y - (Y(s.d) - 13 * k)); return dd < 30 ? dd : null; }

// ---------- reading it: the note unfolds ----------
const PV = { mode: null, page: 0, turn: null, unfold: 0 };
function paperView() { return document.getElementById('paperView'); }
function openNote() {
  const w = S.notes.waiting; if (!w) return;
  PV.mode = 'note'; PV.note = NOTE[w.id]; PV.unfold = TT; SFX.unfold();
  paperView().classList.remove('hidden'); drawPaperView();
}
function openBook() {
  if (!S.notes.got.length && !S.furn.book) return;
  PV.mode = 'book'; PV.page = 0; PV.turn = null; SFX.pageTurn();
  paperView().classList.remove('hidden'); drawPaperView();
}
function closePaperView() {
  if (PV.mode === 'note') keepNote();
  PV.mode = null; paperView().classList.add('hidden');
}
const bookPages = () => S.notes.got.slice().sort((a, b) => a.at - b.at);
function turnPage(dir) {
  const n = bookPages().length, to = clamp(PV.page + dir, 0, n);
  if (to === PV.page || PV.turn) return;
  PV.turn = { from: PV.page, to, t0: TT }; SFX.pageTurn();
}
function drawPaperView() {
  const v = paperView(); if (!PV.mode || v.classList.contains('hidden')) return;
  const cvs = v.querySelector('canvas'), dpr = Math.min(2, window.devicePixelRatio || 1), W = 320;
  let H = 430;
  if (PV.mode === 'note') { const m = scribble(cvs.getContext('2d'), LANG === 'zh' ? PV.note.zh : PV.note.en, 0, 0, W - 90, SLIP.size[LANG], SLIP.lineH, LANG, 0, '#000', 8, true); H = Math.max(210, SLIP.top + 8 + m.lines * m.lineH + 58); }
  if (cvs.width !== W * dpr || cvs.height !== H * dpr) { cvs.width = W * dpr; cvs.height = H * dpr; cvs.style.width = W + 'px'; cvs.style.height = H + 'px'; }
  const c = cvs.getContext('2d'); c.setTransform(dpr, 0, 0, dpr, 0, 0); c.clearRect(0, 0, W, H); c.textAlign = 'left'; c.globalAlpha = 1;
  if (PV.mode === 'note') {           // unfolds on twos: a strip, half, all
    const k = [0.12, 0.55, 1][Math.min(2, Math.floor((TT - PV.unfold) * 12))];
    c.save(); c.translate(0, H / 2); c.scale(1, k); c.translate(0, -H / 2); ART.paint('ui.note.open', c, PV.note, LANG, W, H); c.restore();
    v.querySelector('.pv-hint').textContent = T('book.tapToKeep');
    for (const q of ['.pv-prev', '.pv-next']) v.querySelector(q).style.visibility = 'hidden';
    return;
  }
  // the book: page 0 is the cover; turning folds the page over on twos, with a shadow across it
  const pages = bookPages(), draw = p => { if (p === 0) ART.paint('ui.book.cover', c, W, H, dpr); else { const g = pages[p - 1]; ART.paint('ui.book.page', c, NOTE[g.id], g.at, LANG, W, H, dpr); } };
  if (PV.turn) {
    const u = Math.floor((TT - PV.turn.t0) * 12) / 12 / 0.42;
    if (u >= 1) { PV.page = PV.turn.to; PV.turn = null; draw(PV.page); }
    else {
      const first = u < 0.5, p = first ? PV.turn.from : PV.turn.to, k = first ? 1 - u * 2 : u * 2 - 1, fwd = PV.turn.to > PV.turn.from;
      draw(first ? PV.turn.to : PV.turn.from);                                  // the page underneath
      c.save(); c.translate(fwd ? 14 : W - 10, 0); c.scale(Math.max(0.04, k), 1); c.translate(fwd ? -14 : -(W - 10), 0); draw(p);
      c.fillStyle = `rgba(60,40,30,${0.25 * (1 - k)})`; c.fillRect(0, 0, W, H); c.restore();
    }
  } else draw(PV.page);
  const hint = v.querySelector('.pv-hint');
  hint.textContent = pages.length ? (PV.page === 0 ? T('book.open') : '') : T('book.empty');
  v.querySelector('.pv-prev').style.visibility = PV.page > 0 ? 'visible' : 'hidden';
  v.querySelector('.pv-next').style.visibility = PV.page < pages.length ? 'visible' : 'hidden';
}
// taps and swipes on the open note / book
function wirePaperView() {
  const v = paperView(); let sx = null;
  v.querySelector('.pv-close').onclick = e => { e.stopPropagation(); closePaperView(); };
  v.querySelector('.pv-prev').onclick = e => { e.stopPropagation(); turnPage(-1); };
  v.querySelector('.pv-next').onclick = e => { e.stopPropagation(); turnPage(1); };
  const cvs = v.querySelector('canvas');
  cvs.addEventListener('pointerdown', e => { sx = e.clientX; });
  cvs.addEventListener('pointerup', e => {
    if (PV.mode === 'note') return closePaperView();
    const dx = sx == null ? 0 : e.clientX - sx; sx = null;
    if (Math.abs(dx) > 30) return turnPage(dx < 0 ? 1 : -1);
    const r = cvs.getBoundingClientRect(); turnPage(e.clientX - r.left > r.width / 2 ? 1 : -1);
  });
  v.addEventListener('click', e => { if (e.target === v) closePaperView(); });
}
