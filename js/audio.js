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
    const night = typeof TOD !== 'undefined' && TOD === 'night';
    if (c.currentTime > A.next - 0.3) {
      const ch = A.chords[A.i++ % A.chords.length], t = A.next;
      for (const f of ch) this.tone(night ? f / 2 : f, t, { type: 'sine', a: 2.5, d: 6, v: 0.05, out: A.lp });
      A.next = t + 7;
    }
    if (c.currentTime > A.bird) {
      const t = c.currentTime;
      if (night) for (let i = 0; i < 6; i++) this.tone(4200, t + i * 0.07, { a: 0.005, d: 0.04, v: 0.012 });      // crickets
      else for (let i = 0; i < 2 + Math.floor(Math.random() * 3); i++) { const f = 2200 + Math.random() * 1400; this.tone(f, t + i * 0.13, { a: 0.01, d: 0.09, v: 0.02, to: f * 1.3 }); }   // a bird
      A.bird = t + 5 + Math.random() * 10;
    }
  },
};
SFX.init();
