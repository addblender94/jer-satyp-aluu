import { useState } from 'react';
import { ToolMode, EditorTab, EditTarget, GridSnap } from '../types';

export const useEditorUI = () => {
  const [isEditorMode, setIsEditorMode] = useState(false);
  const [activeTool, setActiveTool] = useState<ToolMode>(null);
  const [activeTab, setActiveTab] = useState<EditorTab>('transform');
  const [editTarget, setEditTarget] = useState<EditTarget>('hitbox');
  const [gridSnap, setGridSnap] = useState<GridSnap>(null);
  const [toolbarPos, setToolbarPos] = useState({ x: 100, y: 100 });
  const [activeLayersMode, setActiveLayersMode] = useState<'elements' | 'sections'>('elements');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeAnimTab, setActiveAnimTab] = useState<'idle' | 'hover'>('idle');
  const [isPreviewingIdle, setIsPreviewingIdle] = useState(false);
  const [isMobileView, setIsMobileView] = useState(false);

  return {
    isEditorMode,
    setIsEditorMode,
    activeTool,
    setActiveTool,
    activeTab,
    setActiveTab,
    editTarget,
    setEditTarget,
    gridSnap,
    setGridSnap,
    toolbarPos,
    setToolbarPos,
    activeLayersMode,
    setActiveLayersMode,
    isCollapsed,
    setIsCollapsed,
    activeAnimTab,
    setActiveAnimTab,
    isPreviewingIdle,
    setIsPreviewingIdle,
    isMobileView,
    setIsMobileView
  };
};
