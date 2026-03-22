import React from 'react'
import { motion } from 'framer-motion'
import { Location } from '../../types'
import { useAnimationMotor } from '../../hooks/useAnimationMotor'

interface AnimatedContainerProps {
  location: Location
  isEditorMode: boolean
  effectiveHovered: boolean
  isHovered: boolean
  isSelected: boolean
  interactionType: 'none' | 'modal' | 'link' | 'popup'
  activeAnimTab: 'idle' | 'hover'
  isPreviewingIdle: boolean
  isChild: boolean
  tempAnimations: any
  tempHoverOffsetsX: Record<number, number>
  tempHoverOffsetsY: Record<number, number>
  tempStickyLag: number
  currentScale: number
  parent: Location | null
  noiseOffset: number
  originX: string | number
  originY: string | number
  isFullLayer: boolean
  onMouseEnter?: () => void
  onMouseLeave?: () => void
  onMouseDown?: (e: React.MouseEvent) => void
  onClick?: (e: React.MouseEvent) => void
  children: React.ReactNode
  fontFamily: string
  fontSize: string
  fontWeight: string | number
  color: string
}

/**
 * AnimatedContainer
 * 
 * A specialized "Black Box" that handles the entire animation logic for MapIcons.
 * It encapsulates the nested motion layers (Hover & Idle) to ensure perfect 
 * smoothness and to protect the animation system from external side effects.
 */
export const AnimatedContainer: React.FC<AnimatedContainerProps> = ({
  location,
  isEditorMode,
  effectiveHovered,
  isHovered,
  isSelected,
  activeAnimTab,
  isPreviewingIdle,
  interactionType,
  isChild,
  tempAnimations,
  tempHoverOffsetsX,
  tempHoverOffsetsY,
  tempStickyLag,
  currentScale,
  parent,
  noiseOffset,
  originX,
  originY,
  isFullLayer,
  onMouseEnter,
  onMouseLeave,
  onMouseDown,
  onClick,
  children,
  fontFamily,
  fontSize,
  fontWeight,
  color
}) => {
  const { 
    hoverAnimate, 
    hoverTransition, 
    idleAnimate, 
    idleTransition 
  } = useAnimationMotor({
    location,
    isEditorMode,
    effectiveHovered,
    isHovered,
    isSelected,
    activeAnimTab,
    isPreviewingIdle,
    interactionType,
    isChild,
    tempAnimations,
    tempHoverOffsetsX,
    tempHoverOffsetsY,
    tempStickyLags: { [location.id]: tempStickyLag },
    currentScale,
    parent,
    noiseOffset
  })

  return (
    <motion.div
      key={`${location.id}-${isEditorMode ? 'ed' : 'gm'}`}
      style={{
        position: 'absolute',
        width: '100%',
        height: '100%',
        top: 0,
        left: 0,
        transformOrigin: `${originX} ${originY}`,
        pointerEvents: isFullLayer ? 'none' : 'auto',
        fontFamily: `'${fontFamily}', sans-serif`,
        fontSize: fontSize,
        fontWeight: fontWeight,
        color: color,
        cursor: (isEditorMode || isFullLayer) ? 'default' : 'inherit',
        userSelect: 'none',
      }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onMouseDown={onMouseDown}
      onClick={onClick}
      initial={false}
      animate={hoverAnimate}
      transition={hoverTransition}
    >
      <motion.div
        style={{ width: '100%', height: '100%' }}
        animate={idleAnimate}
        transition={idleTransition}
      >
        {children}
      </motion.div>
    </motion.div>
  )
}
