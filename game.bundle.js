// ============================================================================
// game.bundle.js - Versão Empacotada para Execução Offline & Online
// Permite rodar o jogo tanto em Servidor HTTP quanto abrindo direto no arquivo (file:///)
// Código fonte original modular mantido em: game.js, minigames.js, games_part*.js
// ============================================================================

(() => {
'use strict';

// ============================================================================
// audio.js - Sintetizador Procedural 8-bit / Arcade via Web Audio API
// Zero dependências de arquivos MP3 externos
// ============================================================================

class SoundManager {
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


// ============================================================================
// network.js - Gerenciador P2P WebRTC via PeerJS (Sem Backend Próprio)
// ============================================================================

const PEER_PREFIX = 'operacao-luademel-v1-';
const FUN_CODES = [
  'AMOR', 'BOLO', 'ANEL', 'CASA', 'PROF',
  'VIDA', 'DOCE', 'FUGA', 'BEJO', 'NOIV',
  'FESTA', 'LUA9'
];

class NetworkManager {
  constructor() {
    this.peer = null;
    this.conn = null;
    this.role = 'local'; // 'local' | 'host' | 'guest'
    this.roomCode = '';
    this.connected = false;

    this.onConnected = null;
    this.onData = null;
    this.onDisconnected = null;
    this.onError = null;
  }

  generateShortCode(attempt = 0) {
    if (attempt < 3) {
      const word = FUN_CODES[Math.floor(Math.random() * FUN_CODES.length)].slice(0, 4);
      const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
      if (attempt === 0) return word;
      return word.slice(0, 3) + chars[Math.floor(Math.random() * chars.length)];
    }
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 4; i++) {
      code += chars[Math.floor(Math.random() * chars.length)];
    }
    return code;
  }

  disconnect() {
    this.connected = false;
    if (this.conn) {
      try { this.conn.close(); } catch (_) {}
      this.conn = null;
    }
    if (this.peer) {
      try { this.peer.destroy(); } catch (_) {}
      this.peer = null;
    }
    this.role = 'local';
    this.roomCode = '';
  }

  createRoom(onCodeReady, attempt = 0) {
    this.disconnect();
    if (!window.Peer) {
      if (this.onError) this.onError('Biblioteca PeerJS não carregou. Verifique sua internet.');
      return;
    }

    this.role = 'host';
    this.roomCode = this.generateShortCode(attempt);
    const fullPeerId = PEER_PREFIX + this.roomCode;

    this.peer = new window.Peer(fullPeerId, { debug: 1 });

    this.peer.on('open', () => {
      if (onCodeReady) onCodeReady(this.roomCode);
    });

    this.peer.on('connection', (connection) => {
      this.conn = connection;
      this.setupConnectionEvents();
    });

    this.peer.on('error', (err) => {
      if (err && err.type === 'unavailable-id' && attempt < 8) {
        this.createRoom(onCodeReady, attempt + 1);
        return;
      }
      if (this.onError) {
        this.onError('Erro na rede P2P: ' + (err.message || err.type || 'Tente novamente'));
      }
    });
  }

  joinRoom(rawCode) {
    const cleanCode = (rawCode || '').trim().toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 4);
    if (cleanCode.length !== 4) {
      if (this.onError) this.onError('Digite um código válido de 4 caracteres (ex: AMOR).');
      return;
    }

    this.disconnect();
    if (!window.Peer) {
      if (this.onError) this.onError('Biblioteca PeerJS não carregou. Verifique sua internet.');
      return;
    }

    this.role = 'guest';
    this.roomCode = cleanCode;

    this.peer = new window.Peer({ debug: 1 });

    let connTimeout = null;

    this.peer.on('open', () => {
      const targetId = PEER_PREFIX + this.roomCode;
      this.conn = this.peer.connect(targetId, { reliable: true });

      connTimeout = setTimeout(() => {
        if (!this.connected && this.role === 'guest') {
          if (this.onError) {
            this.onError(`Tempo esgotado ao buscar a sala "${this.roomCode}". Verifique se o código está correto e se o Noivo já criou a sala.`);
          }
          this.disconnect();
        }
      }, 12000);

      this.setupConnectionEvents(() => {
        if (connTimeout) clearTimeout(connTimeout);
      });
    });

    this.peer.on('error', (err) => {
      if (connTimeout) clearTimeout(connTimeout);
      let msg = 'Não foi possível encontrar a sala ' + this.roomCode + '.';
      if (err && err.type === 'peer-unavailable') {
        msg = `Sala "${this.roomCode}" não encontrada! Confira o código com o Jogador 1.`;
      }
      if (this.onError) this.onError(msg);
    });
  }

  setupConnectionEvents(onOpenCallback) {
    if (!this.conn) return;

    this.conn.on('open', () => {
      this.connected = true;
      if (onOpenCallback) onOpenCallback();
      if (this.onConnected) this.onConnected(this.role, this.roomCode);
    });

    this.conn.on('data', (payload) => {
      if (this.onData) this.onData(payload);
    });

    this.conn.on('close', () => {
      const wasConnected = this.connected;
      this.connected = false;
      if (wasConnected && this.onDisconnected) {
        this.onDisconnected();
      }
    });

    this.conn.on('error', () => {
      if (this.onError) this.onError('Conexão interrompida com o outro aparelho.');
    });
  }

  send(payload) {
    if (this.connected && this.conn && this.conn.open) {
      try {
        this.conn.send(payload);
      } catch (_) {}
    }
  }
}


// ============================================================================
// games_part1.js - Minigames 1 a 4 da "Operação Lua de Mel"
// 1. Sinuca 2D | 2. Roguelite Coop | 3. Plataforma Lava | 4. Contra Run & Gun
// ============================================================================

// ============================================================================
// MINIGAME 1: SINUCA 2D (DUELO DE CASAL - ESTILO 8 BALL POOL REALISTA)
// ============================================================================
const Minigame1_Sinuca = {
  id: 'mg1_sinuca',
  order: 1,
  title: '1. SINUCA 2D: DUELO DO CASAL',
  subtitle: 'Alternem as tacadas! Encaçapar a Bola 8 antes da hora dá BATATINHA!',
  icon: '🎱',

  onEnter(ctxApi) {
    const { width, height } = ctxApi.getViewport();
    const tw = Math.min(840, Math.max(340, width - 150));
    const th = Math.floor(tw * 0.5);
    const tx = (width - tw) / 2 + 18;
    const ty = (height - th) / 2 + 20;

    // Raio oficial das bolas em proporção exata à mesa
    const r = Math.max(8.5, Math.min(12.5, Math.floor(tw * 0.0158)));

    // Bola Branca (Tacadeira - Cue Ball)
    const balls = [
      {
        id: 0,
        x: tx + tw * 0.25,
        y: ty + th * 0.5,
        vx: 0,
        vy: 0,
        color: '#ffffff',
        lightColor: '#ffffff',
        darkColor: '#cbd5e1',
        isStriped: false,
        label: '',
        owner: null,
        active: true
      }
    ];

    // Triângulo Regulamentar de 15 Bolas da Sinuca (Regras WPA 8-Ball):
    // - Linha 0 (Ápice): 1 Bola Lisa (1: Amarela)
    // - Linha 1: 1 Listrada (9: Amarela) e 1 Lisa (2: Azul)
    // - Linha 2: 1 Listrada (10: Azul), BOLA 8 PRETA NO CENTRO EXATO, 1 Lisa (3: Vermelha)
    // - Linha 3: 1 Listrada (11: Vermelha), 1 Lisa (4: Roxa), 1 Listrada (12: Roxa), 1 Lisa (5: Laranja)
    // - Linha 4 (Base): 1 Lisa (6: Verde), 1 Listrada (13: Laranja), 1 Lisa (7: Marrom), 1 Listrada (14: Verde), 1 Listrada (15: Marrom)
    // Cantos opostos da base: Lisa 6 e Listrada 15. Total = 7 Lisas + 7 Listradas + 1 Bola 8.
    const startX = tx + tw * 0.70;
    const startY = ty + th * 0.5;

    const layout = [
      // Linha 0 (Ápice)
      { id: 1, row: 0, col: 0, color: '#eab308', lightColor: '#fef08a', darkColor: '#a16207', isStriped: false, owner: 'p1' },

      // Linha 1
      { id: 9, row: 1, col: -0.5, color: '#eab308', lightColor: '#fef08a', darkColor: '#a16207', isStriped: true, owner: 'p2' },
      { id: 2, row: 1, col: 0.5, color: '#2563eb', lightColor: '#93c5fd', darkColor: '#1d4ed8', isStriped: false, owner: 'p1' },

      // Linha 2 (Bola 8 no Centro)
      { id: 10, row: 2, col: -1, color: '#2563eb', lightColor: '#93c5fd', darkColor: '#1d4ed8', isStriped: true, owner: 'p2' },
      { id: 8, row: 2, col: 0, color: '#111827', lightColor: '#374151', darkColor: '#030712', isStriped: false, owner: 'eight' },
      { id: 3, row: 2, col: 1, color: '#dc2626', lightColor: '#fca5a5', darkColor: '#991b1b', isStriped: false, owner: 'p1' },

      // Linha 3
      { id: 11, row: 3, col: -1.5, color: '#dc2626', lightColor: '#fca5a5', darkColor: '#991b1b', isStriped: true, owner: 'p2' },
      { id: 4, row: 3, col: -0.5, color: '#7c3aed', lightColor: '#c4b5fd', darkColor: '#5b21b6', isStriped: false, owner: 'p1' },
      { id: 12, row: 3, col: 0.5, color: '#7c3aed', lightColor: '#c4b5fd', darkColor: '#5b21b6', isStriped: true, owner: 'p2' },
      { id: 5, row: 3, col: 1.5, color: '#ea580c', lightColor: '#fdba74', darkColor: '#9a3412', isStriped: false, owner: 'p1' },

      // Linha 4 (Base)
      { id: 6, row: 4, col: -2, color: '#16a34a', lightColor: '#86efac', darkColor: '#166534', isStriped: false, owner: 'p1' },
      { id: 13, row: 4, col: -1, color: '#ea580c', lightColor: '#fdba74', darkColor: '#9a3412', isStriped: true, owner: 'p2' },
      { id: 7, row: 4, col: 0, color: '#78350f', lightColor: '#d97706', darkColor: '#451a03', isStriped: false, owner: 'p1' },
      { id: 14, row: 4, col: 1, color: '#16a34a', lightColor: '#86efac', darkColor: '#166534', isStriped: true, owner: 'p2' },
      { id: 15, row: 4, col: 2, color: '#78350f', lightColor: '#d97706', darkColor: '#451a03', isStriped: true, owner: 'p2' }
    ];

    layout.forEach((b) => {
      balls.push({
        id: b.id,
        x: startX + b.row * (r * 1.76),
        y: startY + b.col * (r * 2.04),
        vx: 0,
        vy: 0,
        color: b.color,
        lightColor: b.lightColor,
        darkColor: b.darkColor,
        isStriped: b.isStriped,
        label: String(b.id),
        owner: b.owner,
        active: true
      });
    });

    ctxApi.mgState = {
      table: { x: tx, y: ty, w: tw, h: th, r },
      balls,
      turn: 'p1', // 'p1' (Noivo) ou 'p2' (Noiva)
      aimAngle: 0,
      power: 65,
      aiming: false,
      moving: false,
      pottedThisTurn: [],
      p1Score: 0,
      p2Score: 0,
      spin: { x: 0, y: 0 },
      draggingPower: false,
      draggingSpin: false,
      powerMeterBox: null,
      shootBtnBox: null,
      spinWidgetBox: null
    };
  },

  onUpdate(dt, ctxApi) {
    const st = ctxApi.mgState;
    if (!st) return;

    const { width, height } = ctxApi.getViewport();
    const tw = Math.min(840, Math.max(340, width - 150));
    const th = Math.floor(tw * 0.5);
    st.table.x = (width - tw) / 2 + 18;
    st.table.y = (height - th) / 2 + 20;
    st.table.w = tw;
    st.table.h = th;
    st.table.r = Math.max(8.5, Math.min(12.5, Math.floor(tw * 0.0158)));

    const keys = ctxApi.getKeys();

    if (!st.moving) {
      // Ajuste fino do ângulo de mira com A/D ou Setas
      const left = keys.p1Left || keys.p2Left;
      const right = keys.p1Right || keys.p2Right;
      if (left) st.aimAngle -= 1.8 * dt;
      if (right) st.aimAngle += 1.8 * dt;

      // Ajuste de força com W/S ou Cima/Baixo
      const up = keys.p1Up || keys.p2Up;
      const down = keys.p1Down || keys.p2Down;
      if (up) st.power = Math.min(100, st.power + 50 * dt);
      if (down) st.power = Math.max(5, st.power - 50 * dt);
      return;
    }

    // Física e colisão das 16 bolas
    const tb = st.table;
    const r = tb.r;
    const pockets = [
      { x: tb.x, y: tb.y },
      { x: tb.x + tb.w / 2, y: tb.y - 3 },
      { x: tb.x + tb.w, y: tb.y },
      { x: tb.x, y: tb.y + tb.h },
      { x: tb.x + tb.w / 2, y: tb.y + tb.h + 3 },
      { x: tb.x + tb.w, y: tb.y + tb.h }
    ];

    let anyMoving = false;

    for (let i = 0; i < st.balls.length; i++) {
      const b = st.balls[i];
      if (!b.active) continue;

      b.x += b.vx * dt;
      b.y += b.vy * dt;

      // Atrito de rolamento do feltro azul
      b.vx *= Math.pow(0.55, dt);
      b.vy *= Math.pow(0.55, dt);

      if (Math.hypot(b.vx, b.vy) < 6) {
        b.vx = 0;
        b.vy = 0;
      } else {
        anyMoving = true;
      }

      // Detecção de caçapas com sucção suave
      for (const pk of pockets) {
        const distToPocket = Math.hypot(b.x - pk.x, b.y - pk.y);
        if (distToPocket < r * 1.88) {
          b.vx = 0;
          b.vy = 0;
          if (b.id === 0) {
            // Branca encaçapada (Falta): retorna à linha de saída
            b.x = tb.x + tb.w * 0.25;
            b.y = tb.y + tb.h * 0.5;
            ctxApi.sfx.playBounce();
            ctxApi.floatingText(b.x, b.y - 12, 'FALTA: BOLA BRANCA!', '#ffd166');
            st.pottedThisTurn.push({ id: 0, isScratch: true });
          } else {
            b.active = false;
            st.pottedThisTurn.push(b);
            ctxApi.sfx.playBounce();
            ctxApi.particles(pk.x, pk.y, b.color, 16, 170);
            ctxApi.floatingText(pk.x, pk.y - 18, `BOLA ${b.id} ENCAÇAPADA!`, b.color);
          }
          break;
        }
      }

      if (!b.active) continue;

      // Colisão com as tabelas de borracha
      if (b.x - r < tb.x) { b.x = tb.x + r; b.vx = Math.abs(b.vx) * 0.86; }
      if (b.x + r > tb.x + tb.w) { b.x = tb.x + tb.w - r; b.vx = -Math.abs(b.vx) * 0.86; }
      if (b.y - r < tb.y) { b.y = tb.y + r; b.vy = Math.abs(b.vy) * 0.86; }
      if (b.y + r > tb.y + tb.h) { b.y = tb.y + tb.h - r; b.vy = -Math.abs(b.vy) * 0.86; }
    }

    // Colisão elástica bola com bola
    for (let i = 0; i < st.balls.length; i++) {
      for (let j = i + 1; j < st.balls.length; j++) {
        const b1 = st.balls[i];
        const b2 = st.balls[j];
        if (!b1.active || !b2.active) continue;

        const dx = b2.x - b1.x;
        const dy = b2.y - b1.y;
        const dist = Math.hypot(dx, dy);
        const minDist = r * 2;

        if (dist > 0 && dist < minDist) {
          const nx = dx / dist;
          const ny = dy / dist;
          const overlap = (minDist - dist) * 0.5;
          b1.x -= nx * overlap;
          b1.y -= ny * overlap;
          b2.x += nx * overlap;
          b2.y += ny * overlap;

          const kx = b1.vx - b2.vx;
          const ky = b1.vy - b2.vy;
          const p = 2 * (nx * kx + ny * ky) / 2;
          b1.vx -= p * nx * 0.94;
          b1.vy -= p * ny * 0.94;
          b2.vx += p * nx * 0.94;
          b2.vy += p * ny * 0.94;

          if (Math.abs(p) > 25) {
            ctxApi.sfx.playClick();
          }
        }
      }
    }

    // Fim da tacada quando todas as bolas pararem
    if (!anyMoving) {
      st.moving = false;
      st.p1Score = st.balls.filter((b) => b.owner === 'p1' && !b.active).length;
      st.p2Score = st.balls.filter((b) => b.owner === 'p2' && !b.active).length;

      const eightBall = st.balls.find((b) => b.id === 8);
      const shooterName = st.turn === 'p1' ? ctxApi.getNames().groom : ctxApi.getNames().bride;
      const shooterScore = st.turn === 'p1' ? st.p1Score : st.p2Score;

      if (!eightBall.active) {
        if (shooterScore < 7) {
          // Encaçapou a Bola 8 antes de matar as 7 suas -> BATATINHA!
          ctxApi.batatinha(`${shooterName} encaçapou a Bola 8 antes de matar as 7 bolas e perdeu o duelo!`, {
            x: tb.x + tb.w / 2,
            y: tb.y + tb.h / 2,
            r: 45
          });
          return;
        } else {
          // Vitória limpa com a bola 8!
          ctxApi.victory(`${shooterName} encaçapou todas as 7 bolas e finalizou com a Bola 8!`);
          return;
        }
      }

      // Regra de permanência da vez ou troca
      const hadScratch = st.pottedThisTurn.some((b) => b.isScratch);
      const pottedOwn = st.pottedThisTurn.some((b) => b.owner === st.turn);
      st.pottedThisTurn = [];

      if (hadScratch || !pottedOwn) {
        st.turn = st.turn === 'p1' ? 'p2' : 'p1';
      }
    }
  },

  shootCueBall(ctxApi) {
    const st = ctxApi.mgState;
    if (!st || st.moving) return;
    const cue = st.balls[0];
    const spd = 260 + (st.power / 100) * 780;

    cue.vx = Math.cos(st.aimAngle) * spd;
    cue.vy = Math.sin(st.aimAngle) * spd;

    // Aplica efeito do spin na saída
    if (st.spin) {
      cue.vx += -Math.sin(st.aimAngle) * (st.spin.x * 65);
      cue.vy += Math.cos(st.aimAngle) * (st.spin.x * 65);
    }

    st.moving = true;
    st.aiming = false;
    st.draggingPower = false;
    st.pottedThisTurn = [];
    ctxApi.sfx.playShoot();
  },

  onKeyDown(code, ctxApi) {
    const st = ctxApi.mgState;
    if (!st || st.moving) return;
    if (['Space', 'Enter'].includes(code)) {
      this.shootCueBall(ctxApi);
    }
  },

  onKeyUp(code, ctxApi) {
    // Tecla liberada
  },

  onWheel(deltaY, ctxApi) {
    const st = ctxApi.mgState;
    if (!st || st.moving) return;
    st.power = Math.max(5, Math.min(100, Math.round(st.power - Math.sign(deltaY) * 5)));
  },

  onPointerDown(x, y, ctxApi) {
    const st = ctxApi.mgState;
    if (!st || st.moving) return;

    // 1. Checa clique no Botão Dedicado "💥 TACAR"
    if (st.shootBtnBox &&
        x >= st.shootBtnBox.x && x <= st.shootBtnBox.x + st.shootBtnBox.w &&
        y >= st.shootBtnBox.y && y <= st.shootBtnBox.y + st.shootBtnBox.h) {
      this.shootCueBall(ctxApi);
      return;
    }

    // 2. Checa clique na Barra de Força lateral esquerda
    if (st.powerMeterBox &&
        x >= st.powerMeterBox.x && x <= st.powerMeterBox.x + st.powerMeterBox.w &&
        y >= st.powerMeterBox.y && y <= st.powerMeterBox.y + st.powerMeterBox.h) {
      st.draggingPower = true;
      this.updatePowerFromPointer(y, st);
      return;
    }

    // 3. Checa clique no Seletor de Efeito (Spin Widget)
    if (st.spinWidgetBox) {
      const s = st.spinWidgetBox;
      if (Math.hypot(x - s.x, y - s.y) <= s.r + 8) {
        st.draggingSpin = true;
        this.updateSpinFromPointer(x, y, st);
        return;
      }
    }

    // 4. Mira com o taco apontando para a coordenada clicada na mesa (NUNCA dispara ao soltar aqui!)
    const cue = st.balls[0];
    st.aimAngle = Math.atan2(y - cue.y, x - cue.x);
    st.aiming = true;
  },

  onPointerMove(x, y, ctxApi) {
    const st = ctxApi.mgState;
    if (!st || st.moving) return;

    if (st.draggingPower) {
      this.updatePowerFromPointer(y, st);
      return;
    }

    if (st.draggingSpin) {
      this.updateSpinFromPointer(x, y, st);
      return;
    }

    if (st.aiming) {
      const cue = st.balls[0];
      st.aimAngle = Math.atan2(y - cue.y, x - cue.x);
    }
  },

  onPointerUp(ctxApi) {
    const st = ctxApi.mgState;
    if (!st || st.moving) return;

    if (st.draggingPower) {
      st.draggingPower = false;
      this.shootCueBall(ctxApi);
      return;
    }

    if (st.draggingSpin) {
      st.draggingSpin = false;
      return;
    }

    if (st.aiming) {
      st.aiming = false;
    }
  },

  updatePowerFromPointer(y, st) {
    if (!st.powerMeterBox) return;
    const mb = st.powerMeterBox;
    const ratio = Math.max(0.05, Math.min(1, (y - mb.y) / mb.h));
    st.power = Math.round(ratio * 100);
  },

  updateSpinFromPointer(x, y, st) {
    if (!st.spinWidgetBox) return;
    const s = st.spinWidgetBox;
    const dx = x - s.x;
    const dy = y - s.y;
    const dist = Math.hypot(dx, dy);
    const maxR = s.r - 4;
    const clampedDist = Math.min(dist, maxR);
    const angle = Math.atan2(dy, dx);
    st.spin = {
      x: (Math.cos(angle) * clampedDist) / maxR,
      y: (Math.sin(angle) * clampedDist) / maxR
    };
  },

  // ==========================================================================
  // RENDERIZAÇÃO VISUAL REALISTA (ESTILO MINICLIP 8-BALL POOL)
  // ==========================================================================
  onRender(ctx, ctxApi) {
    const st = ctxApi.mgState;
    if (!st) return;
    const { width, height } = ctxApi.getViewport();
    const tb = st.table;
    const names = ctxApi.getNames();

    // 1. Fundo do Salão Escuro
    const roomGrad = ctx.createLinearGradient(0, 0, width, height);
    roomGrad.addColorStop(0, '#11151f');
    roomGrad.addColorStop(0.5, '#0b0e15');
    roomGrad.addColorStop(1, '#07090d');
    ctx.fillStyle = roomGrad;
    ctx.fillRect(0, 0, width, height);

    // 2. Desenho da Mesa de Bilhar Realista (Madeira Mogno + Borracha + Feltro Ciano)
    this.drawPoolTable(ctx, tb);

    // 3. Desenho de todas as Bolas 3D (16 bolas no total)
    st.balls.forEach((b) => {
      if (!b.active) return;
      this.drawRealisticBall(ctx, b, tb.r);
    });

    // 4. Linhas de Mira Profissionais (Aim Raycast + Ghost Ball + Deflexões)
    const cue = st.balls[0];
    if (!st.moving && cue.active) {
      this.drawAimingSystem(ctx, st, tb);
      this.drawCueStick(ctx, cue.x, cue.y, st.aimAngle, st.power);
    }

    // 5. Barra Vertical de Força à Esquerda com Mini Taco e Botão TACAR
    this.drawPowerMeter(ctx, st, tb);

    // 6. Seletor de Efeito (Spin) no Canto Inferior Direito
    this.drawSpinWidget(ctx, st, tb);

    // 7. Cards dos Jogadores e 7 Slots de Bolas Encaçapadas em Cada Lado
    this.drawPlayerCardsAndRacks(ctx, st, tb, width, names);
  },

  drawPoolTable(ctx, tb) {
    const r = tb.r;
    const railW = Math.round(tb.w * 0.048);
    const outerX = tb.x - railW;
    const outerY = tb.y - railW;
    const outerW = tb.w + railW * 2;
    const outerH = tb.h + railW * 2;

    ctx.save();

    // Sombra suave sob a mesa inteira
    ctx.beginPath();
    ctx.roundRect(outerX - 8, outerY - 4, outerW + 16, outerH + 18, 28);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
    ctx.fill();

    // Borda de madeira nobre polida (Mahogany / Cherry Wood)
    const woodGrad = ctx.createLinearGradient(0, outerY, 0, outerY + outerH);
    woodGrad.addColorStop(0, '#9e2d24');
    woodGrad.addColorStop(0.2, '#85221b');
    woodGrad.addColorStop(0.55, '#6a1813');
    woodGrad.addColorStop(0.9, '#4f100c');
    woodGrad.addColorStop(1, '#3a0a07');

    ctx.beginPath();
    ctx.roundRect(outerX, outerY, outerW, outerH, 22);
    ctx.fillStyle = woodGrad;
    ctx.fill();

    // Friso metálico dourado sutil
    ctx.strokeStyle = 'rgba(255, 215, 120, 0.38)';
    ctx.lineWidth = 1.6;
    ctx.stroke();

    // Pontos de mira de madrepérola (Diamond Sights)
    const sightOff = railW * 0.48;
    const drawSight = (sx, sy) => {
      ctx.beginPath();
      ctx.arc(sx, sy, 3.2, 0, Math.PI * 2);
      ctx.fillStyle = '#f8fafc';
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 0.9;
      ctx.fill();
      ctx.stroke();
    };

    // Tabelas longas (superior e inferior): 3 pontos em cada metade
    for (let i = 1; i <= 3; i++) {
      const dxLeft = tb.x + (tb.w * 0.5) * (i / 4);
      const dxRight = tb.x + (tb.w * 0.5) + (tb.w * 0.5) * (i / 4);
      drawSight(dxLeft, outerY + sightOff);
      drawSight(dxLeft, outerY + outerH - sightOff);
      drawSight(dxRight, outerY + sightOff);
      drawSight(dxRight, outerY + outerH - sightOff);
    }
    // Tabelas curtas (esquerda e direita): 3 pontos
    for (let i = 1; i <= 3; i++) {
      const dy = tb.y + tb.h * (i / 4);
      drawSight(outerX + sightOff, dy);
      drawSight(outerX + outerW - sightOff, dy);
    }

    // Tabelas de borracha azuis (Cushions)
    const cushionW = 15;
    const cGrad = ctx.createLinearGradient(0, tb.y, 0, tb.y + tb.h);
    cGrad.addColorStop(0, '#0284c7');
    cGrad.addColorStop(1, '#0369a1');

    ctx.fillStyle = cGrad;
    ctx.fillRect(tb.x - cushionW, tb.y - cushionW, tb.w + cushionW * 2, tb.h + cushionW * 2);

    // Feltro da mesa (Bed) com gradiente ciano elétrico brilhante idêntico à imagem
    const feltGrad = ctx.createRadialGradient(
      tb.x + tb.w * 0.5, tb.y + tb.h * 0.5, tb.w * 0.08,
      tb.x + tb.w * 0.5, tb.y + tb.h * 0.5, tb.w * 0.64
    );
    feltGrad.addColorStop(0, '#24b9ff');
    feltGrad.addColorStop(0.4, '#0ea5e9');
    feltGrad.addColorStop(0.85, '#0284c7');
    feltGrad.addColorStop(1, '#0369a1');

    ctx.fillStyle = feltGrad;
    ctx.fillRect(tb.x, tb.y, tb.w, tb.h);

    // Linha de saída (Headstring)
    const headX = tb.x + tb.w * 0.25;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.22)';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(headX, tb.y);
    ctx.lineTo(headX, tb.y + tb.h);
    ctx.stroke();

    // Ponto de saída da bola branca (Head spot)
    ctx.beginPath();
    ctx.arc(headX, tb.y + tb.h * 0.5, 3.2, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
    ctx.fill();

    // Ponto do triângulo (Foot spot)
    const footX = tb.x + tb.w * 0.70;
    ctx.beginPath();
    ctx.arc(footX, tb.y + tb.h * 0.5, 3.2, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
    ctx.fill();

    // 6 Caçapas com acabamento escuro
    const pocketR = r * 1.88;
    const pockets = [
      { x: tb.x, y: tb.y },
      { x: tb.x + tb.w / 2, y: tb.y - 3 },
      { x: tb.x + tb.w, y: tb.y },
      { x: tb.x, y: tb.y + tb.h },
      { x: tb.x + tb.w / 2, y: tb.y + tb.h + 3 },
      { x: tb.x + tb.w, y: tb.y + tb.h }
    ];

    pockets.forEach((pk) => {
      // Borda de encaixe metálica
      ctx.beginPath();
      ctx.arc(pk.x, pk.y, pocketR + 2.5, 0, Math.PI * 2);
      ctx.fillStyle = '#0f172a';
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 2;
      ctx.fill();
      ctx.stroke();

      // Queda preta profunda
      const holeGrad = ctx.createRadialGradient(pk.x, pk.y, pocketR * 0.15, pk.x, pk.y, pocketR);
      holeGrad.addColorStop(0, '#000000');
      holeGrad.addColorStop(0.85, '#06080d');
      holeGrad.addColorStop(1, '#1e293b');
      ctx.fillStyle = holeGrad;
      ctx.beginPath();
      ctx.arc(pk.x, pk.y, pocketR, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.restore();
  },

  drawRealisticBall(ctx, b, r) {
    ctx.save();

    // 1. Sombra projetada no feltro
    if (ctx.ellipse) {
      ctx.ellipse(b.x + 3.5, b.y + 4.5, r * 0.95, r * 0.65, 0, 0, Math.PI * 2);
    } else {
      ctx.arc(b.x + 3.5, b.y + 4.5, r * 0.85, 0, Math.PI * 2);
    }
    ctx.fillStyle = 'rgba(0, 0, 0, 0.42)';
    ctx.fill();

    // 2. Base da esfera com recorte circular
    ctx.beginPath();
    ctx.arc(b.x, b.y, r, 0, Math.PI * 2);
    if (ctx.clip) ctx.clip();

    if (b.id === 0) {
      // Bola Branca (Cue ball)
      const g = ctx.createRadialGradient(b.x - r * 0.35, b.y - r * 0.35, r * 0.08, b.x, b.y, r);
      g.addColorStop(0, '#ffffff');
      g.addColorStop(0.65, '#f8fafc');
      g.addColorStop(1, '#94a3b8');
      ctx.fillStyle = g;
      ctx.fill();
    } else if (b.id === 8) {
      // Bola 8 Preta
      const g = ctx.createRadialGradient(b.x - r * 0.35, b.y - r * 0.35, r * 0.08, b.x, b.y, r);
      g.addColorStop(0, '#374151');
      g.addColorStop(0.5, '#111827');
      g.addColorStop(1, '#020617');
      ctx.fillStyle = g;
      ctx.fill();
    } else if (!b.isStriped) {
      // Bola Lisa (Solid)
      const g = ctx.createRadialGradient(b.x - r * 0.35, b.y - r * 0.35, r * 0.08, b.x, b.y, r);
      g.addColorStop(0, b.lightColor || '#ffffff');
      g.addColorStop(0.48, b.color);
      g.addColorStop(1, b.darkColor || '#000000');
      ctx.fillStyle = g;
      ctx.fill();
    } else {
      // Bola Listrada (Stripe)
      const bg = ctx.createRadialGradient(b.x - r * 0.35, b.y - r * 0.35, r * 0.08, b.x, b.y, r);
      bg.addColorStop(0, '#ffffff');
      bg.addColorStop(0.7, '#f1f5f9');
      bg.addColorStop(1, '#cbd5e1');
      ctx.fillStyle = bg;
      ctx.fill();

      // Faixa colorida central
      const sg = ctx.createLinearGradient(b.x, b.y - r * 0.52, b.x, b.y + r * 0.52);
      sg.addColorStop(0, b.color);
      sg.addColorStop(0.5, b.lightColor || b.color);
      sg.addColorStop(1, b.darkColor || b.color);
      ctx.fillStyle = sg;
      ctx.fillRect(b.x - r, b.y - r * 0.52, r * 2, r * 1.04);
    }

    // 3. Disco branco com número da bola (1..15)
    if (b.id > 0) {
      ctx.beginPath();
      ctx.arc(b.x, b.y, r * 0.46, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();

      ctx.fillStyle = '#0f172a';
      ctx.font = `900 ${Math.round(r * 0.54)}px Fredoka, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(String(b.id), b.x, b.y + 0.5);
    }

    // 4. Brilho especular realista
    const spec = ctx.createRadialGradient(b.x - r * 0.36, b.y - r * 0.36, 0, b.x - r * 0.36, b.y - r * 0.36, r * 0.42);
    spec.addColorStop(0, 'rgba(255, 255, 255, 0.85)');
    spec.addColorStop(0.35, 'rgba(255, 255, 255, 0.28)');
    spec.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = spec;
    ctx.beginPath();
    ctx.arc(b.x - r * 0.36, b.y - r * 0.36, r * 0.42, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  },

  drawAimingSystem(ctx, st, tb) {
    const cue = st.balls[0];
    const dirX = Math.cos(st.aimAngle);
    const dirY = Math.sin(st.aimAngle);
    const r = tb.r;
    const twoR = r * 2;
    const twoRSq = twoR * twoR;

    let closestDist = Infinity;
    let hitBall = null;

    // Raycast contra todas as outras bolas ativas (15 bolas)
    for (let i = 1; i < st.balls.length; i++) {
      const b = st.balls[i];
      if (!b.active) continue;

      const dx = b.x - cue.x;
      const dy = b.y - cue.y;
      const proj = dx * dirX + dy * dirY;
      if (proj <= 0) continue;

      const perpDistSq = (dx * dx + dy * dy) - (proj * proj);
      if (perpDistSq <= twoRSq) {
        const d = proj - Math.sqrt(Math.max(0, twoRSq - perpDistSq));
        if (d > 0 && d < closestDist) {
          closestDist = d;
          hitBall = b;
        }
      }
    }

    ctx.save();

    if (hitBall) {
      const ghostX = cue.x + dirX * closestDist;
      const ghostY = cue.y + dirY * closestDist;

      // 1. Linha de mira contínua branca até o impacto
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.moveTo(cue.x, cue.y);
      ctx.lineTo(ghostX, ghostY);
      ctx.stroke();

      // 2. Ghost Ball (Anel branco circular no ponto exato de colisão)
      ctx.beginPath();
      ctx.arc(ghostX, ghostY, r, 0, Math.PI * 2);
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Cruz interna no ghost ball
      ctx.beginPath();
      ctx.moveTo(ghostX - 4, ghostY);
      ctx.lineTo(ghostX + 4, ghostY);
      ctx.moveTo(ghostX, ghostY - 4);
      ctx.lineTo(ghostX, ghostY + 4);
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.4;
      ctx.stroke();

      // 3. Linha de trajetória da bola-alvo (após o impacto)
      const nx = hitBall.x - ghostX;
      const ny = hitBall.y - ghostY;
      const nLen = Math.hypot(nx, ny) || 1;
      const unX = nx / nLen;
      const unY = ny / nLen;

      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(hitBall.x, hitBall.y);
      ctx.lineTo(hitBall.x + unX * 75, hitBall.y + unY * 75);
      ctx.stroke();

      // 4. Linha de deflexão da bola branca (tangente)
      const dot = dirX * unX + dirY * unY;
      const tanX = dirX - dot * unX;
      const tanY = dirY - dot * unY;
      const tanLen = Math.hypot(tanX, tanY) || 1;

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(ghostX, ghostY);
      ctx.lineTo(ghostX + (tanX / tanLen) * 55, ghostY + (tanY / tanLen) * 55);
      ctx.stroke();
    } else {
      // Raycast até a tabela mais próxima
      let tX = Infinity;
      if (dirX > 0) tX = (tb.x + tb.w - r - cue.x) / dirX;
      else if (dirX < 0) tX = (tb.x + r - cue.x) / dirX;

      let tY = Infinity;
      if (dirY > 0) tY = (tb.y + tb.h - r - cue.y) / dirY;
      else if (dirY < 0) tY = (tb.y + r - cue.y) / dirY;

      const tCushion = Math.min(tX, tY);
      const wallX = cue.x + dirX * tCushion;
      const wallY = cue.y + dirY * tCushion;

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(cue.x, cue.y);
      ctx.lineTo(wallX, wallY);
      ctx.stroke();

      // Linha de reflexão na tabela
      const bounceDirX = tCushion === tX ? -dirX : dirX;
      const bounceDirY = tCushion === tY ? -dirY : dirY;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
      ctx.beginPath();
      ctx.moveTo(wallX, wallY);
      ctx.lineTo(wallX + bounceDirX * 60, wallY + bounceDirY * 60);
      ctx.stroke();
    }

    ctx.restore();
  },

  drawCueStick(ctx, cueX, cueY, angle, power) {
    const pullBack = 20 + (power / 100) * 58;
    const startX = cueX - Math.cos(angle) * pullBack;
    const startY = cueY - Math.sin(angle) * pullBack;
    const cueLength = 225;

    ctx.save();
    ctx.translate(startX, startY);
    ctx.rotate(angle + Math.PI); // taco alinhado apontando para a bola

    // Sola de giz azul (tip)
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(0, -2.5, 6, 5);

    // Virola branca (ferrule)
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(6, -2.8, 8, 5.6);

    // Corpo cônico de madeira Maple Canadense
    const shaftGrad = ctx.createLinearGradient(14, 0, cueLength - 68, 0);
    shaftGrad.addColorStop(0, '#fef08a');
    shaftGrad.addColorStop(0.5, '#fde047');
    shaftGrad.addColorStop(1, '#d97706');

    ctx.beginPath();
    ctx.moveTo(14, -3);
    ctx.lineTo(cueLength - 68, -5.5);
    ctx.lineTo(cueLength - 68, 5.5);
    ctx.lineTo(14, 3);
    ctx.closePath();
    ctx.fillStyle = shaftGrad;
    ctx.fill();

    // Anel metálico dourado
    ctx.fillStyle = '#fbbf24';
    ctx.fillRect(cueLength - 68, -5.8, 4, 11.6);

    // Empunhadura de linho irlandês / mogno escuro
    const buttGrad = ctx.createLinearGradient(cueLength - 64, 0, cueLength, 0);
    buttGrad.addColorStop(0, '#1c1917');
    buttGrad.addColorStop(0.5, '#292524');
    buttGrad.addColorStop(1, '#0c0a09');

    ctx.beginPath();
    ctx.moveTo(cueLength - 64, -5.8);
    ctx.lineTo(cueLength, -7.5);
    ctx.lineTo(cueLength, 7.5);
    ctx.lineTo(cueLength - 64, 5.8);
    ctx.closePath();
    ctx.fillStyle = buttGrad;
    ctx.fill();

    // Culatra branca de borracha
    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(cueLength, -6.5, 6, 13);

    ctx.restore();
  },

  drawPowerMeter(ctx, st, tb) {
    const mx = tb.x - 52;
    const my = tb.y + 12;
    const mw = 26;
    const mh = tb.h - 66;

    st.powerMeterBox = { x: mx - 8, y: my - 8, w: mw + 16, h: mh + 16 };

    ctx.save();
    // 1. Moldura metálica externa chanfrada
    ctx.fillStyle = '#141822';
    ctx.strokeStyle = '#384357';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.roundRect(mx, my, mw, mh, 12);
    ctx.fill();
    ctx.stroke();

    // 2. Trilho interno escuro
    ctx.fillStyle = '#0a0d14';
    ctx.beginPath();
    ctx.roundRect(mx + 3, my + 4, mw - 6, mh - 8, 8);
    ctx.fill();

    // 3. Preenchimento de força (Verde -> Amarelo -> Laranja/Vermelho)
    const fillH = Math.max(4, ((mh - 10) * st.power) / 100);
    const grad = ctx.createLinearGradient(0, my + 5, 0, my + mh - 5);
    grad.addColorStop(0, '#22c55e');
    grad.addColorStop(0.5, '#eab308');
    grad.addColorStop(1, '#ef4444');

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.roundRect(mx + 4, my + 5, mw - 8, fillH, 6);
    ctx.fill();

    // 4. Mini Taco de Sinuca estilizado dentro do trilho (puxando proporcional à força)
    const cueStickY = my + 5 + fillH;
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(mx + mw / 2 - 2.5, cueStickY - 6, 5, 5); // Virola
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(mx + mw / 2 - 2.5, cueStickY - 9, 5, 3); // Giz

    const stickGrad = ctx.createLinearGradient(mx, 0, mx + mw, 0);
    stickGrad.addColorStop(0, '#d97706');
    stickGrad.addColorStop(0.5, '#fde047');
    stickGrad.addColorStop(1, '#b45309');
    ctx.fillStyle = stickGrad;
    ctx.fillRect(mx + mw / 2 - 2, cueStickY, 4, Math.max(10, mh - (cueStickY - my) - 8));

    // 5. Cursor indicador horizontal brilhante
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#0284c7';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(mx - 4, cueStickY - 5, mw + 8, 10, 4);
    ctx.fill();
    ctx.stroke();

    // 6. Texto de Porcentagem
    ctx.fillStyle = '#38bdf8';
    ctx.font = '800 10px Fredoka, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`${st.power}%`, mx + mw / 2, my - 6);

    // 7. Botão Dedicado "💥 TACAR" logo abaixo
    const btnX = mx - 8;
    const btnY = my + mh + 8;
    const btnW = mw + 16;
    const btnH = 34;
    st.shootBtnBox = { x: btnX, y: btnY, w: btnW, h: btnH };

    const pulse = Math.sin(Date.now() * 0.006) * 0.15 + 0.85;
    const btnGrad = ctx.createLinearGradient(0, btnY, 0, btnY + btnH);
    btnGrad.addColorStop(0, '#f59e0b');
    btnGrad.addColorStop(1, '#d97706');

    ctx.fillStyle = btnGrad;
    ctx.strokeStyle = `rgba(254, 240, 138, ${pulse})`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(btnX, btnY, btnW, btnH, 8);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#1c1917';
    ctx.font = '900 10px Fredoka, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('💥 TACAR', btnX + btnW / 2, btnY + 21);

    ctx.restore();
  },

  drawSpinWidget(ctx, st, tb) {
    const sx = tb.x + tb.w + 46;
    const sy = tb.y + tb.h - 32;
    const sr = 24;

    st.spinWidgetBox = { x: sx, y: sy, r: sr };

    ctx.save();
    // Borda metálica
    ctx.beginPath();
    ctx.arc(sx, sy, sr + 3, 0, Math.PI * 2);
    ctx.fillStyle = '#1e2430';
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 2.4;
    ctx.fill();
    ctx.stroke();

    // Esfera 3D branca da bola tacadeira
    const bg = ctx.createRadialGradient(sx - sr * 0.3, sy - sr * 0.3, 2, sx, sy, sr);
    bg.addColorStop(0, '#ffffff');
    bg.addColorStop(0.7, '#f1f5f9');
    bg.addColorStop(1, '#cbd5e1');
    ctx.fillStyle = bg;
    ctx.beginPath();
    ctx.arc(sx, sy, sr, 0, Math.PI * 2);
    ctx.fill();

    // Mira cruzada do efeito
    ctx.strokeStyle = 'rgba(100, 116, 139, 0.4)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(sx - sr + 4, sy);
    ctx.lineTo(sx + sr - 4, sy);
    ctx.moveTo(sx, sy - sr + 4);
    ctx.lineTo(sx, sy + sr - 4);
    ctx.stroke();

    // Ponto vermelho onde o giz atinge a bola
    const spinDotX = sx + (st.spin ? st.spin.x * (sr - 6) : 0);
    const spinDotY = sy + (st.spin ? st.spin.y * (sr - 6) : 0);
    ctx.beginPath();
    ctx.arc(spinDotX, spinDotY, 4, 0, Math.PI * 2);
    ctx.fillStyle = '#dc2626';
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.2;
    ctx.fill();
    ctx.stroke();

    // Rótulo
    ctx.fillStyle = '#94a3b8';
    ctx.font = '700 9px Fredoka, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('EFEITO', sx, sy + sr + 14);

    ctx.restore();
  },

  drawPlayerCardsAndRacks(ctx, st, tb, width, names) {
    const isP1 = st.turn === 'p1';

    // 1. Card Jogador 1 (Noivo / Lisas - SOLIDS 1..7)
    const c1x = tb.x;
    const c1y = 48;
    const cw = 200;
    const ch = 48;

    ctx.save();
    ctx.fillStyle = isP1 ? 'rgba(37, 99, 235, 0.28)' : 'rgba(20, 24, 34, 0.75)';
    ctx.strokeStyle = isP1 ? '#38bdf8' : 'rgba(148, 163, 184, 0.3)';
    ctx.lineWidth = isP1 ? 2.5 : 1.5;
    ctx.beginPath();
    ctx.roundRect(c1x, c1y, cw, ch, 12);
    ctx.fill();
    ctx.stroke();

    ctx.font = '24px sans-serif';
    ctx.fillText('🤵', c1x + 18, c1y + 32);
    ctx.font = '700 13px Fredoka, sans-serif';
    ctx.fillStyle = isP1 ? '#60a5fa' : '#cbd5e1';
    ctx.textAlign = 'left';
    ctx.fillText(names.groom || 'Joao Costenaro', c1x + 38, c1y + 20);
    ctx.font = '600 11px Fredoka, sans-serif';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText(`SOLIDS (Lisas) • ${st.p1Score}/7`, c1x + 38, c1y + 36);

    // 2. Card Jogador 2 (Noiva / Listradas - STRIPES 9..15)
    const c2x = tb.x + tb.w - cw;
    const c2y = 48;

    ctx.fillStyle = !isP1 ? 'rgba(219, 39, 119, 0.28)' : 'rgba(20, 24, 34, 0.75)';
    ctx.strokeStyle = !isP1 ? '#f472b6' : 'rgba(148, 163, 184, 0.3)';
    ctx.lineWidth = !isP1 ? 2.5 : 1.5;
    ctx.beginPath();
    ctx.roundRect(c2x, c2y, cw, ch, 12);
    ctx.fill();
    ctx.stroke();

    ctx.font = '24px sans-serif';
    ctx.fillText('👰', c2x + 18, c2y + 32);
    ctx.font = '700 13px Fredoka, sans-serif';
    ctx.fillStyle = !isP1 ? '#f472b6' : '#cbd5e1';
    ctx.textAlign = 'left';
    ctx.fillText(names.bride || 'Noiva', c2x + 38, c2y + 20);
    ctx.font = '600 11px Fredoka, sans-serif';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText(`STRIPES (Listradas) • ${st.p2Score}/7`, c2x + 38, c2y + 36);

    // Status central da vez
    ctx.textAlign = 'center';
    ctx.font = '700 14px Fredoka, sans-serif';
    ctx.fillStyle = '#ffd166';
    const turnText = st.moving
      ? '🎱 Bolas rolando na mesa...'
      : isP1
      ? `Vez do Noivo (${names.groom || 'Joao Costenaro'})`
      : `Vez da Noiva (${names.bride || 'Noiva'})`;
    ctx.fillText(turnText, width / 2, c1y + 26);

    ctx.font = '500 11px Fredoka, sans-serif';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText('Mire na mesa • Ajuste a força na barra à esquerda (ou W/S / Roda) • Clique TACAR ou Espaço!', width / 2, c1y + 44);

    // 3. Racks verticais com exatamente 7 slots em cada lado (igual à imagem de referência!)
    const slotR = Math.max(6.5, Math.min(8.5, tb.w * 0.012));
    const slotSpacing = Math.min(24, (tb.h * 0.65) / 7);
    const startSlotY = tb.y + (tb.h - slotSpacing * 6) / 2;

    // Trilho esquerdo: 7 slots para o Noivo (Lisas)
    const leftSlotsX = tb.x - 18;
    for (let s = 0; s < 7; s++) {
      const slotY = startSlotY + s * slotSpacing;
      ctx.beginPath();
      ctx.arc(leftSlotsX, slotY, slotR, 0, Math.PI * 2);
      ctx.fillStyle = '#0a0e17';
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 1.5;
      ctx.fill();
      ctx.stroke();
      if (s < st.p1Score) {
        ctx.beginPath();
        ctx.arc(leftSlotsX, slotY, slotR - 1.5, 0, Math.PI * 2);
        ctx.fillStyle = '#38bdf8';
        ctx.fill();
      }
    }

    // Trilho direito: 7 slots para a Noiva (Listradas)
    const rightSlotsX = tb.x + tb.w + 18;
    for (let s = 0; s < 7; s++) {
      const slotY = startSlotY + s * slotSpacing;
      ctx.beginPath();
      ctx.arc(rightSlotsX, slotY, slotR, 0, Math.PI * 2);
      ctx.fillStyle = '#0a0e17';
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 1.5;
      ctx.fill();
      ctx.stroke();
      if (s < st.p2Score) {
        ctx.beginPath();
        ctx.arc(rightSlotsX, slotY, slotR - 1.5, 0, Math.PI * 2);
        ctx.fillStyle = '#f472b6';
        ctx.fill();
      }
    }

    ctx.restore();
  }
};


// ============================================================================
// MINIGAME 2: ROGUELITE COOPERATIVO (SOBREVIVÊNCIA NA LUA DE MEL)
// ============================================================================
const ROGUE_UPGRADES = [
  { id: 'speed', title: '☕ Café dos Professores', desc: '+35% Velocidade para o Casal', key: '1' },
  { id: 'fire', title: '🖊️ Caneta Vermelha Turbo', desc: 'Tiros 45% mais rápidos e duplos', key: '2' },
  { id: 'heal', title: '💍 Bênção das Alianças', desc: 'Recupera +40% de Vida e +Escudo', key: '3' }
];

const Minigame2_Roguelite = {
  id: 'mg2_roguelite',
  order: 2,
  title: '2. ROGUELITE COOP: SOBREVIVÊNCIA',
  subtitle: 'Sobrevivam 45s às hordas e escolham Cartas de Upgrade a cada 15s!',
  icon: '⚔️',

  onEnter(ctxApi) {
    const { width, height } = ctxApi.getViewport();
    ctxApi.mgState = {
      timeLeft: 45.0,
      nextUpgradeTime: 30.0,
      choosingCard: false,
      hp: 100,
      maxHp: 100,
      speedMult: 1,
      fireCooldownMax: 0.48,
      doubleShot: false,
      p1: { x: width * 0.4, y: height * 0.55, fireTimer: 0.2 },
      p2: { x: width * 0.6, y: height * 0.55, fireTimer: 0.2 },
      enemies: [],
      bullets: [],
      spawnTimer: 0.6
    };
  },

  applyUpgrade(idx, ctxApi) {
    const st = ctxApi.mgState;
    if (!st || !st.choosingCard) return;
    const card = ROGUE_UPGRADES[idx] || ROGUE_UPGRADES[0];
    if (card.id === 'speed') st.speedMult *= 1.35;
    if (card.id === 'fire') {
      st.fireCooldownMax *= 0.65;
      st.doubleShot = true;
    }
    if (card.id === 'heal') {
      st.hp = Math.min(st.maxHp, st.hp + 45);
    }
    st.choosingCard = false;
    ctxApi.sfx.playAltarFanfare();
    ctxApi.floatingText(st.p1.x, st.p1.y - 30, `UPGRADE: ${card.title}!`, '#06d6a0');
  },

  onUpdate(dt, ctxApi) {
    const st = ctxApi.mgState;
    if (!st || st.choosingCard) return;

    const { width, height } = ctxApi.getViewport();
    const keys = ctxApi.getKeys();
    const spd = 210 * st.speedMult;

    // Movimento P1 e P2
    if (keys.p1Left) st.p1.x -= spd * dt;
    if (keys.p1Right) st.p1.x += spd * dt;
    if (keys.p1Up) st.p1.y -= spd * dt;
    if (keys.p1Down) st.p1.y += spd * dt;

    if (keys.p2Left) st.p2.x -= spd * dt;
    if (keys.p2Right) st.p2.x += spd * dt;
    if (keys.p2Up) st.p2.y -= spd * dt;
    if (keys.p2Down) st.p2.y += spd * dt;

    [st.p1, st.p2].forEach((p) => {
      p.x = Math.max(40, Math.min(width - 40, p.x));
      p.y = Math.max(85, Math.min(height - 40, p.y));
    });

    st.timeLeft = Math.max(0, st.timeLeft - dt);
    if (st.timeLeft <= 0) {
      ctxApi.victory('Vocês sobreviveram ao apocalipse de boletos e provas no Roguelite!');
      return;
    }

    if (st.timeLeft <= st.nextUpgradeTime && st.nextUpgradeTime > 5) {
      st.nextUpgradeTime -= 15;
      st.choosingCard = true;
      ctxApi.sfx.playClick();
      return;
    }

    // Spawna inimigos (Boletos, Provas, Parentes)
    st.spawnTimer -= dt;
    if (st.spawnTimer <= 0) {
      st.spawnTimer = Math.max(0.35, 0.9 - ((45 - st.timeLeft) / 45) * 0.45);
      const side = Math.floor(Math.random() * 4);
      let ex = Math.random() * width;
      let ey = 75;
      if (side === 1) { ex = width + 20; ey = Math.random() * height; }
      if (side === 2) { ex = Math.random() * width; ey = height + 20; }
      if (side === 3) { ex = -20; ey = Math.random() * height; }

      const types = [
        { emoji: '💸', name: 'Boleto', color: '#ef4444', spd: 95 },
        { emoji: '📚', name: 'Provas', color: '#3b82f6', spd: 85 },
        { emoji: '👵', name: 'Parente', color: '#a855f7', spd: 110 }
      ];
      const tpl = types[Math.floor(Math.random() * types.length)];
      st.enemies.push({ x: ex, y: ey, ...tpl, r: 19 });
    }

    // Auto-disparo no inimigo mais próximo
    ['p1', 'p2'].forEach((k) => {
      const p = st[k];
      p.fireTimer -= dt;
      if (p.fireTimer <= 0 && st.enemies.length > 0) {
        p.fireTimer = st.fireCooldownMax;
        let nearest = st.enemies[0];
        let minDist = Infinity;
        st.enemies.forEach((en) => {
          const d = Math.hypot(en.x - p.x, en.y - p.y);
          if (d < minDist) { minDist = d; nearest = en; }
        });
        const ang = Math.atan2(nearest.y - p.y, nearest.x - p.x);
        const offsets = st.doubleShot ? [-0.12, 0.12] : [0];
        offsets.forEach((off) => {
          st.bullets.push({
            x: p.x,
            y: p.y - 20,
            vx: Math.cos(ang + off) * 420,
            vy: Math.sin(ang + off) * 420,
            color: k === 'p1' ? '#4cc9f0' : '#ff5d8f',
            life: 1.4
          });
        });
      }
    });

    // Atualiza tiros
    for (let i = st.bullets.length - 1; i >= 0; i--) {
      const b = st.bullets[i];
      b.x += b.vx * dt;
      b.y += b.vy * dt;
      b.life -= dt;
      if (b.life <= 0) st.bullets.splice(i, 1);
    }

    // Atualiza inimigos
    for (let i = st.enemies.length - 1; i >= 0; i--) {
      const en = st.enemies[i];
      const d1 = Math.hypot(st.p1.x - en.x, st.p1.y - en.y);
      const d2 = Math.hypot(st.p2.x - en.x, st.p2.y - en.y);
      const target = d1 <= d2 ? st.p1 : st.p2;
      const ang = Math.atan2(target.y - en.y, target.x - en.x);
      en.x += Math.cos(ang) * en.spd * dt;
      en.y += Math.sin(ang) * en.spd * dt;

      // Colisão com tiros
      let killed = false;
      for (let j = st.bullets.length - 1; j >= 0; j--) {
        const b = st.bullets[j];
        if (Math.hypot(en.x - b.x, en.y - b.y) < en.r + 8) {
          st.bullets.splice(j, 1);
          killed = true;
          break;
        }
      }
      if (killed) {
        ctxApi.particles(en.x, en.y, en.color, 10, 140);
        st.enemies.splice(i, 1);
        continue;
      }

      // Dano nos jogadores
      if (d1 < en.r + 20 || d2 < en.r + 20) {
        st.hp -= 22;
        ctxApi.sfx.playBounce();
        ctxApi.particles(en.x, en.y, '#ff3355', 14, 170);
        st.enemies.splice(i, 1);
        if (st.hp <= 0) {
          ctxApi.batatinha('A vida compartilhada do casal chegou a zero no Roguelite!', {
            x: target.x,
            y: target.y,
            r: 45
          });
          return;
        }
      }
    }
  },

  onKeyDown(code, ctxApi) {
    const st = ctxApi.mgState;
    if (!st || !st.choosingCard) return;
    if (code === 'Digit1' || code === 'KeyA' || code === 'ArrowLeft') this.applyUpgrade(0, ctxApi);
    if (code === 'Digit2' || code === 'KeyW' || code === 'ArrowUp' || code === 'Space') this.applyUpgrade(1, ctxApi);
    if (code === 'Digit3' || code === 'KeyD' || code === 'ArrowRight') this.applyUpgrade(2, ctxApi);
  },

  onPointerDown(x, y, ctxApi) {
    const st = ctxApi.mgState;
    if (!st) return;
    const { width } = ctxApi.getViewport();
    if (st.choosingCard) {
      if (x < width * 0.36) this.applyUpgrade(0, ctxApi);
      else if (x < width * 0.64) this.applyUpgrade(1, ctxApi);
      else this.applyUpgrade(2, ctxApi);
    }
  },

  onRender(ctx, ctxApi) {
    const st = ctxApi.mgState;
    if (!st) return;
    const { width, height } = ctxApi.getViewport();

    ctx.fillStyle = '#181028';
    ctx.fillRect(0, 0, width, height);

    // Barra de Vida Compartilhada e Tempo
    ctx.fillStyle = '#1f2937';
    ctx.fillRect(width / 2 - 160, 74, 320, 22);
    ctx.fillStyle = st.hp > 35 ? '#06d6a0' : '#ff3355';
    ctx.fillRect(width / 2 - 158, 76, Math.max(0, (316 * st.hp) / st.maxHp), 18);
    ctx.fillStyle = '#ffffff';
    ctx.font = '700 13px Fredoka, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`❤️ VIDA DO CASAL: ${Math.max(0, Math.round(st.hp))}%  |  ⏱️ ${st.timeLeft.toFixed(1)}s`, width / 2, 89);

    // Jogadores
    ctxApi.drawGroom(st.p1.x, st.p1.y + 15, st.timeLeft * 8, 0.85, true);
    ctxApi.drawBride(st.p2.x, st.p2.y + 15, st.timeLeft * 8, 0.85, true);

    // Tiros
    st.bullets.forEach((b) => {
      ctx.fillStyle = b.color;
      ctx.beginPath();
      ctx.arc(b.x, b.y, 6, 0, Math.PI * 2);
      ctx.fill();
    });

    // Inimigos
    st.enemies.forEach((en) => {
      ctx.fillStyle = en.color;
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(en.x, en.y, en.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.font = '20px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(en.emoji, en.x, en.y);

      ctx.font = '700 12px Fredoka, sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.fillText(en.name, en.x, en.y - en.r - 9);
    });

    // Overlay de Cartas de Upgrade a cada 15s
    if (st.choosingCard) {
      ctx.fillStyle = 'rgba(10, 4, 24, 0.88)';
      ctx.fillRect(0, 0, width, height);

      ctx.fillStyle = '#ffd166';
      ctx.font = '700 22px Fredoka, sans-serif';
      ctx.fillText('✨ ESCOLHAM UMA CARTA DE UPGRADE! ✨', width / 2, height * 0.22);

      const cardW = Math.min(210, (width - 80) / 3);
      const cardH = 190;
      const gap = 18;
      const startX = width / 2 - (cardW * 3 + gap * 2) / 2;

      ROGUE_UPGRADES.forEach((c, idx) => {
        const cx = startX + idx * (cardW + gap);
        const cy = height * 0.32;
        ctx.fillStyle = '#2d1b4e';
        ctx.strokeStyle = '#ffd166';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.roundRect(cx, cy, cardW, cardH, 14);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.font = '700 15px Fredoka, sans-serif';
        ctx.fillText(c.title, cx + cardW / 2, cy + 50);

        ctx.fillStyle = '#cbb8e8';
        ctx.font = '600 13px Fredoka, sans-serif';
        ctx.fillText(c.desc, cx + cardW / 2, cy + 95);

        ctx.fillStyle = '#06d6a0';
        ctx.font = '700 13px Fredoka, sans-serif';
        ctx.fillText(`[Tecla ${idx + 1} ou Toque]`, cx + cardW / 2, cy + 150);
      });
    }
  }
};

// ============================================================================
// MINIGAME 3: PLATAFORMA COOPERATIVO (O CHÃO É LAVA DE BOLETOS)
// ============================================================================
const Minigame3_Plataforma = {
  id: 'mg3_plataforma',
  order: 3,
  title: '3. PLATAFORMA COOP: LAVA DE BOLETOS',
  subtitle: 'Pisem no botão para abrir a comporta e cheguem juntos ao Portal!',
  icon: '🌋',

  onEnter(ctxApi) {
    const { height } = ctxApi.getViewport();
    const lavaY = height - 48;
    ctxApi.mgState = {
      lavaY,
      gateOpen: false,
      p1: { x: 85, y: lavaY - 70, vx: 0, vy: 0, grounded: false },
      p2: { x: 130, y: lavaY - 70, vx: 0, vy: 0, grounded: false },
      movingPlatOffset: 0
    };
  },

  getPlatforms(width, height, movingOffset, gateOpen) {
    const lavaY = height - 48;
    return [
      { x: 30, y: lavaY - 65, w: width * 0.24, h: 18, type: 'solid' },
      { x: width * 0.31 + movingOffset, y: lavaY - 125, w: width * 0.16, h: 18, type: 'moving' },
      { x: width * 0.52, y: lavaY - 175, w: width * 0.20, h: 18, type: 'button_plat' },
      { x: width * 0.76, y: lavaY - 140, w: width * 0.20, h: 18, type: 'portal_plat', locked: !gateOpen }
    ];
  },

  onUpdate(dt, ctxApi) {
    const st = ctxApi.mgState;
    if (!st) return;
    const { width, height } = ctxApi.getViewport();
    st.lavaY = height - 48;
    st.movingPlatOffset = Math.sin(ctxApi.getTime() * 2.2) * (width * 0.04);

    const plats = this.getPlatforms(width, height, st.movingPlatOffset, st.gateOpen);
    const buttonX = width * 0.60;
    const buttonY = st.lavaY - 175;
    const springX = width * 0.22;
    const springY = st.lavaY - 65;

    const keys = ctxApi.getKeys();
    const moveSpd = 220;
    const gravity = 1350;

    [
      { actor: st.p1, left: keys.p1Left, right: keys.p1Right, jump: keys.p1Up },
      { actor: st.p2, left: keys.p2Left, right: keys.p2Right, jump: keys.p2Up }
    ].forEach(({ actor, left, right, jump }) => {
      actor.vx = (left ? -1 : 0) * moveSpd + (right ? 1 : 0) * moveSpd;
      if (jump && actor.grounded) {
        actor.vy = -560;
        actor.grounded = false;
        ctxApi.sfx.playJump();
      }

      actor.x += actor.vx * dt;
      const prevY = actor.y;
      actor.y += actor.vy * dt;
      actor.vy += gravity * dt;
      actor.grounded = false;

      // Colisão com plataformas
      plats.forEach((pl) => {
        if (
          actor.x > pl.x - 12 &&
          actor.x < pl.x + pl.w + 12 &&
          prevY <= pl.y + 8 &&
          actor.y >= pl.y &&
          actor.vy >= 0
        ) {
          actor.y = pl.y;
          actor.vy = 0;
          actor.grounded = true;
        }
      });

      // Mola propulsora na primeira plataforma
      if (Math.abs(actor.x - springX) < 22 && Math.abs(actor.y - springY) < 16) {
        actor.vy = -720;
        actor.grounded = false;
        ctxApi.sfx.playBounce();
      }

      // Botão cooperativo abre a comporta do portal permanentemente
      if (Math.abs(actor.x - buttonX) < 28 && Math.abs(actor.y - buttonY) < 20) {
        if (!st.gateOpen) {
          st.gateOpen = true;
          ctxApi.sfx.playAltarFanfare();
          ctxApi.floatingText(buttonX, buttonY - 40, 'PORTAL LIBERADO! 🔓', '#06d6a0');
        }
      }

      // Barreira laser antes de apertar o botão
      const gateX = width * 0.75;
      if (!st.gateOpen && actor.x > gateX - 15) {
        actor.x = gateX - 15;
      }

      // Caiu na lava de boletos -> BATATINHA!
      if (actor.y > st.lavaY) {
        ctxApi.batatinha('Alguém caiu no mar de Lava de Boletos!', { x: actor.x, y: st.lavaY, r: 44 });
      }
    });

    // Vitória: ambos no Portal da Lua de Mel
    const portalX = width * 0.88;
    const portalY = st.lavaY - 140;
    if (
      st.gateOpen &&
      Math.hypot(st.p1.x - portalX, st.p1.y - portalY) < 48 &&
      Math.hypot(st.p2.x - portalX, st.p2.y - portalY) < 48
    ) {
      ctxApi.victory('O casal cruzou o Portal e escapou da Lava de Boletos!');
    }
  },

  onKeyDown(code, ctxApi) {
    const st = ctxApi.mgState;
    if (!st) return;
    if (code === 'KeyW' && st.p1.grounded) {
      st.p1.vy = -560;
      st.p1.grounded = false;
      ctxApi.sfx.playJump(false);
    }
    if ((code === 'ArrowUp' || code === 'Space') && st.p2.grounded) {
      st.p2.vy = -560;
      st.p2.grounded = false;
      ctxApi.sfx.playJump(true);
    }
  },

  onRender(ctx, ctxApi) {
    const st = ctxApi.mgState;
    if (!st) return;
    const { width, height } = ctxApi.getViewport();
    const plats = this.getPlatforms(width, height, st.movingPlatOffset, st.gateOpen);

    ctx.fillStyle = '#1a0f2e';
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = '#ffd166';
    ctx.font = '700 15px Fredoka, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(
      '1️⃣ Usem a Mola [🌀] -> 2️⃣ Pisem no Botão [🔘] -> 3️⃣ Entrem juntos no Portal [🏝️]!',
      width / 2,
      88
    );

    // Desenha Plataformas
    plats.forEach((pl) => {
      ctx.fillStyle = pl.type === 'moving' ? '#0284c7' : '#4c1d95';
      ctx.strokeStyle = '#ffd166';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.roundRect(pl.x, pl.y, pl.w, pl.h, 6);
      ctx.fill();
      ctx.stroke();
    });

    // Mola
    const springX = width * 0.22;
    const springY = st.lavaY - 65;
    ctx.font = '24px sans-serif';
    ctx.fillText('🌀', springX, springY - 12);

    // Botão Cooperativo
    const buttonX = width * 0.60;
    const buttonY = st.lavaY - 175;
    ctx.fillStyle = st.gateOpen ? '#06d6a0' : '#ef4444';
    ctx.fillRect(buttonX - 20, buttonY - 10, 40, 10);
    ctx.font = '700 12px Fredoka, sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(st.gateOpen ? 'ABERTO ✅' : 'PISE AQUI 🔘', buttonX, buttonY - 18);

    // Comporta Laser
    if (!st.gateOpen) {
      ctx.strokeStyle = '#ff3355';
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(width * 0.75, st.lavaY - 260);
      ctx.lineTo(width * 0.75, st.lavaY);
      ctx.stroke();
    }

    // Portal da Lua de Mel
    const portalX = width * 0.88;
    const portalY = st.lavaY - 140;
    ctx.font = '40px sans-serif';
    ctx.fillText('🏝️', portalX, portalY - 24);
    ctx.font = '700 12px Fredoka, sans-serif';
    ctx.fillStyle = '#06d6a0';
    ctx.fillText('PORTAL', portalX, portalY - 58);

    // Personagens
    ctxApi.drawGroom(st.p1.x, st.p1.y, ctxApi.getTime() * 8, 0.82, true);
    ctxApi.drawBride(st.p2.x, st.p2.y, ctxApi.getTime() * 8, 0.82, true);

    // Mar de Lava de Boletos
    ctx.fillStyle = '#dc2626';
    ctx.fillRect(0, st.lavaY, width, height - st.lavaY);
    ctx.fillStyle = '#facc15';
    ctx.font = '700 15px Fredoka, sans-serif';
    ctx.fillText('🔥💸 MAR DE LAVA DE BOLETOS E JUROS DO CARTÃO 💸🔥', width / 2, st.lavaY + 28);
  }
};

// ============================================================================
// MINIGAME 4: JOGO DE TIRO ESTILO CONTRA (RUN & GUN)
// ============================================================================
const Minigame4_Contra = {
  id: 'mg4_contra',
  order: 4,
  title: '4. CONTRA RUN & GUN: CASAL EM AÇÃO',
  subtitle: 'Atirem nos Drones de Paparazzi, peguem cápsulas [S]/[L] e derrotem o Chefão!',
  icon: '💥',

  onEnter(ctxApi) {
    const { width, height } = ctxApi.getViewport();
    const groundY = height - 70;
    ctxApi.mgState = {
      groundY,
      lives: 5,
      bossHp: 100,
      bossMaxHp: 100,
      bossY: groundY - 110,
      p1: { x: 110, y: groundY, vy: 0, weapon: 'normal', fireTimer: 0 },
      p2: { x: 175, y: groundY, vy: 0, weapon: 'normal', fireTimer: 0 },
      bullets: [],
      enemyBullets: [],
      drones: [],
      powerups: [],
      spawnTimer: 1.0
    };
  },

  onUpdate(dt, ctxApi) {
    const st = ctxApi.mgState;
    if (!st) return;
    const { width, height } = ctxApi.getViewport();
    st.groundY = height - 70;

    const keys = ctxApi.getKeys();
    const gravity = 1400;

    [
      { p: st.p1, left: keys.p1Left, right: keys.p1Right, jump: keys.p1Up, color: '#4cc9f0' },
      { p: st.p2, left: keys.p2Left, right: keys.p2Right, jump: keys.p2Up, color: '#ff5d8f' }
    ].forEach(({ p, left, right, jump, color }) => {
      if (left) p.x -= 230 * dt;
      if (right) p.x += 230 * dt;
      p.x = Math.max(45, Math.min(width * 0.65, p.x));

      if (jump && p.y >= st.groundY - 2) {
        p.vy = -590;
        ctxApi.sfx.playJump();
      }
      p.y += p.vy * dt;
      p.vy += gravity * dt;
      if (p.y > st.groundY) {
        p.y = st.groundY;
        p.vy = 0;
      }

      // Disparo contínuo estilo Contra
      p.fireTimer -= dt;
      if (p.fireTimer <= 0) {
        p.fireTimer = p.weapon === 'laser' ? 0.16 : 0.24;
        if (p.weapon === 'spread') {
          [-0.22, 0, 0.22].forEach((ang) => {
            st.bullets.push({
              x: p.x + 18,
              y: p.y - 32,
              vx: Math.cos(ang) * 540,
              vy: Math.sin(ang) * 540,
              dmg: 2.2,
              color
            });
          });
        } else {
          st.bullets.push({
            x: p.x + 18,
            y: p.y - 32,
            vx: 620,
            vy: 0,
            dmg: p.weapon === 'laser' ? 3.5 : 2.0,
            color: p.weapon === 'laser' ? '#ffd166' : color
          });
        }
      }
    });

    // Chefão flutua na direita
    const bossX = width - 95;
    st.bossY = st.groundY - 125 + Math.sin(ctxApi.getTime() * 2.5) * 65;

    // Spawna Drones e Power-Ups (S = Spread, L = Laser)
    st.spawnTimer -= dt;
    if (st.spawnTimer <= 0) {
      st.spawnTimer = 1.25;
      st.drones.push({
        x: bossX - 30,
        y: st.groundY - 40 - Math.random() * 140,
        vx: -190 - Math.random() * 70
      });

      if (Math.random() < 0.38) {
        const kind = Math.random() < 0.5 ? 'spread' : 'laser';
        st.powerups.push({
          x: width - 80,
          y: st.groundY - 95,
          vx: -140,
          kind,
          label: kind === 'spread' ? 'S' : 'L'
        });
      }
    }

    // Atualiza Power-ups
    for (let i = st.powerups.length - 1; i >= 0; i--) {
      const pw = st.powerups[i];
      pw.x += pw.vx * dt;
      [st.p1, st.p2].forEach((p) => {
        if (Math.hypot(p.x - pw.x, (p.y - 30) - pw.y) < 34) {
          p.weapon = pw.kind;
          ctxApi.sfx.playAltarFanfare();
          ctxApi.floatingText(p.x, p.y - 65, `ARMA [${pw.label}] ATIVADA!`, '#ffd166');
          pw.collected = true;
        }
      });
      if (pw.collected || pw.x < -40) st.powerups.splice(i, 1);
    }

    // Atualiza tiros dos jogadores
    for (let i = st.bullets.length - 1; i >= 0; i--) {
      const b = st.bullets[i];
      b.x += b.vx * dt;
      b.y += b.vy * dt;

      // Acertou o Chefão
      if (Math.hypot(b.x - bossX, b.y - st.bossY) < 52) {
        st.bossHp -= b.dmg;
        ctxApi.particles(b.x, b.y, '#ffd166', 4, 90);
        st.bullets.splice(i, 1);
        if (st.bossHp <= 0) {
          ctxApi.victory('Chefão da Papelada e Paparazzi destruído no modo Contra!');
          return;
        }
        continue;
      }

      if (b.x > width + 30) st.bullets.splice(i, 1);
    }

    // Atualiza Drones Inimigos
    for (let i = st.drones.length - 1; i >= 0; i--) {
      const dr = st.drones[i];
      dr.x += dr.vx * dt;

      // Checa se tiro matou o drone
      let hit = false;
      for (let j = st.bullets.length - 1; j >= 0; j--) {
        const b = st.bullets[j];
        if (Math.hypot(dr.x - b.x, dr.y - b.y) < 26) {
          st.bullets.splice(j, 1);
          hit = true;
          break;
        }
      }
      if (hit) {
        ctxApi.particles(dr.x, dr.y, '#ff5d8f', 10, 150);
        st.drones.splice(i, 1);
        continue;
      }

      // Checa se bateu em P1 ou P2
      const hitP1 = Math.hypot(dr.x - st.p1.x, dr.y - (st.p1.y - 30)) < 28;
      const hitP2 = Math.hypot(dr.x - st.p2.x, dr.y - (st.p2.y - 30)) < 28;
      if (hitP1 || hitP2) {
        st.lives -= 1;
        ctxApi.sfx.playBounce();
        ctxApi.particles(dr.x, dr.y, '#ff3355', 16, 180);
        st.drones.splice(i, 1);
        if (st.lives <= 0) {
          ctxApi.batatinha('Os drones de paparazzi derrotaram o casal!', { x: dr.x, y: dr.y, r: 44 });
          return;
        }
        continue;
      }

      if (dr.x < -40) st.drones.splice(i, 1);
    }
  },

  onKeyDown(code, ctxApi) {
    const st = ctxApi.mgState;
    if (!st) return;
    if (code === 'KeyW' && st.p1.y >= st.groundY - 2) {
      st.p1.vy = -590;
      ctxApi.sfx.playJump(false);
    }
    if ((code === 'ArrowUp' || code === 'Space') && st.p2.y >= st.groundY - 2) {
      st.p2.vy = -590;
      ctxApi.sfx.playJump(true);
    }
  },

  onRender(ctx, ctxApi) {
    const st = ctxApi.mgState;
    if (!st) return;
    const { width, height } = ctxApi.getViewport();

    ctx.fillStyle = '#120924';
    ctx.fillRect(0, 0, width, height);

    // Chão metálico estilo Contra
    ctx.fillStyle = '#334155';
    ctx.fillRect(0, st.groundY, width, height - st.groundY);
    ctx.fillStyle = '#ffd166';
    ctx.fillRect(0, st.groundY, width, 4);

    // HUD Vidas + Barra do Chefão
    ctx.font = '700 15px Fredoka, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillStyle = '#ff5d8f';
    ctx.fillText(`❤️ VIDAS DA EQUIPE: ${'❤️'.repeat(Math.max(0, st.lives))}`, 24, 90);

    ctx.textAlign = 'center';
    ctx.fillStyle = '#1f2937';
    ctx.fillRect(width / 2 - 140, 74, 280, 20);
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(width / 2 - 138, 76, Math.max(0, (276 * st.bossHp) / st.bossMaxHp), 16);
    ctx.fillStyle = '#ffffff';
    ctx.font = '700 12px Fredoka, sans-serif';
    ctx.fillText(`🤖 CHEFÃO MEC-BUFFET: ${Math.max(0, Math.round(st.bossHp))}%`, width / 2, 88);

    // Personagens
    ctxApi.drawGroom(st.p1.x, st.p1.y, ctxApi.getTime() * 10, 0.9, true);
    ctxApi.drawBride(st.p2.x, st.p2.y, ctxApi.getTime() * 10, 0.9, true);

    // Cápsulas Power-Up (S e L)
    st.powerups.forEach((pw) => {
      ctx.fillStyle = '#eab308';
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(pw.x, pw.y, 18, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#111827';
      ctx.font = '700 16px "Press Start 2P", monospace';
      ctx.fillText(pw.label, pw.x, pw.y + 5);
    });

    // Tiros
    st.bullets.forEach((b) => {
      ctx.fillStyle = b.color;
      ctx.beginPath();
      ctx.arc(b.x, b.y, 6, 0, Math.PI * 2);
      ctx.fill();
    });

    // Drones Inimigos
    st.drones.forEach((dr) => {
      ctx.fillStyle = '#dc2626';
      ctx.beginPath();
      ctx.arc(dr.x, dr.y, 20, 0, Math.PI * 2);
      ctx.fill();
      ctx.font = '22px sans-serif';
      ctx.fillText('📸', dr.x, dr.y + 6);
    });

    // Chefão Gigante na Direita
    const bossX = width - 95;
    ctx.fillStyle = '#7c2d12';
    ctx.strokeStyle = '#ffd166';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.roundRect(bossX - 48, st.bossY - 55, 96, 110, 16);
    ctx.fill();
    ctx.stroke();
    ctx.font = '46px sans-serif';
    ctx.fillText('👹', bossX, st.bossY + 12);
  }
};


// ============================================================================
// games_part2.js - Minigames 5 a 8 da "Operação Lua de Mel"
// 5. Jump King | 6. X1 de Louça | 7. Flappy Duplo | 8. Top Gear Retrô
// ============================================================================

// ============================================================================
// MINIGAME 5: JUMP KING DO CASAL (ESCALADA DE PRECISÃO)
// ============================================================================
const Minigame5_JumpKing = {
  id: 'mg5_jumpking',
  order: 5,
  title: '5. JUMP KING DO CASAL: ESCALADA',
  subtitle: 'Segurem Pulo para carregar a força! Subam até o topo sem cair de volta!',
  icon: '👑',

  onEnter(ctxApi) {
    const { width, height } = ctxApi.getViewport();
    const baseY = height - 48;
    const platforms = [
      { x: width * 0.22, y: baseY, w: width * 0.56, level: 0 },
      { x: width * 0.14, y: baseY - 82, w: 150, level: 1 },
      { x: width * 0.58, y: baseY - 160, w: 150, level: 2 },
      { x: width * 0.20, y: baseY - 238, w: 145, level: 3 },
      { x: width * 0.56, y: baseY - 315, w: 145, level: 4 },
      { x: width * 0.34, y: baseY - 392, w: 180, level: 5, isGoal: true }
    ];

    ctxApi.mgState = {
      platforms,
      p1: { x: width * 0.44, y: baseY, vx: 0, vy: 0, grounded: true, charging: false, charge: 0, dir: 0, maxLevel: 0 },
      p2: { x: width * 0.56, y: baseY, vx: 0, vy: 0, grounded: true, charging: false, charge: 0, dir: 0, maxLevel: 0 }
    };
  },

  releaseJump(actor, ctxApi) {
    if (!actor.charging || !actor.grounded) return;
    const pwr = Math.max(0.22, actor.charge);
    actor.vy = -(360 + pwr * 440);
    actor.vx = actor.dir * (140 + pwr * 220);
    actor.grounded = false;
    actor.charging = false;
    actor.charge = 0;
    ctxApi.sfx.playJump();
  },

  onUpdate(dt, ctxApi) {
    const st = ctxApi.mgState;
    if (!st) return;
    const { width, height } = ctxApi.getViewport();
    const keys = ctxApi.getKeys();
    const gravity = 1280;

    // Direção de mira para cada jogador
    st.p1.dir = (keys.p1Left ? -1 : 0) + (keys.p1Right ? 1 : 0);
    st.p2.dir = (keys.p2Left ? -1 : 0) + (keys.p2Right ? 1 : 0);

    [st.p1, st.p2].forEach((p, idx) => {
      if (p.charging && p.grounded) {
        p.charge = Math.min(1, p.charge + dt * 1.15);
        // Movimento lento se não estiver carregando
      } else if (p.grounded) {
        p.x += p.dir * 95 * dt;
      }

      if (!p.grounded) {
        p.x += p.vx * dt;
        const prevY = p.y;
        p.y += p.vy * dt;
        p.vy += gravity * dt;

        // Rebate nas paredes laterais estilo Jump King
        if (p.x < 35) { p.x = 35; p.vx = Math.abs(p.vx) * 0.65; }
        if (p.x > width - 35) { p.x = width - 35; p.vx = -Math.abs(p.vx) * 0.65; }

        // Checa aterrissagem nas plataformas
        st.platforms.forEach((pl) => {
          if (
            p.vy >= 0 &&
            p.x >= pl.x - 10 &&
            p.x <= pl.x + pl.w + 10 &&
            prevY <= pl.y + 8 &&
            p.y >= pl.y
          ) {
            p.y = pl.y;
            p.vx = 0;
            p.vy = 0;
            p.grounded = true;
            if (pl.level > p.maxLevel) {
              p.maxLevel = pl.level;
            } else if (pl.level === 0 && p.maxLevel >= 2) {
              // Caiu de volta para a base depois de já ter subido!
              const who = idx === 0 ? ctxApi.getNames().groom : ctxApi.getNames().bride;
              ctxApi.batatinha(`${who} errou o salto no Jump King e despencou até a base!`, {
                x: p.x,
                y: p.y,
                r: 44
              });
            }
          }
        });
      }

      // Verifica se escorregou para fora da plataforma
      if (p.grounded) {
        const standingOn = st.platforms.find(
          (pl) => Math.abs(p.y - pl.y) < 5 && p.x >= pl.x - 12 && p.x <= pl.x + pl.w + 12
        );
        if (!standingOn) {
          p.grounded = false;
        }
      }

      // Caiu no abismo inferior
      if (p.y > height + 20) {
        ctxApi.batatinha('Caíram no abismo da Torre do Jump King!', { x: p.x, y: height - 30, r: 45 });
      }
    });

    // Corda elástica suave do casal
    const dx = st.p2.x - st.p1.x;
    const dy = st.p2.y - st.p1.y;
    const dist = Math.hypot(dx, dy);
    if (dist > 240) {
      const pull = (dist - 240) * 1.8 * dt;
      const nx = dx / dist;
      st.p1.x += nx * pull;
      st.p2.x -= nx * pull;
    }

    // Vitória: Ambos na plataforma 5 (Suíte Presidencial)
    const goalPlat = st.platforms[st.platforms.length - 1];
    if (
      st.p1.grounded &&
      st.p2.grounded &&
      Math.abs(st.p1.y - goalPlat.y) < 8 &&
      Math.abs(st.p2.y - goalPlat.y) < 8
    ) {
      ctxApi.victory('Escaladores mestres! O casal conquistou o topo do Jump King!');
    }
  },

  onKeyDown(code, ctxApi) {
    const st = ctxApi.mgState;
    if (!st) return;
    if (code === 'KeyW' && st.p1.grounded) {
      st.p1.charging = true;
    }
    if ((code === 'ArrowUp' || code === 'Space') && st.p2.grounded) {
      st.p2.charging = true;
    }
  },

  onKeyUp(code, ctxApi) {
    const st = ctxApi.mgState;
    if (!st) return;
    if (code === 'KeyW') this.releaseJump(st.p1, ctxApi);
    if (code === 'ArrowUp' || code === 'Space') this.releaseJump(st.p2, ctxApi);
  },

  onRender(ctx, ctxApi) {
    const st = ctxApi.mgState;
    if (!st) return;
    const { width, height } = ctxApi.getViewport();

    ctx.fillStyle = '#130b29';
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = '#ffd166';
    ctx.font = '700 14px Fredoka, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(
      'Segure [W] ou [⬆️/Espaço] + Direção p/ Carregar o Salto • Se cair de volta pra base = BATATINHA!',
      width / 2,
      82
    );

    // Desenha plataformas
    st.platforms.forEach((pl) => {
      ctx.fillStyle = pl.isGoal ? '#059669' : '#4c1d95';
      ctx.strokeStyle = pl.isGoal ? '#ffd166' : '#c084fc';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.roundRect(pl.x, pl.y, pl.w, 16, 6);
      ctx.fill();
      ctx.stroke();

      if (pl.isGoal) {
        ctx.font = '26px sans-serif';
        ctx.fillText('🏰👑', pl.x + pl.w / 2, pl.y - 18);
      }
    });

    // Corda elástica de aliança entre os dois
    ctx.strokeStyle = 'rgba(255, 209, 102, 0.55)';
    ctx.lineWidth = 3;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(st.p1.x, st.p1.y - 25);
    ctx.lineTo(st.p2.x, st.p2.y - 25);
    ctx.stroke();
    ctx.setLineDash([]);

    // Personagens (agacham quando estão carregando o pulo!)
    ctxApi.drawGroom(st.p1.x, st.p1.y, 0, 0.8, true, st.p1.charging);
    ctxApi.drawBride(st.p2.x, st.p2.y, 0, 0.8, true, st.p2.charging);

    // Barras de carga sobre a cabeça
    [st.p1, st.p2].forEach((p) => {
      if (p.charging) {
        ctx.fillStyle = '#1f2937';
        ctx.fillRect(p.x - 26, p.y - 65, 52, 10);
        ctx.fillStyle = '#ffd166';
        ctx.fillRect(p.x - 24, p.y - 63, 48 * p.charge, 6);
      }
    });
  }
};

// ============================================================================
// MINIGAME 6: X1 DE LOUÇA (DUELO DE VELOCIDADE)
// ============================================================================
const DISH_STEPS = [
  { name: 'ENSABOAR', icon: '🧽', p1Key: 'A', p2Key: '⬅️' },
  { name: 'ENXAGUAR', icon: '🚿', p1Key: 'W', p2Key: '⬆️' },
  { name: 'SECAR', icon: '✨', p1Key: 'D', p2Key: '➡️' }
];

const Minigame6_Louca = {
  id: 'mg6_louca',
  order: 6,
  title: '6. X1 DE LOUÇA: DUELO NA PIA',
  subtitle: 'Lave 8 pratos na ordem certa (Ensaboar -> Enxaguar -> Secar)! Quebrar 3 pratos dá BATATINHA!',
  icon: '🍽️',

  onEnter(ctxApi) {
    ctxApi.mgState = {
      goalPlates: 8,
      p1: { cleaned: 0, step: 0, broken: 0 },
      p2: { cleaned: 0, step: 0, broken: 0 }
    };
  },

  handleAction(playerKey, actionIdx, ctxApi) {
    const st = ctxApi.mgState;
    if (!st) return;
    const p = st[playerKey];
    const names = ctxApi.getNames();
    const who = playerKey === 'p1' ? names.groom : names.bride;
    const { width, height } = ctxApi.getViewport();
    const px = playerKey === 'p1' ? width * 0.27 : width * 0.73;

    if (actionIdx === p.step) {
      p.step++;
      ctxApi.sfx.playClick();
      if (p.step >= 3) {
        p.step = 0;
        p.cleaned++;
        ctxApi.sfx.playBounce();
        ctxApi.particles(px, height * 0.52, '#06d6a0', 12, 150);
        ctxApi.floatingText(px, height * 0.42, 'PRATO BRILHANDO! ✨', '#06d6a0');

        if (p.cleaned >= st.goalPlates) {
          ctxApi.victory(`${who} venceu o X1 de Louça deixando a pia impecável!`);
        }
      }
    } else {
      // Errou a etapa -> Quebrou o prato!
      p.broken++;
      p.step = 0;
      ctxApi.sfx.playShoot();
      ctxApi.particles(px, height * 0.52, '#ef4444', 16, 180);
      ctxApi.floatingText(px, height * 0.42, '💥 PRATO QUEBROU!', '#ff3355');

      if (p.broken >= 3) {
        ctxApi.batatinha(`${who} quebrou 3 pratos de porcelana do casamento!`, {
          x: px,
          y: height * 0.52,
          r: 50
        });
      }
    }
  },

  onUpdate() {},

  onKeyDown(code, ctxApi) {
    if (code === 'KeyA') this.handleAction('p1', 0, ctxApi);
    if (code === 'KeyW') this.handleAction('p1', 1, ctxApi);
    if (code === 'KeyD') this.handleAction('p1', 2, ctxApi);

    if (code === 'ArrowLeft') this.handleAction('p2', 0, ctxApi);
    if (code === 'ArrowUp' || code === 'Space') this.handleAction('p2', 1, ctxApi);
    if (code === 'ArrowRight') this.handleAction('p2', 2, ctxApi);
  },

  onPointerDown(x, y, ctxApi) {
    const st = ctxApi.mgState;
    if (!st) return;
    const { width } = ctxApi.getViewport();
    const isLeft = x < width / 2;
    const pKey = isLeft ? 'p1' : 'p2';
    // No mobile, tocar no lado do jogador avança a etapa atual
    this.handleAction(pKey, st[pKey].step, ctxApi);
  },

  onRender(ctx, ctxApi) {
    const st = ctxApi.mgState;
    if (!st) return;
    const { width, height } = ctxApi.getViewport();
    const names = ctxApi.getNames();

    ctx.fillStyle = '#160d29';
    ctx.fillRect(0, 0, width, height);

    // Divisória central
    ctx.strokeStyle = 'rgba(255,209,102,0.35)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(width / 2, 65);
    ctx.lineTo(width / 2, height);
    ctx.stroke();

    [
      { key: 'p1', name: names.groom, cx: width * 0.25, color: '#38bdf8' },
      { key: 'p2', name: names.bride, cx: width * 0.75, color: '#f472b6' }
    ].forEach((side) => {
      const p = st[side.key];
      const stepObj = DISH_STEPS[p.step];
      const keyLabel = side.key === 'p1' ? stepObj.p1Key : stepObj.p2Key;

      ctx.fillStyle = side.color;
      ctx.font = '700 18px Fredoka, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`${side.name}`, side.cx, 96);

      ctx.fillStyle = '#ffffff';
      ctx.font = '700 15px Fredoka, sans-serif';
      ctx.fillText(`🍽️ Pratos Limpos: ${p.cleaned} / ${st.goalPlates}`, side.cx, 126);
      ctx.fillStyle = '#ff3355';
      ctx.fillText(`💔 Quebrados: ${p.broken} / 3`, side.cx, 150);

      // Prato gigante no centro da bancada
      ctx.fillStyle = p.step === 0 ? '#a16207' : p.step === 1 ? '#bae6fd' : '#ffffff';
      ctx.strokeStyle = side.color;
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.arc(side.cx, height * 0.50, 56, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.font = '42px sans-serif';
      ctx.fillText(stepObj.icon, side.cx, height * 0.51);

      // Placa grande da ação exigida agora
      ctx.fillStyle = '#0f051d';
      ctx.strokeStyle = '#ffd166';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.roundRect(side.cx - 115, height * 0.68, 230, 62, 12);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#ffd166';
      ctx.font = '700 16px Fredoka, sans-serif';
      ctx.fillText(`AGORA: ${stepObj.name}!`, side.cx, height * 0.68 + 24);
      ctx.fillStyle = '#06d6a0';
      ctx.font = '700 14px Fredoka, sans-serif';
      ctx.fillText(`Aperte [${keyLabel}] ou Toque!`, side.cx, height * 0.68 + 46);
    });
  }
};

// ============================================================================
// MINIGAME 7: FLAPPY BIRD DUPLO (VOO DA LUA DE MEL)
// ============================================================================
const Minigame7_Flappy = {
  id: 'mg7_flappy',
  order: 7,
  title: '7. FLAPPY DUPLO: VOO DOS NOIVOS',
  subtitle: 'Passem juntos por 10 colunas floridas sem bater! [W] = Noivo | [⬆️/Espaço] = Noiva',
  icon: '🕊️',

  onEnter(ctxApi) {
    const { height } = ctxApi.getViewport();
    ctxApi.mgState = {
      passedCount: 0,
      goalPipes: 10,
      p1: { y: height * 0.42, vy: 0 },
      p2: { y: height * 0.58, vy: 0 },
      pipes: [],
      spawnTimer: 0.4
    };
  },

  flap(playerKey, ctxApi) {
    const st = ctxApi.mgState;
    if (!st) return;
    st[playerKey].vy = -340;
    ctxApi.sfx.playJump(playerKey === 'p2');
  },

  onUpdate(dt, ctxApi) {
    const st = ctxApi.mgState;
    if (!st) return;
    const { width, height } = ctxApi.getViewport();
    const gravity = 860;
    const birdX1 = width * 0.24;
    const birdX2 = width * 0.31;

    ['p1', 'p2'].forEach((k) => {
      const b = st[k];
      b.y += b.vy * dt;
      b.vy += gravity * dt;

      if (b.y < 70 || b.y > height - 25) {
        const who = k === 'p1' ? ctxApi.getNames().groom : ctxApi.getNames().bride;
        ctxApi.batatinha(`${who} perdeu altitude no Flappy Duplo!`, {
          x: k === 'p1' ? birdX1 : birdX2,
          y: Math.max(80, Math.min(height - 30, b.y)),
          r: 40
        });
      }
    });

    st.spawnTimer -= dt;
    if (st.spawnTimer <= 0 && st.passedCount + st.pipes.length < st.goalPipes) {
      st.spawnTimer = 2.0;
      const gapH = Math.max(155, height * 0.34);
      const minCenter = 140 + gapH / 2;
      const maxCenter = height - 80 - gapH / 2;
      const gapY = minCenter + Math.random() * Math.max(40, maxCenter - minCenter);
      st.pipes.push({
        x: width + 60,
        w: 62,
        gapY,
        gapH,
        passed: false
      });
    }

    for (let i = st.pipes.length - 1; i >= 0; i--) {
      const pp = st.pipes[i];
      pp.x -= 210 * dt;

      const topEdge = pp.gapY - pp.gapH / 2;
      const botEdge = pp.gapY + pp.gapH / 2;

      [
        { b: st.p1, bx: birdX1, name: ctxApi.getNames().groom },
        { b: st.p2, bx: birdX2, name: ctxApi.getNames().bride }
      ].forEach(({ b, bx, name }) => {
        if (bx + 16 > pp.x && bx - 16 < pp.x + pp.w) {
          if (b.y - 16 < topEdge || b.y + 16 > botEdge) {
            ctxApi.batatinha(`${name} bateu na coluna de flores do Flappy Duplo!`, {
              x: bx,
              y: b.y,
              r: 44
            });
          }
        }
      });

      if (!pp.passed && pp.x + pp.w < birdX1) {
        pp.passed = true;
        st.passedCount++;
        ctxApi.sfx.playBounce();
        if (st.passedCount >= st.goalPipes) {
          ctxApi.victory('Voo sincronizado perfeito! Vocês venceram o Flappy Bird Duplo!');
          return;
        }
      }

      if (pp.x < -90) st.pipes.splice(i, 1);
    }
  },

  onKeyDown(code, ctxApi) {
    if (code === 'KeyW') this.flap('p1', ctxApi);
    if (code === 'ArrowUp' || code === 'Space') this.flap('p2', ctxApi);
  },

  onPointerDown(x, y, ctxApi) {
    const { width } = ctxApi.getViewport();
    if (x < width / 2) this.flap('p1', ctxApi);
    else this.flap('p2', ctxApi);
  },

  onRender(ctx, ctxApi) {
    const st = ctxApi.mgState;
    if (!st) return;
    const { width, height } = ctxApi.getViewport();
    const birdX1 = width * 0.24;
    const birdX2 = width * 0.31;

    ctx.fillStyle = '#1e1b4b';
    ctx.fillRect(0, 0, width, height);

    // Colunas de Casamento
    st.pipes.forEach((pp) => {
      const topH = pp.gapY - pp.gapH / 2;
      const botY = pp.gapY + pp.gapH / 2;

      ctx.fillStyle = '#f43f5e';
      ctx.strokeStyle = '#ffd166';
      ctx.lineWidth = 3;
      ctx.fillRect(pp.x, 62, pp.w, topH - 62);
      ctx.strokeRect(pp.x, 62, pp.w, topH - 62);

      ctx.fillRect(pp.x, botY, pp.w, height - botY);
      ctx.strokeRect(pp.x, botY, pp.w, height - botY);
    });

    // Noivo e Noiva Voadores
    ctxApi.drawGroom(birdX1, st.p1.y + 20, ctxApi.getTime() * 14, 0.72, true);
    ctxApi.drawBride(birdX2, st.p2.y + 20, ctxApi.getTime() * 14, 0.72, true);

    ctx.fillStyle = '#ffd166';
    ctx.font = '700 17px Fredoka, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`🕊️ COLUNAS SUPERADAS: ${st.passedCount} / ${st.goalPipes}`, width / 2, 92);
  }
};

// ============================================================================
// MINIGAME 8: TOP GEAR (CORRIDA RETRÔ PARA O AEROPORTO)
// ============================================================================
const Minigame8_TopGear = {
  id: 'mg8_topgear',
  order: 8,
  title: '8. TOP GEAR RETRÔ: GRANDE PRÊMIO DA LUA DE MEL',
  subtitle: 'Corrida real de 3 Voltas! Segure W/⬆️ para acelerar, S/⬇️ para frear, A/D para virar e ESPAÇO/ENTER para Nitro!',
  icon: '🏎️',

  onEnter(ctxApi) {
    const names = ctxApi.getNames();
    ctxApi.mgState = {
      // 3 Voltas de 100m cada (total 300m de prova)
      lapLength: 100,
      totalLaps: 3,
      currentLap: 1,
      raceTimer: 0,
      fuel: 100,
      curvePhase: 0,
      roadCurve: 0,
      mountainOffset: 0,
      lapBanner: '🏁 LARGADA! VOLTA 1 / 3 - PISA NO ACELERADOR!',
      lapBannerTimer: 3.5,
      cameraDist: 0,

      // NOIVO (P1 - Carro Ciano)
      p1: {
        dist: 0,
        speed: 40,
        x: -0.38,
        steer: 0,
        nitros: 3,
        nitroTimer: 0,
        rpm: 0.35,
        gear: 1,
        rank: 15,
        braking: false,
        accelerating: false
      },

      // NOIVA (P2 - Carro Rosa)
      p2: {
        dist: 0,
        speed: 40,
        x: 0.38,
        steer: 0,
        nitros: 3,
        nitroTimer: 0,
        rpm: 0.35,
        gear: 1,
        rank: 14,
        braking: false,
        accelerating: false
      },

      p2ManualControl: false,

      // 10 Rivais à frente no grid
      traffic: [
        { lane: -0.22, dist: 35, speed: 74, color: '#f8fafc', label: 'RIVAL 10' },
        { lane: 0.32, dist: 65, speed: 78, color: '#dc2626', label: 'RIVAL 9' },
        { lane: -0.50, dist: 95, speed: 82, color: '#94a3b8', label: 'RIVAL 8' },
        { lane: 0.15, dist: 130, speed: 85, color: '#eab308', label: 'RIVAL 7' },
        { lane: -0.35, dist: 165, speed: 88, color: '#16a34a', label: 'RIVAL 6' },
        { lane: 0.40, dist: 200, speed: 90, color: '#7c3aed', label: 'RIVAL 5' },
        { lane: -0.18, dist: 235, speed: 92, color: '#ea580c', label: 'RIVAL 4' },
        { lane: 0.28, dist: 270, speed: 94, color: '#0284c7', label: 'RIVAL 3' },
        { lane: -0.28, dist: 305, speed: 96, color: '#ef4444', label: 'RIVAL 2' },
        { lane: 0.05, dist: 345, speed: 98, color: '#ffffff', label: 'LÍDER 1' }
      ],

      scenery: [
        { side: -1, z: 0.15, type: 'bush' },
        { side: 1, z: 0.35, type: 'rock' },
        { side: -1, z: 0.58, type: 'rock' },
        { side: 1, z: 0.78, type: 'bush' },
        { side: -1, z: 0.95, type: 'bush' }
      ],

      fuels: [
        { lane: 0.0, dist: 75 },
        { lane: -0.25, dist: 180 },
        { lane: 0.25, dist: 260 }
      ],

      touchControls: { gas: false, brake: false, left: false, right: false }
    };
  },

  triggerP1Nitro(ctxApi) {
    const st = ctxApi.mgState;
    if (!st || st.p1.nitros <= 0 || st.p1.nitroTimer > 0) return;
    st.p1.nitros--;
    st.p1.nitroTimer = 3.0;
    st.p1.speed = Math.max(st.p1.speed, 175);
    if (ctxApi.sfx?.playAltarFanfare) ctxApi.sfx.playAltarFanfare();
    else if (ctxApi.sfx?.playShoot) ctxApi.sfx.playShoot();
    const { width, height } = ctxApi.getViewport();
    const name = ctxApi.getNames().groom || 'NOIVO';
    ctxApi.floatingText(width * 0.35, height * 0.52, `🔥 ${name}: NITRO 195 MPH! 🔥`, '#38bdf8');
  },

  triggerP2Nitro(ctxApi) {
    const st = ctxApi.mgState;
    if (!st || st.p2.nitros <= 0 || st.p2.nitroTimer > 0) return;
    st.p2.nitros--;
    st.p2.nitroTimer = 3.0;
    st.p2.speed = Math.max(st.p2.speed, 175);
    if (ctxApi.sfx?.playAltarFanfare) ctxApi.sfx.playAltarFanfare();
    else if (ctxApi.sfx?.playShoot) ctxApi.sfx.playShoot();
    const { width, height } = ctxApi.getViewport();
    const name = ctxApi.getNames().bride || 'NOIVA';
    ctxApi.floatingText(width * 0.65, height * 0.52, `🔥 ${name}: NITRO 195 MPH! 🔥`, '#f472b6');
  },

  onUpdate(dt, ctxApi) {
    const st = ctxApi.mgState;
    if (!st) return;
    const keys = ctxApi.getKeys();
    const names = ctxApi.getNames();
    const tc = st.touchControls || {};

    st.raceTimer += dt;
    if (st.lapBannerTimer > 0) st.lapBannerTimer -= dt;

    if (keys.p2Up || keys.p2Down || keys.p2Left || keys.p2Right) {
      st.p2ManualControl = true;
    }

    // 1. NOIVO (P1): W (Acelerar), S (Freio), A/D (Virar)
    const p1 = st.p1;
    if (p1.nitroTimer > 0) p1.nitroTimer -= dt;
    p1.accelerating = keys.p1Up || tc.gas;
    p1.braking = keys.p1Down || tc.brake;

    if (p1.nitroTimer > 0) {
      p1.speed = Math.min(195, p1.speed + 80 * dt);
      p1.rpm = 0.95;
      p1.gear = 5;
    } else if (p1.accelerating) {
      p1.speed = Math.min(142, p1.speed + 52 * dt);
      p1.rpm = Math.min(0.85, 0.35 + (p1.speed / 142) * 0.50);
      p1.gear = p1.speed > 115 ? 5 : p1.speed > 85 ? 4 : p1.speed > 58 ? 3 : p1.speed > 30 ? 2 : 1;
    } else if (p1.braking) {
      p1.speed = Math.max(0, p1.speed - 95 * dt);
      p1.rpm = Math.max(0.20, p1.rpm - 1.2 * dt);
      p1.gear = p1.speed > 85 ? 4 : p1.speed > 50 ? 3 : 1;
    } else {
      p1.speed = Math.max(0, p1.speed - 24 * dt);
      p1.rpm = Math.max(0.20, p1.speed / 160);
    }

    let p1Move = 0;
    if (keys.p1Left || tc.left) { p1.x -= 1.65 * dt; p1Move = -1; }
    if (keys.p1Right || tc.right) { p1.x += 1.65 * dt; p1Move = 1; }
    p1.x -= st.roadCurve * 0.40 * dt;
    p1.steer += (p1Move - p1.steer) * 8 * dt;

    if (Math.abs(p1.x) > 0.88) {
      p1.speed = Math.max(30, p1.speed - 45 * dt);
    }
    p1.x = Math.max(-1.0, Math.min(1.0, p1.x));
    p1.dist += (p1.speed / 106) * 3.8 * dt;

    // 2. NOIVA (P2): Seta Cima (Acelerar), Seta Baixo (Freio), Setas Esq/Dir
    const p2 = st.p2;
    if (p2.nitroTimer > 0) p2.nitroTimer -= dt;
    p2.accelerating = keys.p2Up;
    p2.braking = keys.p2Down;

    if (p2.nitroTimer > 0) {
      p2.speed = Math.min(195, p2.speed + 80 * dt);
      p2.rpm = 0.95;
      p2.gear = 5;
    } else if (p2.accelerating) {
      p2.speed = Math.min(142, p2.speed + 52 * dt);
      p2.rpm = Math.min(0.85, 0.35 + (p2.speed / 142) * 0.50);
      p2.gear = p2.speed > 115 ? 5 : p2.speed > 85 ? 4 : p2.speed > 58 ? 3 : p2.speed > 30 ? 2 : 1;
    } else if (p2.braking) {
      p2.speed = Math.max(0, p2.speed - 95 * dt);
      p2.rpm = Math.max(0.20, p2.rpm - 1.2 * dt);
      p2.gear = p2.speed > 85 ? 4 : p2.speed > 50 ? 3 : 1;
    } else {
      if (!st.p2ManualControl) {
        // IA acompanhante da Noiva
        p2.speed = Math.min(120, p2.speed + 38 * dt);
        p2.rpm = 0.68;
        p2.gear = 4;
      } else {
        p2.speed = Math.max(0, p2.speed - 24 * dt);
        p2.rpm = Math.max(0.20, p2.speed / 160);
      }
    }

    let p2Move = 0;
    if (keys.p2Left) { p2.x -= 1.65 * dt; p2Move = -1; }
    if (keys.p2Right) { p2.x += 1.65 * dt; p2Move = 1; }
    p2.x -= st.roadCurve * 0.40 * dt;
    p2.steer += (p2Move - p2.steer) * 8 * dt;

    if (Math.abs(p2.x) > 0.88) {
      p2.speed = Math.max(30, p2.speed - 45 * dt);
    }
    p2.x = Math.max(-1.0, Math.min(1.0, p2.x));
    p2.dist += (p2.speed / 106) * 3.8 * dt;

    // Vácuo e toque suave entre Noivo e Noiva
    const distDiff = p1.dist - p2.dist;
    const laneDiff = Math.abs(p1.x - p2.x);
    if (Math.abs(distDiff) < 6 && laneDiff < 0.28) {
      if (distDiff < 0 && p1.accelerating) p1.speed = Math.min(160, p1.speed + 20 * dt);
      else if (distDiff > 0 && p2.accelerating) p2.speed = Math.min(160, p2.speed + 20 * dt);
    }
    if (Math.abs(distDiff) < 2.5 && laneDiff < 0.32) {
      const push = (0.32 - laneDiff) * 0.5;
      if (p1.x < p2.x) { p1.x -= push; p2.x += push; }
      else { p1.x += push; p2.x -= push; }
    }

    // Curvas
    st.curvePhase += dt * 0.90;
    st.roadCurve = Math.sin(st.curvePhase) * 0.46;
    st.mountainOffset -= st.roadCurve * 55 * dt;

    // Câmera sincronizada com a média da dupla
    st.cameraDist = (p1.dist + p2.dist) / 2;

    // Voltas e Linha de Chegada
    const leadDist = Math.max(p1.dist, p2.dist);
    const lapIndex = Math.min(st.totalLaps, Math.floor(leadDist / st.lapLength) + 1);
    if (lapIndex > st.currentLap) {
      st.currentLap = lapIndex;
      st.lapBanner = lapIndex === st.totalLaps
        ? '🏁 VOLTA FINAL (LAP 3/3)! TUDO OU NADA!'
        : `🏁 VOLTA ${lapIndex} / 3!`;
      st.lapBannerTimer = 3.2;
      ctxApi.sfx.playAltarFanfare();
    }

    // Fim da Prova
    if (leadDist >= st.lapLength * st.totalLaps) {
      const winnerName = p1.dist >= p2.dist ? (names.groom || 'O NOIVO') : (names.bride || 'A NOIVA');
      const secondName = p1.dist >= p2.dist ? (names.bride || 'A NOIVA') : (names.groom || 'O NOIVO');
      ctxApi.victory(`🏆 FIM DE PROVA! ${winnerName} VENCEU A CORRIDA DA LUA DE MEL EM 1º LUGAR! (${secondName} garantiu a dobradinha no pódio!)`);
      return;
    }

    // Combustível
    if (p1.speed > 5 || p2.speed > 5) {
      st.fuel -= (p1.nitroTimer > 0 || p2.nitroTimer > 0 ? 4.5 : 2.0) * dt;
    }
    if (st.fuel <= 0) {
      const { width, height } = ctxApi.getViewport();
      ctxApi.batatinha('Acabou o combustível dos carros na corrida! O casal abandonou a prova!', {
        x: width * 0.85,
        y: height * 0.65,
        r: 45
      });
      return;
    }

    // Rivais
    let p1AheadRivals = 0;
    let p2AheadRivals = 0;
    for (let i = 0; i < st.traffic.length; i++) {
      const r = st.traffic[i];
      r.dist += (r.speed / 106) * 3.4 * dt;

      // Colisão de Noivo com rival
      const p1RelZ = r.dist - p1.dist;
      if (Math.abs(p1RelZ) < 2.5 && Math.abs(r.lane - p1.x) < 0.28) {
        p1.speed = Math.max(30, p1.speed - 30);
        r.dist += 4;
        ctxApi.sfx.playBounce();
        const { width, height } = ctxApi.getViewport();
        ctxApi.floatingText(width * 0.35, height * 0.75, '💥 IMPACTO! -30 MPH', '#f87171');
      }

      // Colisão de Noiva com rival
      const p2RelZ = r.dist - p2.dist;
      if (Math.abs(p2RelZ) < 2.5 && Math.abs(r.lane - p2.x) < 0.28) {
        p2.speed = Math.max(30, p2.speed - 30);
        r.dist += 4;
        ctxApi.sfx.playBounce();
        const { width, height } = ctxApi.getViewport();
        ctxApi.floatingText(width * 0.65, height * 0.75, '💥 IMPACTO! -30 MPH', '#f87171');
      }

      if (p1.dist > r.dist) p1AheadRivals++;
      if (p2.dist > r.dist) p2AheadRivals++;
    }

    const totalCompetitors = st.traffic.length + 2;
    p1.rank = Math.max(1, totalCompetitors - p1AheadRivals - (p1.dist < p2.dist ? 0 : 1));
    p2.rank = Math.max(1, totalCompetitors - p2AheadRivals - (p2.dist < p1.dist ? 0 : 1));

    // Galões de Combustível
    for (let i = 0; i < st.fuels.length; i++) {
      const f = st.fuels[i];
      const relDist = f.dist - st.cameraDist;
      if (Math.abs(relDist) < 2.5) {
        if (Math.abs(f.lane - p1.x) < 0.30 || Math.abs(f.lane - p2.x) < 0.30) {
          st.fuel = Math.min(100, st.fuel + 35);
          ctxApi.sfx.playBounce();
          const { width, height } = ctxApi.getViewport();
          ctxApi.floatingText(width / 2, height * 0.58, '+35% COMBUSTÍVEL ⛽', '#22c55e');
          f.dist += 100; // Repõe na próxima volta
        }
      }
    }

    // Cenário lateral
    const avgSpeed = (p1.speed + p2.speed) / 2;
    for (let i = 0; i < st.scenery.length; i++) {
      const sc = st.scenery[i];
      sc.z -= 0.68 * (avgSpeed / 106) * dt;
      if (sc.z < -0.15) {
        sc.z = 1.05 + Math.random() * 0.2;
        sc.side = Math.random() < 0.5 ? -1 : 1;
        sc.type = Math.random() < 0.5 ? 'bush' : 'rock';
      }
    }
  },

  onKeyDown(code, ctxApi) {
    if (['Space', 'KeyE'].includes(code)) {
      this.triggerP1Nitro(ctxApi);
    }
    if (['Enter', 'ShiftRight'].includes(code)) {
      this.triggerP2Nitro(ctxApi);
    }
  },

  onPointerDown(x, y, ctxApi) {
    const st = ctxApi.mgState;
    if (!st) return;
    const tc = st.touchControls;

    if (st.btnGas && x >= st.btnGas.x && x <= st.btnGas.x + st.btnGas.w && y >= st.btnGas.y && y <= st.btnGas.y + st.btnGas.h) {
      tc.gas = true;
      return;
    }
    if (st.btnBrake && x >= st.btnBrake.x && x <= st.btnBrake.x + st.btnBrake.w && y >= st.btnBrake.y && y <= st.btnBrake.y + st.btnBrake.h) {
      tc.brake = true;
      return;
    }
    if (st.btnLeft && x >= st.btnLeft.x && x <= st.btnLeft.x + st.btnLeft.w && y >= st.btnLeft.y && y <= st.btnLeft.y + st.btnLeft.h) {
      tc.left = true;
      return;
    }
    if (st.btnRight && x >= st.btnRight.x && x <= st.btnRight.x + st.btnRight.w && y >= st.btnRight.y && y <= st.btnRight.y + st.btnRight.h) {
      tc.right = true;
      return;
    }
    if (st.btnNitro && x >= st.btnNitro.x && x <= st.btnNitro.x + st.btnNitro.w && y >= st.btnNitro.y && y <= st.btnNitro.y + st.btnNitro.h) {
      this.triggerP1Nitro(ctxApi);
      return;
    }
  },

  onPointerUp(ctxApi) {
    const st = ctxApi.mgState;
    if (!st || !st.touchControls) return;
    st.touchControls.gas = false;
    st.touchControls.brake = false;
    st.touchControls.left = false;
    st.touchControls.right = false;
  },

  // ==========================================================================
  // RENDERIZAÇÃO RETRÔ SNES TOP GEAR
  // ==========================================================================
  onRender(ctx, ctxApi) {
    const st = ctxApi.mgState;
    if (!st) return;
    const { width, height } = ctxApi.getViewport();
    const names = ctxApi.getNames();

    const horizonY = Math.floor(height * 0.44);

    // 1. Céu Azul
    const skyGrad = ctx.createLinearGradient(0, 0, 0, horizonY);
    skyGrad.addColorStop(0, '#0090e8');
    skyGrad.addColorStop(1, '#00a8f8');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, width, horizonY);

    // 2. Montanhas Douradas Orgânicas com o letreiro "HOLLYWOOD"
    this.drawMountainsAndHollywood(ctx, width, horizonY, st.mountainOffset);

    // 3. Pista Larga com Curvas e Linha de Chegada Quadriculada Real
    const roadCurveShift = Math.sin(st.curvePhase) * (width * 0.18);
    this.drawRoadAndGrass(ctx, width, height, horizonY, roadCurveShift, st.cameraDist, st);

    // 4. Objetos da Paisagem (Arbustos e Pedras)
    this.drawScenery(ctx, st, width, height, horizonY, roadCurveShift);

    // 5. Galões de Combustível (⛽)
    this.drawFuelPickups(ctx, st, width, height, horizonY, roadCurveShift);

    // 6. Carros Rivais de Tráfego à Frente
    this.drawTrafficCars(ctx, st, width, height, horizonY, roadCurveShift);

    // 7. CARROS DO CASAL (ESTÁVEIS NO PRIMEIRO PLANO, NUNCA CORTADOS!)
    this.drawPlayerCoupleCars(ctx, st, width, height, names, horizonY, roadCurveShift);

    // 8. Banners de Volta
    if (st.lapBannerTimer > 0 && st.lapBanner) {
      ctx.save();
      const bY = height * 0.50;
      ctx.fillStyle = 'rgba(0, 0, 0, 0.88)';
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.roundRect(width / 2 - 250, bY - 24, 500, 48, 10);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#ffd166';
      ctx.font = '900 21px "Impact", "Arial Black", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(st.lapBanner, width / 2, bY + 8);
      ctx.restore();
    }

    // 9. HUD COMPLETO TOP GEAR (POSICIONADO LIMPO ABAIXO DO TOPO!)
    this.drawTopGearHUD(ctx, st, width, height);

    // 10. Controles Touch para Celular
    this.drawTouchControls(ctx, st, width, height);
  },

  drawMountainsAndHollywood(ctx, width, horizonY, offset) {
    ctx.save();
    const baseY = horizonY;

    // Camada traseira de montanhas
    ctx.fillStyle = '#8a6d0c';
    ctx.beginPath();
    ctx.moveTo(0, baseY);
    for (let x = -80; x <= width + 80; x += 30) {
      const rx = x + (offset * 0.35);
      const wave = Math.sin(rx * 0.009) * 28 + Math.cos(rx * 0.021) * 20;
      ctx.lineTo(x, baseY - 65 - wave);
    }
    ctx.lineTo(width, baseY);
    ctx.closePath();
    ctx.fill();

    // Camada frontal de colinas douradas onduladas
    ctx.fillStyle = '#c59e1a';
    ctx.beginPath();
    ctx.moveTo(0, baseY);
    for (let x = -80; x <= width + 80; x += 25) {
      const rx = x + (offset * 0.55);
      const wave = Math.sin(rx * 0.012) * 32 + Math.cos(rx * 0.024) * 16;
      ctx.lineTo(x, baseY - 48 - wave);
    }
    ctx.lineTo(width, baseY);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = '#deb824';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Letreiro "HOLLYWOOD"
    const signBaseX = width * 0.44;
    const signX = signBaseX + ((offset * 0.55) % (width * 0.7));
    const signY = baseY - 62;

    ctx.save();
    ctx.font = '900 18px "Arial Black", "Impact", monospace';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#4a3b05';
    ctx.fillText('H O L L Y W O O D', signX + 2, signY + 3);
    ctx.fillText('H O L L Y W O O D', signX + 1, signY + 2);
    ctx.fillStyle = '#ffffff';
    ctx.fillText('H O L L Y W O O D', signX, signY);
    ctx.restore();

    ctx.restore();
  },

  drawRoadAndGrass(ctx, width, height, horizonY, curveShift, distance, st) {
    const roadH = height - horizonY;
    const slices = 40;

    // Distância para a próxima linha de chegada
    const nextFinishDist = st.currentLap * st.lapLength;
    const relFinish = nextFinishDist - st.cameraDist; // metros até a linha

    for (let i = 0; i < slices; i++) {
      const t1 = i / slices;
      const t2 = (i + 1) / slices;

      const y1 = horizonY + t1 * roadH;
      const y2 = horizonY + t2 * roadH;

      const roadW1 = width * (0.10 + Math.pow(t1, 1.55) * 0.78);
      const roadW2 = width * (0.10 + Math.pow(t2, 1.55) * 0.78);

      const cx1 = width / 2 + Math.pow(t1, 2) * curveShift;
      const cx2 = width / 2 + Math.pow(t2, 2) * curveShift;

      const alt = Math.floor(i + distance * 4.2) % 2 === 0;

      // 1. Grama verde
      ctx.fillStyle = alt ? '#009c10' : '#008008';
      ctx.fillRect(0, y1, width, y2 - y1 + 1);

      // 2. Asfalto cinza
      ctx.fillStyle = alt ? '#4c545c' : '#3d444c';
      ctx.beginPath();
      ctx.moveTo(cx1 - roadW1 / 2, y1);
      ctx.lineTo(cx1 + roadW1 / 2, y1);
      ctx.lineTo(cx2 + roadW2 / 2, y2);
      ctx.lineTo(cx2 - roadW2 / 2, y2);
      ctx.closePath();
      ctx.fill();

      // 3. Zebras laterais vermelhas e brancas conectadas em polígono suave
      const curbW1 = Math.max(5, roadW1 * 0.058);
      const curbW2 = Math.max(5, roadW2 * 0.058);
      const curbColor = alt ? '#dc2626' : '#ffffff';

      // Zebra esquerda
      ctx.fillStyle = curbColor;
      ctx.beginPath();
      ctx.moveTo(cx1 - roadW1 / 2 - curbW1, y1);
      ctx.lineTo(cx1 - roadW1 / 2, y1);
      ctx.lineTo(cx2 - roadW2 / 2, y2);
      ctx.lineTo(cx2 - roadW2 / 2 - curbW2, y2);
      ctx.closePath();
      ctx.fill();

      // Zebra direita
      ctx.beginPath();
      ctx.moveTo(cx1 + roadW1 / 2, y1);
      ctx.lineTo(cx1 + roadW1 / 2 + curbW1, y1);
      ctx.lineTo(cx2 + roadW2 / 2 + curbW2, y2);
      ctx.lineTo(cx2 + roadW2 / 2, y2);
      ctx.closePath();
      ctx.fill();

      // 4. Faixas centrais tracejadas brancas perfeitamente alinhadas com cx
      if (alt) {
        const laneW1 = Math.max(3, roadW1 * 0.022);
        const laneW2 = Math.max(3, roadW2 * 0.022);
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.moveTo(cx1 - laneW1 / 2, y1);
        ctx.lineTo(cx1 + laneW1 / 2, y1);
        ctx.lineTo(cx2 + laneW2 / 2, y2);
        ctx.lineTo(cx2 - laneW2 / 2, y2);
        ctx.closePath();
        ctx.fill();
      }

      // 5. Linha de chegada quadriculada DINÂMICA (só aparece quando se aproxima da volta!)
      if (relFinish > 0 && relFinish < 75) {
        const finishZ = relFinish / 75; // 1 no horizonte, 0 no jogador
        const finishT = 1 - finishZ;
        if (Math.abs(t1 - finishT) < 0.04) {
          const sqW = roadW1 / 14;
          for (let s = 0; s < 14; s++) {
            ctx.fillStyle = (s % 2 === 0) ? '#ffffff' : '#000000';
            ctx.fillRect(cx1 - roadW1 / 2 + s * sqW, y1, sqW, y2 - y1 + 1);
          }
        }
      }
    }
  },

  drawScenery(ctx, st, width, height, horizonY, curveShift) {
    const roadH = height - horizonY;
    st.scenery.forEach((sc) => {
      if (sc.z < 0 || sc.z > 1) return;
      const t = 1 - sc.z;
      const y = horizonY + t * roadH;
      const roadW = width * (0.10 + Math.pow(t, 1.55) * 0.78);
      const cx = width / 2 + Math.pow(t, 2) * curveShift;
      const curbW = Math.max(5, roadW * 0.058);
      const x = cx + sc.side * (roadW / 2 + curbW + 8 + t * (width * 0.10));
      const scale = Math.max(0.3, Math.pow(t, 1.3) * 2.4);

      ctx.save();
      ctx.translate(x, y);
      ctx.scale(scale, scale);

      if (sc.type === 'bush') {
        ctx.fillStyle = '#0f381e';
        ctx.beginPath();
        ctx.arc(0, -14, 18, 0, Math.PI * 2);
        ctx.arc(-14, -8, 16, 0, Math.PI * 2);
        ctx.arc(14, -8, 16, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#166534';
        ctx.beginPath();
        ctx.arc(-4, -16, 14, 0, Math.PI * 2);
        ctx.arc(8, -12, 12, 0, Math.PI * 2);
        ctx.arc(-10, -6, 12, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#22c55e';
        ctx.beginPath();
        ctx.arc(-2, -18, 8, 0, Math.PI * 2);
        ctx.arc(6, -14, 6, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillStyle = '#1e293b';
        ctx.beginPath();
        ctx.moveTo(-18, 0);
        ctx.lineTo(-14, -26);
        ctx.lineTo(10, -30);
        ctx.lineTo(22, -8);
        ctx.lineTo(18, 0);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = '#475569';
        ctx.beginPath();
        ctx.moveTo(-14, -26);
        ctx.lineTo(2, -28);
        ctx.lineTo(10, -14);
        ctx.lineTo(-4, 0);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = '#94a3b8';
        ctx.beginPath();
        ctx.moveTo(2, -28);
        ctx.lineTo(10, -30);
        ctx.lineTo(22, -8);
        ctx.lineTo(10, -14);
        ctx.closePath();
        ctx.fill();
      }

      ctx.restore();
    });
  },

  drawFuelPickups(ctx, st, width, height, horizonY, curveShift) {
    const roadH = height - horizonY;
    st.fuels.forEach((f) => {
      const relDist = f.dist - st.cameraDist;
      if (relDist <= 0 || relDist >= 85) return;
      const z = relDist / 85;
      const t = 1 - z;
      const y = horizonY + t * roadH;
      const roadW = width * (0.10 + Math.pow(t, 1.55) * 0.78);
      const cx = width / 2 + Math.pow(t, 2) * curveShift;
      const x = cx + f.lane * (roadW * 0.44);
      const sz = Math.max(16, t * 54);

      ctx.save();
      ctx.font = `${Math.round(sz)}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';
      ctx.fillText('⛽', x, y);
      ctx.restore();
    });
  },

  drawTrafficCars(ctx, st, width, height, horizonY, curveShift) {
    const roadH = height - horizonY;
    const baseCarScale = Math.max(1.8, Math.min(3.2, width * 0.0028));

    // Apenas rivais à frente da câmera (entre 1m e 85m)
    const visibleRivals = st.traffic
      .map((car) => {
        const relDist = car.dist - st.cameraDist;
        return { ...car, relDist };
      })
      .filter((car) => car.relDist > 1.2 && car.relDist < 85)
      .sort((a, b) => b.relDist - a.relDist); // Ordena do mais distante ao mais perto

    visibleRivals.forEach((car) => {
      const z = car.relDist / 85;
      const t = 1 - z;
      const y = horizonY + Math.pow(t, 1.35) * roadH;
      const roadW = width * (0.10 + Math.pow(t, 1.55) * 0.78);
      const cx = width / 2 + Math.pow(t, 2) * curveShift;
      const x = cx + car.lane * (roadW * 0.44);
      const scale = baseCarScale * (0.28 + t * 0.70);

      this.drawRetroSportsCar(ctx, x, y, car.color, scale, 0, false, false, car.label);
    });
  },

  // ==========================================================================
  // CARROS DO CASAL (TOTALMENTE ESTÁVEIS NO PRIMEIRO PLANO, NUNCA CORTADOS!)
  // ==========================================================================
  drawPlayerCoupleCars(ctx, st, width, height, names, horizonY, roadCurveShift) {
    const roadH = height - horizonY;
    const baseCarScale = Math.max(1.8, Math.min(3.2, width * 0.0028));

    // Base estável no terço inferior da tela (entre y = 78% e 84%)
    const playerBaseY = height * 0.81;

    // Deslocamento relativo suave: quem está na frente avança levemente (~25px),
    // quem está atrás recua levemente (~15px). NUNCA sai da tela!
    const diff = Math.max(-15, Math.min(15, st.p1.dist - st.p2.dist));

    const p1VisualY = playerBaseY - diff * 1.8;
    const p2VisualY = playerBaseY + diff * 1.8;

    const p1T = (p1VisualY - horizonY) / roadH;
    const p2T = (p2VisualY - horizonY) / roadH;

    const p1RoadW = width * (0.10 + Math.pow(p1T, 1.55) * 0.78);
    const p2RoadW = width * (0.10 + Math.pow(p2T, 1.55) * 0.78);

    const p1Cx = width / 2 + Math.pow(p1T, 2) * roadCurveShift;
    const p2Cx = width / 2 + Math.pow(p2T, 2) * roadCurveShift;

    const p1ScreenX = p1Cx + st.p1.x * (p1RoadW * 0.42);
    const p2ScreenX = p2Cx + st.p2.x * (p2RoadW * 0.42);

    const p1Scale = baseCarScale * (0.88 + p1T * 0.22);
    const p2Scale = baseCarScale * (0.88 + p2T * 0.22);

    const p1RankLabel = st.p1.dist >= st.p2.dist ? '[1º]' : '[2º]';
    const p2RankLabel = st.p2.dist >= st.p1.dist ? '[1º]' : '[2º]';

    // Desenha primeiro o carro que está mais atrás, depois o que está na frente (overlap correto!)
    if (st.p1.dist >= st.p2.dist) {
      // P2 (Noiva) está atrás
      this.drawRetroSportsCar(ctx, p2ScreenX, p2VisualY, '#ec4899', p2Scale, st.p2.steer, st.p2.nitroTimer > 0, st.p2.braking, `👰 ${names.bride || 'NOIVA'} ${p2RankLabel}`);
      // P1 (Noivo) está na frente
      this.drawRetroSportsCar(ctx, p1ScreenX, p1VisualY, '#0ea5e9', p1Scale, st.p1.steer, st.p1.nitroTimer > 0, st.p1.braking, `🤵 ${names.groom || 'NOIVO'} ${p1RankLabel}`);
    } else {
      // P1 (Noivo) está atrás
      this.drawRetroSportsCar(ctx, p1ScreenX, p1VisualY, '#0ea5e9', p1Scale, st.p1.steer, st.p1.nitroTimer > 0, st.p1.braking, `🤵 ${names.groom || 'NOIVO'} ${p1RankLabel}`);
      // P2 (Noiva) está na frente
      this.drawRetroSportsCar(ctx, p2ScreenX, p2VisualY, '#ec4899', p2Scale, st.p2.steer, st.p2.nitroTimer > 0, st.p2.braking, `👰 ${names.bride || 'NOIVA'} ${p2RankLabel}`);
    }
  },

  drawRetroSportsCar(ctx, x, y, bodyColor, scale, steerAngle, isNitro, isBraking, label) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);

    const jitterY = (Math.random() < 0.5 ? 0.6 : -0.6);
    ctx.translate(0, jitterY);

    const w = 58;
    const h = 34;

    // Sombra sob os pneus
    ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
    ctx.beginPath();
    ctx.ellipse(0, 6, w * 0.58, 6.5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Pneus traseiros
    ctx.fillStyle = '#0a0d14';
    ctx.fillRect(-w * 0.52, -10, 9, 16);
    ctx.fillRect(w * 0.52 - 9, -10, 9, 16);

    // Para-choque
    ctx.fillStyle = '#1e2430';
    ctx.beginPath();
    ctx.roundRect(-w * 0.46, -h * 0.38, w * 0.92, h * 0.46, 3);
    ctx.fill();

    // Carroceria Superior Esportiva
    ctx.fillStyle = bodyColor;
    ctx.beginPath();
    ctx.moveTo(-w * 0.49, 0);
    ctx.lineTo(-w * 0.47, -h * 0.66);
    ctx.lineTo(-w * 0.34, -h * 0.94);
    ctx.lineTo(w * 0.34, -h * 0.94);
    ctx.lineTo(w * 0.47, -h * 0.66);
    ctx.lineTo(w * 0.49, 0);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
    ctx.lineWidth = 1.3;
    ctx.stroke();

    // Vidro com Aletas
    ctx.fillStyle = '#050811';
    ctx.beginPath();
    ctx.moveTo(-w * 0.28, -h * 0.90);
    ctx.lineTo(w * 0.28, -h * 0.90);
    ctx.lineTo(w * 0.36, -h * 0.62);
    ctx.lineTo(-w * 0.36, -h * 0.62);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 1.4;
    for (let r = 1; r <= 3; r++) {
      const ly = -h * 0.90 + r * 5.2;
      ctx.beginPath();
      ctx.moveTo(-w * 0.29 + r * 1.6, ly);
      ctx.lineTo(w * 0.29 - r * 1.6, ly);
      ctx.stroke();
    }

    // Lanternas Traseiras (BRILHAM INTENSAMENTE AO FREAR!)
    const lightW = 13;
    const lightH = 6;
    const lightY = -h * 0.46;

    if (isBraking) {
      ctx.fillStyle = '#ef4444';
      ctx.shadowColor = '#ef4444';
      ctx.shadowBlur = 12;
      ctx.fillRect(-w * 0.43 - 2, lightY - 1.5, lightW + 4, lightH + 3);
      ctx.fillRect(w * 0.43 - lightW - 2, lightY - 1.5, lightW + 4, lightH + 3);
      ctx.shadowBlur = 0;
    }

    // Lanterna esquerda
    ctx.fillStyle = isBraking ? '#ff6b6b' : '#dc2626';
    ctx.fillRect(-w * 0.43, lightY, lightW, lightH);
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(-w * 0.43, lightY, 3.5, lightH);
    ctx.fillStyle = '#fef08a';
    ctx.fillRect(-w * 0.43 + 4, lightY + 1.5, 5, 2.5);

    // Lanterna direita
    ctx.fillStyle = isBraking ? '#ff6b6b' : '#dc2626';
    ctx.fillRect(w * 0.43 - lightW, lightY, lightW, lightH);
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(w * 0.43 - 3.5, lightY, 3.5, lightH);
    ctx.fillStyle = '#fef08a';
    ctx.fillRect(w * 0.43 - lightW + 4, lightY + 1.5, 5, 2.5);

    // Escapamentos duplos cromados ([oo] [oo])
    const exY = 0.5;
    ctx.fillStyle = '#cbd5e1';
    ctx.fillRect(-w * 0.29, exY, 4.5, 3.5);
    ctx.fillRect(-w * 0.23, exY, 4.5, 3.5);
    ctx.fillRect(w * 0.18, exY, 4.5, 3.5);
    ctx.fillRect(w * 0.24, exY, 4.5, 3.5);

    ctx.fillStyle = '#0f172a';
    ctx.fillRect(-w * 0.28, exY + 1, 2.5, 1.5);
    ctx.fillRect(-w * 0.22, exY + 1, 2.5, 1.5);
    ctx.fillRect(w * 0.19, exY + 1, 2.5, 1.5);
    ctx.fillRect(w * 0.25, exY + 1, 2.5, 1.5);

    // Fogo de NITRO
    if (isNitro) {
      const flameH = 18 + Math.random() * 14;
      const flameGrad = ctx.createLinearGradient(0, exY, 0, exY + flameH);
      flameGrad.addColorStop(0, '#ffffff');
      flameGrad.addColorStop(0.3, '#38bdf8');
      flameGrad.addColorStop(0.65, '#f59e0b');
      flameGrad.addColorStop(1, '#ef4444');

      ctx.fillStyle = flameGrad;
      ctx.beginPath();
      ctx.moveTo(-w * 0.30, exY + 2);
      ctx.lineTo(-w * 0.26, exY + flameH);
      ctx.lineTo(-w * 0.20, exY + 2);
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(w * 0.17, exY + 2);
      ctx.lineTo(w * 0.23, exY + flameH);
      ctx.lineTo(w * 0.29, exY + 2);
      ctx.fill();
    }

    // Placa
    if (label) {
      ctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
      ctx.beginPath();
      ctx.roundRect(-36, -h - 16, 72, 15, 4);
      ctx.fill();
      ctx.strokeStyle = bodyColor;
      ctx.lineWidth = 1.4;
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.font = '800 8.5px Fredoka, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(label, 0, -h - 5.5);
    }

    ctx.restore();
  },

  // ==========================================================================
  // HUD COMPLETO DE CORRIDA TOP GEAR SNES (NUNCA CORTADO PELO TOPO!)
  // ==========================================================================
  drawTopGearHUD(ctx, st, width, height) {
    ctx.save();
    const p1 = st.p1;
    const p2 = st.p2;

    // Margem superior segura para ficar abaixo da barra HTML
    const hudTopY = 72;

    // 1. MINIMAPA DO CIRCUITO (Canto Superior Esquerdo)
    this.drawCircuitMinimap(ctx, st, 24, hudTopY, 120, 78);

    // 2. POSIÇÃO DE CORRIDA E VOLTA (Centro do Topo: "1ST" / "VOLTA 1/3")
    const leaderRank = Math.min(p1.rank, p2.rank);
    const posText = `${leaderRank}TH`.replace('1TH', '1ST').replace('2TH', '2ND').replace('3TH', '3RD');

    ctx.font = '900 36px "Impact", "Arial Black", sans-serif';
    ctx.textAlign = 'center';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 5;
    ctx.strokeText(posText, width * 0.50, hudTopY + 36);
    ctx.fillStyle = '#ffffff';
    ctx.fillText(posText, width * 0.50, hudTopY + 36);

    ctx.font = '900 15px "Impact", "Arial Black", sans-serif';
    ctx.strokeText(`VOLTA ${st.currentLap} / ${st.totalLaps}`, width * 0.50, hudTopY + 58);
    ctx.fillStyle = '#ffd166';
    ctx.fillText(`VOLTA ${st.currentLap} / ${st.totalLaps}`, width * 0.50, hudTopY + 58);

    // Posição no canto inferior direito
    ctx.font = '900 28px "Impact", "Arial Black", sans-serif';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 4;
    ctx.strokeText(posText, width - 88, height - 32);
    ctx.fillStyle = '#ffffff';
    ctx.fillText(posText, width - 88, height - 32);

    // 3. CONTA-GIROS EM ARCO (TACHOMETER) - Canto Superior Direito
    const activeRpm = Math.max(p1.rpm, p2.rpm);
    this.drawCurvedTachometer(ctx, activeRpm, width - 165, hudTopY - 4, 130, 48);

    // 4. VELOCÍMETRO DIGITAL 7-SEGMENTOS VERMELHO
    const spdBoxX = width - 160;
    const spdBoxY = hudTopY + 16;
    const spdBoxW = 135;
    const spdBoxH = 36;

    ctx.fillStyle = '#0a0505';
    ctx.strokeStyle = '#2d1515';
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.roundRect(spdBoxX, spdBoxY, spdBoxW, spdBoxH, 4);
    ctx.fill();
    ctx.stroke();

    const maxSpeed = Math.max(p1.speed, p2.speed);
    ctx.fillStyle = '#ef4444';
    ctx.font = '900 25px "Courier New", monospace';
    ctx.textAlign = 'right';
    const spdStr = String(Math.floor(maxSpeed)).padStart(3, ' ');
    ctx.fillText(spdStr, spdBoxX + 85, spdBoxY + 26);

    ctx.font = '700 13px "Courier New", monospace';
    ctx.fillStyle = '#f87171';
    ctx.fillText('mph', spdBoxX + 122, spdBoxY + 25);

    // 5. CRONÔMETRO DE VOLTA: "00' 12" 08"
    const timerY = spdBoxY + spdBoxH + 20;
    const totalSecs = st.raceTimer;
    const mins = Math.floor(totalSecs / 60);
    const secs = Math.floor(totalSecs % 60);
    const centis = Math.floor((totalSecs * 100) % 100);

    const timeStr = `${String(mins).padStart(2, '0')}' ${String(secs).padStart(2, '0')}" ${String(centis).padStart(2, '0')}`;

    ctx.font = '900 17px "Courier New", monospace';
    ctx.textAlign = 'right';
    ctx.fillStyle = '#000000';
    ctx.fillText(timeStr, width - 26, timerY + 1.5);
    ctx.fillStyle = '#ffffff';
    ctx.fillText(timeStr, width - 28, timerY);

    // 6. MEDIDOR VERTICAL DE COMBUSTÍVEL
    this.drawVerticalFuelGauge(ctx, st, width - 40, timerY + 16, 20, height * 0.42);

    // 7. PLACAR DO DUELO DE CASAL NO RODAPÉ ESQUERDO
    const botY = height - 52;
    ctx.font = '900 15px "Impact", "Arial Black", sans-serif';
    ctx.textAlign = 'left';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 3.5;

    const p1Status = p1.braking ? '🛑 FREIANDO' : p1.accelerating ? '⚡ ACELERANDO' : 'DESACELERANDO';
    const p1Info = `🤵 NOIVO: ${p1.rank}º (${Math.floor(p1.speed)} mph) | N x ${p1.nitros} | ${p1Status}`;
    ctx.strokeText(p1Info, 28, botY - 14);
    ctx.fillStyle = '#38bdf8';
    ctx.fillText(p1Info, 28, botY - 14);

    const p2Status = p2.braking ? '🛑 FREIANDO' : p2.accelerating ? '⚡ ACELERANDO' : 'DESACELERANDO';
    const p2Info = `👰 NOIVA: ${p2.rank}º (${Math.floor(p2.speed)} mph) | N x ${p2.nitros} | ${p2Status}`;
    ctx.strokeText(p2Info, 28, botY + 12);
    ctx.fillStyle = '#f472b6';
    ctx.fillText(p2Info, 28, botY + 12);

    ctx.font = '700 11px Fredoka, sans-serif';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
    ctx.fillText('NOIVO: [W] Acelerar • [S] Freio • [A/D] Virar • [ESPAÇO] Nitro  |  NOIVA: [⬆️] Acelerar • [⬇️] Freio • [⬅️/➡️] Virar • [ENTER] Nitro', 28, botY + 34);

    ctx.restore();
  },

  drawTouchControls(ctx, st, width, height) {
    const isMobile = width < 768 || (typeof window !== 'undefined' && 'ontouchstart' in window);
    if (!isMobile) return;

    ctx.save();
    const btnSz = 48;
    const padY = height - 68;

    st.btnLeft = { x: 16, y: padY, w: btnSz, h: btnSz };
    st.btnRight = { x: 70, y: padY, w: btnSz, h: btnSz };

    st.btnBrake = { x: width - 170, y: padY, w: btnSz + 6, h: btnSz };
    st.btnGas = { x: width - 110, y: padY, w: btnSz + 6, h: btnSz };
    st.btnNitro = { x: width - 50, y: padY, w: btnSz, h: btnSz };

    const drawBtn = (box, color, label, icon) => {
      ctx.fillStyle = color;
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(box.x, box.y, box.w, box.h, 10);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.font = '900 14px Fredoka, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(icon, box.x + box.w / 2, box.y + 20);
      ctx.font = '700 9px Fredoka, sans-serif';
      ctx.fillText(label, box.x + box.w / 2, box.y + 36);
    };

    drawBtn(st.btnLeft, 'rgba(15, 23, 42, 0.80)', 'ESQ', '⬅️');
    drawBtn(st.btnRight, 'rgba(15, 23, 42, 0.80)', 'DIR', '➡️');
    drawBtn(st.btnBrake, 'rgba(220, 38, 38, 0.88)', 'FREIO', '🛑');
    drawBtn(st.btnGas, 'rgba(22, 163, 74, 0.88)', 'ACEL', '⚡');
    drawBtn(st.btnNitro, 'rgba(234, 88, 12, 0.88)', 'NITRO', '🔥');

    ctx.restore();
  },

  drawCircuitMinimap(ctx, st, x, y, w, h) {
    ctx.save();
    ctx.translate(x, y);

    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.beginPath();
    ctx.roundRect(-6, -6, w + 12, h + 12, 8);
    ctx.fill();

    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 8;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.beginPath();
    ctx.moveTo(15, 18);
    ctx.lineTo(88, 18);
    ctx.bezierCurveTo(112, 18, 112, 56, 85, 56);
    ctx.lineTo(55, 56);
    ctx.bezierCurveTo(42, 56, 42, 38, 55, 38);
    ctx.lineTo(76, 38);
    ctx.bezierCurveTo(88, 38, 92, 70, 68, 70);
    ctx.lineTo(32, 70);
    ctx.bezierCurveTo(8, 70, 5, 18, 15, 18);
    ctx.stroke();

    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(45, 14);
    ctx.lineTo(45, 22);
    ctx.stroke();

    const p1Prog = (st.p1.dist % st.lapLength) / st.lapLength;
    const p1Bx = 15 + p1Prog * 75;
    const p1By = 18 + Math.sin(p1Prog * Math.PI * 2) * 14;

    const p2Prog = (st.p2.dist % st.lapLength) / st.lapLength;
    const p2Bx = 15 + p2Prog * 75;
    const p2By = 18 + Math.sin(p2Prog * Math.PI * 2) * 14;

    ctx.beginPath();
    ctx.arc(p1Bx, p1By, 4.5, 0, Math.PI * 2);
    ctx.fillStyle = '#0ea5e9';
    ctx.fill();

    ctx.beginPath();
    ctx.arc(p2Bx, p2By, 4.5, 0, Math.PI * 2);
    ctx.fillStyle = '#ec4899';
    ctx.fill();

    ctx.restore();
  },

  drawCurvedTachometer(ctx, rpm, x, y, w, h) {
    ctx.save();
    ctx.translate(x, y);

    const segments = 16;
    const activeSegments = Math.round(rpm * segments);

    for (let i = 0; i < segments; i++) {
      const angle = (i / segments) * 0.95;
      const sx = i * 7.0;
      const sy = -Math.sin(angle) * 22;

      let color = '#22c55e';
      if (i > 8) color = '#eab308';
      if (i > 12) color = '#ef4444';

      if (i < activeSegments) {
        ctx.fillStyle = color;
      } else {
        ctx.fillStyle = 'rgba(40, 40, 40, 0.45)';
      }

      ctx.fillRect(sx, sy, 5.0, 14);
    }

    ctx.restore();
  },

  drawVerticalFuelGauge(ctx, st, x, y, w, h) {
    ctx.save();

    ctx.fillStyle = '#ffffff';
    ctx.font = '900 18px "Impact", "Arial Black", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('F', x + w / 2, y - 6);

    ctx.fillStyle = '#0a0d14';
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, 4);
    ctx.fill();
    ctx.stroke();

    const totalBars = 18;
    const filledBars = Math.round((st.fuel / 100) * totalBars);
    const barH = (h - 8) / totalBars;

    for (let b = 0; b < totalBars; b++) {
      const by = y + h - 4 - (b + 1) * barH;
      const isFilled = b < filledBars;

      let bColor = '#ef4444';
      if (b > 4) bColor = '#eab308';
      if (b > 10) bColor = '#22c55e';

      ctx.fillStyle = isFilled ? bColor : 'rgba(30, 41, 59, 0.45)';
      ctx.fillRect(x + 2.5, by, w - 5, barH - 1.2);
    }

    ctx.fillStyle = '#ffffff';
    ctx.fillText('E', x + w / 2, y + h + 20);

    ctx.restore();
  }
};



// ============================================================================
// games_part3.js - Minigames 9 a 11 da "Operação Lua de Mel"
// 9. Colar na Prova | 10. Você é a IA | 11. Derrube a Torre
// ============================================================================

// ============================================================================
// MINIGAME 9: JOGO DE COLAR NA PROVA (SELETOR DE MATÉRIAS)
// ============================================================================
const EXAM_SUBJECTS = [
  { id: 'edfisica', name: '1. Educação Física (Fácil)', speed: 0.9, warnTime: 1.3, fillRate: 24 },
  { id: 'historia', name: '2. História (Médio)', speed: 1.4, warnTime: 1.0, fillRate: 20 },
  { id: 'matematica', name: '3. Matemática (Difícil)', speed: 2.0, warnTime: 0.75, fillRate: 17 },
  { id: 'quantica', name: '4. Física Quântica (Insano)', speed: 2.9, warnTime: 0.48, fillRate: 15 }
];

const Minigame9_ColarProva = {
  id: 'mg9_colar',
  order: 9,
  title: '9. COLAR NA PROVA: HOMENAGEM AO PROF.',
  subtitle: 'Segurem [W] e [⬆️/Espaço] para passar cola quando o Fiscal estiver de costas!',
  icon: '📝',

  onEnter(ctxApi) {
    ctxApi.mgState = {
      selectingSubject: true,
      subject: EXAM_SUBJECTS[0],
      progress: 0,
      teacherState: 'away', // 'away' (escrevendo no quadro) | 'warning' (virando!) | 'watching' (cone vermelho!)
      stateTimer: 2.2,
      p1Cheating: false,
      p2Cheating: false
    };
  },

  selectSubject(idx, ctxApi) {
    const st = ctxApi.mgState;
    if (!st || !st.selectingSubject) return;
    st.subject = EXAM_SUBJECTS[idx] || EXAM_SUBJECTS[0];
    st.selectingSubject = false;
    st.stateTimer = 2.0;
    ctxApi.sfx.playClick();
  },

  onUpdate(dt, ctxApi) {
    const st = ctxApi.mgState;
    if (!st || st.selectingSubject) return;

    const keys = ctxApi.getKeys();
    st.p1Cheating = keys.p1Up || st.p1HoldTouch;
    st.p2Cheating = keys.p2Up || st.p2HoldTouch;

    // Atualiza máquina de estados do Professor Fiscal
    st.stateTimer -= dt;
    if (st.stateTimer <= 0) {
      if (st.teacherState === 'away') {
        st.teacherState = 'warning';
        st.stateTimer = st.subject.warnTime;
        ctxApi.sfx.playClick();
      } else if (st.teacherState === 'warning') {
        st.teacherState = 'watching';
        st.stateTimer = 1.2 + Math.random() * 0.9;
        ctxApi.sfx.playShoot();
      } else {
        st.teacherState = 'away';
        st.stateTimer = Math.max(0.8, (2.4 - st.subject.speed * 0.45) + Math.random() * 1.1);
      }
    }

    // Se algum dos dois estiver colando enquanto o Fiscal está olhando -> BATATINHA!
    if (st.teacherState === 'watching' && (st.p1Cheating || st.p2Cheating)) {
      const { width, height } = ctxApi.getViewport();
      const caughtP1 = st.p1Cheating;
      const who = caughtP1 ? ctxApi.getNames().groom : ctxApi.getNames().bride;
      ctxApi.batatinha(
        `${who} foi pego colando na prova de ${st.subject.name.split(' ')[1]}! Nota ZERO!`,
        { x: caughtP1 ? width * 0.35 : width * 0.65, y: height * 0.72, r: 48 }
      );
      return;
    }

    // Progresso da cola (bônus se ambos colarem juntos!)
    const activeCount = (st.p1Cheating ? 1 : 0) + (st.p2Cheating ? 1 : 0);
    if (activeCount > 0) {
      const mult = activeCount === 2 ? 1.85 : 0.85;
      st.progress = Math.min(100, st.progress + st.subject.fillRate * mult * dt);
      if (st.progress >= 100) {
        ctxApi.victory(`Prova gabaritada na base da cola cooperativa em ${st.subject.name}!`);
      }
    }
  },

  onKeyDown(code, ctxApi) {
    const st = ctxApi.mgState;
    if (!st) return;
    if (st.selectingSubject) {
      if (code === 'Digit1' || code === 'KeyA') this.selectSubject(0, ctxApi);
      if (code === 'Digit2' || code === 'KeyW') this.selectSubject(1, ctxApi);
      if (code === 'Digit3' || code === 'KeyD') this.selectSubject(2, ctxApi);
      if (code === 'Digit4' || code === 'Space') this.selectSubject(3, ctxApi);
      return;
    }
    if (code === 'KeyW') st.p1HoldTouch = true;
    if (code === 'ArrowUp' || code === 'Space') st.p2HoldTouch = true;
  },

  onKeyUp(code, ctxApi) {
    const st = ctxApi.mgState;
    if (!st) return;
    if (code === 'KeyW') st.p1HoldTouch = false;
    if (code === 'ArrowUp' || code === 'Space') st.p2HoldTouch = false;
  },

  onPointerDown(x, y, ctxApi) {
    const st = ctxApi.mgState;
    if (!st) return;
    const { width, height } = ctxApi.getViewport();
    if (st.selectingSubject) {
      const relY = y - height * 0.28;
      const idx = Math.max(0, Math.min(3, Math.floor(relY / 68)));
      this.selectSubject(idx, ctxApi);
      return;
    }
    if (x < width / 2) st.p1HoldTouch = true;
    else st.p2HoldTouch = true;
  },

  onPointerUp(ctxApi) {
    const st = ctxApi.mgState;
    if (!st) return;
    st.p1HoldTouch = false;
    st.p2HoldTouch = false;
  },

  onRender(ctx, ctxApi) {
    const st = ctxApi.mgState;
    if (!st) return;
    const { width, height } = ctxApi.getViewport();

    ctx.fillStyle = '#141d2b';
    ctx.fillRect(0, 0, width, height);

    if (st.selectingSubject) {
      ctx.fillStyle = '#ffd166';
      ctx.font = '700 22px Fredoka, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('🎓 ESCOLHAM A MATÉRIA DA PROVA (DIFICULDADE):', width / 2, height * 0.20);

      EXAM_SUBJECTS.forEach((subj, i) => {
        const bx = width / 2 - 210;
        const by = height * 0.28 + i * 68;
        ctx.fillStyle = '#2d1b4e';
        ctx.strokeStyle = '#ffd166';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.roundRect(bx, by, 420, 54, 12);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.font = '700 17px Fredoka, sans-serif';
        ctx.fillText(`${subj.name}  [Tecla ${i + 1} / Toque]`, width / 2, by + 29);
      });
      return;
    }

    // Lousa Verde de Sala de Aula no Topo
    ctx.fillStyle = '#064e3b';
    ctx.strokeStyle = '#b45309';
    ctx.lineWidth = 6;
    ctx.fillRect(width * 0.18, 72, width * 0.64, 90);
    ctx.strokeRect(width * 0.18, 72, width * 0.64, 90);

    // Barra de Progresso da Cola na Lousa
    ctx.fillStyle = '#ffffff';
    ctx.font = '700 15px Fredoka, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`PROVA DE ${st.subject.name.toUpperCase()} • GABARITO: ${Math.floor(st.progress)}%`, width / 2, 102);

    ctx.fillStyle = '#022c22';
    ctx.fillRect(width / 2 - 150, 118, 300, 20);
    ctx.fillStyle = '#06d6a0';
    ctx.fillRect(width / 2 - 148, 120, (296 * st.progress) / 100, 16);

    // Professor Fiscal e Cone de Visão Vermelho
    const profX = width / 2;
    const profY = 205;

    if (st.teacherState === 'watching') {
      // Cone de visão vermelho cobrindo as carteiras!
      ctx.fillStyle = 'rgba(255, 51, 85, 0.34)';
      ctx.beginPath();
      ctx.moveTo(profX, profY);
      ctx.lineTo(width * 0.15, height * 0.85);
      ctx.lineTo(width * 0.85, height * 0.85);
      ctx.closePath();
      ctx.fill();
    }

    ctx.font = '44px sans-serif';
    ctx.fillText(st.teacherState === 'watching' ? '😡' : st.teacherState === 'warning' ? '🤨' : '🧑‍🏫', profX, profY);

    ctx.font = '700 15px Fredoka, sans-serif';
    ctx.fillStyle =
      st.teacherState === 'watching'
        ? '#ff3355'
        : st.teacherState === 'warning'
        ? '#ffd166'
        : '#06d6a0';
    const statusLabel =
      st.teacherState === 'watching'
        ? '🚨 FISCAL OLHANDO! PAREM DE COLAR!'
        : st.teacherState === 'warning'
        ? '⚠️ ATENÇÃO! ELE VAI VIRAR!'
        : '✅ FISCAL DE COSTAS! SEGURE [W] E [⬆️/ESPAÇO] P/ COLAR!';
    ctx.fillText(statusLabel, profX, profY + 38);

    // Carteiras Escolares do Noivo e da Noiva
    const deskY = height * 0.74;
    const p1X = width * 0.35;
    const p2X = width * 0.65;

    [
      { x: p1X, cheating: st.p1Cheating, isGroom: true },
      { x: p2X, cheating: st.p2Cheating, isGroom: false }
    ].forEach((stDesk) => {
      ctx.fillStyle = '#78350f';
      ctx.strokeStyle = stDesk.cheating ? '#ffd166' : '#ffffff';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.roundRect(stDesk.x - 55, deskY - 20, 110, 48, 8);
      ctx.fill();
      ctx.stroke();

      if (stDesk.isGroom) {
        ctxApi.drawGroom(stDesk.x, deskY - 12, 0, 0.82, true);
      } else {
        ctxApi.drawBride(stDesk.x, deskY - 12, 0, 0.82, true);
      }

      if (stDesk.cheating) {
        ctx.fillStyle = '#ffd166';
        ctx.font = '700 13px Fredoka, sans-serif';
        ctx.fillText('👀 PASSANDO COLA...', stDesk.x, deskY + 46);
      }
    });

    // Aviãozinho de papel entre os dois quando ambos colam
    if (st.p1Cheating && st.p2Cheating) {
      const t = (ctxApi.getTime() * 2) % 1;
      const noteX = p1X + (p2X - p1X) * t;
      ctx.font = '24px sans-serif';
      ctx.fillText('✈️📄', noteX, deskY - 35);
    }
  }
};

// ============================================================================
// MINIGAME 10: VOCÊ É A IA (SIMULADOR DE CHAT SOB PRESSÃO)
// ============================================================================
const AI_PROMPTS = [
  {
    sender: '👨‍🎓 Aluno Desesperado:',
    prompt: '"Professor, explique a Revolução Francesa em 3 símbolos!"',
    options: ['🥖👑⚔️ (Pão, Rei e Guilhotina)', '👽🛸🍕 (Aliens comeram pizza)', '⚽🏆🇧🇷 (Hexa em 1789)'],
    correct: 0
  },
  {
    sender: '👵 Tia no WhatsApp:',
    prompt: '"Gere uma desculpa educada para faltar na reunião de domingo:"',
    options: ['"Vou lavar meu peixe!"', '"Estamos corrigindo 200 provas do ENEM!"', '"Fomos abduzidos ontem!"'],
    correct: 1
  },
  {
    sender: '🎓 Coordenação Pedagógica:',
    prompt: '"Qual o prazo ideal para entregar todas as pautas fechadas?"',
    options: ['"Em 2048 depois do Carnaval"', '"Assim que voltar da Lua de Mel!"', '"Deletar banco de dados"'],
    correct: 1
  },
  {
    sender: '🍽️ Convidado Faminto:',
    prompt: '"IA, como faço para pegar docinho antes de abrir a mesa?"',
    options: ['"Camuflagem tática de samambaia"', '"Aguarde a foto oficial dos noivos!"', '"Suborne o DJ com coxinha"'],
    correct: 1
  },
  {
    sender: '✈️ Companhia Aérea:',
    prompt: '"Confirme os itens essenciais na mala da Lua de Mel:"',
    options: ['"300 provas e giz colorido"', '"Passagens, alianças e protetor solar!"', '"Uma betoneira e 2 tijolos"'],
    correct: 1
  }
];

const Minigame10_VoceEhIA = {
  id: 'mg10_ia',
  order: 10,
  title: '10. VOCÊ É A IA: CHAT SOB PRESSÃO',
  subtitle: 'Escolham o Token Coerente [1 / 2 / 3] antes que a Barra de Alucinação atinja 100%!',
  icon: '🤖',

  onEnter(ctxApi) {
    ctxApi.mgState = {
      promptIndex: 0,
      hallucination: 10, // 0 a 100%
      selectedIdx: 0
    };
  },

  chooseOption(idx, ctxApi) {
    const st = ctxApi.mgState;
    if (!st) return;
    const current = AI_PROMPTS[st.promptIndex];
    const { width, height } = ctxApi.getViewport();

    if (idx === current.correct) {
      st.hallucination = Math.max(0, st.hallucination - 18);
      st.promptIndex++;
      ctxApi.sfx.playBounce();
      ctxApi.floatingText(width / 2, height * 0.35, 'RESPOSTA COERENTE! 🧠✨', '#06d6a0');

      if (st.promptIndex >= AI_PROMPTS.length) {
        ctxApi.victory('A IA do Casal respondeu todos os prompts sem alucinar!');
      }
    } else {
      st.hallucination += 34;
      ctxApi.sfx.playShoot();
      ctxApi.floatingText(width / 2, height * 0.35, '⚠️ ALUCINAÇÃO DA IA! +34%', '#ff3355');
      if (st.hallucination >= 100) {
        ctxApi.batatinha('A IA atingiu 100% de Alucinação e recomendou corrigir provas na praia!', {
          x: width / 2,
          y: height / 2,
          r: 55
        });
      }
    }
  },

  onUpdate(dt, ctxApi) {
    const st = ctxApi.mgState;
    if (!st) return;
    st.hallucination += 9.5 * dt;
    if (st.hallucination >= 100) {
      const { width, height } = ctxApi.getViewport();
      ctxApi.batatinha('Tempo esgotado! A IA alucinou 100% sob pressão dos prompts!', {
        x: width / 2,
        y: height / 2,
        r: 55
      });
    }
  },

  onKeyDown(code, ctxApi) {
    if (code === 'Digit1' || code === 'KeyA' || code === 'ArrowLeft') this.chooseOption(0, ctxApi);
    if (code === 'Digit2' || code === 'KeyW' || code === 'ArrowUp' || code === 'Space') this.chooseOption(1, ctxApi);
    if (code === 'Digit3' || code === 'KeyD' || code === 'ArrowRight') this.chooseOption(2, ctxApi);
  },

  onPointerDown(x, y, ctxApi) {
    const { height } = ctxApi.getViewport();
    const startY = height * 0.48;
    const idx = Math.floor((y - startY) / 68);
    if (idx >= 0 && idx <= 2) {
      this.chooseOption(idx, ctxApi);
    }
  },

  onRender(ctx, ctxApi) {
    const st = ctxApi.mgState;
    if (!st) return;
    const { width, height } = ctxApi.getViewport();
    const current = AI_PROMPTS[st.promptIndex] || AI_PROMPTS[0];

    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, width, height);

    // Barra de Alucinação
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(width / 2 - 190, 74, 380, 24);
    ctx.fillStyle = st.hallucination > 65 ? '#ff3355' : '#a855f7';
    ctx.fillRect(width / 2 - 188, 76, Math.min(376, (376 * st.hallucination) / 100), 20);

    ctx.fillStyle = '#ffffff';
    ctx.font = '700 13px Fredoka, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(
      `🤖 TAXA DE ALUCINAÇÃO: ${Math.floor(st.hallucination)}%  |  PROMPT ${st.promptIndex + 1}/${AI_PROMPTS.length}`,
      width / 2,
      91
    );

    // Caixa do Prompt Recebido
    const boxW = Math.min(620, width - 40);
    ctx.fillStyle = '#1e1b4b';
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(width / 2 - boxW / 2, height * 0.22, boxW, 100, 14);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#ffd166';
    ctx.font = '700 15px Fredoka, sans-serif';
    ctx.fillText(current.sender, width / 2, height * 0.22 + 32);

    ctx.fillStyle = '#ffffff';
    ctx.font = '700 17px Fredoka, sans-serif';
    ctx.fillText(current.prompt, width / 2, height * 0.22 + 68);

    // 3 Respostas / Tokens
    const keysHint = ['[1 / A / ⬅️]', '[2 / W / ⬆️]', '[3 / D / ➡️]'];
    current.options.forEach((opt, i) => {
      const by = height * 0.48 + i * 68;
      ctx.fillStyle = '#2d1b4e';
      ctx.strokeStyle = '#ffd166';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.roundRect(width / 2 - boxW / 2, by, boxW, 54, 12);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#06d6a0';
      ctx.font = '700 14px Fredoka, sans-serif';
      ctx.fillText(`${keysHint[i]}  ${opt}`, width / 2, by + 29);
    });
  }
};

// ============================================================================
// MINIGAME 11: DERRUBE A TORRE (DEMOLIÇÃO COOPERATIVA)
// ============================================================================
const Minigame11_Torre = {
  id: 'mg11_torre',
  order: 11,
  title: '11. DERRUBE A TORRE: DEMOLIÇÃO COOP',
  subtitle: 'Arremessem Malas e Buquês para derrubar a Torre de Burocracia abaixo da linha!',
  icon: '🏗️',

  onEnter(ctxApi) {
    const { width, height } = ctxApi.getViewport();
    const groundY = height - 56;
    const towerX = width * 0.72;

    const blocks = [
      // Base de Concreto
      { x: towerX - 42, y: groundY - 46, w: 38, h: 46, vx: 0, vy: 0, mat: 'concreto', label: 'BOLETO', color: '#64748b', hp: 3 },
      { x: towerX + 4, y: groundY - 46, w: 38, h: 46, vx: 0, vy: 0, mat: 'concreto', label: 'IPTU', color: '#64748b', hp: 3 },
      // Meio de Madeira
      { x: towerX - 46, y: groundY - 94, w: 92, h: 44, vx: 0, vy: 0, mat: 'madeira', label: 'DIÁRIOS DE CLASSE', color: '#b45309', hp: 2 },
      { x: towerX - 36, y: groundY - 140, w: 72, h: 44, vx: 0, vy: 0, mat: 'madeira', label: 'PROVAS', color: '#b45309', hp: 2 },
      // Topo de Vidro
      { x: towerX - 28, y: groundY - 186, w: 56, h: 44, vx: 0, vy: 0, mat: 'vidro', label: 'ESTRESSE', color: '#38bdf8', hp: 1 }
    ];

    ctxApi.mgState = {
      groundY,
      shotsLeft: 6,
      turn: 'p1',
      aimAngle: -0.62,
      power: 72,
      powerDir: 1,
      charging: false,
      projectile: null,
      blocks
    };
  },

  fireSlingshot(ctxApi) {
    const st = ctxApi.mgState;
    if (!st || st.projectile || st.shotsLeft <= 0) return;
    const { width } = ctxApi.getViewport();
    const startX = width * 0.16;
    const startY = st.groundY - 48;
    const spd = 380 + (st.power / 100) * 480;

    st.shotsLeft--;
    st.charging = false;
    st.projectile = {
      x: startX,
      y: startY,
      vx: Math.cos(st.aimAngle) * spd,
      vy: Math.sin(st.aimAngle) * spd,
      emoji: st.turn === 'p1' ? '🧳' : '💐',
       settleTimer: 0
    };
    ctxApi.sfx.playShoot();
  },

  onUpdate(dt, ctxApi) {
    const st = ctxApi.mgState;
    if (!st) return;
    const { width, height } = ctxApi.getViewport();
    st.groundY = height - 56;

    const keys = ctxApi.getKeys();
    const gravity = 980;

    if (!st.projectile) {
      if (keys.p1Left || keys.p2Left) st.aimAngle = Math.max(-1.25, st.aimAngle - 1.2 * dt);
      if (keys.p1Right || keys.p2Right) st.aimAngle = Math.min(-0.15, st.aimAngle + 1.2 * dt);

      if (st.charging) {
        st.power += st.powerDir * 95 * dt;
        if (st.power >= 100) { st.power = 100; st.powerDir = -1; }
        if (st.power <= 25) { st.power = 25; st.powerDir = 1; }
      }
    } else {
      const pr = st.projectile;
      pr.x += pr.vx * dt;
      pr.y += pr.vy * dt;
      pr.vy += gravity * dt;

      // Colisão com blocos da torre
      for (let i = st.blocks.length - 1; i >= 0; i--) {
        const bl = st.blocks[i];
        if (
          pr.x + 16 > bl.x &&
          pr.x - 16 < bl.x + bl.w &&
          pr.y + 16 > bl.y &&
          pr.y - 16 < bl.y + bl.h
        ) {
          bl.hp -= 2;
          bl.vx += pr.vx * 0.48;
          bl.vy -= 140;
          pr.vx *= -0.35;
          pr.vy *= 0.5;
          ctxApi.sfx.playBounce();
          ctxApi.particles(pr.x, pr.y, bl.color, 15, 180);

          if (bl.hp <= 0) {
            st.blocks.splice(i, 1);
          } else {
            // Empurra blocos acima também
            st.blocks.forEach((other) => {
              if (other !== bl && other.y < bl.y) {
                other.vx += 95;
                other.vy -= 80;
              }
            });
          }
          break;
        }
      }

      if (pr.y > st.groundY || pr.x > width + 40) {
        st.projectile = null;
        st.turn = st.turn === 'p1' ? 'p2' : 'p1';

        if (st.blocks.length === 0) {
          ctxApi.victory('Torre de Burocracia e Estresse 100% demolida pelo casal!');
          return;
        }
        if (st.shotsLeft <= 0 && st.blocks.length > 0) {
          ctxApi.batatinha('Acabaram os arremessos e a Torre de Burocracia continuou de pé!', {
            x: width * 0.72,
            y: st.groundY - 70,
            r: 55
          });
          return;
        }
      }
    }

    // Física simples de gravidade nos blocos restantes
    for (let i = st.blocks.length - 1; i >= 0; i--) {
      const bl = st.blocks[i];
      bl.x += bl.vx * dt;
      bl.y += bl.vy * dt;
      bl.vx *= 0.92;
      bl.vy += gravity * 0.6 * dt;

      if (bl.y + bl.h > st.groundY) {
        bl.y = st.groundY - bl.h;
        bl.vy = 0;
      }

      // Se caiu para fora da base da torre, destrói!
      if (Math.abs(bl.x - width * 0.72) > 135) {
        ctxApi.particles(bl.x, bl.y, bl.color, 12, 140);
        st.blocks.splice(i, 1);
        if (st.blocks.length === 0) {
          ctxApi.victory('Torre de Burocracia totalmente demolida!');
          return;
        }
      }
    }
  },

  onKeyDown(code, ctxApi) {
    const st = ctxApi.mgState;
    if (!st || st.projectile) return;
    if (['KeyW', 'Space', 'ArrowUp'].includes(code)) {
      st.charging = true;
    }
  },

  onKeyUp(code, ctxApi) {
    const st = ctxApi.mgState;
    if (!st || st.projectile) return;
    if (['KeyW', 'Space', 'ArrowUp'].includes(code) && st.charging) {
      this.fireSlingshot(ctxApi);
    }
  },

  onPointerDown(x, y, ctxApi) {
    const st = ctxApi.mgState;
    if (!st || st.projectile) return;
    st.charging = true;
  },

  onPointerUp(ctxApi) {
    const st = ctxApi.mgState;
    if (!st || st.projectile) return;
    if (st.charging) this.fireSlingshot(ctxApi);
  },

  onRender(ctx, ctxApi) {
    const st = ctxApi.mgState;
    if (!st) return;
    const { width, height } = ctxApi.getViewport();
    const slingX = width * 0.16;
    const slingY = st.groundY - 48;

    ctx.fillStyle = '#171029';
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = '#334155';
    ctx.fillRect(0, st.groundY, width, height - st.groundY);

    ctx.fillStyle = '#ffd166';
    ctx.font = '700 15px Fredoka, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(
      `🏗️ ARREMESSOS RESTANTES: ${st.shotsLeft}  |  BLOCOS NA TORRE: ${st.blocks.length}  |  Mire (A/D) e Segure [W / Espaço / Toque]`,
      width / 2,
      88
    );

    // Estilingue e Noivos
    ctxApi.drawGroom(slingX - 28, st.groundY, 0, 0.82, true);
    ctxApi.drawBride(slingX + 18, st.groundY, 0, 0.82, true);

    // Trajetória pontilhada
    if (!st.projectile) {
      ctx.strokeStyle = '#ffd166';
      ctx.lineWidth = 2.5;
      ctx.setLineDash([6, 6]);
      ctx.beginPath();
      ctx.moveTo(slingX, slingY);
      ctx.lineTo(
        slingX + Math.cos(st.aimAngle) * (80 + st.power),
        slingY + Math.sin(st.aimAngle) * (80 + st.power)
      );
      ctx.stroke();
      ctx.setLineDash([]);
    } else {
      ctx.font = '32px sans-serif';
      ctx.fillText(st.projectile.emoji, st.projectile.x, st.projectile.y);
    }

    // Blocos da Torre (Vidro, Madeira e Concreto)
    st.blocks.forEach((bl) => {
      ctx.fillStyle = bl.color;
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.roundRect(bl.x, bl.y, bl.w, bl.h, 6);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.font = '700 11px Fredoka, sans-serif';
      ctx.fillText(bl.label, bl.x + bl.w / 2, bl.y + bl.h / 2 + 4);
    });
  }
};


