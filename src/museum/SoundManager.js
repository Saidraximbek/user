/**
 * SoundManager: Procedural Web Audio API sound generator.
 * Tailored for a romantic, heartwarming museum atmosphere.
 */
export class SoundManager {
  constructor() {
    this.ctx = null;
    this.isMuted = false;
    this.volume = 0.55;
    this.isPlayingMusic = false;
    this.musicTimer = null;
    this.masterGain = null;
    this.musicGain = null;
    this.sfxGain = null;
    this.initialized = false;
  }

  init() {
    if (this.initialized) return;

    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioContext();

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      this.musicGain = this.ctx.createGain();
      this.musicGain.gain.setValueAtTime(0.3, this.ctx.currentTime);
      this.musicGain.connect(this.masterGain);

      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.setValueAtTime(0.45, this.ctx.currentTime);
      this.sfxGain.connect(this.masterGain);

      this.initialized = true;

      const resume = () => {
        if (this.ctx && this.ctx.state === 'suspended') {
          this.ctx.resume();
        }
      };
      window.addEventListener('click', resume, { once: true });
      window.addEventListener('keydown', resume, { once: true });
    } catch (e) {
      console.warn('Web Audio not supported', e);
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(this.isMuted ? 0 : this.volume, this.ctx.currentTime, 0.05);
    }
    return this.isMuted;
  }

  setVolume(val) {
    this.volume = Math.max(0, Math.min(1, val));
    if (this.masterGain && this.ctx && !this.isMuted) {
      this.masterGain.gain.setTargetAtTime(this.volume, this.ctx.currentTime, 0.05);
    }
  }

  playFootstep() {
    if (!this.initialized || this.isMuted || !this.ctx) return;
    try {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(130 + Math.random() * 30, t);
      osc.frequency.exponentialRampToValueAtTime(35, t + 0.06);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(400, t);

      gain.gain.setValueAtTime(0.1, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.06);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(t);
      osc.stop(t + 0.06);
    } catch (e) {}
  }

  playCameraSnap() {
    if (!this.initialized || this.isMuted || !this.ctx) return;
    try {
      const t = this.ctx.currentTime;

      const osc1 = this.ctx.createOscillator();
      const gain1 = this.ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(1500, t);
      gain1.gain.setValueAtTime(0.25, t);
      gain1.gain.exponentialRampToValueAtTime(0.001, t + 0.04);
      osc1.connect(gain1);
      gain1.connect(this.sfxGain);
      osc1.start(t);
      osc1.stop(t + 0.04);

      const osc2 = this.ctx.createOscillator();
      const gain2 = this.ctx.createGain();
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(800, t + 0.06);
      osc2.frequency.exponentialRampToValueAtTime(250, t + 0.13);
      gain2.gain.setValueAtTime(0.35, t + 0.06);
      gain2.gain.exponentialRampToValueAtTime(0.001, t + 0.13);
      osc2.connect(gain2);
      gain2.connect(this.sfxGain);
      osc2.start(t + 0.06);
      osc2.stop(t + 0.13);
    } catch (e) {}
  }

  playSuccessChime() {
    if (!this.initialized || this.isMuted || !this.ctx) return;
    try {
      const t = this.ctx.currentTime;
      // Heartfelt harp / chime arpeggio: C5, G5, C6, E6
      const notes = [523.25, 783.99, 1046.50, 1318.51];
      notes.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const noteTime = t + idx * 0.08;

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, noteTime);

        gain.gain.setValueAtTime(0.22, noteTime);
        gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.5);

        osc.connect(gain);
        gain.connect(this.sfxGain);

        osc.start(noteTime);
        osc.stop(noteTime + 0.5);
      });
    } catch (e) {}
  }

  playClick() {
    if (!this.initialized || this.isMuted || !this.ctx) return;
    try {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(750, t);
      osc.frequency.exponentialRampToValueAtTime(380, t + 0.04);
      gain.gain.setValueAtTime(0.12, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.04);
      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(t);
      osc.stop(t + 0.04);
    } catch (e) {}
  }

  /**
   * Romantic Love Ballad Piano & Pad
   * Gentle, warm chord progression (Cmaj9, Am9, Fmaj7, Gsus4)
   */
  startAmbientMusic() {
    if (!this.initialized) this.init();
    if (this.isPlayingMusic || !this.ctx) return;
    this.isPlayingMusic = true;

    const chords = [
      [261.63, 329.63, 392.00, 493.88, 587.33], // Cmaj9 (C, E, G, B, D)
      [220.00, 261.63, 329.63, 392.00, 493.88], // Am9 (A, C, E, G, B)
      [174.61, 261.63, 329.63, 349.23, 440.00], // Fmaj7 (F, C, E, F, A)
      [196.00, 261.63, 293.66, 392.00, 523.25]  // Gsus4 (G, C, D, G, C)
    ];

    let chordIdx = 0;
    let stepIdx = 0;

    const playNextNote = () => {
      if (!this.isPlayingMusic || !this.ctx) return;

      const currentChord = chords[chordIdx];
      const freq = currentChord[stepIdx % currentChord.length];

      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(900, t);
      filter.frequency.exponentialRampToValueAtTime(250, t + 3.0);

      gain.gain.setValueAtTime(0.001, t);
      gain.gain.linearRampToValueAtTime(0.18, t + 0.12);
      gain.gain.exponentialRampToValueAtTime(0.0005, t + 3.2);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.musicGain);

      osc.start(t);
      osc.stop(t + 3.3);

      stepIdx++;
      if (stepIdx % 4 === 0) {
        chordIdx = (chordIdx + 1) % chords.length;
      }

      const nextInterval = 650 + Math.random() * 250;
      this.musicTimer = setTimeout(playNextNote, nextInterval);
    };

    playNextNote();
  }

  stopAmbientMusic() {
    this.isPlayingMusic = false;
    if (this.musicTimer) {
      clearTimeout(this.musicTimer);
      this.musicTimer = null;
    }
  }

  toggleMusic() {
    if (this.isPlayingMusic) {
      this.stopAmbientMusic();
      return false;
    } else {
      this.startAmbientMusic();
      return true;
    }
  }
}

export const soundManager = new SoundManager();
