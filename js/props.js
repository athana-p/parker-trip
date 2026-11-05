// ================= PROPS: shop items, souvenirs, the bird, Parker's backpack (all cut paper) =================
// item / souvenir drawings are centred on (0,0) in a ~60-unit box, scaled by s

// his little backpack, seen from the side, sitting on his back
function backpack(c, x, y, rot = 0) {
  c.save(); c.translate(x, y); c.rotate(rot);
  const body = new Path2D(); body.roundRect ? body.roundRect(-26, -16, 52, 34, 11) : body.rect(-26, -16, 52, 34);
  fp(c, body, '#e2574a', { sh: 0.25, mul: 0.6 });
  clipped(c, body, () => piece(c, rectP(-26, 8, 52, 10), '#c7453a', { mul: 0.5 }));
  const flap = new Path2D(); flap.moveTo(-24, -12); flap.quadraticCurveTo(-24, -18, -16, -18); flap.lineTo(16, -18); flap.quadraticCurveTo(24, -18, 24, -12); flap.lineTo(24, 0); flap.quadraticCurveTo(0, 8, -24, 0); flap.closePath();
  fp(c, flap, '#fff1dc', { sh: 0.18, mul: 0.5 });
  pp(c, circ(0, 2, 3), ARCH.gold, 0.12);
  pawPrint(c, 13, -8, 0.42, '#e2574a');
  c.restore();
}

