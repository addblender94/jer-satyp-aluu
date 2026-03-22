/**
 * useMapDrag.ts
 * 
 * 🎼 "ДИРИЖЁР" — Drag Engine'дин Башкы Оркестратору.
 * 
 * Бул файл ЭЧ КАНДАЙ эсептөө логикасын камтыбайт.
 * Ал болгону 3 окуяны (mouseDown, mouseMove, mouseUp) координациялап,
 * тиешелүү модулду чакырат.
 * 
 * 🛡️ МОДУЛДУК АРХИТЕКТУРА:
 * - drag/types.ts            → Жалпы типтер
 * - drag/initDragElements.ts → Элементтерди "сүрөткө тартуу"
 * - drag/applyMoveDom.ts     → Жылдыруу + DOM жаңыртуу
 * - drag/applyResizeDom.ts   → Өлчөм + DOM жаңыртуу
 * - drag/commitDragResult.ts → Акыркы маанилерди State'ке жазуу
 */

import { useRef, useState } from 'react'
import { useEditor } from '../../visual-editor'
import { DragState } from './drag/types'
import { initDragElements } from './drag/initDragElements'
import { applyMoveDom } from './drag/applyMoveDom'
import { applyResizeDom } from './drag/applyResizeDom'
import { commitDragResult } from './drag/commitDragResult'

