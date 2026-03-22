import { Location, QuickLink } from '../../main-menu/types'
import { RefObject } from 'react'

export type ToolMode = 'move' | 'resize' | 'text' | 'color' | null
export type EditorTab = 'transform' | 'style' | 'layers' | 'config' | 'scenes' | 'navigation'
export type EditTarget = 'hitbox' | 'element' | 'visual' | 'background' | 'popup'
export type GridSnap = null | 5 | 10

export interface SceneSection {
  id: number
  url: string
  opacity: number
}

export interface EditorGroup {
  id: number
  name: string
  memberIds: number[]
  isCollapsed: boolean
}

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
    textShadowOpacity?: number,
    textBgColor?: string,
    textBgOpacity?: number,
    popupBgColor?: string,
    popupBgOpacity?: number,
    popupTextColor?: string,
    popupHeaderColor?: string
  }>
  tempVisuals: Record<number, { x: string; y: string }>
  tempHandles: Record<number, { x: string; y: string }>
  tempHidden: Record<number, boolean>
  tempContents: Record<number, string>
  tempPopupContents: Record<number, string>
  tempNames: Record<number, string>
  tempInteractionTypes: Record<number, 'none' | 'modal' | 'link' | 'popup'>
  tempLinks: Record<number, string>
  tempAnimations: Record<number, { speed?: number; amplitude?: number; noise?: number }>
  tempHoverOffsetsX: Record<number, number>
  tempHoverOffsetsY: Record<number, number>
  tempParentIds: Record<number, number | null>
  tempStickyLags: Record<number, number>
  tempImageUrls: Record<number, string>
  tempScales: Record<number, number>
  tempHandleSizes: Record<number, { width: string; height: string }>
  tempTextSizes: Record<number, { width: string; height: string }>
  tempPopupPositions: Record<number, { x: string; y: string }>
  tempPopupSizes: Record<number, { width: string; height: string }>
  tempQuickLinks: QuickLink[]
  committedQuickLinks: QuickLink[]
  tempSectionIds: Record<number, number>
  tempSections: SceneSection[]
  committedSections: SceneSection[]
  addedLocations: Location[]
  deletedLocations: number[]
  layerOrder: number[]
  selectedIds: number[]
  groups: Record<number, EditorGroup>
  activeLayersMode: 'elements' | 'sections'
  activeAnimTab: 'idle' | 'hover'
  tempSceneName: string | null
  tempBgGradientStart: string | null
  tempBgGradientEnd: string | null
  setActiveAnimTab: (tab: 'idle' | 'hover') => void
}

