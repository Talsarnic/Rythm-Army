export class AudioEngine {
  ctx: AudioContext | null = null;
  master: GainNode | null = null;
  musicBus: GainNode | null = null;
  sfxBus: GainNode | null = null;
  noise: AudioBuffer | null = null;
  masterVol = 0.85;
  musicVol = 0.45;
  sfxVol = 0.9;
  muted = false;

  async unlock() {
    if (!this.ctx) {
      const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AC({ latencyHint: "interactive" });
      this.master = this.ctx.createGain();
      this.musicBus = this.ctx.createGain();
      this.sfxBus = this.ctx.createGain();
      this.musicBus.connect(this.master);
      this.sfxBus.connect(this.master);
      this.master.connect(this.ctx.destination);
      this.applyVolumes();
      const len = Math.floor(this.ctx.sampleRate * 0.5);
      this.noise = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
      const data = this.noise.getChannelData(0);
      for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
    }
    if (this.ctx.state !== "running") {
      void this.ctx.resume();
    }
  }

  now() {
    return this.ctx?.currentTime ?? 0;
  }

  eventTimeToAudio(domTimestamp: number) {
    if (!this.ctx) return 0;
    let age = (performance.now() - domTimestamp) / 1000;
    if (!(age >= 0 && age < 1)) age = 0;
    return this.ctx.currentTime - age;
  }

  setVolumes(opts: { master?: number; music?: number; sfx?: number }) {
    if (opts.master !== undefined) this.masterVol = opts.master;
    if (opts.music !== undefined) this.musicVol = opts.music;
    if (opts.sfx !== undefined) this.sfxVol = opts.sfx;
    this.applyVolumes();
  }

  applyVolumes() {
    const mute = this.muted ? 0 : 1;
    const now = this.ctx?.currentTime ?? 0;
    this.master?.gain.setTargetAtTime(this.masterVol * mute, now, 0.03);
    this.musicBus?.gain.setTargetAtTime(this.musicVol, now, 0.03);
    this.sfxBus?.gain.setTargetAtTime(this.sfxVol, now, 0.03);
  }

  env(when: number, peak: number, decay: number, bus: GainNode) {
    const g = this.ctx!.createGain();
    g.gain.setValueAtTime(0.0001, when);
    g.gain.linearRampToValueAtTime(peak, when + 0.004);
    g.gain.exponentialRampToValueAtTime(0.0001, when + decay);
    g.connect(bus);
    return g;
  }

  tone(type: OscillatorType, f0: number, f1: number, when: number, peak: number, decay: number, bus?: GainNode) {
    if (!this.ctx || !this.sfxBus) return;
    const dest = bus ?? this.sfxBus;
    const o = this.ctx.createOscillator();
    o.type = type;
    o.frequency.setValueAtTime(f0, when);
    if (f1 !== f0) o.frequency.exponentialRampToValueAtTime(Math.max(20, f1), when + decay * 0.7);
    o.connect(this.env(when, peak, decay, dest));
    o.start(when);
    o.stop(when + decay + 0.05);
  }

  burst(freq: number, q: number, when: number, peak: number, decay: number) {
    if (!this.ctx || !this.sfxBus || !this.noise) return;
    const s = this.ctx.createBufferSource();
    s.buffer = this.noise;
    const f = this.ctx.createBiquadFilter();
    f.type = "bandpass";
    f.frequency.value = freq;
    f.Q.value = q;
    s.connect(f);
    f.connect(this.env(when, peak, decay, this.sfxBus));
    s.start(when);
    s.stop(when + decay + 0.05);
  }

  drum(id: number, when = this.now()) {
    if (id === 0) this.tone("sine", 150, 45, when, 0.95, 0.32);
    else if (id === 1) {
      this.burst(1800, 1.2, when, 0.7, 0.1);
      this.tone("sine", 230, 200, when, 0.25, 0.08);
    } else if (id === 2) {
      this.tone("triangle", 340, 250, when, 0.6, 0.16);
      this.burst(3200, 2, when, 0.18, 0.05);
    } else {
      this.tone("sine", 880, 880, when, 0.35, 0.4);
      this.tone("sine", 1320, 1320, when, 0.18, 0.3);
    }
  }

  tick(when: number, accent = false) {
    this.tone("square", accent ? 1500 : 1000, accent ? 1500 : 1000, when, accent ? 0.1 : 0.05, 0.035);
  }

  thump(when: number) {
    this.tone("sine", 90, 55, when, 0.2, 0.14);
  }

  chant(when: number, fever: boolean) {
    const f = fever ? 392 : 294;
    this.tone("triangle", f, f * 0.92, when, fever ? 0.18 : 0.12, 0.22, this.musicBus ?? undefined);
  }

  pluck(when: number, freq: number, fever: boolean) {
    if (!this.musicBus) return;
    this.tone("triangle", freq, freq * 0.97, when, fever ? 0.11 : 0.07, 0.28, this.musicBus);
  }

  hit(when = this.now()) {
    this.burst(900, 1.4, when, 0.35, 0.08);
    this.tone("square", 180, 90, when, 0.2, 0.12);
  }

  whoosh(when = this.now()) {
    this.burst(400, 0.6, when, 0.25, 0.18);
  }
}

export const audio = new AudioEngine();

if (typeof document !== "undefined") {
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible" && audio.ctx?.state === "suspended") {
      void audio.ctx.resume();
    }
  });
}
