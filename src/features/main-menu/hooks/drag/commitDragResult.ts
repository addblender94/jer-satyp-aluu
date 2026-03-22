/**
 * drag/commitDragResult.ts
 * 
 * onMouseUp учурунда акыркы маанилерди React State'ке жазуу.
 * Бул функция drag аяктаганда бир жолу гана чакырылат.
 * 
 * ⚠️ Бул файлды өзгөртүү — ГАНА сактоо логикасына таасир этет.
 *    DOM sync жана эсептөө логикасына ТААСИР ЭТПЕЙТ.
 */

import { DragState } from './types';
import { Location } from '../../types';
import type { EditTarget } from '../../../visual-editor/engine/TargetStrategies';

interface CommitCallbacks {
  updateTempPosition: (id: number, x: string, y: string) => void;
  updateTempVisual: (id: number, x: string, y: string) => void;
  updateTempHandle: (id: number, x: string, y: string) => void;
  updateTempSize: (id: number, w: string, h: string) => void;
  updateTempScale: (id: number, scale: number) => void;
  updateTempHandleSize: (id: number, w: string, h: string) => void;
  updateTempTextSize: (id: number, w: string, h: string) => void;
  updateTempSectionId: (id: number, sectionId: number) => void;
  updateTempPopupPosition: (id: number, x: string, y: string) => void;
  updateTempPopupSize: (id: number, w: string, h: string) => void;
}

interface CommitParams {
  state: DragState;
  activeTool: string;
  editTarget: EditTarget;
  mouseY: number;
  sectionCount: number;
  tempSections: { id: number }[];
  tempSectionIds: Record<number, number>;
  committedLocations: Location[];
  addedLocations: Location[];
  tempContents: Record<number, string>;
  callbacks: CommitCallbacks;
}

export function commitDragResult(params: CommitParams): void {
  const {
    state, activeTool, editTarget,
    mouseY, sectionCount,
    tempSections, tempSectionIds,
    committedLocations, addedLocations, tempContents,
    callbacks
  } = params;

  Object.entries(state.elements).forEach(([idStr, elState]) => {
    const id = parseInt(idStr);

    if (activeTool === 'move') {
      if (editTarget === 'element' || editTarget === 'hitbox' || editTarget === 'visual') {
        const targetSectionIndex = Math.max(0, Math.min(sectionCount - 1, Math.floor(mouseY / (100 / sectionCount))));
        const targetSectionId = tempSections[targetSectionIndex]?.id || 1;
        const currentSectionId = tempSectionIds[id] ?? committedLocations.find(l => l.id === id)?.sectionId ?? 1;

        if (targetSectionId !== currentSectionId) {
          callbacks.updateTempSectionId(id, targetSectionId);
          const sectionStart = (targetSectionIndex * (100 / sectionCount));
          const localY = (mouseY - sectionStart) * sectionCount;
          callbacks.updateTempPosition(id, elState.lastHx, `${localY.toFixed(2)}%`);
        } else {
          callbacks.updateTempPosition(id, elState.lastHx, elState.lastHy);
        }
        callbacks.updateTempVisual(id, elState.lastVx, elState.lastVy);
        callbacks.updateTempHandle(id, elState.lastHandleX, elState.lastHandleY);
      }
      
      if (editTarget === 'popup' && elState.lastPx && elState.lastPy) {
        callbacks.updateTempPopupPosition(id, elState.lastPx, elState.lastPy);
      }

    } else if (activeTool === 'resize') {
      const loc = [...committedLocations, ...addedLocations].find(l => l.id === id);
      const isText = !!(tempContents[id] ?? loc?.content);

      if (editTarget === 'hitbox' || (editTarget === 'element' && isText)) {
        callbacks.updateTempSize(id, elState.lastHw, elState.lastHh);
        if (editTarget === 'element' && isText) callbacks.updateTempTextSize(id, elState.lastHw, elState.lastHh);
      } else if (editTarget === 'element' && !isText) {
        callbacks.updateTempScale(id, elState.lastScale);
      } else if (editTarget === 'visual') {
        callbacks.updateTempHandleSize(id, elState.lastHw, elState.lastHh);
      } else if (editTarget === 'popup') {
        if (elState.lastPw && elState.lastPh) {
          callbacks.updateTempPopupSize(id, elState.lastPw, elState.lastPh);
        }
      }
    }
  });
}
