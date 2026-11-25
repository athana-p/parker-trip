// ================= DECORATING HIS ROOM (cabin and big house) =================
// In his room, 装修 opens a tray along the bottom and lifts the room a little so the whole floor shows above it.
//   floor things stand on the floor in one of three rows (back, middle, front — the front row hides what's behind it)
//   wall things hang anywhere on the wall
//   small things (his souvenirs) sit on any surface: the floor, a shelf, a window sill; a shelf carries what's on it
// Drag to place; tap something placed to flip it or put it back in the tray; drop it on the tray to put it away.
// Nothing may cover the door or a window: while it would, it goes see-through and the door / windows light up,
// and if you let go there it slides back to where it was. The layout is saved (S.decor). When the house grows, a
// layout you've arranged is kept and whatever no longer fits goes back to the tray; one you never touched is
// swapped for the new house's own arrangement.

// the things that can be put in the room (stage 5's furniture shop adds more). surf = the top you can put things on.
const DECOR = {
  bed: { kind: 'floor', art: 'furn.bed', name: 'decor.bed' },
  shelfL: { kind: 'wall', art: 'furn.shelf.long', surf: [-74, 74], name: 'decor.shelfL' },
  shelfS: { kind: 'wall', art: 'furn.shelf.short', surf: [-42, 42], name: 'decor.shelfS' },
  book: { kind: 'small', art: 'furn.book', name: 'book.title' },          // "Parker Sees the World" (comes with his first note)
  sqnest: { kind: 'floor', art: 'furn.sqnest', name: 'decor.sqnest' },    // the visitors' homes (they come when one moves in)
  catbed: { kind: 'floor', art: 'furn.catbed', name: 'decor.catbed' },
};
const DECOR_START = { bed: 1, shelfL: 4, shelfS: 3 };          // what comes with the cabin
// each house's own arrangement (yc = height of a wall thing's top below the ceiling)
const DECOR_DEFAULT = {
  2: [['bed', { x: 300, row: 1 }], ['shelfL', { x: 100, yc: 64 }], ['shelfL', { x: 280, yc: 64 }], ['shelfS', { x: 300, yc: 150 }], ['shelfS', { x: 300, yc: 232 }], ['shelfS', { x: 170, yc: 232 }]],
  3: [['bed', { x: 540, row: 1 }], ['shelfL', { x: 100, yc: 62 }], ['shelfL', { x: 268, yc: 62 }], ['shelfL', { x: 436, yc: 62 }], ['shelfS', { x: 572, yc: 62 }], ['shelfS', { x: 572, yc: 150 }], ['shelfL', { x: 250, yc: 240 }]],
};
const ROW_K = [0.94, 1, 1.06], SMALL_GAP = 30, DECOR_LIFT = 64;
const DECO = { on: false, press: null, held: null, sel: null, snap: null, ptr: null };

const isSmall = id => id.startsWith('sv:');
const decorDef = id => isSmall(id) ? { kind: 'small', art: 'souvenir.' + id.slice(3), key: `souvenir.${id.slice(3)}|${SV_K}`, name: 'sv.' + id.slice(3), k: SV_K } : { ...DECOR[id], key: DECOR[id].art, k: 1 };
const decorItems = () => (S.decor && S.decor.items) || [];
const decorByUid = uid => decorItems().find(r => r.uid === uid);
const placedCount = id => decorItems().filter(r => r.id === id).length;