function drawItem(c, id, s = 1) {
  c.save(); c.scale(s, s);
  const P = (p, col, sh = 0.2) => fp(c, p, col, { sh, mul: 0.5 });
  switch (id) {
    case 'onigiri': {
      const p = new Path2D(); p.moveTo(0, -22); p.quadraticCurveTo(6, -22, 22, 10); p.quadraticCurveTo(26, 18, 16, 18); p.lineTo(-16, 18); p.quadraticCurveTo(-26, 18, -22, 10); p.quadraticCurveTo(-6, -22, 0, -22); p.closePath();
      P(p, '#fffaf0'); clipped(c, p, () => piece(c, rectP(-12, 2, 24, 18), '#2f3d3a', { mul: 0.6 }));
      for (const [x, y] of [[-6, -6], [4, -10], [8, -2]]) piece(c, ell(x, y, 1.6, 0.9, 0.5), '#e9dcc0', { mul: 0.3 });
      break;
    }
    case 'jerky':
      P(union(limb([-18, -12], [16, 6], 13, 11)), '#9a5a3a'); P(limb([-14, 8], [20, -6], 12, 10), '#b06a44');
      c.save(); c.strokeStyle = 'rgba(80,40,25,0.5)'; c.lineWidth = 1; for (let i = -2; i <= 2; i++) { c.beginPath(); c.moveTo(-10 + i * 6, 6 - i * 3); c.lineTo(-4 + i * 6, 0 - i * 3); c.stroke(); } c.restore();
      break;
    case 'bento':
      P(rectP(-24, -14, 48, 32), '#d9573f'); P(rectP(-21, -11, 42, 26), '#fff6e6', 0.08);
      P(rectP(-21, -11, 20, 26), '#fffaf0', 0); piece(c, circ(-11, 2, 3), '#e2574a', { mul: 0.4 });
      P(rectP(1, -11, 20, 12), '#f7d36a', 0.08); P(circ(7, 8, 5), '#5fae5a', 0.1); P(circ(15, 9, 4.5), '#6dbb63', 0.1);
      break;
    case 'clover': {
      c.save(); c.strokeStyle = '#c94b3b'; c.lineWidth = 1.6; c.beginPath(); c.arc(0, -22, 6, 0, TAU); c.stroke(); c.restore();
      const leafP = a => { const p = new Path2D(), d = 9; p.moveTo(0, 0); p.bezierCurveTo(Math.cos(a - 0.9) * 18, Math.sin(a - 0.9) * 18, Math.cos(a) * 22 + Math.cos(a + 1.57) * 2, Math.sin(a) * 22 + Math.sin(a + 1.57) * 2, Math.cos(a) * d, Math.sin(a) * d); p.bezierCurveTo(Math.cos(a) * 22 - Math.cos(a + 1.57) * 2, Math.sin(a) * 22 - Math.sin(a + 1.57) * 2, Math.cos(a + 0.9) * 18, Math.sin(a + 0.9) * 18, 0, 0); return p; };
      c.save(); c.translate(0, -2); P(union(...[0, 1, 2, 3].map(i => leafP(-Math.PI / 4 + i * Math.PI / 2))), '#5fae5a'); P(circ(0, 0, 3), '#4f9a4c', 0); c.restore();
      P(limb([0, 2], [6, 22], 3, 2.5), '#4f9a4c', 0.1);
      break;
    }
    case 'omamori': {
      c.save(); c.strokeStyle = ARCH.gold; c.lineWidth = 2; c.beginPath(); c.moveTo(-5, -20); c.quadraticCurveTo(0, -30, 5, -20); c.stroke(); c.restore();
      const b = new Path2D(); b.moveTo(-14, -16); b.lineTo(14, -16); b.lineTo(14, 16); b.quadraticCurveTo(0, 22, -14, 16); b.closePath();
      P(b, '#d9483b'); clipped(c, b, () => { piece(c, rectP(-14, -4, 28, 7), ARCH.gold, { mul: 0.4 }); });
      P(rectP(-6, -10, 12, 4), '#fff1dc', 0.05); P(circ(0, -18, 3.5), ARCH.gold, 0.12);
      P(circ(12, 22, 5), ARCH.gold); piece(c, rectP(10.5, 23, 3, 3), '#8a6a2a', { mul: 0.5 });
      break;
    }
    case 'ball': {        // his real ball: blue rubber with white patches and little nubs
      const B = circ(0, 0, 20); P(B, '#3f6fc4', 0.25);
      clipped(c, B, () => {
        const pent = (x, y, r, a) => poly([0, 1, 2, 3, 4].map(i => [x + Math.cos(a + i * TAU / 5) * r, y + Math.sin(a + i * TAU / 5) * r]));
        for (const [x, y, r, a] of [[-6, -8, 7, 0.3], [11, 5, 6.5, 1], [-9, 12, 6, 0.6], [15, -14, 6, 0.2]]) piece(c, pent(x, y, r, a), '#fbfaf5', { mul: 0.3 });
        c.fillStyle = 'rgba(30,50,110,0.35)'; for (let i = 0; i < 40; i++) { const a = i * 2.4, r = 4 + (i * 7) % 16; c.beginPath(); c.arc(Math.cos(a) * r, Math.sin(a) * r, 0.9, 0, TAU); c.fill(); }
        piece(c, ell(-7, -10, 6, 3, -0.6), '#8fb2ec', { mul: 0.2 });
      });
      break;
    }
    case 'duck':
      P(ell(2, 6, 18, 13), '#f7d04a'); P(circ(-10, -10, 10), '#f7d04a');
      P(ell(-21, -8, 6, 3.5, 0.15), '#f0883c', 0.1); P(ell(6, 4, 10, 6, -0.3), '#efbe36', 0.1);
      c.fillStyle = PK.eye; c.beginPath(); c.arc(-12, -13, 1.7, 0, TAU); c.fill();
      blush(c, [[-6, -7]], 2.6, 0.6);
      break;
    case 'simit': {                        // an Istanbul sesame ring
      const r = new Path2D(); r.addPath(circ(0, 0, 20)); const h = new Path2D(); h.arc(0, 0, 9, 0, TAU, true);
      pp(c, union(r, h), '#c9853a', 0.2); c.save(); c.clip(union(r, h), 'evenodd'); piece(c, circ(-4, -4, 18), '#e0a050', { mul: 0.3 }); c.restore();
      c.save(); c.fillStyle = '#fbf0d8'; const rr = rng(77); for (let i = 0; i < 30; i++) { const a = rr() * TAU, d = 11 + rr() * 8; c.beginPath(); c.ellipse(Math.cos(a) * d, Math.sin(a) * d, 1.4, 0.8, a, 0, TAU); c.fill(); } c.restore();
      break;
    }
    case 'teaglass': teaGlass(c, 0, 20, 1.2); break;
    case 'gift': {                         // a small wrapped present
      pp(c, rectP(-18, -14, 36, 28), '#d9433a', 0.22); pp(c, rectP(-4, -14, 8, 28), ARCH.gold, 0); pp(c, rectP(-18, -4, 36, 7), ARCH.gold, 0);
      pp(c, union(ell(-8, -18, 9, 5, 0.4), ell(8, -18, 9, 5, -0.4)), ARCH.gold, 0.12); pp(c, circ(0, -17, 3.5), '#e2a93d', 0);
      break;
    }
    case 'card': {
      c.rotate(-0.12);
      pp(c, rectP(-24, -16, 48, 32), '#fffaf0', 0.22); pp(c, rectP(-21, -13, 27, 26), '#24366c', 0);
      glow(c, -8, -2, 10, '255,214,140', 0.6); piece(c, circ(-6, -4, 4), '#ffd98a', { mul: 0.3 }); piece(c, ell(-8, 8, 8, 2.5), '#7fae5a', { mul: 0.3 });
      pp(c, rectP(10, -12, 9, 10), '#e2574a', 0); for (let k = 0; k < 3; k++) piece(c, rectP(9, 2 + k * 4, 11, 1.4), '#c9b49a', { mul: 0.3 });
      break;
    }
    case 'bone':
      P(union(limb([-14, 0], [14, 0], 9, 9), circ(-16, -5, 6), circ(-16, 5, 6), circ(16, -5, 6), circ(16, 5, 6)), '#fbf4e6');
      break;
  }
  c.restore();
}

