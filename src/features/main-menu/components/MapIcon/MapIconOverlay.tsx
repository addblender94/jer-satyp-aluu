import React from 'react'
import { EditTarget } from '../../../visual-editor'

interface MapIconOverlayProps {
  id: number
  isEditorMode: boolean
  isSelected: boolean
  isHidden: boolean
  editTarget: EditTarget
  currentPos: { x: string; y: string }
  currentHandle: { x: string; y: string }
  overlayWidth: string
  overlayHeight: string
  currentScale: number
  isSelectionMode: boolean
  isMultiSelected: boolean
  groupName?: string
}

export const MapIconOverlay: React.FC<MapIconOverlayProps> = ({
  id,
  isEditorMode,
  isSelected,
  isHidden,
  editTarget,
  currentPos,
  currentHandle,
  overlayWidth,
  overlayHeight,
  currentScale,
  isSelectionMode,
  isMultiSelected,
  groupName
}) => {
  const showOverlay = isEditorMode && (isSelected || (isSelectionMode && isMultiSelected))
  if (!showOverlay || isHidden) return null

  const overlayRef = React.useRef<HTMLDivElement>(null)

  // MANUAL DOM POSITIONING (To prevent juddering during drag)
  React.useLayoutEffect(() => {
    if (overlayRef.current && !overlayRef.current.hasAttribute('data-is-dragging')) {
      overlayRef.current.style.left = currentPos.x;
      overlayRef.current.style.top = currentPos.y;
    }
  }, [currentPos]);

  return (
    <div
      ref={overlayRef}
      data-overlay-id={id}
      style={{
        position: 'absolute',
        left: currentPos.x,
        top: currentPos.y,
        width: overlayWidth,
        height: overlayHeight,
        border: isSelectionMode 
          ? (isMultiSelected ? '2px solid #6366f1' : 'none')
          : (editTarget === 'hitbox' 
              ? '2px solid #3b82f6' 
              : editTarget === 'element' 
                ? '2px solid #10b981' 
                : editTarget === 'popup'
                  ? '2px dashed #facc15'
                  : '2px dashed #ec4899'),
        boxShadow: editTarget === 'hitbox' 
          ? '0 0 20px rgba(59, 130, 246, 0.6)' 
          : editTarget === 'element' 
            ? '0 0 20px rgba(16, 185, 129, 0.6)' 
            : editTarget === 'popup'
              ? '0 0 20px rgba(250, 204, 21, 0.6)'
              : '0 0 20px rgba(236, 72, 153, 0.6)',
        transform: editTarget === 'popup' ? 'none' : `translate(-50%, -50%) scale(${currentScale})`,
        pointerEvents: 'auto',
        cursor: 'move',
        background: 'rgba(0,0,0,0)',
        zIndex: 1000,
        borderRadius: (editTarget === 'hitbox' || editTarget === 'popup') ? '16px' : '8px',
        display: 'flex',
        alignItems: 'end',
        justifyContent: 'end'
      }}
    >
      {/* Resize Indicator (Visual Only) */}
      {!isSelectionMode && (
        <div 
          data-popup-handle-id={editTarget === 'popup' ? id : undefined}
          style={{
            width: '10px',
            height: '10px',
            background: editTarget === 'hitbox' ? '#3b82f6' : editTarget === 'popup' ? '#facc15' : '#ec4899',
            borderRadius: '50%',
            transform: 'translate(50%, 50%)',
            boxShadow: `0 0 5px ${editTarget === 'hitbox' ? 'rgba(59, 130, 246, 0.8)' : editTarget === 'popup' ? 'rgba(250, 204, 21, 0.8)' : 'rgba(236, 72, 153, 0.8)'}`,
            cursor: 'nwse-resize'
          }}
        />
      )}

      {/* Group Name Badge */}
      {groupName && (
        <div style={{
          position: 'absolute',
          top: '-20px',
          left: '0',
          background: '#10b981',
          color: 'white',
          fontSize: '10px',
          padding: '2px 6px',
          borderRadius: '4px',
          fontWeight: 'bold',
          whiteSpace: 'nowrap'
        }}>
          📂 {groupName}
        </div>
      )}
    </div>
  )
}
