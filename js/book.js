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
ART.def('note.folded', { group: 'note', box: { w: 36, h: 30, ox: 18, oy: 25 }, stick: false, note: 'a folded note on the ground; origin under its middle', draw: c => {
  const back = poly([[-13, -2], [13, -2], [12, -19], [-12, -20]]); castShadow(c, back, 2.5, 1, 2.5, 0.25); piece(c, back, '#f3e6cd', { mul: 0.4 });
  const flap = poly([[-13, -2], [13, -2], [15, -12], [-11, -14]]); castShadow(c, flap, 1.5, 0, 1.5, 0.2); piece(c, flap, '#fffaf0', { mul: 0.3 });
  piece(c, slab([-12, -13], [14, -11.5], 1), '#e2cfae', { mul: 0.3 });
  pawPrint(c, 4, -8, 0.24, '#c98b7a');
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
// the note, opened: ruled paper with its fold lines, his words, a paw print. (c, note, lang, w, h)
ART.def('ui.note.open', { kind: 'paint', group: 'note', note: 'an opened note: (c, note, lang, w, h)', draw: (c, n, lang, w, h) => {
  const sheet = poly([[6, 8], [w - 4, 4], [w - 8, h - 6], [4, h - 2]]);
  castShadow(c, sheet, 10, 3, 8, 0.28); piece(c, sheet, '#fffaf0', { mul: 0.3, scr: 0.15 });
  clipped(c, sheet, () => {
    for (let y = 58; y < h - 20; y += 30) piece(c, rectP(0, y, w, 1.2), '#e8d9bf', { mul: 0.3 });
    piece(c, rectP(w / 2 - 0.8, 0, 1.6, h), '#efe3cc', { mul: 0.3 }); piece(c, rectP(0, h / 2 - 0.8, w, 1.6), '#efe3cc', { mul: 0.3 });   // where it was folded
  });
  scribble(c, lang === 'zh' ? n.zh : n.en, 30, 50, w - 70, lang === 'zh' ? 20 : 18, 30, lang, 900 + n.id, '#6b4a3f', 8);
  c.save(); c.translate(w - 40, h - 36); c.rotate(-0.25); pawPrint(c, 0, 0, 1.1, '#c98b7a'); c.restore();
} });
// a page's little picture: a nose for the smell notes, a shoe for the human ones, the place's stamp for the trips, a paw for the wisdom
const NOTE_PLACE = n => n.need ? (n.need.place || (FRIENDS.find(f => f.id === n.need.friends[0]) || {}).place) : null;
ART.def('ui.note.deco', { kind: 'paint', group: 'note', note: 'the little picture on a page of the book: (c, note, x, y, size)', draw: (c, n, x, y, s) => {
  c.save(); c.translate(x, y);
  if (n.cat === 'smell') { c.scale(s / 20, s / 20); ART.paint('parker.part.nose', c, 0, 0, 9, 7); }
  else if (n.cat === 'humans') {                // a little sneaker
    c.scale(s / 40, s / 40); const shoe = new Path2D(); shoe.moveTo(-18, 6); shoe.lineTo(-16, -8); shoe.quadraticCurveTo(-8, -12, -2, -6); shoe.quadraticCurveTo(10, -2, 18, 0); shoe.quadraticCurveTo(21, 6, 16, 8); shoe.lineTo(-16, 8); shoe.closePath();
    pp(c, shoe, '#9cc2e6', 0.2); piece(c, rectP(-18, 5, 37, 4), '#fff6e6', { mul: 0.2 }); for (const k of [0, 1, 2]) piece(c, rectP(-9 + k * 4, -7 + k * 1.2, 3, 1.4), '#fff6e6', { mul: 0.2 });
  } else if (n.cat === 'travel' && NOTE_PLACE(n)) {
    const st = ART.paint('card.stamp', null, NOTE_PLACE(n), 2), w = s * 0.83, h = s; c.rotate(0.06);
    castShadow(c, k => k.drawImage(st, -w / 2, -h / 2, w, h), 2, 1, 2, 0.25); c.drawImage(st, -w / 2, -h / 2, w, h);
  } else pawPrint(c, 0, 0, s / 22, '#c98b7a');
  c.restore();
} });
// the book on a shelf: a small cloth-bound book standing up, a paw on the cover
ART.def('furn.book', { group: 'furn', box: { w: 40, h: 44, ox: 20, oy: 40 }, stick: false, note: 'the little book "Parker Sees the World", standing; origin under its middle', draw: c => {
  const cover = poly([[-11, 0], [11, 0], [12, -34], [-10, -34]]); castShadow(c, cover, 2, 1, 2, 0.25); piece(c, cover, '#5b8ed1', { mul: 0.4 });
  piece(c, rectP(-11, -34, 3.4, 34), '#3f6fb0', { mul: 0.4 }); piece(c, rectP(-5, -27, 13, 9), '#fff6e6', { mul: 0.3 });
  for (const k of [0, 1]) piece(c, rectP(-3, -25 + k * 3.6, 9 - k * 3, 1.2), '#c98b7a', { mul: 0.3 });
  pawPrint(c, 2, -10, 0.3, '#fff6e6');
} });
// the cover, big: cut-paper cloth with the title on a paper label (c, w, h, lang)
ART.def('ui.book.cover', { kind: 'paint', group: 'note', note: 'the book\'s cover: (c, w, h)', draw: (c, w, h) => {
  const cover = rectP(10, 8, w - 20, h - 16); castShadow(c, cover, 12, 4, 10, 0.3); piece(c, cover, '#5b8ed1', { mul: 0.4 });
  piece(c, rectP(10, 8, 22, h - 16), '#3f6fb0', { mul: 0.4 });
  for (const y of [40, h - 48]) piece(c, rectP(32, y, w - 42, 3), '#7aaad6', { mul: 0.2 });
  const label = poly([[52, 86], [w - 36, 82], [w - 34, 196], [50, 200]]); castShadow(c, label, 4, 1, 3, 0.2); piece(c, label, '#fffaf0', { mul: 0.3 });
  c.fillStyle = '#5b3f37'; c.textAlign = 'center';
  c.font = `600 30px ${FONT}`; c.fillText(T('book.title', 'zh'), (w + 16) / 2, 136);
  c.font = `italic 17px ${FONT}`; c.fillStyle = '#7d6155'; c.fillText(T('book.title', 'en'), (w + 16) / 2, 170);
  for (let k = 0; k < 4; k++) pawPrint(c, 76 + k * ((w - 130) / 3), h - 92 - (k % 2) * 16, 0.7, k % 2 ? '#fff6e6' : '#9cc2e6');
  flower(c, w - 54, 54, 7, '#f8d36a', 3, false); flower(c, 60, h - 60, 6, '#f3b9b0', 4, false);
} });
ART.def('ui.book.page', { kind: 'paint', group: 'note', note: 'one page: (c, note, collected at, lang, w, h)', draw: (c, n, at, lang, w, h) => {
  const pg = rectP(14, 8, w - 24, h - 16); castShadow(c, pg, 10, 3, 8, 0.25); piece(c, pg, '#fffaf0', { mul: 0.3, scr: 0.15 });
  piece(c, rectP(14, 8, 8, h - 16), '#efe3cc', { mul: 0.3 });              // the gutter
  ART.paint('ui.note.deco', c, n, w / 2 + 5, 74, 52);
  scribble(c, lang === 'zh' ? n.zh : n.en, 40, 150, w - 84, lang === 'zh' ? 20 : 18, 31, lang, 900 + n.id, '#6b4a3f', 7);
  const d = new Date(at), date = lang === 'zh' ? `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日` : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  c.fillStyle = '#a08a7e'; c.font = `13px ${FONT}`; c.textAlign = 'right'; c.fillText(date, w - 32, h - 30);
  pawPrint(c, 44, h - 38, 0.55, '#e8c4b8');
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
  if (PV.mode === 'note') { const m = scribble(cvs.getContext('2d'), LANG === 'zh' ? PV.note.zh : PV.note.en, 0, 0, W - 70, LANG === 'zh' ? 20 : 18, 30, LANG, 0, '#000', 8, true); H = Math.max(200, 50 + m.lines * m.lineH + 64); }
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
  const pages = bookPages(), draw = p => { if (p === 0) ART.paint('ui.book.cover', c, W, H); else { const g = pages[p - 1]; ART.paint('ui.book.page', c, NOTE[g.id], g.at, LANG, W, H); } };
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
