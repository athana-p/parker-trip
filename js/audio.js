// ================= SOUND: everything synthesised with Web Audio (no audio files) =================
// Browsers only allow sound after the player touches the page, so the context starts on the first tap.
const MUTE_KEY = 'parker-trip-mute';
const SFX = {
  ctx: null, master: null, muted: false, amb: null,
  init() { try { this.muted = localStorage.getItem(MUTE_KEY) === '1'; } catch (e) { } },
  // must run inside a real tap (iPhone only counts the finger lifting: touchend / click), so it is called on several events
  unlock() {
    this.mediaSession();
    if (this.ctx) { if (this.ctx.state !== 'running') this.ctx.resume().catch(() => { }); return; }
    const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return;
    this.ctx = new AC(); this.ctx.resume().catch(() => { }); this.master = this.ctx.createGain(); this.master.gain.value = this.muted ? 0 : 0.9; this.master.connect(this.ctx.destination);
    this.noiseBuf = this.makeNoise(); this.startAmbient();
    if (this.wx) this.weather(this.wx);
  },
  setMuted(m) {
    this.muted = m; try { localStorage.setItem(MUTE_KEY, m ? '1' : '0'); } catch (e) { }
    if (this.master) this.master.gain.setTargetAtTime(m ? 0 : 0.9, this.ctx.currentTime, 0.08);
  },
  ok() { return this.ctx && !this.muted && this.ctx.state === 'running'; },
  // iPhone: Web Audio is silenced by the ring/silent switch unless the page counts as media playback.
  // Newer Safari has navigator.audioSession; older ones need a (code-generated, silent) <audio> element playing.
  mediaSession() {
    if (this.sessionSet) return; this.sessionSet = true;
    try { if (navigator.audioSession) { navigator.audioSession.type = 'playback'; return; } } catch (e) { }
    if (!/iPhone|iPad|iPod/.test(navigator.userAgent) && !(navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)) return;
    const sr = 8000, n = sr / 2, buf = new ArrayBuffer(44 + n * 2), v = new DataView(buf), w = (o, s) => { for (let i = 0; i < s.length; i++) v.setUint8(o + i, s.charCodeAt(i)); };
    w(0, 'RIFF'); v.setUint32(4, 36 + n * 2, true); w(8, 'WAVEfmt '); v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 1, true);
    v.setUint32(24, sr, true); v.setUint32(28, sr * 2, true); v.setUint16(32, 2, true); v.setUint16(34, 16, true); w(36, 'data'); v.setUint32(40, n * 2, true);
    const a = new Audio(URL.createObjectURL(new Blob([buf], { type: 'audio/wav' }))); a.loop = true; a.setAttribute('playsinline', ''); a.play().catch(() => { this.sessionSet = false; });
    this.silent = a;
  },
  makeNoise() { const n = this.ctx.sampleRate * 2, b = this.ctx.createBuffer(1, n, this.ctx.sampleRate), d = b.getChannelData(0); let last = 0; for (let i = 0; i < n; i++) { last = 0.97 * last + 0.03 * (Math.random() * 2 - 1); d[i] = last * 6; } return b; },   // soft brown-ish noise
  // a single soft voice: type, frequency, start time, attack, decay, volume, optional glide
  tone(f, t, { type = 'sine', a = 0.01, d = 0.4, v = 0.2, to = null, out = this.master } = {}) {
    const o = this.ctx.createOscillator(), g = this.ctx.createGain();
    o.type = type; o.frequency.setValueAtTime(f, t); if (to) o.frequency.exponentialRampToValueAtTime(to, t + d);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(v, t + a); g.gain.exponentialRampToValueAtTime(0.0001, t + a + d);
    o.connect(g); g.connect(out); o.start(t); o.stop(t + a + d + 0.05);
  },
  noise(t, { dur = 0.3, v = 0.2, type = 'bandpass', f = 1200, q = 1, f2 = null, a = 0.02 } = {}) {
    const s = this.ctx.createBufferSource(), fl = this.ctx.createBiquadFilter(), g = this.ctx.createGain();
    s.buffer = this.noiseBuf; s.loop = true; fl.type = type; fl.frequency.setValueAtTime(f, t); fl.Q.value = q; if (f2) fl.frequency.exponentialRampToValueAtTime(f2, t + dur);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(v, t + a); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    s.connect(fl); fl.connect(g); g.connect(this.master); s.start(t, Math.random()); s.stop(t + dur + 0.05);
  },
  // ---- the sounds ----
  collect(big) {                     // a soft pluck; a little arpeggio for a fluffy puff
    if (!this.ok()) return; const t = this.ctx.currentTime, P = [784, 880, 1047, 1175, 1319];
    const notes = big ? [P[0], P[2], P[4]] : [P[Math.floor(Math.random() * P.length)]];
    notes.forEach((f, i) => { this.tone(f, t + i * 0.07, { type: 'triangle', d: 0.35, v: 0.12 }); this.tone(f * 2, t + i * 0.07, { d: 0.2, v: 0.03 }); });
  },
  mail() {                           // a little bell, twice
    if (!this.ok()) return; const t = this.ctx.currentTime;
    for (const [dt, f] of [[0, 1318], [0.28, 1046]]) for (const [m, v, d] of [[1, 0.14, 1.4], [2.76, 0.05, 0.8], [5.4, 0.025, 0.4]]) this.tone(f * m, t + dt, { a: 0.004, d, v });
  },
  bag() {                            // plastic-bag rustle: little crackly bursts of high noise
    if (!this.ok()) return; const t = this.ctx.currentTime;
    for (let i = 0; i < 9; i++) this.noise(t + i * 0.045 + Math.random() * 0.03, { dur: 0.05 + Math.random() * 0.06, v: 0.08 + Math.random() * 0.06, f: 3000 + Math.random() * 3000, q: 2.5, a: 0.004 });
  },
  sigh() {                           // a contented breath out: soft noise sliding down
    if (!this.ok()) return; const t = this.ctx.currentTime;
    this.noise(t, { dur: 0.9, v: 0.09, type: 'lowpass', f: 1300, f2: 300, q: 0.7, a: 0.12 });
  },
  pop() {                            // a tiny happy boop when he's tapped
    if (!this.ok()) return; this.tone(520, this.ctx.currentTime, { d: 0.16, v: 0.08, to: 760 });
  },
  shake() {                          // shaking the rain off: a quick flappy brrr
    if (!this.ok()) return; const t = this.ctx.currentTime;
    for (let i = 0; i < 8; i++) this.noise(t + i * 0.075, { dur: 0.07, v: 0.05, f: 900 + (i % 2) * 300, q: 1.3, a: 0.01 });
  },
  // ---- toys ----
  whoosh() {                         // a throw: a soft swish of air
    if (!this.ok()) return; this.noise(this.ctx.currentTime, { dur: 0.28, v: 0.06, f: 700, f2: 2200, q: 1.2, a: 0.04 });
  },
  bounce(k = 0.5) {                  // the rubber ball landing on grass: a soft low "dup"
    if (!this.ok()) return; const t = this.ctx.currentTime;
    this.tone(150 + 60 * k, t, { a: 0.004, d: 0.13, v: 0.05 + 0.08 * k, to: 85 }); this.noise(t, { dur: 0.06, v: 0.03 * k, type: 'lowpass', f: 600, a: 0.003 });
  },
  growl() {                          // a playful little tug-of-war growl: low, soft, rumbly
    if (!this.ok()) return; const c = this.ctx, t = c.currentTime, s = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain(), lfo = c.createOscillator(), lg = c.createGain();
    s.buffer = this.noiseBuf; s.loop = true; f.type = 'lowpass'; f.frequency.value = 340; f.Q.value = 3;
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.09, t + 0.08); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.6);
    lfo.frequency.value = 26; lg.gain.value = 0.05; lfo.connect(lg); lg.connect(g.gain);
    s.connect(f); f.connect(g); g.connect(this.master); s.start(t, Math.random()); lfo.start(t); s.stop(t + 0.65); lfo.stop(t + 0.65);
  },
  flutter(k = 1) {                   // paper kite catching the wind: a few quick soft flaps
    if (!this.ok()) return; const t = this.ctx.currentTime;
    for (let i = 0; i < 4; i++) this.noise(t + i * 0.06, { dur: 0.05, v: 0.04 * k, f: 1500 + i * 200, q: 1.5, a: 0.005 });
  },
  pat() {                            // a paw patting the yarn: a soft woolly "pff"
    if (!this.ok()) return; const t = this.ctx.currentTime;
    this.noise(t, { dur: 0.09, v: 0.07, type: 'lowpass', f: 700, a: 0.004 }); this.tone(240, t, { a: 0.003, d: 0.07, v: 0.03, to: 160 });
  },
  jingle() {                         // the temari ball's little bell
    if (!this.ok()) return; const t = this.ctx.currentTime;
    for (const [dt, f] of [[0, 2637], [0.11, 3136], [0.2, 2637]]) this.tone(f, t + dt, { a: 0.003, d: 0.25, v: 0.025 });
  },
  blow() {                           // the bubble machine: a breathy hum and a few soft blips
    if (!this.ok()) return; const t = this.ctx.currentTime;
    this.noise(t, { dur: 0.9, v: 0.035, f: 1100, q: 0.8, a: 0.15 });
    for (let i = 0; i < 4; i++) { const f = 900 + Math.random() * 700; this.tone(f, t + 0.15 + i * 0.16, { a: 0.01, d: 0.12, v: 0.025, to: f * 1.5 }); }
  },
  bubblePop() {                      // a bubble popping: a tiny wet pluck
    if (!this.ok()) return; const t = this.ctx.currentTime, f = 1100 + Math.random() * 500;
    this.tone(f, t, { a: 0.002, d: 0.07, v: 0.05, to: f * 1.6 }); this.noise(t, { dur: 0.04, v: 0.025, f: 3000, q: 1, a: 0.002 });
  },
  // ---- visitors (stage 4) ----
  chirp() {                          // the sparrow arrives: two quick cheeps
    if (!this.ok()) return; const t = this.ctx.currentTime;
    for (const [dt, f] of [[0, 3100], [0.14, 3400]]) this.tone(f, t + dt, { a: 0.006, d: 0.07, v: 0.035, to: f * 1.25 });
  },
  chitter() {                        // the squirrel: a little ticking chatter
    if (!this.ok()) return; const t = this.ctx.currentTime;
    for (let i = 0; i < 6; i++) this.tone(2300 + Math.random() * 500, t + i * 0.055, { type: 'triangle', a: 0.003, d: 0.03, v: 0.03 });
  },
  mew() {                            // the cat: a small soft mew
    if (!this.ok()) return; const t = this.ctx.currentTime;
    this.tone(560, t, { type: 'triangle', a: 0.04, d: 0.12, v: 0.035, to: 780 }); this.tone(780, t + 0.15, { type: 'triangle', a: 0.01, d: 0.28, v: 0.03, to: 500 });
  },
  gift(rare) {                       // picking up a gift: a soft music-box phrase (a sparkle more for the clover)
    if (!this.ok()) return; const t = this.ctx.currentTime, P = rare ? [1047, 1319, 1568, 2093] : [880, 1109, 1319];
    P.forEach((f, i) => { this.tone(f, t + i * 0.09, { type: 'triangle', d: 0.5, v: 0.1 }); this.tone(f * 2, t + i * 0.09, { d: 0.25, v: 0.025 }); });
  },
  // ---- weather (stage 3): a soft rain hiss with pitter-patter, a gusty wind. Through the master gain, so mute covers it ----
  weather(wx) {
    this.wx = wx; if (!this.ctx) return; this.wxNodes();
    const t = this.ctx.currentTime, k = wx.kind;
    const rain = k === 'rain' ? (wx.heavy ? 0.06 : 0.032) : 0, wind = k === 'wind' ? 0.14 : k === 'snow' ? 0.04 : k === 'rain' && wx.heavy ? 0.05 : 0;
    this.wxN.rain.gain.setTargetAtTime(rain, t, 1.2); this.wxN.wind.gain.setTargetAtTime(wind, t, 1.5);
  },
  wxNodes() {
    if (this.wxN) return; const c = this.ctx, n = c.sampleRate * 2, white = c.createBuffer(1, n, c.sampleRate), d = white.getChannelData(0);
    for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
    const rs = c.createBufferSource(), hp = c.createBiquadFilter(), lp = c.createBiquadFilter(), rg = c.createGain();
    rs.buffer = white; rs.loop = true; hp.type = 'highpass'; hp.frequency.value = 800; lp.type = 'lowpass'; lp.frequency.value = 5000; rg.gain.value = 0;
    rs.connect(hp); hp.connect(lp); lp.connect(rg); rg.connect(this.master); rs.start();
    const ws = c.createBufferSource(), bp = c.createBiquadFilter(), gust = c.createGain(), wg = c.createGain();
    ws.buffer = this.noiseBuf; ws.loop = true; bp.type = 'bandpass'; bp.frequency.value = 380; bp.Q.value = 0.6; gust.gain.value = 0.6; wg.gain.value = 0;
    const l1 = c.createOscillator(), g1 = c.createGain(); l1.frequency.value = 0.13; g1.gain.value = 0.4; l1.connect(g1); g1.connect(gust.gain); l1.start();     // gusts
    const l2 = c.createOscillator(), g2 = c.createGain(); l2.frequency.value = 0.09; g2.gain.value = 150; l2.connect(g2); g2.connect(bp.frequency); l2.start();   // whistle drifting
    ws.connect(bp); bp.connect(gust); gust.connect(wg); wg.connect(this.master); ws.start();
    this.wxN = { rain: rg, wind: wg };
  },
  // ---- ambient loop: a quiet pad drifting through four chords, a breeze, birds by day, crickets by night ----
  startAmbient() {
    const c = this.ctx, bus = c.createGain(); bus.gain.value = 0.22; bus.connect(this.master);
    const lp = c.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 900; lp.connect(bus);
    const breeze = c.createBufferSource(), bf = c.createBiquadFilter(), bg = c.createGain();
    breeze.buffer = this.noiseBuf; breeze.loop = true; bf.type = 'lowpass'; bf.frequency.value = 500; bg.gain.value = 0.05;
    const lfo = c.createOscillator(), lg = c.createGain(); lfo.frequency.value = 0.07; lg.gain.value = 0.035; lfo.connect(lg); lg.connect(bg.gain); lfo.start();
    breeze.connect(bf); bf.connect(bg); bg.connect(bus); breeze.start();
    const chords = [[262, 330, 392], [220, 262, 330], [175, 220, 262], [196, 247, 294]];
    this.amb = { bus, lp, chords, i: 0, next: c.currentTime + 0.2, bird: c.currentTime + 4 };
    setInterval(() => this.tickAmbient(), 500);
  },
  tickAmbient() {
    const c = this.ctx, A = this.amb; if (!c || c.state !== 'running') return;
    const night = typeof TOD !== 'undefined' && TOD === 'night', k = this.wx && this.wx.kind, wet = k === 'rain' || k === 'snow';
    if (k === 'rain') for (let i = 0; i < (this.wx.heavy ? 7 : 4); i++) { const f = 1800 + Math.random() * 2600; this.tone(f, c.currentTime + Math.random() * 0.5, { a: 0.002, d: 0.035, v: 0.008 + Math.random() * 0.008, to: f * 0.7 }); }   // pitter-patter
    if (c.currentTime > A.next - 0.3) {
      const ch = A.chords[A.i++ % A.chords.length], t = A.next;
      for (const f of ch) this.tone(night ? f / 2 : f, t, { type: 'sine', a: 2.5, d: 6, v: 0.05, out: A.lp });
      A.next = t + 7;
    }
    if (c.currentTime > A.bird && (wet || k === 'fog')) A.bird = c.currentTime + 6;    // the birds and crickets keep quiet in rain, snow and fog
    if (c.currentTime > A.bird) {
      const t = c.currentTime;
      if (night) for (let i = 0; i < 6; i++) this.tone(4200, t + i * 0.07, { a: 0.005, d: 0.04, v: 0.012 });      // crickets
      else for (let i = 0; i < 2 + Math.floor(Math.random() * 3); i++) { const f = 2200 + Math.random() * 1400; this.tone(f, t + i * 0.13, { a: 0.01, d: 0.09, v: 0.02, to: f * 1.3 }); }   // a bird
      A.bird = t + 5 + Math.random() * 10;
    }
  },
};
SFX.init();
