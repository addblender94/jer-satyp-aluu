'use client'

import { MainMenuView } from '../features/main-menu/MainMenuView'
import { VisualEditor } from '../features/visual-editor'

export default function Home() {
  return (
    <VisualEditor>
      <MainMenuView />
    </VisualEditor>
  )
}

