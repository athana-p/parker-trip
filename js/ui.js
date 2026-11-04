// ================= UI: bottom bar, panels (shop, backpack, mailbox, Parker's house), debug panel =================
const $ = id => document.getElementById(id);
const UI = { panel: null, cat: 'food', side: 'front' };

// small code-drawn icons for the HTML UI
function iconCanvas(draw, size = 48) {
  const c = document.createElement('canvas'), dpr = window.devicePixelRatio || 1;
  c.width = size * dpr; c.height = size * dpr; c.style.width = c.style.height = size + 'px';
  const x = c.getContext('2d'); x.scale(dpr, dpr); x.translate(size / 2, size / 2); draw(x, size); return c;
}
const itemIcon = (id, size = 52) => iconCanvas(c => drawItem(c, id, size / 60), size);
function coinMini() { return iconCanvas(c => { c.translate(-1, 36 * 0.62); c.scale(0.62, 0.62); const ring = (n, r, rx, ry, col) => { const p = new Path2D(); for (let i = 0; i < n; i++) { const a = i / n * TAU; p.addPath(ell(1 + Math.cos(a) * r, -36 + Math.sin(a) * r, rx, ry, a)); } piece(c, p, col, { mul: 0.4 }); }; ring(14, 6.4, 4.4, 1.9, '#f6c22c'); ring(10, 3.6, 3.2, 1.6, '#fbd648'); piece(c, circ(1, -36, 2.4), '#eaa21c', { mul: 0.4 }); }, 18); }
function el(tag, cls, text) { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }

function buildBar() {
  const shopIco = iconCanvas(c => {          // a little paper shopping bag
    pp(c, poly([[-13, -8], [13, -8], [15, 15], [-15, 15]]), '#f2c46a', 0.2);
    c.save(); c.strokeStyle = '#a8742f'; c.lineWidth = 2; c.beginPath(); c.arc(0, -8, 7, Math.PI, 0); c.stroke(); c.restore();
    pawPrint(c, 0, 4, 0.5, '#c98b3e');
  }, 34);
  const packIco = iconCanvas(c => { c.scale(0.62, 0.62); backpack(c, 0, 4, 0); }, 34);
  const albumIco = iconCanvas(c => {          // a little album with a postcard tucked in
    pp(c, rectP(-14, -11, 28, 24), '#5b8ed1', 0.2); pp(c, rectP(-14, -11, 5, 24), '#3f6fb0', 0);
    c.save(); c.rotate(-0.15); pp(c, rectP(-6, -14, 20, 14), '#fff6e6', 0.15); piece(c, rectP(-4, -12, 16, 8), '#f2b07a', { mul: 0.4 }); c.restore();
  }, 34);
  $('btnShop').prepend(shopIco); $('btnPack').prepend(packIco); $('btnAlbum').prepend(albumIco);
  $('btnAlbum').onclick = () => openPanel('album');
  // top-right: sound on/off and settings, drawn in code like everything else
  const drawMute = () => { const b = $('muteBtn'); b.innerHTML = ''; b.append(iconCanvas(c => {
    pp(c, poly([[-9, -4], [-4, -4], [3, -10], [3, 10], [-4, 4], [-9, 4]]), '#5b3f37', 0.1);
    c.save(); c.strokeStyle = '#5b3f37'; c.lineWidth = 2; c.lineCap = 'round';
    if (SFX.muted) { c.beginPath(); c.moveTo(7, -5); c.lineTo(15, 5); c.moveTo(15, -5); c.lineTo(7, 5); c.stroke(); }
    else for (const r of [6, 11]) { c.beginPath(); c.arc(3, 0, r, -0.8, 0.8); c.stroke(); }
    c.restore(); }, 26)); b.setAttribute('aria-label', T(SFX.muted ? 'ui.soundOff' : 'ui.soundOn')); };
  drawMute(); $('muteBtn').onclick = () => { SFX.unlock(); SFX.setMuted(!SFX.muted); drawMute(); if (UI.panel === 'settings') renderPanel(); };
  UI.drawMute = drawMute;
  $('setBtn').append(iconCanvas(c => { const g = new Path2D(); for (let i = 0; i < 8; i++) { const a = i / 8 * TAU; g.addPath(poly([[Math.cos(a - 0.2) * 7, Math.sin(a - 0.2) * 7], [Math.cos(a - 0.15) * 11, Math.sin(a - 0.15) * 11], [Math.cos(a + 0.15) * 11, Math.sin(a + 0.15) * 11], [Math.cos(a + 0.2) * 7, Math.sin(a + 0.2) * 7]])); } g.addPath(circ(0, 0, 8)); pp(c, g, '#5b3f37', 0.1); pp(c, circ(0, 0, 3.4), '#fffaf0', 0); }, 26));
  $('setBtn').onclick = () => openPanel('settings');
  $('btnShop').onclick = () => openPanel('shop');
  $('btnPack').onclick = () => openPanel('pack');
  $('panelClose').onclick = closePanel;
}
function openPanel(kind) {
  UI.panel = kind; UI.side = 'front'; UI.view = null;
  if (kind === 'shop' || kind === 'pack') { bagRustle(); SFX.bag(); }
  renderPanel(); $('panel').classList.remove('hidden'); $('bar').classList.add('hidden');
}
function closePanel() {
  if (UI.panel === 'shelf') { S.shelf.forEach(s => s.isNew = false); writeSave(S); }
  UI.panel = null; $('panel').classList.add('hidden'); $('bar').classList.remove('hidden');
}
function renderPanel() {
  const body = $('panelBody'); body.innerHTML = '';
  const titles = { shop: 'ui.shop', pack: 'ui.pack', mail: 'ui.mail', shelf: 'ui.shelf', album: 'ui.album', settings: 'ui.settings' };
  $('panelTitle').textContent = T(titles[UI.panel]);
  ({ shop: renderShop, pack: renderPack, mail: renderMail, shelf: renderShelf, album: renderAlbum, settings: renderSettings })[UI.panel](body);
}
function refreshCoins() { shown = S.dandelions; updateHUD(false); }

