// ============================================================================
// game.js - Motor Principal "Operação Lua de Mel"
// HTML5 Canvas + ES6 Modular + Multiplayer Local & Online P2P (PeerJS)
// ============================================================================

import { SoundManager } from './audio.js';
import { NetworkManager } from './network.js';
import { MinigameProgression } from './minigames.js';

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
  groomName: 'Prof. Noivo',
  brideName: 'Noiva',

  width: 960,
  height: 540,
  time: 0,
  freezeFrame: false,
  usedWKey: false,
  usedSpaceKey: false,

  // Controles ativos
  keys: {
    p1Jump: false,
    p2Jump: false,
    p1Left: false,
    p1Right: false,
    p2Left: false,
    p2Right: false
  },

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

function resizeCanvas() {
  const rect = canvas.parentElement.getBoundingClientRect();
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  state.width = Math.max(320, rect.width);
  state.height = Math.max(320, rect.height);
  canvas.width = Math.floor(state.width * dpr);
  canvas.height = Math.floor(state.height * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

function syncCoupleNamesFromInputs() {
  const g = (inputGroom.value || '').trim();
  const b = (inputBride.value || '').trim();
  state.groomName = g || 'Prof. Noivo';
  state.brideName = b || 'Noiva';

  previewGroomNames.forEach((el) => { el.textContent = state.groomName; });
  previewBrideNames.forEach((el) => { el.textContent = state.brideName; });
  touchNameP1.textContent = state.groomName;
  touchNameP2.textContent = state.brideName;
}

inputGroom.addEventListener('input', syncCoupleNamesFromInputs);
inputBride.addEventListener('input', syncCoupleNamesFromInputs);

function showOverlayScreen(screenName) {
  [screenMenu, screenOnline, screenTransition, screenBatatinha, screenVictory].forEach((el) => {
    el.classList.add('hidden');
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
  } else {
    // Jogando Fase 1 ou Fase 2
    hudBar.classList.remove('hidden');
    touchOverlay.classList.remove('hidden');
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

function startStageById(stageId, fromNetwork = false) {
  const stage = progression.getStageById(stageId);
  if (stage.id === 'phase1') {
    startPhase1(fromNetwork);
  } else if (stage.id === 'phase2') {
    startPhase2(fromNetwork);
  } else if (stage.enabled && stage.hooks && stage.hooks.onEnter) {
    // Suporte estruturado para futuros minijogos cadastrados em minigames.js
    progression.unlockStage(stage.id);
    state.screen = stage.id;
    state.freezeFrame = false;
    state.culpritHighlight = null;
    hudPhaseBadge.textContent = stage.title;
    showOverlayScreen('playing');
    stage.hooks.onEnter(state);
    if (state.mode === 'host' && !fromNetwork) {
      net.send({ type: 'start_custom_stage', stageId: stage.id });
    }
  }
}

function startPhase1(isResetFromNetwork = false) {
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

  const pool = phaseNum === 1 ? BATATINHA_QUOTES_PHASE1 : BATATINHA_QUOTES_PHASE2;
  const randomQuote = pool[Math.floor(Math.random() * pool.length)];
  const finalQuote = customReason || randomQuote;

  document.getElementById('batatinha-reason').textContent = `"${finalQuote}"`;
  document.getElementById('batatinha-detail').textContent =
    phaseNum === 1
      ? `Fase 1 • Corrida para o Altar (${Math.floor(state.phase1.progress)}% concluído)`
      : `Fase 2 • Defesa do Bolo (Faltavam ${state.phase2.timeLeft.toFixed(1)}s!) • Checkpoint Salvo ✅`;

  // Se perderam na Fase 2 (ou minijogo posterior), libera o botão de Continuar direto da Fase 2!
  const btnContinuePhase = document.getElementById('btn-continue-phase');
  const btnRetry = document.getElementById('btn-retry');

  if (phaseNum >= 2) {
    btnContinuePhase.classList.remove('hidden');
    btnContinuePhase.textContent = `🎂 Continuar na Fase ${phaseNum}`;
    btnRetry.textContent = '🔄 Voltar p/ Fase 1';
  } else {
    btnContinuePhase.classList.add('hidden');
    btnRetry.textContent = '🔄 Tentar Novamente';
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

  document.getElementById('victory-couple-names').textContent =
    `Parabéns, ${state.groomName} & ${state.brideName}! 💍`;

  sfx.playWeddingMarch();
  spawnConfettiBurst(110);
  showOverlayScreen('victory');

  if (state.mode === 'host' && !fromNetwork) {
    net.send({ type: 'victory' });
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
      triggerVictory(true);
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

    case 'start_custom_stage':
      if (data.stageId) {
        startStageById(data.stageId, true);
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

  const activeCustomStage = progression.getStageById(state.screen);
  const isCustomMinigame =
    activeCustomStage &&
    activeCustomStage.id !== 'phase1' &&
    activeCustomStage.id !== 'phase2' &&
    activeCustomStage.enabled &&
    activeCustomStage.hooks;

  if (!state.freezeFrame) {
    if (state.screen === 'phase1') {
      updatePhase1(dt);
      broadcastHostState(dt);
    } else if (state.screen === 'phase2') {
      updatePhase2(dt);
      broadcastHostState(dt);
    } else if (isCustomMinigame && activeCustomStage.hooks.onUpdate) {
      activeCustomStage.hooks.onUpdate(dt, state);
      broadcastHostState(dt);
    }
  }

  if (state.screen === 'phase1' || (state.screen === 'batatinha' && state.failedPhase === 1)) {
    renderPhase1();
  } else if (state.screen === 'phase2' || state.screen === 'victory' || (state.screen === 'batatinha' && state.failedPhase === 2)) {
    renderPhase2();
  } else if (isCustomMinigame && activeCustomStage.hooks.onRender) {
    activeCustomStage.hooks.onRender(ctx, state);
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
  net.disconnect();
  state.mode = 'local';
  state.screen = 'menu';
  state.freezeFrame = false;
  showOverlayScreen('menu');
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

// Botão: Continuar direto da Fase 2 (ou fase atual com checkpoint) na tela "BATATINHA!"
document.getElementById('btn-continue-phase').addEventListener('click', () => {
  sfx.playClick();
  const targetStageId = progression.currentStageId || 'phase2';
  if (state.mode === 'guest') {
    net.send({ type: 'request_continue_phase', stageId: targetStageId });
  } else {
    startStageById(targetStageId, false);
  }
});

// Botão: Tentar Novamente (Reiniciar da Fase 1) na tela "BATATINHA!"
document.getElementById('btn-retry').addEventListener('click', () => {
  sfx.playClick();
  if (state.mode === 'guest') {
    net.send({ type: 'request_retry' });
  } else {
    startPhase1(false);
  }
});

// Botão: Jogar Novamente na tela de Vitória
document.getElementById('btn-play-again').addEventListener('click', () => {
  sfx.playClick();
  if (state.mode === 'guest') {
    net.send({ type: 'request_retry' });
  } else {
    startPhase1(false);
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
