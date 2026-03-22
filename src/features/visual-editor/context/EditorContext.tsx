import React, { createContext, useContext, useState, ReactNode, useRef } from 'react'
import { Location } from '../../main-menu/types'
import { useSectionManager } from './hooks/useSectionManager'
import { useEditorUI } from './hooks/useEditorUI'
import { useEditorSelection } from './hooks/useEditorSelection'
import { useLocationManager } from './hooks/useLocationManager'
import { useElementState } from './hooks/useElementState'
import { useHistory } from './hooks/useHistory'
import { useEditorSync } from './hooks/useEditorSync'
import { useEditorStructure } from './hooks/useEditorStructure'
import { useQuickNavManager } from './hooks/useQuickNavManager'
import { 
  ToolMode, EditorTab, EditTarget, GridSnap, SceneSection, 
  EditorGroup, EditorContextType 
} from './types'

export type { 
  ToolMode, EditorTab, EditTarget, GridSnap, SceneSection, 
  EditorGroup, EditorContextType 
} from './types'
import { useSceneManager } from '../../main-menu/hooks/useSceneManager'
export interface EditorState {
  tempPositions: Record<number, { x: string; y: string }>
  tempSizes: Record<number, { width: string; height: string }>
  tempStyles: Record<number, { 
    opacity?: number, 
    fontFamily?: string, 
    fontSize?: string, 
    fontWeight?: string, 
    color?: string,
    textAlign?: 'left' | 'center' | 'right',
    textShadowColor?: string,
    textShadowBlur?: number,
    textShadowOpacity?: number
  }>
  tempVisuals: Record<number, { x: string; y: string }>
  tempHandles: Record<number, { x: string; y: string }>
  tempHidden: Record<number, boolean>
  tempContents: Record<number, string>
  tempNames: Record<number, string>
  tempInteractionTypes: Record<number, 'none' | 'modal' | 'link' | 'popup'>
  tempLinks: Record<number, string>
  tempAnimations: Record<number, { speed?: number; amplitude?: number; noise?: number }>
  tempParentIds: Record<number, number | null>
  tempStickyLags: Record<number, number>
  tempImageUrls: Record<number, string>
  tempScales: Record<number, number>
  tempHandleSizes: Record<number, { width: string; height: string }>
  tempTextSizes: Record<number, { width: string; height: string }>
  tempSectionIds: Record<number, number>
  tempSections: SceneSection[]
  committedSections: SceneSection[]
  addedLocations: Location[]
  deletedLocations: number[]
  layerOrder: number[]
  selectedIds: number[]
  groups: Record<number, EditorGroup>
  activeLayersMode: 'elements' | 'sections'
}

const EditorContext = createContext<EditorContextType | undefined>(undefined)

