// ================= ART LIST: everything the game draws, by id =================
// Every picture in the game is entered here once: an id, a fixed size, an anchor, and the function that draws it.
// The game's rules never call drawing code; they ask for an id. To change how something looks (new drawing code,
// or a ready-made picture file), change its entry here and nothing else.
//
//   kind 'sprite'  a cut-out, drawn once and kept (with its paper shadow):   ART.sprite('parker.sit|calm|0|0')
//                  box = { w, h, ox, oy } in its own units, k = scale in the yard, stick = white sticker edge
//   kind 'part'    a piece of a puppet, used inside other drawings:          const head3q = ART.part('parker.part.head3q', …)
//   kind 'layer'   a big backdrop built once per time of day / season:       ART.layer('scene.sky', palette, H, res)
//   kind 'live'    drawn fresh every frame from the numbers it is given:     ART.draw('live.tugRope', ctx, …)
//   kind 'paint'   drawn straight onto a canvas (icons, panels):             ART.paint('ui.icon.shop', c)
// Any entry can also be painted straight onto a canvas with ART.paint(id, c, …args) (icons in the panels do this).
//
// A sprite key is the id, then its arguments: 'parker.sit|calm|0|0'. Ending a key in '|sn' puts a dab of snow on his nose.
const ART = {
  list: {},                 // id → { id, kind, box, k, stick, draw, group, note }
  images: {},               // sprite key → a ready-made picture that takes the place of the drawing (see useImage)
  res: 2,                   // pixels per scene unit for the pictures that are kept; the game sets it when the screen is laid out
  PAD: 22,                  // room round a sprite for its sticker edge and shadow
  cache: new Map(), CACHE_MAX: 72,

  def(id, e) {
    if (this.list[id]) throw new Error('art: "' + id + '" is entered twice');
    e.id = id; e.kind = e.kind || 'sprite'; if (e.kind === 'sprite') { e.k = e.k === undefined ? 1 : e.k; e.stick = e.stick === undefined ? true : e.stick; }
    this.list[id] = e; return e;
  },
  get(id) { const e = this.list[id]; if (!e) throw new Error('art: nothing is entered as "' + id + '"'); return e; },
  has(id) { return !!this.list[id]; },
  // a piece of a puppet: entered like everything else; the returned function is what other drawings call
  part(id, o, draw) { this.def(id, Object.assign({ kind: 'part', draw }, o)); return (...a) => this.list[id].draw(...a); },

  // ---- sprites: rendered once (sticker edge + soft shadow baked), then reused
  sprite(key) {
    let s = this.cache.get(key);
    if (!s) {
      const sn = key.endsWith('|sn'), a = (sn ? key.slice(0, -3) : key).split('|'), e = this.get(a[0]);
      if (this.images[key]) s = this.fromImage(e, this.images[key]);
      else { HEAD_SNOW = sn; try { s = this.make(c => e.draw(c, a.slice(1)), e.box, e.k, e.stick); } finally { HEAD_SNOW = false; } }
      this.cache.set(key, s); if (this.cache.size > this.CACHE_MAX) this.cache.delete(this.cache.keys().next().value);
    }
    return s;
  },
  make(fn, box, k, stick = true) {
    const res = this.res, PAD = this.PAD, bx = { w: box.w * k, h: box.h * k, ox: box.ox * k, oy: box.oy * k };
    const src = puppetCanvas(bx, res, c => { c.scale(k, k); fn(c); });
    const w = bx.w + PAD * 2, h = bx.h + PAD * 2;
    const img = mk(w * res, h * res), ic = img.getContext('2d'); ic.scale(res, res);
    if (stick) sticker(ic, src, PAD, PAD, { res, shadowA: 0 }); else ic.drawImage(src, PAD, PAD, bx.w, bx.h);
    return { img, sh: this.shadowOf(img, w, h, stick), ox: bx.ox + PAD, oy: bx.oy + PAD, w, h, stick };
  },
  shadowOf(img, w, h, stick) {
    const res = this.res, sh = mk(w * res, h * res), sc = sh.getContext('2d'); sc.scale(res, res);
    castShadow(sc, c => c.drawImage(img, 0, 0, w, h), stick ? 6 : 2.5, 0, 0, 1);
    return sh;
  },
  // a picture file in place of a drawing: it must cover the sprite's whole box (PAD included), at any resolution
  useImage(key, img) { this.images[key] = img; this.cache.delete(key); },
  fromImage(e, img) {
    const PAD = this.PAD, w = e.box.w * e.k + PAD * 2, h = e.box.h * e.k + PAD * 2;
    return { img, sh: this.shadowOf(img, w, h, e.stick), ox: e.box.ox * e.k + PAD, oy: e.box.oy * e.k + PAD, w, h, stick: e.stick };
  },
  clear() { this.cache.clear(); for (const id in this.list) if (this.list[id].kept) this.list[id].kept = null; },
  // put a sprite on a canvas, its anchor at (x, y), its paper shadow under it
  put(ctx, s, x, y, o = {}) {
    const { sx = 1, scale = 1, alpha = 1, rot = 0, shA = s.stick ? 0.3 : 0.22 } = o, off = s.stick ? [4, 7] : [1, 2.5];
    ctx.save(); ctx.globalAlpha = alpha * shA; ctx.translate(x + off[0] * scale, y + off[1] * scale); ctx.rotate(rot); ctx.scale(sx * scale, scale); ctx.drawImage(s.sh, -s.ox, -s.oy, s.w, s.h); ctx.restore();
    ctx.save(); ctx.globalAlpha = alpha; ctx.translate(x, y); ctx.rotate(rot); ctx.scale(sx * scale, scale); ctx.drawImage(s.img, -s.ox, -s.oy, s.w, s.h); ctx.restore();
  },

  // ---- the other ways in
  paint(id, c, ...args) { const e = this.get(id); return e.kind === 'sprite' ? e.draw(c, args) : e.draw(c, ...args); },   // straight onto a canvas, at its origin
  draw(id, ctx, ...args) { return this.get(id).draw(ctx, ...args); },                // live things: fresh every frame
  layer(id, ...args) { return this.get(id).draw(...args); },                         // backdrops: returns the finished layer
  // a small picture that is built once per resolution and kept (the bubble, the rainbow)
  kept(id) { const e = this.get(id); if (!e.kept || e.kept.res !== this.res) e.kept = { res: this.res, cv: e.draw(this.res) }; return e.kept.cv; },
  // a puppet on its own canvas (no sticker edge), k = scale: for the panels
  puppet(id, res, k, ...args) {
    const e = this.get(id), bx = { w: e.box.w * k, h: e.box.h * k, ox: e.box.ox * k, oy: e.box.oy * k };
    return { cv: puppetCanvas(bx, res, c => { c.scale(k, k); this.paint(id, c, ...args); }), box: bx };
  },
  // the whole list as rows, for the contact sheet (dev/art.html) and for anyone repainting the game
  table() { return Object.values(this.list).map(e => ({ id: e.id, kind: e.kind, group: e.group || e.id.split('.')[0], w: e.box ? e.box.w : null, h: e.box ? e.box.h : null, ox: e.box ? e.box.ox : null, oy: e.box ? e.box.oy : null, k: e.k, stick: e.stick, note: e.note || '' })); },
};
