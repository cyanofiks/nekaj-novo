export class AudioSystem {
  constructor() {
    this.ctx = null;
    this.master = null;
    this.enabled = true;
  }

  init() {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioContextClass();
      this.master = this.ctx.createGain();
      this.master.gain.value = 0.05;
      this.master.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') this.ctx.resume();
  }

  setEnabled(value) {
    this.enabled = value;
    if (this.master) this.master.gain.value = value ? 0.05 : 0;
  }

  playTone(freq, duration, type = 'sine', volume = 0.03) {
    if (!this.enabled) return;
    this.init();
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.value = volume;
    osc.connect(gain);
    gain.connect(this.master);
    osc.start();
    gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);
    osc.stop(this.ctx.currentTime + duration + 0.01);
  }

  tap() { this.playTone(840, 0.06, 'triangle', 0.025); }
  explode() { this.playTone(240, 0.16, 'sawtooth', 0.03); }
  boss() { this.playTone(120, 0.22, 'square', 0.04); }
  coin() { this.playTone(1320, 0.08, 'triangle', 0.025); }
  upgrade() { this.playTone(660, 0.12, 'sine', 0.03); }
  gameOver() { this.playTone(120, 0.3, 'sawtooth', 0.04); }
}
