// ============================================================================
// games_part1.js - Minigames 1 a 4 da "Operação Lua de Mel"
// 1. Sinuca 2D | 2. Roguelite Coop | 3. Plataforma Lava | 4. Contra Run & Gun
// ============================================================================

// ============================================================================
// MINIGAME 1: SINUCA 2D (DUELO DE CASAL - ESTILO 8 BALL POOL REALISTA)
// ============================================================================
export const Minigame1_Sinuca = {
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

export const Minigame2_Roguelite = {
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
export const Minigame3_Plataforma = {
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
export const Minigame4_Contra = {
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