// ---------- where things are ----------
function decorAnchor(r, g) {
  const d = decorDef(r.id);
  if (d.kind === 'floor') return [r.x, g.rows[r.row], ROW_K[r.row]];
  if (d.kind === 'wall') return [r.x, g.C + r.yc, 1];
  const s = surfaceOf(r, g); if (!s) return null;
  return [s.host ? s.host.x + r.dx : r.x, s.y, s.row != null ? ROW_K[s.row] : 1];
}
function decorRect(r, g, a = decorAnchor(r, g)) {
  if (!a) return null;
  const d = decorDef(r.id), b = ART.get(d.art).box, k = a[2] * d.k;
  return [a[0] - b.ox * k, a[1] - b.oy * k, a[0] + (b.w - b.ox) * k, a[1] + (b.h - b.oy) * k];
}
// the places a small thing can sit: the three floor rows, the window sills, the top of every shelf
function decorSurfaces(g, R, skipUid) {
  const out = [0, 1, 2].map(i => ({ key: 'row:' + i, x0: 26, x1: R.w - 26, y: g.rows[i], row: i }));
  R.windows.forEach((w, i) => out.push({ key: 'sill:' + i, x0: w.x - w.w / 2 + 4, x1: w.x + w.w / 2 - 4, y: g.C + w.top + w.h + 6 }));
  for (const h of decorItems()) { const d = decorDef(h.id); if (d.surf && h.uid !== skipUid) out.push({ key: 'on:' + h.uid, x0: h.x + d.surf[0], x1: h.x + d.surf[1], y: g.C + h.yc, host: h }); }
  return out;
}
function surfaceOf(r, g) {
  const R = roomR(), k = r.surf || '';
  if (k.startsWith('row:')) { const i = +k.slice(4); return { y: g.rows[i], row: i, x0: 26, x1: R.w - 26 }; }
  if (k.startsWith('sill:')) { const w = R.windows[+k.slice(5)]; return w ? { y: g.C + w.top + w.h + 6, x0: w.x - w.w / 2 + 4, x1: w.x + w.w / 2 - 4 } : null; }
  if (k.startsWith('on:')) { const h = decorByUid(+k.slice(3)); if (!h) return null; const d = decorDef(h.id); return { y: g.C + h.yc, host: h, x0: h.x + d.surf[0], x1: h.x + d.surf[1] }; }
  return null;
}
// the door and the windows (with their frames, curtains and sills) must stay clear
function decorBlocks(g, R) {
  const d = R.door, out = [[d.x - d.w / 2 - 12, g.F0 - d.h - 12, d.x + d.w / 2 + 12, g.F0]];
  for (const w of R.windows) out.push([w.x - w.w / 2 - 18, g.C + w.top - 12, w.x + w.w / 2 + 18, g.C + w.top + w.h + 14]);
  return out;
}
const overlap = (a, b, m = 0) => a[0] < b[2] - m && b[0] < a[2] - m && a[1] < b[3] - m && b[1] < a[3] - m;
function decorValid(r, g = roomGeom(), R = roomR()) {
  const d = decorDef(r.id), rect = decorRect(r, g); if (!rect) return false;
  const sill = (r.surf || '').startsWith('sill:') ? +r.surf.slice(5) + 1 : -1;      // on a window sill: that window is fine
  if (decorBlocks(g, R).some((b, i) => i !== sill && overlap(rect, b))) return false;
  if (d.kind === 'wall') {
    if (rect[0] < 16 || rect[2] > R.w - 16 || rect[1] < g.C + 10 || rect[3] > g.F0 - 12) return false;
    if (decorItems().some(o => o !== r && decorDef(o.id).kind === 'wall' && overlap(rect, decorRect(o, g), 2))) return false;
    return !decorItems().some(o => o.surf === 'on:' + r.uid && !decorValid(o, g, R));     // and what stands on it must fit too
  }
  if (d.kind === 'floor') { if (rect[0] < 16 || rect[2] > R.w - 16) return false; return !decorItems().some(o => o !== r && o.row === r.row && decorDef(o.id).kind === 'floor' && overlap(rect, decorRect(o, g), 6)); }
  const s = surfaceOf(r, g); if (!s) return false; const x = s.host ? s.host.x + r.dx : r.x;
  if (x < s.x0 - 1 || x > s.x1 + 1) return false;
  return !decorItems().some(o => o !== r && decorDef(o.id).kind === 'small' && o.surf === r.surf && Math.abs(decorAnchor(o, g)[0] - x) < SMALL_GAP - 4);
}

