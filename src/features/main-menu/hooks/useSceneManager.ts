import { useState, useEffect, useCallback } from 'react';

export interface SceneSummary {
  id: string;
  name: string;
  assetFolder: string;
  elementCount: number;
  groupId?: string;
}

export interface SceneGroup {
  id: string;
  name: string;
  color: string;
  isCollapsed: boolean;
}

export interface SceneData {
  id: string;
  name: string;
  assetFolder: string;
  sections: { id: number; url: string; opacity: number }[];
  locations: any[];
  quickLinks?: any[];
  groupId?: string;
  bgGradientStart?: string;
  bgGradientEnd?: string;
  headerTitle?: string;
  headerFontFamily?: string;
  headerFontSize?: string;
  headerColor?: string;
}

export function useSceneManager() {
  const [scenes, setScenes] = useState<SceneSummary[]>([]);
  const [activeSceneId, setActiveSceneId] = useState<string>('main');
  const [activeScene, setActiveScene] = useState<SceneData | null>(null);
  const [sceneGroups, setSceneGroups] = useState<SceneGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load all scenes on mount
  const fetchScenes = useCallback(async () => {
    try {
      const res = await fetch('/api/editor/scenes');
      if (res.ok) {
        const data = await res.json();
        setScenes(data.scenes || []);
        setSceneGroups(data.groups || []);
      }
    } catch (e) {
      console.error('Failed to fetch scenes', e);
    }
  }, []);

  // Load active scene data
  const fetchActiveScene = useCallback(async (id: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/editor/scenes/${id}?t=${Date.now()}`, { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        setActiveScene(data.scene);
      }
    } catch (e) {
      console.error(`Failed to load scene ${id}`, e);
    } finally {
      // Small artificial delay for smooth transition feel
      setTimeout(() => setIsLoading(false), 300);
    }
  }, []);

  useEffect(() => {
    fetchScenes();
  }, [fetchScenes]);

  useEffect(() => {
    fetchActiveScene(activeSceneId);
  }, [activeSceneId, fetchActiveScene]);

  const switchScene = useCallback((id: string) => {
    if (id === activeSceneId) return;
    setActiveSceneId(id);
  }, [activeSceneId]);

  const createScene = useCallback(async (name: string, id: string) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/editor/scenes/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, id })
      });
      
      if (res.ok) {
        await fetchScenes();
        setActiveSceneId(id); // Switch to the new scene
        return true;
      }
      return false;
    } catch (e) {
      console.error('Failed to create scene', e);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [fetchScenes]);

  const duplicateScene = useCallback(async (sourceId: string, name: string, id: string) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/editor/scenes/duplicate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sourceId, name, id })
      });
      
      if (res.ok) {
        await fetchScenes();
        setActiveSceneId(id);
        return true;
      }
      return false;
    } catch (e) {
      console.error('Failed to duplicate scene', e);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [fetchScenes]);

  const deleteScene = useCallback(async (id: string) => {
    if (id === 'main') return false;

    setIsLoading(true);
    try {
      const res = await fetch(`/api/editor/scenes/${id}?t=${Date.now()}`, {
        method: 'DELETE'
      });
      
      if (res.ok) {
        await fetchScenes();
        if (activeSceneId === id) {
          setActiveSceneId('main');
        }
        return true;
      }
      return false;
    } catch (e) {
      console.error('Failed to delete scene', e);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [fetchScenes, activeSceneId]);

  const saveAllGroups = useCallback(async (updatedGroups: SceneGroup[]) => {
    try {
      const res = await fetch('/api/editor/scenes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ groups: updatedGroups })
      });
      if (res.ok) {
        setSceneGroups(updatedGroups);
        return true;
      }
      return false;
    } catch (e) {
      console.error('Failed to save scene groups', e);
      return false;
    }
  }, []);

  const createSceneGroup = useCallback(async (name: string, color: string = '#a78bfa') => {
    const newGroup: SceneGroup = {
      id: `group-${Date.now()}`,
      name,
      color,
      isCollapsed: false
    };
    const updated = [...sceneGroups, newGroup];
    return await saveAllGroups(updated);
  }, [sceneGroups, saveAllGroups]);

  const updateSceneGroup = useCallback(async (groupId: string, updates: Partial<SceneGroup>) => {
    const updated = sceneGroups.map(g => g.id === groupId ? { ...g, ...updates } : g);
    return await saveAllGroups(updated);
  }, [sceneGroups, saveAllGroups]);

  const deleteSceneGroup = useCallback(async (groupId: string) => {
    const updatedGroups = sceneGroups.filter(g => g.id !== groupId);
    return await saveAllGroups(updatedGroups);
  }, [sceneGroups, saveAllGroups]);

  const assignSceneToGroup = useCallback(async (sceneId: string, groupId: string | null) => {
    try {
      const res = await fetch(`/api/editor/scenes/${sceneId}?t=${Date.now()}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ groupId })
      });
      
      if (res.ok) {
        await fetchScenes();
        return true;
      }
      return false;
    } catch (e) {
      console.error('Failed to assign scene to group', e);
      return false;
    }
  }, [fetchScenes]);

  return {
    scenes,
    sceneGroups,
    activeSceneId,
    activeScene,
    isLoading,
    switchScene,
    createScene,
    duplicateScene,
    deleteScene,
    createSceneGroup,
    updateSceneGroup,
    deleteSceneGroup,
    assignSceneToGroup,
    refreshScenes: fetchScenes,
    refreshActiveScene: () => fetchActiveScene(activeSceneId)
  };
}
