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
// Totalmente expandido com Arsenal de Armas, Drops de Caixas e Risco Real!
// ============================================================================
const ALL_ROGUE_CARDS = [
  { id: 'bouquet', title: '💐 Espingarda de Buquês', type: 'weapon', desc: 'Dispara 5 flores em leque com dano de dispersão!', icon: '💐' },
  { id: 'rings', title: '💍 Alianças Orbitais', type: 'weapon', desc: 'Anéis de ouro giratórios que fatiam inimigos ao redor!', icon: '💍' },
  { id: 'champagne', title: '🍾 Bomba de Champanhe', type: 'weapon', desc: 'Lança rolhas explosivas periódicas com dano em área!', icon: '🍾' },
  { id: 'laser', title: '⚡ Raio dos Apaixonados', type: 'weapon', desc: 'Feixe de luz perfurante que derrete filas de boletos!', icon: '⚡' },
  { id: 'pen_turbo', title: '🖊️ Caneta Laser Turbo', type: 'weapon', desc: 'Aumenta cadência de tiro em +50% e adiciona tiros duplos!', icon: '🖊️' },
  { id: 'speed', title: '☕ Café Espresso Especial', type: 'stat', desc: '+35% Velocidade de corrida e +20% agilidade do casal!', icon: '☕' },
  { id: 'shield', title: '🛡️ Escudo do Matrimônio', type: 'stat', desc: 'Cria uma barreira sagrada que absorve até 45 de dano!', icon: '🛡️' },
  { id: 'heal', title: '🎂 Bolo de Casamento Real', type: 'stat', desc: 'Recupera +50 de HP e aumenta a vida máxima para 130!', icon: '🎂' }
];

