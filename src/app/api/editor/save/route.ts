import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

import { Location } from '../../../../features/main-menu/types'

// We use the full Location type from types/index.ts
// to guarantee we accept all newly added properties.
type LocationUpdate = Location

export async function POST(req: NextRequest) {
  try {
    const { sceneId, data } = await req.json() as {
      sceneId?: string;
      data?: {
        name?: string;
        assetFolder?: string;
        locations: LocationUpdate[];
        sections?: any[];
        groups?: any[];
        quickLinks?: any[];
        bgGradientStart?: string;
        bgGradientEnd?: string;
        headerTitle?: string;
        headerFontFamily?: string;
        headerFontSize?: string;
        headerColor?: string;
      }
    };

    const targetSceneId = decodeURIComponent(sceneId || 'main'); // Default to main for now
    if (!data || !data.locations || !Array.isArray(data.locations)) {
      return NextResponse.json({ error: 'Invalid data' }, { status: 400 })
    }

    const scenesDir = path.join(process.cwd(), 'src', 'features', 'main-menu', 'data', 'scenes');
    if (!fs.existsSync(scenesDir)) {
      fs.mkdirSync(scenesDir, { recursive: true });
    }

    const scenePath = path.join(scenesDir, `${targetSceneId}.json`);
    let sceneData: any = {
      id: targetSceneId,
      name: data.name || "Жаңы баракча", 
      assetFolder: data.assetFolder || "main_menu",
      sections: data.sections || [],
      locations: data.locations,
      groups: data.groups || [],
      quickLinks: data.quickLinks || [],
      bgGradientStart: data.bgGradientStart || undefined,
      bgGradientEnd: data.bgGradientEnd || undefined,
      headerTitle: data.headerTitle || undefined,
      headerFontFamily: data.headerFontFamily || undefined,
      headerFontSize: data.headerFontSize || undefined,
      headerColor: data.headerColor || undefined,
    };

    // If scene exists, preserve name and assetFolder if not provided in the patch
    if (fs.existsSync(scenePath)) {
      try {
        const existingData = JSON.parse(fs.readFileSync(scenePath, 'utf-8'));
        // We typecast to any temporarily, then it will save fine
        const mergedData: any = {
          name: data.name || existingData.name,
          assetFolder: data.assetFolder || existingData.assetFolder,
          sections: data.sections || existingData.sections,
          locations: data.locations || existingData.locations,
          groups: data.groups || existingData.groups,
          quickLinks: data.quickLinks !== undefined ? data.quickLinks : existingData.quickLinks,
          bgGradientStart: data.bgGradientStart !== undefined ? data.bgGradientStart : existingData.bgGradientStart,
          bgGradientEnd: data.bgGradientEnd !== undefined ? data.bgGradientEnd : existingData.bgGradientEnd,
          headerTitle: data.headerTitle !== undefined ? data.headerTitle : existingData.headerTitle,
          headerFontFamily: data.headerFontFamily !== undefined ? data.headerFontFamily : existingData.headerFontFamily,
          headerFontSize: data.headerFontSize !== undefined ? data.headerFontSize : existingData.headerFontSize,
          headerColor: data.headerColor !== undefined ? data.headerColor : existingData.headerColor,
        };
        // Update sceneData with merged values, preserving id
        sceneData = { ...existingData, ...mergedData, id: targetSceneId };
      } catch (e) {
        console.error('Failed to read existing scene data:', e);
      }
    }

    fs.writeFileSync(scenePath, JSON.stringify(sceneData, null, 2), 'utf-8');

    return NextResponse.json({ success: true, saved: data.locations.length })
  } catch (error) {
    console.error('Save error:', error)
    return NextResponse.json({ error: 'Failed to save' }, { status: 500 })
  }
}
