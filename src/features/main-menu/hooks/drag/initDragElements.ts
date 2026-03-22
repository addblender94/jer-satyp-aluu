/**
 * drag/initDragElements.ts
 * 
 * Drag башталганда элементтердин баштапкы абалын "сүрөткө тартуу" (snapshot).
 * Бул функция onMouseMove'дун ичинде БИРӨӨ ГАНА жолу чакырылат (lazy init).
 * 
 * ⚠️ Бул файлды өзгөртүү — ГАНА баштапкы абалды эсептөөгө таасир этет.
 *    Кыймыл же өлчөм логикасына ТААСИР ЭТПЕЙТ.
 */

import { ElementDragState } from './types';
import { Location } from '../../types';

interface InitDragParams {
  effectiveId: number | null;
  selectedId: number | null;
  selectedIds: number[];
  groups: Record<string, { memberIds: number[] }>;
  allElements: Location[];
  tempPositions: Record<number, { x: string; y: string }>;
  tempVisuals: Record<number, { x: string; y: string }>;
  tempHandles: Record<number, { x: string; y: string }>;
  tempHandleSizes: Record<number, { width: string; height: string }>;
  tempScales: Record<number, number>;
  tempContents: Record<number, string>;
  tempPopupPositions: Record<number, { x: string; y: string }>;
  tempPopupSizes: Record<number, { width: string; height: string }>;
  tempSizes: Record<number, { width: string; height: string }>;
  mouseX: number;
  mouseY: number;
  rectWidth: number;
  rectHeight: number;
  sectionCount: number;
}

export function initDragElements(params: InitDragParams): {
  elements: Record<number, ElementDragState>;
  idsToDrag: number[];
} {
  const {
    effectiveId, selectedId, selectedIds, groups,
    allElements, tempPositions, tempSizes, tempVisuals, tempHandles,
    tempHandleSizes, tempScales, tempPopupPositions, tempPopupSizes,
    mouseX, mouseY, rectWidth, rectHeight, sectionCount
  } = params;

  // 1. Кайсы элементтерди жылдыруу керек?
  let idsToDrag: number[] = [];
  if (effectiveId) {
    if (selectedIds.includes(effectiveId)) {
      idsToDrag = [...selectedIds];
    } else {
      idsToDrag = [effectiveId];
    }
  } else if (selectedIds.length > 0) {
    idsToDrag = [...selectedIds];
  } else if (selectedId) {
    idsToDrag = [selectedId];
  }

  // Группанын мүчөлөрүн кошуу
  const initialId = effectiveId || selectedId;
  const activeGroup = Object.values(groups).find(g => initialId && g.memberIds.includes(initialId));
  if (activeGroup) {
    idsToDrag = Array.from(new Set([...idsToDrag, ...activeGroup.memberIds]));
  }

  // 2. Ар бир элементтин баштапкы абалын "тартуу"
  const elements: Record<number, ElementDragState> = {};
  idsToDrag.forEach(id => {
    const loc = allElements.find((l) => l.id === id);
    if (!loc) return;

    const isFullLayer = !loc.content;

    const ihx = parseFloat(tempPositions[id]?.x || loc?.x || '0');
    const ihy = parseFloat(tempPositions[id]?.y || loc?.y || '0');
    const vX = tempVisuals[id]?.x ?? (loc?.visualX ?? (isFullLayer ? '0%' : loc?.x));
    const vY = tempVisuals[id]?.y ?? (loc?.visualY ?? (isFullLayer ? '0%' : loc?.y));
    const ivx = parseFloat(vX || '50%');
    const ivy = parseFloat(vY || '50%');
    const iHandleX = parseFloat(tempHandles[id]?.x || loc?.handleX || loc?.x || '0');
    const iHandleY = parseFloat(tempHandles[id]?.y || loc?.handleY || loc?.y || '0');

    // Visual Size (for delta scaling)
    const rawVw = tempSizes[id]?.width || loc?.width || (isFullLayer ? '100%' : '80px');
    const rawVh = tempSizes[id]?.height || loc?.height || (isFullLayer ? '100%' : '100px');
    let ivw = parseFloat(rawVw); let ivh = parseFloat(rawVh);
    if (rawVw.includes('px')) ivw = (ivw / rectWidth) * 100;
    if (rawVh.includes('px')) ivh = (ivh / (rectHeight / sectionCount)) * 100;

    const rawHw = tempHandleSizes[id]?.width || loc?.handleWidth || loc?.width || (isFullLayer ? '100%' : '80px');
    const rawHh = tempHandleSizes[id]?.height || loc?.handleHeight || loc?.height || (isFullLayer ? '100%' : '100px');
    let ihw = parseFloat(rawHw); let ihh = parseFloat(rawHh);
    if (rawHw.includes('px')) ihw = (ihw / rectWidth) * 100;
    if (rawHh.includes('px')) ihh = (ihh / (rectHeight / sectionCount)) * 100;

    const currentScale = tempScales[id] ?? loc?.scale ?? 1;
    const dxPx = (mouseX - ihx) * (rectWidth / 100);
    const dyPx = ((mouseY * sectionCount) - ihy) * ((rectHeight / sectionCount) / 100);
    const idist = Math.sqrt(dxPx * dxPx + dyPx * dyPx) || 1;

    elements[id] = {
      isBackground: false,
      isFullLayer,
      initialHx: ihx, initialHy: ihy,
      initialVx: ivx, initialVy: ivy,
      initialHandleX: iHandleX, initialHandleY: iHandleY,
      initialHw: ihw, initialHh: ihh,
      initialVw: ivw, initialVh: ivh,
      initialScale: currentScale,
      initialPx: parseFloat(tempPopupPositions[id]?.x || loc?.popupX || '40%'),
      initialPy: parseFloat(tempPopupPositions[id]?.y || loc?.popupY || '40%'),
      initialPw: parseFloat(tempPopupSizes[id]?.width || loc?.popupWidth || '300px'),
      initialPh: parseFloat(tempPopupSizes[id]?.height || loc?.popupHeight || '200px'),
      lastHx: `${ihx.toFixed(2)}%`, lastHy: `${ihy.toFixed(2)}%`,
      lastVx: `${ivx.toFixed(2)}%`, lastVy: `${ivy.toFixed(2)}%`,
      lastHandleX: `${iHandleX.toFixed(2)}%`, lastHandleY: `${iHandleY.toFixed(2)}%`,
      lastHw: `${ihw.toFixed(2)}%`, lastHh: `${ihh.toFixed(2)}%`,
      lastPx: tempPopupPositions[id]?.x || loc?.popupX || '40%',
      lastPy: tempPopupPositions[id]?.y || loc?.popupY || '40%',
      lastPw: tempPopupSizes[id]?.width || loc?.popupWidth || '300px',
      lastPh: tempPopupSizes[id]?.height || loc?.popupHeight || '200px',
      lastScale: currentScale,
      initialDist: idist
    };
  });

  return { elements, idsToDrag };
}