// ---------- setting up, checking, putting things away ----------
function decorAdd(id, props) { const r = { uid: ++S.decor.seq, id, ...props }; S.decor.items.push(r); return r; }
function decorRemove(r) {           // back to the tray, with everything that sits on it
  S.decor.items = S.decor.items.filter(o => o !== r && !(o.surf === 'on:' + r.uid));
}
function decorDefault(lv) {
  S.decor.items = [];
  for (const [id, p] of DECOR_DEFAULT[lv] || []) if (placedCount(id) < (S.furn[id] || 0)) decorAdd(id, p);
  for (const s of S.shelf) { S.decor.seen[s.id] = true; autoPlaceSmall('sv:' + s.id); }
  if (S.furn.book) { S.decor.seen.book = true; autoPlaceBook(); }
  for (const id of ['sqnest', 'catbed']) if (S.furn[id]) { S.decor.seen[id] = true; autoPlaceFloor(id); }
}
// a small thing goes on the first free spot: shelves (top to bottom, left to right), sills, then the back of the floor
function autoPlaceSmall(id, prefer) {
  const g = roomGeom(), R = roomR();
  const surfs = decorSurfaces(g, R).sort((a, b) => (a.key.startsWith('on:') ? 0 : a.key.startsWith('sill') ? 1 : 2) - (b.key.startsWith('on:') ? 0 : b.key.startsWith('sill') ? 1 : 2) || a.y - b.y || a.x0 - b.x0).filter(s => s.key !== 'row:1' && s.key !== 'row:2');
  for (const s of prefer ? [prefer] : surfs) {
    const n = Math.floor((s.x1 - s.x0) / SMALL_GAP) + 1, pad = (s.x1 - s.x0 - (n - 1) * SMALL_GAP) / 2;
    for (let i = 0; i < n; i++) {
      const x = n === 1 ? (s.x0 + s.x1) / 2 : s.x0 + pad + i * SMALL_GAP, r = { uid: -1, id, surf: s.key, x, dx: s.host ? x - s.host.x : 0 };
      if (decorValid(r, g, R)) return decorAdd(id, { surf: s.key, x, dx: r.dx });
    }
  }
  return null;
}
// his book finds itself a spot on the floor: by the bed if there is room, else as near the middle as it can
function autoPlaceBook() {
  const g = roomGeom(), R = roomR(), surfs = decorSurfaces(g, R), bed = decorBed();
  for (const key of ['row:0', 'row:1', 'row:2']) {
    const s = surfs.find(q => q.key === key); if (!s) continue;
    const want = clamp(bed ? bed.x - 90 : (s.x0 + s.x1) / 2, s.x0, s.x1);
    for (let d = 0; d <= s.x1 - s.x0; d += 10) for (const x of d ? [want - d, want + d] : [want]) {
      if (x < s.x0 || x > s.x1) continue;
      if (decorValid({ uid: -1, id: 'book', surf: key, x, dx: 0 }, g, R)) return decorAdd('book', { surf: key, x, dx: 0 });
    }
  }
  return autoPlaceSmall('book');
}
// a floor thing finds itself a free spot: the back row first, from the middle of the room outwards
function autoPlaceFloor(id) {
  const g = roomGeom(), R = roomR(), mid = R.w / 2;
  for (const row of [0, 1, 2]) for (let d = 0; d < R.w / 2; d += 12) for (const x of d ? [mid + d, mid - d] : [mid]) if (decorValid({ uid: -1, id, x, row }, g, R)) return decorAdd(id, { x, row });
  return null;
}
function decorEnsure() {
  const lv = houseLevel(); if (lv < 2) return;
  S.furn = S.furn || {}; for (const id in DECOR_START) S.furn[id] = Math.max(S.furn[id] || 0, DECOR_START[id]);
  if (!S.decor) { S.decor = { items: [], seq: 0, seen: {}, custom: false, level: lv }; decorDefault(lv); }
  else if (S.decor.level !== lv) { S.decor.level = lv; if (!S.decor.custom) decorDefault(lv); }
  // whatever no longer fits (a different room, the door or a window moved) goes back to the tray
  const g = roomGeom(), R = roomR(); let back = 0;
  for (const kind of ['wall', 'floor', 'small']) for (const r of decorItems().filter(o => decorDef(o.id).kind === kind)) if (!S.decor.items.includes(r)) continue; else if (!decorValid(r, g, R)) { decorRemove(r); back++; }
  for (const s of S.shelf) if (!S.decor.seen[s.id]) { S.decor.seen[s.id] = true; if (!placedCount('sv:' + s.id)) autoPlaceSmall('sv:' + s.id); }   // new souvenirs set themselves out
  if (S.furn.book && !S.decor.seen.book) { S.decor.seen.book = true; if (!placedCount('book')) autoPlaceBook(); }                      // so does his book
  for (const id of ['sqnest', 'catbed']) if (S.furn[id] && !S.decor.seen[id]) { S.decor.seen[id] = true; if (!placedCount(id)) autoPlaceFloor(id); }   // and a visitor's new home
  if (back) toastText(T('decor.back'), 3500);
  writeSave(S);
}
// what's in the tray: furniture not yet placed, souvenirs not on display
function decorTray() {
  const out = [];
  for (const id in DECOR) { const n = (S.furn[id] || 0) - placedCount(id); if (n > 0) out.push({ id, n }); }
  for (const s of S.shelf) if (!placedCount('sv:' + s.id)) out.push({ id: 'sv:' + s.id, n: 1 });
  return out;
}
function decorBed() { return decorItems().find(r => r.id === 'bed') || null; }

