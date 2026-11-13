// ============================================================================
// minigames.js - Arquitetura Modular e Registro de Fases / Minijogos
// Preparado para expansão futura (novos minijogos de casamento / lua de mel)
// ============================================================================

/**
 * Interface padrão para cada Fase / Minijogo registrado:
 * {
 *   id: string,              // Identificador único (ex: 'phase1', 'phase2', 'minigame_buque')
 *   order: number,           // Ordem na campanha
 *   title: string,           // Nome exibido no HUD e transições
 *   subtitle: string,        // Instrução rápida
 *   enabled: boolean,        // true = ativo no fluxo | false = estruturado p/ implementação futura
 *   checkpointAllowed: boolean, // Permite "Continuar desta fase" se der BATATINHA!
 *   hooks: {                 // Callbacks opcionais para minijogos modulares futuros
 *     onEnter: (state) => void,
 *     onUpdate: (dt, state) => void,
 *     onRender: (ctx, state) => void,
 *     onInput: (playerKey, action, isDown, state) => void,
 *     onSyncPack: (state) => object,
 *     onSyncUnpack: (data, state) => void
 *   }
 * }
 */

export const MINIGAME_CATALOG = [
  {
    id: 'phase1',
    order: 1,
    title: 'FASE 1: CORRIDA AO ALTAR',
    subtitle: 'Pule os boletos e abaixe das perguntas da Tia até chegar na igreja!',
    icon: '⛪',
    enabled: true,
    checkpointAllowed: true,
    hooks: null // Usa o motor nativo da Fase 1 em game.js
  },
  {
    id: 'phase2',
    order: 2,
    title: 'FASE 2: DEFESA DO BOLO',
    subtitle: 'Girem ao redor da mesa e protejam o bolo dos convidados por 45s!',
    icon: '🎂',
    enabled: true,
    checkpointAllowed: true,
    hooks: null // Usa o motor nativo da Fase 2 em game.js
  },

  // ==========================================================================
  // SLOTS ESTRUTURADOS PARA FUTUROS MINIJOGOS (DESATIVADOS POR ENQUANTO)
  // Basta mudar enabled: true e preencher o objeto `hooks` quando for criar!
  // ==========================================================================
  {
    id: 'minigame_buque',
    order: 3,
    title: 'FASE 3: ARREMESSO DO BUQUÊ',
    subtitle: '[Em Breve] Mire o buquê sem acertar o lustre do salão!',
    icon: '💐',
    enabled: false,
    checkpointAllowed: true,
    hooks: {
      onEnter: () => {},
      onUpdate: () => {},
      onRender: () => {},
      onInput: () => {}
    }
  },
  {
    id: 'minigame_gravata',
    order: 4,
    title: 'FASE 4: CORTE DA GRAVATA',
    subtitle: '[Em Breve] Recolha as contribuições antes que os padrinhos fujam!',
    icon: '👔',
    enabled: false,
    checkpointAllowed: true,
    hooks: {
      onEnter: () => {},
      onUpdate: () => {},
      onRender: () => {},
      onInput: () => {}
    }
  },
  {
    id: 'minigame_embarque',
    order: 5,
    title: 'FASE 5: CORRIDA PRO AEROPORTO',
    subtitle: '[Em Breve] Feche as malas e não perca o voo da Lua de Mel!',
    icon: '✈️',
    enabled: false,
    checkpointAllowed: true,
    hooks: {
      onEnter: () => {},
      onUpdate: () => {},
      onRender: () => {},
      onInput: () => {}
    }
  }
];

export class MinigameProgression {
  constructor() {
    this.currentStageId = 'phase1';
    this.highestUnlockedStageId = 'phase1';
  }

  getActiveStages() {
    return MINIGAME_CATALOG.filter((m) => m.enabled).sort((a, b) => a.order - b.order);
  }

  getFutureStages() {
    return MINIGAME_CATALOG.filter((m) => !m.enabled).sort((a, b) => a.order - b.order);
  }

  getStageById(id) {
    return MINIGAME_CATALOG.find((m) => m.id === id) || MINIGAME_CATALOG[0];
  }

  unlockStage(stageId) {
    const target = this.getStageById(stageId);
    const currentHighest = this.getStageById(this.highestUnlockedStageId);
    if (target && currentHighest && target.order >= currentHighest.order) {
      this.highestUnlockedStageId = target.id;
    }
    this.currentStageId = stageId;
  }

  getNextEnabledStage(currentId) {
    const active = this.getActiveStages();
    const idx = active.findIndex((m) => m.id === currentId);
    if (idx >= 0 && idx + 1 < active.length) {
      return active[idx + 1];
    }
    return null; // Não há próxima fase ativa -> Vitória Final!
  }

  resetToStart() {
    this.currentStageId = 'phase1';
    this.highestUnlockedStageId = 'phase1';
  }
}
