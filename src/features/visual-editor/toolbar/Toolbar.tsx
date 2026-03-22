import React, { useState, useRef, useEffect } from 'react'
import { useEditor } from '../context/EditorContext'
import { EditorTab } from '../context/types'
import { saveLocations } from '../engine/codeWriter'
import { detectImageCenter } from '../engine/detectImageCenter'

// ═══════════════════════════════════════════════
// 🎨 SYMBOL LIBRARY — Категорияланган иконкалар
// Жаңы иконка кошуу: тиешелүү категорияга кошуп коюңуз.
// ═══════════════════════════════════════════════
const SYMBOL_LIBRARY: { category: string; color: string; icons: string[] }[] = [
  { category: '📍 Навигация', color: '#facc15', icons: ['📍', '🚩', '🏁', '🏠', '🚪', '👣', '🗺️', '🧭', '⬆️', '➡️', '⬇️', '⬅️', '🔄', '↩️'] },
  { category: 'ℹ️ Маалымат', color: '#3b82f6', icons: ['💬', 'ℹ️', '❓', '❗', '⚠️', '🆘', '📢', '📌', '🔔', '💡', '📝', '📋', '🏷️', '🔖'] },
  { category: '⚔️ Аракеттер', color: '#10b981', icons: ['🔍', '🔑', '🔓', '🔒', '🛒', '🎁', '🛠️', '⚙️', '🎯', '🎮', '🎲', '🃏', '💰', '💎'] },
  { category: '👤 Каармандар', color: '#ec4899', icons: ['👤', '👥', '🛡️', '⚔️', '🏆', '✨', '⭐', '🌟', '❤️', '🔥', '💀', '👑', '🐉', '🦅'] },
]


