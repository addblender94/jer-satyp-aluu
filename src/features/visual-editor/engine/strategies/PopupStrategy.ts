/**
 * PopupStrategy.ts
 * 
 * 🟡 POPUP инструментинин "Характери" (Мүнөзү).
 * 
 * POPUP режиминде:
 * - MOVE: ГАНА Popup (popupX, popupY) жылат. Башка баары ордунда калат.
 * - RESIZE: ГАНА Popup'тун Width/Height өзгөрөт.
 */

import {
  InteractionStrategy,
  DragState,
  ResizeState,
  ResizeContext,
  MoveResult,
  ResizeResult
} from './types';

export const PopupStrategy: InteractionStrategy = {
  calculateMove(dx: number, dy: number, state: DragState, _isFullLayer: boolean): MoveResult {
    // POPUP режиминде ГАНА Popup алкагы жылат
    const finalPx = state.initialPx + dx;
    const finalPy = state.initialPy + dy;

    return {
      // Башка баары ордунда калат
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
      // ЖЕКЕ Поп-ап координаталары
      px: `${finalPx.toFixed(2)}%`,
      py: `${finalPy.toFixed(2)}%`,
    };
  },

  calculateResize(state: ResizeState, ctx: ResizeContext): ResizeResult {
    const newWidth = Math.max(100, state.initialPw + (ctx.dxPx || 0));
    const newHeight = Math.max(100, state.initialPh + (ctx.dyPx || 0));

    return {
      hw: `${state.initialHw.toFixed(2)}%`,
      hh: `${state.initialHh.toFixed(2)}%`,
      scale: state.initialScale,
      pw: `${newWidth.toFixed(0)}px`,
      ph: `${newHeight.toFixed(0)}px`,
    };
  },
};
