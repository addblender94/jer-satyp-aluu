/**
 * Canvas Auto-Detect: Finds the center of non-transparent pixels in an image.
 * 
 * This utility loads an image into a hidden <canvas>, scans all pixels,
 * and returns the center of the "bounding box" of non-transparent pixels
 * as percentage coordinates relative to the image dimensions.
 * 
 * Use case: When swapping a 1920x1080 transparent PNG overlay,
 * this function automatically finds where the actual icon content is,
 * so the animation pivot (handleX/Y) can be set correctly.
 */

export interface DetectResult {
  x: string  // e.g. "87.88%"
  y: string  // e.g. "37.76%"
  found: boolean
}

export async function detectImageCenter(imageUrl: string): Promise<DetectResult> {
  return new Promise((resolve) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'

    img.onload = () => {
      try {
        const canvas = document.createElement('canvas')
        canvas.width = img.naturalWidth
        canvas.height = img.naturalHeight

        const ctx = canvas.getContext('2d')
        if (!ctx) {
          resolve({ x: '50.00%', y: '50.00%', found: false })
          return
        }

        ctx.drawImage(img, 0, 0)

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
        const data = imageData.data // RGBA array

        let minX = canvas.width
        let maxX = 0
        let minY = canvas.height
        let maxY = 0
        let foundPixel = false

        // Scan every pixel, check alpha channel (index 3 in each 4-byte group)
        // Use step of 4 for performance on large images (sample every 4th row/col)
        const step = Math.max(1, Math.floor(Math.min(canvas.width, canvas.height) / 500))

        for (let y = 0; y < canvas.height; y += step) {
          for (let x = 0; x < canvas.width; x += step) {
            const idx = (y * canvas.width + x) * 4
            const alpha = data[idx + 3]

            if (alpha > 10) { // Non-transparent pixel (threshold: alpha > 10)
              if (x < minX) minX = x
              if (x > maxX) maxX = x
              if (y < minY) minY = y
              if (y > maxY) maxY = y
              foundPixel = true
            }
          }
        }

        if (!foundPixel) {
          resolve({ x: '50.00%', y: '50.00%', found: false })
          return
        }

        // Calculate center of bounding box as percentage of image dimensions
        const centerX = ((minX + maxX) / 2 / canvas.width) * 100
        const centerY = ((minY + maxY) / 2 / canvas.height) * 100

        resolve({
          x: `${centerX.toFixed(2)}%`,
          y: `${centerY.toFixed(2)}%`,
          found: true
        })
      } catch (err) {
        console.error('detectImageCenter error:', err)
        resolve({ x: '50.00%', y: '50.00%', found: false })
      }
    }

    img.onerror = () => {
      console.error('detectImageCenter: Failed to load image', imageUrl)
      resolve({ x: '50.00%', y: '50.00%', found: false })
    }

    img.src = imageUrl
  })
}
