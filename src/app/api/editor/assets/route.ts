import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const folder = searchParams.get('folder') || 'main_menu'; // Fallback to main_menu

    // Ensure no path traversal
    const safeFolder = path.basename(folder);
    const assetsDir = path.join(process.cwd(), 'public', 'assets', safeFolder)
    
    // Check if directory exists
    if (!fs.existsSync(assetsDir)) {
      return NextResponse.json({ assets: [] })
    }

    const files = fs.readdirSync(assetsDir)
    
    // Filter for common image formats (png, jpg, svg, webp)
    const assets = files.filter(file => {
      const ext = path.extname(file).toLowerCase()
      return ['.png', '.jpg', '.jpeg', '.svg', '.webp'].includes(ext)
    }).map(file => {
      // Return file name with extension
      return file
    })

    return NextResponse.json({ assets })
  } catch (error) {
    console.error('Failed to scan assets:', error)
    return NextResponse.json({ error: 'Failed to scan assets' }, { status: 500 })
  }
}
