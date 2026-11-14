// ============================================================================
// minigames.js - Gerenciador Central dos 12 Minigames da Lua de Mel
// Importa e orquestra games_part1.js (1-4), games_part2.js (5-8) e games_part3.js (9-12)
// ============================================================================

import {
  Minigame1_Sinuca,
  Minigame2_Roguelite,
  Minigame3_Plataforma,
  Minigame4_Contra
} from './games_part1.js';

import {
  Minigame5_JumpKing,
  Minigame6_Louca,
  Minigame7_Flappy,
  Minigame8_TopGear
} from './games_part2.js';

import {
  Minigame9_ColarProva,
  Minigame10_VoceEhIA,
  Minigame11_Torre,
  Minigame12_FutebolBotao
} from './games_part3.js';

export const HONEYMOON_MINIGAMES = [
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

export const MINIGAME_CATALOG = [
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

export class MinigameProgression {
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