function renderShop(body) {
  const tabs = el('div', 'tabs');
  for (const c of CATS) { const b = el('button', 'tab' + (UI.cat === c ? ' on' : ''), T('ui.cat.' + c)); b.onclick = () => { UI.cat = c; renderPanel(); }; tabs.append(b); }
  body.append(tabs);
  const list = el('div', 'items');
  for (const it of ITEMS.filter(i => i.cat === UI.cat)) {
    const row = el('div', 'item'), owned = it.cat === 'toy' && S.toys.includes(it.id), have = S.inv[it.id] || 0;
    const txt = el('div', 'item-text'); txt.append(el('div', 'item-name', T('item.' + it.id)), el('div', 'item-desc', T('item.' + it.id + '.d')));
    if (have) txt.append(el('div', 'item-have', T('ui.have', LANG, { n: have })));
    const price = el('span', 'price'); price.append(coinMini(), document.createTextNode(it.price));
    const btn = el('button', 'pill btn buy', owned ? T('ui.owned') : T('ui.buy'));
    btn.disabled = owned; if (!owned && S.dandelions < it.price) btn.classList.add('poor');
    btn.onclick = () => {
      if (S.dandelions < it.price) { showToast('ui.notEnough', 2000); return; }
      if (buy(it.id)) { refreshCoins(); if (it.cat === 'toy') P.want = it.id; renderPanel(); }
    };
    const right = el('div', 'item-buy'); right.append(price, btn);
    row.append(itemIcon(it.id), txt, right); list.append(row);
  }
  body.append(list);
}
function renderPack(body) {
  if (S.trip) { body.append(el('p', 'note', T('ui.pack.away'))); return; }
  const slots = el('div', 'slots');
  for (const slot of ['food', 'charm']) {
    const id = S.pack[slot], b = el('button', 'slot' + (id ? ' full' : ''));
    b.append(el('div', 'slot-label', T('ui.slot.' + slot)));
    if (id) { b.append(itemIcon(id, 60), el('div', 'slot-name', T('item.' + id)), el('div', 'slot-hint', T('ui.tapToRemove'))); b.onclick = () => { unpack(slot); renderPanel(); }; }
    else b.append(el('div', 'slot-empty', T('ui.slot.empty')));
    slots.append(b);
  }
  body.append(slots, el('p', 'note', T(S.pack.food ? 'ui.pack.ready' : 'ui.pack.note')));
  body.append(el('h3', 'sub', T('ui.inv')));
  const inv = ITEMS.filter(i => i.cat !== 'toy' && S.inv[i.id] > 0);
  if (!inv.length) { body.append(el('p', 'note', T('ui.inv.none'))); return; }
  const grid = el('div', 'inv');
  for (const it of inv) { const b = el('button', 'inv-item'); b.append(itemIcon(it.id, 46), el('div', 'inv-name', T('item.' + it.id)), el('div', 'inv-count', '×' + S.inv[it.id])); b.onclick = () => { packItem(it.id); renderPanel(); }; grid.append(b); }
  body.append(grid);
}
function renderMail(body) {
  if (!S.mail.length) { body.append(el('p', 'note', T('ui.mail.empty'))); return; }
  const m = S.mail[0], wrap = flipCard(m.dest, renderPanel);
  body.append(wrap, el('p', 'note center', T('ui.mail.flip') + (S.mail.length > 1 ? `  ·  1 / ${S.mail.length}` : '')));
  const keep = el('button', 'pill btn wide', T('ui.mail.keep')); keep.onclick = () => { keepCard(); UI.side = 'front'; S.mail.length ? renderPanel() : closePanel(); };
  body.append(keep);
}
function renderShelf(body) {
  body.append(el('p', 'note', T('ui.shelf.note')));
  const dpr = Math.min(2, window.devicePixelRatio || 1), W = 340, H = 350, c = document.createElement('canvas');
  c.width = W * dpr; c.height = H * dpr; c.className = 'shelf'; const x = c.getContext('2d'); x.scale(dpr, dpr);
  piece(x, rectP(0, 0, W, H), '#f3d9a8', { scr: 0.25 });
  for (let k = 0; k < 9; k++) piece(x, rectP(0, k * 38, W, 2), '#e6c48d', { mul: 0.4 });
  const have = Object.fromEntries(S.shelf.map(s => [s.id, s]));
  for (let r = 0; r < 3; r++) {
    const by = 92 + r * 108;
    pp(x, rectP(8, by, W - 16, 12), '#b57a4a', 0.3); piece(x, rectP(8, by, W - 16, 3), '#d39b66', { mul: 0.4 });
    for (let k = 0; k < 4; k++) {
      const d = DESTS[r * 4 + k], cx = 48 + k * 81, s = have[d.id];
      if (s) { if (s.isNew) glow(x, cx, by - 26, 44, '255,236,170', 0.7); x.save(); x.translate(cx, by); drawSouvenir(x, d.id, 1); x.restore(); }
      else { x.save(); x.setLineDash([3, 4]); x.strokeStyle = 'rgba(150,110,80,0.4)'; x.lineWidth = 1.5; x.strokeRect(cx - 22, by - 52, 44, 50); x.restore(); }
      x.fillStyle = s ? '#6b4a3f' : 'rgba(107,74,63,0.4)'; x.font = `600 11px ${FONT}`; x.textAlign = 'center';
      x.fillText(s ? T('sv.' + d.id) : (d.rare ? '★' : '?'), cx, by + 26);
    }
  }
  body.append(c);
}

