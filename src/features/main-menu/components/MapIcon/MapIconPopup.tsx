import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface MapIconPopupProps {
  id: number;
  isOpen: boolean;
  content: string;
  x: string;
  y: string;
  width: string;
  height: string;
  isEditorMode: boolean;
  isSelected: boolean;
  editTarget: 'element' | 'hitbox' | 'visual' | 'background' | 'popup';
  onClose?: () => void;
  onChange?: (val: string) => void;
  onFocus?: () => void;
  onSilentSave?: (val: string) => void;
  style?: React.CSSProperties;
  popupBgColor?: string;
  popupBgOpacity?: number;
  popupTextColor?: string;
  popupHeaderColor?: string;
  isMobileView?: boolean;
}

export const MapIconPopup: React.FC<MapIconPopupProps> = ({
  id,
  isOpen,
  content,
  x,
  y,
  width,
  height,
  isEditorMode,
  isSelected,
  editTarget,
  onClose,
  onChange,
  onFocus,
  onSilentSave,
  style,
  popupBgColor = '#0f172a',
  popupBgOpacity = 0.95,
  popupTextColor = '#ffffff',
  popupHeaderColor = '#0f172a',
  isMobileView = false
}) => {
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  const isPopupTarget = isEditorMode && isSelected && editTarget === 'popup';
  const popupRef = React.useRef<HTMLDivElement>(null);

  // MANUAL DOM POSITIONING (To prevent juddering during drag)
  React.useLayoutEffect(() => {
    if (popupRef.current && !popupRef.current.hasAttribute('data-is-dragging')) {
      popupRef.current.style.left = x;
      popupRef.current.style.top = y;
    }
  }, [x, y]);

  // CONTENT HANDLING
  const [localContent, setLocalContent] = React.useState(content);

  // Sync with incoming content (e.g. from editor)
  React.useEffect(() => {
    setLocalContent(content);
  }, [content]);

  const [isSaving, setIsSaving] = React.useState(false);
  const [isDirty, setIsDirty] = React.useState(false);

  const handleBlur = async () => {
    // If dirty, or content actually differs (fallback)
    const trulyDirty = isDirty || (localContent !== content);
    
    if (trulyDirty && !isSaving) {
      console.log(`[MapIconPopup] Starting silent save for element ${id}...`);
      setIsSaving(true);
      setIsDirty(false); // Reset immediately to prevent multiple triggers
      try {
        await onSilentSave?.(localContent);
        console.log(`[MapIconPopup] Silent save successful for ${id}.`);
      } catch (err) {
        console.error(`[MapIconPopup] Silent save FAILED for ${id}:`, err);
        setIsDirty(true); // Restore if failed
      } finally {
        setIsSaving(false);
      }
    } else {
      console.log(`[MapIconPopup] handleBlur skipped. Dirty: ${trulyDirty}, Saving: ${isSaving}`);
    }
  };

  const handleClose = async () => {
    const trulyDirty = isDirty || (localContent !== content);
    if (trulyDirty && !isSaving) {
      console.log(`[MapIconPopup] Save on close for element ${id}...`);
      setIsSaving(true);
      setIsDirty(false);
      try {
        await onSilentSave?.(localContent);
      } finally {
        setIsSaving(false);
      }
    }
    onClose?.();
  };

  const handleContainerClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Stop bubbling to MapIcon
    if (!isEditorMode) {
      textareaRef.current?.focus();
    }
  };

  // 🔴 EDITOR MODE: Жөнөкөй div — framer-motion'сыз. Manual DOM sync'ке тоскоол болбойт.
  if (isEditorMode) {
    if (!isEditorMode) return null; // Never reached, but satisfies TS
    return (
      <div
        ref={popupRef}
        data-popup-frame-id={id}
        onClick={handleContainerClick}
        style={{
          position: 'absolute',
          left: x,
          top: y,
          width: width,
          height: height,
          background: (() => {
            let base = popupBgColor;
            if (base.startsWith('#')) {
              const r = parseInt(base.slice(1, 3), 16);
              const g = parseInt(base.slice(3, 5), 16);
              const b = parseInt(base.slice(5, 7), 16);
              return `rgba(${r}, ${g}, ${b}, ${popupBgOpacity})`;
            }
            if (base.startsWith('rgba')) {
              return base.replace(/[\d.]+\)$/g, `${popupBgOpacity})`);
            }
            if (base.startsWith('rgb')) {
              return base.replace('rgb', 'rgba').replace(')', `, ${popupBgOpacity})`);
            }
            return base;
          })(),
          backdropFilter: 'blur(12px)',
          border: isPopupTarget ? '2px solid #facc15' : '1px solid rgba(251, 191, 36, 0.3)',
          borderRadius: '12px',
          padding: 0,
          color: popupTextColor,
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.5)',
          zIndex: 998,
          opacity: isPopupTarget ? 1 : 0.4,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          pointerEvents: isPopupTarget ? 'auto' : 'none',
          cursor: 'move',
        }}
      >
        {/* Header */}
        <div style={{ 
          position: 'absolute', top: 0, left: 0, right: 0, height: '40px', padding: '0 16px',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 10,
          background: (() => {
            let base = popupHeaderColor;
            if (base.startsWith('#')) {
              const r = parseInt(base.slice(1, 3), 16);
              const g = parseInt(base.slice(3, 5), 16);
              const b = parseInt(base.slice(5, 7), 16);
              return `linear-gradient(to bottom, rgba(${r}, ${g}, ${b}, 0.8), transparent)`;
            }
            return `linear-gradient(to bottom, ${base}, transparent)`;
          })(),
        }}>
          <span style={{ fontSize: '10px', fontWeight: 'bold', color: '#facc15', opacity: 0.6, userSelect: 'none' }}>
            POPUP CONTENT
          </span>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={(e) => { e.stopPropagation(); handleBlur(); }}
              disabled={isSaving}
              style={{
                background: isSaving ? 'rgba(34, 197, 94, 0.6)' : (localContent !== content ? 'rgba(34, 197, 94, 0.5)' : 'rgba(255, 255, 255, 0.15)'),
                border: 'none', borderRadius: '50%', width: '32px', height: '32px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: isSaving ? 'default' : 'pointer',
                color: isSaving ? 'white' : (localContent !== content ? '#4ade80' : 'rgba(255, 255, 255, 0.6)'),
                fontSize: '18px', fontWeight: 'bold', pointerEvents: 'auto'
              }}
            >
              {isSaving ? '⟳' : '✓'}
            </button>
          </div>
        </div>
        <textarea
          ref={textareaRef}
          value={localContent}
          readOnly={true}
          onMouseDown={(e) => { /* Allow bubble for drag */ }}
          style={{
            width: '100%', height: '100%', background: 'transparent', border: 'none',
            color: popupTextColor, fontSize: '15px', lineHeight: '1.6', resize: 'none', outline: 'none',
            padding: '16px', paddingTop: '40px', fontFamily: 'inherit',
            scrollbarWidth: 'thin', scrollbarColor: 'rgba(250, 204, 21, 0.5) transparent',
            pointerEvents: 'none', cursor: 'move'
          }}
          placeholder=""
        />
        {isPopupTarget && (
          <div style={{
            position: 'absolute', bottom: '4px', right: '4px', width: '12px', height: '12px',
            borderRight: '2px solid #facc15', borderBottom: '2px solid #facc15',
            borderBottomRightRadius: '2px', opacity: 0.7
          }} />
        )}
      </div>
    );
  }

  // 🟢 VIEW MODE: Framer-motion анимациясы менен кооз popup
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={popupRef}
          data-popup-frame-id={id}
          initial={{ opacity: 0, scale: 0.9, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 10 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          onClick={handleContainerClick}
          onMouseDown={(e) => e.stopPropagation()}
          onMouseUp={(e) => e.stopPropagation()}
          onMouseEnter={(e) => e.stopPropagation()}
          onMouseLeave={(e) => e.stopPropagation()}
          onMouseMove={(e) => e.stopPropagation()}
          style={{
            position: 'absolute',
            left: x,
            top: y,
            width: width,
            maxWidth: isMobileView ? '90%' : 'none',
            height: height,
            background: (() => {
              let base = popupBgColor;
              if (base.startsWith('#')) {
                const r = parseInt(base.slice(1, 3), 16);
                const g = parseInt(base.slice(3, 5), 16);
                const b = parseInt(base.slice(5, 7), 16);
                return `rgba(${r}, ${g}, ${b}, ${popupBgOpacity})`;
              }
              if (base.startsWith('rgba')) {
                return base.replace(/[\d.]+\)$/g, `${popupBgOpacity})`);
              }
              if (base.startsWith('rgb')) {
                return base.replace('rgb', 'rgba').replace(')', `, ${popupBgOpacity})`);
              }
              return base;
            })(),
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(251, 191, 36, 0.3)',
            borderRadius: '12px',
            padding: 0,
            color: popupTextColor,
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.5)',
            zIndex: 999,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            cursor: 'text',
          }}
        >
          {/* Header/Close Button */}
          {(
            <div style={{ 
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '40px',
              padding: '0 16px',
              display: 'flex', 
              justifyContent: 'space-between',
              alignItems: 'center',
              zIndex: 10,
              background: (() => {
                let base = popupHeaderColor;
                if (base.startsWith('#')) {
                  const r = parseInt(base.slice(1, 3), 16);
                  const g = parseInt(base.slice(3, 5), 16);
                  const b = parseInt(base.slice(5, 7), 16);
                  return `linear-gradient(to bottom, rgba(${r}, ${g}, ${b}, 0.8), transparent)`;
                }
                return `linear-gradient(to bottom, ${base}, transparent)`;
              })(),
            }}>
              <span style={{ fontSize: '10px', fontWeight: 'bold', color: '#facc15', opacity: 0.6, userSelect: 'none' }}>
                {isEditorMode ? 'POPUP CONTENT' : 'ЖАЗУУ'}
              </span>
              <div style={{ display: 'flex', gap: '8px' }}>
                {/* Save Button */}
                <motion.button 
                  whileTap={{ scale: 0.9 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleBlur();
                  }}
                  disabled={isSaving}
                  title="Сактоо"
                  style={{
                    background: isSaving 
                      ? 'rgba(34, 197, 94, 0.6)' 
                      : (localContent !== content ? 'rgba(34, 197, 94, 0.5)' : 'rgba(255, 255, 255, 0.15)'),
                    border: 'none',
                    borderRadius: '50%',
                    width: '32px', // Slightly larger hit area
                    height: '32px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: isSaving ? 'default' : 'pointer',
                    color: isSaving ? 'white' : (localContent !== content ? '#4ade80' : 'rgba(255, 255, 255, 0.6)'),
                    fontSize: '18px',
                    fontWeight: 'bold',
                    transition: 'all 0.2s',
                    position: 'relative',
                    pointerEvents: 'auto'
                  }}
                  onMouseEnter={(e) => {
                    if (!isSaving) {
                      e.currentTarget.style.background = localContent !== content ? 'rgba(34, 197, 94, 0.7)' : 'rgba(255, 255, 255, 0.25)';
                      e.currentTarget.style.color = '#4ade80';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isSaving) {
                      e.currentTarget.style.background = localContent !== content ? 'rgba(34, 197, 94, 0.5)' : 'rgba(255, 255, 255, 0.15)';
                      e.currentTarget.style.color = localContent !== content ? '#4ade80' : 'rgba(255, 255, 255, 0.6)';
                    }
                  }}
                >
                  {isSaving ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      style={{ width: '14px', height: '14px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%' }}
                    />
                  ) : '✓'}
                </motion.button>
                {/* Close Button */}
                <motion.button 
                  whileTap={{ scale: 0.9 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleClose();
                  }}
                  style={{
                    background: 'rgba(255, 255, 255, 0.15)',
                    border: 'none',
                    borderRadius: '50%',
                    width: '32px',
                    height: '32px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    color: 'white',
                    fontSize: '14px',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(239, 68, 68, 0.5)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)')}
                >
                  ✕
                </motion.button>
              </div>
            </div>
          )}

          {/* Content Area */}
          <textarea
            ref={textareaRef}
            value={localContent}
            readOnly={isEditorMode}
            onFocus={() => {
              if (!isEditorMode) onFocus?.();
            }}
            onBlur={handleBlur}
            onChange={(e) => {
              if (isEditorMode) return;
              const val = e.target.value;
              setLocalContent(val);
              setIsDirty(true);
              onChange?.(val);
            }}
            onMouseDown={(e) => {
              if (isEditorMode) return; // Allow bubbling to container for drag in editor mode
              e.stopPropagation();
            }}
            onClick={(e) => {
              if (isEditorMode) return;
              e.stopPropagation();
            }}
            style={{
              width: '100%',
              height: '100%',
              background: 'transparent',
              border: 'none',
              color: popupTextColor,
              fontSize: '15px',
              lineHeight: '1.6',
              resize: 'none',
              outline: 'none',
              padding: '16px',
              paddingTop: '40px', // Space for the header
              fontFamily: 'inherit',
              scrollbarWidth: 'thin',
              scrollbarColor: 'rgba(250, 204, 21, 0.5) transparent',
              pointerEvents: isEditorMode ? 'none' : 'auto',
              cursor: isEditorMode ? 'move' : 'text'
            }}
            placeholder={isEditorMode ? "" : "Бул жерге текст жазыңыз..."}
          />

          {/* Resize Indicator (only in Editor mode for popup target) */}
          {isPopupTarget && (
            <div style={{
              position: 'absolute',
              bottom: '4px',
              right: '4px',
              width: '12px',
              height: '12px',
              borderRight: '2px solid #facc15',
              borderBottom: '2px solid #facc15',
              borderBottomRightRadius: '2px',
              opacity: 0.7
            }} />
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};
