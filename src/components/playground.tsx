'use client'

import React from 'react'
import { useState, useRef, useEffect, useCallback } from 'react'
import { useDitherStore } from '@/lib/store'
import { applyDither } from '@/lib/dither'

import { Card, CardContent } from '@/components/ui/card'
import { Image as ImageIcon, Eye, EyeOff } from 'lucide-react'

// Debounce delay for performance
const DEBOUNCE_DELAY = 200 // ms

export function Playground({ onImageLoaded, onDitheredImage }: { onImageLoaded?: (loaded: boolean) => void, onDitheredImage?: (url: string | null) => void }) {
  const { options } = useDitherStore()
  const [originalImage, setOriginalImage] = useState<string | null>(null)
  const [ditheredImage, setDitheredImage] = useState<string | null>(null)
  const [effectsEnabled, setEffectsEnabled] = useState(true)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [dragActive, setDragActive] = useState(false)
  const dropAreaRef = useRef<HTMLDivElement>(null)
  const processingTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined)

  const applyDitherEffect = useCallback((imageSrc: string) => {
    const img = new window.Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      if (!effectsEnabled) {
        
        return
      }

      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      if (!ctx) return
      canvas.width = img.width
      canvas.height = img.height
      ctx.drawImage(img, 0, 0)
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      const ditheredData = applyDither(imageData, options)
      ctx.putImageData(ditheredData, 0, 0)
      const ditheredImageUrl = canvas.toDataURL('image/png')
      setDitheredImage(ditheredImageUrl)
      if (onDitheredImage) onDitheredImage(ditheredImageUrl)
    }
    img.src = imageSrc
  }, [effectsEnabled, options, onDitheredImage])

  // Debounced processing to avoid excessive computations
  const debouncedApplyDither = useCallback((imageSrc: string) => {
    if (processingTimeoutRef.current) {
      clearTimeout(processingTimeoutRef.current)
    }
    
    processingTimeoutRef.current = setTimeout(() => {
      applyDitherEffect(imageSrc)
    }, DEBOUNCE_DELAY)
  }, [applyDitherEffect])

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement> | File) => {
    let file: File | undefined
    if (event instanceof File) {
      file = event
    } else {
      file = event.target.files?.[0]
    }
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        setOriginalImage(result)
        applyDitherEffect(result)
      }
      reader.readAsDataURL(file)
    }
  }

  useEffect(() => {
    if (originalImage) {
      debouncedApplyDither(originalImage)
    }
  }, [originalImage, debouncedApplyDither])

  useEffect(() => {
    if (onImageLoaded) onImageLoaded(!!originalImage)
  }, [originalImage, onImageLoaded])

  useEffect(() => {
    if (!originalImage && onDitheredImage) onDitheredImage(null)
  }, [originalImage, onDitheredImage])

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (processingTimeoutRef.current) {
        clearTimeout(processingTimeoutRef.current)
      }
    }
  }, [])

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(true)
  }
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
  }
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImageUpload(e.dataTransfer.files[0])
    }
  }

  return (
    <Card className="w-full relative h-full flex flex-col">
      {/* Effects Toggle Button - Only show when image is loaded */}
      {originalImage && (
        <button type="button"
          className="absolute top-2 right-2 z-20 group"
          onMouseEnter={() => setEffectsEnabled(false)}
          onMouseLeave={() => setEffectsEnabled(true)}
        >
          <div className="bg-background/80 backdrop-blur-sm rounded-4xl p-2 border border-border/50 shadow-lg transition-all duration-200 group-hover:bg-background/95 group-hover:border-border">
            {effectsEnabled ? (
              <Eye className="size-5 text-muted-foreground group-hover:text-foreground transition-colors" />
            ) : (
              <EyeOff className="size-5 text-muted-foreground group-hover:text-foreground transition-colors" />
            )}
          </div>
        </button>
      )}
      <CardContent className="flex-1 flex flex-col">
        {/* Upload Section */}
        {/* Removed upload button and file input, only drag-and-drop is allowed */}
        {/* Dithered Image Display with Drag-and-Drop and Click-to-Upload */}
        <div
          role="button"
          ref={dropAreaRef}
          className={`flex-1 flex items-center justify-center min-h-0 min-w-0 overflow-hidden relative cursor-pointer ${dragActive ? 'rounded-lg ring-4 ring-primary/60' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              fileInputRef.current?.click()
            }
          }}
          tabIndex={0}
          aria-label="Click or drag to upload image"
        >
          {dragActive && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/80 pointer-events-none">
              <span className="text-lg font-semibold text-primary">Drop image here</span>
            </div>
          )}
          
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
            tabIndex={-1}
          />
          <div className="space-y-2 w-full h-full min-h-0 min-w-0 overflow-hidden">
            <div className="rounded-2xl p-4 h-full flex items-center justify-center min-h-0 min-w-0 overflow-hidden">
              {originalImage ? (
                <img
                  src={effectsEnabled ? ditheredImage || originalImage : originalImage}
                  alt={effectsEnabled ? "Dithered" : "Original"}
                  className="rounded-2xl object-contain"
                  style={{ display: 'block' }}
                  height={800}
                  width={900}
                />
              ) : (
                <div className="text-center text-gray-500">
                  <ImageIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Click or drag an image here to see dither effect</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 