// ---------- drawing (called by drawRoom, camera already applied) ----------
function drawDecorScene(g, R, drawParker) {
  const items = decorItems(), held = DECO.held && DECO.held.rec, put = (r) => {
    if (r === held) return; const a = decorAnchor(r, g); if (!a) return; const d = decorDef(r.id);
    const sn = DECO.snap && DECO.snap.uid === r.uid ? [1.08, 0.96, 1][Math.min(2, Math.floor((TT - DECO.snap.t0) * 12))] : 1;
    const wig = ROOMV.wiggle && ROOMV.wiggle.id === r.id ? Math.sin((TT - ROOMV.wiggle.t0) * 24) * 0.12 * clamp(1 - (TT - ROOMV.wiggle.t0) / 0.6) : 0;
    if (isSmall(r.id)) { const s = S.shelf.find(q => 'sv:' + q.id === r.id); if (s && s.isNew) ART.draw('fx.glow', ctx, a[0], a[1] - 16, 30, '255,236,170', 0.5 + 0.15 * Math.sin(TT * 2)); }
    drawSprite(sprite(d.key), a[0], a[1], { sx: r.f ? -1 : 1, scale: a[2] * sn, rot: wig, shA: d.kind === 'wall' ? 0.25 : 0.2 });
    if (r.id === 'catbed' || r.id === 'sqnest') drawHomeOverlay(r, a);           // who lives in it (js/homes.js)
    if (DECO.on && DECO.sel === r) { const rc = decorRect(r, g, a); ctx.save(); ctx.setLineDash([4, 3]); ctx.strokeStyle = 'rgba(255,250,235,0.95)'; ctx.lineWidth = 1.6; ctx.strokeRect(rc[0] - 3, rc[1] - 3, rc[2] - rc[0] + 6, rc[3] - rc[1] + 6); ctx.restore(); }
    for (const o of items) if (o.surf === 'on:' + r.uid) put(o);          // what sits on it
  };
  for (const r of items) if (decorDef(r.id).kind === 'wall') put(r);
  for (const r of items) if ((r.surf || '').startsWith('sill:')) put(r);
  const prow = P.inRoom && P.present ? (P.onBed && decorBed() ? decorBed().row : 1) : -1;
  for (let row = 0; row < 3; row++) {
    for (const r of items.filter(o => decorDef(o.id).kind === 'floor' && o.row === row).sort((a, b) => a.x - b.x)) put(r);
    for (const r of items) if (r.surf === 'row:' + row) put(r);
    if (row === prow) drawParker(row);
    if (HOMEV.run && HOMEV.run.row === row) drawHomeRun(g);
  }
  if (DECO.on && (DECO.held || DECO.sel)) {     // the door and windows: keep them clear
    const bad = DECO.held && !DECO.held.ok;
    ctx.save(); ctx.setLineDash([5, 4]); ctx.lineWidth = bad ? 2.4 : 1.2; ctx.strokeStyle = bad ? 'rgba(230,110,90,0.9)' : 'rgba(255,250,235,0.55)';
    for (const b of decorBlocks(g, R)) ctx.strokeRect(b[0], b[1], b[2] - b[0], b[3] - b[1]); ctx.restore();
  }
  if (held) {                          // the thing in your hand: a little bigger, a deeper shadow, see-through where it can't go
    const a = DECO.held.free || decorAnchor(held, g); if (!a) return;
    const d = decorDef(held.id), sp = sprite(d.key);
    ctx.save(); ctx.globalAlpha = DECO.held.ok ? 1 : 0.5;
    ART.draw('live.shadow.parker', ctx, a[0], a[1] + 10, 40 * a[2] * d.k * (d.kind === 'small' ? 0.6 : 1.4), 6, 0.9);
    drawSprite(sp, a[0], a[1] - 8, { sx: held.f ? -1 : 1, scale: a[2] * 1.08, shA: 0.45 });
    for (const o of items) if (o.surf === 'on:' + held.uid) { const b = decorAnchor(o, g); if (b) drawSprite(sprite(decorDef(o.id).key), b[0], b[1] - 8, { sx: o.f ? -1 : 1, scale: 1.08 }); }
    ctx.restore();
  }
}
// what is under a point of the room (front to back)
function decorHit(rx, y, g = roomGeom()) {
  const items = decorItems(), order = [];
  for (let row = 2; row >= 0; row--) { for (const r of items) if (r.surf === 'row:' + row) order.push(r); for (const r of items.filter(o => decorDef(o.id).kind === 'floor' && o.row === row)) { for (const o of items) if (o.surf === 'on:' + r.uid) order.push(o); order.push(r); } }
  for (const r of items) if ((r.surf || '').startsWith('sill:')) order.push(r);
  for (const r of items.filter(o => decorDef(o.id).kind === 'wall')) { for (const o of items) if (o.surf === 'on:' + r.uid) order.push(o); order.push(r); }
  return order.find(r => { const rc = decorRect(r, g); return rc && rx > rc[0] - 4 && rx < rc[2] + 4 && y > rc[1] - 4 && y < rc[3] + 4; }) || null;
}

