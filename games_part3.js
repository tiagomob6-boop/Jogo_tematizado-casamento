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

export const Minigame9_ColarProva = {
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

export const Minigame10_VoceEhIA = {
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
export const Minigame11_Torre = {
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
export const Minigame12_FutebolBotao = {
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
