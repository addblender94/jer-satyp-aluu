import React, { memo } from 'react'
import { motion } from 'framer-motion'
import { Location } from '../types'
import { MapIconOverlay } from './MapIcon/MapIconOverlay'
import { MapIconContent } from './MapIcon/MapIconContent'
import { MapIconHitbox } from './MapIcon/MapIconHitbox'
import { AnimatedContainer } from './MapIcon/AnimatedContainer'
import { MapIconPopup } from './MapIcon/MapIconPopup'
import { EditTarget } from '../../visual-editor'
import { useInView } from '../../visual-editor/hooks/useInView'
import { useEditor } from '../../visual-editor'

interface MapIconProps {
  location: Location
  isHovered: boolean
  onMouseEnter: (id: number) => void
  onMouseLeave: () => void
  onClick: (id: number) => void
  allLocations: Location[]
  hoveredId: number | null
  // Editor State (Passed as props for memoization optimization)
  isEditorMode: boolean
  selectedId: number | null
  setSelectedId: (id: number | null) => void
  tempPosition?: { x: string; y: string }
  tempSize?: { width: string; height: string }
  tempStyle?: any
  tempVisual?: { x: string; y: string }
  tempHandle?: { x: string; y: string }
  tempHidden?: boolean
  tempContent?: string
  tempPopupContent?: string
  tempInteractionType?: 'none' | 'modal' | 'link' | 'popup'
  tempAnimations: Record<number, { speed?: number; amplitude?: number; noise?: number }>
  tempHoverOffsetsX: Record<number, number>
  tempHoverOffsetsY: Record<number, number>
  tempParentId?: number | null
  tempStickyLag?: number
  tempImageUrl?: string
  tempScale?: number
  tempHandleSize?: { width: string; height: string }
  tempTextSize?: { width: string; height: string }
  tempPopupPosition?: { x: string; y: string }
  tempPopupSize?: { width: string; height: string }
  isPopupExpanded?: boolean
  editTarget: EditTarget
  isSelectionMode: boolean
  isSelected: boolean // For multi-selection
  group?: { id: number; name: string; isCollapsed: boolean }
}

const toCQI = (val: string | number | undefined, multiplier: number = 1, bypass: boolean = false): string | number | undefined => {
  if (bypass || val === undefined) return val;
  if (typeof val === 'string') {
    if (val.endsWith('px')) {
      const num = parseFloat(val);
      if (!isNaN(num)) {
        // Use 1920 as the base width for pixel conversion
        return `min(${(num / 1920) * 100 * multiplier}cqi, ${num}px)`;
      }
    }
    if (val.endsWith('%')) {
      const num = parseFloat(val);
      if (!isNaN(num)) {
        // Convert % to cqi. For height, multiplier (0.5625) compensates for the 16:9 assumption
        return `${(num * multiplier).toFixed(3)}cqi`;
      }
    }
  }
  return val;
}