// a postcard that turns over when tapped (mailbox + album)
function flipCard(id, onFlip) {
  const dpr = Math.min(2, window.devicePixelRatio || 1), wrap = el('button', 'card'), cvs = document.createElement('canvas');
  const src = postcardCanvas(id, UI.side, dpr); cvs.width = src.width; cvs.height = src.height; cvs.getContext('2d').drawImage(src, 0, 0);
  wrap.append(cvs); wrap.onclick = () => { UI.side = UI.side === 'front' ? 'back' : 'front'; wrap.classList.add('flip'); setTimeout(onFlip, 160); };
  return wrap;
}
function renderAlbum(body) {
  const got = DESTS.filter(d => S.album[d.id]).length;
  if (UI.view) {
    const d = UI.view;
    body.append(flipCard(d, renderPanel), el('p', 'note center', `${T('pc.' + d + '.name')} · ${T('pc.' + d + '.country')}  ·  ${T('ui.album.got', LANG, { n: S.album[d] })}`), el('p', 'note center', T('ui.mail.flip')));
    const back = el('button', 'pill btn wide', T('ui.album.back')); back.onclick = () => { UI.view = null; UI.side = 'front'; renderPanel(); }; body.append(back);
    return;
  }
  body.append(el('p', 'note', T('ui.album.note', LANG, { n: got })));
  const grid = el('div', 'album'), jobs = [];
  for (const d of DESTS) {
    const cell = el('button', 'album-cell' + (S.album[d.id] ? '' : ' empty'));
    if (S.album[d.id]) {
      const c = document.createElement('canvas'); c.width = 180; c.height = 120; cell.append(c);
      jobs.push(() => { const src = postcardCanvas(d.id, 'front', 0.4); c.getContext('2d').drawImage(src, 0, 0, 180, 120); });
      cell.onclick = () => { UI.view = d.id; UI.side = 'front'; renderPanel(); };
      cell.append(el('span', 'album-name', T('pc.' + d.id + '.name')));
    } else { cell.append(el('span', 'album-q', d.rare ? '★' : '?')); cell.title = T('ui.album.locked'); }
    grid.append(cell);
  }
  body.append(grid);
  const next = () => { const j = jobs.shift(); if (j) { j(); setTimeout(next, 16); } }; setTimeout(next, 30);   // draw thumbnails one by one
}

