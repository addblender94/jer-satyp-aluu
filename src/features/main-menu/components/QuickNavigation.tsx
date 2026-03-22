import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useEditor } from '../../visual-editor'
import { QuickLink } from '../types'

export const QuickNavigation: React.FC = () => {
  const { 
    tempQuickLinks, 
    isMobileView: isEditorMobileMode, 
    switchScene,
    isEditorMode
  } = useEditor()

  const [windowWidth, setWindowWidth] = React.useState(1200)
  const [isClient, setIsClient] = React.useState(false)
  const [hoveredId, setHoveredId] = React.useState<number | null>(null)

  React.useEffect(() => {
    setIsClient(true)
    setWindowWidth(window.innerWidth)
    const handleResize = () => setWindowWidth(window.innerWidth)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  if (!isClient) return null

  // ТУРУУЧУ АБАЛ: Редактордогу кнопка же экрандын чыныгы өлчөмү
  const isMobile = isEditorMobileMode || windowWidth < 768
  const isNarrow = windowWidth < 1150 // Бул өлчөмдө иконкалар гана калат (жыйрылган абал)

  if (tempQuickLinks.length === 0 && !isEditorMode) return null

  const handleLinkClick = (link: QuickLink) => {
    if (link.targetSceneId) {
      switchScene(link.targetSceneId)
    } else if (link.externalUrl) {
      window.open(link.externalUrl, '_blank')
    }
  }

  // Мобилдик версияда тизме (Vertical List)
  if (isMobile) {
    return (
      <div 
        id="quick-nav-mobile"
        style={{
          padding: '1rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.6rem',
          background: 'transparent',
          zIndex: 1000,
          position: isEditorMode ? 'relative' : 'fixed',
          bottom: isEditorMode ? 'auto' : '0',
          left: isEditorMode ? 'auto' : '0',
          right: isEditorMode ? 'auto' : '0',
          paddingBottom: isEditorMode ? '1rem' : 'calc(1rem + env(safe-area-inset-bottom))'
        }}
      >
        {tempQuickLinks.map((link) => {
          // Convert bgColor HEX to RGBA with custom opacity
          const hexToRgba = (hex: string, alpha: number) => {
            const h = hex.replace('#', '');
            if (h.length === 3) {
              const r = parseInt(h[0]+h[0], 16);
              const g = parseInt(h[1]+h[1], 16);
              const b = parseInt(h[2]+h[2], 16);
              return `rgba(${Number.isNaN(r)?15:r}, ${Number.isNaN(g)?23:g}, ${Number.isNaN(b)?42:b}, ${alpha})`;
            }
            const r = parseInt(h.substring(0, 2), 16);
            const g = parseInt(h.substring(2, 4), 16);
            const b = parseInt(h.substring(4, 6), 16);
            return `rgba(${Number.isNaN(r)?15:r}, ${Number.isNaN(g)?23:g}, ${Number.isNaN(b)?42:b}, ${alpha})`;
          };
          const linkBgColor = hexToRgba(link.bgColor || '#1e293b', link.bgOpacity ?? 0.7);
          const linkHoverBgColor = hexToRgba(link.bgColor || '#1e293b', Math.min((link.bgOpacity ?? 0.7) + 0.2, 1));
          
          return (
            <motion.button
              key={link.id}
              whileHover={{ scale: 1.02, backgroundColor: linkHoverBgColor }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleLinkClick(link)}
              style={{
                width: '100%',
                padding: '0.8rem 1.2rem',
                borderRadius: '1rem',
                background: linkBgColor,
                border: '1px solid rgba(212, 175, 55, 0.3)',
                color: link.textColor || '#d4af37',
                fontFamily: link.fontFamily || 'Inter',
                fontSize: link.fontSize || '1.1rem',
                fontWeight: 'bold',
                textAlign: 'left',
                display: 'flex',
                alignItems: 'center',
                gap: '1.2rem',
                cursor: 'pointer',
                boxShadow: '0 8px 20px rgba(0,0,0,0.4)',
              }}
            >
              <span style={{ 
                width: '36px', height: '36px', 
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'rgba(255, 255, 255, 0.1)', borderRadius: '50%',
                fontSize: link.iconSize || '1.3rem',
                flexShrink: 0
              }}>
                {link.icon || '📍'}
              </span>
              {link.label}
            </motion.button>
          )
        })}
        {isEditorMode && tempQuickLinks.length === 0 && (
          <div style={{ color: 'rgba(212,175,55,0.5)', textAlign: 'center', padding: '1rem', border: '1px dashed' }}>
            Навигация баскычтарын кошуңуз
          </div>
        )}
      </div>
    )
  }

  // Десктоп версияда "Smart Transformation" (Floating Icons)
  return (
    <div 
      id="quick-nav-desktop"
      style={{
        position: 'fixed',
        bottom: '3rem',
        right: '2.5rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        gap: '1rem',
        zIndex: 1000,
      }}
    >
      {tempQuickLinks.map((link) => {
        const isHovered = hoveredId === link.id && !isNarrow;
        
        const hexToRgba = (hex: string, alpha: number) => {
          const h = hex.replace('#', '');
          if (h.length === 3) {
            const r = parseInt(h[0]+h[0], 16);
            const g = parseInt(h[1]+h[1], 16);
            const b = parseInt(h[2]+h[2], 16);
            return `rgba(${Number.isNaN(r)?15:r}, ${Number.isNaN(g)?23:g}, ${Number.isNaN(b)?42:b}, ${alpha})`;
          }
          const r = parseInt(h.substring(0, 2), 16);
          const g = parseInt(h.substring(2, 4), 16);
          const b = parseInt(h.substring(4, 6), 16);
          return `rgba(${Number.isNaN(r)?15:r}, ${Number.isNaN(g)?23:g}, ${Number.isNaN(b)?42:b}, ${alpha})`;
        };
        const linkBgColor = hexToRgba(link.bgColor || '#0f172a', link.bgOpacity ?? 0.96);
        
        return (
          <motion.div
            key={link.id}
            onMouseEnter={() => setHoveredId(link.id)}
            onMouseLeave={() => setHoveredId(null)}
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              alignItems: 'center',
              height: '56px',
              minWidth: '56px',
              position: 'relative',
              cursor: 'pointer',
              zIndex: isHovered ? 1001 : 1000,
            }}
          >
            <motion.button
              layout
              onClick={() => handleLinkClick(link)}
              style={{
                position: 'relative',
                height: '56px',
                borderRadius: '28px',
                background: linkBgColor,
                border: '2px solid rgba(212, 175, 55, 1)',
                borderColor: isHovered ? 'rgba(212, 175, 55, 1)' : 'rgba(212, 175, 55, 0.4)',
                color: link.textColor || '#fff',
                fontFamily: link.fontFamily || 'Inter',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                boxShadow: isHovered ? '0 15px 45px rgba(0,0,0,0.7)' : '0 12px 40px rgba(0,0,0,0.6)',
                backdropFilter: 'blur(15px)',
                overflow: 'hidden',
                whiteSpace: 'nowrap',
                transformOrigin: 'right center',
                pointerEvents: 'auto',
              }}
              initial={{ scale: link.scale ?? 1 }}
              animate={{
                scale: isHovered ? (link.scale ?? 1) * 1.05 : (link.scale ?? 1),
              }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            >
              {/* Label — appears to the left of icon */}
              <AnimatePresence mode="popLayout">
                {isHovered && (
                  <motion.span
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    transition={{ duration: 0.2 }}
                    style={{ 
                      fontSize: link.fontSize || '1rem', 
                      fontWeight: 700,
                      color: link.textColor || '#d4af37',
                      overflow: 'hidden',
                      paddingLeft: '24px',
                      marginRight: '-4px'
                    }}
                  >
                    {link.label}
                  </motion.span>
                )}
              </AnimatePresence>

              {/* Icon — always on the right, fixed */}
              <span style={{ 
                fontSize: link.iconSize || '1.6rem', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                width: '56px',
                height: '56px',
                flexShrink: 0,
                color: link.textColor || '#fff',
              }}>
                {link.icon || '📍'}
              </span>
            </motion.button>
          </motion.div>
        )
      })}
    </div>
  )
}
