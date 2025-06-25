export interface DitherOptions {
  algorithm: 'floyd-steinberg' | 'atkinson' | 'burkes' | 'sierra' | 'sierra-lite' | 'stucki' | 'bayer'
  threshold: number
  intensity: number
  paletteSize: number
  serpentine: boolean
  pixelationScale: number
  detailEnhancement: number
  brightness: number
  midtones: number
  noise: number
  glow: number
  exposure: number
}

export function applyDither(
  imageData: ImageData,
  options: DitherOptions
): ImageData {
  let { width, height, data } = imageData
  let newData = new Uint8ClampedArray(data)
  
  console.log('Starting dither with options:', options)
  console.log('Image dimensions:', width, 'x', height)
  
  // Exposure adjustment (applied first)
  if (options.exposure !== 0) {
    const exposureFactor = Math.pow(2, options.exposure / 100) // Convert to EV scale
    for (let i = 0; i < newData.length; i += 4) {
      newData[i] = clamp(newData[i] * exposureFactor)
      newData[i + 1] = clamp(newData[i + 1] * exposureFactor)
      newData[i + 2] = clamp(newData[i + 2] * exposureFactor)
    }
  }
  
  // Pixelation
  if (options.pixelationScale > 1) {
    const scale = options.pixelationScale
    const tempCanvas = document.createElement('canvas')
    tempCanvas.width = Math.max(1, Math.floor(width / scale))
    tempCanvas.height = Math.max(1, Math.floor(height / scale))
    const tempCtx = tempCanvas.getContext('2d')
    if (!tempCtx) throw new Error('Could not get 2d context for tempCanvas')
    const srcCanvas = document.createElement('canvas')
    srcCanvas.width = width
    srcCanvas.height = height
    const srcCtx = srcCanvas.getContext('2d')
    if (!srcCtx) throw new Error('Could not get 2d context for srcCanvas')
    srcCtx.putImageData(new ImageData(newData, width, height), 0, 0)
    // Downscale
    tempCtx.drawImage(srcCanvas, 0, 0, tempCanvas.width, tempCanvas.height)
    // Upscale
    srcCtx.imageSmoothingEnabled = false
    srcCtx.drawImage(tempCanvas, 0, 0, width, height)
    const imageData = srcCtx.getImageData(0, 0, width, height)
    newData = new Uint8ClampedArray(imageData.data)
  }

  // Brightness
  if (options.brightness !== 0) {
    for (let i = 0; i < newData.length; i += 4) {
      newData[i] = clamp(newData[i] + options.brightness)
      newData[i + 1] = clamp(newData[i + 1] + options.brightness)
      newData[i + 2] = clamp(newData[i + 2] + options.brightness)
    }
  }

  // Midtones (gamma correction)
  if (options.midtones !== 1) {
    const gamma = 1 / Math.max(0.01, options.midtones)
    for (let i = 0; i < newData.length; i += 4) {
      newData[i] = clamp(255 * Math.pow(newData[i] / 255, gamma))
      newData[i + 1] = clamp(255 * Math.pow(newData[i + 1] / 255, gamma))
      newData[i + 2] = clamp(255 * Math.pow(newData[i + 2] / 255, gamma))
    }
  }

  // Noise
  if (options.noise > 0) {
    for (let i = 0; i < newData.length; i += 4) {
      const n = (Math.random() - 0.5) * options.noise
      newData[i] = clamp(newData[i] + n)
      newData[i + 1] = clamp(newData[i + 1] + n)
      newData[i + 2] = clamp(newData[i + 2] + n)
    }
  }

  // Detail Enhancement (sharpen kernel) - Optimized for large images
  if (options.detailEnhancement > 0) {
    const totalPixels = width * height
    // For very large images, reduce detail enhancement intensity
    const adjustedAmount = totalPixels > 2000000 ? options.detailEnhancement * 0.5 : options.detailEnhancement
    newData = new Uint8ClampedArray(applySharpen(newData, width, height, adjustedAmount))
  }

  // Glow (blur + blend) - Optimized for large images
  if (options.glow > 0) {
    const totalPixels = width * height
    // For very large images, reduce glow intensity
    const adjustedAmount = totalPixels > 2000000 ? options.glow * 0.5 : options.glow
    newData = new Uint8ClampedArray(applyGlow(newData, width, height, adjustedAmount))
  }

  // Always convert to grayscale before dithering
  for (let i = 0; i < newData.length; i += 4) {
    const gray = newData[i] * 0.299 + newData[i + 1] * 0.587 + newData[i + 2] * 0.114
    newData[i] = gray
    newData[i + 1] = gray
    newData[i + 2] = gray
  }

  // Dithering
  let result: ImageData
  switch (options.algorithm) {
    case 'floyd-steinberg':
      result = floydSteinberg(newData, width, height, options)
      break
    case 'atkinson':
      result = atkinson(newData, width, height, options)
      break
    case 'burkes':
      result = burkes(newData, width, height, options)
      break
    case 'sierra':
      result = sierra(newData, width, height, options)
      break
    case 'sierra-lite':
      result = sierraLite(newData, width, height, options)
      break
    case 'stucki':
      result = stucki(newData, width, height, options)
      break
    case 'bayer':
      result = bayerDither(newData, width, height, options)
      break
    default:
      result = floydSteinberg(newData, width, height, options)
  }
  
  console.log('Dither algorithm completed:', options.algorithm)
  return result
}

