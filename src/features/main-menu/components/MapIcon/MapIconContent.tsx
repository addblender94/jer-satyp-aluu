import Image from 'next/image'

interface MapIconContentProps {
  content?: string
  popupContent?: string
  displayImageUrl: string
  isFullLayer: boolean
  visualWidth: string
  visualHeight: string
  textAlign: 'left' | 'center' | 'right'
  textShadowBlur: number
  textShadowColor: string
  textShadowOpacity: number
  color: string
  isEditorMode: boolean
  isSelected: boolean
  isHovered: boolean
  id: number
  textBgColor?: string
  textBgOpacity?: number
}

export const MapIconContent: React.FC<MapIconContentProps> = ({
  content,
  popupContent,
  displayImageUrl,
  isFullLayer,
  visualWidth,
  visualHeight,
  textAlign,
  textShadowBlur,
  textShadowColor,
  textShadowOpacity,
  color,
  isEditorMode,
  isSelected,
  isHovered,
  id,
  textBgColor = 'rgba(0,0,0,0.5)',
  textBgOpacity = 0
}) => {
  if (content) {
    return (
      <div style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: textAlign === 'left' ? 'flex-start' : textAlign === 'right' ? 'flex-end' : 'center',
        textAlign: textAlign,
        textShadow: (() => {
          if (!isHovered) return 'none';
          // Inject alpha into color if it's hex or rgba
          let colorWithAlpha = textShadowColor;
          if (textShadowColor.startsWith('#')) {
             const r = parseInt(textShadowColor.slice(1, 3), 16);
             const g = parseInt(textShadowColor.slice(3, 5), 16);
             const b = parseInt(textShadowColor.slice(5, 7), 16);
             colorWithAlpha = `rgba(${r}, ${g}, ${b}, ${textShadowOpacity})`;
          } else if (textShadowColor.startsWith('rgba')) {
             colorWithAlpha = textShadowColor.replace(/[\d.]+\)$/g, `${textShadowOpacity})`);
          } else if (textShadowColor.startsWith('rgb')) {
             colorWithAlpha = textShadowColor.replace('rgb', 'rgba').replace(')', `, ${textShadowOpacity})`);
          }
          return `0 0 ${(textShadowBlur / 1920) * 100}cqi ${colorWithAlpha}`;
        })(),
        background: (() => {
          if (textBgOpacity <= 0) return (isEditorMode && isSelected) ? 'rgba(59, 130, 246, 0.1)' : 'transparent';
          
          let bgColorWithAlpha = textBgColor;
          if (textBgColor.startsWith('#')) {
             const r = parseInt(textBgColor.slice(1, 3), 16);
             const g = parseInt(textBgColor.slice(3, 5), 16);
             const b = parseInt(textBgColor.slice(5, 7), 16);
             bgColorWithAlpha = `rgba(${r}, ${g}, ${b}, ${textBgOpacity})`;
          } else if (textBgColor.startsWith('rgba')) {
             bgColorWithAlpha = textBgColor.replace(/[\d.]+\)$/g, `${textBgOpacity})`);
          } else if (textBgColor.startsWith('rgb')) {
             bgColorWithAlpha = textBgColor.replace('rgb', 'rgba').replace(')', `, ${textBgOpacity})`);
          }
          return bgColorWithAlpha;
        })(),
        borderRadius: `${(8 / 1920) * 100}cqi`,
        padding: `${(10 / 1920) * 100}cqi ${(20 / 1920) * 100}cqi`, // More padding for better look
      }}>
        {content}
      </div>
    )
  }

  if (displayImageUrl.toLowerCase().endsWith('.svg')) {
    return (
      <div 
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: color,
          maskImage: `url("${displayImageUrl}")`,
          maskSize: isFullLayer ? '100% 100%' : 'contain',
          maskRepeat: 'no-repeat',
          maskPosition: isFullLayer ? '0 0' : 'center',
          WebkitMaskImage: `url("${displayImageUrl}")`,
          WebkitMaskSize: isFullLayer ? '100% 100%' : 'contain',
          WebkitMaskRepeat: 'no-repeat',
          WebkitMaskPosition: isFullLayer ? '0 0' : 'center',
          filter: (() => {
            if (!isHovered || textShadowBlur <= 0) return 'none';
            let colorWithAlpha = textShadowColor;
            if (textShadowColor.startsWith('#')) {
               const r = parseInt(textShadowColor.slice(1, 3), 16);
               const g = parseInt(textShadowColor.slice(3, 5), 16);
               const b = parseInt(textShadowColor.slice(5, 7), 16);
               colorWithAlpha = `rgba(${r}, ${g}, ${b}, ${textShadowOpacity})`;
            } else if (textShadowColor.startsWith('rgba')) {
               colorWithAlpha = textShadowColor.replace(/[\d.]+\)$/g, `${textShadowOpacity})`);
            } else if (textShadowColor.startsWith('rgb')) {
               colorWithAlpha = textShadowColor.replace('rgb', 'rgba').replace(')', `, ${textShadowOpacity})`);
            }
            return `drop-shadow(0 0 ${(textShadowBlur / 1920) * 100}cqi ${colorWithAlpha})`;
          })(),
        }}
      />
    )
  }

  return (
    <div style={{
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      // Full layers must perfectly stretch to the exact dimensions of MapBackground the canvas adopted
      height: '100%',
    }}>
      <Image
        src={displayImageUrl}
        alt=""
        fill
        draggable={false}
        priority={isFullLayer} // Backgrounds should load first
        loading={isFullLayer ? undefined : 'lazy'} // Others load lazy
        sizes={isFullLayer ? '100vw' : '20vw'} // Hint for browser
        style={{
          objectFit: 'contain',
          objectPosition: isFullLayer ? '0 0' : 'center',
          filter: (() => {
            if (!isHovered) return 'none';
            let colorWithAlpha = textShadowColor;
            if (textShadowColor.startsWith('#')) {
               const r = parseInt(textShadowColor.slice(1, 3), 16);
               const g = parseInt(textShadowColor.slice(3, 5), 16);
               const b = parseInt(textShadowColor.slice(5, 7), 16);
               colorWithAlpha = `rgba(${r}, ${g}, ${b}, ${textShadowOpacity})`;
            } else if (textShadowColor.startsWith('rgba')) {
               colorWithAlpha = textShadowColor.replace(/[\d.]+\)$/g, `${textShadowOpacity})`);
            } else if (textShadowColor.startsWith('rgb')) {
               colorWithAlpha = textShadowColor.replace('rgb', 'rgba').replace(')', `, ${textShadowOpacity})`);
            }
            return `drop-shadow(0 0 ${(textShadowBlur / 1920) * 100}cqi ${colorWithAlpha})`;
          })(),
          transition: 'filter 0.3s ease'
        }}
      />
    </div>
  )
}

