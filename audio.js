// ============================================================================
// audio.js - Sintetizador Procedural 8-bit / Arcade via Web Audio API
// Zero dependências de arquivos MP3 externos
// ============================================================================

export class SoundManager {
  constructor() {
    this.ctx = null;
    this.muted = false;
    this.activeNodes = [];
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleMute() {
    this.muted = !this.muted;
    if (this.muted) {
      this.stopAll();
    } else {
      this.init();
      this.playClick();
    }
    return this.muted;
  }

  stopAll() {
    this.activeNodes.forEach((node) => {
      try {
        node.stop();
      } catch (_) {}
    });
    this.activeNodes = [];
  }

  playTone(freq, type, duration, startTimeOffset = 0, vol = 0.16, slideTo = null) {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime + startTimeOffset;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);
    if (slideTo) {
      osc.frequency.exponentialRampToValueAtTime(Math.max(20, slideTo), now + duration);
    }

    gain.gain.setValueAtTime(vol, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + duration + 0.02);
    this.activeNodes.push(osc);
    osc.onended = () => {
      const idx = this.activeNodes.indexOf(osc);
      if (idx !== -1) this.activeNodes.splice(idx, 1);
    };
  }

  // Efeito de clique de UI
  playClick() {
    this.playTone(580, 'triangle', 0.06, 0, 0.14, 780);
  }

  // Pulo do Noivo (grave/médio) ou da Noiva (agudo)
  playJump(isBride = false) {
    const startFreq = isBride ? 330 : 250;
    const endFreq = isBride ? 680 : 520;
    this.playTone(startFreq, 'square', 0.16, 0, 0.12, endFreq);
  }

  // Abaixar / Deslizar (som rápido descendente)
  playDuck(isBride = false) {
    const startFreq = isBride ? 480 : 380;
    const endFreq = isBride ? 200 : 150;
    this.playTone(startFreq, 'triangle', 0.12, 0, 0.13, endFreq);
  }

  // Disparo de lembrancinha / buquê na Fase 2
  playShoot() {
    this.playTone(720, 'triangle', 0.11, 0, 0.12, 340);
  }

  // Rebater convidado esfomeado na Fase 2
  playBounce() {
    this.playTone(220, 'square', 0.09, 0, 0.15, 480);
    this.playTone(520, 'sine', 0.11, 0.04, 0.12, 680);
  }

  // Convidado chegou no altar / transição Fase 1 -> Fase 2
  playAltarFanfare() {
    const notes = [
      { f: 523.25, d: 0.14, t: 0.0 },  // C5
      { f: 659.25, d: 0.14, t: 0.15 }, // E5
      { f: 783.99, d: 0.14, t: 0.30 }, // G5
      { f: 1046.5, d: 0.42, t: 0.45 }, // C6
    ];
    notes.forEach((n) => {
      this.playTone(n.f, 'square', n.d, n.t, 0.14);
      this.playTone(n.f * 0.5, 'triangle', n.d, n.t, 0.12);
    });
  }

  // Som cômico dramático de "BATATINHA!" (Trombone Triste Wah-Wah-Wah-Waaaah + Impacto)
  playBatatinha() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    this.stopAll();

    // Impacto inicial cômico
    this.playTone(160, 'sawtooth', 0.18, 0, 0.25, 45);

    // Wah - Wah - Wah - Waaaaah
    const wahNotes = [
      { f: 311.13, slide: 293.66, t: 0.15, d: 0.28 }, // D#4 -> D4
      { f: 293.66, slide: 277.18, t: 0.46, d: 0.28 }, // D4 -> C#4
      { f: 277.18, slide: 261.63, t: 0.77, d: 0.28 }, // C#4 -> C4
      { f: 261.63, slide: 185.00, t: 1.08, d: 0.75 }, // C4 -> F#3 longo
    ];
    wahNotes.forEach((n) => {
      this.playTone(n.f, 'sawtooth', n.d, n.t, 0.18, n.slide);
      this.playTone(n.f * 0.5, 'triangle', n.d, n.t, 0.14, n.slide * 0.5);
    });
  }

  // Marcha Nupcial em 8-bit na Vitória ("Lá vem a noiva" + Mendelssohn)
  playWeddingMarch() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    this.stopAll();

    // Melodia clássica de Casamento em 8-bit
    const melody = [
      { f: 392.00, d: 0.22, t: 0.00 }, // G4
      { f: 523.25, d: 0.18, t: 0.25 }, // C5
      { f: 523.25, d: 0.18, t: 0.45 }, // C5
      { f: 523.25, d: 0.42, t: 0.65 }, // C5
      { f: 392.00, d: 0.22, t: 1.15 }, // G4
      { f: 587.33, d: 0.18, t: 1.40 }, // D5
      { f: 493.88, d: 0.18, t: 1.60 }, // B4
      { f: 523.25, d: 0.55, t: 1.80 }, // C5
      { f: 392.00, d: 0.22, t: 2.42 }, // G4
      { f: 523.25, d: 0.22, t: 2.66 }, // C5
      { f: 659.25, d: 0.22, t: 2.90 }, // E5
      { f: 783.99, d: 0.35, t: 3.14 }, // G5
      { f: 698.46, d: 0.22, t: 3.52 }, // F5
      { f: 659.25, d: 0.22, t: 3.76 }, // E5
      { f: 587.33, d: 0.30, t: 4.00 }, // D5
      { f: 659.25, d: 0.20, t: 4.32 }, // E5
      { f: 523.25, d: 0.65, t: 4.55 }, // C5
    ];

    melody.forEach((n) => {
      this.playTone(n.f, 'square', n.d, n.t, 0.14);
      this.playTone(n.f * 0.5, 'triangle', n.d, n.t, 0.12);
    });
  }
}