// ---------- decorate mode ----------
function startDecor() {
  if (!ROOMV.on || DECO.on) return;
  decorEnsure(); DECO.on = true; DECO.sel = null; ROOMV.liftTo = DECOR_LIFT; hideToast();
  document.getElementById('roomBar').classList.add('hidden'); document.getElementById('decor').classList.remove('hidden');
  renderTray(); SFX.paper(4);
}
function endDecor() {
  if (!DECO.on) return;
  DECO.on = false; DECO.sel = null; DECO.held = null; DECO.press = null; ROOMV.liftTo = 0; placeTools();
  document.getElementById('decor').classList.add('hidden'); showBars(); writeSave(S);
}
// the room rises while decorating so the floor stays clear of the tray
function decorTick(dt) {
  const to = ROOMV.liftTo || 0, l = ROOMV.lift || 0; if (l !== to) ROOMV.lift = Math.abs(to - l) < 0.5 ? to : l + (to - l) * Math.min(1, dt * 10);
  if (DECO.held && DECO.ptr) {         // near the edge of the wide room while holding something: it slides
    const R = roomR(), e = DECO.ptr[0]; if (R.w > SCENE_W && (e < 34 || e > SCENE_W - 34)) { ROOMV.cam = clamp(ROOMV.cam + (e < 34 ? -1 : 1) * 220 * dt, 0, R.w - SCENE_W); decorDragTo(...DECO.ptr); }
  }
  if (DECO.snap && TT - DECO.snap.t0 > 0.3) DECO.snap = null;
  if (DECO.on) placeTools();
}
const trayTop = () => { const el = document.getElementById('decor'), r = el.getBoundingClientRect(), c = cv.getBoundingClientRect(); return (r.top - c.top) / c.height * V.H; };
function decorDown(e, x, y) {
  const r = decorHit(x + ROOMV.cam, y);
  if (r) { const a = decorAnchor(r, roomGeom()); DECO.press = { id: e.pointerId, rec: r, x0: x, y0: y, off: [a[0] - x - ROOMV.cam, a[1] - y], moved: false }; try { cv.setPointerCapture(e.pointerId); } catch (err) { } return; }
  ROOMV.drag = { id: e.pointerId, x0: x, y0: y, cam0: ROOMV.cam, moved: false, decor: true };
  try { cv.setPointerCapture(e.pointerId); } catch (err) { }
}
function decorMove(e, x, y) {
  const p = DECO.press; if (!p || e.pointerId !== p.id) return false;
  if (!p.moved && Math.hypot(x - p.x0, y - p.y0) > 6) { p.moved = true; pickUp(p.rec, p.off, false); }
  if (p.moved) decorDragTo(x, y);
  return true;
}
function decorUp(e, x, y) {
  const p = DECO.press; if (!p || e.pointerId !== p.id) return false;
  DECO.press = null;
  if (!p.moved) { DECO.sel = DECO.sel === p.rec ? null : p.rec; SFX.pop(); placeTools(); return true; }   // a tap: select it (tap again to let go)
  decorDrop(x, y); return true;
}
function pickUp(rec, off, fromTray) {
  const snapshot = { x: rec.x, yc: rec.yc, row: rec.row, surf: rec.surf, dx: rec.dx };
  DECO.held = { rec, off, from: snapshot, fromTray, ok: true, free: null }; DECO.sel = null; placeTools();
  if (P.onBed && rec.id === 'bed') { P.onBed = false; pickNext(); }          // his bed is being moved: he hops off
  SFX.paper(1);
}
// follow the finger: furniture snaps to the nearest floor row, wall things stay on the wall, small things float free
function decorDragTo(x, y) {
  const H = DECO.held; if (!H) return; DECO.ptr = [x, y];
  const g = roomGeom(), R = roomR(), r = H.rec, d = decorDef(r.id), ax = x + ROOMV.cam + H.off[0], ay = y + H.off[1];
  if (d.kind === 'floor') { let best = 1; for (let i = 0; i < 3; i++) if (Math.abs(g.rows[i] - ay) < Math.abs(g.rows[best] - ay)) best = i; r.row = best; r.x = clamp(ax, 30, R.w - 30); H.free = null; }
  else if (d.kind === 'wall') { r.x = clamp(ax, 30, R.w - 30); r.yc = clamp(ay - g.C, 14, g.F0 - g.C - 30); H.free = null; }
  else { const s = bestSurface(ax, ay, g, R, r); H.free = [ax, ay, 1]; if (s) { r.surf = s.key; r.x = clamp(ax, s.x0, s.x1); r.dx = s.host ? r.x - s.host.x : 0; } else r.surf = null; }
  H.ok = y < trayTop() - 6 && decorValid(r, g, R);
}
function bestSurface(x, y, g, R, r) {
  let best = null, bd = 60;
  for (const s of decorSurfaces(g, R, r.uid)) { if (x < s.x0 - 14 || x > s.x1 + 14) continue; const dy = Math.abs(s.y - y); if (dy < bd) { bd = dy; best = s; } }
  return best;
}
function decorDrop(x, y) {
  const H = DECO.held; if (!H) return; DECO.held = null; DECO.ptr = null;
  const g = roomGeom(), R = roomR(), r = H.rec;
  if (y > trayTop() - 6) { decorRemove(r); S.decor.custom = true; SFX.flutter(0.6); renderTray(); writeSave(S); return; }     // dropped on the tray: put away
  if (isSmall(r.id) && r.surf) {       // settle on the surface, nudged to a free spot
    const s = surfaceOf(r, g), want = r.x;
    for (const dd of [0, 8, -8, 16, -16, 24, -24, 32, -32, 40, -40]) { r.x = clamp(want + dd, s.x0, s.x1); r.dx = s.host ? r.x - s.host.x : 0; if (decorValid(r, g, R)) break; }
  }
  if (decorValid(r, g, R)) {           // pat: it lands with a little bounce and a few scraps of paper
    S.decor.custom = true; DECO.snap = { uid: r.uid, t0: TT }; SFX.snap();
    const a = decorAnchor(r, g); for (let i = 0; i < 6; i++) { const t = (i / 5 - 0.5) * 2.4; fx({ type: 'spr', key: `fx.confetti|${['#f5c04a', '#f3b9b0', '#9cc2e6', '#fff6e6'][i % 4]}`, x: a[0] - ROOMV.cam + Math.sin(t) * 12, y: a[1] - 4, vx: Math.sin(t) * 50, vy: -30 - Math.random() * 20, g: 140, life: 0.6, rot: t, vr: 6 }); }
    if (P.inRoom && P.present && decorDef(r.id).kind !== 'wall') P.newThing = r.uid;      // (stage 6: he'll come and sniff it)
  } else if (H.fromTray) { decorRemove(r); SFX.bounce(0.3); }                               // can't go there: back to the tray
  else { Object.assign(r, H.from); SFX.bounce(0.3); }                                         // can't go there: back where it was
  renderTray(); writeSave(S);
}