// ============================================================================
// minigames.js - Gerenciador Central dos 11 Minigames da Lua de Mel
// Importa e orquestra games_part1.js (1-4), games_part2.js (5-8) e games_part3.js (9-11)
// ============================================================================




const HONEYMOON_MINIGAMES = [
  Minigame1_Sinuca,
  Minigame2_Roguelite,
  Minigame3_Plataforma,
  Minigame4_Contra,
  Minigame5_JumpKing,
  Minigame6_Louca,
  Minigame7_Flappy,
  Minigame8_TopGear,
  Minigame9_ColarProva,
  Minigame10_VoceEhIA,
  Minigame11_Torre
];

const MINIGAME_CATALOG = [
  {
    id: 'phase1',
    order: 1,
    title: 'FASE 1: CORRIDA AO ALTAR',
    subtitle: 'Pule os boletos e abaixe das perguntas da Tia até chegar na igreja!',
    icon: '⛪',
    enabled: true,
    checkpointAllowed: true
  },
  {
    id: 'phase2',
    order: 2,
    title: 'FASE 2: DEFESA DO BOLO',
    subtitle: 'Girem ao redor da mesa e protejam o bolo dos convidados por 45s!',
    icon: '🎂',
    enabled: true,
    checkpointAllowed: true
  },
  ...HONEYMOON_MINIGAMES.map((mg) => ({
    id: mg.id,
    order: mg.order + 2,
    title: mg.title,
    subtitle: mg.subtitle,
    icon: mg.icon,
    enabled: true,
    checkpointAllowed: true,
    module: mg
  }))
];

