/**
 * VisualStrategy.ts
 * 
 * 🔴 VISUAL инструментинин "Характери" (Мүнөзү).
 * 
 * VISUAL режиминде:
 * - MOVE: ГАНА Handle (handleX, handleY) жылат. Hitbox жана Visual ордунда калат.
 *   Бул — сүрөттү же текстти Hitbox'тон "суурулуп" алуу.
 * - RESIZE: Width/Height resize (Hitbox'ту масштабдоо).
 * 
 * ⚠️ Бул файлды өзгөртүү ГАНА Visual инструментине таасир этет.
 *    Element жана Hitbox инструменттери БУГА КӨЗ КАРАНДЫ ЭМЕС.
 */

import {
  InteractionStrategy,
  DragState,
  ResizeState,
  ResizeContext,
  MoveResult,
  ResizeResult
} from './types';

export const VisualStrategy: InteractionStrategy = {
  calculateMove(dx: number, dy: number, state: DragState, _isFullLayer: boolean): MoveResult {
    // VISUAL режиминде ГАНА Handle жылат (офсет тууралоо)
    const finalHandleX = state.initialHandleX + dx;
    const finalHandleY = state.initialHandleY + dy;

    return {
      // Hitbox жана Visual ЖЫЛБАЙТ — баштапкы абалда калат
      hx: `${state.initialHx.toFixed(2)}%`,
      hy: `${state.initialHy.toFixed(2)}%`,
      vx: `${state.initialVx.toFixed(2)}%`,
      vy: `${state.initialVy.toFixed(2)}%`,
      // ГАНА Handle жылат
      handleX: `${finalHandleX.toFixed(2)}%`,
      handleY: `${finalHandleY.toFixed(2)}%`,
      rawHx: state.initialHx,
      rawHy: state.initialHy,
      rawHandleX: finalHandleX,
      rawHandleY: finalHandleY,
    };
  },

  calculateResize(state: ResizeState, ctx: ResizeContext): ResizeResult {
    // VISUAL режиминде Width/Height resize
    const centerX = state.initialHx;
    const centerY = state.initialHy;

    const dxPx = (ctx.mouseX - centerX) * (ctx.containerWidth / 100);
    const dyPx = (ctx.mouseY - centerY) * (ctx.containerHeight / 100);
    const startDxPx = (ctx.startX - centerX) * (ctx.containerWidth / 100);
    const startDyPx = (ctx.startY - centerY) * (ctx.containerHeight / 100);

    const signX = startDxPx >= 0 ? 1 : -1;
    const signY = startDyPx >= 0 ? 1 : -1;

    const deltaX = ((dxPx * signX) - (startDxPx * signX)) / state.initialScale;
    const deltaY = ((dyPx * signY) - (startDyPx * signY)) / state.initialScale;

    const newWidthHw = Math.max(0.5, state.initialHw + (deltaX * 2 / (ctx.containerWidth / 100)));
    const newHeightHh = Math.max(0.5, state.initialHh + (deltaY * 2 / (ctx.containerHeight / 100)));

    return {
      hw: `${newWidthHw.toFixed(2)}%`,
      hh: `${newHeightHh.toFixed(2)}%`,
      scale: state.initialScale, // Scale VISUAL режиминде ӨЗГӨРБӨЙТ
    };
  },
};
