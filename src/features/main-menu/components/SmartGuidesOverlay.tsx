import React, { useImperativeHandle, forwardRef, useRef } from 'react'

export interface SmartGuidesHandle {
  setGuides: (guides: { type: 'h' | 'v'; pos: number }[]) => void
  clear: () => void
}

export const SmartGuidesOverlay = forwardRef<SmartGuidesHandle>((_, ref) => {
  // Pre-create 4 lines (max usually needed: 1h, 1v per side, but we usually have 1 each)
  const lineRefs = useRef<(HTMLDivElement | null)[]>([])

  useImperativeHandle(ref, () => ({
    setGuides: (guides) => {
      // Hide all first
      lineRefs.current.forEach(line => { if (line) line.style.display = 'none' })
      
      guides.forEach((guide, i) => {
        const line = lineRefs.current[i]
        if (!line) return
        
        line.style.display = 'block'
        line.style.background = guide.type === 'v' ? '#3b82f6' : '#ec4899'
        line.style.boxShadow = `0 0 4px ${guide.type === 'v' ? 'rgba(59, 130, 246, 0.4)' : 'rgba(236, 72, 153, 0.4)'}`
        line.style.top = guide.type === 'h' ? `${guide.pos}%` : '0'
        line.style.left = guide.type === 'v' ? `${guide.pos}%` : '0'
        line.style.width = guide.type === 'v' ? '1px' : '100%'
        line.style.height = guide.type === 'h' ? '1px' : '100%'
      })
    },
    clear: () => {
      lineRefs.current.forEach(line => { if (line) line.style.display = 'none' })
    }
  }))

  return (
    <div 
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 100,
      }}
    >
      {[0, 1, 2, 3].map(i => (
        <div 
          key={i}
          ref={el => { lineRefs.current[i] = el }}
          style={{ position: 'absolute', display: 'none', opacity: 0.7 }}
        />
      ))}
    </div>
  )
})

SmartGuidesOverlay.displayName = 'SmartGuidesOverlay'
