import { NextResponse } from 'next/server';
import { getAllScenes, getAllGroups, saveGroups } from '../../../../features/main-menu/engine/sceneRegistry';

export async function GET() {
  try {
    const scenes = getAllScenes();
    const groups = getAllGroups();
    
    // Return a lightweight summary list of scenes
    const sceneList = scenes.map(s => ({
      id: s.id,
      name: s.name,
      assetFolder: s.assetFolder,
      elementCount: s.locations?.length || 0,
      groupId: s.groupId
    }));

    return NextResponse.json({ 
      scenes: sceneList,
      groups: groups
    });
  } catch (error) {
    console.error('Failed to list scenes:', error);
    return NextResponse.json({ error: 'Failed to list scenes' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { groups } = await req.json();
    const success = saveGroups(groups);
    if (success) {
      return NextResponse.json({ success: true });
    }
    return NextResponse.json({ error: 'Failed to save groups' }, { status: 500 });
  } catch (error) {
    console.error('Failed to save groups:', error);
    return NextResponse.json({ error: 'Failed to save groups' }, { status: 500 });
  }
}