const Minigame2_Roguelite = {
  id: 'mg2_roguelite',
  order: 2,
  title: '2. ROGUELITE COOP: SOBREVIVÊNCIA',
  subtitle: 'Sobrevivam 45s às hordas e coletem Armas e Upgrades!',
  icon: '⚔️',

  onEnter(ctxApi) {
    const { width, height } = ctxApi.getViewport();
    ctxApi.mgState = {
      timeLeft: 45.0,
      nextUpgradeTime: 30.0,
      choosingCard: false,
      offeredCards: [],
      hp: 100,
      maxHp: 100,
      shieldHp: 0,
      speedMult: 1,
      p1: {
        x: width * 0.40,
        y: height * 0.55,
        invulnTimer: 0,
        weapons: { pen: 1 }
      },
      p2: {
        x: width * 0.60,
        y: height * 0.55,
        invulnTimer: 0,
        weapons: { pen: 1 }
      },
      p2Manual: false,
      orbitAngle: 0,
      fireTimers: {
        pen: 0.35,
        bouquet: 0.75,
        champagne: 1.6,
        laser: 1.2
      },
      enemies: [],
      enemyBullets: [],
      bullets: [],
      explosions: [],
      drops: [],
      boss: null,
      bossSpawned: false,
      spawnTimer: 0.5,
      swarmTimer: 4.5,
      totalKills: 0
    };
  },

  openUpgradeCards(ctxApi) {
    const st = ctxApi.mgState;
    if (!st) return;
    st.choosingCard = true;
    const pool = [...ALL_ROGUE_CARDS];
    const picked = [];
    while (picked.length < 3 && pool.length > 0) {
      const idx = Math.floor(Math.random() * pool.length);
      picked.push(pool.splice(idx, 1)[0]);
    }
    st.offeredCards = picked;
    if (ctxApi.sfx?.playAltarFanfare) ctxApi.sfx.playAltarFanfare();
    else if (ctxApi.sfx?.playBounce) ctxApi.sfx.playBounce();
  },

  applyUpgrade(idx, ctxApi) {
    const st = ctxApi.mgState;
    if (!st || !st.choosingCard || !st.offeredCards[idx]) return;
    const card = st.offeredCards[idx];

    if (card.id === 'bouquet' || card.id === 'rings' || card.id === 'champagne' || card.id === 'laser') {
      st.p1.weapons[card.id] = (st.p1.weapons[card.id] || 0) + 1;
      st.p2.weapons[card.id] = (st.p2.weapons[card.id] || 0) + 1;
    } else if (card.id === 'pen_turbo') {
      st.p1.weapons.pen = (st.p1.weapons.pen || 1) + 1;
      st.p2.weapons.pen = (st.p2.weapons.pen || 1) + 1;
      st.fireTimers.pen = Math.max(0.18, st.fireTimers.pen * 0.70);
    } else if (card.id === 'speed') {
      st.speedMult *= 1.35;
    } else if (card.id === 'shield') {
      st.shieldHp = Math.min(60, st.shieldHp + 45);
    } else if (card.id === 'heal') {
      st.maxHp = Math.max(130, st.maxHp + 20);
      st.hp = Math.min(st.maxHp, st.hp + 50);
    }

    st.choosingCard = false;
    ctxApi.floatingText(st.p1.x, st.p1.y - 35, `UPGRADE: ${card.title}!`, '#ffd166');
    ctxApi.confetti(25);
    if (ctxApi.sfx?.playBounce) ctxApi.sfx.playBounce();
  },

  giveRandomWeaponDrop(player, ctxApi) {
    const st = ctxApi.mgState;
    if (!st) return;
    const weaponPool = ['bouquet', 'rings', 'champagne', 'laser', 'pen_turbo'];
    const wId = weaponPool[Math.floor(Math.random() * weaponPool.length)];
    if (wId === 'pen_turbo') {
      player.weapons.pen = (player.weapons.pen || 1) + 1;
      ctxApi.floatingText(player.x, player.y - 30, '🖊️ CANETA TURBO UP!', '#38bdf8');
    } else {
      player.weapons[wId] = (player.weapons[wId] || 0) + 1;
      const card = ALL_ROGUE_CARDS.find(c => c.id === wId);
      ctxApi.floatingText(player.x, player.y - 30, `🎁 NOVA ARMA: ${card ? card.title : wId}!`, '#f59e0b');
    }
    ctxApi.confetti(15);
    if (ctxApi.sfx?.playAltarFanfare) ctxApi.sfx.playAltarFanfare();
    else if (ctxApi.sfx?.playShoot) ctxApi.sfx.playShoot();
  },

  onUpdate(dt, ctxApi) {
    const st = ctxApi.mgState;
    if (!st || st.choosingCard) return;

    const { width, height } = ctxApi.getViewport();
    const keys = ctxApi.getKeys();
    const spd = 220 * st.speedMult;

    // Detecta se P2 assumiu controle manual
    if (keys.p2Left || keys.p2Right || keys.p2Up || keys.p2Down) {
      st.p2Manual = true;
    }

    // 1. Movimento P1 (Noivo)
    if (keys.p1Left) st.p1.x -= spd * dt;
    if (keys.p1Right) st.p1.x += spd * dt;
    if (keys.p1Up) st.p1.y -= spd * dt;
    if (keys.p1Down) st.p1.y += spd * dt;

    // 2. Movimento P2 (Noiva): Manual ou IA inteligente cooperativa
    if (st.p2Manual) {
      if (keys.p2Left) st.p2.x -= spd * dt;
      if (keys.p2Right) st.p2.x += spd * dt;
      if (keys.p2Up) st.p2.y -= spd * dt;
      if (keys.p2Down) st.p2.y += spd * dt;
    } else {
      const targetDist = 70;
      const angle = (st.timeLeft * 0.9);
      const idealX = st.p1.x + Math.cos(angle) * targetDist;
      const idealY = st.p1.y + Math.sin(angle) * targetDist;
      st.p2.x += (idealX - st.p2.x) * 4 * dt;
      st.p2.y += (idealY - st.p2.y) * 4 * dt;
    }

    [st.p1, st.p2].forEach((p) => {
      p.x = Math.max(35, Math.min(width - 35, p.x));
      p.y = Math.max(90, Math.min(height - 40, p.y));
      if (p.invulnTimer > 0) p.invulnTimer -= dt;
    });

    // 3. Tempo e Gatilho de Cartas (a cada 15s)
    st.timeLeft = Math.max(0, st.timeLeft - dt);
    if (st.timeLeft <= 0) {
      ctxApi.victory('O casal sobreviveu a todas as dívidas e parentes no Roguelite!');
      return;
    }

    if (st.timeLeft <= st.nextUpgradeTime && st.nextUpgradeTime > 5) {
      st.nextUpgradeTime -= 15;
      this.openUpgradeCards(ctxApi);
      return;
    }

    // 4. Chefe "O Gerente do Banco" aos 25s restantes
    if (st.timeLeft <= 25.0 && !st.bossSpawned) {
      st.bossSpawned = true;
      st.boss = {
        x: width / 2,
        y: -40,
        targetY: 160,
        hp: 90,
        maxHp: 90,
        spd: 60,
        r: 34,
        shootTimer: 2.0,
        name: 'O GERENTE DO BANCO',
        emoji: '👹'
      };
      ctxApi.floatingText(width / 2, height * 0.35, '⚠️ CHEFE: O GERENTE DO BANCO CHEGOU! ⚠️', '#ef4444');
      if (ctxApi.sfx?.playBatatinha) ctxApi.sfx.playBatatinha();
    }

    // Atualiza Chefe se ativo
    if (st.boss) {
      const b = st.boss;
      if (b.y < b.targetY) b.y += 80 * dt;
      else {
        const midX = (st.p1.x + st.p2.x) / 2;
        const midY = (st.p1.y + st.p2.y) / 2;
        const bAng = Math.atan2(midY - b.y, midX - b.x);
        b.x += Math.cos(bAng) * b.spd * dt;
        b.y += Math.sin(bAng) * b.spd * dt;

        b.shootTimer -= dt;
        if (b.shootTimer <= 0) {
          b.shootTimer = 2.4;
          for (let k = 0; k < 8; k++) {
            const rad = (Math.PI * 2 * k) / 8;
            st.enemyBullets.push({
              x: b.x,
              y: b.y,
              vx: Math.cos(rad) * 160,
              vy: Math.sin(rad) * 160,
              color: '#ef4444',
              emoji: '💸',
              life: 3.5,
              r: 10
            });
          }
          if (ctxApi.sfx?.playShoot) ctxApi.sfx.playShoot();
        }
      }
    }

    // 5. Spawna Hordas Normais e Swarms
    st.spawnTimer -= dt;
    if (st.spawnTimer <= 0) {
      st.spawnTimer = Math.max(0.22, 0.65 - ((45 - st.timeLeft) / 45) * 0.40);
      const side = Math.floor(Math.random() * 4);
      let ex = Math.random() * width;
      let ey = 80;
      if (side === 1) { ex = width + 20; ey = Math.random() * height; }
      if (side === 2) { ex = Math.random() * width; ey = height + 20; }
      if (side === 3) { ex = -20; ey = Math.random() * height; }

      const roll = Math.random();
      let enemyData;
      if (roll < 0.50) {
        enemyData = { emoji: '💸', name: 'Boleto', color: '#ef4444', hp: 1, maxHp: 1, spd: 145, r: 18, type: 'runner' };
      } else if (roll < 0.78) {
        enemyData = { emoji: '📚', name: 'Provas', color: '#3b82f6', hp: 4, maxHp: 4, spd: 85, r: 22, type: 'tank' };
      } else {
        enemyData = { emoji: '👵', name: 'Parente', color: '#a855f7', hp: 3, maxHp: 3, spd: 75, r: 20, type: 'ranged', shootTimer: 1.8 };
      }
      st.enemies.push({ x: ex, y: ey, ...enemyData });
    }

    // Swarm a cada ~5.5s
    st.swarmTimer -= dt;
    if (st.swarmTimer <= 0) {
      st.swarmTimer = 5.5;
      const swarmSide = Math.random() < 0.5 ? -25 : width + 25;
      const baseY = 120 + Math.random() * (height - 240);
      for (let s = 0; s < 5; s++) {
        st.enemies.push({
          x: swarmSide,
          y: baseY + (s - 2) * 24,
          emoji: '💸',
          name: 'Enxame',
          color: '#f97316',
          hp: 1,
          maxHp: 1,
          spd: 160,
          r: 16,
          type: 'runner'
        });
      }
    }

    // 6. ROTAÇÃO DE ALIANÇAS ORBITAIS
    st.orbitAngle += 3.8 * dt;

    // 7. ARMAS DO CASAL: Disparo Automático / Híbrido
    ['p1', 'p2'].forEach((k) => {
      const p = st[k];
      const wMap = p.weapons;

      // 7.1 Caneta Vermelha / Azul
      if (wMap.pen) {
        p.penTimer = (p.penTimer || 0) - dt;
        if (p.penTimer <= 0 && (st.enemies.length > 0 || st.boss)) {
          p.penTimer = st.fireTimers.pen;
          const target = this.findNearestEnemy(p, st);
          if (target) {
            const ang = Math.atan2(target.y - p.y, target.x - p.x);
            const bulletCount = wMap.pen >= 2 ? 2 : 1;
            const spread = 0.15;
            for (let b = 0; b < bulletCount; b++) {
              const off = bulletCount === 2 ? (b === 0 ? -spread : spread) : 0;
              st.bullets.push({
                x: p.x,
                y: p.y - 12,
                vx: Math.cos(ang + off) * 440,
                vy: Math.sin(ang + off) * 440,
                damage: wMap.pen >= 3 ? 2.2 : 1.2,
                color: k === 'p1' ? '#38bdf8' : '#f472b6',
                life: 1.4,
                r: 5,
                kind: 'pen'
              });
            }
          }
        }
      }

      // 7.2 Espingarda de Buquês
      if (wMap.bouquet) {
        p.bouquetTimer = (p.bouquetTimer || 0) - dt;
        if (p.bouquetTimer <= 0 && (st.enemies.length > 0 || st.boss)) {
          p.bouquetTimer = st.fireTimers.bouquet;
          const target = this.findNearestEnemy(p, st);
          if (target) {
            const baseAng = Math.atan2(target.y - p.y, target.x - p.x);
            const count = 5;
            for (let f = 0; f < count; f++) {
              const fAng = baseAng + (f - 2) * 0.16;
              st.bullets.push({
                x: p.x,
                y: p.y - 10,
                vx: Math.cos(fAng) * 380,
                vy: Math.sin(fAng) * 380,
                damage: 1.6,
                color: '#ec4899',
                emoji: '💐',
                life: 0.9,
                r: 8,
                kind: 'bouquet'
              });
            }
            if (ctxApi.sfx?.playShoot) ctxApi.sfx.playShoot();
          }
        }
      }

      // 7.3 Bomba de Champanhe
      if (wMap.champagne) {
        p.champagneTimer = (p.champagneTimer || 0) - dt;
        if (p.champagneTimer <= 0 && (st.enemies.length > 0 || st.boss)) {
          p.champagneTimer = st.fireTimers.champagne;
          const target = this.findNearestEnemy(p, st);
          if (target) {
            const ang = Math.atan2(target.y - p.y, target.x - p.x);
            st.bullets.push({
              x: p.x,
              y: p.y - 15,
              vx: Math.cos(ang) * 290,
              vy: Math.sin(ang) * 290,
              damage: 4.5,
              color: '#fef08a',
              emoji: '🍾',
              life: 1.2,
              r: 10,
              kind: 'champagne'
            });
          }
        }
      }

      // 7.4 Raio dos Apaixonados
      if (wMap.laser) {
        p.laserTimer = (p.laserTimer || 0) - dt;
        if (p.laserTimer <= 0 && (st.enemies.length > 0 || st.boss)) {
          p.laserTimer = st.fireTimers.laser;
          const target = this.findNearestEnemy(p, st);
          if (target) {
            const ang = Math.atan2(target.y - p.y, target.x - p.x);
            st.bullets.push({
              x: p.x,
              y: p.y - 12,
              vx: Math.cos(ang) * 650,
              vy: Math.sin(ang) * 650,
              damage: 3.0,
              piercing: true,
              color: '#a855f7',
              life: 1.5,
              r: 7,
              kind: 'laser'
            });
          }
        }
      }

      // 7.5 Dano por Contato das Alianças Orbitais
      if (wMap.rings) {
        const ringCount = wMap.rings >= 2 ? 4 : 2;
        const ringRad = 62;
        for (let rIdx = 0; rIdx < ringCount; rIdx++) {
          const rAng = st.orbitAngle + (rIdx * (Math.PI * 2 / ringCount));
          const rx = p.x + Math.cos(rAng) * ringRad;
          const ry = p.y + Math.sin(rAng) * ringRad;

          st.enemies.forEach((en) => {
            if (Math.hypot(en.x - rx, en.y - ry) < en.r + 14) {
              en.hp -= 2.5 * dt;
              ctxApi.particles(rx, ry, '#fbbf24', 2, 70);
            }
          });
          if (st.boss && Math.hypot(st.boss.x - rx, st.boss.y - ry) < st.boss.r + 14) {
            st.boss.hp -= 3.0 * dt;
            ctxApi.particles(rx, ry, '#fbbf24', 2, 80);
          }
        }
      }
    });

    // 8. Atualiza Tiros do Casal
    for (let i = st.bullets.length - 1; i >= 0; i--) {
      const b = st.bullets[i];
      b.x += b.vx * dt;
      b.y += b.vy * dt;
      b.life -= dt;
      if (b.life <= 0) {
        if (b.kind === 'champagne') {
          this.triggerExplosion(b.x, b.y, 65, b.damage, ctxApi);
        }
        st.bullets.splice(i, 1);
        continue;
      }

      if (st.boss) {
        if (Math.hypot(st.boss.x - b.x, st.boss.y - b.y) < st.boss.r + b.r) {
          st.boss.hp -= b.damage;
          ctxApi.particles(b.x, b.y, '#f59e0b', 4, 120);
          if (b.kind === 'champagne') {
            this.triggerExplosion(b.x, b.y, 65, b.damage, ctxApi);
          }
          if (!b.piercing) {
            st.bullets.splice(i, 1);
            continue;
          }
        }
      }

      for (let j = st.enemies.length - 1; j >= 0; j--) {
        const en = st.enemies[j];
        if (Math.hypot(en.x - b.x, en.y - b.y) < en.r + b.r) {
          en.hp -= b.damage;
          ctxApi.particles(b.x, b.y, en.color, 4, 110);
          if (b.kind === 'champagne') {
            this.triggerExplosion(b.x, b.y, 65, b.damage, ctxApi);
          }
          if (!b.piercing) {
            st.bullets.splice(i, 1);
            break;
          }
        }
      }
    }

    // Verifica morte do Chefe
    if (st.boss && st.boss.hp <= 0) {
      ctxApi.confetti(50);
      ctxApi.floatingText(st.boss.x, st.boss.y, '🎉 O GERENTE DO BANCO FOI DERROTADO! 🎉', '#ffd166');
      st.drops.push({ x: st.boss.x, y: st.boss.y, type: 'box', life: 18 });
      st.drops.push({ x: st.boss.x - 30, y: st.boss.y, type: 'heart', val: 25, life: 18 });
      st.drops.push({ x: st.boss.x + 30, y: st.boss.y, type: 'heart', val: 25, life: 18 });
      if (ctxApi.sfx?.playAltarFanfare) ctxApi.sfx.playAltarFanfare();
      st.boss = null;
    }

    // 9. Atualiza Inimigos
    for (let i = st.enemies.length - 1; i >= 0; i--) {
      const en = st.enemies[i];

      if (en.hp <= 0) {
        st.totalKills++;
        ctxApi.particles(en.x, en.y, en.color, 12, 150);

        const dRoll = Math.random();
        if (dRoll < 0.12) {
          st.drops.push({ x: en.x, y: en.y, type: 'heart', val: 15, life: 14 });
        } else if (dRoll < 0.22) {
          st.drops.push({ x: en.x, y: en.y, type: 'box', life: 16 });
        }

        st.enemies.splice(i, 1);
        continue;
      }

      const d1 = Math.hypot(st.p1.x - en.x, st.p1.y - en.y);
      const d2 = Math.hypot(st.p2.x - en.x, st.p2.y - en.y);
      const target = d1 <= d2 ? st.p1 : st.p2;
      const targetDist = Math.min(d1, d2);
      const ang = Math.atan2(target.y - en.y, target.x - en.x);

      if (en.type === 'ranged') {
        if (targetDist > 160) {
          en.x += Math.cos(ang) * en.spd * dt;
          en.y += Math.sin(ang) * en.spd * dt;
        } else if (targetDist < 110) {
          en.x -= Math.cos(ang) * (en.spd * 0.6) * dt;
          en.y -= Math.sin(ang) * (en.spd * 0.6) * dt;
        }

        en.shootTimer = (en.shootTimer || 2.0) - dt;
        if (en.shootTimer <= 0) {
          en.shootTimer = 2.4;
          st.enemyBullets.push({
            x: en.x,
            y: en.y,
            vx: Math.cos(ang) * 190,
            vy: Math.sin(ang) * 190,
            color: '#ec4899',
            emoji: '💬',
            life: 3.2,
            r: 9
          });
        }
      } else {
        en.x += Math.cos(ang) * en.spd * dt;
        en.y += Math.sin(ang) * en.spd * dt;
      }

      if (d1 < en.r + 20 && st.p1.invulnTimer <= 0) {
        this.damagePlayer(18, st.p1, ctxApi);
      }
      if (d2 < en.r + 20 && st.p2.invulnTimer <= 0) {
        this.damagePlayer(18, st.p2, ctxApi);
      }
    }

    // 10. Atualiza Projéteis Inimigos
    for (let k = st.enemyBullets.length - 1; k >= 0; k--) {
      const eb = st.enemyBullets[k];
      eb.x += eb.vx * dt;
      eb.y += eb.vy * dt;
      eb.life -= dt;
      if (eb.life <= 0) {
        st.enemyBullets.splice(k, 1);
        continue;
      }

      if (Math.hypot(st.p1.x - eb.x, st.p1.y - eb.y) < eb.r + 18 && st.p1.invulnTimer <= 0) {
        this.damagePlayer(14, st.p1, ctxApi);
        st.enemyBullets.splice(k, 1);
        continue;
      }
      if (Math.hypot(st.p2.x - eb.x, st.p2.y - eb.y) < eb.r + 18 && st.p2.invulnTimer <= 0) {
        this.damagePlayer(14, st.p2, ctxApi);
        st.enemyBullets.splice(k, 1);
        continue;
      }
    }

    // 11. Coleta de Drops na Arena
    for (let d = st.drops.length - 1; d >= 0; d--) {
      const drop = st.drops[d];
      drop.life -= dt;
      if (drop.life <= 0) {
        st.drops.splice(d, 1);
        continue;
      }

      const dist1 = Math.hypot(st.p1.x - drop.x, st.p1.y - drop.y);
      const dist2 = Math.hypot(st.p2.x - drop.x, st.p2.y - drop.y);
      const collector = dist1 < 36 ? st.p1 : dist2 < 36 ? st.p2 : null;

      if (collector) {
        if (drop.type === 'heart') {
          st.hp = Math.min(st.maxHp, st.hp + (drop.val || 15));
          ctxApi.floatingText(drop.x, drop.y - 20, `+${drop.val || 15} HP ❤️`, '#06d6a0');
          if (ctxApi.sfx?.playBounce) ctxApi.sfx.playBounce();
        } else if (drop.type === 'box') {
          this.giveRandomWeaponDrop(collector, ctxApi);
        }
        st.drops.splice(d, 1);
      }
    }

    // 12. Atualiza Explosões Visuais
    for (let ex = st.explosions.length - 1; ex >= 0; ex--) {
      const e = st.explosions[ex];
      e.radius += 120 * dt;
      e.alpha -= 2.2 * dt;
      if (e.alpha <= 0) st.explosions.splice(ex, 1);
    }
  },

  damagePlayer(amount, player, ctxApi) {
    const st = ctxApi.mgState;
    if (!st) return;

    player.invulnTimer = 0.55;
    ctxApi.particles(player.x, player.y, '#ff3355', 14, 180);
    if (ctxApi.sfx?.playBounce) ctxApi.sfx.playBounce();

    if (st.shieldHp > 0) {
      const absorb = Math.min(st.shieldHp, amount);
      st.shieldHp -= absorb;
      amount -= absorb;
      ctxApi.floatingText(player.x, player.y - 35, `ESCUDO -${absorb}!`, '#38bdf8');
    }

    if (amount > 0) {
      st.hp -= amount;
      ctxApi.floatingText(player.x, player.y - 25, `-${amount} HP!`, '#ef4444');
    }

    if (st.hp <= 0) {
      st.hp = 0;
      ctxApi.batatinha('A vida compartilhada do casal foi consumida pelas hordas de boletos no Roguelite!', {
        x: player.x,
        y: player.y,
        r: 45
      });
    }
  },

  triggerExplosion(x, y, radius, damage, ctxApi) {
    const st = ctxApi.mgState;
    if (!st) return;

    st.explosions.push({ x, y, radius: 10, maxRadius: radius, alpha: 1.0 });
    ctxApi.particles(x, y, '#f59e0b', 16, 210);
    if (ctxApi.sfx?.playShoot) ctxApi.sfx.playShoot();

    st.enemies.forEach((en) => {
      if (Math.hypot(en.x - x, en.y - y) <= radius + en.r) {
        en.hp -= damage;
      }
    });
    if (st.boss && Math.hypot(st.boss.x - x, st.boss.y - y) <= radius + st.boss.r) {
      st.boss.hp -= damage;
    }
  },

  findNearestEnemy(p, st) {
    if (st.boss) return st.boss;
    if (st.enemies.length === 0) return null;
    let nearest = st.enemies[0];
    let minDist = Infinity;
    st.enemies.forEach((en) => {
      const d = Math.hypot(en.x - p.x, en.y - p.y);
      if (d < minDist) { minDist = d; nearest = en; }
    });
    return nearest;
  },

  onKeyDown(code, ctxApi) {
    const st = ctxApi.mgState;
    if (!st) return;

    if (st.choosingCard) {
      if (code === 'Digit1' || code === 'KeyA' || code === 'ArrowLeft') this.applyUpgrade(0, ctxApi);
      if (code === 'Digit2' || code === 'KeyW' || code === 'ArrowUp' || code === 'Space') this.applyUpgrade(1, ctxApi);
      if (code === 'Digit3' || code === 'KeyD' || code === 'ArrowRight') this.applyUpgrade(2, ctxApi);
    }
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

    // 1. Piso da Arena
    ctx.fillStyle = '#130d22';
    ctx.fillRect(0, 0, width, height);

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
    ctx.lineWidth = 1;
    const tileSize = 64;
    for (let x = 0; x < width; x += tileSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += tileSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // 2. Drops na Arena
    st.drops.forEach((d) => {
      ctx.save();
      const pulse = 1 + Math.sin(st.timeLeft * 8) * 0.12;
      ctx.translate(d.x, d.y);
      ctx.scale(pulse, pulse);

      ctx.font = '24px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(d.type === 'box' ? '🎁' : '💖', 0, 0);
      ctx.restore();
    });

    // 3. Explosões de Champanhe
    st.explosions.forEach((e) => {
      ctx.save();
      ctx.beginPath();
      ctx.arc(e.x, e.y, e.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(254, 240, 138, ${Math.max(0, e.alpha * 0.4)})`;
      ctx.fill();
      ctx.strokeStyle = `rgba(245, 158, 11, ${Math.max(0, e.alpha)})`;
      ctx.lineWidth = 3;
      ctx.stroke();
      ctx.restore();
    });

    // 4. Inimigos Normais
    st.enemies.forEach((en) => {
      ctx.save();
      ctx.fillStyle = en.color;
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(en.x, en.y, en.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.font = '22px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(en.emoji, en.x, en.y);

      if (en.maxHp > 1) {
        const bw = 32;
        const bh = 5;
        const bx = en.x - bw / 2;
        const by = en.y - en.r - 8;
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(bx, by, bw, bh);
        ctx.fillStyle = '#10b981';
        ctx.fillRect(bx, by, Math.max(0, (bw * en.hp) / en.maxHp), bh);
      }
      ctx.restore();
    });

    // 5. CHEFE: O Gerente do Banco
    if (st.boss) {
      const b = st.boss;
      ctx.save();
      ctx.fillStyle = '#7f1d1d';
      ctx.strokeStyle = '#f87171';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.font = '32px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(b.emoji, b.x, b.y);

      const bossBarW = Math.min(420, width * 0.70);
      const bossBarX = width / 2 - bossBarW / 2;
      const bossBarY = 115;
      ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
      ctx.fillRect(bossBarX, bossBarY, bossBarW, 16);
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(bossBarX, bossBarY, Math.max(0, (bossBarW * b.hp) / b.maxHp), 16);
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.strokeRect(bossBarX, bossBarY, bossBarW, 16);

      ctx.fillStyle = '#ffffff';
      ctx.font = '700 12px Fredoka, sans-serif';
      ctx.fillText(`👹 ${b.name}: ${Math.max(0, Math.round(b.hp))}/${b.maxHp} HP`, width / 2, bossBarY + 12);
      ctx.restore();
    }

    // 6. Projéteis Inimigos
    st.enemyBullets.forEach((eb) => {
      ctx.save();
      ctx.font = '18px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(eb.emoji || '💥', eb.x, eb.y);
      ctx.restore();
    });

    // 7. Projéteis dos Jogadores
    st.bullets.forEach((b) => {
      ctx.save();
      if (b.emoji) {
        ctx.font = '18px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(b.emoji, b.x, b.y);
      } else if (b.kind === 'laser') {
        ctx.fillStyle = '#c084fc';
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillStyle = b.color;
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    });

    // 8. ALIANÇAS ORBITAIS
    ['p1', 'p2'].forEach((k) => {
      const p = st[k];
      if (p.weapons.rings) {
        const ringCount = p.weapons.rings >= 2 ? 4 : 2;
        const ringRad = 62;
        for (let rIdx = 0; rIdx < ringCount; rIdx++) {
          const rAng = st.orbitAngle + (rIdx * (Math.PI * 2 / ringCount));
          const rx = p.x + Math.cos(rAng) * ringRad;
          const ry = p.y + Math.sin(rAng) * ringRad;

          ctx.save();
          ctx.strokeStyle = '#fbbf24';
          ctx.lineWidth = 3.5;
          ctx.beginPath();
          ctx.arc(rx, ry, 9, 0, Math.PI * 2);
          ctx.stroke();

          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(rx, ry, 3, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      }
    });

    // 9. Jogadores (Noivo e Noiva)
    const p1Alpha = st.p1.invulnTimer > 0 ? (Math.sin(st.timeLeft * 30) > 0 ? 0.35 : 1) : 1;
    ctx.save();
    ctx.globalAlpha = p1Alpha;
    ctxApi.drawGroom(st.p1.x, st.p1.y + 15, st.timeLeft * 8, 0.85, true);
    ctx.restore();

    const p2Alpha = st.p2.invulnTimer > 0 ? (Math.sin(st.timeLeft * 30) > 0 ? 0.35 : 1) : 1;
    ctx.save();
    ctx.globalAlpha = p2Alpha;
    ctxApi.drawBride(st.p2.x, st.p2.y + 15, st.timeLeft * 8, 0.85, true);
    ctx.restore();

    // 10. HUD Superior
    const hudW = Math.min(520, width * 0.88);
    const hudX = width / 2 - hudW / 2;
    const hudY = 74;

    ctx.fillStyle = 'rgba(15, 10, 30, 0.85)';
    ctx.strokeStyle = '#6366f1';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(hudX, hudY, hudW, 36, 10);
    ctx.fill();
    ctx.stroke();

    const hpBarW = 180;
    const hpBarX = hudX + 16;
    const hpBarY = hudY + 10;
    ctx.fillStyle = '#374151';
    ctx.fillRect(hpBarX, hpBarY, hpBarW, 16);
    ctx.fillStyle = st.hp > 40 ? '#10b981' : st.hp > 20 ? '#f59e0b' : '#ef4444';
    ctx.fillRect(hpBarX, hpBarY, Math.max(0, (hpBarW * st.hp) / st.maxHp), 16);

    ctx.fillStyle = '#ffffff';
    ctx.font = '700 11px Fredoka, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`❤️ ${Math.max(0, Math.round(st.hp))}/${st.maxHp} HP`, hpBarX + hpBarW / 2, hpBarY + 12);

    if (st.shieldHp > 0) {
      ctx.fillStyle = '#38bdf8';
      ctx.font = '700 11px Fredoka, sans-serif';
      ctx.fillText(`🛡️ ${Math.round(st.shieldHp)}`, hpBarX + hpBarW + 28, hpBarY + 12);
    }

    ctx.fillStyle = '#ffd166';
    ctx.font = '700 13px Fredoka, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(`⏱️ ${st.timeLeft.toFixed(1)}s  |  💀 ${st.totalKills}`, hudX + hudW - 16, hudY + 23);

    // 11. Ícones de Arsenal
    this.drawArsenalIcons(ctx, st, 20, height - 48);

    // 12. Overlay de Cartas de Upgrade
    if (st.choosingCard && st.offeredCards.length > 0) {
      ctx.fillStyle = 'rgba(10, 4, 24, 0.90)';
      ctx.fillRect(0, 0, width, height);

      ctx.fillStyle = '#ffd166';
      ctx.font = '700 24px Fredoka, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('✨ ESCOLHAM UM UPGRADE OU NOVA ARMA! ✨', width / 2, height * 0.22);

      const cardW = Math.min(230, (width - 70) / 3);
      const cardH = 220;
      const gap = 18;
      const startX = width / 2 - (cardW * 3 + gap * 2) / 2;

      st.offeredCards.forEach((c, idx) => {
        const cx = startX + idx * (cardW + gap);
        const cy = height * 0.32;

        ctx.fillStyle = '#24143e';
        ctx.strokeStyle = idx === 0 ? '#38bdf8' : idx === 1 ? '#ffd166' : '#ec4899';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.roundRect(cx, cy, cardW, cardH, 14);
        ctx.fill();
        ctx.stroke();

        ctx.font = '38px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(c.icon || '⚔️', cx + cardW / 2, cy + 50);

        ctx.fillStyle = '#ffffff';
        ctx.font = '700 16px Fredoka, sans-serif';
        ctx.fillText(c.title, cx + cardW / 2, cy + 90);

        ctx.fillStyle = '#cbd5e1';
        ctx.font = '500 13px Fredoka, sans-serif';
        this.wrapCardText(ctx, c.desc, cx + cardW / 2, cy + 125, cardW - 24, 17);

        ctx.fillStyle = '#10b981';
        ctx.font = '700 13px Fredoka, sans-serif';
        ctx.fillText(`[Tecla ${idx + 1} ou Toque]`, cx + cardW / 2, cy + cardH - 18);
      });
    }
  },

  drawArsenalIcons(ctx, st, x, y) {
    const p1w = Object.keys(st.p1.weapons);
    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.70)';
    ctx.strokeStyle = '#4b5563';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(x, y, 220, 36, 8);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#9ca3af';
    ctx.font = '700 11px Fredoka, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('ARSENAL:', x + 8, y + 22);

    const icons = {
      pen: '🖊️',
      bouquet: '💐',
      rings: '💍',
      champagne: '🍾',
      laser: '⚡'
    };

    let ox = x + 72;
    p1w.forEach((wKey) => {
      const ic = icons[wKey] || '⚔️';
      const lvl = st.p1.weapons[wKey];
      ctx.font = '16px sans-serif';
      ctx.fillText(ic, ox, y + 24);
      ctx.font = '700 10px Fredoka, sans-serif';
      ctx.fillStyle = '#ffd166';
      ctx.fillText(`v${lvl}`, ox + 18, y + 23);
      ox += 34;
    });
    ctx.restore();
  },

  wrapCardText(ctx, text, x, y, maxWidth, lineHeight) {
    const words = text.split(' ');
    let line = '';
    let curY = y;
    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + ' ';
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxWidth && n > 0) {
        ctx.fillText(line, x, curY);
        line = words[n] + ' ';
        curY += lineHeight;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, x, curY);
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
// MINIGAME 4: SOLAR WARRIOR (XAIN'D SLEENA ARCADE RUN & GUN)
// Visual 100% Fiel à Imagem de Referência + Dificuldade Arcade Intensa!
// ============================================================================
const Minigame4_Contra = {
  id: 'mg4_contra',
  order: 4,
  title: '4. SOLAR WARRIOR: RESGATE RUN & GUN',
  subtitle: 'Inspirado em Xain\'d Sleena Arcade! Desafio Intenso: Cyber-Pods, Sand Jumpers e Dreadnought!',
  icon: '💥',

  onEnter(ctxApi) {
    const { width, height } = ctxApi.getViewport();
    const groundY = Math.floor(height * 0.73);

    ctxApi.mgState = {
      groundY,
      score: 8700,
      hiScore: 50000,
      timeRemaining: 47.0, // Como na imagem: 0:47
      damageGage: 82,      // Começa com pequeno dano como na barra da imagem
      maxDamageGage: 100,
      lives: 2,            // 2 capacetes no canto como na imagem
      invulnTimer: 0,
      p1: {
        x: Math.floor(width * 0.44), // Posição próxima da pedra central como na foto
        y: groundY,
        vy: 0,
        ducking: false,
        jumping: false,
        fireTimer: 0.1,
        weapon: 'laser',
        runCycle: 0
      },
      p2: {
        x: Math.floor(width * 0.36),
        y: groundY,
        vy: 0,
        ducking: false,
        jumping: false,
        fireTimer: 0.1,
        weapon: 'laser',
        runCycle: 0
      },
      p2Manual: false,
      bullets: [],
      enemyBullets: [],
      bombs: [],
      pods: [],
      jumpers: [],
      powerups: [],
      boss: null,
      bossSpawned: false,
      podSpawnTimer: 0.6,
      jumperSpawnTimer: 1.8,
      muzzleFlash1: 0,
      muzzleFlash2: 0,
      // Rochas alienígenas idênticas à imagem de referência
      rocks: [
        { x: width * 0.22, type: 'stacked_tower', w: 64, h: 108 },
        { x: width * 0.50, type: 'round_mound', w: 88, h: 56 },
        { x: width * 0.31, type: 'foreground_boulder', w: 52, h: 36 }
      ]
    };
  },

  onUpdate(dt, ctxApi) {
    const st = ctxApi.mgState;
    if (!st) return;
    const { width, height } = ctxApi.getViewport();
    st.groundY = Math.floor(height * 0.73);

    const keys = ctxApi.getKeys();
    const gravity = 1580; // Gravidade ágil e rápida de arcade clássico

    // Cronômetro da fase
    st.timeRemaining = Math.max(0, st.timeRemaining - dt);
    if (st.timeRemaining <= 0 && (!st.boss || st.boss.hp <= 0)) {
      ctxApi.confetti(50);
      ctxApi.victory('Missão Solar Warrior Cumprida! O Casal conquistou o planeta alienígena!');
      return;
    }

    if (st.invulnTimer > 0) st.invulnTimer -= dt;
    if (st.muzzleFlash1 > 0) st.muzzleFlash1 -= dt;
    if (st.muzzleFlash2 > 0) st.muzzleFlash2 -= dt;

    // Detecção inteligente de co-op local: se as teclas de P1 e P2 forem usadas juntas
    if ((keys.p1Left || keys.p1Right || keys.p1Up || keys.p1Down) && (keys.p2Left || keys.p2Right || keys.p2Up || keys.p2Down)) {
      st.p2Manual = true;
    }

    // 1. CONTROLE DO JOGADOR 1 (Noivo 1P)
    const p1 = st.p1;
    let p1Move = 0;
    const moveLeft = keys.p1Left || (!st.p2Manual && keys.p2Left);
    const moveRight = keys.p1Right || (!st.p2Manual && keys.p2Right);
    if (moveLeft) { p1.x -= 260 * dt; p1Move = -1; }
    if (moveRight) { p1.x += 260 * dt; p1Move = 1; }
    p1.x = Math.max(40, Math.min(width * 0.70, p1.x));
    if (p1Move !== 0) p1.runCycle += dt * 16;

    p1.ducking = (keys.p1Down || (!st.p2Manual && keys.p2Down)) && !p1.jumping;

    // Salto ágil (W, Cima, ou Espaço)
    const jumpReq1 = keys.p1Up || (!st.p2Manual && (keys.p2Up || keys.p1Jump || keys.p2Jump));
    if (jumpReq1 && !p1.jumping && p1.y >= st.groundY - 2) {
      p1.vy = -640;
      p1.jumping = true;
      if (ctxApi.sfx?.playJump) ctxApi.sfx.playJump(false);
    }
    p1.y += p1.vy * dt;
    p1.vy += gravity * dt;
    if (p1.y >= st.groundY) {
      p1.y = st.groundY;
      p1.vy = 0;
      p1.jumping = false;
    }

    // Disparo Contínuo P1
    p1.fireTimer -= dt;
    if (p1.fireTimer <= 0) {
      p1.fireTimer = p1.weapon === 'spread' ? 0.20 : 0.14;
      this.fireLasers(p1, 'p1', st, ctxApi);
      st.muzzleFlash1 = 0.08;
    }

    // 2. CONTROLE DO JOGADOR 2 (Noiva 2P)
    const p2 = st.p2;
    if (st.p2Manual) {
      let p2Move = 0;
      if (keys.p2Left) { p2.x -= 260 * dt; p2Move = -1; }
      if (keys.p2Right) { p2.x += 260 * dt; p2Move = 1; }
      p2.x = Math.max(40, Math.min(width * 0.70, p2.x));
      if (p2Move !== 0) p2.runCycle += dt * 16;

      p2.ducking = !!keys.p2Down && !p2.jumping;

      if (keys.p2Up && !p2.jumping && p2.y >= st.groundY - 2) {
        p2.vy = -640;
        p2.jumping = true;
        if (ctxApi.sfx?.playJump) ctxApi.sfx.playJump(true);
      }
    } else {
      // IA cooperativa: protege a retaguarda e cobre tiros altos/baixos
      const targetDist = 70;
      const targetX = p1.x - targetDist;
      p2.x += (targetX - p2.x) * 4.5 * dt;
      p2.runCycle = p1.runCycle;
      p2.ducking = p1.ducking;
      if (p1.jumping && !p2.jumping && Math.random() < 0.35) {
        p2.vy = -640;
        p2.jumping = true;
      }
    }

    p2.y += p2.vy * dt;
    p2.vy += gravity * dt;
    if (p2.y >= st.groundY) {
      p2.y = st.groundY;
      p2.vy = 0;
      p2.jumping = false;
    }

    // Disparo Contínuo P2
    p2.fireTimer -= dt;
    if (p2.fireTimer <= 0) {
      p2.fireTimer = p2.weapon === 'spread' ? 0.20 : 0.14;
      this.fireLasers(p2, 'p2', st, ctxApi);
      st.muzzleFlash2 = 0.08;
    }

    // 3. ATUALIZAÇÃO DOS TIROS DOS JOGADORES (LASERS DUPLOS COM AURA VERDE)
    for (let i = st.bullets.length - 1; i >= 0; i--) {
      const b = st.bullets[i];
      b.x += b.vx * dt;
      b.y += b.vy * dt;

      // Colisão com o Boss Dreadnought
      if (st.boss) {
        if (
          b.x >= st.boss.x - st.boss.w / 2 &&
          b.x <= st.boss.x + st.boss.w / 2 &&
          b.y >= st.boss.y - st.boss.h / 2 &&
          b.y <= st.boss.y + st.boss.h / 2
        ) {
          st.boss.hp -= b.dmg;
          st.score += 200;
          ctxApi.particles(b.x, b.y, '#ffd166', 4, 110);
          st.bullets.splice(i, 1);
          if (st.boss.hp <= 0) {
            ctxApi.confetti(60);
            ctxApi.victory('Dreadnought Fortress Alienígena destruído com maestria pelo casal!');
            return;
          }
          continue;
        }
      }

      // Colisão com Cyber-Pods
      let hitPod = false;
      for (let j = st.pods.length - 1; j >= 0; j--) {
        const pod = st.pods[j];
        if (Math.hypot(b.x - pod.x, b.y - pod.y) < pod.r + 15) {
          pod.hp -= b.dmg;
          ctxApi.particles(b.x, b.y, '#f59e0b', 5, 120);
          if (pod.hp <= 0) {
            st.score += 350;
            ctxApi.particles(pod.x, pod.y, '#ef4444', 18, 200);
            if (ctxApi.sfx?.playBounce) ctxApi.sfx.playBounce();
            // Drop de Powerup S / L
            if (Math.random() < 0.32) {
              const kind = Math.random() < 0.5 ? 'spread' : 'laser';
              st.powerups.push({
                x: pod.x,
                y: pod.y,
                vx: -120,
                vy: 0,
                kind,
                label: kind === 'spread' ? 'S' : 'L'
              });
            }
            st.pods.splice(j, 1);
          }
          hitPod = true;
          break;
        }
      }
      if (hitPod) {
        st.bullets.splice(i, 1);
        continue;
      }

      // Colisão com Sand Jumpers
      let hitJumper = false;
      for (let c = st.jumpers.length - 1; c >= 0; c--) {
        const jm = st.jumpers[c];
        if (Math.hypot(b.x - jm.x, b.y - jm.y) < jm.r + 14) {
          st.score += 250;
          ctxApi.particles(jm.x, jm.y, '#a855f7', 14, 180);
          st.jumpers.splice(c, 1);
          hitJumper = true;
          break;
        }
      }
      if (hitJumper) {
        st.bullets.splice(i, 1);
        continue;
      }

      if (b.x > width + 40 || b.x < -30 || b.y < -30 || b.y > height + 30) {
        st.bullets.splice(i, 1);
      }
    }

    // 4. ATUALIZAÇÃO DOS CYBER-PODS FLUTUANTES (PODS EM FORMAÇÃO DUPLA/TRIPLA)
    st.podSpawnTimer -= dt;
    if (st.podSpawnTimer <= 0 && (!st.boss || st.boss.hp > 0)) {
      st.podSpawnTimer = 1.05 + Math.random() * 0.8; // Spawns mais rápidos e agressivos!

      // Spawna em pares ou trios a alturas diferentes (como na foto de referência)
      const count = Math.random() < 0.45 ? 2 : 1;
      for (let p = 0; p < count; p++) {
        const podY = st.groundY - 55 - (p * 50) - Math.random() * 60;
        st.pods.push({
          x: width + 30 + (p * 45),
          y: podY,
          baseY: podY,
          r: 16,
          hp: 2,
          speed: 175 + Math.random() * 55,
          wobble: Math.random() * Math.PI * 2,
          shootTimer: 1.1 + Math.random() * 1.3
        });
      }
    }

    for (let i = st.pods.length - 1; i >= 0; i--) {
      const pod = st.pods[i];
      pod.x -= pod.speed * dt;
      pod.wobble += dt * 4.2;
      pod.y = pod.baseY + Math.sin(pod.wobble) * 22;

      // Disparo do Pod: Projéteis de plasma em direção ao casal
      pod.shootTimer -= dt;
      if (pod.shootTimer <= 0 && pod.x < width - 40 && pod.x > 90) {
        pod.shootTimer = 1.9 + Math.random() * 1.1;
        const target = Math.random() < 0.5 ? st.p1 : st.p2;
        const ang = Math.atan2((target.y - 25) - pod.y, target.x - pod.x);
        st.enemyBullets.push({
          x: pod.x - 14,
          y: pod.y,
          vx: Math.cos(ang) * 330, // Tiros mais velozes!
          vy: Math.sin(ang) * 330,
          r: 7
        });
      }

      // Colisão de contato com o jogador
      if (st.invulnTimer <= 0) {
        const hit1 = Math.hypot(pod.x - p1.x, pod.y - (p1.y - 28)) < pod.r + 20;
        const hit2 = Math.hypot(pod.x - p2.x, pod.y - (p2.y - 28)) < pod.r + 20;
        if (hit1 || hit2) {
          this.applyDamage(25, ctxApi);
        }
      }

      if (pod.x < -40) st.pods.splice(i, 1);
    }

    // 5. ATUALIZAÇÃO DOS SAND JUMPERS (INSETOS QUE SALTAM EM VOCÊ!)
    st.jumperSpawnTimer -= dt;
    if (st.jumperSpawnTimer <= 0 && (!st.boss || st.boss.hp > 0)) {
      st.jumperSpawnTimer = 2.1 + Math.random() * 1.6;
      st.jumpers.push({
        x: width + 25,
        y: st.groundY - 14,
        vy: 0,
        speed: 210 + Math.random() * 60,
        r: 15,
        hasLeaped: false
      });
    }

    for (let c = st.jumpers.length - 1; c >= 0; c--) {
      const jm = st.jumpers[c];
      jm.x -= jm.speed * dt;

      // Salto repentino quando se aproxima do jogador
      const distToP1 = Math.abs(jm.x - p1.x);
      if (!jm.hasLeaped && distToP1 < 170 && distToP1 > 80 && Math.random() < 0.7) {
        jm.hasLeaped = true;
        jm.vy = -490;
        if (ctxApi.sfx?.playBounce) ctxApi.sfx.playBounce();
      }

      jm.y += jm.vy * dt;
      jm.vy += gravity * dt;
      if (jm.y >= st.groundY - 14) {
        jm.y = st.groundY - 14;
        jm.vy = 0;
      }

      if (st.invulnTimer <= 0) {
        const hit1 = Math.hypot(jm.x - p1.x, jm.y - (p1.y - 20)) < jm.r + 18;
        const hit2 = Math.hypot(jm.x - p2.x, jm.y - (p2.y - 20)) < jm.r + 18;
        if (hit1 || hit2) {
          this.applyDamage(22, ctxApi);
        }
      }

      if (jm.x < -30) st.jumpers.splice(c, 1);
    }

    // 6. ATUALIZAÇÃO DOS TIROS INIMIGOS DE PLASMA
    for (let k = st.enemyBullets.length - 1; k >= 0; k--) {
      const eb = st.enemyBullets[k];
      eb.x += eb.vx * dt;
      eb.y += eb.vy * dt;

      if (st.invulnTimer <= 0) {
        const hit1 = Math.hypot(eb.x - p1.x, eb.y - (p1.y - (p1.ducking ? 14 : 28))) < eb.r + 16;
        const hit2 = Math.hypot(eb.x - p2.x, eb.y - (p2.y - (p2.ducking ? 14 : 28))) < eb.r + 16;
        if (hit1 || hit2) {
          this.applyDamage(20, ctxApi);
          st.enemyBullets.splice(k, 1);
          continue;
        }
      }

      if (eb.x < -30 || eb.x > width + 30 || eb.y > st.groundY + 12 || eb.y < -30) {
        st.enemyBullets.splice(k, 1);
      }
    }

    // 7. POWER-UPS [S] E [L]
    for (let p = st.powerups.length - 1; p >= 0; p--) {
      const pw = st.powerups[p];
      pw.x += pw.vx * dt;

      const pick1 = Math.hypot(pw.x - p1.x, pw.y - (p1.y - 25)) < 32;
      const pick2 = Math.hypot(pw.x - p2.x, pw.y - (p2.y - 25)) < 32;
      if (pick1 || pick2) {
        p1.weapon = pw.kind;
        p2.weapon = pw.kind;
        ctxApi.confetti(20);
        if (ctxApi.sfx?.playAltarFanfare) ctxApi.sfx.playAltarFanfare();
        ctxApi.floatingText(pw.x, pw.y - 30, `ARMA [${pw.label}] ATIVADA!`, '#ffd166');
        st.powerups.splice(p, 1);
        continue;
      }
      if (pw.x < -30) st.powerups.splice(p, 1);
    }

    // 8. CHEFE FINAL: DREADNOUGHT FORTRESS (SURGE AOS 20s FINAIS)
    if (st.timeRemaining <= 20.0 && !st.bossSpawned) {
      st.bossSpawned = true;
      st.boss = {
        x: width + 90,
        targetX: width - 120,
        y: st.groundY - 115,
        w: 125,
        h: 135,
        hp: 160,
        maxHp: 160,
        shootTimer: 1.6
      };
      ctxApi.floatingText(width / 2, height * 0.35, '⚠️ ALERTA MÁXIMO: DREADNOUGHT FORTRESS! ⚠️', '#ef4444');
      if (ctxApi.sfx?.playBatatinha) ctxApi.sfx.playBatatinha();
    }

    if (st.boss) {
      const b = st.boss;
      if (b.x > b.targetX) b.x -= 75 * dt;
      b.y = (st.groundY - 115) + Math.sin(ctxApi.getTime() * 2.4) * 60;

      b.shootTimer -= dt;
      if (b.shootTimer <= 0) {
        b.shootTimer = 1.5;
        // Rajada quádrupla de plasma com dispersão pesada!
        [-0.30, -0.10, 0.10, 0.30].forEach((off) => {
          st.enemyBullets.push({
            x: b.x - b.w / 2,
            y: b.y + 12,
            vx: -350,
            vy: Math.sin(off) * 260,
            r: 9
          });
        });
        if (ctxApi.sfx?.playShoot) ctxApi.sfx.playShoot();
      }
    }
  },

  fireLasers(p, who, st, ctxApi) {
    const gunY = p.ducking ? p.y - 14 : p.y - 32;
    const gunX = p.x + 24;

    if (p.weapon === 'spread') {
      [-0.18, 0, 0.18].forEach((ang) => {
        st.bullets.push({
          x: gunX,
          y: gunY,
          vx: Math.cos(ang) * 660,
          vy: Math.sin(ang) * 660,
          dmg: 2.2,
          kind: 'spread',
          color: who === 'p1' ? '#38bdf8' : '#ec4899'
        });
      });
    } else {
      // Lasers Duplos Exatos da Imagem: Feixes brancos com halo verde/ciano (--  --)
      st.bullets.push({
        x: gunX,
        y: gunY - 2,
        vx: 780,
        vy: 0,
        dmg: 2.0,
        kind: 'laser',
        color: '#ffffff',
        glow: '#22c55e'
      });
      st.bullets.push({
        x: gunX + 28,
        y: gunY - 2,
        vx: 780,
        vy: 0,
        dmg: 2.0,
        kind: 'laser',
        color: '#ffffff',
        glow: '#22c55e'
      });
    }
    if (ctxApi.sfx?.playShoot) ctxApi.sfx.playShoot();
  },

  applyDamage(amount, ctxApi) {
    const st = ctxApi.mgState;
    if (!st || st.invulnTimer > 0) return;

    st.damageGage -= amount;
    st.invulnTimer = 0.65;
    if (ctxApi.sfx?.playBounce) ctxApi.sfx.playBounce();
    ctxApi.particles(st.p1.x, st.p1.y - 25, '#ef4444', 16, 200);

    if (st.damageGage <= 0) {
      st.lives--;
      if (st.lives > 0) {
        st.damageGage = st.maxDamageGage;
        ctxApi.floatingText(st.p1.x, st.p1.y - 50, `VIDA PERDIDA! RESTAM ${st.lives}`, '#ffd166');
      } else {
        st.damageGage = 0;
        ctxApi.batatinha('O casal foi aniquilado no planeta alienígena do Solar Warrior!', {
          x: st.p1.x,
          y: st.p1.y - 25,
          r: 50
        });
      }
    }
  },

  onKeyDown(code, ctxApi) {
    const st = ctxApi.mgState;
    if (!st) return;

    if ((code === 'KeyW' || code === 'Space' || (!st.p2Manual && code === 'ArrowUp')) && !st.p1.jumping && st.p1.y >= st.groundY - 2) {
      st.p1.vy = -640;
      st.p1.jumping = true;
      if (ctxApi.sfx?.playJump) ctxApi.sfx.playJump(false);
    }
    if ((code === 'ArrowUp' || (st.p2Manual && code === 'Space')) && !st.p2.jumping && st.p2.y >= st.groundY - 2) {
      st.p2.vy = -640;
      st.p2.jumping = true;
      if (ctxApi.sfx?.playJump) ctxApi.sfx.playJump(true);
    }
  },

  onRender(ctx, ctxApi) {
    const st = ctxApi.mgState;
    if (!st) return;
    const { width, height } = ctxApi.getViewport();

    // 1. CÉU ALIENÍGENA COM SCANLINES (GRADIENTE IDÊNTICO À FOTO DE REFERÊNCIA)
    const skyGrad = ctx.createLinearGradient(0, 0, 0, st.groundY);
    skyGrad.addColorStop(0, '#2c3c54');
    skyGrad.addColorStop(0.35, '#445b77');
    skyGrad.addColorStop(0.75, '#6e8a9d');
    skyGrad.addColorStop(1, '#8aaab8');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, width, st.groundY);

    // 2. DUAS LUAS COM CRATERAS (EXATAMENTE COMO NA FOTO)
    // Lua Grande com Brilho Violeta
    const moon1X = width * 0.64;
    const moon1Y = height * 0.22;
    const moon1R = 48;

    ctx.save();
    ctx.shadowBlur = 24;
    ctx.shadowColor = 'rgba(216, 200, 235, 0.55)';
    ctx.fillStyle = '#dcd0ec';
    ctx.beginPath();
    ctx.arc(moon1X, moon1Y, moon1R, 0, Math.PI * 2);
    ctx.fill();

    // Textura e crateras esféricas
    ctx.fillStyle = '#bda8d6';
    [
      { ox: -14, oy: -10, r: 10 },
      { ox: 16, oy: -16, r: 8 },
      { ox: 8, oy: 15, r: 13 },
      { ox: -20, oy: 18, r: 7 },
      { ox: 22, oy: 6, r: 6 }
    ].forEach((c) => {
      ctx.beginPath();
      ctx.arc(moon1X + c.ox, moon1Y + c.oy, c.r, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.restore();

    // Lua Pequena (Superior Direita)
    const moon2X = width * 0.81;
    const moon2Y = height * 0.11;
    const moon2R = 21;

    ctx.save();
    ctx.shadowBlur = 14;
    ctx.shadowColor = 'rgba(205, 218, 245, 0.5)';
    ctx.fillStyle = '#cad6f2';
    ctx.beginPath();
    ctx.arc(moon2X, moon2Y, moon2R, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#a6b8de';
    ctx.beginPath();
    ctx.arc(moon2X - 4, moon2Y - 4, 5, 0, Math.PI * 2);
    ctx.arc(moon2X + 5, moon2Y + 4, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // 3. MONTANHAS / DUNAS DE TERRACOTA NO HORIZONTE
    ctx.save();
    // Camada distante
    ctx.fillStyle = '#8a523d';
    ctx.beginPath();
    ctx.moveTo(0, st.groundY);
    for (let x = 0; x <= width; x += 30) {
      const my = (st.groundY - 50) + Math.sin(x * 0.009) * 20 + Math.cos(x * 0.02) * 12;
      ctx.lineTo(x, my);
    }
    ctx.lineTo(width, st.groundY);
    ctx.closePath();
    ctx.fill();

    // Camada intermediária com crista iluminada
    ctx.fillStyle = '#a6674c';
    ctx.beginPath();
    ctx.moveTo(0, st.groundY);
    for (let x = 0; x <= width; x += 25) {
      const my = (st.groundY - 28) + Math.sin(x * 0.016 + 1.2) * 14 + Math.cos(x * 0.035) * 8;
      ctx.lineTo(x, my);
    }
    ctx.lineTo(width, st.groundY);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // 4. CHÃO DE AREIA DO DESERTO COM RASTERIZAÇÃO HORIZONTAL
    ctx.fillStyle = '#b77755';
    ctx.fillRect(0, st.groundY, width, height - st.groundY);

    // Linhas finas de scanline no solo de areia
    ctx.fillStyle = '#9c5e40';
    for (let y = st.groundY; y < height; y += 8) {
      ctx.fillRect(0, y, width, 2);
    }
    ctx.fillStyle = '#c98865';
    for (let y = st.groundY + 4; y < height; y += 8) {
      ctx.fillRect(0, y, width, 1.5);
    }

    // 5. ROCHAS DE CALCÁRIO BRANCAS COM SOMBRA PÚRPURA DIAGONAL (IDÊNTICAS À FOTO)
    st.rocks.forEach((rk) => {
      this.drawLimestoneRock(ctx, rk.x, st.groundY, rk.w, rk.h, rk.type);
    });

    // 6. POWER-UPS [S] e [L]
    st.powerups.forEach((pw) => {
      ctx.save();
      ctx.fillStyle = pw.kind === 'spread' ? '#ef4444' : '#38bdf8';
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(pw.x, pw.y, 16, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.font = '700 14px "Press Start 2P", monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(pw.label, pw.x, pw.y + 1);
      ctx.restore();
    });

    // 7. CYBER-PODS METÁLICOS FLUTUANTES (IGUAIS AOS DA IMAGEM)
    st.pods.forEach((pod) => {
      this.drawCyberPod(ctx, pod.x, pod.y, pod.r);
    });

    // 8. SAND JUMPERS (INSETOS ALIENÍGENAS)
    st.jumpers.forEach((jm) => {
      ctx.save();
      ctx.fillStyle = '#7e22ce';
      ctx.beginPath();
      ctx.arc(jm.x, jm.y - 6, jm.r, Math.PI, 0);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Olhos
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(jm.x - 5, jm.y - 8, 3, 0, Math.PI * 2);
      ctx.arc(jm.x + 3, jm.y - 8, 3, 0, Math.PI * 2);
      ctx.fill();

      // Patas
      ctx.strokeStyle = '#581c87';
      ctx.lineWidth = 2.5;
      [-8, 0, 8].forEach((lx) => {
        ctx.beginPath();
        ctx.moveTo(jm.x + lx, jm.y - 2);
        ctx.lineTo(jm.x + lx - 4, jm.y + 8);
        ctx.stroke();
      });
      ctx.restore();
    });

    // 9. TIROS INIMIGOS (Esferas de Plasma Vermelho)
    st.enemyBullets.forEach((eb) => {
      ctx.save();
      ctx.shadowBlur = 10;
      ctx.shadowColor = '#ef4444';
      ctx.fillStyle = '#f87171';
      ctx.beginPath();
      ctx.arc(eb.x, eb.y, eb.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(eb.x, eb.y, eb.r * 0.45, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });

    // 10. TIROS DOS JOGADORES (LASERS DUPLOS HORIZONTAIS COM AURA VERDE -- --)
    st.bullets.forEach((b) => {
      ctx.save();
      ctx.shadowBlur = 10;
      ctx.shadowColor = b.glow || '#22c55e';

      // Halo verde externo
      ctx.fillStyle = b.glow || '#22c55e';
      ctx.beginPath();
      ctx.roundRect(b.x - 14, b.y - 4, 28, 8, 4);
      ctx.fill();

      // Feixe central branco brilhante
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.roundRect(b.x - 11, b.y - 2, 22, 4, 2);
      ctx.fill();
      ctx.restore();
    });

    // 11. PERSONAGENS (SOLDIER COMMANDO COM ARMADURA DA FOTO)
    const p1Alpha = st.invulnTimer > 0 && Math.sin(ctxApi.getTime() * 30) > 0 ? 0.35 : 1;
    ctx.save();
    ctx.globalAlpha = p1Alpha;
    this.drawSpaceSoldier(ctx, st.p1, 'noivo');
    ctx.restore();

    ctx.save();
    ctx.globalAlpha = p1Alpha;
    this.drawSpaceSoldier(ctx, st.p2, 'noiva');
    ctx.restore();

    // Muzzle Flash com labareda curva laranja/amarela (como na arma da foto)
    if (st.muzzleFlash1 > 0) this.drawArcadeMuzzleFlash(ctx, st.p1.x + 30, st.p1.ducking ? st.p1.y - 14 : st.p1.y - 32);
    if (st.muzzleFlash2 > 0) this.drawArcadeMuzzleFlash(ctx, st.p2.x + 30, st.p2.ducking ? st.p2.y - 14 : st.p2.y - 32);

    // 12. BOSS DREADNOUGHT
    if (st.boss) {
      this.drawBossDreadnought(ctx, st.boss);
    }

    // 13. HUD ARCADE IDÊNTICO À IMAGEM DE REFERÊNCIA
    this.drawExactArcadeHUD(ctx, st, width, height);

    // 14. EFEITO SUAVE DE SCANLINES CRT ARCADE
    this.drawCRTScanlines(ctx, width, height);
  },

  drawLimestoneRock(ctx, x, y, w, h, type) {
    ctx.save();
    // Sombra diagonal azul-púrpura no chão (exata da imagem)
    ctx.fillStyle = 'rgba(68, 50, 80, 0.75)';
    ctx.beginPath();
    ctx.ellipse(x + w * 0.30, y + 6, w * 0.65, 8, -0.05, 0, Math.PI * 2);
    ctx.fill();

    if (type === 'stacked_tower') {
      // Rocha da esquerda: Coluna alta de segmentos empilhados bulbosos
      ctx.fillStyle = '#f4ece1';
      ctx.strokeStyle = '#6e5645';
      ctx.lineWidth = 2.5;

      // Segmento Base
      ctx.beginPath();
      ctx.ellipse(x, y - 22, w * 0.46, 24, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Segmento Central
      ctx.beginPath();
      ctx.ellipse(x, y - 56, w * 0.40, 22, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Segmento Topo
      ctx.beginPath();
      ctx.ellipse(x, y - 86, w * 0.34, 20, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Luz branca especular
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.ellipse(x - 8, y - 88, 12, 10, 0, 0, Math.PI * 2);
      ctx.fill();
    } else if (type === 'round_mound') {
      // Rocha do meio: Módulo arredondado suave onde o soldado se apoia
      ctx.fillStyle = '#f4ece1';
      ctx.strokeStyle = '#6e5645';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(x, y - h * 0.45, w * 0.46, Math.PI, 0);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(x - w * 0.16, y - h * 0.58, w * 0.18, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Rocha do primeiro plano: Pequeno rochedo arredondado
      ctx.fillStyle = '#f4ece1';
      ctx.strokeStyle = '#6e5645';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(x, y - h * 0.42, w * 0.44, Math.PI, 0);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }
    ctx.restore();
  },

  drawCyberPod(ctx, x, y, r) {
    ctx.save();
    // Sombra sutil no chão
    ctx.fillStyle = 'rgba(68, 50, 80, 0.4)';
    ctx.beginPath();
    ctx.ellipse(x, y + 48, r * 0.85, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    // Cápsula Metálica Cilíndrica Bronze/Aço Escuro
    const podGrad = ctx.createLinearGradient(x - r, y, x + r, y);
    podGrad.addColorStop(0, '#221d1b');
    podGrad.addColorStop(0.3, '#685c52');
    podGrad.addColorStop(0.7, '#968679');
    podGrad.addColorStop(1, '#221d1b');

    ctx.fillStyle = podGrad;
    ctx.strokeStyle = '#120f0d';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(x - r, y - r * 1.3, r * 2, r * 2.6, 7);
    ctx.fill();
    ctx.stroke();

    // 3 Fendas Horizontais Vermelhas (Como na foto de referência)
    ctx.fillStyle = '#ef4444';
    ctx.shadowBlur = 8;
    ctx.shadowColor = '#ef4444';
    [-r * 0.6, 0, r * 0.6].forEach((oy) => {
      ctx.fillRect(x - r * 0.65, y + oy - 1.5, r * 1.3, 3);
    });
    ctx.restore();
  },

  drawSpaceSoldier(ctx, p, role) {
    ctx.save();
    const isP1 = role === 'noivo';
    const mainColor = isP1 ? '#dc2626' : '#ec4899';
    const darkArmor = isP1 ? '#7f1d1d' : '#831843';
    const visorColor = '#38bdf8'; // Visor azul da foto

    const sx = p.x;
    const sy = p.y;
    const isDucking = p.ducking;

    // Sombra oval no chão
    ctx.fillStyle = 'rgba(68, 50, 80, 0.75)';
    ctx.beginPath();
    ctx.ellipse(sx, sy, isDucking ? 26 : 20, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    if (isDucking) {
      // Pose Agachada
      ctx.fillStyle = darkArmor;
      ctx.fillRect(sx - 16, sy - 14, 30, 14);

      ctx.fillStyle = mainColor;
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(sx - 12, sy - 28, 24, 18, 5);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = mainColor;
      ctx.beginPath();
      ctx.arc(sx, sy - 34, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = visorColor;
      ctx.fillRect(sx + 1, sy - 37, 8, 6);

      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(sx + 4, sy - 22, 28, 7);
      ctx.fillStyle = '#334155';
      ctx.fillRect(sx + 14, sy - 24, 8, 3);
    } else {
      // Pose em Pé / Correndo (Exata do Soldado da Foto)
      const legAnim = Math.sin(p.runCycle) * 8;

      // Botas brancas/cinza com grevas vermelhas
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(sx - 9 + legAnim, sy - 18, 8, 18);
      ctx.fillRect(sx + 1 - legAnim, sy - 18, 8, 18);
      ctx.fillStyle = mainColor;
      ctx.fillRect(sx - 10 + legAnim, sy - 12, 9, 8);
      ctx.fillRect(sx + legAnim, sy - 12, 9, 8);
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(sx - 10 + legAnim, sy - 4, 10, 5);
      ctx.fillRect(sx + legAnim, sy - 4, 10, 5);

      // Peitoral Vermelho com Ombreiras
      ctx.fillStyle = mainColor;
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(sx - 12, sy - 40, 24, 24, 5);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = darkArmor;
      ctx.beginPath();
      ctx.arc(sx - 11, sy - 36, 6, 0, Math.PI * 2);
      ctx.arc(sx + 11, sy - 36, 6, 0, Math.PI * 2);
      ctx.fill();

      // Capacete com Crista Superior e Visor Azul
      ctx.fillStyle = mainColor;
      ctx.beginPath();
      ctx.arc(sx, sy - 48, 11, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Crista superior
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(sx - 2, sy - 60, 4, 4);

      // Visor Azul Ciano Tecnológico
      ctx.fillStyle = visorColor;
      ctx.shadowBlur = 6;
      ctx.shadowColor = visorColor;
      ctx.fillRect(sx + 2, sy - 52, 9, 7);
      ctx.shadowBlur = 0;

      // Rifle Laser Branco e Preto segurado com as duas mãos
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(sx + 2, sy - 36, 28, 8);
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(sx + 6, sy - 39, 14, 4);
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(sx + 26, sy - 38, 3, 2);
    }

    ctx.font = '700 11px Fredoka, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(isP1 ? 'NOIVO 1P' : 'NOIVA 2P', sx, isDucking ? sy - 48 : sy - 64);
    ctx.restore();
  },

  drawArcadeMuzzleFlash(ctx, x, y) {
    ctx.save();
    // Labareda curva laranja/amarela (como na arma da foto)
    ctx.shadowBlur = 16;
    ctx.shadowColor = '#f59e0b';
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.arc(x + 2, y, 11, -Math.PI / 2, Math.PI / 2);
    ctx.fill();

    ctx.fillStyle = '#fef08a';
    ctx.beginPath();
    ctx.arc(x + 1, y, 6, -Math.PI / 2, Math.PI / 2);
    ctx.fill();
    ctx.restore();
  },

  drawBossDreadnought(ctx, b) {
    ctx.save();
    ctx.translate(b.x, b.y);

    // Casco da Fortaleza Alienígena
    ctx.fillStyle = '#4c0519';
    ctx.strokeStyle = '#fda4af';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.roundRect(-b.w / 2, -b.h / 2, b.w, b.h, 16);
    ctx.fill();
    ctx.stroke();

    // Núcleo de Energia
    ctx.fillStyle = '#ef4444';
    ctx.shadowBlur = 20;
    ctx.shadowColor = '#ef4444';
    ctx.beginPath();
    ctx.arc(0, 0, 26, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Canhões Laser Duplos
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(-b.w / 2 - 16, -32, 18, 10);
    ctx.fillRect(-b.w / 2 - 16, 22, 18, 10);

    // Barra de Vida do Boss
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(-b.w / 2, -b.h / 2 - 20, b.w, 12);
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(-b.w / 2, -b.h / 2 - 20, Math.max(0, (b.w * b.hp) / b.maxHp), 12);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(-b.w / 2, -b.h / 2 - 20, b.w, 12);

    ctx.restore();
  },

  drawExactArcadeHUD(ctx, st, width, height) {
    ctx.save();
    ctx.textBaseline = 'top';

    // 1. PRIMEIRA LINHA: 1P    8700     DAMAGE GAGE (EM DUAS LINHAS)     HI    50000
    // 1P em ciano vibrante
    ctx.font = '700 17px "Press Start 2P", monospace, sans-serif';
    ctx.fillStyle = '#38bdf8';
    ctx.textAlign = 'left';
    ctx.fillText('1P', 28, 70);

    // Pontuação em ciano
    ctx.fillStyle = '#38bdf8';
    ctx.fillText(`${st.score}`, 110, 70);

    // HI 50000 no canto direito
    ctx.fillStyle = '#4ade80';
    ctx.textAlign = 'right';
    ctx.fillText('HI', width - 150, 70);
    ctx.fillStyle = '#38bdf8';
    ctx.fillText(`${st.hiScore}`, width - 28, 70);

    // DAMAGE (Linha 1) e GAGE (Linha 2) centralizados em amarelo com borda laranja
    ctx.textAlign = 'center';
    ctx.font = '700 15px "Press Start 2P", monospace, sans-serif';
    ctx.fillStyle = '#facc15';
    ctx.fillText('DAMAGE', width / 2, 66);
    ctx.fillText('GAGE', width / 2, 84);

    // Barra DAMAGE GAGE: Vermelha sólida com fundo preto como na foto
    const barW = 180;
    const barH = 13;
    const barX = width / 2 - barW / 2;
    const barY = 104;

    ctx.fillStyle = '#000000';
    ctx.fillRect(barX, barY, barW, barH);
    ctx.fillStyle = '#ef4444';
    const gageRatio = Math.max(0, st.damageGage / st.maxDamageGage);
    ctx.fillRect(barX, barY, barW * gageRatio, barH);

    // 2. SEGUNDA LINHA: TIME    0:47
    ctx.textAlign = 'left';
    ctx.font = '700 16px "Press Start 2P", monospace, sans-serif';
    ctx.fillStyle = '#4ade80';
    ctx.fillText('TIME', 28, 96);
    ctx.fillStyle = '#ffffff';
    const sec = Math.ceil(st.timeRemaining);
    const timeStr = `0:${sec < 10 ? '0' : ''}${sec}`;
    ctx.fillText(timeStr, 110, 96);

    // 3. CANTO INFERIOR ESQUERDO: VIDAS RESTANTES (2 Capacetes como na imagem)
    const botY = height - 42;
    for (let l = 0; l < st.lives; l++) {
      const hx = 28 + l * 34;
      ctx.fillStyle = '#dc2626';
      ctx.beginPath();
      ctx.arc(hx + 12, botY + 12, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(hx + 14, botY + 8, 6, 6);
    }

    ctx.restore();
  },

  drawCRTScanlines(ctx, width, height) {
    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.12)';
    for (let y = 0; y < height; y += 4) {
      ctx.fillRect(0, y, width, 1.5);
    }
    ctx.restore();
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
// MINIGAME 7: FLAPPY DUPLO (4 NÍVEIS PROGRESSIVOS DE VOO DOS NOIVOS)
// ============================================================================
const FLAPPY_LEVELS = [
  {
    level: 1,
    name: 'Nível 1: Jardim do Altar',
    goalPipes: 10,
    speed: 210,
    spawnInterval: 2.0,
    gapRatio: 0.34,
    minGap: 155,
    moveAmp: 0,
    bgTop: '#1e1b4b',
    bgBot: '#312e81',
    pipeColor: '#f43f5e'
  },
  {
    level: 2,
    name: 'Nível 2: Ventania dos Primos',
    goalPipes: 12,
    speed: 255,
    spawnInterval: 1.75,
    gapRatio: 0.31,
    minGap: 142,
    moveAmp: 34,
    bgTop: '#4c1d95',
    bgBot: '#be185d',
    pipeColor: '#ec4899'
  },
  {
    level: 3,
    name: 'Nível 3: Tempestade de Boletos',
    goalPipes: 15,
    speed: 295,
    spawnInterval: 1.55,
    gapRatio: 0.29,
    minGap: 132,
    moveAmp: 52,
    bgTop: '#0f172a',
    bgBot: '#1e3a8a',
    pipeColor: '#8b5cf6'
  },
  {
    level: 4,
    name: 'Nível 4: Lua de Mel Turbinada',
    goalPipes: 18,
    speed: 335,
    spawnInterval: 1.38,
    gapRatio: 0.27,
    minGap: 124,
    moveAmp: 68,
    bgTop: '#3b0764',
    bgBot: '#b45309',
    pipeColor: '#f59e0b'
  }
];

const Minigame7_Flappy = {
  id: 'mg7_flappy',
  order: 7,
  title: '7. FLAPPY DUPLO: VOO DOS NOIVOS',
  subtitle: '4 Níveis! Passem pelas colunas floridas sem bater! [W] = Noivo | [⬆️/Espaço] = Noiva',
  icon: '🕊️',

  onEnter(ctxApi) {
    const { height } = ctxApi.getViewport();
    ctxApi.mgState = {
      selectingLevel: true,
      levelIdx: 0,
      levelCfg: FLAPPY_LEVELS[0],
      passedCount: 0,
      spawnedCount: 0,
      goalPipes: FLAPPY_LEVELS[0].goalPipes,
      p1: { y: height * 0.42, vy: 0 },
      p2: { y: height * 0.58, vy: 0 },
      pipes: [],
      spawnTimer: 0.45,
      levelTransitionTimer: 0,
      finished: false,
      levelBtns: []
    };
  },

  startLevel(idx, ctxApi) {
    const st = ctxApi.mgState;
    if (!st) return;
    const { height } = ctxApi.getViewport();
    const safeIdx = Math.max(0, Math.min(FLAPPY_LEVELS.length - 1, idx));
    const cfg = FLAPPY_LEVELS[safeIdx];
    st.selectingLevel = false;
    st.levelIdx = safeIdx;
    st.levelCfg = cfg;
    st.passedCount = 0;
    st.spawnedCount = 0;
    st.goalPipes = cfg.goalPipes;
    st.p1 = { y: height * 0.42, vy: 0 };
    st.p2 = { y: height * 0.58, vy: 0 };
    st.pipes = [];
    st.spawnTimer = 0.45;
    st.levelTransitionTimer = 0;
    st.finished = false;
    ctxApi.sfx.playClick();
  },

  flap(playerKey, ctxApi) {
    const st = ctxApi.mgState;
    if (!st || st.selectingLevel || st.finished || st.levelTransitionTimer > 0) return;
    st[playerKey].vy = -340;
    ctxApi.sfx.playJump(playerKey === 'p2');
  },

  onUpdate(dt, ctxApi) {
    const st = ctxApi.mgState;
    if (!st || st.selectingLevel || st.finished) return;
    const { width, height } = ctxApi.getViewport();

    // Transição celebrativa entre níveis (sem gravidade para não derrubar o casal)
    if (st.levelTransitionTimer > 0) {
      st.levelTransitionTimer -= dt;
      st.p1.y += (height * 0.42 - st.p1.y) * 5 * dt;
      st.p2.y += (height * 0.58 - st.p2.y) * 5 * dt;
      st.p1.vy = 0;
      st.p2.vy = 0;
      if (st.levelTransitionTimer <= 0) {
        this.startLevel(st.levelIdx + 1, ctxApi);
      }
      return;
    }

    const cfg = st.levelCfg || FLAPPY_LEVELS[0];
    const gravity = 860;
    const birdX1 = width * 0.24;
    const birdX2 = width * 0.31;

    ['p1', 'p2'].forEach((k) => {
      const b = st[k];
      b.y += b.vy * dt;
      b.vy += gravity * dt;

      if (b.y < 68) {
        b.y = 68;
        b.vy = Math.max(0, b.vy);
      }
      if (b.y > height - 25 && !st.finished) {
        st.finished = true;
        const who = k === 'p1' ? ctxApi.getNames().groom : ctxApi.getNames().bride;
        ctxApi.batatinha(`${who} perdeu altitude no ${cfg.name}!`, {
          x: k === 'p1' ? birdX1 : birdX2,
          y: Math.max(80, Math.min(height - 30, b.y)),
          r: 40
        });
      }
    });

    if (st.finished) return;

    st.spawnTimer -= dt;
    if (st.spawnTimer <= 0 && st.spawnedCount < st.goalPipes) {
      st.spawnTimer = cfg.spawnInterval;
      const gapH = Math.max(cfg.minGap, height * cfg.gapRatio);
      const minCenter = 140 + gapH / 2;
      const maxCenter = height - 80 - gapH / 2;
      const baseGapY = minCenter + Math.random() * Math.max(40, maxCenter - minCenter);
      st.spawnedCount++;
      st.pipes.push({
        x: width + 60,
        w: 62,
        baseGapY,
        gapY: baseGapY,
        gapH,
        phase: Math.random() * Math.PI * 2,
        moveAmp: cfg.moveAmp,
        passed: false
      });
    }

    for (let i = st.pipes.length - 1; i >= 0; i--) {
      const pp = st.pipes[i];
      pp.x -= cfg.speed * dt;
      if (pp.moveAmp > 0) {
        pp.phase += dt * 2.2;
        const minC = 125 + pp.gapH / 2;
        const maxC = height - 65 - pp.gapH / 2;
        pp.gapY = Math.max(minC, Math.min(maxC, pp.baseGapY + Math.sin(pp.phase) * pp.moveAmp));
      }

      const topEdge = pp.gapY - pp.gapH / 2;
      const botEdge = pp.gapY + pp.gapH / 2;

      [
        { b: st.p1, bx: birdX1, name: ctxApi.getNames().groom },
        { b: st.p2, bx: birdX2, name: ctxApi.getNames().bride }
      ].forEach(({ b, bx, name }) => {
        if (st.finished) return;
        if (bx + 15 > pp.x && bx - 15 < pp.x + pp.w) {
          if (b.y - 15 < topEdge || b.y + 15 > botEdge) {
            st.finished = true;
            ctxApi.batatinha(`${name} bateu na coluna do ${cfg.name}!`, {
              x: bx,
              y: b.y,
              r: 44
            });
          }
        }
      });

      if (st.finished) return;

      if (!pp.passed && pp.x + pp.w < birdX1) {
        pp.passed = true;
        st.passedCount++;
        ctxApi.sfx.playBounce();

        if (st.passedCount >= st.goalPipes) {
          if (st.levelIdx < FLAPPY_LEVELS.length - 1) {
            st.pipes = [];
            st.levelTransitionTimer = 1.9;
            ctxApi.confetti(55);
            if (ctxApi.sfx?.playAltarFanfare) ctxApi.sfx.playAltarFanfare();
            return;
          } else {
            st.finished = true;
            ctxApi.victory('Voo lendário! Vocês conquistaram todos os 4 níveis do Flappy Duplo!');
            return;
          }
        }
      }

      if (pp.x < -90) st.pipes.splice(i, 1);
    }
  },

  onKeyDown(code, ctxApi) {
    const st = ctxApi.mgState;
    if (!st) return;
    if (st.selectingLevel) {
      if (code === 'Digit1') this.startLevel(0, ctxApi);
      else if (code === 'Digit2') this.startLevel(1, ctxApi);
      else if (code === 'Digit3') this.startLevel(2, ctxApi);
      else if (code === 'Digit4') this.startLevel(3, ctxApi);
      else if (code === 'Space' || code === 'Enter') this.startLevel(0, ctxApi);
      return;
    }
    if (code === 'KeyW') this.flap('p1', ctxApi);
    if (code === 'ArrowUp' || code === 'Space') this.flap('p2', ctxApi);
  },

  onPointerDown(x, y, ctxApi) {
    const st = ctxApi.mgState;
    if (!st) return;
    if (st.selectingLevel) {
      for (const btn of st.levelBtns || []) {
        if (x >= btn.x && x <= btn.x + btn.w && y >= btn.y && y <= btn.y + btn.h) {
          this.startLevel(btn.idx, ctxApi);
          return;
        }
      }
      return;
    }
    const { width } = ctxApi.getViewport();
    if (x < width / 2) this.flap('p1', ctxApi);
    else this.flap('p2', ctxApi);
  },

  onRender(ctx, ctxApi) {
    const st = ctxApi.mgState;
    if (!st) return;
    const { width, height } = ctxApi.getViewport();
    const cfg = st.levelCfg || FLAPPY_LEVELS[0];

    const skyGrad = ctx.createLinearGradient(0, 0, 0, height);
    skyGrad.addColorStop(0, cfg.bgTop);
    skyGrad.addColorStop(1, cfg.bgBot);
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, width, height);

    if (st.selectingLevel) {
      ctx.save();
      ctx.fillStyle = '#ffd166';
      ctx.font = '700 22px Fredoka, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('🕊️ FLAPPY DUPLO — ESCOLHA O NÍVEL', width / 2, Math.max(105, height * 0.20));

      ctx.fillStyle = '#e2e8f0';
      ctx.font = '600 14px Fredoka, sans-serif';
      ctx.fillText('Vença do Nível 1 ao 4 ou comece direto em um desafio mais difícil!', width / 2, Math.max(132, height * 0.25));

      st.levelBtns = [];
      const bw = Math.min(width - 40, 390);
      const bh = Math.min(54, Math.max(42, (height - 200) / 5));
      const startY = Math.max(155, height * 0.31);
      FLAPPY_LEVELS.forEach((lv, i) => {
        const bx = (width - bw) / 2;
        const by = startY + i * (bh + 12);
        st.levelBtns.push({ idx: i, x: bx, y: by, w: bw, h: bh });

        ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
        ctx.strokeStyle = lv.pipeColor;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.roundRect(bx, by, bw, bh, 12);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.font = '700 15px Fredoka, sans-serif';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText(lv.name, bx + 16, by + bh / 2);

        ctx.fillStyle = '#ffd166';
        ctx.font = '700 12px Fredoka, sans-serif';
        ctx.textAlign = 'right';
        ctx.fillText(`${lv.goalPipes} col.`, bx + bw - 16, by + bh / 2);
      });
      ctx.restore();
      return;
    }

    const birdX1 = width * 0.24;
    const birdX2 = width * 0.31;

    // Colunas de Casamento
    st.pipes.forEach((pp) => {
      const topH = pp.gapY - pp.gapH / 2;
      const botY = pp.gapY + pp.gapH / 2;

      ctx.fillStyle = cfg.pipeColor;
      ctx.strokeStyle = '#ffd166';
      ctx.lineWidth = 3;
      if (topH > 62) {
        ctx.fillRect(pp.x, 62, pp.w, topH - 62);
        ctx.strokeRect(pp.x, 62, pp.w, topH - 62);
        ctx.fillRect(pp.x - 5, topH - 16, pp.w + 10, 16);
        ctx.strokeRect(pp.x - 5, topH - 16, pp.w + 10, 16);
      }

      ctx.fillRect(pp.x, botY, pp.w, height - botY);
      ctx.strokeRect(pp.x, botY, pp.w, height - botY);
      ctx.fillRect(pp.x - 5, botY, pp.w + 10, 16);
      ctx.strokeRect(pp.x - 5, botY, pp.w + 10, 16);
    });

    // Noivo e Noiva Voadores
    ctxApi.drawGroom(birdX1, st.p1.y + 20, ctxApi.getTime() * 14, 0.72, true);
    ctxApi.drawBride(birdX2, st.p2.y + 20, ctxApi.getTime() * 14, 0.72, true);

    // HUD do Nível
    ctx.fillStyle = '#ffd166';
    ctx.font = '700 16px Fredoka, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`🕊️ ${cfg.name.toUpperCase()} • COLUNAS: ${st.passedCount} / ${st.goalPipes}`, width / 2, 90);

    if (st.levelTransitionTimer > 0) {
      const nextCfg = FLAPPY_LEVELS[st.levelIdx + 1];
      ctx.save();
      const bw = Math.min(width - 40, 440);
      ctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
      ctx.strokeStyle = '#ffd166';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.roundRect(width / 2 - bw / 2, height / 2 - 42, bw, 84, 16);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#06d6a0';
      ctx.font = '700 20px Fredoka, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`🎉 ${cfg.name.toUpperCase()} COMPLETO!`, width / 2, height / 2 - 12);

      if (nextCfg) {
        ctx.fillStyle = '#ffffff';
        ctx.font = '600 15px Fredoka, sans-serif';
        ctx.fillText(`Preparando ${nextCfg.name}...`, width / 2, height / 2 + 18);
      }
      ctx.restore();
    }
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
// games_part3.js - Minigames 9 a 12 da "Operação Lua de Mel"
// 9. Colar na Prova | 10. Você é a IA | 11. Derrube a Torre | 12. Futebol de Botão
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
// Mecânica Angry Birds Suave, Destruição Realista, Trajetória Balística e Vitória Justa!
// ============================================================================
const Minigame11_Torre = {
  id: 'mg11_torre',
  order: 11,
  title: '11. DERRUBE A TORRE: DEMOLIÇÃO COOP',
  subtitle: 'Arremessem Malas e Buquês para demolir a Torre de Burocracia abaixo da Linha Limite!',
  icon: '🏗️',

  onEnter(ctxApi) {
    const { width, height } = ctxApi.getViewport();
    const groundY = height - 58;
    const towerBaseX = Math.floor(width * 0.68);
    const limitLineY = groundY - 80; // Linha de demolição justa: escombros no chão ficam abaixo dela!

    const slingX = Math.floor(width * 0.20);
    const slingY = groundY - 72;

    const blocks = this.createTower(towerBaseX, groundY);

    ctxApi.mgState = {
      groundY,
      limitLineY,
      towerBaseX,
      slingX,
      slingY,
      shotsLeft: 5,
      turn: 'p1', // 'p1' (Noivo: 🧳 Mala Pesada) | 'p2' (Noiva: 💐 Buquê Explosivo)
      aimAngle: -0.42, // Ângulo perfeito em direção à torre
      power: 75,
      isDragging: false,
      pullX: slingX,
      pullY: slingY,
      projectile: null,
      blocks,
      explosions: [],
      particles: [],
      settleTimer: 0,
      bannerText: 'VEZ DO NOIVO: ARREMESSO DE MALA PESADA 🧳',
      bannerColor: '#38bdf8',
      bannerTimer: 2.8,
      btnFire: { x: 0, y: 0, w: 0, h: 0 }
    };
  },

  createTower(bx, groundY) {
    const blocks = [];

    // --- ANDAR 1: FUNDAÇÃO (Concreto Pesado) ---
    // 3 Pilares verticais
    blocks.push({
      x: bx - 52, y: groundY - 30, w: 26, h: 60, vx: 0, vy: 0, angle: 0, vAng: 0,
      mat: 'concreto', label: 'IPTU', color: '#64748b', hp: 3, maxHp: 3, mass: 3.5
    });
    blocks.push({
      x: bx, y: groundY - 30, w: 26, h: 60, vx: 0, vy: 0, angle: 0, vAng: 0,
      mat: 'concreto', label: 'BOLETO', color: '#64748b', hp: 3, maxHp: 3, mass: 3.5
    });
    blocks.push({
      x: bx + 52, y: groundY - 30, w: 26, h: 60, vx: 0, vy: 0, angle: 0, vAng: 0,
      mat: 'concreto', label: 'FINANC.', color: '#64748b', hp: 3, maxHp: 3, mass: 3.5
    });
    // Viga horizontal de suporte
    blocks.push({
      x: bx, y: groundY - 68, w: 156, h: 16, vx: 0, vy: 0, angle: 0, vAng: 0,
      mat: 'concreto', label: 'BUROCRACIA BASE', color: '#475569', hp: 3, maxHp: 3, mass: 4.0
    });

    // --- ANDAR 2: MEIO (Madeira e Barril de TNT) ---
    blocks.push({
      x: bx - 42, y: groundY - 100, w: 22, h: 48, vx: 0, vy: 0, angle: 0, vAng: 0,
      mat: 'madeira', label: 'DIÁRIO', color: '#b45309', hp: 2, maxHp: 2, mass: 1.8
    });
    // 💣 BARRIL DE TNT NO CENTRO DA TORRE
    blocks.push({
      x: bx, y: groundY - 98, w: 32, h: 36, vx: 0, vy: 0, angle: 0, vAng: 0,
      mat: 'tnt', label: '💣 TNT', color: '#ef4444', hp: 1, maxHp: 1, mass: 1.2
    });
    blocks.push({
      x: bx + 42, y: groundY - 100, w: 22, h: 48, vx: 0, vy: 0, angle: 0, vAng: 0,
      mat: 'madeira', label: 'PROVAS', color: '#b45309', hp: 2, maxHp: 2, mass: 1.8
    });
    // Viga horizontal de madeira
    blocks.push({
      x: bx, y: groundY - 130, w: 124, h: 14, vx: 0, vy: 0, angle: 0, vAng: 0,
      mat: 'madeira', label: 'PILHA DE TRABALHO', color: '#92400e', hp: 2, maxHp: 2, mass: 2.2
    });

    // --- ANDAR 3: TOPO (Vidro Frágil e Bloco TCC) ---
    blocks.push({
      x: bx - 30, y: groundY - 158, w: 24, h: 42, vx: 0, vy: 0, angle: 0, vAng: 0,
      mat: 'vidro', label: 'STRESS', color: '#38bdf8', hp: 1, maxHp: 1, mass: 1.0
    });
    blocks.push({
      x: bx + 30, y: groundY - 158, w: 24, h: 42, vx: 0, vy: 0, angle: 0, vAng: 0,
      mat: 'vidro', label: 'COBRANÇA', color: '#38bdf8', hp: 1, maxHp: 1, mass: 1.0
    });
    // Viga de vidro
    blocks.push({
      x: bx, y: groundY - 184, w: 90, h: 12, vx: 0, vy: 0, angle: 0, vAng: 0,
      mat: 'vidro', label: 'DISCUSSÕES', color: '#7dd3fc', hp: 1, maxHp: 1, mass: 0.8
    });
    // Bloco Superior
    blocks.push({
      x: bx, y: groundY - 208, w: 38, h: 36, vx: 0, vy: 0, angle: 0, vAng: 0,
      mat: 'vidro', label: '👑 TCC', color: '#0ea5e9', hp: 1, maxHp: 1, mass: 0.8
    });

    return blocks;
  },

  fireSlingshot(ctxApi) {
    const st = ctxApi.mgState;
    if (!st || st.projectile || st.shotsLeft <= 0 || st.settleTimer > 0) return;

    const startX = st.slingX;
    const startY = st.slingY;
    // Velocidade calibrada para alcançar a torre suavemente com excelente força de impacto
    const spd = 620 + (st.power / 100) * 440;

    st.shotsLeft--;
    st.isDragging = false;
    st.pullX = st.slingX;
    st.pullY = st.slingY;
    st.settleTimer = 0;

    const isP1 = st.turn === 'p1';
    st.projectile = {
      x: startX,
      y: startY,
      vx: Math.cos(st.aimAngle) * spd,
      vy: Math.sin(st.aimAngle) * spd,
      kind: isP1 ? 'luggage' : 'bouquet',
      emoji: isP1 ? '🧳' : '💐',
      mass: isP1 ? 6.0 : 2.0,
      damage: isP1 ? 5.0 : 3.0,
      r: isP1 ? 18 : 16,
      piercesRemaining: isP1 ? 2 : 0,
      alive: true
    };

    if (ctxApi.sfx?.playShoot) ctxApi.sfx.playShoot();
    else if (ctxApi.sfx?.playJump) ctxApi.sfx.playJump();
  },

  triggerExplosion(x, y, radius, damage, ctxApi) {
    const st = ctxApi.mgState;
    if (!st) return;

    st.explosions.push({ x, y, radius: 15, maxRadius: radius, alpha: 1.0 });
    ctxApi.particles(x, y, '#f59e0b', 26, 260);
    ctxApi.particles(x, y, '#ec4899', 20, 220);

    if (ctxApi.sfx?.playBounce) ctxApi.sfx.playBounce();
    else if (ctxApi.sfx?.playShoot) ctxApi.sfx.playShoot();

    // Dano e dispersão radial em todos os blocos no raio
    st.blocks.forEach((bl) => {
      const d = Math.hypot(bl.x - x, bl.y - y);
      if (d <= radius + Math.max(bl.w, bl.h) / 2) {
        bl.hp -= damage;
        const pushAng = Math.atan2(bl.y - y, bl.x - x);
        const force = (1 - d / (radius + 50)) * 520;
        bl.vx += Math.cos(pushAng) * force;
        bl.vy += Math.sin(pushAng) * force - 110;
        bl.vAng += (Math.cos(pushAng) > 0 ? 4.5 : -4.5);

        // Reação em cadeia de TNT
        if (bl.mat === 'tnt' && bl.hp <= 0 && !bl.exploded) {
          bl.exploded = true;
          setTimeout(() => {
            if (ctxApi.mgState && Array.isArray(ctxApi.mgState.blocks)) {
              this.triggerExplosion(bl.x, bl.y, 140, 7.0, ctxApi);
            }
          }, 90);
        }
      }
    });
  },

  onUpdate(dt, ctxApi) {
    const st = ctxApi.mgState;
    if (!st) return;
    const { width, height } = ctxApi.getViewport();
    st.groundY = height - 58;
    st.limitLineY = st.groundY - 80;
    st.slingX = Math.floor(width * 0.20);
    st.slingY = st.groundY - 72;

    if (st.bannerTimer > 0) st.bannerTimer -= dt;

    const keys = ctxApi.getKeys();
    const gravity = 640; // Gravidade suave e cinematográfica

    // 1. Ajuste de Mira por Teclado
    if (!st.projectile && !st.isDragging && st.settleTimer <= 0) {
      if (keys.p1Left || keys.p2Left) st.aimAngle = Math.max(-1.15, st.aimAngle - 0.95 * dt);
      if (keys.p1Right || keys.p2Right) st.aimAngle = Math.min(-0.10, st.aimAngle + 0.95 * dt);
      if (keys.p1Up || keys.p2Up) st.power = Math.min(100, st.power + 50 * dt);
      if (keys.p1Down || keys.p2Down) st.power = Math.max(30, st.power - 50 * dt);
    }

    // 2. Física do Projétil Ativo (Mala ou Buquê)
    if (st.projectile && st.projectile.alive) {
      const pr = st.projectile;
      pr.x += pr.vx * dt;
      pr.y += pr.vy * dt;
      pr.vy += gravity * dt;

      // Colisão Projétil vs Blocos
      for (let i = st.blocks.length - 1; i >= 0; i--) {
        const bl = st.blocks[i];
        const halfW = bl.w / 2;
        const halfH = bl.h / 2;

        if (
          pr.x + pr.r > bl.x - halfW &&
          pr.x - pr.r < bl.x + halfW &&
          pr.y + pr.r > bl.y - halfH &&
          pr.y - pr.r < bl.y + halfH
        ) {
          bl.hp -= pr.damage;

          // Buquê da Noiva: Detona em explosão colossal imediata!
          if (pr.kind === 'bouquet') {
            this.triggerExplosion(pr.x, pr.y, 115, 5.0, ctxApi);
            pr.alive = false;
          } else {
            // Mala do Noivo: Projétil Pesado que esmaga e empurra com força bruta!
            bl.vx += pr.vx * 0.85;
            bl.vy += pr.vy * 0.55 - 60;
            bl.vAng += (pr.vx > 0 ? 5.5 : -5.5);
            ctxApi.particles(pr.x, pr.y, bl.color, 16, 210);
            if (ctxApi.sfx?.playBounce) ctxApi.sfx.playBounce();

            if (pr.piercesRemaining > 0) {
              pr.piercesRemaining--;
              pr.vx *= 0.72; // Continua atravessando
            } else {
              pr.vx *= -0.25;
              pr.alive = false;
            }
          }

          if (bl.mat === 'tnt' && bl.hp <= 0 && !bl.exploded) {
            bl.exploded = true;
            this.triggerExplosion(bl.x, bl.y, 140, 7.0, ctxApi);
          }
          break;
        }
      }

      // Colisão com o solo ou fora da tela
      if (pr.y + pr.r >= st.groundY || pr.x > width + 60 || pr.x < -60) {
        if (pr.kind === 'bouquet' && pr.y + pr.r >= st.groundY) {
          this.triggerExplosion(pr.x, st.groundY - 12, 95, 4.0, ctxApi);
        }
        pr.alive = false;
      }

      if (!pr.alive) {
        st.projectile = null;
        st.settleTimer = 1.3; // 1.3s para os blocos caírem e estabilizarem
      }
    }

    // 3. Física de Queda, Rotação e Destruição dos Blocos
    for (let i = st.blocks.length - 1; i >= 0; i--) {
      const bl = st.blocks[i];

      if (bl.hp <= 0) {
        ctxApi.particles(bl.x, bl.y, bl.color, 18, 180);
        st.blocks.splice(i, 1);
        continue;
      }

      // Gravidade
      bl.vy += gravity * 0.95 * dt;
      bl.x += bl.vx * dt;
      bl.y += bl.vy * dt;
      bl.angle += bl.vAng * dt;

      // Colisão com o chão
      const halfH = bl.h / 2;
      if (bl.y + halfH >= st.groundY) {
        bl.y = st.groundY - halfH;
        bl.vy = -bl.vy * 0.15;
        bl.vx *= 0.82;
        bl.vAng *= 0.78;
        if (Math.abs(bl.vy) < 12) bl.vy = 0;
        if (Math.abs(bl.vx) < 4) bl.vx = 0;
        if (Math.abs(bl.vAng) < 0.08) bl.vAng = 0;
      }

      // Se saiu para fora da tela
      if (bl.x < -90 || bl.x > width + 90) {
        st.blocks.splice(i, 1);
        continue;
      }
    }

    // 4. Colisão Bloco vs Bloco (Apoio e Tombamento)
    for (let i = 0; i < st.blocks.length; i++) {
      const a = st.blocks[i];
      for (let j = i + 1; j < st.blocks.length; j++) {
        const b = st.blocks[j];
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const minDistX = (a.w + b.w) / 2;
        const minDistY = (a.h + b.h) / 2;

        if (Math.abs(dx) < minDistX && Math.abs(dy) < minDistY) {
          const overlapX = minDistX - Math.abs(dx);
          const overlapY = minDistY - Math.abs(dy);

          if (overlapY < overlapX) {
            if (dy > 0) {
              b.y += overlapY * 0.5;
              a.y -= overlapY * 0.5;
              b.vy = Math.max(0, b.vy);
              a.vy = Math.min(0, a.vy);
            } else {
              b.y -= overlapY * 0.5;
              a.y += overlapY * 0.5;
              a.vy = Math.max(0, a.vy);
              b.vy = Math.min(0, b.vy);
            }
          } else {
            const sign = dx > 0 ? 1 : -1;
            b.x += overlapX * 0.5 * sign;
            a.x -= overlapX * 0.5 * sign;
            const avgVx = (a.vx + b.vx) / 2;
            a.vx = avgVx * 0.8;
            b.vx = avgVx * 0.8;
            a.vAng += (sign > 0 ? -1.8 : 1.8) * dt;
            b.vAng += (sign > 0 ? 1.8 : -1.8) * dt;
          }
        }
      }
    }

    // 5. Atualiza Explosões Visuais
    for (let ex = st.explosions.length - 1; ex >= 0; ex--) {
      const exp = st.explosions[ex];
      exp.radius += 170 * dt;
      exp.alpha -= 2.2 * dt;
      if (exp.alpha <= 0) st.explosions.splice(ex, 1);
    }

    // 6. Verificação de Vitória / Fim de Turno / Batatinha
    if (st.settleTimer > 0) {
      st.settleTimer -= dt;
      if (st.settleTimer <= 0) {
        // Checa se algum bloco ainda tem o topo acima da Linha Limite
        const blocksAbove = st.blocks.filter((b) => (b.y - b.h / 2) < st.limitLineY);

        if (blocksAbove.length === 0) {
          // VITÓRIA TOTAL!
          ctxApi.confetti(60);
          ctxApi.victory('Demolição Perfeita! A Torre de Burocracia foi 100% derrubada pelo casal!');
          return;
        }

        if (st.shotsLeft <= 0) {
          // DERROTA: Acabaram os arremessos!
          ctxApi.batatinha('Acabaram os arremessos e a Torre de Burocracia continuou de pé acima da Linha Limite!', {
            x: st.towerBaseX,
            y: st.limitLineY,
            r: 70
          });
          return;
        }

        // Alterna turno
        st.turn = st.turn === 'p1' ? 'p2' : 'p1';
        const isP1Next = st.turn === 'p1';
        const names = ctxApi.getNames ? ctxApi.getNames() : { groom: 'Noivo', bride: 'Noiva' };
        st.bannerText = isP1Next
          ? `VEZ DO ${names.groom.toUpperCase()}: MALA PESADA 🧳`
          : `VEZ DA ${names.bride.toUpperCase()}: BUQUÊ EXPLOSIVO 💐`;
        st.bannerColor = isP1Next ? '#38bdf8' : '#ec4899';
        st.bannerTimer = 2.4;
        if (ctxApi.sfx?.playClick) ctxApi.sfx.playClick();
      }
    }
  },

  onKeyDown(code, ctxApi) {
    const st = ctxApi.mgState;
    if (!st || st.projectile || st.settleTimer > 0) return;

    if (code === 'Space' || code === 'Enter') {
      this.fireSlingshot(ctxApi);
    }
  },

  onPointerDown(x, y, ctxApi) {
    const st = ctxApi.mgState;
    if (!st || st.projectile || st.settleTimer > 0) return;

    // Se clicar no botão de disparo rápido na tela
    if (
      st.btnFire &&
      x >= st.btnFire.x &&
      x <= st.btnFire.x + st.btnFire.w &&
      y >= st.btnFire.y &&
      y <= st.btnFire.y + st.btnFire.h
    ) {
      this.fireSlingshot(ctxApi);
      return;
    }

    // Clique na metade esquerda da tela ou próximo ao estilingue
    const { width } = ctxApi.getViewport();
    if (x < width * 0.45) {
      st.isDragging = true;
      this.handleDrag(x, y, st);
    }
  },

  onPointerMove(x, y, ctxApi) {
    const st = ctxApi.mgState;
    if (!st || !st.isDragging || st.projectile) return;
    this.handleDrag(x, y, st);
  },

  handleDrag(x, y, st) {
    const dx = x - st.slingX;
    const dy = y - st.slingY;
    const dist = Math.hypot(dx, dy);

    // Se o jogador puxar para a direita (em direção à torre), invertemos para puxar o elástico para trás!
    let pullDx = dx;
    let pullDy = dy;
    if (dx > 10) {
      pullDx = -dx;
      pullDy = -dy;
    }

    const pullDist = Math.hypot(pullDx, pullDy);
    const maxPull = 110;
    const clampedDist = Math.min(maxPull, Math.max(25, pullDist));
    const pullAngle = Math.atan2(pullDy, pullDx);

    st.pullX = st.slingX + Math.cos(pullAngle) * clampedDist;
    st.pullY = st.slingY + Math.sin(pullAngle) * clampedDist;

    // O projétil voa na direção contrária do puxão
    st.aimAngle = Math.atan2(-pullDy, -pullDx);
    // Limita o ângulo para disparos válidos e elegantes em direção à torre
    st.aimAngle = Math.max(-1.15, Math.min(-0.10, st.aimAngle));
    st.power = Math.max(35, Math.min(100, (clampedDist / maxPull) * 100));
  },

  onPointerUp(ctxApi) {
    const st = ctxApi.mgState;
    if (!st || !st.isDragging || st.projectile) return;

    st.isDragging = false;
    if (st.power >= 35) {
      this.fireSlingshot(ctxApi);
    } else {
      st.pullX = st.slingX;
      st.pullY = st.slingY;
    }
  },

  onRender(ctx, ctxApi) {
    const st = ctxApi.mgState;
    if (!st) return;
    const { width, height } = ctxApi.getViewport();
    const names = ctxApi.getNames ? ctxApi.getNames() : { groom: 'Noivo', bride: 'Noiva' };

    // 1. Fundo do Céu Noturno
    const bgGrad = ctx.createLinearGradient(0, 0, 0, st.groundY);
    bgGrad.addColorStop(0, '#0c071a');
    bgGrad.addColorStop(1, '#23133d');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // 2. Piso de Festa e Gramado
    ctx.fillStyle = '#334155';
    ctx.fillRect(0, st.groundY, width, height - st.groundY);
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, st.groundY + 12, width, height - st.groundY - 12);

    // 3. LINHA LIMITE DE DEMOLIÇÃO
    ctx.save();
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 3;
    ctx.setLineDash([12, 8]);
    ctx.beginPath();
    ctx.moveTo(st.towerBaseX - 160, st.limitLineY);
    ctx.lineTo(st.towerBaseX + 160, st.limitLineY);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = '#f59e0b';
    ctx.font = '700 12px Fredoka, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('⚠️ LINHA LIMITE (DERRUBEM OS BLOCOS ABAIXO DAQUI!)', st.towerBaseX - 150, st.limitLineY - 8);
    ctx.restore();

    // 4. Trajetória Parabólica Balística Completa (Angry Birds Style)
    if (!st.projectile) {
      ctx.save();
      const arcColor = st.turn === 'p1' ? 'rgba(56, 189, 248, 0.75)' : 'rgba(236, 72, 153, 0.75)';
      ctx.strokeStyle = arcColor;
      ctx.lineWidth = 3;
      ctx.setLineDash([6, 6]);
      ctx.beginPath();

      let simX = st.slingX;
      let simY = st.slingY;
      const spd = 620 + (st.power / 100) * 440;
      let simVx = Math.cos(st.aimAngle) * spd;
      let simVy = Math.sin(st.aimAngle) * spd;
      ctx.moveTo(simX, simY);

      let impactPoint = null;
      for (let s = 0; s < 45; s++) {
        const dtSim = 0.035;
        simX += simVx * dtSim;
        simY += simVy * dtSim;
        simVy += 640 * dtSim;
        ctx.lineTo(simX, simY);

        // Se cruzar com a torre ou com o solo
        if (simY >= st.groundY || (simX >= st.towerBaseX - 80 && simX <= st.towerBaseX + 80 && simY >= st.groundY - 240)) {
          impactPoint = { x: simX, y: simY };
          break;
        }
      }
      ctx.stroke();

      // Mira / Retículo no Ponto de Impacto
      if (impactPoint) {
        ctx.fillStyle = arcColor;
        ctx.beginPath();
        ctx.arc(impactPoint.x, impactPoint.y, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.setLineDash([]);
        ctx.stroke();
      }
      ctx.restore();
    }

    // 5. ESTILINGUE E BORRACHAS ELÁSTICAS
    const slingBaseX = st.slingX;
    const slingBaseY = st.groundY;
    const forkLeftX = slingBaseX - 14;
    const forkRightX = slingBaseX + 14;
    const forkTopY = st.slingY - 10;

    ctx.save();
    ctx.fillStyle = '#854d0e';
    ctx.strokeStyle = '#451a03';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(slingBaseX - 8, slingBaseY);
    ctx.lineTo(slingBaseX - 8, st.slingY + 12);
    ctx.lineTo(forkLeftX, forkTopY);
    ctx.lineTo(forkLeftX + 6, forkTopY);
    ctx.lineTo(slingBaseX, st.slingY + 16);
    ctx.lineTo(forkRightX - 6, forkTopY);
    ctx.lineTo(forkRightX, forkTopY);
    ctx.lineTo(slingBaseX + 8, st.slingY + 12);
    ctx.lineTo(slingBaseX + 8, slingBaseY);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    const px = st.isDragging ? st.pullX : st.slingX;
    const py = st.isDragging ? st.pullY : st.slingY;

    ctx.strokeStyle = '#dc2626';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(forkLeftX, forkTopY);
    ctx.lineTo(px, py);
    ctx.moveTo(forkRightX, forkTopY);
    ctx.lineTo(px, py);
    ctx.stroke();

    if (!st.projectile) {
      ctx.font = '28px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(st.turn === 'p1' ? '🧳' : '💐', px, py);
    }
    ctx.restore();

    // 6. Projétil em Voo
    if (st.projectile) {
      ctx.save();
      ctx.font = '34px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(st.projectile.emoji, st.projectile.x, st.projectile.y);
      ctx.restore();
    }

    // 7. Explosões Visuais
    st.explosions.forEach((exp) => {
      ctx.save();
      ctx.beginPath();
      ctx.arc(exp.x, exp.y, exp.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(245, 158, 11, ${Math.max(0, exp.alpha * 0.45)})`;
      ctx.fill();
      ctx.strokeStyle = `rgba(236, 72, 153, ${Math.max(0, exp.alpha)})`;
      ctx.lineWidth = 4;
      ctx.stroke();
      ctx.restore();
    });

    // 8. BLOCOS DA TORRE (Vidro, Madeira, Concreto e TNT)
    st.blocks.forEach((bl) => {
      ctx.save();
      ctx.translate(bl.x, bl.y);
      ctx.rotate(bl.angle);

      if (bl.mat === 'vidro') {
        ctx.fillStyle = 'rgba(56, 189, 248, 0.72)';
        ctx.strokeStyle = '#e0f2fe';
        ctx.lineWidth = 2;
      } else if (bl.mat === 'madeira') {
        ctx.fillStyle = '#b45309';
        ctx.strokeStyle = '#fef3c7';
        ctx.lineWidth = 2;
      } else if (bl.mat === 'tnt') {
        ctx.fillStyle = '#dc2626';
        ctx.strokeStyle = '#fef08a';
        ctx.lineWidth = 2.5;
      } else {
        ctx.fillStyle = '#64748b';
        ctx.strokeStyle = '#cbd5e1';
        ctx.lineWidth = 2;
      }

      ctx.beginPath();
      ctx.roundRect(-bl.w / 2, -bl.h / 2, bl.w, bl.h, 4);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.font = '700 10px Fredoka, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(bl.label, 0, 0);

      if (bl.hp < bl.maxHp) {
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(-bl.w / 2 + 2, -bl.h / 2 + 2, (bl.w - 4) * (bl.hp / bl.maxHp), 3);
      }
      ctx.restore();
    });

    // 9. Personagens Noivo e Noiva
    ctxApi.drawGroom(st.slingX - 44, st.groundY, 0, 0.85, true);
    ctxApi.drawBride(st.slingX + 38, st.groundY, 0, 0.85, true);

    // 10. HUD Superior
    const hudW = Math.min(560, width * 0.92);
    const hudX = width / 2 - hudW / 2;
    const hudY = 74;

    ctx.save();
    ctx.fillStyle = 'rgba(15, 10, 30, 0.88)';
    ctx.strokeStyle = st.turn === 'p1' ? '#38bdf8' : '#ec4899';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.roundRect(hudX, hudY, hudW, 40, 10);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = '700 14px Fredoka, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`💣 ARREMESSOS: ${st.shotsLeft}/5`, hudX + 16, hudY + 25);

    const blocksAbove = st.blocks.filter((b) => (b.y - b.h / 2) < st.limitLineY);
    ctx.fillStyle = blocksAbove.length === 0 ? '#10b981' : '#f59e0b';
    ctx.textAlign = 'center';
    ctx.fillText(`BLOCOS ACIMA DO LIMITE: ${blocksAbove.length}`, hudX + hudW / 2, hudY + 25);

    ctx.fillStyle = '#94a3b8';
    ctx.textAlign = 'right';
    ctx.fillText(`POTÊNCIA: ${Math.round(st.power)}%`, hudX + hudW - 16, hudY + 25);
    ctx.restore();

    // 11. Botão de Arremesso Rápido
    const btnW = 120;
    const btnH = 40;
    const btnX = st.slingX - btnW / 2;
    const btnY = height - 52;
    st.btnFire = { x: btnX, y: btnY, w: btnW, h: btnH };

    ctx.save();
    ctx.fillStyle = st.turn === 'p1' ? '#0284c7' : '#db2777';
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(btnX, btnY, btnW, btnH, 10);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = '700 14px Fredoka, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🚀 DISPARAR', btnX + btnW / 2, btnY + btnH / 2);
    ctx.restore();

    // 12. Banner de Turno
    if (st.bannerTimer > 0 && st.bannerText) {
      ctx.save();
      const by = height * 0.35;
      ctx.fillStyle = 'rgba(15, 10, 30, 0.92)';
      ctx.strokeStyle = st.bannerColor || '#ffd166';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.roundRect(width / 2 - 250, by - 24, 500, 48, 12);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.font = '700 16px Fredoka, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(st.bannerText, width / 2, by);
      ctx.restore();
    }
  }
};



// ============================================================================
// MINIGAME 12: FUTEBOL DE BOTÃO DO CASAL (5x5 • SOCCER STARS STYLE)
// ============================================================================
const Minigame12_FutebolBotao = {
  id: 'mg12_futebol_botao',
  order: 12,
  title: '12. FUTEBOL DE BOTÃO DO CASAL',
  subtitle: 'Duelo 5x5 estilo Soccer Stars! Arraste para mirar e faça 3 gols primeiro!',
  icon: '⚽',

  getFieldMetrics(width, height) {
    const hudTop = 64;
    const scoreH = Math.max(54, Math.min(68, height * 0.12));
    const padX = Math.max(36, Math.min(66, width * 0.065));
    const padY = Math.max(18, Math.min(28, height * 0.04));
    const availW = Math.max(260, width - padX * 2);
    const availH = Math.max(180, height - hudTop - scoreH - padY * 2);

    // Mantém proporção horizontal clássica ~1.65:1 sem cortar em telas largas ou estreitas
    let fw = availW;
    let fh = fw / 1.65;
    if (fh > availH) {
      fh = availH;
      fw = fh * 1.65;
    }

    const fx = (width - fw) / 2;
    const fy = hudTop + scoreH + (availH - fh) / 2 + padY * 0.4;
    const goalW = Math.max(22, Math.min(34, fw * 0.048));
    const goalH = fh * 0.36;
    const goalTop = fy + (fh - goalH) / 2;
    const goalBottom = goalTop + goalH;
    const btnR = Math.max(13, Math.min(23, fh * 0.068));
    const ballR = Math.max(8, Math.min(13, btnR * 0.56));

    return {
      fx, fy, fw, fh,
      cx: fx + fw / 2,
      cy: fy + fh / 2,
      goalW, goalH, goalTop, goalBottom,
      btnR, ballR,
      scoreY: hudTop + 8,
      scoreH
    };
  },

  buildFormation(m) {
    const { fx, fy, fw, fh, cy, btnR } = m;
    const buttons = [];

    // Formação 5x5 equilibrada: Goleiro + 2 Defensores + 2 Atacantes
    const leftPositions = [
      { rx: 0.075, ry: 0.50, role: 'GK' },
      { rx: 0.21, ry: 0.27, role: 'DF' },
      { rx: 0.21, ry: 0.73, role: 'DF' },
      { rx: 0.37, ry: 0.35, role: 'AT' },
      { rx: 0.37, ry: 0.65, role: 'AT' }
    ];

    leftPositions.forEach((p, idx) => {
      buttons.push({
        id: 'p1_' + idx,
        team: 'p1',
        x: fx + fw * p.rx,
        y: fy + fh * p.ry,
        vx: 0,
        vy: 0,
        r: btnR,
        mass: 2.5,
        role: p.role
      });
    });

    leftPositions.forEach((p, idx) => {
      buttons.push({
        id: 'p2_' + idx,
        team: 'p2',
        x: fx + fw * (1 - p.rx),
        y: fy + fh * p.ry,
        vx: 0,
        vy: 0,
        r: btnR,
        mass: 2.5,
        role: p.role
      });
    });

    const ball = {
      x: fx + fw / 2,
      y: cy,
      vx: 0,
      vy: 0,
      r: m.ballR,
      mass: 1.0,
      spin: 0
    };

    return { buttons, ball };
  },

  onEnter(ctxApi) {
    const { width, height } = ctxApi.getViewport();
    const m = this.getFieldMetrics(width, height);
    const { buttons, ball } = this.buildFormation(m);

    ctxApi.mgState = {
      width,
      height,
      metrics: m,
      buttons,
      ball,
      turn: 'p1', // 'p1' (Noivo / Esq) | 'p2' (Noiva / Dir)
      phase: 'aim', // 'aim' | 'moving' | 'goal' | 'gameover'
      scoreP1: 0,
      scoreP2: 0,
      goalsToWin: 3,
      dragBtnId: null,
      dragX: 0,
      dragY: 0,
      goalTimer: 0,
      goalBanner: '',
      goalColor: '#ffd166',
      winnerTeam: null,
      gameoverTimer: 0,
      shotCount: 0
    };
  },

  resetPositions(st, kickoffTeam) {
    const m = st.metrics;
    const fresh = this.buildFormation(m);
    st.buttons = fresh.buttons;
    st.ball = fresh.ball;
    st.turn = kickoffTeam;
    st.phase = 'aim';
    st.dragBtnId = null;
  },

  canCurrentDeviceControlTurn(st, ctxApi) {
    if (st.phase !== 'aim') return false;
    const mode = ctxApi.getMode ? ctxApi.getMode() : 'local';
    if (mode === 'host') return st.turn === 'p1';
    if (mode === 'guest') return st.turn === 'p2';
    return true;
  },

  onPointerDown(x, y, ctxApi, isRemote = false) {
    const st = ctxApi.mgState;
    if (!st || st.phase !== 'aim') return;

    // Em modo Online, cada aparelho só pode interagir diretamente no seu próprio turno
    if (!isRemote && !this.canCurrentDeviceControlTurn(st, ctxApi)) return;

    let chosen = null;
    let bestDist = Infinity;
    for (const b of st.buttons) {
      if (b.team !== st.turn) continue;
      const d = Math.hypot(x - b.x, y - b.y);
      if (d <= b.r * 1.45 && d < bestDist) {
        bestDist = d;
        chosen = b;
      }
    }

    if (chosen) {
      st.dragBtnId = chosen.id;
      st.dragX = x;
      st.dragY = y;
    }
  },

  onPointerMove(x, y, ctxApi) {
    const st = ctxApi.mgState;
    if (!st || st.phase !== 'aim' || !st.dragBtnId) return;
    st.dragX = x;
    st.dragY = y;
  },

  onPointerUp(ctxApi) {
    const st = ctxApi.mgState;
    if (!st || st.phase !== 'aim' || !st.dragBtnId) return;

    const btn = st.buttons.find((b) => b.id === st.dragBtnId);
    st.dragBtnId = null;
    if (!btn) return;

    const dx = btn.x - st.dragX;
    const dy = btn.y - st.dragY;
    const dist = Math.hypot(dx, dy);

    // Cancela se o jogador soltou em cima do próprio botão
    if (dist < 10) return;

    const maxPull = Math.min(130, st.metrics.fw * 0.19);
    const powerRatio = Math.min(1, dist / maxPull);
    const maxLaunchSpeed = Math.max(680, st.metrics.fw * 1.15);
    const speed = powerRatio * maxLaunchSpeed;

    btn.vx = (dx / dist) * speed;
    btn.vy = (dy / dist) * speed;
    st.phase = 'moving';
    st.shotCount++;

    if (ctxApi.sfx?.playBounce) ctxApi.sfx.playBounce();
    ctxApi.particles(btn.x, btn.y, btn.team === 'p1' ? '#38bdf8' : '#ff5d8f', 8, 120);
  },

  resolveCircleCollision(a, b, restitution) {
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const dist = Math.hypot(dx, dy);
    const minDist = a.r + b.r;
    if (dist === 0 || dist >= minDist) return false;

    const nx = dx / dist;
    const ny = dy / dist;
    const overlap = minDist - dist;

    const invMassA = 1 / a.mass;
    const invMassB = 1 / b.mass;
    const invMassSum = invMassA + invMassB;

    // Separa os círculos proporcionalmente à massa inversa
    a.x -= nx * overlap * (invMassA / invMassSum);
    a.y -= ny * overlap * (invMassA / invMassSum);
    b.x += nx * overlap * (invMassB / invMassSum);
    b.y += ny * overlap * (invMassB / invMassSum);

    const rvx = b.vx - a.vx;
    const rvy = b.vy - a.vy;
    const velAlongNormal = rvx * nx + rvy * ny;
    if (velAlongNormal > 0) return false;

    const j = (-(1 + restitution) * velAlongNormal) / invMassSum;
    const impulseX = j * nx;
    const impulseY = j * ny;

    a.vx -= impulseX * invMassA;
    a.vy -= impulseY * invMassA;
    b.vx += impulseX * invMassB;
    b.vy += impulseY * invMassB;
    return true;
  },

  onUpdate(dt, ctxApi) {
    const st = ctxApi.mgState;
    if (!st) return;

    const { width, height } = ctxApi.getViewport();
    if (Math.abs(width - st.width) > 2 || Math.abs(height - st.height) > 2) {
      // Reajusta escala proporcional se a janela/celular girar
      const oldM = st.metrics;
      const newM = this.getFieldMetrics(width, height);
      const sx = newM.fw / oldM.fw;
      const sy = newM.fh / oldM.fh;
      st.buttons.forEach((b) => {
        b.x = newM.fx + (b.x - oldM.fx) * sx;
        b.y = newM.fy + (b.y - oldM.fy) * sy;
        b.r = newM.btnR;
      });
      st.ball.x = newM.fx + (st.ball.x - oldM.fx) * sx;
      st.ball.y = newM.fy + (st.ball.y - oldM.fy) * sy;
      st.ball.r = newM.ballR;
      st.metrics = newM;
      st.width = width;
      st.height = height;
    }

    const m = st.metrics;

    // Se for Guest em modo Online, a física autoritativa vem do Host
    const mode = ctxApi.getMode ? ctxApi.getMode() : 'local';
    if (mode === 'guest') {
      return;
    }

    if (st.phase === 'gameover') {
      st.gameoverTimer -= dt;
      if (st.gameoverTimer <= 0) {
        const names = ctxApi.getNames();
        const winnerName = st.winnerTeam === 'p1' ? names.groom : names.bride;
        const loserName = st.winnerTeam === 'p1' ? names.bride : names.groom;
        const winScore = st.winnerTeam === 'p1' ? st.scoreP1 : st.scoreP2;
        const loseScore = st.winnerTeam === 'p1' ? st.scoreP2 : st.scoreP1;

        if (mode === 'host') {
          if (st.winnerTeam === 'p1') {
            ctxApi.victory(`${winnerName} venceu o Futebol de Botão por ${winScore} x ${loseScore}!`);
          } else {
            ctxApi.batatinha(`${names.groom} perdeu o Futebol de Botão para ${names.bride} (${winScore} x ${loseScore})!`, {
              x: m.cx, y: m.cy, r: 50
            });
          }
        } else {
          ctxApi.batatinha(`${loserName} levou 3 gols no Futebol de Botão! ${winnerName} venceu por ${winScore} x ${loseScore}!`, {
            x: m.cx, y: m.cy, r: 50
          });
        }
      }
      return;
    }

    if (st.phase === 'goal') {
      st.goalTimer -= dt;
      if (st.goalTimer <= 0) {
        if (st.scoreP1 >= st.goalsToWin || st.scoreP2 >= st.goalsToWin) {
          st.winnerTeam = st.scoreP1 >= st.goalsToWin ? 'p1' : 'p2';
          st.phase = 'gameover';
          st.gameoverTimer = 0.25;
        } else {
          const kickoff = st.lastScorer === 'p1' ? 'p2' : 'p1';
          this.resetPositions(st, kickoff);
        }
      }
      return;
    }

    if (st.phase !== 'moving') return;

    const subSteps = 4;
    const subDt = dt / subSteps;
    const btnFriction = Math.pow(0.984, subDt * 60);
    const ballFriction = Math.pow(0.989, subDt * 60);
    const entities = [...st.buttons, st.ball];

    // Traves fixas dos dois gols (4 postes)
    const posts = [
      { x: m.fx, y: m.goalTop, r: 5, mass: 1e9, vx: 0, vy: 0 },
      { x: m.fx, y: m.goalBottom, r: 5, mass: 1e9, vx: 0, vy: 0 },
      { x: m.fx + m.fw, y: m.goalTop, r: 5, mass: 1e9, vx: 0, vy: 0 },
      { x: m.fx + m.fw, y: m.goalBottom, r: 5, mass: 1e9, vx: 0, vy: 0 }
    ];

    for (let step = 0; step < subSteps; step++) {
      // 1. Integração e Atrito
      for (const ent of entities) {
        ent.x += ent.vx * subDt;
        ent.y += ent.vy * subDt;
        const fric = ent === st.ball ? ballFriction : btnFriction;
        ent.vx *= fric;
        ent.vy *= fric;
      }

      // 2. Colisões com tabelas do campo e gols
      for (const ent of entities) {
        // Topo e Fundo
        if (ent.y - ent.r < m.fy) {
          ent.y = m.fy + ent.r;
          ent.vy = Math.abs(ent.vy) * 0.85;
        } else if (ent.y + ent.r > m.fy + m.fh) {
          ent.y = m.fy + m.fh - ent.r;
          ent.vy = -Math.abs(ent.vy) * 0.85;
        }

        const inGoalY = ent.y > m.goalTop + ent.r * 0.25 && ent.y < m.goalBottom - ent.r * 0.25;

        if (ent === st.ball && inGoalY) {
          // Bola pode entrar nos bolsos laterais dos gols!
          if (ent.x - ent.r < m.fx - m.goalW) {
            ent.x = m.fx - m.goalW + ent.r;
            ent.vx = Math.abs(ent.vx) * 0.4;
          } else if (ent.x + ent.r > m.fx + m.fw + m.goalW) {
            ent.x = m.fx + m.fw + m.goalW - ent.r;
            ent.vx = -Math.abs(ent.vx) * 0.4;
          }
        } else {
          // Botões e bola fora da boca do gol rebatem nas linhas de fundo
          if (ent.x - ent.r < m.fx) {
            ent.x = m.fx + ent.r;
            ent.vx = Math.abs(ent.vx) * 0.85;
          } else if (ent.x + ent.r > m.fx + m.fw) {
            ent.x = m.fx + m.fw - ent.r;
            ent.vx = -Math.abs(ent.vx) * 0.85;
          }
        }
      }

      // 3. Colisão com as 4 traves
      for (const ent of entities) {
        for (const post of posts) {
          this.resolveCircleCollision(ent, post, 0.88);
        }
      }

      // 4. Colisões elásticas entre botões e bola
      let hitAny = false;
      for (let i = 0; i < entities.length; i++) {
        for (let j = i + 1; j < entities.length; j++) {
          if (this.resolveCircleCollision(entities[i], entities[j], 0.88)) {
            hitAny = true;
          }
        }
      }
      if (hitAny && step === 0 && ctxApi.sfx?.playClick) {
        ctxApi.sfx.playClick();
      }

      // 5. Detecção de GOL (bola cruzou completamente a linha do gol)
      if (st.ball.x + st.ball.r * 0.35 < m.fx && st.ball.y > m.goalTop && st.ball.y < m.goalBottom) {
        // Gol da Noiva (Time Direito marcou no gol esquerdo!)
        st.scoreP2++;
        st.lastScorer = 'p2';
        st.phase = 'goal';
        st.goalTimer = 1.6;
        const names = ctxApi.getNames();
        st.goalBanner = `⚽ GOOOOL DE ${names.bride.toUpperCase()}!`;
        st.goalColor = '#ff5d8f';
        ctxApi.confetti(70);
        if (ctxApi.sfx?.playAltarFanfare) ctxApi.sfx.playAltarFanfare();
        return;
      }
      if (st.ball.x - st.ball.r * 0.35 > m.fx + m.fw && st.ball.y > m.goalTop && st.ball.y < m.goalBottom) {
        // Gol do Noivo (Time Esquerdo marcou no gol direito!)
        st.scoreP1++;
        st.lastScorer = 'p1';
        st.phase = 'goal';
        st.goalTimer = 1.6;
        const names = ctxApi.getNames();
        st.goalBanner = `⚽ GOOOOL DE ${names.groom.toUpperCase()}!`;
        st.goalColor = '#38bdf8';
        ctxApi.confetti(70);
        if (ctxApi.sfx?.playAltarFanfare) ctxApi.sfx.playAltarFanfare();
        return;
      }
    }

    // 6. Verifica se todas as peças pararam para passar o turno
    let anyMoving = false;
    for (const ent of entities) {
      if (Math.hypot(ent.vx, ent.vy) > 7) {
        anyMoving = true;
        break;
      } else {
        ent.vx = 0;
        ent.vy = 0;
      }
    }

    if (!anyMoving) {
      st.turn = st.turn === 'p1' ? 'p2' : 'p1';
      st.phase = 'aim';
    }
  },

  onRender(ctx, ctxApi) {
    const st = ctxApi.mgState;
    if (!st) return;

    const { width, height } = ctxApi.getViewport();
    const m = st.metrics;
    const names = ctxApi.getNames();
    const time = ctxApi.getTime();

    ctx.save();
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    // 1. Fundo de Estádio Noturno Vibrante
    const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
    bgGrad.addColorStop(0, '#0f172a');
    bgGrad.addColorStop(1, '#064e3b');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // 2. Placar Nítido no Topo com Avatares Reais do Casal
    const sbW = Math.min(width - 24, 540);
    const sbH = m.scoreH - 6;
    const sbX = (width - sbW) / 2;
    const sbY = m.scoreY;

    ctx.save();
    ctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
    ctx.strokeStyle = '#ffd166';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.roundRect(sbX, sbY, sbW, sbH, 14);
    ctx.fill();
    ctx.stroke();

    const avatarR = Math.min(20, sbH * 0.38);
    // Avatar Noivo (Esquerda)
    if (ctxApi.drawCoupleAvatar) {
      ctxApi.drawCoupleAvatar(ctx, 'groom', sbX + avatarR + 12, sbY + sbH / 2, avatarR, st.turn === 'p1' ? '#38bdf8' : '#475569');
      ctxApi.drawCoupleAvatar(ctx, 'bride', sbX + sbW - avatarR - 12, sbY + sbH / 2, avatarR, st.turn === 'p2' ? '#ff5d8f' : '#475569');
    }

    ctx.textBaseline = 'middle';
    // Nome Noivo
    ctx.fillStyle = st.turn === 'p1' ? '#38bdf8' : '#cbd5e1';
    ctx.font = '700 13px Fredoka, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(names.groom.slice(0, 12), sbX + avatarR * 2 + 20, sbY + sbH / 2 - 8);
    ctx.fillStyle = st.turn === 'p1' ? '#ffd166' : '#64748b';
    ctx.font = '600 10px Fredoka, sans-serif';
    ctx.fillText(st.turn === 'p1' ? '● SUA VEZ' : 'AGUARDANDO', sbX + avatarR * 2 + 20, sbY + sbH / 2 + 10);

    // Nome Noiva
    ctx.fillStyle = st.turn === 'p2' ? '#ff5d8f' : '#cbd5e1';
    ctx.font = '700 13px Fredoka, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(names.bride.slice(0, 12), sbX + sbW - avatarR * 2 - 20, sbY + sbH / 2 - 8);
    ctx.fillStyle = st.turn === 'p2' ? '#ffd166' : '#64748b';
    ctx.font = '600 10px Fredoka, sans-serif';
    ctx.fillText(st.turn === 'p2' ? 'SUA VEZ ●' : 'AGUARDANDO', sbX + sbW - avatarR * 2 - 20, sbY + sbH / 2 + 10);

    // Placar Central
    ctx.fillStyle = '#ffffff';
    ctx.font = '700 24px "Press Start 2P", monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`${st.scoreP1} - ${st.scoreP2}`, width / 2, sbY + sbH / 2 - 2);
    ctx.fillStyle = '#ffd166';
    ctx.font = '700 10px Fredoka, sans-serif';
    ctx.fillText('META: 3 GOLS', width / 2, sbY + sbH - 9);
    ctx.restore();

    // 3. Moldura Externa do Campo & Gramado Esmeralda em Faixas Verticais Vívidas
    ctx.save();
    ctx.fillStyle = '#064e3b';
    ctx.beginPath();
    ctx.roundRect(m.fx - 10, m.fy - 10, m.fw + 20, m.fh + 20, 14);
    ctx.fill();

    // Faixas verticais de grama em dois tons de verde esmeralda bem vívido
    ctx.beginPath();
    ctx.rect(m.fx, m.fy, m.fw, m.fh);
    ctx.clip();

    const stripes = 12;
    const stripeW = m.fw / stripes;
    for (let i = 0; i < stripes; i++) {
      ctx.fillStyle = i % 2 === 0 ? '#10b981' : '#059669';
      ctx.fillRect(m.fx + i * stripeW, m.fy, stripeW + 1, m.fh);
    }
    ctx.restore();

    // 4. Linhas Brancas Nítidas do Campo
    ctx.save();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.94)';
    ctx.lineWidth = 2.6;

    // Borda externa
    ctx.strokeRect(m.fx, m.fy, m.fw, m.fh);

    // Linha do meio-campo
    ctx.beginPath();
    ctx.moveTo(m.cx, m.fy);
    ctx.lineTo(m.cx, m.fy + m.fh);
    ctx.stroke();

    // Círculo central + ponto
    const centerR = m.fh * 0.19;
    ctx.beginPath();
    ctx.arc(m.cx, m.cy, centerR, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(m.cx, m.cy, 4.5, 0, Math.PI * 2);
    ctx.fill();

    // Grandes Áreas e Pequenas Áreas (Esquerda e Direita)
    const boxW = m.fw * 0.15;
    const boxH = m.fh * 0.54;
    const smallBoxW = m.fw * 0.06;
    const smallBoxH = m.fh * 0.30;

    // Esquerda
    ctx.strokeRect(m.fx, m.cy - boxH / 2, boxW, boxH);
    ctx.strokeRect(m.fx, m.cy - smallBoxH / 2, smallBoxW, smallBoxH);
    ctx.beginPath();
    ctx.arc(m.fx + m.fw * 0.11, m.cy, 3.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(m.fx + m.fw * 0.11, m.cy, m.fh * 0.14, -0.78, 0.78);
    ctx.stroke();

    // Direita
    ctx.strokeRect(m.fx + m.fw - boxW, m.cy - boxH / 2, boxW, boxH);
    ctx.strokeRect(m.fx + m.fw - smallBoxW, m.cy - smallBoxH / 2, smallBoxW, smallBoxH);
    ctx.beginPath();
    ctx.arc(m.fx + m.fw * 0.89, m.cy, 3.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(m.fx + m.fw * 0.89, m.cy, m.fh * 0.14, Math.PI - 0.78, Math.PI + 0.78);
    ctx.stroke();

    // Arcos de Escanteio
    const cr = 13;
    [
      [m.fx, m.fy, 0, Math.PI / 2],
      [m.fx + m.fw, m.fy, Math.PI / 2, Math.PI],
      [m.fx + m.fw, m.fy + m.fh, Math.PI, Math.PI * 1.5],
      [m.fx, m.fy + m.fh, Math.PI * 1.5, Math.PI * 2]
    ].forEach(([cxC, cyC, a1, a2]) => {
      ctx.beginPath();
      ctx.arc(cxC, cyC, cr, a1, a2);
      ctx.stroke();
    });
    ctx.restore();

    // 5. Gols com Redes Quadriculadas
    const drawGoalNet = (gx, gy, gw, gh, isLeft) => {
      ctx.save();
      ctx.fillStyle = 'rgba(15, 23, 42, 0.45)';
      ctx.fillRect(gx, gy, gw, gh);

      ctx.beginPath();
      ctx.rect(gx, gy, gw, gh);
      ctx.clip();

      // Malha quadriculada branca
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.55)';
      ctx.lineWidth = 1.2;
      const step = 8;
      for (let x = gx; x <= gx + gw; x += step) {
        ctx.beginPath();
        ctx.moveTo(x, gy);
        ctx.lineTo(x, gy + gh);
        ctx.stroke();
      }
      for (let y = gy; y <= gy + gh; y += step) {
        ctx.beginPath();
        ctx.moveTo(gx, y);
        ctx.lineTo(gx + gw, y);
        ctx.stroke();
      }
      ctx.restore();

      // Estrutura metálica do gol + postes
      ctx.save();
      ctx.strokeStyle = isLeft ? '#38bdf8' : '#ff5d8f';
      ctx.lineWidth = 3.5;
      ctx.strokeRect(gx, gy, gw, gh);

      ctx.fillStyle = '#ffffff';
      const postX = isLeft ? gx + gw : gx;
      [gy, gy + gh].forEach((py) => {
        ctx.beginPath();
        ctx.arc(postX, py, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      });
      ctx.restore();
    };

    drawGoalNet(m.fx - m.goalW, m.goalTop, m.goalW, m.goalH, true);
    drawGoalNet(m.fx + m.fw, m.goalTop, m.goalW, m.goalH, false);

    // 6. Mira Direcional + Medidor de Força ao Arrastar
    if (st.phase === 'aim' && st.dragBtnId) {
      const btn = st.buttons.find((b) => b.id === st.dragBtnId);
      if (btn) {
        const dx = btn.x - st.dragX;
        const dy = btn.y - st.dragY;
        const dist = Math.hypot(dx, dy);
        if (dist >= 10) {
          const maxPull = Math.min(130, m.fw * 0.19);
          const ratio = Math.min(1, dist / maxPull);
          const aimLen = 40 + ratio * 120;
          const angle = Math.atan2(dy, dx);
          const tipX = btn.x + Math.cos(angle) * aimLen;
          const tipY = btn.y + Math.sin(angle) * aimLen;

          const pwrColor = ratio < 0.45 ? '#22c55e' : ratio < 0.78 ? '#facc15' : '#ef4444';

          ctx.save();
          // Anel de potência ao redor do botão
          ctx.beginPath();
          ctx.arc(btn.x, btn.y, btn.r + 8, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * ratio);
          ctx.strokeStyle = pwrColor;
          ctx.lineWidth = 5;
          ctx.lineCap = 'round';
          ctx.stroke();

          // Linha elástica de puxada
          ctx.setLineDash([5, 5]);
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(btn.x, btn.y);
          ctx.lineTo(st.dragX, st.dragY);
          ctx.stroke();
          ctx.setLineDash([]);

          // Seta direcional à frente
          ctx.strokeStyle = pwrColor;
          ctx.lineWidth = 5;
          ctx.beginPath();
          ctx.moveTo(btn.x, btn.y);
          ctx.lineTo(tipX, tipY);
          ctx.stroke();

          // Ponta da seta
          ctx.fillStyle = pwrColor;
          ctx.beginPath();
          ctx.moveTo(tipX + Math.cos(angle) * 12, tipY + Math.sin(angle) * 12);
          ctx.lineTo(tipX + Math.cos(angle + 2.45) * 12, tipY + Math.sin(angle + 2.45) * 12);
          ctx.lineTo(tipX + Math.cos(angle - 2.45) * 12, tipY + Math.sin(angle - 2.45) * 12);
          ctx.closePath();
          ctx.fill();

          // Porcentagem de força
          ctx.fillStyle = '#ffffff';
          ctx.font = '700 12px Fredoka, sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(`${Math.round(ratio * 100)}%`, btn.x, btn.y - btn.r - 16);
          ctx.restore();
        }
      }
    }

    // 7. Botões 5x5 com Borda Metálica, Anel Pulsante de Turno e Foto Real Recortada
    const pulse = 0.55 + Math.sin(time * 6) * 0.45;
    st.buttons.forEach((b) => {
      const isP1 = b.team === 'p1';
      const isTurnTeam = st.phase === 'aim' && b.team === st.turn;

      ctx.save();
      // Sombra no gramado
      ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
      ctx.beginPath();
      ctx.arc(b.x + 2, b.y + 4, b.r, 0, Math.PI * 2);
      ctx.fill();

      // Anel luminoso pulsante no turno do jogador
      if (isTurnTeam) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.r + 4 + pulse * 3, 0, Math.PI * 2);
        ctx.strokeStyle = isP1
          ? `rgba(56, 189, 248, ${0.45 + pulse * 0.5})`
          : `rgba(255, 93, 143, ${0.45 + pulse * 0.5})`;
        ctx.lineWidth = 3;
        ctx.shadowColor = isP1 ? '#38bdf8' : '#ff5d8f';
        ctx.shadowBlur = 12;
        ctx.stroke();
        ctx.restore();
      }

      // Aro metálico externo
      const ringGrad = ctx.createLinearGradient(b.x - b.r, b.y - b.r, b.x + b.r, b.y + b.r);
      if (isP1) {
        ringGrad.addColorStop(0, '#7dd3fc');
        ringGrad.addColorStop(0.5, '#0284c7');
        ringGrad.addColorStop(1, '#1e3a8a');
      } else {
        ringGrad.addColorStop(0, '#ffd166');
        ringGrad.addColorStop(0.5, '#ff5d8f');
        ringGrad.addColorStop(1, '#9d174d');
      }

      ctx.fillStyle = ringGrad;
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
      ctx.fill();

      // Borda fina brilhante
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.6;
      ctx.stroke();

      // Foto Real do Noivo ou da Noiva recortada perfeitamente em círculo no centro
      const photoR = b.r - 4.5;
      if (ctxApi.drawCoupleAvatar) {
        ctxApi.drawCoupleAvatar(ctx, isP1 ? 'groom' : 'bride', b.x, b.y, photoR);
      }

      // Brilho vítreo sutil de botão de acrílico
      ctx.beginPath();
      ctx.arc(b.x, b.y - b.r * 0.18, photoR * 0.86, Math.PI * 1.15, Math.PI * 1.85);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.restore();
    });

    // 8. Bola de Futebol Clássica
    const ball = st.ball;
    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
    ctx.beginPath();
    ctx.arc(ball.x + 2, ball.y + 3, ball.r, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 1.8;
    ctx.stroke();

    // Pentágono central + detalhes da bola
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.r * 0.34, 0, Math.PI * 2);
    ctx.fill();
    for (let k = 0; k < 5; k++) {
      const a = (k * Math.PI * 2) / 5;
      ctx.beginPath();
      ctx.arc(ball.x + Math.cos(a) * ball.r * 0.78, ball.y + Math.sin(a) * ball.r * 0.78, ball.r * 0.19, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    // 9. Banner de Gol Comemorativo
    if (st.phase === 'goal' && st.goalBanner) {
      ctx.save();
      const bw = Math.min(width - 40, 460);
      ctx.fillStyle = 'rgba(15, 23, 42, 0.94)';
      ctx.strokeStyle = st.goalColor;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.roundRect(width / 2 - bw / 2, m.cy - 34, bw, 68, 16);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.font = '700 22px Fredoka, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(st.goalBanner, width / 2, m.cy);
      ctx.restore();
    }

    ctx.restore();
  }
};


// ============================================================================
// minigames.js - Gerenciador Central dos 12 Minigames da Lua de Mel
// Importa e orquestra games_part1.js (1-4), games_part2.js (5-8) e games_part3.js (9-12)
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
  Minigame11_Torre,
  Minigame12_FutebolBotao
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

// ============================================================================
// PRÉ-CARREGAMENTO SEGURO DAS FOTOS REAIS DO CASAL (COM FALLBACK CARTOON)
// ============================================================================
const couplePhotos = {
  groom: { img: new Image(), loaded: false, error: false, src: 'noivo.png' },
  bride: { img: new Image(), loaded: false, error: false, src: 'noiva.png' }
};

function preloadCouplePhotos() {
  ['groom', 'bride'].forEach((key) => {
    const entry = couplePhotos[key];
    entry.img.onload = () => {
      if (entry.img.naturalWidth > 0 && entry.img.naturalHeight > 0) {
        entry.loaded = true;
        entry.error = false;
      }
    };
    entry.img.onerror = () => {
      entry.error = true;
      entry.loaded = false;
    };
    entry.img.src = entry.src;
  });
}
preloadCouplePhotos();

function drawCoupleAvatar(targetCtx, who, cx, cy, r, borderColor = null) {
  const isGroom = who === 'groom' || who === 'p1';
  const entry = isGroom ? couplePhotos.groom : couplePhotos.bride;

  targetCtx.save();
  targetCtx.beginPath();
  targetCtx.arc(cx, cy, r, 0, Math.PI * 2);
  targetCtx.clip();

  if (entry && entry.loaded && !entry.error && entry.img.naturalWidth > 0) {
    const iw = entry.img.naturalWidth;
    const ih = entry.img.naturalHeight;
    const scale = Math.max((r * 2) / iw, (r * 2) / ih);
    const dw = iw * scale;
    const dh = ih * scale;
    const dx = cx - dw / 2;
    // Leve viés superior para centralizar o rosto em retratos verticais
    const dy = cy - dh * 0.42;
    targetCtx.drawImage(entry.img, dx, dy, dw, dh);
  } else {
    // Fallback cartoon nítido caso a foto não carregue
    targetCtx.fillStyle = isGroom ? '#1e3a8a' : '#9d174d';
    targetCtx.fillRect(cx - r, cy - r, r * 2, r * 2);
    targetCtx.font = `${Math.max(12, Math.floor(r * 1.15))}px sans-serif`;
    targetCtx.textAlign = 'center';
    targetCtx.textBaseline = 'middle';
    targetCtx.fillText(isGroom ? '🤵' : '👰', cx, cy + 1);
  }
  targetCtx.restore();

  if (borderColor) {
    targetCtx.save();
    targetCtx.beginPath();
    targetCtx.arc(cx, cy, r, 0, Math.PI * 2);
    targetCtx.strokeStyle = borderColor;
    targetCtx.lineWidth = Math.max(2, r * 0.14);
    targetCtx.stroke();
    targetCtx.restore();
  }
}

function resetAllKeys() {
  Object.keys(state.keys).forEach((k) => {
    state.keys[k] = false;
  });
}
window.addEventListener('blur', resetAllKeys);

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
  },
  {
    id: 'fotografo',
    placement: 'low',
    actionText: '⬆️ PULE!',
    label: 'FOTÓGRAFO APRESSADO',
    sub: 'Flash na Cara!',
    emoji: '📸',
    color: '#0284c7',
    accent: '#bae6fd',
    w: 64,
    h: 56,
    quote: 'O fotógrafo se jogou na frente do casal para tirar foto!'
  },
  {
    id: 'convite',
    placement: 'high',
    actionText: '⬇️ ABAIXE!',
    label: 'PERGUNTA: "E A CASA?"',
    sub: 'Fofoca no Ar!',
    emoji: '💬',
    color: '#d97706',
    accent: '#fef3c7',
    w: 68,
    h: 54,
    quote: 'Não abaixou a tempo e levou a pergunta "Já compraram a casa?" na cabeça!'
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
    obstacles: [],
    powerups: [],
    powerupTimer: 3.5,
    turboTimer: 0
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
    projectiles: [],
    cakeHp: 100,
    maxCakeHp: 100,
    cakeShakeTimer: 0,
    collectibles: [],
    collectibleTimer: 3.5,
    waiter: null,
    waiterTimer: 14.0
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
  getMode: () => state.mode,
  getTime: () => state.time,
  getCouplePhotos: () => couplePhotos,
  drawCoupleAvatar: (targetCtx, who, cx, cy, r, borderColor) =>
    drawCoupleAvatar(targetCtx, who, cx, cy, r, borderColor),
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

function cleanupActiveMinigame() {
  if (progression.activeMinigame && progression.activeMinigame.onExit) {
    try { progression.activeMinigame.onExit(ctxApi); } catch (_) {}
  }
  progression.activeMinigame = null;
  state.mgState = {};
  resetAllKeys();
}

function openMinigamesHub() {
  cleanupActiveMinigame();
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
  cleanupActiveMinigame();
  const stage = progression.getStageById(stageId);
  if (stage.id === 'phase1') {
    startPhase1(fromNetwork);
  } else if (stage.id === 'phase2') {
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
  cleanupActiveMinigame();
  if (transitionTimerId) {
    clearInterval(transitionTimerId);
    transitionTimerId = null;
  }
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
  p1.p1 = { y: 0, vy: 0, jumping: false, ducking: false, duckHold: false, duckTimer: 0, runCycle: 0, hasShield: false };
  p1.p2 = { y: 0, vy: 0, jumping: false, ducking: false, duckHold: false, duckTimer: 0, runCycle: 0, hasShield: false };
  p1.obstacles = [];
  p1.powerups = [];
  p1.powerupTimer = 3.2;
  p1.turboTimer = 0;

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
  p2.cakeHp = 100;
  p2.maxCakeHp = 100;
  p2.cakeShakeTimer = 0;
  p2.collectibles = [];
  p2.collectibleTimer = 3.5;
  p2.waiter = null;
  p2.waiterTimer = 14.0;

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
  if (state.screen === 'batatinha' || state.screen === 'victory') return;

  if (transitionTimerId) {
    clearInterval(transitionTimerId);
    transitionTimerId = null;
  }
  resetAllKeys();

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
  state.freezeFrame = true;
  resetAllKeys();

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
  state.freezeFrame = true;
  resetAllKeys();

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

const handleCanvasPointerRelease = () => {
  if (!progression.activeMinigame) return;
  if (progression.activeMinigame.onPointerUp) {
    progression.activeMinigame.onPointerUp(ctxApi);
  }
  if (state.mode === 'guest' || state.mode === 'host') {
    net.send({ type: 'mg_pointer_up' });
  }
};

window.addEventListener('pointerup', handleCanvasPointerRelease);
window.addEventListener('pointercancel', handleCanvasPointerRelease);

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

  if (!p1.powerups) p1.powerups = [];
  if (p1.turboTimer > 0) p1.turboTimer -= dt;

  let speed = p1.speed + p1.progress * 1.4;
  if (p1.turboTimer > 0) speed *= 1.40;

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

  // Spawna Power-ups periódicos (Café Turbo, Escudo de Aliança, Buquê da Sorte)
  p1.powerupTimer = (p1.powerupTimer || 3.5) - dt;
  if (p1.powerupTimer <= 0 && p1.progress < 90) {
    p1.powerupTimer = 4.0 + Math.random() * 2.8;
    const pTypes = [
      { id: 'coffee', emoji: '☕', name: 'CAFÉ TURBO', color: '#f59e0b' },
      { id: 'shield', emoji: '💍', name: 'ESCUDO SAGRADO', color: '#ffd166' },
      { id: 'bouquet', emoji: '💐', name: 'BUQUÊ DA SORTE', color: '#ec4899' }
    ];
    const pType = pTypes[Math.floor(Math.random() * pTypes.length)];
    const pLane = Math.random() < 0.5 ? 0 : 1;
    const isHigh = Math.random() < 0.35;
    p1.powerups.push({
      lane: pLane,
      x: state.width + 60,
      y: isHigh ? -36 : 0,
      type: pType
    });
  }

  // Atualiza e coleta Power-ups
  const pX = getPhase1PlayerX();
  for (let i = p1.powerups.length - 1; i >= 0; i--) {
    const pu = p1.powerups[i];
    pu.x -= speed * dt;
    const actor = pu.lane === 0 ? p1.p1 : p1.p2;
    const laneGroundY = getPhase1LaneY(pu.lane);
    const actorCenterY = laneGroundY + actor.y - 25;
    const puCenterY = laneGroundY + pu.y - 18;

    if (Math.abs(pu.x - pX) < 32 && Math.abs(actorCenterY - puCenterY) < 38) {
      if (pu.type.id === 'coffee') {
        p1.turboTimer = 5.0;
        spawnFloatingText(pX, laneGroundY - 60, '☕ CAFÉ TURBO +40%!', '#f59e0b');
        sfx.playAltarFanfare();
      } else if (pu.type.id === 'shield') {
        actor.hasShield = true;
        spawnFloatingText(pX, laneGroundY - 60, '💍 ESCUDO DE ALIANÇA!', '#ffd166');
        sfx.playBounce();
      } else if (pu.type.id === 'bouquet') {
        p1.progress = Math.min(92, p1.progress + 8);
        spawnFloatingText(pX, laneGroundY - 60, '💐 BUQUÊ DA SORTE +8%!', '#ec4899');
        spawnConfettiBurst(25);
        sfx.playAltarFanfare();
      }
      p1.powerups.splice(i, 1);
      continue;
    }
    if (pu.x < -60) p1.powerups.splice(i, 1);
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
      if (actor.hasShield) {
        actor.hasShield = false;
        obs.x = -999;
        spawnParticles(playerX + 20, laneGroundY - obs.h / 2, '#ffd166', 22, 240);
        sfx.playBounce();
        spawnFloatingText(playerX, laneGroundY - 65, '💍 ESCUDO SALVOU DO BOLETO!', '#ffd166');
        continue;
      }
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
  const minDim = Math.min(state.width, state.height - 60);
  p2.cakeRadius = Math.max(40, Math.min(58, minDim * 0.11));
  p2.orbitRadius = p2.cakeRadius + Math.max(42, Math.min(64, minDim * 0.12));
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

  if (p2.cakeShakeTimer > 0) p2.cakeShakeTimer -= dt;
  if (!p2.collectibles) p2.collectibles = [];

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

  // Spawna Docinhos Coletáveis (Brigadeiros e Champanhe)
  p2.collectibleTimer = (p2.collectibleTimer || 3.5) - dt;
  if (p2.collectibleTimer <= 0) {
    p2.collectibleTimer = 4.2 + Math.random() * 2.8;
    const cTypes = [
      { id: 'cupcake', emoji: '🧁', name: 'BRIGADEIRO', color: '#ec4899' },
      { id: 'champagne', emoji: '🍾', name: 'CHAMPANHE', color: '#f59e0b' }
    ];
    const cType = cTypes[Math.random() < 0.65 ? 0 : 1];
    const colAngle = Math.random() * Math.PI * 2;
    p2.collectibles.push({
      x: cx + Math.cos(colAngle) * p2.orbitRadius,
      y: cy + Math.sin(colAngle) * p2.orbitRadius,
      type: cType,
      life: 8.0
    });
  }

  // Evento Especial do Garçom com Coxinhas (Distração em Massa)
  p2.waiterTimer = (p2.waiterTimer || 14.0) - dt;
  if (p2.waiterTimer <= 0 && !p2.waiter) {
    p2.waiterTimer = 16.0;
    p2.waiter = {
      x: -40,
      y: cy - 130,
      vx: 65,
      timer: 6.0,
      active: true
    };
    spawnFloatingText(cx, cy - 85, '🧑‍🍳 GARÇOM: SAINDO COXINHAS QUENTINHAS! 🥟', '#ffd166');
    sfx.playAltarFanfare();
  }
  if (p2.waiter) {
    p2.waiter.x += p2.waiter.vx * dt;
    p2.waiter.timer -= dt;
    if (p2.waiter.timer <= 0 || p2.waiter.x > state.width + 60) {
      p2.waiter = null;
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

  // Jogadores coletam Brigadeiros e Champanhe na órbita
  for (let c = p2.collectibles.length - 1; c >= 0; c--) {
    const col = p2.collectibles[c];
    col.life -= dt;
    if (col.life <= 0) { p2.collectibles.splice(c, 1); continue; }

    const distP1 = Math.hypot(col.x - p1X, col.y - p1Y);
    const distP2 = Math.hypot(col.x - p2X, col.y - p2Y);
    if (distP1 < 36 || distP2 < 36) {
      if (col.type.id === 'cupcake') {
        p2.cakeHp = Math.min(100, (p2.cakeHp || 100) + 25);
        sfx.playBounce();
        spawnParticles(col.x, col.y, '#ec4899', 16, 180);
        spawnFloatingText(col.x, col.y - 20, '🧁 REPAROU O BOLO +25%!', '#06d6a0');
      } else if (col.type.id === 'champagne') {
        sfx.playAltarFanfare();
        spawnParticles(cx, cy, '#ffd166', 35, 320);
        spawnFloatingText(cx, cy - 60, '🍾 ONDA DE CHOQUE DE ESPUMA!', '#ffd166');
        p2.enemies.forEach((e) => {
          const ddx = e.x - cx;
          const ddy = e.y - cy;
          const dist = Math.hypot(ddx, ddy) || 1;
          e.bounced = true;
          e.vx = (ddx / dist) * 450;
          e.vy = (ddy / dist) * 450;
          e.life = 0.55;
        });
      }
      p2.collectibles.splice(c, 1);
    }
  }

  for (let i = p2.enemies.length - 1; i >= 0; i--) {
    const en = p2.enemies[i];

    if (en.bounced) {
      en.x += en.vx * dt;
      en.y += en.vy * dt;
      en.life -= dt;
      if (en.life <= 0) p2.enemies.splice(i, 1);
      continue;
    }

    // Se o garçom estiver passando com coxinhas, convidados são atraídos por ele!
    let targetX = cx;
    let targetY = cy;
    if (p2.waiter && p2.waiter.active) {
      targetX = p2.waiter.x;
      targetY = p2.waiter.y;
    }
    const dx = targetX - en.x;
    const dy = targetY - en.y;
    const distToCenter = Math.hypot(cx - en.x, cy - en.y) || 1;
    const distToTarget = Math.hypot(dx, dy) || 1;
    const dirX = dx / distToTarget;
    const dirY = dy / distToTarget;

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

    // 3. Checa se encostou no Bolo de Casamento -> Dano no Glacê ou Batatinha!
    if (distToCenter < p2.cakeRadius + en.radius - 6) {
      p2.cakeHp = Math.max(0, (p2.cakeHp || 100) - 34);
      p2.cakeShakeTimer = 0.45;
      en.bounced = true;
      en.vx = -(cx - en.x) / distToCenter * 350;
      en.vy = -(cy - en.y) / distToCenter * 350;
      en.life = 0.45;
      sfx.playBounce();
      spawnParticles(cx, cy, '#ff3355', 20, 200);
      spawnFloatingText(cx, cy - 35, '🍰 MORDIDA NO GLACÊ! -34%', '#ef4444');

      if (p2.cakeHp <= 0) {
        triggerBatatinha(
          en.type.quote,
          2,
          { x: en.x, y: en.y, r: 42, label: en.type.name }
        );
        return;
      }
      continue;
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
      turboTimer: p1.turboTimer || 0,
      p1: p1.p1,
      p2: p1.p2,
      powerups: (p1.powerups || []).map((pu) => ({
        lane: pu.lane,
        x: pu.x,
        y: pu.y,
        type: pu.type
      })),
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
      cakeHp: p2.cakeHp,
      cakeShakeTimer: p2.cakeShakeTimer,
      p1Angle: p2.p1Angle,
      p2Angle: p2.p2Angle,
      waiter: p2.waiter,
      collectibles: (p2.collectibles || []).map((c) => ({
        x: c.x,
        y: c.y,
        type: c.type
      })),
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
  } else if (progression.activeMinigame && progression.activeMinigame.id === 'mg12_futebol_botao') {
    const st = state.mgState;
    if (st && st.metrics && st.buttons && st.ball) {
      const m = st.metrics;
      net.send({
        type: 'sync_mg12',
        turn: st.turn,
        phase: st.phase,
        scoreP1: st.scoreP1,
        scoreP2: st.scoreP2,
        goalBanner: st.goalBanner,
        goalColor: st.goalColor,
        buttons: st.buttons.map((b) => ({
          id: b.id,
          rx: (b.x - m.fx) / (m.fw || 1),
          ry: (b.y - m.fy) / (m.fh || 1)
        })),
        ball: {
          rx: (st.ball.x - m.fx) / (m.fw || 1),
          ry: (st.ball.y - m.fy) / (m.fh || 1)
        }
      });
    }
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
        p1.turboTimer = data.turboTimer || 0;
        p1.p1 = data.p1;
        p1.p2 = data.p2;
        p1.powerups = data.powerups || [];
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
        if (typeof data.cakeHp === 'number') p2.cakeHp = data.cakeHp;
        if (typeof data.cakeShakeTimer === 'number') p2.cakeShakeTimer = data.cakeShakeTimer;
        p2.p1Angle = data.p1Angle;
        p2.p2Angle = data.p2Angle;
        p2.waiter = data.waiter || null;
        p2.collectibles = data.collectibles || [];
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

    case 'sync_mg12':
      if (state.mode === 'guest' && progression.activeMinigame && progression.activeMinigame.id === 'mg12_futebol_botao') {
        const st = state.mgState;
        if (st && st.metrics && st.buttons && st.ball) {
          const m = st.metrics;
          st.turn = data.turn;
          st.phase = data.phase;
          st.scoreP1 = data.scoreP1;
          st.scoreP2 = data.scoreP2;
          st.goalBanner = data.goalBanner;
          st.goalColor = data.goalColor;
          (data.buttons || []).forEach((rb) => {
            const lb = st.buttons.find((b) => b.id === rb.id);
            if (lb) {
              lb.x = m.fx + rb.rx * m.fw;
              lb.y = m.fy + rb.ry * m.fh;
            }
          });
          if (data.ball) {
            st.ball.x = m.fx + data.ball.rx * m.fw;
            st.ball.y = m.fy + data.ball.ry * m.fh;
          }
        }
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
        progression.activeMinigame.onPointerDown(data.x, data.y, ctxApi, true);
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

  // Desenha Power-ups na Pista (Café Turbo, Escudo de Aliança, Buquê)
  if (p1.powerups) {
    p1.powerups.forEach((pu) => {
      const laneY = getPhase1LaneY(pu.lane);
      const py = laneY + pu.y - 18 + Math.sin(state.time * 6 + pu.x * 0.05) * 4;
      ctx.save();
      ctx.shadowBlur = 14;
      ctx.shadowColor = pu.type.color;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.92)';
      ctx.beginPath();
      ctx.arc(pu.x, py, 18, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = pu.type.color;
      ctx.lineWidth = 3;
      ctx.stroke();

      ctx.font = '20px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(pu.type.emoji, pu.x, py);

      ctx.font = '700 10px Fredoka, sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.fillText(pu.type.name, pu.x, py - 24);
      ctx.restore();
    });
  }

  // Desenha Noivo (Pista 0) e Noiva (Pista 1)
  const playerX = getPhase1PlayerX();
  drawGroomCharacter(playerX, getPhase1LaneY(0) + p1.p1.y, p1.p1.runCycle, 1, true, p1.p1.ducking);
  drawBrideCharacter(playerX, getPhase1LaneY(1) + p1.p2.y, p1.p2.runCycle, 1, true, p1.p2.ducking);

  // Escudo Sagrado ativo nos corredores
  [p1.p1, p1.p2].forEach((actor, lane) => {
    if (actor.hasShield) {
      const gy = getPhase1LaneY(lane) + actor.y - 25;
      ctx.save();
      ctx.strokeStyle = '#ffd166';
      ctx.lineWidth = 3.5;
      ctx.shadowBlur = 15;
      ctx.shadowColor = '#f59e0b';
      ctx.beginPath();
      ctx.arc(playerX + 18, gy, 28, 0, Math.PI * 2);
      ctx.stroke();
      ctx.font = '16px sans-serif';
      ctx.fillText('💍', playerX + 18, gy - 32);
      ctx.restore();
    }
  });

  // Rastro de Fogo do Café Turbo
  if (p1.turboTimer > 0) {
    ctx.save();
    ctx.fillStyle = '#ffd166';
    ctx.font = '700 13px Fredoka, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('⚡ CAFÉ TURBO ATIVO! (+40% VELOCIDADE) ⚡', state.width / 2, 88);
    ctx.restore();
  }

  // Desenha Obstáculos por cima
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

  // Desenha Docinhos Coletáveis (Brigadeiros e Champanhe)
  if (p2.collectibles) {
    p2.collectibles.forEach((c) => {
      ctx.save();
      const pulse = 1 + Math.sin(state.time * 7) * 0.12;
      ctx.translate(c.x, c.y);
      ctx.scale(pulse, pulse);
      ctx.font = '24px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.shadowBlur = 12;
      ctx.shadowColor = c.type.color;
      ctx.fillText(c.type.emoji, 0, 0);
      ctx.restore();
    });
  }

  // Desenha Garçom elegante com bandeja de coxinhas se ativo
  if (p2.waiter) {
    ctx.save();
    ctx.translate(p2.waiter.x, p2.waiter.y);
    ctx.font = '32px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🧑‍🍳', 0, 0);
    ctx.fillText('🥟', 20, -10);

    ctx.fillStyle = 'rgba(10, 4, 24, 0.85)';
    ctx.strokeStyle = '#ffd166';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(-50, -36, 100, 22, 6);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#ffd166';
    ctx.font = '700 10px Fredoka, sans-serif';
    ctx.fillText('COXINHAS!', 0, -23);
    ctx.restore();
  }

  // Tremor no bolo se levou mordida
  const shakeX = p2.cakeShakeTimer > 0 ? (Math.random() - 0.5) * 8 : 0;
  const shakeY = p2.cakeShakeTimer > 0 ? (Math.random() - 0.5) * 8 : 0;

  // Desenha o Bolo de Casamento Gigante de 3 Andares no Centro
  drawWeddingCake(cx + shakeX, cy + shakeY, p2.cakeRadius);

  // Barra de Integridade do Bolo de Casamento
  const cakeHp = p2.cakeHp !== undefined ? p2.cakeHp : 100;
  const barW = 140;
  const barH = 14;
  const barX = cx - barW / 2;
  const barY = cy - p2.cakeRadius - 32;

  ctx.save();
  ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
  ctx.fillRect(barX, barY, barW, barH);
  ctx.fillStyle = cakeHp > 50 ? '#10b981' : cakeHp > 25 ? '#f59e0b' : '#ef4444';
  ctx.fillRect(barX, barY, Math.max(0, (barW * cakeHp) / 100), barH);
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(barX, barY, barW, barH);

  ctx.fillStyle = '#ffffff';
  ctx.font = '700 9px Fredoka, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(`🎂 GLACÊ: ${Math.round(cakeHp)}%`, cx, barY + 10);
  ctx.restore();

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

let rafId = null;

function gameLoop(now) {
  const dt = Math.min(0.05, Math.max(0, (now - lastTime) / 1000));
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
    } else if (activeMg && activeMg.onUpdate && state.screen === activeMg.id) {
      activeMg.onUpdate(dt, ctxApi);
      broadcastHostState(dt);
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

  rafId = requestAnimationFrame(gameLoop);
}

function startMainLoop() {
  if (rafId !== null) {
    cancelAnimationFrame(rafId);
    rafId = null;
  }
  lastTime = performance.now();
  rafId = requestAnimationFrame(gameLoop);
}

startMainLoop();

// ============================================================================
// BOTÕES DE UI E NAVEGAÇÃO
// ============================================================================

function returnToMenu() {
  if (transitionTimerId) {
    clearInterval(transitionTimerId);
    transitionTimerId = null;
  }
  cleanupActiveMinigame();
  net.disconnect();
  state.mode = 'local';
  state.screen = 'menu';
  state.freezeFrame = false;
  showOverlayScreen('menu');
  startMainLoop();
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
