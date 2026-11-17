// ================= ART: drawings for the interface =================
// Entered in the art list (js/art.js) like everything else. Units are CSS pixels; an icon's origin is its centre.

// the dandelion that counts as money: the flower head, centred on (1, -36) like the one in the yard
ART.def('ui.coin', { kind: 'paint', group: 'ui', box: { w: 24, h: 24, ox: 11, oy: 48 }, note: 'dandelion head, for the counter and the price tags: (c)', draw: c => {
  const ring = (n, r, rx, ry, col) => { const p = new Path2D(); for (let i = 0; i < n; i++) { const a = i / n * TAU; p.addPath(ell(1 + Math.cos(a) * r, -36 + Math.sin(a) * r, rx, ry, a)); } piece(c, p, col, { mul: 0.4 }); };
  ring(14, 6.4, 4.4, 1.9, '#f6c22c'); ring(10, 3.6, 3.2, 1.6, '#fbd648'); piece(c, circ(1, -36, 2.4), '#eaa21c', { mul: 0.4 });
} });
ART.def('ui.icon.shop', { kind: 'paint', group: 'ui', box: { w: 34, h: 34, ox: 17, oy: 17 }, note: 'a little paper shopping bag', draw: c => {
  pp(c, poly([[-13, -8], [13, -8], [15, 15], [-15, 15]]), '#f2c46a', 0.2);
  c.save(); c.strokeStyle = '#a8742f'; c.lineWidth = 2; c.beginPath(); c.arc(0, -8, 7, Math.PI, 0); c.stroke(); c.restore();
  pawPrint(c, 0, 4, 0.5, '#c98b3e');
} });
ART.def('ui.icon.pack', { kind: 'paint', group: 'ui', box: { w: 34, h: 34, ox: 17, oy: 17 }, note: 'his backpack', draw: c => { c.scale(0.62, 0.62); backpack(c, 0, 4, 0); } });
ART.def('ui.icon.album', { kind: 'paint', group: 'ui', box: { w: 34, h: 34, ox: 17, oy: 17 }, note: 'a little album with a postcard tucked in', draw: c => {
  pp(c, rectP(-14, -11, 28, 24), '#5b8ed1', 0.2); pp(c, rectP(-14, -11, 5, 24), '#3f6fb0', 0);
  c.save(); c.rotate(-0.15); pp(c, rectP(-6, -14, 20, 14), '#fff6e6', 0.15); piece(c, rectP(-4, -12, 16, 8), '#f2b07a', { mul: 0.4 }); c.restore();
} });
ART.def('ui.icon.sound', { kind: 'paint', group: 'ui', box: { w: 26, h: 26, ox: 13, oy: 13 }, note: 'loudspeaker, crossed out when muted: (c, muted)', draw: (c, muted) => {
  pp(c, poly([[-9, -4], [-4, -4], [3, -10], [3, 10], [-4, 4], [-9, 4]]), '#5b3f37', 0.1);
  c.save(); c.strokeStyle = '#5b3f37'; c.lineWidth = 2; c.lineCap = 'round';
  if (muted) { c.beginPath(); c.moveTo(7, -5); c.lineTo(15, 5); c.moveTo(15, -5); c.lineTo(7, 5); c.stroke(); }
  else for (const r of [6, 11]) { c.beginPath(); c.arc(3, 0, r, -0.8, 0.8); c.stroke(); }
  c.restore();
} });
ART.def('ui.icon.settings', { kind: 'paint', group: 'ui', box: { w: 26, h: 26, ox: 13, oy: 13 }, note: 'a cog', draw: c => {
  const g = new Path2D(); for (let i = 0; i < 8; i++) { const a = i / 8 * TAU; g.addPath(poly([[Math.cos(a - 0.2) * 7, Math.sin(a - 0.2) * 7], [Math.cos(a - 0.15) * 11, Math.sin(a - 0.15) * 11], [Math.cos(a + 0.15) * 11, Math.sin(a + 0.15) * 11], [Math.cos(a + 0.2) * 7, Math.sin(a + 0.2) * 7]])); }
  g.addPath(circ(0, 0, 8)); pp(c, g, '#5b3f37', 0.1); pp(c, circ(0, 0, 3.4), '#fffaf0', 0);
} });

// the souvenir shelf in "Parker's house"
ART.def('ui.shelf.back', { kind: 'paint', group: 'ui', note: 'the plank wall behind the shelves: (c, W, H)', draw: (x, W, H) => {
  piece(x, rectP(0, 0, W, H), '#f3d9a8', { scr: 0.25 });
  for (let k = 0; k < H / 38; k++) piece(x, rectP(0, k * 38, W, 2), '#e6c48d', { mul: 0.4 });
} });
ART.def('ui.shelf.board', { kind: 'paint', group: 'ui', note: 'one shelf: (c, W, y)', draw: (x, W, by) => { pp(x, rectP(8, by, W - 16, 12), '#b57a4a', 0.3); piece(x, rectP(8, by, W - 16, 3), '#d39b66', { mul: 0.4 }); } });
ART.def('ui.shelf.empty', { kind: 'paint', group: 'ui', box: { w: 44, h: 50, ox: 22, oy: 52 }, note: 'the dashed outline where a souvenir will go: (c, x, baseY)', draw: (x, cx, by) => { x.save(); x.setLineDash([3, 4]); x.strokeStyle = 'rgba(150,110,80,0.4)'; x.lineWidth = 1.5; x.strokeRect(cx - 22, by - 52, 44, 50); x.restore(); } });
// the sheet two cards are laid on when a postcard is shared front + back
ART.def('ui.shareSheet', { kind: 'paint', group: 'ui', note: 'paper table with cards lying on it: (c, w, h, [[img, x]], y)', draw: (x, w, h, cards, m) => {
  piece(x, rectP(0, 0, w, h), '#e8dcc8', { scr: 0.2 });
  for (const [img, dx] of cards) { castShadow(x, k => k.drawImage(img, dx, m), 16, 4, 10, 0.3); x.drawImage(img, dx, m); }
} });