export const Toolbar: React.FC = () => {
  const { 
    isEditorMode, toggleEditorMode, 
    activeTool, setActiveTool, 
    tempPositions, 
    tempSizes,
    tempVisuals, updateTempVisual,
    tempHandles, updateTempHandle,
    tempHidden, toggleTempHidden,
    tempStyles, updateTempStyle,
    activeTab, setActiveTab,
    editTarget, setEditTarget,
    gridSnap, setGridSnap,
    toolbarPos, setToolbarPos,
    isCollapsed, setIsCollapsed,
    selectedId, setSelectedId,
    undo, redo, canUndo, canRedo,
    pushHistory, tempContents, updateTempContent,
    addedLocations, tempNames, updateTempName, addTextLocation, addImageLocation, addPopupLocation, duplicateLocation, clearAddedLocations,
    deletedLocations, toggleDeletedLocation, clearDeletedLocations,
    tempInteractionTypes, updateTempInteractionType, tempLinks, updateTempLink,
    tempAnimations, updateTempAnimation, tempParentIds, updateTempParentId,
    tempHoverOffsetsX, updateTempHoverOffsetX, tempHoverOffsetsY, updateTempHoverOffsetY,
    tempStickyLags, updateTempStickyLag,
    tempImageUrls, updateTempImageUrl,
    tempScales, updateTempScale,
    tempHandleSizes,
    tempTextSizes,
    tempSections,
    committedSections,
    updateTempSection,
    committedLocations, commitSave,
    layerOrder, reorderLayers, reorderBlock,
    isSelectionMode, toggleSelectionMode,
    selectedIds, toggleItemSelection,
    groups, createGroup, updateGroupName, toggleGroupCollapse, ungroup,
    activeLayersMode, setActiveLayersMode,
    removeBackgroundSection, duplicateBackgroundSection, reorderSections,
    addBackgroundSection,
    activeSectionFilter, setActiveSectionFilter,
    syncAllToSections, tempSectionIds,
    sceneManager,
    tempTargetSceneIds,
    updateTempTargetSceneId,
    tempAssetFolder,
    updateTempAssetFolder,
    tempPopupPositions,
    tempPopupSizes,
    tempPopupContents,
    activeAnimTab,
    setActiveAnimTab,
    isPreviewingIdle,
    setIsPreviewingIdle,
    isMobileView,
    setIsMobileView,
    tempQuickLinks,
    addQuickLink,
    updateQuickLink,
    removeQuickLink,
    reorderQuickLinks,
    tempSceneName,
    updateTempSceneName,
    tempBgGradientStart,
    updateTempBgGradientStart,
    tempBgGradientEnd,
    updateTempBgGradientEnd,
    tempHeaderTitle,
    updateTempHeaderTitle,
    tempHeaderFontFamily,
    updateTempHeaderFontFamily,
    tempHeaderFontSize,
    updateTempHeaderFontSize,
    tempHeaderColor,
    updateTempHeaderColor
  } = useEditor()
  
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [isDragging, setIsDragging] = useState(false)
  const [availableAssets, setAvailableAssets] = useState<string[]>([])
  const [detectStatus, setDetectStatus] = useState<'idle' | 'scanning' | 'done' | 'error'>('idle')
  const [editingNameId, setEditingNameId] = useState<number | string | null>(null)
  const [editingNameValue, setEditingNameValue] = useState('')
  const [contentMode, setContentMode] = useState<'text' | 'symbol'>('text')
  const [activeStyleTab, setActiveStyleTab] = useState<'general' | 'text' | 'effects' | 'popup'>('general')
  const [movingSceneId, setMovingSceneId] = useState<string | null>(null)
  const [colorPickerGroupId, setColorPickerGroupId] = useState<string | null>(null)
  const [expandedQuickLinkId, setExpandedQuickLinkId] = useState<number | null>(null)
  const [activeSceneSubTab, setActiveSceneSubTab] = useState<'general' | 'header'>('general')
  
  const dragRef = useRef<{ startX: number; startY: number; initialPos: { x: number; y: number }, isDragReal: boolean }>({ startX: 0, startY: 0, initialPos: { x: 0, y: 0 }, isDragReal: false })

  // Fetch available assets on mount
  useEffect(() => {
    const fetchAssets = async () => {
      try {
        const res = await fetch('/api/editor/assets')
        const data = await res.json()
        if (data.assets) setAvailableAssets(data.assets)
      } catch (err) {
        console.error('Failed to load assets', err)
      }
    }
    fetchAssets()
  }, [])

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return
      const dx = e.clientX - dragRef.current.startX
      const dy = e.clientY - dragRef.current.startY
      
      // Mark as a real drag only if moved more than 5 pixels
      if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
        dragRef.current.isDragReal = true
      }
      
      setToolbarPos({
        x: dragRef.current.initialPos.x + dx,
        y: dragRef.current.initialPos.y + dy,
      })
    }
    const handleMouseUp = () => {
      setIsDragging(false)
      // We don't reset isDragReal here, it's checked on click then reset on mousedown
    }
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isEditorMode) return
      
      // Ctrl+Z for Undo
      if (e.ctrlKey && e.key.toLowerCase() === 'z') {
        if (e.shiftKey) {
          redo()
        } else {
          undo()
        }
        e.preventDefault()
      }
      
      // Ctrl+Y for Redo
      if (e.ctrlKey && e.key.toLowerCase() === 'y') {
        redo()
        e.preventDefault()
      }
    }

    const handleGlobalClick = (e: MouseEvent) => {
      // If menu is open, and click is not inside a potential menu container
      // (simplification: close if it wasn't a button click that might be the toggle itself)
      // Actually, it's safer to just check if the target is outside certain areas if we had refs,
      // but for now, we can just close them if the user clicks anywhere that isn't the menu.
      const target = e.target as HTMLElement;
      if (!target.closest('button') && !target.closest('input')) {
        setMovingSceneId(null);
        setColorPickerGroupId(null);
      }
    }

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('mouseup', handleMouseUp)
    }
    
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('mousedown', handleGlobalClick)
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('mousedown', handleGlobalClick)
    }
  }, [isDragging, setToolbarPos, isEditorMode, undo, redo])

  // If we are NOT in editor mode, we show the collapsed floating button instead
  // of the old rectangular button. Or if we ARE in editor mode but user hit minimize (-)
  if (!isEditorMode || isCollapsed) {
    return (
      <div
        onMouseDown={(e) => {
          setIsDragging(true)
          dragRef.current = { startX: e.clientX, startY: e.clientY, initialPos: { ...toolbarPos }, isDragReal: false }
        }}
        onClick={() => {
          // Only open if we didn't just drag it across the screen
          if (!dragRef.current.isDragReal) {
            if (!isEditorMode) {
              toggleEditorMode() // Turn ON editor
            }
            setIsCollapsed(false) // Expand panel
          }
        }}
        style={{
          position: 'fixed',
          left: `${toolbarPos.x}px`,
          top: `${toolbarPos.y}px`,
          width: '60px',
          height: '60px',
          background: 'rgba(15,23,42,0.6)',
          border: '2px solid gold',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'grab',
          zIndex: 9999,
          boxShadow: '0 0 20px rgba(212,175,55,0.3)',
          backdropFilter: 'blur(10px)',
          fontSize: '24px',
          userSelect: 'none'
        }}
      >
        🎨
      </div>
    )
  }

  // Helper to update image and reset position for portals
  const handlePortalImageChange = (id: number, url: string) => {
    updateTempImageUrl(id, url, committedLocations, addedLocations)
  }

  const renderTabContent = () => {
    const allLocs = [...committedLocations, ...addedLocations]

    const renderSceneItem = (scene: any, sm: any) => (
      <div 
        key={scene.id}
        onClick={() => sm.switchScene(scene.id)}
        style={{ 
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          background: scene.id === sm.activeSceneId ? 'rgba(167, 139, 250, 0.15)' : 'rgba(255,255,255,0.03)',
          border: scene.id === sm.activeSceneId ? '1px solid #a78bfa' : '1px solid #333',
          borderRadius: '6px', padding: '8px 10px', cursor: 'pointer',
          transition: 'all 0.15s ease'
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <span style={{ color: scene.id === sm.activeSceneId ? 'white' : '#ccc', fontSize: '12px', fontWeight: scene.id === sm.activeSceneId ? 'bold' : 'normal' }}>
            {scene.id === sm.activeSceneId ? '▸ ' : ''}{scene.name}
          </span>
          <span style={{ color: '#555', fontSize: '9px' }}>{scene.elementCount} elements • 📁 {scene.assetFolder}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {scene.id === sm.activeSceneId && (
            <span style={{ color: '#a78bfa', fontSize: '16px' }}>✓</span>
          )}
          
          <div style={{ position: 'relative' }}>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setMovingSceneId(movingSceneId === scene.id ? null : scene.id);
              }}
              title="Move to Group"
              style={{ 
                background: movingSceneId === scene.id ? 'rgba(212, 175, 55, 0.2)' : 'transparent', 
                color: movingSceneId === scene.id ? 'gold' : '#444', 
                border: 'none', 
                borderRadius: '4px', cursor: 'pointer', fontSize: '12px',
                padding: '2px 4px',
                transition: 'all 0.2s ease'
              }}
            >
              📁
            </button>
            
            {movingSceneId === scene.id && (
              <div style={{ 
                position: 'absolute', right: 0, top: '25px', width: '180px', 
                background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', 
                boxShadow: '0 10px 25px rgba(0,0,0,0.6)', zIndex: 1000,
                display: 'flex', flexDirection: 'column', padding: '6px',
                backdropFilter: 'blur(10px)'
              }}>
                <span style={{ color: '#475569', fontSize: '9px', fontWeight: 'bold', padding: '4px 8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Тандоо:</span>
                <button 
                  onClick={(e) => { e.stopPropagation(); sm.assignSceneToGroup(scene.id, null); setMovingSceneId(null); }}
                  style={{ 
                    background: !scene.groupId ? 'rgba(255,255,255,0.05)' : 'transparent', 
                    border: 'none', color: !scene.groupId ? 'white' : '#94a3b8', 
                    padding: '8px 10px', textAlign: 'left', fontSize: '11px', cursor: 'pointer', borderRadius: '4px',
                    display: 'flex', alignItems: 'center', gap: '8px'
                  }}
                >
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', border: '1px solid #444' }}></span>
                  🚫 Группасыз (Default)
                </button>
                {sm.sceneGroups.map((g: any) => (
                  <button 
                    key={g.id}
                    onClick={(e) => { e.stopPropagation(); sm.assignSceneToGroup(scene.id, g.id); setMovingSceneId(null); }}
                    style={{ 
                      background: scene.groupId === g.id ? 'rgba(212,175,55,0.1)' : 'transparent', 
                      border: 'none', color: scene.groupId === g.id ? 'gold' : '#cbd5e1', 
                      padding: '8px 10px', textAlign: 'left', fontSize: '11px', cursor: 'pointer', borderRadius: '4px',
                      display: 'flex', alignItems: 'center', gap: '8px'
                    }}
                  >
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: g.color }}></span>
                    {g.name}
                    {scene.groupId === g.id && <span style={{ marginLeft: 'auto', fontSize: '10px' }}>✓</span>}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button 
            onClick={(e) => {
              e.stopPropagation();
              const name = prompt('Көчүрмөнүн аты:', `${scene.name} (Копия)`);
              if (!name) return;
              const id = name.trim().toLowerCase()
                .replace(/\s+/g, '-')
                .replace(/[^\w\u0400-\u04FF-]/gi, '');
              
              if (!id) {
                alert('Ката: ID бош болбошу керек!');
                return;
              }
              sm.duplicateScene(scene.id, name, id);
            }}
            title="Duplicate Scene"
            style={{ 
              background: 'rgba(255,255,255,0.05)', color: '#888', border: '1px solid #444', 
              borderRadius: '4px', padding: '2px 6px', cursor: 'pointer', fontSize: '12px' 
            }}
          >
          </button>
          {scene.id !== 'main' && (
            <button 
              onClick={(e) => {
                e.stopPropagation();
                if (confirm(`Чындап эле "${scene.name}" сценасын өчүрөсүзбү? Кайра калыбына келбейт!`)) {
                  sm.deleteScene(scene.id);
                }
              }}
              title="Delete Scene"
              style={{ 
                background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid #ef4444', 
                borderRadius: '4px', padding: '2px 6px', cursor: 'pointer', fontSize: '12px',
                transition: 'all 0.2s ease'
              }}
            >
              🗑️
            </button>
          )}
        </div>
      </div>
    );

    switch (activeTab) {
      case 'transform':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
              <span style={{ color: '#888', width: '60px', fontSize: '11px', fontWeight: 'bold', marginTop: '8px' }}>TARGET:</span>
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: '1fr 1fr', 
                gap: '4px', 
                flex: 1, 
                background: 'rgba(0,0,0,0.3)', 
                padding: '4px', 
                borderRadius: '8px',
                border: '1px solid #333'
              }}>
                <button
                  onClick={() => setEditTarget('element')}
                  style={{ 
                    background: editTarget === 'element' ? '#10b981' : 'rgba(16, 185, 129, 0.1)', 
                    color: editTarget === 'element' ? 'white' : '#10b981', 
                    border: editTarget === 'element' ? '1px solid #10b981' : '1px solid rgba(16, 185, 129, 0.3)', 
                    padding: '6px 4px', 
                    cursor: 'pointer', 
                    fontSize: '10px', 
                    fontWeight: 'bold',
                    borderRadius: '5px',
                    transition: 'all 0.2s'
                  }}
                >
                  ELEMENT
                </button>
                <button
                  onClick={() => setEditTarget('visual')}
                  style={{ 
                    background: editTarget === 'visual' ? '#ec4899' : 'rgba(236, 72, 153, 0.1)', 
                    color: editTarget === 'visual' ? 'white' : '#ec4899', 
                    border: editTarget === 'visual' ? '1px solid #ec4899' : '1px solid rgba(236, 72, 153, 0.3)', 
                    padding: '6px 4px', 
                    cursor: 'pointer', 
                    fontSize: '10px', 
                    fontWeight: 'bold',
                    borderRadius: '5px',
                    transition: 'all 0.2s'
                  }}
                >
                  VISUAL
                </button>
                <button
                  onClick={() => setEditTarget('hitbox')}
                  style={{ 
                    background: editTarget === 'hitbox' ? '#3b82f6' : 'rgba(59, 130, 246, 0.1)', 
                    color: editTarget === 'hitbox' ? 'white' : '#3b82f6', 
                    border: editTarget === 'hitbox' ? '1px solid #3b82f6' : '1px solid rgba(59, 130, 246, 0.3)', 
                    padding: '6px 4px', 
                    cursor: 'pointer', 
                    fontSize: '10px', 
                    fontWeight: 'bold',
                    borderRadius: '5px',
                    transition: 'all 0.2s'
                  }}
                >
                  HITBOX
                </button>
                <button
                  onClick={() => setEditTarget('popup')}
                  style={{ 
                    background: editTarget === 'popup' ? '#facc15' : 'rgba(250, 204, 21, 0.1)', 
                    color: editTarget === 'popup' ? 'black' : '#facc15', 
                    border: editTarget === 'popup' ? '1px solid #facc15' : '1px solid rgba(250, 204, 21, 0.3)', 
                    padding: '6px 4px', 
                    cursor: 'pointer', 
                    fontSize: '10px', 
                    fontWeight: 'bold',
                    borderRadius: '5px',
                    transition: 'all 0.2s'
                  }}
                >
                  POPUP
                </button>
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <span style={{ color: '#888', width: '60px', fontSize: '12px' }}>TOOLS:</span>
              <button
                onClick={() => setActiveTool(activeTool === 'move' ? null : 'move')}
                style={{
                  background: activeTool === 'move' ? 'gold' : 'transparent',
                  color: activeTool === 'move' ? 'black' : 'white',
                  border: '1px solid gold',
                  padding: '5px 12px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                }}
              >
                MOVE
              </button>
              <button
                onClick={() => setActiveTool(activeTool === 'resize' ? null : 'resize')}
                style={{
                  background: activeTool === 'resize' ? 'gold' : 'transparent',
                  color: activeTool === 'resize' ? 'black' : 'white',
                  border: '1px solid gold',
                  padding: '5px 12px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                }}
              >
                RESIZE
              </button>
            </div>
            
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <span style={{ color: '#888', width: '60px', fontSize: '12px' }}>GRID:</span>
              <div style={{ display: 'flex', background: 'rgba(0,0,0,0.5)', borderRadius: '6px', overflow: 'hidden', border: '1px solid #333' }}>
                <button 
                  onClick={() => setGridSnap(null)}
                  style={{ background: gridSnap === null ? '#444' : 'transparent', color: gridSnap === null ? 'white' : '#888', border: 'none', padding: '5px 10px', cursor: 'pointer', fontSize: '12px' }}
                >
                  OFF
                </button>
                <button 
                  onClick={() => setGridSnap(5)}
                  style={{ background: gridSnap === 5 ? '#444' : 'transparent', color: gridSnap === 5 ? 'white' : '#888', border: 'none', padding: '5px 10px', cursor: 'pointer', fontSize: '12px', borderLeft: '1px solid #333' }}
                >
                  5%
                </button>
                <button 
                  onClick={() => setGridSnap(10)}
                  style={{ background: gridSnap === 10 ? '#444' : 'transparent', color: gridSnap === 10 ? 'white' : '#888', border: 'none', padding: '5px 10px', cursor: 'pointer', fontSize: '12px', borderLeft: '1px solid #333' }}
                >
                  10%
                </button>
              </div>
            </div>

            {/* Visual Scale Display — Informative only, as it's now controlled by mouse-drag */}
            {selectedId && (
              <div style={{ borderTop: '1px solid #333', paddingTop: '15px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label style={{ color: '#888', fontSize: '11px', fontWeight: 'bold' }}>VISUAL SCALE (DRAG ELEMENT TO RESIZE):</label>
                  <span style={{ color: '#ec4899', fontSize: '13px', fontWeight: 'bold', background: 'rgba(236, 72, 153, 0.1)', padding: '2px 8px', borderRadius: '4px' }}>
                    {(tempScales[selectedId] ?? allLocs.find(l => l.id === selectedId)?.scale ?? 1).toFixed(2)}x
                  </span>
                </div>
              </div>
            )}

          </div>
        )
      case 'style':
        const locId = selectedId // Assuming locId refers to selectedId for element-specific properties
        const isBackgroundMode = editTarget === 'background'
        const currentStyle = !isBackgroundMode ? (tempStyles[locId] || {}) : {}
        const defaultLoc = !isBackgroundMode ? allLocs.find(l => l.id === locId) : null
        
        const opacity = isBackgroundMode 
          ? (tempSections[0]?.opacity ?? 1)
          : (currentStyle.opacity ?? defaultLoc?.opacity ?? 1)
          
        const fontFamily = currentStyle.fontFamily ?? defaultLoc?.fontFamily ?? 'Inter'
        const fontSize = currentStyle.fontSize ?? defaultLoc?.fontSize ?? '16px'
        const fontWeight = currentStyle.fontWeight ?? defaultLoc?.fontWeight ?? 'normal'
        const color = currentStyle.color ?? defaultLoc?.color ?? '#ffffff'

        const imageUrl = isBackgroundMode 
          ? (tempSections[0]?.url ?? '') 
          : (tempImageUrls[locId] ?? defaultLoc?.imageUrl ?? '')
          
        const isSvg = imageUrl.toLowerCase().endsWith('.svg')

        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {/* Element Selection Warning (Optional: could handle locId === -1 here) */}
            
            <div style={{ display: 'flex', borderBottom: '1px solid #333', marginBottom: '5px' }}>
              {['general', 'text', 'effects', 'popup'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveStyleTab(tab as any)}
                  style={{
                    flex: 1, padding: '8px 4px', background: 'transparent', border: 'none',
                    color: activeStyleTab === tab ? '#a78bfa' : '#666',
                    borderBottom: activeStyleTab === tab ? '2px solid #a78bfa' : '2px solid transparent',
                    fontWeight: 'bold', fontSize: '9px', cursor: 'pointer', textTransform: 'uppercase'
                  }}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Opacity Slider - Shared */}
            {activeStyleTab === 'general' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <label style={{ color: '#888', fontSize: '12px' }}>OPACITY:</label>
                <span style={{ color: 'gold', fontSize: '12px' }}>{Math.round(opacity * 100)}%</span>
              </div>
              <input 
                type="range" 
                min="0" max="1" step="0.05" 
                value={opacity}
                onMouseDown={pushHistory}
                onChange={(e) => {
                  const val = parseFloat(e.target.value)
                  if (isBackgroundMode) {
                    updateTempSection(tempSections[0]?.id || 1, { opacity: val })
                  } else {
                    updateTempStyle(locId, { opacity: val })
                  }
                }}
                style={{ width: '100%', accentColor: 'gold' }}
              />
            </div>
            )}

            {/* Font Control Group — show only if it's a text element OR an SVG AND NOT background mode */}
            {activeStyleTab === 'text' && !isBackgroundMode && (defaultLoc?.content !== undefined || isSvg) && (
              <div style={{ borderTop: '1px solid #333', paddingTop: '10px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <span style={{ color: '#ec4899', fontSize: '12px', fontWeight: 'bold' }}>
                  {isSvg ? 'SVG PROPERTIES' : 'TEXT TOOLS (TBD)'}
                </span>
                
                {defaultLoc?.content !== undefined && (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <label style={{ color: '#888', fontSize: '12px' }}>FONT:</label>
                      <select 
                        value={fontFamily}
                        onMouseDown={pushHistory}
                        onChange={(e) => updateTempStyle(locId, { fontFamily: e.target.value })}
                        style={{ background: '#222', color: 'white', border: '1px solid #444', borderRadius: '4px', padding: '4px', fontSize: '12px', width: '120px' }}
                      >
                        <option value="Inter">Inter</option>
                        <option value="Luckiest Guy">Luckiest Guy (Cartoon)</option>
                        <option value="Bungee">Bungee (Game)</option>
                        <option value="Titan One">Titan One (Bold)</option>
                        <option value="Fredoka">Fredoka (Soft)</option>
                        <option value="Press Start 2P">Press Start 2P (Retro)</option>
                        <option value="Tektur">Tektur (Future)</option>
                        <option value="Gost Type A">Gost Type A</option>
                      </select>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <label style={{ color: '#888', fontSize: '12px' }}>WEIGHT:</label>
                      <select 
                        value={fontWeight}
                        onMouseDown={pushHistory}
                        onChange={(e) => updateTempStyle(locId, { fontWeight: e.target.value })}
                        style={{ background: '#222', color: 'white', border: '1px solid #444', borderRadius: '4px', padding: '4px', fontSize: '12px', width: '120px' }}
                      >
                        <option value="normal">Normal</option>
                        <option value="bold">Bold</option>
                        <option value="300">Light</option>
                        <option value="900">Black</option>
                      </select>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <label style={{ color: '#888', fontSize: '12px' }}>ALIGNMENT:</label>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        {(['left', 'center', 'right'] as const).map(align => (
                          <button
                            key={align}
                            onMouseDown={pushHistory}
                            onClick={(e) => { e.preventDefault(); updateTempStyle(locId, { textAlign: align }); }}
                            style={{
                              background: (currentStyle.textAlign ?? defaultLoc?.textAlign ?? 'center') === align ? '#3b82f6' : '#222',
                              color: 'white',
                              border: '1px solid #444',
                              borderRadius: '4px',
                              padding: '4px 8px',
                              fontSize: '12px',
                              cursor: 'pointer'
                            }}
                            title={`Align ${align}`}
                          >
                            {align === 'left' ? '⬅️' : align === 'center' ? '↔️' : '➡️'}
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                <div style={{ display: 'flex', gap: '10px' }}>
                  {defaultLoc?.content !== undefined && (
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '5px' }}>
                      <label style={{ color: '#888', fontSize: '12px' }}>SIZE:</label>
                      <input 
                        type="text" 
                        value={fontSize}
                        onFocus={pushHistory}
                        onChange={(e) => updateTempStyle(locId, { fontSize: e.target.value })}
                        style={{ background: '#222', color: 'white', border: '1px solid #444', borderRadius: '4px', padding: '4px 8px', fontSize: '12px', width: '100%' }}
                      />
                    </div>
                  )}
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    <label style={{ color: '#888', fontSize: '12px' }}>{isSvg ? 'COLOR (SVG FILL):' : 'COLOR:'}</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', background: '#222', border: '1px solid #444', borderRadius: '4px', padding: '2px' }}>
                      <input 
                        type="color" 
                        value={color}
                        onMouseDown={pushHistory}
                        onChange={(e) => updateTempStyle(locId, { color: e.target.value })}
                        style={{ border: 'none', width: '30px', height: '24px', padding: 0, background: 'transparent', cursor: 'pointer' }}
                      />
                      <span style={{ color: 'white', fontSize: '10px' }}>{color.toUpperCase()}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Effects Control Group — Hide in Background Mode */}
            {activeStyleTab === 'effects' && !isBackgroundMode && (
              <div style={{ borderTop: '1px solid #333', paddingTop: '10px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <span style={{ color: '#ec4899', fontSize: '12px', fontWeight: 'bold' }}>EFFECTS</span>
                
                <div style={{ display: 'flex', gap: '10px' }}>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <label style={{ color: '#888', fontSize: '12px' }}>GLOW BLUR:</label>
                      <span style={{ color: 'gold', fontSize: '12px' }}>{currentStyle.textShadowBlur ?? defaultLoc?.textShadowBlur ?? 0}px</span>
                    </div>
                    <input 
                      type="range" 
                      min="0" max="50" step="1" 
                      value={currentStyle.textShadowBlur ?? defaultLoc?.textShadowBlur ?? 0}
                      onMouseDown={pushHistory}
                      onChange={(e) => updateTempStyle(locId, { textShadowBlur: parseInt(e.target.value) })}
                      style={{ width: '100%', accentColor: 'gold' }}
                    />
                  </div>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <label style={{ color: '#888', fontSize: '12px' }}>GLOW OPACITY:</label>
                      <span style={{ color: 'gold', fontSize: '12px' }}>{Math.round((currentStyle.textShadowOpacity ?? defaultLoc?.textShadowOpacity ?? 1) * 100)}%</span>
                    </div>
                    <input 
                      type="range" 
                      min="0" max="1" step="0.05" 
                      value={currentStyle.textShadowOpacity ?? defaultLoc?.textShadowOpacity ?? 1}
                      onMouseDown={pushHistory}
                      onChange={(e) => updateTempStyle(locId, { textShadowOpacity: parseFloat(e.target.value) })}
                      style={{ width: '100%', accentColor: '#ec4899' }}
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', width: '80px' }}>
                    <label style={{ color: '#888', fontSize: '12px' }}>GLOW COLOR:</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', background: '#222', border: '1px solid #444', borderRadius: '4px', padding: '2px' }}>
                      <input 
                        type="color" 
                        value={currentStyle.textShadowColor ?? defaultLoc?.textShadowColor ?? '#d4af37'}
                        onMouseDown={pushHistory}
                        onChange={(e) => updateTempStyle(locId, { textShadowColor: e.target.value })}
                        style={{ border: 'none', width: '30px', height: '24px', padding: 0, background: 'transparent', cursor: 'pointer' }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Text Background Control Group — Hide in Background Mode */}
            {activeStyleTab === 'text' && !isBackgroundMode && defaultLoc?.content !== undefined && (
              <div style={{ borderTop: '1px solid #333', paddingTop: '10px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <span style={{ color: '#ec4899', fontSize: '12px', fontWeight: 'bold' }}>TEXT BACKGROUND</span>
                
                <div style={{ display: 'flex', gap: '10px' }}>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <label style={{ color: '#888', fontSize: '12px' }}>BG OPACITY:</label>
                      <span style={{ color: 'gold', fontSize: '12px' }}>{Math.round((currentStyle.textBgOpacity ?? defaultLoc?.textBgOpacity ?? 0) * 100)}%</span>
                    </div>
                    <input 
                      type="range" 
                      min="0" max="1" step="0.05" 
                      value={currentStyle.textBgOpacity ?? defaultLoc?.textBgOpacity ?? 0}
                      onMouseDown={pushHistory}
                      onChange={(e) => updateTempStyle(locId, { textBgOpacity: parseFloat(e.target.value) })}
                      style={{ width: '100%', accentColor: 'gold' }}
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', width: '80px' }}>
                    <label style={{ color: '#888', fontSize: '12px' }}>BG COLOR:</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', background: '#222', border: '1px solid #444', borderRadius: '4px', padding: '2px' }}>
                      <input 
                        type="color" 
                        value={currentStyle.textBgColor ?? defaultLoc?.textBgColor ?? '#000000'}
                        onMouseDown={pushHistory}
                        onChange={(e) => updateTempStyle(locId, { textBgColor: e.target.value })}
                        style={{ border: 'none', width: '30px', height: '24px', padding: 0, background: 'transparent', cursor: 'pointer' }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Popup Styling — ONLY if interactionType is popup */}
            {activeStyleTab === 'popup' && !isBackgroundMode && (tempInteractionTypes[locId] ?? defaultLoc?.interactionType) === 'popup' && (
              <div style={{ borderTop: '1px solid #333', paddingTop: '10px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <span style={{ color: '#facc15', fontSize: '12px', fontWeight: 'bold' }}>POPUP STYLING</span>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <label style={{ color: '#888', fontSize: '12px' }}>BG OPACITY:</label>
                      <span style={{ color: 'gold', fontSize: '12px' }}>{Math.round((currentStyle.popupBgOpacity ?? defaultLoc?.popupBgOpacity ?? 0.95) * 100)}%</span>
                    </div>
                    <input 
                      type="range" 
                      min="0" max="1" step="0.05" 
                      value={currentStyle.popupBgOpacity ?? defaultLoc?.popupBgOpacity ?? 0.95}
                      onMouseDown={pushHistory}
                      onChange={(e) => updateTempStyle(locId, { popupBgOpacity: parseFloat(e.target.value) })}
                      style={{ width: '100%', accentColor: 'gold' }}
                    />
                  </div>

                  <div style={{ display: 'flex', gap: '10px' }}>
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '5px' }}>
                      <label style={{ color: '#888', fontSize: '11px' }}>BG COLOR:</label>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px', background: '#222', border: '1px solid #444', borderRadius: '4px', padding: '2px' }}>
                        <input 
                          type="color" 
                          value={currentStyle.popupBgColor ?? defaultLoc?.popupBgColor ?? '#0f172a'}
                          onMouseDown={pushHistory}
                          onChange={(e) => updateTempStyle(locId, { popupBgColor: e.target.value })}
                          style={{ border: 'none', width: '20px', height: '20px', padding: 0, background: 'transparent', cursor: 'pointer' }}
                        />
                        <span style={{ color: 'white', fontSize: '8px' }}>{(currentStyle.popupBgColor ?? defaultLoc?.popupBgColor ?? '#0f172a').slice(0,4)}...</span>
                      </div>
                    </div>

                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '5px' }}>
                      <label style={{ color: '#888', fontSize: '11px' }}>HEADER:</label>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px', background: '#222', border: '1px solid #444', borderRadius: '4px', padding: '2px' }}>
                        <input 
                          type="color" 
                          value={currentStyle.popupHeaderColor ?? defaultLoc?.popupHeaderColor ?? '#0f172a'}
                          onMouseDown={pushHistory}
                          onChange={(e) => updateTempStyle(locId, { popupHeaderColor: e.target.value })}
                          style={{ border: 'none', width: '20px', height: '20px', padding: 0, background: 'transparent', cursor: 'pointer' }}
                        />
                        <span style={{ color: 'white', fontSize: '8px' }}>{(currentStyle.popupHeaderColor ?? defaultLoc?.popupHeaderColor ?? '#0f172a').slice(0,4)}...</span>
                      </div>
                    </div>

                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '5px' }}>
                      <label style={{ color: '#888', fontSize: '11px' }}>TEXT:</label>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px', background: '#222', border: '1px solid #444', borderRadius: '4px', padding: '2px' }}>
                        <input 
                          type="color" 
                          value={currentStyle.popupTextColor ?? defaultLoc?.popupTextColor ?? '#ffffff'}
                          onMouseDown={pushHistory}
                          onChange={(e) => updateTempStyle(locId, { popupTextColor: e.target.value })}
                          style={{ border: 'none', width: '20px', height: '20px', padding: 0, background: 'transparent', cursor: 'pointer' }}
                        />
                        <span style={{ color: 'white', fontSize: '8px' }}>{(currentStyle.popupTextColor ?? defaultLoc?.popupTextColor ?? '#ffffff').slice(0,4)}...</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Text Content Editor + Symbol Library — Hide in Background Mode */}
            {activeStyleTab === 'general' && !isBackgroundMode && defaultLoc?.content !== undefined && (
              <div style={{ borderTop: '1px solid #333', paddingTop: '10px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                {/* Header: Label + Toggle */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label style={{ color: '#888', fontSize: '12px' }}>CONTENT:</label>
                  <div style={{ display: 'flex', background: '#111', borderRadius: '4px', border: '1px solid #333', padding: '2px', gap: '2px' }}>
                    <button
                      onClick={() => setContentMode('text')}
                      style={{
                        padding: '2px 8px', fontSize: '10px', fontWeight: 'bold', borderRadius: '3px', border: 'none', cursor: 'pointer',
                        background: contentMode === 'text' ? '#facc15' : 'transparent',
                        color: contentMode === 'text' ? '#000' : '#666',
                        transition: 'all 0.15s'
                      }}
                    >
                      🅰️ TEXT
                    </button>
                    <button
                      onClick={() => setContentMode('symbol')}
                      style={{
                        padding: '2px 8px', fontSize: '10px', fontWeight: 'bold', borderRadius: '3px', border: 'none', cursor: 'pointer',
                        background: contentMode === 'symbol' ? '#facc15' : 'transparent',
                        color: contentMode === 'symbol' ? '#000' : '#666',
                        transition: 'all 0.15s'
                      }}
                    >
                      🎨 SYMBOL
                    </button>
                  </div>
                </div>

                {/* TEXT MODE: Original textarea */}
                {contentMode === 'text' && (
                  <textarea 
                    value={tempContents[locId] ?? defaultLoc.content}
                    onFocus={pushHistory}
                    onChange={(e) => updateTempContent(locId, e.target.value)}
                    style={{ 
                      background: '#222', color: 'white', border: '1px solid #444', borderRadius: '4px',
                      padding: '8px', fontSize: '12px', width: '100%', minHeight: '60px', resize: 'vertical'
                    }}
                  />
                )}

                {/* SYMBOL MODE: Categorized icon grid */}
                {contentMode === 'symbol' && (
                  <div style={{
                    background: '#111', border: '1px solid #333', borderRadius: '8px',
                    maxHeight: '200px', overflowY: 'auto', padding: '6px',
                    scrollbarWidth: 'thin', scrollbarColor: '#facc15 #111'
                  }}>
                    {SYMBOL_LIBRARY.map((cat) => (
                      <div key={cat.category} style={{ marginBottom: '8px' }}>
                        <div style={{
                          fontSize: '10px', fontWeight: 'bold', color: cat.color,
                          marginBottom: '4px', paddingBottom: '2px',
                          borderBottom: `1px solid ${cat.color}33`
                        }}>
                          {cat.category}
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px' }}>
                          {cat.icons.map((icon) => {
                            const currentContent = tempContents[locId] ?? defaultLoc.content;
                            const isActive = currentContent === icon;
                            return (
                              <button
                                key={icon}
                                onClick={() => {
                                  pushHistory();
                                  updateTempContent(locId, icon);
                                }}
                                style={{
                                  background: isActive ? `${cat.color}33` : 'transparent',
                                  border: isActive ? `1px solid ${cat.color}` : '1px solid transparent',
                                  borderRadius: '6px', padding: '4px', cursor: 'pointer',
                                  fontSize: '18px', lineHeight: '1',
                                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                                  transition: 'all 0.1s'
                                }}
                                onMouseEnter={(e) => { e.currentTarget.style.background = `${cat.color}22`; e.currentTarget.style.transform = 'scale(1.2)'; }}
                                onMouseLeave={(e) => { e.currentTarget.style.background = isActive ? `${cat.color}33` : 'transparent'; e.currentTarget.style.transform = 'scale(1)'; }}
                              >
                                {icon}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Image URL Editor — Shared */}
            {activeStyleTab === 'general' && (isBackgroundMode || defaultLoc?.content === undefined) && (
              <div style={{ borderTop: '1px solid #333', paddingTop: '10px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label style={{ color: '#888', fontSize: '11px', fontWeight: 'bold' }}>IMAGE / PORTAL ASSET:</label>
                  
                  {/* The [ ELEM | BG ] Toggle */}
                  <div style={{ display: 'flex', background: '#111', borderRadius: '4px', border: '1px solid #333', padding: '2px', gap: '2px' }}>
                    <button
                      onClick={() => setEditTarget('element')}
                      style={{
                        padding: '2px 6px',
                        fontSize: '9px',
                        fontWeight: 'bold',
                        borderRadius: '2px',
                        border: 'none',
                        cursor: 'pointer',
                        background: !isBackgroundMode ? '#10b981' : 'transparent',
                        color: !isBackgroundMode ? 'white' : '#666'
                      }}
                    >
                      ELEM
                    </button>
                    <button
                      onClick={() => setEditTarget('background')}
                      style={{
                        padding: '2px 6px',
                        fontSize: '9px',
                        fontWeight: 'bold',
                        borderRadius: '2px',
                        border: 'none',
                        cursor: 'pointer',
                        background: isBackgroundMode ? '#3b82f6' : 'transparent',
                        color: isBackgroundMode ? 'white' : '#666'
                      }}
                    >
                      BG
                    </button>
                  </div>
                </div>
                
                <div style={{ display: 'flex', gap: '5px' }}>
                  <select
                    value={imageUrl}
                    onMouseDown={pushHistory}
                    onChange={(e) => {
                      const val = e.target.value
                      if (isBackgroundMode) {
                        updateTempSection(tempSections[0]?.id || 1, { url: val })
                      } else {
                        handlePortalImageChange(locId, val)
                      }
                    }}
                    style={{ 
                      background: '#111', 
                      color: '#3b82f6', 
                      border: '1px solid #333', 
                      borderRadius: '4px', 
                      padding: '8px', 
                      fontSize: '11px', 
                      flex: 1,
                      outline: 'none'
                    }}
                  >
                    <option value="">-- Select from Library --</option>
                    {availableAssets.map(asset => (
                      <option key={asset} value={asset}>{asset}</option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginTop: '5px' }}>
                  <label style={{ color: '#666', fontSize: '9px' }}>OR CUSTOM URL/FILE NAME:</label>
                  <input 
                    type="text"
                    placeholder="https://example.com/icon.png"
                    value={imageUrl}
                    onFocus={pushHistory}
                    onChange={(e) => {
                      const val = e.target.value
                      if (isBackgroundMode) {
                        updateTempSection(tempSections[0]?.id || 1, { url: val })
                      } else {
                        handlePortalImageChange(locId, val)
                      }
                    }}
                    style={{ 
                      background: '#111', 
                      color: '#3b82f6', 
                      border: '1px solid #333', 
                      borderRadius: '4px', 
                      padding: '8px', 
                      fontSize: '11px', 
                      width: '100%',
                      outline: 'none'
                    }}
                  />
                </div>
                
                <span style={{ color: '#666', fontSize: '10px', fontStyle: 'italic' }}>
                  Бош калтырсаңыз: `/assets/${sceneManager.activeScene?.assetFolder || 'main_menu'}/${locId}.png`
                </span>

                {/* 🎯 Canvas Auto-Detect Button */}
                {!isBackgroundMode && locId && (
                  <button
                    disabled={detectStatus === 'scanning'}
                    onClick={async () => {
                      if (!locId) return
                      setDetectStatus('scanning')
                      pushHistory()

                      // Build the actual image URL the same way MapIcon does
                      const rawUrl = tempImageUrls[locId] ?? defaultLoc?.imageUrl ?? ''
                      const assetFolder = sceneManager.activeScene?.assetFolder || 'main_menu'
                      let finalUrl = `/assets/${assetFolder}/${locId}.png`
                      if (rawUrl) {
                        if (rawUrl.startsWith('http') || rawUrl.startsWith('/') || rawUrl.startsWith('data:')) {
                          finalUrl = rawUrl
                        } else {
                          const hasExt = rawUrl.includes('.')
                          finalUrl = `/assets/${assetFolder}/${rawUrl}${hasExt ? '' : '.png'}`
                        }
                      }

                      const result = await detectImageCenter(finalUrl)
                      if (result.found) {
                        updateTempHandle(locId, result.x, result.y)
                        setDetectStatus('done')
                      } else {
                        setDetectStatus('error')
                      }
                      setTimeout(() => setDetectStatus('idle'), 2000)
                    }}
                    style={{
                      marginTop: '8px',
                      padding: '8px 12px',
                      background: detectStatus === 'done' ? '#10b981' : detectStatus === 'error' ? '#ef4444' : detectStatus === 'scanning' ? '#6366f1' : 'rgba(212,175,55,0.15)',
                      color: detectStatus === 'idle' ? 'gold' : 'white',
                      border: detectStatus === 'idle' ? '1px solid gold' : '1px solid transparent',
                      borderRadius: '6px',
                      cursor: detectStatus === 'scanning' ? 'wait' : 'pointer',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      width: '100%',
                      transition: 'all 0.3s ease',
                    }}
                  >
                    {detectStatus === 'scanning' ? '⏳ Сканерлөө...' 
                      : detectStatus === 'done' ? '✅ Борбор табылды!' 
                      : detectStatus === 'error' ? '❌ Табылган жок' 
                      : '🎯 Борборду тап'}
                  </button>
                )}
              </div>
            )}
          </div>
        )
      case 'layers':
        const allElementsForLayers = [...committedLocations, ...addedLocations]
          .filter(loc => !deletedLocations.includes(loc.id))
          .filter(loc => {
            if (activeSectionFilter === 'all') return true
            const sid = tempSectionIds[loc.id] ?? loc.sectionId ?? 1
            return sid === activeSectionFilter
          })

        const topLevelEntities: Array<{ type: 'element' | 'group', id: number | string, loc?: any, group?: any }> = []
        const renderedGroups = new Set<number>()

        // Build top-level tree: either individual elements or groups
        for (let i = layerOrder.length - 1; i >= 0; i--) {
          const id = layerOrder[i]
          const loc = allElementsForLayers.find(l => l.id === id)
          if (!loc) continue
          
          const group = Object.values(groups).find(g => g.memberIds.includes(id))
          if (group) {
            if (!renderedGroups.has(group.id)) {
              topLevelEntities.push({ type: 'group', id: group.id, group })
              renderedGroups.add(group.id)
            }
          } else {
            topLevelEntities.push({ type: 'element', id, loc })
          }
        }

        const handleDragStart = (e: React.DragEvent, id: number | string, type: 'element' | 'group') => {
          e.dataTransfer.setData('text/plain', JSON.stringify({ id, type }))
          e.dataTransfer.effectAllowed = 'move'
        }

        const handleDragOver = (e: React.DragEvent) => {
          e.preventDefault()
          e.dataTransfer.dropEffect = 'move'
        }

        const handleDrop = (e: React.DragEvent, dropId: number | string, dropType: 'element' | 'group') => {
          e.preventDefault()
          const data = e.dataTransfer.getData('text/plain')
          if (!data) return
          try {
            const { id: dragId, type: dragType } = JSON.parse(data)
            if (dragId === dropId) return

            const fromIdx = layerOrder.indexOf(dragType === 'element' ? dragId : (groups[dragId]?.memberIds[0]))
            const toIdx = layerOrder.indexOf(dropType === 'element' ? dropId : (groups[dropId]?.memberIds[0]))

            if (dragType === 'element') {
              reorderLayers(fromIdx, toIdx)
            } else {
              reorderBlock(groups[dragId].memberIds, toIdx)
            }
          } catch (err) { console.error('Drop failed', err) }
        }

        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#ec4899', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase' }}>Structure Manager</span>
              <div style={{ display: 'flex', gap: '5px' }}>
                <button 
                  onClick={activeLayersMode === 'elements' ? toggleSelectionMode : undefined} 
                  style={{ 
                    background: isSelectionMode ? '#ef4444' : '#6366f1', color: 'white', 
                    border: 'none', borderRadius: '4px', padding: '4px 8px', fontSize: '9px', fontWeight: 'bold', 
                    cursor: activeLayersMode === 'sections' ? 'not-allowed' : 'pointer',
                    opacity: activeLayersMode === 'sections' ? 0.3 : 1
                  }}
                  disabled={activeLayersMode === 'sections'}
                >
                  {isSelectionMode ? 'CANCEL' : 'MULTI-SELECT'}
                </button>
                {!isSelectionMode && activeLayersMode === 'elements' && (
                  <>
                    <button 
                      onClick={addTextLocation}
                      style={{ background: '#ec4899', color: 'white', border: 'none', borderRadius: '4px', padding: '4px 8px', fontSize: '9px', fontWeight: 'bold', cursor: 'pointer' }}
                    >
                      🅰️ + ADD TEXT
                    </button>
                    <button 
                      onClick={addImageLocation}
                      style={{ background: '#10b981', color: 'white', border: 'none', borderRadius: '4px', padding: '4px 8px', fontSize: '9px', fontWeight: 'bold', cursor: 'pointer' }}
                    >
                      🖼️ + ADD IMAGE
                    </button>
                    <button 
                      onClick={addPopupLocation}
                      style={{ background: '#facc15', color: 'black', border: 'none', borderRadius: '4px', padding: '4px 8px', fontSize: '9px', fontWeight: 'bold', cursor: 'pointer' }}
                    >
                      💬 + ADD POPUP
                    </button>
                  </>
                )}
                {!isSelectionMode && activeLayersMode === 'sections' && (
                  <button 
                    onClick={addBackgroundSection}
                    style={{ background: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px', padding: '4px 8px', fontSize: '9px', fontWeight: 'bold', cursor: 'pointer' }}
                  >
                    + ADD SECTION
                  </button>
                )}
              </div>
            </div>

            {isSelectionMode && (
              <div style={{ background: 'rgba(99, 102, 241, 0.1)', border: '1px dashed #6366f1', borderRadius: '8px', padding: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#6366f1', fontSize: '11px', fontWeight: 'bold' }}>{selectedIds.length} SELECTED</span>
                <button 
                  disabled={selectedIds.length < 2}
                  onClick={() => createGroup('New Folder')}
                  style={{ background: selectedIds.length < 2 ? '#333' : '#10b981', color: 'white', border: 'none', borderRadius: '4px', padding: '5px 12px', fontSize: '10px', fontWeight: 'bold', cursor: selectedIds.length < 2 ? 'not-allowed' : 'pointer' }}
                >
                  CREATE GROUP 📂
                </button>
              </div>
            )}

            <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
              <select 
                value={activeSectionFilter} 
                onChange={(e) => setActiveSectionFilter(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                style={{ 
                  flex: 1, background: '#111', color: 'gold', border: '1px solid #333', 
                  borderRadius: '6px', padding: '6px 10px', fontSize: '11px', fontWeight: 'bold', outline: 'none' 
                }}
              >
                <option value="all">📁 ALL SECTIONS</option>
                {tempSections.map((s, i) => (
                  <option key={s.id} value={s.id}>🖼️ SECTION {i + 1}</option>
                ))}
              </select>
              <button 
                onClick={syncAllToSections}
                title="Sync elements to current background territories"
                style={{ background: '#333', color: '#888', border: 'none', borderRadius: '6px', padding: '6px 10px', fontSize: '11px', cursor: 'pointer' }}
              >
                🌀 SYNC
              </button>
            </div>

            <div style={{ display: 'flex', background: '#111', borderRadius: '8px', padding: '3px' }}>
              {(['elements', 'sections'] as const).map(mode => (
                <button 
                  key={mode} 
                  onClick={() => setActiveLayersMode(mode)}
                  style={{ 
                    flex: 1, background: activeLayersMode === mode ? '#333' : 'transparent', 
                    color: activeLayersMode === mode ? 'white' : '#555', border: 'none', borderRadius: '6px', 
                    padding: '8px', fontSize: '10px', fontWeight: 'bold', cursor: 'pointer', textTransform: 'uppercase',
                    transition: 'all 0.2s'
                  }}
                >
                  {mode}
                </button>
              ))}
            </div>

            <div style={{ maxHeight: '450px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px', paddingRight: '4px' }}>
              {activeLayersMode === 'elements' ? (
                topLevelEntities.map((entity) => {
                  if (entity.type === 'group') {
                    const group = entity.group
                    const isEditing = editingNameId === group.id
                    return (
                      <div 
                        key={group.id} 
                        draggable 
                        onDragStart={(e) => handleDragStart(e, group.id, 'group')}
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, group.id, 'group')}
                        style={{ border: '1px solid #444', borderRadius: '8px', background: '#1a1a1a' }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 10px', background: '#222', gap: '8px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: 0 }}>
                            <button onClick={() => toggleGroupCollapse(group.id)} style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', padding: 0 }}>{group.isCollapsed ? '▶' : '▼'}</button>
                            {isEditing ? (
                              <input 
                                autoFocus
                                value={editingNameValue}
                                onChange={(e) => setEditingNameValue(e.target.value)}
                                onBlur={() => { updateGroupName(group.id, editingNameValue); setEditingNameId(null); }}
                                onKeyDown={(e) => { if (e.key === 'Enter') { updateGroupName(group.id, editingNameValue); setEditingNameId(null); } }}
                                style={{ background: '#000', border: '1px solid #10b981', color: 'white', fontWeight: 'bold', fontSize: '11px', width: '100%', outline: 'none', borderRadius: '2px' }}
                              />
                            ) : (
                              <span style={{ color: '#10b981', fontWeight: 'bold', fontSize: '11px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {group.name}
                              </span>
                            )}
                          </div>
                          <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                            <button onClick={() => { setEditingNameId(group.id); setEditingNameValue(group.name); }} style={{ background: 'none', border: 'none', color: '#888', fontSize: '12px', cursor: 'pointer' }}>✏️</button>
                            <button onClick={() => ungroup(group.id)} style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '9px', cursor: 'pointer' }}>UNGROUP</button>
                          </div>
                        </div>
                        {!group.isCollapsed && (
                          <div style={{ 
                            padding: '4px 0 4px 12px', 
                            display: 'flex', 
                            flexDirection: 'column', 
                            gap: '2px', 
                            borderTop: '1px solid #333', 
                            background: 'rgba(0,0,0,0.2)',
                            minHeight: '20px' // Ensure it's never zero-height when expanded
                          }}>
                            {allElementsForLayers
                              .filter(l => group.memberIds.map(String).includes(String(l.id)))
                              .sort((a,b) => layerOrder.indexOf(b.id) - layerOrder.indexOf(a.id))
                              .map(loc => {
                                const isSelected = selectedIds.includes(loc.id)
                                const isCurrent = selectedId === loc.id
                                const isEditing = editingNameId === loc.id
                                const floorNum = layerOrder.indexOf(loc.id) + 1
                                return (
                                  <div 
                                    key={loc.id}
                                    draggable
                                    onDragStart={(e) => handleDragStart(e, loc.id, 'element')}
                                    onDragOver={handleDragOver}
                                    onDrop={(e) => handleDrop(e, loc.id, 'element')}
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      if (isSelectionMode) toggleItemSelection(loc.id)
                                      else { setEditTarget('element'); setSelectedId(loc.id); }
                                    }}
                                    style={{ 
                                      background: isSelected ? 'rgba(99,102,241,0.2)' : isCurrent ? 'rgba(212,175,55,0.1)' : 'transparent',
                                      borderLeft: '2px solid #333',
                                      padding: '6px 12px', 
                                      cursor: 'pointer', 
                                      display: 'flex', 
                                      justifyContent: 'space-between', 
                                      alignItems: 'flex-start',
                                      transition: 'all 0.2s', 
                                      gap: '8px',
                                      minHeight: '34px'
                                    }}
                                  >
                                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', flex: 1, minWidth: 0 }}>
                                      <span style={{ fontSize: '9px', color: 'gold', opacity: 0.6, marginTop: '4px', flexShrink: 0 }}>{floorNum}</span>
                                      <span style={{ fontSize: '14px', flexShrink: 0 }}>
                                        {(tempInteractionTypes[loc.id] ?? loc.interactionType) === 'popup' ? '💬' : (loc.content !== undefined ? '🅰️' : '🖼️')}
                                      </span>
                                      {isEditing ? (
                                        <input 
                                          autoFocus
                                          onClick={(e) => e.stopPropagation()}
                                          value={editingNameValue}
                                          onChange={(e) => setEditingNameValue(e.target.value)}
                                          onBlur={() => { updateTempName(loc.id, editingNameValue); setEditingNameId(null); }}
                                          onKeyDown={(e) => { if (e.key === 'Enter') { updateTempName(loc.id, editingNameValue); setEditingNameId(null); } }}
                                          style={{ background: '#000', border: '1px solid gold', color: 'white', fontSize: '11px', width: '100%', outline: 'none', borderRadius: '4px', padding: '1px 3px' }}
                                        />
                                      ) : (
                                        <span style={{ fontSize: '11px', color: isCurrent ? 'gold' : '#ccc', fontWeight: isCurrent ? 'bold' : 'normal', overflowWrap: 'anywhere' }}>
                                          {tempNames[loc.id] ?? loc.name}
                                        </span>
                                      )}
                                    </div>
                                    <div style={{ display: 'flex', gap: '6px', flexShrink: 0, marginTop: '2px' }}>
                                      <button onClick={(e) => { e.stopPropagation(); toggleTempHidden(loc.id, pushHistory); }} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px', opacity: tempHidden[loc.id] ? 0.3 : 1 }}>{tempHidden[loc.id] ? '👁️‍🗨️' : '👁️'}</button>
                                      <button onClick={(e) => { e.stopPropagation(); setEditingNameId(loc.id); setEditingNameValue(tempNames[loc.id] ?? loc.name); }} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '10px' }}>✏️</button>
                                      <button onClick={(e) => { e.stopPropagation(); duplicateLocation(loc.id); }} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px', color: '#3b82f6' }}>📋</button>
                                      <button onClick={(e) => { e.stopPropagation(); toggleDeletedLocation(loc.id); }} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px', color: '#ef4444' }}>🗑️</button>
                                    </div>
                                  </div>
                                )
                              })}
                          </div>
                        )}
                      </div>
                    )
                  } else {
                    const loc = entity.loc!
                    const isSelected = selectedIds.includes(loc.id)
                    const isCurrent = selectedId === loc.id
                    const isEditing = editingNameId === loc.id
                    const floorNum = layerOrder.indexOf(loc.id) + 1
                    return (
                      <div 
                        key={loc.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, loc.id, 'element')}
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, loc.id, 'element')}
                        onClick={() => {
                          if (isSelectionMode) toggleItemSelection(loc.id)
                          else { setEditTarget('element'); setSelectedId(loc.id); }
                        }}
                        style={{ 
                          background: isSelected ? 'rgba(99,102,241,0.2)' : isCurrent ? 'rgba(212,175,55,0.1)' : '#1a1a1a',
                          border: isSelected ? '1px solid #6366f1' : isCurrent ? '1px solid gold' : '1px solid #333',
                          padding: '8px 12px', borderRadius: '8px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
                          transition: 'all 0.2s', gap: '10px'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', flex: 1, minWidth: 0 }}>
                          <span style={{ fontSize: '10px', color: 'gold', opacity: 0.7, marginTop: '4px', flexShrink: 0 }}>{floorNum}</span>
                          <span style={{ fontSize: '16px', flexShrink: 0 }}>
                            {(tempInteractionTypes[loc.id] ?? loc.interactionType) === 'popup' ? '💬' : (loc.content !== undefined ? '🅰️' : '🖼️')}
                          </span>
                          {isEditing ? (
                            <input 
                              autoFocus
                              onClick={(e) => e.stopPropagation()}
                              value={editingNameValue}
                              onChange={(e) => setEditingNameValue(e.target.value)}
                              onBlur={() => { updateTempName(loc.id, editingNameValue); setEditingNameId(null); }}
                              onKeyDown={(e) => { if (e.key === 'Enter') { updateTempName(loc.id, editingNameValue); setEditingNameId(null); } }}
                              style={{ background: '#000', border: '1px solid gold', color: 'white', fontSize: '12px', width: '100%', outline: 'none', borderRadius: '4px', padding: '2px 4px' }}
                            />
                          ) : (
                            <span style={{ fontSize: '12px', color: isCurrent ? 'gold' : 'white', fontWeight: isCurrent ? 'bold' : 'normal', overflowWrap: 'anywhere' }}>
                              {tempNames[loc.id] ?? loc.name}
                            </span>
                          )}
                        </div>
                        <div style={{ display: 'flex', gap: '8px', flexShrink: 0, marginTop: '2px' }}>
                          <button onClick={(e) => { e.stopPropagation(); toggleTempHidden(loc.id, pushHistory); }} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', opacity: tempHidden[loc.id] ? 0.3 : 1 }}>{tempHidden[loc.id] ? '👁️‍🗨️' : '👁️'}</button>
                          <button onClick={(e) => { e.stopPropagation(); setEditingNameId(loc.id); setEditingNameValue(tempNames[loc.id] ?? loc.name); }} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px' }}>✏️</button>
                          <button onClick={(e) => { e.stopPropagation(); duplicateLocation(loc.id); }} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', color: '#3b82f6' }}>📋</button>
                          <button onClick={(e) => { e.stopPropagation(); toggleDeletedLocation(loc.id); }} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', color: '#ef4444' }}>🗑️</button>
                        </div>
                      </div>
                    )
                  }
                })
              ) : (
                tempSections.map((s, idx) => {
                  const isCommitted = committedSections.some(cs => cs.id === s.id)
                  return (
                    <div 
                      key={s.id} 
                      style={{ 
                        background: '#1a1a1a', border: '1px solid #333', padding: '12px', borderRadius: '10px', 
                        display: 'flex', flexDirection: 'column', gap: '10px', position: 'relative'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontSize: '10px', color: 'gold', fontWeight: 'bold', background: 'rgba(212,175,55,0.1)', padding: '2px 6px', borderRadius: '4px' }}>SECTION #{idx+1}</span>
                          {!isCommitted && <span style={{ fontSize: '9px', color: '#10b981', fontWeight: 'bold' }}>NEW</span>}
                        </div>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button onClick={() => duplicateBackgroundSection(s.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', filter: 'grayscale(1)' }}>📋</button>
                          <button onClick={() => removeBackgroundSection(s.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', filter: 'grayscale(1)' }}>🗑️</button>
                        </div>
                      </div>
                      
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <label style={{ fontSize: '9px', color: '#666', fontWeight: 'bold' }}>ASSET / URL</label>
                        <select 
                          value={availableAssets.includes(s.url) ? s.url : ''} 
                          onChange={(e) => updateTempSection(s.id, { url: e.target.value })}
                          style={{ background: '#000', color: '#3b82f6', border: '1px solid #333', borderRadius: '4px', padding: '8px', fontSize: '11px', width: '100%', outline: 'none' }}
                        >
                          <option value="">-- CUSTOM URL --</option>
                          {availableAssets.map(a => <option key={a} value={a}>{a}</option>)}
                        </select>
                        <input 
                          type="text" 
                          placeholder="Or type path..." 
                          value={s.url}
                          onChange={(e) => updateTempSection(s.id, { url: e.target.value })}
                          style={{ background: '#000', color: '#3b82f6', border: '1px solid #333', borderRadius: '4px', padding: '8px', fontSize: '11px', outline: 'none' }}
                        />
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <label style={{ fontSize: '9px', color: '#666', fontWeight: 'bold' }}>OPACITY</label>
                          <span style={{ fontSize: '10px', color: 'gold' }}>{Math.round(s.opacity * 100)}%</span>
                        </div>
                        <input 
                          type="range" min="0" max="1" step="0.05" 
                          value={s.opacity} 
                          onChange={(e) => updateTempSection(s.id, { opacity: parseFloat(e.target.value) })}
                          style={{ width: '100%', accentColor: 'gold' }}
                        />
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        )
      case 'config':
        const cfgLocId = selectedId
        if (!cfgLocId) return <div style={{ color: '#888', textAlign: 'center', padding: '40px 20px', fontSize: '12px' }}>Please select an element on canvas to configure</div>
        
        const cfgDefault = allLocs.find(l => Number(l.id) === Number(cfgLocId))
        const iType = tempInteractionTypes[cfgLocId] ?? cfgDefault?.interactionType ?? 'modal'
        const iLink = tempLinks[cfgLocId] ?? cfgDefault?.link ?? ''

        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <span style={{ color: '#ec4899', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase' }}>Click Interaction</span>
              <div style={{ display: 'flex', gap: '4px', background: '#111', padding: '3px', borderRadius: '6px' }}>
                {iType === 'popup' ? (
                  <div style={{ 
                    flex: 1, background: 'rgba(250, 204, 21, 0.2)', color: '#facc15', 
                    borderRadius: '4px', padding: '6px', fontSize: '10px', fontWeight: 'bold', 
                    textAlign: 'center', border: '1px solid rgba(250, 204, 21, 0.4)'
                  }}>
                    ✨ POPUP INTERACTION ACTIVE
                  </div>
                ) : (
                  (['none', 'modal', 'link'] as const).map(t => (
                    <button 
                      key={t} onClick={() => updateTempInteractionType(cfgLocId, t)}
                      style={{ 
                        flex: 1, background: iType === t ? '#3b82f6' : 'transparent', color: iType === t ? 'white' : '#666',
                        border: 'none', borderRadius: '4px', padding: '6px', fontSize: '10px', fontWeight: 'bold', cursor: 'pointer' 
                      }}
                    >
                      {t.toUpperCase()}
                    </button>
                  ))
                )}
              </div>
              {iType === 'link' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ color: '#666', fontSize: '9px', fontWeight: 'bold' }}>DESTINATION PATH / URL</label>
                  <input 
                    type="text" value={iLink} onChange={(e) => updateTempLink(cfgLocId, e.target.value)}
                    placeholder="/scene-2 or https://..."
                    style={{ background: '#000', color: 'white', border: '1px solid #333', borderRadius: '4px', padding: '8px', fontSize: '11px', outline: 'none' }}
                  />
                </div>
              )}

              {iType === 'modal' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '4px' }}>
                  <label style={{ color: '#666', fontSize: '9px', fontWeight: 'bold' }}>MODAL ACTION TYPE</label>
                  <div style={{ position: 'relative' }}>
                    <select
                      value={tempTargetSceneIds[cfgLocId] ?? cfgDefault?.targetSceneId ?? ''}
                      onChange={(e) => updateTempTargetSceneId(cfgLocId, e.target.value || null)}
                      style={{ 
                        width: '100%', background: '#000', color: 'white', border: '1px solid #333', 
                        borderRadius: '4px', padding: '8px', fontSize: '11px', outline: 'none', appearance: 'none'
                      }}
                    >
                      <option value="">По умолчанию (Инфо-карточка)</option>
                      {sceneManager.scenes.map((s: any) => (
                        <option key={s.id} value={s.id}>Переход: {s.name}</option>
                      ))}
                    </select>
                    <div style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#666', fontSize: '8px' }}>▼</div>
                  </div>
                  <span style={{ color: '#555', fontSize: '9px', fontStyle: 'italic' }}>
                    * Эгер сцена тандалса, элемент басылганда ошол баракчага заматта өтөт. Тандалбаса - маалымат карточкасы чыгат.
                  </span>
                </div>
              )}
            </div>

            <div style={{ borderTop: '1px solid #333', paddingTop: '15px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <span style={{ color: '#f59e0b', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase' }}>Animation Motor</span>
              
              <div style={{ display: 'flex', borderBottom: '1px solid #333' }}>
                <button
                  onClick={() => {
                    setActiveAnimTab('idle')
                    setIsPreviewingIdle(false)
                  }}
                  style={{ flex: 1, padding: '6px', background: activeAnimTab === 'idle' ? '#222' : 'transparent', color: activeAnimTab === 'idle' ? '#f59e0b' : '#666', border: 'none', borderBottom: activeAnimTab === 'idle' ? '2px solid #f59e0b' : '2px solid transparent', fontSize: '10px', fontWeight: 'bold', cursor: 'pointer' }}
                >
                  IDLE WAVE
                </button>
                <button
                  onClick={() => {
                    setActiveAnimTab('hover')
                    setIsPreviewingIdle(false)
                  }}
                  style={{ flex: 1, padding: '6px', background: activeAnimTab === 'hover' ? '#222' : 'transparent', color: activeAnimTab === 'hover' ? '#f59e0b' : '#666', border: 'none', borderBottom: activeAnimTab === 'hover' ? '2px solid #f59e0b' : '2px solid transparent', fontSize: '10px', fontWeight: 'bold', cursor: 'pointer' }}
                >
                  HOVER JUMP
                </button>
              </div>

              {activeAnimTab === 'idle' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', paddingTop: '5px' }}>
                  {([
                    { key: 'speed', label: 'WAVE SPEED', min: 0.5, max: 6, step: 0.1, color: '#f59e0b', unit: 'x' },
                    { key: 'amplitude', label: 'AMPLITUDE', min: 0, max: 50, step: 1, color: '#f59e0b', unit: 'px' },
                    { key: 'noise', label: 'RANDOM NOISE', min: 0, max: 100, step: 1, color: '#f59e0b', unit: '%' },
                  ] as const).map(cfg => {
                    const val = tempAnimations[cfgLocId]?.[cfg.key] ?? (cfgDefault as any)?.[`anim${cfg.key.charAt(0).toUpperCase() + cfg.key.slice(1)}`] ?? (cfg.key === 'speed' ? 3.5 : cfg.key === 'amplitude' ? 8 : 0)
                    return (
                      <div key={cfg.key} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <label style={{ color: '#666', fontSize: '9px', fontWeight: 'bold' }}>{cfg.label}</label>
                          <span style={{ color: cfg.color, fontSize: '10px', fontWeight: 'bold' }}>{val}{cfg.unit}</span>
                        </div>
                        <input type="range" min={cfg.min} max={cfg.max} step={cfg.step} value={val} onChange={(e) => updateTempAnimation(cfgLocId, { [cfg.key]: parseFloat(e.target.value) } as any)} style={{ width: '100%', accentColor: cfg.color }} />
                      </div>
                    )
                  })}

                  <button
                    onClick={() => setIsPreviewingIdle(!isPreviewingIdle)}
                    style={{
                      width: '100%',
                      padding: '8px',
                      background: isPreviewingIdle ? '#f59e0b' : 'rgba(245, 158, 11, 0.1)',
                      color: isPreviewingIdle ? 'black' : '#f59e0b',
                      border: '1px solid #f59e0b',
                      borderRadius: '4px',
                      fontSize: '11px',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      marginTop: '5px',
                      transition: 'all 0.2s'
                    }}
                  >
                    {isPreviewingIdle ? '⏸ STOP PREVIEW' : '▶ PREVIEW IDLE WAVE'}
                  </button>
                </div>
              )}

              {activeAnimTab === 'hover' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', paddingTop: '5px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <label style={{ color: '#666', fontSize: '9px', fontWeight: 'bold' }}>HOVER X OFFSET</label>
                      <span style={{ color: '#f59e0b', fontSize: '10px', fontWeight: 'bold' }}>{tempHoverOffsetsX[cfgLocId] ?? cfgDefault?.hoverOffsetX ?? 0}px</span>
                    </div>
                    <input 
                      type="range" min="-200" max="200" step="0.5" 
                      value={tempHoverOffsetsX[cfgLocId] ?? cfgDefault?.hoverOffsetX ?? 0} 
                      onChange={(e) => updateTempHoverOffsetX(cfgLocId, parseFloat(e.target.value))} 
                      style={{ width: '100%', accentColor: '#f59e0b' }} 
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <label style={{ color: '#666', fontSize: '9px', fontWeight: 'bold' }}>HOVER Y OFFSET</label>
                      <span style={{ color: '#f59e0b', fontSize: '10px', fontWeight: 'bold' }}>{tempHoverOffsetsY[cfgLocId] ?? cfgDefault?.hoverOffsetY ?? 0}px</span>
                    </div>
                    <input 
                      type="range" min="-200" max="200" step="0.5" 
                      value={tempHoverOffsetsY[cfgLocId] ?? cfgDefault?.hoverOffsetY ?? 0} 
                      onChange={(e) => updateTempHoverOffsetY(cfgLocId, parseFloat(e.target.value))} 
                      style={{ width: '100%', accentColor: '#f59e0b' }} 
                    />
                  </div>
                </div>
              )}
            </div>

            <div style={{ borderTop: '1px solid #333', paddingTop: '15px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <span style={{ color: '#8b5cf6', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase' }}>Sticky Positioning</span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ color: '#666', fontSize: '9px', fontWeight: 'bold' }}>ATTACH TO PARENT</label>
                <select 
                  value={tempParentIds[cfgLocId] ?? cfgDefault?.parentId ?? ''} 
                  onChange={(e) => updateTempParentId(cfgLocId, e.target.value === '' ? null : parseInt(e.target.value))}
                  style={{ background: '#000', color: 'white', border: '1px solid #333', borderRadius: '4px', padding: '8px', fontSize: '11px', outline: 'none' }}
                >
                  <option value="">-- NO PARENT --</option>
                  {allLocs.filter(l => l.id !== cfgLocId).map(l => <option key={l.id} value={l.id}>{tempNames[l.id] ?? l.name} (ID: {l.id})</option>)}
                </select>
              </div>

              {(tempParentIds[cfgLocId] ?? cfgDefault?.parentId) && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <label style={{ color: '#666', fontSize: '9px', fontWeight: 'bold' }}>LAG (FOLLOW DELAY)</label>
                    <span style={{ color: '#8b5cf6', fontSize: '10px', fontWeight: 'bold' }}>{(tempStickyLags[cfgLocId] ?? cfgDefault?.stickyLag ?? 0.25).toFixed(2)}s</span>
                  </div>
                  <input 
                    type="range" min="0" max="1" step="0.05" 
                    value={tempStickyLags[cfgLocId] ?? cfgDefault?.stickyLag ?? 0.25} 
                    onChange={(e) => updateTempStickyLag(cfgLocId, parseFloat(e.target.value))}
                    style={{ width: '100%', accentColor: '#8b5cf6' }}
                  />
                </div>
              )}
            </div>
          </div>
        )


      case 'scenes':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#a78bfa', fontSize: '12px', fontWeight: 'bold' }}>📂 SCENES HUB</span>
              <div style={{ display: 'flex', gap: '5px' }}>
                <button 
                  onClick={() => {
                    const name = prompt('Группанын аты:');
                    if (name) sceneManager.createSceneGroup(name);
                  }}
                  style={{ 
                    background: 'rgba(255,255,255,0.05)', color: '#ccc', border: '1px solid #444',
                    padding: '4px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: 'bold', cursor: 'pointer'
                  }}
                >
                  + ГРУППА
                </button>
                <button 
                  onClick={async () => {
                    const name = prompt('Жаңы сценанын аты (мисалы: Экинчи бет):');
                    if (!name) return;
                    const id = name.trim().toLowerCase()
                      .replace(/\s+/g, '-')
                      .replace(/[^\w\u0400-\u04FF-]/gi, '');
                    
                    if (!id) {
                      alert('Ката: Сценанын IDси бош болбошу керек!');
                      return;
                    }
                    
                    const success = await sceneManager.createScene(name, id);
                    if (!success) alert('Ката кетти! Бул ID ээленип калган болушу мүмкүн.');
                  }}
                  style={{ 
                    background: 'gold', color: 'black', border: 'none',
                    padding: '4px 10px', borderRadius: '4px', fontSize: '10px', fontWeight: 'bold', cursor: 'pointer',
                    boxShadow: '0 0 10px rgba(212,175,55,0.3)'
                  }}
                >
                  + ЖАҢЫ СЦЕНА
                </button>
              </div>
            </div>
            <div style={{ color: '#666', fontSize: '10px', marginTop: '-10px' }}>{sceneManager.scenes.length} scene(s) available</div>

            {/* Active Scene Indicator */}
            <div style={{ background: 'rgba(167, 139, 250, 0.1)', border: '1px solid #a78bfa', borderRadius: '8px', padding: '10px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {/* Header row */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <span style={{ color: '#a78bfa', fontSize: '9px', fontWeight: 'bold', textTransform: 'uppercase' }}>ACTIVE SCENE</span>
                  <div style={{ color: 'white', fontSize: '13px', fontWeight: 'bold', marginTop: '2px' }}>
                    {tempSceneName || sceneManager.activeScene?.name || sceneManager.activeSceneId}
                  </div>
                  <div style={{ color: '#666', fontSize: '9px', marginTop: '1px' }}>
                    📁 {tempAssetFolder || sceneManager.activeScene?.assetFolder || 'main_menu'} • {committedLocations.length} el
                  </div>
                </div>
                {/* Scene rename button */}
                <button
                  onClick={() => {
                    const newName = prompt('Жаңы сцена аты:', tempSceneName || sceneManager.activeScene?.name || '');
                    if (newName) updateTempSceneName(newName);
                  }}
                  style={{ background: '#333', color: '#a78bfa', border: '1px solid #a78bfa', borderRadius: '4px', padding: '3px 8px', cursor: 'pointer', fontSize: '11px', flexShrink: 0, marginTop: '2px' }}
                >
                  ✎
                </button>
              </div>

              {/* Mini-tab switcher */}
              <div style={{ display: 'flex', borderBottom: '1px solid #2a2a3a', marginBottom: '4px' }}>
                {(['general', 'header'] as const).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveSceneSubTab(tab)}
                    style={{
                      flex: 1,
                      background: 'transparent',
                      border: 'none',
                      borderBottom: activeSceneSubTab === tab ? '2px solid #a78bfa' : '2px solid transparent',
                      color: activeSceneSubTab === tab ? '#a78bfa' : '#555',
                      padding: '5px 0',
                      cursor: 'pointer',
                      fontSize: '9px',
                      fontWeight: 'bold',
                      textTransform: 'uppercase',
                      transition: 'all 0.15s'
                    }}
                  >
                    {tab === 'general' ? '⚙️ GENERAL' : '📱 HEADER'}
                  </button>
                ))}
              </div>

              {/* GENERAL tab content */}
              {activeSceneSubTab === 'general' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                    <label style={{ color: '#666', fontSize: '9px', fontWeight: 'bold' }}>RESOURCE FOLDER (ASSETS)</label>
                    <select
                      value={tempAssetFolder || sceneManager.activeScene?.assetFolder || 'main_menu'}
                      onChange={(e) => updateTempAssetFolder(e.target.value)}
                      style={{ background: '#000', color: '#a78bfa', border: '1px solid #444', borderRadius: '4px', padding: '5px', fontSize: '11px', outline: 'none' }}
                    >
                      <option value="main_menu">main_menu</option>
                      <option value="level_1">level_1</option>
                      <option value="level_2">level_2</option>
                      <option value="level_3">level_3</option>
                      <option value="level_4">level_4</option>
                      <option value="level_5">level_5</option>
                    </select>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', flex: 1 }}>
                      <label style={{ color: '#666', fontSize: '9px', fontWeight: 'bold' }}>BG COLOR 1</label>
                      <input
                        type="color"
                        value={tempBgGradientStart || sceneManager.activeScene?.bgGradientStart || '#0f172a'}
                        onChange={(e) => updateTempBgGradientStart(e.target.value)}
                        style={{ width: '100%', height: '22px', border: '1px solid #444', background: '#222', padding: '0', cursor: 'pointer', borderRadius: '4px' }}
                      />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', flex: 1 }}>
                      <label style={{ color: '#666', fontSize: '9px', fontWeight: 'bold' }}>BG COLOR 2</label>
                      <input
                        type="color"
                        value={tempBgGradientEnd || sceneManager.activeScene?.bgGradientEnd || '#1e1e2f'}
                        onChange={(e) => updateTempBgGradientEnd(e.target.value)}
                        style={{ width: '100%', height: '22px', border: '1px solid #444', background: '#222', padding: '0', cursor: 'pointer', borderRadius: '4px' }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* HEADER tab content */}
              {activeSceneSubTab === 'header' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                    <label style={{ color: '#666', fontSize: '9px', fontWeight: 'bold' }}>HEADER TEXT</label>
                    <input
                      type="text"
                      value={tempHeaderTitle ?? (sceneManager.activeScene?.headerTitle || sceneManager.activeScene?.name || '')}
                      onChange={(e) => updateTempHeaderTitle(e.target.value)}
                      placeholder="БАШКЫ БЕТ"
                      style={{ background: '#000', color: 'white', border: '1px solid #444', borderRadius: '4px', padding: '5px 8px', fontSize: '11px', outline: 'none' }}
                    />
                  </div>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', width: '64px' }}>
                      <label style={{ color: '#666', fontSize: '9px', fontWeight: 'bold' }}>SIZE (rem)</label>
                      <input
                        type="number" min="0.5" max="10" step="0.1"
                        value={parseFloat(tempHeaderFontSize ?? (sceneManager.activeScene?.headerFontSize || '1.4')) || 1.4}
                        onChange={(e) => updateTempHeaderFontSize(e.target.value + 'rem')}
                        style={{ background: '#000', color: 'white', border: '1px solid #444', borderRadius: '4px', padding: '5px 4px', fontSize: '10px', outline: 'none', width: '100%' }}
                      />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                      <label style={{ color: '#666', fontSize: '9px', fontWeight: 'bold' }}>COLOR</label>
                      <input
                        type="color"
                        value={tempHeaderColor ?? (sceneManager.activeScene?.headerColor || '#d4af37')}
                        onChange={(e) => updateTempHeaderColor(e.target.value)}
                        style={{ width: '36px', height: '27px', border: '1px solid #444', background: '#222', padding: '0', cursor: 'pointer', borderRadius: '4px' }}
                      />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', flex: 1 }}>
                      <label style={{ color: '#666', fontSize: '9px', fontWeight: 'bold' }}>FONT</label>
                      <select
                        value={tempHeaderFontFamily ?? (sceneManager.activeScene?.headerFontFamily || 'Inter')}
                        onChange={(e) => updateTempHeaderFontFamily(e.target.value)}
                        style={{ background: '#000', color: 'white', border: '1px solid #444', borderRadius: '4px', padding: '4px', fontSize: '10px', outline: 'none' }}
                      >
                        <option value="Inter">Inter</option>
                        <option value="Luckiest Guy">Luckiest Guy</option>
                        <option value="Bungee">Bungee</option>
                        <option value="Titan One">Titan One</option>
                        <option value="Fredoka">Fredoka</option>
                        <option value="Press Start 2P">Press Start 2P</option>
                        <option value="Tektur">Tektur</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

            </div>
            
            {/* Scene List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <span style={{ color: '#888', fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase' }}>ALL SCENES</span>
              <div style={{ 
                maxHeight: '300px', 
                overflowY: 'auto', 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '8px',
                paddingRight: '4px',
                scrollbarWidth: 'thin',
                scrollbarColor: '#a78bfa #111'
              }}>
                {sceneManager.scenes.length === 0 && (
                  <span style={{ color: '#555', fontSize: '11px', fontStyle: 'italic' }}>Loading scenes...</span>
                )}
                
                {/* 1. Render Groups */}
                {sceneManager.sceneGroups.map(group => {
                  const groupScenes = sceneManager.scenes.filter(s => s.groupId === group.id);
                  return (
                    <div key={group.id} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <div 
                        style={{ 
                          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                          padding: '4px 8px', background: 'rgba(255,255,255,0.03)', borderLeft: `3px solid ${group.color}`, 
                          borderRadius: '4px', cursor: 'pointer' 
                        }}
                        onClick={() => sceneManager.updateSceneGroup(group.id, { isCollapsed: !group.isCollapsed })}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontSize: '10px' }}>{group.isCollapsed ? '▶' : '▼'}</span>
                          <span 
                            style={{ color: group.color, fontSize: '11px', fontWeight: 'bold' }}
                          >
                            {group.name.toUpperCase()}
                          </span>
                          <span style={{ color: '#444', fontSize: '9px' }}>({groupScenes.length})</span>
                        </div>
                        <div style={{ display: 'flex', gap: '4px' }}>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              const name = prompt('Группаны атын өзгөртүү:', group.name);
                              if (name) sceneManager.updateSceneGroup(group.id, { name });
                            }}
                            style={{ background: 'transparent', border: 'none', color: '#555', fontSize: '10px', padding: '0 4px', cursor: 'pointer' }}
                            title="Rename group"
                          >
                            ✏️
                          </button>
                          <div style={{ position: 'relative' }}>
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                setColorPickerGroupId(colorPickerGroupId === group.id ? null : group.id);
                              }}
                              style={{ background: 'transparent', border: 'none', color: colorPickerGroupId === group.id ? 'gold' : '#555', fontSize: '10px', padding: '0 4px', cursor: 'pointer' }}
                              title="Change color"
                            >
                              🎨
                            </button>
                            {colorPickerGroupId === group.id && (
                              <div style={{ 
                                position: 'absolute', right: 0, top: '22px', zIndex: 1100, 
                                background: '#1e293b', padding: '10px', borderRadius: '8px', 
                                border: '1px solid #334155', boxShadow: '0 10px 15px rgba(0,0,0,0.5)',
                                display: 'flex', flexDirection: 'column', gap: '8px', width: '140px'
                              }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <input 
                                    type="color" 
                                    value={group.color} 
                                    onChange={(e) => sceneManager.updateSceneGroup(group.id, { color: e.target.value })}
                                    style={{ border: 'none', background: 'transparent', width: '24px', height: '24px', cursor: 'pointer', padding: 0 }}
                                  />
                                  <input 
                                    type="text" 
                                    value={group.color}
                                    onChange={(e) => sceneManager.updateSceneGroup(group.id, { color: e.target.value })}
                                    style={{ flex: 1, background: '#0f172a', color: 'white', border: '1px solid #334155', borderRadius: '4px', padding: '4px 6px', fontSize: '11px', outline: 'none', width: '60px' }}
                                  />
                                </div>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', padding: '4px 0', borderTop: '1px solid #334155', borderBottom: '1px solid #334155' }}>
                                  {['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899', '#64748b'].map(c => (
                                    <button 
                                      key={c}
                                      onClick={(e) => { e.stopPropagation(); sceneManager.updateSceneGroup(group.id, { color: c }); }}
                                      style={{ width: '14px', height: '14px', borderRadius: '50%', background: c, border: group.color === c ? '2px solid white' : 'none', cursor: 'pointer', padding: 0 }}
                                      title={c}
                                    />
                                  ))}
                                </div>
                                <button 
                                  onClick={(e) => { e.stopPropagation(); setColorPickerGroupId(null); }}
                                  style={{ 
                                    flex: 1,
                                    background: '#3b82f6', color: 'white', border: 'none', 
                                    borderRadius: '4px', fontSize: '10px', padding: '4px',
                                    fontWeight: 'bold', cursor: 'pointer'
                                  }}
                                >
                                  ЖАБУУ
                                </button>
                              </div>
                            )}
                          </div>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              if (confirm('Бул группаны өчүрөсүзбү? Ичиндеги сценалар калат.')) sceneManager.deleteSceneGroup(group.id);
                            }}
                            style={{ background: 'transparent', border: 'none', color: '#555', fontSize: '10px', padding: '0 4px' }}
                            title="Delete group"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                      
                      {!group.isCollapsed && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', paddingLeft: '8px' }}>
                          {groupScenes.length === 0 && (
                            <div style={{ color: '#333', fontSize: '10px', fontStyle: 'italic', padding: '5px' }}>Бош...</div>
                          )}
                          {groupScenes.map(scene => renderSceneItem(scene, sceneManager))}
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* 2. Render Unassigned Scenes */}
                {sceneManager.scenes.filter(s => !s.groupId).length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '4px' }}>
                    <div style={{ padding: '4px 8px', color: '#555', fontSize: '10px', fontWeight: 'bold' }}>DEFAULT (UNGROUPED)</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', paddingLeft: '8px' }}>
                      {sceneManager.scenes.filter(s => !s.groupId).map(scene => renderSceneItem(scene, sceneManager))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Info */}
            <div style={{ borderTop: '1px solid #222', paddingTop: '10px' }}>
              <span style={{ color: '#555', fontSize: '10px', lineHeight: '1.4' }}>
                💡 Click a scene to switch. Each scene has its own background, elements, and asset folder.
              </span>
            </div>
          </div>
        )
      case 'navigation':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: 'gold', fontSize: '12px', fontWeight: 'bold' }}>🔗 QUICK NAVIGATION</span>
              <button 
                onClick={addQuickLink}
                style={{ 
                  background: 'gold', color: 'black', border: 'none',
                  padding: '4px 10px', borderRadius: '4px', fontSize: '10px', fontWeight: 'bold', cursor: 'pointer'
                }}
              >
                + ЖАҢЫ ШИЛТЕМЕ
              </button>
            </div>
            <div style={{ color: '#666', fontSize: '10px', marginTop: '-10px' }}>
              Бул баскычтар мобилдик версияда тизме болуп, десктопто калкып чыгат.
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '400px', overflowY: 'auto', paddingRight: '5px' }}>
              {tempQuickLinks.length === 0 && (
                <div style={{ padding: '20px', textAlign: 'center', border: '1px dashed #333', borderRadius: '8px', color: '#444', fontSize: '12px' }}>
                  Азырынча шилтемелер жок
                </div>
              )}
              {tempQuickLinks.map((link, index) => (
                <div key={link.id} style={{ 
                  background: 'rgba(255,255,255,0.03)', border: '1px solid #333', borderRadius: '8px', padding: '10px',
                  display: 'flex', flexDirection: 'column', gap: '8px'
                }}>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <label style={{ color: '#555', fontSize: '9px', fontWeight: 'bold' }}>LABEL</label>
                      <input 
                        type="text" value={link.label} 
                        onChange={(e) => updateQuickLink(link.id, { label: e.target.value })}
                        style={{ background: '#000', color: 'white', border: '1px solid #222', borderRadius: '4px', padding: '6px', fontSize: '11px' }}
                      />
                    </div>
                    <div style={{ width: '40px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <label style={{ color: '#555', fontSize: '9px', fontWeight: 'bold' }}>ICON</label>
                      <input 
                        type="text" value={link.icon || ''} 
                        placeholder="📍"
                        onChange={(e) => updateQuickLink(link.id, { icon: e.target.value })}
                        style={{ background: '#000', color: 'white', border: '1px solid #222', borderRadius: '4px', padding: '6px', fontSize: '11px', textAlign: 'center' }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ color: '#555', fontSize: '9px', fontWeight: 'bold' }}>DESTINATION</label>
                    <div style={{ display: 'flex', gap: '5px' }}>
                      <select 
                        value={link.targetSceneId || ''} 
                        onChange={(e) => updateQuickLink(link.id, { targetSceneId: e.target.value || undefined, externalUrl: undefined })}
                        style={{ flex: 1, background: '#000', color: '#a78bfa', border: '1px solid #222', borderRadius: '4px', padding: '6px', fontSize: '11px' }}
                      >
                        <option value="">-- Баракча тандоо --</option>
                        {sceneManager.scenes.map((s: any) => (
                          <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                      </select>
                      <input 
                        type="text" 
                        value={link.externalUrl || ''} 
                        placeholder="же URL: https://..."
                        onChange={(e) => updateQuickLink(link.id, { externalUrl: e.target.value || undefined, targetSceneId: undefined })}
                        style={{ flex: 1, background: '#000', color: '#ccc', border: '1px solid #222', borderRadius: '4px', padding: '6px', fontSize: '11px' }}
                      />
                    </div>
                  </div>

                  {/* CUSTOMIZATION EXPAND BUTTON */}
                  <button
                    onClick={() => setExpandedQuickLinkId(expandedQuickLinkId === link.id ? null : link.id)}
                    style={{ background: expandedQuickLinkId === link.id ? 'rgba(212,175,55,0.2)' : 'rgba(255,255,255,0.05)', color: expandedQuickLinkId === link.id ? 'gold' : '#888', border: '1px solid #333', borderRadius: '4px', padding: '4px', fontSize: '10px', cursor: 'pointer', textAlign: 'center', marginTop: '4px' }}
                  >
                    {expandedQuickLinkId === link.id ? '▼ ЖАБУУ' : '✎ ДИЗАЙНДЫ ӨЗГӨРТҮҮ'}
                  </button>

                  {/* EXPANDED STYLE CONTROLS */}
                  {expandedQuickLinkId === link.id && (
                    <div style={{ padding: '10px', background: 'rgba(0,0,0,0.5)', borderRadius: '6px', border: '1px solid #333', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      
                      {/* Scale & Opacity */}
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <label style={{ color: '#888', fontSize: '9px', fontWeight: 'bold' }}>SCALE ({link.scale ?? 1}x)</label>
                          <input 
                            type="range" min="0.5" max="2" step="0.1" 
                            value={link.scale ?? 1}
                            onChange={(e) => updateQuickLink(link.id, { scale: parseFloat(e.target.value) })}
                            style={{ flex: 1, accentColor: 'gold' }}
                          />
                        </div>
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <label style={{ color: '#888', fontSize: '9px', fontWeight: 'bold' }}>BG OPACITY</label>
                          <input 
                            type="range" min="0" max="1" step="0.05" 
                            value={link.bgOpacity ?? 0.96}
                            onChange={(e) => updateQuickLink(link.id, { bgOpacity: parseFloat(e.target.value) })}
                            style={{ flex: 1, accentColor: 'gold' }}
                          />
                        </div>
                      </div>

                      {/* Colors & Fonts */}
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <label style={{ color: '#888', fontSize: '9px', fontWeight: 'bold' }}>FONT</label>
                          <select 
                            value={link.fontFamily || 'Inter'}
                            onChange={(e) => updateQuickLink(link.id, { fontFamily: e.target.value })}
                            style={{ background: '#222', color: 'white', border: '1px solid #444', borderRadius: '4px', padding: '4px', fontSize: '10px' }}
                          >
                            <option value="Inter">Inter</option>
                            <option value="Luckiest Guy">Luckiest Guy (Cartoon)</option>
                            <option value="Bungee">Bungee (Game)</option>
                            <option value="Titan One">Titan One (Bold)</option>
                            <option value="Fredoka">Fredoka (Soft)</option>
                            <option value="Press Start 2P">Press Start 2P (Retro)</option>
                            <option value="Tektur">Tektur (Future)</option>
                            <option value="Gost Type A">Gost Type A</option>
                          </select>
                        </div>
                        <div style={{ flex: 1, display: 'flex', gap: '10px' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <label style={{ color: '#888', fontSize: '9px', fontWeight: 'bold' }}>BG</label>
                            <input 
                              type="color" value={link.bgColor || '#0f172a'}
                              onChange={(e) => updateQuickLink(link.id, { bgColor: e.target.value })}
                              style={{ width: '25px', height: '22px', border: '1px solid #444', background: '#222', padding: '0', cursor: 'pointer' }}
                            />
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <label style={{ color: '#888', fontSize: '9px', fontWeight: 'bold' }}>TEXT</label>
                            <input 
                              type="color" value={link.textColor || '#d4af37'}
                              onChange={(e) => updateQuickLink(link.id, { textColor: e.target.value })}
                              style={{ width: '25px', height: '22px', border: '1px solid #444', background: '#222', padding: '0', cursor: 'pointer' }}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Symbol / Icon Picker Reuse */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <label style={{ color: '#888', fontSize: '9px', fontWeight: 'bold' }}>QUICK ICONS</label>
                        <div style={{ display: 'flex', gap: '5px', overflowX: 'auto', paddingBottom: '5px' }}>
                          {SYMBOL_LIBRARY[0].icons.slice(0, 10).map((icon, i) => (
                            <button
                              key={i}
                              onClick={() => updateQuickLink(link.id, { icon })}
                              style={{ background: '#222', border: link.icon === icon ? '1px solid gold' : '1px solid #333', borderRadius: '4px', padding: '4px 6px', fontSize: '14px', cursor: 'pointer' }}
                            >
                              {icon}
                            </button>
                          ))}
                        </div>
                      </div>

                    </div>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px', borderTop: '1px solid #222', paddingTop: '6px' }}>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <button 
                        disabled={index === 0}
                        onClick={() => reorderQuickLinks(index, index - 1)}
                        style={{ background: '#111', color: '#555', border: '1px solid #222', borderRadius: '4px', padding: '2px 6px', cursor: index === 0 ? 'default' : 'pointer' }}
                      >
                        ▲
                      </button>
                      <button 
                        disabled={index === tempQuickLinks.length - 1}
                        onClick={() => reorderQuickLinks(index, index + 1)}
                        style={{ background: '#111', color: '#555', border: '1px solid #222', borderRadius: '4px', padding: '2px 6px', cursor: index === tempQuickLinks.length - 1 ? 'default' : 'pointer' }}
                      >
                        ▼
                      </button>
                    </div>
                    <button 
                      onClick={() => removeQuickLink(link.id)}
                      style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid #ef4444', borderRadius: '4px', padding: '4px 10px', fontSize: '10px', fontWeight: 'bold', cursor: 'pointer' }}
                    >
                      ӨЧҮРҮҮ
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div
      style={{
        position: 'fixed',
        left: `${toolbarPos.x}px`,
        top: `${toolbarPos.y}px`,
        background: 'rgba(15,23,42,0.95)',
        border: '1px solid #333',
        borderRadius: '12px',
        width: '340px',
        zIndex: 9999,
        boxShadow: '0 10px 40px rgba(0,0,0,0.8)',
        display: 'flex',
        flexDirection: 'column',
        backdropFilter: 'blur(20px)'
      }}
    >
      {/* 1. Header (Draggable Handle) */}
      <div 
        onMouseDown={(e) => {
          setIsDragging(true)
          dragRef.current = { startX: e.clientX, startY: e.clientY, initialPos: { ...toolbarPos }, isDragReal: false }
        }}
        style={{ 
          padding: '12px 15px', 
          borderBottom: '1px solid #333', 
          cursor: 'grab',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: isDragging ? 'rgba(212,175,55,0.1)' : 'transparent',
          borderTopLeftRadius: '12px',
          borderTopRightRadius: '12px'
        }}
      >
        <span style={{ color: 'gold', fontWeight: 'bold', fontSize: '14px', pointerEvents: 'none' }}>🎨 ШКУРА EDITOR</span>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button 
            onMouseDown={(e) => e.stopPropagation()}
            onClick={() => setIsMobileView(!isMobileView)}
            style={{ 
              background: isMobileView ? 'gold' : 'rgba(255,255,255,0.05)', 
              border: isMobileView ? 'none' : '1px solid #444', 
              color: isMobileView ? 'black' : '#888', 
              cursor: 'pointer', 
              fontSize: '10px', 
              padding: '4px 8px',
              borderRadius: '4px',
              fontWeight: 'bold',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            {isMobileView ? '📱 DESKTOP' : '📱 MOBILE'}
          </button>
          <button 
            onMouseDown={(e) => e.stopPropagation()} // Prevent dragging when clicking button
            onClick={() => setIsCollapsed(true)}
            style={{ background: 'transparent', border: 'none', color: '#888', cursor: 'pointer', fontSize: '18px', padding: '0 5px' }}
          >
            —
          </button>
        </div>
      </div>

      {/* 2. Tabs */}
      <div style={{ 
        display: 'flex', 
        borderBottom: '1px solid #333', 
        padding: '0 5px'
      }}>
        <div style={{ display: 'flex', width: '100%' }}>
          {(['transform', 'style', 'layers', 'config', 'scenes', 'navigation'] as EditorTab[]).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                flex: 1,
                background: 'transparent',
                border: 'none',
                borderBottom: activeTab === tab ? '2px solid gold' : '2px solid transparent',
                color: activeTab === tab ? 'white' : '#666',
                padding: '10px 0px',
                cursor: 'pointer',
                fontSize: '9px',
                fontWeight: activeTab === tab ? 'bold' : 'normal',
                textTransform: 'uppercase',
                transition: 'all 0.2s'
              }}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Content Area */}
      <div style={{ padding: '20px 15px', minHeight: '150px' }}>
        {renderTabContent()}
      </div>

        <div style={{ padding: '15px', borderTop: '1px solid #333', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button 
              onClick={undo}
              disabled={!canUndo}
              style={{ 
                background: canUndo ? '#222' : '#111', 
                color: canUndo ? 'white' : '#444', 
                border: '1px solid #444', 
                padding: '6px 12px', 
                borderRadius: '6px', 
                cursor: canUndo ? 'pointer' : 'not-allowed', 
                fontSize: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
              title="Undo (Ctrl+Z)"
            >
              ↶ <span style={{ fontSize: '10px', opacity: 0.7 }}>UNDO</span>
            </button>
            
            <button 
              onClick={redo}
              disabled={!canRedo}
              style={{ 
                background: canRedo ? '#222' : '#111', 
                color: canRedo ? 'white' : '#444', 
                border: '1px solid #444', 
                padding: '6px 12px', 
                borderRadius: '6px', 
                cursor: canRedo ? 'pointer' : 'not-allowed', 
                fontSize: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
              title="Redo (Ctrl+Y / Ctrl+Shift+Z)"
            >
              ↷ <span style={{ fontSize: '10px', opacity: 0.7 }}>REDO</span>
            </button>
          </div>
          
          
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={() => {
                toggleEditorMode() // Turn OFF editor
                setIsCollapsed(true) // Ensure next time we see the circle
              }}
              style={{
                background: 'transparent',
                color: '#888',
                border: '1px solid #444',
                padding: '6px 12px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
              EXIT
            </button>
            
            <button
              style={{
                background: 'gold',
                color: 'black',
                border: 'none',
                padding: '6px 16px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: '12px'
              }}
              onClick={async () => {
                const hasPosChanges = Object.keys(tempPositions).length > 0
                const hasSizeChanges = Object.keys(tempSizes).length > 0
                const hasVisualChanges = Object.keys(tempVisuals).length > 0
                const hasHandleChanges = Object.keys(tempHandles).length > 0
                const hasStyleChanges = Object.keys(tempStyles).length > 0
                const hasHiddenChanges = Object.keys(tempHidden).length > 0
                const hasContentChanges = Object.keys(tempContents).length > 0
                const hasNameChanges = Object.keys(tempNames).length > 0
                const hasInteractionChanges = Object.keys(tempInteractionTypes).length > 0
                const hasLinkChanges = Object.keys(tempLinks).length > 0
                const hasPopupPosChanges = Object.keys(tempPopupPositions).length > 0
                const hasPopupSizeChanges = Object.keys(tempPopupSizes).length > 0
                const hasPopupContentChanges = Object.keys(tempPopupContents).length > 0
                const hasAnimationChanges = Object.keys(tempAnimations).length > 0
                const hasParentChanges = Object.keys(tempParentIds).length > 0
                const hasLagChanges = Object.keys(tempStickyLags).length > 0
                const hasImageChanges = Object.keys(tempImageUrls).length > 0
                const hasScaleChanges = Object.keys(tempScales).length > 0
                const hasHandleSizeChanges = Object.keys(tempHandleSizes).length > 0
                const hasTextSizeChanges = Object.keys(tempTextSizes).length > 0
                const hasAddedLocations = addedLocations.length > 0
                const hasDeletedLocations = deletedLocations.length > 0
                const hasTargetSceneChanges = Object.keys(tempTargetSceneIds).length > 0
                const hasAssetFolderChanges = tempAssetFolder !== null
                const hasBackgroundChanges = JSON.stringify(tempSections) !== JSON.stringify(committedSections)
                const hasHoverOffsetChanges = Object.keys(tempHoverOffsetsX).length > 0 || Object.keys(tempHoverOffsetsY).length > 0
                const hasSceneNameChanges = tempSceneName !== null
                
                // Removed early return: groups and layerOrder bypass temp checking constraints


                setSaveStatus('saving')
                const allElementsForSave = [...committedLocations, ...addedLocations].filter(loc => !deletedLocations.includes(loc.id))
                const merged = allElementsForSave.map((loc) => ({
                  ...loc,
                  ...(tempPositions[loc.id] || {}),
                  ...(tempSizes[loc.id] || {}),
                  ...(tempVisuals[loc.id] ? { visualX: tempVisuals[loc.id].x, visualY: tempVisuals[loc.id].y } : {}),
                  ...(tempHandles[loc.id] ? { handleX: tempHandles[loc.id].x, handleY: tempHandles[loc.id].y } : {}),
                  ...(tempHidden[loc.id] !== undefined ? { isHidden: tempHidden[loc.id] } : {}),
                  ...(tempStyles[loc.id] || {}),
                  ...(tempContents[loc.id] !== undefined ? { content: tempContents[loc.id] } : {}),
                  ...(tempNames[loc.id] !== undefined ? { name: tempNames[loc.id] } : {}),
                  ...(tempInteractionTypes[loc.id] !== undefined ? { interactionType: tempInteractionTypes[loc.id] } : {}),
                  ...(tempLinks[loc.id] !== undefined ? { link: tempLinks[loc.id] } : {}),
                  ...(tempAnimations[loc.id] ? {
                    ...(tempAnimations[loc.id].speed !== undefined ? { animSpeed: tempAnimations[loc.id].speed } : {}),
                    ...(tempAnimations[loc.id].amplitude !== undefined ? { animAmplitude: tempAnimations[loc.id].amplitude } : {}),
                    ...(tempAnimations[loc.id].noise !== undefined ? { animNoise: tempAnimations[loc.id].noise } : {}),
                  } : {}),
                  ...(tempParentIds[loc.id] !== undefined ? { parentId: tempParentIds[loc.id] ?? undefined } : {}),
                  ...(tempStickyLags[loc.id] !== undefined ? { stickyLag: tempStickyLags[loc.id] } : {}),
                  ...(tempImageUrls[loc.id] !== undefined ? { imageUrl: tempImageUrls[loc.id] } : {}),
                  ...(tempScales[loc.id] !== undefined ? { scale: tempScales[loc.id] } : {}),
                  ...(tempHandleSizes[loc.id] ? { handleWidth: tempHandleSizes[loc.id].width, handleHeight: tempHandleSizes[loc.id].height } : {}),
                  ...(tempTextSizes[loc.id] ? { textWidth: tempTextSizes[loc.id].width, textHeight: tempTextSizes[loc.id].height } : {}),
                  ...(tempTargetSceneIds[loc.id] !== undefined ? { targetSceneId: tempTargetSceneIds[loc.id] ?? undefined } : {}),
                  ...(tempHoverOffsetsX[loc.id] !== undefined ? { hoverOffsetX: tempHoverOffsetsX[loc.id] } : {}),
                  ...(tempHoverOffsetsY[loc.id] !== undefined ? { hoverOffsetY: tempHoverOffsetsY[loc.id] } : {}),
                  // Missing popup fields
                  popupX: tempPopupPositions[loc.id]?.x ?? loc.popupX,
                  popupY: tempPopupPositions[loc.id]?.y ?? loc.popupY,
                  popupWidth: tempPopupSizes[loc.id]?.width ?? loc.popupWidth,
                  popupHeight: tempPopupSizes[loc.id]?.height ?? loc.popupHeight,
                  popupContent: tempPopupContents[loc.id] !== undefined ? tempPopupContents[loc.id] : loc.popupContent,
                }))
                
                try {
                  const res = await fetch('/api/editor/save', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                      sceneId: sceneManager.activeSceneId,
                      data: {
                        name: tempSceneName || sceneManager.activeScene?.name || 'Жаңы баракча',
                        assetFolder: tempAssetFolder || sceneManager.activeScene?.assetFolder || 'main_menu',
                        locations: merged,
                        sections: tempSections,
                        groups: Object.values(groups),
                        quickLinks: tempQuickLinks,
                        bgGradientStart: tempBgGradientStart !== null ? tempBgGradientStart : (sceneManager.activeScene?.bgGradientStart || undefined),
                        bgGradientEnd: tempBgGradientEnd !== null ? tempBgGradientEnd : (sceneManager.activeScene?.bgGradientEnd || undefined),
                        headerTitle: tempHeaderTitle !== null ? tempHeaderTitle : (sceneManager.activeScene?.headerTitle || undefined),
                        headerFontFamily: tempHeaderFontFamily !== null ? tempHeaderFontFamily : (sceneManager.activeScene?.headerFontFamily || undefined),
                        headerFontSize: tempHeaderFontSize !== null ? tempHeaderFontSize : (sceneManager.activeScene?.headerFontSize || undefined),
                        headerColor: tempHeaderColor !== null ? tempHeaderColor : (sceneManager.activeScene?.headerColor || undefined)
                      }
                    }),
                  })
                  if (res.ok) {
                    commitSave()
                    sceneManager.refreshActiveScene()
                    setSaveStatus('saved')
                  } else {
                    setSaveStatus('error')
                  }
                } catch (e) {
                  setSaveStatus('error')
                }
                setTimeout(() => setSaveStatus('idle'), 2000)
              }}
            >
              {saveStatus === 'saving' ? '⏳...' : saveStatus === 'saved' ? '✅ OK!' : saveStatus === 'error' ? '❌' : 'SAVE'}
            </button>
          </div>
        </div>
      </div>
  )
}
