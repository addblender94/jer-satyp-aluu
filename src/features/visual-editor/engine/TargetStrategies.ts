/**
 * TargetStrategies.ts
 * 
 * Бул файл — редактордун "Роутери" (Router).
 * Ал эч кандай ӨЗҮНЧӨ логиканы камтыбайт.
 * Анын ордуна, ал учурдагы `EditTarget` режимине жараша
 * тиешелүү Модулду (Strategy) чакырат.
 * 
 * 🛡️ МОДУЛДУК АРХИТЕКТУРА:
 * - ElementStrategy.ts → ELEMENT режиминин БААРЫН башкарат.
 * - HitboxStrategy.ts  → HITBOX режиминин БААРЫН башкарат.
 * - VisualStrategy.ts  → VISUAL режиминин БААРЫН башкарат.
 * 
 * Бул файлды ӨЗГӨРТҮҮ ЗАРЫЛЧЫЛЫГЫ СЕЙРЕК.
 * Анткени бардык логика модулдарда (strategies/) жашайт.
 */

// === Эски API'ны сактоо (backward compatibility) ===
// Бул типтер долбоордун башка жеринде колдонулат.
// Аларды types.ts'тен re-export кылабыз.
export type { DragState, ResizeState } from './strategies/types';
export type EditTarget = 'element' | 'hitbox' | 'visual' | 'background' | 'popup';

// === Модулдарды импорттоо ===
import type { InteractionStrategy, ResizeContext } from './strategies/types';
import type { DragState, ResizeState } from './strategies/types';
import { ElementStrategy } from './strategies/ElementStrategy';
import { HitboxStrategy } from './strategies/HitboxStrategy';
import { VisualStrategy } from './strategies/VisualStrategy';
import { PopupStrategy } from './strategies/PopupStrategy';

// === РЕЕСТР (Registry) — Модулдарды режимге байлоо ===
const StrategyRegistry: Record<string, InteractionStrategy> = {
  element: ElementStrategy,
  hitbox: HitboxStrategy,
  visual: VisualStrategy,
  popup: PopupStrategy,
};

/**
 * Кыймылдоо логикасын эсептөө (Move Logic)
 * 
 * Эски API толугу менен сакталды:
 * calculateMove(target, dx, dy, state, isFullLayer) → MoveResult
 */
export const calculateMove = (
  target: EditTarget,
  dx: number,
  dy: number,
  state: DragState,
  isFullLayer: boolean = false
) => {
  const strategy = StrategyRegistry[target];
  if (!strategy) {
    // Белгисиз режим (мисалы, 'background') — эч нерсе өзгөртпөйт
    return {
      hx: `${state.initialHx.toFixed(2)}%`,
      hy: `${state.initialHy.toFixed(2)}%`,
      vx: `${state.initialVx.toFixed(2)}%`,
      vy: `${state.initialVy.toFixed(2)}%`,
      handleX: `${state.initialHandleX.toFixed(2)}%`,
      handleY: `${state.initialHandleY.toFixed(2)}%`,
      rawHx: state.initialHx,
      rawHy: state.initialHy,
      rawHandleX: state.initialHandleX,
      rawHandleY: state.initialHandleY,
    };
  }
  return strategy.calculateMove(dx, dy, state, isFullLayer);
};

/**
 * Өлчөмдү өзгөртүү логикасын эсептөө (Resize/Scale Logic)
 * 
 * Эски API толугу менен сакталды:
 * calculateResize(target, mouseX, mouseY, startX, startY, state, isText, containerWidth, containerHeight) → ResizeResult
 */
export const calculateResize = (
  target: EditTarget,
  state: ResizeState,
  ctx: ResizeContext
) => {
  const strategy = StrategyRegistry[target];

  if (!strategy) {
    // Белгисиз режим — баштапкы абалды кайтарат
    return {
      hw: `${state.initialHw.toFixed(2)}%`,
      hh: `${state.initialHh.toFixed(2)}%`,
      scale: state.initialScale,
    };
  }
  return strategy.calculateResize(state, ctx);
};
