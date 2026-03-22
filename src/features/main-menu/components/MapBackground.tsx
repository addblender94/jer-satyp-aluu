import Image from 'next/image'
import { useEditor } from '../../visual-editor'

interface MapBackgroundProps {
  section: {
    id: number
    url: string
    opacity: number
  }
}

export const MapBackground: React.FC<MapBackgroundProps> = ({ section }) => {
  const { sceneManager } = useEditor()
  const assetFolder = sceneManager.activeScene?.assetFolder || 'main_menu'
  
  // Ensure the URL exists and is correctly formatted
  let bgUrl = section.url || 'fon.png'
  
  // If the URL is just a filename (no slash and not a protocol), prefix with the assets directory
  if (bgUrl && !bgUrl.startsWith('/') && !bgUrl.startsWith('http')) {
    bgUrl = `/assets/${assetFolder}/${bgUrl}`
  }
  
  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <Image
        src={bgUrl}
        alt=""
        width={0}
        height={0}
        sizes="100vw"
        draggable={false}
        priority={section.id === 1} // First section loads first
        loading={section.id === 1 ? undefined : 'lazy'}
        style={{
          width: '100%',
          height: 'auto',
          display: 'block',
          pointerEvents: 'none',
          opacity: section.opacity,
          transition: 'opacity 0.3s ease, filter 0.3s ease',
        }}
      />
    </div>
  )
}
