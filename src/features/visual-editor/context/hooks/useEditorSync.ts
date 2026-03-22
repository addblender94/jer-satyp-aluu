import { useState, Dispatch, SetStateAction } from 'react';
import { Location, QuickLink } from '../../../main-menu/types';
import { SceneSection } from '../types';

interface UseEditorSyncProps {
  committedLocations: Location[];
  addedLocations: Location[];
  deletedLocations: number[];
  setCommittedLocations: Dispatch<SetStateAction<Location[]>>;
  setAddedLocations: Dispatch<SetStateAction<Location[]>>;
  setDeletedLocations: Dispatch<SetStateAction<number[]>>;

  tempPositions: Record<number, { x: string; y: string }>;
  tempSizes: Record<number, { width: string; height: string }>;
  tempVisuals: Record<number, { x: string; y: string }>;
  tempHandles: Record<number, { x: string; y: string }>;
  tempHidden: Record<number, boolean>;
  tempContents: Record<number, string>;
  tempPopupContents: Record<number, string>;
  tempNames: Record<number, string>;
  tempInteractionTypes: Record<number, 'none' | 'modal' | 'link' | 'popup'>;
  tempLinks: Record<number, string>;
  tempAnimations: Record<number, { speed?: number; amplitude?: number; noise?: number }>;
  tempHoverOffsetsX: Record<number, number>;
  tempHoverOffsetsY: Record<number, number>;
  tempParentIds: Record<number, number | null>;
  tempStickyLags: Record<number, number>;
  tempImageUrls: Record<number, string>;
  tempScales: Record<number, number>;
  tempHandleSizes: Record<number, { width: string; height: string }>;
  tempTextSizes: Record<number, { width: string; height: string }>;
  tempPopupPositions: Record<number, { x: string; y: string }>;
  tempPopupSizes: Record<number, { width: string; height: string }>;
  tempSectionIds: Record<number, number>;
  tempStyles: Record<number, any>;

  tempQuickLinks: QuickLink[];
  committedQuickLinks: QuickLink[];
  setTempQuickLinks: Dispatch<SetStateAction<QuickLink[]>>;
  setCommittedQuickLinks: Dispatch<SetStateAction<QuickLink[]>>;

  setTempPositions: Dispatch<SetStateAction<Record<number, { x: string; y: string }>>>;
  setTempSizes: Dispatch<SetStateAction<Record<number, { width: string; height: string }>>>;
  setTempVisuals: Dispatch<SetStateAction<Record<number, { x: string; y: string }>>>;
  setTempHandles: Dispatch<SetStateAction<Record<number, { x: string; y: string }>>>;
  setTempHidden: Dispatch<SetStateAction<Record<number, boolean>>>;
  setTempContents: Dispatch<SetStateAction<Record<number, string>>>;
  setTempPopupContents: Dispatch<SetStateAction<Record<number, string>>>;
  setTempNames: Dispatch<SetStateAction<Record<number, string>>>;
  setTempInteractionTypes: Dispatch<SetStateAction<Record<number, 'none' | 'modal' | 'link' | 'popup'>>>;
  setTempLinks: Dispatch<SetStateAction<Record<number, string>>>;
  setTempAnimations: Dispatch<SetStateAction<Record<number, { speed?: number; amplitude?: number; noise?: number }>>>;
  setTempHoverOffsetsX: Dispatch<SetStateAction<Record<number, number>>>;
  setTempHoverOffsetsY: Dispatch<SetStateAction<Record<number, number>>>;
  setTempParentIds: Dispatch<SetStateAction<Record<number, number | null>>>;
  setTempStickyLags: Dispatch<SetStateAction<Record<number, number>>>;
  setTempImageUrls: Dispatch<SetStateAction<Record<number, string>>>;
  setTempScales: Dispatch<SetStateAction<Record<number, number>>>;
  setTempHandleSizes: Dispatch<SetStateAction<Record<number, { width: string; height: string }>>>;
  setTempTextSizes: Dispatch<SetStateAction<Record<number, { width: string; height: string }>>>;
  setTempPopupPositions: Dispatch<SetStateAction<Record<number, { x: string; y: string }>>>;
  setTempPopupSizes: Dispatch<SetStateAction<Record<number, { width: string; height: string }>>>;
  setTempSectionIds: Dispatch<SetStateAction<Record<number, number>>>;
  setTempStyles: Dispatch<SetStateAction<Record<number, any>>>;

