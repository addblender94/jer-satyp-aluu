import { useState, Dispatch, SetStateAction } from 'react';
import { Location } from '../../../main-menu/types';

interface UseLocationManagerProps {
  pushHistory: () => void;
  setLayerOrder: Dispatch<SetStateAction<number[]>>;
  setSelectedId: Dispatch<SetStateAction<number | null>>;
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
  tempAnimations: Record<number, any>;
  tempHoverOffsetsX: Record<number, number>;
  tempHoverOffsetsY: Record<number, number>;
  setTempNames: Dispatch<SetStateAction<Record<number, string>>>;
  setTempPopupContents: Dispatch<SetStateAction<Record<number, string>>>;
  setTempInteractionTypes: Dispatch<SetStateAction<Record<number, 'none' | 'modal' | 'link' | 'popup'>>>;
  setTempLinks: Dispatch<SetStateAction<Record<number, string>>>;
  
  committedLocations: Location[];
  setCommittedLocations: Dispatch<SetStateAction<Location[]>>;
  addedLocations: Location[];
  setAddedLocations: Dispatch<SetStateAction<Location[]>>;
  deletedLocations: number[];
  setDeletedLocations: Dispatch<SetStateAction<number[]>>;
}

export const useLocationManager = ({
  pushHistory,
  setLayerOrder,
  setSelectedId,
  tempPositions,
  tempSizes,
  tempVisuals,
  tempHandles,
  tempHidden,
  tempContents,
  tempPopupContents,
  tempNames,
  tempInteractionTypes,
  tempLinks,
  tempParentIds,
  tempStickyLags,
  tempImageUrls,
  tempScales,
  tempHandleSizes,
  tempTextSizes,
  tempPopupPositions,
  tempPopupSizes,
  tempSectionIds,
  tempStyles,
  tempAnimations,
  tempHoverOffsetsX,
  tempHoverOffsetsY,
  setTempNames,
  setTempInteractionTypes,
  setTempLinks,
  committedLocations, setCommittedLocations,
  addedLocations, setAddedLocations,
  deletedLocations, setDeletedLocations
}: UseLocationManagerProps) => {
  const [hasSaved, setHasSaved] = useState<boolean>(false);

  const addTextLocation = () => {
    pushHistory();
    const allLocations = [...committedLocations, ...addedLocations];
    const nextId = allLocations.length > 0 ? Math.max(...allLocations.map(l => l.id)) + 1 : 1;
    
    const newLocation: Location = {
      id: nextId,
      name: 'New Text',
      content: 'Текст',
      x: '50.00%',
      y: '50.00%',
      width: '30.00%',
      height: '10.00%',

      handleX: '50.00%',
      handleY: '50.00%',
      fontFamily: 'Inter',
      fontSize: '40px',
      fontWeight: 'bold',
      color: '#ffffff',
    };
    
    setAddedLocations(prev => [...prev, newLocation]);
    setLayerOrder(prev => [...prev, nextId]);
    setSelectedId(nextId);
  };

  const addImageLocation = () => {
    pushHistory();
    const allLocations = [...committedLocations, ...addedLocations];
    const nextId = allLocations.length > 0 ? Math.max(...allLocations.map(l => l.id)) + 1 : 1;
    
    const newLocation: Location = {
      id: nextId,
      name: `New Image Layer ${nextId}`,
      imageUrl: '', 
      x: '45.00%',
      y: '45.00%',
      width: '10.00%',
      height: '10.00%',

      handleX: '45.00%',
      handleY: '45.00%',
      handleWidth: '100px',
      handleHeight: '100px',
      scale: 1,
      opacity: 1,
    };
    
    setAddedLocations(prev => [...prev, newLocation]);
    setLayerOrder(prev => [...prev, nextId]);
    setSelectedId(nextId);
  };

  const addPopupLocation = () => {
    pushHistory();
    const allLocations = [...committedLocations, ...addedLocations];
    const nextId = allLocations.length > 0 ? Math.max(...allLocations.map(l => l.id)) + 1 : 1;
    
    const newLocation: Location = {
      id: nextId,
      name: 'New Popup',
      content: '💬 МААЛЫМАТ',
      popupContent: 'Бул жерге маалымат жазыңыз...',
      x: '50.00%',
      y: '50.00%',
      width: '10.00%',
      height: '10.00%',

      handleX: '50.00%',
      handleY: '50.00%',
      interactionType: 'popup',
      color: '#ffffff',
      popupX: '40.00%',
      popupY: '40.00%',
      popupWidth: '300px',
      popupHeight: '200px',
      isPopupExpanded: false,
    };
    
    setAddedLocations(prev => [...prev, newLocation]);
    setLayerOrder(prev => [...prev, nextId]);
    setSelectedId(nextId);
  };

  const duplicateLocation = (sourceId: number) => {
    pushHistory();
    const allLocs = [...committedLocations, ...addedLocations];
    const source = allLocs.find(l => l.id === sourceId);
    if (!source) return;
    
    const nextId = allLocs.length > 0 ? Math.max(...allLocs.map(l => l.id)) + 1 : 1;
    
    const baseX = tempPositions[sourceId]?.x ?? source.x;
    const baseY = tempPositions[sourceId]?.y ?? source.y;
    const baseHX = tempHandles[sourceId]?.x ?? source.handleX ?? source.x;
    const baseHY = tempPositions[sourceId]?.y ?? source.handleY ?? source.y; // using y as fallback

    const cloned: Location = {
      ...source,
      id: nextId,
      name: `Copy of ${tempNames[sourceId] ?? source.name}`,
      imageUrl: tempImageUrls[sourceId] ?? source.imageUrl ?? `${source.id}.png`,
      x: `${(parseFloat(baseX) + 2).toFixed(2)}%`,
      y: `${(parseFloat(baseY) + 2).toFixed(2)}%`,
      handleX: `${(parseFloat(baseHX) + 2).toFixed(2)}%`,
      handleY: `${(parseFloat(baseHY) + 2).toFixed(2)}%`,
      width: tempSizes[sourceId]?.width ?? source.width,
      height: tempSizes[sourceId]?.height ?? source.height,
      visualX: tempVisuals[sourceId]?.x ?? source.visualX,
      visualY: tempVisuals[sourceId]?.y ?? source.visualY,
      isHidden: tempHidden[sourceId] !== undefined ? tempHidden[sourceId] : source.isHidden,
      content: tempContents[sourceId] ?? source.content,
      popupContent: tempPopupContents[sourceId] ?? source.popupContent,
      interactionType: tempInteractionTypes[sourceId] ?? source.interactionType,
      link: tempLinks[sourceId] ?? source.link,
      parentId: tempParentIds[sourceId] ?? source.parentId,
      stickyLag: tempStickyLags[sourceId] ?? source.stickyLag,
      scale: tempScales[sourceId] ?? source.scale,
      handleWidth: tempHandleSizes[sourceId]?.width ?? source.handleWidth,
      handleHeight: tempHandleSizes[sourceId]?.height ?? source.handleHeight,
      textWidth: tempTextSizes[sourceId]?.width ?? source.textWidth,
      textHeight: tempTextSizes[sourceId]?.height ?? source.textHeight,
      sectionId: tempSectionIds[sourceId] ?? source.sectionId,
      opacity: tempStyles[sourceId]?.opacity ?? source.opacity,
      fontFamily: tempStyles[sourceId]?.fontFamily ?? source.fontFamily,
      fontSize: tempStyles[sourceId]?.fontSize ?? source.fontSize,
      fontWeight: tempStyles[sourceId]?.fontWeight ?? source.fontWeight,
      color: tempStyles[sourceId]?.color ?? source.color,
      textAlign: tempStyles[sourceId]?.textAlign ?? source.textAlign,
      textShadowColor: tempStyles[sourceId]?.textShadowColor ?? source.textShadowColor,
      textShadowBlur: tempStyles[sourceId]?.textShadowBlur ?? source.textShadowBlur,
      animSpeed: tempAnimations[sourceId]?.speed ?? source.animSpeed,
      animAmplitude: tempAnimations[sourceId]?.amplitude ?? source.animAmplitude,
      animNoise: tempAnimations[sourceId]?.noise ?? source.animNoise,
      popupX: tempPopupPositions[sourceId]?.x ?? source.popupX,
      popupY: tempPopupPositions[sourceId]?.y ?? source.popupY,
      popupWidth: tempPopupSizes[sourceId]?.width ?? source.popupWidth,
      popupHeight: tempPopupSizes[sourceId]?.height ?? source.popupHeight,
      hoverOffsetX: tempHoverOffsetsX[sourceId] ?? source.hoverOffsetX ?? 0,
      hoverOffsetY: tempHoverOffsetsY[sourceId] ?? source.hoverOffsetY ?? 0,
    };

    setAddedLocations(prev => [...prev, cloned]);
    setLayerOrder(prev => [...prev, nextId]);
    setSelectedId(nextId);
  };

  const clearAddedLocations = () => {
    setAddedLocations([]);
    setTempNames({});
    setTempInteractionTypes({});
    setTempLinks({});
  };

  const toggleDeletedLocation = (id: number) => {
    pushHistory();
    setDeletedLocations(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const clearDeletedLocations = () => {
    setDeletedLocations([]);
  };

  return {
    committedLocations,
    setCommittedLocations,
    hasSaved,
    setHasSaved,
    addedLocations,
    setAddedLocations,
    deletedLocations,
    setDeletedLocations,
    addTextLocation,
    addImageLocation,
    duplicateLocation,
    addPopupLocation,
    clearAddedLocations,
    toggleDeletedLocation,
    clearDeletedLocations
  };
};
