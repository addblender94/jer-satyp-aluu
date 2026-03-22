import React, { useRef } from 'react'
import { useInView } from '../../visual-editor/hooks/useInView'
import { MapBackground } from './MapBackground'
import { SceneSection } from '../../visual-editor/context/types'
import { useEditor } from '../../visual-editor'

interface VirtualSectionProps {
  section: SceneSection
  children: React.ReactNode
}

export const VirtualSection: React.FC<VirtualSectionProps> = ({ section, children }) => {
  const { scrollRef } = useEditor()
  const sectionRef = useRef<HTMLDivElement>(null)
  const isInView = useInView(sectionRef, { root: scrollRef, rootMargin: '800px' })

  return (
    <div 
      ref={sectionRef}
      id={`section-${section.id}`}
      style={{ 
        width: '100%', 
        minHeight: 'auto',
        height: 'auto', 
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}
    >
      {/* Background for this section */}
      <MapBackground section={section} />

      {/* Elements scoped to this section's relative space - only render if in view */}
      {isInView && (
        <div className="section-elements-layer" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}>
          {children}
        </div>
      )}
      
      {/* 
          Optimization Hint: 
          If isInView is false, we don't render children (MapIcons). 
          The MapBackground itself should also eventually be virtualized if they are massive images,
          but for now, unmounting the Icons (DOM-heavy) is the priority.
      */}
    </div>
  )
}