export const EditorProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const {
    isEditorMode, setIsEditorMode,
    activeTool, setActiveTool,
    activeTab, setActiveTab,
    editTarget, setEditTarget,
    gridSnap, setGridSnap,
    toolbarPos, setToolbarPos,
    activeLayersMode, setActiveLayersMode,
    isCollapsed, setIsCollapsed,
    activeAnimTab, setActiveAnimTab,
    isPreviewingIdle, setIsPreviewingIdle,
    isMobileView, setIsMobileView
  } = useEditorUI()

  const {
    tempQuickLinks, committedQuickLinks, setTempQuickLinks, setCommittedQuickLinks,
    addQuickLink, updateQuickLink, removeQuickLink, reorderQuickLinks, setAllQuickLinks
  } = useQuickNavManager()

  const sceneManager = useSceneManager()

  const [tempStyle, setTempStyle] = useState<Record<number, any>>({}) 
  // Initialize layerOrder dynamically
  const [layerOrder, setLayerOrder] = useState<number[]>([])
  
  const [groups, setGroups] = useState<Record<number, EditorGroup>>({})
  
  const {
    tempPositions, setTempPositions, updateTempPosition,
    tempSizes, setTempSizes, updateTempSize,
    tempVisuals, setTempVisuals, updateTempVisual,
    tempHandles, setTempHandles, updateTempHandle,
    tempHidden, setTempHidden, toggleTempHidden,
    tempContents, setTempContents, updateTempContent,
    tempPopupContents, setTempPopupContents, updateTempPopupContent,
    tempNames, setTempNames, updateTempName,
    tempInteractionTypes, setTempInteractionTypes, updateTempInteractionType,
    tempLinks, setTempLinks, updateTempLink,
    tempAnimations, setTempAnimations, updateTempAnimation,
    tempHoverOffsetsX, setTempHoverOffsetsX, updateTempHoverOffsetX,
    tempHoverOffsetsY, setTempHoverOffsetsY, updateTempHoverOffsetY,
    tempParentIds, setTempParentIds, updateTempParentId,
    tempStickyLags, setTempStickyLags, updateTempStickyLag,
    tempImageUrls, setTempImageUrls, updateTempImageUrl,
    tempScales, setTempScales, updateTempScale,
    tempHandleSizes, setTempHandleSizes, updateTempHandleSize,
    tempTextSizes, setTempTextSizes, updateTempTextSize,
    tempSectionIds, setTempSectionIds, updateTempSectionId,
    tempStyles, setTempStyles, updateTempStyle,
    tempPopupPositions, setTempPopupPositions, updateTempPopupPosition,
    tempPopupSizes, setTempPopupSizes, updateTempPopupSize,
    tempTargetSceneIds, setTempTargetSceneIds, updateTempTargetSceneId
  } = useElementState()

  const [committedSections, setCommittedSections] = useState<SceneSection[]>([])
  const [tempSections, setTempSections] = useState<SceneSection[]>([])
  const [hasSaved, setHasSaved] = useState<boolean>(false)

  const {
    selectedId, setSelectedId,
    isSelectionMode, setIsSelectionMode,
    selectedIds, setSelectedIds,
    toggleSelectionMode,
    toggleItemSelection,
    clearSelection
  } = useEditorSelection({ setHasSaved })

  const [committedLocations, setCommittedLocations] = useState<Location[]>([])
  const [addedLocations, setAddedLocations] = useState<Location[]>([])
  const [deletedLocations, setDeletedLocations] = useState<number[]>([])

  // Keep editor state in sync with sceneManager
  React.useEffect(() => {
    if (sceneManager.activeScene) {
      setCommittedLocations(sceneManager.activeScene.locations || [])
      setLayerOrder((sceneManager.activeScene.locations || []).map(l => l.id))
      setCommittedSections(sceneManager.activeScene.sections || [])
      setTempSections(sceneManager.activeScene.sections || [])
      setAllQuickLinks(sceneManager.activeScene.quickLinks || [])
      
      // Clear all temp states and selection when scene switches
      clearSelection()
      setTempPositions({})
      setTempSizes({})
      setTempVisuals({})
      setTempHandles({})
      setTempHidden({})
      setTempContents({})
      setTempNames({})
      setTempInteractionTypes({})
      setTempLinks({})
      setTempAnimations({})
      setTempParentIds({})
      setTempStickyLags({})
      setTempImageUrls({})
      setTempScales({})
      setTempHandleSizes({})
      setTempTextSizes({})
      setTempSectionIds({})
      setTempTargetSceneIds({})
      setTempPopupPositions({})
      setTempPopupSizes({})
      setTempHoverOffsetsX({})
      setTempHoverOffsetsY({})
      setTempAssetFolder(null)
      setTempSceneName(null)
      setTempBgGradientStart(sceneManager.activeScene.bgGradientStart || null)
      setTempBgGradientEnd(sceneManager.activeScene.bgGradientEnd || null)
      setTempHeaderTitle(sceneManager.activeScene.headerTitle || null)
      setTempHeaderFontFamily(sceneManager.activeScene.headerFontFamily || null)
      setTempHeaderFontSize(sceneManager.activeScene.headerFontSize || null)
      setTempHeaderColor(sceneManager.activeScene.headerColor || null)
      setAddedLocations([])
      setDeletedLocations([])
      setIsPreviewingIdle(false)
      setHasSaved(false)
    }
  }, [sceneManager.activeScene?.id])

  // Clear hover preview only when switching selection, 
  // ensuring it persists through saves for the current element.
  React.useEffect(() => {
    setTempHoverOffsetsX({})
    setTempHoverOffsetsY({})
  }, [selectedId, setTempHoverOffsetsX, setTempHoverOffsetsY])

  const [tempAssetFolder, setTempAssetFolder] = useState<string | null>(null)
  const updateTempAssetFolder = (folder: string | null) => {
    setTempAssetFolder(folder)
    setHasSaved(false)
  }

  const [tempSceneName, setTempSceneName] = useState<string | null>(null)
  const updateTempSceneName = (name: string | null) => {
    setTempSceneName(name)
    setHasSaved(false)
  }

  const [tempBgGradientStart, setTempBgGradientStart] = useState<string | null>(null)
  const updateTempBgGradientStart = (color: string | null) => {
    setTempBgGradientStart(color)
    setHasSaved(false)
  }

  const [tempBgGradientEnd, setTempBgGradientEnd] = useState<string | null>(null)
  const updateTempBgGradientEnd = (color: string | null) => {
    setTempBgGradientEnd(color)
    setHasSaved(false)
  }

  const [tempHeaderTitle, setTempHeaderTitle] = useState<string | null>(null)
  const updateTempHeaderTitle = (v: string | null) => { setTempHeaderTitle(v); setHasSaved(false) }

  const [tempHeaderFontFamily, setTempHeaderFontFamily] = useState<string | null>(null)
  const updateTempHeaderFontFamily = (v: string | null) => { setTempHeaderFontFamily(v); setHasSaved(false) }

  const [tempHeaderFontSize, setTempHeaderFontSize] = useState<string | null>(null)
  const updateTempHeaderFontSize = (v: string | null) => { setTempHeaderFontSize(v); setHasSaved(false) }

  const [tempHeaderColor, setTempHeaderColor] = useState<string | null>(null)
  const updateTempHeaderColor = (v: string | null) => { setTempHeaderColor(v); setHasSaved(false) }

  const { past, future, pushHistory, undo, redo, clearHistory, canUndo, canRedo } = useHistory({
    getCurrentState: () => ({
      tempPositions: { ...tempPositions },
      tempSizes: { ...tempSizes },
      tempStyles: { ...tempStyles },
      tempVisuals: { ...tempVisuals },
      tempHandles: { ...tempHandles },
      tempHidden: { ...tempHidden },
      tempContents: { ...tempContents },
      tempPopupContents: { ...tempPopupContents },
      tempNames: { ...tempNames },
      tempInteractionTypes: { ...tempInteractionTypes },
      tempLinks: { ...tempLinks },
      tempAnimations: { ...tempAnimations },
      tempHoverOffsetsX: { ...tempHoverOffsetsX },
      tempHoverOffsetsY: { ...tempHoverOffsetsY },
      tempParentIds: { ...tempParentIds },
      tempStickyLags: { ...tempStickyLags },
      tempImageUrls: { ...tempImageUrls },
      tempScales: { ...tempScales },
      tempHandleSizes: { ...tempHandleSizes },
      tempTextSizes: { ...tempTextSizes },
      tempPopupPositions: { ...tempPopupPositions },
      tempPopupSizes: { ...tempPopupSizes },
      tempSectionIds: { ...tempSectionIds },
      tempSections: [ ...tempSections ],
      committedSections: [ ...committedSections ],
      addedLocations: [ ...addedLocations ],
      deletedLocations: [ ...deletedLocations ],
      layerOrder: [ ...layerOrder ],
      selectedIds: [ ...selectedIds ],
      groups: { ...groups },
      activeLayersMode,
      tempSceneName
    }),
    setTempPositions, setTempSizes, setTempStyles, setTempVisuals,
    setTempHandles, setTempHidden, setTempContents, setTempPopupContents, setTempNames,
    setTempInteractionTypes, setTempLinks, setTempAnimations,
    setTempHoverOffsetsX, setTempHoverOffsetsY,
    setTempParentIds, setTempStickyLags, setTempImageUrls,
    setTempScales, setTempHandleSizes, setTempTextSizes,
    setTempPopupPositions, setTempPopupSizes,
    setTempSectionIds, setTempSections, setCommittedSections,
    setActiveLayersMode, setAddedLocations, setDeletedLocations,
    setLayerOrder, setSelectedIds, setGroups, setTempSceneName
  })

  // We need to inject pushHistory into useLocationManager now that it's defined
  const {
    addTextLocation, addImageLocation, addPopupLocation,
    duplicateLocation, clearAddedLocations,
    toggleDeletedLocation, clearDeletedLocations
  } = useLocationManager({
    committedLocations, setCommittedLocations,
    addedLocations, setAddedLocations,
    deletedLocations, setDeletedLocations,
    pushHistory, 
    setLayerOrder,
    setSelectedId,
    tempPositions, tempSizes, tempVisuals, tempHandles, tempHidden, 
    tempContents, tempPopupContents, tempNames, tempInteractionTypes, tempLinks, 
    tempParentIds, tempStickyLags, tempImageUrls, tempScales, 
    tempHandleSizes, tempTextSizes, tempSectionIds, tempStyles, tempAnimations,
    tempPopupPositions, tempPopupSizes,
    tempHoverOffsetsX, tempHoverOffsetsY,
    setTempNames, setTempInteractionTypes, setTempLinks,
    setTempPopupContents
  })

  const { commitSave, syncAllToSections } = useEditorSync({
    committedLocations, addedLocations, deletedLocations,
    setCommittedLocations, setAddedLocations, setDeletedLocations,
    tempPositions, tempSizes, tempVisuals, tempHandles, tempHidden, 
    tempContents, tempPopupContents, tempNames, tempInteractionTypes, tempLinks, 
    tempAnimations, tempHoverOffsetsX, tempHoverOffsetsY, tempParentIds, tempStickyLags, tempImageUrls, tempScales, tempHandleSizes, tempTextSizes, tempSectionIds, tempStyles,
    tempPopupPositions, tempPopupSizes,
    tempQuickLinks, committedQuickLinks, setTempQuickLinks, setCommittedQuickLinks,
    setTempPositions, setTempSizes, setTempVisuals, setTempHandles, setTempHidden, 
    setTempContents, setTempPopupContents, setTempNames, setTempInteractionTypes, setTempLinks, 
    setTempAnimations, setTempHoverOffsetsX, setTempHoverOffsetsY, setTempParentIds, setTempStickyLags, setTempImageUrls, 
    setTempScales, setTempHandleSizes, setTempTextSizes, 
    setTempPopupPositions, setTempPopupSizes,
    setTempSectionIds, setTempStyles,
    layerOrder, setLayerOrder, tempSections, setCommittedSections,
    pushHistory, clearHistory, updateTempSectionId, updateTempPosition, setHasSaved
  });

  const silentSavePopup = async (id: number, content: string) => {
    // 1. Update local state immediately
    updateTempPopupContent(id, content)
    
    // 2. Optimistically update local state while server saves

    try {
      const activeId = sceneManager.activeSceneId || sceneManager.activeScene?.id || 'main'
      console.log(`[EditorContext] Sending patch to /api/editor/patch-popup for ${id}:`, { sceneId: activeId, elementId: id, popupContent: content })
      const res = await fetch('/api/editor/patch-popup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          sceneId: activeId,
          elementId: id,
          popupContent: content
        }),
      })
      console.log(`[EditorContext] Response status: ${res.status} ${res.statusText}`)
      if (res.ok) {
        const resData = await res.json()
        console.log(`[EditorContext] Save success. API Response:`, resData)
        // 3. Update local committed state without using stale commitSave closure
        setCommittedLocations(prevCommitted => {
          // We apply the same logic as commitSave but with fresh state
          const all = [...prevCommitted, ...addedLocations]
          const updated = all.filter(loc => !deletedLocations.includes(loc.id)).map(loc => {
            const lid = loc.id
            const isTarget = Number(lid) === Number(id)
            return {
              ...loc,
              x: tempPositions[lid]?.x ?? loc.x,
              y: tempPositions[lid]?.y ?? loc.y,
              width: tempSizes[lid]?.width ?? loc.width,
              height: tempSizes[lid]?.height ?? loc.height,
              visualX: tempVisuals[lid]?.x ?? loc.visualX,
              visualY: tempVisuals[lid]?.y ?? loc.visualY,
              handleX: tempHandles[lid]?.x ?? loc.handleX,
              handleY: tempHandles[lid]?.y ?? loc.handleY,
              isHidden: tempHidden[lid] !== undefined ? tempHidden[lid] : loc.isHidden,
              content: tempContents[lid] ?? loc.content,
              popupContent: isTarget ? content : (tempPopupContents[lid] ?? loc.popupContent),
              imageUrl: tempImageUrls[lid] ?? loc.imageUrl,
              scale: tempScales[lid] ?? loc.scale,
              opacity: tempStyles[lid]?.opacity ?? loc.opacity,
              fontFamily: tempStyles[lid]?.fontFamily ?? loc.fontFamily,
              fontSize: tempStyles[lid]?.fontSize ?? loc.fontSize,
              fontWeight: tempStyles[lid]?.fontWeight ?? loc.fontWeight,
              color: tempStyles[lid]?.color ?? loc.color,
              textAlign: tempStyles[lid]?.textAlign ?? loc.textAlign,
              textShadowColor: tempStyles[lid]?.textShadowColor ?? loc.textShadowColor,
              textShadowBlur: tempStyles[lid]?.textShadowBlur ?? loc.textShadowBlur,
              textBgOpacity: tempStyles[lid]?.textBgOpacity ?? loc.textBgOpacity,
              popupBgColor: tempStyles[lid]?.popupBgColor ?? loc.popupBgColor,
              popupBgOpacity: tempStyles[lid]?.popupBgOpacity ?? loc.popupBgOpacity,
              popupTextColor: tempStyles[lid]?.popupTextColor ?? loc.popupTextColor,
              popupHeaderColor: tempStyles[lid]?.popupHeaderColor ?? loc.popupHeaderColor,
              interactionType: tempInteractionTypes[lid] ?? loc.interactionType,
              link: tempLinks[lid] ?? loc.link,
              animSpeed: tempAnimations[lid]?.speed ?? loc.animSpeed,
              animAmplitude: tempAnimations[lid]?.amplitude ?? loc.animAmplitude,
              animNoise: tempAnimations[lid]?.noise ?? loc.animNoise,
              hoverOffsetX: tempHoverOffsetsX[lid] !== undefined ? tempHoverOffsetsX[lid] : loc.hoverOffsetX,
              hoverOffsetY: tempHoverOffsetsY[lid] !== undefined ? tempHoverOffsetsY[lid] : loc.hoverOffsetY,
              parentId: tempParentIds[lid] ?? loc.parentId,
              stickyLag: tempStickyLags[lid] ?? loc.stickyLag,
              handleWidth: tempHandleSizes[lid]?.width ?? loc.handleWidth,
              handleHeight: tempHandleSizes[lid]?.height ?? loc.handleHeight,
              textWidth: tempTextSizes[lid]?.width ?? loc.textWidth,
              textHeight: tempTextSizes[lid]?.height ?? loc.textHeight,
              popupX: tempPopupPositions[lid]?.x ?? loc.popupX,
              popupY: tempPopupPositions[lid]?.y ?? loc.popupY,
              popupWidth: tempPopupSizes[lid]?.width ?? loc.popupWidth,
              popupHeight: tempPopupSizes[lid]?.height ?? loc.popupHeight,
              name: tempNames[lid] ?? loc.name,
              sectionId: tempSectionIds[lid] ?? loc.sectionId,
              targetSceneId: tempTargetSceneIds[lid] !== undefined ? (tempTargetSceneIds[lid] ?? undefined) : loc.targetSceneId,
            }
          }).sort((a,b) => layerOrder.indexOf(a.id) - layerOrder.indexOf(b.id))
          
          return updated
        })
        
        setTempPopupContents(prev => {
          const { [id]: _, ...rest } = prev
          return rest
        })
        setHasSaved(true)
        // 4. Force a re-sync from server to be 100% sure
        await sceneManager.refreshActiveScene()
        clearHistory()
      }
    } catch (e) {
      console.error('Silent save failed:', e)
    }
  }

  const toggleEditorMode = () => {
    if (!isEditorMode) {
      setHasSaved(false) // Reset on enter
    }
    setIsEditorMode(!isEditorMode)
    if (isEditorMode) {
      setActiveTool(null)
      clearSelection()
      setTempPositions({})
      setTempSizes({})
      setTempVisuals({})
      setTempHandles({})
      setTempHidden({})
      setTempContents({})
      setTempNames({})
      setTempInteractionTypes({})
      setTempLinks({})
      setTempAnimations({})
      setTempParentIds({})
      setTempStickyLags({})
      setTempImageUrls({})
      setTempScales({})
      setTempHandleSizes({})
      setTempTextSizes({})
      setTempSectionIds({})
      setTempTargetSceneIds({})
      setAddedLocations([])
      setDeletedLocations([])
      setLayerOrder(committedLocations.map(l => l.id))
      setGroups({})
      setTempSections(committedSections)
      setTempSceneName(null)
      setTempBgGradientStart(null)
      setTempBgGradientEnd(null)
      setIsPreviewingIdle(false)
      clearHistory()
    }
  }

  const [activeSectionFilter, setActiveSectionFilter] = useState<number | 'all'>('all')

  const {
    updateTempSection,
    addBackgroundSection,
    removeBackgroundSection,
    duplicateBackgroundSection,
    reorderSections
  } = useSectionManager({
    tempSections,
    setTempSections,
    setTempSectionIds,
    pushHistory
  });

  const {
    createGroup,
    updateGroupName,
    toggleGroupCollapse,
    ungroup,
    reorderGroups,
    reorderLayers,
    reorderBlock
  } = useEditorStructure({
    setLayerOrder,
    setGroups,
    selectedIds,
    setSelectedIds,
    setIsSelectionMode,
    pushHistory
  })

  const handleToggleTempHidden = (id: number) => {
    toggleTempHidden(id, pushHistory);
  }

  const [scrollPos, setScrollPos] = useState(0)
  const scrollRef = useRef<HTMLDivElement>(null)

  // All setters removed properly


  return (
    <EditorContext.Provider
      value={{
        isEditorMode,
        toggleEditorMode,
        activeTool,
        setActiveTool,
        activeTab,
        setActiveTab,
        editTarget,
        setEditTarget,
        gridSnap,
        setGridSnap,
        toolbarPos,
        setToolbarPos,
        isCollapsed,
        setIsCollapsed,
        selectedId,
        setSelectedId,
        tempPositions,
        updateTempPosition,
        tempSizes,
        updateTempSize,
        tempStyles,
        updateTempStyle,
        tempVisuals,
        updateTempVisual,
        tempHandles,
        updateTempHandle,
        tempHidden,
        toggleTempHidden,
        tempContents, updateTempContent,
        tempPopupContents, updateTempPopupContent,
        tempNames,
        updateTempName,
        tempInteractionTypes,
        updateTempInteractionType,
        tempLinks,
        updateTempLink,
        tempAnimations,
        updateTempAnimation,
        tempHoverOffsetsX,
        updateTempHoverOffsetX,
        tempHoverOffsetsY,
        updateTempHoverOffsetY,
        tempParentIds,
        updateTempParentId,
        tempStickyLags,
        updateTempStickyLag,
        tempImageUrls,
        updateTempImageUrl,
        tempScales,
        updateTempScale,
        tempHandleSizes,
        updateTempHandleSize,
        tempTextSizes,
        updateTempTextSize,
        tempPopupPositions,
        updateTempPopupPosition,
        tempPopupSizes,
        updateTempPopupSize,
        tempSectionIds,
        updateTempSectionId,
        tempSections,
        committedSections,
        updateTempSection,
        addBackgroundSection,
        removeBackgroundSection,
        duplicateBackgroundSection,
        reorderSections,
        activeSectionFilter,
        setActiveSectionFilter,
        activeLayersMode,
        setActiveLayersMode,
        committedLocations,
        commitSave,
        hasSaved,
        addedLocations,
        addTextLocation,
        addImageLocation,
        addPopupLocation,
        duplicateLocation,
        syncAllToSections,
        clearAddedLocations,
        deletedLocations,
        toggleDeletedLocation,
        clearDeletedLocations,
        layerOrder,
        reorderLayers,
        isSelectionMode,
        toggleSelectionMode,
        selectedIds,
        toggleItemSelection,
        groups,
        createGroup,
        updateGroupName,
        toggleGroupCollapse,
        ungroup,
        reorderGroups,
        reorderBlock,
        undo,
        redo,
        pushHistory,
        canUndo,
        canRedo,
        scrollPos,
        setScrollPos,
        scrollRef,
        sceneManager,
        tempTargetSceneIds,
        updateTempTargetSceneId,
        tempAssetFolder,
        updateTempAssetFolder,
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
        updateTempHeaderColor,
        silentSavePopup,
        activeAnimTab,
        setActiveAnimTab,
        isPreviewingIdle,
        setIsPreviewingIdle,
        isMobileView,
        setIsMobileView,
        tempQuickLinks,
        committedQuickLinks,
        addQuickLink,
        updateQuickLink,
        removeQuickLink,
        reorderQuickLinks,
        switchScene: sceneManager.switchScene
      }}
    >
      {children}
    </EditorContext.Provider>
  )
}

export const useEditor = () => {
  const context = useContext(EditorContext)
  if (!context) {
    throw new Error('useEditor must be used within an EditorProvider')
  }
  return context
}
