import { Dispatch, SetStateAction } from 'react'
import { EditorGroup } from '../types'

interface UseEditorStructureProps {
  setLayerOrder: Dispatch<SetStateAction<number[]>>;
  setGroups: Dispatch<SetStateAction<Record<number, EditorGroup>>>;
  selectedIds: number[];
  setSelectedIds: (ids: number[]) => void;
  setIsSelectionMode: (mode: boolean) => void;
  pushHistory: () => void;
}

export const useEditorStructure = ({
  setLayerOrder,
  setGroups,
  selectedIds,
  setSelectedIds,
  setIsSelectionMode,
  pushHistory
}: UseEditorStructureProps) => {

  const createGroup = (name: string) => {
    if (selectedIds.length < 2) return
    pushHistory()
    const groupId = Date.now() // Simple unique ID
    const newGroup: EditorGroup = {
      id: groupId,
      name,
      memberIds: [...selectedIds],
      isCollapsed: false
    }
    setGroups(prev => ({ ...prev, [groupId]: newGroup }))
    setSelectedIds([])
    setIsSelectionMode(false)
  }

  const updateGroupName = (groupId: number, name: string) => {
    pushHistory()
    setGroups(prev => ({
      ...prev,
      [groupId]: { ...prev[groupId], name }
    }))
  }

  const toggleGroupCollapse = (groupId: number) => {
    setGroups(prev => ({
      ...prev,
      [groupId]: { ...prev[groupId], isCollapsed: !prev[groupId].isCollapsed }
    }))
  }

  const ungroup = (groupId: number) => {
    pushHistory()
    setGroups(prev => {
      const { [groupId]: _, ...rest } = prev
      return rest
    })
  }

  const reorderGroups = (startIndex: number, endIndex: number) => {
    pushHistory()
    setGroups(prev => {
      const entries = Object.entries(prev)
      const result = Array.from(entries)
      const [removed] = result.splice(startIndex, 1)
      result.splice(endIndex, 0, removed)
      return Object.fromEntries(result)
    })
  }

  const reorderLayers = (startIndex: number, endIndex: number) => {
    pushHistory()
    setLayerOrder(prev => {
      const result = Array.from(prev)
      const [removed] = result.splice(startIndex, 1)
      result.splice(endIndex, 0, removed)
      return result
    })
  }

  const reorderBlock = (idsToMove: number[], targetIndex: number) => {
    pushHistory()
    setLayerOrder(prev => {
      // 1. Remove moving IDs
      const filtered = prev.filter(id => !idsToMove.includes(id))
      // 2. Determine insertion point
      const result = [...filtered]
      result.splice(targetIndex, 0, ...idsToMove)
      return result
    })
  }

  return {
    createGroup,
    updateGroupName,
    toggleGroupCollapse,
    ungroup,
    reorderGroups,
    reorderLayers,
    reorderBlock
  }
}
