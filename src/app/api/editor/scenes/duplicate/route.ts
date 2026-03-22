import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(req: NextRequest) {
  try {
    const { sourceId, newId, newName } = await req.json();

    if (!sourceId || !newId || !newName) {
      return NextResponse.json({ error: 'Source ID, New ID, and New Name are required' }, { status: 400 });
    }

    const scenesDir = path.join(process.cwd(), 'src', 'features', 'main-menu', 'data', 'scenes');
    const sourcePath = path.join(scenesDir, `${sourceId}.json`);
    const targetPath = path.join(scenesDir, `${newId}.json`);

    if (!fs.existsSync(sourcePath)) {
      return NextResponse.json({ error: 'Source scene not found' }, { status: 404 });
    }

    if (fs.existsSync(targetPath)) {
      return NextResponse.json({ error: 'Target scene ID already exists' }, { status: 400 });
    }

    // Read source data
    const sourceData = JSON.parse(fs.readFileSync(sourcePath, 'utf-8'));

    // Create copy with new ID and Name
    const newData = {
      ...sourceData,
      id: newId,
      name: newName
    };

    // Save as new file
    fs.writeFileSync(targetPath, JSON.stringify(newData, null, 2), 'utf-8');

    return NextResponse.json({ success: true, scene: newData });
  } catch (error) {
    console.error('Duplicate scene error:', error);
    return NextResponse.json({ error: 'Failed to duplicate scene' }, { status: 500 });
  }
}