// souvenirs on the shelf: base of the object at y = 0
function drawSouvenir(c, id, s = 1) {
  c.save(); c.scale(s, s);
  const P = (p, col, sh = 0.2) => fp(c, p, col, { sh, mul: 0.5 });
  switch (id) {
    case 'chiangmai': {   // Bo Sang paper umbrella
      P(limb([0, -40], [2, 0], 3, 3), '#8a5a3a');
      const can = new Path2D(); can.moveTo(-26, -34); can.quadraticCurveTo(0, -66, 26, -34); can.closePath(); P(can, '#e8604c');
      clipped(c, can, () => { for (let i = -3; i <= 3; i += 2) piece(c, poly([[0, -56], [i * 8 - 4, -30], [i * 8 + 4, -30]]), '#f39a6a', { mul: 0.4 }); });
      P(circ(0, -55, 2.5), ARCH.gold, 0.1); break;
    }
    case 'pai':           // little wooden elephant
      for (const x of [-12, -4, 6, 13]) P(rectP(x - 3, -14, 6, 14), '#9a6a44', 0.1);
      P(ell(0, -20, 18, 12), '#b07a50'); P(circ(15, -26, 9), '#b07a50'); P(limb([20, -24], [24, -6], 5, 3), '#b07a50', 0.1);
      P(ell(10, -26, 6, 8), '#9a6a44', 0.1); c.fillStyle = PK.eye; c.beginPath(); c.arc(17, -28, 1.3, 0, TAU); c.fill(); break;
    case 'krabi': {       // seashell
      const sh = new Path2D(); sh.moveTo(0, 0); sh.lineTo(-20, -18); sh.quadraticCurveTo(0, -42, 20, -18); sh.closePath(); P(sh, '#f6c9b8');
      c.save(); c.strokeStyle = 'rgba(200,120,110,0.6)'; c.lineWidth = 1.2; for (let i = -2; i <= 2; i++) { c.beginPath(); c.moveTo(0, -2); c.lineTo(i * 8, -30 + Math.abs(i) * 4); c.stroke(); } c.restore();
      P(rectP(-5, -4, 10, 5), '#efb4a2', 0.08); break;
    }
    case 'floatingmarket':   // green coconut with a straw
      P(limb([4, -36], [12, -54], 3, 3), '#f3a3b6', 0.1);
      P(circ(0, -18, 18), '#7fb25a'); P(ell(0, -32, 12, 4), '#f6efd2', 0.08); P(ell(-6, -12, 5, 8, 0.3), '#95c46c', 0); break;
    case 'inthanon':         // a sack of hill-grown coffee
      P(poly([[-16, 0], [-18, -26], [-10, -32], [10, -32], [18, -26], [16, 0]]), '#c9a26e'); P(rectP(-11, -36, 22, 6), '#b08a58', 0.1);
      for (const [x, y] of [[-6, -14], [4, -18], [8, -8], [-2, -6]]) P(ell(x, y, 3, 2, 0.5), '#6b4430', 0.05); break;
    case 'fuji':             // mini Mount Fuji figurine
      P(rectP(-22, -6, 44, 6), '#b07a50', 0.15);
      { const m = poly([[-22, -6], [-6, -36], [6, -36], [22, -6]]); P(m, '#5d86c4'); clipped(c, m, () => piece(c, poly([[-12, -24], [-6, -38], [6, -38], [12, -24], [6, -27], [2, -22], [-3, -27]]), '#fffaf0', { mul: 0.3 })); }
      break;
    case 'fushimi':          // tiny torii gate
      P(rectP(-14, -30, 5, 30), '#e2574a'); P(rectP(9, -30, 5, 30), '#e2574a');
      P(rectP(-20, -38, 40, 5), '#2f2a2e'); P(rectP(-16, -30, 32, 4), '#e2574a'); P(rectP(-2, -34, 4, 6), '#e2574a', 0.05); break;
    case 'guilin':           // bamboo raft
      for (let i = 0; i < 5; i++) P(limb([-24, -4 - i * 4], [24, -4 - i * 4], 5, 5), i % 2 ? '#a8b86a' : '#94a85c', 0.1);
      P(limb([10, -22], [18, -48], 2.5, 2), '#8a6a44', 0.1); break;
    case 'swiss': {          // cowbell on a red strap
      P(limb([-14, -42], [14, -42], 6, 6), '#d9483b', 0.1);
      const b = new Path2D(); b.moveTo(-8, -38); b.lineTo(8, -38); b.lineTo(16, -4); b.lineTo(-16, -4); b.closePath(); P(b, '#c9a24a');
      P(ell(0, -4, 16, 3), '#a8862f', 0.05); P(circ(0, -1, 3), '#6b5a3a', 0.1); piece(c, poly([[-2, -42], [2, -42], [2, -46], [-2, -46]]), '#fff', { mul: 0.2 }); break;
    }
    case 'furano':           // a bundle of lavender
      for (let i = -3; i <= 3; i++) { P(limb([i * 2, 0], [i * 6, -40], 1.6, 1.2), '#6d9a5a', 0); for (let k = 0; k < 4; k++) P(ell(i * 6 * (1 - k * 0.06), -40 + k * 5, 2.6, 3.4), '#9a7ad0', 0.05); }
      P(limb([-7, -12], [7, -12], 5, 5), '#f3a3b6', 0.1); break;
    case 'dunhuang': {       // bottle of layered sand
      const b = new Path2D(); b.moveTo(-6, -36); b.lineTo(6, -36); b.lineTo(6, -28); b.quadraticCurveTo(16, -24, 16, -12); b.lineTo(16, 0); b.lineTo(-16, 0); b.lineTo(-16, -12); b.quadraticCurveTo(-16, -24, -6, -28); b.closePath();
      P(b, '#e8f2f0'); clipped(c, b, () => [['#e8a34a', -4], ['#f3cf6a', -9], ['#d9663f', -13], ['#f2b46a', -18]].forEach(([col, y]) => piece(c, rectP(-20, y - 5, 40, 6), col, { mul: 0.4 })));
      P(rectP(-5, -42, 10, 7), '#b07a50', 0.1); break;
    }
    case 'istanbul':         // a tulip-shaped glass of Turkish tea
      teaGlass(c, 0, 0, 1.3); break;
    case 'tekapo': {         // a jar of stars
      const j = new Path2D(); j.roundRect ? j.roundRect(-16, -38, 32, 38, 7) : j.rect(-16, -38, 32, 38);
      P(j, '#2c3561'); P(rectP(-13, -44, 26, 7), '#c9a26e', 0.1);
      for (const [x, y, r] of [[-6, -24, 4], [6, -14, 3], [3, -30, 2.5], [-7, -9, 2.5]]) { glow(c, x, y, r * 3, '255,240,180', 0.6); piece(c, poly([0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(i => [x + Math.cos(i * Math.PI / 5 - Math.PI / 2) * (i % 2 ? r * 0.45 : r), y + Math.sin(i * Math.PI / 5 - Math.PI / 2) * (i % 2 ? r * 0.45 : r)])), '#fff1b0', { mul: 0.2 }); }
      piece(c, rectP(-12, -34, 4, 26), 'rgba(255,255,255,0.25)', { mul: 0, scr: 0 }); break;
    }
  }
  c.restore();
}

// the sparrow that visits (mostly while he's away): a tree sparrow — chestnut cap, white cheek with a black spot,
// little black bib, streaky brown back. k: 0 stand, 1 peck, 2/3 wings
function drawBird(c, k = 0) {
  c.save(); if (k === 1) { c.translate(0, -8); c.rotate(0.5); c.translate(0, 8); }
  if (k < 2) { c.save(); c.strokeStyle = '#c99a7a'; c.lineWidth = 1.4; c.beginPath(); c.moveTo(-2, -6); c.lineTo(-3, 0); c.moveTo(3, -6); c.lineTo(3, 0); c.stroke(); c.restore(); }
  fp(c, poly([[-12, -14], [-24, -17], [-22, -10]]), '#6e4a32', { sh: 0.1 });                          // tail
  const body = ell(0, -14, 13, 10); fp(c, body, '#b4875e', { sh: 0.2 });
  clipped(c, body, () => { piece(c, ell(3, -9, 9, 6), '#efe2cc', { mul: 0.3 }); for (const x of [-9, -4]) piece(c, slab([x, -22], [x - 3, -14], 1.8), '#5e3e28', { mul: 0.4 }); });
  fp(c, circ(9, -22, 7), '#a5603c', { sh: 0.1 });                                                       // chestnut cap
  clipped(c, circ(9, -22, 7), () => { piece(c, ell(10, -18, 7.5, 4.2), '#fbf6ee', { mul: 0.2 }); piece(c, circ(8, -18.5, 1.6), '#2f2622', { mul: 0.3 }); });   // white cheek + black spot
  piece(c, ell(14, -15, 2.6, 2.2), '#2f2622', { mul: 0.3 });                                           // bib
  piece(c, poly([[15, -23], [20.5, -21.5], [15, -19.5]]), '#4a3a32', { mul: 0.4 });
  c.fillStyle = PK.eye; c.beginPath(); c.arc(11, -24, 1.4, 0, TAU); c.fill();
  const wing = k === 2 ? poly([[-6, -16], [-14, -38], [4, -20]]) : k === 3 ? poly([[-6, -14], [-12, 2], [4, -12]]) : ell(-3, -15, 8, 5, 0.3);
  fp(c, wing, '#8a5e3c', { sh: 0.12 });
  if (k < 2) { piece(c, slab([-9, -13], [2, -16], 1.4), '#f6efe4', { mul: 0.3 }); piece(c, slab([-8, -17], [-1, -19], 1.6), '#4e3424', { mul: 0.4 }); }
  c.restore();
}
