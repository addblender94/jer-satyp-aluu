/**
 * drag/types.ts
 * 
 * Drag Engine'дин жалпы типтери.
 * Бул типтер бардык drag модулдары тарабынан колдонулат.
 */

export interface ElementDragState {
  initialHx: number; initialHy: number;
  initialVx: number; initialVy: number;
  initialHandleX: number; initialHandleY: number;
  initialHw: number;
  initialHh: number;
  initialVw: number;
  initialVh: number;
  initialScale: number;
  initialPx: number; initialPy: number;
  initialPw: number; initialPh: number;
  isBackground: boolean;
  isFullLayer: boolean;
  // Cache — акыркы эсептелген маанилер
  lastHx: string; lastHy: string;
  lastVx: string; lastVy: string;
  lastHandleX: string; lastHandleY: string;
  lastHw: string; lastHh: string;
  lastPx: string; lastPy: string;
  lastPw: string; lastPh: string;
  lastScale: number;
  initialDist: number;
}

export interface DragState {
  startX: number;
  startY: number;
  startXPx: number;
  startYPx: number;
  isFullLayer: boolean;
  elements: Record<number, ElementDragState>;
  multiSelectedIds: number[];
  effectiveId: number | null;
}
