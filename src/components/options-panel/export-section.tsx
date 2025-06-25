'use client'

import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useState } from 'react'

interface ExportSectionProps {
  disabled?: boolean
  ditheredImage?: string | null
}

export function ExportSection({ disabled = false, ditheredImage }: ExportSectionProps) {
  const [format, setFormat] = useState<'png' | 'jpeg' | 'webp' | 'svg'>('png')
  const [isExporting, setIsExporting] = useState(false)

  const handleDownload = () => {
    if (!ditheredImage) return
    
    if (format === 'svg') {
      setIsExporting(true)
      // Show warning for large images
      if (ditheredImage.includes('data:image/')) {
        const img = new window.Image()
        img.onload = () => {
          const estimatedSize = Math.floor((img.width * img.height) / 1000) // Rough estimate in KB
          if (estimatedSize > 1000) {
            if (!confirm(`Large image detected (${estimatedSize}KB estimated). SVG generation may take a while and produce a large file. Continue?`)) {
              setIsExporting(false)
              return
            }
          }
          exportAsSVG(ditheredImage)
        }
        img.src = ditheredImage
      } else {
        exportAsSVG(ditheredImage)
      }
      return
    }
    
    exportAsRaster(ditheredImage, format)
  }

  const exportAsSVG = (imageData: string) => {
    try {
      const img = new window.Image()
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas')
          canvas.width = img.width
          canvas.height = img.height
          const ctx = canvas.getContext('2d')
          if (!ctx) throw new Error('Could not get 2d context for SVG export')
          
          ctx.drawImage(img, 0, 0)
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
          
          // Optimized SVG generation with multiple compression strategies
          const svg = generateOptimizedSVG(imageData, canvas.width, canvas.height)
          downloadFile(svg, 'dithered-image.svg', 'image/svg+xml')
          
          // Show file size info
          const blob = new Blob([svg], { type: 'image/svg+xml' })
          const sizeKB = Math.round(blob.size / 1024)
          console.log(`SVG generated: ${sizeKB}KB`)
          
          setIsExporting(false)
        } catch (err) {
          alert('SVG export failed: ' + (err instanceof Error ? err.message : err))
          setIsExporting(false)
        }
      }
      img.onerror = () => {
        alert('Failed to load image for SVG export.')
        setIsExporting(false)
      }
      img.src = imageData
    } catch (err) {
      alert('SVG export failed: ' + (err instanceof Error ? err.message : err))
      setIsExporting(false)
    }
  }

  const generateOptimizedSVG = (imageData: ImageData, width: number, height: number): string => {
    // Strategy 1: Use ultra-efficient quadtree-based approach
    const quadtreeSVG = generateQuadtreeSVG(imageData, width, height)
    
    // Strategy 2: If quadtree is still too large, use path-based approach
    if (quadtreeSVG.length > 50000) {
      const paths = generatePathBasedSVG(imageData, width, height)
      if (paths.length > 10000) {
        return generateCompressedRectSVG(imageData, width, height)
      }
      return `<svg xmlns='http://www.w3.org/2000/svg' width='${width}' height='${height}' shape-rendering='crispEdges'>\n${paths.join('\n')}\n</svg>`
    }
    
    // Strategy 3: If still too large, use aggressive compression
    if (quadtreeSVG.length > 20000) {
      return generateAggressiveCompressionSVG(imageData, width, height)
    }
    
    return quadtreeSVG
  }

  const generateQuadtreeSVG = (imageData: ImageData, width: number, height: number): string => {
    // Use quadtree decomposition to group similar regions
    const quadtree = buildQuadtree(imageData, width, height, 0, 0, width, height, 8)
    const rects = quadtreeToRects(quadtree)
    
    return `<svg xmlns='http://www.w3.org/2000/svg' width='${width}' height='${height}' shape-rendering='crispEdges'>\n${rects.join('\n')}\n</svg>`
  }

  interface Quadtree {
    x: number
    y: number
    width: number
    height: number
    isLeaf: boolean
    isDark: boolean
    children?: Quadtree[]
  }

  const buildQuadtree = (
    imageData: ImageData, 
    totalWidth: number, 
    totalHeight: number, 
    x: number, 
    y: number, 
    width: number, 
    height: number, 
    minSize: number
  ): Quadtree => {
    // Check if this region is uniform
    const isUniform = checkUniformRegion(imageData, totalWidth, x, y, width, height)
    
    if (isUniform || width <= minSize || height <= minSize) {
      return {
        x, y, width, height,
        isLeaf: true,
        isDark: isUniform && isDarkRegion(imageData, totalWidth, x, y, width, height)
      }
    }
    
    // Split into quadrants
    const halfWidth = Math.floor(width / 2)
    const halfHeight = Math.floor(height / 2)
    
    const children = [
      buildQuadtree(imageData, totalWidth, totalHeight, x, y, halfWidth, halfHeight, minSize),
      buildQuadtree(imageData, totalWidth, totalHeight, x + halfWidth, y, width - halfWidth, halfHeight, minSize),
      buildQuadtree(imageData, totalWidth, totalHeight, x, y + halfHeight, halfWidth, height - halfHeight, minSize),
      buildQuadtree(imageData, totalWidth, totalHeight, x + halfWidth, y + halfHeight, width - halfWidth, height - halfHeight, minSize)
    ]
    
    return {
      x, y, width, height,
      isLeaf: false,
      isDark: false,
      children
    }
  }

  const checkUniformRegion = (
    imageData: ImageData, 
    totalWidth: number, 
    x: number, 
    y: number, 
    width: number, 
    height: number
  ): boolean => {
    const firstPixel = imageData.data[(y * totalWidth + x) * 4]
    const threshold = 128
    
    for (let dy = 0; dy < height; dy++) {
      for (let dx = 0; dx < width; dx++) {
        const pixel = imageData.data[((y + dy) * totalWidth + (x + dx)) * 4]
        if ((pixel >= threshold) !== (firstPixel >= threshold)) {
          return false
        }
      }
    }
    return true
  }

  const isDarkRegion = (
    imageData: ImageData, 
    totalWidth: number, 
    x: number, 
    y: number, 
    width: number, 
    height: number
  ): boolean => {
    return imageData.data[(y * totalWidth + x) * 4] < 128
  }

  const quadtreeToRects = (quadtree: Quadtree): string[] => {
    const rects: string[] = []
    
    if (quadtree.isLeaf) {
      if (quadtree.isDark) {
        rects.push(`<rect x='${quadtree.x}' y='${quadtree.y}' width='${quadtree.width}' height='${quadtree.height}' fill='black' />`)
      }
    } else if (quadtree.children) {
      for (const child of quadtree.children) {
        rects.push(...quadtreeToRects(child))
      }
    }
    
    return rects
  }

  const generatePathBasedSVG = (imageData: ImageData, width: number, height: number): string[] => {
    const paths: string[] = []
    const visited = new Set<string>()
    
    // Find connected components and create paths
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const key = `${x},${y}`
        if (visited.has(key)) continue
        
        const pixel = imageData.data[(y * width + x) * 4]
        if (pixel >= 128) continue // Skip light pixels
        
        // Find connected dark pixels and create a path
        const component = findConnectedComponent(imageData, width, height, x, y, visited)
        if (component.length > 0) {
          const path = createPathFromComponent(component)
          paths.push(path)
        }
      }
    }
    
    return paths
  }

  const findConnectedComponent = (
    imageData: ImageData, 
    width: number, 
    height: number, 
    startX: number, 
    startY: number, 
    visited: Set<string>
  ): Array<[number, number]> => {
    const component: Array<[number, number]> = []
    const queue: Array<[number, number]> = [[startX, startY]]
    
    while (queue.length > 0) {
      const [x, y] = queue.shift()!
      const key = `${x},${y}`
      
      if (visited.has(key)) continue
      visited.add(key)
      
      const pixel = imageData.data[(y * width + x) * 4]
      if (pixel >= 128) continue // Skip light pixels
      
      component.push([x, y])
      
      // Add neighbors
      const neighbors = [
        [x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]
      ]
      
      for (const [nx, ny] of neighbors) {
        if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
          const neighborKey = `${nx},${ny}`
          if (!visited.has(neighborKey)) {
            queue.push([nx, ny])
          }
        }
      }
    }
    
    return component
  }

  const createPathFromComponent = (component: Array<[number, number]>): string => {
    if (component.length === 0) return ''
    
    // Simple rectangle approximation for now
    let minX = component[0][0], maxX = component[0][0]
    let minY = component[0][1], maxY = component[0][1]
    
    for (const [x, y] of component) {
      minX = Math.min(minX, x)
      maxX = Math.max(maxX, x)
      minY = Math.min(minY, y)
      maxY = Math.max(maxY, y)
    }
    
    const width = maxX - minX + 1
    const height = maxY - minY + 1
    
    return `<rect x='${minX}' y='${minY}' width='${width}' height='${height}' fill='black' />`
  }

  const generateCompressedRectSVG = (imageData: ImageData, width: number, height: number): string => {
    // Use run-length encoding for horizontal lines
    const lines: string[] = []
    
    for (let y = 0; y < height; y++) {
      const runs: Array<{start: number, end: number}> = []
      let x = 0
      
      while (x < width) {
        // Find start of a dark run
        while (x < width && imageData.data[(y * width + x) * 4] >= 128) x++
        if (x >= width) break
        
        let xStart = x
        // Find end of the dark run
        while (x < width && imageData.data[(y * width + x) * 4] < 128) x++
        let xEnd = x
        
        if (xEnd > xStart) {
          runs.push({start: xStart, end: xEnd})
        }
      }
      
      // Combine adjacent runs on the same line
      if (runs.length > 0) {
        const mergedRuns = mergeAdjacentRuns(runs)
        for (const run of mergedRuns) {
          lines.push(`<rect x='${run.start}' y='${y}' width='${run.end - run.start}' height='1' fill='black' />`)
        }
      }
    }
    
    return `<svg xmlns='http://www.w3.org/2000/svg' width='${width}' height='${height}' shape-rendering='crispEdges'>\n${lines.join('\n')}\n</svg>`
  }

  const mergeAdjacentRuns = (runs: Array<{start: number, end: number}>): Array<{start: number, end: number}> => {
    if (runs.length <= 1) return runs
    
    const merged: Array<{start: number, end: number}> = []
    let current = runs[0]
    
    for (let i = 1; i < runs.length; i++) {
      if (runs[i].start <= current.end + 1) {
        // Merge runs
        current.end = Math.max(current.end, runs[i].end)
      } else {
        merged.push(current)
        current = runs[i]
      }
    }
    
    merged.push(current)
    return merged
  }

  const generateAggressiveCompressionSVG = (imageData: ImageData, width: number, height: number): string => {
    // Downsample the image to reduce complexity
    const scale = Math.max(1, Math.floor(Math.sqrt(width * height / 10000)))
    const scaledWidth = Math.floor(width / scale)
    const scaledHeight = Math.floor(height / scale)
    
    const scaledData = new Uint8ClampedArray(scaledWidth * scaledHeight * 4)
    
    // Simple box downsampling
    for (let y = 0; y < scaledHeight; y++) {
      for (let x = 0; x < scaledWidth; x++) {
        let r = 0, g = 0, b = 0, count = 0
        
        for (let dy = 0; dy < scale && y * scale + dy < height; dy++) {
          for (let dx = 0; dx < scale && x * scale + dx < width; dx++) {
            const srcIdx = ((y * scale + dy) * width + (x * scale + dx)) * 4
            r += imageData.data[srcIdx]
            g += imageData.data[srcIdx + 1]
            b += imageData.data[srcIdx + 2]
            count++
          }
        }
        
        const dstIdx = (y * scaledWidth + x) * 4
        scaledData[dstIdx] = r / count
        scaledData[dstIdx + 1] = g / count
        scaledData[dstIdx + 2] = b / count
        scaledData[dstIdx + 3] = 255
      }
    }
    
    // Create scaled image data
    const scaledImageData = new ImageData(scaledData, scaledWidth, scaledHeight)
    
    // Generate SVG with scaled dimensions
    const lines: string[] = []
    
    for (let y = 0; y < scaledHeight; y++) {
      for (let x = 0; x < scaledWidth; x++) {
        const pixel = scaledData[(y * scaledWidth + x) * 4]
        if (pixel < 128) {
          lines.push(`<rect x='${x * scale}' y='${y * scale}' width='${scale}' height='${scale}' fill='black' />`)
        }
      }
    }
    
    return `<svg xmlns='http://www.w3.org/2000/svg' width='${width}' height='${height}' shape-rendering='crispEdges'>\n${lines.join('\n')}\n</svg>`
  }

  const exportAsRaster = (imageData: string, format: 'png' | 'jpeg' | 'webp') => {
    const link = document.createElement('a')
    let mime = 'image/png'
    let ext = 'png'
    
    if (format === 'jpeg') { 
      mime = 'image/jpeg'
      ext = 'jpg' 
    }
    if (format === 'webp') { 
      mime = 'image/webp'
      ext = 'webp' 
    }
    
    if (imageData.startsWith('data:image/')) {
      if (imageData.startsWith(`data:${mime}`)) {
        link.href = imageData
        link.download = `dithered-image.${ext}`
        downloadLink(link)
      } else {
        // Convert format
        const img = new window.Image()
        img.onload = () => {
          try {
            const canvas = document.createElement('canvas')
            canvas.width = img.width
            canvas.height = img.height
            const ctx = canvas.getContext('2d')
            if (!ctx) throw new Error('Could not get 2d context for export')
            
            ctx.drawImage(img, 0, 0)
            link.href = canvas.toDataURL(mime)
            link.download = `dithered-image.${ext}`
            downloadLink(link)
          } catch (err) {
            alert('Export failed: ' + (err instanceof Error ? err.message : err))
          }
        }
        img.onerror = () => {
          alert('Failed to load image for export.')
        }
        img.src = imageData
      }
    }
  }

  const downloadFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    downloadLink(link)
    
    // Revoke after click
    setTimeout(() => {
      URL.revokeObjectURL(url)
    }, 2000)
  }

  const downloadLink = (link: HTMLAnchorElement) => {
    document.body.appendChild(link)
    link.click()
    setTimeout(() => {
      document.body.removeChild(link)
    }, 2000)
  }

  return (
    <div className="flex gap-2 mt-4 items-center">
      <Button
        variant="default"
        onClick={handleDownload}
        className="flex-1"
        disabled={disabled || !ditheredImage || isExporting}
      >
        {isExporting ? 'Generating SVG...' : 'Export'}
      </Button>
      <Select value={format} onValueChange={v => setFormat(v as any)} disabled={disabled || isExporting}>
        <SelectTrigger className="w-28" disabled={disabled || isExporting}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="png">PNG</SelectItem>
          <SelectItem value="jpeg">JPEG</SelectItem>
          <SelectItem value="webp">WEBP</SelectItem>
          <SelectItem value="svg">SVG</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
} 