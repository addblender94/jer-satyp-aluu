import { NextRequest, NextResponse } from 'next/server';
import { getSceneById, patchScene, deleteScene } from '../../../../../features/main-menu/engine/sceneRegistry';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const sceneId = params.id;
    const scene = getSceneById(sceneId);

    if (!scene) {
      return NextResponse.json({ error: 'Scene not found' }, { status: 404 });
    }

    return NextResponse.json({ scene });
  } catch (error) {
    console.error(`Failed to fetch scene ${params.id}:`, error);
    return NextResponse.json({ error: 'Failed to fetch scene' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const sceneId = params.id;
    const updates = await req.json();
    
    const success = patchScene(sceneId, updates);
    if (success) {
      return NextResponse.json({ success: true });
    }
    return NextResponse.json({ error: 'Failed to patch scene' }, { status: 500 });
  } catch (error) {
    console.error(`Failed to patch scene ${params.id}:`, error);
    return NextResponse.json({ error: 'Failed to patch scene' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const sceneId = params.id;
    
    if (sceneId === 'main') {
      return NextResponse.json({ error: 'Cannot delete main scene' }, { status: 403 });
    }

    const success = deleteScene(sceneId);
    if (success) {
      return NextResponse.json({ success: true });
    }
    return NextResponse.json({ error: 'Failed to delete scene' }, { status: 500 });
  } catch (error) {
    console.error(`Failed to delete scene ${params.id}:`, error);
    return NextResponse.json({ error: 'Failed to delete scene' }, { status: 500 });
  }
}