class MinigameProgression {
  constructor() {
    this.currentStageId = 'phase1';
    this.highestUnlockedStageId = 'phase1';
    this.activeMinigame = null;
    this.completedMinigames = new Set();
  }

  getStageById(id) {
    return MINIGAME_CATALOG.find((m) => m.id === id) || MINIGAME_CATALOG[0];
  }

  getMinigameModule(id) {
    return HONEYMOON_MINIGAMES.find((m) => m.id === id) || null;
  }

  unlockStage(stageId) {
    this.currentStageId = stageId;
  }

  markCompleted(stageId) {
    this.completedMinigames.add(stageId);
  }

  getNextEnabledStage() {
    // Após vencer a Fase 2 da campanha principal, leva para a Vitória que desbloqueia o Hub de 11 Minigames!
    return null;
  }
}


// ============================================================================
// game.js - Motor Principal "Operação Lua de Mel"
// HTML5 Canvas + ES6 Modular + Multiplayer Local & Online P2P (PeerJS)
// ============================================================================




const sfx = new SoundManager();
const net = new NetworkManager();
const progression = new MinigameProgression();

// Referências DOM
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');

const hudBar = document.getElementById('hud-bar');
const hudPhaseBadge = document.getElementById('hud-phase-badge');
const hudModeBadge = document.getElementById('hud-mode-badge');
const hudProgressContainer = document.getElementById('hud-progress-container');
const hudProgressFill = document.getElementById('hud-progress-fill');
const hudProgressText = document.getElementById('hud-progress-text');
const hudTimerContainer = document.getElementById('hud-timer-container');
const hudTimerText = document.getElementById('hud-timer-text');