function floydSteinberg(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  options: DitherOptions
): ImageData {
  const newData = new Uint8ClampedArray(data)
  
  for (let y = 0; y < height; y++) {
    const row = options.serpentine && y % 2 === 1 ? 
      Array.from({ length: width }, (_, i) => width - 1 - i) : 
      Array.from({ length: width }, (_, i) => i)
    
    for (const x of row) {
      const idx = (y * width + x) * 4
      const oldR = newData[idx]
      const oldG = newData[idx + 1]
      const oldB = newData[idx + 2]
      
      const newR = findClosestPaletteColor(oldR, options.paletteSize)
      const newG = findClosestPaletteColor(oldG, options.paletteSize)
      const newB = findClosestPaletteColor(oldB, options.paletteSize)
      
      newData[idx] = newR
      newData[idx + 1] = newG
      newData[idx + 2] = newB
      
      const errR = (oldR - newR) * options.intensity
      const errG = (oldG - newG) * options.intensity
      const errB = (oldB - newB) * options.intensity
      
      // Distribute error to neighboring pixels
      if (x + 1 < width) {
        const rightIdx = (y * width + x + 1) * 4
        newData[rightIdx] = clamp(newData[rightIdx] + errR * 7 / 16)
        newData[rightIdx + 1] = clamp(newData[rightIdx + 1] + errG * 7 / 16)
        newData[rightIdx + 2] = clamp(newData[rightIdx + 2] + errB * 7 / 16)
      }
      
      if (x - 1 >= 0 && y + 1 < height) {
        const bottomLeftIdx = ((y + 1) * width + x - 1) * 4
        newData[bottomLeftIdx] = clamp(newData[bottomLeftIdx] + errR * 3 / 16)
        newData[bottomLeftIdx + 1] = clamp(newData[bottomLeftIdx + 1] + errG * 3 / 16)
        newData[bottomLeftIdx + 2] = clamp(newData[bottomLeftIdx + 2] + errB * 3 / 16)
      }
      
      if (y + 1 < height) {
        const bottomIdx = ((y + 1) * width + x) * 4
        newData[bottomIdx] = clamp(newData[bottomIdx] + errR * 5 / 16)
        newData[bottomIdx + 1] = clamp(newData[bottomIdx + 1] + errG * 5 / 16)
        newData[bottomIdx + 2] = clamp(newData[bottomIdx + 2] + errB * 5 / 16)
      }
      
      if (x + 1 < width && y + 1 < height) {
        const bottomRightIdx = ((y + 1) * width + x + 1) * 4
        newData[bottomRightIdx] = clamp(newData[bottomRightIdx] + errR * 1 / 16)
        newData[bottomRightIdx + 1] = clamp(newData[bottomRightIdx + 1] + errG * 1 / 16)
        newData[bottomRightIdx + 2] = clamp(newData[bottomRightIdx + 2] + errB * 1 / 16)
      }
    }
  }
  
  return new ImageData(newData, width, height)
}

