/**
 * ElementStrategy.ts
 * 
 * 🟢 ELEMENT инструментинин "Характери" (Мүнөзү).
 * 
 * ELEMENT режиминде:
 * - MOVE: Hitbox, Visual, Handle — БААРЫ ЧОГУУ жылат.
 * - RESIZE (Image): Uniform Scale (пропорционалдуу чоңоюу/кичирөө).
 * - RESIZE (Text): Width/Height resize (талаанын өлчөмүн өзгөртүү).
 * 
 * ⚠️ Бул файлды өзгөртүү ГАНА Element инструментине таасир этет.
 *    Hitbox жана Visual инструменттери БУГА КӨЗ КАРАНДЫ ЭМЕС.
 */

import {
  InteractionStrategy,
  DragState,
  ResizeState,
  ResizeContext,
  MoveResult,
  ResizeResult
} from './types';

export const ElementStrategy: InteractionStrategy = {
  calculateMove(dx: number, dy: number, state: DragState, isFullLayer: boolean): MoveResult {
    // ELEMENT режиминде БААРЫН чогуу жылдыруу
    const finalHx = state.initialHx + dx;
    const finalHy = state.initialHy + dy;
    const finalHandleX = state.initialHandleX + dx;
    const finalHandleY = state.initialHandleY + dy;
    // Visual бөлүгү да дайыма кошо жылышы ШАРТ
    const finalVx = state.initialVx + dx;
    const finalVy = state.initialVy + dy;

    return {
      hx: `${finalHx.toFixed(2)}%`,
      hy: `${finalHy.toFixed(2)}%`,
      vx: `${finalVx.toFixed(2)}%`,
      vy: `${finalVy.toFixed(2)}%`,
      handleX: `${finalHandleX.toFixed(2)}%`,
      handleY: `${finalHandleY.toFixed(2)}%`,
      rawHx: finalHx,
      rawHy: finalHy,
      rawHandleX: finalHandleX,
      rawHandleY: finalHandleY,
    };
  },

  calculateResize(state: ResizeState, ctx: ResizeContext): ResizeResult {
    // Pivot point = Hitbox center
    const centerX = state.initialHx;
    const centerY = state.initialHy;

    const getDist = (x: number, y: number) => {
      const dxPx = (x - centerX) * (ctx.containerWidth / 100);
      const dyPx = (y - centerY) * (ctx.containerHeight / 100);
      return Math.sqrt(dxPx * dxPx + dyPx * dyPx);
    };

    if (ctx.isText) {
      // TEXT: Width/Height resize (same as Hitbox resize logic)
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
        scale: state.initialScale,
      };
    } else {
      // IMAGE: Uniform Scale
      const currentDist = getDist(ctx.mouseX, ctx.mouseY);
      const startDist = getDist(ctx.startX, ctx.startY);
      const safeStartDist = Math.max(10, startDist);
      const scaleFactor = currentDist / safeStartDist;

      return {
        hw: `${state.initialHw.toFixed(2)}%`,
        hh: `${state.initialHh.toFixed(2)}%`,
        scale: Math.max(0.1, Math.min(10, state.initialScale * scaleFactor)),
      };
    }
  },
};