const touchOverlay = document.getElementById('touch-overlay');
const touchZoneLeft = document.getElementById('touch-zone-left');
const touchZoneRight = document.getElementById('touch-zone-right');
const touchNameP1 = document.getElementById('touch-name-p1');
const touchNameP2 = document.getElementById('touch-name-p2');
const phase1Prompts = document.querySelectorAll('.phase1-prompt');
const phase2Prompts = document.querySelectorAll('.phase2-prompt');

// Telas Overlay
const screenMenu = document.getElementById('screen-menu');
const screenOnline = document.getElementById('screen-online');
const screenTransition = document.getElementById('screen-transition');
const screenBatatinha = document.getElementById('screen-batatinha');
const screenVictory = document.getElementById('screen-victory');
const screenMinigames = document.getElementById('screen-minigames');
const minigamesGrid = document.getElementById('minigames-grid');

// Inputs de Nomes
const inputGroom = document.getElementById('input-groom');
const inputBride = document.getElementById('input-bride');
const previewGroomNames = document.querySelectorAll('.preview-groom-name');
const previewBrideNames = document.querySelectorAll('.preview-bride-name');

// Frases cômicas do "BATATINHA!"
const BATATINHA_QUOTES_PHASE1 = [
  'Alguém tropeçou nos boletos do buffet!',
  'A pilha de provas do MEC venceu a lua de mel!',
  'A Tia perguntou "E os filhos?" e vocês travaram!',
  'A Sogra interceptou o casal antes do altar!',
  'Esqueceram de lançar as notas no sistema antes de casar!',
  'O boleto do fotógrafo deu rasteira no casal!'
];

