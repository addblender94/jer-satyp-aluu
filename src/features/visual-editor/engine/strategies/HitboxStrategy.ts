/**
 * HitboxStrategy.ts
 * 
 * 🔵 HITBOX инструментинин "Характери" (Мүнөзү).
 * 
 * HITBOX режиминде:
 * - MOVE: ГАНА Hitbox (x, y) жылат. Visual жана Handle ордунда калат.
 * - RESIZE: ГАНА Hitbox'тун Width/Height өзгөрөт.
 * 
 * ⚠️ Бул файлды өзгөртүү ГАНА Hitbox инструментине таасир этет.
 *    Element жана Visual инструменттери БУГА КӨЗ КАРАНДЫ ЭМЕС.
 */

import {
  InteractionStrategy,
  DragState,
  ResizeState,
  ResizeContext,
  MoveResult,
  ResizeResult
} from './types';

export const HitboxStrategy: InteractionStrategy = {
  calculateMove(dx: number, dy: number, state: DragState, _isFullLayer: boolean): MoveResult {
    // HITBOX режиминде ГАНА Hitbox жылат
    const finalHx = state.initialHx + dx;
    const finalHy = state.initialHy + dy;

    return {
      hx: `${finalHx.toFixed(2)}%`,
      hy: `${finalHy.toFixed(2)}%`,
      // Visual жана Handle ЖЫЛБАЙТ — баштапкы абалда калат
      vx: `${state.initialVx.toFixed(2)}%`,
      vy: `${state.initialVy.toFixed(2)}%`,
      handleX: `${state.initialHandleX.toFixed(2)}%`,
      handleY: `${state.initialHandleY.toFixed(2)}%`,
      rawHx: finalHx,
      rawHy: finalHy,
      rawHandleX: state.initialHandleX,
      rawHandleY: state.initialHandleY,
    };
  },

  calculateResize(state: ResizeState, ctx: ResizeContext): ResizeResult {
    // HITBOX режиминде Width/Height resize
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
      scale: state.initialScale, // Scale HITBOX режиминде ӨЗГӨРБӨЙТ
    };
  },
};
