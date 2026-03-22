import { useState, Dispatch, SetStateAction } from 'react';
import { Location } from '../../../main-menu/types';
import { EditorGroup, SceneSection, EditorTab } from '../types';

// We need an exact snapshot type of everything that history tracks
export interface EditorStateSnapshot {
  tempPositions: Record<number, { x: string; y: string }>;
  tempSizes: Record<number, { width: string; height: string }>;
  tempStyles: Record<number, any>;
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
  tempSections: SceneSection[];
  committedSections: SceneSection[];
  addedLocations: Location[];
  deletedLocations: number[];
  layerOrder: number[];
  selectedIds: number[];
  groups: Record<number, EditorGroup>;
  activeLayersMode: 'elements' | 'sections';
  tempSceneName: string | null;
}

interface UseHistoryProps {
  getCurrentState: () => EditorStateSnapshot;
  setTempPositions: Dispatch<SetStateAction<Record<number, { x: string; y: string }>>>;
  setTempSizes: Dispatch<SetStateAction<Record<number, { width: string; height: string }>>>;
  setTempStyles: Dispatch<SetStateAction<Record<number, any>>>;
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
  setTempSections: Dispatch<SetStateAction<SceneSection[]>>;
  setCommittedSections: Dispatch<SetStateAction<SceneSection[]>>;
  setActiveLayersMode: Dispatch<SetStateAction<'elements' | 'sections'>>;
  setAddedLocations: Dispatch<SetStateAction<Location[]>>;
  setDeletedLocations: Dispatch<SetStateAction<number[]>>;
  setLayerOrder: Dispatch<SetStateAction<number[]>>;
  setSelectedIds: Dispatch<SetStateAction<number[]>>;
  setGroups: Dispatch<SetStateAction<Record<number, EditorGroup>>>;
  setTempSceneName: Dispatch<SetStateAction<string | null>>;
}

export const useHistory = ({
  getCurrentState,
  setTempPositions,
  setTempSizes,
  setTempStyles,
  setTempVisuals,
  setTempHandles,
  setTempHidden,
  setTempContents,
  setTempNames,
  setTempInteractionTypes,
  setTempLinks,
  setTempAnimations,
  setTempHoverOffsetsX,
  setTempHoverOffsetsY,
  setTempParentIds,
  setTempStickyLags,
  setTempImageUrls,
  setTempScales,
  setTempHandleSizes,
  setTempTextSizes,
  setTempPopupPositions,
  setTempPopupSizes,
  setTempSectionIds,
  setTempSections,
  setCommittedSections,
  setActiveLayersMode,
  setAddedLocations,
  setDeletedLocations,
  setLayerOrder,
  setSelectedIds,
  setGroups,
  setTempSceneName
}: UseHistoryProps) => {
  const [past, setPast] = useState<EditorStateSnapshot[]>([]);
  const [future, setFuture] = useState<EditorStateSnapshot[]>([]);

  const pushHistory = () => {
    const currentState = getCurrentState();
    setPast((prev) => [...prev.slice(-49), currentState]);
    setFuture([]);
  };

  const undo = () => {
    if (past.length === 0) return;
    
    const previous = past[past.length - 1];
    const newPast = past.slice(0, past.length - 1);
    
    setFuture((prev) => [getCurrentState(), ...prev.slice(0, 49)]);
    setPast(newPast);
    
    // Apply state
    setTempPositions(previous.tempPositions);
    setTempSizes(previous.tempSizes);
    setTempStyles(previous.tempStyles);
    setTempVisuals(previous.tempVisuals);
    setTempHandles(previous.tempHandles);
    setTempHidden(previous.tempHidden);
    setTempContents(previous.tempContents);
    setTempNames(previous.tempNames);
    setTempInteractionTypes(previous.tempInteractionTypes);
    setTempLinks(previous.tempLinks);
    setTempAnimations(previous.tempAnimations);
    setTempHoverOffsetsX(previous.tempHoverOffsetsX);
    setTempHoverOffsetsY(previous.tempHoverOffsetsY);
    setTempParentIds(previous.tempParentIds);
    setTempStickyLags(previous.tempStickyLags);
    setTempImageUrls(previous.tempImageUrls);
    setTempScales(previous.tempScales);
    setTempHandleSizes(previous.tempHandleSizes);
    setTempTextSizes(previous.tempTextSizes);
    setTempPopupPositions(previous.tempPopupPositions);
    setTempPopupSizes(previous.tempPopupSizes);
    setTempSectionIds(previous.tempSectionIds);
    setTempSections(previous.tempSections);
    setCommittedSections(previous.committedSections);
    setActiveLayersMode(previous.activeLayersMode || 'elements');
    setAddedLocations(previous.addedLocations);
    setDeletedLocations(previous.deletedLocations);
    setLayerOrder(previous.layerOrder);
    setSelectedIds(previous.selectedIds);
    setGroups(previous.groups);
    setTempSceneName(previous.tempSceneName);
  };

  const redo = () => {
    if (future.length === 0) return;
    
    const next = future[0];
    const newFuture = future.slice(1);
    
    setPast((prev) => [...prev.slice(-49), getCurrentState()]);
    setFuture(newFuture);
    
    // Apply state
    setTempPositions(next.tempPositions);
    setTempSizes(next.tempSizes);
    setTempStyles(next.tempStyles);
    setTempVisuals(next.tempVisuals);
    setTempHandles(next.tempHandles);
    setTempHidden(next.tempHidden);
    setTempContents(next.tempContents);
    setTempNames(next.tempNames);
    setTempInteractionTypes(next.tempInteractionTypes);
    setTempLinks(next.tempLinks);
    setTempAnimations(next.tempAnimations);
    setTempHoverOffsetsX(next.tempHoverOffsetsX);
    setTempHoverOffsetsY(next.tempHoverOffsetsY);
    setTempParentIds(next.tempParentIds);
    setTempStickyLags(next.tempStickyLags);
    setTempImageUrls(next.tempImageUrls);
    setTempScales(next.tempScales);
    setTempHandleSizes(next.tempHandleSizes);
    setTempTextSizes(next.tempTextSizes);
    setTempPopupPositions(next.tempPopupPositions);
    setTempPopupSizes(next.tempPopupSizes);
    setTempSectionIds(next.tempSectionIds);
    setTempSections(next.tempSections);
    setCommittedSections(next.committedSections);
    setActiveLayersMode(next.activeLayersMode || 'elements');
    setAddedLocations(next.addedLocations);
    setDeletedLocations(next.deletedLocations);
    setLayerOrder(next.layerOrder);
    setSelectedIds(next.selectedIds);
    setGroups(next.groups);
    setTempSceneName(next.tempSceneName);
  };

  const clearHistory = () => {
    setPast([]);
    setFuture([]);
  };

  return {
    past,
    future,
    pushHistory,
    undo,
    redo,
    clearHistory,
    canUndo: past.length > 0,
    canRedo: future.length > 0
  };
};
