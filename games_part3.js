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
// ============================================================================
export const Minigame11_Torre = {
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