const BATATINHA_QUOTES_PHASE2 = [
  'Comeram o bolo antes das fotos oficiais!',
  'O primo furão de fila atacou o 3º andar do bolo!',
  'A Tia do Tupperware levou metade do bolo pra casa!',
  'As crianças cheias de açúcar derrubaram os noivinhos do topo!',
  'Convidado faminto furou o bloqueio: nem sobrou glacê!'
];

// Tipos de Obstáculos da Fase 1 (Chão = Pular | Alto = Abaixar)
const PHASE1_OBSTACLE_TYPES = [
  {
    id: 'boleto',
    placement: 'low',
    actionText: '⬆️ PULE!',
    label: 'BOLETO DA FESTA',
    sub: 'R$ 9.999,99',
    emoji: '💸',
    color: '#dc2626',
    accent: '#fecaca',
    w: 64,
    h: 54,
    quote: 'Alguém tropeçou nos boletos da festa!'
  },
  {
    id: 'provas',
    placement: 'low',
    actionText: '⬆️ PULE!',
    label: 'PILHA DE PROVAS',
    sub: '120 p/ Corrigir!',
    emoji: '📚',
    color: '#2563eb',
    accent: '#bfdbfe',
    w: 64,
    h: 56,
    quote: 'A pilha de provas para corrigir venceu a lua de mel!'
  },
  {
    id: 'sogra',
    placement: 'low',
    actionText: '⬆️ PULE!',
    label: 'A SOGRA DE OLHO',
    sub: 'Vigília Total!',
    emoji: '👜',
    color: '#ea580c',
    accent: '#fed7aa',
    w: 64,
    h: 56,
    quote: 'A Sogra deu um puxão de orelha no meio do corredor!'
  },
  {
    id: 'tia',
    placement: 'high',
    actionText: '⬇️ ABAIXE!',
    label: 'TIA: "E OS FILHOS?"',
    sub: 'Pergunta Voadora!',
    emoji: '👵',
    color: '#9333ea',
    accent: '#f3e8ff',
    w: 68,
    h: 54,
    quote: 'Não abaixou a tempo e levou a pergunta "E os filhos?" na testa!'
  },
  {
    id: 'reuniao',
    placement: 'high',
    actionText: '⬇️ ABAIXE!',
    label: 'REUNIÃO EXTRA!',
    sub: 'Sábado às 7h!',
    emoji: '📢',
    color: '#db2777',
    accent: '#fbcfe8',
    w: 68,
    h: 54,
    quote: 'Bateu a cabeça na convocação de Reunião Pedagógica no sábado!'
  },
  {
    id: 'drone',
    placement: 'high',
    actionText: '⬇️ ABAIXE!',
    label: 'DRONE DA FOTO',
    sub: 'Abaixa a Cabeça!',
    emoji: '🚁',
    color: '#0891b2',
    accent: '#cffafe',
    w: 68,
    h: 52,
    quote: 'O drone do fotógrafo enroscou no cabelo antes do altar!'
  }
];