export const MapIcon: React.FC<MapIconProps> = memo(({
  location,
  isHovered,
  onMouseEnter,
  onMouseLeave,
  onClick,
  allLocations,
  hoveredId,
  isEditorMode,
  selectedId,
  setSelectedId,
  tempPosition,
  tempSize,
  tempStyle,
  tempVisual,
  tempHandle,
  tempHidden,
  tempContent,
  tempPopupContent,
  tempInteractionType,
  tempAnimations,
  tempHoverOffsetsX,
  tempHoverOffsetsY,
  tempParentId,
  tempStickyLag,
  tempImageUrl,
  tempScale,
  tempHandleSize,
  tempTextSize,
  tempPopupPosition,
  tempPopupSize,
  isPopupExpanded: initialIsPopupExpanded,
  editTarget,
  isSelectionMode,
  isSelected: isMultiSelected,
  group
}) => {
  // selfHovered needs to be determined by checking if THIS specific element is under the cursor
  const selfHovered = hoveredId !== null && Number(hoveredId) === Number(location.id)
  
  // Visibility logic
  const isHidden = tempHidden !== undefined ? tempHidden : (location.isHidden || false)
  
  const { 
    scrollRef, 
    updateTempContent, 
    updateTempPopupContent, 
    pushHistory, 
    silentSavePopup, 
    activeAnimTab,
    isPreviewingIdle,
    isMobileView
  } = useEditor()
  const visibilityRef = React.useRef<HTMLDivElement>(null)
  const isInView = useInView(visibilityRef, { root: scrollRef, rootMargin: '1000px' })

  if (isHidden && !isEditorMode) {
    return null;
  }
  
  const effectiveDisplay = (isHidden && isEditorMode) ? 'none' : 'block'

  const isCurrentlySelected = selectedId !== null && Number(selectedId) === Number(location.id)
  const bypassCQI = isCurrentlySelected && isEditorMode

  const currentPos = tempPosition || { x: location.x, y: location.y }
  const currentHandle = tempHandle || { x: location.handleX ?? location.x, y: location.handleY ?? location.y }
  
  const currentSize = {
    width: toCQI(tempSize?.width ?? location.width ?? '6%', 1, bypassCQI) as string,
    height: toCQI(tempSize?.height ?? location.height ?? '10%', 0.5625, bypassCQI) as string
  }
  const currentHandleSize = {
    width: toCQI(tempHandleSize?.width ?? location.handleWidth ?? '80px', 1, bypassCQI) as string,
    height: toCQI(tempHandleSize?.height ?? location.handleHeight ?? '100px', 0.5625, bypassCQI) as string
  }
  const currentTextSize = {
    width: toCQI(tempTextSize?.width ?? location.textWidth ?? location.width ?? '5%', 1, bypassCQI) as string,
    height: toCQI(tempTextSize?.height ?? location.textHeight ?? '10%', 0.5625, bypassCQI) as string
  }
  
  const s = tempStyle || {}
  const opacity = s.opacity ?? location.opacity ?? 1
  const fontFamily = s.fontFamily ?? location.fontFamily ?? 'Inter'
  const fontSize = toCQI(s.fontSize ?? location.fontSize ?? '16px') as string
  const fontWeight = s.fontWeight ?? location.fontWeight ?? 'normal'
  const color = s.color ?? location.color ?? '#ffffff'
  const textAlign = s.textAlign ?? location.textAlign ?? 'center'
  const textShadowColor = s.textShadowColor ?? location.textShadowColor ?? 'rgba(212,175,55,0.7)'
  const textShadowBlur = s.textShadowBlur ?? location.textShadowBlur ?? 0
  const textShadowOpacity = s.textShadowOpacity ?? location.textShadowOpacity ?? 1
  const contentValue = tempContent ?? location.content
  const popupContentValue = tempPopupContent ?? location.popupContent
  const itype = tempInteractionType ?? location.interactionType ?? 'modal'
  const pId = tempParentId ?? location.parentId

  const [isPopupOpen, setIsPopupOpen] = React.useState(initialIsPopupExpanded ?? location.isPopupExpanded ?? false)
  
  // Sync local state with prop if it changes externally (e.g. undo/redo)
  React.useEffect(() => {
    if (initialIsPopupExpanded !== undefined) {
      setIsPopupOpen(initialIsPopupExpanded)
    }
  }, [initialIsPopupExpanded])

  const togglePopup = () => {
    setIsPopupOpen(!isPopupOpen)
  }

  // Animation dependencies
  const parent = pId ? allLocations.find(l => Number(l.id) === Number(pId)) : null
  const isChild = !!pId && !!parent
  const noiseOffset = isChild ? (parent!.id * 137.508) % 7 : (location.id * 137.508) % 7
  const effectiveHovered = (selfHovered || (pId !== undefined && hoveredId !== null && Number(hoveredId) === Number(pId))) && !isPopupOpen
  const isSelected = isCurrentlySelected || isMultiSelected
  const showGlow = effectiveHovered || (isEditorMode && isSelected)
  const currentScale = tempScale ?? location.scale ?? 1

  const rawImageUrl = tempImageUrl || location.imageUrl
  const isPortal = !contentValue;
  
  // ARCHITECTURE: All portals are 1:1 full-screen sheets matching the background.
  const isFullLayer = isPortal;

  const visualWidth = isFullLayer ? '100%' : currentTextSize.width as string;
  const visualHeight = isFullLayer ? '100%' : currentTextSize.height as string;

  const overlayWidth = (editTarget === 'hitbox' || editTarget === 'element')
    ? `calc(${currentSize.width} + ${editTarget === 'element' ? '4cqi' : '2cqi'})` 
    : currentHandleSize.width;
  
  const overlayHeight = (editTarget === 'hitbox' || editTarget === 'element')
    ? `calc(${currentSize.height} + ${editTarget === 'element' ? (8 * 0.5625).toFixed(3) : (4 * 0.5625).toFixed(3)}cqi)` 
    : currentHandleSize.height;
  
  const assetFolder = useEditor().sceneManager.activeScene?.assetFolder || 'main_menu'
  let displayImageUrl = `/assets/${assetFolder}/${location.id}.png`

  if (rawImageUrl) {
    if (rawImageUrl.startsWith('http') || rawImageUrl.startsWith('/') || rawImageUrl.startsWith('data:')) {
      displayImageUrl = rawImageUrl
    } else {
      const hasExtension = rawImageUrl.includes('.')
      displayImageUrl = `/assets/${assetFolder}/${rawImageUrl}${hasExtension ? '' : '.png'}`
    }
  }

  const vX = tempVisual?.x ?? (location.visualX ?? (isFullLayer ? '0%' : location.x));
  const vY = tempVisual?.y ?? (location.visualY ?? (isFullLayer ? '0%' : location.y));
  
  const topOffset = vY;
  const leftOffset = vX;

  // transformOrigin — контейнерге салыштырмалуу болушу шарт.
  // Тутка canvas-абсолюттук (мисалы, 35%) бирок контейнер жылган (мисалы, left: -55%),
  // ошондуктан контейнердин ичиндеги чыныгы чекит = handleX - leftOffset.
  // Фондор (leftOffset=0) үчүн: 87% - 0% = 87% (туура)
  // Колдонуучу порталдары (leftOffset=-55%) үчүн: 35% - (-55%) = 90% (туура)
  const originX = isFullLayer 
    ? `${(parseFloat(currentHandle.x) - parseFloat(leftOffset)).toFixed(2)}%` 
    : 'center';
  const originY = isFullLayer 
    ? `${(parseFloat(currentHandle.y) - parseFloat(topOffset)).toFixed(2)}%`
    : 'center';

  const handleInteractionClick = (e: React.MouseEvent) => {
    if (isEditorMode) {
      if (isSelectionMode) {
        onClick(location.id)
      } else {
        setSelectedId(location.id)
      }
      e.stopPropagation()
    } else {
      if (itype === 'popup') {
        togglePopup()
      } else {
        onClick(location.id)
      }
    }
  }

  const handleInteractionMouseDown = (e: React.MouseEvent) => {
    if (isEditorMode && !isSelectionMode) {
      setSelectedId(location.id)
    }
  }

  return (
    <>
      <div 
        ref={visibilityRef}
        style={{ 
          position: 'absolute', 
          top: currentPos.y, 
          left: currentPos.x, 
          width: '1px', 
          height: '1px', 
          pointerEvents: 'none',
          visibility: 'hidden'
        }}
      />
      {!isInView && !isSelected ? null : (
        <>
          {editTarget !== 'popup' && (
            <MapIconOverlay 
              id={location.id}
              isEditorMode={isEditorMode}
              isSelected={isCurrentlySelected}
              isHidden={isHidden}
              editTarget={editTarget}
              currentPos={currentPos}
              currentHandle={currentHandle}
              overlayWidth={overlayWidth}
              overlayHeight={overlayHeight}
              currentScale={currentScale}
              isSelectionMode={isSelectionMode}
              isMultiSelected={isMultiSelected}
              groupName={group?.name}
            />
          )}

      <div
        data-visual-id={location.id}
        style={{
          position: 'absolute',
          top: topOffset,
          left: leftOffset,
          width: visualWidth, 
          height: visualHeight,
          transform: isFullLayer ? 'none' : 'translate(-50%, -50%)',
          pointerEvents: isFullLayer ? 'none' : 'auto',
          zIndex: isPopupOpen ? 100 : (isPortal ? 5 : 20),
          display: (isHidden && isEditorMode) ? 'none' : 'block',
          opacity: isHidden ? 0 : opacity,
          transition: 'opacity 0.3s ease',
        }}
      >
        <AnimatedContainer
          location={{ ...location, content: contentValue }}
          isEditorMode={isEditorMode}
          effectiveHovered={effectiveHovered}
          isHovered={isHovered}
          isSelected={isSelected}
          activeAnimTab={activeAnimTab}
          isPreviewingIdle={isPreviewingIdle}
          interactionType={itype}
          isChild={isChild}
          tempAnimations={tempAnimations}
          tempHoverOffsetsX={tempHoverOffsetsX}
          tempHoverOffsetsY={tempHoverOffsetsY}
          tempStickyLag={tempStickyLag}
          currentScale={currentScale}
          parent={parent}
          noiseOffset={noiseOffset}
          originX={originX}
          originY={originY}
          isFullLayer={isFullLayer}
          onMouseEnter={() => onMouseEnter(location.id)}
          onMouseLeave={onMouseLeave}
          onMouseDown={handleInteractionMouseDown}
          onClick={handleInteractionClick}
          fontFamily={fontFamily}
          fontSize={fontSize}
          fontWeight={fontWeight}
          color={color}
        >
          <MapIconContent 
            content={contentValue}
            popupContent={popupContentValue}
            displayImageUrl={displayImageUrl}
            isFullLayer={isFullLayer}
            visualWidth={visualWidth}
            visualHeight={visualHeight}
            textAlign={textAlign}
            textShadowBlur={(effectiveHovered || isSelected) ? Math.max(textShadowBlur, 20) : textShadowBlur}
            textShadowColor={textShadowColor}
            textShadowOpacity={textShadowOpacity}
            color={color}
            textBgColor={s.textBgColor ?? location.textBgColor ?? 'rgba(0,0,0,0.5)'}
            textBgOpacity={s.textBgOpacity ?? location.textBgOpacity ?? 0}
            isEditorMode={isEditorMode}
            isSelected={isSelected}
            isHovered={showGlow}
            id={location.id}
          />
        </AnimatedContainer>
      </div>

      {/* Hover Trigger for Portals - Matches the handle (pink frame) area */}
      {isPortal && (
        <div
          data-hover-trigger={location.id}
          style={{
            position: 'absolute',
            top: currentHandle.y,
            left: currentHandle.x,
            width: currentHandleSize.width,
            height: currentHandleSize.height,
            transform: 'translate(-50%, -50%)',
            pointerEvents: 'auto',
            zIndex: 34,
            display: effectiveDisplay,
          }}
          onMouseEnter={() => onMouseEnter(location.id)}
          onMouseLeave={onMouseLeave}
          onMouseDown={handleInteractionMouseDown}
          onClick={handleInteractionClick}
        />
      )}

      <MapIconHitbox 
        id={location.id}
        currentPos={currentPos}
        currentSize={currentSize}
        isHidden={isHidden}
        isEditorMode={isEditorMode}
        interactionType={itype}
        onMouseEnter={() => onMouseEnter(location.id)}
        onMouseLeave={onMouseLeave}
        onMouseDown={handleInteractionMouseDown}
        onClick={handleInteractionClick}
      />

      {isEditorMode && (
        <div
          data-handle-grab={location.id}
          style={{
            position: 'absolute',
            top: currentHandle.y,
            left: currentHandle.x,
            width: '24px',
            height: '24px',
            transform: 'translate(-50%, -50%)',
            cursor: 'move',
            zIndex: 45,
            pointerEvents: 'auto',
            background: 'transparent'
          }}
          onMouseDown={handleInteractionMouseDown}
        />
      )}

      {/* Popup Overlay — at MAP level (not inside text element) */}
      {editTarget === 'popup' && isCurrentlySelected && (
        <MapIconOverlay 
          id={location.id}
          isEditorMode={isEditorMode}
          isSelected={isCurrentlySelected}
          isHidden={isHidden}
          editTarget={editTarget}
          currentPos={{ 
            x: tempPopupPosition?.x ?? location.popupX ?? '40%', 
            y: tempPopupPosition?.y ?? location.popupY ?? '40%' 
          }}
          currentHandle={currentHandle}
          overlayWidth={tempPopupSize?.width ?? location.popupWidth ?? '300px'}
          overlayHeight={tempPopupSize?.height ?? location.popupHeight ?? '200px'}
          currentScale={currentScale}
          isSelectionMode={isSelectionMode}
          isMultiSelected={isMultiSelected}
          groupName={group?.name}
        />
      )}

      {/* Popup Blackboard — at MAP level (not inside text element) */}
      {itype === 'popup' && (
        <MapIconPopup
          id={location.id}
          isOpen={isPopupOpen}
          content={popupContentValue ?? ''}
          x={tempPopupPosition?.x ?? location.popupX ?? '40%'}
          y={tempPopupPosition?.y ?? location.popupY ?? '40%'}
          width={tempPopupSize?.width ?? location.popupWidth ?? '300px'}
          height={tempPopupSize?.height ?? location.popupHeight ?? '200px'}
          isEditorMode={isEditorMode}
          isSelected={isSelected}
          editTarget={editTarget}
          onClose={() => setIsPopupOpen(false)}
          onChange={(val) => updateTempPopupContent(location.id, val)}
          onFocus={pushHistory}
          onSilentSave={(val) => silentSavePopup(location.id, val)}
          popupBgColor={s.popupBgColor ?? location.popupBgColor ?? '#0f172a'}
          popupBgOpacity={s.popupBgOpacity ?? location.popupBgOpacity ?? 0.95}
          popupTextColor={s.popupTextColor ?? location.popupTextColor ?? '#ffffff'}
          popupHeaderColor={s.popupHeaderColor ?? location.popupHeaderColor ?? '#0f172a'}
          isMobileView={isMobileView}
        />
      )}

    </>
    )}
    </>
  )
})
