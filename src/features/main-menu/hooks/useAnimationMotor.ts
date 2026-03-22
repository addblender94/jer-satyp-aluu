import { useMemo } from 'react'
import { Location } from '../types'

// Base design width — all pixel values are authored relative to this
const BASE_WIDTH = 1920

/** Convert a raw pixel value to a stable cqi string */
const pxToCqi = (px: number): string => `${((px / BASE_WIDTH) * 100).toFixed(3)}cqi`

interface AnimationMotorParams {
  location: Location
  isEditorMode: boolean
  effectiveHovered: boolean
  interactionType: 'none' | 'modal' | 'link' | 'popup'
  isChild: boolean
  tempAnimations: any
  tempHoverOffsetsX: Record<number, number>
  tempHoverOffsetsY: Record<number, number>
  tempStickyLags: any
  currentScale: number
  parent: Location | null
  noiseOffset: number
  isHovered: boolean
  isSelected: boolean
  activeAnimTab: 'idle' | 'hover'
  isPreviewingIdle: boolean
}

export const useAnimationMotor = ({
  location,
  isEditorMode,
  effectiveHovered,
  interactionType,
  isChild,
  tempAnimations,
  tempHoverOffsetsX,
  tempHoverOffsetsY,
  tempStickyLags,
  currentScale,
  parent,
  noiseOffset,
  isHovered,
  isSelected,
  activeAnimTab,
  isPreviewingIdle
}: AnimationMotorParams) => {
  // Idle animation parameters
  const idleSpeed = isChild
    ? (tempAnimations[Number(parent!.id)]?.speed ?? parent!.animSpeed ?? 2.4)
    : (tempAnimations[Number(location.id)]?.speed ?? location.animSpeed ?? 2.4)
  
  const idleAmplitude = isChild
    ? (tempAnimations[Number(parent!.id)]?.amplitude ?? parent!.animAmplitude ?? 4)
    : (tempAnimations[Number(location.id)]?.amplitude ?? location.animAmplitude ?? 4)
  
  const idleNoise = isChild
    ? ((tempAnimations[Number(parent!.id)]?.noise ?? parent!.animNoise ?? 0) / 100)
    : ((tempAnimations[Number(location.id)]?.noise ?? location.animNoise ?? 0) / 100)

  // Physics
  const stickyLag = isChild ? (tempStickyLags[Number(location.id)] ?? location.stickyLag ?? 0.25) : 0

  const baseIdleOffset = -idleAmplitude + (idleNoise > 0 ? (idleAmplitude * idleNoise * Math.sin(noiseOffset)) : 0)

  const idNum = Number(location.id);
  const pIdNum = isChild ? Number(parent!.id) : null;

  const isHoveredActive = isEditorMode 
    ? (isSelected && activeAnimTab === 'hover') 
    : effectiveHovered

  // ═══════════════════════════════════════════════════════════
  // CUMULATIVE HOVER OFFSETS (Sticky Positioning)
  // ═══════════════════════════════════════════════════════════

  // Own offsets logic: if editing and no temp value exists, use 0 (don't jump until edited), else use temp or database
  const getOwnOffset = (id: number, temp: Record<number, number>, dbVal: number | undefined) => {
    if (isEditorMode && temp[id] === undefined) return 0;
    return temp[id] ?? dbVal ?? 0;
  }

  const ownHoverX = getOwnOffset(idNum, tempHoverOffsetsX, location.hoverOffsetX);
  const ownHoverY = getOwnOffset(idNum, tempHoverOffsetsY, location.hoverOffsetY);

  // Inherited parent offsets: Always follow parent's current visual state (temp or database)
  const getParentOffset = (id: number | null, temp: Record<number, number>, dbVal: number | undefined) => {
    if (!isChild || id === null) return 0;
    return temp[id] ?? dbVal ?? 0;
  }

  const parentHoverX = getParentOffset(pIdNum, tempHoverOffsetsX, parent?.hoverOffsetX);
  const parentHoverY = getParentOffset(pIdNum, tempHoverOffsetsY, parent?.hoverOffsetY);

  // Final additive offsets
  const hoverX = ownHoverX + parentHoverX;
  const hoverY = ownHoverY + parentHoverY;

  const hasHoverSettings = (hoverX !== 0 || hoverY !== 0);

  // ═══════════════════════════════════════════════════════════
  // ANIMATION STATES
  // ═══════════════════════════════════════════════════════════

  return useMemo(() => {
    const hoverAnimate = {
      y: isHoveredActive ? pxToCqi(hoverY) : '0.000cqi',
      x: isHoveredActive ? pxToCqi(hoverX) : '0.000cqi',
      scale: currentScale,
    }

    const hoverTransition = isEditorMode 
    ? { duration: 0.2, ease: 'easeOut' } 
    : {
      type: 'spring',
      stiffness: isChild ? 150 : 180,
      damping: isChild ? 25 : 22,
      mass: 1,
      delay: stickyLag
    }

    // Duration should be inversely proportional to speed
    // If speed is 10, duration is short (~0.4s + noise)
    // If speed is 1, duration is long (~4s + noise)
    const finalIdleDuration = (4 / Math.max(0.1, idleSpeed)) + (noiseOffset * 0.2);

    const isIdlePreviewActive = isEditorMode ? (activeAnimTab === 'idle' && isPreviewingIdle) : true;

    const idleAnimate = {
      y: !isIdlePreviewActive ? [ '0.000cqi', '0.000cqi', '0.000cqi' ] : [
        '0.000cqi', 
        pxToCqi(baseIdleOffset), 
        '0.000cqi'
      ]
    }

    const idleTransition = {
      duration: !isIdlePreviewActive ? 0 : finalIdleDuration, 
      repeat: !isIdlePreviewActive ? 0 : Infinity, 
      ease: 'easeInOut', 
      repeatType: 'loop' as const,
    }

  return { hoverAnimate, hoverTransition, idleAnimate, idleTransition }
  }, [
    isHoveredActive, hoverX, hoverY, currentScale, isEditorMode, isChild, 
    stickyLag, baseIdleOffset, idleSpeed, noiseOffset, activeAnimTab, isPreviewingIdle
  ])
}