// ---------- the tray and the tools ----------
function renderTray() {
  const box = document.getElementById('decorTray'); if (!box) return; box.innerHTML = '';
  const list = decorTray();
  if (!list.length) { box.append(el('p', 'decor-empty', T('decor.empty'))); return; }
  for (const it of list) {
    const d = decorDef(it.id), b = el('button', 'decor-item'), c = document.createElement('canvas'), dpr = Math.min(2, window.devicePixelRatio || 1), sz = 52;
    c.width = c.height = sz * dpr; c.style.width = c.style.height = sz + 'px';
    const x = c.getContext('2d'), sp = sprite(isSmall(it.id) ? `souvenir.${it.id.slice(3)}|1` : d.key), k = Math.min(sz / sp.w, sz / sp.h) * 0.95 * dpr;
    x.drawImage(sp.img, (sz * dpr - sp.w * k) / 2, (sz * dpr - sp.h * k) / 2, sp.w * k, sp.h * k);
    b.append(c, el('span', 'decor-name', T(d.name)));
    if (it.n > 1) b.append(el('span', 'decor-n', '×' + it.n));
    trayItemInput(b, it.id);
    box.append(b);
  }
}
// a tap puts it somewhere free in view; pulling it up out of the tray lets you place it yourself
function trayItemInput(b, id) {
  let st = null;
  b.addEventListener('pointerdown', e => { st = { x: e.clientX, y: e.clientY, id: e.pointerId, drag: false }; });
  b.addEventListener('pointermove', e => {
    if (!st || st.drag || e.pointerId !== st.id) return;
    const dx = e.clientX - st.x, dy = e.clientY - st.y;
    if (dy < -10 && Math.abs(dy) > Math.abs(dx)) { st.drag = true; try { b.setPointerCapture(e.pointerId); } catch (err) { } trayPull(id, e); }
  });
  const end = e => { if (!st || e.pointerId !== st.id) return; const was = st; st = null; if (was.drag) { const [x, y] = toScene(e); decorDrop(x, y); } else trayTap(id); };
  b.addEventListener('pointerup', end);
  b.addEventListener('pointercancel', () => { if (st && st.drag) { const H = DECO.held; if (H) { decorRemove(H.rec); DECO.held = null; renderTray(); } } st = null; });
  b.addEventListener('pointermove', e => { if (st && st.drag) { const [x, y] = toScene(e); decorDragTo(x, y); } });
}
function trayPull(id, e) {
  const [x, y] = toScene(e), d = decorDef(id), g = roomGeom();
  const r = decorAdd(id, d.kind === 'floor' ? { x: x + ROOMV.cam, row: 2 } : d.kind === 'wall' ? { x: x + ROOMV.cam, yc: 120 } : { surf: 'row:2', x: x + ROOMV.cam, dx: 0 });
  pickUp(r, [0, d.kind === 'wall' ? -20 : 0], true); decorDragTo(x, y);
}
function trayTap(id) {
  const g = roomGeom(), R = roomR(), d = decorDef(id), mid = ROOMV.cam + SCENE_W / 2;
  let r = null;
  if (d.kind === 'small') r = autoPlaceSmall(id);
  else {
    const xs = []; for (let k = 0; k < 40; k++) xs.push(mid + (k % 2 ? 1 : -1) * Math.ceil(k / 2) * 14);
    const tries = d.kind === 'floor' ? [1, 0, 2].flatMap(row => xs.map(x => ({ x, row }))) : [70, 150, 230, 30].flatMap(yc => xs.map(x => ({ x, yc })));
    for (const p of tries) { const t = { uid: -1, id, ...p }; if (decorValid(t, g, R)) { r = decorAdd(id, p); break; } }
  }
  if (!r) { toastText(T('decor.noRoom'), 2400); return; }
  S.decor.custom = true; DECO.snap = { uid: r.uid, t0: TT }; SFX.snap(); renderTray(); writeSave(S);
  const a = decorAnchor(r, g); if (a && (a[0] < ROOMV.cam + 20 || a[0] > ROOMV.cam + SCENE_W - 20)) ROOMV.cam = clamp(a[0] - SCENE_W / 2, 0, R.w - SCENE_W);
}
// flip / put back, floating above the thing you tapped
function placeTools() {
  const t = document.getElementById('decorTools'); if (!t) return;
  const r = DECO.on && DECO.sel; if (!r || !decorItems().includes(r)) { t.classList.add('hidden'); return; }
  const rc = decorRect(r, roomGeom()), c = cv.getBoundingClientRect(), k = c.width / SCENE_W;
  t.classList.remove('hidden');
  t.style.left = clamp(((rc[0] + rc[2]) / 2 - ROOMV.cam) * k - t.offsetWidth / 2, 6, c.width - t.offsetWidth - 6) + 'px';
  t.style.top = Math.max(60, rc[1] * k - t.offsetHeight - 8) + 'px';
}
function toolFlip() { const r = DECO.sel; if (!r) return; r.f = r.f ? 0 : 1; S.decor.custom = true; DECO.snap = { uid: r.uid, t0: TT }; SFX.paper(3); writeSave(S); }
function toolStore() { const r = DECO.sel; if (!r) return; if (P.onBed && r.id === 'bed') { P.onBed = false; pickNext(); } decorRemove(r); DECO.sel = null; S.decor.custom = true; SFX.flutter(0.6); renderTray(); placeTools(); writeSave(S); }

// ---------- art ----------
for (const [id, half] of [['long', 80], ['short', 48]]) ART.def('furn.shelf.' + id, { group: 'furn', box: { w: half * 2 + 8, h: 20, ox: half + 4, oy: 2 }, stick: false, note: 'a wall shelf; origin on the middle of its top', draw: c => ART.paint('furn.shelf', c, -half, half, 0) });