// ---------- settings: language, sound, export / import the save ----------
function saveCode() { const json = JSON.stringify({ app: 'parker-trip', exportedAt: new Date().toISOString(), save: S }); return 'PT1:' + btoa(unescape(encodeURIComponent(json))); }
function readSaveText(text) {
  text = (text || '').trim(); let obj;
  if (text.startsWith('PT1:')) obj = JSON.parse(decodeURIComponent(escape(atob(text.slice(4)))));
  else obj = JSON.parse(text);
  const s = migrateSave(obj && obj.app === 'parker-trip' ? obj.save : obj);
  if (!s || typeof s.dandelions !== 'number' || !Array.isArray(s.field)) throw new Error('bad');
  return s;
}
function renderSettings(body) {
  const row = (label, ...ctrls) => { const r = el('div', 'set-row'); r.append(el('span', 'set-label', label), ...ctrls); body.append(r); };
  const lang = el('button', 'pill btn', LANG === 'zh' ? 'English' : '中文'); lang.onclick = () => $('langBtn').click();
  const snd = el('button', 'pill btn', T(SFX.muted ? 'ui.soundOff' : 'ui.soundOn')); snd.onclick = () => $('muteBtn').click();
  row(T('ui.language'), lang); row(T('ui.sound'), snd);
  body.append(el('h3', 'sub', T('ui.save')), el('p', 'note', T('ui.save.note')));
  const exp = el('button', 'pill btn wide', T('ui.export.file'));
  exp.onclick = () => {
    try {
      const blob = new Blob([JSON.stringify({ app: 'parker-trip', exportedAt: new Date().toISOString(), save: S }, null, 1)], { type: 'application/json' });
      const a = document.createElement('a'), d = new Date(); a.href = URL.createObjectURL(blob); a.download = `parker-trip-save-${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}.json`;
      document.body.append(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 2000);
      status.textContent = T('ui.export.fileDone');
    } catch (e) { status.textContent = T('ui.export.fileFail'); }
  };
  const code = el('textarea', 'code'); code.id = 'saveCode'; code.readOnly = true; code.value = saveCode(); code.rows = 3;
  const copy = el('button', 'pill btn wide', T('ui.export.copy'));
  copy.onclick = () => {
    const done = () => status.textContent = T('ui.export.copied');
    const fallback = () => { code.focus(); code.select(); status.textContent = T('ui.export.selectAll'); };
    try { navigator.clipboard.writeText(code.value).then(done, fallback); } catch (e) { fallback(); }
  };
  body.append(exp, copy, code);
  body.append(el('h3', 'sub', T('ui.import')), el('p', 'note', T('ui.import.note')));
  const file = document.createElement('input'); file.type = 'file'; file.accept = '.json,.txt,application/json,text/plain'; file.id = 'saveFile'; file.className = 'file';
  const paste = el('textarea', 'code'); paste.id = 'savePaste'; paste.rows = 3; paste.placeholder = T('ui.import.paste');
  file.onchange = () => { const f = file.files[0]; if (!f) return; const r = new FileReader(); r.onload = () => { paste.value = r.result; status.textContent = T('ui.import.loaded'); }; r.readAsText(f); };
  let sure = false; const imp = el('button', 'pill btn wide', T('ui.import.go'));
  imp.onclick = () => {
    let s; try { s = readSaveText(paste.value); } catch (e) { status.textContent = T('ui.import.bad'); return; }
    if (!sure) { sure = true; imp.textContent = T('ui.import.sure'); status.textContent = T('ui.import.warn'); return; }
    S = s; writeSave(S); location.reload();
  };
  const status = el('p', 'note center'); status.setAttribute('role', 'status');
  body.append(file, paste, imp, status);
}