  layerOrder: number[];
  setLayerOrder: Dispatch<SetStateAction<number[]>>;
  tempSections: SceneSection[];
  setCommittedSections: Dispatch<SetStateAction<SceneSection[]>>;
  
  pushHistory: () => void;
  clearHistory: () => void;
  
  updateTempSectionId: (id: number, sectionId: number) => void;
  updateTempPosition: (id: number, x: string, y: string) => void;
  setHasSaved: Dispatch<SetStateAction<boolean>>;
}

export const useEditorSync = ({
  committedLocations, addedLocations, deletedLocations,
  setCommittedLocations, setAddedLocations, setDeletedLocations,
  tempPositions, tempSizes, tempVisuals, tempHandles, tempHidden, 
  tempContents, tempPopupContents, tempNames, tempInteractionTypes, tempLinks, 
  tempAnimations, tempHoverOffsetsX, tempHoverOffsetsY, tempParentIds, tempStickyLags, tempImageUrls, 
  tempScales, tempHandleSizes, tempTextSizes, tempPopupPositions, tempPopupSizes, tempSectionIds, tempStyles,
  tempQuickLinks, committedQuickLinks, setTempQuickLinks, setCommittedQuickLinks,
  setTempPositions, setTempSizes, setTempVisuals, setTempHandles, setTempHidden, 
  setTempContents, setTempPopupContents, setTempNames, setTempInteractionTypes, setTempLinks, 
  setTempAnimations, setTempHoverOffsetsX, setTempHoverOffsetsY, setTempParentIds, setTempStickyLags, setTempImageUrls, 
  setTempScales, setTempHandleSizes, setTempTextSizes, setTempPopupPositions, setTempPopupSizes, setTempSectionIds, setTempStyles,
  layerOrder, setLayerOrder, tempSections, setCommittedSections,
  pushHistory, clearHistory, updateTempSectionId, updateTempPosition
}: UseEditorSyncProps) => {
  const [hasSaved, setHasSaved] = useState<boolean>(false);

  const commitSave = () => {
    // 1. Get all current locations (Saved + Unsaved)
    const all = [ ...committedLocations, ...addedLocations ];
    
    // 2. Prepare the updated set
    const updated = all.filter(loc => !deletedLocations.includes(loc.id)).map(loc => {
      const id = loc.id;
      return {
        ...loc,
        x: tempPositions[id]?.x ?? loc.x,
        y: tempPositions[id]?.y ?? loc.y,
        width: tempSizes[id]?.width ?? loc.width,
        height: tempSizes[id]?.height ?? loc.height,
        visualX: tempVisuals[id]?.x ?? loc.visualX,
        visualY: tempVisuals[id]?.y ?? loc.visualY,
        handleX: tempHandles[id]?.x ?? loc.handleX,
        handleY: tempHandles[id]?.y ?? loc.handleY,
        isHidden: tempHidden[id] !== undefined ? tempHidden[id] : loc.isHidden,
        content: tempContents[id] ?? loc.content,
        popupContent: tempPopupContents[id] ?? loc.popupContent,
        imageUrl: tempImageUrls[id] ?? loc.imageUrl,
        scale: tempScales[id] ?? loc.scale,
        opacity: tempStyles[id]?.opacity ?? loc.opacity,
        fontFamily: tempStyles[id]?.fontFamily ?? loc.fontFamily,
        fontSize: tempStyles[id]?.fontSize ?? loc.fontSize,
        fontWeight: tempStyles[id]?.fontWeight ?? loc.fontWeight,
        color: tempStyles[id]?.color ?? loc.color,
        textAlign: tempStyles[id]?.textAlign ?? loc.textAlign,
        textShadowColor: tempStyles[id]?.textShadowColor ?? loc.textShadowColor,
        textShadowBlur: tempStyles[id]?.textShadowBlur ?? loc.textShadowBlur,
        textBgOpacity: tempStyles[id]?.textBgOpacity ?? loc.textBgOpacity,
        popupBgColor: tempStyles[id]?.popupBgColor ?? loc.popupBgColor,
        popupBgOpacity: tempStyles[id]?.popupBgOpacity ?? loc.popupBgOpacity,
        popupTextColor: tempStyles[id]?.popupTextColor ?? loc.popupTextColor,
        popupHeaderColor: tempStyles[id]?.popupHeaderColor ?? loc.popupHeaderColor,
        interactionType: tempInteractionTypes[id] ?? loc.interactionType,
        link: tempLinks[id] ?? loc.link,
        animSpeed: tempAnimations[id]?.speed ?? loc.animSpeed,
        animAmplitude: tempAnimations[id]?.amplitude ?? loc.animAmplitude,
        animNoise: tempAnimations[id]?.noise ?? loc.animNoise,
        hoverOffsetX: tempHoverOffsetsX[id] !== undefined ? tempHoverOffsetsX[id] : loc.hoverOffsetX,
        hoverOffsetY: tempHoverOffsetsY[id] !== undefined ? tempHoverOffsetsY[id] : loc.hoverOffsetY,
        parentId: tempParentIds[id] ?? loc.parentId,
        stickyLag: tempStickyLags[id] ?? loc.stickyLag,
        handleWidth: tempHandleSizes[id]?.width ?? loc.handleWidth,
        handleHeight: tempHandleSizes[id]?.height ?? loc.handleHeight,
        textWidth: tempTextSizes[id]?.width ?? loc.textWidth,
        textHeight: tempTextSizes[id]?.height ?? loc.textHeight,
        popupX: tempPopupPositions[id]?.x ?? loc.popupX,
        popupY: tempPopupPositions[id]?.y ?? loc.popupY,
        popupWidth: tempPopupSizes[id]?.width ?? loc.popupWidth,
        popupHeight: tempPopupSizes[id]?.height ?? loc.popupHeight,
        name: tempNames[id] ?? loc.name,
        sectionId: tempSectionIds[id] ?? loc.sectionId
      };
    }).sort((a,b) => layerOrder.indexOf(a.id) - layerOrder.indexOf(b.id));

    // 3. Update base and clear temp
    setCommittedLocations(updated);
    setCommittedSections(tempSections);
    setCommittedQuickLinks(tempQuickLinks);
    setHasSaved(true);
    setTempPositions({});
    setTempSizes({});
    setTempVisuals({});
    setTempHandles({});
    setTempHidden({});
    setTempContents({});
    setTempPopupContents({});
    setTempNames({});
    setTempInteractionTypes({});
    setTempLinks({});
    setTempAnimations({});
    setTempParentIds({});
    setTempStickyLags({});
    setTempImageUrls({});
    setTempScales({});
    setTempHandleSizes({});
    setTempTextSizes({});
    setTempPopupPositions({});
    setTempPopupSizes({});
    setTempSectionIds({});
    setAddedLocations([]);
    setDeletedLocations([]);
    setTempStyles({});
    setLayerOrder(updated.map(l => l.id));
    clearHistory();
  };

  const syncAllToSections = () => {
    pushHistory();
    const sectionCount = tempSections.length || 1;
    const all = [...committedLocations, ...addedLocations];

    all.forEach(loc => {
      const id = loc.id;
      const currentSectionId = tempSectionIds[id] ?? loc.sectionId ?? 1;
      const currentSectionIndex = tempSections.findIndex(s => s.id === currentSectionId);
      const safeSectionIndex = currentSectionIndex === -1 ? 0 : currentSectionIndex;

      // Global Y = (currentSectionIndex + localY%) / sectionCount
      const localYStr = tempPositions[id]?.y ?? loc.y ?? '50%';
      const localY = parseFloat(localYStr) / 100;
      const globalY = (safeSectionIndex + localY) / sectionCount;

      // New Territory
      const targetSectionIndex = Math.max(0, Math.min(sectionCount - 1, Math.floor(globalY * sectionCount)));
      const targetSectionId = tempSections[targetSectionIndex]?.id || 1;

      if (targetSectionId !== currentSectionId) {
        // Remap Y: localY = globalY * sectionCount - targetSectionIndex
        const newLocalY = (globalY * sectionCount - targetSectionIndex) * 100;
        updateTempSectionId(id, targetSectionId);
        updateTempPosition(id, tempPositions[id]?.x ?? loc.x, `${newLocalY.toFixed(2)}%`);
      }
    });
    console.log('Global sync completed: Elements redistributed by territory.');
  };

  return {
    commitSave,
    syncAllToSections
  };
};

