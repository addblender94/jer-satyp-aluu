export interface Guide {
  type: 'h' | 'v'
  pos: number // in %
}

interface SnapTarget {
  id: number
  x: number // Center X in %
  y: number // Center Y in %
  w: number // Width in %
  h: number // Height in %
}

export const useSmartGuides = () => {
  const getSnapPoints = (
    centerX: number, 
    centerY: number, 
    w: number, 
    h: number, 
    selectedId: number, 
    allElements: any[], 
    threshold: number = 0.8
  ) => {
    const horizontalGuides: Guide[] = []
    const verticalGuides: Guide[] = []
    
    let snappedCenterX = centerX
    let snappedCenterY = centerY

    // 1. Prepare targets (all centers and edges in %)
    const targets: SnapTarget[] = [
      { id: -1, x: 50, y: 50, w: 0, h: 0 }, // Map Center
      ...allElements.filter(el => el.id !== selectedId).map(el => {
        const ew = parseFloat(el.handleWidth || el.width || '0')
        const eh = parseFloat(el.handleHeight || el.height || '0')
        // In our system, x/y in LOCATIONS are usually centers if translated
        // Otherwise they are top-left. Let's assume they are CENTERS for this logic
        // as the user mentioned the Red Frame center.
        return {
          id: el.id,
          x: parseFloat(el.x),
          y: parseFloat(el.y),
          w: ew,
          h: eh
        }
      })
    ]

    // 2. Vertical Snapping (X Axis)
    // Points to check on our element: Left, Center, Right
    const myXPoints = {
      left: centerX - w / 2,
      center: centerX,
      right: centerX + w / 2
    }

    for (const target of targets) {
      const tXPoints = {
        left: target.id === -1 ? target.x : target.x - target.w / 2,
        center: target.x,
        right: target.id === -1 ? target.x : target.x + target.w / 2
      }

      // Check all combinations (Center-Center, Left-Left, Right-Right, etc.)
      for (const myPointKey of ['left', 'center', 'right'] as const) {
        for (const tPointKey of ['left', 'center', 'right'] as const) {
          const myPointValue = myXPoints[myPointKey]
          const tPointValue = tXPoints[tPointKey]

          if (Math.abs(myPointValue - tPointValue) < threshold) {
            // Apply offset to Center X
            if (myPointKey === 'left') snappedCenterX = tPointValue + w / 2
            if (myPointKey === 'center') snappedCenterX = tPointValue
            if (myPointKey === 'right') snappedCenterX = tPointValue - w / 2
            
            verticalGuides.push({ type: 'v', pos: tPointValue })
            break // Found a snap for this target
          }
        }
        if (verticalGuides.length > 0) break
      }
    }

    // 3. Horizontal Snapping (Y Axis)
    const myYPoints = {
      top: centerY - h / 2,
      center: centerY,
      bottom: centerY + h / 2
    }

    for (const target of targets) {
      const tYPoints = {
        top: target.id === -1 ? target.y : target.y - target.h / 2,
        center: target.y,
        bottom: target.id === -1 ? target.y : target.y + target.h / 2
      }

      for (const myPointKey of ['top', 'center', 'bottom'] as const) {
        for (const tPointKey of ['top', 'center', 'bottom'] as const) {
          const myPointValue = myYPoints[myPointKey]
          const tPointValue = tYPoints[tPointKey]

          if (Math.abs(myPointValue - tPointValue) < threshold) {
            if (myPointKey === 'top') snappedCenterY = tPointValue + h / 2
            if (myPointKey === 'center') snappedCenterY = tPointValue
            if (myPointKey === 'bottom') snappedCenterY = tPointValue - h / 2
            
            horizontalGuides.push({ type: 'h', pos: tPointValue })
            break
          }
        }
        if (horizontalGuides.length > 0) break
      }
    }

    return {
      snappedX: snappedCenterX,
      snappedY: snappedCenterY,
      guides: [...horizontalGuides, ...verticalGuides].slice(0, 4)
    }
  }

  return { getSnapPoints }
}