// Tipos de Invasores da Fase 2
const PHASE2_ENEMY_TYPES = [
  {
    id: 'esfomeado',
    name: 'Convidado Esfomeado',
    shout: 'SÓ VIM PELO BOLO!',
    emoji: '🍽️',
    color: '#f97316',
    speed: 78,
    radius: 22,
    quote: 'Comeram o bolo antes das fotos!'
  },
  {
    id: 'crianca',
    name: 'Criança Correndo',
    shout: 'DOCINHOOOO!',
    emoji: '🍭',
    color: '#ec4899',
    speed: 108,
    radius: 19,
    wobble: 3.5,
    quote: 'As crianças correndo mergulharam de cabeça no glacê!'
  },
  {
    id: 'primo',
    name: 'Primo Furão',
    shout: 'SÓ UM PEDACINHO!',
    emoji: '🕺',
    color: '#8b5cf6',
    speed: 92,
    radius: 21,
    quote: 'O primo furão de fila roubou o topo do bolo!'
  },
  {
    id: 'tupperware',
    name: 'Tia do Tupperware',
    shout: 'PRA LEVAR PRA CASA!',
    emoji: '🥡',
    color: '#eab308',
    speed: 68,
    radius: 25,
    quote: 'A Tia guardou o bolo inteiro num pote de sorvete!'
  }
];

// Estado Global da Partida
const state = {
  screen: 'menu', // 'menu' | 'online' | 'phase1' | 'transition' | 'phase2' | 'batatinha' | 'victory'
  mode: 'local',  // 'local' | 'host' | 'guest'
  groomName: 'Joao Costenaro',
  brideName: 'Noiva',

  width: 960,
  height: 540,
  time: 0,
  freezeFrame: false,
  usedWKey: false,
  usedSpaceKey: false,

  // Controles ativos
  keys: {
    p1Up: false,
    p1Down: false,
    p1Left: false,
    p1Right: false,
    p1Jump: false,
    p2Up: false,
    p2Down: false,
    p2Left: false,
    p2Right: false,
    p2Jump: false
  },
  mgState: {},

  // Dados da Fase 1 (Corrida para o Altar)
  phase1: {
    progress: 0,       // 0 a 100
    duration: 28,      // Segundos até 100%
    speed: 330,        // Pixels/s
    scrollX: 0,
    spawnTimer: 1.4,
    altarSpawned: false,
    altarX: 1200,
    p1: {
      y: 0,            // Offset vertical do pulo (<= 0)
      vy: 0,
      jumping: false,
      ducking: false,
      duckHold: false,
      duckTimer: 0,
      runCycle: 0
    },
    p2: {
      y: 0,
      vy: 0,
      jumping: false,
      ducking: false,
      duckHold: false,
      duckTimer: 0,
      runCycle: 0
    },
    obstacles: []
  },

  // Dados da Fase 2 (Defesa do Bolo)
  phase2: {
    timeLeft: 45.0,
    cakeRadius: 56,
    orbitRadius: 118,
    p1Angle: Math.PI,      // Esquerda inicial
    p2Angle: 0,            // Direita inicial
    p1Vel: 0,
    p2Vel: 0,
    p1Cooldown: 0,
    p2Cooldown: 0,
    spawnTimer: 1.0,
    waveCount: 0,
    enemies: [],
    projectiles: []
  },

  // Efeitos visuais
  particles: [],
  floatingTexts: [],
  confetti: [],
  culpritHighlight: null // { x, y, r, label } quando dá BATATINHA!
};

// ============================================================================
// INICIALIZAÇÃO DE TELAS, EVENTOS E RESPONSIVIDADE
// ============================================================================

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function resizeCanvas() {
  const parent = canvas ? (canvas.parentElement || canvas) : null;
  const rect = parent ? parent.getBoundingClientRect() : { width: window.innerWidth || 800, height: window.innerHeight || 600 };
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  state.width = Math.max(320, rect.width || 800);
  state.height = Math.max(320, rect.height || 600);
  canvas.width = Math.floor(state.width * dpr);
  canvas.height = Math.floor(state.height * dpr);
  if (ctx && ctx.setTransform) {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

function syncCoupleNamesFromInputs() {
  const g = (inputGroom.value || '').trim();
  const b = (inputBride.value || '').trim();
  state.groomName = g || 'Joao Costenaro';
  state.brideName = b || 'Noiva';

  previewGroomNames.forEach((el) => { el.textContent = state.groomName; });
  previewBrideNames.forEach((el) => { el.textContent = state.brideName; });
  touchNameP1.textContent = state.groomName;
  touchNameP2.textContent = state.brideName;
}

inputGroom.addEventListener('input', syncCoupleNamesFromInputs);
inputBride.addEventListener('input', syncCoupleNamesFromInputs);

function showOverlayScreen(screenName) {
  [screenMenu, screenOnline, screenTransition, screenBatatinha, screenVictory, screenMinigames].forEach((el) => {
    if (el) el.classList.add('hidden');
  });

  const floatingMute = document.getElementById('btn-mute-floating');

  if (screenName === 'menu') {
    screenMenu.classList.remove('hidden');
    hudBar.classList.add('hidden');
    touchOverlay.classList.add('hidden');
    floatingMute.classList.remove('hidden');
  } else if (screenName === 'online') {
    screenOnline.classList.remove('hidden');
    hudBar.classList.add('hidden');
    touchOverlay.classList.add('hidden');
    floatingMute.classList.remove('hidden');
  } else if (screenName === 'transition') {
    screenTransition.classList.remove('hidden');
    touchOverlay.classList.add('hidden');
    floatingMute.classList.add('hidden');
  } else if (screenName === 'batatinha') {
    screenBatatinha.classList.remove('hidden');
    touchOverlay.classList.add('hidden');
    floatingMute.classList.add('hidden');
  } else if (screenName === 'victory') {
    screenVictory.classList.remove('hidden');
    touchOverlay.classList.add('hidden');
    floatingMute.classList.add('hidden');
  } else if (screenName === 'minigames') {
    if (screenMinigames) screenMinigames.classList.remove('hidden');
    hudBar.classList.add('hidden');
    touchOverlay.classList.add('hidden');
    floatingMute.classList.remove('hidden');
  } else {
    // Jogando Fase 1, Fase 2 ou Minigames
    hudBar.classList.remove('hidden');
    if (progression.activeMinigame) {
      touchOverlay.classList.add('hidden');
    } else {
      touchOverlay.classList.remove('hidden');
    }
    floatingMute.classList.add('hidden');
  }
}

function updateTouchControlsUI(phase) {
  if (phase === 1) {
    phase1Prompts.forEach((el) => el.classList.remove('hidden'));
    phase2Prompts.forEach((el) => el.classList.add('hidden'));
  } else {
    phase1Prompts.forEach((el) => el.classList.add('hidden'));
    phase2Prompts.forEach((el) => el.classList.remove('hidden'));
  }

  // No modo Online (2 aparelhos), destaca o lado do jogador atual
  if (state.mode === 'host') {
    touchZoneLeft.style.opacity = '1';
    touchZoneRight.style.opacity = '0.35';
  } else if (state.mode === 'guest') {
    touchZoneLeft.style.opacity = '0.35';
    touchZoneRight.style.opacity = '1';
  } else {
    touchZoneLeft.style.opacity = '1';
    touchZoneRight.style.opacity = '1';
  }
}

// ============================================================================
// PARTÍCULAS, CONFETES E TEXTOS FLUTUANTES
// ============================================================================

function spawnParticles(x, y, color, count = 12, speed = 160) {
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const spd = (0.3 + Math.random() * 0.7) * speed;
    state.particles.push({
      x,
      y,
      vx: Math.cos(angle) * spd,
      vy: Math.sin(angle) * spd,
      size: 4 + Math.random() * 5,
      color,
      life: 0.45 + Math.random() * 0.35,
      maxLife: 0.8
    });
  }
}

function spawnFloatingText(x, y, text, color = '#ffd166') {
  state.floatingTexts.push({
    x,
    y,
    text,
    color,
    vy: -55,
    life: 1.1
  });
}

function spawnConfettiBurst(count = 70) {
  const colors = ['#ffd166', '#ff5d8f', '#4cc9f0', '#06d6a0', '#ffffff', '#c084fc'];
  for (let i = 0; i < count; i++) {
    state.confetti.push({
      x: Math.random() * state.width,
      y: -20 - Math.random() * 180,
      vx: (Math.random() - 0.5) * 90,
      vy: 90 + Math.random() * 140,
      w: 7 + Math.random() * 6,
      h: 4 + Math.random() * 5,
      rot: Math.random() * Math.PI * 2,
      vRot: (Math.random() - 0.5) * 8,
      color: colors[Math.floor(Math.random() * colors.length)]
    });
  }
}

// ============================================================================
// FLUXO DAS FASES: INICIAR FASE 1, TRANSIÇÃO, FASE 2, BATATINHA E VITÓRIA
// ============================================================================

const ctxApi = {
  getViewport: () => ({ width: state.width, height: state.height }),
  getKeys: () => state.keys,
  getNames: () => ({ groom: state.groomName, bride: state.brideName }),
  getTime: () => state.time,
  sfx,
  particles: (x, y, color, count, spd) => spawnParticles(x, y, color, count, spd),
  floatingText: (x, y, text, color) => spawnFloatingText(x, y, text, color),
  confetti: (count) => spawnConfettiBurst(count),
  drawGroom: (x, y, runCycle, scale, showLabel, isDucking) =>
    drawGroomCharacter(x, y, runCycle, scale, showLabel, isDucking),
  drawBride: (x, y, runCycle, scale, showLabel, isDucking) =>
    drawBrideCharacter(x, y, runCycle, scale, showLabel, isDucking),
  batatinha: (reason, culpritInfo) => triggerBatatinha(reason, 3, culpritInfo, false),
  victory: (message) => triggerMinigameVictory(message, false),
  get mgState() {
    if (!state.mgState) state.mgState = {};
    return state.mgState;
  },
  set mgState(val) {
    state.mgState = val;
  }
};

function openMinigamesHub() {
  syncCoupleNamesFromInputs();
  state.screen = 'minigames';
  renderMinigamesGrid();
  showOverlayScreen('minigames');
  sfx.playClick();
}

function renderMinigamesGrid() {
  if (!minigamesGrid) return;
  minigamesGrid.innerHTML = '';

  HONEYMOON_MINIGAMES.forEach((mg) => {
    const isCompleted = progression.completedMinigames.has(mg.id);
    const item = document.createElement('button');
    item.type = 'button';
    item.className = 'mg-item-btn';
    if (isCompleted) {
      item.style.borderColor = '#06d6a0';
    }
    item.innerHTML = `
      <div class="mg-item-icon">${mg.icon}</div>
      <div class="mg-item-info">
        <strong>${mg.title} ${isCompleted ? '✅' : ''}</strong>
        <small>${mg.subtitle}</small>
      </div>
    `;

    item.addEventListener('click', () => {
      sfx.playClick();
      if (state.mode === 'guest') {
        net.send({ type: 'request_start_stage', stageId: mg.id });
      } else {
        startStageById(mg.id, false);
      }
    });

    minigamesGrid.appendChild(item);
  });
}

function startStageById(stageId, fromNetwork = false) {
  const stage = progression.getStageById(stageId);
  if (stage.id === 'phase1') {
    progression.activeMinigame = null;
    startPhase1(fromNetwork);
  } else if (stage.id === 'phase2') {
    progression.activeMinigame = null;
    startPhase2(fromNetwork);
  } else {
    const mg = progression.getMinigameModule(stageId);
    if (mg) {
      progression.unlockStage(stageId);
      progression.activeMinigame = mg;
      state.screen = stageId;
      state.failedPhase = stage.order || 3;
      state.freezeFrame = false;
      state.culpritHighlight = null;
      state.particles = [];
      state.floatingTexts = [];
      state.mgState = {};

      hudPhaseBadge.textContent = mg.title;
      hudModeBadge.textContent = state.mode === 'local' ? 'LOCAL' : `SALA: ${net.roomCode}`;
      hudProgressContainer.classList.add('hidden');
      hudTimerContainer.classList.add('hidden');

      showOverlayScreen('playing');
      touchOverlay.classList.add('hidden');

      if (mg.onEnter) {
        mg.onEnter(ctxApi);
      }
      sfx.playClick();

      if (state.mode === 'host' && !fromNetwork) {
        net.send({ type: 'start_custom_stage', stageId: stage.id });
      }
    }
  }
}

function startPhase1(isResetFromNetwork = false) {
  progression.activeMinigame = null;
  syncCoupleNamesFromInputs();
  progression.unlockStage('phase1');
  state.screen = 'phase1';
  state.failedPhase = 1;
  state.freezeFrame = false;
  state.culpritHighlight = null;
  state.particles = [];
  state.floatingTexts = [];

  const p1 = state.phase1;
  p1.progress = 0;
  p1.scrollX = 0;
  p1.spawnTimer = 1.3;
  p1.altarSpawned = false;
  p1.altarX = state.width + 400;
  p1.p1 = { y: 0, vy: 0, jumping: false, ducking: false, duckHold: false, duckTimer: 0, runCycle: 0 };
  p1.p2 = { y: 0, vy: 0, jumping: false, ducking: false, duckHold: false, duckTimer: 0, runCycle: 0 };
  p1.obstacles = [];

  hudPhaseBadge.textContent = 'FASE 1: CORRIDA AO ALTAR';
  hudModeBadge.textContent = state.mode === 'local' ? 'LOCAL' : `SALA: ${net.roomCode}`;
  hudProgressContainer.classList.remove('hidden');
  hudTimerContainer.classList.add('hidden');
  hudProgressFill.style.width = '0%';
  hudProgressText.textContent = '0% ⛪';

  showOverlayScreen('playing');
  updateTouchControlsUI(1);
  sfx.playClick();

  if (state.mode === 'host' && !isResetFromNetwork) {
    net.send({
      type: 'start_phase1',
      groomName: state.groomName,
      brideName: state.brideName
    });
  }
}

let transitionTimerId = null;

function triggerStageTransition(fromNetwork = false) {
  if (state.screen === 'transition') return;
  state.screen = 'transition';
  progression.unlockStage('phase2');
  sfx.playAltarFanfare();
  spawnConfettiBurst(65);
  showOverlayScreen('transition');

  if (state.mode === 'host' && !fromNetwork) {
    net.send({ type: 'stage_transition' });
  }

  let count = 4;
  const countdownEl = document.getElementById('transition-countdown');
  countdownEl.textContent = `Iniciando Fase 2 em ${count}...`;

  if (transitionTimerId) clearInterval(transitionTimerId);
  transitionTimerId = setInterval(() => {
    count--;
    if (count > 0) {
      countdownEl.textContent = `Iniciando Fase 2 em ${count}...`;
    } else {
      clearInterval(transitionTimerId);
      transitionTimerId = null;
      if (state.mode !== 'guest') {
        startPhase2();
      }
    }
  }, 1000);
}

function startPhase2(fromNetwork = false) {
  if (transitionTimerId) {
    clearInterval(transitionTimerId);
    transitionTimerId = null;
  }

  progression.activeMinigame = null;
  progression.unlockStage('phase2');
  state.screen = 'phase2';
  state.failedPhase = 2;
  state.freezeFrame = false;
  state.culpritHighlight = null;
  state.particles = [];
  state.floatingTexts = [];

  const minDim = Math.min(state.width, state.height - 60);
  const p2 = state.phase2;
  p2.timeLeft = 45.0;
  p2.cakeRadius = Math.max(42, Math.min(58, minDim * 0.11));
  p2.orbitRadius = p2.cakeRadius + Math.max(44, Math.min(64, minDim * 0.12));
  p2.p1Angle = Math.PI; // Esquerda
  p2.p2Angle = 0;       // Direita
  p2.p1Vel = 0;
  p2.p2Vel = 0;
  p2.p1Cooldown = 0.4;
  p2.p2Cooldown = 0.4;
  p2.spawnTimer = 1.0;
  p2.waveCount = 0;
  p2.enemies = [];
  p2.projectiles = [];

  hudPhaseBadge.textContent = 'FASE 2: DEFESA DO BOLO';
  hudProgressContainer.classList.add('hidden');
  hudTimerContainer.classList.remove('hidden');
  hudTimerText.textContent = '45.0s';

  showOverlayScreen('playing');
  updateTouchControlsUI(2);
  sfx.playClick();

  if (state.mode === 'host' && !fromNetwork) {
    net.send({ type: 'start_phase2' });
  }
}

function triggerBatatinha(customReason, phaseNum, culpritInfo = null, fromNetwork = false) {
  if (state.screen === 'batatinha') return;

  if (transitionTimerId) {
    clearInterval(transitionTimerId);
    transitionTimerId = null;
  }

  state.screen = 'batatinha';
  state.failedPhase = phaseNum;
  state.freezeFrame = true;
  state.culpritHighlight = culpritInfo;

  const activeMg = progression.activeMinigame;
  const pool = phaseNum === 1 ? BATATINHA_QUOTES_PHASE1 : BATATINHA_QUOTES_PHASE2;
  const randomQuote = pool[Math.floor(Math.random() * pool.length)];
  const finalQuote = customReason || randomQuote;

  document.getElementById('batatinha-reason').textContent = `"${finalQuote}"`;

  const detailEl = document.getElementById('batatinha-detail');
  if (activeMg) {
    detailEl.textContent = `${activeMg.title} • Tente outra vez!`;
  } else {
    detailEl.textContent =
      phaseNum === 1
        ? `Fase 1 • Corrida para o Altar (${Math.floor(state.phase1.progress)}% concluído)`
        : `Fase 2 • Defesa do Bolo (Faltavam ${state.phase2.timeLeft.toFixed(1)}s!) • Checkpoint Salvo ✅`;
  }

  const btnContinuePhase = document.getElementById('btn-continue-phase');
  const btnRetry = document.getElementById('btn-retry');
  const btnBatatinhaMg = document.getElementById('btn-batatinha-minigames');

  if (activeMg) {
    btnContinuePhase.classList.remove('hidden');
    btnContinuePhase.textContent = '🔄 Reiniciar Minigame';
    btnRetry.textContent = '🔄 Voltar p/ Fase 1';
    if (btnBatatinhaMg) btnBatatinhaMg.classList.remove('hidden');
  } else if (phaseNum >= 2) {
    btnContinuePhase.classList.remove('hidden');
    btnContinuePhase.textContent = `🎂 Continuar na Fase ${phaseNum}`;
    btnRetry.textContent = '🔄 Voltar p/ Fase 1';
    if (btnBatatinhaMg) btnBatatinhaMg.classList.remove('hidden');
  } else {
    btnContinuePhase.classList.add('hidden');
    btnRetry.textContent = '🔄 Tentar Novamente';
    if (btnBatatinhaMg) btnBatatinhaMg.classList.add('hidden');
  }

  sfx.playBatatinha();
  showOverlayScreen('batatinha');

  if (state.mode === 'host' && !fromNetwork) {
    net.send({
      type: 'batatinha',
      reason: finalQuote,
      phaseNum,
      culpritInfo
    });
  }
}

function triggerVictory(fromNetwork = false) {
  if (state.screen === 'victory') return;
  state.screen = 'victory';
  state.freezeFrame = false;

  const victoryTitle = document.querySelector('.victory-title');
  const victoryCoupleNames = document.getElementById('victory-couple-names');
  const victorySummary = document.getElementById('victory-summary-text');

  if (victoryTitle) victoryTitle.textContent = 'SOBREVIVERAM!';
  if (victoryCoupleNames) {
    victoryCoupleNames.textContent = `Parabéns, ${state.groomName} & ${state.brideName}! 💍`;
  }
  if (victorySummary) {
    victorySummary.innerHTML = `
      ✅ Boletos desviados com sucesso<br/>
      ✅ Pilhas de provas ignoradas até segunda-feira<br/>
      ✅ Bolo de casamento 100% salvo dos primos furões!
    `;
  }

  sfx.playWeddingMarch();
  spawnConfettiBurst(120);
  showOverlayScreen('victory');

  if (state.mode === 'host' && !fromNetwork) {
    net.send({ type: 'victory' });
  }
}

function triggerMinigameVictory(message, fromNetwork = false) {
  if (state.screen === 'victory') return;
  const currentMg = progression.activeMinigame;
  if (currentMg) {
    progression.markCompleted(currentMg.id);
  }

  state.screen = 'victory';
  state.freezeFrame = false;

  const victoryTitle = document.querySelector('.victory-title');
  const victoryCoupleNames = document.getElementById('victory-couple-names');
  const victorySummary = document.getElementById('victory-summary-text');

  if (victoryTitle) victoryTitle.textContent = 'MINIGAME VENCIDO! 🏆';
  if (victoryCoupleNames) {
    victoryCoupleNames.textContent = `Parabéns, ${state.groomName} & ${state.brideName}! 💍`;
  }
  if (victorySummary) {
    const cleanTitle = escapeHtml(currentMg ? currentMg.title : 'Minigame da Lua de Mel');
    const cleanMessage = escapeHtml(message || 'Vocês formam uma dupla imbatível!');
    victorySummary.innerHTML = `
      ✅ Desafio superado: <strong>${cleanTitle}</strong><br/>
      🎉 <em>"${cleanMessage}"</em><br/>
      🏝️ Mais minigames aguardam no Menu de Minigames!
    `;
  }

  sfx.playWeddingMarch();
  spawnConfettiBurst(120);
  showOverlayScreen('victory');

  if (state.mode === 'host' && !fromNetwork) {
    net.send({ type: 'victory', message, fromMinigame: true });
  }
}

// ============================================================================
// CONTROLES DE JOGADOR (TECLADO + TOUCH + REDE P2P)
// ============================================================================

function jumpPlayer(playerKey) {
  if (state.screen !== 'phase1' || state.freezeFrame) return;

  if (state.mode === 'guest' && playerKey === 'p2') {
    // Predição local + envia comando imediato ao Host
    const p2 = state.phase1.p2;
    p2.ducking = false;
    p2.duckHold = false;
    p2.duckTimer = 0;
    if (!p2.jumping) {
      p2.jumping = true;
      p2.vy = -590;
      sfx.playJump(true);
    }
    net.send({ type: 'guest_jump' });
    return;
  }

  const target = playerKey === 'p1' ? state.phase1.p1 : state.phase1.p2;
  target.ducking = false;
  target.duckHold = false;
  target.duckTimer = 0;
  if (!target.jumping) {
    target.jumping = true;
    target.vy = -590;
    sfx.playJump(playerKey === 'p2');
    const laneY = getPhase1LaneY(playerKey === 'p1' ? 0 : 1);
    spawnParticles(getPhase1PlayerX(), laneY, playerKey === 'p1' ? '#4cc9f0' : '#ff5d8f', 8, 110);
  }
}

function duckPlayer(playerKey, isHoldDown = true) {
  if (state.screen !== 'phase1' || state.freezeFrame) return;

  if (state.mode === 'guest' && playerKey === 'p2') {
    const p2 = state.phase1.p2;
    if (isHoldDown) {
      if (!p2.ducking) sfx.playDuck(true);
      p2.ducking = true;
      p2.duckHold = true;
      p2.duckTimer = 0.65;
      if (p2.jumping && p2.vy < 850) p2.vy = 850;
    } else {
      p2.duckHold = false;
    }
    net.send({ type: 'guest_duck', down: isHoldDown });
    return;
  }

  const target = playerKey === 'p1' ? state.phase1.p1 : state.phase1.p2;
  if (isHoldDown) {
    if (!target.ducking) {
      sfx.playDuck(playerKey === 'p2');
      const laneY = getPhase1LaneY(playerKey === 'p1' ? 0 : 1);
      spawnParticles(getPhase1PlayerX(), laneY, '#ffd166', 6, 80);
    }
    target.ducking = true;
    target.duckHold = true;
    target.duckTimer = 0.65;
    // Se estava no ar, desce rápido para o chão!
    if (target.jumping && target.vy < 850) {
      target.vy = 850;
    }
  } else {
    target.duckHold = false;
  }
}

function shootBurstBouquet(playerKey) {
  if (state.screen !== 'phase2' || state.freezeFrame) return;

  if (state.mode === 'guest' && playerKey === 'p2') {
    net.send({ type: 'guest_burst' });
    sfx.playShoot();
    return;
  }

  const p2 = state.phase2;
  const angle = playerKey === 'p1' ? p2.p1Angle : p2.p2Angle;
  const cx = state.width / 2;
  const cy = (state.height + 54) / 2;
  const startX = cx + Math.cos(angle) * p2.orbitRadius;
  const startY = cy + Math.sin(angle) * p2.orbitRadius;

  // Dispara 3 lembrancinhas em leque!
  [-0.22, 0, 0.22].forEach((offset) => {
    const a = angle + offset;
    p2.projectiles.push({
      x: startX,
      y: startY,
      vx: Math.cos(a) * 340,
      vy: Math.sin(a) * 340,
      owner: playerKey,
      emoji: playerKey === 'p1' ? '🍬' : '💐',
      life: 1.5
    });
  });
  sfx.playShoot();
}

// Eventos de Teclado
window.addEventListener('keydown', (e) => {
  if (document.activeElement && document.activeElement.tagName === 'INPUT') return;

  const code = e.code;
  if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(code)) {
    e.preventDefault();
  }

  // Minigame ativo: encaminha tecla para o minigame
  if (progression.activeMinigame) {
    if (code === 'KeyW') state.keys.p1Up = true;
    if (code === 'KeyS') state.keys.p1Down = true;
    if (code === 'KeyA') state.keys.p1Left = true;
    if (code === 'KeyD') state.keys.p1Right = true;
    if (code === 'ArrowUp') state.keys.p2Up = true;
    if (code === 'ArrowDown') state.keys.p2Down = true;
    if (code === 'ArrowLeft') state.keys.p2Left = true;
    if (code === 'ArrowRight') state.keys.p2Right = true;

    if (state.mode === 'guest') {
      if (code === 'KeyW' || code === 'ArrowUp') state.keys.p2Up = true;
      if (code === 'KeyS' || code === 'ArrowDown') state.keys.p2Down = true;
      if (code === 'KeyA' || code === 'ArrowLeft') state.keys.p2Left = true;
      if (code === 'KeyD' || code === 'ArrowRight') state.keys.p2Right = true;
    }

    if (progression.activeMinigame.onKeyDown) {
      progression.activeMinigame.onKeyDown(code, ctxApi);
    }
    if (state.mode === 'guest' || state.mode === 'host') {
      net.send({ type: 'mg_key_event', code, isDown: true });
    }
    return;
  }

  // Modo Online: qualquer tecla de pulo/abaixar/direção controla o personagem do seu aparelho
  if (state.mode === 'host') {
    if (code === 'KeyW' || code === 'ArrowUp' || code === 'Space') {
      if (state.screen === 'phase1') jumpPlayer('p1');
      if (state.screen === 'phase2') shootBurstBouquet('p1');
    }
    if (code === 'KeyS' || code === 'ArrowDown') {
      if (state.screen === 'phase1') duckPlayer('p1', true);
    }
    if (code === 'KeyA' || code === 'ArrowLeft') state.keys.p1Left = true;
    if (code === 'KeyD' || code === 'ArrowRight') state.keys.p1Right = true;
    return;
  }

  if (state.mode === 'guest') {
    if (code === 'KeyW' || code === 'ArrowUp' || code === 'Space') {
      if (state.screen === 'phase1') jumpPlayer('p2');
      if (state.screen === 'phase2') shootBurstBouquet('p2');
    }
    if (code === 'KeyS' || code === 'ArrowDown') {
      if (state.screen === 'phase1') duckPlayer('p2', true);
    }
    if (code === 'KeyA' || code === 'ArrowLeft') {
      state.keys.p2Left = true;
      net.send({ type: 'guest_keys', left: state.keys.p2Left, right: state.keys.p2Right });
    }
    if (code === 'KeyD' || code === 'ArrowRight') {
      state.keys.p2Right = true;
      net.send({ type: 'guest_keys', left: state.keys.p2Left, right: state.keys.p2Right });
    }
    return;
  }

  // Modo Local (Mesmo Aparelho):
  // Jogador 1 (Noivo): W (Pular) / S (Abaixar) na Fase 1 e A / D na Fase 2
  // Jogador 2 (Noiva): Seta Cima / Espaço (Pular) e Seta Baixo (Abaixar) na Fase 1, Seta Esq / Dir na Fase 2
  if (state.screen === 'phase1') {
    if (code === 'KeyW') {
      state.usedWKey = true;
      jumpPlayer('p1');
    } else if (code === 'KeyS') {
      duckPlayer('p1', true);
    } else if (code === 'Space') {
      state.usedSpaceKey = true;
      jumpPlayer('p2');
    } else if (code === 'ArrowDown') {
      duckPlayer('p2', true);
    } else if (code === 'ArrowUp') {
      // Suporta tanto casais que jogam com [W + Seta Cima] quanto [Seta Cima + Espaço]
      if (state.usedSpaceKey && !state.usedWKey) {
        jumpPlayer('p1');
      } else if (state.usedWKey && !state.usedSpaceKey) {
        jumpPlayer('p2');
      } else {
        const p1Threat = hasCloseObstacle(0);
        const p2Threat = hasCloseObstacle(1);
        if (p1Threat && !p2Threat) {
          jumpPlayer('p1');
        } else if (p2Threat && !p1Threat) {
          jumpPlayer('p2');
        } else {
          jumpPlayer('p2');
          if (p1Threat) jumpPlayer('p1');
        }
      }
    }
  } else if (state.screen === 'phase2') {
    if (code === 'KeyA') state.keys.p1Left = true;
    if (code === 'KeyD') state.keys.p1Right = true;
    if (code === 'KeyW') shootBurstBouquet('p1');

    if (code === 'ArrowLeft') state.keys.p2Left = true;
    if (code === 'ArrowRight') state.keys.p2Right = true;
    if (code === 'ArrowUp' || code === 'Space') shootBurstBouquet('p2');
  }
});

