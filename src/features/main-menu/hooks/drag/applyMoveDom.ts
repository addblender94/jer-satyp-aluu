/**
 * drag/applyMoveDom.ts
 * 
 * Кыймылдоо учурунда DOM элементтерин түз жаңыртуу (60 FPS).
 * React State колдонулбайт — бардыгы manual DOM sync.
 * 
 * ⚠️ Бул файлды өзгөртүү — ГАНА Move визуалына таасир этет.
 *    Resize логикасына ТААСИР ЭТПЕЙТ.
 */

import { DragState } from './types';
import { calculateMove } from '../../../visual-editor/engine/TargetStrategies';
import type { EditTarget } from '../../../visual-editor/engine/TargetStrategies';

interface ApplyMoveParams {
  stateToUse: DragState;
  dx: number;
  dy: number;
  editTarget: EditTarget;
  gridSnap: number;
  selectedId: number | null;
  containerEl: HTMLElement;
  clientX: number;
  clientY: number;
}

export function applyMoveDom(params: ApplyMoveParams): void {
  const { stateToUse, dx, dy, editTarget, gridSnap, selectedId, containerEl } = params;

  let offsetX = dx;
  let offsetY = dy;

  // Grid snap эсептөө (Якорьду эске алуу менен)
  // POPUP үчүн азырынча өчүрө туруңуз (сыйдамдык үчүн), же кийинчерээк математикасын оңдойбуз.
  if (gridSnap && editTarget !== 'popup') {
    const mainId = selectedId || stateToUse.multiSelectedIds[0];
    const mainEl = stateToUse.elements[mainId];
    if (mainEl) {
      offsetX = (Math.round((mainEl.initialHx + dx) / gridSnap) * gridSnap) - mainEl.initialHx;
      offsetY = (Math.round((mainEl.initialHy + dy) / gridSnap) * gridSnap) - mainEl.initialHy;
    }
  }

  // Ар бир элементти жылдыруу жана DOM'ду жаңыртуу
  stateToUse.multiSelectedIds.forEach(id => {
    const el = stateToUse.elements[id];
    if (!el) return;

    // Manual DOM sync (60 FPS Performance)
    const hEl = containerEl.querySelector(`[data-hitbox-id="${id}"]`) as HTMLElement;
    const oEl = containerEl.querySelector(`[data-overlay-id="${id}"]`) as HTMLElement;
    const vEl = containerEl.querySelector(`[data-visual-id="${id}"]`) as HTMLElement;
    const pEl = containerEl.querySelector(`[data-popup-frame-id="${id}"]`) as HTMLElement;

    // POPUP SCALING: Popups use map-relative percentages (1:1 with mouse)
    let localDx = offsetX;
    let localDy = offsetY;

    const move = calculateMove(
      editTarget, 
      localDx,
      localDy,
      el, 
      el.isFullLayer
    );

    el.lastHx = move.hx; el.lastHy = move.hy;
    el.lastVx = move.vx; el.lastVy = move.vy;
    el.lastHandleX = move.handleX; el.lastHandleY = move.handleY;
    if (move.px) el.lastPx = move.px;
    if (move.py) el.lastPy = move.py;

    if (hEl) { hEl.style.top = el.lastHy; hEl.style.left = el.lastHx; }

    if (vEl) {
      vEl.style.top = el.lastVy;
      vEl.style.left = el.lastVx;
      if (!el.isFullLayer) {
        vEl.style.transform = 'translate(-50%, -50%)';
      }
    }

    if (pEl && move.px && move.py) {
      pEl.style.left = el.lastPx;
      pEl.style.top = el.lastPy;
      pEl.setAttribute('data-is-dragging', 'true');
    }

    if (oEl) {
      const useHitboxPos = (editTarget === 'hitbox' || editTarget === 'element');
      const isPopup = editTarget === 'popup';
      
      if (isPopup && pEl) {
        oEl.style.top = el.lastPy;
        oEl.style.left = el.lastPx;
        pEl.setAttribute('data-is-dragging', 'true');
        oEl.setAttribute('data-is-dragging', 'true');
      } else {
        oEl.style.top = useHitboxPos ? el.lastHy : el.lastHandleY;
        oEl.style.left = useHitboxPos ? el.lastHx : el.lastHandleX;
      }
    }
  });
}
