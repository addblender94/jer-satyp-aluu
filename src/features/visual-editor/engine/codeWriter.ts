import { Location as LocationData } from '../../main-menu/types'

/**
 * Sends updated locations to the API route for saving to the file system.
 * This is the "Brain" of the save mechanism — it bridges the editor state
 * to the actual source code files.
 */
export async function saveLocations(
  locations: LocationData[],
  sections?: any[]
): Promise<boolean> {
  try {
    const res = await fetch('/api/editor/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ locations, sections }),
    })

    if (!res.ok) {
      const err = await res.json()
      console.error('Save failed:', err)
      return false
    }

    const data = await res.json()
    console.log(`✅ Saved ${data.saved} locations`)
    return true
  } catch (error) {
    console.error('Save error:', error)
    return false
  }
}
