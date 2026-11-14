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

export const Minigame2_Roguelite = {
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
// MINIGAME 4: SOLAR WARRIOR (XAIN'D SLEENA ARCADE RUN & GUN)
// Visual 100% Fiel à Imagem de Referência + Dificuldade Arcade Intensa!
// ============================================================================
export const Minigame4_Contra = {
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