function atkinson(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  options: DitherOptions
): ImageData {
  const newData = new Uint8ClampedArray(data)
  
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4
      const oldR = newData[idx]
      const oldG = newData[idx + 1]
      const oldB = newData[idx + 2]
      
      const newR = findClosestPaletteColor(oldR, options.paletteSize)
      const newG = findClosestPaletteColor(oldG, options.paletteSize)
      const newB = findClosestPaletteColor(oldB, options.paletteSize)
      
      newData[idx] = newR
      newData[idx + 1] = newG
      newData[idx + 2] = newB
      
      const errR = (oldR - newR) * options.intensity / 8
      const errG = (oldG - newG) * options.intensity / 8
      const errB = (oldB - newB) * options.intensity / 8
      
      // Atkinson pattern
      const positions = [
        [1, 0], [2, 0], [-1, 1], [0, 1], [1, 1], [0, 2]
      ]
      
      for (const [dx, dy] of positions) {
        const nx = x + dx
        const ny = y + dy
        if (nx >= 0 && nx < width && ny < height) {
          const nIdx = (ny * width + nx) * 4
          newData[nIdx] = clamp(newData[nIdx] + errR)
          newData[nIdx + 1] = clamp(newData[nIdx + 1] + errG)
          newData[nIdx + 2] = clamp(newData[nIdx + 2] + errB)
        }
      }
    }
  }
  
  return new ImageData(newData, width, height)
}

function burkes(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  options: DitherOptions
): ImageData {
  const newData = new Uint8ClampedArray(data)
  
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4
      const oldR = newData[idx]
      const oldG = newData[idx + 1]
      const oldB = newData[idx + 2]
      
      const newR = findClosestPaletteColor(oldR, options.paletteSize)
      const newG = findClosestPaletteColor(oldG, options.paletteSize)
      const newB = findClosestPaletteColor(oldB, options.paletteSize)
      
      newData[idx] = newR
      newData[idx + 1] = newG
      newData[idx + 2] = newB
      
      const errR = (oldR - newR) * options.intensity
      const errG = (oldG - newG) * options.intensity
      const errB = (oldB - newB) * options.intensity
      
      // Burkes pattern
      const positions = [
        [1, 0, 8], [2, 0, 4], [-2, 1, 2], [-1, 1, 4], [0, 1, 8], [1, 1, 4], [2, 1, 2]
      ]
      
      for (const [dx, dy, weight] of positions) {
        const nx = x + dx
        const ny = y + dy
        if (nx >= 0 && nx < width && ny < height) {
          const nIdx = (ny * width + nx) * 4
          const factor = weight / 32
          newData[nIdx] = clamp(newData[nIdx] + errR * factor)
          newData[nIdx + 1] = clamp(newData[nIdx + 1] + errG * factor)
          newData[nIdx + 2] = clamp(newData[nIdx + 2] + errB * factor)
        }
      }
    }
  }
  
  return new ImageData(newData, width, height)
}

function sierra(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  options: DitherOptions
): ImageData {
  const newData = new Uint8ClampedArray(data)
  
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4
      const oldR = newData[idx]
      const oldG = newData[idx + 1]
      const oldB = newData[idx + 2]
      
      const newR = findClosestPaletteColor(oldR, options.paletteSize)
      const newG = findClosestPaletteColor(oldG, options.paletteSize)
      const newB = findClosestPaletteColor(oldB, options.paletteSize)
      
      newData[idx] = newR
      newData[idx + 1] = newG
      newData[idx + 2] = newB
      
      const errR = (oldR - newR) * options.intensity
      const errG = (oldG - newG) * options.intensity
      const errB = (oldB - newB) * options.intensity
      
      // Sierra pattern
      const positions = [
        [1, 0, 5], [2, 0, 3], [-2, 1, 2], [-1, 1, 4], [0, 1, 5], [1, 1, 4], [2, 1, 2],
        [-1, 2, 2], [0, 2, 3], [1, 2, 2]
      ]
      
      for (const [dx, dy, weight] of positions) {
        const nx = x + dx
        const ny = y + dy
        if (nx >= 0 && nx < width && ny < height) {
          const nIdx = (ny * width + nx) * 4
          const factor = weight / 32
          newData[nIdx] = clamp(newData[nIdx] + errR * factor)
          newData[nIdx + 1] = clamp(newData[nIdx + 1] + errG * factor)
          newData[nIdx + 2] = clamp(newData[nIdx + 2] + errB * factor)
        }
      }
    }
  }
  
  return new ImageData(newData, width, height)
}

