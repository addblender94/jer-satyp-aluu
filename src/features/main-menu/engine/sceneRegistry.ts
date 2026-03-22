import fs from 'fs';
import path from 'path';
import { Location } from '../types';

export interface SceneData {
  id: string;
  name: string;
  assetFolder: string;
  sections: any[];
  locations: Location[];
  groupId?: string;
  bgGradientStart?: string;
  bgGradientEnd?: string;
  headerTitle?: string;
  headerFontFamily?: string;
  headerFontSize?: string;
  headerColor?: string;
}

export interface SceneGroup {
  id: string;
  name: string;
  color: string;
  isCollapsed: boolean;
}

const SCENES_DIR = path.join(process.cwd(), 'src', 'features', 'main-menu', 'data', 'scenes');
const GROUPS_FILE = path.join(process.cwd(), 'src', 'features', 'main-menu', 'data', 'scene-groups.json');
const POPUPS_DIR = path.join(process.cwd(), 'src', 'features', 'main-menu', 'data', 'popups');

/**
 * Reads all available scenes from the JSON files.
 * This should only be used server-side (Next.js API routes or Server Components).
 */
export function getAllScenes(): SceneData[] {
  if (!fs.existsSync(SCENES_DIR)) {
    return [];
  }

  const files = fs.readdirSync(SCENES_DIR).filter(file => file.endsWith('.json'));
  
  return files.map(file => {
    const raw = fs.readFileSync(path.join(SCENES_DIR, file), 'utf-8');
    const scene = JSON.parse(raw) as SceneData;
    
    // Merge popup files if they exist
    scene.locations = scene.locations.map(loc => {
      const popupFilePath = path.join(POPUPS_DIR, scene.id, `${loc.id}.txt`);
      if (fs.existsSync(popupFilePath)) {
        loc.popupContent = fs.readFileSync(popupFilePath, 'utf-8');
      }
      return loc;
    });

    return scene;
  });
}

/**
 * Gets a specific scene by ID.
 */
export function getSceneById(id: string): SceneData | null {
  const decodedId = decodeURIComponent(id);
  const filePath = path.join(SCENES_DIR, `${decodedId}.json`);
  if (!fs.existsSync(filePath)) {
    return null;
  }
  
  const raw = fs.readFileSync(filePath, 'utf-8');
  const scene = JSON.parse(raw) as SceneData;

  // Merge popup files if they exist
  if (scene.locations) {
    scene.locations = scene.locations.map(loc => {
      const popupFilePath = path.join(POPUPS_DIR, id, `${loc.id}.txt`);
      if (fs.existsSync(popupFilePath)) {
        loc.popupContent = fs.readFileSync(popupFilePath, 'utf-8');
      }
      return loc;
    });
  }

  return scene;
}

/**
 * Save a scene to a JSON file.
 */
export function saveScene(id: string, data: Omit<SceneData, 'id'>): boolean {
  try {
    if (!fs.existsSync(SCENES_DIR)) {
      fs.mkdirSync(SCENES_DIR, { recursive: true });
    }

    const decodedId = decodeURIComponent(id);
    const filePath = path.join(SCENES_DIR, `${decodedId}.json`);
    const sceneData: SceneData = { id: decodedId, ...data };
    
    fs.writeFileSync(filePath, JSON.stringify(sceneData, null, 2), 'utf-8');
    return true;
  } catch (e) {
    console.error(`Failed to save scene ${id}:`, e);
    return false;
  }
}

/**
 * Delete a scene and its associated popup files.
 */
export function deleteScene(id: string): boolean {
  try {
    const decodedId = decodeURIComponent(id);
    if (decodedId === 'main') return false; // Never delete main scene
    
    const filePath = path.join(SCENES_DIR, `${decodedId}.json`);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    
    const scenePopupsDir = path.join(POPUPS_DIR, decodedId);
    if (fs.existsSync(scenePopupsDir)) {
      fs.rmSync(scenePopupsDir, { recursive: true, force: true });
    }
    
    return true;
  } catch (e) {
    console.error(`Failed to delete scene ${id}:`, e);
    return false;
  }
}

/**
 * Save a specific popup's content to its own text file (Blocknote).
 */
export function savePopupToFile(sceneId: string, elementId: string | number, content: string): boolean {
  try {
    const decodedSceneId = decodeURIComponent(sceneId);
    const scenePopupsDir = path.join(POPUPS_DIR, decodedSceneId);
    if (!fs.existsSync(scenePopupsDir)) {
      fs.mkdirSync(scenePopupsDir, { recursive: true });
    }

    const filePath = path.join(scenePopupsDir, `${elementId}.txt`);
    fs.writeFileSync(filePath, content, 'utf-8');
    return true;
  } catch (e) {
    console.error(`Failed to save popup file for ${elementId} in ${sceneId}:`, e);
    return false;
  }
}

export function getAllGroups(): SceneGroup[] {
  if (!fs.existsSync(GROUPS_FILE)) return [];
  try {
    const raw = fs.readFileSync(GROUPS_FILE, 'utf-8');
    return JSON.parse(raw) as SceneGroup[];
  } catch (e) {
    console.error('Failed to read groups file:', e);
    return [];
  }
}

export function saveGroups(groups: SceneGroup[]): boolean {
  try {
    const dir = path.dirname(GROUPS_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(GROUPS_FILE, JSON.stringify(groups, null, 2), 'utf-8');
    return true;
  } catch (e) {
    console.error('Failed to save groups file:', e);
    return false;
  }
}

/**
 * Partially updates a scene.
 */
export function patchScene(id: string, updates: Partial<Omit<SceneData, 'id'>>): boolean {
  try {
    const existing = getSceneById(id);
    if (!existing) return false;
    
    // We don't need to re-merge popups here for saving, just the main JSON data
    const updatedData: SceneData = { ...existing, ...updates };
    
    // Remove popupContent before saving back to JSON to keep it clean if desired, 
    // although saveScene doesn't strictly require it. 
    // Actually, saveScene will save whatever is in the object.
    
    return saveScene(id, updatedData);
  } catch (e) {
    console.error(`Failed to patch scene ${id}:`, e);
    return false;
  }
}
