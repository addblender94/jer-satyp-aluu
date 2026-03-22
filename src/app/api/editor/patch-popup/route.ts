import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import { getSceneById, saveScene, savePopupToFile } from '../../../../features/main-menu/engine/sceneRegistry'

export async function POST(req: NextRequest) {
  try {
    const { sceneId, elementId, popupContent } = await req.json() as {
      sceneId: string;
      elementId: number;
      popupContent: string;
    };

    if (!sceneId || elementId === undefined) {
      return NextResponse.json({ error: 'Missing sceneId or elementId' }, { status: 400 })
    }

    const decodedSceneId = decodeURIComponent(sceneId);

    // 1. Save to granular text file (The "Blocknote" request)
    savePopupToFile(sceneId, elementId, popupContent);

    // 2. Also update main JSON for consistency
    const scene = getSceneById(sceneId);
    if (!scene) {
      return NextResponse.json({ error: 'Scene not found' }, { status: 404 })
    }

    const updatedLocations = scene.locations.map(loc => {
      if (Number(loc.id) === Number(elementId)) {
        return { ...loc, popupContent };
      }
      return loc;
    });

    const success = saveScene(sceneId, {
      name: scene.name,
      assetFolder: scene.assetFolder,
      sections: scene.sections,
      locations: updatedLocations
    });

    if (success) {
      return NextResponse.json({ success: true })
    } else {
      return NextResponse.json({ error: 'Failed to write JSON' }, { status: 500 })
    }
  } catch (error) {
    console.error('Patch error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
