/**
 * drag/applyResizeDom.ts
 * 
 * Өлчөмдү өзгөртүү учурунда DOM элементтерин түз жаңыртуу (60 FPS).
 * React State колдонулбайт — бардыгы manual DOM sync.
 * 
 * ⚠️ Бул файлды өзгөртүү — ГАНА Resize визуалына таасир этет.
 *    Move логикасына ТААСИР ЭТПЕЙТ.
 */

import { DragState } from './types';
import { calculateResize } from '../../../visual-editor/engine/TargetStrategies';
import type { EditTarget } from '../../../visual-editor/engine/TargetStrategies';
import { Location } from '../../types';

interface ApplyResizeParams {
  stateToUse: DragState;
  selectedId: number;
  mouseX: number;
  mouseY: number;
  editTarget: EditTarget;
  allElements: Location[];
  tempContents: Record<number, string>;
  containerEl: HTMLElement;
  rectWidth: number;
  rectHeight: number;
  sectionCount: number;
  clientX: number;
  clientY: number;
}

export function applyResizeDom(params: ApplyResizeParams): void {
  const {
    stateToUse, selectedId, mouseX, mouseY,
    editTarget, allElements, tempContents,
    containerEl, rectWidth, rectHeight, sectionCount
  } = params;

  const el = stateToUse.elements[selectedId];
  if (!el) return;

  const loc = allElements.find((l) => l.id === selectedId);
  const isText = !!(tempContents[selectedId] ?? loc?.content);

  const dxPx = params.clientX - stateToUse.startXPx;
  const dyPx = params.clientY - stateToUse.startYPx;

  const resize = calculateResize(
    editTarget,
    {
      initialHx: el.initialHx,
      initialHy: el.initialHy,
      initialHandleX: el.initialHandleX,
      initialHandleY: el.initialHandleY,
      initialHw: el.initialHw,
      initialHh: el.initialHh,
      initialScale: el.initialScale,
      initialDist: el.initialDist,
      initialPw: el.initialPw,
      initialPh: el.initialPh,
    },
    {
      mouseX,
      mouseY: mouseY * sectionCount,
      startX: stateToUse.startX,
      startY: stateToUse.startY * sectionCount,
      isText,
      containerWidth: rectWidth,
      containerHeight: rectHeight / sectionCount,
      el,
      dxPx,
      dyPx
    }
  );

  el.lastHw = resize.hw;
  el.lastHh = resize.hh;
  el.lastScale = resize.scale;
  if (resize.pw) el.lastPw = resize.pw;
  if (resize.ph) el.lastPh = resize.ph;

  // Manual DOM sync
  const visualEl = containerEl.querySelector(`[data-visual-id="${selectedId}"]`) as HTMLElement;
  const hitboxEl = containerEl.querySelector(`[data-hitbox-id="${selectedId}"]`) as HTMLElement;
  const overlayEl = containerEl.querySelector(`[data-overlay-id="${selectedId}"]`) as HTMLElement;
  const popupEl = containerEl.querySelector(`[data-popup-frame-id="${selectedId}"]`) as HTMLElement;

  if (editTarget === 'hitbox' || (editTarget === 'element' && isText)) {
    if (editTarget === 'hitbox' && hitboxEl) {
      hitboxEl.style.width = el.lastHw;
      hitboxEl.style.height = el.lastHh;
    }
    if (overlayEl) {
      const paddingW = editTarget === 'element' ? 4 : 2;
      const paddingH = editTarget === 'element' ? 8 : 4;
      overlayEl.style.width = `calc(${el.lastHw} + ${paddingW}%)`;
      overlayEl.style.height = `calc(${el.lastHh} + ${paddingH}%)`;
    }
    if (editTarget === 'element' && isText && visualEl) {
      visualEl.style.width = el.lastHw;
      visualEl.style.height = el.lastHh;
    }
  } else if (editTarget === 'element' && !isText) {
    if (visualEl) {
      const motionDiv = visualEl.querySelector('div') as HTMLElement;
      if (motionDiv) motionDiv.style.transform = `scale(${el.lastScale})`;
    }
    if (overlayEl) overlayEl.style.transform = `translate(-50%, -50%) scale(${el.lastScale})`;
  } else if (editTarget === 'visual') {
    if (overlayEl) {
      overlayEl.style.width = el.lastHw;
      overlayEl.style.height = el.lastHh;
    }
  } else if (editTarget === 'popup') {
    if (popupEl && resize.pw && resize.ph) {
      popupEl.style.width = el.lastPw;
      popupEl.style.height = el.lastPh;
    }
    if (overlayEl && resize.pw && resize.ph) {
      overlayEl.style.width = el.lastPw;
      overlayEl.style.height = el.lastPh;
      overlayEl.style.transform = `translate(0, 0)`; // Popup overlays don't use center translation
    }
  }
}