export interface EditorContextType {
  isEditorMode: boolean
  toggleEditorMode: () => void
  activeTool: ToolMode
  setActiveTool: (tool: ToolMode) => void
  activeTab: EditorTab
  setActiveTab: (tab: EditorTab) => void
  editTarget: EditTarget
  setEditTarget: (target: EditTarget) => void
  gridSnap: GridSnap
  setGridSnap: (snap: GridSnap) => void
  toolbarPos: { x: number; y: number }
  setToolbarPos: (pos: { x: number; y: number }) => void
  isCollapsed: boolean
  setIsCollapsed: (collapsed: boolean) => void
  isMobileView: boolean
  setIsMobileView: (mobile: boolean) => void
  selectedId: number | null
  setSelectedId: (id: number | null) => void
  tempPositions: Record<number, { x: string; y: string }>
  updateTempPosition: (id: number, x: string, y: string) => void
  tempSizes: Record<number, { width: string; height: string }>
  updateTempSize: (id: number, width: string, height: string) => void
  tempStyles: Record<number, { 
    opacity?: number, 
    fontFamily?: string, 
    fontSize?: string, 
    fontWeight?: string, 
    color?: string,
    textAlign?: 'left' | 'center' | 'right',
    textShadowColor?: string,
    textShadowBlur?: number,
    textShadowOpacity?: number,
    textBgColor?: string,
    textBgOpacity?: number,
    popupBgColor?: string,
    popupBgOpacity?: number,
    popupTextColor?: string,
    popupHeaderColor?: string
  }>
  updateTempStyle: (id: number, style: Partial<{ opacity: number, fontFamily: string, fontSize: string, fontWeight: string, color: string, textAlign: 'left' | 'center' | 'right', textShadowColor: string, textShadowBlur: number, textShadowOpacity: number, textBgColor: string, textBgOpacity: number, popupBgColor: string, popupBgOpacity: number, popupTextColor: string, popupHeaderColor: string }>) => void
  tempVisuals: Record<number, { x: string; y: string }>
  updateTempVisual: (id: number, x: string, y: string) => void
  tempHandles: Record<number, { x: string; y: string }>
  updateTempHandle: (id: number, x: string, y: string) => void
  tempHidden: Record<number, boolean>
  toggleTempHidden: (id: number, pushHistory: () => void) => void
  tempContents: Record<number, string>
  updateTempContent: (id: number, content: string) => void
  tempPopupContents: Record<number, string>
  updateTempPopupContent: (id: number, content: string) => void
  tempNames: Record<number, string>
  updateTempName: (id: number, name: string) => void
  tempInteractionTypes: Record<number, 'none' | 'modal' | 'link' | 'popup'>
  updateTempInteractionType: (id: number, type: 'none' | 'modal' | 'link' | 'popup') => void
  tempLinks: Record<number, string>
  updateTempLink: (id: number, link: string) => void
  tempAnimations: Record<number, { speed?: number; amplitude?: number; noise?: number }>
  updateTempAnimation: (id: number, anim: Partial<{ speed: number; amplitude: number; noise: number }>) => void
  tempHoverOffsetsX: Record<number, number>
  updateTempHoverOffsetX: (id: number, offset: number) => void
  tempHoverOffsetsY: Record<number, number>
  updateTempHoverOffsetY: (id: number, offset: number) => void
  tempParentIds: Record<number, number | null>
  updateTempParentId: (id: number, parentId: number | null) => void
  tempStickyLags: Record<number, number>
  updateTempStickyLag: (id: number, lag: number) => void
  tempImageUrls: Record<number, string>
  updateTempImageUrl: (id: number, url: string, committedLocations: any[], addedLocations: any[]) => void
  tempScales: Record<number, number>
  updateTempScale: (id: number, scale: number) => void
  tempHandleSizes: Record<number, { width: string; height: string }>
  updateTempHandleSize: (id: number, width: string, height: string) => void
  tempTextSizes: Record<number, { width: string; height: string }>
  updateTempTextSize: (id: number, width: string, height: string) => void
  tempPopupPositions: Record<number, { x: string; y: string }>
  updateTempPopupPosition: (id: number, x: string, y: string) => void
  tempPopupSizes: Record<number, { width: string; height: string }>
  updateTempPopupSize: (id: number, width: string, height: string) => void
  tempSectionIds: Record<number, number>
  updateTempSectionId: (id: number, sectionId: number) => void
  tempSections: SceneSection[]
  committedSections: SceneSection[]
  updateTempSection: (id: number, config: Partial<SceneSection>) => void
  addBackgroundSection: () => void
  activeLayersMode: 'elements' | 'sections'
  setActiveLayersMode: (mode: 'elements' | 'sections') => void
  activeAnimTab: 'idle' | 'hover'
  setActiveAnimTab: (tab: 'idle' | 'hover') => void
  isPreviewingIdle: boolean
  setIsPreviewingIdle: (preview: boolean) => void
  removeBackgroundSection: (id: number) => void
  duplicateBackgroundSection: (id: number) => void
  reorderSections: (startIndex: number, endIndex: number) => void
  committedLocations: Location[]
  commitSave: () => void
  hasSaved: boolean
  addedLocations: Location[]
  addTextLocation: () => void
  addImageLocation: () => void
  addPopupLocation: () => void
  duplicateLocation: (sourceId: number) => void
  syncAllToSections: () => void
  tempQuickLinks: QuickLink[]
  committedQuickLinks: QuickLink[]
  addQuickLink: () => void
  updateQuickLink: (id: number, config: Partial<QuickLink>) => void
  removeQuickLink: (id: number) => void
  reorderQuickLinks: (startIndex: number, endIndex: number) => void
  clearAddedLocations: () => void
  deletedLocations: number[]
  toggleDeletedLocation: (id: number) => void
  clearDeletedLocations: () => void
  layerOrder: number[]
  reorderLayers: (startIndex: number, endIndex: number) => void
  isSelectionMode: boolean
  toggleSelectionMode: () => void
  selectedIds: number[]
  toggleItemSelection: (id: number) => void
  groups: Record<number, EditorGroup>
  createGroup: (name: string) => void
  updateGroupName: (groupId: number, name: string) => void
  toggleGroupCollapse: (groupId: number) => void
  ungroup: (groupId: number) => void
  reorderGroups: (startIndex: number, endIndex: number) => void
  reorderBlock: (ids: number[], targetIndex: number) => void
  activeSectionFilter: number | 'all'
  setActiveSectionFilter: (filter: number | 'all') => void
  undo: () => void
  redo: () => void
  pushHistory: () => void
  canUndo: boolean
  canRedo: boolean
  scrollPos: number
  setScrollPos: (pos: number) => void
  scrollRef: RefObject<HTMLDivElement>
  sceneManager: any // TODO: specific type
  tempTargetSceneIds: Record<number, string | null>
  updateTempTargetSceneId: (id: number, sceneId: string | null) => void
  tempAssetFolder: string | null
  updateTempAssetFolder: (folder: string | null) => void
  tempSceneName: string | null
  updateTempSceneName: (name: string | null) => void
  tempBgGradientStart: string | null
  updateTempBgGradientStart: (color: string | null) => void
  tempBgGradientEnd: string | null
  updateTempBgGradientEnd: (color: string | null) => void
  tempHeaderTitle: string | null
  updateTempHeaderTitle: (v: string | null) => void
  tempHeaderFontFamily: string | null
  updateTempHeaderFontFamily: (v: string | null) => void
  tempHeaderFontSize: string | null
  updateTempHeaderFontSize: (v: string | null) => void
  tempHeaderColor: string | null
  updateTempHeaderColor: (v: string | null) => void
  silentSavePopup: (id: number, content: string) => Promise<void>
  switchScene: (id: string) => void
}
