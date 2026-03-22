import { SceneSection } from '../types';

interface UseSectionManagerProps {
  tempSections: SceneSection[];
  setTempSections: React.Dispatch<React.SetStateAction<SceneSection[]>>;
  setTempSectionIds: React.Dispatch<React.SetStateAction<Record<number, number>>>;
  pushHistory: () => void;
}

export const useSectionManager = ({
  tempSections,
  setTempSections,
  setTempSectionIds,
  pushHistory
}: UseSectionManagerProps) => {

  const updateTempSection = (id: number, configUpdate: Partial<SceneSection>) => {
    setTempSections(prev => prev.map(s => s.id === id ? { ...s, ...configUpdate } : s));
  };

  const addBackgroundSection = () => {
    pushHistory();
    const nextId = tempSections.length > 0 ? Math.max(...tempSections.map(s => s.id)) + 1 : 1;
    const newSection: SceneSection = {
      id: nextId,
      url: 'fon.png',
      opacity: 1
    };
    setTempSections(prev => [...prev, newSection]);
  };

  const removeBackgroundSection = (id: number) => {
    if (tempSections.length <= 1) return; // Keep at least one section
    pushHistory();
    setTempSections(prev => prev.filter(s => s.id !== id));
    
    // Cleanup element mapping for this section
    setTempSectionIds(prev => {
      const updated = { ...prev };
      Object.keys(updated).forEach(key => {
        if (updated[Number(key)] === id) {
          delete updated[Number(key)];
        }
      });
      return updated;
    });
  };

  const duplicateBackgroundSection = (id: number) => {
    const source = tempSections.find(s => s.id === id);
    if (!source) return;
    pushHistory();
    const nextId = Math.max(...tempSections.map(s => s.id)) + 1;
    const cloned: SceneSection = { ...source, id: nextId };
    setTempSections(prev => [...prev, cloned]);
  };

  const reorderSections = (startIndex: number, endIndex: number) => {
    pushHistory();
    setTempSections(prev => {
      const result = Array.from(prev);
      const [removed] = result.splice(startIndex, 1);
      result.splice(endIndex, 0, removed);
      return result;
    });
  };

  return {
    updateTempSection,
    addBackgroundSection,
    removeBackgroundSection,
    duplicateBackgroundSection,
    reorderSections
  };
};
