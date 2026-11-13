// ============================================================================
// games_part2.js - Minigames 5 a 8 da "Operação Lua de Mel"
// 5. Jump King | 6. X1 de Louça | 7. Flappy Duplo | 8. Top Gear Retrô
// ============================================================================

// ============================================================================
// MINIGAME 5: JUMP KING DO CASAL (ESCALADA DE PRECISÃO)
// ============================================================================
export const Minigame5_JumpKing = {
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

export const Minigame6_Louca = {
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
export const Minigame7_Flappy = {
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
export const Minigame8_TopGear = {
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

