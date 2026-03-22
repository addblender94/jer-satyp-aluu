import { useState } from 'react';

interface UseEditorSelectionProps {
  setHasSaved: React.Dispatch<React.SetStateAction<boolean>>;
}

export const useEditorSelection = ({ setHasSaved }: UseEditorSelectionProps) => {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const toggleSelectionMode = () => {
    setIsSelectionMode(!isSelectionMode);
    if (isSelectionMode) {
      // Exiting selection mode — clear selection
      setSelectedIds([]);
    } else {
      // Entering selection mode — clear single selection
      setSelectedId(null);
    }
  };

  const toggleItemSelection = (id: number) => {
    setSelectedIds(prev => {
      if (prev.includes(id)) {
        return prev.filter(selectedId => selectedId !== id);
      }
      return [...prev, id];
    });
  };

  // Helper inside context to clear all selections
  const clearSelection = () => {
    setSelectedId(null);
    setSelectedIds([]);
    setIsSelectionMode(false);
  };

  return {
    selectedId,
    setSelectedId,
    isSelectionMode,
    setIsSelectionMode,
    selectedIds,
    setSelectedIds,
    toggleSelectionMode,
    toggleItemSelection,
    clearSelection,
  };
};
