import React from 'react'

interface MapIconHitboxProps {
  id: number
  currentPos: { x: string; y: string }
  currentSize: { width: string; height: string }
  isHidden: boolean
  isEditorMode: boolean
  interactionType: 'none' | 'modal' | 'link' | 'popup'
  onMouseEnter: () => void
  onMouseLeave: () => void
  onMouseDown: (e: React.MouseEvent) => void
  onClick: (e: React.MouseEvent) => void
}

export const MapIconHitbox: React.FC<MapIconHitboxProps> = ({
  id,
  currentPos,
  currentSize,
  isHidden,
  isEditorMode,
  interactionType,
  onMouseEnter,
  onMouseLeave,
  onMouseDown,
  onClick
}) => {
  // Responds to clicks ONLY if not hidden in game mode
  // In editor mode, we hide the hitbox if isHidden is true
  if (isEditorMode && isHidden) return null

  return (
    <div
      data-hitbox-id={id}
      style={{
        position: 'absolute',
        top: currentPos.y,
        left: currentPos.x,
        width: currentSize.width,
        height: currentSize.height,
        transform: 'translate(-50%, -50%)',
        cursor: (isEditorMode || interactionType === 'none') ? 'default' : 'pointer',
        borderRadius: '50%',
        zIndex: isEditorMode ? 35 : 30,
        pointerEvents: isHidden ? 'none' : 'auto',
      }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onMouseDown={onMouseDown}
      onClick={onClick}
    />
  )
}
