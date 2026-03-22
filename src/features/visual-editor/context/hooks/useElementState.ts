import { useState } from 'react';

export const useElementState = () => {
  const [tempPositions, setTempPositions] = useState<Record<number, { x: string; y: string }>>({});
  const [tempSizes, setTempSizes] = useState<Record<number, { width: string; height: string }>>({});
  const [tempVisuals, setTempVisuals] = useState<Record<number, { x: string; y: string }>>({});
  const [tempHandles, setTempHandles] = useState<Record<number, { x: string; y: string }>>({});
  const [tempHidden, setTempHidden] = useState<Record<number, boolean>>({});
  const [tempContents, setTempContents] = useState<Record<number, string>>({});
  const [tempPopupContents, setTempPopupContents] = useState<Record<number, string>>({});
  const [tempNames, setTempNames] = useState<Record<number, string>>({});
  const [tempInteractionTypes, setTempInteractionTypes] = useState<Record<number, 'none' | 'modal' | 'link' | 'popup'>>({});
  const [tempLinks, setTempLinks] = useState<Record<number, string>>({});
  const [tempAnimations, setTempAnimations] = useState<Record<number, { speed?: number; amplitude?: number; noise?: number }>>({});
  const [tempHoverOffsetsX, setTempHoverOffsetsX] = useState<Record<number, number>>({});
  const [tempHoverOffsetsY, setTempHoverOffsetsY] = useState<Record<number, number>>({});
  const [tempParentIds, setTempParentIds] = useState<Record<number, number | null>>({});
  const [tempStickyLags, setTempStickyLags] = useState<Record<number, number>>({});
  const [tempImageUrls, setTempImageUrls] = useState<Record<number, string>>({});
  const [tempScales, setTempScales] = useState<Record<number, number>>({});
  const [tempHandleSizes, setTempHandleSizes] = useState<Record<number, { width: string; height: string }>>({});
  const [tempTextSizes, setTempTextSizes] = useState<Record<number, { width: string; height: string }>>({});
  const [tempPopupPositions, setTempPopupPositions] = useState<Record<number, { x: string; y: string }>>({});
  const [tempPopupSizes, setTempPopupSizes] = useState<Record<number, { width: string; height: string }>>({});
  const [tempSectionIds, setTempSectionIds] = useState<Record<number, number>>({});
  const [tempTargetSceneIds, setTempTargetSceneIds] = useState<Record<number, string | null>>({});
  const [tempStyles, setTempStyles] = useState<Record<number, { 
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
  }>>({});

  const updateTempPosition = (id: number, x: string, y: string) => {
    setTempPositions((prev) => ({ ...prev, [id]: { x, y } }));
  };

  const updateTempSize = (id: number, width: string, height: string) => {
    setTempSizes((prev) => ({ ...prev, [id]: { width, height } }));
  };

  const updateTempVisual = (id: number, x: string, y: string) => {
    setTempVisuals((prev) => ({ ...prev, [id]: { x, y } }));
  };

  const updateTempHandle = (id: number, x: string, y: string) => {
    setTempHandles((prev) => ({ ...prev, [id]: { x, y } }));
  };

  const updateTempHandleSize = (id: number, width: string, height: string) => {
    setTempHandleSizes((prev) => ({ ...prev, [id]: { width, height } }));
  };

  const updateTempTextSize = (id: number, width: string, height: string) => {
    setTempTextSizes((prev) => ({ ...prev, [id]: { width, height } }));
  };
  
  const updateTempPopupPosition = (id: number, x: string, y: string) => {
    setTempPopupPositions((prev) => ({ ...prev, [id]: { x, y } }));
  };

  const updateTempPopupSize = (id: number, width: string, height: string) => {
    setTempPopupSizes((prev) => ({ ...prev, [id]: { width, height } }));
  };

  const toggleTempHidden = (id: number, pushHistory: () => void) => {
    pushHistory(); 
    setTempHidden((prev) => {
      const current = prev[id];
      return {
        ...prev,
        [id]: current === undefined ? true : !current
      };
    });
  };

  const updateTempStyle = (id: number, styleUpdate: Partial<{ opacity: number, fontFamily: string, fontSize: string, fontWeight: string, color: string, textAlign: 'left' | 'center' | 'right', textShadowColor: string, textShadowBlur: number, textShadowOpacity: number, textBgColor: string, textBgOpacity: number, popupBgColor: string, popupBgOpacity: number, popupTextColor: string, popupHeaderColor: string }>) => {
    setTempStyles((prev) => ({
      ...prev,
      [id]: { ...(prev[id] || {}), ...styleUpdate },
    }));
  };

  const updateTempContent = (id: number, content: string) => {
    setTempContents((prev) => ({ ...prev, [id]: content }));
  };

  const updateTempPopupContent = (id: number, content: string) => {
    setTempPopupContents((prev) => ({ ...prev, [id]: content }));
  };

  const updateTempName = (id: number, name: string) => {
    setTempNames((prev) => ({ ...prev, [id]: name }));
  };

  const updateTempSectionId = (id: number, sectionId: number) => {
    setTempSectionIds(prev => ({ ...prev, [id]: sectionId }));
  };

  const updateTempStickyLag = (id: number, lag: number) => {
    setTempStickyLags(prev => ({ ...prev, [id]: lag }));
  };

  const updateTempParentId = (id: number, parentId: number | null) => {
    setTempParentIds(prev => ({ ...prev, [id]: parentId }));
  };

  const updateTempInteractionType = (id: number, type: 'none' | 'modal' | 'link' | 'popup') => {
    setTempInteractionTypes((prev) => ({ ...prev, [id]: type }));
  };

  const updateTempLink = (id: number, link: string) => {
    setTempLinks((prev) => ({ ...prev, [id]: link }));
  };

  const updateTempAnimation = (id: number, animUpdate: Partial<{ speed: number; amplitude: number; noise: number }>) => {
    setTempAnimations((prev) => ({
      ...prev,
      [id]: { ...(prev[id] || {}), ...animUpdate },
    }));
  };

  const updateTempImageUrl = (id: number, url: string, committedLocations: any[], addedLocations: any[]) => {
    // Auto-Reset logic: when image changes, reset handles to hitbox center
    // This prevents animation "drifting" when switching to a new asset
    const all = [...committedLocations, ...addedLocations]
    const loc = all.find(l => l.id === id)
    
    if (loc) {
      const centerX = tempPositions[id]?.x ?? loc.x
      const centerY = tempPositions[id]?.y ?? loc.y

      // Reset handle to hitbox anchor (Top-left of the original hitbox)
      // This keeps the animation root at the point where the frames are
      setTempHandles(prev => ({ ...prev, [id]: { x: centerX, y: centerY } }))

      // Reset visual offset to 0.00% regardless of type.
      // This aligns the image top-left with the hitbox top-left for 1:1 predictability.
      setTempVisuals(prev => ({ 
        ...prev, 
        [id]: { x: '0.00%', y: '0.00%' } 
      }))
    }

    setTempImageUrls((prev) => ({ ...prev, [id]: url }));
  };

  const updateTempScale = (id: number, scale: number) => {
    setTempScales((prev) => ({ ...prev, [id]: scale }));
  };

  const updateTempTargetSceneId = (id: number, sceneId: string | null) => {
    setTempTargetSceneIds((prev) => ({ ...prev, [id]: sceneId }));
  };

  const updateTempHoverOffsetX = (id: number, offset: number) => {
    setTempHoverOffsetsX((prev) => ({ ...prev, [id]: offset }));
  };

  const updateTempHoverOffsetY = (id: number, offset: number) => {
    setTempHoverOffsetsY((prev) => ({ ...prev, [id]: offset }));
  };

  return {
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
    tempPopupPositions, setTempPopupPositions, updateTempPopupPosition,
    tempPopupSizes, setTempPopupSizes, updateTempPopupSize,
    tempSectionIds, setTempSectionIds, updateTempSectionId,
    tempStyles, setTempStyles, updateTempStyle,
    tempTargetSceneIds, setTempTargetSceneIds, updateTempTargetSceneId
  };
};
