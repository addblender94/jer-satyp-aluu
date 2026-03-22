import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(req: NextRequest) {
  try {
    const { name, id } = await req.json();

    if (!name || !id) {
      return NextResponse.json({ error: 'Name and ID are required' }, { status: 400 });
    }

    const scenesDir = path.join(process.cwd(), 'src', 'features', 'main-menu', 'data', 'scenes');
    const filePath = path.join(scenesDir, `${id}.json`);

    if (fs.existsSync(filePath)) {
      return NextResponse.json({ error: 'Scene with this ID already exists' }, { status: 400 });
    }

    // Create a new scene based on a template or empty state
    const newScene = {
      id,
      name,
      assetFolder: 'main_menu', // Default to main_menu assets
      sections: [
        { id: 1, url: 'bg1.png', opacity: 1 } // Default background
      ],
      locations: [] // Empty elements
    };

    fs.writeFileSync(filePath, JSON.stringify(newScene, null, 2), 'utf-8');

    return NextResponse.json({ success: true, scene: newScene });
  } catch (error) {
    console.error('Create scene error:', error);
    return NextResponse.json({ error: 'Failed to create scene' }, { status: 500 });
  }
}
