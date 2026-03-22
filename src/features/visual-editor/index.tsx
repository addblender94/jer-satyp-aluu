import React, { useState } from 'react'
import dynamic from 'next/dynamic'
import { EditorProvider, useEditor } from './context/EditorContext'

// Dynamically import the heavy Toolbar
const Toolbar = dynamic(() => import('./toolbar/Toolbar').then(m => m.Toolbar), {
  ssr: false,
})

const EditorOverlay: React.FC = () => {
  const { isEditorMode, isCollapsed } = useEditor()
  // Even if not in Editor Mode, we need the Palette icon (which is inside Toolbar)
  // But wait, if we want TRUE code splitting, we should render nothing until a key combo or secret is hit?
  // For now, let's just let Next.js split it.
  return <Toolbar />
}

export const VisualEditor: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <EditorProvider>
      {children}
      <EditorOverlay />
    </EditorProvider>
  )
}

export { useEditor } from './context/EditorContext'
export type { EditTarget } from './context/EditorContext'