export const useMapDrag = (
  containerRef: React.RefObject<HTMLDivElement>
) => {
  const { 
    isEditorMode, activeTool, selectedId,
    updateTempPosition, tempPositions,
    updateTempSize, tempSizes, tempVisuals, updateTempVisual,
    tempHandles, updateTempHandle,
    editTarget, gridSnap, pushHistory,
    addedLocations, tempContents,
    tempScales, updateTempScale,
    tempHandleSizes, updateTempHandleSize,
    tempSections, tempSectionIds, updateTempSectionId,
    tempPopupPositions, tempPopupSizes,
    updateTempPopupPosition, updateTempPopupSize,
    groups, selectedIds, committedLocations,
    updateTempTextSize
  } = useEditor()
  
  const [isDragging, setIsDragging] = useState(false)
  const dragState = useRef<DragState | null>(null)

  // ═══════════════════════════════════════════════
  // 1. MOUSE DOWN — Якорь коюу
  // ═══════════════════════════════════════════════
  const onMouseDown = (e: React.MouseEvent) => {
    if (isEditorMode && activeTool && containerRef.current) {
      const target = e.target as HTMLElement
      const elementWithId = target.closest('[data-hitbox-id], [data-overlay-id], [data-handle-grab], [data-visual-id], [data-hover-trigger], [data-popup-frame-id], [data-popup-handle-id]')
      
      const hIdString = elementWithId?.getAttribute('data-hitbox-id') || 
                        elementWithId?.getAttribute('data-overlay-id') ||
                        elementWithId?.getAttribute('data-handle-grab') ||
                        elementWithId?.getAttribute('data-visual-id') ||
                        elementWithId?.getAttribute('data-hover-trigger') ||
                        elementWithId?.getAttribute('data-popup-frame-id') ||
                        elementWithId?.getAttribute('data-popup-handle-id')
      
      const effectiveId = (hIdString !== null && hIdString !== undefined) ? parseInt(hIdString) : selectedId

      if (effectiveId !== null && effectiveId !== undefined) {
        const rect = containerRef.current.getBoundingClientRect()
        const mouseX = ((e.clientX - rect.left) / rect.width) * 100
        const mouseY = ((e.clientY - rect.top) / rect.height) * 100

        dragState.current = {
          startX: mouseX,
          startY: mouseY,
          startXPx: e.clientX,
          startYPx: e.clientY,
          elements: {},
          multiSelectedIds: [],
          effectiveId,
          isFullLayer: false
        }
        pushHistory()
      }
    }
  }

  // ═══════════════════════════════════════════════
  // 2. MOUSE UP — Акыркы маанилерди сактоо
  // ═══════════════════════════════════════════════
  const onMouseUp = (e: React.MouseEvent) => {
    if (dragState.current) {
      if (isDragging) {
        const rect = containerRef.current!.getBoundingClientRect()
        const sectionCount = tempSections.length || 1
        const mouseY = ((e.clientY - rect.top) / rect.height) * 100

        commitDragResult({
          state: dragState.current,
          activeTool: activeTool || '',
          editTarget,
          mouseY,
          sectionCount,
          tempSections,
          tempSectionIds,
          committedLocations,
          addedLocations,
          tempContents,
          callbacks: {
            updateTempPosition,
            updateTempVisual,
            updateTempHandle,
            updateTempSize,
            updateTempScale,
            updateTempHandleSize,
            updateTempTextSize,
            updateTempSectionId,
            updateTempPopupPosition,
            updateTempPopupSize
          }
        })

        // Clear dragging flag from DOM
        const pEls = containerRef.current?.querySelectorAll('[data-is-dragging]')
        pEls?.forEach(el => el.removeAttribute('data-is-dragging'))
      }
    }
    setIsDragging(false)
    dragState.current = null
  }

  // ═══════════════════════════════════════════════
  // 3. MOUSE MOVE — Эсептөө + DOM Sync
  // ═══════════════════════════════════════════════
  const onMouseMove = (e: React.MouseEvent) => {
    if (!isEditorMode || !activeTool || !containerRef.current || !dragState.current) return

    const state = dragState.current!
    
    // DRAG THRESHOLD CHECK
    if (!isDragging) {
      const dxPx = e.clientX - state.startXPx
      const dyPx = e.clientY - state.startYPx
      const dist = Math.sqrt(dxPx * dxPx + dyPx * dyPx)
      if (dist < 3) return // Ignore tiny movements (clicks)
      setIsDragging(true)
    }

    const rect = containerRef.current.getBoundingClientRect()
    const sectionCount = tempSections.length || 1
    const mouseX = ((e.clientX - rect.left) / rect.width) * 100
    const mouseY = ((e.clientY - rect.top) / rect.height) * 100

    // Lazy Init: Элементтерди биринчи жолу гана "сүрөткө тартуу"
    if (Object.keys(state.elements).length === 0) {
      const allElements = [...committedLocations, ...addedLocations]
      const startXPercent = ((e.clientX - rect.left) / rect.width) * 100
      const startYPercent = ((e.clientY - rect.top) / rect.height) * 100

      const { elements, idsToDrag } = initDragElements({
        effectiveId: state.effectiveId,
        selectedId,
        selectedIds,
        groups,
        allElements,
        tempPositions,
        tempSizes,
        tempVisuals,
        tempHandles,
        tempHandleSizes,
        tempScales,
        tempContents,
        tempPopupPositions,
        tempPopupSizes,
        mouseX: startXPercent,
        mouseY: startYPercent,
        rectWidth: rect.width,
        rectHeight: rect.height,
        sectionCount
      })

      dragState.current = {
        ...state,
        elements,
        multiSelectedIds: idsToDrag,
        startX: startXPercent,
        startY: startYPercent,
        startXPx: e.clientX,
        startYPx: e.clientY,
        isFullLayer: false
      }
    }

    const stateToUse = dragState.current!
    const dx = mouseX - stateToUse.startX
    const dy = (mouseY - stateToUse.startY) * sectionCount

    if (activeTool === 'move') {
      applyMoveDom({
        stateToUse,
        dx, dy,
        clientX: e.clientX,
        clientY: e.clientY,
        editTarget,
        gridSnap,
        selectedId,
        containerEl: containerRef.current
      })
    } else if (activeTool === 'resize' && selectedId) {
      applyResizeDom({
        stateToUse,
        selectedId,
        mouseX, mouseY,
        clientX: e.clientX,
        clientY: e.clientY,
        editTarget,
        allElements: [...committedLocations, ...addedLocations],
        tempContents,
        containerEl: containerRef.current,
        rectWidth: rect.width,
        rectHeight: rect.height,
        sectionCount
      })
    }
  }

  return { isDragging, onMouseDown, onMouseMove, onMouseUp }
}