window.addEventListener('keyup', (e) => {
  const code = e.code;

  if (progression.activeMinigame) {
    if (code === 'KeyW') state.keys.p1Up = false;
    if (code === 'KeyS') state.keys.p1Down = false;
    if (code === 'KeyA') state.keys.p1Left = false;
    if (code === 'KeyD') state.keys.p1Right = false;
    if (code === 'ArrowUp') state.keys.p2Up = false;
    if (code === 'ArrowDown') state.keys.p2Down = false;
    if (code === 'ArrowLeft') state.keys.p2Left = false;
    if (code === 'ArrowRight') state.keys.p2Right = false;

    if (state.mode === 'guest') {
      if (code === 'KeyW' || code === 'ArrowUp') state.keys.p2Up = false;
      if (code === 'KeyS' || code === 'ArrowDown') state.keys.p2Down = false;
      if (code === 'KeyA' || code === 'ArrowLeft') state.keys.p2Left = false;
      if (code === 'KeyD' || code === 'ArrowRight') state.keys.p2Right = false;
    }

    if (progression.activeMinigame.onKeyUp) {
      progression.activeMinigame.onKeyUp(code, ctxApi);
    }
    if (state.mode === 'guest' || state.mode === 'host') {
      net.send({ type: 'mg_key_event', code, isDown: false });
    }
    return;
  }

  if (state.mode === 'host') {
    if (code === 'KeyS' || code === 'ArrowDown') duckPlayer('p1', false);
    if (code === 'KeyA' || code === 'ArrowLeft') state.keys.p1Left = false;
    if (code === 'KeyD' || code === 'ArrowRight') state.keys.p1Right = false;
    return;
  }
  if (state.mode === 'guest') {
    if (code === 'KeyS' || code === 'ArrowDown') duckPlayer('p2', false);
    if (code === 'KeyA' || code === 'ArrowLeft') {
      state.keys.p2Left = false;
      net.send({ type: 'guest_keys', left: state.keys.p2Left, right: state.keys.p2Right });
    }
    if (code === 'KeyD' || code === 'ArrowRight') {
      state.keys.p2Right = false;
      net.send({ type: 'guest_keys', left: state.keys.p2Left, right: state.keys.p2Right });
    }
    return;
  }

  if (code === 'KeyS') duckPlayer('p1', false);
  if (code === 'ArrowDown') duckPlayer('p2', false);
  if (code === 'KeyA') state.keys.p1Left = false;
  if (code === 'KeyD') state.keys.p1Right = false;
  if (code === 'ArrowLeft') state.keys.p2Left = false;
  if (code === 'ArrowRight') state.keys.p2Right = false;
});

// Eventos de Ponteiro (Mouse & Touch direto no Canvas para os Minigames)
function getCanvasCoords(clientX, clientY) {
  const rect = canvas.getBoundingClientRect();
  const scaleX = state.width / (rect.width || 1);
  const scaleY = state.height / (rect.height || 1);
  return {
    x: (clientX - rect.left) * scaleX,
    y: (clientY - rect.top) * scaleY
  };
}

canvas.addEventListener('pointerdown', (e) => {
  if (!progression.activeMinigame) return;
  const coords = getCanvasCoords(e.clientX, e.clientY);
  if (progression.activeMinigame.onPointerDown) {
    progression.activeMinigame.onPointerDown(coords.x, coords.y, ctxApi);
  }
  if (state.mode === 'guest' || state.mode === 'host') {
    net.send({ type: 'mg_pointer_down', x: coords.x, y: coords.y });
  }
});

canvas.addEventListener('pointermove', (e) => {
  if (!progression.activeMinigame) return;
  const coords = getCanvasCoords(e.clientX, e.clientY);
  if (progression.activeMinigame.onPointerMove) {
    progression.activeMinigame.onPointerMove(coords.x, coords.y, ctxApi);
  }
  if (state.mode === 'guest' || state.mode === 'host') {
    net.send({ type: 'mg_pointer_move', x: coords.x, y: coords.y });
  }
});

window.addEventListener('pointerup', () => {
  if (!progression.activeMinigame) return;
  if (progression.activeMinigame.onPointerUp) {
    progression.activeMinigame.onPointerUp(ctxApi);
  }
  if (state.mode === 'guest' || state.mode === 'host') {
    net.send({ type: 'mg_pointer_up' });
  }
});

canvas.addEventListener('wheel', (e) => {
  if (!progression.activeMinigame) return;
  if (progression.activeMinigame.onWheel) {
    progression.activeMinigame.onWheel(e.deltaY, ctxApi);
    e.preventDefault();
  }
  if (state.mode === 'guest' || state.mode === 'host') {
    net.send({ type: 'mg_wheel', deltaY: e.deltaY });
  }
}, { passive: false });

function hasCloseObstacle(laneIndex) {
  const px = getPhase1PlayerX();
  return state.phase1.obstacles.some(
    (o) => o.lane === laneIndex && o.x > px - 20 && o.x - px < 220
  );
}

// Eventos de Toque Demarcados (Metade Esquerda = Noivo, Metade Direita = Noiva)
function handleZoneTap(zonePlayer) {
  const targetPlayer =
    state.mode === 'host' ? 'p1' : state.mode === 'guest' ? 'p2' : zonePlayer;

  if (state.screen === 'phase1') {
    jumpPlayer(targetPlayer);
  }
}

touchZoneLeft.addEventListener('pointerdown', (e) => {
  if (e.target.closest('.dpad-btn')) return;
  touchZoneLeft.classList.add('active-press');
  handleZoneTap('p1');
});
touchZoneLeft.addEventListener('pointerup', () => touchZoneLeft.classList.remove('active-press'));
touchZoneLeft.addEventListener('pointercancel', () => touchZoneLeft.classList.remove('active-press'));

touchZoneRight.addEventListener('pointerdown', (e) => {
  if (e.target.closest('.dpad-btn')) return;
  touchZoneRight.classList.add('active-press');
  handleZoneTap('p2');
});
touchZoneRight.addEventListener('pointerup', () => touchZoneRight.classList.remove('active-press'));
touchZoneRight.addEventListener('pointercancel', () => touchZoneRight.classList.remove('active-press'));

// Botões Mobile da Fase 1 (Pular / Abaixar) e Fase 2 (Giro / Buquê)
document.querySelectorAll('.dpad-btn').forEach((btn) => {
  const rawPlayer = btn.dataset.player; // 'p1' ou 'p2'
  const dir = parseInt(btn.dataset.dir || '0', 10);
  const action = btn.dataset.action;
  const p1Action = btn.dataset.p1action; // 'jump' ou 'duck'

  const setDirState = (isDown) => {
    const p = state.mode === 'host' ? 'p1' : state.mode === 'guest' ? 'p2' : rawPlayer;
    if (p1Action === 'jump') {
      if (isDown) jumpPlayer(p);
      return;
    }
    if (p1Action === 'duck') {
      duckPlayer(p, isDown);
      return;
    }
    if (action === 'burst') {
      if (isDown) shootBurstBouquet(p);
      return;
    }
    if (p === 'p1') {
      if (dir < 0) state.keys.p1Left = isDown;
      if (dir > 0) state.keys.p1Right = isDown;
    } else {
      if (dir < 0) state.keys.p2Left = isDown;
      if (dir > 0) state.keys.p2Right = isDown;
      if (state.mode === 'guest') {
        net.send({ type: 'guest_keys', left: state.keys.p2Left, right: state.keys.p2Right });
      }
    }
  };

  btn.addEventListener('pointerdown', (e) => {
    e.stopPropagation();
    btn.classList.add('pressed');
    setDirState(true);
  });
  const release = (e) => {
    e.stopPropagation();
    btn.classList.remove('pressed');
    setDirState(false);
  };
  btn.addEventListener('pointerup', release);
  btn.addEventListener('pointercancel', release);
  btn.addEventListener('pointerleave', release);
});

// ============================================================================
// LÓGICA DA FASE 1: CORRIDA PARA O ALTAR
// ============================================================================

function getPhase1PlayerX() {
  return Math.max(85, Math.min(180, state.width * 0.16));
}

function getPhase1LaneY(laneIndex) {
  const usableTop = 68;
  const usableHeight = state.height - usableTop;
  // Pista 0 (Topo): Noivo | Pista 1 (Baixo): Noiva
  return laneIndex === 0
    ? usableTop + usableHeight * 0.43
    : usableTop + usableHeight * 0.87;
}

function spawnPhase1Obstacle() {
  const p1 = state.phase1;
  // Não spawna mais obstáculos perto dos 92% para dar espaço para o Altar
  if (p1.progress > 90) return;

  const rand = Math.random();
  // Pode spawnar na pista 0, pista 1, ou em ambas com leve defasagem para exigir cooperação!
  const lanes = rand < 0.38 ? [0] : rand < 0.76 ? [1] : [0, 1];

  lanes.forEach((lane, idx) => {
    const tpl = PHASE1_OBSTACLE_TYPES[Math.floor(Math.random() * PHASE1_OBSTACLE_TYPES.length)];
    const staggerX = idx === 1 ? 110 + Math.random() * 100 : 0;
    p1.obstacles.push({
      lane,
      x: state.width + 80 + staggerX,
      w: tpl.w,
      h: tpl.h,
      type: tpl
    });
  });
}

function updatePhase1(dt) {
  const p1 = state.phase1;
  const gravity = 1520;

  // Atualiza física vertical e agachamento dos dois jogadores
  ['p1', 'p2'].forEach((key) => {
    const actor = p1[key];
    actor.runCycle += dt * 12;
    if (actor.jumping) {
      actor.y += actor.vy * dt;
      actor.vy += gravity * dt;
      if (actor.y >= 0) {
        actor.y = 0;
        actor.vy = 0;
        actor.jumping = false;
      }
    }

    if (actor.duckTimer > 0) {
      actor.duckTimer -= dt;
    }
    actor.ducking = actor.duckHold || actor.duckTimer > 0;
  });

  // Se for Guest no modo Online, apenas interpola visualmente o estado vindo do Host
  if (state.mode === 'guest') return;

  const speed = p1.speed + p1.progress * 1.4;
  p1.scrollX += speed * dt;
  p1.progress = Math.min(100, p1.progress + (100 / p1.duration) * dt);

  hudProgressFill.style.width = `${p1.progress.toFixed(1)}%`;
  hudProgressText.textContent = `${Math.floor(p1.progress)}% ⛪`;

  // Spawna Altar quando chegar em 93%
  if (p1.progress >= 93 && !p1.altarSpawned) {
    p1.altarSpawned = true;
    p1.altarX = state.width + 120;
  }

  if (p1.altarSpawned) {
    p1.altarX -= speed * dt;
    const playerX = getPhase1PlayerX();
    if (p1.altarX <= playerX + 30) {
      triggerStageTransition();
      return;
    }
  }

  // Spawna obstáculos periódicos
  p1.spawnTimer -= dt;
  if (p1.spawnTimer <= 0) {
    spawnPhase1Obstacle();
    p1.spawnTimer = Math.max(1.05, 1.75 - (p1.progress / 100) * 0.55);
  }

  const playerX = getPhase1PlayerX();
  const hitRadiusX = 16;

  for (let i = p1.obstacles.length - 1; i >= 0; i--) {
    const obs = p1.obstacles[i];
    obs.x -= speed * dt;

    // Checa colisão com o personagem da respectiva pista
    const actor = obs.lane === 0 ? p1.p1 : p1.p2;
    const laneGroundY = getPhase1LaneY(obs.lane);
    const actorBottomY = laneGroundY + actor.y;
    const isHigh = obs.type.placement === 'high';

    const overlapX = Math.abs(obs.x - playerX) < (obs.w * 0.38 + hitRadiusX);
    let collided = false;

    if (overlapX) {
      if (isHigh) {
        // Obstáculo no alto: bate se NÃO estiver abaixado no chão (ou se pular nele!)
        const safelyDucked = actor.ducking && actor.y > -14;
        if (!safelyDucked) {
          collided = true;
        }
      } else {
        // Obstáculo no chão: bate se não pular alto o suficiente
        if (actorBottomY > laneGroundY - obs.h + 14) {
          collided = true;
        }
      }
    }

    if (collided) {
      const victimName = obs.lane === 0 ? state.groomName : state.brideName;
      const highlightY = isHigh ? laneGroundY - 38 - obs.h / 2 : laneGroundY - obs.h / 2;
      triggerBatatinha(
        `${victimName}: ${obs.type.quote}`,
        1,
        { x: obs.x, y: highlightY, r: 48, label: obs.type.label }
      );
      return;
    }

    // Passou com sucesso pelo obstáculo
    if (!obs.passed && obs.x + obs.w * 0.5 < playerX - 18) {
      obs.passed = true;
      const msg = isHigh ? 'ABAIXOU! ✨' : 'PULOU! ✨';
      spawnFloatingText(playerX, laneGroundY + actor.y - 65, msg, '#06d6a0');
    }

    if (obs.x < -140) {
      p1.obstacles.splice(i, 1);
    }
  }
}

// ============================================================================
// LÓGICA DA FASE 2: DEFESA DO BOLO DE CASAMENTO
// ============================================================================

function spawnPhase2Enemy() {
  const p2 = state.phase2;
  const cx = state.width / 2;
  const cy = (state.height + 54) / 2;
  const spawnDist = Math.max(state.width, state.height) * 0.58 + 40;
  const angle = Math.random() * Math.PI * 2;

  const tpl = PHASE2_ENEMY_TYPES[Math.floor(Math.random() * PHASE2_ENEMY_TYPES.length)];
  const speedScale = 1 + ((45 - p2.timeLeft) / 45) * 0.32;

  p2.enemies.push({
    x: cx + Math.cos(angle) * spawnDist,
    y: cy + Math.sin(angle) * spawnDist,
    vx: 0,
    vy: 0,
    angle,
    speed: tpl.speed * speedScale,
    radius: tpl.radius,
    wobblePhase: Math.random() * Math.PI * 2,
    type: tpl,
    bounced: false
  });
}

function updatePhase2(dt) {
  const p2 = state.phase2;
  const angularSpeed = 3.2; // rad/s

  // Movimentação orbital do Jogador 1 (Noivo: A / D)
  let p1Dir = 0;
  if (state.keys.p1Left) p1Dir -= 1;
  if (state.keys.p1Right) p1Dir += 1;
  p2.p1Angle += p1Dir * angularSpeed * dt;

  // Movimentação orbital do Jogador 2 (Noiva: Setas Esq / Dir)
  let p2Dir = 0;
  if (state.keys.p2Left) p2Dir -= 1;
  if (state.keys.p2Right) p2Dir += 1;
  p2.p2Angle += p2Dir * angularSpeed * dt;

  if (state.mode === 'guest') return;

  // Atualiza cronômetro regressivo de 45s
  p2.timeLeft = Math.max(0, p2.timeLeft - dt);
  hudTimerText.textContent = `${p2.timeLeft.toFixed(1)}s`;

  if (p2.timeLeft <= 0) {
    // Verifica na estrutura modular se há um próximo minijogo ativo (ex: Fase 3 no futuro)
    const nextStage = progression.getNextEnabledStage('phase2');
    if (nextStage) {
      startStageById(nextStage.id, false);
    } else {
      triggerVictory();
    }
    return;
  }

  const cx = state.width / 2;
  const cy = (state.height + 54) / 2;

  // Disparo automático periódico de lembrancinhas + buquês
  p2.p1Cooldown -= dt;
  p2.p2Cooldown -= dt;
  if (p2.p1Cooldown <= 0) {
    p2.p1Cooldown = 0.85;
    p2.projectiles.push({
      x: cx + Math.cos(p2.p1Angle) * p2.orbitRadius,
      y: cy + Math.sin(p2.p1Angle) * p2.orbitRadius,
      vx: Math.cos(p2.p1Angle) * 290,
      vy: Math.sin(p2.p1Angle) * 290,
      owner: 'p1',
      emoji: '🍬',
      life: 1.4
    });
  }
  if (p2.p2Cooldown <= 0) {
    p2.p2Cooldown = 0.85;
    p2.projectiles.push({
      x: cx + Math.cos(p2.p2Angle) * p2.orbitRadius,
      y: cy + Math.sin(p2.p2Angle) * p2.orbitRadius,
      vx: Math.cos(p2.p2Angle) * 290,
      vy: Math.sin(p2.p2Angle) * 290,
      owner: 'p2',
      emoji: '💐',
      life: 1.4
    });
  }

  // Atualiza projéteis (lembrancinhas / buquês)
  for (let i = p2.projectiles.length - 1; i >= 0; i--) {
    const proj = p2.projectiles[i];
    proj.x += proj.vx * dt;
    proj.y += proj.vy * dt;
    proj.life -= dt;
    if (proj.life <= 0) {
      p2.projectiles.splice(i, 1);
    }
  }

  // Spawna ondas de convidados famintos
  p2.spawnTimer -= dt;
  if (p2.spawnTimer <= 0) {
    spawnPhase2Enemy();
    const elapsed = 45 - p2.timeLeft;
    p2.spawnTimer = Math.max(0.55, 1.35 - (elapsed / 45) * 0.65);
  }

  // Posições dos escudos/personagens do Noivo e da Noiva
  const p1X = cx + Math.cos(p2.p1Angle) * p2.orbitRadius;
  const p1Y = cy + Math.sin(p2.p1Angle) * p2.orbitRadius;
  const p2X = cx + Math.cos(p2.p2Angle) * p2.orbitRadius;
  const p2Y = cy + Math.sin(p2.p2Angle) * p2.orbitRadius;
  const defenderHitRadius = 38;

  for (let i = p2.enemies.length - 1; i >= 0; i--) {
    const en = p2.enemies[i];

    if (en.bounced) {
      en.x += en.vx * dt;
      en.y += en.vy * dt;
      en.life -= dt;
      if (en.life <= 0) p2.enemies.splice(i, 1);
      continue;
    }

    // Move em direção ao centro do Bolo de Casamento
    const dx = cx - en.x;
    const dy = cy - en.y;
    const distToCenter = Math.hypot(dx, dy) || 1;
    const dirX = dx / distToCenter;
    const dirY = dy / distToCenter;

    en.wobblePhase += dt * 6;
    const perpX = -dirY * Math.sin(en.wobblePhase) * (en.type.wobble || 0.8) * 14;
    const perpY = dirX * Math.sin(en.wobblePhase) * (en.type.wobble || 0.8) * 14;

    en.x += (dirX * en.speed + perpX) * dt;
    en.y += (dirY * en.speed + perpY) * dt;

    // 1. Checa se bateu no Noivo ou na Noiva (ou no escudo orbital)
    const distP1 = Math.hypot(en.x - p1X, en.y - p1Y);
    const distP2 = Math.hypot(en.x - p2X, en.y - p2Y);

    if (distP1 < en.radius + defenderHitRadius || distP2 < en.radius + defenderHitRadius) {
      const hitByP1 = distP1 <= distP2;
      en.bounced = true;
      en.vx = -dirX * 380 + (Math.random() - 0.5) * 90;
      en.vy = -dirY * 380 + (Math.random() - 0.5) * 90;
      en.life = 0.45;
      sfx.playBounce();
      spawnParticles(en.x, en.y, hitByP1 ? '#4cc9f0' : '#ff5d8f', 14, 180);
      const shouts = ['SÓ DEPOIS DA FOTO!', 'SAI DO BOLO!', 'PEGA O BUQUÊ!', 'PASSA LONGE!'];
      spawnFloatingText(
        en.x,
        en.y - 20,
        shouts[Math.floor(Math.random() * shouts.length)],
        hitByP1 ? '#4cc9f0' : '#ff5d8f'
      );
      continue;
    }

    // 2. Checa colisão com projéteis (lembrancinhas / buquês)
    let hitByProj = false;
    for (let j = p2.projectiles.length - 1; j >= 0; j--) {
      const proj = p2.projectiles[j];
      if (Math.hypot(en.x - proj.x, en.y - proj.y) < en.radius + 16) {
        p2.projectiles.splice(j, 1);
        hitByProj = true;
        break;
      }
    }

    if (hitByProj) {
      en.bounced = true;
      en.vx = -dirX * 320;
      en.vy = -dirY * 320;
      en.life = 0.35;
      sfx.playBounce();
      spawnParticles(en.x, en.y, '#ffd166', 12, 160);
      spawnFloatingText(en.x, en.y - 16, 'TOMA LEMBRANCINHA! 🎁', '#ffd166');
      continue;
    }

    // 3. Checa se encostou no Bolo de Casamento -> BATATINHA!
    if (distToCenter < p2.cakeRadius + en.radius - 6) {
      triggerBatatinha(
        en.type.quote,
        2,
        { x: en.x, y: en.y, r: 42, label: en.type.name }
      );
      return;
    }
  }
}

// ============================================================================
// SINCRONIZAÇÃO MULTIPLAYER P2P (HOST <-> GUEST)
// ============================================================================

let netSyncAccumulator = 0;

function broadcastHostState(dt) {
  if (state.mode !== 'host' || !net.connected) return;
  netSyncAccumulator += dt;
  if (netSyncAccumulator < 0.033) return; // ~30 snapshots/seg
  netSyncAccumulator = 0;

  if (state.screen === 'phase1') {
    const p1 = state.phase1;
    net.send({
      type: 'sync_phase1',
      progress: p1.progress,
      scrollX: p1.scrollX,
      altarSpawned: p1.altarSpawned,
      altarX: p1.altarX,
      p1: p1.p1,
      p2: p1.p2,
      obstacles: p1.obstacles.map((o) => ({
        lane: o.lane,
        x: o.x,
        w: o.w,
        h: o.h,
        typeId: o.type.id
      }))
    });
  } else if (state.screen === 'phase2') {
    const p2 = state.phase2;
    net.send({
      type: 'sync_phase2',
      timeLeft: p2.timeLeft,
      p1Angle: p2.p1Angle,
      p2Angle: p2.p2Angle,
      enemies: p2.enemies.map((e) => ({
        x: e.x,
        y: e.y,
        bounced: e.bounced,
        typeId: e.type.id
      })),
      projectiles: p2.projectiles.map((pr) => ({
        x: pr.x,
        y: pr.y,
        emoji: pr.emoji
      }))
    });
  }
}