// ---------- debug panel (?debug=1) ----------
// opens with ?debug=1, #debug (works in the preview link), or 5 quick taps on the dandelion counter
const DBG_KEY = 'parker-trip-debug';
function debugOn() { try { return DEV.get('debug') === '1' || location.hash === '#debug' || localStorage.getItem(DBG_KEY) === '1'; } catch (e) { return false; } }
function wireDebugTaps() {
  let n = 0, t = 0;
  $('coins').addEventListener('click', () => {
    const now = performance.now(); n = now - t < 600 ? n + 1 : 1; t = now;
    if (n < 5) return; n = 0;
    const on = $('dbg').hidden; try { localStorage.setItem(DBG_KEY, on ? '1' : '0'); } catch (e) { }
    if (on) buildDebug(true); else { $('dbg').hidden = true; Clock.speed = 1; }
  });
}
function buildDebug(force) {
  if (!force && !debugOn()) return;
  const d = $('dbg'); d.hidden = false;
  if (d.dataset.built) return; d.dataset.built = '1';
  const row = el('div', 'dbg-row'); row.append(el('b', '', T('dbg.speed')));
  for (const sp of [1, 60, 600]) { const b = el('button', 'dbg-b', '×' + sp); b.dataset.sp = sp; b.onclick = () => { Clock.speed = sp; debugRefresh(); }; row.append(b); }
  const acts = el('div', 'dbg-row');
  const act = (k, f) => { const b = el('button', 'dbg-b', T(k)); b.onclick = f; acts.append(b); return b; };
  act('dbg.add', () => { S.dandelions += 50; writeSave(S); refreshCoins(); if (UI.panel) renderPanel(); });
  act('dbg.leave', () => { if (S.trip) return; if (!S.pack.food) S.pack.food = 'onigiri'; S.leaveAt = Clock.now(); worldTick(); });
  act('dbg.home', () => { if (!S.trip) return; S.trip.cards = S.trip.cards.filter(t => t <= Clock.now()); S.trip.returnAt = Clock.now(); worldTick(); });
  act('dbg.card', () => { const dest = S.trip ? S.trip.dest : DESTS[Math.floor(Math.random() * DESTS.length)].id; S.mail.push({ dest, at: Clock.now() }); writeSave(S); showToast('toast.mail', 3000); });
  let sure = false; const rb = act('dbg.reset', () => {
    if (!sure) { sure = true; rb.textContent = T('dbg.resetSure'); setTimeout(() => { sure = false; rb.textContent = T('dbg.reset'); }, 3000); return; }
    try { localStorage.removeItem(SAVE_KEY); localStorage.removeItem(CLOCK_KEY); } catch (e) { } window.onpagehide = null; S = null; location.reload();
  });
  d.append(el('div', 'dbg-title', T('dbg.title')), row, acts, el('div', 'dbg-status'));
  window.debugRefresh = () => {
    d.querySelectorAll('[data-sp]').forEach(b => b.classList.toggle('on', +b.dataset.sp === Clock.speed));
    try { localStorage.setItem(CLOCK_KEY, String(Clock.offset)); } catch (e) { }
    const now = Clock.now(), m = t => Math.max(0, Math.round((t - now) / 60000)) + ' min';
    const st = S.trip ? `${S.trip.dest} · home in ${m(S.trip.returnAt)} · cards ${S.trip.cards.length}` : S.leaveAt ? `leaves in ${m(S.leaveAt)}` : 'home';
    d.querySelector('.dbg-status').textContent = `${new Date(now).toLocaleTimeString()} · ${st} · mail ${S.mail.length}`;
  };
  debugRefresh();
}