function sierraLite(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  options: DitherOptions
): ImageData {
  const newData = new Uint8ClampedArray(data)
  
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4
      const oldR = newData[idx]
      const oldG = newData[idx + 1]
      const oldB = newData[idx + 2]
      
      const newR = findClosestPaletteColor(oldR, options.paletteSize)
      const newG = findClosestPaletteColor(oldG, options.paletteSize)
      const newB = findClosestPaletteColor(oldB, options.paletteSize)
      
      newData[idx] = newR
      newData[idx + 1] = newG
      newData[idx + 2] = newB
      
      const errR = (oldR - newR) * options.intensity
      const errG = (oldG - newG) * options.intensity
      const errB = (oldB - newB) * options.intensity
      
      // Sierra Lite pattern
      const positions = [
        [1, 0, 2], [-1, 1, 1], [0, 1, 1]
      ]
      
      for (const [dx, dy, weight] of positions) {
        const nx = x + dx
        const ny = y + dy
        if (nx >= 0 && nx < width && ny < height) {
          const nIdx = (ny * width + nx) * 4
          const factor = weight / 4
          newData[nIdx] = clamp(newData[nIdx] + errR * factor)
          newData[nIdx + 1] = clamp(newData[nIdx + 1] + errG * factor)
          newData[nIdx + 2] = clamp(newData[nIdx + 2] + errB * factor)
        }
      }
    }
  }
  
  return new ImageData(newData, width, height)
}

function stucki(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  options: DitherOptions
): ImageData {
  const newData = new Uint8ClampedArray(data)
  
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4
      const oldR = newData[idx]
      const oldG = newData[idx + 1]
      const oldB = newData[idx + 2]
      
      const newR = findClosestPaletteColor(oldR, options.paletteSize)
      const newG = findClosestPaletteColor(oldG, options.paletteSize)
      const newB = findClosestPaletteColor(oldB, options.paletteSize)
      
      newData[idx] = newR
      newData[idx + 1] = newG
      newData[idx + 2] = newB
      
      const errR = (oldR - newR) * options.intensity
      const errG = (oldG - newG) * options.intensity
      const errB = (oldB - newB) * options.intensity
      
      // Stucki pattern
      const positions = [
        [1, 0, 8], [2, 0, 4], [-2, 1, 2], [-1, 1, 4], [0, 1, 8], [1, 1, 4], [2, 1, 2],
        [-2, 2, 1], [-1, 2, 2], [0, 2, 4], [1, 2, 2], [2, 2, 1]
      ]
      
      for (const [dx, dy, weight] of positions) {
        const nx = x + dx
        const ny = y + dy
        if (nx >= 0 && nx < width && ny < height) {
          const nIdx = (ny * width + nx) * 4
          const factor = weight / 42
          newData[nIdx] = clamp(newData[nIdx] + errR * factor)
          newData[nIdx + 1] = clamp(newData[nIdx + 1] + errG * factor)
          newData[nIdx + 2] = clamp(newData[nIdx + 2] + errB * factor)
        }
      }
    }
  }
  
  return new ImageData(newData, width, height)
}

