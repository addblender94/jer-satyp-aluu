'use client'

import React, { useRef, useMemo, useCallback, useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { MapBackground } from './components/MapBackground'
import { MapIcon } from './components/MapIcon'
import { VirtualSection } from './components/VirtualSection'
import { MissionModal } from './components/MissionModal'
import { QuickNavigation } from './components/QuickNavigation'
import { useMainMenu } from './hooks/useMainMenu'
import { useEditor } from '../visual-editor'
import { useMapDrag } from './hooks/useMapDrag'

export const MainMenuView: React.FC = () => {
  const {
    selectedLocation,
    hoveredId,
    setHoveredId,
    handleLocationClick,
    handleCloseModal,
  } = useMainMenu()

  const { 
    tempInteractionTypes,
    tempLinks,
    tempNames,
    committedLocations,
    addedLocations,
    isEditorMode,
    selectedId,
    setSelectedId,
    tempPositions,
    tempSizes,
    tempStyles,
    tempVisuals,
    tempHandles,
    tempHidden,
    tempContents,
    tempAnimations,
    tempHoverOffsetsX,
    tempHoverOffsetsY,
    tempParentIds,
    tempStickyLags,
    tempImageUrls,
    tempScales,
    tempHandleSizes,
    tempTextSizes,
    layerOrder,
    deletedLocations,
    editTarget,
    isSelectionMode,
    selectedIds,
    toggleItemSelection,
    groups,
    tempSections,
    tempSectionIds,
    setScrollPos,
    scrollRef,
    tempAssetFolder,
    tempPopupPositions,
    tempPopupSizes,
    tempPopupContents,
    sceneManager,
    tempTargetSceneIds,
    setEditTarget,
    isMobileView,
    tempBgGradientStart,
    tempBgGradientEnd,
    tempHeaderTitle,
    tempHeaderFontFamily,
    tempHeaderFontSize,
    tempHeaderColor
  } = useEditor()
  
  const containerRef = useRef<HTMLDivElement>(null)
  const [localScrollPos, setLocalScrollPos] = useState(0) // Renamed to avoid conflict with setScrollPos from useEditor
  
  // Real-time synchronization for Mobile National Scroll
  useEffect(() => {
    if (!isMobileView || isEditorMode) return;
    
    const handleGlobalScroll = () => {
      setScrollPos(window.scrollY);
    };
    
    window.addEventListener('scroll', handleGlobalScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleGlobalScroll);
  }, [isMobileView, isEditorMode, setScrollPos]); // Added setScrollPos to dependencies

  // Use the "Drag Engine" (The Brain for movement)
  const { onMouseDown, onMouseMove, onMouseUp, isDragging } = useMapDrag(containerRef)

  // Sync isDragging to global style to prevent selection effectively
  useEffect(() => {
    if (isDragging) {
      document.body.style.userSelect = 'none'
      document.body.style.cursor = 'grabbing'
    } else {
      document.body.style.userSelect = ''
      document.body.style.cursor = ''
    }
    return () => {
      document.body.style.userSelect = ''
      document.body.style.cursor = ''
    }
  }, [isDragging])

  const allElements = useMemo(() => {
    const combined = [...committedLocations, ...addedLocations]
      .filter(loc => !deletedLocations.includes(loc.id))
    
    // If layerOrder exists, we sort based on it
    if (layerOrder && layerOrder.length > 0) {
      return combined.sort((a, b) => layerOrder.indexOf(a.id) - layerOrder.indexOf(b.id))
    }
    return combined
  }, [committedLocations, addedLocations, layerOrder, deletedLocations])
  
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Memoize handlers to keep MapIcon stable (essential for React.memo)
  const onIconMouseEnter = useCallback((id: number) => {
    // Cancel any pending "clear hover" to prevent flickering between related icons
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current)
      hoverTimeoutRef.current = null
    }
    if (!isDragging) setHoveredId(id)
  }, [isDragging, setHoveredId])

  const onIconMouseLeave = useCallback(() => {
    // Instead of nulling immediately, wait a tiny bit to see if we enter a related icon
    // This bridges the gap between parent/child or overlapping elements.
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current)
    
    hoverTimeoutRef.current = setTimeout(() => {
      if (!isDragging) setHoveredId(null)
      hoverTimeoutRef.current = null
    }, 50)
  }, [isDragging, setHoveredId])

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current)
    }
  }, [])
  
  const onIconClick = useCallback((id: number) => {
    if (isEditorMode) {
      if (isSelectionMode) {
        toggleItemSelection(id);
      } else {
        setEditTarget('element');
        setSelectedId(id);
      }
      return;
    }

    const loc = allElements.find(l => l.id === id)
    if (!loc) return

    const itype = tempInteractionTypes[id] !== undefined ? tempInteractionTypes[id] : (loc.interactionType || 'modal')
    const link = tempLinks[id] !== undefined ? tempLinks[id] : (loc.link || '')
    
    if (itype === 'link' && link) {
      if (link.startsWith('http')) {
        window.open(link, '_blank')
      } else if (link.startsWith('/')) {
        // Internal scene switch (Portal logic)
        const sceneId = link.startsWith('/') ? link.substring(1) : link;
        sceneManager.switchScene(sceneId);
      } else {
        window.location.href = link
      }
    } else if (itype === 'modal') {
      const targetSceneId = tempTargetSceneIds[id] ?? loc.targetSceneId
      if (targetSceneId) {
        // Switch scene if a specific ID is bound
        sceneManager.switchScene(targetSceneId);
      } else {
        // Default: Open info modal
        handleLocationClick(id)
      }
    }
  }, [allElements, tempInteractionTypes, tempLinks, handleLocationClick, isEditorMode, isSelectionMode, toggleItemSelection])

  const selectedLocData = useMemo(() => allElements.find((l) => l.id === selectedLocation), [allElements, selectedLocation])

  const sectionCount = tempSections.length || 1

  // Resolve dynamic background gradient
  const bg1 = isEditorMode 
    ? (tempBgGradientStart || sceneManager.activeScene?.bgGradientStart || '#0f172a') 
    : (sceneManager.activeScene?.bgGradientStart || '#0f172a');
  const bg2 = isEditorMode 
    ? (tempBgGradientEnd || sceneManager.activeScene?.bgGradientEnd || '#0a0a0a') 
    : (sceneManager.activeScene?.bgGradientEnd || '#0a0a0a');

  return (
    <div style={{
      width: '100vw',
      height: (isMobileView && !isEditorMode) ? 'auto' : '100vh',
      background: isMobileView ? '#1a1a1a' : 'transparent',
      display: 'flex',
      alignItems: (isMobileView && !isEditorMode) ? 'flex-start' : 'center',
      justifyContent: 'center',
      overflow: (isMobileView && !isEditorMode) ? 'visible' : 'hidden',
      position: 'relative'
    }}>
      {isMobileView && isEditorMode && (
        <div style={{
          position: 'absolute',
          top: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          color: 'gold',
          fontSize: '12px',
          fontWeight: 'bold',
          letterSpacing: '1px',
          opacity: 0.6,
          zIndex: 99999
        }}>
          📱 MOBILE PREVIEW (Simulator)
        </div>
      )}

      <main
        ref={scrollRef}
        style={{
          width: isMobileView ? '100%' : '100vw',
          maxWidth: isMobileView ? '375px' : 'none',
          height: (isMobileView && !isEditorMode) ? 'auto' : (isMobileView ? '100%' : '100vh'),
          minHeight: (isMobileView && !isEditorMode) ? '100dvh' : 'auto',
          position: 'relative',
          overflowX: 'hidden',
          overflowY: (isMobileView && !isEditorMode) ? 'visible' : 'auto',
          background: `linear-gradient(to bottom, ${bg1}, ${bg2})`, 
          scrollBehavior: 'smooth',
          boxShadow: isMobileView ? '0 0 100px rgba(0,0,0,1), 0 0 0 12px #333, 0 0 0 15px #111' : 'none',
          borderRadius: isMobileView ? '40px' : '0',
          transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
          display: 'flex',
          flexDirection: 'column'
        }}
        onMouseMove={onMouseMove}
        onMouseDown={onMouseDown}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
        onScroll={(e) => {
          if (!isMobileView || isEditorMode) {
            setScrollPos(e.currentTarget.scrollTop)
          }
        }}
      >
        {/* Ambient Background for Mobile (Blurred Image) */}
        {isMobileView && tempSections[0]?.url && (
          <div style={{
            position: 'fixed',
            inset: 0,
            backgroundImage: `url(${tempSections[0].url})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'blur(30px) brightness(0.25)',
            transform: 'scale(1.2)',
            zIndex: 0,
            pointerEvents: 'none'
          }} />
        )}
        
        {/* Subtle Gradient Overlay */}
        {isMobileView && (
          <div style={{
            position: 'fixed',
            inset: 0,
            background: 'linear-gradient(to bottom, rgba(15,23,42,0.5), transparent 20%, transparent 80%, rgba(15,23,42,0.8))',
            zIndex: 1,
            pointerEvents: 'none'
          }} />
        )}

      {/* 
          SCENE WRAPPER: Acts as the "Camera". 
          For Long Page, height is auto to allow the tall canvas to grow.
      */}
      <section 
        id="scene-wrapper"
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center', 
          minHeight: 'auto',
          width: '100%',
          position: 'relative',
        }}
      >
        {isMobileView && (
          <header style={{
            width: '100%',
            padding: '2.5rem 1rem 1.5rem',
            textAlign: 'center',
            background: `linear-gradient(to bottom, ${bg1}, ${bg2})`,
            position: (isMobileView && !isEditorMode) ? 'sticky' : 'relative',
            top: 0,
            zIndex: 1001,
            boxShadow: (isMobileView && !isEditorMode) ? '0 10px 30px rgba(0,0,0,0.5)' : 'none'
          }}>
            <motion.h1 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ 
                color: tempHeaderColor ?? (sceneManager.activeScene?.headerColor || '#d4af37'), 
                fontSize: tempHeaderFontSize ?? (sceneManager.activeScene?.headerFontSize || '1.4rem'), 
                margin: 0, 
                fontFamily: tempHeaderFontFamily ?? (sceneManager.activeScene?.headerFontFamily || 'inherit'),
                textTransform: 'uppercase',
                letterSpacing: '2px',
                textShadow: '0 0 20px rgba(212,175,55,0.3)'
              }}
            >
              {tempHeaderTitle ?? (sceneManager.activeScene?.headerTitle || sceneManager.activeScene?.name || 'JER SATYP ALUU')}
            </motion.h1>
            <div style={{ 
              width: '40px', 
              height: '2px', 
              background: '#d4af37', 
              margin: '0.5rem auto 0',
              opacity: 0.5 
            }} />
          </header>
        )}
        <div
          id="stable-canvas"
          ref={containerRef}
          style={{
            position: 'relative',
            width: isMobileView ? '100%' : 'calc(max(100vw, 100vh * (16 / 9)))',
            // Total height scales by number of sections
            minHeight: 'auto',
            height: 'auto',
            containerType: 'inline-size', 
            background: '#0a0a0a',
            flexShrink: 0,
            pointerEvents: isDragging ? 'none' : 'auto'
          }}
        >
          <div id="sections-stack" style={{ position: 'relative', width: '100%', height: 'auto', display: 'flex', flexDirection: 'column' }}>
            {tempSections.map((section) => {
              // Filter elements belonging to this section
              // Default to Section 1 if sectionId is missing
              const sectionElements = allElements.filter(loc => {
                const sid = tempSectionIds[loc.id] ?? loc.sectionId ?? 1
                return sid === section.id
              })

              return (
                <VirtualSection key={section.id} section={section}>
                  {sectionElements.map((loc) => (
                    <MapIcon
                      key={loc.id}
                      location={loc}
                      isHovered={hoveredId === loc.id}
                      onMouseEnter={onIconMouseEnter}
                      onMouseLeave={onIconMouseLeave}
                      onClick={onIconClick}
                      allLocations={allElements}
                      hoveredId={hoveredId}
                      isEditorMode={isEditorMode}
                      selectedId={selectedId}
                      setSelectedId={setSelectedId}
                      tempPosition={tempPositions[loc.id]}
                      tempSize={tempSizes[loc.id]}
                      tempStyle={tempStyles[loc.id]}
                      tempVisual={tempVisuals[loc.id]}
                      tempHandle={tempHandles[loc.id]}
                      tempHidden={tempHidden[loc.id]}
                      tempContent={tempContents[loc.id]}
                      tempInteractionType={tempInteractionTypes[loc.id]}
                      tempAnimations={tempAnimations}
                      tempHoverOffsetsX={tempHoverOffsetsX}
                      tempHoverOffsetsY={tempHoverOffsetsY}
                      tempParentId={tempParentIds[loc.id]}
                      tempStickyLag={tempStickyLags[loc.id]}
                      tempImageUrl={tempImageUrls[loc.id]}
                      tempScale={tempScales[loc.id]}
                      tempHandleSize={tempHandleSizes[loc.id]}
                      tempTextSize={tempTextSizes[loc.id]}
                      tempPopupPosition={tempPopupPositions[loc.id]}
                      tempPopupSize={tempPopupSizes[loc.id]}
                      tempPopupContent={tempPopupContents[loc.id]}
                      editTarget={editTarget}
                      isSelectionMode={isSelectionMode}
                      isSelected={selectedIds.includes(loc.id)}
                      group={Object.values(groups).find(g => g.memberIds.includes(loc.id))}
                    />
                  ))}
                </VirtualSection>
              )
            })}
          </div>
        </div>
        <QuickNavigation />
      </section>

      {/* Design: Modal Overlay (Fixed to Viewport) */}
      {selectedLocData && (
        <MissionModal 
          locationName={tempNames[selectedLocData.id] ?? selectedLocData.name} 
          onClose={handleCloseModal} 
        />
      )}

      {/* Scene Loading Overlay */}
      {sceneManager.isLoading && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.85)',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 99999,
          color: 'gold',
          gap: '20px',
          animation: 'fadeIn 0.3s ease-out'
        }}>
          <div className="spinner" style={{
            width: '40px',
            height: '40px',
            border: '3px solid rgba(212,175,55,0.1)',
            borderTop: '3px solid gold',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }} />
          <div style={{ fontSize: '14px', fontWeight: 'bold', letterSpacing: '2px' }}>LOADING SCENE...</div>
          
          <style dangerouslySetInnerHTML={{ __html: `
            @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
            @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
          `}} />
        </div>
      )}
      </main>
    </div>
  )
}