net.onData = (data) => {
  if (!data || !data.type) return;

  switch (data.type) {
    case 'hello_names':
      if (state.mode === 'host' && data.brideName) {
        inputBride.value = data.brideName;
        syncCoupleNamesFromInputs();
        startPhase1(false);
      }
      break;

    case 'start_phase1':
      if (data.groomName) inputGroom.value = data.groomName;
      if (data.brideName) inputBride.value = data.brideName;
      syncCoupleNamesFromInputs();
      startPhase1(true);
      break;

    case 'guest_jump':
      if (state.mode === 'host') {
        jumpPlayer('p2');
      }
      break;

    case 'guest_duck':
      if (state.mode === 'host') {
        duckPlayer('p2', !!data.down);
      }
      break;

    case 'guest_keys':
      if (state.mode === 'host') {
        state.keys.p2Left = !!data.left;
        state.keys.p2Right = !!data.right;
      }
      break;

    case 'guest_burst':
      if (state.mode === 'host') {
        shootBurstBouquet('p2');
      }
      break;

    case 'sync_phase1':
      if (state.mode === 'guest' && state.screen === 'phase1') {
        const p1 = state.phase1;
        p1.progress = data.progress;
        p1.scrollX = data.scrollX;
        p1.altarSpawned = data.altarSpawned;
        p1.altarX = data.altarX;
        p1.p1 = data.p1;
        p1.p2 = data.p2;
        p1.obstacles = (data.obstacles || []).map((o) => ({
          lane: o.lane,
          x: o.x,
          w: o.w,
          h: o.h,
          type: PHASE1_OBSTACLE_TYPES.find((t) => t.id === o.typeId) || PHASE1_OBSTACLE_TYPES[0]
        }));
        hudProgressFill.style.width = `${p1.progress.toFixed(1)}%`;
        hudProgressText.textContent = `${Math.floor(p1.progress)}% ⛪`;
      }
      break;

    case 'stage_transition':
      triggerStageTransition(true);
      break;

    case 'start_phase2':
      startPhase2(true);
      break;

    case 'sync_phase2':
      if (state.mode === 'guest' && state.screen === 'phase2') {
        const p2 = state.phase2;
        p2.timeLeft = data.timeLeft;
        p2.p1Angle = data.p1Angle;
        p2.p2Angle = data.p2Angle;
        p2.enemies = (data.enemies || []).map((e) => {
          const tpl = PHASE2_ENEMY_TYPES.find((t) => t.id === e.typeId) || PHASE2_ENEMY_TYPES[0];
          return {
            x: e.x,
            y: e.y,
            bounced: e.bounced,
            radius: tpl.radius,
            type: tpl
          };
        });
        p2.projectiles = data.projectiles || [];
        hudTimerText.textContent = `${p2.timeLeft.toFixed(1)}s`;
      }
      break;

    case 'batatinha':
      triggerBatatinha(data.reason, data.phaseNum, data.culpritInfo, true);
      break;

    case 'victory':
      if (data.fromMinigame) {
        triggerMinigameVictory(data.message, true);
      } else {
        triggerVictory(true);
      }
      break;

    case 'request_retry':
      if (state.mode === 'host') {
        startPhase1(false);
      }
      break;

    case 'request_continue_phase':
      if (state.mode === 'host') {
        startStageById(data.stageId || progression.currentStageId || 'phase2', false);
      }
      break;

    case 'request_start_stage':
      if (state.mode === 'host' && data.stageId) {
        startStageById(data.stageId, false);
      }
      break;

    case 'start_custom_stage':
      if (data.stageId) {
        startStageById(data.stageId, true);
      }
      break;

    case 'mg_pointer_down':
      if (progression.activeMinigame && progression.activeMinigame.onPointerDown) {
        progression.activeMinigame.onPointerDown(data.x, data.y, ctxApi);
      }
      break;

    case 'mg_pointer_move':
      if (progression.activeMinigame && progression.activeMinigame.onPointerMove) {
        progression.activeMinigame.onPointerMove(data.x, data.y, ctxApi);
      }
      break;

    case 'mg_pointer_up':
      if (progression.activeMinigame && progression.activeMinigame.onPointerUp) {
        progression.activeMinigame.onPointerUp(ctxApi);
      }
      break;

    case 'mg_wheel':
      if (progression.activeMinigame && progression.activeMinigame.onWheel) {
        progression.activeMinigame.onWheel(data.deltaY, ctxApi);
      }
      break;

    case 'mg_key_event':
      if (progression.activeMinigame) {
        if (data.isDown && progression.activeMinigame.onKeyDown) {
          progression.activeMinigame.onKeyDown(data.code, ctxApi);
        } else if (!data.isDown && progression.activeMinigame.onKeyUp) {
          progression.activeMinigame.onKeyUp(data.code, ctxApi);
        }
      }
      break;
  }
};

net.onConnected = (role, code) => {
  syncCoupleNamesFromInputs();
  if (role === 'guest') {
    const guestStatus = document.getElementById('guest-status-text');
    guestStatus.classList.remove('hidden');
    guestStatus.textContent = `✅ Conectado à sala ${code}! Iniciando...`;
    net.send({
      type: 'hello_names',
      brideName: state.brideName
    });
  } else if (role === 'host') {
    const hostStatus = document.getElementById('host-status-text');
    hostStatus.textContent = '✅ Par conectado! Partida iniciando...';
  }
};

net.onError = (msg) => {
  const hostStatus = document.getElementById('host-status-text');
  const guestStatus = document.getElementById('guest-status-text');
  if (net.role === 'host') {
    hostStatus.textContent = '⚠️ ' + msg;
  } else {
    guestStatus.classList.remove('hidden');
    guestStatus.textContent = '⚠️ ' + msg;
  }
};

net.onDisconnected = () => {
  if (state.screen !== 'menu') {
    alert('O outro aparelho desconectou da sala. Voltando ao menu principal.');
    returnToMenu();
  }
};

// ============================================================================
// RENDERIZAÇÃO PROCEDURAL NO CANVAS (PERSONAGENS, CENÁRIOS, BOLO E EFEITOS)
// ============================================================================

function drawGroomCharacter(x, groundY, runCycle, scale = 1, showLabel = true, isDucking = false) {
  ctx.save();
  ctx.translate(x, groundY);
  ctx.scale(scale, scale);

  const legSwing = Math.sin(runCycle) * 7;
  const bounce = isDucking ? 0 : Math.abs(Math.cos(runCycle)) * 3;

  // Sombra no chão
  ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
  ctx.beginPath();
  ctx.ellipse(0, 0, isDucking ? 24 : 18, 5, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.save();
  ctx.translate(0, -bounce);
  if (isDucking) {
    // Agachado: comprime a altura para passar por baixo dos obstáculos aéreos
    ctx.scale(1.22, 0.48);
  }

  // Pernas de calça social preta
  ctx.strokeStyle = '#1e293b';
  ctx.lineWidth = 6;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(-5, -18);
  ctx.lineTo(-5 + legSwing, -2);
  ctx.moveTo(5, -18);
  ctx.lineTo(5 - legSwing, -2);
  ctx.stroke();

  // Paletó / Terno do Noivo
  ctx.fillStyle = '#0f172a';
  ctx.strokeStyle = '#4cc9f0';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(-14, -44, 28, 28, 6);
  ctx.fill();
  ctx.stroke();

  // Camisa branca em V + Gravata Borboleta Vermelha
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.moveTo(-6, -44);
  ctx.lineTo(6, -44);
  ctx.lineTo(0, -30);
  ctx.closePath();
  ctx.fill();

  // Gravata borboleta
  ctx.fillStyle = '#ff3355';
  ctx.beginPath();
  ctx.moveTo(-6, -41);
  ctx.lineTo(6, -37);
  ctx.lineTo(6, -41);
  ctx.lineTo(-6, -37);
  ctx.closePath();
  ctx.fill();

  // Flor na lapela
  ctx.fillStyle = '#ffd166';
  ctx.beginPath();
  ctx.arc(8, -36, 3, 0, Math.PI * 2);
  ctx.fill();

  // Cabeça
  ctx.fillStyle = '#fcd5b5';
  ctx.beginPath();
  ctx.arc(0, -56, 12, 0, Math.PI * 2);
  ctx.fill();

  // Cabelo estiloso
  ctx.fillStyle = '#271810';
  ctx.beginPath();
  ctx.arc(0, -60, 12, Math.PI, Math.PI * 2);
  ctx.fill();

  // Óculos de Professor charmoso
  ctx.strokeStyle = '#ffd166';
  ctx.lineWidth = 2;
  ctx.strokeRect(-8, -59, 7, 5);
  ctx.strokeRect(2, -59, 7, 5);
  ctx.beginPath();
  ctx.moveTo(-1, -57);
  ctx.lineTo(2, -57);
  ctx.stroke();

  ctx.restore();

  if (showLabel) {
    const labelY = isDucking ? -40 : -78;
    drawNameplate(0, labelY, isDucking ? `⬇️ ${state.groomName}` : state.groomName, '#4cc9f0');
  }

  ctx.restore();
}

function drawBrideCharacter(x, groundY, runCycle, scale = 1, showLabel = true, isDucking = false) {
  ctx.save();
  ctx.translate(x, groundY);
  ctx.scale(scale, scale);

  const bounce = isDucking ? 0 : Math.abs(Math.sin(runCycle)) * 3.5;
  const veilWave = Math.sin(runCycle * 0.8) * 5;

  // Sombra no chão
  ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
  ctx.beginPath();
  ctx.ellipse(0, 0, isDucking ? 26 : 22, 6, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.save();
  ctx.translate(0, -bounce);
  if (isDucking) {
    ctx.scale(1.22, 0.48);
  }

  // Véu esvoaçante atrás da noiva
  ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
  ctx.beginPath();
  ctx.moveTo(-4, -64);
  ctx.quadraticCurveTo(-28, -55 + veilWave, -34, -26 - veilWave);
  ctx.quadraticCurveTo(-18, -22, -6, -42);
  ctx.closePath();
  ctx.fill();

  // Saia do Vestido de Noiva
  ctx.fillStyle = '#ffffff';
  ctx.strokeStyle = '#ff5d8f';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-9, -42);
  ctx.lineTo(9, -42);
  ctx.lineTo(22, -3);
  ctx.quadraticCurveTo(0, 2, -22, -3);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Detalhes rendados dourados na barra do vestido
  ctx.strokeStyle = '#ffd166';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(-17, -9);
  ctx.quadraticCurveTo(0, -5, 17, -9);
  ctx.stroke();

  // Cabeça
  ctx.fillStyle = '#fcd5b5';
  ctx.beginPath();
  ctx.arc(0, -55, 11.5, 0, Math.PI * 2);
  ctx.fill();

  // Cabelo + Coque + Tiara Dourada
  ctx.fillStyle = '#3b2114';
  ctx.beginPath();
  ctx.arc(0, -59, 11.5, Math.PI, Math.PI * 2);
  ctx.arc(-8, -63, 6, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#ffd166';
  ctx.beginPath();
  ctx.moveTo(-6, -66);
  ctx.lineTo(0, -73);
  ctx.lineTo(6, -66);
  ctx.closePath();
  ctx.fill();

  // Buquê de flores na mão
  ctx.fillStyle = '#ff5d8f';
  ctx.beginPath();
  ctx.arc(13, -29, 7, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#ffd166';
  ctx.beginPath();
  ctx.arc(15, -31, 3.5, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();

  if (showLabel) {
    const labelY = isDucking ? -40 : -80;
    drawNameplate(0, labelY, isDucking ? `⬇️ ${state.brideName}` : state.brideName, '#ff5d8f');
  }

  ctx.restore();
}

function drawNameplate(x, y, text, borderColor) {
  ctx.font = '700 12px Fredoka, sans-serif';
  const w = ctx.measureText(text).width + 16;
  ctx.fillStyle = 'rgba(15, 7, 30, 0.88)';
  ctx.strokeStyle = borderColor;
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.roundRect(x - w / 2, y - 16, w, 22, 99);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, x, y - 5);
}

function renderPhase1() {
  const p1 = state.phase1;
  const w = state.width;
  const h = state.height;

  // Céu festivo entardecer rumo à igreja
  const skyGrad = ctx.createLinearGradient(0, 0, 0, h);
  skyGrad.addColorStop(0, '#1e113a');
  skyGrad.addColorStop(0.5, '#3b1d5e');
  skyGrad.addColorStop(1, '#24123d');
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, w, h);

  // Bandeirinhas de festa no topo
  const flagSpacing = 48;
  const flagOffset = -(p1.scrollX * 0.4) % flagSpacing;
  const flagColors = ['#ffd166', '#ff5d8f', '#4cc9f0', '#06d6a0'];
  for (let x = flagOffset; x < w + flagSpacing; x += flagSpacing) {
    const idx = Math.abs(Math.floor((x - flagOffset) / flagSpacing)) % flagColors.length;
    ctx.fillStyle = flagColors[idx];
    ctx.beginPath();
    ctx.moveTo(x, 62);
    ctx.lineTo(x + 22, 62);
    ctx.lineTo(x + 11, 80);
    ctx.closePath();
    ctx.fill();
  }

  // Desenha as 2 Pistas Horizontais (Tapete Azul do Noivo & Tapete Vermelho/Rosa da Noiva)
  [0, 1].forEach((lane) => {
    const groundY = getPhase1LaneY(lane);
    const trackH = 34;

    // Tapete da cerimônia
    ctx.fillStyle = lane === 0 ? '#1e3a8a' : '#881337';
    ctx.fillRect(0, groundY - 12, w, trackH);

    // Bordas douradas do tapete
    ctx.fillStyle = '#ffd166';
    ctx.fillRect(0, groundY - 12, w, 3);
    ctx.fillRect(0, groundY + trackH - 15, w, 3);

    // Listras de movimento no tapete
    const stripeSpacing = 90;
    const offset = -(p1.scrollX) % stripeSpacing;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.14)';
    for (let sx = offset; sx < w + stripeSpacing; sx += stripeSpacing) {
      ctx.fillRect(sx, groundY - 4, 36, 10);
    }

    // Dica de controle legível na pista
    ctx.font = '700 13px Fredoka, sans-serif';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.72)';
    ctx.textAlign = 'left';
    const hint =
      lane === 0
        ? `🤵 ${state.groomName}: [W] Pular | [S] Abaixar`
        : `👰 ${state.brideName}: [⬆️/Espaço] Pular | [⬇️] Abaixar`;
    ctx.fillText(hint, 16, groundY + 11);
  });

  // Se o Altar da Igreja já apareceu (93% a 100%), desenha o Altar!
  if (p1.altarSpawned) {
    drawChurchAltar(p1.altarX, getPhase1LaneY(0), getPhase1LaneY(1));
  }

  // Desenha Noivo (Pista 0) e Noiva (Pista 1)
  const playerX = getPhase1PlayerX();
  drawGroomCharacter(playerX, getPhase1LaneY(0) + p1.p1.y, p1.p1.runCycle, 1, true, p1.p1.ducking);
  drawBrideCharacter(playerX, getPhase1LaneY(1) + p1.p2.y, p1.p2.runCycle, 1, true, p1.p2.ducking);

  // Desenha Obstáculos por cima para que as placas de texto fiquem 100% visíveis e legíveis
  p1.obstacles.forEach((obs) => {
    const laneY = getPhase1LaneY(obs.lane);
    drawPhase1Obstacle(obs, laneY);
  });
}

function drawPhase1Obstacle(obs, groundY) {
  ctx.save();
  const isHigh = obs.type.placement === 'high';
  // Se for obstáculo alto ('high'), flutua a 38px do chão (na altura da cabeça, exigindo abaixar!)
  const hoverOffset = isHigh ? -38 + Math.sin(state.time * 7 + obs.x * 0.02) * 3 : 0;

  ctx.translate(obs.x, groundY);

  // Sombra no chão
  ctx.fillStyle = isHigh ? 'rgba(0,0,0,0.25)' : 'rgba(0,0,0,0.45)';
  ctx.beginPath();
  ctx.ellipse(0, 0, obs.w * (isHigh ? 0.42 : 0.58), 6, 0, 0, Math.PI * 2);
  ctx.fill();

  // Se for obstáculo alto, desenha faixa pontilhada indicando o espaço livre embaixo para abaixar
  if (isHigh) {
    ctx.strokeStyle = '#ffd166';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 4]);
    ctx.beginPath();
    ctx.moveTo(-obs.w * 0.55, -34);
    ctx.lineTo(obs.w * 0.55, -34);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  ctx.translate(0, hoverOffset);

  // Cartão principal do obstáculo
  ctx.fillStyle = obs.type.color;
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.roundRect(-obs.w / 2, -obs.h, obs.w, obs.h, 12);
  ctx.fill();
  ctx.stroke();

  // Asinhas / Balão lateral nos obstáculos aéreos
  if (isHigh) {
    ctx.fillStyle = '#ffd166';
    ctx.beginPath();
    ctx.moveTo(-obs.w / 2, -obs.h * 0.65);
    ctx.lineTo(-obs.w / 2 - 14, -obs.h * 0.85);
    ctx.lineTo(-obs.w / 2 - 10, -obs.h * 0.45);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(obs.w / 2, -obs.h * 0.65);
    ctx.lineTo(obs.w / 2 + 14, -obs.h * 0.85);
    ctx.lineTo(obs.w / 2 + 10, -obs.h * 0.45);
    ctx.closePath();
    ctx.fill();
  }

  // Emoji central bem grande
  ctx.font = '31px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(obs.type.emoji, 0, -obs.h / 2);

  // =========================================================================
  // PLACA DE TEXTO SUPER LEGÍVEL ACIMA DO OBSTÁCULO (ALTO CONTRASTE)
  // =========================================================================
  ctx.font = '700 15px Fredoka, system-ui, sans-serif';
  const titleWidth = ctx.measureText(obs.type.label).width;
  ctx.font = '600 12px Fredoka, system-ui, sans-serif';
  const subWidth = ctx.measureText(`${obs.type.actionText} • ${obs.type.sub}`).width;

  const boxW = Math.max(titleWidth, subWidth) + 24;
  const boxH = 44;
  const boxY = -obs.h - boxH - 8;

  // Fundo escuro sólido para máximo contraste das letras
  ctx.fillStyle = 'rgba(10, 4, 24, 0.96)';
  ctx.strokeStyle = isHigh ? '#ffd166' : '#06d6a0';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.roundRect(-boxW / 2, boxY, boxW, boxH, 9);
  ctx.fill();
  ctx.stroke();

  // Linha 1: Nome do Obstáculo (Fonte Grande Branca com Contorno Preto)
  ctx.font = '700 15px Fredoka, system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 3;
  ctx.strokeText(obs.type.label, 0, boxY + 15);
  ctx.fillStyle = '#ffffff';
  ctx.fillText(obs.type.label, 0, boxY + 15);

  // Linha 2: Ação clara (⬆️ PULE! ou ⬇️ ABAIXE!) + Subtítulo em destaque colorido
  ctx.font = '700 12.5px Fredoka, system-ui, sans-serif';
  ctx.fillStyle = isHigh ? '#ffd166' : '#06d6a0';
  ctx.fillText(`${obs.type.actionText} • ${obs.type.sub}`, 0, boxY + 33);

  ctx.restore();
}

function drawChurchAltar(x, topLaneY, bottomLaneY) {
  ctx.save();
  const topY = topLaneY - 110;
  const height = bottomLaneY - topY + 20;

  // Tapete dourado de chegada
  ctx.fillStyle = '#ffd166';
  ctx.fillRect(x - 18, topLaneY - 25, 36, bottomLaneY - topLaneY + 50);

  // Arco Florido do Altar
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 12;
  ctx.beginPath();
  ctx.roundRect(x - 30, topY, 95, height, 30);
  ctx.stroke();

  ctx.fillStyle = 'rgba(255, 209, 102, 0.22)';
  ctx.fillRect(x - 24, topY + 6, 83, height - 12);

  ctx.font = '38px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('⛪', x + 18, topY + 34);
  ctx.fillText('💍', x + 18, (topLaneY + bottomLaneY) / 2);
  ctx.fillText('💐', x + 18, bottomLaneY - 12);

  ctx.font = '700 13px "Press Start 2P", monospace';
  ctx.fillStyle = '#ffd166';
  ctx.fillText('ALTAR!', x + 18, topY - 12);
  ctx.restore();
}

function renderPhase2() {
  const p2 = state.phase2;
  const w = state.width;
  const h = state.height;
  const cx = w / 2;
  const cy = (h + 54) / 2;

  // Piso do Salão de Festas quadriculado elegante
  ctx.fillStyle = '#1b1030';
  ctx.fillRect(0, 0, w, h);

  const tileSize = 56;
  ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
  for (let gx = 0; gx < w; gx += tileSize) {
    for (let gy = 54; gy < h; gy += tileSize) {
      if ((Math.floor(gx / tileSize) + Math.floor(gy / tileSize)) % 2 === 0) {
        ctx.fillRect(gx, gy, tileSize, tileSize);
      }
    }
  }

  // Círculo da Pista de Dança / Zona de Defesa Orbital
  ctx.strokeStyle = 'rgba(255, 209, 102, 0.28)';
  ctx.lineWidth = 3;
  ctx.setLineDash([10, 8]);
  ctx.beginPath();
  ctx.arc(cx, cy, p2.orbitRadius, 0, Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([]);

  // Desenha o Bolo de Casamento Gigante de 3 Andares no Centro
  drawWeddingCake(cx, cy, p2.cakeRadius);

  // Desenha Escudos / Arcos de Proteção e os Noivos Orbitando
  drawOrbitalDefender(cx, cy, p2.orbitRadius, p2.p1Angle, true);
  drawOrbitalDefender(cx, cy, p2.orbitRadius, p2.p2Angle, false);

  // Desenha Projéteis (Lembrancinhas / Buquês)
  p2.projectiles.forEach((proj) => {
    ctx.font = '22px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(proj.emoji, proj.x, proj.y);
  });

  // Desenha Invasores Famintos
  p2.enemies.forEach((en) => {
    drawPhase2Enemy(en);
  });
}

function drawWeddingCake(cx, cy, r) {
  ctx.save();
  ctx.translate(cx, cy);

  // Toalha rendada da mesa do bolo
  ctx.fillStyle = '#4c1d95';
  ctx.strokeStyle = '#ffd166';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(0, 0, r + 10, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // 1º Andar (Base Maior)
  ctx.fillStyle = '#fff1f2';
  ctx.strokeStyle = '#f43f5e';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.92, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // 2º Andar (Intermediário)
  ctx.fillStyle = '#ffe4e6';
  ctx.strokeStyle = '#fb7185';
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.65, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // 3º Andar (Topo do Bolo)
  ctx.fillStyle = '#ffffff';
  ctx.strokeStyle = '#ffd166';
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.38, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Morangos/Cerejas ao redor
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    ctx.fillStyle = '#e11d48';
    ctx.beginPath();
    ctx.arc(Math.cos(a) * r * 0.78, Math.sin(a) * r * 0.78, 4.5, 0, Math.PI * 2);
    ctx.fill();
  }

  // Topo com Noivinhos
  ctx.font = '22px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('🎂', 0, -2);

  ctx.font = '700 10px "Press Start 2P", monospace';
  ctx.fillStyle = '#ffd166';
  ctx.fillText('BOLO', 0, r + 24);

  ctx.restore();
}

function drawOrbitalDefender(cx, cy, orbitR, angle, isGroom) {
  const color = isGroom ? '#4cc9f0' : '#ff5d8f';

  // Arco de Escudo Rebatedor ao redor da órbita
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 9;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.arc(cx, cy, orbitR + 12, angle - 0.36, angle + 0.36);
  ctx.stroke();
  ctx.restore();

  // Posição do personagem
  const px = cx + Math.cos(angle) * orbitR;
  const py = cy + Math.sin(angle) * orbitR;

  if (isGroom) {
    drawGroomCharacter(px, py + 22, state.time * 8, 0.78, true);
  } else {
    drawBrideCharacter(px, py + 22, state.time * 8, 0.78, true);
  }
}

function drawPhase2Enemy(en) {
  ctx.save();
  ctx.translate(en.x, en.y);

  // Círculo do convidado invasor
  ctx.fillStyle = en.type.color;
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.arc(0, 0, en.radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.font = '24px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(en.type.emoji, 0, 1);

  // Placa legível com o nome do convidado invasor
  ctx.font = '700 13px Fredoka, system-ui, sans-serif';
  const textW = ctx.measureText(en.type.name).width + 14;
  const pillY = -en.radius - 26;

  ctx.fillStyle = 'rgba(10, 4, 24, 0.92)';
  ctx.strokeStyle = '#ffd166';
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.roundRect(-textW / 2, pillY, textW, 22, 6);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#ffffff';
  ctx.fillText(en.type.name, 0, pillY + 11);

  ctx.restore();
}

function renderParticlesAndOverlays(dt) {
  // Partículas
  for (let i = state.particles.length - 1; i >= 0; i--) {
    const p = state.particles[i];
    if (!state.freezeFrame) {
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.life -= dt;
    }
    if (p.life <= 0) {
      state.particles.splice(i, 1);
      continue;
    }
    ctx.globalAlpha = Math.max(0, p.life / p.maxLife);
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }

  // Textos flutuantes
  for (let i = state.floatingTexts.length - 1; i >= 0; i--) {
    const ft = state.floatingTexts[i];
    if (!state.freezeFrame) {
      ft.y += ft.vy * dt;
      ft.life -= dt;
    }
    if (ft.life <= 0) {
      state.floatingTexts.splice(i, 1);
      continue;
    }
    ctx.globalAlpha = Math.min(1, ft.life);
    ctx.font = '700 13px Fredoka, sans-serif';
    ctx.fillStyle = ft.color;
    ctx.textAlign = 'center';
    ctx.fillText(ft.text, ft.x, ft.y);
    ctx.globalAlpha = 1;
  }

  // Confetes comemorativos
  for (let i = state.confetti.length - 1; i >= 0; i--) {
    const c = state.confetti[i];
    c.x += c.vx * dt;
    c.y += c.vy * dt;
    c.rot += c.vRot * dt;
    if (c.y > state.height + 30) {
      state.confetti.splice(i, 1);
      continue;
    }
    ctx.save();
    ctx.translate(c.x, c.y);
    ctx.rotate(c.rot);
    ctx.fillStyle = c.color;
    ctx.fillRect(-c.w / 2, -c.h / 2, c.w, c.h);
    ctx.restore();
  }

  // Destaque do Culpado no congelamento do "BATATINHA!"
  if (state.freezeFrame && state.culpritHighlight) {
    const ch = state.culpritHighlight;
    ctx.save();
    ctx.strokeStyle = '#ff3355';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(ch.x, ch.y, ch.r + Math.sin(state.time * 12) * 5, 0, Math.PI * 2);
    ctx.stroke();

    ctx.font = '700 12px "Press Start 2P", monospace';
    ctx.fillStyle = '#ffd166';
    ctx.textAlign = 'center';
    ctx.fillText('💥 BATATINHA!', ch.x, ch.y - ch.r - 12);
    ctx.restore();
  }
}

function renderMenuBackground() {
  const w = state.width;
  const h = state.height;
  ctx.fillStyle = '#181028';
  ctx.fillRect(0, 0, w, h);

  // Desenha os noivos correndo alegremente no fundo do menu
  const cy = h * 0.85;
  drawGroomCharacter(w * 0.25, cy, state.time * 6, 1.1, false);
  drawBrideCharacter(w * 0.75, cy, state.time * 6, 1.1, false);
}

// ============================================================================
// LOOP PRINCIPAL (60 FPS)
// ============================================================================

let lastTime = performance.now();

function gameLoop(now) {
  const dt = Math.min(0.05, (now - lastTime) / 1000);
  lastTime = now;
  state.time += dt;

  const activeMg = progression.activeMinigame;

  if (!state.freezeFrame) {
    if (state.screen === 'phase1') {
      updatePhase1(dt);
      broadcastHostState(dt);
    } else if (state.screen === 'phase2') {
      updatePhase2(dt);
      broadcastHostState(dt);
    } else if (activeMg && activeMg.onUpdate) {
      activeMg.onUpdate(dt, ctxApi);
    }
  }

  if (state.screen === 'phase1' || (state.screen === 'batatinha' && state.failedPhase === 1)) {
    renderPhase1();
  } else if (state.screen === 'phase2' || (state.screen === 'batatinha' && state.failedPhase === 2)) {
    renderPhase2();
  } else if (activeMg && activeMg.onRender) {
    activeMg.onRender(ctx, ctxApi);
  } else {
    renderMenuBackground();
  }

  renderParticlesAndOverlays(dt);

  requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);

// ============================================================================
// BOTÕES DE UI E NAVEGAÇÃO
// ============================================================================

function returnToMenu() {
  if (transitionTimerId) {
    clearInterval(transitionTimerId);
    transitionTimerId = null;
  }
  progression.activeMinigame = null;
  state.mgState = {};
  net.disconnect();
  state.mode = 'local';
  state.screen = 'menu';
  state.freezeFrame = false;
  showOverlayScreen('menu');
}

// Botão: Abrir Hub de Minigames no Menu
const btnOpenMinigamesMenu = document.getElementById('btn-open-minigames-menu');
if (btnOpenMinigamesMenu) {
  btnOpenMinigamesMenu.addEventListener('click', () => {
    sfx.init();
    openMinigamesHub();
  });
}

// Botão: Abrir Hub de Minigames na tela de Vitória
const btnOpenMinigamesVictory = document.getElementById('btn-open-minigames-victory');
if (btnOpenMinigamesVictory) {
  btnOpenMinigamesVictory.addEventListener('click', () => {
    sfx.init();
    openMinigamesHub();
  });
}

// Botão: Fechar Hub de Minigames e voltar ao Menu
const btnCloseMinigames = document.getElementById('btn-close-minigames');
if (btnCloseMinigames) {
  btnCloseMinigames.addEventListener('click', () => {
    sfx.playClick();
    returnToMenu();
  });
}

// Botão: Ir ao Hub de Minigames a partir da tela BATATINHA!
const btnBatatinhaMinigames = document.getElementById('btn-batatinha-minigames');
if (btnBatatinhaMinigames) {
  btnBatatinhaMinigames.addEventListener('click', () => {
    sfx.playClick();
    openMinigamesHub();
  });
}

// Botão: Jogar no Mesmo Aparelho (Local)
document.getElementById('btn-play-local').addEventListener('click', () => {
  sfx.init();
  net.disconnect();
  state.mode = 'local';
  state.usedWKey = false;
  state.usedSpaceKey = false;
  startPhase1(false);
});

// Botão: Abrir Lobby Online (2 Aparelhos)
document.getElementById('btn-open-online').addEventListener('click', () => {
  sfx.init();
  sfx.playClick();
  syncCoupleNamesFromInputs();
  document.getElementById('host-room-info').classList.add('hidden');
  document.getElementById('guest-status-text').classList.add('hidden');
  state.screen = 'online';
  showOverlayScreen('online');
});

// Botão: Criar Sala (Host / Jogador 1)
document.getElementById('btn-create-room').addEventListener('click', () => {
  sfx.init();
  sfx.playClick();
  state.mode = 'host';
  const infoBox = document.getElementById('host-room-info');
  const codeDisplay = document.getElementById('display-room-code');
  const statusText = document.getElementById('host-status-text');

  infoBox.classList.remove('hidden');
  codeDisplay.textContent = '....';
  statusText.textContent = '⏳ Gerando sala P2P...';

  net.createRoom((shortCode) => {
    codeDisplay.textContent = shortCode;
    statusText.textContent = `⏳ Sala criada! Peça para o Jogador 2 digitar ${shortCode}`;
  });
});

// Botão: Entrar na Sala (Guest / Jogador 2)
document.getElementById('btn-join-room').addEventListener('click', () => {
  sfx.init();
  sfx.playClick();
  const rawCode = document.getElementById('input-room-code').value;
  const guestStatus = document.getElementById('guest-status-text');
  guestStatus.classList.remove('hidden');
  guestStatus.textContent = '⏳ Conectando à sala...';
  state.mode = 'guest';
  net.joinRoom(rawCode);
});

document.getElementById('btn-cancel-online').addEventListener('click', () => {
  sfx.playClick();
  returnToMenu();
});

// Botão: Continuar direto da Fase 2 (ou minijogo atual) na tela "BATATINHA!"
document.getElementById('btn-continue-phase').addEventListener('click', () => {
  sfx.playClick();
  const activeMg = progression.activeMinigame;
  const targetStageId = activeMg ? activeMg.id : (progression.currentStageId || 'phase2');
  if (state.mode === 'guest') {
    net.send({ type: 'request_continue_phase', stageId: targetStageId });
  } else {
    startStageById(targetStageId, false);
  }
});

// Botão: Tentar Novamente (Reiniciar da Fase 1) na tela "BATATINHA!"
document.getElementById('btn-retry').addEventListener('click', () => {
  sfx.playClick();
  progression.activeMinigame = null;
  if (state.mode === 'guest') {
    net.send({ type: 'request_retry' });
  } else {
    startPhase1(false);
  }
});

// Botão: Jogar Novamente na tela de Vitória
document.getElementById('btn-play-again').addEventListener('click', () => {
  sfx.playClick();
  if (progression.activeMinigame) {
    const currentMgId = progression.activeMinigame.id;
    if (state.mode === 'guest') {
      net.send({ type: 'request_continue_phase', stageId: currentMgId });
    } else {
      startStageById(currentMgId, false);
    }
  } else {
    if (state.mode === 'guest') {
      net.send({ type: 'request_retry' });
    } else {
      startPhase1(false);
    }
  }
});

document.getElementById('btn-batatinha-menu').addEventListener('click', () => {
  sfx.playClick();
  returnToMenu();
});

document.getElementById('btn-victory-menu').addEventListener('click', () => {
  sfx.playClick();
  returnToMenu();
});

document.getElementById('btn-back-menu').addEventListener('click', () => {
  sfx.playClick();
  returnToMenu();
});

// Botões de Mute (HUD e Flutuante)
function updateMuteButtons(isMuted) {
  const icon = isMuted ? '🔇' : '🔊';
  document.getElementById('btn-mute').textContent = icon;
  document.getElementById('btn-mute-floating').textContent = icon;
}

document.getElementById('btn-mute').addEventListener('click', () => {
  updateMuteButtons(sfx.toggleMute());
});

document.getElementById('btn-mute-floating').addEventListener('click', () => {
  updateMuteButtons(sfx.toggleMute());
});


})();