function bayerDither(data: Uint8ClampedArray, width: number, height: number, options: DitherOptions): ImageData {
  // 8x8 Bayer matrix for ordered dithering
  const bayerMatrix = [
    [0, 48, 12, 60, 3, 51, 15, 63],
    [32, 16, 44, 28, 35, 19, 47, 31],
    [8, 56, 4, 52, 11, 59, 7, 55],
    [40, 24, 36, 20, 43, 27, 39, 23],
    [2, 50, 14, 62, 1, 49, 13, 61],
    [34, 18, 46, 30, 33, 17, 45, 29],
    [10, 58, 6, 54, 9, 57, 5, 53],
    [42, 26, 38, 22, 41, 25, 37, 21],
  ]
  const matrixSize = 8
  const matrixScale = 64 // 8x8 matrix, values 0-63
  const out = new Uint8ClampedArray(data.length)
  
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4
      const matrixValue = bayerMatrix[y % matrixSize][x % matrixSize]
      const threshold = (matrixValue + 0.5) * 255 / matrixScale
      
      for (let c = 0; c < 3; c++) {
        const value = data[idx + c]
        // Simple threshold comparison for ordered dithering
        out[idx + c] = value > threshold ? 255 : 0
      }
      out[idx + 3] = data[idx + 3] // Preserve alpha
    }
  }
  
  return new ImageData(out, width, height)
}

function findClosestPaletteColor(value: number, paletteSize: number): number {
  if (paletteSize <= 1) return 0
  
  // Create a more visible dither effect by using threshold-based quantization
  const threshold = 255 / (paletteSize - 1)
  const quantized = Math.floor(value / threshold) * threshold
  return Math.max(0, Math.min(255, quantized))
}

function clamp(value: number): number {
  return Math.max(0, Math.min(255, value))
}

function applySharpen(data: Uint8ClampedArray, width: number, height: number, amount: number): Uint8ClampedArray {
  // 3x3 sharpen kernel
  const kernel = [
    0, -1, 0,
    -1, 5, -1,
    0, -1, 0
  ]
  const out = new Uint8ClampedArray(data.length)
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      for (let c = 0; c < 3; c++) {
        let i = (y * width + x) * 4 + c
        let sum = 0
        let k = 0
        for (let ky = -1; ky <= 1; ky++) {
          for (let kx = -1; kx <= 1; kx++) {
            let ni = ((y + ky) * width + (x + kx)) * 4 + c
            sum += data[ni] * kernel[k]
            k++
          }
        }
        // Blend original and sharpened based on amount
        out[i] = clamp(data[i] * (1 - amount / 10) + (sum * (amount / 10) / kernel[4]))
      }
      // Copy alpha
      out[(y * width + x) * 4 + 3] = data[(y * width + x) * 4 + 3]
    }
  }
  // Copy border pixels unchanged
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (y === 0 || y === height - 1 || x === 0 || x === width - 1) {
        for (let c = 0; c < 4; c++) {
          out[(y * width + x) * 4 + c] = data[(y * width + x) * 4 + c]
        }
      }
    }
  }
  return out
}

function applyGlow(data: Uint8ClampedArray, width: number, height: number, amount: number): Uint8ClampedArray {
  // Simple blur kernel (box blur)
  const kernelSize = Math.max(1, Math.round(amount / 20))
  const blurred = new Uint8ClampedArray(data.length)
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let r = 0, g = 0, b = 0, a = 0, count = 0
      for (let ky = -kernelSize; ky <= kernelSize; ky++) {
        for (let kx = -kernelSize; kx <= kernelSize; kx++) {
          const nx = x + kx
          const ny = y + ky
          if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
            const ni = (ny * width + nx) * 4
            r += data[ni]
            g += data[ni + 1]
            b += data[ni + 2]
            a += data[ni + 3]
            count++
          }
        }
      }
      const i = (y * width + x) * 4
      blurred[i] = r / count
      blurred[i + 1] = g / count
      blurred[i + 2] = b / count
      blurred[i + 3] = a / count
    }
  }
  // Blend blurred with original
  const out = new Uint8ClampedArray(data.length)
  const blend = Math.min(1, amount / 100)
  for (let i = 0; i < data.length; i += 4) {
    out[i] = clamp(data[i] * (1 - blend) + blurred[i] * blend)
    out[i + 1] = clamp(data[i + 1] * (1 - blend) + blurred[i + 1] * blend)
    out[i + 2] = clamp(data[i + 2] * (1 - blend) + blurred[i + 2] * blend)
    out[i + 3] = data[i + 3]
  }
  return out
} 